import { expect, test, type Page } from "@playwright/test";

const publicRoutes = [
  "/",
  "/services",
  "/pricing",
  "/itr/form-selector",
];

const privateRoutes = [
  "/integrations",
  "/dashboard",
  "/admin",
  "/reports",
  "/documents",
];

const visualLayoutRoutes = [
  "/",
  "/services",
  "/pricing",
  "/itr/form-selector",
  "/services/itr-for-salaried",
  "/services/company-registration",
  "/services/gst-returns",
  "/auth/login",
  "/admin",
];

const forbiddenPublicContent = [
  "dQw4w9WgXcQ",
  "/api/placeholder/320/180",
  "50K+",
  "Watch Demo",
  "Most watched tutorials",
  "tel:+919876543210",
  "wa.me/919876543210",
  "+91-9876543210",
  "Trusted by 10,000+",
  "Trusted by 25,000+",
  "Trusted by 5000+",
  "99.9% Accuracy",
  "Zero Penalty",
  "Same Day Filing",
];

async function expectUsablePage(page: Page, route: string) {
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.innerText.trim().length >= 80);

  const bodyText = await page.locator("body").innerText();
  expect(bodyText.trim().length, `${route} rendered too little content`).toBeGreaterThanOrEqual(80);
  expect(bodyText, `${route} rendered an app error shell`).not.toMatch(/JavaScript Error|Something went wrong/i);

  const html = await page.content();
  for (const forbidden of forbiddenPublicContent) {
    expect(`${bodyText}\n${html}`, `${route} includes placeholder or unverifiable content: ${forbidden}`).not.toContain(forbidden);
  }
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
      .slice(0, 3);

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

async function expectResponsiveLayout(page: Page, route: string) {
  await expectNoHorizontalOverflow(page, route);

  const result = await page.evaluate(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const visible = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
    };

    const overflowingControls = Array.from(document.querySelectorAll<HTMLElement>("button, a[role='button'], a.inline-flex"))
      .filter(visible)
      .filter((element) => {
        const text = (element.textContent || "").trim();
        if (!text) return false;
        const className = typeof element.className === "string" ? element.className : "";
        if (className.includes("truncate") || className.includes("overflow-hidden")) return false;
        return element.scrollWidth - element.clientWidth > 2 || element.scrollHeight - element.clientHeight > 2;
      })
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
        className: typeof element.className === "string" ? element.className.slice(0, 120) : "",
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
      }))
      .slice(0, 5);

    const incoherentFixedElements = Array.from(document.querySelectorAll<HTMLElement>("body *"))
      .filter(visible)
      .filter((element) => {
        const style = window.getComputedStyle(element);
        if (style.position !== "fixed") return false;
        const rect = element.getBoundingClientRect();
        const className = typeof element.className === "string" ? element.className : "";
        const text = (element.textContent || "").trim();
        const isKnownOverlay =
          className.includes("z-50") ||
          className.includes("z-[60]") ||
          className.includes("bottom-") ||
          className.includes("fixed inset-x-0 bottom-0") ||
          /chat|assistant|index/i.test(text);
        if (isKnownOverlay) return false;
        return rect.left < -2 || rect.top < -2 || rect.right > viewportWidth + 2 || rect.bottom > viewportHeight + 2;
      })
      .map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: (element.textContent || "").trim().replace(/\s+/g, " ").slice(0, 80),
        className: typeof element.className === "string" ? element.className.slice(0, 120) : "",
      }))
      .slice(0, 5);

    return { overflowingControls, incoherentFixedElements };
  });

  expect(result.overflowingControls, `${route} has clipped button/link text: ${JSON.stringify(result.overflowingControls)}`).toEqual([]);
  expect(result.incoherentFixedElements, `${route} has fixed elements outside viewport: ${JSON.stringify(result.incoherentFixedElements)}`).toEqual([]);
}

async function expectNavigationResetsScroll(page: Page, route: string) {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => document.body.scrollHeight > window.innerHeight * 2);
  await page.waitForTimeout(450);

  await page.evaluate(() => window.scrollTo(0, 1400));
  await expect.poll(() => page.evaluate(() => window.scrollY), {
    message: `home page did not scroll before navigating to ${route}`,
  }).toBeGreaterThan(200);

  const visibleRouteLink = page.locator(`a[href="${route}"]`).filter({ visible: true }).first();
  if (await visibleRouteLink.count()) {
    await visibleRouteLink.click();
  } else {
    // Mobile keeps some route links inside collapsed navigation accordions; this
    // helper is focused on SPA scroll reset rather than menu choreography.
    await page.locator(`a[href="${route}"]`).first().evaluate((link) => (link as HTMLAnchorElement).click());
  }
  await page.waitForURL(route, { waitUntil: "domcontentloaded" });

  await expect.poll(() => page.evaluate(() => window.scrollY), {
    message: `${route} did not reset to the top after client-side navigation`,
  }).toBeLessThanOrEqual(5);
}

