import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("home SEO bundle boundary", () => {
  it("keeps the homepage SEO record outside the full route catalogue", () => {
    const homeSource = readFileSync(resolve(__dirname, "../pages/home.page.tsx"), "utf8");
    const seoSource = readFileSync(resolve(__dirname, "seo.config.ts"), "utf8");

    expect(homeSource).toContain("@/config/home-seo");
    expect(homeSource).not.toContain("@/config/seo.config");
    expect(seoSource).toContain('import { HOME_SEO_CONFIG } from "./home-seo";');
    expect(seoSource).toContain("'/': HOME_SEO_CONFIG,");
  });
});
