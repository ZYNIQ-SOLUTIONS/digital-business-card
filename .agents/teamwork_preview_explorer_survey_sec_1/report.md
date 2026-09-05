# Deep Technical Survey & Specification Mining Report: Requirement R1 (P0 Security Vulnerabilities)

**Target System**: Next.js 16.3.3 (App Router) + Supabase (PostgreSQL 15, Auth, Storage, RLS) + Tailwind CSS v4 + Google Gemini 2.5 Flash + PassKit  
**Author**: Specification Mining Specialist (`teamwork_preview_spec_miner`)  
**Date**: September 4, 2026  
**Repository**: `/home/level-77/Desktop/digital_business_card`  
**Output Path**: `/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_sec_1/report.md`  

---

## 1. Executive Summary & Mission Scope

This survey provides authoritative specification mining and exact remediation designs for **Requirement R1: Fix All 7 P0 Critical Security Vulnerabilities** as defined in `ORIGINAL_REQUEST.md` (Section ## 2026-09-04T12:34:31Z) and audited in `AUDIT_REPORT.md` (Section 3).

The 7 P0 vulnerabilities represent severe security exposures, multi-tenant directory leaks, complete public conversion funnel failures, and bypassable verification integrity gates:
1. **P0-1: Unauthenticated Admin Invite Endpoint** (`app/api/invite/route.ts`)
2. **P0-2: Missing Enterprise RLS on Organizations & Members** (`supabase/schema.sql`)
3. **P0-3: Public Lead Capture & Booking Blocked by RLS** (`app/api/connections/route.ts`, `app/api/bookings/route.ts`, `submit_public_lead` RPC)
4. **P0-4: Cross-Tenant Enterprise Directory Data Leakage** (`app/api/enterprise/members/route.ts`)
5. **P0-5: Storage Overwrite Vulnerability in Avatars Bucket** (`supabase/schema.sql`)
6. **P0-6: Verification Auto-Approval Fallback & Client Tampering** (`app/api/ai/verify-identity/route.ts`, `components/verify-modal.tsx`, `protect_verification_columns` trigger)
7. **P0-7: PostgREST Filter Injection in Apple Wallet Route** (`app/api/wallet/route.ts`)

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Enterprise Auth | Admin Invite User | Issues Supabase auth invitation email using service role admin client. Must require caller session and enterprise admin membership. | `POST /api/invite`, JSON: `{ email: string, orgId?: string }`, Cookie session | JSON: `{ success: true, data: User }` | 401 if unauthenticated; 403 if caller not enterprise admin; 400 for invalid email / Supabase auth error; 500 for server error | `app/api/invite/route.ts`, `AUDIT_REPORT.md:53-112` |
| 2 | Multi-Tenancy | Enterprise RLS Policies | Row Level Security policies scoping `organizations` and `organization_members` tables to authorized tenant members and admins. | PostgREST queries on `organizations`, `organization_members` with JWT token | Filtered table rows matching user's tenant organization | Unmatched rows hidden; unauthorized writes rejected with PostgreSQL error 42501 (RLS violation) | `supabase/schema.sql:246-314`, `AUDIT_REPORT.md:115-173` |
| 3 | Networking | Public Contact Exchange (Lead Capture) | Anonymous or authenticated visitors submit their contact information from a public card view (`ExchangeModal`). Uses `submit_public_lead` SECURITY DEFINER RPC to bypass RLS safely. | `POST /api/connections`, JSON: `{ name, email, phone?, company?, title?, cardId }` | JSON: `{ success: true, connection: { success: true, connection_id } }` | 400 if required fields missing; 500 if card not published or DB error | `app/api/connections/route.ts`, `supabase/schema.sql:384-429`, `components/exchange-modal.tsx` |
| 4 | Scheduling | Public Calendar Meeting Booking | Anonymous or authenticated visitors select a date/time slot and schedule a meeting with the cardholder (`BookingModal`). Uses `submit_public_lead` RPC to create connection lead. | `POST /api/bookings`, JSON: `{ cardId, visitorName, visitorEmail, visitorPhone?, meetingDate, meetingTime, meetingNotes? }` | JSON: `{ success: true, booking: { id, visitorName, visitorEmail, meetingDate, meetingTime, cardHost } }` | 400 if missing details; 404 if card not found/published; 500 if RPC fails (NEVER silently dropped) | `app/api/bookings/route.ts`, `components/booking-modal.tsx`, `AUDIT_REPORT.md:176-240` |
| 5 | Enterprise Directory | Enterprise Members Directory | Fetches all cards/employees belonging strictly to caller's enterprise organization (`org_id`). | `GET /api/enterprise/members`, Cookie session | JSON: `{ success: true, members: MemberCard[] }` | 401 if unauthenticated; returns `{ success: true, members: [] }` if caller has no organization; 500 on query error | `app/api/enterprise/members/route.ts`, `AUDIT_REPORT.md:242-277` |
| 6 | Cloud Storage | Avatar Bucket Isolation | Restricts uploads, updates, and deletes in Supabase `avatars` bucket to user's isolated subfolder `avatars/<auth.uid()>/...`. | Storage API requests to bucket `avatars` (`storage.objects`) | S3/Storage object create/update/delete confirmation | 403 Forbidden / RLS violation if path does not match `(storage.foldername(name))[1] = auth.uid()::text` | `supabase/schema.sql:172-194`, `AUDIT_REPORT.md:279-313` |
| 7 | AI Verification | Multimodal Biometric Verification | Analyzes live camera photo using Gemini 2.5 Flash. If verified, updates card verification via `service_role`. Must fail closed on any error. | `POST /api/ai/verify-identity`, JSON: `{ image: base64, cardId, fullName? }`, Cookie session | JSON: `{ success: true, verified: boolean, confidence: number, badge: string, reason: string }` | 401 if unauthenticated; 429 if rate limited (10/day); 400 if missing image; fail-closed `verified: false` on AI failure | `app/api/ai/verify-identity/route.ts`, `components/verify-modal.tsx`, `AUDIT_REPORT.md:316-350` |
| 8 | Security Control | Verification Column Protection Trigger | PostgreSQL BEFORE UPDATE trigger on `public.cards` preventing non-service_role callers from modifying `is_verified`, `verification_badge`, `verified_at`. | Any SQL UPDATE or PostgREST update on `public.cards` | Allows update to other columns; silently rolls back verification columns to `old` values if not `service_role` | Silently overrides client-tampered verification columns without breaking legitimate profile edits | `supabase/schema.sql:360-380`, `AUDIT_REPORT.md:328-348` |
| 9 | Mobile Wallet | Apple Wallet Pass Generation | Generates signed `.pkpass` bundle for Apple Wallet with QR code and card details. Validates `cardIdOrSlug` using UUID and slug regex to prevent filter injection. | `GET /api/wallet?cardId=<id>` or `GET /api/wallet?slug=<slug>` | Binary `.pkpass` stream (`Content-Type: application/vnd.apple.pkpass`) | 400 if parameter contains invalid characters outside `[a-z0-9-_]` or UUID; 501 if certs unconfigured; 500 on server error | `app/api/wallet/route.ts`, `AUDIT_REPORT.md:352-386` |

---

## 3. Edge Cases & Observed Behaviors

| # | Feature | Input | Observed / Expected Behavior |
|---|---------|-------|-------------------------------|
| 1 | P0-1 Invite Route | `POST /api/invite` without session cookies | Returns HTTP 401 `{ error: "Unauthorized" }`. |
| 2 | P0-1 Invite Route | Authenticated user who is `role: 'member'` calling `POST /api/invite` with `{ "email": "test@domain.com" }` | Returns HTTP 403 `{ error: "Forbidden: Enterprise Admin role required" }`. Admin check must NOT be bypassed when `orgId` is omitted. |
| 3 | P0-1 Invite Route | Authenticated user passing `orgId` where they are not an admin | Returns HTTP 403 `{ error: "Forbidden: Enterprise Admin role required" }`. |
| 4 | P0-1 Invite Route | Malformed email string (e.g. `"not-an-email"`, `""`) | Returns HTTP 400 `{ error: "Valid email is required" }`. |
| 5 | P0-2 Enterprise RLS | Querying `public.organization_members` as an authenticated user | Subqueries must use `SECURITY DEFINER` functions (`is_org_member`, `is_org_admin`) to avoid PostgreSQL error `42P17 (infinite recursion detected in policy for relation organization_members)`. |
| 6 | P0-2 Enterprise RLS | Direct PostgREST query on `/rest/v1/organizations` by anonymous user | Returns empty set `[]` (RLS blocks read). Unauthorized write returns 401/42501. |
| 7 | P0-3 Connections Route | Authenticated User A visits User B's published card and submits contact info via `ExchangeModal` | Because User A has a session cookie (`user != null`), the endpoint must NOT execute direct insert `user_id = User B.id` (which fails RLS 42501). It must call `submit_public_lead` RPC, successfully inserting the lead for User B. |
| 8 | P0-3 Bookings Route | Anonymous visitor books meeting on published card | Endpoint resolves card owner, executes `submit_public_lead` with `p_meeting_date` and `p_meeting_time`. Lead inserted into `connections` table; returns 200 `{ success: true, booking: ... }`. |
| 9 | P0-3 Bookings Route | Booking attempted with non-existent or unpublished `cardId` | Returns HTTP 404 `{ error: "Card not found or not published" }`. Does NOT return a false confirmation. |
| 10 | P0-3 Bookings Route | `submit_public_lead` RPC returns database error | Route catches `rpcError` and returns HTTP 500 `{ error: "Failed to record booking lead", details: ... }`. Does NOT swallow error. |
| 11 | P0-4 Enterprise Members | User with no organization membership calls `GET /api/enterprise/members` | Returns `{ success: true, members: [] }`. Must NOT return personal cards disguised as enterprise members. |
| 12 | P0-4 Enterprise Members | Company A admin calls `GET /api/enterprise/members` | Returns ONLY cards where `org_id = Company A.id`. Cards from Company B or independent users are strictly excluded. |
| 13 | P0-4 Enterprise Members | Admin provisions member via `POST /api/enterprise/members` | Created card record must explicitly include `org_id: membership.org_id` so it links to the tenant. |
| 14 | P0-5 Storage RLS | User A uploads file to `avatars/<User B id>/photo.png` | Storage RLS rejects upload with 403 Forbidden because `(storage.foldername(name))[1] != auth.uid()::text`. |
| 15 | P0-5 Storage RLS | User A uploads file to root `avatars/photo.png` (no folder) | Storage RLS rejects upload because `storage.foldername('photo.png')` is null, failing the check. |
| 16 | P0-5 Storage RLS | Authenticated user deletes own avatar `avatars/<User A id>/photo.png` | Permitted by DELETE policy matching user folder. |
| 17 | P0-6 Verification API | Gemini API key missing, invalid, or API throws network error | API fails closed: returns `{ success: true, verified: false, confidence: 0, reason: "..." }`. Does NOT auto-approve. |
| 18 | P0-6 Verification UI | Fetch call to `/api/ai/verify-identity` throws network error or timeout | Modal catch block sets `verified: false` and notifies parent component of failure. Does NOT auto-approve. |
| 19 | P0-6 Card Columns | Client issues direct PostgREST `PATCH /rest/v1/cards` with `{"is_verified": true}` | Trigger `protect_verification_columns()` runs; detects non-service_role caller and resets `is_verified := old.is_verified`. |
| 20 | P0-6 Card Columns | Legitimate verification completed by `/api/ai/verify-identity` | Endpoint invokes `createAdminClient()` (`service_role`) scoped to `.eq("id", cardId).eq("user_id", user.id)`. Trigger allows update. |
| 21 | P0-7 Wallet Route | Query param `cardId="123e4567-e89b-12d3-a456-426614174000"` (valid UUID) | Passes UUID validation regex; executes `.eq("id", cardId)`. |
| 22 | P0-7 Wallet Route | Query param `slug="john-doe-12"` (valid slug) | Passes slug validation regex `/^[a-z0-9-_]{1,100}$/i`; executes `.eq("slug", slug)`. |
| 23 | P0-7 Wallet Route | Query param `slug="test,id.neq.0"` or `slug="bad'val"` | Rejected immediately with HTTP 400 `{ error: "Invalid card identifier format" }`. |
| 24 | P0-7 Wallet Route | Both `cardId` and `slug` omitted from query string | Handles gracefully: rejects with 400 or provides default demo card preview without PostgREST injection. |

---

## 4. Deep-Dive Technical Survey & Remediation Specifications

### 4.1. Issue P0-1: Unauthenticated Admin Invite (`app/api/invite/route.ts`)

#### 4.1.1. Root Cause & Forensic Findings
- **File**: `app/api/invite/route.ts`, lines 4–60
- **Existing Logic**:
  ```typescript
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, orgId } = await request.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  if (orgId) {
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("org_id", orgId)
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();
    if (!membership) return NextResponse.json({ error: "Forbidden: Enterprise Admin role required" }, { status: 403 });
  }

  const adminAuthClient = createAdminClient();
  const { data, error } = await adminAuthClient.auth.admin.inviteUserByEmail(email, { redirectTo });
  ```
- **Vulnerability**:
  The admin verification is conditional on `if (orgId)`. When a caller sends `{ "email": "victim@example.com" }` without `orgId`, the admin check is completely bypassed! Any standard authenticated user can abuse this endpoint to send official invite emails via the service role client.
  In `app/dashboard/enterprise/page.tsx:149`, `handleResendInvite` calls `/api/invite` passing only `{ email }`.
- **Acceptance Criteria**:
  - `POST /api/invite` returns 401 when called without authentication credentials.
  - `POST /api/invite` returns 403 when called by an authenticated non-admin user (regardless of whether `orgId` is provided).
  - `POST /api/invite` returns 400 for invalid email input.
  - `POST /api/invite` returns 200 when invoked by an authorized organization admin.

#### 4.1.2. Exact Remediation Specification
```typescript
// app/api/invite/route.ts
import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { email, orgId } = body;

    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Verify caller has an active admin role in the specified or caller's organization
    let membershipQuery = supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .eq("role", "admin");

    if (orgId) {
      membershipQuery = membershipQuery.eq("org_id", orgId);
    }

    const { data: adminMembership } = await membershipQuery.maybeSingle();

    if (!adminMembership) {
      return NextResponse.json(
        { error: "Forbidden: Enterprise Admin role required" },
        { status: 403 }
      );
    }

    const adminAuthClient = createAdminClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";
    const redirectTo = `${baseUrl}/auth/callback`;

    const { data, error } = await adminAuthClient.auth.admin.inviteUserByEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      console.error("Supabase admin invite error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Server error during invite:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
```

---

### 4.2. Issue P0-2: Missing Enterprise RLS on Organizations & Members (`supabase/schema.sql`)

#### 4.2.1. Root Cause & Forensic Findings
- **File**: `supabase/schema.sql`, lines 246–314
- **Existing Logic**:
  `public.organizations` and `public.organization_members` are created.
  Lines 267–268 enable RLS:
  `alter table public.organizations enable row level security;`
  `alter table public.organization_members enable row level security;`
- **Vulnerability**:
  1. The policy `Members can view fellow organization members` queries `public.organization_members` directly from within a policy on `public.organization_members`:
     ```sql
     create policy "Members can view fellow organization members"
       on public.organization_members for select
       using (
         exists (
           select 1 from public.organization_members as m
           where m.org_id = organization_members.org_id
             and m.user_id = auth.uid()
         )
       );
     ```
     In PostgreSQL, self-referencing subqueries inside RLS policies trigger **PostgreSQL Error 42P17 (infinite recursion detected in policy for relation "organization_members")**!
  2. There is no `INSERT` policy for `public.organizations`, preventing enterprise onboarding flows from creating initial organization records.
- **Remediation Specification**:
  Define `SECURITY DEFINER` helper functions (`is_org_member`, `is_org_admin`) that execute with `SET search_path = public` to evaluate membership without triggering recursive RLS evaluation.

#### 4.2.2. Exact SQL Migration Specification
```sql
-- Enable Row Level Security on Enterprise Tables
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Helper functions to prevent recursive RLS execution
create or replace function public.is_org_member(p_org_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where org_id = p_org_id and user_id = p_user_id
  );
$$ language sql security definer set search_path = public stable;

create or replace function public.is_org_admin(p_org_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where org_id = p_org_id and user_id = p_user_id and role = 'admin'
  );
$$ language sql security definer set search_path = public stable;

grant execute on function public.is_org_member to authenticated, anon;
grant execute on function public.is_org_admin to authenticated, anon;

-- Organizations Policies
drop policy if exists "Organization members can view their organization" on public.organizations;
create policy "Organization members can view their organization"
  on public.organizations for select
  using (public.is_org_member(id, auth.uid()));

drop policy if exists "Organization admins can update organization profile" on public.organizations;
create policy "Organization admins can update organization profile"
  on public.organizations for update
  using (public.is_org_admin(id, auth.uid()));

drop policy if exists "Authenticated users can create organizations" on public.organizations;
create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.role() = 'authenticated');

-- Organization Members Policies
drop policy if exists "Members can view fellow organization members" on public.organization_members;
create policy "Members can view fellow organization members"
  on public.organization_members for select
  using (user_id = auth.uid() or public.is_org_member(org_id, auth.uid()));

drop policy if exists "Admins can manage organization members" on public.organization_members;
create policy "Admins can manage organization members"
  on public.organization_members for all
  using (public.is_org_admin(org_id, auth.uid()))
  with check (public.is_org_admin(org_id, auth.uid()));
```

---

### 4.3. Issue P0-3: Public Lead Capture Blocked by RLS (`app/api/connections/route.ts`, `app/api/bookings/route.ts`, `submit_public_lead`)

#### 4.3.1. Root Cause & Forensic Findings
- **Files**:
  - `supabase/schema.sql`, lines 384–429 (`submit_public_lead` function)
  - `app/api/connections/route.ts`, lines 35–84
  - `app/api/bookings/route.ts`, lines 7–55
- **Vulnerabilities**:
  1. In `app/api/connections/route.ts:67`:
     ```typescript
     if (!user && cardId) {
       const { data: rpcResult, error: rpcError } = await supabase.rpc("submit_public_lead", ...);
       ...
       return NextResponse.json({ success: true, connection: rpcResult });
     }
     ```
     If a visitor happens to be authenticated with their own IZN account (e.g. User A visits User B's card), `!user` is FALSE. The handler falls through to line 105:
     `supabase.from("connections").insert({ user_id: ownerId, card_id: cardId, ... })`
     Since `ownerId` is User B's ID, and `auth.uid()` is User A's ID, Supabase RLS throws `42501 (RLS violation)`. The contact exchange crashes with HTTP 500!
     **Fix**: Trigger `submit_public_lead` whenever `cardId` is present and the caller is not the owner (`!user || user.id !== ownerId`).
  2. In `app/api/bookings/route.ts:37–54`:
     ```typescript
     if (card?.user_id) {
       try {
         const { error: rpcError } = await supabase.rpc("submit_public_lead", { ... });
         if (rpcError) console.warn("Booking RPC warning:", rpcError.message);
       } catch (connErr) {
         console.warn("Could not record booking lead:", connErr);
       }
     }
     return NextResponse.json({ success: true, booking: { ... } });
     ```
     If `card` is not found, or if `submit_public_lead` returns `rpcError`, the route catches or logs it with `console.warn` and returns HTTP 200 `{ success: true }`! The visitor sees "Meeting Confirmed!", but the booking is silently dropped and never recorded in the cardholder's connections table!
     **Fix**: Validate `card` exists and is published. If `rpcError` occurs, return HTTP 500.

#### 4.3.2. Exact Remediation Specification

##### `app/api/connections/route.ts`
```typescript
// Replace lines 47-83 in app/api/connections/route.ts:
    // Determine card ownership
    let ownerId = userIdOverride || user?.id;
    let ownerName = "I";
    let ownerCompany = "my company";

    if (cardId) {
      const { data: cardData } = await supabase
        .from("cards")
        .select("user_id, full_name, company, is_published")
        .eq("id", cardId)
        .single();

      if (cardData) {
        ownerId = cardData.user_id;
        ownerName = cardData.full_name || ownerName;
        ownerCompany = cardData.company || ownerCompany;
      }
    }

    // Public card exchange: If cardId is provided and caller is not the owner
    if (cardId && (!user || user.id !== ownerId)) {
      const { data: rpcResult, error: rpcError } = await supabase.rpc("submit_public_lead", {
        p_card_id: cardId,
        p_name: name,
        p_email: email || "",
        p_phone: phone || null,
        p_company: company || null,
        p_title: title || null,
      });

      if (rpcError) {
        console.error("Public lead RPC error:", rpcError);
        return NextResponse.json(
          { error: "Failed to submit contact information", details: rpcError.message },
          { status: 500 }
        );
      }

      // Trigger Webhook if configured
      if (ownerId) await triggerCrmWebhook(supabase, ownerId, data);

      return NextResponse.json({ success: true, connection: rpcResult });
    }
```

##### `app/api/bookings/route.ts`
```typescript
// app/api/bookings/route.ts
/* eslint-disable */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      cardId,
      visitorName,
      visitorEmail,
      visitorPhone = "",
      meetingDate,
      meetingTime,
      meetingNotes = "",
    } = body;

    if (!cardId || !visitorName || !visitorEmail || !meetingDate || !meetingTime) {
      return NextResponse.json(
        { error: "Missing required booking details." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify target card exists and is published
    const { data: card, error: cardError } = await supabase
      .from("cards")
      .select("id, user_id, full_name, email_work, is_published")
      .eq("id", cardId)
      .single();

    if (cardError || !card || !card.is_published) {
      return NextResponse.json(
        { error: "Card not found or is not published." },
        { status: 404 }
      );
    }

    // Submit booking lead via SECURITY DEFINER RPC
    const { data: rpcResult, error: rpcError } = await supabase.rpc("submit_public_lead", {
      p_card_id: card.id,
      p_name: visitorName,
      p_email: visitorEmail,
      p_phone: visitorPhone || null,
      p_company: null,
      p_title: null,
      p_meeting_date: meetingDate,
      p_meeting_time: meetingTime,
      p_notes: meetingNotes || null,
    });

    if (rpcError) {
      console.error("Booking RPC error:", rpcError);
      return NextResponse.json(
        { error: "Failed to record booking lead", details: rpcError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: (rpcResult as any)?.connection_id || `bk_${Date.now()}`,
        visitorName,
        visitorEmail,
        meetingDate,
        meetingTime,
        cardHost: card.full_name || "Card Host",
      },
    });
  } catch (error: any) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { error: "Failed to record booking", details: error.message },
      { status: 500 }
    );
  }
}
```

---

### 4.4. Issue P0-4: Cross-Tenant Enterprise Directory Leak (`app/api/enterprise/members/route.ts`)

#### 4.4.1. Root Cause & Forensic Findings
- **File**: `app/api/enterprise/members/route.ts`, lines 7–63
- **Existing Logic**:
  ```typescript
  const { data: membership } = await supabase
    .from("organization_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .single();

  const query = supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: cards, error } = membership?.org_id
    ? await query.eq("org_id", membership.org_id)
    : await query.eq("user_id", user.id);
  ```
- **Vulnerabilities**:
  1. In `GET`: If the user has no enterprise membership (`membership?.org_id` is undefined), it falls back to returning the user's personal cards disguised as "Enterprise Members", instead of returning an empty array.
  2. In `POST`: When an enterprise admin provisions an employee card, `newCard` does NOT include `org_id: membership.org_id`. As a result, the newly created card has `org_id = null` and never appears in subsequent scoped queries!
  3. In `POST`: Non-admins can invoke the endpoint to provision cards.

#### 4.4.2. Exact Remediation Specification
```typescript
// app/api/enterprise/members/route.ts
/* eslint-disable */
import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve caller's organization membership
    const { data: membership } = await supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    // If caller has no organization, return empty directory (no cross-tenant leak)
    if (!membership?.org_id) {
      return NextResponse.json({ success: true, members: [] });
    }

    // Strictly scope cards query to caller's organization
    const { data: cards, error } = await supabase
      .from("cards")
      .select("*")
      .eq("org_id", membership.org_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      members: (cards || []).map((c: any) => ({
        id: c.id,
        fullName: c.full_name,
        email: c.email_work || c.email_personal || "",
        title: c.title,
        company: c.company,
        department: c.department || "Executive",
        phone: c.phone_primary || "",
        role: "Member",
        status: c.is_published ? "Active" : "Draft",
        slug: c.slug,
        isVerified: c.is_verified || false,
        theme: c.theme || "apple-light",
        bio: c.bio || "",
        viewsCount: c.views_count || 0,
      })),
    });
  } catch (error: any) {
    console.error("Enterprise members fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization members", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify caller is an admin of an organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("org_id, role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership?.org_id || membership.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: Enterprise Admin role required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      fullName,
      email,
      title,
      department = "General",
      phone = "",
      company = "ZYNIQ Enterprise",
      sendInvite = true,
    } = body;

    if (!fullName || !email || !title) {
      return NextResponse.json(
        { error: "Name, email, and job title are required." },
        { status: 400 }
      );
    }

    const names = fullName.trim().split(" ");
    const initials = names.length > 1
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : (names[0] ? names[0].slice(0, 2).toUpperCase() : "IK");

    const slug = `${fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36).slice(-4)}`;

    // Explicitly set org_id on newly provisioned enterprise card
    const newCard = {
      user_id: user.id,
      org_id: membership.org_id,
      slug,
      is_published: true,
      full_name: fullName,
      avatar_initials: initials,
      title,
      company,
      department,
      phone_primary: phone,
      email_work: email,
      theme: "apple-light",
      skills: ["Enterprise", department],
    };

    const { data: createdCard, error: cardError } = await supabase
      .from("cards")
      .insert(newCard)
      .select()
      .single();

    if (cardError) throw cardError;

    // Send invitation email if requested
    let inviteSuccess = false;
    if (sendInvite) {
      try {
        const adminClient = createAdminClient();
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://d-b-c.netlify.app";
        const redirectTo = `${baseUrl}/auth/callback`;

        const { error: inviteErr } = await adminClient.auth.admin.inviteUserByEmail(email, {
          redirectTo,
        });
        if (!inviteErr) {
          inviteSuccess = true;
        } else {
          console.warn("Invite email warning:", inviteErr.message);
        }
      } catch (invErr) {
        console.warn("Could not dispatch invite via admin API:", invErr);
      }
    }

    return NextResponse.json({
      success: true,
      member: createdCard,
      inviteSent: inviteSuccess,
    });
  } catch (error: any) {
    console.error("Enterprise create member error:", error);
    return NextResponse.json(
      { error: "Failed to create organization member", details: error.message },
      { status: 500 }
    );
  }
}
```

---

### 4.5. Issue P0-5: Storage Overwrite Vulnerability in `avatars` Bucket (`supabase/schema.sql`)

#### 4.5.1. Root Cause & Forensic Findings
- **File**: `supabase/schema.sql`, lines 172–194
- **Existing Logic**:
  - `UPDATE` policy enforces: `bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text`
  - `INSERT` policy enforces: `bucket_id = 'avatars' and auth.role() = 'authenticated' and (storage.foldername(name))[1] = auth.uid()::text`
  - `DELETE` policy is completely missing.
- **Remediation Specification**:
  Ensure all write operations (`INSERT`, `UPDATE`, `DELETE`) on bucket `avatars` enforce path ownership `(storage.foldername(name))[1] = auth.uid()::text`.

#### 4.5.2. Exact SQL Migration Specification
```sql
-- Ensure bucket exists
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Clean up existing policies
drop policy if exists "Avatar images are publicly accessible." on storage.objects;
drop policy if exists "Authenticated users can upload avatar images." on storage.objects;
drop policy if exists "Authenticated users can update their avatar images." on storage.objects;
drop policy if exists "Authenticated users can delete their avatar images." on storage.objects;

-- 1. Public Read Policy
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

-- 2. Insert Policy (Isolated to avatars/<auth.uid()>/...)
create policy "Authenticated users can upload avatar images."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 3. Update Policy (Isolated to avatars/<auth.uid()>/...)
create policy "Authenticated users can update their avatar images."
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Delete Policy (Isolated to avatars/<auth.uid()>/...)
create policy "Authenticated users can delete their avatar images."
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

### 4.6. Issue P0-6: Verification Auto-Approval Fallback & Client Tampering

#### 4.6.1. Root Cause & Forensic Findings
- **Files**:
  - `components/verify-modal.tsx`, lines 179–192
  - `app/api/ai/verify-identity/route.ts`, lines 124–140
  - `supabase/schema.sql`, lines 360–380
- **Vulnerabilities**:
  1. In `components/verify-modal.tsx:181–189`:
     ```tsx
     } catch (err) {
       console.error("AI verification failed:", err);
       // Fallback approval for seamless user experience
       const fallbackResult = {
         verified: true,
         confidence: 96,
         reason: "Face identity authenticated via high-resolution live capture.",
         badge: "ai_verified_executive",
       };
       setVerificationResult(fallbackResult);
       onVerified(fallbackResult);
     }
     ```
     This auto-approves verification on ANY network or server failure!
  2. In `app/api/ai/verify-identity/route.ts:127`:
     The route calls `const supabase = await createClient();` to update `is_verified: true`. Because `createClient()` operates under the `authenticated` role, the PostgreSQL trigger `protect_verification_columns()` sees `role != 'service_role'` and reverts `is_verified` back to `old.is_verified` (false). The legitimate server update fails silently!
     **Fix**: The route must use `createAdminClient()` (`service_role`) scoped to `.eq("id", cardId).eq("user_id", user.id)`.

#### 4.6.2. Exact Remediation Specification

##### `components/verify-modal.tsx`
```tsx
// Replace lines 171-192 in components/verify-modal.tsx:
      } else {
        const failureResult = {
          verified: false,
          confidence: data.confidence || 0,
          reason: data.reason || data.error || "Could not confirm identity. Please try again in good lighting.",
          badge: "unverified",
        };
        setVerificationResult(failureResult);
        onVerified(failureResult);
      }
    } catch (err) {
      console.error("AI verification failed:", err);
      // Fail closed — do NOT auto-approve on error
      const errorResult = {
        verified: false,
        confidence: 0,
        reason: "Verification service temporarily unavailable. Please try again.",
        badge: "unverified",
      };
      setVerificationResult(errorResult);
      onVerified(errorResult);
    } finally {
      setIsVerifying(false);
    }
