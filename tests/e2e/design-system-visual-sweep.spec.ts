import { expect, test, type Locator, type Page, type TestInfo } from "@playwright/test";

const publicRoutes = [
  "/",
  "/services",
  "/pricing",
  "/calculators",
  "/calculators/tax-regime",
  "/blog",
  "/blog/when-will-itr-filing-start-ay-2026-27",
  "/which-itr-form-to-file",
  "/auth/login",
  "/documents/generator",
  "/expert-consultation",
];

const liveBaseUrl = (process.env.MYECA_LIVE_BASE_URL || "https://myeca.in").replace(/\/+$/, "");
const liveUserEmail = process.env.MYECA_LIVE_USER_EMAIL;
const liveUserPassword = process.env.MYECA_LIVE_USER_PASSWORD;
const hasLiveUserCredentials = Boolean(liveUserEmail && liveUserPassword);
const mockedAuthToken = "design-system-e2e-auth-token";
const mockedAuthUserId = "design-system-e2e-user";

const mockedAuthUser = {
  id: mockedAuthUserId,
  aud: "authenticated",
  role: "authenticated",
  email: "design-system.e2e@example.com",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  created_at: "2026-01-01T00:00:00.000Z",
  app_metadata: {},
  user_metadata: {
    firstName: "Design",
    lastName: "System",
  },
};

const mockedAppUser = {
  id: mockedAuthUserId,
  email: "design-system.e2e@example.com",
  firstName: "Design",
  lastName: "System",
  role: "user",
  status: "active",
  isVerified: true,
};

function routeArtifactName(route: string) {
  return route === "/" ? "home.png" : `${route.replace(/^\/|\/$/g, "").replace(/\//g, "-")}.png`;
}

async function expectUsableRoute(page: Page, route: string, pageErrors: string[]) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.innerText.trim().length >= 80);
  await page.evaluate(() => document.fonts.ready);

  const bodyText = await page.locator("body").innerText();
  expect(bodyText, `${route} rendered an app error shell`).not.toMatch(
    /JavaScript Error|Something went wrong|Application error|Page Not Found/i,
  );
  expect(pageErrors, `${route} raised route-load page errors`).toEqual([]);
}

async function expectNoHorizontalOverflow(page: Page, route: string) {
  const result = await page.evaluate(() => {
    const documentWidth = document.documentElement.scrollWidth;
    const bodyWidth = document.body?.scrollWidth ?? 0;
    const viewportWidth = window.innerWidth;
    const maxWidth = Math.max(documentWidth, bodyWidth);
    const offenders = Array.from(document.body.querySelectorAll<HTMLElement>("body *"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const computed = window.getComputedStyle(element);
        return {
          tag: element.tagName.toLowerCase(),
          className: typeof element.className === "string" ? element.className.slice(0, 120) : "",
          text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          overflowX: computed.overflowX,
        };
      })
      .filter((item) => item.width > 0 && (item.left < -2 || item.right > viewportWidth + 2))
      .filter((item) => item.overflowX !== "auto" && item.overflowX !== "scroll")
      .slice(0, 5);

    return {
      documentWidth,
      bodyWidth,
      viewportWidth,
      overflowBy: maxWidth - viewportWidth,
      offenders,
    };
  });

  expect(result.overflowBy, `${route} horizontal overflow: ${JSON.stringify(result)}`).toBeLessThanOrEqual(2);
}

async function expectOpaqueSurface(surface: Locator, label: string) {
  await expect(surface, `${label} should be visible`).toBeVisible();

  const background = await surface.evaluate((element) => {
    const computed = window.getComputedStyle(element);
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    if (!context) return { alpha: 0, color: computed.backgroundColor, image: computed.backgroundImage };

    context.clearRect(0, 0, 1, 1);
    context.fillStyle = computed.backgroundColor;
    context.fillRect(0, 0, 1, 1);

    return {
      alpha: context.getImageData(0, 0, 1, 1).data[3] / 255,
      color: computed.backgroundColor,
      image: computed.backgroundImage,
    };
  });

  expect(
    background.alpha === 1,
    `${label} must have an opaque surface: ${JSON.stringify(background)}`,
  ).toBe(true);
}

