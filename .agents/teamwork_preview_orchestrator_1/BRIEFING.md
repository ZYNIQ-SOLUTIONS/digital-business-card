# BRIEFING — 2026-08-31T07:08:50Z

## Mission
Build Zavatar — a fully self-contained, production-ready avatar microservice under `/home/level-77/Desktop/digital_business_card/zavatar/` and integrate it with the existing Next.js 16 / Supabase digital business card app across all requirements R1-R7 and acceptance criteria.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_1
- Original parent: parent
- Original parent conversation ID: 82a30bb1-37aa-4e27-961b-df627f2d3e4c

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: /home/level-77/Desktop/digital_business_card/PROJECT.md
1. **Decompose**: Survey existing codebase, map requirements R1-R7 to milestones M1-M7 + E2E testing track.
2. **Dispatch & Execute**:
   - Survey phase: [DONE] 3 Explorers analyzed host app, microservice/adapters, and Studio UI / Web3 NFT.
   - Batch 1: [DONE] M1 (Scaffold & Adapters), M2 (Supabase Schema), M5 (Hardhat NFT Smart Contract).
   - Batch 2: [DONE] M3 (REST API Surface & Ingest/Consent), M4 (Avatar Studio UI), M6 (Host App Integration).
   - Batch 3: [IN PROGRESS] M7 (E2E Verification, Reviews, Adversarial Testing & Forensic Integrity Audit).
3. **On failure**: Retry -> Replace -> Skip (non-critical only) -> Redistribute -> Redesign -> Escalate.
4. **Succession**: At 16 spawns, write soft handoff.md, spawn successor, exit.
- **Work items**:
  1. Survey & Architecture Mapping [DONE]
  2. M1: Zavatar Scaffold & Adapters (R1) [DONE]
  3. M2: Supabase Data Layer (R4) [DONE]
  4. M3: REST API Surface & Ingest/Consent (R2, R5) [DONE]
  5. M4: Avatar Studio UI (R3) [DONE]
  6. M5: Hardhat NFT Smart Contract & Tests (R6) [DONE]
  7. M6: Host App Integration (R7) [DONE]
  8. M7: E2E Verification & Gate Hardening [in-progress]
- **Current phase**: 3 (Verification & Gate: M7)
- **Current focus**: Monitoring Reviewer, Challenger, and Forensic Auditor

## 🔒 Key Constraints
- Never write source code or run build/test commands directly — delegate to subagents.
- Never edit code directly — only metadata (.md) in `.agents/`.
- Zero tolerance for cheating or integrity violations; Auditor has binary veto.
- Non-destructive integration with host app: do not break existing card app.
- Never reuse subagents after handoff — spawn fresh.
- Always include path to `ORIGINAL_REQUEST.md` in every subagent dispatch.

## Current Parent
- Conversation ID: 82a30bb1-37aa-4e27-961b-df627f2d3e4c
- Updated: 2026-08-31T07:08:29Z

## Key Decisions Made
- Architecture follows modular microservice + host app route/UI integration.
- TemplateAdapter will composite SVG/PNG parametric avatar assets using `sharp`.
- NFT module will be a standalone Hardhat project under `zavatar/nft/`.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_survey_1 | teamwork_preview_explorer | Host Codebase Survey | completed | 924f0944-83fc-4188-b710-fb4c82238199 |
| explorer_survey_2 | teamwork_preview_explorer | Microservice Architect Survey | completed | cd700108-a88c-4671-975d-232af59c2d19 |
| explorer_survey_3 | teamwork_preview_explorer | Studio UI & Web3 Survey | completed | b363f093-1b84-42f0-bcf6-aea1903728d9 |
| worker_m1 | teamwork_preview_worker | M1: Scaffold & Adapters (R1) | completed | 73383b51-498c-4df6-b355-10ae7e152bfc |
| worker_m2 | teamwork_preview_worker | M2: Supabase Data Layer (R4) | completed | bc561b9e-e655-47b8-99b0-46270acb6f5b |
| worker_m5 | teamwork_preview_worker | M5: Hardhat NFT Project (R6) | completed | 3f243b23-6de6-402f-a34f-260f231c5864 |
| worker_m3 | teamwork_preview_worker | M3: REST API Surface & Ingest (R2, R5) | completed | dc9d8f63-8959-4361-a9d1-3db000783f42 |
| worker_m4 | teamwork_preview_worker | M4: Avatar Studio UI (R3) | completed | 870d45f8-6f01-4159-853c-abc807c7dece |
| worker_m6 | teamwork_preview_worker | M6: Host App Integration (R7) | completed | 19870f72-a951-4c02-80b0-e3dc0bd0bf02 |
| reviewer_1 | teamwork_preview_reviewer | E2E Reviewer | in-progress | 5d627772-c829-45d6-8e82-a97969cc0c26 |
| challenger_1 | teamwork_preview_challenger | Adversarial Challenger | in-progress | c11ea51c-ba41-48a8-beaf-86aa8d1116c9 |
| auditor_1 | teamwork_preview_auditor | Forensic Integrity Auditor | in-progress | 893679ed-0f96-4406-b920-ec08cdba5c08 |

## Succession Status
- Succession required: no
- Spawn count: 12 / 16
- Pending subagents: 5d627772-c829-45d6-8e82-a97969cc0c26, c11ea51c-ba41-48a8-beaf-86aa8d1116c9, 893679ed-0f96-4406-b920-ec08cdba5c08
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: task-13
- Safety timer: none

## Artifact Index
- `/home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md` — Authoritative user requirements
- `/home/level-77/Desktop/digital_business_card/PROJECT.md` — Global index: architecture, milestones, interfaces, code layout
- `/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_1/GATE_STATUS.md` — Gate verdicts
