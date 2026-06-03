import { describe, expect, it } from "vitest";
import { PUBLIC_NAVIGATION_LINKS } from "@/data/public-navigation-links";
import { getRouteModuleLoaderKeys, resolveRoutePreloadTarget } from "./route-preload";

describe("route preload resolution", () => {
  it("normalizes query strings before resolving a route chunk", () => {
    expect(resolveRoutePreloadTarget("/itr/start?source=header_desktop", false)).toMatchObject({
      path: "/itr/start",
      routePath: "/itr/start",
    });
  });

  it("resolves dynamic routes to their shared route module", () => {
    expect(resolveRoutePreloadTarget("/blog/mye-ca-complete-tax-filing-playbook", false)).toMatchObject({
      path: "/blog/mye-ca-complete-tax-filing-playbook",
      routePath: "/blog/:slug",
    });
  });

  it("deduplicates aliases that share the same source module", () => {
    const homeLoan = resolveRoutePreloadTarget("/calculators/home-loan", false);
    const carLoan = resolveRoutePreloadTarget("/calculators/car-loan", false);

    expect(homeLoan?.source).toBe("client/src/features/calculators/pages/loan-calculator.page.tsx");
    expect(carLoan?.source).toBe(homeLoan?.source);
    expect(carLoan?.loaderKey).toBe(homeLoan?.loaderKey);
  });

  it("skips unauthenticated private route preloads", () => {
    expect(resolveRoutePreloadTarget("/dashboard", false)).toBeNull();
    expect(resolveRoutePreloadTarget("/dashboard", true)).toMatchObject({
      path: "/dashboard",
      routePath: "/dashboard",
    });
  });

  it("resolves shared public navigation links with exact client routes, excluding home", () => {
    const unresolved = PUBLIC_NAVIGATION_LINKS
      .filter((link) => link.href !== "/")
      .filter((link) => !link.href.includes(":"))
      .filter((link) => resolveRoutePreloadTarget(link.href, false) === null)
      .map((link) => link.href);

    expect(unresolved).toEqual([]);
  });

  it("does not include test modules in the production preload manifest", () => {
    const testModuleKeys = getRouteModuleLoaderKeys().filter(
      (key) => key.includes(".test.") || key.includes(".spec.") || key.includes("/__tests__/"),
    );

    expect(testModuleKeys).toEqual([]);
  });
});
