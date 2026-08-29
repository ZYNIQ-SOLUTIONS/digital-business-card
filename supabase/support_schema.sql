-- =============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR SUPPORT TICKETS & ADMIN MANAGEMENT
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================================

-- Create Support Tickets Table
create table if not exists public.support_tickets (
  id uuid default gen_random_uuid() primary key,
  ticket_number text not null,
  name text not null,
  email text not null,
  phone text default '',
  category text not null default 'general', -- general, nfc_card, wallet_pass, enterprise, billing, technical, privacy
  priority text not null default 'medium', -- low, medium, high, urgent
  subject text not null,
  message text not null,
  status text not null default 'opened', -- opened, contacted, resolved, closed
  admin_notes text default '',
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table public.support_tickets enable row level security;

-- Policies

-- 1. Anyone (public or logged-in user) can submit a support ticket
drop policy if exists "Anyone can submit support tickets." on public.support_tickets;
create policy "Anyone can submit support tickets."
  on public.support_tickets for insert
  with check (true);

-- 2. Authenticated users can view their own submitted tickets
drop policy if exists "Users can view their own support tickets." on public.support_tickets;
create policy "Users can view their own support tickets."
  on public.support_tickets for select
  using (auth.uid() = user_id);

-- 3. Admins can view all support tickets
drop policy if exists "Admins can view all support tickets." on public.support_tickets;
create policy "Admins can view all support tickets."
  on public.support_tickets for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 4. Admins can update support tickets (e.g., change status, edit admin notes)
drop policy if exists "Admins can update all support tickets." on public.support_tickets;
create policy "Admins can update all support tickets."
  on public.support_tickets for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 5. Admins can delete support tickets
drop policy if exists "Admins can delete support tickets." on public.support_tickets;
create policy "Admins can delete support tickets."
  on public.support_tickets for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
