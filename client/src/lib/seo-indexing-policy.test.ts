import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SEO_CONFIG } from "../config/seo.config";
import { allServices } from "../data/all-services";
import { getGeneratedPublicRoutes } from "../data/missing-pages";
import { buildApiSitemapXml } from "../../../api/index";
import {
  PRIVATE_NOINDEX_ROUTES,
  PUBLIC_STATIC_ROUTES,
  getIndexablePublicRoutes,
  isPrivateRoute,
  normalizePublicPath,
} from "@shared/seo-public";
import { classifySpaFallbackPath } from "@shared/spa-fallback-policy";

describe("SEO indexing policy", () => {
  it("keeps Vercel CA noindex headers from shadowing calculator routes", () => {
    const vercelConfig = JSON.parse(
      readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"),
    ) as {
      headers: Array<{
        source: string;
        headers: Array<{ key: string; value: string }>;
      }>;
    };

    const noindexSources = vercelConfig.headers
      .filter((entry) =>
        entry.headers.some(
          (header) =>
            header.key.toLowerCase() === "x-robots-tag" &&
            header.value.toLowerCase() === "noindex, nofollow",
        ),
      )
      .map((entry) => entry.source);

    expect(noindexSources).toContain("/ca");
    expect(noindexSources).toContain("/ca/(.*)");
    expect(noindexSources).not.toContain("/ca(.*)");
  });

  it("routes the IndexNow key file through the API before the static app fallback", () => {
    const vercelConfig = JSON.parse(
      readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"),
    ) as {
      rewrites: Array<{
        destination: string;
        source: string;
      }>;
    };

    const indexNowRewriteIndex = vercelConfig.rewrites.findIndex(
      (rewrite) =>
        rewrite.source === "/:indexNowKey.txt" &&
        rewrite.destination === "/api/index?route=indexnow-key&key=:indexNowKey",
    );
    const appFallbackIndex = vercelConfig.rewrites.findIndex((rewrite) =>
      rewrite.destination.includes("route=app-fallback")
    );
    const llmsIndex = vercelConfig.rewrites.findIndex((rewrite) => rewrite.source === "/llms.txt");
    const llmsFullIndex = vercelConfig.rewrites.findIndex((rewrite) => rewrite.source === "/llms-full.txt");

    expect(indexNowRewriteIndex).toBeGreaterThanOrEqual(0);
    expect(indexNowRewriteIndex).toBeGreaterThan(llmsIndex);
    expect(indexNowRewriteIndex).toBeGreaterThan(llmsFullIndex);
    expect(appFallbackIndex).toBeGreaterThan(indexNowRewriteIndex);
  });

  it("does not route unknown public paths to the indexable home shell", () => {
    const vercelConfig = JSON.parse(
      readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"),
    ) as {
      headers: Array<{
        headers: Array<{ key: string; value: string }>;
        source: string;
      }>;
      rewrites: Array<{
        destination: string;
        source: string;
      }>;
    };

    const appFallbacks = vercelConfig.rewrites.filter((rewrite) =>
      rewrite.destination === "/api/index?route=app-fallback&path=/:path*"
    );
    const fallbackSources = appFallbacks.map((rewrite) => rewrite.source);
    const globalHeaders =
      vercelConfig.headers.find((entry) => entry.source === "/(.*)")?.headers ?? [];

    expect(fallbackSources).toEqual(["/:path*/", "/:path*"]);
    expect(appFallbacks.some((rewrite) => rewrite.destination === "/index.html")).toBe(false);
    expect(globalHeaders).not.toContainEqual({ key: "X-Robots-Tag", value: "index, follow" });
  });

  it("exposes a repeatable live audit for bogus fallback indexing", () => {
    const packageConfig = JSON.parse(
      readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
    ) as {
      scripts: Record<string, string>;
    };

    expect(packageConfig.scripts["check:spa-fallback-indexing"]).toBe(
      "tsx scripts/check-spa-fallback-indexing.ts",
    );
  });

  it("classifies bogus public slugs as noindex 404 fallback routes", () => {
    const activationServiceIds = allServices.map((service) => service.id);

    [
      "/face-serum-gxrcld",
      "/wp-admin",
      "/collections/face-serum-gxrcld",
      "/product/face-serum-gxrcld",
      "/blog/face-serum-gxrcld",
      "/services/face-serum-gxrcld",
      "/calculators/face-serum-gxrcld",
      "/startup/face-serum-gxrcld",
      "/compare/face-serum-gxrcld",
      "/learn/guide/face-serum-gxrcld",
      "/itr-season-2026/face-serum-gxrcld",
    ].forEach((route) => {
      expect(classifySpaFallbackPath(route, { activationServiceIds })).toMatchObject({
        known: false,
        robots: "noindex, nofollow",
        status: 404,
      });
    });
  });

  it("keeps app-only deep links available without making them indexable", () => {
    const activationServiceIds = allServices.map((service) => service.id);

    [
      "/dashboard/services/example-id",
      "/services/activate/partnership-deed",
      "/services/company-registration/mumbai",
      "/experts/ca-amit-verma",
      "/search",
    ].forEach((route) => {
      expect(classifySpaFallbackPath(route, { activationServiceIds })).toMatchObject({
        known: true,
        robots: "noindex, nofollow",
        status: 200,
      });
    });

    expect(classifySpaFallbackPath("/services/activate/face-serum-gxrcld", { activationServiceIds })).toMatchObject({
      known: false,
      status: 404,
    });
    expect(classifySpaFallbackPath("/services/company-registration/face-serum-gxrcld", { activationServiceIds }))
      .toMatchObject({
        known: false,
        status: 404,
      });
  });

  it("keeps every direct client route either generated, private, or explicitly noindex fallback-safe", () => {
    const activationServiceIds = allServices.map((service) => service.id);
    const routeSource = readFileSync(path.join(process.cwd(), "client/src/Routes.tsx"), "utf8");
    const clientRoutes = [...routeSource.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]);
    const generatedOrStaticRoutes = new Set(
      [
        ...PUBLIC_STATIC_ROUTES,
        ...Object.keys(SEO_CONFIG),
        ...getGeneratedPublicRoutes(),
        ...PRIVATE_NOINDEX_ROUTES,
      ].map(normalizePublicPath),
    );

    const unclassifiedRoutes = clientRoutes.filter((route) => {
      if (route.includes(":") || route.includes("*")) return false;

      const normalized = normalizePublicPath(route);
      if (generatedOrStaticRoutes.has(normalized) || isPrivateRoute(normalized)) return false;

      return !classifySpaFallbackPath(normalized, { activationServiceIds }).known;
    });

    expect(unclassifiedRoutes).toEqual([]);
  });

  it("keeps authenticated ITR filing private while preserving the public selector entry point", () => {
    const routes = getIndexablePublicRoutes(
      [
        ...Object.entries(SEO_CONFIG)
          .filter(([, config]) => !config.noindex)
          .map(([route]) => route),
        ...getGeneratedPublicRoutes(),
      ],
      [],
    );

    expect(routes).toContain("/itr/form-selector");
    expect(routes).toContain("/itr/form-recommender");
    expect(routes).not.toContain("/itr/filing");
    expect(isPrivateRoute("/itr/filing")).toBe(true);
    expect(isPrivateRoute("/itr/form-selector")).toBe(false);
    expect(PRIVATE_NOINDEX_ROUTES).toContain("/itr/filing");
  });

  it("builds the Vercel API sitemap from the full generated public route inventory", () => {
    const sitemap = buildApiSitemapXml();

    expect(sitemap).toContain("<loc>https://myeca.in/services/pan-card</loc>");
    expect(sitemap).toContain("<loc>https://myeca.in/calculators/vda-tax</loc>");
    expect(sitemap).toContain("<loc>https://myeca.in/startup/planning</loc>");
    expect(sitemap).toContain("<loc>https://myeca.in/learn/guide/complete-itr-guide-salaried</loc>");
    expect(sitemap).toContain("<loc>https://myeca.in/itr/form-selector</loc>");
    expect(sitemap).not.toContain("<loc>https://myeca.in/itr/filing</loc>");
    expect(sitemap).not.toContain("<loc>https://myeca.in/dashboard</loc>");
    expect(sitemap).not.toContain("<loc>https://myeca.in/documents</loc>");
  });
});
