# Original User Request

## 2026-08-31T06:23:57Z

<USER_REQUEST>
Build **Zavatar** — a fully self-contained, production-ready avatar microservice that lives under `/home/level-77/Desktop/digital_business_card/zavatar/` and integrates with the existing digital business card app (Next.js 16 / Supabase / TypeScript). Zavatar turns a business-card headshot into a personalized 3D/2D avatar that can be minted as an NFT.

Working directory: `/home/level-77/Desktop/digital_business_card/zavatar`

Integrity mode: development

---

## Context: Existing Application

The host application is a Next.js 16 (App Router), React 19, TypeScript, TailwindCSS 4, Supabase project located at `/home/level-77/Desktop/digital_business_card`. It uses:
- Supabase for auth and database
- JWT-based session tokens
- Zustand for client state
- The `@google/genai` SDK
- `package.json` scripts: `dev`, `build`, `start`, `lint`

Zavatar must **not** break the existing app. It lives under `/home/level-77/Desktop/digital_business_card/zavatar/` as a **self-contained sub-project** that the host can reference.

---

## Requirements

### R1. Project Scaffold & Generation Adapter Interface
Create a fully runnable Zavatar sub-project at `/home/level-77/Desktop/digital_business_card/zavatar/`. The project must have:
- A dedicated `package.json` with its own dev/build/start scripts, fully installable via `npm install` without errors.
- A `README.md` with clear local-run instructions (prerequisites, env setup, `npm run dev`).
- A `.env.example` file documenting all required environment variables.
- A pluggable `AvatarGenerationAdapter` TypeScript interface with three methods: `generateFromSelfie(image: Buffer, style: AvatarStyle): Promise<AvatarMeshResult>`, `generateFromTemplate(params: CustomizationParams): Promise<AvatarMeshResult>`, and `healthCheck(): Promise<boolean>`.
- Shared TypeScript types: `AvatarStyle`, `CustomizationParams`, `AvatarMeshResult` — defined in `zavatar/src/types/index.ts`.
- Two concrete adapter implementations:
  1. `MetaPersonAdapter` — stubbed with clear TODO comments for API key wiring, so it can be connected to the real MetaPerson Avatar SDK Cloud API without restructuring. It must throw a descriptive error if `METAPERSON_API_KEY` env var is not set.
  2. `TemplateAdapter` — fully functional, assembles SVG/PNG 2D avatar composites from a bundled modular asset library. Must include at least 5 face-shape variants × 6 skin-tone variants × 8 hairstyle variants — parametrically composited using the `sharp` or `canvas` npm package (no external API required). Assets can be SVG or PNG files stored in `zavatar/src/assets/`.
- An `AdapterRegistry` that reads `ACTIVE_ADAPTER` env var (default: `template`) and auto-falls-back to `TemplateAdapter` if `MetaPersonAdapter` initialization fails.
- The `TemplateAdapter` must be the always-on fallback — the system must remain functional even if `MetaPersonAdapter` throws or is unconfigured.

### R2. Ingest & Consent Service
Implement an image ingest and consent pipeline:
- An API endpoint `POST /api/zavatar/generate/selfie` that accepts multipart form upload (image file up to 10 MB).
- Basic validation: file type (JPEG/PNG/WebP only), file size limit, and a face-detection check using an open-source library (`@vladmandic/face-api`, `face-api.js`, or similar — no paid API required).
- A biometric consent gate: the endpoint must require `consent: true` in the request body or form data. If absent or false, return HTTP 422 with a JSON error body `{error: 'CONSENT_REQUIRED', message: '...'}`. Log the consent event to the `consent_logs` Supabase table with `user_id`, `granted_at` timestamp, `ip_address`, and `consent_type: 'biometric'`.
- Raw selfie bytes must be deleted from memory after face detection completes — only persist derived `CustomizationParams` and rendered assets, never the source photo.
- A non-selfie fallback: `POST /api/zavatar/generate/template` accepts a JSON body of `CustomizationParams` (face shape, skin tone, hair style/color, outfit, accessories) and routes directly to `TemplateAdapter` — no biometric data, no consent gate required.

