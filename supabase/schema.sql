-- =============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR MULTI-USER DIGITAL BUSINESS CARD APP
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================================

-- 1. Create Profiles Table (Syncs with auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile." 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile." 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile." 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Auto-sync new auth.users to public.profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', ''), 
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. Create Cards Table (Multi-card per user)
create table if not exists public.cards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  slug text unique not null,
  is_published boolean default true not null,
  theme text default 'apple-light' not null,
  
  -- Personal Identity
  full_name text not null,
  prefix text default '',
  preferred_name text default '',
  avatar_url text default '',
  avatar_initials text default '',
  tagline text default '',
  bio text default '',
  
  -- Professional
  title text not null,
  company text not null,
  department text default '',
  industry text default '',
  work_location text default '',
  skills text[] default '{}',
  years_experience text default '',
  
  -- Contact Information
  phone_primary text default '',
  phone_secondary text default '',
  email_work text default '',
  email_personal text default '',
  website_primary text default '',
  portfolio_url text default '',
  booking_url text default '',
  
  -- Address (JSONB)
  office_address jsonb default '{"street": "", "city": "", "region": "", "postalCode": "", "country": ""}'::jsonb,
  
  -- Social Links array of objects (JSONB)
  socials jsonb default '[]'::jsonb,
  
  -- Metrics
  views_count int default 0 not null,
  vcard_downloads_count int default 0 not null,
  wallet_downloads_count int default 0 not null,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS on cards
alter table public.cards enable row level security;

-- Public can view any card that is published
create policy "Public cards are viewable by anyone." 
  on public.cards for select 
  using (is_published = true);

-- Owners can view all their cards (even drafts)
create policy "Users can view all their own cards." 
  on public.cards for select 
  using (auth.uid() = user_id);

-- Owners can insert new cards
create policy "Users can insert their own cards." 
  on public.cards for insert 
  with check (auth.uid() = user_id);

-- Owners can update their own cards
create policy "Users can update their own cards." 
  on public.cards for update 
  using (auth.uid() = user_id);

-- Owners can delete their own cards
create policy "Users can delete their own cards." 
  on public.cards for delete 
  using (auth.uid() = user_id);


-- 3. Create Card Events Table (Analytics & Scan tracking)
create table if not exists public.card_events (
  id uuid default gen_random_uuid() primary key,
  card_id uuid references public.cards(id) on delete cascade not null,
  event_type text not null, -- 'view', 'vcard_download', 'wallet_download', 'qr_scan'
  user_agent text,
  referer text,
  created_at timestamptz default now() not null
);

-- Enable RLS on card_events
alter table public.card_events enable row level security;

create policy "Anyone can insert anonymous events." 
  on public.card_events for insert 
  with check (true);

create policy "Card owners can view analytics for their cards." 
  on public.card_events for select 
  using (
    exists (
      select 1 from public.cards 
      where cards.id = card_events.card_id and cards.user_id = auth.uid()
    )
  );

-- 4. Storage Bucket for Avatars & Logos
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatar images."
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Authenticated users can update their avatar images."
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.role() = 'authenticated');
