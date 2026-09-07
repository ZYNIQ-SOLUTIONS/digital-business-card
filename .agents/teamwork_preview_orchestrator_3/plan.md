# Functional Audit & Playwright E2E Testing Plan

## Overview
Perform a comprehensive functional audit and End-to-End (E2E) testing of the Digital Business Card platform (Next.js 16 + Supabase). Identify and resolve broken user flows and UI bugs, implement an automated Playwright E2E testing suite covering core critical paths, execute the suite, and provide an agent-generated verification report confirming production readiness.

## Functional Scope & Target Flows
1. **Authentication & Session Flows**:
   - Email/password authentication, OAuth & magic link flows, callback redirection, session persistence, protected route middleware.
2. **Dashboard & Card Management**:
   - Dashboard loading, card creation, card listing, card duplication/deletion, organization/enterprise view.
3. **Card Editor & Live Customization**:
   - Field editing (contact, socials, skills, portfolio, bio), avatar/photo upload with crop modal, theme selection, layout toggle, autosave/save action, validation.
4. **Public Card Presentation & Lead Capture**:
   - Public slug view `/[slug]`, responsive mobile card styling, contextual mode filtering, contact exchange modal, meeting booking modal, QR code display, vCard download, event telemetry.
5. **Wallet Pass Generation**:
   - Apple Wallet PassKit generation (`/api/wallet`), pass validation, fallback handling, download flow.
6. **Automated Playwright E2E Suite**:
   - Configuration, headless browser runner, fixtures/mocking where necessary (e.g. Supabase auth cookies or local test credentials), tests for auth, dashboard, editor, public card, wallet pass.

## Milestones

### Milestone 0: Comprehensive Flow Survey (Explorers)
- Explorer 1: Authentication, Onboarding, Route Protection, and Dashboard flows.
- Explorer 2: Card Editor, Customization, Avatar Upload, and Form State management.
- Explorer 3: Public Card (`/[slug]`), Lead Capture (Exchange/Bookings), Wallet PassKit generation (`/api/wallet`), and Telemetry.
- Output: Consolidated list of broken flows, UI bugs, edge cases, and Playwright setup requirements.

### Milestone 1: Flow Remediation & UI Bug Fixes
- Worker implements fixes for all identified bugs and broken flows.
- Reviewer checks code quality, non-breaking behavior, and regression safety.

### Milestone 2: Playwright E2E Test Suite Implementation
- Set up Playwright configuration, browser dependencies, and NPM scripts.
- Implement comprehensive E2E test specs covering critical paths:
  * Auth flow & route protection
  * Dashboard & card navigation
  * Card editing & live preview updates
  * Public card interaction & lead capture submission
  * Wallet pass download endpoint verification
- Reviewers verify test realism, assertion robustness, and flakiness resistance.

### Milestone 3: E2E Test Execution & Verification Report
- Execute Playwright test suite against the running application.
- Challenger verifies manual & automated flows, test passing status, edge cases.
- Produce comprehensive agent-generated verification report documenting test results for all major application flows.

### Milestone 4: Forensic Integrity Audit & Final Gating
- Forensic Auditor validates authentic implementation, zero cheating/mocking hacks, no hardcoded test responses.
- Orchestrator verifies all acceptance criteria are met and signals project completion.
