# Project: Digital Business Card Functional Audit, Bug Remediation & Playwright E2E Testing

## Architecture
The Digital Business Card platform (IZN) is a production Next.js 16 (App Router) + React 19 + TypeScript + Supabase + Tailwind CSS v4 SaaS platform for personal, professional, and enterprise digital identity.

Key Subsystems:
1. **Authentication & Session Routing (`app/auth/`, `proxy.ts`, `lib/supabase/`)**:
   - Next.js 16 `proxy.ts` request interceptor updating session cookies via `@supabase/ssr`.
   - Route protection for `/dashboard/*` redirecting to `/auth?redirect=...`.
   - Magic link, OAuth, enterprise invitation linking, and demo session bypass.
2. **Dashboard & Card Management (`app/dashboard/`, `components/dashboard/`)**:
   - Card listing, stats metrics, card status toggles, card duplication, soft-delete (trash) and restore/permanent delete.
   - URL-synchronized tab state (`?tab=trash`).
3. **Card Editor & Customization (`app/dashboard/cards/[id]/edit/`, `components/card-editor/`, `components/image-crop-modal.tsx`)**:
   - Profile identity, contact data, social links, skills tags, portfolio URL, complete office address (street, city, region, postal code, country).
   - Visual theme selector (11 themes) and layout template selector (11 layout templates).
   - Real-time live preview canvas rendering across all 11 templates with accurate fields (socials, skills, bio, portfolio).
   - Client-side image validation (5MB max) and crop modal uploading to Supabase Storage (`avatars/${userId}/...`).
   - Prominent error notifications and desktop/mobile save success feedback.
   - Icebreaker prompts persistence and autosave synchronization.
   - AI camera identity verification integration.
4. **Public Card & Lead Generation (`app/[slug]/`, `components/exchange-modal.tsx`, `components/booking-modal.tsx`)**:
   - Public column whitelisting, sensitive data stripping, and Schema.org `Person` JSON-LD SEO structured data.
   - Non-blocking view tracking with Next.js 16 `after()` calling `increment_card_views` RPC.
   - Contextual mode filtering (`work`, `social`, `all`) across all 4 public presentation templates, with query parameter fallback (`?mode=work`).
   - Contact exchange modal and calendar meeting booking calling PostgreSQL `SECURITY DEFINER` RPC `submit_public_lead` to guarantee zero RLS drops for anonymous visitors.
   - Client-side iCalendar `.ics` file generation and Google Calendar deep links.
5. **Apple / Google Wallet PassKit & Telemetry (`app/api/wallet/`, `app/api/events/`, `components/wallet-buttons.tsx`)**:
   - Parameter validation (UUID / slug regex) defending against PostgREST injection.
   - `passkit-generator` Apple Wallet `.pkpass` creation with 501 fallback when developer certificates are not provisioned.
   - Client-side fetch with binary download and non-blocking toast on 501, wired with `wallet_download` telemetry.
   - vCard (.vcf) export with `vcard_download` telemetry via service role admin client.
6. **Playwright E2E Testing Suite (`tests/e2e/`, `playwright.config.ts`)**:
   - Headless Chromium automated test suite covering all critical paths: public card rendering, modes filtering, lead capture, booking modal, wallet passes, vCard export, PIN protection, auth & dashboard navigation.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Proxy Route Protection & Callback Pass-through | Exclude /auth/callback from logged-in redirect loop in lib/supabase/middleware.ts | M1 | AUTH-02 |
