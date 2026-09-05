# Technical Survey Report: R3 (P2 Medium Issues), R4 (P3 Low Priority), & R5 (Build Integrity)

**Author**: `teamwork_preview_explorer_survey_p2p3_1`  
**Working Directory**: `/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_p2p3_1`  
**Timestamp**: 2026-09-04T12:45:00Z  
**Target Codebase**: `/home/level-77/Desktop/digital_business_card`  

---

## Executive Summary

This deep technical survey investigates all 7 Medium Priority (P2) issues under Requirement R3, all 4 Low Priority (P3) issues under Requirement R4, and Build & Linter Integrity under Requirement R5. Every finding is backed by direct code inspection, line references, schema verification, and build/test executions.

Key findings:
1. **P2-1**: `app/[slug]/page.tsx:68` performs `select("*")` on `cards`, leaking private columns (`user_id`, `email_personal`, `phone_secondary`, `org_id`, `geofence_locations`) into public RSC payloads.
2. **P2-2**: Public view counters in `app/[slug]/page.tsx:98-100` are blocked by PostgreSQL RLS (`auth.uid() = user_id`) on direct updates by anonymous visitors. A PostgreSQL `SECURITY DEFINER` function `increment_card_views(p_slug text)` must be created in `supabase/schema.sql` and invoked via `supabase.rpc(...)`.
3. **P2-3**: `app/dashboard/cards/[id]/edit/page.tsx` lacks inputs for `skills` (tag/comma-separated) and `work_location` (dropdown: remote/hybrid/onsite), and `public-card-client.tsx` never renders `card.portfolio_url` or `card.work_location`.
4. **P2-4**: Profile photo cropping in `components/image-crop-modal.tsx:44` has a critical silent failure bug: if the user clicks "Apply Crop" without dragging handles, `completedCrop` is `undefined` and the modal silently ignores the action.
5. **P2-5**: vCard downloads in `app/[slug]/public-card-client.tsx:283-340` run purely client-side without pinging telemetry; `app/api/events/route.ts` does not exist and must be created to increment `vcard_downloads_count` and `wallet_downloads_count`.
6. **P2-6**: Google Fonts `@import` was already removed from `app/globals.css` in git commit `2f3daf9`. Fonts are correctly configured via `next/font/google` in `app/layout.tsx`.
7. **P2-7**: `app/api/enterprise/bulk-upload/route.ts:29` uses naive `.split(",")` and hardcodes `company: "Acme Corp"`. An RFC 4180 parser and dynamic org lookup are required.
8. **P3-1**: `next.config.ts` lacks a `headers()` function; security headers (CSP, HSTS, X-Frame-Options, etc.) must be added.
9. **P3-2**: Neither `app/api/ai/extract-card/route.ts` nor `app/api/enterprise/bulk-upload/route.ts` checks file size before buffer allocation; a 5MB maximum limit is needed.
10. **P3-3**: `app/layout.tsx:35-36` sets `maximumScale: 1, userScalable: false`, violating WCAG 2.1 Level AA (criterion 1.4.4).
11. **P3-4**: `public/icon-192.png` and `public/icon-512.png` are 70-byte 1x1 stubs. Sharp is installed and verified capable of rendering valid PNGs from `branding.json` SVG assets.
12. **R5**: Exactly 19 application files contain file-level `/* eslint-disable */` comments. Build compiles successfully (`npm run build` exits 0), but several API endpoints return `{ message: ... }` with HTTP 200 instead of standard `{ error: string }` error codes.

---

## 1. Requirement R3: P2 Medium Issues & Schema Fields

### P2-1: Sanitize RSC Public Payload in `app/[slug]/page.tsx`
* **File & Lines**: `app/[slug]/page.tsx:66-71`, `105`
* **Observation**:
  ```typescript
  // app/[slug]/page.tsx:66-71
  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  ...
  return <PublicCardClient initialCard={card} slug={slug} fallbackMode={false} connectionsCount={connectionsCount} />;
  ```
