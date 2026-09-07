# Explorer 3 Audit & Handoff Report: Public Card Flow, Wallet PassKit, Lead Capture & Playwright E2E Testing Suite

**Working Directory**: `/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_audit_card_wallet_1`  
**Target Project Workspace**: `/home/level-77/Desktop/digital_business_card`  
**Date**: 2026-09-07T11:20:00Z  
**Role**: Explorer 3 (Public Card, Wallet PassKit, Lead Capture & E2E Testing Auditor)

---

## 1. Observation

### 1.1 Public Card Architecture & Rendering
- **Server Entry Point (`app/[slug]/page.tsx`)**:
  - Unwraps route params via `await params` (lines 13, 196) conforming to Next.js 15+ / 16 dynamic API conventions.
  - Implements an explicit public column whitelist (`PUBLIC_CARD_COLUMNS`, lines 69-133), omitting sensitive fields (`user_id`, `email_personal`, `phone_secondary`, `org_id`, `geofence_locations`) from database queries.
  - Features a schema compatibility fallback (`VERIFIED_BASE_COLUMNS`, lines 136-193): if Postgres returns `42703` (undefined column), it retries with the verified base columns.
  - Implements defense-in-depth deletion of sensitive keys (`delete card.user_id`, lines 231-237) before passing `card` to the client.
  - Asynchronous non-blocking view counter increment using Next.js 16 `after()` (lines 274-282):
    ```ts
    after(async () => {
      try {
        const client = await createClient();
        await client.rpc("increment_card_views", { p_slug: slug });
      } catch (err) {
        console.error("Non-blocking increment_card_views RPC error:", err);
      }
    });
    ```
  - Injects Schema.org `Person` JSON-LD structured data (lines 285-340) for SEO indexing.
  - If card lookup fails: when `NEXT_PUBLIC_SUPABASE_URL` is undefined or contains `"placeholder"`, it returns `<PublicCardClient initialCard={null} slug={slug} fallbackMode={true} />` (lines 224-226); otherwise calls `notFound()` (line 227).

- **Client Presentation (`app/[slug]/public-card-client.tsx`)**:
  - Provides a built-in demo fallback card (lines 187-224) if `initialCard` is null.
  - Enforces private profile protection (lines 268-270, 488-531): if `card.is_private === true`, renders a PIN lock screen checking `enteredPin === card.pin_code`.
  - Supports 4 visual layout templates:
    1. `classic-segmented` (lines 550–950): Segmented tab navigation (`card`, `about`, `contact`, `nfc`).
    2. `modern-fluid` (lines 950–1230): Bento grid with hero card, live QR code container, action strip, bio/skills matrix, and direct connect grid.
    3. `minimal-executive` (lines 1230–1460): Cyberpunk-influenced terminal styling with encrypted protocol QR matrix and action stream.
    4. `holographic-cyber` (lines 1460–1930): High-contrast brutalist layout with bold borders and chunky action tiles.

### 1.2 Contextual Modes Switching & Link Filtering
- **Platform Classification**:
  - `WORK_PLATFORMS` (`public-card-client.tsx:145-159`): `Set(["linkedin", "github", "email", "phone", "x", "twitter", "calendar", "calendly", "slack", "medium", "substack", "behance", "dribbble"])`.
  - `SOCIAL_PLATFORMS` (`public-card-client.tsx:161-176`): `Set(["instagram", "tiktok", "youtube", "spotify", "snapchat", "twitch", "discord", "telegram", "whatsapp", "facebook", "threads", "pinterest", "reddit", "signal"])`.
- **Filtering Implementation**:
  - Derives `filteredLinks` with `React.useMemo` (lines 316-350) based on `(card?.active_mode || "all").toLowerCase()`:
    - `"all"` or `"default"`: returns all active links.
    - `"work"`: filters by `WORK_PLATFORMS` or categories `professional`, `work`, `code & dev`, `booking`.
    - `"social"`: filters by `SOCIAL_PLATFORMS` or categories `social`, `personal`, `direct chat`, `media & content`.
  - In `public-card-client.tsx`, `filteredLinks` is rendered in all 4 layout templates:
    - `classic-segmented`: line 673 (`{filteredLinks.map((social: any) => ...)}`).
    - `modern-fluid`: line 1069 (`{filteredLinks.map((social: any) => ...)}`).
    - `minimal-executive`: line 1400 (`{filteredLinks.map((social: any) => ...)}`).
    - `holographic-cyber`: line 1545 (`{filteredLinks.map((social: any) => ...)}`).
