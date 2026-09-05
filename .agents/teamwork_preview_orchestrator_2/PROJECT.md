# Project: IZN Digital Business Card Platform Hardening & Feature Completion

## Architecture
The IZN Digital Business Card platform is built on Next.js 16.3.3 App Router, Supabase (PostgreSQL 15, Auth, Storage, Row Level Security), Tailwind CSS v4, Google Gemini 2.5 Flash, and Apple Wallet PassKit.

Key architectural boundaries:
1. **Database & Storage Layer (`supabase/schema.sql`)**:
   - Multi-tenant enterprise schema (`organizations`, `organization_members`, `org_invitations`) with non-recursive `SECURITY DEFINER` RLS policies.
   - Core card entity (`cards`) with column protection triggers (`protect_verification_columns`) and public view counters.
   - Lead & meeting capture (`connections`) accessed via privileged `submit_public_lead(...)` RPC for unauthenticated public visitors.
   - Storage bucket (`avatars`) with path-restricted CRUD RLS policies `(storage.foldername(name))[1] = auth.uid()::text`.
2. **Backend Route Handlers (`app/api/*`)**:
   - Authentication & session boundary using `@supabase/ssr` (`createClient()` for user context, `createAdminClient()` strictly for authorized service-role operations).
   - Strict input validation (UUID/slug regex, 500-character prompt capping, 5MB upload size limits).
   - Uniform error response schema: `{ error: string }` with standardized HTTP status codes (400, 401, 403, 404, 500, 501).
