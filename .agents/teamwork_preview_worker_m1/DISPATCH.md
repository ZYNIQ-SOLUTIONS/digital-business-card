## 2026-08-31T06:29:21Z

You are Worker M1: Zavatar Core Scaffold, Types, Asset Library & Adapters (Requirement R1).
Your working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m1/
Create your directory if needed, write BRIEFING.md and progress.md in it.

MANDATORY: Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md and /home/level-77/Desktop/digital_business_card/PROJECT.md before starting.
Also inspect the architecture plan in /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_2/handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership:
You have exclusive write ownership of all files under:
`/home/level-77/Desktop/digital_business_card/zavatar/` EXCEPT `zavatar/supabase/` and `zavatar/nft/`.

Your mission:
1. Create `zavatar/package.json` with its own scripts (`build`, `test`, `typecheck`), and dependencies (`sharp`, `typescript`, `@types/node`, `@types/sharp`, etc.). Ensure `npm install` runs cleanly.
2. Create `zavatar/tsconfig.json` with `strict: true`.
3. Create `zavatar/.env.example` and `zavatar/README.md` with local-run and integration instructions.
4. Implement `zavatar/src/types/index.ts` defining `AvatarStyle`, `CustomizationParams`, `AvatarMeshResult`, `AvatarGenerationAdapter`, `AvatarFaceShape`, `AvatarSkinTone`, `AvatarHairStyle`, `AvatarOutfit`, `AvatarExpression`, etc.
5. Create bundled modular SVG assets in `zavatar/src/assets/` containing at least 5 face-shape variants × 6 skin-tone variants × 8 hairstyle variants + 5 outfit variants + 6 expressions.
6. Implement `zavatar/src/adapters/AvatarGenerationAdapter.ts` interface.
7. Implement `zavatar/src/adapters/TemplateAdapter.ts` using `sharp` to composite SVG/PNG parametric avatars across multi-LOD (high: 512px, mid: 256px, low: 64px, svg data URLs) and `healthCheck()`.
8. Implement `zavatar/src/adapters/MetaPersonAdapter.ts` stub that throws a descriptive error if `METAPERSON_API_KEY` is not set, with structured TODO comments.
9. Implement `zavatar/src/adapters/AdapterRegistry.ts` reading `ACTIVE_ADAPTER` (default: 'template') with automatic fallback to `TemplateAdapter`.
10. Implement `zavatar/src/index.ts` exporting all adapters and types.
11. Build and verify: run `npm install` and `npx tsc --noEmit` in `zavatar/`, and run an automated test verifying `healthCheck()` and `generateFromTemplate()`.
12. Write a comprehensive report to /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m1/handoff.md with all execution commands and verification results.
13. Send a completion message when done.
