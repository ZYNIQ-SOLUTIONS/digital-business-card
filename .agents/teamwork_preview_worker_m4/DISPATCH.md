## 2026-09-04T13:03:58Z
You are a teamwork_preview_worker subagent.
Your assigned working directory is: /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_worker_m4
Your parent is: teamwork_preview_orchestrator_2 (id: b6269969-8d18-4aa6-8910-4a283e6cac6b)

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INPUTS:
- Read /home/level-77/Desktop/digital_business_card/.agents/ORIGINAL_REQUEST.md (specifically section starting at ## 2026-09-04T12:34:31Z)
- Read /home/level-77/Desktop/digital_business_card/AUDIT_REPORT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_orchestrator_2/PROJECT.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_flows_1/report.md and handoff.md
- Read /home/level-77/Desktop/digital_business_card/.agents/teamwork_preview_explorer_survey_p2p3_1/report.md and handoff.md

WRITE OWNERSHIP:
You EXCLUSIVELY own:
- /home/level-77/Desktop/digital_business_card/app/[slug]/page.tsx
- /home/level-77/Desktop/digital_business_card/app/[slug]/public-card-client.tsx
- /home/level-77/Desktop/digital_business_card/app/api/events/route.ts (create this)
Do NOT modify any other files.

YOUR TASK (Milestone M4: Public Card, Social SEO & Telemetry):
1. P2-1 in `app/[slug]/page.tsx` (Sanitize RSC Public Payload):
   - Replace `.select("*")` with an explicit public column whitelist.
   - Do NOT select sensitive columns (`user_id`, `email_personal`, `phone_secondary`, `org_id`, `geofence_locations`) so they are never leaked in the RSC client props.
   - Selected columns should include: `id, slug, full_name, title, company, bio, avatar_url, theme, active_mode, custom_colors, is_published, views_count, vcard_downloads_count, wallet_downloads_count, is_verified, verification_badge, verified_at, email_work, phone_work, address, website, socials, portfolio_url, office_address, skills, work_location, exchange_form_fields, direct_link_platform, lead_capture_mode`.
2. P2-2 & P1-2 in `app/[slug]/page.tsx` (Non-blocking View Counter via RPC):
   - Remove blocking direct updates to `cards.update` and synchronous `card_events.insert`.
   - Use Next.js 16 `after` (from `next/server`) to run `supabase.rpc("increment_card_views", { p_slug: slug })` non-blockingly without delaying SSR response streaming.
3. P1-3 in `app/[slug]/page.tsx` (OpenGraph, Twitter Cards, Schema.org JSON-LD):
   - In `generateMetadata`: Include rich `openGraph` with avatar image (width 800, height 800), `twitter:card: "summary_large_image"`, `alternates.canonical: ...`.
   - In the page JSX: Inject a `<script type="application/ld+json">` tag containing Schema.org `Person` JSON-LD with `@context`, `@type: "Person"`, `name`, `jobTitle`, `worksFor`, `image`, `url`, etc.
4. P1-5 in `app/[slug]/public-card-client.tsx` (Contextual Mode Social Filtering):
   - Implement `filteredLinks` logic filtering `card.socials` (not `card.social_links`) based on `active_mode` ("work" vs "social" vs "all").
   - Work platforms: linkedin, github, email, phone, x, twitter, calendar, slack, medium.
   - Social platforms: instagram, tiktok, youtube, spotify, snapchat, twitch, discord, telegram, whatsapp, facebook.
   - In all 4 layout templates (`classic-segmented`, `modern-fluid`, `minimal-executive`, `holographic-cyber`), render `filteredLinks` instead of the unfiltered `card.socials`.
5. P2-5 in `app/api/events/route.ts` & `public-card-client.tsx` (Download Event Telemetry):
   - Create `app/api/events/route.ts` accepting `{ cardId: string, eventType: "vcard_download" | "wallet_download" }`.
   - Validate input: cardId (UUID) and eventType.
   - Using `createAdminClient()`, atomically increment `vcard_downloads_count` (or `wallet_downloads_count`) on `cards` and insert record into `card_events`. Return 200 `{ success: true }` or `{ error: string }`.
   - In `public-card-client.tsx`: In `handleDownloadVCard`, add an async non-blocking fetch to `/api/events` with `{ cardId: card.id, eventType: "vcard_download" }`. Also ensure wallet download triggers `/api/events` with `"wallet_download"`.

VERIFICATION:
- Verify `npx tsc --noEmit` and `npm run build` pass cleanly with exit code 0.
- Write your completion report in your working directory `handoff.md` and send a message back to parent when done.
