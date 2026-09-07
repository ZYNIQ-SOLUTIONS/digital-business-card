import { test, expect } from "@playwright/test";
import { MOCK_PUBLIC_CARD } from "./fixtures/mock-data";
import { resetMockDatabase } from "./fixtures/test-helpers";

test.describe("02 - Contextual Modes & Socials Filtering", () => {
  test.beforeEach(async () => {
    await resetMockDatabase();
  });

  test("should display all active channels in default mode", async ({ page }) => {
    await page.goto(`/${MOCK_PUBLIC_CARD.slug}`);

    // In default / all mode: both professional and personal links are visible
    const linkedinLink = page.locator('a[aria-label="LinkedIn"]');
    const githubLink = page.locator('a[aria-label="GitHub"]');
    const instagramLink = page.locator('a[aria-label="Instagram"]');
    const whatsappLink = page.locator('a[aria-label="WhatsApp"]');

    await expect(linkedinLink).toBeVisible();
    await expect(githubLink).toBeVisible();
    await expect(instagramLink).toBeVisible();
    await expect(whatsappLink).toBeVisible();
  });

  test("should filter to only professional channels when ?mode=work is active", async ({ page }) => {
    await page.goto(`/${MOCK_PUBLIC_CARD.slug}?mode=work`);

    // Work mode: Professional links must be visible
    const linkedinLink = page.locator('a[aria-label="LinkedIn"]');
    const githubLink = page.locator('a[aria-label="GitHub"]');
    await expect(linkedinLink).toBeVisible();
    await expect(githubLink).toBeVisible();

    // Work mode: Social & casual channels must NOT be visible
    const instagramLink = page.locator('a[aria-label="Instagram"]');
    const tiktokLink = page.locator('a[aria-label="TikTok"]');
    const whatsappLink = page.locator('a[aria-label="WhatsApp"]');

    await expect(instagramLink).toHaveCount(0);
    await expect(tiktokLink).toHaveCount(0);
    await expect(whatsappLink).toHaveCount(0);
  });

  test("should filter to only social channels when ?mode=social is active", async ({ page }) => {
    await page.goto(`/${MOCK_PUBLIC_CARD.slug}?mode=social`);

    // Social mode: Personal / media channels must be visible
    const instagramLink = page.locator('a[aria-label="Instagram"]');
    const whatsappLink = page.locator('a[aria-label="WhatsApp"]');
    const tiktokLink = page.locator('a[aria-label="TikTok"]');

    await expect(instagramLink).toBeVisible();
    await expect(whatsappLink).toBeVisible();
    await expect(tiktokLink).toBeVisible();

    // Social mode: Professional platforms must NOT be visible
    const linkedinLink = page.locator('a[aria-label="LinkedIn"]');
    const githubLink = page.locator('a[aria-label="GitHub"]');

    await expect(linkedinLink).toHaveCount(0);
    await expect(githubLink).toHaveCount(0);
  });
});
