import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/pricing",
  "/blog",
  "/calculators/income-tax",
  "/itr/form-selector",
  "/services",
  "/compare/tax2win-alternative",
];

const breakpoints = [320, 360, 390, 430, 768, 1440];

test("keeps growth-roadmap public pages responsive across key widths", async ({ page }) => {
  for (const width of breakpoints) {
    await page.setViewportSize({ width, height: width >= 768 ? 900 : 844 });

    for (const route of publicRoutes) {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `${route} overflow at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});

test("shows the mobile public conversion bar on public marketing pages", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const mobileBar = page.getByRole("navigation", { name: "Public conversion actions" });
  await expect(mobileBar).toBeVisible();
  await expect(mobileBar.getByRole("link", { name: "Start ITR", exact: true })).toBeVisible();
  await expect(mobileBar.getByRole("link", { name: "Talk to Expert", exact: true })).toBeVisible();
});