- **Mode Control & URL Query Handling**:
  - `const modeId = searchParams?.get("mode");` (line 186).
  - Lines 226-231 inspect `card.modes`:
    ```ts
    if (modeId && card.modes && Array.isArray(card.modes)) {
      const activeMode = card.modes.find((m: any) => m.id === modeId && m.active);
      if (activeMode && activeMode.profileOverrides) {
        Object.assign(card, activeMode.profileOverrides);
      }
    }
    ```
  - **Observation on URL Parameter**: If a visitor passes `?mode=work` or `?mode=social` when `card.modes` array is empty or undefined, `card.active_mode` remains unchanged because line 318 references only `card?.active_mode`, without falling back to `modeId`.

### 1.3 Lead Capture (Contact Exchange & Meeting Booking)
- **Contact Exchange Modal (`components/exchange-modal.tsx`)**:
  - Rendered at `public-card-client.tsx:1985-1990`, triggered by floating speed dial FAB (lines 1944, 1956).
  - Offers two modes: AI Business Card Scanner via file upload (`POST /api/ai/extract-card`) or Manual Entry form.
  - Manual form collects: Full Name (required), Email (required), Phone (with international `PhoneInput`), Company, Title, and Privacy Agreement checkbox (required).
  - Optional Cloudflare Turnstile CAPTCHA (lines 123-127): renders `<Turnstile>` if `process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY` exists.
  - Form submission dispatches `POST /api/connections` with `{ name, email, phone, company, title, cardId, cfToken }`.
  - On 200 response, transitions to `"success"` mode ("Sent! Your info has been shared securely.").
- **Public Lead Backend Handler (`app/api/connections/route.ts`)**:
  - Edge rate limiting (lines 56-80) via Upstash Redis (10 requests/60s).
  - Cloudflare Turnstile verification (lines 81-87, `verifyTurnstileToken`): bypassed cleanly if `TURNSTILE_SECRET_KEY` is not set in environment.
  - Resolves card owner via Supabase query (lines 118-129).
  - Routes public visitors (`if (cardId && (!user || user.id !== ownerId))`, line 132) to `submit_public_lead` PostgreSQL `SECURITY DEFINER` RPC (lines 133-143).
  - Propagates database RPC errors with HTTP 500 `{ error: rpcError.message }`.
  - Dispatches CRM webhook (`triggerCrmWebhook`, lines 8-33) if organization CRM webhook is configured.
- **Meeting Booking Modal (`components/booking-modal.tsx`)**:
  - Triggered by "Book Meeting" / "Schedule Meeting" buttons across all templates (e.g. `public-card-client.tsx:653, 896, 996, 1192, 1380, 1529`).
  - Generates selectable dates (next 21 days filtered by `card.booking_days`, lines 65-88).
  - Generates time slots matching `card.booking_start_time` to `booking_end_time` in increments of `booking_slot_duration` (lines 98-115).
  - Collects: Selected Date, Selected Time, Visitor Name (required), Visitor Email (required), Visitor Phone, and Meeting Notes.
  - Form submission calls `POST /api/bookings`.
  - Displays confirmation screen with:
    - Google Calendar link (`handleGoogleCalendar`, lines 204-217).
    - Client-side iCalendar `.ics` file generation and download (`handleDownloadIcs`, lines 162-202).
- **Meeting Booking Backend Handler (`app/api/bookings/route.ts`)**:
  - Validates `cardId, name, email, meetingDate, meetingTime` (lines 25-30). Returns HTTP 400 if missing.
  - Queries `cards` for `id, user_id, full_name, email_work, is_published` (lines 35-39). Returns HTTP 404 if not found or `is_published === false` (lines 41-46).
  - Dispatches `submit_public_lead` RPC (lines 49-62) with `p_lead_type: "meeting"`, `p_location: "Digital Calendar Booking"`, `p_meeting_date`, and `p_meeting_time`.
  - Returns HTTP 500 on RPC failure (never silently swallowed, lines 64-70).
  - Returns HTTP 200 `{ success: true, booking: { ... } }`.

### 1.4 Wallet Pass Generation & Download
- **Apple Wallet Route (`app/api/wallet/apple/[slug]/route.ts`)**:
  - Queries published card by `slug`. Returns 404 if missing.
  - Uses `passkit-generator` (`PKPass`) with primary/secondary/back fields, QR barcode (`PKBarcodeFormatQR`), and NFC payload.
  - Certificate handling: if certificates are missing or unconfigured, catches error and returns HTTP 501 `{ error: "Apple Developer certificates not configured" }` (lines 81-89).
  - When certificates are provisioned, streams signed `.pkpass` binary with `Content-Type: application/vnd.apple.pkpass`.