async function expectStaticCardsDoNotLift(page: Page, route: string) {
  await page.addStyleTag({ content: "*, *::before, *::after { transition-duration: 0s !important; }" });

  const candidates = page.locator('[class*="hover:-translate-y"], [class*="group-hover:-translate-y"]');
  const staticCandidates: Locator[] = [];

  for (let index = 0; index < (await candidates.count()); index += 1) {
    const candidate = candidates.nth(index);
    const isStaticCard = await candidate
      .evaluate((element) => {
        if (!(element instanceof HTMLElement)) return false;
        const className = typeof element.className === "string" ? element.className : "";
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const interactiveSelector =
          "a, button, input, select, textarea, [role='button'], [role='link'], [tabindex]:not([tabindex='-1'])";

        return (
          rect.width >= 120 &&
          rect.height >= 80 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          !className.includes("cursor-pointer") &&
          !element.matches(interactiveSelector) &&
          !element.closest(interactiveSelector)
        );
      })
      .catch(() => false);

    if (isStaticCard) staticCandidates.push(candidate);
  }

  for (const candidate of staticCandidates) {
    const before = await candidate.evaluate((element) => window.getComputedStyle(element).transform);
    await candidate.hover();
    const after = await candidate.evaluate((element) => window.getComputedStyle(element).transform);
    const className = await candidate.getAttribute("class");

    expect(after, `${route} static card must not transform on hover: ${className}`).toBe(before);
  }
}

