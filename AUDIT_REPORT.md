# Master Technical Audit Report: Next.js 16 + Supabase Digital Business Card Platform (IZN)

**Target System**: Next.js 16.3.3 (App Router, Turbopack) + Supabase (PostgreSQL 15, Auth, Storage, Row Level Security) + Tailwind CSS + Google Gemini 2.5 Flash + Apple Wallet PassKit  
**Auditor**: Lead Technical Audit Team (Worker & Forensic Verification)  
**Date**: August 27, 2026  
**Repository**: `/home/level-77/Desktop/digital_business_card`  
**Status**: Completed Master Technical Audit  

---

## 1. Executive Summary

A comprehensive, ground-truth technical audit was performed across the entire codebase—spanning all 23 application routes, 10 UI components, 4 shared libraries, Supabase PostgreSQL schemas, Row Level Security (RLS) policies, storage bucket configurations, and client/server data serialization boundaries. 

The platform demonstrates an elegant visual design foundation (8 customized Tailwind themes), rich native mobile capabilities (vCard 3.0 RFC compliance, Apple Wallet `.pkpass` generation), and modern multimodal AI integrations (Google Gemini 2.5 Flash for vision extraction and bio generation). However, the system currently harbors **severe security vulnerabilities, multi-tenant data leaks, broken public conversion funnels, and performance bottlenecks** that prevent production readiness.

### Key High-Impact Findings:
* **Broken Core Conversion Funnel (P0)**: Public visitor interactions—specifically **Lead Contact Sharing** (`ExchangeModal` -> `/api/connections`) and **Calendar Meeting Booking** (`BookingModal` -> `/api/bookings`)—are completely blocked by Supabase Row Level Security. Anonymous visitors execute unauthenticated inserts where `auth.uid()` is `null`, violating `with check (auth.uid() = user_id)`. 100% of public leads and meeting bookings are dropped, rendering the card's primary business utility non-functional.
* **Severe Security & Authorization Gaps (P0)**: An unauthenticated admin endpoint (`POST /api/invite`) directly invokes the Supabase Service Role Admin API without session checks, allowing arbitrary users to trigger official email invites. Crucial enterprise tables (`organizations`, `organization_members`) completely omit Row Level Security, exposing corporate tenant topologies over public PostgREST.
* **Cross-Tenant Enterprise Data Leakage (P0)**: The enterprise directory endpoint (`GET /api/enterprise/members`) executes an unconstrained `select("*")` on `cards`. Due to the public read RLS policy on published cards, every card across all companies on the platform is exposed as employees within any tenant's private enterprise portal.
* **Artificial 1.5-Second LCP Performance Penalty (P1)**: A hardcoded `setTimeout(..., 1500)` full-screen blocking overlay (`components/page-loader.tsx`) runs on every initial page mount, artificially degrading Largest Contentful Paint (LCP), First Contentful Paint (FCP), and Interaction to Next Paint (INP).
* **Missing Social & SEO Infrastructure (P1)**: The public card view (`app/[slug]/page.tsx`) omits `og:image`, Twitter Cards, canonical URLs, and Schema.org `Person` JSON-LD structured data, resulting in empty previews when cards are shared across WhatsApp, LinkedIn, iMessage, and X/Twitter.

---

## 2. Feature Status Table

The platform's 12 core features and discovered functional subsystems were audited for feature completeness, functional correctness, and runtime stability:

| Feature / Subsystem | Status | Target Files | Audit Notes & Operational Status |
| :--- | :---: | :--- | :--- |
| **1. Authentication & Session** | ⚠️ Partial | `app/auth/page.tsx`, `app/auth/callback/route.ts`, `lib/supabase/middleware.ts` | Magic Link OTP and OAuth (Google, GitHub) function with PKCE exchange. **Telegram login is a non-functional placeholder** opening a dead-end bot link. Middleware drops `?redirect=` param on `/auth`. |
| **2. Card Editor** | ⚠️ Partial | `app/dashboard/cards/[id]/edit/page.tsx`, `components/phone-input.tsx` | Split-screen real-time mobile preview, 8 theme swatches, and phone input with 84 countries work well. **Omitted schema fields**: `portfolio_url`, `office_address`, `skills`, and `work_location` have no UI inputs. No custom avatar upload UI. |
| **3. Public Card View** | ⚠️ Partial | `app/[slug]/page.tsx`, `app/[slug]/public-card-client.tsx` | SSR card rendering, RFC 3.0 vCard export, dynamic QR code, and Web Share API work. **`active_mode` filtering is dead code**. Public view counter fails under RLS. Floating QR FAB opens exchange modal instead of displaying QR. |
| **4. Booking & Meeting System** | ❌ Broken | `components/booking-modal.tsx`, `app/api/bookings/route.ts` | Dynamic 21-day rolling slot picker and `.ics` generation work client-side. **Backend insert fails PostgreSQL RLS** for anonymous visitors; errors are swallowed and host never receives the booking lead. No slot collision checks. |
| **5. Networking Wallet & Connections** | ⚠️ Partial | `app/dashboard/connections/page.tsx`, `app/api/connections/route.ts`, `app/api/collections/route.ts` | Custom collection folders and AI follow-up drafting work for authenticated users. **Public contact exchange (`ExchangeModal`) fails RLS with 500 errors**. No search/filter across saved connections. |
| **6. Enterprise Management** | ❌ Broken | `app/dashboard/enterprise/page.tsx`, `app/api/enterprise/members/route.ts`, `app/api/enterprise/bulk-upload/route.ts` | Directory UI and modals render cleanly. **CRITICAL LEAK**: Directory lists all platform cards across all companies. Onboarding loop is disconnected (invited employee gets blank card). Bulk upload hardcodes "Acme Corp". |
| **7. AI Identity Verification** | ⚠️ Partial | `components/verify-modal.tsx`, `app/api/ai/verify-identity/route.ts` | WebRTC camera stream and face capture work well. **Endpoint is unauthenticated**. Server and client both contain insecure fallback logic that automatically approves verification if the Gemini API key is missing or errors out. |
| **8. AI Bio Enhancement** | ⚠️ Partial | `components/ai-bio-modal.tsx`, `app/api/ai/enhance-bio/route.ts` | Generates 3 contextual tones (Executive, Modern, Punchy) via Gemini 2.5 Flash with prompt fallback. **Endpoint is unauthenticated**, exposing Gemini API quota to public abuse and prompt injection. |
| **9. AI Card Scanning** | ✅ Complete | `app/api/ai/extract-card/route.ts`, `components/exchange-modal.tsx` | Multimodal image extraction via Gemini 2.5 Flash Vision successfully parses physical business cards into structured JSON `{ name, email, phone, company, title }`. |
| **10. Invite System** | ❌ Broken | `app/api/invite/route.ts` | Uses Supabase Service Role admin client to dispatch email invites. **Completely unauthenticated**, allowing anyone on the public internet to trigger administrative invite emails. Hardcoded Netlify fallback domain. |
| **11. Analytics & Tracking** | ⚠️ Partial | `app/[slug]/page.tsx`, `supabase/schema.sql`, `app/dashboard/page.tsx` | Schema defines `card_events` with insert policies. SSR view logging fails due to RLS update restriction on `cards.views_count`. **vCard and Apple Wallet download events are never tracked or incremented**. |
| **12. Main Landing Page** | ⚠️ Partial | `app/page.tsx`, `components/magic-demo-modal.tsx` | Polished marketing design with bento grid, interactive 4-step demo modal, and GSAP video. **Page is forced to Client-Side Rendering (`"use client"`)**, preventing static metadata export. |
| **13. Apple Wallet PassKit** | ✅ Complete | `app/api/wallet/route.ts` | Generates valid `.pkpass` bundle with barcode QR, branding colors, and fields using `passkit-generator`. Handles missing certificates gracefully (returns 501). Vulnerable to PostgREST filter injection in query param. |
| **14. NFC & QR Subsystem** | ⚠️ Partial | `app/[slug]/public-card-client.tsx:483, 656` | Dynamic vCard QR rendering works reliably. NFC tab is a static URL copy box without WebNFC (`NDEFReader`) hardware integration. |
| **15. Contextual Modes** | ❌ Broken | `app/[slug]/public-card-client.tsx:119-129` | Filtering logic attempts to filter non-existent property `card.social_links` into `filteredLinks`, which is never referenced in JSX. Toggling modes does nothing. |
| **16. Schema & Profile Extensions** | 🔲 Missing | `supabase/schema.sql`, `app/dashboard/cards/[id]/edit/page.tsx` | Columns `geofence_locations`, `portfolio_url`, `office_address`, `skills`, and `phone_secondary` exist in PostgreSQL but lack user-facing input controls in the editor. |

