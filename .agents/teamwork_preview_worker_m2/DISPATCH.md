## 2026-08-31T06:29:21Z
You are Worker M2: Supabase Data Layer & Migrations (Requirement R4).
Your working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m2/
Create your directory if needed, write BRIEFING.md and progress.md in it.

MANDATORY: Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md and /home/level-77/Desktop/digital_business_card/PROJECT.md before starting.
Also inspect the schema plan in /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_2/handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership:
You have exclusive write ownership of all files under:
`/home/level-77/Desktop/digital_business_card/zavatar/supabase/`

Your mission:
1. Create `zavatar/supabase/migrations/001_zavatar_schema.sql` defining:
   - `avatars` table (id uuid PK, user_id uuid FK auth.users, wallet_address text, status text CHECK (status IN ('draft','rendering','ready','minted')), generation_method text CHECK (generation_method IN ('selfie','template')), style jsonb, created_at, updated_at)
   - `avatar_assets` table (id uuid PK, avatar_id uuid FK avatars, lod_level text CHECK (lod_level IN ('high','mid','low')), format text CHECK (format IN ('glb','png','svg')), storage_url text, checksum text, created_at)
   - `nft_mints` table (id uuid PK, avatar_id uuid FK avatars, token_id text, contract_address text, chain_id integer, tx_hash text, ipfs_cid text, minted_at)
   - `marketplace_listings` table (id uuid PK, nft_mint_id uuid FK nft_mints, seller_wallet text, price numeric, currency text DEFAULT 'ETH', status text CHECK (status IN ('active','sold','cancelled')), listed_at, sold_at)
   - `consent_logs` table (id uuid PK, user_id uuid FK auth.users, consent_type text, granted_at, ip_address text, revoked_at)
2. Ensure full idempotency: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS` on `avatars(user_id)`, `avatar_assets(avatar_id)`, `consent_logs(user_id)`, etc.
3. Enable RLS on `avatars`, `avatar_assets`, `nft_mints`, `marketplace_listings`, `consent_logs` with idempotent policies (drop if exists then create).
4. Create `zavatar/supabase/migrations/README.md` explaining how to apply the migration (`supabase db push` or `psql $DATABASE_URL -f 001_zavatar_schema.sql`).
5. Verify SQL syntax and idempotency.
6. Write your report to /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m2/handoff.md.
7. Send a completion message when done.
