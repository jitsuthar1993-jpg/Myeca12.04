import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("route preloading", () => {
  it("warms the payments workspace from the dashboard without public-route treatment", () => {
    const hookSource = readFileSync(resolve(__dirname, "use-route-preload.ts"), "utf8");
    const dashboardRelationship = hookSource.match(/'\/dashboard': \[([\s\S]*?)\]/)?.[1] ?? "";
    const privatePrefixes = hookSource.match(/PRIVATE_ROUTE_PREFIXES = \[([\s\S]*?)\]/)?.[1] ?? "";
    const importMap = hookSource.match(/const importMap: Record<string, \(\) => Promise<unknown>> = \{([\s\S]*?)\};/)?.[1] ?? "";

    expect(dashboardRelationship).toContain("'/payments'");
    expect(privatePrefixes).toContain("'/payments'");
    expect(importMap).toContain("'/payments': () => import('@/pages/payments.page')");
  });

  it("treats MY ITR filing as a private workspace route while keeping form selector public", () => {
    const hookSource = readFileSync(resolve(__dirname, "use-route-preload.ts"), "utf8");
    const dashboardRelationship = hookSource.match(/'\/dashboard': \[([\s\S]*?)\]/)?.[1] ?? "";
    const privatePrefixes = hookSource.match(/PRIVATE_ROUTE_PREFIXES = \[([\s\S]*?)\]/)?.[1] ?? "";

    expect(dashboardRelationship).toContain("'/itr/filing'");
    expect(dashboardRelationship).not.toContain("'/itr/form-selector'");
    expect(privatePrefixes).toContain("'/itr/filing'");
    expect(privatePrefixes).not.toContain("'/itr/form-selector'");
  });
});
