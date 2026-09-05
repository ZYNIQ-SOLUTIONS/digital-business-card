# BRIEFING — 2026-09-04T12:37:00Z

## Mission
Harden the IZN Digital Business Card platform and complete all missing features across R1 (P0 Critical Security), R2 (P1 Broken Flows), R3 (P2 Medium Issues), R4 (P3 Low-Priority Issues), and R5 (Build Integrity & Verification), ensuring non-destructive fixes, zero compiler errors on Next.js 16 App Router, and clean verification.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2
- Original parent: parent
- Original parent conversation ID: 876864f7-9d1f-462c-8124-ed6e68409718

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2/PROJECT.md
1. **Decompose**:
   - Survey phase: 3 Explorers / Spec Miners mapping R1 (Security/DB), R2 (Auth/Flows/SEO), and R3/R4/R5 (Editor/PWA/Headers/Build Integrity).
   - Milestone Decomposition & Execution:
     - M1: Security Hardening, RLS & Database RPCs (P0-1..P0-7, schema.sql, RPCs, storage RLS)
     - M2: Authentication, Flows & Onboarding (P1-1, P1-7, P1-8, P1-6 AI session auth)
     - M3: Performance, SEO & Client Modernization (P1-2, P1-3, P1-4, P1-5, P2-6)
     - M4: Public Card, Telemetry & Editor Schema Extensions (P2-1, P2-2, P2-3, P2-4, P2-5, P2-7)
     - M5: P3 Infrastructure & Compliance (P3-1 security headers, P3-2 file limits, P3-3 viewport a11y, P3-4 branding PWA icons)
     - M6: Build Integrity, Verification & Adversarial Auditing (R5, full npm run build, review, challenger, forensic auditor)
2. **Dispatch & Execute**:
   - Iteration loop per milestone with dedicated workers, independent reviewers, challengers, and forensic auditor.
3. **On failure**: Retry -> Replace -> Skip -> Redistribute -> Redesign -> Escalate.
4. **Succession**: At 16 spawns, write handoff.md, spawn successor, exit.
- **Work items**:
  1. Survey Phase (Explorers 1, 2, 3) [DONE]
  2. M1: Security Hardening & Database Layer [in-progress]
  3. M2: Authentication & Onboarding Flows [pending]
  4. M3: Performance, SEO & Client Modernization [pending]
  5. M4: Public Card, Telemetry & Editor Extensions [pending]
  6. M5: P3 Infrastructure & Compliance [pending]
  7. M6: Full Verification, Review, Challenger & Forensic Audit [pending]
- **Current phase**: 2B (Executing Milestone M1)
- **Current focus**: M1 Database Foundation & Security DDL

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — delegate to workers.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- You MAY use file-editing tools ONLY for metadata/state files (.md) in your .agents/ folder.
- All changes must be non-destructive: update and fix only, no removals or version upgrades.
- Next.js 16.3.3 App Router (NOT Pages Router). Read `node_modules/next/dist/docs/`.
- Supabase with SSR cookie-based auth (`@supabase/ssr`).
- Tailwind CSS v4 (NOT v3 — class naming differs).
- React 19.2.8.
- TypeScript strict mode.
- Must build cleanly with `npm run build` (`next build --webpack`) without TypeScript compilation errors.
- Forensic Auditor reports INTEGRITY VIOLATION => binary veto, milestone FAILS UNCONDITIONALLY.

## Current Parent
- Conversation ID: 876864f7-9d1f-462c-8124-ed6e68409718
- Updated: 2026-09-04T12:47:00Z

## Key Decisions Made
- Partitioned into 6 milestones per PROJECT.md.
- M1 executes first to establish database functions, triggers, and RLS before route handler updates.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| spec_miner_sec | teamwork_preview_spec_miner | Survey R1: P0 Security & DB | completed | 94a7c237-09e9-42d0-80e4-80556fac2ca9 |
| explorer_flows | teamwork_preview_explorer | Survey R2: P1 Broken Flows & SEO | completed | 93ba0b19-4860-4332-bac7-32ad44bf5b95 |
| explorer_p2p3 | teamwork_preview_explorer | Survey R3, R4, R5: Editor & Infra | completed | cdff087c-8870-46e4-936c-73e29ad54961 |
| worker_m1 | teamwork_preview_worker | M1: Database Foundation & Security DDL | completed | ba99d8da-d307-4cec-8c96-b03e212756dd |
| worker_m2 | teamwork_preview_worker | M2: Security Routes & Gating | completed | c767fa96-336c-48ea-a824-b74d9f1be07a |
| worker_m3 | teamwork_preview_worker | M3: Auth, Onboarding & Shell Performance | completed | 23284686-5bb0-426f-8b76-eeb41af54bf9 |
| worker_m4 | teamwork_preview_worker | M4: Public Card, Social SEO & Telemetry | completed | 8f579720-796f-42d8-b1ea-b7fb6ce15227 |
| worker_m5 | teamwork_preview_worker | M5: Editor Fields, Media, Bulk & P3 | completed | fdf53c59-65d2-4c7b-b71d-acd6cca21c24 |
| worker_m6 | teamwork_preview_worker | M6: Code Quality & Build Integrity | in-progress | 26ae908d-f788-4647-82bd-6eaffe523844 |

## Succession Status
- Succession required: no
- Spawn count: 9 / 16
- Pending subagents: 26ae908d-f788-4647-82bd-6eaffe523844
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-25
- Safety timer: none

## Artifact Index
- `/home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md` — Authoritative User Request
- `/home/level-77/Desktop/digital_business_card/AUDIT_REPORT.md` — Comprehensive Technical Audit Report
- `/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2/DISPATCH.md` — Initial Dispatch Message
- `/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2/progress.md` — Liveness & Progress Heartbeat
- `/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2/PROJECT.md` — Master Architecture & Decomposition
