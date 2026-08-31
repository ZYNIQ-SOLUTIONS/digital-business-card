-- =============================================================================
-- CUSTOM THEMES SCHEMA & RLS POLICIES FOR ADMIN THEME STUDIO
-- =============================================================================

create table if not exists public.custom_themes (
  id text primary key,
  name text not null,
  description text default '' not null,
  is_dark boolean default true not null,
  category text default 'creative' not null,
  tokens jsonb not null,
  layout_config jsonb default '{"style":"classic-segmented","sections":["hero","actions","contact","socials","nfc"]}'::jsonb,
  is_published boolean default true not null,
  is_featured boolean default false not null,
  preview_bg text default '#0f172a',
  preview_accent text default '#8b5cf6',
  preview_secondary text default '#334155',
  custom_css text default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.custom_themes enable row level security;

-- 1. Public / Authenticated read for published themes
drop policy if exists "Anyone can read published custom themes" on public.custom_themes;
create policy "Anyone can read published custom themes"
  on public.custom_themes for select
  using (is_published = true or exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

-- 2. Admins can insert custom themes
drop policy if exists "Admins can insert custom themes" on public.custom_themes;
create policy "Admins can insert custom themes"
  on public.custom_themes for insert
  with check (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

-- 3. Admins can update custom themes
drop policy if exists "Admins can update custom themes" on public.custom_themes;
create policy "Admins can update custom themes"
  on public.custom_themes for update
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

-- 4. Admins can delete custom themes
drop policy if exists "Admins can delete custom themes" on public.custom_themes;
create policy "Admins can delete custom themes"
  on public.custom_themes for delete
  using (exists (
    select 1 from public.profiles
    where profiles.id = auth.uid() and profiles.role = 'admin'
  ));

-- Add trigger for updated_at
create or replace function public.handle_updated_at_custom_themes()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_custom_themes_updated_at on public.custom_themes;
create trigger set_custom_themes_updated_at
  before update on public.custom_themes
  for each row execute function public.handle_updated_at_custom_themes();
