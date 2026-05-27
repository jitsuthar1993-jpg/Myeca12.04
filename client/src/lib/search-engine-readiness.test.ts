import { describe, expect, it } from "vitest";
import { buildRobotsTxt } from "@shared/seo-public";
import {
  FORBIDDEN_SEARCH_ROUTES,
  PRIORITY_ITR_SEARCH_ROUTES,
  SEARCH_ENGINE_USER_AGENTS,
  robotsTxtAllowsSearchAgent,
} from "@shared/search-engine-readiness";

describe("all-engine search readiness policy", () => {
  it("keeps the ITR season priority queue explicit", () => {
    expect(PRIORITY_ITR_SEARCH_ROUTES).toEqual([
      "/",
      "/blog",
      "/blog/when-will-itr-filing-start-ay-2026-27",
      "/services/itr-for-salaried",
      "/calculators/income-tax",
      "/itr/form-selector",
      "/form16-parser",
      "/itr-season-2026",
      "/learn/guide/salary-tax-calculator-guide-ay-2026-27",
    ]);
  });

  it("checks Googlebot and Bingbot access without allowing private routes into search", () => {
    expect(SEARCH_ENGINE_USER_AGENTS.map((agent) => agent.name)).toEqual(["Googlebot", "Bingbot"]);
    expect(FORBIDDEN_SEARCH_ROUTES).toEqual(["/itr/filing", "/dashboard", "/documents", "/reports", "/admin"]);

    const robots = buildRobotsTxt();
    expect(robotsTxtAllowsSearchAgent(robots, "Googlebot")).toBe(true);
    expect(robotsTxtAllowsSearchAgent(robots, "Bingbot")).toBe(true);
    expect(robotsTxtAllowsSearchAgent("User-agent: Bingbot\nDisallow: /\n", "Bingbot")).toBe(false);
  });
});
