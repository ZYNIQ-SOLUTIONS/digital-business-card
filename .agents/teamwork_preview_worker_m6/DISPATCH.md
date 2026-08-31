## 2026-08-31T06:37:07Z
You are Worker M6: Host App Integration (Requirement R7).
Your working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m6/
Create your directory if needed, write BRIEFING.md and progress.md in it.

MANDATORY: Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md and /home/level-77/Desktop/digital_business_card/PROJECT.md before starting.
Also inspect the host survey report in /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_1/handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership:
- `components/zavatar/ZavatarUpsellCard.tsx`
- `components/zavatar/AvatarDisplay.tsx`
- `lib/types.ts`
- Targeted minimal insertions in `lib/card-data.ts` and `app/[slug]/public-card-client.tsx`
(Do NOT delete, rename, or structurally alter existing components or files).

Your mission:
1. In `lib/card-data.ts` (and `lib/types.ts`), add `avatar_id?: string;` as an optional field on `BusinessCardProfile`.
2. Create `components/zavatar/ZavatarUpsellCard.tsx`:
   - Rendered only when `avatar_id` is absent/falsy on profile.
   - Displays avatar icon, title 'Create Your Zavatar', subtitle 'Turn your headshot into a living 3D avatar', and a link button to `/zavatar/studio`.
   - Uses host TailwindCSS classes.
3. Create `components/zavatar/AvatarDisplay.tsx`:
   - When `avatarId` is present, fetches mid-LOD PNG (256px) from `/api/zavatar/[avatarId]`.
   - Renders avatar in profile header, gracefully falling back to original headshot or initials if fetch fails or no asset exists.
4. Non-destructively wire `<ZavatarUpsellCard />` and `<AvatarDisplay />` into `app/[slug]/public-card-client.tsx`.
5. Run `npx tsc --noEmit` and `npm run build` in root `/home/level-77/Desktop/digital_business_card` to ensure 0 type errors and clean compilation.
6. Write your report to /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m6/handoff.md.
7. Send a completion message when done.
