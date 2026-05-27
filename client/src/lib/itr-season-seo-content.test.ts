import { describe, expect, it } from "vitest";
import {
  PRIORITY_ITR_CONTENT_MIN_INTERNAL_LINKS,
  PRIORITY_ITR_CONTENT_MIN_WORDS,
  PRIORITY_ITR_ROUTE_CONTENT,
} from "@shared/priority-itr-seo-content";
import { PRIORITY_ITR_SEARCH_ROUTES } from "@shared/search-engine-readiness";
import { renderStaticRouteBody } from "@shared/static-seo-content";

const contentBackedRoutes = PRIORITY_ITR_SEARCH_ROUTES.filter(
  (route) =>
    route !== "/blog/when-will-itr-filing-start-ay-2026-27" &&
    route !== "/learn/guide/salary-tax-calculator-guide-ay-2026-27",
);

function visibleWordCount(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

describe("ITR season SEO content signals", () => {
  it("defines crawlable static content for priority non-article routes", () => {
    expect(PRIORITY_ITR_CONTENT_MIN_WORDS).toBeGreaterThanOrEqual(120);
    expect(PRIORITY_ITR_CONTENT_MIN_INTERNAL_LINKS).toBeGreaterThanOrEqual(2);

    for (const route of contentBackedRoutes) {
      const content = PRIORITY_ITR_ROUTE_CONTENT[route];

      expect(content, `${route} content`).toBeDefined();
      expect(content.sections.length, `${route} sections`).toBeGreaterThanOrEqual(2);
      expect(content.links.length, `${route} links`).toBeGreaterThanOrEqual(
        PRIORITY_ITR_CONTENT_MIN_INTERNAL_LINKS,
      );
      expect(content.requiredTerms.length, `${route} terms`).toBeGreaterThanOrEqual(3);
    }
  });

  it("renders sections and internal links into the static SEO shell", () => {
    const body = renderStaticRouteBody({
      route: "/itr-season-2026",
      title: "AY 2026-27 ITR Season Hub",
      description: "Plan AY 2026-27 ITR filing with Form 16, AIS, Form 26AS, calculators, and review paths.",
      kind: "page",
      highlights: ["Form 16", "AIS and Form 26AS", "ITR form selection"],
      sections: PRIORITY_ITR_ROUTE_CONTENT["/itr-season-2026"].sections,
      links: PRIORITY_ITR_ROUTE_CONTENT["/itr-season-2026"].links,
    });

    expect(visibleWordCount(body)).toBeGreaterThanOrEqual(PRIORITY_ITR_CONTENT_MIN_WORDS);
    expect(body).toContain("<h2>ITR season readiness");
    expect(body).toContain('href="/itr/form-selector"');
    expect(body).toContain('href="/form16-parser"');
  });
});
