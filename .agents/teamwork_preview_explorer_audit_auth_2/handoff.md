# Flow Audit & Verification Report: Authentication, Onboarding, Route Protection & Dashboard

**Auditor**: Explorer 1 (Authentication, Onboarding, Route Protection & Dashboard Flow Auditor)  
**Target Subsystems**:
- Authentication (`app/auth/page.tsx`, `app/auth/callback/route.ts`)
- Route Protection & Session Management (`proxy.ts`, `lib/supabase/middleware.ts`, `lib/supabase/client.ts`, `lib/supabase/server.ts`)
- Onboarding Wizard (`app/dashboard/onboarding/page.tsx`)
- Dashboard & Card Management (`app/dashboard/page.tsx`, `app/dashboard/layout.tsx`, `app/dashboard/cards/new/page.tsx`, `app/dashboard/cards/trash/page.tsx`)
- Associated APIs (`app/api/invite/route.ts`, `app/api/enterprise/*`, `app/api/ai/enhance-bio/route.ts`)
- Test Suite & Tooling (`package.json`)  
**Timestamp**: 2026-09-07T11:28:30Z  

---

## 1. Observation

### 1.1 Testing Infrastructure in `package.json`
Direct inspection of `/home/level-77/Desktop/digital_business_card/package.json`:
- Lines 5–10:
  ```json
  "scripts": {
    "dev": "next dev",
    "build": "next build --webpack",
    "start": "next start",
    "lint": "next lint"
  }
  ```
- DevDependencies (lines 35–45): `@tailwindcss/postcss`, `@types/minimatch`, `@types/node`, `@types/react`, `@types/react-dom`, `eslint`, `eslint-config-next`, `tailwindcss`, `typescript`.
- Command execution `npx playwright --version` outputs:
  ```
  Need to install the following packages:
    playwright@1.63.0
  Ok to proceed? (y)
  ```
- Command execution `npm run lint` yields:
  ```
  Invalid project directory provided, no such directory: /home/level-77/Desktop/digital_business_card/lint
  ```
- Exact observation: Neither `@playwright/test` nor `playwright` is installed in `dependencies` or `devDependencies`. No test runner (`jest`, `vitest`, `playwright`) exists.

### 1.2 Route Protection & Next.js 16 Proxy Architecture
- In Next.js 16.3.3 (`node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`, lines 13–16):
  > "Starting with Next.js 16, Middleware is now called Proxy to better reflect its purpose. The functionality remains the same."
- File `/home/level-77/Desktop/digital_business_card/proxy.ts` (lines 1–6):
  ```typescript
  import { type NextRequest } from "next/server";
  import { updateSession } from "@/lib/supabase/middleware";

  export async function proxy(request: NextRequest) {
    return await updateSession(request);
  }
  ```
- File `/home/level-77/Desktop/digital_business_card/lib/supabase/middleware.ts` (lines 48–63):
  ```typescript
  // Protect /dashboard routes
  if (
    !user &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If logged in and visiting /auth, redirect to /dashboard
  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  ```
- Verification: Next.js production build (`npm run build`) verifies proxy registration:
  ```
  Route (app)
  ...
  ƒ Proxy (Middleware)
  ```

### 1.3 Bug: Proxy Intercepts `/auth/callback` for Logged-in Users
- In `/home/level-77/Desktop/digital_business_card/lib/supabase/middleware.ts` at line 59:
  ```typescript
  if (user && request.nextUrl.pathname.startsWith("/auth")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  ```
- The path `"/auth/callback"` starts with `"/auth"`.
- When an already-authenticated user opens an invitation link or referral link (`/auth/callback?code=...&invite=...`) or accepts an enterprise invite, `user` is not null. Line 59 immediately redirects them to `/dashboard` without allowing `app/auth/callback/route.ts` to execute. Consequently, the invite code is not attributed and the enterprise invitation is never marked accepted.

