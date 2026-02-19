-- Drop existing objects if they exist to start clean
drop trigger if exists projects_updated_at on public.projects;
drop trigger if exists portfolios_updated_at on public.portfolios;
drop trigger if exists profiles_updated_at on public.profiles;
drop trigger if exists on_auth_user_created on auth.users;

drop table if exists public.projects cascade;
drop table if exists public.portfolios cascade;
drop table if exists public.profiles cascade;

drop function if exists public.handle_new_user();
drop function if exists public.update_updated_at();

-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'pro')),
  portfolios_limit integer not null default 1,
  projects_limit integer not null default 3,
  blog_posts_limit integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Purchases table for tracking pack purchases
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_session_id text not null unique,
  stripe_payment_id text,
  product_type text not null check (product_type in ('portfolio_pack', 'projects_pack', 'blog_pack')),
  amount_eur integer not null,
  credits_added integer not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz not null default now()
);

alter table public.purchases enable row level security;

create policy "purchases_select_own" on public.purchases for select using (auth.uid() = user_id);
create policy "purchases_insert_own" on public.purchases for insert with check (auth.uid() = user_id);