| 2 | Dashboard Card Duplication | Implement duplicate card action in app/dashboard/page.tsx with unique slug generation | M1 | AUTH-03 |
| 3 | Dashboard Trash Tab URL Sync | Synchronize app/dashboard/page.tsx view state with URL ?tab=trash | M1 | AUTH-04 |
| 4 | Auth Guest Demo Mode | Provide demo session bypass on /auth when Supabase credentials are not set | M1 | AUTH-05 |
| 5 | Card Editor Error & Save Feedback | Render visible error banner for errorMsg; add desktop Save Changes visual confirmation | M1 | EDIT-01, 02 |
| 6 | Icebreaker Persistence Fix | Fix state overwrite in handleSave and initialize icebreakers in fetchCard | M1 | EDIT-03 |
| 7 | Live Preview Full Template Compatibility | Implement render blocks/fallbacks for all 11 templates in editor preview | M1 | EDIT-04 |
| 8 | Live Preview Fields Synchronization | Render socials, skills, bio, portfolio, and address in live preview canvas | M1 | EDIT-05 |
| 9 | AI Camera Verification UI Trigger | Wire interactive "Verify with AI Camera" trigger button to open VerifyModal | M1 | EDIT-06 |
| 10 | Cryptographic Identity State Restore | Restore hasWalletIdentity from data.crypto_identity in fetchCard | M1 | EDIT-07 |
| 11 | Complete Address & Booking Form Inputs | Add region/postalCode/country fields and sanitize booking_slot_duration input | M1 | EDIT-08, 09, 10 |
| 12 | Public Card URL Mode Query Fallback | Ensure ?mode=work/social filters links even when card.modes array is empty | M1 | PUB-01 |
| 13 | Wallet Buttons UX & Telemetry Polish | Client-side fetch with 501 notification; trigger wallet_download telemetry | M1 | PUB-02, 03 |
| 14 | Playwright Test Configuration & Scripts | Setup @playwright/test, playwright.config.ts, and test:e2e package script | M2 | R2, AUTH-01 |
| 15 | Public Card & Layouts E2E Spec | 01-public-card.spec.ts: test SSR card loading, JSON-LD, and layout tabs | M2 | R2 |
| 16 | Modes & Social Filtering E2E Spec | 02-modes-socials.spec.ts: test all vs work vs social link filtering | M2 | R2 |
| 17 | Lead Capture (ExchangeModal) E2E Spec | 03-lead-capture.spec.ts: test contact exchange submission & /api/connections | M2 | R2 |
| 18 | Booking Modal E2E Spec | 04-booking-modal.spec.ts: test meeting booking, slot picking & .ics generation | M2 | R2 |
| 19 | Wallet Pass & Injection Defense E2E Spec | 05-wallet-passes.spec.ts: test /api/wallet endpoints, injection defense & 501 fallback | M2 | R2 |
| 20 | vCard Export & Telemetry E2E Spec | 06-vcard-telemetry.spec.ts: test .vcf export and /api/events counters | M2 | R2 |
| 21 | PIN Protection E2E Spec | 07-pin-protection.spec.ts: test private card PIN lock & unlock flow | M2 | R2 |
| 22 | Auth & Dashboard Navigation E2E Spec | 08-auth-dashboard.spec.ts: test auth page, demo bypass, card listing & actions | M2 | R2 |
| 23 | E2E Execution & Verification Report | Execute full Playwright test suite, perform manual flow audit, generate report | M3 | AC |
| 24 | Forensic Integrity Audit & Final Gating | Independent auditor verification of genuine implementation, zero cheating | M4 | AC |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M0 | Comprehensive Flow Survey | 3 parallel survey explorers auditing Auth, Editor, Public Card & E2E infrastructure | none | DONE |
| M1 | Flow Remediation & UI Bug Fixes | Fix AUTH-02..05, EDIT-01..11, PUB-01..03 in middleware, dashboard, editor, public card | M0 | IN_PROGRESS |
| M2 | Playwright E2E Test Suite | Setup Playwright config, install browser, implement specs 01-08 | M0 | PLANNED |
| M3 | E2E Verification & Report Generation | Run Playwright test suite, review manual user journeys, write verification report | M1, M2 | PLANNED |
| M4 | Forensic Integrity Audit & Acceptance Gate | Forensic auditor verification, integrity check, orchestrator sign-off | M3 | PLANNED |

---

## Code Layout
```
/home/level-77/Desktop/digital_business_card/
├── app/
│   ├── [slug]/
│   │   ├── page.tsx                    # Public card server component (SSR whitelist, JSON-LD)
│   │   └── public-card-client.tsx      # Public card client (4 templates, mode filter, vCard)
│   ├── auth/
│   │   ├── page.tsx                    # Authentication page (magic link, OAuth, demo bypass)
│   │   └── callback/route.ts           # Auth callback & enterprise invitation linker
│   ├── dashboard/
│   │   ├── page.tsx                    # Dashboard home (card list, stats, duplicate, trash)
│   │   ├── layout.tsx                  # Dashboard layout & sidebar navigation
│   │   ├── cards/
│   │   │   ├── [id]/edit/page.tsx      # Card editor (forms, live preview, crop modal, AI)
│   │   │   ├── new/page.tsx            # New card creation
│   │   │   └── trash/page.tsx          # Trash redirect (?tab=trash)
│   │   └── onboarding/page.tsx         # New user onboarding wizard
│   ├── api/
│   │   ├── connections/route.ts        # Lead capture endpoint (submit_public_lead RPC)
│   │   ├── bookings/route.ts           # Meeting booking endpoint (submit_public_lead RPC)
│   │   ├── wallet/
│   │   │   ├── route.ts                # Parameterized wallet route (injection defense, 501 fallback)
│   │   │   └── apple/[slug]/route.ts   # Apple Wallet pass route
│   │   └── events/route.ts             # Telemetry tracking (vcard & wallet downloads)
│   └── layout.tsx                      # Root layout
├── components/
│   ├── exchange-modal.tsx              # Contact exchange modal
│   ├── booking-modal.tsx               # Meeting booking & iCal (.ics) modal
│   ├── wallet-buttons.tsx              # Apple/Google wallet buttons with feedback
│   ├── image-crop-modal.tsx            # Profile avatar crop modal
│   ├── ai-bio-modal.tsx                # AI bio enhancement modal
│   └── verify-modal.tsx                # AI identity camera verification modal
├── lib/
│   ├── supabase/
│   │   ├── middleware.ts               # Session update & route protection logic
│   │   ├── client.ts                   # Browser Supabase client
│   │   └── server.ts                   # Server Supabase client
│   └── templates.ts                    # Layout template definitions
├── tests/
│   └── e2e/
│       ├── fixtures/                   # Test fixtures & mock data
│       ├── 01-public-card.spec.ts
│       ├── 02-modes-socials.spec.ts
│       ├── 03-lead-capture.spec.ts
│       ├── 04-booking-modal.spec.ts
│       ├── 05-wallet-passes.spec.ts
│       ├── 06-vcard-telemetry.spec.ts
│       ├── 07-pin-protection.spec.ts
│       └── 08-auth-dashboard.spec.ts
├── playwright.config.ts                # Playwright configuration
├── proxy.ts                            # Next.js 16 proxy entry point
└── package.json                        # Dependencies & scripts
```
