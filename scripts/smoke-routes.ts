import { chromium, type Page } from "playwright";
import {
  classifyPublicHref,
  getPublicLinkAuditSeedRoutes,
  parsePublicSitemapRoutes,
} from "../shared/public-link-audit.js";

const baseUrl = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");

const highValuePublicRoutes = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/trust",
  "/itr/form-selector",
  "/help",
  "/learn/videos",
  "/expert-consultation",
  "/startup-services",
  "/legal/privacy-policy",
  "/services/tds-filing",
  "/services/gst-returns",
  "/services/company-registration",
  "/services/labour-law-compliance",
];

const mobileLayoutRoutes = [
  "/",
  "/services",
  "/pricing",
  "/trust",
  "/itr/form-selector",
  "/services/tds-filing",
  "/services/gst-returns",
  "/services/company-registration",
];

const privateRoutes = [
  "/integrations",
  "/analytics",
  "/dashboard",
  "/dashboard/services",
  "/dashboard/services/demo-case",
  "/admin",
  "/admin/requests",
  "/admin/analytics",
  "/admin/analytics/overview",
  "/reports",
  "/documents",
  "/documents/generator",
  "/documents/generator/resume",
  "/workflows",
  "/teams",
  "/referrals",
  "/export",
  "/analytics-dashboard",
  "/business/dashboard",
];

const navigationOptions = { waitUntil: "domcontentloaded" as const, timeout: 15_000 };