---

## 3. Critical Issues (P0)

### Issue P0-1: Unauthenticated Admin Invite Endpoint & Service Role Abuse
* **Severity**: Critical (P0) — Remote Administrative Abuse & Email Spam Gateway
* **Affected File(s)**: `app/api/invite/route.ts`, Lines 4–35
* **Technical Root Cause & Vulnerability Mechanism**:
  The POST handler initializes `createAdminClient()`, which binds the privileged `SUPABASE_SERVICE_ROLE_KEY`. It extracts `{ email }` from the request body and directly executes `adminAuthClient.auth.admin.inviteUserByEmail(email)` without verifying caller authentication (`auth.getUser()`), session cookies, origin, or enterprise role permissions.
* **Real-World Impact**:
  Any anonymous actor or botnet can send arbitrary HTTP POST requests to `/api/invite` to dispatch thousands of official invitation emails to arbitrary addresses. This causes reputation blacklisting of the domain's transactional email provider (Resend/SendGrid/Supabase), rapid exhaustion of auth rate limits and billing quotas, and unauthorized account provisioning.
* **Recommended Remediation**:
  Enforce caller authentication and verify enterprise admin role before executing admin invitations:
```typescript
// app/api/invite/route.ts
import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, orgId } = await request.json();
    if (!email || !orgId) {
      return NextResponse.json({ error: "Email and Organization ID are required" }, { status: 400 });
    }

    // Verify caller is an administrator of the organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Forbidden: Enterprise Admin role required" }, { status: 403 });
    }

    const adminAuthClient = createAdminClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";
    const redirectTo = `${baseUrl}/auth/callback`;

    const { data, error } = await adminAuthClient.auth.admin.inviteUserByEmail(email, {
      redirectTo,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

---

### Issue P0-2: Enterprise & Organization Tables Completely Missing Row Level Security
* **Severity**: Critical (P0) — Unauthorized Multi-Tenant Data Tampering & Disclosure
* **Affected File(s)**: `supabase/schema.sql`, Lines 236–253
* **Technical Root Cause & Vulnerability Mechanism**:
  The tables `public.organizations` and `public.organization_members` are defined without invoking `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`. In PostgreSQL and Supabase PostgREST, tables without RLS default to unrestricted public read/write access under the anon key.
* **Real-World Impact**:
  Any anonymous internet user or rogue client can execute direct PostgREST calls against `/rest/v1/organizations` and `/rest/v1/organization_members` to view all corporate organizations, insert themselves as `admin` of any organization, delete organizations, or modify corporate metadata.
* **Recommended Remediation**:
  Enable RLS and define strict role-based policies in `supabase/schema.sql`:
```sql
-- Enable Row Level Security
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Organizations Policies
create policy "Organization members can view their organization"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.org_id = organizations.id
        and organization_members.user_id = auth.uid()
    )
  );

create policy "Organization admins can update organization profile"
  on public.organizations for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.org_id = organizations.id
        and organization_members.user_id = auth.uid()
        and organization_members.role = 'admin'
    )
  );

-- Organization Members Policies
create policy "Members can view fellow organization members"
  on public.organization_members for select
  using (
    exists (
      select 1 from public.organization_members as m
      where m.org_id = organization_members.org_id
        and m.user_id = auth.uid()
    )
  );

create policy "Admins can manage organization members"
  on public.organization_members for all
  using (
    exists (
      select 1 from public.organization_members as m
      where m.org_id = organization_members.org_id
        and m.user_id = auth.uid()
        and m.role = 'admin'
    )
  );
