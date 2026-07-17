import { expect, test, type Page } from "@playwright/test";

const AUTH_TOKEN = "e2e-workspace-token";
const AUTH_USER_ID = "e2e-workspace-user";

const authUser = {
  id: AUTH_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "workspace.user@example.com",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  created_at: "2026-01-01T00:00:00.000Z",
  app_metadata: {},
  user_metadata: { firstName: "Workspace", lastName: "User" },
};

const appUser = {
  id: AUTH_USER_ID,
  email: authUser.email,
  firstName: "Workspace",
  lastName: "User",
  role: "user",
  status: "active",
  isVerified: true,
};

async function mockWorkspace(page: Page) {
  await page.addInitScript((token) => {
    window.sessionStorage.setItem("myeca:supabase-access-token", token);
  }, AUTH_TOKEN);

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(authUser) });
  });
  await page.route("**/api/v1/auth/sync", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });
  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: appUser }) });
  });
  await page.route("**/api/user/dashboard", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        stats: { totalReturns: 1, documentsUploaded: 1, pendingTasks: 2, savedAmount: 0 },
        taxReturns: [{
          id: "return-1",
          reviewStatus: "changes_requested",
          documentChecklist: [
            { id: "salary-slip", title: "Salary slip", required: true },
            { id: "bank-statement", title: "Bank statement", required: true },
          ],
          formData: { documents: { "salary-slip": true } },
        }],
        activeServices: [
          { id: "service-1", serviceTitle: "ITR filing", paymentStatus: "pending", status: "pending" },
          { id: "service-2", serviceTitle: "Notice support", paymentStatus: "paid", status: "in_progress" },
        ],
      }),
    });
  });
  await page.route("**/api/notifications*", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          notifications: [{
            id: "notification-1",
            title: "Payment link ready",
            message: "Your ITR filing payment link is ready in your workspace.",
            type: "info",
            read: false,
            createdAt: "2026-07-17T09:00:00.000Z",
            metadata: { actionUrl: "/dashboard/services/service-1" },
          }],
          unreadCount: 1,
        }),
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });
}

test.describe("authenticated filing workspace actions", () => {
  test("shows a personalized action plan with operational destinations", async ({ page }) => {
    await mockWorkspace(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Welcome, Workspace/i })).toBeVisible();
    await expect(page.getByRole("region", { name: "Your action plan" })).toBeVisible();
    await expect(page.getByText("Respond to the review request")).toBeVisible();
    await expect(page.locator('a[href="/itr/filing/return-1"]').first()).toBeVisible();
    await expect(page.getByText("Complete the pending payment")).toBeVisible();
    await expect(page.getByText("Track your active service")).toBeVisible();
  });

  test("opens a notification destination and marks the alert as read", async ({ page }) => {
    await mockWorkspace(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Open notifications" }).click();
    await expect(page.getByText("Payment link ready")).toBeVisible();
    await page.getByText("Payment link ready").click();

    await expect(page).toHaveURL(/\/dashboard\/services\/service-1$/);
  });
});
