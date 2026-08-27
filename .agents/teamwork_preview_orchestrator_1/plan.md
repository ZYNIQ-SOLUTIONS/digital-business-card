# Technical Audit Master Plan

## Objective
Conduct an exhaustive, ground-truth technical audit of the Next.js 16 + Supabase digital business card platform codebase and generate `/home/level-77/Desktop/digital_business_card/AUDIT_REPORT.md` conforming to all acceptance criteria (>600 lines, >15,000 characters, covering R1-R6 across sections 1-8).

## Phased Execution Strategy

### Phase 1: Exhaustive Multi-Track Investigation (Parallel Explorers)
- **Explorer 1 (Features & Quality — R1, R4, R6)**:
  - Thorough inspection of all 12 key features (Auth, Card Editor, Public Card View, Bookings, Connections/Wallet, Enterprise, AI Identity Verification, AI Bio, AI Card Scanner, Invite System, Analytics, Landing Page).
  - Identification of incomplete / stubbed features (active_mode, geofencing, portfolio_url, NFC tabs, etc.).
  - Code hygiene & technical debt (eslint-disable, ts-ignore, any types, unhandled promises, Next.js 16 compliance).
  - Output report: `.agents/teamwork_preview_explorer_1/analysis.md`

- **Explorer 2 (Security, RLS & APIs — R3)**:
  - Supabase schema & RLS policies in `supabase/schema.sql`.
  - All API routes in `app/api/**`: authentication, authorization/tenant checks, service role key usage, input validation, SQL/injection risks.
  - Client-side auth patterns and security risks.
  - Output report: `.agents/teamwork_preview_explorer_2/analysis.md`

- **Explorer 3 (UX Journeys, Performance & SEO — R2, R5)**:
  - Detailed trace of 3 primary user journeys:
    1. Visitor-to-card-save journey
    2. Enterprise HR invite & management journey
    3. Networking wallet & connection journey
  - Performance & SEO audit of public card (`app/[slug]/page.tsx`, `public-card-client.tsx`) and landing page (`app/page.tsx`) (OG tags, metadata, SSR/CSR, LCP, image optimization).
  - Output report: `.agents/teamwork_preview_explorer_3/analysis.md`

### Phase 2: Synthesis & Report Drafting (Worker)
- Synthesize all findings from Explorers 1, 2, and 3.
- Author `/home/level-77/Desktop/digital_business_card/AUDIT_REPORT.md`:
  - 1. Executive Summary (3-5 bullet points)
  - 2. Feature Status Table (all 12 features + discovered extras)
  - 3. Critical Issues (P0) (description, affected file(s), recommended fix)
  - 4. High Priority (P1) (description, affected file(s), recommended fix)
  - 5. Medium Priority (P2) (description, affected file(s), recommended fix)
  - 6. Low Priority (P3) (description, affected file(s), recommended fix)
  - 7. What's Working Well
  - 8. Recommended Next Sprint (5-8 prioritized actionable tasks)
  - Ensure length >= 600 lines / >= 15,000 characters.

### Phase 3: Verification & Auditing
- Reviewer 1 & Reviewer 2: Verify report completeness, grounding, accuracy against the codebase.
- Challenger 1 & Challenger 2: Adversarial check for missed edge cases, hallucinated paths, or inaccurate claims.
- Forensic Auditor: Verify integrity, authentic analysis, no placeholder text.

### Phase 4: Gate Check & Delivery
- Validate gate pass in `GATE_STATUS.md`.
- Send final report summary to Sentinel parent agent.