```

---

### Issue P0-3: Public Lead Capture & Meeting Booking Architecture Blocked by RLS
* **Severity**: Critical (P0) — 100% Core Feature Failure & Lead Data Loss
* **Affected File(s)**: `app/api/bookings/route.ts:27-53`, `app/api/connections/route.ts:14, 62-81`, `supabase/schema.sql:220-223`
* **Technical Root Cause & Vulnerability Mechanism**:
  `supabase/schema.sql` restricts inserts to `connections` via:
  ```sql
  create policy "Users can insert their own connections." 
    on public.connections for insert 
    with check (auth.uid() = user_id);
  ```
  When an anonymous visitor submits contact details (`ExchangeModal`) or schedules a calendar meeting (`BookingModal`), the request reaches `/api/connections` or `/api/bookings` without an auth session (`auth.uid() = null`). The routes use standard `createClient()` and attempt to insert a record with `user_id = card.user_id`. PostgreSQL evaluates `null = card.user_id` as `false` and rejects the insert with PostgreSQL error `42501 (RLS check violation)`.
* **Real-World Impact**:
  * In `/api/connections`: The route throws 500, displaying an alert error to the visitor. Contact sharing is totally inoperative.
  * In `/api/bookings`: The route catches the error with `console.warn` and returns `200 { success: true }`. The visitor sees "Meeting Confirmed!", but the cardholder never receives the lead in their dashboard or database.
* **Recommended Remediation**:
  Create a secure PostgreSQL function `create_public_card_lead` defined with `SECURITY DEFINER` that validates the card exists and is published before creating a connection lead:
```sql
-- Secure PostgreSQL function for public lead and booking capture
create or replace function public.submit_public_lead(
  p_card_id uuid,
  p_name text,
  p_email text,
  p_phone text default null,
  p_company text default null,
  p_title text default null,
  p_meeting_date text default null,
  p_meeting_time text default null,
  p_notes text default null
) returns jsonb as $$
declare
  v_owner_id uuid;
  v_conn_id uuid;
  v_location text;
  v_draft text;
begin
  -- Validate target card is published
  select user_id into v_owner_id from public.cards 
  where id = p_card_id and is_published = true;
  
  if v_owner_id is null then
    raise exception 'Card not found or not published';
  end if;

  if p_meeting_date is not null and p_meeting_time is not null then
    v_location := 'Digital Calendar Booking';
    v_draft := 'Meeting scheduled for ' || p_meeting_date || ' at ' || p_meeting_time || '. Notes: ' || coalesce(p_notes, 'None');
  else
    v_location := 'Public Card Exchange';
    v_draft := 'Met via digital business card exchange.';
  end if;

  insert into public.connections (
    user_id, card_id, contact_name, contact_email, contact_phone,
    contact_company, contact_title, met_at_location, ai_drafted_message, status
  ) values (
    v_owner_id, p_card_id, p_name, p_email, p_phone,
    p_company, p_title, v_location, v_draft, 'pending'
  ) returning id into v_conn_id;

  return jsonb_build_object('success', true, 'connection_id', v_conn_id);
end;
$$ language plpgsql security definer;
```

---

### Issue P0-4: Cross-Tenant Multi-Organization Data Leak in Enterprise Directory
* **Severity**: Critical (P0) — Massive Multi-Tenant Privacy Violation
* **Affected File(s)**: `app/api/enterprise/members/route.ts`, Lines 18–25
* **Technical Root Cause & Vulnerability Mechanism**:
  `GET /api/enterprise/members` executes:
  ```typescript
  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });
  ```
  Because `cards` RLS permits public reading of any card where `is_published = true`, this unconstrained query returns **all published cards across every registered user and organization in the entire platform database**.
* **Real-World Impact**:
  When Company A logs into their Enterprise dashboard, the employee table populates with employees, personal contact details, emails, job titles, and phone numbers belonging to Company B, Company C, and individual private users.
* **Recommended Remediation**:
  Resolve the caller's `org_id` from `organization_members` and strictly scope the card query to that organization:
```typescript
// In app/api/enterprise/members/route.ts
const { data: membership } = await supabase
  .from("organization_members")
  .select("org_id, role")
  .eq("user_id", user.id)
  .single();

if (!membership?.org_id) {
  return NextResponse.json({ success: true, members: [] });
}

const { data: cards, error } = await supabase
  .from("cards")
  .select("*")
  .eq("org_id", membership.org_id)
  .order("created_at", { ascending: false });
```

---

### Issue P0-5: Storage Overwrite Vulnerability in `avatars` Bucket
* **Severity**: High / Critical (P0/P1) — Arbitrary File Overwrite & Profile Defacement
* **Affected File(s)**: `supabase/schema.sql`, Lines 181–184
* **Technical Root Cause & Vulnerability Mechanism**:
  The storage UPDATE policy is configured as:
  ```sql
  create policy "Authenticated users can update their avatar images."
    on storage.objects for update
    using (bucket_id = 'avatars' and auth.role() = 'authenticated');
  ```
  The policy checks only if the user is authenticated; it contains no path, folder, or owner constraint.
* **Real-World Impact**:
  Any authenticated user on the platform can issue an S3/Storage API update to overwrite another user's avatar image or company logo file by targeting their file path.
* **Recommended Remediation**:
  Enforce folder isolation matching the user's `auth.uid()`:
```sql
drop policy if exists "Authenticated users can update their avatar images." on storage.objects;
create policy "Authenticated users can update their avatar images."
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can upload avatar images." on storage.objects;
create policy "Authenticated users can upload avatar images."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated' 
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

### Issue P0-6: Client-Side Identity Verification Tampering & Insecure Fallback Auto-Approval
* **Severity**: High / Critical (P0/P1) — Biometric Badge Fraud & Privilege Escalation
* **Affected File(s)**: `supabase/schema.sql:127-130`, `app/api/ai/verify-identity/route.ts:24-31, 80-83`, `components/verify-modal.tsx:179-190`
* **Technical Root Cause & Vulnerability Mechanism**:
  1. The `cards` UPDATE RLS policy permits authenticated owners to update all columns, including `is_verified` and `verification_badge`. A user can issue a direct Supabase update from DevTools to grant themselves a verified badge without running biometric analysis.
  2. In `app/api/ai/verify-identity/route.ts` and `components/verify-modal.tsx`, if the Gemini API key is missing or encounters a network error, the catch blocks explicitly construct a simulated approved result (`verified: true, confidence: 97, badge: 'ai_verified_executive'`) and mark the profile as verified!
* **Real-World Impact**:
  Any user can fake verified status; all failures fail-open to "Verified".
* **Recommended Remediation**:
  1. Add a PostgreSQL trigger preventing client updates to `is_verified` columns.
  2. Implement strict fail-closed verification on both API and client.