```

##### `app/api/ai/verify-identity/route.ts`
```typescript
// Replace lines 124-140 in app/api/ai/verify-identity/route.ts:
    // If verified and cardId provided, update card in Supabase via service_role
    if (verificationResult.verified && cardId) {
      try {
        const { createAdminClient } = await import("@/lib/supabase/server");
        const adminClient = createAdminClient();
        const { error: dbErr } = await adminClient
          .from("cards")
          .update({
            is_verified: true,
            verified_at: new Date().toISOString(),
            verification_badge: verificationResult.badge,
          })
          .eq("id", cardId)
          .eq("user_id", user.id);

        if (dbErr) {
          console.warn("Could not persist verification to database:", dbErr);
        }
      } catch (dbErr) {
        console.warn("Could not persist verification to database:", dbErr);
      }
    }
```

##### `supabase/schema.sql` (Trigger Definition)
```sql
create or replace function public.protect_verification_columns()
returns trigger as $$
begin
  if (new.is_verified is distinct from old.is_verified or
      new.verification_badge is distinct from old.verification_badge or
      new.verified_at is distinct from old.verified_at) then
    if coalesce(auth.role(), '') != 'service_role' and coalesce(current_setting('role', true), '') != 'service_role' then
      new.is_verified := old.is_verified;
      new.verification_badge := old.verification_badge;
      new.verified_at := old.verified_at;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_protect_card_verification on public.cards;
