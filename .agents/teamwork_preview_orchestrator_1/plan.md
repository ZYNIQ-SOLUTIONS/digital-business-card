# Plan — Zavatar Implementation & Integration

## Objective
Build Zavatar — a fully self-contained avatar microservice under `/home/level-77/Desktop/digital_business_card/zavatar/` and integrate with host Next.js 16 app per R1-R7 and Acceptance Criteria.

## Strategy & Phases
- **Phase 0: Survey & Scope Mapping**
  - Spawn 3 parallel Explorers to inspect existing host app (package.json, types, supabase, routing, components, styling) and requirements.
  - Formulate PROJECT.md with full architecture, feature inventory, milestones, interface contracts, and code layout.

- **Phase 1: Dual-Track Implementation & Test Planning**
  - **Milestone 1 (R1): Zavatar Project Scaffold, Shared Types, Asset Library & Adapters**
    - `zavatar/package.json`, `tsconfig.json`, `README.md`, `.env.example`
    - Types in `zavatar/src/types/index.ts`
    - Parametric SVG/PNG assets in `zavatar/src/assets/` (5 face shapes × 6 skin tones × 8 hairstyles)
    - `TemplateAdapter` using `sharp`, `MetaPersonAdapter` stub, `AdapterRegistry`
  - **Milestone 2 (R4): Supabase Data Layer & Migrations**
    - `zavatar/supabase/migrations/001_zavatar_schema.sql` (5 tables: avatars, avatar_assets, nft_mints, marketplace_listings, consent_logs)
    - RLS policies, indexes, idempotent DDL, migration README
  - **Milestone 3 (R2, R5): Ingest, Consent & REST API Surface**
    - Next.js App Router route handlers under `app/api/zavatar/` (all 7 endpoints)
    - Face detection, biometric consent gating, consent logging, JWT auth validation via `@supabase/ssr`
  - **Milestone 4 (R3): Avatar Studio UI**
    - `app/zavatar/studio/page.tsx` full 4-panel layout (desktop & mobile tabbed)
    - Style profile, avatar viewport, feature sculpt, expression lab, localStorage autosave, Save & Preview, Mint modal
  - **Milestone 5 (R6): Hardhat NFT Smart Contract & Tests**
    - `zavatar/nft/` Hardhat project, `ZavatarNFT.sol` ERC-721 + soulbound override, tests, deploy script, config
  - **Milestone 6 (R7): Host App Integration**
    - Type extension (`avatar_id?`), `components/zavatar/ZavatarUpsellCard.tsx`, `components/zavatar/AvatarDisplay.tsx`, non-destructive profile page wiring
  - **Milestone 7: End-to-End Verification & Gate Hardening**
    - Full test execution across all acceptance criteria (Zavatar unit tests, Hardhat contract tests, API route tests, UI tests, host build & dev check)
    - Independent Reviewers, Challengers, and Forensic Auditor verification.