```sql
-- Enforce verification field protection in PostgreSQL
create or replace function public.protect_verification_columns()
returns trigger as $$
begin
  if (new.is_verified is distinct from old.is_verified or
      new.verification_badge is distinct from old.verification_badge or
      new.verified_at is distinct from old.verified_at) then
    if auth.role() != 'service_role' then
      new.is_verified := old.is_verified;
      new.verification_badge := old.verification_badge;
      new.verified_at := old.verified_at;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger tr_protect_card_verification
  before update on public.cards
  for each row execute function public.protect_verification_columns();
```

---

### Issue P0-7: PostgREST Filter Injection Vulnerability in Apple Wallet Route
* **Severity**: High (P0/P1) — Filter Injection & Query Tampering
* **Affected File(s)**: `app/api/wallet/route.ts`, Lines 25–30
* **Technical Root Cause & Vulnerability Mechanism**:
  The route retrieves `cardIdOrSlug` from query parameters and concatenates it directly into a PostgREST `.or(...)` filter string without validation:
  ```typescript
  const cardIdOrSlug = searchParams.get("cardId") || searchParams.get("slug");
  ...
  const { data: fetchedCard } = await supabase
    .from("cards")
    .select("*")
    .or(`id.eq.${cardIdOrSlug},slug.eq.${cardIdOrSlug}`)
    .single();
  ```
* **Real-World Impact**:
  An attacker can inject PostgREST operators (e.g. commas, `neq`, `gte`) into the query, causing query errors or accessing unintended records.
* **Recommended Remediation**:
  Validate `cardIdOrSlug` using UUID and alphanumeric slug regex before querying:
```typescript
const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cardIdOrSlug);
const isSlug = /^[a-z0-9-_]{3,100}$/i.test(cardIdOrSlug);

if (!isUUID && !isSlug) {
  return NextResponse.json({ error: "Invalid card identifier format" }, { status: 400 });
}

let query = supabase.from("cards").select("*");
if (isUUID) {
  query = query.eq("id", cardIdOrSlug);
} else {
  query = query.eq("slug", cardIdOrSlug);
}
const { data: fetchedCard } = await query.single();
```

---

## 4. High Priority (P1)

### Issue P1-1: Disconnected Enterprise Employee Onboarding Loop
* **Affected File(s)**: `app/api/enterprise/members/route.ts:91-104`, `app/auth/callback/route.ts:19-27`
* **Root Cause & Mechanics**:
  When an admin provisions an employee card in `POST /api/enterprise/members`, the card is inserted with `user_id = admin.id` (the current admin). An invite is sent via Supabase Auth. When the employee clicks the email link and completes auth at `/auth/callback`, the route checks `cards` for `user_id = employee.id`, finds 0 cards, and redirects the employee to `/dashboard/onboarding` as an unassociated individual. The provisioned enterprise card remains permanently locked to the admin.
* **Remediation**:
  Add an `org_invitations` table or tokenized invitation flow (`/invite/[token]`) where accepting the invite assigns `card.user_id = employee.id` and creates the `organization_members` record.

---

### Issue P1-2: Artificial 1.5-Second LCP Performance Penalty (`PageLoader`)
* **Affected File(s)**: `components/page-loader.tsx:10-17`, `app/layout.tsx:53`
* **Root Cause & Mechanics**:
  `PageLoader` is mounted in `app/layout.tsx` and executes a hardcoded `setTimeout(..., 1500)` full-screen blocking overlay with `z-index: 99999`. Every visitor on every route is forced to wait 1.5 seconds before any content is viewable or interactive.
* **Remediation**:
  Remove `PageLoader` from `RootLayout` or convert it to a lightweight, non-blocking top progress indicator (`nprogress` style) that does not block DOM rendering or LCP paint.

---

### Issue P1-3: Missing Social Metadata (`og:image`), Twitter Cards, and Schema.org JSON-LD
* **Affected File(s)**: `app/[slug]/page.tsx:10-36`
* **Root Cause & Mechanics**:
  `generateMetadata` in `app/[slug]/page.tsx` exports only basic `title` and `description`. It completely lacks `openGraph.images` (`og:image`), `openGraph.url`, `twitter.card` (`summary_large_image`), `alternates.canonical`, and Schema.org `Person` / `ProfilePage` structured data.
* **Remediation**:
  Add dynamic metadata generation with avatar image URLs and inject `<script type="application/ld+json">` with Schema.org `Person` definition.

---

### Issue P1-4: Landing Page Client-Side Rendering (`"use client"`) Disabling Metadata Export
* **Affected File(s)**: `app/page.tsx:1`
* **Root Cause & Mechanics**:
  `app/page.tsx` is marked `"use client"` at line 1 because `MagicDemoModal` state is embedded directly within it. In Next.js 16 App Router, Client Components cannot export `generateMetadata` or `metadata`. The homepage has no dedicated SEO metadata.
* **Remediation**:
  Refactor `app/page.tsx` into a Server Component. Extract the interactive interactive demo trigger into a standalone client component (`components/magic-demo-trigger.tsx`) and export complete page metadata from `app/page.tsx`.

---

### Issue P1-5: Broken & Dead Contextual Mode (`active_mode`) Filtering Logic
* **Affected File(s)**: `app/[slug]/public-card-client.tsx:114-129, 449-480`
* **Root Cause & Mechanics**:
  In `public-card-client.tsx`, `filteredLinks` evaluates `card.social_links` (which is `undefined` because the schema column is `card.socials`). Furthermore, line 458 ignores `filteredLinks` and renders `card.socials` directly without filtering.
* **Remediation**:
  Update `filteredLinks` to filter `card.socials` based on platform classification (e.g. LinkedIn/GitHub for Work, Instagram/TikTok for Social) and render `filteredLinks` in the JSX tree.

---

### Issue P1-6: Unauthenticated AI Endpoints with Direct Prompt Injection Risk
* **Affected File(s)**: `app/api/ai/enhance-bio/route.ts:7-121`, `app/api/ai/extract-card/route.ts`
* **Root Cause & Mechanics**:
  Both `/api/ai/enhance-bio` and `/api/ai/extract-card` have no session checks (`getUser()`), allowing public consumption of Google Gemini API quotas. In `/api/ai/enhance-bio`, user inputs (`bio`, `tagline`, `skills`) are concatenated directly into the prompt without length sanitization or prompt isolation.
* **Remediation**:
  Enforce authentication via `createClient()` and cap input lengths (e.g. `bio.slice(0, 500)`).

---

