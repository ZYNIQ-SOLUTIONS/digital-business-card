## 2026-09-07T11:31:07Z
You are Worker 1 (Flow Remediation & UI Bug Fix Specialist).
Your working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_flow_fixes_1
Project workspace root: /home/level-77/Desktop/digital_business_card

MANDATORY: Read the original user request at /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md (specifically section ## 2026-09-07T06:57:58Z).
Read PROJECT.md at /home/level-77/Desktop/digital_business_card/PROJECT.md.
Read survey reports from Explorer 1, 2, and 3 under .agents/teamwork_preview_explorer_audit_auth_2/handoff.md, .agents/teamwork_preview_explorer_audit_editor_2/handoff.md, and .agents/teamwork_preview_explorer_audit_card_wallet_1/handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

EXCLUSIVE FILE OWNERSHIP:
You own and modify ONLY these files:
- lib/supabase/middleware.ts
- app/dashboard/page.tsx
- app/dashboard/cards/trash/page.tsx
- app/auth/page.tsx
- app/dashboard/cards/[id]/edit/page.tsx
- components/wallet-buttons.tsx
- app/[slug]/public-card-client.tsx

TASK SPECIFICATION:
1. [AUTH-02] In `lib/supabase/middleware.ts`: Add `&& !request.nextUrl.pathname.startsWith("/auth/callback")` so authenticated users hitting `/auth/callback` are not redirected to `/dashboard` before token exchange and invite linking completes.
2. [AUTH-03] In `app/dashboard/page.tsx`: Implement `handleDuplicateCard(card: CardItem)`. Duplicate card attributes with a unique slug `${card.slug}-copy-${suffix}` and insert into database or local state, with a Duplicate action button next to Edit.
3. [AUTH-04] In `app/dashboard/cards/trash/page.tsx`: Redirect to `/dashboard?tab=trash`. In `app/dashboard/page.tsx`: read searchParams `tab` to initialize and synchronize `view` state so `tab=trash` shows the Trash tab directly.
4. [AUTH-05] In `app/auth/page.tsx`: Add a clean "Explore Demo Experience" / "Guest Demo" button that allows users or automated testers to access `/dashboard` in demo mode even when external Supabase credentials are not provisioned.
5. [EDIT-01 & EDIT-02] In `app/dashboard/cards/[id]/edit/page.tsx`: Render a visible, dismissible error banner whenever `errorMsg` is non-null. Update desktop "Save Changes" button to check `saveSuccess` and display a green checkmark with "Saved!" for 3 seconds.
6. [EDIT-03] In `app/dashboard/cards/[id]/edit/page.tsx`: In `fetchCard`, populate `icebreakers` via `if (Array.isArray(data.icebreakers)) setIcebreakers(data.icebreakers)`. In `handleSave`/`getPayload`, destructure `icebreakers: _ib` out of `card` and place `icebreakers` *after* `...rest`. Add `icebreakers` to the autosave dependency array.
7. [EDIT-04] In `app/dashboard/cards/[id]/edit/page.tsx`: Add live preview rendering blocks or clean fallbacks for all 11 layout templates (`neobrutalist-bold`, `claude-editorial`, `matrix-terminal`, `clay-3d`, `riso-duotone`, `retro-arcade`) so selecting them in the editor never results in a blank canvas.
8. [EDIT-05] In `app/dashboard/cards/[id]/edit/page.tsx`: Render socials pills, skills pills, bio, and portfolio in the live preview canvas.
9. [EDIT-06] In `app/dashboard/cards/[id]/edit/page.tsx`: Add an interactive "Verify with AI Camera" button next to the Cryptographic Badge that triggers `setIsVerifyOpen(true)`.
10. [EDIT-07] In `app/dashboard/cards/[id]/edit/page.tsx`: In `fetchCard`, restore `hasWalletIdentity` when `data.crypto_identity?.walletAddress` is present.
11. [EDIT-08] In `app/dashboard/cards/[id]/edit/page.tsx`: Add inputs for `region`, `postalCode`, and `country` in `card.office_address`.
12. [EDIT-09] In `app/dashboard/cards/[id]/edit/page.tsx`: Sanitize `booking_slot_duration` so backspacing to empty string defaults to 30 or null rather than `""`.
13. [EDIT-10] In `app/dashboard/cards/[id]/edit/page.tsx`: Add 5MB client-side file size validation in `handleAvatarChange` and `handleBgImageChange`.
14. [EDIT-11] In `app/dashboard/cards/[id]/edit/page.tsx`: Fix line 1867 JSX comment syntax error `{"// "}{card.title || "TITLE"}`.
15. [PUB-01] In `app/[slug]/public-card-client.tsx`: Ensure `filteredLinks` uses `const mode = (modeId || card?.active_mode || "all").toLowerCase();` so direct URL query `?mode=work` or `?mode=social` immediately filters links even when `card.modes` array is empty.
16. [PUB-02 & PUB-03] In `components/wallet-buttons.tsx`: Replace raw `window.location.href` navigation with a client fetch: if 200, download `.pkpass` blob; if 501, show a friendly non-blocking notification/toast. Send `wallet_download` telemetry ping via `POST /api/events`.

VERIFICATION:
Run `npm run build` to ensure 0 compilation or TypeScript errors.
Document all changes and verification results in:
/home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_flow_fixes_1/handoff.md
Send completion message to parent when done.

## 2026-09-07T12:56:25Z
**Context**: Server restart recovery
**Content**: The server restarted. Please resume your task immediately to complete the flow remediation and bug fixes across:
- `lib/supabase/middleware.ts`
- `app/dashboard/page.tsx`
- `app/dashboard/cards/trash/page.tsx`
- `app/auth/page.tsx`
- `app/dashboard/cards/[id]/edit/page.tsx`
- `components/wallet-buttons.tsx`
- `app/[slug]/public-card-client.tsx`
Execute the fixes, run `npm run build` to verify, and write your handoff report.
**Action**: Resume execution, complete the fixes, and send completion message back.
