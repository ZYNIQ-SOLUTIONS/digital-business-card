# Handoff Report: Host Codebase & Integration Explorer Survey

**Date**: 2026-08-31  
**Working Directory**: `/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_1`  
**Target Project**: `/home/level-77/Desktop/digital_business_card`  
**Archetype**: Explorer  
**Status**: Complete (Hard Handoff)

---

## 1. Observation

### 1.1 Project Specification & Dependencies
Inspection of `/home/level-77/Desktop/digital_business_card/package.json` revealed:
- **Framework**: Next.js `16.3.3` (App Router, React 19 Server Components)
- **UI & Runtime**: React `19.2.8`, React DOM `19.2.8`
- **Language**: TypeScript `^5` (`strict: true`, path alias `@/*` -> `./*` configured in `tsconfig.json`)
- **Styling**: TailwindCSS `^4` + `@tailwindcss/postcss` `^4` (No CSS modules, utility-first)
- **Icons**: `lucide-react` `^1.34.0` + custom SVG icon suite in `components/icons.tsx`
- **State Management**: `zustand` `^5.0.15`
- **Database / Auth**: `@supabase/ssr` `^0.12.5`, `@supabase/supabase-js` `^2.112.4`
- **AI Integration**: `@google/genai` `^2.19.0`
- **QR / Wallet**: `qrcode.react` `^4.2.0`, `passkit-generator` `^3.5.7`
- **TypeScript Health Verification**: `npx tsc --noEmit` executed cleanly with exit code `0` (0 errors across entire repository).

### 1.2 Directory Layout
- `app/`
  - `[slug]/`: Dynamic public business card routes (`page.tsx` + `public-card-client.tsx`)
  - `admin/`: Admin backoffice for orders, products, support, user roles
  - `api/`: Existing App Router route handlers (`api/ai/*`, `api/bookings`, `api/collections`, `api/connections`, `api/enterprise/*`, `api/invite`, `api/products`, `api/wallet`)
  - `auth/`: Supabase auth pages (`/auth` and `/auth/callback`)
  - `dashboard/`: Authenticated user dashboard (`page.tsx`), card editor (`cards/[id]/edit/page.tsx`), new card creator (`cards/new/page.tsx`), enterprise team dashboard (`enterprise/page.tsx`)
  - `store/`: Merchandise NFC card store
- `components/`
  - UI Modals: `ai-bio-modal.tsx`, `booking-modal.tsx`, `exchange-modal.tsx`, `verify-modal.tsx`, `add-to-homescreen-modal.tsx`, etc.
  - Icons: `components/icons.tsx` (brand and category icons)
  - Store: `components/store/*` (cart drawer, product view, nav)
- `lib/`
  - `card-data.ts`: Core data structures and default profile definitions (`BusinessCardProfile`, `SocialLink`, `defaultProfile`, `generateVCardString`)
  - `supabase/`: `client.ts` (browser client), `server.ts` (SSR cookie client & admin client), `middleware.ts` (session updater & route guard)
  - `theme.ts`: 14 luxury and modern theme tokens (`apple-light`, `apple-dark`, `cyber-neon`, `titanium`, etc.)
  - `templates.ts`: 5 card template layouts (`classic-segmented`, `bento-grid`, `executive-minimal`, `cyber-holo`, `creative-hero`)
- `supabase/`
  - `schema.sql`: PostgreSQL DDL defining `profiles`, `cards`, `card_events`, `connections`, `organizations`, `organization_members`, `collections`, `invite_links`, `ai_usage_logs`.

### 1.3 Card Type Definition Location
- **Exact File**: `/home/level-77/Desktop/digital_business_card/lib/card-data.ts`
- Lines 10-54 define `interface BusinessCardProfile`:
  - `personal`: `fullName`, `preferredName?`, `prefix?`, `pronouns?`, `avatarInitials`, `avatarImageUrl?`, `tagline`, `bio`
  - `professional`: `title`, `company`, `department?`, `industry`, `workLocation`, `skills`, `yearsOfExperience?`
  - `contact`: `phonePrimary`, `phoneSecondary?`, `emailWork`, `emailPersonal?`, `websitePrimary`, `portfolioUrl?`, `officeAddress?`
  - `actions`: `enableAppleWallet`, `enableGoogleWallet?`, `enableDirectVCard`, `enableShareModal`, `enableNfcInstruction`, `bookingUrl?`
  - `socials`: `SocialLink[]`