- **Alternative Parameterized Wallet Route (`app/api/wallet/route.ts`)**:
  - Accepts `GET /api/wallet?cardId=<id>` or `GET /api/wallet?slug=<slug>`.
  - Implements strict regex sanitization: UUID regex or `^[a-z0-9-_]{1,100}$` (lines 27-40). Rejects malicious injection characters with HTTP 400 `{ error: "Invalid cardId or slug parameter" }`.
  - Uses separate parameterized `.eq()` queries (lines 57-69).
  - Validates certificates in `./certificates/` (`wwdr.pem`, `signerCert.pem`, `signerKey.pem`). Returns HTTP 501 if missing (lines 104-111).
- **Google Wallet Route (`app/api/wallet/google/[slug]/route.ts`)**:
  - Returns HTTP 501 `{ error: "Google Wallet credentials not configured" }` if `GOOGLE_WALLET_ISSUER_ID` is absent (lines 23-28).
  - Redirects to Google Pay save JWT URL when configured.
- **Client Wallet Buttons (`components/wallet-buttons.tsx`)**:
  - Rendered at `public-card-client.tsx:1966`.
  - Currently executes direct browser navigation via `window.location.href`:
    - `window.location.href = /api/wallet/apple/${slug}` (line 20)
    - `window.location.href = /api/wallet/google/${slug}` (line 22)
  - **UX Observation**: Because production Apple certificates are absent, clicking "Apple Wallet" navigates the browser away from the business card to the API endpoint URL, displaying raw JSON text `{ "error": "Apple Developer certificates not configured" }` on a blank page.

### 1.5 QR Code Display, vCard (.vcf) & Telemetry
- **QR Code Display**:
  - Dynamic QR code rendered inline via `QRCodeSVG` (`qrcode.react`) in all layout templates (e.g. `public-card-client.tsx:700, 1008, 1284`).
  - Encodes the canonical card URL: `${window.location.origin}/${card.slug}` with error correction level `"Q"`.
- **vCard (.vcf) Download (`public-card-client.tsx:366-424`)**:
  - Triggered by "Save Contact to Device (.vcf)" / "Save Contact (.vcf)" buttons across all templates.
  - Fetches and base64-encodes avatar if available (`PHOTO;ENCODING=b;TYPE=JPEG:${b64}`).
  - Generates RFC 3.0 vCard with `FN`, `ORG`, `TITLE`, `TEL`, `EMAIL`, `URL`, `ADR`, and `X-SOCIALPROFILE` entries.
  - Creates Blob (`text/vcard;charset=utf-8`), invokes simulated anchor click for `${sanitizedName}.vcf`, and provides visual feedback ("Contact Card Saved (.vcf)") for 3.5s.
- **Event Telemetry (`app/api/events/route.ts` & `public-card-client.tsx:351-364`)**:
  - `sendDownloadTelemetry("vcard_download")` validates that `card.id` is a valid UUID regex prior to firing `POST /api/events`.
  - `POST /api/events` validates UUID and `eventType` (`vcard_download` | `wallet_download`).
  - Uses `createAdminClient()` (Service Role) to bypass RLS, atomically increments `cards.vcard_downloads_count` (or `wallet_downloads_count`), and inserts an audit record into `card_events`.
  - **Observation on Wallet Telemetry**: `sendDownloadTelemetry("wallet_download")` is never invoked anywhere in `public-card-client.tsx` or `wallet-buttons.tsx`.

### 1.6 Testing Infrastructure & Playwright Readiness
- **Current `package.json`**:
  - Does NOT have `@playwright/test` in `dependencies` or `devDependencies`.
  - Has `scripts`: `"dev"`, `"build"`, `"start"`, `"lint"`.
  - Missing E2E test scripts (e.g. `"test:e2e": "playwright test"`).
- **Filesystem & Configs**:
  - No `playwright.config.ts` exists in the repository.
  - No E2E test specs exist under `tests/` (only legacy unit tests exist in `zavatar/`).
  - System has `/snap/bin/chromium` installed, but `~/.cache/ms-playwright` does not yet contain downloaded Playwright browser packages.

---

## 2. Logic Chain

