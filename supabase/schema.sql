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
drop policy if exists "Users can view their own avatar images." on storage.objects;
create policy "Users can view their own avatar images."
  on storage.objects for select
  using (
    bucket_id = 'avatars'
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

drop policy if exists "Authenticated users can update their avatar images." on storage.objects;
create policy "Authenticated users can update their avatar images."
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can delete their avatar images." on storage.objects;
create policy "Authenticated users can delete their avatar images."
  on storage.objects for delete
  using (
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
  crm_webhook_url text,
  crm_provider text,
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

-- Create Organization Invitations Table (Enterprise Employee Onboarding)
create table if not exists public.org_invitations (
  id uuid default gen_random_uuid() primary key,
  org_id uuid references public.organizations(id) on delete cascade not null,
  email text not null,
  role text default 'member' not null,
  card_id uuid references public.cards(id) on delete set null,
  token text default encode(gen_random_bytes(32), 'hex'),
  status text default 'pending' not null check (status in ('pending', 'accepted', 'revoked')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  expires_at timestamptz default (now() + interval '7 days') not null,
  accepted_at timestamptz
);

-- Enable Row Level Security on Enterprise Tables
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.org_invitations enable row level security;

-- Non-recursive helper functions to prevent PostgreSQL error 42P17
create or replace function public.is_org_member(p_org_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where org_id = p_org_id and user_id = p_user_id
  );
$$ language sql security definer set search_path = public stable;

create or replace function public.is_org_admin(p_org_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where org_id = p_org_id and user_id = p_user_id and role = 'admin'
  );
$$ language sql security definer set search_path = public stable;

create or replace function public.org_has_no_members(p_org_id uuid)
returns boolean as $$
  select not exists (
    select 1 from public.organization_members
    where org_id = p_org_id
  );
$$ language sql security definer set search_path = public stable;

grant execute on function public.is_org_member to authenticated, anon;
grant execute on function public.is_org_admin to authenticated, anon;
grant execute on function public.org_has_no_members to authenticated, anon;

-- Organizations Policies (Complete SELECT / INSERT / UPDATE / DELETE)
drop policy if exists "Organization members can view their organization" on public.organizations;
create policy "Organization members can view their organization"
  on public.organizations for select
  using (public.is_org_member(id, auth.uid()));

drop policy if exists "Authenticated users can create organizations" on public.organizations;
create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.role() = 'authenticated');

drop policy if exists "Organization admins can update organization profile" on public.organizations;
create policy "Organization admins can update organization profile"
  on public.organizations for update
  using (public.is_org_admin(id, auth.uid()))
  with check (public.is_org_admin(id, auth.uid()));

drop policy if exists "Organization admins can delete their organization" on public.organizations;
create policy "Organization admins can delete their organization"
  on public.organizations for delete
  using (public.is_org_admin(id, auth.uid()));

-- Organization Members Policies (Complete SELECT / INSERT / UPDATE / DELETE)
drop policy if exists "Members can view fellow organization members" on public.organization_members;
create policy "Members can view fellow organization members"
  on public.organization_members for select
  using (user_id = auth.uid() or public.is_org_member(org_id, auth.uid()));

drop policy if exists "Admins can manage organization members" on public.organization_members;
drop policy if exists "Admins can insert organization members" on public.organization_members;
create policy "Admins can insert organization members"
  on public.organization_members for insert
  with check (
    public.is_org_admin(org_id, auth.uid())
    or (auth.role() = 'authenticated' and user_id = auth.uid() and public.org_has_no_members(org_id))
  );

drop policy if exists "Admins can update organization members" on public.organization_members;
create policy "Admins can update organization members"
  on public.organization_members for update
  using (public.is_org_admin(org_id, auth.uid()))
  with check (public.is_org_admin(org_id, auth.uid()));

drop policy if exists "Admins can delete organization members" on public.organization_members;
create policy "Admins can delete organization members"
  on public.organization_members for delete
  using (public.is_org_admin(org_id, auth.uid()) or user_id = auth.uid());

-- Organization Invitations Policies (Complete SELECT / INSERT / UPDATE / DELETE)
drop policy if exists "Admins can view and manage org invitations" on public.org_invitations;
drop policy if exists "Admins can select org invitations" on public.org_invitations;
drop policy if exists "Users can view invitations for their email" on public.org_invitations;
drop policy if exists "Admins can insert org invitations" on public.org_invitations;
drop policy if exists "Admins can update org invitations" on public.org_invitations;
drop policy if exists "Admins can delete org invitations" on public.org_invitations;

create policy "Admins can select org invitations"
  on public.org_invitations for select
  using (public.is_org_admin(org_id, auth.uid()));

create policy "Users can view invitations for their email"
  on public.org_invitations for select
  using (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and lower(profiles.email) = lower(org_invitations.email)
    )
  );

create policy "Admins can insert org invitations"
  on public.org_invitations for insert
  with check (public.is_org_admin(org_id, auth.uid()));

create policy "Admins can update org invitations"
  on public.org_invitations for update
  using (public.is_org_admin(org_id, auth.uid()))
  with check (public.is_org_admin(org_id, auth.uid()));

create policy "Admins can delete org invitations"
  on public.org_invitations for delete
  using (public.is_org_admin(org_id, auth.uid()));

-- Indexes for performance
create index if not exists idx_org_members_org_id on public.organization_members(org_id);
create index if not exists idx_org_members_user_id on public.organization_members(user_id);
create index if not exists idx_org_invitations_org_id on public.org_invitations(org_id);
create index if not exists idx_org_invitations_email on public.org_invitations(lower(email));
create index if not exists idx_org_invitations_token on public.org_invitations(token);

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
    if coalesce(auth.role(), '') != 'service_role' and coalesce(current_setting('role', true), '') != 'service_role' then
      new.is_verified := old.is_verified;
      new.verification_badge := old.verification_badge;
      new.verified_at := old.verified_at;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists tr_protect_card_verification on public.cards;
create trigger tr_protect_card_verification
  before update on public.cards
  for each row execute function public.protect_verification_columns();

-- =============================================================================
-- SECURITY: Public lead capture RPC function (SECURITY DEFINER)
-- =============================================================================
drop function if exists public.submit_public_lead(uuid, text, text, text, text, text, text, text, text);
drop function if exists public.submit_public_lead(uuid, text, text, text, text, text, text, text, text, text, text, text);

create or replace function public.submit_public_lead(
  p_card_id uuid,
  p_name text,
  p_email text,
  p_phone text default null,
  p_company text default null,
  p_job_title text default null,
  p_notes text default null,
  p_lead_type text default 'exchange',
  p_location text default null,
  p_title text default null,
  p_meeting_date text default null,
  p_meeting_time text default null
) returns jsonb as $$
declare
  v_owner_id uuid;
  v_conn_id uuid;
  v_effective_title text;
  v_location text;
  v_draft text;
begin
  -- Validate target card exists and is published
  select user_id into v_owner_id from public.cards
  where id = p_card_id and is_published = true;

  if v_owner_id is null then
    raise exception 'Card not found or not published';
  end if;

  -- Resolve title between p_job_title and p_title
  v_effective_title := coalesce(p_job_title, p_title);

  -- Determine location and drafted message based on lead type or meeting details
  if p_meeting_date is not null and p_meeting_time is not null then
    v_location := coalesce(p_location, 'Digital Calendar Booking');
    v_draft := 'Meeting scheduled for ' || p_meeting_date || ' at ' || p_meeting_time || case when p_notes is not null and p_notes != '' then '. Notes: ' || p_notes else '' end;
  elsif coalesce(p_lead_type, '') = 'booking' then
    v_location := coalesce(p_location, 'Digital Calendar Booking');
    v_draft := 'Meeting booked via digital business card.' || case when p_notes is not null and p_notes != '' then ' Notes: ' || p_notes else '' end;
  else
    v_location := coalesce(p_location, 'Public Card Exchange');
    v_draft := case 
      when p_notes is not null and p_notes != '' then 'Met via digital business card exchange. Notes: ' || p_notes
      else 'Met via digital business card exchange.'
    end;
  end if;

  insert into public.connections (
    user_id, card_id, contact_name, contact_email, contact_phone,
    contact_company, contact_title, met_at_location, ai_drafted_message, status
  ) values (
    v_owner_id, p_card_id, p_name, coalesce(p_email, ''), p_phone,
    p_company, v_effective_title, v_location, v_draft, 'pending'
  ) returning id into v_conn_id;

  return jsonb_build_object('success', true, 'connection_id', v_conn_id);
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.submit_public_lead to anon, authenticated;

-- =============================================================================
-- SECURITY: Card views counter RPC function (SECURITY DEFINER)
-- =============================================================================
drop function if exists public.increment_card_views(text);

create or replace function public.increment_card_views(p_slug text)
returns void as $$
declare
  v_card_id uuid;
begin
  -- Locate published card matching slug
  select id into v_card_id
  from public.cards
  where slug = p_slug and is_published = true;

  if v_card_id is not null then
    -- Atomically increment views_count
    update public.cards
    set views_count = views_count + 1
    where id = v_card_id;

    -- Insert analytics event into card_events
    insert into public.card_events (card_id, event_type)
    values (v_card_id, 'view');
  end if;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.increment_card_views to anon, authenticated;
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

-- Add is_deleted to cards
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;


-- Create card_connections table for saving cards
create table if not exists public.card_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  connected_card_id uuid references public.cards(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(user_id, connected_card_id)
);


-- Add premium custom color support
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS custom_primary_color text;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS custom_secondary_color text;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS custom_accent_color text;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS custom_background_image text;

ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS show_network_score boolean DEFAULT true;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS crm_webhook_url text;
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS crm_provider text;
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

-- =============================================================================
-- MIGRATION: ADD MARKET RESEARCH FEATURES
-- =============================================================================

ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS custom_fields jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS video_url text;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS bio_ar text;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS title_ar text;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS white_label boolean DEFAULT false;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS custom_domain text;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS pin_code text;

ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS brand_lock boolean DEFAULT false;

-- Notify schema reload
notify pgrst, 'reload schema';


-- =============================================================================
-- MIGRATION: ADVANCED NETWORKING FEATURES (7 NEW IDEAS)
-- =============================================================================

ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS modes jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS temporary_layers jsonb DEFAULT '[]'::jsonb;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS crypto_identity jsonb DEFAULT null;
ALTER TABLE public.cards ADD COLUMN IF NOT EXISTS icebreakers jsonb DEFAULT '[]'::jsonb;

-- For mutual connections & meeting memory:
ALTER TABLE public.card_connections ADD COLUMN IF NOT EXISTS meeting_note text;
ALTER TABLE public.card_connections ADD COLUMN IF NOT EXISTS meeting_location text;
ALTER TABLE public.card_connections ADD COLUMN IF NOT EXISTS last_interacted_at timestamptz DEFAULT now();

-- Notify schema reload
notify pgrst, 'reload schema';