### Issue P1-7: Non-Functional Telegram Authentication Dead-End
* **Affected File(s)**: `app/auth/page.tsx:70-75`
* **Root Cause & Mechanics**:
  Clicking "Continue with Telegram" opens `https://t.me/${botUsername}?start=auth_${Date.now()}` in a new browser tab. There is no webhook or Supabase auth integration. The user is stranded in Telegram without completing login on the site.
* **Remediation**:
  Implement the official Telegram Login Widget with HMAC-SHA256 hash verification against bot token, or remove the button until backend handlers are implemented.

---

### Issue P1-8: Open Redirect Vulnerability in Authentication Callback
* **Affected File(s)**: `app/auth/callback/route.ts:7, 30`
* **Root Cause & Mechanics**:
  The route takes `searchParams.get("next")` and executes `NextResponse.redirect(`${origin}${next}`)`. If an attacker constructs `?next=//attacker.com`, browsers can resolve this as an external domain redirect.
* **Remediation**:
  Validate that `next` is a relative path starting with a single `/`:
```typescript
let safeNext = "/dashboard";
if (next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\")) {
  safeNext = next;
}
return NextResponse.redirect(`${origin}${safeNext}`);
```

---

## 5. Medium Priority (P2)

### Issue P2-1: Pervasive ESLint Suppressions and Unchecked `any` Types
* **Affected File(s)**: 18 source files across `app/api/**`, `app/dashboard/**`, and `components/**`
* **Details**:
  18 major files contain top-level `/* eslint-disable */` headers, and `app/api/wallet/route.ts:99` contains `// @ts-ignore`. Over 40 instances of `: any` or `<any>` suppress type checking across state management, API requests, and database records.
* **Remediation**:
  Remove `/* eslint-disable */` and generate strict TypeScript interfaces for Supabase database schema (`types/database.ts`).

---

### Issue P2-2: Public Card View Counter Stagnant Due to RLS Update Block
* **Affected File(s)**: `app/[slug]/page.tsx:63-66`, `supabase/schema.sql:127-130`
* **Details**:
  `app/[slug]/page.tsx` attempts to run `.update({ views_count: ... })` using anonymous `createClient()`. This is blocked by RLS (`auth.uid() = user_id`), leaving `views_count` at 0.
* **Remediation**:
  Create a PostgreSQL RPC function `increment_card_views(slug)` with `SECURITY DEFINER`.

---

### Issue P2-3: Sensitive Internal Data Serialized into Public RSC Payloads
* **Affected File(s)**: `app/[slug]/page.tsx:42-47, 71`
* **Details**:
  `app/[slug]/page.tsx` executes `select("*")` on `cards` and passes the full object to `PublicCardClient`. This serializes `user_id` (Auth UUID), `email_personal`, `phone_secondary`, `org_id`, and `geofence_locations` into the public HTML payload.
* **Remediation**:
  Explicitly select and sanitize only public fields in `app/[slug]/page.tsx`.

---

### Issue P2-4: Missing Form Inputs in Card Editor for Existing DB Columns
* **Affected File(s)**: `app/dashboard/cards/[id]/edit/page.tsx:93-115`
* **Details**:
  Columns defined in `schema.sql` (`portfolio_url`, `office_address`, `skills`, `geofence_locations`, `phone_secondary`, `work_location`, `years_experience`) have state initialization but lack input controls in the editor form.
* **Remediation**:
  Add form accordions/inputs for Portfolio URL, Skills tag input, Office Address, and Location.

---

### Issue P2-5: Unrecorded vCard and Apple Wallet Download Events
* **Affected File(s)**: `app/[slug]/public-card-client.tsx:179-195`
* **Details**:
  Clicking "Save Contact Card (.vcf)" triggers a local browser blob download without making a network call. The dashboard counters `vcard_downloads_count` and `wallet_downloads_count` never increment.
* **Remediation**:
  Add an asynchronous `fetch('/api/events', { method: 'POST', body: JSON.stringify({ cardId, eventType: 'vcard_download' }) })` call on button click.

---

### Issue P2-6: Render-Blocking Google Fonts `@import` and Redundant Font Loading
* **Affected File(s)**: `app/globals.css:3`, `app/layout.tsx:6-14`
* **Details**:
  `app/globals.css` imports Google Fonts via external `@import url(...)` while `app/layout.tsx` simultaneously loads `Geist` via `next/font/google`. The CSS `@import` blocks CSSOM parsing.
* **Remediation**:
  Remove the `@import` rule in `globals.css` and configure all fonts using `next/font/google`.

---

### Issue P2-7: Blocking Sequential Database Operations in SSR Request Pipeline
* **Affected File(s)**: `app/[slug]/page.tsx:59-66`
* **Details**:
  `app/[slug]/page.tsx` awaits two sequential write queries (`card_events` insert and `cards` update) before returning HTML, adding 120–250ms of blocking latency to Time to First Byte (TTFB).
* **Remediation**:
  Execute event logging non-blockingly via Next.js `after()` or client-side telemetry ping.

---

## 6. Low Priority (P3)

### Issue P3-1: Missing HTTP Security Headers and Content Security Policy (CSP)
* **Affected File(s)**: `next.config.ts:1-8`
* **Details**:
  `next.config.ts` contains an empty config with no `headers()` defining CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, or `Referrer-Policy`.
* **Remediation**:
  Configure security headers in `next.config.ts`.

---

### Issue P3-2: Unconstrained In-Memory Buffer Allocation on File Uploads
* **Affected File(s)**: `app/api/ai/extract-card/route.ts`, `app/api/enterprise/bulk-upload/route.ts`
* **Details**:
  Upload handlers read file buffers into Node.js memory (`Buffer.from(await file.arrayBuffer())`) without checking file size limits.
* **Remediation**:
  Enforce a 5MB maximum file size check before reading array buffers.

---

### Issue P3-3: Mobile Viewport Zoom Disabling Violating WCAG 1.4.4
* **Affected File(s)**: `app/layout.tsx:36`
* **Details**:
  `viewport` configuration specifies `userScalable: false` and `maximumScale: 1`, preventing mobile pinch-to-zoom and failing WCAG 2.1 Level AA accessibility criteria.
* **Remediation**:
  Set `userScalable: true` and remove `maximumScale: 1`.

---