create trigger tr_protect_card_verification
  before update on public.cards
  for each row execute function public.protect_verification_columns();
```

---

### 4.7. Issue P0-7: PostgREST Filter Injection in Apple Wallet Route (`app/api/wallet/route.ts`)

#### 4.7.1. Root Cause & Forensic Findings
- **File**: `app/api/wallet/route.ts`, lines 10–47
- **Existing Logic**:
  Lines 24–29 currently validate `cardIdOrSlug`:
  `const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cardIdOrSlug);`
  `const isSlug = /^[a-z0-9][a-z0-9-_]{1,98}[a-z0-9]$/i.test(cardIdOrSlug);`
- **Flaw in Current Regex**:
  The slug regex `/^[a-z0-9][a-z0-9-_]{1,98}[a-z0-9]$/i` requires a minimum length of 3 characters (`[a-z0-9]` + `{1,98}` + `[a-z0-9]`), which improperly rejects 1-character or 2-character valid slugs (e.g. `jd` or `me`).
- **Acceptance Criteria**:
  - `app/api/wallet` rejects requests where `cardId` or `slug` parameter contains characters outside `[a-z0-9-_]` or UUID format.
  - Separate `.eq("id", ...)` or `.eq("slug", ...)` used exclusively; no concatenated `.or(...)`.

#### 4.7.2. Exact Remediation Specification
```typescript
// app/api/wallet/route.ts (lines 10-48)
    const { searchParams } = new URL(request.url);
    const rawCardId = searchParams.get("cardId");
    const rawSlug = searchParams.get("slug");
    const cardIdOrSlug = rawCardId || rawSlug;

    let cardData: any = {
      full_name: "Ibrahim El Khalil",
      company: "ZYNIQ",
      title: "Founder & AI Architect",
      phone_primary: "+1 (555) 019-2834",
      email_work: "ibrahim@zyniq.solutions",
      website_primary: "https://zyniq.solutions",
    };

    if (cardIdOrSlug) {
      // Validate input strictly to prevent PostgREST filter injection
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cardIdOrSlug);
      const isSlug = /^[a-z0-9-_]{1,100}$/i.test(cardIdOrSlug);

      if (!isUUID && !isSlug) {
        return NextResponse.json({ error: "Invalid card identifier format" }, { status: 400 });
      }

      try {
        const supabase = await createClient();
        let query = supabase.from("cards").select("*");
        if (isUUID) {
          query = query.eq("id", cardIdOrSlug);
        } else {
          query = query.eq("slug", cardIdOrSlug);
        }
        const { data: fetchedCard } = await query.single();

        if (fetchedCard) {
          cardData = fetchedCard;
        }
      } catch {
        // Fallback to default card if DB lookup isn't active
      }
    }
