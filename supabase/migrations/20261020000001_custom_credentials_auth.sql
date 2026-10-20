-- Migration: Add custom credentials authentication (password hash, email, password resets)

-- 1. Alter public.profiles to detach from auth.users and add email & password_hash
alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  alter column id set default gen_random_uuid();

alter table public.profiles
  add column if not exists email text unique,
  add column if not exists password_hash text;

-- 2. Create password resets table
create table if not exists public.password_resets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Index for looking up active reset tokens quickly
create index if not exists password_resets_token_hash_idx on public.password_resets(token_hash);

-- Drop auth.users trigger
drop trigger if exists auth_user_profile_insert on auth.users;
drop function if exists public.create_client_profile();

-- Revoke from public, anon, authenticated and grant to service_role
revoke all on table public.password_resets from public, anon, authenticated;
grant all on table public.password_resets to service_role;