### Issue P3-4: Naive CSV Splitting and Hardcoded Company in Bulk Upload
* **Affected File(s)**: `app/api/enterprise/bulk-upload/route.ts:28-40`
* **Details**:
  `POST /api/enterprise/bulk-upload` parses CSV lines using `.split(",")`, corrupting quoted fields containing commas, and hardcodes `company: "Acme Corp"`.
* **Remediation**:
  Integrate a compliant CSV parser library (e.g. `papaparse`) and retrieve the company name dynamically from the organization profile.

---

### Issue P3-5: Placeholder Low-Resolution PWA Icons
* **Affected File(s)**: `public/icon-192.png`, `public/icon-512.png`
* **Details**:
  The PWA icon files are 70-byte placeholder stubs, causing distorted icons when installed to mobile home screens.
* **Remediation**:
  Replace with valid 192x192 and 512x512 PNG icons.

---

## 7. What's Working Well

1. **Tailwind CSS 8-Theme Visual Engine**:
   `lib/theme.ts` implements 8 distinctive design identities (`apple-light`, `midnight-pro`, `emerald-zen`, `cyber-neon`, `tokyo-gold`, `swiss-minimal`, `sunset-gradient`, `ocean-breeze`) with dynamic CSS variables, glassmorphism overlays, and WCAG-compliant high-contrast typography.
2. **vCard 3.0 RFC 2426 Spec Compliance**:
   `app/[slug]/public-card-client.tsx:179-193` produces perfectly structured, escaped vCard 3.0 payloads with support for multi-line fields, formatted addresses, telephone types, and automatic download filenames.
3. **Apple Wallet `.pkpass` Architecture**:
   `app/api/wallet/route.ts` implements a complete PassKit structure using `passkit-generator`, featuring dynamic QR codes, custom RGB theme mapping, back-fields for bio/skills, and graceful fallback handling when local certificates are unprovisioned.
4. **Google Gemini 2.5 Flash Multimodal Pipelines**:
   Multimodal vision extraction in `app/api/ai/extract-card/route.ts` and bio enhancement in `app/api/ai/enhance-bio/route.ts` leverage cutting-edge Gemini 2.5 Flash capabilities to deliver rapid, structured outputs.
5. **Split-Screen Real-Time Editor UX**:
   `app/dashboard/cards/[id]/edit/page.tsx` provides an interactive desktop editing experience with synchronized live mobile rendering, intuitive phone input country selectors (`components/phone-input.tsx`), and theme swatches.
6. **Supabase Schema Foundations**:
   `supabase/schema.sql` establishes well-structured PostgreSQL table definitions, foreign keys with cascade deletion, and initial RLS policies for cards and connections.

---

## 8. Deep-Dive Requirement Coverage

### R1. Feature Completeness Audit
Every platform feature has been categorized into working, partial, or missing:
* **Working as Intended**: Auth session lifecycle, split-screen card editor preview, 8 theme switches, phone input with 84 countries, vCard 3.0 export, Apple Wallet `.pkpass` builder, Gemini 2.5 card scanner, dynamic QR code renderer, Web Share API integration.
* **Partially Implemented / Broken**: Telegram login (dummy bot redirect), public contact exchange & meeting booking (fails RLS), public view counter (fails RLS), enterprise directory (cross-tenant leak), enterprise onboarding loop (orphaned cards), AI identity verification (insecure fallback), contextual mode filter (dead code), bulk CSV upload (hardcoded "Acme Corp").
* **Missing**: `portfolio_url` / `skills` / `office_address` editor inputs, custom avatar image upload UI, Google Wallet pass generation, WebNFC hardware writing, download event telemetry API, organization creation and role management UI.

---

### R2. UX & Flow Audit: Detailed Journey Traces

#### Journey 1: Visitor-to-Card-Save Journey
```
[Landing Page: /] ──► [/auth] ──► [/auth/callback] ──► [/dashboard/onboarding] ──► [/dashboard/cards/[id]/edit]
                                                                                            │
                                                                                            ▼
                                                                                   [Public Card: /[slug]]
                                                                                            │
                                              ┌─────────────────────────────────────────────┼─────────────────────────────────────────────┐
                                              ▼                                             ▼                                             ▼
                                     [Save vCard (.vcf)]                         [Apple Wallet (.pkpass)]                         [Share Info / Book]
                                  (Local Blob Download;                        (Generates valid .pkpass;                        (CRITICAL: Fails RLS;
                                   metric never syncs)                          fallback 501 handled)                            leads silently lost)
```
* **Step 1: Landing Page**: Clean presentation, but CSR `"use client"` disables metadata.
* **Step 2: Authentication**: Magic link works well. Telegram auth is a non-functional dead end. Middleware drops `?redirect=` param.
* **Step 3: Onboarding & Editor**: 3-step onboarding wizard functions smoothly. In the editor, fields `portfolio_url`, `office_address`, `skills`, and `work_location` are missing form inputs.
* **Step 4: Public Card Recipient Interactions**:
  * Visitor clicking "Save Contact (.vcf)" receives `.vcf` file, but download counter never increments.
  * Visitor clicking "Add to Apple Wallet" downloads `.pkpass` bundle.
  * Visitor submitting "Share your info back" (`ExchangeModal`) encounters a 500 error due to PostgreSQL RLS violation (`auth.uid() = user_id`).
  * Visitor booking a calendar slot (`BookingModal`) receives a confirmation message, but the connection record fails database insertion under RLS; the card owner never receives the lead.

---

#### Journey 2: Enterprise HR Flow
```
[Enterprise Dashboard: /dashboard/enterprise]
       │
       ├────────────────────────────────────────┬────────────────────────────────────────┐
       ▼ (1-by-1 Invite Modal)                  ▼ (Bulk CSV Upload)                      ▼ (Directory Listing)
 [POST /api/enterprise/members]           [POST /api/enterprise/bulk-upload]       [GET /api/enterprise/members]
       │                                        │                                        │
       ▼                                        ▼                                        ▼
 [Card created with user_id = admin.id]   [Cards created with user_id = admin.id]  [CRITICAL: select("*") returns
       │                                  [Hardcoded company: "Acme Corp"]         ALL platform cards across
       ▼ (Admin inviteUserByEmail)              │ (No invites sent)                      all companies!]
 [Employee receives email link]                 │
       │                                        ▼
       ▼                                  (Cards orphaned under admin)
 [Employee logs in at /auth/callback]
       │
       ▼
 [auth/callback checks employee cards: count === 0]
 [Redirects employee to /dashboard/onboarding]
 [CRITICAL: Employee never gets enterprise card, never joins org!]
```
* **Step 1: Directory Listing**: `GET /api/enterprise/members` queries `select("*")` without filtering by `org_id`, returning every public card on the platform as company members.
* **Step 2: 1-by-1 Member Provisioning**: Admin provisions card; API inserts card under `admin.id` and sends invite email.
* **Step 3: Employee Onboarding Failure**: Invited employee accepts invite and authenticates; `/auth/callback` queries cards owned by `employee.id`, finds 0 cards, and sends employee to `/dashboard/onboarding` to make a personal card. The enterprise card remains permanently locked to the admin.
* **Step 4: Bulk CSV Upload**: Naive string split corrupts CSVs; hardcodes `company: "Acme Corp"`; does not dispatch invite emails.

