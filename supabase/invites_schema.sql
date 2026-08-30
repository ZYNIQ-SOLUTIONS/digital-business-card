-- =============================================================================
-- MIGRATION: ADD INVITE LINKS SYSTEM
-- Run this in your Supabase SQL Editor
-- =============================================================================

-- 1. Add tracking columns to public.profiles
alter table public.profiles
  add column if not exists invited_by uuid references public.profiles(id) on delete set null,
  add column if not exists invite_code_used text;

-- 2. Create the invite_links table
create table if not exists public.invite_links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  code text unique not null,
  label text default 'Default Invite',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 3. Enable RLS
alter table public.invite_links enable row level security;

-- 4. Policies
drop policy if exists "Users can view their own invite links" on public.invite_links;
create policy "Users can view their own invite links"
  on public.invite_links for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own invite links" on public.invite_links;
create policy "Users can insert their own invite links"
  on public.invite_links for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own invite links" on public.invite_links;
create policy "Users can update their own invite links"
  on public.invite_links for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own invite links" on public.invite_links;
create policy "Users can delete their own invite links"
  on public.invite_links for delete
  using (auth.uid() = user_id);

-- 5. Force schema cache reload
notify pgrst, 'reload schema';