async function fetchText(path: string) {
  const response = await fetch(`${baseUrl}${path}`);
  const text = await response.text();

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}: ${text.slice(0, 120)}`);
  }

  return {
    contentType: response.headers.get("content-type") || "",
    text,
  };
}

async function assertAssetEndpoints() {
  const homeResponse = await fetch(`${baseUrl}/`);
  const csp = homeResponse.headers.get("content-security-policy") || "";
  const scriptSrc = csp
    .split(";")
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith("script-src")) || "";
  if (!homeResponse.ok) {
    throw new Error(`/ returned ${homeResponse.status}`);
  }
  if (!scriptSrc || scriptSrc.includes("'unsafe-inline'") || scriptSrc.includes("'unsafe-eval'") || !csp.includes("script-src-attr 'none'")) {
    throw new Error("/ is missing the hardened script CSP policy");
  }
  if (!csp.includes("object-src 'none'") || !csp.includes("base-uri 'self'")) {
    throw new Error("/ is missing baseline CSP restrictions");
  }

  const manifest = await fetchText("/manifest.json");
  if (!manifest.contentType.includes("application/manifest+json") && !manifest.contentType.includes("application/json")) {
    throw new Error(`/manifest.json served unexpected content type: ${manifest.contentType}`);
  }

  const manifestJson = JSON.parse(manifest.text) as {
    name?: string;
    short_name?: string;
    start_url?: string;
    icons?: Array<{ src?: string; sizes?: string; type?: string }>;
  };
  if (!manifestJson.name || !manifestJson.short_name || !manifestJson.start_url || !manifestJson.icons?.length) {
    throw new Error("/manifest.json is missing required PWA fields");
  }
  const requiredIcons = ["/icons/icon-192.png", "/icons/icon-512.png"];
  for (const iconSrc of requiredIcons) {
    const icon = manifestJson.icons.find((entry) => entry.src === iconSrc);
    if (!icon || icon.type !== "image/png") {
      throw new Error(`/manifest.json missing PNG icon ${iconSrc}`);
    }
    const response = await fetch(`${baseUrl}${iconSrc}`);
    if (!response.ok || !response.headers.get("content-type")?.includes("image/png")) {
      throw new Error(`${iconSrc} is not served as a PNG asset`);
    }
  }

  const robots = await fetchText("/robots.txt");
  if (!robots.text.includes("Sitemap:")) {
    throw new Error("/robots.txt is missing sitemap metadata");
  }
  for (const privateRoute of ["/dashboard/", "/admin/", "/reports/", "/documents/", "/integrations/"]) {
    if (!robots.text.includes(`Disallow: ${privateRoute}`)) {
      throw new Error(`/robots.txt is missing Disallow for ${privateRoute}`);
    }
  }

  const sitemap = await fetchText("/sitemap.xml");
  if (!sitemap.text.includes("<urlset") || !sitemap.text.includes("<loc>https://myeca.in/services</loc>")) {
    throw new Error("/sitemap.xml is missing expected public routes");
  }
  for (const privateRoute of ["/auth/login", "/auth/register", "/dashboard", "/admin", "/reports", "/documents", "/integrations"]) {
    if (sitemap.text.includes(`<loc>https://myeca.in${privateRoute}</loc>`)) {
      throw new Error(`/sitemap.xml includes private route ${privateRoute}`);
    }
  }

  for (const noindexRoute of ["/auth/login", "/dashboard", "/documents", "/reports"]) {
    const shell = await fetchText(noindexRoute);
    const robotsContent = shell.text.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1] || "";
    if (!robotsContent.includes("noindex") || !robotsContent.includes("nofollow")) {
      throw new Error(`${noindexRoute} shell is missing noindex robots metadata`);
    }
  }

  const openapi = await fetchText("/openapi.json");
  const openapiJson = JSON.parse(openapi.text) as {
    paths?: Record<string, any>;
    components?: {
      schemas?: Record<string, unknown>;
      securitySchemes?: Record<string, unknown>;
    };
  };
  const requiredPaths = [
    "/api/health",
    "/api/errors/log",
    "/api/public/updates/active",
    "/api/public/blogs",
    "/api/v1/auth/me",
    "/api/user/dashboard",
    "/api/documents",
    "/api/admin/users",
    "/api/cms/posts",
    "/api/referrals",
    "/api/teams",
    "/api/workflows",
    "/api/reports/history",
    "/api/audit/logs",
    "/api/system/config",
  ];
  for (const path of requiredPaths) {
    if (!openapiJson.paths?.[path]) {
      throw new Error(`/openapi.json missing ${path}`);
    }
  }

  for (const path of ["/api/chat", "/api/email", "/api/advanced-features"]) {
    if (openapiJson.paths?.[path]) {
      throw new Error(`/openapi.json advertises unmounted route ${path}`);
    }
  }

  if (openapiJson.paths?.["/api/workflows/templates"]?.get?.["x-backend-status"] !== "demo") {
    throw new Error("/openapi.json missing demo backend status for workflow templates");
  }

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
    const security = openapiJson.paths?.[path]?.[method]?.security;
    if (JSON.stringify(security) !== JSON.stringify([{ bearerAuth: [] }])) {
      throw new Error(`/openapi.json ${method.toUpperCase()} ${path} missing bearer auth`);
    }
  }
  if (!openapiJson.components?.securitySchemes?.bearerAuth) {
    throw new Error("/openapi.json missing bearerAuth security scheme");
  }

  return parsePublicSitemapRoutes(sitemap.text);
}

async function assertNoAppCrash(page: Page, route: string) {
  const bodyText = await page.locator("body").innerText({ timeout: 10_000 });
  if (/JavaScript Error|Something went wrong/i.test(bodyText)) {
    throw new Error(`${route} rendered an app error shell`);
  }
}

async function assertNoPageOverflow(page: Page, route: string, viewportName: string) {
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
          className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
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

  if (result.overflowBy > 2) {
    throw new Error(`${viewportName} horizontal overflow detected on ${route}: ${JSON.stringify(result)}`);
  }
}

async function assertHasContent(page: Page, route: string) {
  await page.waitForFunction(
    () => document.body.innerText.trim().length >= 80,
    undefined,
    { timeout: 15_000 },
  );
  await assertNoAppCrash(page, route);
  const text = await page.locator("body").innerText({ timeout: 10_000 });
  if (text.trim().length < 80) {
    throw new Error(`${route} rendered too little content`);
  }
  const html = await page.content();
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
  for (const forbidden of forbiddenPublicContent) {
    if (text.includes(forbidden) || html.includes(forbidden)) {
      throw new Error(`${route} includes placeholder or unverifiable content: ${forbidden}`);
    }
  }
}