### 1.4 Bug: Missing "Duplicate Card" Action in Dashboard
- In `/home/level-77/Desktop/digital_business_card/app/dashboard/page.tsx` (lines 349–391):
  Available actions per card:
  - Edit (`/dashboard/cards/${card.id}/edit`)
  - Signature (`/dashboard/cards/${card.id}/signature`)
  - Mode selector dropdown (`all` / `work` / `social`)
  - Publish / Unpublish toggle button
  - Move to Trash button (`Trash2`)
- There is NO duplicate / clone card button in `app/dashboard/page.tsx`, nor is there any duplicate handler or endpoint. The requirement explicitly specifies: *"Dashboard card listing, stats loading, create card button, delete/duplicate actions"*.

### 1.5 Bug: Navbar "Trash" Link Misroutes / Missing Query State
- In `/home/level-77/Desktop/digital_business_card/app/dashboard/layout.tsx` line 45:
  ```typescript
  { href: "/dashboard/cards/trash", label: "Trash", icon: Trash2, active: pathname === "/dashboard/cards/trash" }
  ```
- In `/home/level-77/Desktop/digital_business_card/app/dashboard/cards/trash/page.tsx` lines 4–6:
  ```typescript
  export default function TrashRedirect() {
    redirect("/dashboard");
  }
  ```
- In `/home/level-77/Desktop/digital_business_card/app/dashboard/page.tsx` lines 46–48:
  ```typescript
  const [view, setView] = useState<"active" | "trash">("active");
  ```
- `app/dashboard/page.tsx` does not inspect `useSearchParams()` or URL query parameters. When a user clicks "Trash" in the navbar, `/dashboard/cards/trash` redirects to `/dashboard`, where `view` is always `"active"`. The user never lands on the Trash tab from navigation.

### 1.6 Authentication & Guest Demo Findings in `app/auth/page.tsx`
- File `/home/level-77/Desktop/digital_business_card/app/auth/page.tsx`:
  - Lines 18–54: `handleSignInWithMagicLink` submits email via `supabase.auth.signInWithOtp`. Passes `invite` and `next`/`redirect` parameters to `emailRedirectTo`.
  - Lines 56–87: `handleSocialSignIn` supports `"google"` and `"github"`.
  - Lines 186–195: Telegram button is disabled (`disabled={true}`, title `"Telegram login coming soon"`).
  - There is NO "Guest Demo" login or demo bypass button on `/auth`.
  - Lines 89–90, 111–116: When `NEXT_PUBLIC_SUPABASE_URL` is undefined, client displays a red banner: `"Configuration Error: Missing Supabase Environment Variables..."`. Without a guest demo mode, unauthenticated users cannot access dashboard capabilities when credentials are not configured.

### 1.7 Onboarding Flow & Redirect Logic
- In `/home/level-77/Desktop/digital_business_card/app/auth/callback/route.ts` (lines 140–148):
  ```typescript
  const { count, error: cardError } = await supabase
    .from("cards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (!cardError && count === 0) {
    return NextResponse.redirect(`${origin}/dashboard/onboarding`);
  }
  ```
- First-time users with zero cards are automatically directed to `/dashboard/onboarding`.
- In `/home/level-77/Desktop/digital_business_card/app/dashboard/onboarding/page.tsx`:
  - 3-step setup wizard: Identity -> Contacts -> Visual Theme.
  - Generates initial card with default `classic-segmented` layout and selected theme.
  - Integrates `AiBioModal` (`/api/ai/enhance-bio`), which enforces authentication and rate limits while gracefully falling back if `GEMINI_API_KEY` is missing.
  - On finish, creates card and redirects to `/dashboard?created=true`.

### 1.8 Enterprise Onboarding & Administration
- In `/home/level-77/Desktop/digital_business_card/app/auth/callback/route.ts` (lines 73–136):
  - On user login, queries `org_invitations` for `status = 'pending'` and matching email.
  - Upserts user profile in `profiles`.
  - Updates provisioned card in `cards` setting `user_id = user.id`.
  - Inserts membership record into `organization_members`.
  - Sets invitation status to `'accepted'` with timestamp.
