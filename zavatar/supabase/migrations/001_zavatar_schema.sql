-- =============================================================================
-- ZAVATAR AVATAR MICROSERVICE SCHEMA MIGRATION
-- File: zavatar/supabase/migrations/001_zavatar_schema.sql
-- Description: Creates the core tables, performance indexes, triggers, and
--              Row Level Security (RLS) policies for Zavatar 2D/3D avatars,
--              multi-LOD asset registry, Web3 NFT mints, marketplace listings,
--              and biometric GDPR consent auditing.
-- Idempotency: Fully idempotent. Safe to run repeatedly against any PostgreSQL /
--              Supabase database instance without error or data loss.
-- =============================================================================

-- Enable pgcrypto extension for gen_random_uuid() if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. TABLE DEFINITIONS
-- =============================================================================

-- 1.1 Avatars Table
-- Stores avatar generation instances, current status, method, and style JSON
CREATE TABLE IF NOT EXISTS public.avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'rendering', 'ready', 'minted')),
  generation_method text NOT NULL CHECK (generation_method IN ('selfie', 'template')),
  style jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 1.2 Avatar Assets Table
-- Stores multi-LOD rendered assets (high, mid, low) and formats (glb, png, svg)
CREATE TABLE IF NOT EXISTS public.avatar_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id uuid NOT NULL REFERENCES public.avatars(id) ON DELETE CASCADE,
  lod_level text NOT NULL CHECK (lod_level IN ('high', 'mid', 'low')),
  format text NOT NULL CHECK (format IN ('glb', 'png', 'svg')),
  storage_url text NOT NULL,
  checksum text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 1.3 NFT Mints Table
-- Records on-chain ERC-721 mint transactions, token IDs, and IPFS metadata CIDs
CREATE TABLE IF NOT EXISTS public.nft_mints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id uuid NOT NULL REFERENCES public.avatars(id) ON DELETE CASCADE,
  token_id text,
  contract_address text,
  chain_id integer,
  tx_hash text,
  ipfs_cid text,
  minted_at timestamptz
);

-- 1.4 Marketplace Listings Table
-- Supports secondary trading of minted avatars and NFT card assets
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_mint_id uuid REFERENCES public.nft_mints(id) ON DELETE SET NULL,
  seller_wallet text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ETH',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  listed_at timestamptz NOT NULL DEFAULT now(),
  sold_at timestamptz
);

-- 1.5 Consent Logs Table
-- Immutable audit ledger for biometric consent capture and GDPR compliance
CREATE TABLE IF NOT EXISTS public.consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  revoked_at timestamptz
);

-- =============================================================================
-- 2. PERFORMANCE INDEXES (Idempotent)
-- =============================================================================

-- Avatars indexes
CREATE INDEX IF NOT EXISTS idx_avatars_user_id ON public.avatars(user_id);
CREATE INDEX IF NOT EXISTS idx_avatars_status ON public.avatars(status);
CREATE INDEX IF NOT EXISTS idx_avatars_wallet_address ON public.avatars(wallet_address);
CREATE INDEX IF NOT EXISTS idx_avatars_created_at ON public.avatars(created_at DESC);

-- Avatar assets indexes
CREATE INDEX IF NOT EXISTS idx_avatar_assets_avatar_id ON public.avatar_assets(avatar_id);
CREATE INDEX IF NOT EXISTS idx_avatar_assets_avatar_lod ON public.avatar_assets(avatar_id, lod_level);
CREATE INDEX IF NOT EXISTS idx_avatar_assets_format ON public.avatar_assets(format);

-- NFT mints indexes
CREATE INDEX IF NOT EXISTS idx_nft_mints_avatar_id ON public.nft_mints(avatar_id);
CREATE INDEX IF NOT EXISTS idx_nft_mints_contract_token ON public.nft_mints(contract_address, token_id);
CREATE INDEX IF NOT EXISTS idx_nft_mints_tx_hash ON public.nft_mints(tx_hash);

-- Marketplace listings indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_nft ON public.marketplace_listings(nft_mint_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON public.marketplace_listings(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller ON public.marketplace_listings(seller_wallet);
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_listed_at ON public.marketplace_listings(listed_at DESC);

-- Consent logs indexes
CREATE INDEX IF NOT EXISTS idx_consent_logs_user_id ON public.consent_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_consent_logs_type ON public.consent_logs(consent_type);
CREATE INDEX IF NOT EXISTS idx_consent_logs_granted_at ON public.consent_logs(granted_at DESC);

-- =============================================================================
-- 3. UPDATED_AT TRIGGER FUNCTION (Idempotent)
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_zavatar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_avatars_updated_at ON public.avatars;
CREATE TRIGGER set_avatars_updated_at
  BEFORE UPDATE ON public.avatars
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_zavatar_updated_at();

-- =============================================================================
-- 4. ROW LEVEL SECURITY (RLS) & POLICIES (Idempotent)
-- =============================================================================

-- Enable RLS across all tables
ALTER TABLE public.avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avatar_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nft_mints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_logs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 4.1 Avatars RLS Policies
-- -----------------------------------------------------------------------------

-- SELECT: Users can view their own avatars OR any avatar in 'ready' or 'minted' status
DROP POLICY IF EXISTS "Users can view their own avatars or ready public avatars" ON public.avatars;
CREATE POLICY "Users can view their own avatars or ready public avatars"
  ON public.avatars FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    OR status IN ('ready', 'minted')
  );

-- INSERT: Authenticated users can only create avatars owned by themselves
DROP POLICY IF EXISTS "Users can insert their own avatars" ON public.avatars;
CREATE POLICY "Users can insert their own avatars"
  ON public.avatars FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- UPDATE: Users can only update their own avatars
DROP POLICY IF EXISTS "Users can update their own avatars" ON public.avatars;
CREATE POLICY "Users can update their own avatars"
  ON public.avatars FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- DELETE: Users can only delete their own avatars
DROP POLICY IF EXISTS "Users can delete their own avatars" ON public.avatars;
CREATE POLICY "Users can delete their own avatars"
  ON public.avatars FOR DELETE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4.2 Avatar Assets RLS Policies
-- -----------------------------------------------------------------------------

-- SELECT: View assets if the user owns the parent avatar or if the avatar is ready/minted
DROP POLICY IF EXISTS "Users can view avatar assets" ON public.avatar_assets;
CREATE POLICY "Users can view avatar assets"
  ON public.avatar_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.avatars
      WHERE public.avatars.id = public.avatar_assets.avatar_id
      AND (
        (auth.uid() IS NOT NULL AND public.avatars.user_id = auth.uid())
        OR public.avatars.status IN ('ready', 'minted')
      )
    )
  );