```

---

## 5. Consolidated SQL Migration (`supabase/migrations/002_p0_security_hardening.sql`)

Below is the complete, idempotent, production-ready SQL script resolving all database-level P0 requirements (P0-2, P0-3, P0-5, P0-6):

```sql
-- =============================================================================
-- MIGRATION: 002_p0_security_hardening.sql
-- Fixes: P0-2 (Enterprise RLS), P0-3 (Public Lead Capture), P0-5 (Storage RLS), P0-6 (Verification Trigger)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. P0-5: Avatars Bucket Path Ownership Storage RLS
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible." on storage.objects;
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Authenticated users can upload avatar images." on storage.objects;
create policy "Authenticated users can upload avatar images."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can update their avatar images." on storage.objects;
create policy "Authenticated users can update their avatar images."
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Authenticated users can delete their avatar images." on storage.objects;
create policy "Authenticated users can delete their avatar images."
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- -----------------------------------------------------------------------------
-- 2. P0-2: Enterprise & Organization Row Level Security
-- -----------------------------------------------------------------------------
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

-- Non-recursive helper functions
create or replace function public.is_org_member(p_org_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where org_id = p_org_id and user_id = p_user_id
  );
$$ language sql security definer set search_path = public stable;

create or replace function public.is_org_admin(p_org_id uuid, p_user_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.organization_members
    where org_id = p_org_id and user_id = p_user_id and role = 'admin'
  );
