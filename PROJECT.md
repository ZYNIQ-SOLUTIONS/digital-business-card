# Project: Zavatar Avatar Microservice & Integration

## Architecture
Zavatar is a modular, production-ready avatar microservice that turns business-card headshots or parametric inputs into personalized 3D/2D avatars with Web3 NFT minting foundations.

The architecture comprises three primary sub-systems:
1. **Zavatar Microservice Core (`zavatar/`)**:
   - Pluggable `AvatarGenerationAdapter` interface (`TemplateAdapter` with `sharp` parametric compositing + `MetaPersonAdapter` Cloud SDK stub + `AdapterRegistry` with automatic fallback).
   - Modular SVG asset library across 5 face shapes × 6 skin tones × 8 hairstyles × 5 outfits × 6 expressions.
   - Shared TypeScript types in `zavatar/src/types/index.ts`.
   - Idempotent PostgreSQL / Supabase migration schema in `zavatar/supabase/migrations/001_zavatar_schema.sql` (5 tables: `avatars`, `avatar_assets`, `nft_mints`, `marketplace_listings`, `consent_logs` with complete RLS and indexes).
   - Standalone Hardhat NFT smart contract project in `zavatar/nft/` (`ZavatarNFT.sol` ERC-721 + soulbound lock, tests, deployment scripts).
2. **REST API Surface (`app/api/zavatar/`)**:
   - 7 Next.js 16 App Router route handlers (`generate/selfie`, `generate/template`, `[id]/status`, `[id]`, `[id]/customize`, `[id]/render`, `[id]/ownership`).
   - Ingest & Biometric Consent pipeline with strict GDPR / biometric gating (HTTP 422 if consent false/missing), audit logging to `consent_logs`, and zero-retention memory purge of raw selfie photos.
   - JWT Bearer & cookie authentication via `@supabase/ssr` (401 on unauthenticated, 403 on non-owner access).
3. **Frontend & Host App Integration (`app/zavatar/studio/`, `components/zavatar/`, `lib/`)**:
   - Full-screen Avatar Studio UI (`app/zavatar/studio/page.tsx`) with 4-panel layout (Style Profile, Avatar Viewport with 2D/3D model-viewer, Feature Sculpt with 5 range sliders, Expression Lab carousel), mobile tabbed navigation, 500ms debounced localStorage draft autosave (`zavatar_studio_draft`), and "Mint as NFT" modal.
   - Type extension in `lib/card-data.ts` and `lib/types.ts` (`avatar_id?: string`).
   - Reusable components `components/zavatar/ZavatarUpsellCard.tsx` and `components/zavatar/AvatarDisplay.tsx` non-destructively wired into the host business card app.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Zavatar Package Scaffold | Standalone package.json, tsconfig.json, README.md, .env.example under zavatar/ | M1 | R1 |
