import { test, expect } from "@playwright/test";
import { MOCK_PRIVATE_CARD } from "./fixtures/mock-data";
import { resetMockDatabase } from "./fixtures/test-helpers";

test.describe("07 - PIN Protection on Private Profiles", () => {
  test.beforeEach(async () => {
    await resetMockDatabase();
  });

  test("should enforce PIN lock, reject invalid PIN with error, and unlock profile on correct PIN", async ({ page }) => {
    // 1. Navigate to private card URL
    await page.goto(`/${MOCK_PRIVATE_CARD.slug}`);

    // 2. Verify Private Profile lock gate is rendered
    await expect(page.getByText("Private Profile")).toBeVisible();
    await expect(page.getByText(new RegExp(`Enter PIN to view ${MOCK_PRIVATE_CARD.full_name}`, "i"))).toBeVisible();

    const pinInput = page.locator('input[type="password"], input[placeholder="••••"]');
    const unlockButton = page.getByRole("button", { name: /Unlock Card/i });

    await expect(pinInput).toBeVisible();
    await expect(unlockButton).toBeVisible();

    // 3. Test Invalid PIN flow
    await pinInput.fill("9999");
    await unlockButton.click();

    // Verify error notification
    await expect(page.getByText(/Incorrect PIN/i)).toBeVisible();

    // Verify card details are still shielded
    await expect(page.getByRole("heading", { name: MOCK_PRIVATE_CARD.full_name })).toHaveCount(0);

    // 4. Test Correct PIN flow
    await pinInput.fill(MOCK_PRIVATE_CARD.pin_code || "1234");
    await unlockButton.click();

    // 5. Verify card profile is unlocked and visible
    const nameHeading = page.locator("h1");
    await expect(nameHeading).toContainText(MOCK_PRIVATE_CARD.full_name);
    await expect(page.getByText(MOCK_PRIVATE_CARD.title, { exact: true })).toBeVisible();
    await expect(page.getByText(MOCK_PRIVATE_CARD.company, { exact: true })).toBeVisible();

    // Lock gate should no longer be visible
    await expect(page.getByText("Enter PIN to view")).toHaveCount(0);
  });
});
