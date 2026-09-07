import { test, expect } from "@playwright/test";
import { MOCK_PUBLIC_CARD } from "./fixtures/mock-data";
import { resetMockDatabase } from "./fixtures/test-helpers";

test.describe("04 - Meeting Booking Flow & Calendar Export", () => {
  test.beforeEach(async () => {
    await resetMockDatabase();
  });

  test("should open BookingModal, select date and time, fill attendee details, submit, and provide calendar export actions", async ({ page }) => {
    await page.goto(`/${MOCK_PUBLIC_CARD.slug}`);

    // 1. Click "Meet" quick action pill or "Book Meeting" button
    const meetButton = page.getByRole("button", { name: /Meet|Book Meeting|Schedule/i }).first();
    await expect(meetButton).toBeVisible();
    await meetButton.click({ force: true });

    // 2. Verify BookingModal opens
    const bookingHeader = page.getByText(/Select Available Date/i).first();
    await expect(bookingHeader).toBeVisible();

    // 3. Step 1: Date selection
    // Find available date pills and click the first available
    const datePills = page.locator('button:has-text("Day"), button:has([class*="font-semibold"])').filter({
      hasNotText: "Confirm",
    });
    const dateButtons = page.locator("div.flex.gap-2.overflow-x-auto button");
    if ((await dateButtons.count()) > 1) {
      await dateButtons.nth(1).click();
    }

    // 4. Step 2: Time slot selection
    const timeSlotButtons = page.locator('button.font-mono, button:has-text(":")').filter({
      hasNotText: "Call",
    });
    await expect(timeSlotButtons.first()).toBeVisible();
    await timeSlotButtons.first().click();

    // 5. Step 3: Enter attendee details
    await page.fill('input[placeholder="Your Full Name *"]', "Sam Rivera");
    await page.fill('input[placeholder="Your Email *"]', "sam.rivera@example.com");
    await page.fill('input[placeholder*="Phone Number"]', "+1 (555) 987-6543");
    await page.fill('textarea[placeholder*="agenda"]', "Discuss AI platform integration partnership.");

    // Check privacy agreement
    const agreementCheckbox = page.locator('input[type="checkbox"]');
    await agreementCheckbox.check();

    // 6. Submit the booking and wait for POST /api/bookings
    const bookingPromise = page.waitForResponse(
      (resp) => resp.url().includes("/api/bookings") && resp.request().method() === "POST"
    );

    const confirmButton = page.getByRole("button", { name: /Confirm & Book Slot/i });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    const bookingResponse = await bookingPromise;
    expect(bookingResponse.status()).toBe(200);
    const bookingJson = await bookingResponse.json();
    expect(bookingJson.success).toBe(true);

    // 7. Verify Confirmation screen
    await expect(page.getByText(/Meeting Confirmed!/i)).toBeVisible();
    await expect(page.getByText(/Sam Rivera/i)).toBeVisible();

    // 8. Verify Google Calendar and .ICS download buttons exist
    const gCalButton = page.getByRole("button", { name: /Add to Google Calendar/i });
    const icsButton = page.getByRole("button", { name: /Download \.ICS File/i });

    await expect(gCalButton).toBeVisible();
    await expect(icsButton).toBeVisible();

    // 9. Trigger and verify .ics file download
    const downloadPromise = page.waitForEvent("download");
    await icsButton.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.ics$/i);
  });

  test("should enforce input validation contract on POST /api/bookings", async ({ request }) => {
    // Missing required fields (e.g. name, email, date) returns 400
    const invalidResponse = await request.post("/api/bookings", {
      data: {
        cardId: MOCK_PUBLIC_CARD.id,
        visitorName: "Incomplete User",
      },
    });
    expect(invalidResponse.status()).toBe(400);
    const errJson = await invalidResponse.json();
    expect(errJson.error).toBeDefined();

    // Valid booking call succeeds with 200
    const validResponse = await request.post("/api/bookings", {
      data: {
        cardId: MOCK_PUBLIC_CARD.id,
        visitorName: "Casey Smith",
        visitorEmail: "casey@example.com",
        meetingDate: "2026-10-15",
        meetingTime: "14:00",
        meetingNotes: "Q4 Roadmap Review",
      },
    });
    expect(validResponse.status()).toBe(200);
    const resJson = await validResponse.json();
    expect(resJson.success).toBe(true);
  });
});