### R3. Avatar Studio UI
Build a full-screen Avatar Studio as a Next.js page at `/zavatar/studio` within the host app's routing (create `app/zavatar/studio/page.tsx`). The studio must have a 4-panel layout:

- **Left panel — Style Profile**: Scrollable grid of outfit/style category thumbnails. Must include at minimum these 5 categories: Business Formal, Smart Casual, Creative/Founder, Techwear, Regional Formal (thobe/abaya-inclusive for MENA users). Clicking a thumbnail updates the avatar preview immediately (optimistic UI update — no network request needed for the preview change). Include a color-palette swatch row (at least 8 colors) that recolors the active outfit.
- **Center panel — Avatar Viewport**: Renders the current avatar. For Phase 1 (template-based), renders a 2D composite image using an `<img>` or `<canvas>` tag showing the assembled avatar. When a GLB asset URL is present, render it with the `<model-viewer>` web component (`@google/model-viewer`). The viewport must update live as the user changes any option — no 'Apply' button. Show a loading spinner during network requests.
- **Right panel — Feature Sculpt**: Range sliders for: Face Shape (round ↔ angular), Eye Size (small ↔ large), Nose Width (narrow ↔ wide), Jaw Width (narrow ↔ wide), Skin Tone (light ↔ dark). Each slider range 0-100, default 50. Each slider change immediately updates the avatar preview (debounced 300ms for network calls).
- **Bottom panel — Expression Lab**: Horizontal scrollable carousel of expression preset chips/thumbnails. Minimum 6 expressions: Neutral, Smile, Laugh, Concerned, Surprised, Wink. Selecting one sets the avatar's `defaultExpression` field and shows a visual indicator (emoji or icon) overlaid on the 2D preview.
- **Mobile layout** (viewport width < 768px): Collapse to a single-panel tabbed view. Tabs: Style / Sculpt / Expression. Avatar viewport always visible and pinned at the top 40% of the screen. Tab content fills the bottom 60%.
- All studio state (selected outfit, sliders, expression, color) must autosave to `localStorage` key `zavatar_studio_draft` on every change (debounced 500ms). Page refresh must restore all previously selected values.
- A sticky **"Save & Preview"** button (fixed bottom-right on desktop, fixed bottom-center on mobile) calls `POST /api/zavatar/generate/template` with current params, then updates the center viewport with the returned asset URL.
- A **"Mint as NFT"** button (disabled until avatar status is `ready`) opens a modal explaining the NFT minting flow with a "Connect Wallet" CTA (Phase 3 stub — the button and modal must exist but wallet connection can show a 'Coming Soon' message).
- Use TailwindCSS 4 (already in the host app) for all styling. The studio should have a dark theme (`bg-gray-900` base) to differentiate it from the card app's main UI. No new CSS files.

### R4. Data Layer (Postgres / Supabase)
Provide a SQL migration file at `zavatar/supabase/migrations/001_zavatar_schema.sql` that creates the following tables in the existing Supabase project:

```sql
-- avatars table
CREATE TABLE IF NOT EXISTS avatars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','rendering','ready','minted')),
  generation_method text NOT NULL CHECK (generation_method IN ('selfie','template')),
  style jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- avatar_assets table
CREATE TABLE IF NOT EXISTS avatar_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id uuid NOT NULL REFERENCES avatars(id) ON DELETE CASCADE,
  lod_level text NOT NULL CHECK (lod_level IN ('high','mid','low')),
  format text NOT NULL CHECK (format IN ('glb','png','svg')),
  storage_url text NOT NULL,
  checksum text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- nft_mints table
CREATE TABLE IF NOT EXISTS nft_mints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  avatar_id uuid NOT NULL REFERENCES avatars(id),
  token_id text,
  contract_address text,
  chain_id integer,
  tx_hash text,
  ipfs_cid text,
  minted_at timestamptz
);

-- marketplace_listings table
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nft_mint_id uuid REFERENCES nft_mints(id),
  seller_wallet text NOT NULL,
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'ETH',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','sold','cancelled')),
  listed_at timestamptz NOT NULL DEFAULT now(),
  sold_at timestamptz
);

-- consent_logs table
CREATE TABLE IF NOT EXISTS consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  revoked_at timestamptz
);
```

