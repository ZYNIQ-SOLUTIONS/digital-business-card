# Original User Request

## Initial Request — 2026-08-30T04:34:23Z

Modernize and elevate the mobile responsive UI/UX across all non-landing product surfaces of the IZN Digital Business Card application (Public Card Profiles, User Dashboard ecosystem, Store & Checkout flow, Admin Portal, Auth & Support pages) to Apple Human Interface Guidelines and UI Craft production standards.

Working directory: /home/level-77/Desktop/digital_business_card
Integrity mode: demo

## Requirements

### R1. Public Digital Business Card Mobile Ergonomics (`/[slug]`, `components/public-card-client.tsx`)
- Enhance all 5 layout architectures (`classic-segmented`, `bento-grid`, `executive-minimal`, `cyber-holo`, `creative-hero`) for single-hand mobile viewport navigation.
- Implement Apple-style bottom action sheet modals (Exchange Contact, Share QR, Apple Wallet Pass push) with native haptic feel, swipe indicators, and zero text truncation issues.

### R2. User Dashboard & Card Studio Mobile Overhaul (`/dashboard`, `/dashboard/cards/*`, `/dashboard/connections`, `/dashboard/enterprise`)
- Add an Apple-style bottom tab bar / sticky floating control pill for mobile viewports (`min-h-[44px]` touch targets, frosted glass blur, safe-area inset padding).
- Optimize the card editor (`/dashboard/cards/[id]/edit`) on mobile: collapsible section accordions, responsive theme selector swatches, instant photo upload camera trigger, and a sliding live preview bottom sheet.

### R3. Hardware Store & Checkout Mobile Flow (`/store`, `/store/product/[id]`, `/store/checkout`, `/store/success`)
- Refine Store mobile layout into an Apple Store iOS app experience: crisp product cards, fluid category pills, sticky bottom "Add to Bag / Buy Now" bar with dual currency (AED/USD) and bilingual English/Arabic layout support.
- Streamline checkout on mobile with floating step progression, Apple Pay-ready button styling, and clean form inputs with native mobile keyboard types.

### R4. Admin Console & Auth Mobile Adaptation (`/admin/*`, `/auth`, `/support`, `/privacy`, `/terms`)
- Ensure administrative data tables, metric tiles, order dispatch filters, and product editing modals are horizontally scroll-safe and responsive on 360px–430px screens.
- Modernize Auth login/signup sheets and Support forms with Cupertino form styling, floating labels, and crisp validation states.

## Acceptance Criteria

### Mobile Responsiveness & Ergonomics
- [ ] Zero horizontal screen overflow or clipping on mobile viewports (360px - 430px).
- [ ] All interactive buttons, tabs, inputs, and toggles meet the minimum 44x44px touch target standard.
- [ ] Safe-area inset support (`pb-safe`, `pt-safe`) for iOS Safari / standalone PWA mobile viewports.

### Apple HIG & UI Craft Excellence
- [ ] Cupertino frosted glass materials (`backdrop-blur-xl`, `bg-white/80` or `bg-neutral-900/80`, hairline `border-black/[0.06]`).
- [ ] SF Pro typography scale with tight letter-spacing on headings and high contrast ratios for readability.
- [ ] Micro-interactions and drawer transitions under 200ms with natural spring curves.

### Quality & Functionality Verification
- [ ] `npm run build` compiles with 0 errors across all routes.
- [ ] All Supabase database mutations, cart operations, currency switching (AED/USD), and language switching (EN/AR) operate without regressions.

## Follow-up — 2026-09-04T12:34:31Z

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