3. **Frontend Application Shell & Public Surface (`app/*`, `components/*`)**:
   - Zero render-blocking overhead (removal of full-screen `PageLoader` overlay, non-blocking telemetry via Next.js 16 `after()`).
   - Server Component architecture on public surfaces (`app/[slug]/page.tsx`, `app/page.tsx`) with dynamic SEO metadata, OpenGraph images, and Schema.org `Person` JSON-LD.
   - Contextual public card viewing (`public-card-client.tsx`) filtering socials by `active_mode` across all 4 visual templates.
   - Card editor (`app/dashboard/cards/[id]/edit/page.tsx`) exposing complete schema controls (`portfolio_url`, `office_address`, `skills`, `work_location`, avatar upload & crop).

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | P0-1 Admin Invite Auth & RBAC | Add session check and org admin verification in `app/api/invite/route.ts` | M2 | R1 |
| 2 | P0-2 Enterprise Table RLS | Non-recursive RLS on `organizations` and `organization_members` via helper functions | M1 | R1 |
| 3 | P0-3 Public Lead Capture RPC | Create `submit_public_lead` RPC and wire `/api/connections` & `/api/bookings` | M1, M2 | R1 |
| 4 | P0-4 Multi-Tenant Directory Scoping | Scope `GET /api/enterprise/members` to `membership.org_id` and attach `org_id` on card creation | M2 | R1 |
| 5 | P0-5 Storage Bucket RLS Hardening | Enforce path ownership across INSERT, UPDATE, DELETE on `avatars` bucket | M1 | R1 |
| 6 | P0-6 Verification Tamper Protection | Fail-closed error handling in `verify-modal.tsx` and `protect_verification_columns` trigger | M1, M2 | R1 |
| 7 | P0-7 Wallet Route Injection Defense | Regex validation for slug/UUID and parameterized `.eq()` queries in `/api/wallet` | M2 | R1 |
| 8 | P1-1 Enterprise Onboarding Loop | `org_invitations` table and automatic card claiming in `/auth/callback` | M1, M3 | R2 |
| 9 | P1-2 LCP Performance Optimization | Unmount `PageLoader` from `layout.tsx` and move view logging to `after()` | M3 | R2 |
| 10 | P1-3 Public Card Social & Schema.org | Dynamic OpenGraph, `summary_large_image`, and Schema.org `Person` JSON-LD | M4 | R2 |
| 11 | P1-4 Landing Page Server Component | Refactor `app/page.tsx` to RSC, extract `magic-demo-trigger.tsx`, export metadata | M3 | R2 |
| 12 | P1-5 Contextual Mode Social Filtering | Filter `card.socials` by `active_mode` in all 4 layout templates in `public-card-client.tsx` | M4 | R2 |
| 13 | P1-6 AI Endpoint Auth & Input Capping | Add `auth.getUser()` and 500-char capping to `/api/ai/enhance-bio` and `/api/ai/extract-card` | M2 | R2 |
| 14 | P1-7 Disabled Telegram Auth State | Display disabled Telegram login button with "Coming Soon" badge in `app/auth/page.tsx` | M3 | R2 |
| 15 | P1-8 Auth Callback Open Redirect Defense | Sanitize `next` redirect target to strictly relative local URL | M3 | R2 |
| 16 | P2-1 RSC Public Payload Sanitization | Whitelist public columns in `app/[slug]/page.tsx` excluding private user/org data | M4 | R3 |
| 17 | P2-2 View Counter RPC | `increment_card_views(p_slug text)` `SECURITY DEFINER` function and `after()` invocation | M1, M4 | R3 |
| 18 | P2-3 Editor Missing Schema Fields | Form controls for `portfolio_url`, `office_address`, `skills`, `work_location` and public display | M5 | R3 |
| 19 | P2-4 Avatar Upload & Cropping UI | Profile photo upload to `avatars/${userId}/avatar.{ext}` with `completedCrop` fallback | M5 | R3 |
| 20 | P2-5 Download Event Telemetry | Create `app/api/events/route.ts` and wire `handleDownloadVCard` telemetry ping | M4 | R3 |
| 21 | P2-6 Font Import Cleanup | Verify elimination of render-blocking `@import url(...)` Google Fonts | M3 | R3 |
| 22 | P2-7 Bulk CSV Upload Parser & Org Name | RFC 4180 CSV parser and dynamic organization name lookup in `bulk-upload` route | M5 | R3 |
| 23 | P3-1 HTTP Security Headers | Add CSP, X-Frame-Options, Referrer-Policy headers in `next.config.ts` | M5 | R4 |
| 24 | P3-2 Upload 5MB File Limits | Add 5MB size limit checks in `/api/ai/extract-card` and `/api/enterprise/bulk-upload` | M5 | R4 |
| 25 | P3-3 Mobile Viewport Accessibility | Set `userScalable: true` and remove `maximumScale: 1` in `app/layout.tsx` | M3 | R4 |
| 26 | P3-4 Valid Branding PWA Icons | Generate compliant 192x192 and 512x512 PNG icons using `branding.json` colors | M5 | R4 |
| 27 | R5-1 Standardized Error Contract | Enforce `{ error: string }` response body shape across all API route handlers | M6 | R5 |
| 28 | R5-2 ESLint Suppressions Cleanup | Audit and remove unjustified `/* eslint-disable */` file headers | M6 | R5 |
| 29 | R5-3 Clean Production Build | Verify zero TypeScript compiler errors on `npm run build` | M6 | R5 |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Database Foundation & Security DDL | `supabase/schema.sql` (P0-2, P0-3, P0-5, P0-6 trigger, P2-2 RPC, P1-1 org_invitations) | none | DONE |
| M2 | Security Route Handlers & Gating | `app/api/invite`, `app/api/connections`, `app/api/bookings`, `app/api/enterprise/members`, `app/api/ai/verify-identity`, `components/verify-modal.tsx`, `app/api/wallet`, `app/api/ai/enhance-bio`, `app/api/ai/extract-card` | M1 | DONE |
| M3 | Auth, Onboarding Loop & Shell Performance | `app/auth/callback`, `app/auth/page.tsx`, `app/layout.tsx`, `app/page.tsx`, `components/magic-demo-trigger.tsx` | M1, M2 | DONE |
| M4 | Public Card, Social SEO & Telemetry | `app/[slug]/page.tsx`, `app/[slug]/public-card-client.tsx`, `app/api/events/route.ts` | M1, M2 | DONE |
| M5 | Editor Form Fields, Media, Bulk Upload & P3 | `app/dashboard/cards/[id]/edit/page.tsx`, `components/image-crop-modal.tsx`, `app/api/enterprise/bulk-upload/route.ts`, `next.config.ts`, PWA icons | M1, M4 | DONE |
| M6 | Verification, ESLint Cleanup & Integrity Gate | Full `npm run build`, error shape harmonization, Reviewer, Challenger & Forensic Auditor | M1-M5 | IN_PROGRESS |

---

## Interface Contracts

### `submit_public_lead(p_card_id uuid, p_name text, p_email text, p_phone text, p_company text, p_job_title text, p_notes text, p_lead_type text, p_location text)`
- **Returns**: `jsonb` `{ "success": true, "connection_id": "<uuid>" }`
- **Behavior**: Verifies `p_card_id` belongs to a published card, executes `INSERT INTO public.connections` with `SECURITY DEFINER` bypassing RLS.

### `increment_card_views(p_slug text)`
- **Returns**: `void`
- **Behavior**: Increments `cards.views_count` for matching published slug, logs entry into `card_events` table under `SECURITY DEFINER`.

### `app/api/events/route.ts`
- **Method**: `POST`
- **Body**: `{ cardId: string, eventType: "vcard_download" | "wallet_download" }`
- **Response**: `{ success: true }` (200) or `{ error: string }` (400/404/500).

---

## Code Layout
- `supabase/schema.sql` — Authoritative database schema, RLS policies, helper functions, triggers.
- `app/api/*` — Next.js 16 App Router route handlers.
- `app/[slug]/*` — Public card Server Component and interactive client.
- `app/auth/*` — Authentication views and PKCE callback exchange.
- `app/dashboard/*` — Protected card management and enterprise portals.
- `components/*` — Shared and modal UI components.
- `public/*` — Static branding assets and PWA icons.
- `next.config.ts` — Framework configuration and HTTP security headers.