1. **Public Card Stability & Data Integrity**:
   - Observations in 1.1 show that `app/[slug]/page.tsx` strictly queries whitelisted columns and strips sensitive fields, preventing sensitive data leakage to anonymous clients.
   - Non-blocking view tracking with `after()` prevents slow database RPCs from degrading SSR latency or blocking initial HTML delivery.
   - The fallback mode (`initialCard = null`, `fallbackMode = true`) enables development and preview rendering even when Supabase environment variables are missing or unprovisioned.

2. **Contextual Mode Filtering**:
   - Observations in 1.2 demonstrate that `filteredLinks` correctly checks `card.active_mode`. When `active_mode` is set to `"work"`, only professional links (LinkedIn, GitHub, Calendly, etc.) are rendered; when set to `"social"`, personal links (Instagram, TikTok, WhatsApp, etc.) are rendered.
   - Because all four layout templates map `filteredLinks` instead of unfiltered `card.socials`, mode filtering is consistent across all presentation layouts.
   - However, if a visitor navigates with `?mode=work` or `?mode=social` on a card that lacks a configured `modes` override array, the query parameter is not honored by `filteredLinks`. Adding `const mode = (modeId || card?.active_mode || "all").toLowerCase()` would ensure direct URL query mode previewing functions universally.

3. **Lead Capture & Booking Reliability**:
   - Observations in 1.3 show that both `ExchangeModal` and `BookingModal` route through `POST /api/connections` and `POST /api/bookings`.
   - Both endpoints resolve the card owner and invoke the PostgreSQL `submit_public_lead` `SECURITY DEFINER` function whenever the caller is an anonymous visitor or a user other than the owner.
   - This eliminates the historic RLS 42501 permission error where public visitors had their leads dropped.
   - Furthermore, `POST /api/bookings` checks `card.is_published: true` and explicitly returns HTTP 500 when RPC errors occur, guaranteeing that bookings are never falsely confirmed when unrecorded.

4. **Wallet Pass Lifecycle & Fallbacks**:
   - Observations in 1.4 show that PassKit generation in `app/api/wallet/apple/[slug]/route.ts` and `app/api/wallet/route.ts` is fully implemented with `passkit-generator`.
   - In environments without Apple Developer signing certificates (`wwdr.pem`, `signerCert.pem`, `signerKey.pem`), both endpoints return HTTP 501.
   - In `components/wallet-buttons.tsx`, direct assignment of `window.location.href` to `/api/wallet/apple/[slug]` causes the browser to navigate away from the card and render raw JSON. Transitioning `WalletButtons` to client-side `fetch()` with blob download on 200 and a friendly toast/modal on 501 provides a cleaner user experience.

5. **Telemetry Completeness**:
   - Observations in 1.5 show that `POST /api/events` atomically updates `vcard_downloads_count` and `wallet_downloads_count` and records events into `card_events`.
   - While `handleDownloadVCard` correctly triggers `vcard_download` telemetry, `wallet_download` telemetry is currently uninvoked because `WalletButtons` navigates directly via `window.location.href`.

6. **E2E Automation Requirements**:
   - Observations in 1.6 confirm that Playwright is not yet installed. To achieve production acceptance criteria:
     - `@playwright/test` must be installed.
     - `playwright.config.ts` must be created with webServer support (`http://localhost:3000`).
     - A modular E2E suite covering all 7 critical paths must be authored.

---

## 3. Caveats

1. **Apple Developer Certificates**:
   - Real `.pkpass` cryptographic signing requires Apple Developer Program certificates (`pass.com.zyniq.digitalcard` Pass Type ID certificate, WWDR intermediate certificate, and private key). In development/staging without real Apple certificates, the API endpoints legitimately return HTTP 501. E2E tests must verify this HTTP 501 response code and error payload structure as the expected contractual behavior.
2. **Turnstile CAPTCHA in E2E Testing**:
   - In environments where `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` are unset, CAPTCHA verification is bypassed automatically. If Turnstile keys are provided in testing, Cloudflare's official dummy test keys (`1x00000000000000000000AA` / `1x0000000000000000000000000000000AA`) must be used to avoid bot blocking.
3. **Database Dependency in Public Card SSR**:
   - If Supabase environment variables are missing, `app/[slug]/page.tsx` falls back to `fallbackMode={true}` with the default Ibrahim El Khalil demo card. If Supabase keys are active, test cards must exist in the database with `is_published = true` or routes must be mocked via Playwright `page.route()`.

---

## 4. Conclusion & Actionable Assessment

