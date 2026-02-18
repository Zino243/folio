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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