- Enable RLS on `avatars`, `avatar_assets`, and `consent_logs`. Add policies so authenticated users can only SELECT/INSERT/UPDATE/DELETE their own rows (matching `auth.uid() = user_id`).
- Add `CREATE INDEX IF NOT EXISTS` on `avatars(user_id)`, `avatar_assets(avatar_id)`, `consent_logs(user_id)`.
- The migration must be fully idempotent — running it twice on the same database must not error.
- Also provide a `zavatar/supabase/migrations/README.md` explaining how to apply: `supabase db push` or manual `psql $DATABASE_URL -f 001_zavatar_schema.sql`.

### R5. REST API Surface
Implement all API routes as Next.js App Router route handlers inside the host app at `app/api/zavatar/`. Each route file uses the Next.js 15/16 App Router `route.ts` convention.

Required endpoints:

1. `POST /api/zavatar/generate/selfie` → `app/api/zavatar/generate/selfie/route.ts`
   - Accepts multipart form data: `image` (file), `consent` (boolean), `style` (JSON string of AvatarStyle)
   - Validates consent, file type/size, runs face detection
   - Creates `avatars` row with `status: 'rendering'`, logs consent
   - Calls active adapter's `generateFromSelfie`, saves result assets to `avatar_assets`
   - Returns `{avatarId, status, assetUrl}`

2. `POST /api/zavatar/generate/template` → `app/api/zavatar/generate/template/route.ts`
   - Accepts JSON body: `CustomizationParams`
   - Creates or updates avatar draft, calls `TemplateAdapter.generateFromTemplate`
   - Returns `{avatarId, status: 'ready', assetUrls: {high, mid, low}}`

3. `GET /api/zavatar/[id]/status` → `app/api/zavatar/[id]/status/route.ts`
   - Returns `{id, status, progress: number (0-100), assetUrls?}`

4. `GET /api/zavatar/[id]` → `app/api/zavatar/[id]/route.ts`
   - Returns full avatar metadata including all asset URLs and NFT mint status

5. `PATCH /api/zavatar/[id]/customize` → `app/api/zavatar/[id]/customize/route.ts`
   - Accepts partial `CustomizationParams`, merges with existing style
   - Re-runs `TemplateAdapter.generateFromTemplate` with merged params
   - Updates `avatar_assets`, returns updated asset URLs

6. `POST /api/zavatar/[id]/render` → `app/api/zavatar/[id]/render/route.ts`
   - Triggers fresh render pass generating 3 PNG sizes: 512px, 256px, 64px
   - Saves all three to `avatar_assets` with lod_levels: high/mid/low
   - Returns `{assetUrls: {high: '...', mid: '...', low: '...'}}`

7. `GET /api/zavatar/[id]/ownership` → `app/api/zavatar/[id]/ownership/route.ts`
   - Phase 3 stub: returns `{minted: false, owner: null, tokenId: null, contractAddress: null}`
   - If `nft_mints` row exists for this avatar, return its data

All endpoints:
- Extract `user_id` from Supabase JWT in `Authorization: Bearer <token>` header using `@supabase/ssr`
- Return HTTP 401 if no valid JWT present
- Return HTTP 403 if the avatar's `user_id` does not match the authenticated user
- Return `Content-Type: application/json` always
- Handle errors gracefully with structured JSON: `{error: 'ERROR_CODE', message: 'Human readable description'}`

### R6. NFT Minting Stub (Phase 3 Foundation)
Provide a complete `zavatar/nft/` directory as a standalone Hardhat project:

