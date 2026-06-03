import { PUBLIC_NAVIGATION_LINKS } from "@/data/public-navigation-links";
import {
  CLIENT_ROUTE_REGISTRY,
  type ClientRouteDefinition,
} from "@/routes/client-route-registry";
import {
  prefetchPublicBlogDetail,
  prefetchPublicBlogIndex,
} from "@/lib/public-blog-data";
import { queryClient } from "@/lib/queryClient";
import { recoverFromStaleChunk } from "@/utils/chunk-recovery";
import { isPrivateRoute, normalizePublicPath } from "@shared/seo-public";

type RouteModuleLoader = () => Promise<unknown>;

export type RoutePreloadTarget = {
  loaderKey: string;
  path: string;
  routePath: string;
  source: string;
};

const routeModuleLoaders: Record<string, RouteModuleLoader> = {
  ...import.meta.glob([
    "../pages/**/*.tsx",
    "!../pages/**/*.test.tsx",
    "!../pages/**/*.spec.tsx",
    "!../pages/**/__tests__/**",
  ]),
  ...import.meta.glob([
    "../features/**/*.tsx",
    "!../features/**/*.test.tsx",
    "!../features/**/*.spec.tsx",
    "!../features/**/__tests__/**",
  ]),
  ...import.meta.glob([
    "../components/comparison/**/*.tsx",
    "!../components/comparison/**/*.test.tsx",
    "!../components/comparison/**/*.spec.tsx",
    "!../components/comparison/**/__tests__/**",
  ]),
};

const preloadedRouteModules = new Set<string>();

function toLoaderKey(source?: string) {
  if (!source) return null;

  const normalizedSource = source.replace(/\\/g, "/");
  if (normalizedSource.startsWith("client/src/")) {
    return `../${normalizedSource.slice("client/src/".length)}`;
  }

  if (normalizedSource.startsWith("src/")) {
    return `../${normalizedSource.slice("src/".length)}`;
  }

  return null;
}

function routeMatchesPath(routePath: string, path: string) {
  if (!routePath.includes(":")) return routePath === path;

  const routeParts = routePath.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (routeParts.length !== pathParts.length) return false;

  return routeParts.every((part, index) => part.startsWith(":") || part === pathParts[index]);
}

function findRoute(path: string): ClientRouteDefinition | null {
  const exactRoute = CLIENT_ROUTE_REGISTRY.find((route) => route.path === path);
  if (exactRoute) return exactRoute;

  return CLIENT_ROUTE_REGISTRY.find((route) => routeMatchesPath(route.path, path)) ?? null;
}

function getBlogSlug(path: string) {
  const match = /^\/blog\/([^/?#]+)$/.exec(path);
  if (!match || match[1].startsWith(":")) return null;
  return decodeURIComponent(match[1]);
}

function preloadRouteData(path: string) {
  if (path === "/blog") {
    void prefetchPublicBlogIndex(queryClient).catch(() => undefined);
    return;
  }

  const blogSlug = getBlogSlug(path);
  if (blogSlug) {
    void prefetchPublicBlogDetail(queryClient, blogSlug).catch(() => undefined);
  }
}

function scheduleIdleWork(callback: () => void) {
  if (typeof globalThis === "undefined") return;

  const requestIdleCallback = globalThis.requestIdleCallback;
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(callback, { timeout: 5000 });
    return;
  }

  globalThis.setTimeout(callback, 100);
}

export function resolveRoutePreloadTarget(href: string, isAuthenticated: boolean): RoutePreloadTarget | null {
  const path = normalizePublicPath(href);
  if (path === "/" || (isPrivateRoute(path) && !isAuthenticated)) return null;

  const route = findRoute(path);
  if (!route) return null;

  const loaderKey = toLoaderKey(route.source);
  if (!loaderKey || !route.source || !routeModuleLoaders[loaderKey]) return null;

  return {
    loaderKey,
    path,
    routePath: route.path,
    source: route.source,
  };
}

export function preloadRouteModule(href: string, isAuthenticated: boolean) {
  const target = resolveRoutePreloadTarget(href, isAuthenticated);
  if (!target) return;

  preloadRouteData(target.path);
  if (preloadedRouteModules.has(target.loaderKey)) return;

  preloadedRouteModules.add(target.loaderKey);
  scheduleIdleWork(() => {
    routeModuleLoaders[target.loaderKey]().catch((error) => {
      preloadedRouteModules.delete(target.loaderKey);
      void recoverFromStaleChunk(error);
    });
  });
}

export function getPublicNavigationPreloadMisses(isAuthenticated = false) {
  return PUBLIC_NAVIGATION_LINKS
    .filter((link) => link.href !== "/")
    .filter((link) => !resolveRoutePreloadTarget(link.href, isAuthenticated))
    .map((link) => link.href);
}

export function getRouteModuleLoaderKeys() {
  return Object.keys(routeModuleLoaders);
}
