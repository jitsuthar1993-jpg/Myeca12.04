import { expect, test } from "@playwright/test";

test.use({ serviceWorkers: "allow" });

async function waitForServiceWorkerControl(page: import("@playwright/test").Page) {
  await page.goto("/", { waitUntil: "load" });
  await page.waitForFunction(
    () => "serviceWorker" in navigator && navigator.serviceWorker.ready.then(() => true),
    undefined,
    { timeout: 20_000 },
  );
  await page.reload({ waitUntil: "load" });
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller)), {
      message: "page should be controlled by the PWA service worker",
      timeout: 20_000,
    })
    .toBe(true);
}

test.describe("PWA offline behavior", () => {
  test("serves public app shell offline without caching private routes", async ({ context, page }) => {
    test.setTimeout(45_000);

    await waitForServiceWorkerControl(page);

    try {
      await page.goto("/calculators/income-tax", { waitUntil: "networkidle" });
      await expect(page.locator("body")).toContainText(/Income Tax Calculator/i);

      await context.setOffline(true);
      await page.reload({ waitUntil: "domcontentloaded" });
      expect(new URL(page.url()).pathname.replace(/\/$/, "")).toBe("/calculators/income-tax");
      await expect(page.locator("body")).toContainText(/Income Tax Calculator/i);

      let privateRouteFailedOffline = false;
      try {
        await page.goto("/dashboard", { waitUntil: "domcontentloaded", timeout: 10_000 });
      } catch {
        privateRouteFailedOffline = true;
      }

      expect(privateRouteFailedOffline).toBe(true);
    } finally {
      await context.setOffline(false);
    }
  });
});
