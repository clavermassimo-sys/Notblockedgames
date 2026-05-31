-- ============================================================
-- Clae — Initial Schema
-- Run this in your Supabase project's SQL editor.
-- ============================================================

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users 1-to-1)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id                uuid references auth.users(id) on delete cascade primary key,
  full_name         text,
  kyc_status        text not null default 'pending'
                      check (kyc_status in ('pending', 'submitted', 'approved', 'rejected')),
  kyc_verified_at   timestamptz,
  referral_code     text unique not null
                      default lower(substring(md5(random()::text), 1, 8)),
  referred_by       uuid references public.profiles(id),
  cash_balance      numeric(20, 8) not null default 0 check (cash_balance >= 0),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, referral_code)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    lower(substring(md5(new.id::text || random()::text), 1, 8))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────
-- HOLDINGS
-- ─────────────────────────────────────────────
create table if not exists public.holdings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles(id) on delete cascade not null,
  symbol      text not null,
  asset_type  text not null check (asset_type in ('stock', 'crypto')),
  quantity    numeric(20, 8) not null default 0 check (quantity >= 0),
  avg_cost    numeric(20, 8) not null default 0 check (avg_cost >= 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, symbol)
);

create trigger holdings_updated_at
  before update on public.holdings
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────
-- TRANSACTIONS
-- ─────────────────────────────────────────────
create table if not exists public.transactions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.profiles(id) on delete cascade not null,
  symbol              text not null,
  asset_type          text not null check (asset_type in ('stock', 'crypto')),
  side                text not null check (side in ('buy', 'sell')),
  quantity            numeric(20, 8) not null,
  price               numeric(20, 8) not null,
  total_amount        numeric(20, 8) not null,
  commission          numeric(20, 8) not null,
  commission_rate     numeric(6, 4) not null,
  status              text not null default 'pending'
                        check (status in ('pending', 'filled', 'cancelled', 'failed')),
  external_order_id   text,
  created_at          timestamptz not null default now()
);

-- ─────────────────────────────────────────────
-- REFERRALS
-- ─────────────────────────────────────────────
create table if not exists public.referrals (
  id              uuid primary key default gen_random_uuid(),
  referrer_id     uuid references public.profiles(id) on delete cascade not null,
  referred_id     uuid references public.profiles(id) on delete cascade not null,
  reward_paid     boolean not null default false,
  reward_paid_at  timestamptz,
  created_at      timestamptz not null default now(),
  unique (referred_id)
);

-- ─────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.profiles    enable row level security;
alter table public.holdings    enable row level security;
alter table public.transactions enable row level security;
alter table public.referrals   enable row level security;

-- Profiles
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Holdings
create policy "Users can read own holdings"
  on public.holdings for select
  using (auth.uid() = user_id);

create policy "Users can manage own holdings"
  on public.holdings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Transactions
create policy "Users can read own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

-- Referrals
create policy "Referrers can read their referrals"
  on public.referrals for select
  using (auth.uid() = referrer_id);
