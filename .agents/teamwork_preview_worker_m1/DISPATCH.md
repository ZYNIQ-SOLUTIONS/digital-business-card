## 2026-09-04T12:47:08Z
You are a teamwork_preview_worker subagent.
Your assigned working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m1
Your parent is: teamwork_preview_orchestrator_2 (id: b6269969-8d18-4aa6-8910-4a283e6cac6b)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INPUTS:
- Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md (specifically section starting at ## 2026-09-04T12:34:31Z)
- Read /home/level-77/Desktop/digital_business_card/AUDIT_REPORT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2/PROJECT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_sec_1/report.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_sec_1/handoff.md

WRITE OWNERSHIP:
You EXCLUSIVELY own:
- /home/level-77/Desktop/digital_business_card/supabase/schema.sql
- /home/level-77/Desktop/digital_business_card/supabase/migrations/*
Do NOT modify any other files.

YOUR TASK (Milestone M1: Database Foundation & Security DDL):
Implement the required database schema, functions, triggers, and RLS policies in `supabase/schema.sql` (and optionally create `supabase/migrations/002_p0_security_hardening.sql` matching the spec):
1. P0-2: Enable RLS on `organizations` and `organization_members`. Add non-recursive `SECURITY DEFINER` functions (`is_org_member`, `is_org_admin`) with `SET search_path = public` to avoid PostgreSQL error 42P17. Add complete SELECT/INSERT/UPDATE/DELETE policies.
2. P0-3: Implement `submit_public_lead(p_card_id uuid, p_name text, p_email text, p_phone text, p_company text, p_job_title text, p_notes text, p_lead_type text, p_location text)` with `SECURITY DEFINER` and `SET search_path = public`. Verify card is published before inserting into `connections`.
3. P0-5: Update storage policies for the `avatars` bucket in `schema.sql` enforcing `(storage.foldername(name))[1] = auth.uid()::text` for SELECT, INSERT, UPDATE, and DELETE.
4. P0-6: Implement `protect_verification_columns()` trigger function and attach trigger to `cards` table before update, ensuring only `service_role` can modify `is_verified`, `verification_badge`, and `verified_at`.
5. P2-2: Implement `increment_card_views(p_slug text)` `SECURITY DEFINER` function with `SET search_path = public` that increments `views_count` on `cards` and inserts a view event into `card_events`.
6. P1-1: Add `org_invitations` table definition to `supabase/schema.sql` with columns `(id uuid primary key, org_id uuid references organizations(id), email text, role text, card_id uuid references cards(id), token text, created_at timestamptz, expires_at timestamptz)` and complete RLS.

VERIFICATION:
- Ensure all SQL is valid, idempotent, syntax-checked, and properly placed in `supabase/schema.sql`.
- Write your completion report in your working directory `handoff.md` and send a message back to parent when done.
