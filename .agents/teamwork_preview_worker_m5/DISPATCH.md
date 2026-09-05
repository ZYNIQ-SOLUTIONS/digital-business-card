## 2026-09-04T13:20:17Z

You are a teamwork_preview_worker subagent.
Your assigned working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m5
Your parent is: teamwork_preview_orchestrator_2 (id: b6269969-8d18-4aa6-8910-4a283e6cac6b)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INPUTS:
- Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md (specifically section starting at ## 2026-09-04T12:34:31Z)
- Read /home/level-77/Desktop/digital_business_card/AUDIT_REPORT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2/PROJECT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_p2p3_1/report.md and handoff.md
- Read /home/level-77/Desktop/digital_business_card/branding.json

WRITE OWNERSHIP:
You EXCLUSIVELY own:
- /home/level-77/Desktop/digital_business_card/app/dashboard/cards/[id]/edit/page.tsx
- /home/level-77/Desktop/digital_business_card/components/image-crop-modal.tsx
- /home/level-77/Desktop/digital_business_card/app/api/enterprise/bulk-upload/route.ts
- /home/level-77/Desktop/digital_business_card/next.config.ts
- /home/level-77/Desktop/digital_business_card/public/icon-192.png
- /home/level-77/Desktop/digital_business_card/public/icon-512.png
Do NOT modify any other files.

YOUR TASK (Milestone M5: Editor Form Fields, Media, Bulk Upload & P3 Compliance):
1. P2-3 in `app/dashboard/cards/[id]/edit/page.tsx`:
   - Add input UI controls for missing schema fields:
     - `skills`: tag input or comma-separated text input. Store as string array `string[]` on `formData.skills`.
     - `work_location`: select dropdown with options: `remote`, `hybrid`, `onsite`. Store on `formData.work_location`.
     - Verify `portfolio_url` and `office_address` inputs exist and bind properly to `formData` and save payload.
2. P2-4 in `components/image-crop-modal.tsx` & `app/dashboard/cards/[id]/edit/page.tsx`:
   - In `components/image-crop-modal.tsx`: Fix the bug where clicking "Apply Crop" without dragging handles fails because `completedCrop` is undefined. In `onImageLoad` or `getCroppedImg`, fallback to full/initial crop dimensions so it always outputs a cropped blob and calls `onCropComplete(blob)`.
   - In `app/dashboard/cards/[id]/edit/page.tsx`: Wire the avatar image upload to Supabase Storage at path `avatars/${userId}/avatar.${ext}` (or `${userId}/${Date.now()}.${ext}`) using the authenticated client, respecting the RLS path ownership policy `(storage.foldername(name))[1] = auth.uid()::text`. Update `formData.avatar_url` with the uploaded public URL.
3. P2-7 & P3-2 in `app/api/enterprise/bulk-upload/route.ts`:
   - Enforce 5MB file upload limit (P3-2): Check `file.size > 5 * 1024 * 1024`, return 400 `{ error: "File size exceeds 5MB limit" }`.
   - Replace naive `.split(",")` and `.split("\n")` with a robust RFC 4180-compliant CSV parser (handles quoted fields, embedded commas, escaped quotes, CRLF/LF).
   - Dynamically look up the organization's actual name from `public.organizations` where `id = membership.org_id`, rather than hardcoding `"Acme Corp"`.
   - Ensure all responses return `{ error: string }` on error.
4. P3-1 in `next.config.ts`:
   - Export an `async headers()` function returning security headers for all routes (`source: "/(.*)"`):
     - `X-Frame-Options: DENY`
     - `X-Content-Type-Options: nosniff`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `X-XSS-Protection: 1; mode=block`
     - Content-Security-Policy allowing `'self'`, Supabase endpoints, Google APIs (fonts/maps), Google Gemini, inline scripts with unsafe-inline/eval as needed by Next.js, and data/blob URIs.
5. P3-4 in `public/icon-192.png` and `public/icon-512.png`:
   - Generate valid, non-stub 192x192 and 512x512 PNG icons using `sharp` matching the branding palette in `branding.json` (`#000000` / primary accent `#3b82f6` or dark aesthetic). Write genuine PNG binary files.

VERIFICATION:
- Verify that `npx tsc --noEmit` and `npm run build` pass cleanly with exit code 0.
- Verify `file public/icon-192.png public/icon-512.png` returns valid PNG image data with correct dimensions.
- Write your completion report in your working directory `handoff.md` and send a message back to parent when done.