* **Problem**: Selecting `*` exposes private/sensitive columns to the public React Server Component (RSC) payload serialized into the client HTML:
  - `user_id`: Auth UUID of card owner.
  - `email_personal`: Secondary private email address.
  - `phone_secondary`: Private personal phone number.
  - `org_id`: Internal enterprise organization UUID.
  - `geofence_locations`: Internal GPS coordinates and radius.
* **Proposed Implementation**:
  Replace `select("*")` with an explicit list of public card fields:
  ```typescript
  const PUBLIC_CARD_SELECT = `
    id, slug, is_published, theme, template_layout,
    full_name, prefix, preferred_name, avatar_url, avatar_initials,
    tagline, bio, title, company, department, industry,
    work_location, skills, years_experience,
    phone_primary, email_work, website_primary, portfolio_url,
    booking_url, booking_enabled, booking_title, booking_days,
    booking_start_time, booking_end_time, booking_slot_duration,
    office_address, socials,
    views_count, vcard_downloads_count, wallet_downloads_count,
    active_mode, is_verified, verified_at, verification_badge,
    custom_primary_color, custom_secondary_color, custom_accent_color,
    custom_background_image, show_network_score,
    custom_fields, video_url, bio_ar, title_ar, white_label,
    custom_domain, is_private, pin_code, modes, temporary_layers
  `.replace(/\s+/g, " ").trim();
  ```

---

### P2-2: Fix View Counter via `increment_card_views` RPC in `app/[slug]/page.tsx`
* **File & Lines**: `app/[slug]/page.tsx:91-103`, `supabase/schema.sql`
* **Observation**:
  `app/[slug]/page.tsx` executes:
  ```typescript
  await supabase
    .from("cards")
    .update({ views_count: (card.views_count || 0) + 1 })
    .eq("id", card.id);
  ```
  In `supabase/schema.sql:128-130`:
  ```sql
  create policy "Users can update their own cards." 
    on public.cards for update 
    using (auth.uid() = user_id);
  ```
  Anonymous visitors have `auth.uid() = NULL`. The direct update is rejected by RLS. The `try/catch` silently suppresses the error, leaving `views_count` at 0.
  Furthermore, awaiting this write query in SSR adds blocking latency to TTFB.
* **Proposed Implementation**:
  1. Add PostgreSQL RPC function in `supabase/schema.sql`:
  ```sql
  create or replace function public.increment_card_views(p_slug text)
  returns void
  language plpgsql
  security definer
  as $$
  declare
    v_card_id uuid;
  begin
    update public.cards
    set views_count = coalesce(views_count, 0) + 1
    where slug = p_slug and is_published = true
    returning id into v_card_id;

    if v_card_id is not null then
      insert into public.card_events (card_id, event_type)
      values (v_card_id, 'view');
    end if;
  end;
  $$;

  grant execute on function public.increment_card_views(text) to anon, authenticated, service_role;
  ```
  2. In `app/[slug]/page.tsx`, execute the RPC non-blockingly using Next.js `after` from `next/server` (or unawaited fire-and-forget):
  ```typescript
  after(async () => {
    try {
      const supabase = await createClient();
      await supabase.rpc("increment_card_views", { p_slug: slug });
    } catch (err) {
      console.error("View increment error:", err);
    }
  });
  ```

---

### P2-3: Add Missing Editor Form Fields & Public Rendering
* **Affected Files**:
  - `app/dashboard/cards/[id]/edit/page.tsx`
  - `app/[slug]/public-card-client.tsx`
* **Current State in Editor (`edit/page.tsx`)**:
  - `portfolio_url`: Input exists in Section 3 (lines 1341-1351).
  - `office_address`: Street and City inputs exist in Section 3 (lines 1354-1381).
  - `work_location`: Exists only in initial state (line 215). **No form input exists.**
  - `skills`: Exists in initial state (line 212) and passed to AI modal (line 1833). **No form input exists.**
