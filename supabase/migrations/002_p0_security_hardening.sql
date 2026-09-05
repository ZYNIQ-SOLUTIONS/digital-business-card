-- =============================================================================
-- MIGRATION: 002_p0_security_hardening.sql
-- Digital Business Card Platform Security Hardening & DDL Foundations
-- Fixes:
--   P0-2: Enterprise & Organization Row Level Security (non-recursive helper functions & complete CRUD policies)
--   P0-3: Public Lead & Booking Capture RPC Function (SECURITY DEFINER)
--   P0-5: Avatars Storage Bucket Path Ownership Isolation (CRUD RLS)
--   P0-6: Verification Column Protection Trigger (service_role only)
--   P1-1: Enterprise Organization Invitations Table & RLS
--   P2-2: Card Views Counter RPC Function (SECURITY DEFINER)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. P0-5: Avatars Bucket Path Ownership Storage RLS (CRUD)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 2. P1-1: Organization Invitations Table Definition
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 3. P0-2: Enterprise & Organization Row Level Security
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 4. P0-6: Verification Column Protection Trigger
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 5. P0-3: Public Lead & Booking Capture RPC Function (SECURITY DEFINER)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 6. P2-2: Card Views Counter RPC Function (SECURITY DEFINER)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- 7. Schema Cache Reload Notification
-- -----------------------------------------------------------------------------
notify pgrst, 'reload schema';
