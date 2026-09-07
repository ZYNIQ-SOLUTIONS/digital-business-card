import { BrowserContext } from "@playwright/test";
import { TEST_USER_ID } from "./mock-data";

export async function resetMockDatabase() {
  try {
    await fetch("http://127.0.0.1:54321/__reset");
  } catch {
    // Ignore if mock server isn't running or endpoint unavailable
  }
}

export async function setAuthenticatedSession(context: BrowserContext) {
  // Sets mock Supabase auth cookies for dashboard tests
  await context.addCookies([
    {
      name: "sb-access-token",
      value: "mock-jwt-token",
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
    {
      name: "sb-mock-user",
      value: TEST_USER_ID,
      domain: "localhost",
      path: "/",
      httpOnly: false,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}