* **Current State on Public Card (`public-card-client.tsx`)**:
  - `portfolio_url`: Present in dummy fallback data (line 168), but **never rendered in JSX**.
  - `work_location`: Present in dummy fallback data (line 164), but **never rendered in JSX**.
  - `skills`: Rendered in Tab 2 (lines 769-785), but since editor cannot set `skills`, user cards never display skills pills.
* **Proposed Implementation**:
  1. In `app/dashboard/cards/[id]/edit/page.tsx`:
     - Under Section 1 (Profile Identity) or a new Professional accordion, add:
       - `work_location` dropdown: `<select value={card.work_location || ""} onChange={...}>` with options: `Remote`, `Hybrid`, `On-site` (values: `"remote"`, `"hybrid"`, `"onsite"`).
       - `skills` tag/comma-separated input: A text input allowing comma-separated skill entry (or tag chips with add/remove buttons) updating `card.skills` (`string[]`).
  2. In `app/[slug]/public-card-client.tsx`:
     - Render `portfolio_url` when present (e.g. as a button in Tab 1 Quick Actions or Links section with `ExternalLink` or `Briefcase` icon).
     - Render `work_location` badge/pill next to title/company or in Tab 2 About section.
     - Ensure `skills` pills are rendered when `card.skills` array has items.

---

### P2-4: Avatar Upload UI with Cropping (`components/image-crop-modal.tsx`)
* **File & Lines**:
  - `components/image-crop-modal.tsx:31-81`
  - `app/dashboard/cards/[id]/edit/page.tsx:109-150`, `708-751`, `1813-1820`
* **Observation**:
  Avatar upload UI exists in `edit/page.tsx` (lines 708-751) and opens `ImageCropModal` on file selection.
* **Critical Bug Found in `components/image-crop-modal.tsx`**:
  - In `components/image-crop-modal.tsx:33`: `const [completedCrop, setCompletedCrop] = useState<PixelCrop>();`
  - When an image loads, `onImageLoad` (line 38) calls `setCrop(centerAspectCrop(width, height, 1))` with percent units. It **never calls `setCompletedCrop`**.
  - `setCompletedCrop` is ONLY invoked when the user physically drags/resizes the crop box (`onComplete={(c) => setCompletedCrop(c)}`).
  - At line 44: `const getCroppedImg = async () => { if (!completedCrop || !imgRef.current) return; ... }`
  - If a user chooses a photo and clicks "Apply Crop" without adjusting handles, `completedCrop` is `undefined`, and `getCroppedImg()` returns early without calling `onCropComplete(blob)`. The modal remains stuck!
* **Proposed Implementation**:
  In `components/image-crop-modal.tsx:44`:
  Fallback to full/centered pixel crop if `completedCrop` is not set:
  ```typescript
  const getCroppedImg = async () => {
    if (!imgRef.current) return;
    const image = imgRef.current;
    const crop = completedCrop || {
      unit: "px",
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    };
    ...
  ```
  Ensure storage upload path in `edit/page.tsx:130` strictly adheres to `avatars/${userId}/avatar.${ext}` or `${userId}/avatar-${Date.now()}.jpg` with `{ upsert: true }`.

---

### P2-5: Download Event Telemetry in `app/api/events/route.ts` & `public-card-client.tsx`
* **File & Lines**:
  - `app/api/events/route.ts` (MISSING)
  - `app/[slug]/public-card-client.tsx:283-340`, `342-365`
* **Observation**:
  - `app/api/events/route.ts` does not exist in the codebase.
  - In `public-card-client.tsx`, `handleDownloadVCard` generates a blob and triggers download in the browser without sending any network request. `vcard_downloads_count` never increments.
  - `handleDownloadWalletPass` requests `/api/wallet`, but `/api/wallet/route.ts` does not increment `wallet_downloads_count`.