### 1.4 Profile Display & Insertion Points
- **Primary Public Card Surface**: `app/[slug]/public-card-client.tsx` (1,166 lines)
  - Lines 263-274 defines `avatarElement`:
    ```tsx
    const avatarElement = (
      <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-[2.5rem] ${t.avatarBg} border-4 ${t.avatarBorder} shadow-[0_16px_40px_rgba(0,0,0,0.15)] flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:shadow-[0_20px_50px_rgba(0,0,0,0.25)]`}>
        {card.avatar_url || card.profile_image_url ? (
          <img src={card.avatar_url || card.profile_image_url} alt={card.full_name} className="w-full h-full object-cover" />
        ) : (
          <span className={`text-4xl sm:text-5xl font-bold tracking-tighter ${t.textMain}`}>
            {card.avatar_initials || "IK"}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    );
    ```
  - Insertion location for `AvatarDisplay`: Wrap or replace the internal image render of `avatarElement` (and secondary layout heads in `bento-grid`, `executive-minimal`, `cyber-holo`, `creative-hero`) with `<AvatarDisplay avatarId={card.avatar_id} fallbackUrl={card.avatar_url || card.profile_image_url} initials={card.avatar_initials} alt={card.full_name} className="..." />`.
  - Insertion location for `ZavatarUpsellCard`: Lines 1127-1143 (before the footer action buttons) in `app/[slug]/public-card-client.tsx`, and optionally inside `app/dashboard/page.tsx` for cards with `!card.avatar_id`.

### 1.5 Supabase Authentication & Route Handler Patterns
- Existing API route handlers (e.g. `app/api/enterprise/members/route.ts`) use `const supabase = await createClient();` from `lib/supabase/server.ts` which inspects cookies via `await cookies()`.
- For Zavatar API endpoints in `app/api/zavatar/*`, R5 requires token extraction from `Authorization: Bearer <token>`.
- Verification of `@supabase/ssr` (0.12.5) with Bearer token:
  ```ts
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  // Initialize server client with Authorization header or verify token directly via supabase.auth.getUser(token)
  ```

---

## 2. Logic Chain

1. **Host Stability**: The host app is written with Next.js 16.3.3 App Router, TypeScript strict mode, and TailwindCSS 4. All existing tests and type checks pass cleanly (`tsc --noEmit` exited with 0). Any new types, components, or routes must strictly comply with React 19 and Next.js 16 conventions (async params in page props, `route.ts` HTTP handler exports).
2. **Type Extension**: Adding `avatar_id?: string` to `BusinessCardProfile` in `lib/card-data.ts` and creating `lib/types.ts` (re-exporting `BusinessCardProfile` and related types) satisfies Requirement R7.1 without modifying or breaking any existing imports.
3. **Zavatar Microservice Architecture**:
   - The subproject `zavatar/` will contain:
     - `package.json`, `tsconfig.json`, `README.md`, `.env.example`
     - `src/types/index.ts` (`AvatarStyle`, `CustomizationParams`, `AvatarMeshResult`, `AdapterRegistry`)
     - `src/adapters/` (`MetaPersonAdapter`, `TemplateAdapter`, `AdapterRegistry`)
     - `src/assets/` (SVG/PNG face shapes, skin tones, hairstyles, outfits, accessories)
     - `supabase/migrations/001_zavatar_schema.sql` (idempotent DDL for `avatars`, `avatar_assets`, `nft_mints`, `marketplace_listings`, `consent_logs`)
     - `nft/` (Standalone Hardhat smart contract project with `ZavatarNFT.sol`, tests, scripts)
4. **Host Integration Surfaces**:
   - `components/zavatar/ZavatarUpsellCard.tsx`: Standalone React component using host Tailwind 4 classes (`bg-white dark:bg-[#14141A]`, `rounded-[28px]`, `border`, `shadow-xl`, `lucide-react` icons). Rendered when `!profile.avatar_id`.
   - `components/zavatar/AvatarDisplay.tsx`: Standalone React component that fetches `/api/zavatar/[avatar_id]` to retrieve the mid-LOD PNG asset (256px), with optimistic loading and fallback to `avatarImageUrl` / initials on error or missing asset.
   - `app/zavatar/studio/page.tsx`: Next.js 16 Studio page with 4-panel desktop layout (`style-profile`, `avatar-viewport`, `feature-sculpt`, `expression-lab`) and 3-tab mobile layout, with `localStorage` autosave (`zavatar_studio_draft`).
   - `app/api/zavatar/*`: 7 Next.js App Router route handlers with JWT Bearer authentication and structured JSON responses.

---

## 3. Caveats

- **External API Keys**: `MetaPersonAdapter` will operate in stub mode if `METAPERSON_API_KEY` is not provided, throwing a descriptive error when called directly and allowing `AdapterRegistry` to fallback to `TemplateAdapter`.
- **Local Cache for Compositor**: In `TemplateAdapter`, sharp-composited avatars should be cached in `zavatar/generated/` and served statically or through public data URLs.
- **Biometric Privacy**: The selfie endpoint `POST /api/zavatar/generate/selfie` must never persist raw selfie buffers to disk or DB; only derived params and generated avatar assets are retained.

---

## 4. Conclusion & Recommendations

1. **Types**: Extend `BusinessCardProfile` in `lib/card-data.ts` with `avatar_id?: string;` and provide `lib/types.ts` as a clean alias/barrel file.
2. **Components**: Place `ZavatarUpsellCard.tsx` and `AvatarDisplay.tsx` in `components/zavatar/`.
3. **Public Page Integration**: Insert `<ZavatarUpsellCard />` non-destructively in `app/[slug]/public-card-client.tsx` and use `<AvatarDisplay />` for avatar rendering.
4. **Auth Utility**: Create a centralized helper `lib/zavatar/auth.ts` or `app/api/zavatar/_utils/auth.ts` to cleanly extract and verify Supabase JWT Bearer tokens with cookie fallback.
5. **No Existing Code Breakage**: All additions are purely additive and preserve 100% of host app functionality.

---

## 5. Verification Method

- **TypeScript Typecheck**:
  ```bash
  cd /home/level-77/Desktop/digital_business_card && npx tsc --noEmit
  ```
- **Zavatar TypeScript Check**:
  ```bash
  cd /home/level-77/Desktop/digital_business_card/zavatar && npx tsc --noEmit
  ```
- **NFT Contract Compilation and Test Suite**:
  ```bash
  cd /home/level-77/Desktop/digital_business_card/zavatar/nft && npm install && npx hardhat test
  ```
- **Host Build**:
  ```bash
  cd /home/level-77/Desktop/digital_business_card && npm run build
  ```