- In `/home/level-77/Desktop/digital_business_card/app/api/invite/route.ts`:
  - Enforces `supabase.auth.getUser()`.
  - Verifies caller has role `'admin'` in `organization_members`.
  - Calls `adminAuthClient.auth.admin.inviteUserByEmail`.
  - Records invitation in `org_invitations`.
- In `/home/level-77/Desktop/digital_business_card/app/api/enterprise/members/route.ts`:
  - GET: Resolves caller's `org_id` and queries cards belonging only to `org_id`. Returns empty array if caller is not an organization member.
  - POST: Enforces enterprise admin role before creating member cards or sending invites.

---

## 2. Logic Chain

1. **Test Infrastructure**:
   - Step 1: Inspection of `package.json` confirms no testing framework is installed.
   - Step 2: Attempting `npx playwright --version` requests npm package installation.
   - Step 3: Requirement R2 demands an automated Playwright E2E test suite.
   - Conclusion: Playwright test dependencies (`@playwright/test`) and configuration (`playwright.config.ts`) must be introduced.

2. **Route Protection & Session Routing**:
   - Step 1: Next.js 16 uses `proxy.ts` at project root to execute `updateSession(request)` across non-static routes.
   - Step 2: `lib/supabase/middleware.ts` redirects unauthenticated `/dashboard/*` requests to `/auth?redirect=...`, and redirects authenticated users visiting `/auth` to `/dashboard`.
   - Step 3: Because `/auth/callback` begins with `/auth`, an authenticated user triggering an invite or token exchange is intercepted at line 59 and bounced to `/dashboard`, failing the callback process.
   - Conclusion: Line 59 in `lib/supabase/middleware.ts` must exclude `/auth/callback`.

3. **Dashboard UX & Functional Completeness**:
   - Step 1: Requirement R1 requires full audit and operational readiness of dashboard actions, specifically mentioning delete and duplicate.
   - Step 2: Inspection of `app/dashboard/page.tsx` reveals complete implementation for delete (soft-delete to trash and permanent delete), but zero code for card duplication.
   - Step 3: Navbar contains a "Trash" link pointing to `/dashboard/cards/trash`, which redirects to `/dashboard`. `app/dashboard/page.tsx` defaults `view` state to `"active"` and ignores URL query parameters.
   - Conclusion: Card duplication must be implemented, and `app/dashboard/page.tsx` must support URL tab synchronization (e.g. `?tab=trash` or reading router search params).

4. **Onboarding & Enterprise Flow**:
   - Step 1: `app/auth/callback/route.ts` successfully routes zero-card users to `/dashboard/onboarding` and links invited enterprise employees to their provisioned card.
   - Step 2: `app/dashboard/onboarding/page.tsx` collects profile data and inserts into `cards` table with foreign key handling for `profiles`.
   - Conclusion: Onboarding flow is structurally sound; missing only demo-mode bypass when Supabase credentials are not configured.

---

## 3. Caveats

1. **Supabase Cloud Dependency**:
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are not set in the local environment.
   - In offline/demo mode, tests requiring live Supabase network calls will fail unless mock cookies or interceptors are used in Playwright tests.
2. **Third-Party OAuth Providers**:
   - Google and GitHub OAuth rely on redirect URLs registered with third-party developer consoles. Local E2E testing cannot simulate external OAuth consent screens without mock session injection or test credentials.
3. **Apple Wallet Certificates**:
   - Generating native `.pkpass` bundles requires Apple Developer certificates (`APPLE_PASS_TYPE_IDENTIFIER`, etc.), which gracefully return 501 in demo mode.

---

## 4. Conclusion

The authentication, onboarding, route protection, and dashboard subsystems are built on modern Next.js 16 conventions (`proxy.ts`, server actions, SSR Supabase client). However, 5 specific issues prevent production stability and full requirement satisfaction:

