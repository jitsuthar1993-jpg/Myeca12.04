import { normalizePublicPath } from "./seo-public.js";

export const DEFAULT_SPA_FALLBACK_PROBE_SLUGS = ["face-serum-gxrcld"] as const;

export const FIXED_HOSTILE_SPA_FALLBACK_ROUTES = [
  "/face-serum-gxrcld",
  "/face-serum-gxrcld/",
  "/random-product-gxrcld",
  "/best-face-serum-india",
  "/buy-face-serum-online",
  "/shop",
  "/wp-admin",
  "/wp-login.php",
] as const;

const HOSTILE_PREFIXES = [
  "/author",
  "/blog",
  "/calculators",
  "/category",
  "/collections",
  "/compare",
  "/itr-season-2026",
  "/learn/guide",
  "/product",
  "/products",
  "/services",
  "/services/activate",
  "/services/company-registration",
  "/shop",
  "/startup",
  "/store",
  "/tag",
  "/wp-content/uploads",
] as const;

export type HostileSpaFallbackAuditOptions = {
  probeSlugs?: readonly string[];
};

function normalizeAuditRoute(route: string) {
  const clean = route.split("?")[0].split("#")[0].replace(/^\/+/, "");
  return clean ? `/${clean}` : "/";
}

function appendRoute(parent: string, child: string) {
  const normalizedParent = normalizePublicPath(parent);
  const normalizedChild = child.replace(/^\/+/, "").replace(/\/+$/, "");

  return normalizedParent === "/" ? `/${normalizedChild}` : `${normalizedParent}/${normalizedChild}`;
}

function uniqueProbeSlugs(probeSlugs: readonly string[]) {
  return Array.from(
    new Set(
      probeSlugs
        .map((slug) => slug.trim().replace(/^\/+/, "").replace(/\/+$/, ""))
        .filter(Boolean),
    ),
  );
}

export function parseSpaFallbackProbeSlugs(value: string | undefined) {
  const parsed = uniqueProbeSlugs((value ?? "").split(/[,\n\r]+/));
  return parsed.length ? parsed : [...DEFAULT_SPA_FALLBACK_PROBE_SLUGS];
}

export function buildHostileSpaFallbackAuditRoutes(
  publicRoutes: readonly string[] = [],
  options: HostileSpaFallbackAuditOptions = {},
) {
  const probeSlugs = uniqueProbeSlugs(options.probeSlugs ?? DEFAULT_SPA_FALLBACK_PROBE_SLUGS);
  const routes = new Set<string>();

  FIXED_HOSTILE_SPA_FALLBACK_ROUTES.forEach((route) => routes.add(normalizeAuditRoute(route)));

  for (const slug of probeSlugs) {
    routes.add(`/${slug}`);
    HOSTILE_PREFIXES.forEach((prefix) => routes.add(appendRoute(prefix, slug)));
  }

  for (const route of publicRoutes) {
    const normalizedRoute = normalizePublicPath(route);
    if (normalizedRoute.includes(":") || normalizedRoute.includes("*")) continue;

    for (const slug of probeSlugs) {
      routes.add(appendRoute(normalizedRoute, slug));
    }
  }

  return Array.from(routes).sort((left, right) => left.localeCompare(right));
}
