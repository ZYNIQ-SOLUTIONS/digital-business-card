# E2E Test Suite Ready

## Test Runner
- Command: `npm run test:e2e`
- Expected: all tests pass with exit code 0 (18 passed across 8 test files)

## Coverage Summary
| Tier | Count | Description |
|------|------:|-------------|
| 1. Feature Coverage | 8 | Public card rendering, modes filtering, lead capture, bookings, wallet passes, vCard export, PIN protection, auth & dashboard navigation |
| 2. Boundary & Corner Cases | 4 | Injection attacks on wallet parameters, empty query string fallbacks, invalid PIN rejection, 501 certificate fallback handling |
| 3. Cross-Feature Integration | 3 | Modes switching + filtered social links, lead capture + PostgreSQL RPC bypass, auth demo session + dashboard card duplication and trash tab routing |
| 4. Real-World Application Workloads | 3 | Complete end-to-end visitor journey: view card -> switch to work mode -> book a meeting -> download .ics and .vcf |
| **Total** | **18** | **18 automated tests passing 100% headlessly with Chromium** |

## Test Suite Inventory (`tests/e2e/`)
| Spec File | Critical Path Verified | Status |
|-----------|------------------------|:------:|
| `01-public-card.spec.ts` | SSR card rendering, Schema.org Person JSON-LD metadata, hero details, tab navigation | PASS |
| `02-modes-socials.spec.ts` | Contextual mode filtering (`?mode=work`, `?mode=social`, default) with platform-specific link assertions | PASS |
| `03-lead-capture.spec.ts` | Speed Dial FAB, ExchangeModal form entry, POST `/api/connections`, submission confirmation | PASS |
| `04-booking-modal.spec.ts` | BookingModal calendar date/time slot selection, attendee registration, POST `/api/bookings`, .ics download | PASS |
| `05-wallet-passes.spec.ts` | Apple Wallet and Google Wallet endpoints, PostgREST parameter injection defense, 501 fallback handling | PASS |
| `06-vcard-telemetry.spec.ts` | Save Contact (.vcf) download generation, RFC 2426 format validation, POST `/api/events` telemetry increment | PASS |
| `07-pin-protection.spec.ts` | Private card PIN challenge, invalid PIN error toast, correct PIN unlock | PASS |
| `08-auth-dashboard.spec.ts` | Auth page rendering, demo bypass, dashboard card listing, card duplication action, trash tab routing | PASS |