async function assertPublicRouteFound(page: Page, route: string) {
  const bodyText = await page.locator("body").innerText({ timeout: 10_000 });
  if (/Page Not Found/i.test(bodyText)) {
    throw new Error(`${route} rendered the not-found page`);
  }
}

type PageLink = {
  download: boolean;
  href: string;
  text: string;
};

async function collectPageLinks(page: Page): Promise<PageLink[]> {
  return page.locator("a[href]").evaluateAll((links) =>
    links.map((link) => {
      const anchor = link as HTMLAnchorElement;
      return {
        download: anchor.hasAttribute("download"),
        href: anchor.getAttribute("href") || "",
        text: (anchor.textContent || anchor.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 80),
      };
    }),
  );
}

async function hasAnchorTarget(page: Page, hash: string) {
  const decodedHash = decodeURIComponent(hash.replace(/^#/, ""));
  if (!decodedHash) return false;

  return page.evaluate((target) => Boolean(document.getElementById(target) || document.querySelector(`[name="${CSS.escape(target)}"]`)), decodedHash);
}

function linkLabel(link: PageLink) {
  return link.text ? `"${link.text}" (${link.href})` : link.href;
}

async function fetchExternalLinkStatus(href: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const headResponse = await fetch(href, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
    });
    if (headResponse.status !== 405) {
      return headResponse.status;
    }

    const getResponse = await fetch(href, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
    });
    return getResponse.status;
  } finally {
    clearTimeout(timeout);
  }
}

async function auditExternalLinks(hrefs: string[]) {
  const failures: string[] = [];
  let nextIndex = 0;

  async function probeNext() {
    while (nextIndex < hrefs.length) {
      const href = hrefs[nextIndex++];
      try {
        const status = await fetchExternalLinkStatus(href);
        if (status >= 400) failures.push(`${status} ${href}`);
      } catch (error) {
        failures.push(`${error instanceof Error ? error.message : String(error)} ${href}`);
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(8, hrefs.length) }, () => probeNext()));

  if (failures.length === 0) {
    console.log(`External link audit checked ${hrefs.length} unique URLs with no fetch failures.`);
    return;
  }

  console.warn(`External link audit checked ${hrefs.length} unique URLs and observed ${failures.length} fetch failures:`);
  failures.slice(0, 20).forEach((failure) => console.warn(`- ${failure}`));
}

