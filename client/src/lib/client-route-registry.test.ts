import { describe, expect, it } from "vitest";
import {
  CALCULATOR_ROUTE_PATHS,
  CLIENT_ROUTE_GROUPS,
  CLIENT_ROUTE_REGISTRY,
  PUBLIC_EXACT_ROUTE_PATHS,
  getClientRoutePaths,
  getClientRoutesByGroup,
} from "@/routes/client-route-registry";
import { isPrivateRoute, normalizePublicPath } from "@shared/seo-public";

describe("client route registry", () => {
  it("keeps routes grouped for audits without parsing Routes.tsx", () => {
    expect(CLIENT_ROUTE_GROUPS).toEqual(
      expect.arrayContaining(["public", "calculator", "service", "workspace", "admin", "ca", "team", "content"]),
    );
    expect(CALCULATOR_ROUTE_PATHS).toEqual(
      expect.arrayContaining(["/calculators/income-tax", "/calculators/gst", "/calculators/home-loan"]),
    );
    expect(getClientRoutesByGroup("workspace").map((route) => route.path)).toEqual(
      expect.arrayContaining(["/dashboard", "/documents", "/reports"]),
    );
    for (const group of CLIENT_ROUTE_GROUPS) {
      expect(getClientRoutesByGroup(group).length, `${group} routes should be registered`).toBeGreaterThan(0);
    }
  });

  it("uses unique normalized route paths and keeps public exact routes non-private", () => {
    const paths = getClientRoutePaths().map(normalizePublicPath);

    expect(paths.length).toBe(CLIENT_ROUTE_REGISTRY.length);
    expect(new Set(paths).size).toBe(paths.length);

    for (const route of PUBLIC_EXACT_ROUTE_PATHS) {
      expect(isPrivateRoute(route), route).toBe(false);
    }
  });
});
