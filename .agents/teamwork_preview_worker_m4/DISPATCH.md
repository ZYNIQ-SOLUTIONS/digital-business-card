## 2026-08-31T06:37:07Z

You are Worker M4: Avatar Studio UI (Requirement R3).
Your working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m4/
Create your directory if needed, write BRIEFING.md and progress.md in it.

MANDATORY: Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md and /home/level-77/Desktop/digital_business_card/PROJECT.md before starting.
Also inspect the UI blueprint in /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_3/handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership:
You have exclusive write ownership of:
`/home/level-77/Desktop/digital_business_card/app/zavatar/studio/page.tsx`

Your mission:
1. Implement `app/zavatar/studio/page.tsx` as a full-screen Avatar Studio with dark theme (`bg-gray-900`/`bg-gray-950`, `text-white` using TailwindCSS 4, no new CSS files).
2. Desktop layout (>= 768px) with 4 distinct panels identifiable by `data-testid` attributes:
   - `data-testid="style-profile"` (Left panel): Scrollable grid of at least 5 outfit categories (`Business Formal`, `Smart Casual`, `Creative/Founder`, `Techwear`, `Regional Formal` MENA-inclusive) with immediate optimistic preview update + color palette swatch row (at least 8 colors) that recolors the outfit.
   - `data-testid="avatar-viewport"` (Center panel): Dynamic avatar viewport rendering 2D composite image / `<model-viewer>` for GLB assets, with live updates as options change, overlay indicator for active expression, and loading spinner during network requests.
   - `data-testid="feature-sculpt"` (Right panel): 5 range sliders (Face Shape [round <-> angular], Eye Size [small <-> large], Nose Width [narrow <-> wide], Jaw Width [narrow <-> wide], Skin Tone [light <-> dark]), range 0-100, default 50, updating preview immediately.
   - `data-testid="expression-lab"` (Bottom panel): Horizontal carousel of at least 6 expressions (`Neutral`, `Smile`, `Laugh`, `Concerned`, `Surprised`, `Wink`), setting expression with visual indicator overlay on preview.
3. Mobile layout (< 768px): Collapse to single-panel tabbed view with tabs (Style / Sculpt / Expression) with viewport pinned at top 40% of screen and tab content filling bottom 60%.
4. State persistence: Autosave all studio state to `localStorage` key `zavatar_studio_draft` (debounced 500ms), and restore all values on page mount.
5. Action buttons:
   - Sticky "Save & Preview" button calling `POST /api/zavatar/generate/template` and updating viewport with returned asset URL.
   - "Mint as NFT" button (disabled until status is 'ready') opening a modal with Base Sepolia details and a "Connect Wallet" CTA.
6. Verify the page compiles cleanly with TypeScript (`npx tsc --noEmit`).
7. Write your report to /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m4/handoff.md.
8. Send a completion message when done.
