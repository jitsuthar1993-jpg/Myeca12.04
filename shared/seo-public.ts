export const SITE_URL = "https://myeca.in";
export const SITE_NAME = "MyeCA.in";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
export const DEFAULT_LOGO = `${SITE_URL}/favicon.svg`;

export const PRIVATE_ROUTE_PREFIXES = [
  "/account",
  "/admin",
  "/analytics",
  "/analytics-dashboard",
  "/api",
  "/api-docs",
  "/auth",
  "/business/dashboard",
  "/ca",
  "/dashboard",
  "/export",
  "/forgot-password",
  "/integrations",
  "/itr/filing",
  "/login",
  "/logout",
  "/payments",
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
  "/account",
  "/admin",
  "/analytics",
  "/analytics-dashboard",
  "/auth/login",
  "/auth/register",
  "/business/dashboard",
  "/calculators/hsn-finder",
  "/calculators/penalty",
  "/ca",
  "/dashboard",
  "/dashboard/services",
  "/documents",
  "/documents/generator_page",
  "/export",
  "/integrations",
  "/itr/filing",
  "/login",
  "/payments",
  "/profile",
  "/referrals",
  "/reports",
  "/settings",
  "/settings/account",
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
  "/capital-gains-import",
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
  "/calculators/income-tax",
  "/calculators/inflation",
  "/calculators/loan-eligibility",
  "/calculators/lumpsum",
  "/calculators/nps",
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
  "/compare",
  "/compare/best-ca-assisted-itr-filing",
  "/compare/cleartax-alternative",
  "/compare/indiafilings-alternative",
  "/compare/quicko-capital-gains-alternative",
  "/compare/taxbuddy-alternative",
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
  "/forms",
  "/help",
  "/help/faq",
  "/help/knowledge-base",
  "/help/user-guide",
  "/gst-filing",
  "/itr-filing",
  "/itr/form-recommender",
  "/itr/form-selector",
  "/which-itr-form-to-file",
  "/itr-season-2026",
  "/itr-season-2026/ais-form-26as-mismatch-checklist",
  "/itr-season-2026/capital-gains-broker-statement-checklist",
  "/itr-season-2026/form-16-parser-guide",
  "/itr-season-2026/itr-deadline-refund-status-tracker",
  "/learn",
  "/learn/glossary",
  "/learn/guides",
  "/learn/videos",
  "/legal/disclaimer",
  "/legal/privacy-policy",
  "/legal/refund-policy",
  "/legal/terms-of-service",
  "/mobile-app",
  "/partners",
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
  "/services/tan-registration",
  "/services/tax-planning",
  "/services/tds-filing",
  "/services/trade-license",
  "/services/trademark-registration",
  "/startup/funding",
  "/startup/registration",
  "/startup-services",
  "/tax-assistant",
  "/tax-loss-harvesting",
  "/tax-optimizer",
  "/tds-refund-tracker",
  "/trust",
  "/documents/generator",
  "/documents/generator/gst-quotation",
  "/documents/generator/proforma-invoice",
  "/documents/generator/purchase-order",
  "/documents/generator/delivery-challan",
  "/documents/generator/payment-receipt",
  "/documents/generator/gst-credit-debit-note",
  "/documents/generator/loan-agreement",
  "/documents/generator/expense-reimbursement",
  "/documents/generator/msme-cash-flow",
  "/documents/generator/projected-balance-sheet",
  "/documents/generator/net-worth-statement",
  "/documents/generator/invoice",
] as const;

const PRIVATE_EXACT_ROUTES = ["/documents"] as const;

export type SitemapEntry = {
  loc: string;
  lastmod?: string;
  changefreq?: "daily" | "weekly" | "monthly" | "yearly";
  priority?: string;
};

export function normalizePublicPath(route: string) {
  if (!route || route === "/") return "/";
  const clean = route.split("?")[0].split("#")[0].replace(/\/+$/, "");
  return clean.startsWith("/") ? clean : `/${clean}`;
}

export function isPrivateRoute(route: string) {
  const path = normalizePublicPath(route);
  return PRIVATE_EXACT_ROUTES.includes(path as (typeof PRIVATE_EXACT_ROUTES)[number])
    || PRIVATE_ROUTE_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
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
  if (path === "/itr-filing" || path === "/gst-filing") return "0.9";
  if (path === "/blog") return "0.8";
  if (path === "/contact") return "0.6";
  if (path === "/which-itr-form-to-file") return "0.8";
  if (path.startsWith("/itr-season-2026")) return "0.7";
  if (path.startsWith("/blog/")) return "0.7";
  if (path.startsWith("/services") || path.startsWith("/calculators") || path.startsWith("/itr")) return "0.8";
  if (path.startsWith("/compare/")) return "0.6";
  return "0.5";
}

export function routeChangefreq(route: string): SitemapEntry["changefreq"] {
  const path = normalizePublicPath(route);
  if (path === "/") return "weekly";
  if (path === "/itr-filing" || path === "/gst-filing") return "monthly";
  if (path === "/blog") return "daily";
  if (path === "/contact") return "yearly";
  if (path.startsWith("/blog/")) return "monthly";
  return "weekly";
}

export function buildSitemapXml(entries: SitemapEntry[]) {
  const urls = entries
    .map((entry) => {
      const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : "";
      return `<url><loc>${entry.loc}</loc>${lastmod}<changefreq>${entry.changefreq ?? "weekly"}</changefreq><priority>${entry.priority ?? "0.5"}</priority></url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

export function buildRobotsTxt() {
  const disallowLines = [...PRIVATE_ROUTE_PREFIXES.map((prefix) => `${prefix}/`), "/documents$"]
    .map((prefix) => `Disallow: ${prefix}`)
    .join("\n");
  const aiCrawlerAgents = [
    "GPTBot",
    "Google-Extended",
    "PerplexityBot",
    "ClaudeBot",
    "anthropic-ai",
  ];
  const aiCrawlerRules = aiCrawlerAgents
    .map(
      (agent) => `User-agent: ${agent}
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/`,
    )
    .join("\n\n");

  return `User-agent: *
Allow: /
${disallowLines}
Disallow: /_next/
Sitemap: ${SITE_URL}/sitemap.xml
Host: ${SITE_URL}

${aiCrawlerRules}`;
}