---

#### Journey 3: Networking & Connections Flow
```
[Connection Capture]
       │
       ├────────────────────────────────────────┬────────────────────────────────────────┐
       ▼ (Public Card Exchange Modal)           ▼ (Dashboard AI Card Scanner)            ▼ (Direct Meeting Booking)
 [POST /api/connections]                  [POST /api/ai/extract-card]              [POST /api/bookings]
       │ (CRITICAL: Fails RLS for anon)         │ (Gemini 2.5 Flash Vision)              │ (CRITICAL: Fails RLS silently)
       ▼                                        ▼                                        ▼
   (500 Error)                            [JSON: name, email, phone, title]        (Lead not saved)
                                                │
                                                ▼
                                          [POST /api/connections]
                                                │ (Gemini AI drafts follow-up email)
                                                ▼
                                          [connections Insert (Success for Auth User)]
                                                │
                                                ▼
                                  [Connections Dashboard: /dashboard/connections]
                                                │
                                                ├────────────────────────────────────────┐
                                                ▼ (Organize)                             ▼ (Follow-up)
                                   [Assign to Collection]                   [Approve & Send (mailto:)]
                                   (Custom color folders)                   (Status updated to 'sent')
```
* **Step 1: Capture**: Authenticated card scanning via Gemini vision works accurately. Public visitor submissions fail under RLS.
* **Step 2: Organization**: Custom collections with live counts and inline categorization work reliably.
* **Step 3: Follow-Up**: AI generates contextual follow-up emails and launches `mailto:` links, updating status to "sent".

---

### R3. Security & Row Level Security (RLS) Audit

#### Comprehensive Table-by-Table Policy Evaluation:
* `public.profiles`: RLS enabled. Properly scoped to `auth.uid() = id`. Missing explicit delete policy.
* `public.cards`: RLS enabled. SELECT allows public read when `is_published = true`. UPDATE and INSERT restricted to `auth.uid() = user_id`. Fails public view count increments and permits verification badge tampering.
* `public.card_events`: RLS enabled. INSERT permits public logging (`with check (true)`). SELECT restricted to card owner.
* `public.connections`: RLS enabled. INSERT restricted to `auth.uid() = user_id`. **Blocks all public lead capture and calendar bookings**.
* `public.collections`: RLS enabled. Properly scoped to `auth.uid() = user_id` across all operations.
* `public.organizations`: **RLS NOT ENABLED**. Completely exposed to public PostgREST queries.
* `public.organization_members`: **RLS NOT ENABLED**. Completely exposed to public PostgREST queries.
* `storage.objects (avatars)`: Storage RLS permits any authenticated user to update any object in `avatars` bucket without path ownership verification.

---

### R4. Code Quality & Technical Debt

* **Pervasive Linter Suppressions**: 18 files disable ESLint rules at the file level (`/* eslint-disable */`), masking undefined variable references and unsanitized inputs.
* **Unchecked TypeScript Types**: Over 40 instances of `: any` or `<any>` in API route handlers, component state, and database queries.
* **Silent Error Handling**:
  * `app/[slug]/page.tsx:67`: Silent empty `catch {}` masks database increment errors.
  * `app/api/bookings/route.ts:50`: Silent warning on failed connection insert.
  * `app/api/ai/verify-identity/route.ts:80, 97` and `components/verify-modal.tsx:179`: Silent catch blocks that auto-approve verification on error.

---

### R5. Performance & SEO Audit

* **LCP & FCP**: `PageLoader` in `app/layout.tsx` enforces an artificial 1.5-second blocking delay on all page loads.
* **Metadata & Social Sharing**:
  * `app/[slug]/page.tsx` lacks `og:image`, `og:url`, Twitter Card tags, canonical tags, and Schema.org `Person` JSON-LD structured data.
  * `app/page.tsx` is forced to Client-Side Rendering (`"use client"`), omitting static page metadata export.
* **TTFB & SSR Optimization**:
  * `app/[slug]/page.tsx` runs two blocking database write queries sequentially before returning SSR HTML.
* **Font Optimization**:
  * `app/globals.css` uses render-blocking `@import url(...)` for Google Fonts, duplicating `next/font/google` in `layout.tsx`.

---

### R6. Missing & Incomplete Features Matrix

| Feature / Column | Current State | Code Reference | Recommended Resolution |
| :--- | :---: | :--- | :--- |
| `active_mode` | ❌ Broken | `public-card-client.tsx:119-129` | Update JSX to filter `card.socials` by mode and add editor toggle. |
| `geofence_locations` | 🔲 Missing UI | `schema.sql:103`, `wallet/route.ts:100` | Add location coordinates picker in card editor for Apple Wallet lock-screen alerts. |
| `portfolio_url` | ⚠️ Disconnected | `schema.sql:88`, `edit/page.tsx:96` | Add URL input field in editor and render project link pill on public card. |
| Contact & Skills Fields | 🔲 Missing UI | `edit/page.tsx:93-115` | Add form inputs for `skills`, `office_address`, `phone_secondary`, `work_location`. |
| Avatar & Logo Uploads | 🔲 Missing UI | `schema.sql:167` | Add file upload input in editor uploading to `avatars/${userId}/` in Supabase Storage. |
| Google Wallet Passes | 🔲 Missing | `public-card-client.tsx:507` | Implement Google Wallet API JWT pass generation for Android users. |
| Multi-Tenant Orgs | 🔲 Orphaned Schema | `schema.sql:236-252` | Build organization creation, member role assignment, and domain matching. |
| WebNFC Hardware | 🔲 Placeholder | `public-card-client.tsx:656` | Add `window.NDEFReader` integration for writing NFC tags on supported devices. |
| Event Telemetry API | ❌ Broken | `public-card-client.tsx:179, 195` | Add telemetry API endpoint to record vCard and Wallet download events. |