$$ language sql security definer set search_path = public stable;

grant execute on function public.is_org_member to authenticated, anon;
grant execute on function public.is_org_admin to authenticated, anon;

-- Organizations Policies
drop policy if exists "Organization members can view their organization" on public.organizations;
create policy "Organization members can view their organization"
  on public.organizations for select
  using (public.is_org_member(id, auth.uid()));

drop policy if exists "Organization admins can update organization profile" on public.organizations;
create policy "Organization admins can update organization profile"
  on public.organizations for update
  using (public.is_org_admin(id, auth.uid()));

drop policy if exists "Authenticated users can create organizations" on public.organizations;
create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.role() = 'authenticated');

-- Organization Members Policies
drop policy if exists "Members can view fellow organization members" on public.organization_members;
create policy "Members can view fellow organization members"
  on public.organization_members for select
  using (user_id = auth.uid() or public.is_org_member(org_id, auth.uid()));

drop policy if exists "Admins can manage organization members" on public.organization_members;
create policy "Admins can manage organization members"
  on public.organization_members for all
  using (public.is_org_admin(org_id, auth.uid()))
  with check (public.is_org_admin(org_id, auth.uid()));

-- -----------------------------------------------------------------------------
-- 3. P0-3: Public Lead & Booking Capture RPC Function (SECURITY DEFINER)
-- -----------------------------------------------------------------------------
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
$$ language plpgsql security definer set search_path = public;

