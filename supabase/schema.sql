-- ============================================================
-- Chill Bites Nohar — Supabase schema
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ---------------------------------------------------------------
-- 1. loyalty_accounts: one row per customer, keyed by phone number
-- ---------------------------------------------------------------
create table if not exists public.loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  phone text not null unique,
  tokens int not null default 0 check (tokens >= 0 and tokens <= 4),
  last_claim_at timestamptz,
  redeemed_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.loyalty_accounts enable row level security;

-- Customers can see only their own row
create policy "customers read own loyalty row"
  on public.loyalty_accounts for select
  using (auth.uid() = user_id);

-- Customers can update only their own row (claim a token)
create policy "customers update own loyalty row"
  on public.loyalty_accounts for update
  using (auth.uid() = user_id);

-- Customers can create their own row on first login
create policy "customers insert own loyalty row"
  on public.loyalty_accounts for insert
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------
-- 2. staff: PIN-protected accounts for the admin/staff panel
--    NOTE: pin_hash stores a bcrypt hash, never the raw PIN.
-- ---------------------------------------------------------------
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;
-- No public policies on purpose: staff table is only readable via the
-- SECURITY DEFINER function below, never directly from the client.

-- ---------------------------------------------------------------
-- 3. staff_lookup(): the ONLY way staff data flows to the client.
--    Takes a typed-in PIN + a customer phone number, verifies the PIN
--    server-side, and only then returns that customer's loyalty row.
--    This keeps "any customer can read anyone's tokens" impossible —
--    the regular RLS policies above never grant that, and this function
--    is the sole bypass, gated on a correct PIN.
-- ---------------------------------------------------------------
create extension if not exists pgcrypto;

create or replace function public.staff_lookup(input_pin text, customer_phone text)
returns table (tokens int, last_claim_at timestamptz, redeemed_count int, phone text)
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  pin_ok boolean;
begin
  select exists (
    select 1 from public.staff s
    where s.pin_hash = crypt(input_pin, s.pin_hash)
  ) into pin_ok;

  if not pin_ok then
    raise exception 'Invalid PIN';
  end if;

  return query
    select la.tokens, la.last_claim_at, la.redeemed_count, la.phone
    from public.loyalty_accounts la
    where la.phone = customer_phone;
end;
$$;

-- ---------------------------------------------------------------
-- 4. staff_redeem(): staff marks a reward as redeemed (resets tokens to 0)
-- ---------------------------------------------------------------
create or replace function public.staff_redeem(input_pin text, customer_phone text)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  pin_ok boolean;
begin
  select exists (
    select 1 from public.staff s
    where s.pin_hash = crypt(input_pin, s.pin_hash)
  ) into pin_ok;

  if not pin_ok then
    raise exception 'Invalid PIN';
  end if;

  update public.loyalty_accounts
  set tokens = 0, redeemed_count = redeemed_count + 1
  where phone = customer_phone;
end;
$$;

-- ---------------------------------------------------------------
-- 5. Insert your first staff PIN.
--    Replace '123456' with a real PIN before running. This hashes it —
--    the raw PIN is never stored.
-- ---------------------------------------------------------------
-- insert into public.staff (name, pin_hash)
-- values ('Counter Staff', crypt('123456', gen_salt('bf')));
