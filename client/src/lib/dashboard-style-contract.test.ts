import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const activeDashboardPages = [
  "client/src/pages/admin/index.page.tsx",
  "client/src/pages/admin/users.page.tsx",
  "client/src/pages/admin/requests.page.tsx",
  "client/src/pages/admin/services.page.tsx",
  "client/src/pages/admin/settings.page.tsx",
  "client/src/pages/admin/analytics/index.page.tsx",
  "client/src/pages/user-dashboard.page.tsx",
  "client/src/pages/dashboard/services.page.tsx",
  "client/src/pages/dashboard/service-detail.page.tsx",
  "client/src/pages/documents.page.tsx",
  "client/src/pages/ca/dashboard.page.tsx",
  "client/src/pages/team/dashboard.page.tsx",
] as const;

const oversizedDashboardPatterns = [
  /rounded-\[(?:22|24|26|28|32)px\]/,
  /space-y-8/,
  /\bp-8\b/,
  /\bp-10\b/,
  new RegExp("min-h-screen bg-" + "gray-50"),
];

describe("dashboard style contract", () => {
  it("keeps active dashboard pages inside the shared workspace shell", () => {
    for (const file of activeDashboardPages) {
      const source = readFileSync(file, "utf8");

      expect(source, `${file} imports shared Layout`).toContain("@/components/admin/Layout");
      expect(source, `${file} renders shared Layout`).toMatch(/<Layout(?:\s|>)/);
    }
  });

  it("keeps active dashboards compact and avoids legacy roomy dashboard styling", () => {
    for (const file of activeDashboardPages) {
      const source = readFileSync(file, "utf8");

      for (const pattern of oversizedDashboardPatterns) {
        expect(source, `${file} should not contain ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("removes global paragraph margins from document icon text stacks", () => {
    const source = readFileSync("client/src/pages/documents.page.tsx", "utf8");

    expect(source).toContain('<div className="[&>p]:mb-0">');
    expect(source).toContain('<div className="min-w-0 flex-1 [&>p]:mb-0">');
    expect(source).toContain('<div className="min-w-0 [&>p]:mb-0">');
  });

  it("keeps user dashboard metrics compact and aligns service identity rows", () => {
    const source = readFileSync("client/src/pages/user-dashboard.page.tsx", "utf8");

    expect(source).toContain("aria-label=\"What's next\"");
    expect(source).toContain("nextActions.map((action)");
    expect(source).toContain(
      'className="grid min-h-[60px] grid-cols-[36px_minmax(0,1fr)] items-center gap-3 px-3 py-2 sm:px-4"',
    );
    expect(source).toContain('<div className="min-w-0 [&>p]:mb-0">');
    expect(source.match(/<td className="align-middle px-4 py-3">/g)).toHaveLength(3);
    expect(source).toContain('<div className="flex min-w-0 items-center gap-3">');
    expect(source).toContain('<div className="flex min-w-0 items-center gap-2.5">');
    expect(source).toContain('<ShieldCheck className="h-4 w-4 shrink-0 text-blue-600" />');
    expect(source).toContain('<div className="min-w-0 flex-1 [&>p]:mb-0">');
  });
});