The core public card flows, modes filtering, lead capture RPCs, wallet pass generation, and vCard export are functionally intact and securely designed. Specifically:
- **Public Card Flow**: Whitelisted columns, sensitive data stripping, non-blocking `after()` view counter, and 4 layout templates operate properly.
- **Modes Filtering**: `filteredLinks` successfully filters `card.socials` across all 4 templates according to `active_mode`.
- **Lead Capture & Booking**: `POST /api/connections` and `POST /api/bookings` invoke `submit_public_lead` `SECURITY DEFINER` RPC, preventing RLS drops for anonymous visitors.
- **Wallet Pass Generation**: Strict UUID/slug parameter sanitization prevents PostgREST injection; returns HTTP 501 when certificates are unconfigured and streams valid `.pkpass` when present.
- **Telemetry**: `POST /api/events` validates UUIDs and increments counters using `createAdminClient()`.

### Recommended Minor UX / Resilience Polish
1. **Wallet Download Telemetry**: In `components/wallet-buttons.tsx`, invoke `/api/events` with `eventType: "wallet_download"` when the user initiates pass generation.
2. **Wallet Button Fallback UX**: In `components/wallet-buttons.tsx`, replace raw `window.location.href` navigation with `fetch()`. If status is 200, trigger `.pkpass` blob download; if status is 501, display a non-blocking toast/notice rather than navigating the browser to raw JSON.
3. **URL Mode Query Fallback**: In `app/[slug]/public-card-client.tsx:318`, use `const mode = (modeId || card?.active_mode || "all").toLowerCase();` so visiting `/[slug]?mode=work` immediately filters links even if `card.modes` array is empty.

---

## 5. Playwright E2E Test Suite Architecture & Implementation Plan

