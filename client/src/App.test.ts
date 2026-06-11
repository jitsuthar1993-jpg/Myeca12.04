import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("app layout routing", () => {
  it("treats logged-in ITR routes as workspace routes without the public header", () => {
    const appSource = readFileSync(resolve(__dirname, "App.tsx"), "utf8");
    const dashboardPathsBlock = appSource.match(/const dashboardPaths = \[([\s\S]*?)\];/)?.[1] ?? "";
    const dashboardPaths = Array.from(
      dashboardPathsBlock.matchAll(/'([^']+)'/g),
      (match) => match[1],
    );

    expect(dashboardPaths).toContain("/itr/filing");
    expect(dashboardPaths).toContain("/payments");
    expect(dashboardPaths).toContain("/account");
    expect(dashboardPaths).not.toContain("/itr");
  });

  it("uses workspace chrome for consultation routes only while auth is loading or authenticated", () => {
    const appSource = readFileSync(resolve(__dirname, "App.tsx"), "utf8");
    const adaptiveWorkspacePathsBlock =
      appSource.match(/const adaptiveWorkspacePaths = \[([\s\S]*?)\];/)?.[1] ?? "";
    const adaptiveWorkspacePaths = Array.from(
      adaptiveWorkspacePathsBlock.matchAll(/'([^']+)'/g),
      (match) => match[1],
    );

    expect(adaptiveWorkspacePaths).toEqual([
      "/expert-consultation",
      "/consultation",
    ]);
    expect(appSource).toContain(
      "const { isAuthenticated, isLoading: authLoading } = useAuth();",
    );
    expect(appSource).toContain(
      "const usesAdaptiveWorkspaceChrome = isAdaptiveWorkspacePath && (isAuthenticated || authLoading);",
    );
    expect(appSource).toContain(
      "const showLayoutComponents = !isAuthLayoutPath(currentPath) && !isDashboardPath && !usesAdaptiveWorkspaceChrome;",
    );
  });

  it("keeps the public header shell and spacer at the same responsive heights", () => {
    const appSource = readFileSync(resolve(__dirname, "App.tsx"), "utf8");
    expect(appSource).toContain(
      'className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-4 sm:px-6 md:h-[74px] lg:px-8"',
    );
    expect(appSource).toContain(
      '<div className="h-[60px] md:h-[74px]"></div>',
    );
  });
});
