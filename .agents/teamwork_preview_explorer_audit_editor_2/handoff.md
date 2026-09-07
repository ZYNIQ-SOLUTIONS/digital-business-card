# Card Editor, Customization & Avatar/Media Upload Flow Audit Report

## 1. Observation

### Obs 1: Silent Save, Avatar Upload, and Slug Conflict Failures (Error State Never Rendered)
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
- **Line 62**: `const [errorMsg, setErrorMsg] = useState<string | null>(null);`
- **Lines 173, 206, 291, 379, 381**:
  - Line 173: `setErrorMsg("Avatar upload failed: " + err.message);`
  - Line 206: `setErrorMsg("Background upload failed: " + err.message);`
  - Line 291: `setErrorMsg("Card not found or access denied.");`
  - Line 379: `if (!isAutoSave) setErrorMsg("This URL slug is already in use by another card.");`
  - Line 381: `if (!isAutoSave) setErrorMsg(error.message);`
- **ESLint Output**: `15:10 warning 'errorMsg' is assigned a value but never used @typescript-eslint/no-unused-vars`
- **Direct observation**: `errorMsg` is updated across 5 failure scenarios, but is NEVER rendered in the JSX DOM anywhere in `page.tsx`. If saving fails, the URL slug is a duplicate, the card ID does not exist, or image upload fails, the user is given zero visual feedback.

### Obs 2: Missing Save Success Feedback on Desktop Viewport
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
- **Line 385**: `setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000);`
- **Lines 533-540**:
  ```tsx
  <button
    onClick={() => handleSave(false)}
    disabled={saving}
    className="px-4 py-2 rounded-xl bg-[#1D1D1F] text-white text-xs font-semibold hover:bg-black/80 disabled:opacity-50 flex items-center gap-1.5 transition shadow-[0_4px_14px_rgba(0,0,0,0.1)]"
  >
    <Save className="w-3.5 h-3.5" />
    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
  </button>
  ```
- **Lines 1974-1978** (Mobile only): Mobile bar checks `saveSuccess ? 'Saved!' : 'Save Card'`.
- **Direct observation**: The desktop "Save Changes" button completely ignores `saveSuccess`. After clicking Save, the button displays "Saving..." and immediately returns to "Save Changes" with no success confirmation.

### Obs 3: Icebreaker Prompts Data Loss and State Overwrite Bug
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
- **Line 65**: `const [icebreakers, setIcebreakers] = useState<string[]>([]);`
- **Lines 268-294** (`fetchCard`):
  `data.icebreakers` is never passed to `setIcebreakers`. When an existing card with icebreakers is loaded, `icebreakers` state is always initialized to `[]`.
- **Lines 333-356** (`handleSave`):
  ```tsx
  const {
    id: _id,
    user_id: _uid,
    created_at: _created,
    views_count: _views,
    vcard_downloads_count: _vcards,
    wallet_downloads_count: _wallets,
    template_layout: _tpl,
    ...rest
  } = card;

  const p: any = {
    icebreakers,
    ...rest,
    avatar_initials: initials,
    theme: card.theme || "apple-light",
    updated_at: new Date().toISOString(),
  };
  ```
- **Direct observation**: Because `icebreakers` is not destructured out of `card`, `rest` contains `icebreakers: card.icebreakers`. In the object spread `{ icebreakers, ...rest }`, `...rest` comes *after* `icebreakers`. JavaScript object property spread precedence causes `rest.icebreakers` to overwrite `icebreakers`. Any newly added icebreakers in the UI are permanently discarded and never persisted to Supabase.
- **Line 406**: The autosave `useEffect` dependency array `[card, loading]` does not include `icebreakers`, so adding or removing icebreakers never triggers autosave.

### Obs 4: Live Preview Desync on Modern Layout Templates (6 of 11 Templates Blank Out)
- **File**: `lib/templates.ts` (Lines 1-12) & `app/[slug]/public-card-client.tsx` (Lines 556-1882)
  There are 11 registered templates: `classic-segmented`, `bento-grid`, `executive-minimal`, `cyber-holo`, `creative-hero`, `neobrutalist-bold`, `claude-editorial`, `matrix-terminal`, `clay-3d`, `riso-duotone`, `retro-arcade`. All 11 are selectable in the editor (lines 850-893) and fully rendered on the public card client.
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
  - Line 1687: `{template === "classic-segmented" && (...) }`
  - Line 1770: `{template === "bento-grid" && (...) }`
  - Line 1815: `{template === "executive-minimal" && (...) }`
  - Line 1853: `{template === "cyber-holo" && (...) }`
  - Line 1879: `{template === "creative-hero" && (...) }`
  - Lines 1880-1906: End of template branches.
