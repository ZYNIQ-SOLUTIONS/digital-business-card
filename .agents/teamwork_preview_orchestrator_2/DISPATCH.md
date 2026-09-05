## 2026-09-04T12:36:26Z

You are the Project Orchestrator for the IZN Digital Business Card platform hardening and feature completion project.

Your working directory is: `/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2`
The authoritative user request is at: `/home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md` (see the section starting at `## 2026-09-04T12:34:31Z`).
The comprehensive technical audit report is at: `/home/level-77/Desktop/digital_business_card/AUDIT_REPORT.md`.
The project codebase is at: `/home/level-77/Desktop/digital_business_card`.

Key project constraints:
1. All changes must be non-destructive: update and fix only, no removals or version upgrades.
2. Next.js 16.3.3 App Router (NOT Pages Router). Read `node_modules/next/dist/docs/` before writing any Next.js code.
3. Supabase with SSR cookie-based auth (`@supabase/ssr`).
4. Tailwind CSS v4 (NOT v3 — class naming differs).
5. React 19.2.8.
6. TypeScript strict mode.
7. Must build cleanly with `npm run build` (`next build --webpack`) without TypeScript compilation errors.
8. Maintain a detailed `progress.md` and `BRIEFING.md` in your working directory `.agents/teamwork_preview_orchestrator_2/`. Keep `progress.md` updated regularly with timestamps, subtasks, completed items, and active files.

Requirements to fulfill:
- R1: Fix All 7 P0 Critical Security Vulnerabilities (P0-1 unauth admin invite, P0-2 missing enterprise RLS, P0-3 public lead capture RPC, P0-4 cross-tenant directory leak, P0-5 storage overwrite vulnerability, P0-6 verification auto-approval fallback & DB trigger, P0-7 PostgREST filter injection in wallet route).
- R2: Fix All 8 P1 High-Priority Broken Flows (P1-1 enterprise onboarding loop, P1-2 1.5s LCP blocker / PageLoader removal & non-blocking analytics, P1-3 OpenGraph/Twitter/Schema.org metadata, P1-4 landing page CSR/metadata refactor to Server Component, P1-5 contextual mode filtering card.socials, P1-6 authenticate AI endpoints & cap inputs, P1-7 disable broken Telegram auth, P1-8 open redirect fix in auth callback).
- R3: Fix P2 Medium Issues & Surface Missing Schema Fields (P2-1 sanitize RSC public payload, P2-2 view counter via increment_card_views RPC, P2-3 editor form fields portfolio_url, office_address, skills, work_location, P2-4 avatar upload UI with cropping, P2-5 download telemetry endpoint /api/events, P2-6 remove Google Fonts @import from globals.css, P2-7 RFC 4180 CSV parser & dynamic org name).
- R4: Fix P3 Low-Priority Issues (P3-1 HTTP security headers in next.config.ts, P3-2 file upload 5MB size limits, P3-3 mobile viewport accessibility userScalable:true, P3-4 valid 192x192 and 512x512 PWA icons matching branding.json).
- R5: Verification & Build Integrity (`npm run build` exits 0, consistent error response format `{ error: string }`, remove illegitimate `/* eslint-disable */` suppressions).
