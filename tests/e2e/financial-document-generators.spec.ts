import { expect, test } from "@playwright/test";

test("guest quotation preview recalculates GST and preserves the draft through the export gate", async ({ page }) => {
  await page.goto("/documents/generator/gst-quotation");

  await page.locator('input[name="firstParty.name"]').fill("Sample Seller Private Limited");
  await page.locator('input[name="secondParty.name"]').fill("Sample Karnataka Buyer");
  await page.locator('input[name="items.0.description"]').fill("Accounting advisory service");
  await page.locator('input[name="items.0.rate"]').fill("10000");
  await page.locator('select[name="secondParty.stateCode"]').selectOption("29");
  await page.locator('select[name="placeOfSupplyStateCode"]').selectOption("29");

  const previewButton = page.getByRole("button", { name: "Preview", exact: true });
  if (await previewButton.isVisible()) {
    await previewButton.click();
    await expect(page.getByTestId("mobile-document-preview")).toBeVisible();
  }
  const mobilePreview = page.getByTestId("mobile-document-preview");
  const previewRoot = await mobilePreview.isVisible() ? mobilePreview : page.locator("main");

  await expect(previewRoot).toContainText("Quotation / Estimate - Not a Tax Invoice.");
  await expect(previewRoot).toContainText("Sample Seller Private Limited");
  await expect(previewRoot).toContainText("Sample Karnataka Buyer");
  await expect(previewRoot).toContainText(/IGST\s*₹1,800.00/);
  await expect(previewRoot).toContainText(/Grand total\s*₹11,800.00/);
  if (await mobilePreview.isVisible()) {
    await mobilePreview.getByRole("button", { name: "Close document preview" }).click();
  }

  await page.getByRole("button", { name: "Sign in to Export" }).click();
  await page.getByRole("menuitem", { name: "Export as PDF" }).click();

  await expect(page).toHaveURL(/\/auth\/login\?next=%2Fdocuments%2Fgenerator%2Fgst-quotation$/);
  expect(page.url()).not.toContain("Sample");
  expect(await page.evaluate(() => sessionStorage.getItem("myeca_generator_pending_action"))).toBe("export");
  expect(await page.evaluate(() => sessionStorage.getItem("myeca_generator_pending_gst-quotation")))
    .toContain("Sample Seller Private Limited");
});

test("representative financial generators render their required warnings and defaults", async ({ page }) => {
  const routes = [
    {
      path: "/documents/generator/delivery-challan",
      expected: [
        "This tool does not generate an e-way bill.",
        "ORIGINAL FOR CONSIGNEE",
        "DUPLICATE FOR TRANSPORTER",
        "TRIPLICATE FOR CONSIGNOR",
      ],
    },
    {
      path: "/documents/generator/loan-agreement",
      expected: ["Execution State", "Repayment Schedule", "stamp duty"],
    },
    {
      path: "/documents/generator/projected-balance-sheet",
      expected: ["The statement must balance before export.", "Current ratio", "Debt-equity ratio"],
    },
    {
      path: "/documents/generator/net-worth-statement",
      expected: ["Self-prepared Net Worth Statement - Not CA Certified.", "Request optional CA review"],
    },
  ];

  for (const route of routes) {
    await page.goto(route.path);
    const previewButton = page.getByRole("button", { name: "Preview", exact: true });
    if (await previewButton.isVisible()) {
      await previewButton.click();
      await expect(page.getByTestId("mobile-document-preview")).toBeVisible();
    }
    const mobilePreview = page.getByTestId("mobile-document-preview");

    for (const text of route.expected) {
      await expect(page.locator("body")).toContainText(text);
    }
    if (await mobilePreview.isVisible()) {
      await mobilePreview.getByRole("button", { name: "Close document preview" }).click();
    }
    await expect(page.locator("body")).not.toContainText("NaN");
    await expect(page.locator("body")).not.toContainText("Invalid Date");
    expect(await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    )).toBeLessThanOrEqual(1);
  }
});
