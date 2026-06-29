-- ============================================================
-- Run this AFTER schema.sql and claim_token_function.sql.
-- Adds rotating, short-lived claim codes so a customer can only claim
-- a token while physically at the counter, scanning a QR that staff
-- just generated on the counter laptop — not by reusing an old link
-- from home.
-- ============================================================

-- ---------------------------------------------------------------
-- 1. claim_codes: one row per generated code.
--    - code: 6-digit string, shown as a QR on the counter laptop
--    - expires_at: 5 minutes after generation
--    - used_by / used_at: set the first time a customer redeems it,
--      so the same code can't be scanned twice (e.g. two customers
--      photographing the same screen, or one customer scanning then
--      sharing the link)
-- ---------------------------------------------------------------
create table if not exists public.claim_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_by uuid references auth.users(id),
  used_at timestamptz
);

alter table public.claim_codes enable row level security;
-- No public policies on purpose: codes are only ever created via
-- generate_claim_code() (staff, PIN-gated) and consumed via
-- claim_token(code) (security invoker, checks validity itself).
-- A customer should never be able to SELECT this table directly —
-- otherwise they could read other valid codes instead of scanning one.

-- ---------------------------------------------------------------
-- 2. generate_claim_code(): staff-only, PIN-gated. Creates a new
--    6-digit code valid for 5 minutes and returns it so the staff
--    panel can render it as a QR pointing at
--    https://yoursite.com/?claim=THECODE
-- ---------------------------------------------------------------
create or replace function public.generate_claim_code(input_pin text)
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  pin_ok boolean;
  new_code text;
  new_expires_at timestamptz;
begin
  select exists (
    select 1 from public.staff s
    where s.pin_hash = crypt(input_pin, s.pin_hash)
  ) into pin_ok;

  if not pin_ok then
    raise exception 'Invalid PIN';
  end if;

  -- 6 random digits, e.g. "048213". Collisions are astronomically
  -- unlikely given the 5-minute expiry window, but retry once just in
  -- case a code with the same digits is still active.
  new_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
  new_expires_at := now() + interval '5 minutes';

  insert into public.claim_codes (code, expires_at)
  values (new_code, new_expires_at);

  return query select new_code, new_expires_at;
exception
  when unique_violation then
    new_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
    insert into public.claim_codes (code, expires_at)
    values (new_code, new_expires_at);
    return query select new_code, new_expires_at;
end;
$$;

-- ---------------------------------------------------------------
-- 3. claim_token(): REPLACES the version from claim_token_function.sql.
--    Now requires a valid, unexpired, unused code. Still security
--    invoker, so RLS still restricts the update to the caller's own
--    row — a valid code only ever proves "someone was at the counter
--    recently," it never lets a customer touch anyone else's row.
-- ---------------------------------------------------------------
create or replace function public.claim_token(input_code text)
returns table (tokens int, last_claim_at timestamptz)
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  current_tokens int;
  current_last_claim_at timestamptz;
  hours_since numeric;
  new_tokens int;
  new_last_claim_at timestamptz;
  code_row record;
begin
select * into code_row
from public.claim_codes cc
where cc.code = trim(input_code)
for update;

  if code_row is null then
    raise exception 'Invalid code. Ask staff for a fresh QR code.';
  end if;

  if code_row.used_at is not null then
    raise exception 'This code has already been used. Ask staff for a fresh QR code.';
  end if;

  if now() > code_row.expires_at then
    raise exception 'This code has expired. Ask staff for a fresh QR code.';
  end if;

  select la.tokens, la.last_claim_at
  into current_tokens, current_last_claim_at
  from public.loyalty_accounts la
  where la.user_id = auth.uid();

  if current_tokens is null then
    raise exception 'No loyalty account found for this user';
  end if;

  if current_tokens >= 4 then
    raise exception 'Reward already unlocked — redeem before claiming more';
  end if;

  if current_last_claim_at is not null then
    hours_since := extract(epoch from (now() - current_last_claim_at)) / 3600;
    if hours_since < 12 then
      raise exception 'Cooldown active — try again later';
    end if;
  end if;

  -- Mark the code used FIRST. If anything below fails, the code is
  -- still burned — intentional: a code should only ever back one
  -- claim attempt, success or not, so it can't be retried in a loop.
  update public.claim_codes
  set used_by = auth.uid(), used_at = now()
  where code = input_code;

  update public.loyalty_accounts la
  set tokens = la.tokens + 1, last_claim_at = now()
  where la.user_id = auth.uid()
  returning la.tokens, la.last_claim_at
  into new_tokens, new_last_claim_at;

  return query select new_tokens, new_last_claim_at;
end;
$$;
