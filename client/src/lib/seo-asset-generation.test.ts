import { describe, expect, it } from "vitest";
import {
  blogMeta,
  injectStaticRootFallback,
  renderStaticRootFallback,
} from "../../../scripts/generate-seo-assets";
import { defaultBlogPosts } from "../../../server/data/default-blog-content";

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

  it("renders route summary content for indexable non-home pages", () => {
    const fallback = renderStaticRootFallback({
      path: "/learn/guides",
      title: "Tax Guides | MyeCA.in",
      description: "Practical tax guides for Indian taxpayers.",
      canonicalUrl: "https://myeca.in/learn/guides",
      robots: "index, follow",
    });

    expect(fallback).toContain('data-seo-static-shell="route"');
    expect(fallback).toContain("Tax Guides | MyeCA.in");
    expect(fallback).toContain("Practical tax guides for Indian taxpayers.");
    expect(fallback).toContain("/learn/guides");
    expect(fallback).toContain("/itr/form-selector");
    expect(fallback).toContain("/pricing");
  });

  it("renders article highlights and resource links before React hydration", () => {
    const post = defaultBlogPosts.find((candidate) => candidate.slug === "when-will-itr-filing-start-ay-2026-27");

    expect(post).toBeDefined();

    const fallback = renderStaticRootFallback(blogMeta(post!));

    expect(fallback).toContain("Key points");
    expect(fallback).toContain(post!.keyHighlights[0]);
    expect(fallback).toContain("Official sources and next steps");
    expect(fallback).toContain(post!.ctaHref);
    expect(fallback).toContain(post!.sourceLinks![0].url);
  });

  it("injects static root content only for indexable public pages", () => {
    const template = `<body><div id="root"><div><div>Loading</div></div></div><script src="/app-bootstrap.js" defer></script></body>`;

    expect(injectStaticRootFallback(template, { path: "/", robots: "index, follow" })).toContain(
      "Estimate tax, choose your ITR path, then file.",
    );
    expect(
      injectStaticRootFallback(template, {
        path: "/learn/guides",
        title: "Tax Guides | MyeCA.in",
        description: "Practical tax guides for Indian taxpayers.",
        canonicalUrl: "https://myeca.in/learn/guides",
        robots: "index, follow",
      }),
    ).toContain("Tax Guides | MyeCA.in");
    expect(injectStaticRootFallback(template, { path: "/dashboard", robots: "noindex, nofollow" })).toContain("Loading");
  });
});
