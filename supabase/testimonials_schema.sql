-- =============================================================================
-- SUPABASE POSTGRESQL SCHEMA FOR USER TESTIMONIALS & ADMIN CURATION
-- =============================================================================

create table if not exists public.testimonials (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  author text not null, -- e.g. @handle or Name · Title
  quote text not null,
  avatar_url text,
  rating integer default 5,
  is_approved boolean default false not null,
  is_featured boolean default false not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.testimonials enable row level security;

-- Public can view approved testimonials
drop policy if exists "Public can view approved testimonials." on public.testimonials;
create policy "Public can view approved testimonials."
  on public.testimonials for select
  using (is_approved = true);

-- Anyone can submit a testimonial
drop policy if exists "Anyone can submit a testimonial." on public.testimonials;
create policy "Anyone can submit a testimonial."
  on public.testimonials for insert
  with check (true);

-- Admins can view all testimonials
drop policy if exists "Admins can view all testimonials." on public.testimonials;
create policy "Admins can view all testimonials."
  on public.testimonials for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Admins can update testimonials
drop policy if exists "Admins can update testimonials." on public.testimonials;
create policy "Admins can update testimonials."
  on public.testimonials for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Admins can delete testimonials
drop policy if exists "Admins can delete testimonials." on public.testimonials;
create policy "Admins can delete testimonials."
  on public.testimonials for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
