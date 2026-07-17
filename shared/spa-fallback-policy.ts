import { PUBLIC_STATIC_ROUTES, SITE_URL, isPrivateRoute, normalizePublicPath } from "./seo-public.js";
import generatorRegistry from "../client/src/data/generator-registry.json";

export const SPA_FALLBACK_EXACT_ROUTES = [
  "/403",
  "/500",
  "/advanced-features",
  "/ais-viewer",
  "/bank-analyzer",
  "/business/virtual-cfo",
  "/calculators/general",
  "/calculators/deductions",
  "/calculators/elss",
  "/calculators/hsn-finder",
  "/calculators/penalty",
  "/calculators/vda-tax",
  "/calculators/withdrawal-planner",
  "/consultation",
  "/itr/compact-filing",
  "/itr/status-tracker",
  "/itr/step-by-step-guide",
  "/itr/success",
  "/learn/consultations",
  "/learn/investment-basics",
  "/mobile-app-screens",
  "/profiles",
  "/salary",
  "/search",
  "/services/company-incorporation",
  "/services/advisory",
  "/services/audit",
  "/services/business-advisory",
  "/services/director-identification",
  "/services/document-storage",
  "/services/dsc",
  "/services/esi-registration",
  "/services/foreign-remittance",
  "/services/funding-assistance",
  "/services/gst-return",
  "/services/home-loan",
  "/services/investment-advisory",
  "/services/itr-filing",
  "/services/marketplace",
  "/services/msme-registration",
  "/services/pan-card",
  "/services/professional-tax",
  "/services/selection",
  "/services/tax-consultation",
  "/services/wealth-management",
  "/startup/accounting",
  "/startup/growth",
  "/startup/planning",
] as const;

const CITY_LANDING_SERVICE_SLUGS = ["company-registration", "gst-registration"] as const;
const CITY_LANDING_CITY_SLUGS = ["bangalore", "mumbai", "delhi", "hyderabad", "chennai"] as const;
const EXPERT_PROFILE_SLUGS = [
  "tax-gst-review",
  "startup-compliance-review",
  "direct-tax-review",
  "ca-rahul-sharma",
  "ca-priya-nair",
  "ca-amit-verma",
] as const;
const LEGACY_SERVICE_ACTIVATION_SLUGS = ["partnership-deed"] as const;
const API_ROUTE_PREFIX = "/api";
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,120}$/;

export type SpaFallbackClassification = {
  known: boolean;
  path: string;
  reason:
    | "api-route"
    | "city-landing"
    | "document-generator"
    | "exact-route"
    | "expert-profile"
    | "private-route"
    | "service-activation"
    | "unknown-route";
  robots: "noindex, nofollow";
  status: 200 | 404;
};

export type SpaFallbackOptions = {
  activationServiceIds?: readonly string[];
};

function segmentList(path: string) {
  return normalizePublicPath(path).split("/").filter(Boolean);
}

function isValidSlug(value: string | undefined) {
  return Boolean(value && SLUG_PATTERN.test(value));
}

function isKnownServiceActivationRoute(path: string, activationServiceIds: readonly string[] = []) {
  const segments = segmentList(path);
  if (segments.length !== 3 || segments[0] !== "services" || segments[1] !== "activate") {
    return false;
  }

  const serviceId = segments[2];
  return (
    isValidSlug(serviceId) &&
    (
      activationServiceIds.includes(serviceId) ||
      LEGACY_SERVICE_ACTIVATION_SLUGS.includes(serviceId as (typeof LEGACY_SERVICE_ACTIVATION_SLUGS)[number])
    )
  );
}

function isKnownCityLandingRoute(path: string) {
  const segments = segmentList(path);
  if (segments.length !== 3 || segments[0] !== "services") return false;

  const [, serviceSlug, citySlug] = segments;
  return (
    CITY_LANDING_SERVICE_SLUGS.includes(serviceSlug as (typeof CITY_LANDING_SERVICE_SLUGS)[number]) &&
    CITY_LANDING_CITY_SLUGS.includes(citySlug as (typeof CITY_LANDING_CITY_SLUGS)[number])
  );
}

