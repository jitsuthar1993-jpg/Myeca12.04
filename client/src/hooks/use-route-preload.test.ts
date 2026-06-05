import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("route preloading", () => {
  it("warms the payments workspace from the dashboard without public-route treatment", () => {
    const hookSource = readFileSync(resolve(__dirname, "use-route-preload.ts"), "utf8");
    const preloadSource = readFileSync(resolve(__dirname, "../routes/route-preload.ts"), "utf8");
    const seoSource = readFileSync(resolve(__dirname, "../../../shared/seo-public.ts"), "utf8");
    const dashboardRelationship = hookSource.match(/'\/dashboard': \[([\s\S]*?)\]/)?.[1] ?? "";

    expect(dashboardRelationship).toContain("'/payments'");
    expect(dashboardRelationship).toContain("'/settings'");
    expect(seoSource).toContain('"/payments"');
    expect(seoSource).toContain('"/settings"');
    expect(preloadSource).toContain("import.meta.glob");
    expect(preloadSource).toContain("isPrivateRoute(path)");
  });

  it("treats MY ITR filing as a private workspace route while keeping form selector public", () => {
    const hookSource = readFileSync(resolve(__dirname, "use-route-preload.ts"), "utf8");
    const seoSource = readFileSync(resolve(__dirname, "../../../shared/seo-public.ts"), "utf8");
    const dashboardRelationship = hookSource.match(/'\/dashboard': \[([\s\S]*?)\]/)?.[1] ?? "";

    expect(dashboardRelationship).toContain("'/itr/filing'");
    expect(dashboardRelationship).not.toContain("'/itr/form-selector'");
    expect(seoSource.match(/PRIVATE_ROUTE_PREFIXES = \[([\s\S]*?)\]/)?.[1] ?? "").toContain('"/itr/filing"');
    expect(seoSource.match(/PRIVATE_ROUTE_PREFIXES = \[([\s\S]*?)\]/)?.[1] ?? "").not.toContain('"/itr/form-selector"');
  });
});
