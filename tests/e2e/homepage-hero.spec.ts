import { expect, test } from "@playwright/test";

test("shows the redesigned homepage hero on desktop and mobile", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Estimate tax, choose your ITR path, then file.",
    }),
  ).toBeVisible();
});