- **Direct observation**: There are no conditional branches or fallback handlers for `neobrutalist-bold`, `claude-editorial`, `matrix-terminal`, `clay-3d`, `riso-duotone`, or `retro-arcade`. When a user selects any of these 6 templates in Section 2, the live preview inside the device mockup renders completely empty white/gray space.

### Obs 5: Live Preview Desync on Core Form Fields (Socials, Skills, Bio, Portfolio, Office)
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
  - `card.socials`: Referenced in form section 5 (lines 1397, 1410). Ripgrep confirms zero references to `socials` inside the preview canvas (lines 1658-1912).
  - `card.skills`: Form section 1 (line 707) and passed to AI modal (line 1936). Never referenced in live preview canvas.
  - `card.bio`: Form section 1 (line 768) and passed to AI modal (line 1935). Never referenced in live preview canvas.
  - `card.portfolio_url`: Form section 3 (line 1277). Never referenced in live preview canvas.
  - `card.office_address`: Form section 3 (lines 1294, 1304). Never referenced in live preview canvas.
- **Line 254**: `const [activeTab, setActiveTab] = useState<"card" | "about" | "contact">("card");`
  `activeTab` and `setActiveTab` are defined as dead state (flagged by ESLint warning `254:10 warning 'activeTab' is assigned a value but never used`).
- **Direct observation**: The live preview only displays avatar, name, title, company, work location, 4 static quick actions, QR code, and CTA buttons. None of the user's social links, skills badges, executive bio, portfolio links, or office address appear in the editor preview.

### Obs 6: AI Identity Camera Verification Modal Unreachable via UI
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
- **Line 96**: `const [isVerifyOpen, setIsVerifyOpen] = useState(false);`
- **Lines 1941-1949**:
  ```tsx
  <VerifyModal
    isOpen={isVerifyOpen}
    onClose={() => setIsVerifyOpen(false)}
    onVerified={(result) => {
      setCard({ ...card, is_verified: result.verified });
    }}
    cardId={id}
    fullName={card.full_name}
  />
  ```
- **Direct observation**: Ripgrep search for `setIsVerifyOpen` across `page.tsx` yields only 2 occurrences (definition on line 96 and `onClose` on line 1943). There is NO button, icon, or link anywhere in the page to trigger `setIsVerifyOpen(true)`. The AI verification modal is dead UI.

### Obs 7: Cryptographic Identity State Not Restored on Card Load
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
- **Line 92**: `const [hasWalletIdentity, setHasWalletIdentity] = useState(false);`
- **Line 312**: `setHasWalletIdentity(true);` (only in `handleVerifyWallet`)
- **Lines 268-294** (`fetchCard`): Does not inspect `data.crypto_identity` to update `hasWalletIdentity`.
- **Direct observation**: If a card was previously verified with a crypto wallet, reopening the card in the editor always resets `hasWalletIdentity` to `false`, rendering the "Connect Wallet" CTA rather than the "Verified" badge.

### Obs 8: Incomplete Office Address Form Fields
- **File**: `app/dashboard/cards/[id]/edit/page.tsx` (Lines 1290-1311)
  Only 2 inputs provided: "Street Address" (`office_address.street`) and "City & Country" (`office_address.city`).
- **File**: `app/[slug]/public-card-client.tsx` (Line 832) & `supabase/schema.sql` (Line 93)
  Address schema defines `street`, `city`, `region`, `postalCode`, `country`. Public card renders `{card.office_address.city}, {card.office_address.region} {card.office_address.postalCode}`.
- **Direct observation**: Because `region` and `postalCode` are not editable, entering city in the editor causes the public card to render a trailing comma (e.g. `Dubai, `) on an incomplete line.

### Obs 9: Missing Booking Schedule Customization Fields
- **File**: `app/dashboard/cards/[id]/edit/page.tsx` (Lines 1351-1377)
  Section 4 provides inputs for `booking_title` and `booking_slot_duration`.
- **File**: `components/booking-modal.tsx` (Lines 98-115)
  Reads `card.booking_days`, `card.booking_start_time`, and `card.booking_end_time`.
- **Direct observation**: Card editor does not expose controls for days of week or operating hours, leaving booking slots fixed to default Monday-Friday 09:00-17:00.

