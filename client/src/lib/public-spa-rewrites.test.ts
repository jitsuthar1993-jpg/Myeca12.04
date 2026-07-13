import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const vercelConfig = JSON.parse(
  readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"),
) as {
  redirects: Array<{ source: string; destination: string; permanent: boolean }>;
  rewrites: Array<{ source: string; destination: string }>;
};

describe("public SPA deployment rewrites", () => {
  it("serves known public client routes without depending on the API fallback function", () => {
    for (const source of [
      "/ais-viewer",
      "/bank-analyzer",
      "/business/virtual-cfo",
      "/calculators/withdrawal-planner",
      "/itr/status-tracker",
      "/services/funding-assistance",
    ]) {
      expect(vercelConfig.rewrites).toContainEqual({ source, destination: "/index.html" });
    }
  });

  it("redirects the malformed Schedule FA URL to the published canonical article", () => {
    expect(vercelConfig.redirects).toContainEqual({
      source: "/blog/schedule-fa-foreign-bank-%E2%82%B9u-espp-us-stocks",
      destination: "/blog/schedule-fa-foreign-bank-rsu-espp-us-stocks",
      permanent: true,
    });
  });
});
