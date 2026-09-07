import { test, expect } from "@playwright/test";
import { MOCK_PUBLIC_CARD } from "./fixtures/mock-data";
import { resetMockDatabase } from "./fixtures/test-helpers";

test.describe("01 - Public Card Presentation & Schema.org JSON-LD", () => {
  test.beforeEach(async () => {
    await resetMockDatabase();
  });

  test("should load public card, render hero details, schema JSON-LD, and switch tabs", async ({ page }) => {
    // 1. Navigate to the public business card URL
    const response = await page.goto(`/${MOCK_PUBLIC_CARD.slug}`);
    expect(response?.status()).toBe(200);

    // 2. Verify Hero section elements (name, title, company, avatar)
    const nameHeading = page.locator("h1");
    await expect(nameHeading).toContainText(MOCK_PUBLIC_CARD.full_name);

    await expect(page.getByText(MOCK_PUBLIC_CARD.title, { exact: true })).toBeVisible();
    await expect(page.getByText(MOCK_PUBLIC_CARD.company, { exact: true })).toBeVisible();

    // Verify avatar element exists
    const avatar = page.locator(`img[alt*="${MOCK_PUBLIC_CARD.full_name}"]`).first();
    const avatarFallback = page.getByText(MOCK_PUBLIC_CARD.avatar_initials || "AM").first();
    const hasAvatar = (await avatar.count()) > 0 || (await avatarFallback.count()) > 0;
    expect(hasAvatar).toBe(true);

    // 3. Verify Schema.org Person JSON-LD script is injected
    const jsonLdScript = page.locator('script[type="application/ld+json"]');
    await expect(jsonLdScript).toHaveCount(1);
    const jsonContent = await jsonLdScript.textContent();
    expect(jsonContent).toBeTruthy();

    const parsedJson = JSON.parse(jsonContent || "{}");
    expect(parsedJson["@context"]).toBe("https://schema.org");
    expect(parsedJson["@type"]).toBe("Person");
    expect(parsedJson["name"]).toBe(MOCK_PUBLIC_CARD.full_name);
    expect(parsedJson["jobTitle"]).toBe(MOCK_PUBLIC_CARD.title);
    expect(parsedJson["worksFor"]?.["name"] || parsedJson["worksFor"]).toBe(MOCK_PUBLIC_CARD.company);

    // 4. Verify Tab Navigation (Card & QR, Bio & Skills, Office, Share)
    // Click 'Bio & Skills' tab
    const bioTabButton = page.getByRole("button", { name: "Bio & Skills", exact: true });
    await expect(bioTabButton).toBeVisible();
    await bioTabButton.click();

    // Verify bio content is displayed
    await expect(page.getByText(/Executive Bio/i)).toBeVisible();
    await expect(page.getByText(MOCK_PUBLIC_CARD.bio)).toBeVisible();

    // Click 'Office' tab
    const officeTabButton = page.getByRole("button", { name: "Office", exact: true });
    await expect(officeTabButton).toBeVisible();
    await officeTabButton.click();

    // Verify office contact info is displayed
    await expect(page.getByText(/Primary Phone|Work Email/i).first()).toBeVisible();
    if (MOCK_PUBLIC_CARD.office_address) {
      await expect(page.getByText(MOCK_PUBLIC_CARD.office_address.city, { exact: false })).toBeVisible();
    }

    // Click 'Share' tab
    const shareTabButton = page.getByRole("button", { name: "Share", exact: true });
    await expect(shareTabButton).toBeVisible();
    await shareTabButton.click();

    // Click back to 'Card & QR' tab
    const cardTabButton = page.getByRole("button", { name: "Card & QR", exact: true });
    await expect(cardTabButton).toBeVisible();
    await cardTabButton.click();

    // Quick action / QR elements should be visible again
    await expect(page.getByText("Scan to Open Digital Card", { exact: true })).toBeVisible();
  });
});
