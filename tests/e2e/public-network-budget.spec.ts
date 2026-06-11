import { expect, test, type Browser, type TestInfo } from "@playwright/test";

type PublicRouteBudget = {
  route: string;
  ceilingBytes: number;
};

type JavaScriptResponse = {
  url: string;
  bytes: number;
};

const publicRouteBudgets: PublicRouteBudget[] = [
  { route: "/", ceilingBytes: 950_000 },
  { route: "/services", ceilingBytes: 950_000 },
  { route: "/pricing", ceilingBytes: 950_000 },
  { route: "/blog", ceilingBytes: 1_050_000 },
  { route: "/calculators/tax-regime", ceilingBytes: 1_050_000 },
];

const googleFontHostPattern = /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\//i;
const supabaseChunkPattern = /\/supabase-[^/]*\.js(?:\?.*)?$/i;

async function measurePublicRouteJavaScript(
  browser: Browser,
  testInfo: TestInfo,
  route: string,
) {
  const baseURL = testInfo.project.use.baseURL;
  expect(baseURL, "Playwright must provide a baseURL for public network budgets").toBeTruthy();

  const { deviceScaleFactor, hasTouch, isMobile, userAgent, viewport } = testInfo.project.use;
  const context = await browser.newContext({
    baseURL: String(baseURL),
    deviceScaleFactor,
    hasTouch,
    isMobile,
    serviceWorkers: "block",
    userAgent,
    viewport,
  });

  try {
    const page = await context.newPage();
    const requestUrls: string[] = [];
    const javascriptResponses: Array<Promise<JavaScriptResponse>> = [];

    // Playwright routing disables Chromium's shared HTTP cache, keeping every
    // fresh-context route measurement independently cold.
    await page.route("**/*", (route) => route.continue());
    page.on("request", (request) => requestUrls.push(request.url()));
    page.on("response", (response) => {
      const url = response.url();
      if (response.request().resourceType() !== "script" && !/\.js(?:\?.*)?$/i.test(url)) {
        return;
      }

      javascriptResponses.push(
        response.body().then((body) => ({
          url,
          bytes: body.byteLength,
        })),
      );
    });

    await page.goto(route, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.body.innerText.trim().length >= 80);
    await page.waitForLoadState("networkidle");

    return {
      requestUrls,
      scripts: await Promise.all(javascriptResponses),
    };
  } finally {
    await context.close();
  }
}

test.describe("anonymous public route network budgets", () => {
  for (const { route, ceilingBytes } of publicRouteBudgets) {
    test(`${route} stays within its decoded JavaScript ceiling`, async ({ browser }, testInfo) => {
      const { requestUrls, scripts } = await measurePublicRouteJavaScript(browser, testInfo, route);
      const totalBytes = scripts.reduce((total, script) => total + script.bytes, 0);
      const supabaseChunks = scripts.filter((script) => supabaseChunkPattern.test(script.url));
      const googleFontRequests = requestUrls.filter((url) => googleFontHostPattern.test(url));

      await testInfo.attach("public-route-javascript-budget.json", {
        body: Buffer.from(
          JSON.stringify(
            {
              route,
              totalBytes,
              ceilingBytes,
              scriptCount: scripts.length,
              scripts: [...scripts].sort((left, right) => right.bytes - left.bytes),
            },
            null,
            2,
          ),
        ),
        contentType: "application/json",
      });

      expect.soft(
        supabaseChunks.map((script) => script.url),
        `${route} must not fetch a Supabase JavaScript chunk`,
      ).toEqual([]);
      expect.soft(googleFontRequests, `${route} must not request Google Fonts`).toEqual([]);
      expect(
        totalBytes,
        `${route} loaded ${totalBytes.toLocaleString()} decoded JavaScript bytes across ${scripts.length} scripts`,
      ).toBeLessThanOrEqual(ceilingBytes);
    });
  }
});
