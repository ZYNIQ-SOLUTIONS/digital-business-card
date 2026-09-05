## 2026-09-04T12:54:26Z

You are a teamwork_preview_worker subagent.
Your assigned working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m2
Your parent is: teamwork_preview_orchestrator_2 (id: b6269969-8d18-4aa6-8910-4a283e6cac6b)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INPUTS:
- Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md (specifically section starting at ## 2026-09-04T12:34:31Z)
- Read /home/level-77/Desktop/digital_business_card/AUDIT_REPORT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2/PROJECT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_sec_1/report.md and handoff.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_flows_1/report.md and handoff.md

WRITE OWNERSHIP:
You EXCLUSIVELY own:
- /home/level-77/Desktop/digital_business_card/app/api/invite/route.ts
- /home/level-77/Desktop/digital_business_card/app/api/connections/route.ts
- /home/level-77/Desktop/digital_business_card/app/api/bookings/route.ts
- /home/level-77/Desktop/digital_business_card/app/api/enterprise/members/route.ts
- /home/level-77/Desktop/digital_business_card/app/api/ai/verify-identity/route.ts
- /home/level-77/Desktop/digital_business_card/components/verify-modal.tsx
- /home/level-77/Desktop/digital_business_card/app/api/wallet/route.ts
- /home/level-77/Desktop/digital_business_card/app/api/ai/enhance-bio/route.ts
- /home/level-77/Desktop/digital_business_card/app/api/ai/extract-card/route.ts
Do NOT modify any other files.

YOUR TASK (Milestone M2: Security Route Handlers, Lead/Booking RPC Wiring & AI Gating):
Implement surgical, non-breaking, production-grade fixes across all 9 assigned files:
1. P0-1 in `app/api/invite/route.ts`:
   - Authenticate caller via `auth.getUser()`, return 401 if missing.
   - Validate `email` regex.
   - Require org admin role: if `orgId` passed, check caller is `admin` in `org_id = orgId`. If `orgId` missing, check if caller is `admin` in any org in `organization_members`. If not admin, return 403 `{ error: "Forbidden: Enterprise Admin role required" }`.
   - Use `createAdminClient().auth.admin.inviteUserByEmail`. Also insert invitation into `org_invitations`.
   - Ensure uniform error shape `{ error: string }`.
2. P0-3 in `app/api/connections/route.ts` & `app/api/bookings/route.ts`:
   - In `connections/route.ts`: When `cardId` is provided (public lead), call `supabase.rpc("submit_public_lead", { p_card_id: cardId, p_name: name, p_email: email, p_phone: phone, p_company: company, p_job_title: jobTitle || title, p_notes: notes, p_lead_type: leadType || "contact_exchange", p_location: location })`. Do this for all public visitors (whether unauthenticated or authenticated as someone other than card owner).
   - In `bookings/route.ts`: Look up card. Call `supabase.rpc("submit_public_lead", { p_card_id: card.id, p_name: name, p_email: email, p_phone: phone, p_company: company, p_job_title: null, p_notes: notes, p_lead_type: "meeting", p_location: "Digital Calendar Booking", p_title: title, p_meeting_date: meetingDate, p_meeting_time: meetingTime })`. Do NOT swallow errors! If RPC returns error, return 500 `{ error: ... }`.
3. P0-4 in `app/api/enterprise/members/route.ts`:
   - `GET`: Check `auth.getUser()`, return 401 if none. Lookup caller's `organization_members` record. If none, return `{ members: [] }`. If present, query cards strictly scoped to `.eq("org_id", membership.org_id)`. Never return other orgs' cards or fallback to personal cards.
   - `POST`: Require caller has `admin` role in `membership.org_id`. When creating `newCard`, explicitly set `org_id: membership.org_id`.
4. P0-6 in `app/api/ai/verify-identity/route.ts` & `components/verify-modal.tsx`:
   - In `route.ts`: Use `createAdminClient()` (`service_role`) to update `is_verified`, `verification_badge`, and `verified_at` on `cards` table, so the DB trigger permits it. Replace any catch block or fallback that auto-approves with fail-closed error response.
   - In `verify-modal.tsx`: In error/catch blocks, fail closed: show error state, do NOT set `verified: true` or fake success.
5. P0-7 in `app/api/wallet/route.ts`:
   - Check `cardId` or `slug` parameters. Validate strictly: UUID or `/^[a-z0-9-_]{1,100}$/i`. Reject any input with special chars, quotes, commas, or outside this pattern with 400 `{ error: "Invalid cardId or slug parameter" }`.
   - Query using separate `.eq("id", ...)` or `.eq("slug", ...)`.
   - Ensure errors return `{ error: string }`.
6. P1-6 in `app/api/ai/enhance-bio/route.ts` & `app/api/ai/extract-card/route.ts`:
   - Add `auth.getUser()` check. Return 401 `{ error: "Unauthorized" }` if unauthenticated.
   - Cap inputs (`bio`, `tagline`, `skills`, text) to 500 characters max before interpolating into prompt.
   - In `extract-card`, reject files > 5MB with 400 `{ error: "File size exceeds 5MB limit" }`.

VERIFICATION:
- Check that all routes compile cleanly. Run `npx tsc --noEmit` or verify Next.js build.
- Ensure error responses strictly match `{ error: string }`.
- Write your completion report in your working directory `handoff.md` and send a message back to parent when done.