test.describe("release smoke", () => {
  test("serves core SEO and PWA assets", async ({ request }) => {
    const manifest = await request.get("/manifest.json");
    expect(manifest.ok()).toBeTruthy();
    expect(manifest.headers()["content-type"]).toMatch(/application\/(manifest\+json|json)/);
    expect(manifest.headers()["cache-control"]).toContain("no-cache");
    const manifestJson = await manifest.json();
    expect(manifestJson).toMatchObject({
      id: "/",
      lang: "en-IN",
      start_url: "/",
      display: "standalone",
      theme_color: "#2563eb",
    });
    expect(manifestJson.display_override).toContain("standalone");
    expect(manifestJson.categories).toContain("finance");
    expect(manifestJson.shortcuts?.some((shortcut: { url?: string }) => shortcut.url === "/itr/form-selector")).toBeTruthy();
    expect(manifestJson.icons?.some((icon: { purpose?: string }) => icon.purpose === "any")).toBeTruthy();
    expect(manifestJson.icons?.some((icon: { purpose?: string }) => icon.purpose === "maskable")).toBeTruthy();

    const serviceWorker = await request.get("/service-worker.js");
    expect(serviceWorker.ok()).toBeTruthy();
    expect(serviceWorker.headers()["content-type"]).toMatch(/javascript/);
    expect(serviceWorker.headers()["cache-control"]).toContain("no-cache");
    expect((await serviceWorker.text()).length).toBeGreaterThan(1000);

    const robots = await request.get("/robots.txt");
    expect(robots.ok()).toBeTruthy();
    const robotsText = await robots.text();
    expect(robotsText).toContain("Sitemap:");
    expect(robotsText).toContain("Disallow: /dashboard/");
    expect(robotsText).toContain("Disallow: /admin/");

    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.ok()).toBeTruthy();
    const sitemapText = await sitemap.text();
    expect(sitemapText).toContain("<urlset");
    expect(sitemapText).toContain("<loc>https://myeca.in/services</loc>");
    expect(sitemapText).toContain("<loc>https://myeca.in/compare</loc>");
    expect(sitemapText).toContain("<loc>https://myeca.in/services/pan-card</loc>");
    expect(sitemapText).toContain("<loc>https://myeca.in/calculators/vda-tax</loc>");
    expect(sitemapText).toContain("<loc>https://myeca.in/startup/planning</loc>");
    expect(sitemapText).toContain("<loc>https://myeca.in/learn/guide/complete-itr-guide-salaried</loc>");

    const openapi = await request.get("/openapi.json");
    expect(openapi.ok()).toBeTruthy();
    const openapiJson = await openapi.json();
    expect(openapiJson.paths?.["/api/health"]).toBeTruthy();
    expect(openapiJson.components?.securitySchemes?.bearerAuth).toBeTruthy();

    const expectedOpenApiPaths = [
      "/api/public/blogs",
      "/api/v1/auth/me",
      "/api/documents",
      "/api/admin/users",
      "/api/cms/posts",
      "/api/referrals",
      "/api/teams",
      "/api/workflows",
      "/api/reports/history",
    ];

    for (const path of expectedOpenApiPaths) {
      expect(openapiJson.paths?.[path], `/openapi.json is missing ${path}`).toBeTruthy();
    }

    for (const path of ["/api/chat", "/api/email", "/api/advanced-features"]) {
      expect(openapiJson.paths?.[path], `/openapi.json should not advertise unmounted ${path}`).toBeFalsy();
    }

    expect(openapiJson.paths?.["/api/workflows/templates"]?.get?.["x-backend-status"]).toBe("demo");

    for (const [path, method] of [
      ["/api/v1/auth/me", "get"],
      ["/api/documents", "get"],
      ["/api/admin/users", "get"],
      ["/api/cms/posts", "post"],
      ["/api/referrals", "get"],
      ["/api/teams", "post"],
      ["/api/workflows", "post"],
      ["/api/reports/history", "get"],
    ] as const) {
      expect(openapiJson.paths?.[path]?.[method]?.security, `${method.toUpperCase()} ${path} must document bearer auth`).toEqual([{ bearerAuth: [] }]);
    }

    const health = await request.get("/api/health");
    expect(health.ok()).toBeTruthy();
    expect(health.headers()["x-request-id"]).toBeTruthy();

    for (const route of ["/api/v1/auth/me", "/api/documents", "/api/admin/users"]) {
      const unauthorized = await request.get(route);
      expect(unauthorized.status(), `${route} should reject anonymous requests`).toBe(401);
      expect(unauthorized.headers()["x-request-id"]).toBeTruthy();
      const body = await unauthorized.json();
      expect(body).toMatchObject({ success: false });
      expect(body.requestId).toBeTruthy();
    }

    const publicBlogs = await request.get("/api/public/blogs");
    expect(publicBlogs.headers()["cache-control"]).toMatch(/public, s-maxage=300/);
  });

  test("public route shells render without placeholder claims", async ({ page }) => {
    for (const route of publicRoutes) {
      await expectUsablePage(page, route);
      await expectNoHorizontalOverflow(page, route);
    }
  });

  test("UI routes use the global Inter font", async ({ page }) => {
    for (const route of ["/", "/calculators/regime-comparator", "/auth/login"]) {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expect.poll(
        () => page.evaluate(() => getComputedStyle(document.body).fontFamily),
        { message: `${route} should use the global Inter body stack` },
      ).toContain("Inter");
      await expect.poll(
        () => page.evaluate(() => document.body.classList.contains("home-inter-font")),
        { message: `${route} should not need the old homepage Inter body class` },
      ).toBe(false);
    }
  });

  test("public compliance actions use real destinations", async ({ page }) => {
    await expectUsablePage(page, "/compliance-calendar");
    await expect(page.locator('a[href="#"]')).toHaveCount(0);
  });

  test("blog pages keep content visible and avoid redundant detail fetches", async ({ page }) => {
    const blogRequests: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("/api/public/blogs")) blogRequests.push(url);
    });

    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    const blogLinks = page.locator("a[href^='/blog/']");
    await expect(blogLinks.first()).toBeVisible();
    await expect(page.getByText("Loading expert guides...")).toBeHidden();
    await expect.poll(() => blogLinks.count(), { message: "blog index should render initial posts" }).toBeGreaterThanOrEqual(10);
    await page.waitForTimeout(1200);
    expect(
      blogRequests.some((url) => url.includes("%3Aslug") || url.includes(":slug")),
      `Unexpected placeholder blog prefetch: ${JSON.stringify(blogRequests)}`,
    ).toBeFalsy();

    const searchResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/api/public/blogs") &&
        response.url().includes("search=gst") &&
        response.status() === 200,
    );
    await page.locator("#blog-search").fill("gst");
    await expect(page.getByText("Loading expert guides...")).toBeHidden();
    await searchResponse;
    await expect(blogLinks.first()).toBeVisible();
    await expect(page.getByText("Loading expert guides...")).toBeHidden();

    blogRequests.length = 0;
    await page.goto("/blog/when-will-itr-filing-start-ay-2026-27", { waitUntil: "domcontentloaded" });
    await expect(page.locator("article header h1")).toContainText("When Will ITR Filing Start for AY 2026-27?");
    await page.waitForTimeout(1000);

    expect(blogRequests.some((url) => url.includes("/api/public/blogs/when-will-itr-filing-start-ay-2026-27"))).toBeTruthy();
    expect(blogRequests.some((url) => url.includes("limit=24")), `Unexpected blog list request: ${JSON.stringify(blogRequests)}`).toBeFalsy();
  });

  test("private routes block anonymous users", async ({ page }) => {
    for (const route of privateRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(
        () => {
          const text = document.body.innerText;
          return location.pathname.includes("/auth/login") || /Please sign in again|Go to login|Sign in|Login/i.test(text);
        },
      );

      const bodyText = await page.locator("body").innerText();
      expect(page.url().includes("/auth/login") || /Please sign in again|Go to login|Sign in|Login/i.test(bodyText)).toBeTruthy();
      expect(bodyText).not.toMatch(/JavaScript Error|Something went wrong/i);
    }
  });

  test("production login hides temporary test controls", async ({ page }) => {
    await expectUsablePage(page, "/auth/login?test_login=1&test_email=user%40example.com");
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/Temporary test login|tab-only test sessions|Temporary test login failed/i);
  });

  test("high-risk routes fit mobile and desktop layouts", async ({ page }) => {
    for (const route of visualLayoutRoutes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.body.innerText.trim().length >= 80);

      const bodyText = await page.locator("body").innerText();
      expect(bodyText, `${route} rendered an app error shell`).not.toMatch(/JavaScript Error|Something went wrong/i);

      if (route === "/admin") {
        expect(page.url().includes("/auth/login") || /Sign in|Login|Please sign in/i.test(bodyText)).toBeTruthy();
      }

      await expectResponsiveLayout(page, route);
    }
  });

  test("route navigation starts at the top and preserves hash anchors", async ({ page }) => {
    for (const route of [
      "/pricing",
      "/services/gst-registration",
      "/calculators/income-tax",
      "/itr/form-selector",
    ]) {
      await expectNavigationResetsScroll(page, route);
    }

    await page.goto("/learn/videos", { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => Boolean(document.getElementById("all")));

    await page.locator('a[href="#all"]').filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/#all$/);
    await expect.poll(() => page.evaluate(() => {
      const target = document.getElementById("all");
      if (!target) return false;
      const rect = target.getBoundingClientRect();
      return rect.top >= 0 && rect.top < window.innerHeight;
    }), {
      message: "hash target should remain visible after navigation",
    }).toBeTruthy();
  });
});