function isKnownExpertProfileRoute(path: string) {
  const segments = segmentList(path);
  if (segments.length !== 2 || segments[0] !== "experts") return false;

  const expertSlug = segments[1];
  return EXPERT_PROFILE_SLUGS.includes(expertSlug as (typeof EXPERT_PROFILE_SLUGS)[number]);
}

const AVAILABLE_DOCUMENT_GENERATOR_ROUTES = new Set(
  generatorRegistry.generators
    .filter((generator) => generator.status === "available")
    .map((generator) => `/documents/generator/${generator.id}`),
);

function isKnownDocumentGeneratorRoute(path: string) {
  return AVAILABLE_DOCUMENT_GENERATOR_ROUTES.has(path);
}

export function classifySpaFallbackPath(
  route: string,
  options: SpaFallbackOptions = {},
): SpaFallbackClassification {
  const path = normalizePublicPath(route);
  const base = {
    path,
    robots: "noindex, nofollow" as const,
  };

  if (path === API_ROUTE_PREFIX || path.startsWith(`${API_ROUTE_PREFIX}/`)) {
    return { ...base, known: false, reason: "api-route", status: 404 };
  }

  if (isPrivateRoute(path)) {
    return { ...base, known: true, reason: "private-route", status: 200 };
  }

  if (SPA_FALLBACK_EXACT_ROUTES.includes(path as (typeof SPA_FALLBACK_EXACT_ROUTES)[number])) {
    return { ...base, known: true, reason: "exact-route", status: 200 };
  }

  if (PUBLIC_STATIC_ROUTES.includes(path as (typeof PUBLIC_STATIC_ROUTES)[number])) {
    return { ...base, known: true, reason: "exact-route", status: 200 };
  }

  const segments = segmentList(path);
  if (
    segments.length >= 2 &&
    (segments[0] === "blog" || segments[0] === "learn") &&
    segments.slice(1).every((segment) => /^[a-z0-9%][a-z0-9%\-]{0,160}$/i.test(segment))
  ) {
    return { ...base, known: true, reason: "exact-route", status: 200 };
  }

  if (isKnownServiceActivationRoute(path, options.activationServiceIds)) {
    return { ...base, known: true, reason: "service-activation", status: 200 };
  }

  if (isKnownCityLandingRoute(path)) {
    return { ...base, known: true, reason: "city-landing", status: 200 };
  }

  if (isKnownExpertProfileRoute(path)) {
    return { ...base, known: true, reason: "expert-profile", status: 200 };
  }

  if (isKnownDocumentGeneratorRoute(path)) {
    return { ...base, known: true, reason: "document-generator", status: 200 };
  }

  return { ...base, known: false, reason: "unknown-route", status: 404 };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function injectNoindexFallbackMeta(html: string, route: string) {
  const path = normalizePublicPath(route);
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;
  const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  const robotsTag = '<meta name="robots" content="noindex, nofollow" />';

  const withoutRobots = html.replace(/\s*<meta\s+name=["']robots["'][^>]*>\s*/gi, "\n");
  const withoutCanonical = withoutRobots.replace(/\s*<link\s+rel=["']canonical["'][^>]*>\s*/gi, "\n");

  if (/<\/head>/i.test(withoutCanonical)) {
    return withoutCanonical.replace(/<\/head>/i, `  ${canonicalTag}\n  ${robotsTag}\n</head>`);
  }

  return `${withoutCanonical}\n${canonicalTag}\n${robotsTag}\n`;
}

export function buildNoindexNotFoundHtml(route: string) {
  const path = normalizePublicPath(route);
  const escapedPath = escapeHtml(path);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Page Not Found | MyeCA.in</title>
  </head>
  <body>
    <main style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 720px; margin: 64px auto; padding: 0 24px; color: #0f172a;">
      <p style="font-size: 14px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: #2563eb;">404</p>
      <h1 style="font-size: 36px; line-height: 1.1; margin: 0 0 16px;">Page not found</h1>
      <p style="font-size: 16px; line-height: 1.7; color: #475569;">The requested path <code>${escapedPath}</code> is not a published MyeCA page.</p>
      <p><a href="/" style="color: #2563eb; font-weight: 700;">Return to MyeCA.in</a></p>
    </main>
  </body>
</html>`;
}