async function expectCanonicalFocusViaTab(page: Page, target: Locator, label: string) {
  await expect(target, `${label} should be visible`).toBeVisible();
  await page.evaluate(() => {
    (document.activeElement as HTMLElement | null)?.blur();
    document.body.tabIndex = -1;
    document.body.focus();
  });

  let reachedTarget = false;
  for (let index = 0; index < 250; index += 1) {
    await page.keyboard.press("Tab");
    reachedTarget = await target.evaluate(
      (element) => element === document.activeElement || element.contains(document.activeElement),
    );
    if (reachedTarget) break;
  }

  expect(reachedTarget, `${label} should be reachable with Tab`).toBe(true);

  const focusStyle = await page.evaluate(() => {
    const active = document.activeElement;
    if (!(active instanceof HTMLElement)) return null;
    const style = window.getComputedStyle(active);
    return {
      tag: active.tagName.toLowerCase(),
      text: (active.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
      outlineOffset: style.outlineOffset,
    };
  });

  expect(focusStyle, `${label} should expose a focused HTMLElement`).not.toBeNull();
  expect(focusStyle?.outlineStyle, `${label} should use a visible focus outline`).not.toBe("none");
  expect(focusStyle?.outlineWidth, `${label} should use the canonical 2px outline`).toBe("2px");
  expect(focusStyle?.outlineOffset, `${label} should use the canonical 2px outline offset`).toBe("2px");
}

async function signInLiveUser(page: Page) {
  await page.goto(`${liveBaseUrl}/auth/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel(/email/i).fill(liveUserEmail!);
  await page.getByLabel(/password/i).fill(liveUserPassword!);
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await expect
    .poll(() => page.evaluate(() => window.sessionStorage.getItem("myeca:supabase-access-token") || ""), {
      message: "Live user login should expose an authenticated API token",
      timeout: 20_000,
    })
    .not.toBe("");
}

async function mockAuthenticatedWorkspace(page: Page) {
  await page.addInitScript((token) => {
    window.sessionStorage.setItem("myeca:supabase-access-token", token);
  }, mockedAuthToken);

  await page.route("**/auth/v1/user", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockedAuthUser),
    });
  });

  await page.route("**/api/v1/auth/sync", async (route) => {
    await route.fulfill({ status: 204, body: "" });
  });

  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: mockedAppUser }),
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

test.describe("design-system public visual sweep", () => {
  for (const route of publicRoutes) {
    test(`${route} renders a stable public artifact`, async ({ page }, testInfo) => {
      test.setTimeout(60_000);
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await expectUsableRoute(page, route, pageErrors);
      await page.screenshot({
        path: testInfo.outputPath(routeArtifactName(route)),
        fullPage: true,
        animations: "disabled",
      });
      await expectNoHorizontalOverflow(page, route);
      await expectStaticCardsDoNotLift(page, route);
    });
  }

  test("global command surface is opaque", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.innerText.trim().length >= 80);
    await page.keyboard.press("Control+k");

    const searchInput = page.getByPlaceholder("Search services, calculators, help articles...");
    await expect(searchInput).toBeVisible();
    const commandSurface = page.getByRole("dialog", { name: "Global search" });
    await expectOpaqueSurface(commandSurface, "Global command");
    await page.screenshot({
      path: testInfo.outputPath("home-global-command.png"),
      animations: "disabled",
    });
  });

  test("tax-regime Select surface is opaque", async ({ page }, testInfo) => {
    await page.goto("/calculators/tax-regime", { waitUntil: "domcontentloaded" });
    await page.locator('button[role="combobox"]').first().click();

    const selectSurface = page.locator('[role="listbox"]').first();
    await expectOpaqueSurface(selectSurface, "Assessment-year Select");
    await page.screenshot({
      path: testInfo.outputPath("tax-regime-assessment-year-select.png"),
      animations: "disabled",
    });
  });

  test("tax-regime destructive toast surface is opaque", async ({ page }, testInfo) => {
    await page.goto("/calculators/tax-regime", { waitUntil: "domcontentloaded" });
    await page.locator('input[type="number"]').first().fill("-1");
    await page.getByRole("button", { name: /compare now/i }).click();

    const toastTitle = page.getByText("Invalid Input", { exact: true });
    await expect(toastTitle).toBeVisible();
    const toastSurface = toastTitle.locator("xpath=ancestor::*[@data-state='open'][1]");
    await expectOpaqueSurface(toastSurface, "Destructive toast");
    await page.screenshot({
      path: testInfo.outputPath("tax-regime-destructive-toast.png"),
      animations: "disabled",
    });
  });

  test("header, first CTA, and footer link use canonical keyboard focus", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === "mobile", "Keyboard focus is verified in the desktop keyboard project.");

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.innerText.trim().length >= 80);

    await expectCanonicalFocusViaTab(
      page,
      page.locator("header a, header button").filter({ visible: true }).first(),
      "Visible header control",
    );
    await expectCanonicalFocusViaTab(
      page,
      page.locator("main a, main button").filter({ visible: true }).first(),
      "First main CTA",
    );
    await expectCanonicalFocusViaTab(
      page,
      page.locator("footer a").filter({ visible: true }).first(),
      "Visible footer link",
    );
  });
});

test.describe("authenticated design-system visual sweep", () => {
  test("mocked user dashboard renders a stable artifact", async ({ page }, testInfo) => {
    await mockAuthenticatedWorkspace(page);
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: /Welcome, Design/i })).toBeVisible();
    await expect(page.getByTestId("page-skeleton")).toHaveCount(0);
    await expectNoHorizontalOverflow(page, "/dashboard");
    await page.screenshot({
      path: testInfo.outputPath("authenticated-dashboard-mocked.png"),
      fullPage: true,
      animations: "disabled",
    });
  });

  test("live user dashboard renders a stable artifact", async ({ page }, testInfo) => {
    test.skip(!hasLiveUserCredentials, "Live user credentials are required for dashboard screenshots.");

    await signInLiveUser(page);
    await page.goto(`${liveBaseUrl}/dashboard`, { waitUntil: "domcontentloaded" });

    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/JavaScript Error|Something went wrong|Application error|Page Not Found/i);
    await expectNoHorizontalOverflow(page, "/dashboard");
    await page.screenshot({
      path: testInfo.outputPath("authenticated-dashboard.png"),
      fullPage: true,
      animations: "disabled",
    });
  });
});
