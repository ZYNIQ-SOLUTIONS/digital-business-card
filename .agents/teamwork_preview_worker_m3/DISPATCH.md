## 2026-08-31T06:37:07Z
You are Worker M3: Ingest, Consent & REST API Surface (Requirements R2, R5).
Your working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m3/
Create your directory if needed, write BRIEFING.md and progress.md in it.

MANDATORY: Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md and /home/level-77/Desktop/digital_business_card/PROJECT.md before starting.
Also inspect the API architecture in /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_2/handoff.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write ownership:
You have exclusive write ownership of all files under:
`/home/level-77/Desktop/digital_business_card/app/api/zavatar/`

Your mission:
1. Implement `app/api/zavatar/_utils/auth.ts`:
   - Extracts user session from Supabase JWT in `Authorization: Bearer <token>` header or cookies via `@supabase/ssr`.
   - Returns `{ user, supabase }` or a standard 401 error response `{ error: 'UNAUTHORIZED', message: '...' }`.
2. Implement all 7 Next.js 16 App Router route handlers:
   - `POST /api/zavatar/generate/selfie` (`app/api/zavatar/generate/selfie/route.ts`): multipart form data (`image`, `consent`, `style`), validates file size (<= 10MB) & mime type (JPEG/PNG/WebP), biometric consent gate (HTTP 422 `{ error: 'CONSENT_REQUIRED', message: '...' }` if consent false/missing), face detection verification, audit logging in `consent_logs`, calls active adapter's `generateFromSelfie`, purges raw selfie bytes from memory, inserts into `avatars` and `avatar_assets`, returns `{ avatarId, status, assetUrl, assetUrls }`.
   - `POST /api/zavatar/generate/template` (`app/api/zavatar/generate/template/route.ts`): accepts JSON `CustomizationParams`, creates or updates avatar draft in Supabase, calls `TemplateAdapter.generateFromTemplate()`, saves multi-LOD assets to `avatar_assets`, returns `{ avatarId, status: 'ready', assetUrls: { high, mid, low } }`.
   - `GET /api/zavatar/[id]/status` (`app/api/zavatar/[id]/status/route.ts`): returns `{ id, status, progress: 100, assetUrls? }`, verifies owner matches authenticated user (403 if not).
   - `GET /api/zavatar/[id]` (`app/api/zavatar/[id]/route.ts`): returns full avatar metadata, asset URLs, and NFT mint status.
   - `PATCH /api/zavatar/[id]/customize` (`app/api/zavatar/[id]/customize/route.ts`): accepts partial `CustomizationParams`, merges with existing style, re-runs `TemplateAdapter.generateFromTemplate()`, updates `avatar_assets`, returns updated asset URLs.
   - `POST /api/zavatar/[id]/render` (`app/api/zavatar/[id]/render/route.ts`): triggers fresh render pass generating 3 PNG sizes (512px, 256px, 64px), saves to `avatar_assets` (lod_level: high/mid/low), returns `{ assetUrls: { high, mid, low } }`.
   - `GET /api/zavatar/[id]/ownership` (`app/api/zavatar/[id]/ownership/route.ts`): Phase 3 stub returning `{ avatarId, minted: false, owner: null, tokenId: null, contractAddress: null }` (or real record if `nft_mints` row exists).
3. Ensure all routes handle 401 (unauthenticated), 403 (unauthorized user), 404 (not found), and structured JSON error responses.
4. Verify all route handlers by writing and executing a test script or node verification.
5. Write your report to /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m3/handoff.md.
6. Send a completion message when done.