---

## 9. Recommended Next Sprint (Prioritized Action Plan)

The following 8 prioritized, actionable sprint tasks address all critical security, functional, and performance deficiencies:

### Task 1: Fix RLS & Deploy Public Lead/Booking RPC Function
* **Priority**: P0 (Immediate)
* **Scope**: Restore public lead capture and calendar meeting bookings.
* **Affected Files**: `supabase/schema.sql`, `app/api/connections/route.ts`, `app/api/bookings/route.ts`, `components/exchange-modal.tsx`.
* **Implementation Steps**:
  1. Deploy PostgreSQL function `submit_public_lead(...)` marked `SECURITY DEFINER`.
  2. Update `app/api/connections/route.ts` and `app/api/bookings/route.ts` to call `rpc("submit_public_lead", {...})`.
  3. Verify anonymous visitor submissions succeed and persist in `connections`.
* **Acceptance Criteria**: Anonymous card visitors can submit contact info and schedule meetings; records appear immediately in host dashboard with status `pending`.

---

### Task 2: Secure Admin Invite & Enable RLS on Enterprise Tables
* **Priority**: P0 (Immediate)
* **Scope**: Eliminate unauthenticated invite abuse and protect multi-tenant enterprise data.
* **Affected Files**: `app/api/invite/route.ts`, `supabase/schema.sql`.
* **Implementation Steps**:
  1. Add `ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;` and `ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;`.
  2. Add member and admin RLS policies.
  3. Require `auth.getUser()` and organization admin verification in `app/api/invite/route.ts`.
* **Acceptance Criteria**: Unauthenticated requests to `/api/invite` return 401; PostgREST access to `organizations` is scoped strictly to active members.

---

### Task 3: Resolve Cross-Tenant Enterprise Leak & Fix Employee Onboarding Loop
* **Priority**: P0 / P1
* **Scope**: Scope enterprise directory to tenant and link invited employees to provisioned cards.
* **Affected Files**: `app/api/enterprise/members/route.ts`, `app/auth/callback/route.ts`, `app/dashboard/enterprise/page.tsx`.
* **Implementation Steps**:
  1. Update `GET /api/enterprise/members` to query `cards` where `org_id = current_user_org_id`.
  2. In `app/auth/callback/route.ts`, check for pending enterprise invites for the user's email; link `card.user_id = user.id` and assign `org_id`.
* **Acceptance Criteria**: Enterprise directory only displays cards belonging to the caller's organization; invited employees receive their card upon logging in.

---

### Task 4: Remove 1.5s LCP Blocker & Optimize Fonts / TTFB
* **Priority**: P1
* **Scope**: Eliminate artificial Core Web Vitals delay and reduce TTFB.
* **Affected Files**: `components/page-loader.tsx`, `app/layout.tsx`, `app/globals.css`, `app/[slug]/page.tsx`.
* **Implementation Steps**:
  1. Remove `PageLoader` from `app/layout.tsx`.
  2. Remove CSS `@import` in `app/globals.css`; load fonts via `next/font/google`.
  3. Make view logging in `app/[slug]/page.tsx` non-blocking.
* **Acceptance Criteria**: LCP drops by >1.5s; Lighthouse Performance score improves by >30 points.

---

### Task 5: Implement Complete OpenGraph, Twitter Cards, and Schema.org JSON-LD
* **Priority**: P1
* **Scope**: Fix social media preview cards and search engine indexability.
* **Affected Files**: `app/[slug]/page.tsx`, `app/page.tsx`.
* **Implementation Steps**:
  1. Add `openGraph.images`, `openGraph.url`, `twitter.card`, and canonical URL in `generateMetadata`.
  2. Inject Schema.org `Person` JSON-LD script into `app/[slug]/page.tsx`.
  3. Refactor `app/page.tsx` to a Server Component and export landing page metadata.
* **Acceptance Criteria**: Public card links display rich preview cards with avatar, title, and company on WhatsApp, LinkedIn, and Twitter; Schema.org test validator passes.

---

### Task 6: Secure AI Endpoints & Fix Identity Verification Insecure Fallbacks
* **Priority**: P1
* **Scope**: Prevent Gemini quota drain, prompt injection, and verification badge fraud.
* **Affected Files**: `app/api/ai/verify-identity/route.ts`, `app/api/ai/enhance-bio/route.ts`, `components/verify-modal.tsx`, `supabase/schema.sql`.
* **Implementation Steps**:
  1. Require user authentication across all `/api/ai/*` routes.
  2. Replace fallback auto-approval with strict fail-closed error handling.
  3. Deploy database trigger preventing client updates to `is_verified`.
* **Acceptance Criteria**: AI endpoints reject unauthenticated calls; verification errors prompt user retry instead of auto-approving.

---

### Task 7: Surface Missing Schema Fields & Avatar Upload in Card Editor
* **Priority**: P2
* **Scope**: Provide full editing capabilities for all database columns.
* **Affected Files**: `app/dashboard/cards/[id]/edit/page.tsx`, `components/avatar-upload.tsx`.
* **Implementation Steps**:
  1. Add form fields for `portfolio_url`, `office_address`, `skills`, and `work_location`.
  2. Implement avatar image uploader sending files to Supabase Storage `avatars/${user.id}/`.
  3. Render portfolio link and skills on public card client.
* **Acceptance Criteria**: Users can upload profile photos and configure all profile attributes from the card editor.

---

### Task 8: Implement Download Event Telemetry & PostgREST Filter Sanitization
* **Priority**: P2
* **Scope**: Track vCard/Wallet conversions and secure wallet query parameter parsing.
* **Affected Files**: `app/api/events/route.ts`, `app/api/wallet/route.ts`, `app/[slug]/public-card-client.tsx`.
* **Implementation Steps**:
  1. Create `POST /api/events` endpoint to increment `vcard_downloads_count` and log `card_events`.
  2. Trigger telemetry ping in `handleDownloadVCard` in `public-card-client.tsx`.
  3. Sanitize `cardIdOrSlug` parameter in `/api/wallet` using regex before querying.
* **Acceptance Criteria**: Dashboard "vCard Saves" metric increments on downloads; `/api/wallet` rejects malformed query parameters.
