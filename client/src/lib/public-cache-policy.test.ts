import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("public performance cache policy", () => {
  it("keeps Vercel assets cacheable without long-lived fallback poisoning", () => {
    const vercel = JSON.parse(read("vercel.json")) as {
      headers: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
    };
    const assetHeaders = vercel.headers.find((entry) => entry.source === "/assets/(.*)")?.headers ?? [];
    const bootstrapHeaders = vercel.headers.find((entry) => entry.source === "/app-bootstrap.js")?.headers ?? [];

    expect(assetHeaders).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=86400, stale-while-revalidate=604800",
    });
    expect(bootstrapHeaders).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=3600, stale-while-revalidate=86400",
    });
  });

  it("inlines a crawlable static shell style before React hydration", () => {
    const html = read("client/index.html");

    expect(html).toContain(".static-seo-shell{");
    expect(html).toContain(".static-seo-shell h1{");
  });
});
