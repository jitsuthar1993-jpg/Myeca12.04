import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("account route ownership", () => {
  it("routes settings URLs to the unified workspace account page only", () => {
    const source = readFileSync(resolve(__dirname, "Routes.tsx"), "utf8");

    expect(source).toContain('const UnifiedAccountPage = lazyWithRetry(() => import("@/pages/dashboard/account.page"))');
    expect(source).toContain('<Route path="/account" component={() => <RequireAuth><UnifiedAccountPage /></RequireAuth>} />');
    expect(source).toContain('<Route path="/profile" component={() => <RequireAuth><UnifiedAccountPage /></RequireAuth>} />');
    expect(source).toContain('<Route path="/settings" component={() => <RequireAuth><UnifiedAccountPage /></RequireAuth>} />');
    expect(source).toContain('<Route path="/settings/account" component={() => <RequireAuth><UnifiedAccountPage /></RequireAuth>} />');
    expect(source).toContain('<Route path="/profiles" component={() => <RequireAuth><ProfilesPage /></RequireAuth>} />');
    expect(source).not.toContain('import("@/pages/settings.page")');
    expect(source).not.toContain('import("@/pages/settings/account.page")');
  });
});
