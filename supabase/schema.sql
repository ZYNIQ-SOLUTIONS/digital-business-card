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

drop policy if exists "Users can view their own profile." on public.profiles;
create policy "Users can view their own profile." 
  on public.profiles for select 
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile." on public.profiles;
create policy "Users can update their own profile." 
  on public.profiles for update 
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile." on public.profiles;
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
  template_layout text default 'classic-segmented' not null,
  
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
  
  active_mode text default 'default' not null,
  geofence_locations jsonb default '[]'::jsonb,
  
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS on cards
alter table public.cards enable row level security;

drop policy if exists "Public cards are viewable by anyone." on public.cards;
create policy "Public cards are viewable by anyone." 
  on public.cards for select 
  using (is_published = true);

drop policy if exists "Users can view all their own cards." on public.cards;
create policy "Users can view all their own cards." 
  on public.cards for select 
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own cards." on public.cards;
create policy "Users can insert their own cards." 
  on public.cards for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own cards." on public.cards;
create policy "Users can update their own cards." 
  on public.cards for update 
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own cards." on public.cards;
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

drop policy if exists "Anyone can insert anonymous events." on public.card_events;
create policy "Anyone can insert anonymous events." 
  on public.card_events for insert 
  with check (true);

drop policy if exists "Card owners can view analytics for their cards." on public.card_events;
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

drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated users can update their avatar images." on storage.objects;
create policy "Authenticated users can update their avatar images."
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can upload avatar images." on storage.objects;
create policy "Authenticated users can upload avatar images."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- =============================================================================
-- 5. INTELLIGENT NETWORKING PASS UPDATES
-- =============================================================================

-- Add Contextual Wallet Pass features & template layout to cards
alter table public.cards 
  add column if not exists template_layout text default 'classic-segmented' not null,
  add column if not exists active_mode text default 'default' not null,
  add column if not exists geofence_locations jsonb default '[]'::jsonb;

-- Create Connections Table (Two-Way Capture)
create table if not exists public.connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  card_id uuid references public.cards(id) on delete set null,
  contact_name text not null,
  contact_email text default '',
  contact_phone text default '',
  contact_company text default '',
  contact_title text default '',
  met_at_location text default '',
  met_at_time timestamptz default now() not null,
  ai_drafted_message text default '',
  status text default 'pending' not null,
  created_at timestamptz default now() not null
);

-- Enable RLS on connections
alter table public.connections enable row level security;

drop policy if exists "Users can view their own connections." on public.connections;
create policy "Users can view their own connections." 
  on public.connections for select 
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own connections." on public.connections;
create policy "Users can insert their own connections." 
  on public.connections for insert 
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own connections." on public.connections;
create policy "Users can update their own connections." 
  on public.connections for update 
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own connections." on public.connections;
create policy "Users can delete their own connections." 
  on public.connections for delete 
  using (auth.uid() = user_id);

-- Create Organizations (B2B Enterprise Management)
create table if not exists public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  domain text,
  logo_url text,
  created_at timestamptz default now() not null
);

-- Create Organization Members
create table if not exists public.organization_members (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text default 'member' not null, -- 'admin', 'member'
  created_at timestamptz default now() not null,
  unique(org_id, user_id)
);

-- Enable Row Level Security on Enterprise Tables
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

drop policy if exists "Organization members can view their organization" on public.organizations;
create policy "Organization members can view their organization"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.org_id = organizations.id
        and organization_members.user_id = auth.uid()
    )
  );

drop policy if exists "Organization admins can update organization profile" on public.organizations;
create policy "Organization admins can update organization profile"
  on public.organizations for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.org_id = organizations.id
        and organization_members.user_id = auth.uid()
        and organization_members.role = 'admin'
    )
  );

drop policy if exists "Members can view fellow organization members" on public.organization_members;
create policy "Members can view fellow organization members"
  on public.organization_members for select
  using (
    exists (
      select 1 from public.organization_members as m
      where m.org_id = organization_members.org_id
        and m.user_id = auth.uid()
    )
  );

drop policy if exists "Admins can manage organization members" on public.organization_members;
create policy "Admins can manage organization members"
  on public.organization_members for all
  using (
    exists (
      select 1 from public.organization_members as m
      where m.org_id = organization_members.org_id
        and m.user_id = auth.uid()
        and m.role = 'admin'
    )
  );

-- Create Collections Table
create table if not exists public.collections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  color text default '#0071E3',
  created_at timestamptz default now() not null
);