- `zavatar/nft/package.json` — Hardhat project dependencies: `hardhat`, `@nomicfoundation/hardhat-toolbox`, `@openzeppelin/contracts`
- `zavatar/nft/contracts/ZavatarNFT.sol` — ERC-721 smart contract:
  ```solidity
  // SPDX-License-Identifier: MIT
  pragma solidity ^0.8.20;
  // Uses OpenZeppelin ERC721URIStorage + Ownable
  // safeMint(address to, string memory uri) — onlyOwner
  // Per-token soulbound flag: mapping(uint256 => bool) public soulbound
  // setSoulbound(uint256 tokenId, bool value) — onlyOwner
  // Override _update() to block transfers when soulbound[tokenId] == true
  //   (allow minting from address(0), block all other transfers if soulbound)
  ```
- `zavatar/nft/scripts/deploy.ts` — Hardhat Ignition or ethers.js deploy script
- `zavatar/nft/hardhat.config.ts` — config with networks: `hardhat` (local) and `baseSepolia` (chain ID 84532, RPC from env var `BASE_SEPOLIA_RPC_URL`)
- `zavatar/nft/test/ZavatarNFT.test.ts` — Hardhat test file covering:
  1. Owner can mint a token
  2. Minted token emits Transfer event
  3. Soulbound token cannot be transferred (reverts with custom error)
  4. Non-soulbound token can be transferred
- `zavatar/nft/.env.example` — documenting `BASE_SEPOLIA_RPC_URL`, `PRIVATE_KEY`, `BASESCAN_API_KEY`
- `zavatar/nft/README.md` — instructions for: `npm install`, `npx hardhat compile`, `npx hardhat test`, `npx hardhat node`, `npx hardhat run scripts/deploy.ts --network localhost`

The contract must compile without errors. All tests must pass against the local Hardhat network.

### R7. Integration with Host App
Wire Zavatar into the existing digital business card app minimally and non-destructively:

1. **Type extension**: In `lib/types.ts` (or wherever the card profile type is defined — find it by reading the existing codebase), add `avatar_id?: string` as an optional field to the profile/card type.

2. **Upsell CTA**: In the existing profile display page (find by reading the codebase — likely `app/` directory), add a `<ZavatarUpsellCard />` component that:
   - Is only rendered when the current user's profile has no `avatar_id`
   - Displays: a small avatar icon, the text 'Create Your Zavatar', a subtitle 'Turn your headshot into a living 3D avatar', and a link button to `/zavatar/studio`
   - Uses only existing TailwindCSS classes from the host app (inspect existing components to match the design language)
   - Does NOT modify the structure of any existing component — it should be inserted as a new sibling element
   - Lives in `components/zavatar/ZavatarUpsellCard.tsx`

3. **Avatar display**: When a profile has an `avatar_id`, fetch the avatar's mid-LOD PNG (256px) from `/api/zavatar/[avatar_id]` and render it in the profile card's header alongside or replacing the headshot. Gracefully fall back to the original headshot if the fetch fails or returns no asset. This display logic should live in a `components/zavatar/AvatarDisplay.tsx` component.

4. **Non-destructive**: Do not delete, rename, or structurally alter any existing file. Only additions and minimal targeted insertions.

---

## Acceptance Criteria

### Scaffold & Adapter
- [ ] `cd /home/level-77/Desktop/digital_business_card/zavatar && npm install` completes without errors.
- [ ] TypeScript compiles without errors: `cd zavatar && npx tsc --noEmit`
- [ ] `TemplateAdapter.healthCheck()` returns `true` when invoked.
- [ ] `TemplateAdapter.generateFromTemplate({ faceShape: 'oval', skinTone: '#F5CBA7', hairStyle: 'short-straight', outfit: 'business-formal', expression: 'neutral', eyeSize: 50, noseWidth: 50, jawWidth: 50, outfitColor: '#1a1a2e' })` returns an `AvatarMeshResult` with a non-null `assetUrl` string.

