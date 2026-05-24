import { describe, expect, it } from "vitest";
import {
  injectStaticRootFallback,
  renderStaticRootFallback,
} from "../../../scripts/generate-seo-assets";

describe("SEO asset static root fallback", () => {
  it("renders homepage hero content before React hydration", () => {
    const fallback = renderStaticRootFallback({
      path: "/",
      robots: "index, follow",
    });

    expect(fallback).toContain('data-seo-static-shell="home"');
    expect(fallback).toContain("Estimate tax, choose your ITR path, then file.");
    expect(fallback).toContain("/itr/form-selector");
    expect(fallback).toContain("/calculators/income-tax");
  });

  it("injects static root content only for the public homepage", () => {
    const template = `<body><div id="root"><div><div>Loading</div></div></div><script src="/app-bootstrap.js" defer></script></body>`;

    expect(injectStaticRootFallback(template, { path: "/", robots: "index, follow" })).toContain(
      "Estimate tax, choose your ITR path, then file.",
    );
    expect(injectStaticRootFallback(template, { path: "/learn/guides", robots: "index, follow" })).toContain("Loading");
    expect(injectStaticRootFallback(template, { path: "/dashboard", robots: "noindex, nofollow" })).toContain("Loading");
  });
});
