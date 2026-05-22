import { PUBLIC_STATIC_ROUTES, isPrivateRoute, normalizePublicPath } from "./seo-public.js";

const PUBLIC_SITE_HOSTS = new Set(["myeca.in", "www.myeca.in"]);
const ASSET_PATH_PATTERN = /\.(?:avif|css|gif|ico|jpe?g|js|json|pdf|png|svg|txt|webp|xml|zip)$/i;

export type PublicHrefClassification =
  | { kind: "asset"; href: string; path: string }
  | { kind: "external"; href: string }
  | { kind: "internal-route"; hash: string; href: string; path: string }
  | { kind: "placeholder"; href: string }
  | { kind: "private-route"; href: string; path: string }
  | { kind: "same-page-anchor"; hash: string; href: string; path: string }
  | { kind: "special"; href: string };

function isSiteHost(hostname: string) {
  return PUBLIC_SITE_HOSTS.has(hostname.toLowerCase());
}

function isAssetPath(path: string) {
  return path.startsWith("/assets/") || path.startsWith("/icons/") || ASSET_PATH_PATTERN.test(path);
}

export function classifyPublicHref(
  rawHref: string,
  currentPath: string,
  baseUrl = "https://myeca.in",
): PublicHrefClassification {
  const href = rawHref.trim();
  if (!href || href === "#") return { kind: "placeholder", href };

  if (/^(?:mailto|sms|tel):/i.test(href)) return { kind: "special", href };

  let base: URL;
  let target: URL;
  try {
    base = new URL(normalizePublicPath(currentPath), baseUrl);
    target = new URL(href, base);
  } catch {
    return { kind: "special", href };
  }

  if (!["http:", "https:"].includes(target.protocol)) return { kind: "special", href };

  const baseHost = new URL(baseUrl).hostname;
  if (target.hostname !== baseHost && !isSiteHost(target.hostname)) {
    return { kind: "external", href: target.href };
  }

  const path = normalizePublicPath(target.pathname);
  if (isPrivateRoute(path)) return { kind: "private-route", href, path };
  if (isAssetPath(path)) return { kind: "asset", href, path };

  const hash = target.hash;
  if (hash && path === normalizePublicPath(currentPath)) {
    return { kind: "same-page-anchor", hash, href, path };
  }

  return { kind: "internal-route", hash, href, path };
}

export function parsePublicSitemapRoutes(sitemapXml: string) {
  const routes = new Set<string>();

  for (const match of sitemapXml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)) {
    try {
      const url = new URL(match[1]);
      if (isSiteHost(url.hostname)) routes.add(normalizePublicPath(url.pathname));
    } catch {
      // Ignore malformed or non-URL sitemap entries. The sitemap smoke checks
      // still validate required entries separately.
    }
  }

  return [...routes];
}

export function getPublicLinkAuditSeedRoutes(
  sitemapRoutes: string[],
  extraRoutes: string[] = [],
) {
  const routes = new Set<string>();

  [...PUBLIC_STATIC_ROUTES, ...sitemapRoutes, ...extraRoutes].forEach((route) => {
    routes.add(normalizePublicPath(route));
  });

  return [...routes];
}
