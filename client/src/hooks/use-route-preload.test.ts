import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("route preloading", () => {
  it("uses intent-based public route preloading instead of app-wide background warming", () => {
    const appSource = readFileSync(resolve(__dirname, "../App.tsx"), "utf8");
    const headerSource = readFileSync(resolve(__dirname, "../components/layout/Header.tsx"), "utf8");
    const hookSource = readFileSync(resolve(__dirname, "use-route-preload.ts"), "utf8");

    expect(appSource).not.toContain("preloadRelated: true");
    expect(headerSource).toContain("preloadOnHover");
    expect(hookSource).toContain('import("@/routes/route-preload")');
    expect(hookSource).not.toContain("from '@/routes/route-preload'");
    expect(hookSource).not.toContain("ROUTE_RELATIONSHIPS");
  });

  it("keeps private workspace routes out of public-route treatment", () => {
    const preloadSource = readFileSync(resolve(__dirname, "../routes/route-preload.ts"), "utf8");
    const seoSource = readFileSync(resolve(__dirname, "../../../shared/seo-public.ts"), "utf8");

    expect(seoSource).toContain('"/payments"');
    expect(seoSource).toContain('"/settings"');
    expect(preloadSource).toContain("import.meta.glob");
    expect(preloadSource).toContain("isPrivateRoute(path)");
  });

  it("treats MY ITR filing as a private workspace route while keeping form selector public", () => {
    const seoSource = readFileSync(resolve(__dirname, "../../../shared/seo-public.ts"), "utf8");

    expect(seoSource.match(/PRIVATE_ROUTE_PREFIXES = \[([\s\S]*?)\]/)?.[1] ?? "").toContain('"/itr/filing"');
    expect(seoSource.match(/PRIVATE_ROUTE_PREFIXES = \[([\s\S]*?)\]/)?.[1] ?? "").not.toContain('"/itr/form-selector"');
  });
});