### Ingest & Consent
- [ ] `POST /api/zavatar/generate/selfie` with `consent: false` returns HTTP 422 with `error: 'CONSENT_REQUIRED'`.
- [ ] `POST /api/zavatar/generate/selfie` with no Authorization header returns HTTP 401.
- [ ] `POST /api/zavatar/generate/template` with no consent field and valid auth returns HTTP 200.
- [ ] Uploading a `.pdf` file to the selfie endpoint returns HTTP 400.

### Avatar Studio UI
- [ ] `app/zavatar/studio/page.tsx` exists and is a valid Next.js page component.
- [ ] The page renders 4 distinct panel sections identifiable by CSS class or `data-testid` attributes: `style-profile`, `avatar-viewport`, `feature-sculpt`, `expression-lab`.
- [ ] On desktop layout (>=768px), all 4 panels are visible simultaneously.
- [ ] On mobile (<768px), tab navigation elements are present (Style, Sculpt, Expression tabs).
- [ ] Avatar viewport renders an image element that updates when outfit selection changes.
- [ ] localStorage key `zavatar_studio_draft` is written on state changes.
- [ ] 'Save & Preview' button exists and is connected to the template generation endpoint.
- [ ] 'Mint as NFT' button exists (may show 'Coming Soon' modal).

### Data Layer
- [ ] `zavatar/supabase/migrations/001_zavatar_schema.sql` is a valid SQL file containing all 5 table definitions.
- [ ] Migration is idempotent: contains `CREATE TABLE IF NOT EXISTS` for all tables.
- [ ] RLS enable and policy statements are present in the migration file.
- [ ] All foreign key relationships are correctly defined.

### API Surface
- [ ] All 7 route files exist at their specified paths under `app/api/zavatar/`.
- [ ] Each route file exports a valid HTTP method handler (GET, POST, or PATCH).
- [ ] Routes return 401 when no Authorization header is present (verifiable by reading route handler code).
- [ ] `GET /api/zavatar/[id]/ownership` route returns a JSON stub with `minted: false`.

### Smart Contract
- [ ] `cd /home/level-77/Desktop/digital_business_card/zavatar/nft && npm install && npx hardhat compile` exits with code 0.
- [ ] `npx hardhat test` passes all tests (0 failures).
- [ ] Soulbound transfer test explicitly verifies revert behavior.

### Host App Integration
- [ ] `npm run dev` in `/home/level-77/Desktop/digital_business_card` starts without TypeScript errors or import failures.
- [ ] `components/zavatar/ZavatarUpsellCard.tsx` exists and is a valid React component.
- [ ] `components/zavatar/AvatarDisplay.tsx` exists and is a valid React component.
- [ ] The profile page file contains an import or reference to `ZavatarUpsellCard`.
- [ ] No existing component files have been deleted.

---

## Build Defaults (Resolved)

- **L2 Chain**: Base Sepolia testnet (chain ID 84532). RPC URL from env var.
- **Soulbound**: `soulbound` mapping defaults to `true` for all minted base avatars. Implement `setSoulbound(tokenId, bool)` for future cosmetic NFTs.
- **Biometric data retention**: Delete raw selfie bytes from memory immediately after face detection result. Never write selfie to disk or database.
- **Active adapter**: `TemplateAdapter` is always active and is the default. `MetaPersonAdapter` activates only when `METAPERSON_API_KEY` env var is set. Auto-fallback to `TemplateAdapter` if MetaPerson init throws.
- **API routing**: Next.js 16 App Router route handlers in the host app for Phase 1. The `zavatar/` directory contains the adapter library, assets, migration, and NFT project — NOT a second Express server.
- **Image compositing**: Use `sharp` npm package for PNG compositing in `TemplateAdapter`. Generate deterministic filenames based on params hash and cache locally in `zavatar/generated/` (gitignored).
- **TailwindCSS**: Studio page uses TailwindCSS 4 (already in host app). No new CSS files. Dark theme for the studio (`bg-gray-900`, `text-white`).
- **TypeScript strict**: Use `strict: true` in the zavatar tsconfig.
</USER_REQUEST>

