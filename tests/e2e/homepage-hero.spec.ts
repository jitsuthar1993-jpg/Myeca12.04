import { expect, test } from "@playwright/test";

test("shows the redesigned homepage hero on desktop and mobile", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "File your Tax Returns with expert CA assistance",
    }),
  ).toBeVisible();
});