async function assertPublicLinkGraph(page: Page, seedRoutes: string[]) {
  const failures: string[] = [];
  const queuedRoutes = [...new Set(seedRoutes)];
  const queuedSet = new Set(queuedRoutes);
  const requiredAnchors = new Map<string, Set<string>>();
  const visitedRoutes = new Set<string>();
  const externalLinks = new Set<string>();

  while (queuedRoutes.length > 0) {
    const route = queuedRoutes.shift();
    if (!route || visitedRoutes.has(route)) continue;
    visitedRoutes.add(route);

    try {
      await page.goto(`${baseUrl}${route}`, navigationOptions);
      await assertHasContent(page, route);
      await assertPublicRouteFound(page, route);

      for (const hash of requiredAnchors.get(route) || []) {
        if (!(await hasAnchorTarget(page, hash))) {
          failures.push(`${route} is missing linked anchor ${hash}`);
        }
      }

      for (const link of await collectPageLinks(page)) {
        if (link.download) continue;

        const classified = classifyPublicHref(link.href, route, baseUrl);
        if (classified.kind === "placeholder") {
          failures.push(`${route} has placeholder public link ${linkLabel(link)}`);
          continue;
        }

        if (classified.kind === "same-page-anchor") {
          if (!(await hasAnchorTarget(page, classified.hash))) {
            failures.push(`${route} has broken same-page anchor ${classified.hash} from ${linkLabel(link)}`);
          }
          continue;
        }

        if (classified.kind === "internal-route") {
          if (classified.hash) {
            const anchors = requiredAnchors.get(classified.path) || new Set<string>();
            anchors.add(classified.hash);
            requiredAnchors.set(classified.path, anchors);
          }

          if (!queuedSet.has(classified.path) && !visitedRoutes.has(classified.path)) {
            queuedRoutes.push(classified.path);
            queuedSet.add(classified.path);
          }
          continue;
        }

        if (classified.kind === "external") externalLinks.add(classified.href);
      }
    } catch (error) {
      failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (failures.length) {
    throw new Error(failures.slice(0, 20).join("\n"));
  }

  console.log(`Public link audit visited ${visitedRoutes.size} routes and observed ${externalLinks.size} unique external links.`);
  if (process.env.SMOKE_AUDIT_EXTERNAL_LINKS === "1") {
    await auditExternalLinks([...externalLinks]);
  }
}

async function assertAnonymousBlocked(page: Page, route: string) {
  await page.waitForFunction(
    () => {
      const text = document.body.innerText;
      return (
        location.pathname.includes("/auth/login") ||
        /Please sign in again|Go to login|Sign in|Login/i.test(text)
      );
    },
    undefined,
    { timeout: 15_000 },
  );
  await assertNoAppCrash(page, route);
  const url = page.url();
  const bodyText = await page.locator("body").innerText({ timeout: 10_000 });
  if (!url.includes("/auth/login") && !/Please sign in again|Go to login|Sign in|Login/i.test(bodyText)) {
    throw new Error("anonymous user was not redirected or blocked");
  }
}

async function assertProductionTestLoginHidden(page: Page) {
  await page.goto(`${baseUrl}/auth/login?test_login=1&test_email=user%40example.com`, navigationOptions);
  await assertHasContent(page, "/auth/login?test_login=1");

  const text = await page.locator("body").innerText({ timeout: 10_000 });
  if (/Temporary test login|tab-only test sessions|Temporary test login failed/i.test(text)) {
    throw new Error("production login page exposes temporary test login controls");
  }
}

async function main() {
  const browser = await chromium.launch();
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    serviceWorkers: "block",
  });
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    serviceWorkers: "block",
  });
  const page = await desktopContext.newPage();
  const mobile = await mobileContext.newPage();

  const failures: string[] = [];

  let sitemapRoutes: string[] = [];
  try {
    sitemapRoutes = await assertAssetEndpoints();
  } catch (error) {
    failures.push(`assets: ${error instanceof Error ? error.message : String(error)}`);
  }

  for (const route of highValuePublicRoutes) {
    try {
      await page.goto(`${baseUrl}${route}`, navigationOptions);
      await assertHasContent(page, route);
      await assertNoPageOverflow(page, route, "desktop");
    } catch (error) {
      failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  try {
    await assertPublicLinkGraph(page, getPublicLinkAuditSeedRoutes(sitemapRoutes, highValuePublicRoutes));
  } catch (error) {
    failures.push(`public links: ${error instanceof Error ? error.message : String(error)}`);
  }

  for (const route of privateRoutes) {
    try {
      await page.goto(`${baseUrl}${route}`, navigationOptions);
      await assertAnonymousBlocked(page, route);
    } catch (error) {
      failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  try {
    await assertProductionTestLoginHidden(page);
  } catch (error) {
    failures.push(`auth test login gate: ${error instanceof Error ? error.message : String(error)}`);
  }

  for (const route of mobileLayoutRoutes) {
    try {
      await mobile.goto(`${baseUrl}${route}`, navigationOptions);
      await assertHasContent(mobile, route);
      await assertNoPageOverflow(mobile, route, "mobile");
    } catch (error) {
      failures.push(`mobile ${route}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  await desktopContext.close();
  await mobileContext.close();
  await browser.close();

  if (failures.length) {
    console.error("Smoke route failures:");
    failures.forEach((failure) => console.error(`- ${failure}`));
    process.exit(1);
  }

  console.log(`Smoke routes passed against ${baseUrl}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