## 2026-09-04T12:34:31Z

<USER_REQUEST>
A production Next.js 16 + Supabase digital business card platform (IZN) requires a comprehensive security hardening, feature completion, and infrastructure improvement pass. The platform has 16 identified features across auth, card management, networking/connections, enterprise management, AI integrations, and analytics — with 7 critical (P0) security vulnerabilities, 8 high-priority (P1) broken flows, and multiple incomplete/missing features. All work must be non-destructive: update and fix only, no removals or version upgrades.

Working directory: /home/level-77/Desktop/digital_business_card
Integrity mode: development

---

## Context & Background

The platform is a **production digital business card SaaS** (Next.js 16.3.3 App Router + Supabase PostgreSQL + Tailwind CSS v4 + Google Gemini 2.5 Flash + Apple Wallet PassKit). A master technical audit has already been completed and is available at `AUDIT_REPORT.md`. All fixes must be surgical and non-breaking — **do not remove features, do not upgrade package versions, do not change the database schema structure** (only add RLS policies, functions, and triggers).

Key tech stack facts:
- Next.js 16.3.3 with App Router (NOT Pages Router). Read `node_modules/next/dist/docs/` before writing any Next.js code.
- Supabase with SSR cookie-based auth (`@supabase/ssr`)
- Tailwind CSS v4 (NOT v3 — class naming differs)
- React 19.2.8
- TypeScript strict mode

---

## Requirements

### R1. Fix All P0 Critical Security Vulnerabilities

Fix all 7 critical security issues identified in `AUDIT_REPORT.md` without breaking existing functionality:

1. **P0-1 — Unauthenticated Admin Invite Endpoint**: Add `auth.getUser()` session check and organization admin role verification before executing `adminAuthClient.auth.admin.inviteUserByEmail()` in `app/api/invite/route.ts`.

2. **P0-2 — Missing RLS on Enterprise Tables**: Add `ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY` and `ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY` plus scoped policies to `supabase/schema.sql`. Apply these via Supabase migration or direct SQL (the schema.sql file should be updated to reflect final state).

3. **P0-3 — Public Lead Capture Blocked by RLS**: Create a PostgreSQL `SECURITY DEFINER` function `submit_public_lead(...)` that validates the card is published and inserts into `connections` bypassing RLS. Update `app/api/connections/route.ts` and `app/api/bookings/route.ts` to call this RPC function for anonymous visitors.

4. **P0-4 — Cross-Tenant Enterprise Directory Leak**: Fix `app/api/enterprise/members/route.ts` `GET` handler to scope the cards query to `org_id = caller's org_id` instead of returning all platform cards.

5. **P0-5 — Storage Overwrite Vulnerability**: Fix the `avatars` bucket storage RLS UPDATE and INSERT policies to enforce `(storage.foldername(name))[1] = auth.uid()::text` path ownership in `supabase/schema.sql`.

6. **P0-6 — Verification Insecure Auto-Approval Fallback**: In `app/api/ai/verify-identity/route.ts` and `components/verify-modal.tsx`, replace the catch blocks that auto-approve verification with fail-closed error responses. Add a PostgreSQL trigger `protect_verification_columns()` preventing direct client writes to `is_verified`, `verification_badge`, and `verified_at`.

7. **P0-7 — PostgREST Filter Injection in Wallet Route**: Validate `cardIdOrSlug` in `app/api/wallet/route.ts` with UUID and slug regex before constructing queries. Use separate `.eq("id", ...)` or `.eq("slug", ...)` instead of `.or(...)` with concatenated user input.

### R2. Fix All P1 High-Priority Broken Flows

8. **P1-1 — Enterprise Employee Onboarding Loop**: When an invited employee authenticates at `/auth/callback`, detect if their email matches a pending enterprise invitation, transfer the provisioned card's `user_id` to `employee.id`, and create the `organization_members` record. Add an `org_invitations` table or tokenized flow to `supabase/schema.sql` if needed.

