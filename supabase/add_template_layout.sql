-- =============================================================================
-- MIGRATION: ADD 'template_layout' COLUMN TO 'cards' TABLE
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- =============================================================================

-- 1. Add template_layout column to public.cards
alter table public.cards 
  add column if not exists template_layout text default 'classic-segmented' not null;

-- 2. Notify PostgREST to immediately reload schema cache
notify pgrst, 'reload schema';
