import path from "path";
import { describe, expect, it } from "vitest";
import { resolveStaticRouteShell } from "./static-route-shell";

describe("static route shell resolution", () => {
  const distPath = path.resolve("dist/public");

  it("serves generated route shells at clean URLs without adding a trailing slash", () => {
    const expected = path.resolve(distPath, "which-itr-form-to-file", "index.html");

    expect(resolveStaticRouteShell(distPath, "/which-itr-form-to-file", (candidate) => candidate === expected))
      .toBe(expected);
  });

  it("leaves root, slash-suffixed, missing, and escaping paths to the normal static handler", () => {
    expect(resolveStaticRouteShell(distPath, "/", () => true)).toBeNull();
    expect(resolveStaticRouteShell(distPath, "/which-itr-form-to-file/", () => true)).toBeNull();
    expect(resolveStaticRouteShell(distPath, "/missing", () => false)).toBeNull();
    expect(resolveStaticRouteShell(distPath, "/../../server/app.ts", () => true)).toBeNull();
  });
});
