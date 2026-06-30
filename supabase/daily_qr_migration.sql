-- ============================================================
-- Run this in Supabase SQL Editor. It REPLACES the old rotating
-- (5-minute) claim code system with a simpler daily QR code:
--   - Staff generates ONE code per calendar day (not every 5 minutes).
--   - That code is valid all day, until midnight (UTC).
--   - A customer can only claim once per calendar day, regardless of
--     which code they used.
--   - Old, previous-day codes never work again, so a link saved from
--     yesterday is useless today.
-- ============================================================

-- ---------------------------------------------------------------
-- 1. daily_claim_codes: at most one row per calendar day.
-- ---------------------------------------------------------------
create table if not exists public.daily_claim_codes (
  claim_date date primary key,
  code text not null unique,
  created_at timestamptz not null default now()
);

alter table public.daily_claim_codes enable row level security;
-- No public policies on purpose — codes are only ever created via
-- generate_daily_code() (staff, PIN-gated) and consumed via
-- claim_token(code) (security invoker, checks validity itself).

-- ---------------------------------------------------------------
-- 2. generate_daily_code(): staff-only, PIN-gated. Creates (or
--    returns, if already made) today's code. Calling it twice in the
--    same day returns the SAME code — it does not generate a new one
--    each time, since today's code should stay valid all day once
--    customers have started scanning it.
-- ---------------------------------------------------------------
create or replace function public.generate_daily_code(input_pin text)
returns table (code text, claim_date date)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  pin_ok boolean;
  existing_code text;
  new_code text;
begin
  select exists (
    select 1 from public.staff s
    where s.pin_hash = crypt(input_pin, s.pin_hash)
  ) into pin_ok;

  if not pin_ok then
    raise exception 'Invalid PIN';
  end if;

  -- If today's code already exists, return it unchanged.
  select dcc.code into existing_code
  from public.daily_claim_codes dcc
  where dcc.claim_date = current_date;

  if existing_code is not null then
    return query select existing_code, current_date;
    return;
  end if;

  new_code := lpad((floor(random() * 1000000))::int::text, 6, '0');

  insert into public.daily_claim_codes (claim_date, code)
  values (current_date, new_code);

  return query select new_code, current_date;
end;
$$;

-- ---------------------------------------------------------------
-- 3. claim_token(): REPLACES both previous versions (the original
--    no-argument one and the 5-minute rotating one). Takes a code,
--    checks it matches TODAY's daily code, and enforces a
--    calendar-day claim limit (not a rolling 12-hour window).
-- ---------------------------------------------------------------
drop function if exists public.claim_token();
drop function if exists public.claim_token(text);

create or replace function public.claim_token(input_code text)
returns table (tokens int, last_claim_at timestamptz)
language plpgsql
security invoker
set search_path = public, extensions
as $$
declare
  todays_code text;
  current_tokens int;
  current_last_claim_at timestamptz;
  new_tokens int;
  new_last_claim_at timestamptz;
begin
  select dcc.code into todays_code
  from public.daily_claim_codes dcc
  where dcc.claim_date = current_date;

  if todays_code is null or todays_code <> trim(input_code) then
    raise exception 'Invalid code. Ask staff for today''s QR code.';
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

  -- Calendar-day check: same UTC date as last claim blocks a repeat,
  -- not a rolling 24-hour window. So a claim at 11pm and another at
  -- 1am (next day) are both allowed — they're different calendar days.
  if current_last_claim_at is not null
     and date(current_last_claim_at) = current_date then
    raise exception 'Already claimed today — come back tomorrow';
  end if;

  update public.loyalty_accounts la
  set tokens = la.tokens + 1, last_claim_at = now()
  where la.user_id = auth.uid()
  returning la.tokens, la.last_claim_at
  into new_tokens, new_last_claim_at;

  return query select new_tokens, new_last_claim_at;
end;
$$;