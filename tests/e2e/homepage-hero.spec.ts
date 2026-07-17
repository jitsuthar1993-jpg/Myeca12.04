import { expect, test } from "@playwright/test";

test("shows the redesigned homepage hero on desktop and mobile", async ({ page }) => {
  await page.goto("/");

  const heroHeading = page.locator("h1").first();
  await expect(heroHeading).toBeVisible();
  await expect(heroHeading).toContainText(/File your/i);
  await expect(heroHeading).toContainText(/Income Tax Returns|GST Returns|TDS Returns|Compliances/i);
  await expect(heroHeading).not.toContainText(/assistance/i);
  await expect(page.getByText(/Expert eCA Assistance/i)).toBeVisible();
  await expect(page.getByText(/Free Notice Assistance/i)).toBeVisible();
  await expect(page.locator(".animate-pulse").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Find my ITR and price/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Free Tax Calculator/i }).first()).toBeVisible();
});