### Obs 10: Potential Integer Parsing DB Error on `booking_slot_duration`
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
- **Line 1372**: `onChange={(e) => setCard({ ...card, booking_slot_duration: e.target.value === '' ? ('' as any) : Number(e.target.value) })}`
- **Direct observation**: If the user deletes the duration value, `booking_slot_duration` is set to `""`. Sending `""` to PostgreSQL integer column `booking_slot_duration int` causes an `invalid input syntax for integer: ""` error, causing silent save failure.

### Obs 11: Missing Client-Side File Validation on Upload Handlers
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
- **Lines 135-145** (`handleAvatarChange`) & **Lines 179-196** (`handleBgImageChange`):
  Neither handler inspects `file.size` or `file.type`. In `handleAvatarChange`, `reader.readAsDataURL(file)` immediately loads the entire file into a base64 string.
- **Direct observation**: Selecting an oversized file (e.g., 25MB+) allocates excessive memory in the browser thread before cropping or Supabase upload.

### Obs 12: ESLint Syntax Warning in Template 4 Mockup
- **File**: `app/dashboard/cards/[id]/edit/page.tsx`
- **Line 1867**: `<p className="text-[9px] text-cyan-400">// {card.title || "TITLE"}</p>`
- **ESLint Output**: `1867:63 error Comments inside children section of tag should be placed inside braces react/jsx-no-comment-textnodes`

### Obs 13: Next.js Production Build Verification
- **Command**: `npm run build`
- **Result**: Code 0. Compiled successfully in 24.0s, TypeScript finished in 8.3s, 26/26 static and dynamic routes collected and optimized.

---

## 2. Logic Chain

1. **Error Visibility**:
   - `fetchCard`, `handleCropComplete`, `handleBgImageChange`, and `handleSave` all invoke `setErrorMsg(message)`.
   - `errorMsg` is stored in component state via `useState`.
   - However, JSX in `page.tsx` contains no element rendering `{errorMsg}`.
   - Therefore, any operational failure (duplicate slug, RLS violation, storage error, network disconnect) fails completely silently to the end-user.

2. **Icebreaker State Flow**:
   - `card` state is fetched from Supabase via `select("*")`.
   - `icebreakers` is managed in a separate `useState<string[]>([]);`.
   - `fetchCard` populates `card` but fails to populate `icebreakers`.
   - When saving, `getPayload` spreads `icebreakers` then `...rest` (where `rest` contains `card.icebreakers`).
   - In ES6 object literals, `{ a: 1, ...{ a: 2 } }` evaluates to `{ a: 2 }`.
   - Hence, `rest.icebreakers` overrides the new `icebreakers` state.
   - Therefore, newly created icebreakers are dropped and never stored in Postgres.

3. **Template Live Preview**:
   - `lib/templates.ts` lists 11 templates (`templateList`), and all 11 are rendered as selectable options in Section 2A.
   - In the preview container, only `classic-segmented`, `bento-grid`, `executive-minimal`, `cyber-holo`, and `creative-hero` have rendering blocks.
   - The remaining 6 templates lack any rendering block or fallback.
   - Therefore, selecting any of the 6 newer templates clears the preview frame.

4. **Live Preview Fidelity**:
   - The purpose of the live preview is real-time visualization of card customizations.
   - The preview lacks components for socials, skills, bio, portfolio, and office address.
   - Therefore, the preview does not reflect changes made in Sections 1, 3, or 5, forcing users to rely on the external "Public Preview" route.

5. **AI Identity Verification Accessibility**:
   - `VerifyModal` is implemented and handles camera feed, countdown, capture, and verification.
   - It is mounted in `CardEditPage` and conditioned on `isVerifyOpen`.
   - No interactive element calls `setIsVerifyOpen(true)`.
   - Therefore, the AI Identity Verification feature cannot be accessed from the card editor.

---

## 3. Caveats

- **Autosave Timing**: Autosave uses a 1500ms debounce. Rapid typing keeps resetting the timer, which is expected behavior, but users navigating away before 1500ms without clicking "Save Changes" rely on `beforeunload` (which is not currently implemented).
- **Supabase Storage Bucket**: The avatar storage bucket policy in `002_p0_security_hardening.sql` requires `(storage.foldername(name))[1] = auth.uid()::text`. The client file upload paths `${user.id}/avatar-...` and `${user.id}/backgrounds/...` comply with this check.
- **Read-Only Constraint**: As an explorer, no modifications have been made to application source files. Proposed code edits are provided below as self-contained blueprints.

