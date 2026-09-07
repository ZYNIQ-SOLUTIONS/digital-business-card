import { test, expect } from "@playwright/test";
import { MOCK_PUBLIC_CARD } from "./fixtures/mock-data";
import { resetMockDatabase } from "./fixtures/test-helpers";

test.describe("03 - Lead Capture via Speed Dial FAB & ExchangeModal", () => {
  test.beforeEach(async () => {
    await resetMockDatabase();
  });

  test("should open ExchangeModal from Speed Dial FAB, submit contact form, and show confirmation", async ({ page }) => {
    await page.goto(`/${MOCK_PUBLIC_CARD.slug}`);

    // 1. Expand the Speed Dial FAB
    const fabButton = page.locator('button[title="Quick Actions"]');
    await expect(fabButton).toBeVisible();
    await fabButton.click();

    // 2. Click "Exchange Contact" in the expanded speed dial menu
    const exchangeActionButton = page.getByRole("button", { name: /Exchange Contact/i });
    await expect(exchangeActionButton).toBeVisible();
    await exchangeActionButton.click();

    // 3. Verify ExchangeModal opens with choose options
    const modalHeader = page.getByText(new RegExp(`Connect with ${MOCK_PUBLIC_CARD.full_name.split(" ")[0]}`, "i"));
    await expect(modalHeader).toBeVisible();

    // 4. Click "Enter Manually"
    const enterManuallyButton = page.getByRole("button", { name: /Enter Manually/i });
    await expect(enterManuallyButton).toBeVisible();
    await enterManuallyButton.click();

    // 5. Fill out contact details
    await page.fill('input[placeholder="Full Name"]', "Jordan Lee");
    await page.fill('input[placeholder="Email"]', "jordan.lee@example.com");
    const phoneInput = page.locator('input[type="tel"], input[placeholder*="Phone"], input[placeholder*="0000"]').first();
    await phoneInput.fill("+1 (555) 432-1098");
    await page.fill('input[placeholder="Company"]', "Acme Ventures");
    await page.fill('input[placeholder="Title"]', "General Partner");

    // Check privacy agreement checkbox
    const privacyCheckbox = page.locator('input[type="checkbox"]');
    await privacyCheckbox.check();

    // 6. Listen for POST /api/connections and submit
    const connectionsPromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/connections") && resp.request().method() === "POST"
    );

    const submitButton = page.getByRole("button", { name: /Share Contact/i });
    await expect(submitButton).toBeVisible();
    await submitButton.click();

    // 7. Verify API response
    const connectionsResponse = await connectionsPromise;
    expect(connectionsResponse.status()).toBe(200);
    const responseJson = await connectionsResponse.json();
    expect(responseJson.success).toBe(true);

    // 8. Verify confirmation screen inside modal
    await expect(page.getByText("Sent!")).toBeVisible();
    await expect(page.getByText("Your info has been shared securely.")).toBeVisible();

    // Click Close button
    const closeButton = page.getByRole("button", { name: /Close/i });
    await closeButton.click();
    await expect(page.getByText("Sent!")).not.toBeVisible();
  });

  test("should validate API contract on POST /api/connections", async ({ request }) => {
    // Missing required fields (e.g. name or email) should return 400
    const badResponse = await request.post("/api/connections", {
      data: {
        company: "Test Corp",
      },
    });
    expect(badResponse.status()).toBe(400);
    const badJson = await badResponse.json();
    expect(badJson.error).toBeDefined();

    // Valid submission should succeed
    const validResponse = await request.post("/api/connections", {
      data: {
        name: "Morgan Taylor",
        email: "morgan.taylor@test.com",
        phone: "+15551234567",
        cardId: MOCK_PUBLIC_CARD.id,
      },
    });
    expect(validResponse.status()).toBe(200);
    const validJson = await validResponse.json();
    expect(validJson.success).toBe(true);
  });
});