9. **P1-2 — Remove 1.5s LCP Blocker**: Remove `PageLoader` from `app/layout.tsx` (or convert to a non-blocking top progress bar). Remove the render-blocking `@import url(...)` from `app/globals.css`. Make view logging in `app/[slug]/page.tsx` non-blocking using Next.js `after()` or fire-and-forget.

10. **P1-3 — Add OpenGraph, Twitter Cards, Schema.org JSON-LD**: In `app/[slug]/page.tsx` `generateMetadata`, add `openGraph.images` (avatar URL), `openGraph.url`, `twitter.card: "summary_large_image"`, `alternates.canonical`, and inject a `<script type="application/ld+json">` Schema.org `Person` block into the page HTML.

11. **P1-4 — Fix Landing Page CSR/Metadata**: Refactor `app/page.tsx` to be a Server Component. Extract the interactive demo trigger button/state into a standalone `components/magic-demo-trigger.tsx` Client Component. Export proper landing page metadata from the Server Component.

12. **P1-5 — Fix Contextual Mode Filtering**: In `app/[slug]/public-card-client.tsx`, fix `filteredLinks` to filter `card.socials` (not `card.social_links` which doesn't exist) by platform classification based on `active_mode`. Render `filteredLinks` in the JSX instead of unfiltered `card.socials`.

13. **P1-6 — Authenticate AI Endpoints**: Add `auth.getUser()` session checks to `app/api/ai/enhance-bio/route.ts` and `app/api/ai/extract-card/route.ts`. Cap bio/tagline/skills inputs to 500 chars before prompt interpolation.

14. **P1-7 — Remove Non-Functional Telegram Auth**: Replace the Telegram login button in `app/auth/page.tsx` with a disabled/coming-soon state (keep the UI slot but remove the broken bot redirect behavior) until proper Telegram Login Widget integration can be implemented.

15. **P1-8 — Fix Open Redirect in Auth Callback**: In `app/auth/callback/route.ts`, validate that the `next` parameter starts with `/` and does not start with `//` or contain backslashes before constructing the redirect URL.

### R3. Fix P2 Medium Issues & Surface Missing Schema Fields

16. **P2-1 — Sanitize RSC Public Payload**: In `app/[slug]/page.tsx`, replace `select("*")` with an explicit field list excluding `user_id`, `email_personal`, `phone_secondary`, `org_id`, and `geofence_locations` from the public RSC payload.

17. **P2-2 — Fix View Counter via RPC**: Create a PostgreSQL function `increment_card_views(p_slug text)` with `SECURITY DEFINER` and update `app/[slug]/page.tsx` to call `rpc("increment_card_views", { p_slug: slug })` instead of the blocked direct update.

18. **P2-3 — Add Missing Editor Form Fields**: In `app/dashboard/cards/[id]/edit/page.tsx`, add form inputs for `portfolio_url` (URL input), `office_address` (text input), `skills` (tag/comma-separated input), and `work_location` (dropdown: remote/hybrid/onsite). Render portfolio link and skills pills on the public card client.

19. **P2-4 — Add Avatar Upload UI**: Add a profile photo uploader in the card editor that uploads files to Supabase Storage at `avatars/${userId}/avatar.{ext}` path with proper path ownership. Use the existing `components/image-crop-modal.tsx` for cropping.

20. **P2-5 — Add Download Event Telemetry**: Create `app/api/events/route.ts` that accepts `{ cardId, eventType }` and increments the corresponding counter (`vcard_downloads_count`, `wallet_downloads_count`) using `SECURITY DEFINER` RPC or service role. Wire `handleDownloadVCard` in `public-card-client.tsx` to fire an async telemetry ping.

21. **P2-6 — Remove Render-Blocking Font Import**: Remove the Google Fonts `@import` from `app/globals.css`. All fonts should load exclusively via `next/font/google` in `app/layout.tsx`.

22. **P2-7 — Fix Bulk CSV Upload**: In `app/api/enterprise/bulk-upload/route.ts`, replace naive `.split(",")` CSV parsing with a proper parser (write a minimal RFC 4180-compliant parser inline or use a lightweight approach). Replace hardcoded `"Acme Corp"` with the organization's actual name from the database.

### R4. Fix P3 Low-Priority Issues

23. **P3-1 — Add HTTP Security Headers**: In `next.config.ts`, add a `headers()` function defining: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-XSS-Protection: 1; mode=block`, and a reasonable Content Security Policy that allows Supabase, Google APIs, and Next.js inline scripts.

24. **P3-2 — File Upload Size Limits**: In `app/api/ai/extract-card/route.ts` and `app/api/enterprise/bulk-upload/route.ts`, add a 5MB maximum file size check before `Buffer.from(await file.arrayBuffer())`.

25. **P3-3 — Fix Mobile Viewport Accessibility**: In `app/layout.tsx` viewport configuration, set `userScalable: true` and remove `maximumScale: 1` to comply with WCAG 2.1 Level AA.

26. **P3-4 — Fix PWA Icons**: Replace `public/icon-192.png` and `public/icon-512.png` placeholder stubs with valid, properly-sized PNG icons (192×192 and 512×512). Use the branding colors from `branding.json`.

### R5. Verification & Build Integrity

27. The codebase must successfully build with `npm run build` (which runs `next build --webpack`) without TypeScript errors or compilation failures after all changes.

28. All API routes must return appropriate HTTP status codes (401 for unauthenticated, 403 for unauthorized, 400 for bad input, 500 for server errors) with consistent `{ error: string }` JSON body shape.

29. Remove all `/* eslint-disable */` file-level suppressions that are masking real errors (but do not remove suppressions for legitimate unavoidable cases like third-party type conflicts). Fix the underlying issues instead.

---

## Acceptance Criteria

### Security — P0 Critical
- [ ] `POST /api/invite` returns 401 when called without authentication credentials
- [ ] `POST /api/invite` returns 403 when called by an authenticated non-admin user
- [ ] Anonymous visitor submitting contact info via ExchangeModal results in a record in `connections` table (verifiable via Supabase Studio or API)
- [ ] Anonymous visitor booking a meeting results in a record in `connections` table (not silently dropped)
- [ ] `GET /api/enterprise/members` returns only cards belonging to the authenticated user's organization, not all platform cards
- [ ] `app/api/ai/verify-identity` catch block no longer auto-approves verification on API error — returns an error response instead
- [ ] `app/api/wallet` rejects requests where `cardId` or `slug` parameter contains characters outside `[a-z0-9-_]` or UUID format
- [ ] `supabase/schema.sql` contains `ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY` and `ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY`

### Performance — P1
- [ ] `components/page-loader.tsx` is no longer mounted in `app/layout.tsx`, or the 1500ms setTimeout is removed
- [ ] `app/globals.css` does not contain any `@import url(...)` Google Fonts statements
- [ ] `app/[slug]/page.tsx` does not block SSR response on analytics write queries

### SEO & Social
- [ ] `generateMetadata` in `app/[slug]/page.tsx` includes `openGraph.images` with avatar URL, `twitter.card`, and `alternates.canonical`
- [ ] `app/page.tsx` is a Server Component (does not have `"use client"` at the top level) and exports `metadata`

### Feature Completeness
- [ ] Card editor in `app/dashboard/cards/[id]/edit/page.tsx` has form inputs for `portfolio_url`, `office_address`, `skills`, and `work_location`
- [ ] `filteredLinks` in `public-card-client.tsx` correctly filters `card.socials` (not `card.social_links`) based on `active_mode`
- [ ] `app/api/ai/enhance-bio/route.ts` returns 401 for unauthenticated requests
- [ ] Auth callback validates `next` parameter is a safe relative path

### Build & Code Quality
- [ ] `npm run build` completes without TypeScript compilation errors
- [ ] No file-level `/* eslint-disable */` suppressions that mask real bugs remain
- [ ] `next.config.ts` exports a `headers()` function with security headers
</USER_REQUEST>
