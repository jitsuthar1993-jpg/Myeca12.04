import { expect, test, type Page } from "@playwright/test";

const AUTH_TOKEN = "e2e-auth-token";
const AUTH_USER_ID = "e2e-user-1";

const authUser = {
  id: AUTH_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "e2e.user@example.com",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  created_at: "2026-01-01T00:00:00.000Z",
  app_metadata: {},
  user_metadata: {
    firstName: "E2E",
    lastName: "User",
  },
};

const appUser = {
  id: AUTH_USER_ID,
  email: "e2e.user@example.com",
  firstName: "E2E",
  lastName: "User",
  role: "user",
  status: "active",
  isVerified: true,
};

async function mockAuthenticatedWorkspace(page: Page) {
  await page.addInitScript((token) => {
    window.sessionStorage.setItem("myeca:supabase-access-token", token);
  }, AUTH_TOKEN);

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(authUser),
    });
  });

  await page.route("**/api/v1/auth/sync", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });

  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: appUser }),
    });
  });

  await page.route("**/api/user/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        stats: {
          totalReturns: 1,
          documentsUploaded: 2,
          pendingTasks: 0,
          savedAmount: 0,
        },
        activeServices: [],
      }),
    });
  });
}

test("authenticated workspace stays visible after browser focus return", async ({ page }) => {
  await mockAuthenticatedWorkspace(page);

  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
  const heading = page.getByRole("heading", { name: /Welcome, E2E/i });
  await expect(heading).toBeVisible();
  await expect(page.getByTestId("page-skeleton")).toHaveCount(0);

  await page.evaluate(() => {
    window.dispatchEvent(new Event("focus"));
    document.dispatchEvent(new Event("visibilitychange"));
  });

  await expect(heading).toBeVisible();
  await expect(page.getByTestId("page-skeleton")).toHaveCount(0);
});

test("anonymous protected route shows visible auth guard instead of an empty page", async ({
  page,
}) => {
  await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByText(/Please sign in again|Sign in|Login|Go to login/i).first(),
  ).toBeVisible();

  const mainTextLength = await page
    .locator("main")
    .evaluate((main) => main.textContent?.trim().length ?? 0)
    .catch(async () =>
      page.locator("body").evaluate((body) => body.textContent?.trim().length ?? 0),
    );
  expect(mainTextLength).toBeGreaterThan(0);
});
