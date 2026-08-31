# Zavatar Supabase Schema & Database Migrations

This directory contains the PostgreSQL / Supabase database migrations for the **Zavatar Avatar Microservice** (Requirement R4).

---

## 1. Migration Overview

The migration file `001_zavatar_schema.sql` provisions the entire data layer required for 2D/3D avatar generation, multi-LOD asset storage, biometric GDPR compliance auditing, and Web3 NFT minting foundations.

### Key Features
- **Strict Idempotency**: Safe to run repeatedly against development, staging, or production databases (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DROP POLICY IF EXISTS ... CREATE POLICY`).
- **Data Integrity**: Enforces foreign key constraints with cascade rules and PostgreSQL check constraints on statuses and formats.
- **Row Level Security (RLS)**: Enforces least-privilege security per Supabase user session (`auth.uid()`).
- **Performance Optimization**: B-Tree indexes on user IDs, foreign keys, asset LOD levels, and lookup statuses.
- **Automatic Timestamps**: Includes an idempotent trigger function to automatically maintain `updated_at` on avatar records.

---

## 2. Schema Architecture

```
auth.users (Supabase Auth)
  │
  ├──< public.avatars (id, user_id, wallet_address, status, generation_method, style, ...)
  │     │
  │     ├──< public.avatar_assets (id, avatar_id, lod_level, format, storage_url, checksum, ...)
  │     │
  │     └──< public.nft_mints (id, avatar_id, token_id, contract_address, chain_id, tx_hash, ...)
  │           │
  │           └──< public.marketplace_listings (id, nft_mint_id, seller_wallet, price, status, ...)
  │
  └──< public.consent_logs (id, user_id, consent_type, granted_at, ip_address, revoked_at)
```

### Table Breakdown

| Table | Purpose | Key Columns & Constraints |
|---|---|---|
| `public.avatars` | Primary avatar entities | `id` (UUID PK), `user_id` (FK `auth.users`), `wallet_address` (text), `status` (`'draft'`, `'rendering'`, `'ready'`, `'minted'`), `generation_method` (`'selfie'`, `'template'`), `style` (JSONB), `created_at`, `updated_at` |
| `public.avatar_assets` | Rendered output assets | `id` (UUID PK), `avatar_id` (FK `avatars` CASCADE), `lod_level` (`'high'`, `'mid'`, `'low'`), `format` (`'glb'`, `'png'`, `'svg'`), `storage_url` (text), `checksum` (text), `created_at` |
| `public.nft_mints` | Phase 3 Web3 on-chain mints | `id` (UUID PK), `avatar_id` (FK `avatars` CASCADE), `token_id` (text), `contract_address` (text), `chain_id` (integer), `tx_hash` (text), `ipfs_cid` (text), `minted_at` (timestamptz) |
| `public.marketplace_listings` | Phase 3 Secondary marketplace | `id` (UUID PK), `nft_mint_id` (FK `nft_mints` SET NULL), `seller_wallet` (text), `price` (numeric), `currency` (text DEFAULT `'ETH'`), `status` (`'active'`, `'sold'`, `'cancelled'`), `listed_at`, `sold_at` |
| `public.consent_logs` | Biometric GDPR compliance logs | `id` (UUID PK), `user_id` (FK `auth.users` CASCADE), `consent_type` (text), `granted_at` (timestamptz DEFAULT `now()`), `ip_address` (text), `revoked_at` (timestamptz) |

---

## 3. How to Apply the Migration

You can apply this migration using any of the following methods:

### Method A: Supabase CLI (Recommended for Local & Staging)

If using Supabase CLI with local development:

```bash
# Push migrations to the linked remote database or local Supabase instance
supabase db push

# Or apply specific migration directly
supabase migration up
```

### Method B: Direct PostgreSQL Connection (`psql`)

If you have a PostgreSQL connection string (e.g. from Supabase Project Settings > Database > Connection String):

```bash
# Export your database connection string
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Execute the migration script
psql "$DATABASE_URL" -f zavatar/supabase/migrations/001_zavatar_schema.sql
```

### Method C: Supabase Dashboard SQL Editor

1. Open your project in the [Supabase Dashboard](https://app.supabase.com).
2. Navigate to **SQL Editor** in the left sidebar.
3. Click **New Query**.
4. Copy the entire contents of `001_zavatar_schema.sql` and paste into the editor.
5. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`).

---

## 4. Row Level Security (RLS) Policy Specification

All tables have RLS enabled with the following security rules:

1. **`public.avatars`**:
   - **SELECT**: Users can query their own avatars (`auth.uid() = user_id`) OR any avatar that is publicly published (`status IN ('ready', 'minted')`).
   - **INSERT**: Authenticated users can only insert avatars with `user_id = auth.uid()`.
   - **UPDATE / DELETE**: Users can only modify or delete avatars they own (`auth.uid() = user_id`).

2. **`public.avatar_assets`**:
   - **SELECT**: Accessible if the user owns the parent avatar or if the parent avatar has `status IN ('ready', 'minted')`.
   - **INSERT / UPDATE / DELETE**: Restricted to the owner of the parent avatar (`parent_avatar.user_id = auth.uid()`).

3. **`public.consent_logs`**:
   - **SELECT / INSERT / UPDATE**: Strict tenant isolation (`auth.uid() = user_id`). Users can only record and view their own biometric consent ledger.

4. **`public.nft_mints`**:
   - **SELECT**: Publicly viewable (`USING (true)`).
   - **INSERT / UPDATE**: Restricted to the avatar owner (`parent_avatar.user_id = auth.uid()`).

5. **`public.marketplace_listings`**:
   - **SELECT**: Publicly viewable (`USING (true)`).
   - **INSERT / UPDATE**: Requires authenticated user role (`auth.role() = 'authenticated'`).

---

## 5. Verification & Testing

To verify the migration was applied correctly, run the following SQL verification query:

```sql
-- Check table presence
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('avatars', 'avatar_assets', 'nft_mints', 'marketplace_listings', 'consent_logs');

-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('avatars', 'avatar_assets', 'nft_mints', 'marketplace_listings', 'consent_logs');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('avatars', 'avatar_assets', 'nft_mints', 'marketplace_listings', 'consent_logs');
```