* **Proposed Implementation**:
  1. Create `app/api/events/route.ts`:
     - Method: `POST`
     - Body: `{ cardId: string, eventType: string }`
     - Validation: UUID regex on `cardId`, allowed values for `eventType`: `'vcard_download'`, `'wallet_download'`, `'view'`, `'share'`.
     - Database Action: Increment corresponding counter on `cards` table (`vcard_downloads_count`, `wallet_downloads_count`) and insert a record into `public.card_events`.
     - Permissions: Use `createAdminClient()` from `lib/supabase/server` or a `SECURITY DEFINER` RPC function `public.increment_card_event(p_card_id uuid, p_event_type text)`.
     - Returns `{ success: true }` or `{ error: string }`.
  2. Wire `public-card-client.tsx`:
     - In `handleDownloadVCard`: fire `fetch('/api/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardId: card.id, eventType: 'vcard_download' }) })`.
     - In `handleDownloadWalletPass`: fire `fetch('/api/events', ... eventType: 'wallet_download')`.

---

### P2-6: Remove Google Fonts `@import` from `app/globals.css`
* **File & Lines**: `app/globals.css:1`, `app/layout.tsx:6-14`
* **Observation**:
  - Verified git history: Commit `2f3daf968387b091154284119a3f670c67122db9` already removed `@import url('https://fonts.googleapis.com/...')` from `app/globals.css`.
  - `app/globals.css` now starts with `@import "tailwindcss";` without external font imports.
  - `app/layout.tsx` lines 6-14 load `Geist` and `Geist_Mono` via `next/font/google`.
* **Conclusion**: Issue P2-6 is **already resolved** in current code. Document for verification.

---

### P2-7: Bulk CSV Upload RFC 4180 Parser & Dynamic Org Name in `app/api/enterprise/bulk-upload/route.ts`
* **File & Lines**: `app/api/enterprise/bulk-upload/route.ts:14-41`
* **Observation**:
  ```typescript
  // Line 15:
  const rows = text.split("\n").filter(r => r.trim().length > 0);
  // Line 29:
  const cols = rows[i].split(",").map(c => c.trim());
  // Line 37:
  company: "Acme Corp", // Hardcoded for MVP
  ```
* **Problems**:
  1. Splitting on `\n` and `,` corrupts CSV fields containing quoted newlines or commas (e.g. `"Doe, Jane"`, `"Acme, Inc."`, or escaped double quotes `""`).
  2. `company` is hardcoded to `"Acme Corp"`.
  3. Cards are created with `user_id: user.id` but without `org_id`, so they do not link to the enterprise organization.
* **Proposed Implementation**:
  1. Implement inline RFC 4180 parser:
     - Handles double quotes, commas within quotes, escaped double quotes `""`, and CRLF/LF line endings.
  2. Dynamic Organization Lookup:
     - Query `organization_members` for the caller's `org_id`.
     - If found, query `organizations` to get the actual company name `org.name` and assign `org_id: membership.org_id`.
     - Fallback to caller's existing card company or "Enterprise".

---

## 2. Requirement R4: P3 Low-Priority Issues

### P3-1: HTTP Security Headers in `next.config.ts`
* **File & Lines**: `next.config.ts:1-18`
* **Observation**:
  `nextConfig` currently only contains `serverExternalPackages` and `turbopack`. It exports no `headers()` function.
* **Proposed Implementation**:
  Add `headers()` configuration:
  ```typescript
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https: http:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com https://ui-avatars.com https://d-b-c.netlify.app",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  }
  ```

---

### P3-2: 5MB Upload Size Limits in `extract-card` and `bulk-upload`
* **Affected Files**:
  - `app/api/ai/extract-card/route.ts:10-17`
  - `app/api/enterprise/bulk-upload/route.ts:7-14`
* **Observation**:
  - In `extract-card`: `Buffer.from(await imageFile.arrayBuffer())` executes without checking `imageFile.size`.
  - In `bulk-upload`: `await file.text()` executes without checking `file.size`.
