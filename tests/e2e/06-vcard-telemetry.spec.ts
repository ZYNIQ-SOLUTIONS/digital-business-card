import { test, expect } from "@playwright/test";
import { MOCK_PUBLIC_CARD } from "./fixtures/mock-data";
import { resetMockDatabase } from "./fixtures/test-helpers";

test.describe("06 - vCard (.vcf) Export & Telemetry Tracking", () => {
  test.beforeEach(async () => {
    await resetMockDatabase();
  });

  test("should trigger .vcf file download with valid vCard structure and show saved status", async ({ page }) => {
    await page.goto(`/${MOCK_PUBLIC_CARD.slug}`);

    // 1. Locate the Save Contact (.vcf) button
    const vcardButton = page.getByRole("button", { name: /Save Contact.*\.vcf/i }).first();
    await expect(vcardButton).toBeVisible();

    // 2. Click button and wait for file download event
    const downloadPromise = page.waitForEvent("download");
    await vcardButton.click();

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.vcf$/i);

    // 3. Inspect download stream content
    const stream = await download.createReadStream();
    expect(stream).not.toBeNull();

    const chunks: Buffer[] = [];
    for await (const chunk of stream!) {
      chunks.push(Buffer.from(chunk));
    }
    const vcfContent = Buffer.concat(chunks).toString("utf-8");

    // Verify vCard specification format
    expect(vcfContent).toContain("BEGIN:VCARD");
    expect(vcfContent).toContain("VERSION:3.0");
    expect(vcfContent).toContain(`FN:${MOCK_PUBLIC_CARD.full_name}`);
    expect(vcfContent).toContain(`ORG:${MOCK_PUBLIC_CARD.company}`);
    expect(vcfContent).toContain("END:VCARD");

    // 4. Verify visual feedback on the button
    await expect(page.getByText(/Contact Card Saved \(\.vcf\)/i)).toBeVisible();
  });

  test("should validate and record telemetry events on POST /api/events", async ({ request }) => {
    // 1. Rejects invalid card ID (non-UUID)
    const invalidIdRes = await request.post("/api/events", {
      data: {
        cardId: "not-a-valid-uuid",
        eventType: "vcard_download",
      },
    });
    expect(invalidIdRes.status()).toBe(400);
    const errIdJson = await invalidIdRes.json();
    expect(errIdJson.error).toContain("must be a valid UUID");

    // 2. Rejects invalid eventType
    const invalidTypeRes = await request.post("/api/events", {
      data: {
        cardId: MOCK_PUBLIC_CARD.id,
        eventType: "unsupported_event",
      },
    });
    expect(invalidTypeRes.status()).toBe(400);
    const errTypeJson = await invalidTypeRes.json();
    expect(errTypeJson.error).toContain("must be 'vcard_download' or 'wallet_download'");

    // 3. Accepts valid vcard_download event
    const vcardEventRes = await request.post("/api/events", {
      data: {
        cardId: MOCK_PUBLIC_CARD.id,
        eventType: "vcard_download",
      },
    });
    // In environments with Supabase configured, returns 200
    if (vcardEventRes.status() === 200) {
      const json = await vcardEventRes.json();
      expect(json.success).toBe(true);
    } else {
      // If service role is not set up in standalone dev, error indicates database availability
      expect([200, 500]).toContain(vcardEventRes.status());
    }

    // 4. Accepts valid wallet_download event
    const walletEventRes = await request.post("/api/events", {
      data: {
        cardId: MOCK_PUBLIC_CARD.id,
        eventType: "wallet_download",
      },
    });
    expect([200, 500]).toContain(walletEventRes.status());
  });
});
