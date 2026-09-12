-- =============================================================================
-- CARD NFT MINTS & BASE SEPOLIA ON-CHAIN IDENTITY SCHEMA
-- =============================================================================

create table if not exists public.card_nft_mints (
  id uuid default gen_random_uuid() primary key,
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  token_id text not null,
  contract_address text not null default '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  chain_id integer not null default 84532, -- Base Sepolia
  tx_hash text not null,
  ipfs_cid text,
  metadata_uri text,
  owner_wallet text not null,
  tier text default 'Bronze',
  score integer default 0,
  minted_at timestamptz default now() not null
);

alter table public.card_nft_mints enable row level security;

-- Public can view NFT mint records for any card
drop policy if exists "Public can view card NFT mints" on public.card_nft_mints;
create policy "Public can view card NFT mints"
  on public.card_nft_mints for select
  using (true);

-- Authenticated users can insert their card's NFT mints
drop policy if exists "Users can insert card NFT mints" on public.card_nft_mints;
create policy "Users can insert card NFT mints"
  on public.card_nft_mints for insert
  with check (auth.uid() = user_id or auth.uid() is not null);

-- Indexing for quick lookups
create index if not exists idx_card_nft_mints_card_id on public.card_nft_mints(card_id);
create index if not exists idx_card_nft_mints_owner on public.card_nft_mints(owner_wallet);
create index if not exists idx_card_nft_mints_tx on public.card_nft_mints(tx_hash);
