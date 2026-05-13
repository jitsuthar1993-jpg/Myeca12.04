import { chromium, type Page } from "playwright";

const baseUrl = (process.env.SMOKE_BASE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");

const publicRoutes = [
  "/",
  "/about",
  "/services",
  "/pricing",
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
  "/itr/form-selector",
  "/services/tds-filing",
  "/services/gst-returns",
  "/services/company-registration",
];

const privateRoutes = [
  "/integrations",
  "/analytics",
  "/dashboard",
  "/admin",
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
    "/api/feedback",
    "/api/public/updates/active",
    "/api/public/blogs",
    "/api/public/blogs/{slug}",
    "/api/public/categories",
    "/api/v1/auth/me",
    "/api/v1/auth/sync",
    "/api/v1/auth/logout-event",
    "/api/2fa/status",
    "/api/2fa/enable",
    "/api/2fa/verify",
    "/api/2fa/disable",
    "/api/user/dashboard",
    "/api/profile",
    "/api/user-services",
    "/api/profiles",
    "/api/profiles/{id}",
    "/api/documents",
    "/api/documents/upload",
    "/api/documents/register",
    "/api/documents/stats/summary",
    "/api/documents/{id}",
    "/api/reports/history",
    "/api/reports/generate",
    "/api/reports/templates",
    "/api/referrals",
    "/api/referrals/stats",
    "/api/referrals/overview",
    "/api/notifications",
    "/api/notifications/{id}/read",
    "/api/notifications/read-all",
    "/api/notifications/{id}",
    "/api/admin/users",
    "/api/admin/stats",
    "/api/admin/feedback",
    "/api/admin/feedback/stats",
    "/api/admin/feedback/{id}",
    "/api/system/config",
    "/api/teams",
    "/api/teams/{teamId}",
    "/api/workflows",
    "/api/workflows/templates",
    "/api/workflows/{id}",
    "/api/analytics/overview",
    "/api/cms/posts",
    "/api/cms/posts/{id}",
    "/api/cms/upload",
    "/api/cms/categories",
    "/api/cms/media",
    "/api/cms/updates",
    "/api/cms/updates/{id}",
    "/api/audit/logs",
  ];
  for (const path of requiredPaths) {
    if (!openapiJson.paths?.[path]) {
      throw new Error(`/openapi.json missing ${path}`);
    }
  }

  const requiredSchemas = [
    "HealthResponse",
    "CreatedResponse",
    "MessageResponse",
    "Pagination",
    "User",
    "UserResponse",
    "UserDashboardResponse",
    "ProfileResponse",
    "ProfileUpdateRequest",
    "UserService",
    "UserServiceCreateRequest",
    "SavedProfile",
    "SavedProfileCreateRequest",
    "SavedProfileUpdateRequest",
    "TwoFactorStatusResponse",
    "TwoFactorEnableResponse",
    "TwoFactorVerifyRequest",
    "BlogPost",
    "BlogListResponse",
    "BlogPostResponse",
    "Category",
    "CategoryCreateRequest",
    "CategoryResponse",
    "CategoryListResponse",
    "CmsPostWriteRequest",
    "CmsPostUpdateRequest",
    "CmsPostResponse",
    "CmsPostListResponse",
    "CmsImageUploadRequest",
    "CmsImageUploadResponse",
    "MediaFile",
    "MediaListResponse",
    "Document",
    "DocumentCreateRequest",
    "DocumentFileUploadRequest",
    "DocumentRegisterRequest",
    "DocumentUpdateRequest",
    "DocumentResponse",
    "DocumentListResponse",
    "DocumentStatsResponse",
    "Report",
    "ReportTemplate",
    "ReportTemplateListResponse",
    "ReportGenerateRequest",
    "ReportResponse",
    "ReportHistoryResponse",
    "Team",
    "TeamCreateRequest",
    "TeamResponse",
    "TeamListResponse",
    "Workflow",
    "WorkflowTemplate",
    "WorkflowCreateRequest",
    "WorkflowUpdateRequest",
    "WorkflowResponse",
    "WorkflowListResponse",
    "WorkflowTemplateListResponse",
    "AnalyticsOverviewResponse",
    "AdminStatsResponse",
    "AdminUserListResponse",
    "AuditLog",
    "AuditLogCreateRequest",
    "AuditLogListResponse",
    "Feedback",
    "FeedbackCreateRequest",
    "FeedbackCreateResponse",
    "FeedbackResponse",
    "FeedbackListResponse",
    "FeedbackStatsResponse",
    "FeedbackUpdateRequest",
    "PublicUpdate",
    "PublicUpdateCreateRequest",
    "PublicUpdateUpdateRequest",
    "PublicUpdateResponse",
    "PublicUpdateListResponse",
    "Notification",
    "NotificationListResponse",
    "SystemConfig",
    "SystemConfigResponse",
    "SystemConfigUpdateRequest",
  ];

  for (const schema of requiredSchemas) {
    if (!openapiJson.components?.schemas?.[schema]) {
      throw new Error(`/openapi.json missing schema ${schema}`);
    }
  }

  if (!openapiJson.components?.securitySchemes?.bearerAuth) {
    throw new Error("/openapi.json missing bearerAuth security scheme");
  }

  const schemaBackedResponses = [
    ["/api/documents", "get", "200"],
    ["/api/documents", "post", "200"],
    ["/api/documents/upload", "post", "200"],
    ["/api/documents/register", "post", "200"],
    ["/api/documents/stats/summary", "get", "200"],
    ["/api/feedback", "post", "201"],
    ["/api/public/updates/active", "get", "200"],
    ["/api/2fa/status", "get", "200"],
    ["/api/2fa/enable", "post", "200"],
    ["/api/2fa/verify", "post", "200"],
    ["/api/profile", "get", "200"],
    ["/api/profile", "put", "200"],
    ["/api/profiles", "get", "200"],
    ["/api/profiles", "post", "200"],
    ["/api/profiles/{id}", "patch", "200"],
    ["/api/user/dashboard", "get", "200"],
    ["/api/user-services", "get", "200"],
    ["/api/user-services", "post", "200"],
    ["/api/notifications", "get", "200"],
    ["/api/reports/history", "get", "200"],
    ["/api/reports/generate", "post", "200"],
    ["/api/reports/templates", "get", "200"],
    ["/api/admin/users", "get", "200"],
    ["/api/admin/feedback", "get", "200"],
    ["/api/admin/feedback/stats", "get", "200"],
    ["/api/cms/posts", "get", "200"],
    ["/api/cms/posts", "post", "200"],
    ["/api/cms/posts/{id}", "get", "200"],
    ["/api/cms/posts/{id}", "put", "200"],
    ["/api/cms/upload", "post", "200"],
    ["/api/cms/categories", "get", "200"],
    ["/api/cms/categories", "post", "200"],
    ["/api/cms/media", "get", "200"],
    ["/api/cms/updates", "get", "200"],
    ["/api/cms/updates", "post", "200"],
    ["/api/cms/updates/{id}", "put", "200"],
    ["/api/teams", "get", "200"],
    ["/api/teams", "post", "201"],
    ["/api/workflows", "get", "200"],
    ["/api/workflows", "post", "201"],
    ["/api/analytics/overview", "get", "200"],
  ] as const;

  for (const [path, method, status] of schemaBackedResponses) {
    const response = openapiJson.paths?.[path]?.[method]?.responses?.[status];
    if (!response?.content?.["application/json"]?.schema) {
      throw new Error(`/openapi.json ${method.toUpperCase()} ${path} missing ${status} JSON response schema`);
    }
  }
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

  try {
    await assertAssetEndpoints();
  } catch (error) {
    failures.push(`assets: ${error instanceof Error ? error.message : String(error)}`);
  }

  for (const route of publicRoutes) {
    try {
      await page.goto(`${baseUrl}${route}`, navigationOptions);
      await assertHasContent(page, route);
      await assertNoPageOverflow(page, route, "desktop");
    } catch (error) {
      failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`);
    }
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
