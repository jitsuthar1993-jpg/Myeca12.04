export const SITE_URL = "https://myeca.in";
export const SITE_NAME = "MyeCA.in";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const DEFAULT_LOGO = `${SITE_URL}/favicon.svg`;

export const PRIVATE_ROUTE_PREFIXES = [
  "/admin",
  "/analytics",
  "/analytics-dashboard",
  "/api",
  "/api-docs",
  "/auth",
  "/business/dashboard",
  "/ca",
  "/dashboard",
  "/documents",
  "/export",
  "/forgot-password",
  "/integrations",
  "/login",
  "/logout",
  "/profile",
  "/referrals",
  "/register",
  "/reports",
  "/settings",
  "/team",
  "/teams",
  "/user",
  "/workflows",
] as const;

export const PRIVATE_NOINDEX_ROUTES = [
  "/admin",
  "/auth/login",
  "/auth/register",
  "/ca",
  "/dashboard",
  "/documents",
  "/login",
  "/profile",
  "/reports",
  "/settings",
  "/team",
  "/teams",
  "/user",
  "/workflows",
] as const;

export const PUBLIC_STATIC_ROUTES = [
  "/",
  "/about",
  "/all-services",
  "/blog",
  "/calculators",
  "/calculators/advance-tax",
  "/calculators/capital-gains",
  "/calculators/car-loan",
  "/calculators/education-loan",
  "/calculators/emi",
  "/calculators/epf",
  "/calculators/fd",
  "/calculators/fd-enhanced",
  "/calculators/gratuity",
  "/calculators/gst",
  "/calculators/home-loan",
  "/calculators/hra",
  "/calculators/hsn-finder",
  "/calculators/income-tax",
  "/calculators/inflation",
  "/calculators/loan-eligibility",
  "/calculators/lumpsum",
  "/calculators/nps",
  "/calculators/penalty",
  "/calculators/personal-loan",
  "/calculators/ppf",
  "/calculators/rd",
  "/calculators/regime-comparator",
  "/calculators/salary",
  "/calculators/sip",
  "/calculators/sip-enhanced",
  "/calculators/swp",
  "/calculators/tax-regime",
  "/calculators/tds",
  "/compliance-calendar",
  "/contact",
  "/elss-comparator",
  "/expert-consultation",
  "/experts",
  "/features/document-scanner",
  "/features/expert-tax-review",
  "/features/fastest-itr-filing",
  "/features/tax-calculator",
  "/form16-parser",
  "/help",
  "/help/faq",
  "/help/knowledge-base",
  "/help/user-guide",
  "/itr/filing",
  "/itr/form-recommender",
  "/itr/form-selector",
  "/learn",
  "/learn/glossary",
  "/learn/guides",
  "/learn/videos",
  "/legal/disclaimer",
  "/legal/privacy-policy",
  "/legal/refund-policy",
  "/legal/terms-of-service",
  "/mobile-app",
  "/pricing",
  "/services",
  "/services/audit-services",
  "/services/compliance-management",
  "/services/company-registration",
  "/services/document-vault",
  "/services/fssai-registration",
  "/services/gst-registration",
  "/services/gst-returns",
  "/services/iso-certification",
  "/services/itr-for-salaried",
  "/services/labour-law-compliance",
  "/services/msme-udyam-registration",
  "/services/notice-compliance",
  "/services/startup-india-registration",
  "/services/tax-planning",
  "/services/tds-filing",
  "/services/trade-license",
  "/services/trademark-registration",
  "/startup/funding",
  "/startup/registration",
  "/startup-services",
  "/tax-assistant",
  "/tax-loss-harvesting",
  "/tds-refund-tracker",
] as const;

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly";
  priority?: string;
};

export function normalizePublicPath(route: string) {
  if (!route || route === "/") return "/";
  const clean = route.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return clean.startsWith("/") ? clean : `/${clean}`;
}

export function isPrivateRoute(route: string) {
  const path = normalizePublicPath(route);
  return PRIVATE_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function isIndexablePublicRoute(route: string) {
  const path = normalizePublicPath(route);
  return !path.includes(":") && !path.includes("*") && !isPrivateRoute(path);
}

export function getIndexablePublicRoutes(configRoutes: string[] = [], blogRoutes: string[] = []) {
  const routes = new Set<string>();
  [...PUBLIC_STATIC_ROUTES, ...configRoutes, ...blogRoutes].forEach((route) => {
    const path = normalizePublicPath(route);
    if (isIndexablePublicRoute(path)) routes.add(path);
  });
  return [...routes].sort((left, right) => {
    if (left === "/") return -1;
    if (right === "/") return 1;
    return left.localeCompare(right);
  });
}

export function toAbsoluteUrl(route: string) {
  const path = normalizePublicPath(route);
  return `${SITE_URL}${path === "/" ? "" : path}`;
}

export function routePriority(route: string) {
  const path = normalizePublicPath(route);
  if (path === "/") return "1.0";
  if (path.startsWith("/services") || path.startsWith("/calculators") || path.startsWith("/itr")) return "0.8";
  if (path.startsWith("/blog/")) return "0.6";
  return "0.5";
}

export function buildSitemapXml(entries: SitemapEntry[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod ?? new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>${entry.changefreq ?? "weekly"}</changefreq>
    <priority>${entry.priority ?? "0.5"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
}

export function buildRobotsTxt() {
  const disallowLines = PRIVATE_ROUTE_PREFIXES
    .map((prefix) => `Disallow: ${prefix}/`)
    .join("\n");

  return `User-agent: *
Allow: /
${disallowLines}
Sitemap: ${SITE_URL}/sitemap.xml

User-agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /documents/

User-agent: ClaudeBot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /documents/

User-agent: PerplexityBot
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/
Disallow: /documents/`;
}