* **Proposed Implementation**:
  Add 5MB threshold check (`5 * 1024 * 1024` bytes):
  ```typescript
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File size exceeds 5MB limit" },
      { status: 400 }
    );
  }
  ```

---

### P3-3: Mobile Viewport Accessibility in `app/layout.tsx`
* **File & Lines**: `app/layout.tsx:31-37`
* **Observation**:
  ```typescript
  export const viewport: Viewport = {
    themeColor: "#fbfbfd",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  };
  ```
  `maximumScale: 1` and `userScalable: false` disable pinch-to-zoom on mobile browsers, directly violating WCAG 2.1 Level AA Criterion 1.4.4 (Resize Text).
* **Proposed Implementation**:
  ```typescript
  export const viewport: Viewport = {
    themeColor: "#fbfbfd",
    width: "device-width",
    initialScale: 1,
    userScalable: true,
  };
  ```

---

### P3-4: PWA Icons in `public/icon-192.png` and `public/icon-512.png`
* **File & Lines**:
  - `public/icon-192.png` (70 bytes, 1x1 pixel PNG)
  - `public/icon-512.png` (70 bytes, 1x1 pixel PNG)
  - `branding.json:7-35`, `76-80`
* **Observation**:
  Both icons are placeholder 1x1 stubs.
  `branding.json` defines brand colors (`#8B5CF6`, `#10B981`, `#050507`) and the official sync-sphere vector markup.
  We tested Node.js + `sharp` library in this survey; `sharp` successfully generated a valid 5.4KB PNG buffer from SVG.
