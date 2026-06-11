import { expect, test, type Page } from "@playwright/test";

const AUTH_TOKEN = "itr-filing-e2e-token";
const AUTH_USER_ID = "itr-filing-e2e-user";

const authUser = {
  id: AUTH_USER_ID,
  aud: "authenticated",
  role: "authenticated",
  email: "itr.e2e@example.com",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  created_at: "2026-01-01T00:00:00.000Z",
  app_metadata: {},
  user_metadata: { firstName: "Mobile", lastName: "Filer" },
};

const appUser = {
  id: AUTH_USER_ID,
  email: authUser.email,
  firstName: "Mobile",
  lastName: "Filer",
  role: "user",
  status: "active",
  isVerified: true,
};

const validDraft = {
  assessmentYear: "2026-27",
  filingOwner: { mode: "self" },
  taxpayer: {
    type: "individual",
    residentialStatus: "resident",
    firstName: "Mobile",
    lastName: "Filer",
    dateOfBirth: "1990-01-01",
    pan: "ABCDE1234F",
    aadhaar: "123412341234",
    mobile: "9876543210",
    email: authUser.email,
    bankAccountHolder: "Mobile Filer",
    bankName: "Example Bank",
    ifsc: "HDFC0001234",
    bankAccount: "123456789012",
    bankAccountConfirm: "123456789012",
    bankAccountType: "savings",
  },
  income: {
    selectedTypes: ["salary"],
    salary: 900000,
  },
  taxPaid: { tds: 65000 },
};

async function mockAuthenticatedFiling(page: Page, initialDraft: Record<string, unknown> = validDraft) {
  let draft = structuredClone(initialDraft);
  let status = "draft";

  await page.addInitScript((token) => {
    window.sessionStorage.setItem("myeca:supabase-access-token", token);
  }, AUTH_TOKEN);

  await page.route("**/auth/v1/user", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(authUser) }));
  await page.route("**/api/v1/auth/sync", (route) => route.fulfill({ status: 204, body: "" }));
  await page.route("**/api/v1/auth/me", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ user: appUser }) }));
  await page.route("**/api/documents", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ documents: [] }) }));

  await page.route("**/api/tax-returns/**", async (route) => {
    const request = route.request();
    if (request.url().endsWith("/submit-review")) {
      status = "ready_for_review";
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
      return;
    }
    if (request.method() === "PATCH") {
      const body = request.postDataJSON() as { draft?: Record<string, unknown> };
      if (body.draft) draft = body.draft;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ taxReturn: { id: "return_mobile", status, reviewStatus: status, formData: draft } }),
    });
  });

  await page.route("**/api/tax-returns", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        taxReturns: [{
          id: "return_mobile",
          profileId: null,
          assessmentYear: "2026-27",
          itrType: "ITR-1",
          status,
          reviewStatus: status,
          formData: draft,
        }],
      }),
    }));

  return {
    getDraft: () => structuredClone(draft),
  };
}

test("mobile salaried filer traverses panes, defers a document, and submits for review", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile filing journey only.");
  const filing = await mockAuthenticatedFiling(page);
  await page.goto("/itr/filing", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("button", { name: "My own ITR" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Save draft/i })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page.getByLabel("First name")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "PAN" })).toHaveCount(0);
  await expect(page.getByLabel("First name")).toHaveAttribute("autocomplete", "given-name");
  await expect(page.getByLabel("First name")).toHaveAttribute("data-filing-field", "true");

  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page.getByRole("textbox", { name: "PAN" })).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel("First name")).toBeVisible();
  await expect(page).toHaveURL(/\/itr\/filing$/);

  while (await page.getByText("Document checklist", { exact: true }).count() === 0) {
    await page.getByRole("button", { name: /Continue/i }).click();
  }
  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page.getByRole("button", { name: /Provide later/i })).toBeVisible();
  await page.getByRole("button", { name: /Provide later/i }).click();
  await expect.poll(() => Boolean((filing.getDraft() as any).documentDeferrals?.form16)).toBe(true);
  await expect(page.getByRole("button", { name: /Provide later/i })).toBeVisible();

  while (await page.getByText("Review packet", { exact: true }).count() === 0) {
    await page.getByRole("button", { name: /Continue/i }).click();
  }
  await expect(page.getByText(/document checks/i)).toBeVisible();
  await page.getByRole("button", { name: /Submit for CA review/i }).click();
  await expect(page.getByText(/Submitted for CA review/i)).toBeVisible();
});

test("mobile validation stays on the pane until identity formats are corrected", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile filing journey only.");
  await mockAuthenticatedFiling(page, {
    ...validDraft,
    taxpayer: {
      ...validDraft.taxpayer,
      pan: "",
      aadhaar: "",
    },
  });
  await page.goto("/itr/filing", { waitUntil: "domcontentloaded" });

  await page.getByRole("button", { name: /Continue/i }).click();
  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page.getByRole("textbox", { name: "PAN" })).toBeVisible();

  await page.getByRole("button", { name: /Continue/i }).click();
  await expect(page.getByText("PAN format needs correction")).toBeVisible();
  await expect(page.getByText("Aadhaar format needs correction")).toBeVisible();

  await page.getByRole("textbox", { name: "PAN" }).fill("ABCDE1234F");
  await page.getByRole("textbox", { name: "Aadhaar" }).fill("123412341234");
  await page.getByRole("button", { name: /Continue/i }).click();
  const mobileInput = page.getByRole("textbox", { name: "Mobile" });
  await expect(mobileInput).toBeVisible();
  await expect(mobileInput).toHaveAttribute("inputmode", "tel");
  await expect(mobileInput).toHaveAttribute("autocomplete", "tel-national");
});