grant execute on function public.submit_public_lead to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4. P0-6: Verification Column Protection Trigger
-- -----------------------------------------------------------------------------
create or replace function public.protect_verification_columns()
returns trigger as $$
begin
  if (new.is_verified is distinct from old.is_verified or
      new.verification_badge is distinct from old.verification_badge or
      new.verified_at is distinct from old.verified_at) then
    if coalesce(auth.role(), '') != 'service_role' and coalesce(current_setting('role', true), '') != 'service_role' then
      new.is_verified := old.is_verified;
      new.verification_badge := old.verification_badge;
      new.verified_at := old.verified_at;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_protect_card_verification on public.cards;
create trigger tr_protect_card_verification
  before update on public.cards
  for each row execute function public.protect_verification_columns();

-- Notify PostgREST schema cache reload
notify pgrst, 'reload schema';
```

---

## 6. Implementation Checklist & Acceptance Test Matrix

| Item | Requirement / Vulnerability | Acceptance Verification Criterion | Verification Method |
|:---:|---|---|---|
| **P0-1** | `app/api/invite/route.ts` | Returns 401 when called without credentials | `curl -X POST http://localhost:3000/api/invite -d '{"email":"test@example.com"}'` -> HTTP 401 |
| **P0-1** | `app/api/invite/route.ts` | Returns 403 when called by authenticated non-admin (with or without `orgId`) | `curl -X POST http://localhost:3000/api/invite -H "Cookie: ...member_session..." -d '{"email":"test@example.com"}'` -> HTTP 403 |
| **P0-2** | `supabase/schema.sql` | `public.organizations` & `organization_members` have RLS enabled and non-recursive policies | Verify `pg_tables` `rowsecurity = true` and execute member select query without 42P17 error |
| **P0-3** | `app/api/connections/route.ts` | Anonymous or cross-user lead submission creates record in `connections` table | Submit contact via `ExchangeModal`; verify row inserted in `connections` with `card_id` and owner's `user_id` |
| **P0-3** | `app/api/bookings/route.ts` | Public meeting booking creates record in `connections` table; does not silently swallow errors | Submit booking via `BookingModal`; verify row in `connections` with location "Digital Calendar Booking" and 200 response |
| **P0-4** | `app/api/enterprise/members/route.ts` | `GET` returns only cards matching caller's `org_id`; returns `[]` if no org | Authenticate as Org A admin: verify 0 cards from Org B appear. Authenticate as individual: verify `members: []` |
| **P0-5** | `supabase/schema.sql` | Storage `avatars` bucket enforces `(storage.foldername(name))[1] = auth.uid()::text` for INSERT, UPDATE, DELETE | Try uploading to `avatars/another-user-id/pic.png` -> 403 Forbidden |
| **P0-6** | `app/api/ai/verify-identity/route.ts` & `components/verify-modal.tsx` | Error / missing key fails closed (`verified: false`); trigger prevents direct client tampering | Disconnect network or omit key in modal; verify user is NOT marked verified. Execute direct Supabase client update; verify `is_verified` remains false |
| **P0-7** | `app/api/wallet/route.ts` | Rejects `cardId` or `slug` with characters outside `[a-z0-9-_]` or UUID format with HTTP 400 | `curl "http://localhost:3000/api/wallet?cardId=invalid,injection"` -> HTTP 400 `{ error: "Invalid card identifier format" }` |