| 2 | Avatar Generation Adapters & Types | Pluggable AvatarGenerationAdapter interface, TemplateAdapter (sharp compositor), MetaPersonAdapter stub, AdapterRegistry, shared types | M1 | R1 |
| 3 | Parametric SVG Asset Library | Bundled SVG assets: 5 face shapes × 6 skin tones × 8 hairstyles × 5 outfits × 6 expressions | M1 | R1 |
| 4 | Supabase Schema Migration & RLS | 001_zavatar_schema.sql (5 tables, RLS policies, indexes, idempotent DDL, README) | M2 | R4 |
| 5 | Biometric Ingest & Consent Gating | Multipart upload, face detection, 422 consent gate, consent_logs auditing, zero-retention memory purge | M3 | R2 |
| 6 | Full REST API Surface | 7 App Router route handlers under app/api/zavatar/ with Bearer token authentication & structured JSON errors | M3 | R5 |
| 7 | Avatar Studio UI 4-Panel Layout | 4-panel desktop layout (Style, Viewport, Sculpt, Expression), mobile tabs, TailwindCSS 4 dark theme | M4 | R3 |
| 8 | Studio State Autosave & Actions | localStorage autosave (zavatar_studio_draft), Save & Preview, Mint as NFT modal | M4 | R3 |
| 9 | Hardhat NFT Smart Contract & Tests | Standalone Hardhat project in zavatar/nft/, ZavatarNFT.sol (ERC-721 + soulbound override), 100% passing tests, deploy script | M5 | R6 |
| 10 | Host App Type Extension | Add avatar_id?: string to profile types in lib/card-data.ts and lib/types.ts | M6 | R7 |
| 11 | Zavatar Upsell & Display Components | ZavatarUpsellCard.tsx & AvatarDisplay.tsx integrated into host profile view | M6 | R7 |
| 12 | End-to-End Verification Suite | Automated E2E verification test suite across all acceptance criteria | M7 | AC |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Zavatar Scaffold & Adapters (R1) | `zavatar/` package, tsconfig, shared types, assets, TemplateAdapter, MetaPersonAdapter, AdapterRegistry | none | DONE |
| M2 | Supabase Data Layer (R4) | `zavatar/supabase/migrations/001_zavatar_schema.sql` (5 tables, RLS, indexes, migration README) | none | DONE |
| M3 | REST API Surface & Ingest/Consent (R2, R5) | `app/api/zavatar/*` (7 routes), auth helper, face validation, consent gate, multi-LOD render | M1, M2 | DONE |
| M4 | Avatar Studio UI (R3) | `app/zavatar/studio/page.tsx` 4-panel UI, mobile tabs, live viewport, autosave, modals | M1, M3 | DONE |
| M5 | Hardhat NFT Smart Contract (R6) | `zavatar/nft/` standalone project, `ZavatarNFT.sol`, OpenZeppelin v5, tests, deploy scripts | none | DONE |
| M6 | Host App Integration (R7) | `lib/types.ts`, `lib/card-data.ts`, `components/zavatar/*`, profile page integration | M1, M3 | DONE |
| M7 | E2E Verification & Hardening | Full test run across all acceptance criteria (Zavatar unit tests, Hardhat tests, API tests, Host build) | M1-M6 | IN_PROGRESS |

---

## Code Layout
```
/home/level-77/Desktop/digital_business_card/
├── app/
│   ├── api/
│   │   └── zavatar/
│   │       ├── _utils/
│   │       │   ├── auth.ts
│   │       │   └── store.ts
│   │       ├── generate/
│   │       │   ├── selfie/route.ts
│   │       │   └── template/route.ts
│   │       └── [id]/
│   │           ├── route.ts
│   │           ├── status/route.ts
│   │           ├── customize/route.ts
│   │           ├── render/route.ts
│   │           └── ownership/route.ts
│   └── zavatar/
│       └── studio/
│           └── page.tsx
├── components/
│   └── zavatar/
│       ├── ZavatarUpsellCard.tsx
│       └── AvatarDisplay.tsx
├── lib/
│   ├── types.ts
│   └── card-data.ts
└── zavatar/
    ├── .env.example
    ├── README.md
    ├── package.json
    ├── tsconfig.json
    ├── generated/
    ├── src/
    │   ├── index.ts
    │   ├── types/index.ts
    │   ├── adapters/
    │   │   ├── AvatarGenerationAdapter.ts
    │   │   ├── TemplateAdapter.ts
    │   │   ├── MetaPersonAdapter.ts
    │   │   └── AdapterRegistry.ts
    │   ├── assets/
    │   │   ├── face-shapes/
    │   │   ├── hair-styles/
    │   │   ├── outfits/
    │   │   ├── expressions/
    │   │   └── features/
    │   └── utils/
    │       ├── svgBuilder.ts
    │       └── faceDetection.ts
    ├── supabase/
    │   └── migrations/
    │       ├── 001_zavatar_schema.sql
    │       └── README.md
    └── nft/
        ├── package.json
        ├── tsconfig.json
        ├── hardhat.config.ts
        ├── .env.example
        ├── README.md
        ├── contracts/
        │   └── ZavatarNFT.sol
        ├── scripts/
        │   └── deploy.ts
        └── test/
            └── ZavatarNFT.test.ts
```