| Issue ID | Severity | Subsystem | Description & Remediation |
| :--- | :---: | :--- | :--- |
| **AUTH-01** | High | Test Infrastructure | Missing `@playwright/test` and E2E test runner in `package.json`. Playwright and browser runners must be installed. |
| **AUTH-02** | High | Proxy / Middleware | `lib/supabase/middleware.ts:59` intercepts `/auth/callback` for authenticated users. Must add `&& !request.nextUrl.pathname.startsWith("/auth/callback")`. |
| **AUTH-03** | Medium | Dashboard | Missing "Duplicate Card" feature in `app/dashboard/page.tsx`. Implement `handleDuplicateCard(card)` that copies card attributes with unique slug. |
| **AUTH-04** | Medium | Dashboard Routing | Navbar "Trash" link misroutes to `/dashboard` active view. `app/dashboard/page.tsx` must initialize state from `useSearchParams().get("tab") === "trash" ? "trash" : "active"`. |
| **AUTH-05** | Low | Auth / Demo | No Guest Demo button on `/auth`. In demo/testing mode, provide a one-click demo session bypass to explore the dashboard. |

---

## 5. Verification Method

### 5.1 Independent Code Verification
1. **Verify Missing Playwright**:
   ```bash
   grep -E 'playwright|jest|vitest' /home/level-77/Desktop/digital_business_card/package.json
   # Output: None
   ```
2. **Verify Next.js 16 Build & Proxy Registration**:
   ```bash
   npm run build
   # Output confirms: ƒ Proxy (Middleware) compiled successfully
   ```
3. **Verify Proxy `/auth/callback` Interception Bug**:
   Inspect line 59 in `/home/level-77/Desktop/digital_business_card/lib/supabase/middleware.ts`:
   ```typescript
   if (user && request.nextUrl.pathname.startsWith("/auth"))
   ```
   Note that `/auth/callback` satisfies `startsWith("/auth")`.

4. **Verify Missing Duplicate Action**:
   Inspect `/home/level-77/Desktop/digital_business_card/app/dashboard/page.tsx`:
   Search for `duplicate` or `clone` in the card action buttons (lines 349–391). Only `Edit`, `Signature`, mode dropdown, `Publish`, and `Trash` exist.

5. **Verify Trash Navigation Mismatch**:
   Inspect `/home/level-77/Desktop/digital_business_card/app/dashboard/cards/trash/page.tsx`:
   ```typescript
   redirect("/dashboard");
   ```
   Inspect `/home/level-77/Desktop/digital_business_card/app/dashboard/page.tsx`:
   `const [view, setView] = useState<"active" | "trash">("active");`
   No searchParam inspection exists.

---

## Proposed Remediation Code Snippets

### Fix for `lib/supabase/middleware.ts` (Line 59)
```typescript
  // If logged in and visiting /auth (excluding auth callback), redirect to /dashboard
  if (
    user && 
    request.nextUrl.pathname.startsWith("/auth") && 
    !request.nextUrl.pathname.startsWith("/auth/callback")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
```

### Fix for `app/dashboard/page.tsx` (Trash Tab URL Synchronization & Duplicate Action)
```typescript
  // 1. Sync view with ?tab= query parameter
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [view, setView] = useState<"active" | "trash">(tabParam === "trash" ? "trash" : "active");

  useEffect(() => {
    if (tabParam === "trash") {
      setView("trash");
    } else if (tabParam === "active") {
      setView("active");
    }
  }, [tabParam]);

  // 2. Duplicate Card Handler
  const handleDuplicateCard = async (card: CardItem) => {
    const randomSuffix = Math.random().toString(36).slice(2, 6);
    const newSlug = `${card.slug}-copy-${randomSuffix}`;
    const { id: _originalId, created_at: _c, views_count: _v, vcard_downloads_count: _vd, ...cardData } = card as any;
    
    const duplicateData = {
      ...cardData,
      slug: newSlug,
      full_name: `${card.full_name} (Copy)`,
      is_published: false,
    };

    const { data: newCard, error } = await supabase
      .from("cards")
      .insert(duplicateData)
      .select()
      .single();

    if (!error && newCard) {
      setCards((prev) => [newCard, ...prev]);
    }
  };
```

### Fix for `app/dashboard/cards/trash/page.tsx`
```typescript
import { redirect } from "next/navigation";

export default function TrashRedirect() {
  redirect("/dashboard?tab=trash");
}
```
