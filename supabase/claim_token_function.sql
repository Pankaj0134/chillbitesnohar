-- ============================================================
-- Run this AFTER schema.sql — adds the claim_token() function.
-- ============================================================

-- claim_token(): the only way a customer's token count increases.
-- Runs as the calling user (not security definer) so RLS still applies —
-- a customer can only ever claim for their own row. Enforces the
-- 12-hour cooldown and the 4-token cap server-side, so it can't be
-- bypassed by calling the table update directly with a forged timestamp.
create or replace function public.claim_token()
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
begin
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

  update public.loyalty_accounts la
  set tokens = la.tokens + 1, last_claim_at = now()
  where la.user_id = auth.uid()
  returning la.tokens, la.last_claim_at
  into new_tokens, new_last_claim_at;

  return query select new_tokens, new_last_claim_at;
end;
$$;