-- INSERT: Authenticated users can insert assets for their own avatars
DROP POLICY IF EXISTS "Users can insert avatar assets" ON public.avatar_assets;
CREATE POLICY "Users can insert avatar assets"
  ON public.avatar_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.avatars
      WHERE public.avatars.id = public.avatar_assets.avatar_id
      AND auth.uid() IS NOT NULL
      AND public.avatars.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update assets for their own avatars
DROP POLICY IF EXISTS "Users can update avatar assets" ON public.avatar_assets;
CREATE POLICY "Users can update avatar assets"
  ON public.avatar_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.avatars
      WHERE public.avatars.id = public.avatar_assets.avatar_id
      AND auth.uid() IS NOT NULL
      AND public.avatars.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.avatars
      WHERE public.avatars.id = public.avatar_assets.avatar_id
      AND auth.uid() IS NOT NULL
      AND public.avatars.user_id = auth.uid()
    )
  );

-- DELETE: Users can delete assets for their own avatars
DROP POLICY IF EXISTS "Users can delete avatar assets" ON public.avatar_assets;
CREATE POLICY "Users can delete avatar assets"
  ON public.avatar_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.avatars
      WHERE public.avatars.id = public.avatar_assets.avatar_id
      AND auth.uid() IS NOT NULL
      AND public.avatars.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 4.3 Consent Logs RLS Policies (GDPR / Biometric Auditing)
-- -----------------------------------------------------------------------------

-- SELECT: Users can only view their own consent audit records
DROP POLICY IF EXISTS "Users can view their own consent logs" ON public.consent_logs;
CREATE POLICY "Users can view their own consent logs"
  ON public.consent_logs FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- INSERT: Users can only record consent for their own account
DROP POLICY IF EXISTS "Users can insert their own consent logs" ON public.consent_logs;
CREATE POLICY "Users can insert their own consent logs"
  ON public.consent_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- UPDATE: Users can update their own consent logs (e.g. setting revoked_at)
DROP POLICY IF EXISTS "Users can update their own consent logs" ON public.consent_logs;
CREATE POLICY "Users can update their own consent logs"
  ON public.consent_logs FOR UPDATE
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4.4 NFT Mints RLS Policies (Phase 3 Web3 Integration)
-- -----------------------------------------------------------------------------

-- SELECT: Public can view all on-chain NFT mint records
DROP POLICY IF EXISTS "Public can view minted NFTs" ON public.nft_mints;
CREATE POLICY "Public can view minted NFTs"
  ON public.nft_mints FOR SELECT
  USING (true);

-- INSERT: Users can record NFT mints for their own avatars
DROP POLICY IF EXISTS "Users can record NFT mints for their avatars" ON public.nft_mints;
CREATE POLICY "Users can record NFT mints for their avatars"
  ON public.nft_mints FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.avatars
      WHERE public.avatars.id = public.nft_mints.avatar_id
      AND auth.uid() IS NOT NULL
      AND public.avatars.user_id = auth.uid()
    )
  );

-- UPDATE: Users can update mint records for their own avatars
DROP POLICY IF EXISTS "Users can update NFT mints for their avatars" ON public.nft_mints;
CREATE POLICY "Users can update NFT mints for their avatars"
  ON public.nft_mints FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.avatars
      WHERE public.avatars.id = public.nft_mints.avatar_id
      AND auth.uid() IS NOT NULL
      AND public.avatars.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.avatars
      WHERE public.avatars.id = public.nft_mints.avatar_id
      AND auth.uid() IS NOT NULL
      AND public.avatars.user_id = auth.uid()
    )
  );

-- -----------------------------------------------------------------------------
-- 4.5 Marketplace Listings RLS Policies (Phase 3 Secondary Market)
-- -----------------------------------------------------------------------------

-- SELECT: Anyone can view active marketplace listings
DROP POLICY IF EXISTS "Public can view marketplace listings" ON public.marketplace_listings;
CREATE POLICY "Public can view marketplace listings"
  ON public.marketplace_listings FOR SELECT
  USING (true);

-- INSERT: Authenticated users can create marketplace listings
DROP POLICY IF EXISTS "Authenticated users can create marketplace listings" ON public.marketplace_listings;
CREATE POLICY "Authenticated users can create marketplace listings"
  ON public.marketplace_listings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- UPDATE: Authenticated users can update marketplace listings
DROP POLICY IF EXISTS "Authenticated users can update marketplace listings" ON public.marketplace_listings;
CREATE POLICY "Authenticated users can update marketplace listings"
  ON public.marketplace_listings FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