* **Proposed Implementation**:
  Run a one-time generator script using `sharp` to produce valid 192×192 and 512×512 PNGs matching `branding.json`:
  ```typescript
  const sharp = require("sharp");
  function getSvg(size) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 200 200">
      <rect width="200" height="200" rx="44" fill="#050507" />
      <g transform="translate(10, 10) scale(0.9)">
        <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="#8B5CF6" stroke-width="16" stroke-linecap="round"/>
        <path d="M 160 100 A 60 60 0 0 1 40 100" fill="none" stroke="#10B981" stroke-width="16" stroke-linecap="round"/>
        <circle cx="100" cy="100" r="16" fill="#FFFFFF"/>
      </g>
    </svg>`;
  }
  await sharp(Buffer.from(getSvg(192))).resize(192, 192).png().toFile("public/icon-192.png");
  await sharp(Buffer.from(getSvg(512))).resize(512, 512).png().toFile("public/icon-512.png");
  ```

---

## 3. Requirement R5: Build Integrity & Eslint Cleanliness

### 3.1 Catalog of `/* eslint-disable */` Suppressions
We located all 19 application files containing top-level suppressions:
1. `app/[slug]/public-card-client.tsx:1`
2. `app/api/ai/enhance-bio/route.ts:1`
3. `app/api/ai/extract-card/route.ts:1`
4. `app/api/ai/generate-collections/route.ts:1`
5. `app/api/ai/verify-identity/route.ts:1`
6. `app/api/bookings/route.ts:1`
7. `app/api/connections/route.ts:1`
8. `app/api/enterprise/bulk-upload/route.ts:1`
9. `app/api/enterprise/members/route.ts:1`
10. `app/api/wallet/route.ts:1`
11. `app/auth/page.tsx:1`
12. `app/dashboard/cards/[id]/edit/page.tsx:1`
13. `app/dashboard/cards/new/page.tsx:1`
14. `app/dashboard/connections/page.tsx:1`
15. `app/dashboard/enterprise/page.tsx:1`
16. `components/add-member-modal.tsx:1`
17. `components/booking-modal.tsx:1`
18. `components/edit-member-modal.tsx:1`
19. `components/verify-modal.tsx:1`

**Bugs Masked by Suppressions**:
- PostgREST filter injection and unvalidated params in `app/api/wallet/route.ts`
- Insecure fallback auto-approval in `app/api/ai/verify-identity/route.ts` and `components/verify-modal.tsx`
- Cross-tenant data leak in `app/api/enterprise/members/route.ts`
- Unauthenticated endpoints in `app/api/ai/enhance-bio/route.ts` and `app/api/ai/extract-card/route.ts`
- Missing form fields and silent crop failures in `app/dashboard/cards/[id]/edit/page.tsx`
- Missing RLS error handling in `app/api/bookings/route.ts` and `app/api/connections/route.ts`

### 3.2 Error Response Format Consistency (`{ error: string }`)
Audited all 22 API routes:
- Most routes already return `{ error: string }`.
- **Inconsistencies Identified**:
  1. `app/api/wallet/apple/[slug]/route.ts:83-86`: Returns status 200 with `{ message: '...', requiresCerts: true }` when certificates fail. Must return `{ error: "Apple Developer certificates not configured" }` with status 501.
  2. `app/api/wallet/google/[slug]/route.ts:24-28`: Returns status 200 with `{ message: '...' }` when credentials fail. Must return `{ error: "Google Wallet credentials not configured" }` with status 501.
  3. `app/api/invite/route.ts:56`, `bulk-upload/route.ts:51`, `connections/route.ts:130`: Include `{ error: string, details: string }`. `details` should be sanitized or omitted so `{ error: string }` remains the canonical contract.

### 3.3 Build Verification
- Verified command: `npm run build` (`next build --webpack`).
- Build execution completed in 22.0s with exit code 0.
- All 24 routes successfully compiled without TypeScript errors.

---

## 4. Implementation Matrix for Downstream Workers

| Item | Priority | Target File(s) | Change Summary |
|---|---|---|---|
| P2-1 | P2 | `app/[slug]/page.tsx:68` | Replace `*` with explicit sanitized public card field list |
| P2-2 | P2 | `supabase/schema.sql`, `app/[slug]/page.tsx:91-103` | Add `increment_card_views` RPC with `SECURITY DEFINER`; call non-blockingly via Next.js `after()` |
| P2-3 | P2 | `app/dashboard/cards/[id]/edit/page.tsx`, `app/[slug]/public-card-client.tsx` | Add editor inputs for `skills` & `work_location`; render `portfolio_url` & `skills` on public client |
| P2-4 | P2 | `components/image-crop-modal.tsx:44`, `app/dashboard/cards/[id]/edit/page.tsx:130` | Fix uninitialized `completedCrop` bug in crop modal; enforce storage path `avatars/${userId}/...` |
| P2-5 | P2 | `app/api/events/route.ts` (NEW), `app/[slug]/public-card-client.tsx:338` | Create telemetry route with counter increments; wire `handleDownloadVCard` & wallet downloads |
| P2-6 | P2 | `app/globals.css` | Verified already removed in commit `2f3daf9` |
| P2-7 | P2 | `app/api/enterprise/bulk-upload/route.ts:14-46` | Replace naive split with RFC 4180 parser; dynamic org name lookup |
| P3-1 | P3 | `next.config.ts:12-16` | Add `headers()` with CSP, X-Frame-Options, HSTS, Referrer-Policy |
| P3-2 | P3 | `app/api/ai/extract-card/route.ts:12`, `app/api/enterprise/bulk-upload/route.ts:10` | Enforce 5MB file size limit before buffer allocation |
| P3-3 | P3 | `app/layout.tsx:31-37` | Set `userScalable: true` and remove `maximumScale: 1` |
| P3-4 | P3 | `public/icon-192.png`, `public/icon-512.png` | Generate valid PNG icons via Sharp using `branding.json` colors |
| R5 | Build | All 19 files with `/* eslint-disable */` | Remove unnecessary disables after bugfixes; enforce `{ error: string }` across all endpoints |
