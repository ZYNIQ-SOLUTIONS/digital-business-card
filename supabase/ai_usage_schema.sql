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