alter table public.collections enable row level security;
create policy "Users can view their own collections." on public.collections for select using (auth.uid() = user_id);
create policy "Users can insert their own collections." on public.collections for insert with check (auth.uid() = user_id);
create policy "Users can update their own collections." on public.collections for update using (auth.uid() = user_id);
create policy "Users can delete their own collections." on public.collections for delete using (auth.uid() = user_id);

-- Add collection relation to connections
alter table public.connections add column if not exists collection_id uuid references public.collections(id) on delete set null;

-- Add org_id to cards to link enterprise passes
alter table public.cards 
  add column if not exists org_id uuid references public.organizations(id) on delete set null,
  add column if not exists is_verified boolean default false not null,
  add column if not exists verified_at timestamptz,
  add column if not exists verification_badge text default 'ai_verified_executive',
  add column if not exists booking_enabled boolean default true not null,
  add column if not exists booking_title text default '30-Min Strategy Consultation',
  add column if not exists booking_days text[] default '{"Monday","Tuesday","Wednesday","Thursday","Friday"}'::text[],
  add column if not exists booking_start_time text default '09:00',
  add column if not exists booking_end_time text default '17:00',
  add column if not exists booking_slot_duration int default 30;

-- Backfill all existing auth.users into public.profiles
insert into public.profiles (id, email, full_name, avatar_url)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'full_name', ''), 
  coalesce(raw_user_meta_data->>'avatar_url', '')
from auth.users
on conflict (id) do nothing;

-- =============================================================================
-- SECURITY: Protect verification columns from client-side tampering
-- =============================================================================
create or replace function public.protect_verification_columns()
returns trigger as $$
begin
  if (new.is_verified is distinct from old.is_verified or
      new.verification_badge is distinct from old.verification_badge or
      new.verified_at is distinct from old.verified_at) then
    if current_setting('role') != 'service_role' then
      new.is_verified := old.is_verified;
      new.verification_badge := old.verification_badge;
      new.verified_at := old.verified_at;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_protect_card_verification on public.cards;
create trigger tr_protect_card_verification
  before update on public.cards
  for each row execute function public.protect_verification_columns();

-- =============================================================================
-- SECURITY: Public lead capture RPC function (SECURITY DEFINER)
-- =============================================================================
create or replace function public.submit_public_lead(
  p_card_id uuid,
  p_name text,
  p_email text,
  p_phone text default null,
  p_company text default null,
  p_title text default null,
  p_meeting_date text default null,
  p_meeting_time text default null,
  p_notes text default null
) returns jsonb as $$
declare
  v_owner_id uuid;
  v_conn_id uuid;
  v_location text;
  v_draft text;
begin
  -- Validate target card is published
  select user_id into v_owner_id from public.cards
  where id = p_card_id and is_published = true;

  if v_owner_id is null then
    raise exception 'Card not found or not published';
  end if;

  if p_meeting_date is not null and p_meeting_time is not null then
    v_location := 'Digital Calendar Booking';
    v_draft := 'Meeting scheduled for ' || p_meeting_date || ' at ' || p_meeting_time || '. Notes: ' || coalesce(p_notes, 'None');
  else
    v_location := 'Public Card Exchange';
    v_draft := 'Met via digital business card exchange.';
  end if;

  insert into public.connections (
    user_id, card_id, contact_name, contact_email, contact_phone,
    contact_company, contact_title, met_at_location, ai_drafted_message, status
  ) values (
    v_owner_id, p_card_id, p_name, p_email, p_phone,
    p_company, p_title, v_location, v_draft, 'pending'
  ) returning id into v_conn_id;

  return jsonb_build_object('success', true, 'connection_id', v_conn_id);
end;
$$ language plpgsql security definer;

grant execute on function public.submit_public_lead to anon, authenticated;
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
-- =============================================================================
-- MIGRATION: ADD AI USAGE LOGS FOR RATE LIMITING
-- Run this in your Supabase SQL Editor
-- =============================================================================

create table if not exists public.ai_usage_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  endpoint text not null,
  created_at timestamptz default now() not null
);

-- Enable RLS
alter table public.ai_usage_logs enable row level security;

-- Users can only view their own logs
drop policy if exists "Users can view their own AI usage" on public.ai_usage_logs;
create policy "Users can view their own AI usage"
  on public.ai_usage_logs for select
  using (auth.uid() = user_id);

-- Only service_role can insert logs (we'll use admin client or bypass RLS in the API)
-- Wait, let's allow users to insert their own logs so we don't need admin client if not necessary.
-- Actually, we'll just allow users to insert their own logs.
drop policy if exists "Users can insert their own AI usage" on public.ai_usage_logs;
create policy "Users can insert their own AI usage"
  on public.ai_usage_logs for insert
  with check (auth.uid() = user_id);

-- Notify schema reload
notify pgrst, 'reload schema';
