## 2026-09-04T13:03:39Z

You are a teamwork_preview_worker subagent.
Your assigned working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m3
Your parent is: teamwork_preview_orchestrator_2 (id: b6269969-8d18-4aa6-8910-4a283e6cac6b)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INPUTS:
- Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md (specifically section starting at ## 2026-09-04T12:34:31Z)
- Read /home/level-77/Desktop/digital_business_card/AUDIT_REPORT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2/PROJECT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_flows_1/report.md and handoff.md

WRITE OWNERSHIP:
You EXCLUSIVELY own:
- /home/level-77/Desktop/digital_business_card/app/auth/callback/route.ts
- /home/level-77/Desktop/digital_business_card/app/auth/page.tsx
- /home/level-77/Desktop/digital_business_card/app/layout.tsx
- /home/level-77/Desktop/digital_business_card/app/page.tsx
- /home/level-77/Desktop/digital_business_card/components/magic-demo-trigger.tsx (create this)
Do NOT modify any other files.

YOUR TASK (Milestone M3: Auth, Onboarding Loop & Shell Performance):
1. P1-1 & P1-8 in `app/auth/callback/route.ts`:
   - Open redirect defense (P1-8): Strictly sanitize `next` query parameter. Ensure it starts with `/`, does NOT start with `//`, and does not contain `\` or external protocols. If invalid, default to `/dashboard`.
   - Employee onboarding loop (P1-1): After user session exchange, check `public.org_invitations` using `createAdminClient()` for `email = user.email` and `status = 'pending'`.
     - If found:
       - Update the provisioned card (`cards` where `id = invitation.card_id`) setting `user_id: user.id`.
       - Insert into `public.organization_members` with `{ org_id: invitation.org_id, user_id: user.id, role: invitation.role }`.
       - Update `public.org_invitations` setting `status: 'accepted'`, `accepted_at: new Date().toISOString()`.
       - Redirect to `/dashboard`.
     - If no invitation: count existing cards for `user.id`. If count > 0 redirect to `next` (or `/dashboard`); if 0 cards, redirect to `/dashboard/onboarding`.
2. P1-7 in `app/auth/page.tsx`:
   - Restore the Telegram login slot as a disabled button with "Coming Soon" badge. Use `<TelegramIcon />` from `@/components/icons`. Style with `opacity-60 cursor-not-allowed` and `disabled={true}`, without any redirect or onClick action.
3. P1-2 & P3-3 in `app/layout.tsx`:
   - P1-2: Remove `<PageLoader />` from `RootLayout` so initial page render and LCP are not blocked by the artificial timer/overlay.
   - P3-3: In the `viewport` export (or configuration in `layout.tsx`), set `userScalable: true` and remove `maximumScale: 1` to comply with WCAG 2.1 Level AA mobile viewport zoom.
4. P1-4 in `app/page.tsx` & `components/magic-demo-trigger.tsx`:
   - Create `components/magic-demo-trigger.tsx` as a Client Component (`"use client"`) that manages `isDemoOpen` state, renders the trigger button(s) ("Try Interactive Demo", etc.), and mounts `<MagicDemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />`.
   - Refactor `app/page.tsx` to be a pure Server Component (REMOVE `"use client"` at line 1). Replace the interactive state and modal in `app/page.tsx` with `<MagicDemoTrigger />`.
   - Export comprehensive `metadata: Metadata` from `app/page.tsx` (title, description, openGraph, twitter, etc.).

VERIFICATION:
- Verify that `npx tsc --noEmit` and `npm run build` pass cleanly with exit code 0.
- Write your completion report in your working directory `handoff.md` and send a message back to parent when done.
