import { test, expect } from "@playwright/test";
import { resetMockDatabase, setAuthenticatedSession } from "./fixtures/test-helpers";

test.describe("08 - Auth Page & Dashboard Navigation Flow", () => {
  test.beforeEach(async () => {
    await resetMockDatabase();
  });

  test("should render auth page with social logins and demo exploration button", async ({ page }) => {
    await page.goto("/auth");

    // 1. Verify Auth page header and social providers
    await expect(page.getByText(/Sign In to Your Card/i)).toBeVisible();
    await expect(page.getByText(/Continue with Google/i)).toBeVisible();
    await expect(page.getByText(/Continue with GitHub/i)).toBeVisible();

    // Telegram should be disabled / marked as Coming Soon
    const telegramBtn = page.locator('button:has-text("Telegram")');
    await expect(telegramBtn).toBeVisible();
    await expect(telegramBtn).toBeDisabled();

    // Magic link input should be present
    await expect(page.locator('input[type="email"]')).toBeVisible();

    // 2. Demo exploration button should be visible
    const demoButton = page.getByRole("button", { name: /Explore Demo Experience|Guest Demo/i });
    await expect(demoButton).toBeVisible();
  });

  test("should navigate to /dashboard via demo bypass, display cards, and allow card duplication", async ({ page, context }) => {
    await page.goto("/auth");

    // Click demo exploration button
    const demoButton = page.getByRole("button", { name: /Explore Demo Experience|Guest Demo/i });
    await expect(demoButton).toBeVisible();
    await demoButton.click();

    // Verify navigation to /dashboard
    await page.waitForURL("**/dashboard**", { timeout: 10000 });
    expect(page.url()).toContain("/dashboard");

    // Verify dashboard cards are loaded
    await expect(page.getByRole("heading", { name: /My Business Cards|Digital Cards|My Cards/i }).first()).toBeVisible();

    // Verify card actions (Edit, Duplicate, View/Preview)
    const duplicateButton = page.locator('button[title="Duplicate Card"], button:has-text("Duplicate")').first();
    await expect(duplicateButton).toBeVisible();

    // Count initial cards before duplication
    const initialCardCount = await page.locator('button:has-text("Duplicate")').count();

    // Click Duplicate button
    await duplicateButton.click();

    // Wait for duplication to complete and verify card listing includes the duplicate
    await expect(page.getByText(/\(Copy\)/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("should synchronize trash view when navigating to /dashboard?tab=trash and via /dashboard/cards/trash redirect", async ({ page, context }) => {
    // Set demo session cookies so middleware allows dashboard access
    await context.addCookies([
      {
        name: "demo_session",
        value: "true",
        domain: "localhost",
        path: "/",
      },
    ]);

    // 1. Direct navigation to ?tab=trash
    await page.goto("/dashboard?tab=trash");
    await expect(page.locator('button:has-text("Trash")').first()).toHaveClass(/bg-white|active|shadow/);

    // Verify trash section content (empty state, trashed cards notice, or restore buttons)
    const trashIndicators = page.getByText(/Trash is empty|Deleted Cards|Restore/i);
    await expect(trashIndicators.first()).toBeVisible();

    // 2. Test /dashboard/cards/trash route redirection to /dashboard?tab=trash
    await page.goto("/dashboard/cards/trash");
    await page.waitForURL("**/dashboard?tab=trash**", { timeout: 10000 });
    expect(page.url()).toContain("tab=trash");
  });
});
