import { test, expect } from "@playwright/test";
import { MOCK_PUBLIC_CARD } from "./fixtures/mock-data";
import { resetMockDatabase } from "./fixtures/test-helpers";

test.describe("05 - Wallet Passes, Security Injection Defense & Fallbacks", () => {
  test.beforeEach(async () => {
    await resetMockDatabase();
  });

  test("should defend against PostgREST/SQL injection on /api/wallet query parameters with 400", async ({ request }) => {
    // 1. Injected PostgREST operator in cardId
    const res1 = await request.get("/api/wallet?cardId=invalid,id.neq.0");
    expect(res1.status()).toBe(400);
    const body1 = await res1.json();
    expect(body1.error).toContain("Invalid cardId or slug parameter");

    // 2. SQL injection quote in slug parameter
    const res2 = await request.get("/api/wallet?slug=bad'--val");
    expect(res2.status()).toBe(400);
    const body2 = await res2.json();
    expect(body2.error).toContain("Invalid cardId or slug parameter");

    // 3. Path traversal sequence
    const res3 = await request.get("/api/wallet?slug=../../etc/passwd");
    expect(res3.status()).toBe(400);
    const body3 = await res3.json();
    expect(body3.error).toContain("Invalid cardId or slug parameter");

    // 4. Script tags or symbols
    const res4 = await request.get("/api/wallet?cardId=<script>alert(1)</script>");
    expect(res4.status()).toBe(400);
  });

  test("should return 501 fallback when developer certificates are not configured", async ({ request }) => {
    // 1. Parameterized wallet route with valid slug
    const resSlug = await request.get(`/api/wallet?slug=${MOCK_PUBLIC_CARD.slug}`);
    expect(resSlug.status()).toBe(501);
    const slugBody = await resSlug.json();
    expect(slugBody.error).toMatch(/Certificates Missing|not configured/i);

    // 2. Parameterized wallet route with valid UUID
    const resId = await request.get(`/api/wallet?cardId=${MOCK_PUBLIC_CARD.id}`);
    expect(resId.status()).toBe(501);
    const idBody = await resId.json();
    expect(idBody.error).toMatch(/Certificates Missing|not configured/i);
  });

  test("should handle Apple Wallet route with proper 404 and 501 responses", async ({ request }) => {
    // Non-existent card slug returns 404
    const notFoundRes = await request.get("/api/wallet/apple/completely-nonexistent-slug-xyz");
    expect(notFoundRes.status()).toBe(404);

    // Existing card without Apple Developer signing certs returns 501 or 500
    const certMissingRes = await request.get(`/api/wallet/apple/${MOCK_PUBLIC_CARD.slug}`);
    expect([500, 501]).toContain(certMissingRes.status());
    const body = await certMissingRes.json();
    expect(body.error).toMatch(/Apple Developer certificates not configured|certificate|passphrase/i);
  });

  test("should handle Google Wallet route with 501 when credentials are unprovisioned", async ({ request }) => {
    const res = await request.get(`/api/wallet/google/${MOCK_PUBLIC_CARD.slug}`);
    expect(res.status()).toBe(501);
    const body = await res.json();
    expect(body.error).toContain("Google Wallet credentials not configured");
  });
});
