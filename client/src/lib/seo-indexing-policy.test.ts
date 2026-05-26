import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { SEO_CONFIG } from "../config/seo.config";
import { getGeneratedPublicRoutes } from "../data/missing-pages";
import { buildApiSitemapXml } from "../../../api/index";
import {
  PRIVATE_NOINDEX_ROUTES,
  getIndexablePublicRoutes,
  isPrivateRoute,
} from "@shared/seo-public";

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