### 5.1 Package Setup & Configuration
To run headless E2E tests against Next.js:
1. **Install devDependencies**:
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install chromium
   ```
2. **Add test scripts to `package.json`**:
   ```json
   "scripts": {
     "test:e2e": "playwright test",
     "test:e2e:ui": "playwright test --ui",
     "test:e2e:headed": "playwright test --headed"
   }
   ```
3. **Create `playwright.config.ts` in repository root**:
   ```ts
   import { defineConfig, devices } from "@playwright/test";

   export default defineConfig({
     testDir: "./tests/e2e",
     timeout: 30000,
     expect: { timeout: 5000 },
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: [["list"], ["html", { open: "never" }]],
     use: {
       baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
       trace: "on-first-retry",
       screenshot: "only-on-failure",
       video: "retain-on-failure",
       headless: true,
     },
     projects: [
       {
         name: "chromium",
         use: { ...devices["Desktop Chrome"] },
       },
       {
         name: "mobile-safari",
         use: { ...devices["iPhone 14"] },
       },
     ],
     webServer: {
       command: "npm run start || npm run dev",
       url: "http://localhost:3000",
       reuseExistingServer: !process.env.CI,
       timeout: 120000,
     },
   });
   ```

### 5.2 Test Specifications Structure (`tests/e2e/`)

```
tests/e2e/
├── fixtures/
│   ├── mock-card.ts             # Deterministic mock card payload (modes, socials, booking)
│   └── test-helpers.ts          # Mock route handlers and setup utilities
├── 01-public-card.spec.ts       # SSR card rendering, Schema.org JSON-LD, template layouts
├── 02-modes-socials.spec.ts     # Contextual mode filtering (all vs work vs social)
├── 03-lead-capture.spec.ts      # ExchangeModal, form inputs, /api/connections API
├── 04-booking-modal.spec.ts     # BookingModal, date/time slot selection, .ics download
├── 05-wallet-passes.spec.ts     # Apple/Google wallet endpoints, injection defense, 501 fallbacks
├── 06-vcard-telemetry.spec.ts   # vCard .vcf export, download triggers, /api/events tracking
└── 07-pin-protection.spec.ts   # Private card PIN challenge, unlock state
```

### 5.3 Detailed Test Matrix & Critical Paths

| Test File | Target Route / Component | Test Case | Expected Behavior |
|---|---|---|---|
| `01-public-card.spec.ts` | `/[slug]` | Anonymous visitor loads card | Status 200; avatar, name, title, company, bio rendered; Schema.org `<script type="application/ld+json">` present with valid Person data. |
| `01-public-card.spec.ts` | `/[slug]` | Segmented tabs interaction (`classic-segmented`) | Clicking "About", "Contact", "NFC" switches visible panels without page reload. |
| `02-modes-socials.spec.ts` | `/[slug]` (All Mode) | Card in default/all mode | All active socials (LinkedIn, GitHub, Instagram, WhatsApp) rendered. |
| `02-modes-socials.spec.ts` | `/[slug]?mode=work` | Card in work mode | Only professional platforms (`WORK_PLATFORMS`) visible; personal links omitted. |
| `02-modes-socials.spec.ts` | `/[slug]?mode=social` | Card in social mode | Only social/media platforms (`SOCIAL_PLATFORMS`) visible; code/work links omitted. |
| `03-lead-capture.spec.ts` | Speed Dial -> `ExchangeModal` | Expand FAB & open modal | Clicking "+" expands speed dial; "Exchange Contact" opens modal; "Enter Manually" shows form. |
| `03-lead-capture.spec.ts` | `ExchangeModal` | Submit contact form | Submitting name, email, phone, company dispatches `POST /api/connections`; modal shows "Sent! Your info has been shared securely." |
| `03-lead-capture.spec.ts` | `POST /api/connections` | API validation contract | Request with missing name returns HTTP 400; valid payload returns `{ success: true }`. |
| `04-booking-modal.spec.ts` | `BookingModal` | Select date & time slot | Clicking date pill updates date; selecting time slot highlights button. |
| `04-booking-modal.spec.ts` | `BookingModal` | Schedule meeting | Submitting visitor details calls `POST /api/bookings`; confirms with date/time summary; Google Calendar and .ics download buttons appear. |
| `04-booking-modal.spec.ts` | `POST /api/bookings` | Booking API contract | Missing fields returns 400; non-existent/unpublished card returns 404; unpublished card rejects booking. |
| `05-wallet-passes.spec.ts` | `GET /api/wallet/apple/[slug]` | Apple Wallet pass request | Non-existent slug returns 404; valid slug without certs returns 501 `{ error: "Apple Developer certificates not configured" }`. |
| `05-wallet-passes.spec.ts` | `GET /api/wallet` | SQL/PostgREST injection defense | `?cardId=invalid,id.neq.0` and `?slug=bad'val` return HTTP 400 `{ error: "Invalid cardId or slug parameter" }`. |
| `05-wallet-passes.spec.ts` | `GET /api/wallet/google/[slug]`| Google Wallet request | Missing `GOOGLE_WALLET_ISSUER_ID` returns 501 `{ error: "Google Wallet credentials not configured" }`. |
| `06-vcard-telemetry.spec.ts`| `handleDownloadVCard` | Save contact to device | Clicking "Save Contact (.vcf)" creates `.vcf` download with valid `BEGIN:VCARD` ... `END:VCARD`; button updates to "Contact Card Saved (.vcf)". |
| `06-vcard-telemetry.spec.ts`| `POST /api/events` | Telemetry endpoint validation | Invalid UUID returns 400; non-allowed eventType returns 400; valid UUID and eventType increments counter. |
| `07-pin-protection.spec.ts` | `/[slug]` (Private card) | PIN protection & unlock | Unlocking requires 4-digit PIN; incorrect PIN shows "Incorrect PIN"; correct PIN reveals card. |

---

## 6. Verification Method

To independently verify all findings and test suite readiness:

1. **Verify Public Card Column Whitelist & Sanitization**:
   ```bash
   grep -n -E "PUBLIC_CARD_COLUMNS|delete card\." /home/level-77/Desktop/digital_business_card/app/[slug]/page.tsx
   ```
2. **Verify Contextual Mode Filtering Across All Templates**:
   ```bash
   grep -n "filteredLinks" /home/level-77/Desktop/digital_business_card/app/[slug]/public-card-client.tsx
   ```
3. **Verify Public Lead Capture and Booking Routes**:
   ```bash
   grep -n "submit_public_lead" /home/level-77/Desktop/digital_business_card/app/api/connections/route.ts /home/level-77/Desktop/digital_business_card/app/api/bookings/route.ts
   ```
4. **Verify Wallet Injection Defense & Fallbacks**:
   ```bash
   grep -n -E "UUID_REGEX|SLUG_REGEX|hasCertificates" /home/level-77/Desktop/digital_business_card/app/api/wallet/route.ts
   ```
5. **Verify Telemetry Counter Route**:
   ```bash
   grep -n -E "vcard_downloads_count|wallet_downloads_count" /home/level-77/Desktop/digital_business_card/app/api/events/route.ts
   ```
6. **Execution of Playwright Test Suite Once Installed**:
   ```bash
   npm run test:e2e
   ```
   *Expected condition*: All test specifications in `tests/e2e/*.spec.ts` execute headlessly and exit code 0.
