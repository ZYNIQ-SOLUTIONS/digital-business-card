# Plan — Final Verification & Acceptance Sign-off

## Objective
Verify the Digital Business Card platform against all acceptance criteria:
1. Ensure Playwright test suite (`npm run test:e2e`) runs and passes 100% across all 18 tests.
2. Systematically verify all major application flows (Authentication & Session Routing, Dashboard Card Management, Card Editor & Customization, Public Card & Lead Capture, Wallet Passes & Telemetry).
3. Author the comprehensive agent-generated verification report at `VERIFICATION_REPORT.md`.
4. Conduct independent Review, Challenge, and Forensic Integrity Audit.
5. Signal completion to Sentinel with full verification evidence.

## Step-by-Step Plan

### Step 1: Initialize Workspace & Liveness (Completed)
- Create DISPATCH.md, BRIEFING.md, plan.md, progress.md.
- Establish recurring heartbeat cron.

### Step 2: Milestone M3 Execution — Worker Verification & Report Generation
- Create working directory `.agents/teamwork_preview_worker_verify_1`.
- Dispatch `teamwork_preview_worker` to:
  1. Check running services (e.g. Next.js server on port 3000, or launch it if needed).
  2. Run `npm run test:e2e` and verify all 18 tests execute and pass cleanly.
  3. Conduct manual & programmatic inspection of all major flows:
     - Authentication & Guest Demo Bypass (`/auth`, `/auth/callback`)
     - Dashboard & Card Management (card listing, duplication, status toggle, trash view with `?tab=trash`)
     - Card Editor & Customization (inputs for bio, socials, skills, portfolio, complete address, templates 1-11 live preview, AI trigger, crop modal)
     - Public Card & Lead Capture (SSR metadata, JSON-LD, modes filtering `?mode=work/social`, contact exchange modal via `submit_public_lead`, calendar booking modal with `.ics` export)
     - Apple / Google Wallet & Telemetry (`/api/wallet` parameter validation, injection defense, 501 fallback toast, `/api/events` telemetry counters)
  4. Write the comprehensive `VERIFICATION_REPORT.md` at project workspace root documenting all automated and manual flow verifications.
- Monitor worker execution and wait for completion.

### Step 3: Milestone M4 — Independent Review, Challenge & Forensic Audit
- Dispatch `teamwork_preview_reviewer` to review code quality, test results, and `VERIFICATION_REPORT.md`.
- Dispatch `teamwork_preview_challenger` to verify edge cases, injection defenses, and robustness.
- Dispatch `teamwork_preview_auditor` to conduct forensic integrity audit (verify genuine implementations, zero cheating, zero hardcoded test pass bypasses).
- Record verdicts in `GATE_STATUS.md`.

### Step 4: Final Acceptance & Sentinel Completion Report
- Verify all gate criteria are satisfied (Build/tests pass, Reviewer APPROVE, Challenger PASS, Auditor CLEAN).
- Send completion message to parent Sentinel (conv ID: `e76ad435-cd3b-4e1d-bd67-2b6cbfe2121d`).
