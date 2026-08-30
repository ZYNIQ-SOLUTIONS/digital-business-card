# Original User Request

## Initial Request — 2026-08-30T04:34:50Z

Modernize and elevate the mobile responsive UI/UX across all non-landing product surfaces of the IZN Digital Business Card application (Public Card Profiles, User Dashboard ecosystem, Store & Checkout flow, Admin Portal, Auth & Support pages) to Apple Human Interface Guidelines and UI Craft production standards.

Integrity mode: demo

Requirements:
### R1. Public Digital Business Card Mobile Ergonomics (`/[slug]`, `components/public-card-client.tsx`)
- Enhance all 5 layout architectures (`classic-segmented`, `bento-grid`, `executive-minimal`, `cyber-holo`, `creative-hero`) for single-hand mobile viewport navigation.
- Implement Apple-style bottom action sheet modals (Exchange Contact, Share QR, Apple Wallet Pass push) with native haptic feel, swipe indicators, and zero text truncation issues.

### R2. User Dashboard & Card Studio Mobile Overhaul (`/dashboard`, `/dashboard/cards/*`, `/dashboard/connections`, `/dashboard/enterprise`)
- Add an Apple-style bottom tab bar / sticky floating control pill for mobile viewports (`min-h-[44px]` touch targets, frosted glass blur, safe-area inset padding).
- Optimize the card editor (`/dashboard/cards/[id]/edit`) on mobile: collapsible section accordions, responsive theme selector swatches, instant photo upload camera trigger, and a sliding live preview bottom sheet.

### R3. Hardware Store & Checkout Mobile Flow (`/store`, `/store/product/[id]`, `/store/checkout`, `/store/success`)
- Refine Store mobile layout into an Apple Store iOS app experience: crisp product cards, fluid category pills, sticky bottom "Add to Bag / Buy Now" bar with dual currency (AED/USD) and bilingual English/Arabic layout support.
- Streamline checkout on mobile with floating step progression, Apple Pay-ready button styling, and clean form inputs with native mobile keyboard types.

### R4. Admin Console & Auth Mobile Adaptation (`/admin/*`, `/auth`, `/support`, `/privacy`, `/terms`)
- Ensure administrative data tables, metric tiles, order dispatch filters, and product editing modals are horizontally scroll-safe and responsive on 360px–430px screens.
- Modernize Auth login/signup sheets and Support forms with Cupertino form styling, floating labels, and crisp validation states.

Acceptance Criteria:
- Zero horizontal screen overflow or clipping on mobile viewports (360px - 430px).
- All interactive buttons, tabs, inputs, and toggles meet the minimum 44x44px touch target standard.
- Safe-area inset support (`pb-safe`, `pt-safe`) for iOS Safari / standalone PWA mobile viewports.
- Cupertino frosted glass materials (`backdrop-blur-xl`, `bg-white/80` or `bg-neutral-900/80`, hairline `border-black/[0.06]`).
- SF Pro typography scale with tight letter-spacing on headings and high contrast ratios for readability.
- Micro-interactions and drawer transitions under 200ms with natural spring curves.
- `npm run build` compiles with 0 errors across all routes.
- All Supabase database mutations, cart operations, currency switching (AED/USD), and language switching (EN/AR) operate without regressions.
