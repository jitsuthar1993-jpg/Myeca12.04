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
    expect(dashboardPaths).not.toContain("/itr");
  });
});
