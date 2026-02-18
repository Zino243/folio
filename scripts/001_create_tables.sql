-- Profiles table (auto-created on signup via trigger)
create table if not exists public.profiles (
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

-- Portfolios table
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  username text not null unique,
  description text,
  profile_image text,
  banner_image text,
  primary_color text not null default '#000000',
  seo_title text,
  seo_description text,
  social_twitter text,
  social_github text,
  social_linkedin text,
  social_website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.portfolios enable row level security;

-- Owner can CRUD their own portfolios
create policy "portfolios_select_own" on public.portfolios for select using (auth.uid() = user_id);
create policy "portfolios_insert_own" on public.portfolios for insert with check (auth.uid() = user_id);
create policy "portfolios_update_own" on public.portfolios for update using (auth.uid() = user_id);
create policy "portfolios_delete_own" on public.portfolios for delete using (auth.uid() = user_id);

-- Public: anyone can view portfolios by username (for public portfolio pages)
create policy "portfolios_select_public" on public.portfolios for select using (true);

-- Projects table
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  technologies text[] not null default '{}',
  demo_url text,
  github_url text,
  project_date date,
  featured boolean not null default false,
  images text[] not null default '{}',
  cover_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(portfolio_id, slug)
);

alter table public.projects enable row level security;

-- Owner can CRUD their own projects
create policy "projects_select_own" on public.projects for select using (auth.uid() = user_id);
create policy "projects_insert_own" on public.projects for insert with check (auth.uid() = user_id);
create policy "projects_update_own" on public.projects for update using (auth.uid() = user_id);
create policy "projects_delete_own" on public.projects for delete using (auth.uid() = user_id);

-- Public: anyone can view projects (for public project pages)
create policy "projects_select_public" on public.projects for select using (true);

-- Trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Updated_at trigger function
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger portfolios_updated_at before update on public.portfolios
  for each row execute function public.update_updated_at();

create trigger projects_updated_at before update on public.projects
  for each row execute function public.update_updated_at();