---

## 4. Conclusion & Recommended Action Plan

The Card Editor (`app/dashboard/cards/[id]/edit/page.tsx`), image cropping (`components/image-crop-modal.tsx`), and AI endpoints are fundamentally functional and pass `npm run build`. However, there are 12 specific bugs, desyncs, and omissions that degrade user experience and cause data loss:

1. **Fix Silent Error Reporting**: Render a sticky, dismissible error alert box near the action header whenever `errorMsg` is non-null.
2. **Fix Desktop Save Feedback**: Update the desktop "Save Changes" button to check `saveSuccess` and display a green checkmark with "Saved!" for 3 seconds.
3. **Fix Icebreaker Persistence & Overwrite**:
   - In `fetchCard`, call `if (Array.isArray(data.icebreakers)) setIcebreakers(data.icebreakers)`.
   - In `getPayload`, destructure `icebreakers: _ib` out of `card` and place `icebreakers` after `...rest`:
     ```tsx
     const { id: _id, user_id: _uid, created_at: _created, views_count: _views, vcard_downloads_count: _vcards, wallet_downloads_count: _wallets, template_layout: _tpl, icebreakers: _ib, ...rest } = card;
     const p: any = {
       ...rest,
       icebreakers,
       avatar_initials: initials,
       theme: card.theme || "apple-light",
       updated_at: new Date().toISOString(),
     };
     ```
   - Add `icebreakers` to the autosave dependency array.
4. **Fix Live Preview Template Rendering**: Add fallback handling or full template mockups for the 6 unhandled templates in the live preview canvas so that selecting them does not blank out the preview.
5. **Enrich Live Preview**: Render `card.socials` pills with their respective `icon_style` (black/white/colorful), render `card.skills` pills, and display `card.bio` / `card.portfolio_url`.
6. **Wire AI Identity Verification Button**: Add a "Verify with AI Camera" button in Section 1 or Section 2 (next to the Cryptographic Badge) that sets `setIsVerifyOpen(true)`.
7. **Restore Wallet Verification on Load**: In `fetchCard`, add `if (data.crypto_identity?.walletAddress) setHasWalletIdentity(true);`.
8. **Add Complete Address Inputs**: Provide inputs for `region`, `postalCode`, and `country` under `card.office_address`.
9. **Add Booking Availability Inputs**: Expose dropdowns for `booking_start_time`, `booking_end_time`, and checkboxes for `booking_days`.
10. **Sanitize `booking_slot_duration`**: Ensure backspaced empty inputs default to `30` or `null` instead of `""`.
11. **Add Upload File Size Guards**: In `handleAvatarChange` and `handleBgImageChange`, reject files larger than 5MB with an error message before calling `FileReader`.
12. **Fix JSX Comment Syntax**: On line 1867, change `// {card.title || "TITLE"}` to `{"// "}{card.title || "TITLE"}` to eliminate the ESLint error.

---

## 5. Verification Method

### Test 1: Build & TypeScript Integrity
Run:
```bash
npm run build
```
Verify exit code is 0 and TypeScript check succeeds without errors.

### Test 2: ESLint Check on Editor Components
Run:
```bash
npx eslint app/dashboard/cards/[id]/edit/page.tsx components/image-crop-modal.tsx components/ai-bio-modal.tsx
```
Verify that line 1867 syntax error and unused variables are resolved.

### Test 3: Error Message Visibility Verification
1. Navigate to `/dashboard/cards/invalid-id/edit`.
2. Verify that an error banner with "Card not found or access denied." appears prominently on the page.
3. Change slug to an existing card's slug and click Save; verify that "This URL slug is already in use by another card." is rendered.

### Test 4: Icebreaker Persistence Verification
1. Open an existing card, navigate to Section 2 (Advanced Networking).
2. Add an icebreaker prompt (e.g. "Ask me about Web3").
3. Click "Save Changes".
4. Refresh the page; verify the prompt is still present in the list.
5. Query Supabase directly: `SELECT icebreakers FROM cards WHERE id = '...';` and verify the array contains the prompt.

### Test 5: Live Preview Template Compatibility Verification
1. In the editor, select "Neo-Brutalist Pop", "Claude Warm Editorial", "Matrix Cyber Terminal", "Claymorphic 3D Puff", "Japanese Riso Studio", and "Retro Arcade".
2. Verify that in each case, the live preview renders the card with the respective layout instead of an empty box.
