import { describe, expect, it } from "vitest";
import {
  blogMeta,
  injectStaticRootFallback,
  minifyStaticRouteHtml,
  prepareStaticRouteTemplate,
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
    expect(fallback).toContain("File your Tax Returns with expert CA assistance");
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
      "File your Tax Returns with expert CA assistance",
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

  it("minifies generated route shells without changing SEO text or JSON-LD script content", () => {
    const html = `
      <html>
        <head>
          <script type="application/ld+json">{"@type":"WebPage","name":"MyeCA"}</script>
        </head>
        <body>
          <main>
            <h1>Income Tax Filing</h1>
            <p>Guided filing with CA review.</p>
          </main>
        </body>
      </html>
    `;

    expect(minifyStaticRouteHtml(html)).toBe(
      '<html><head><script type="application/ld+json">{"@type":"WebPage","name":"MyeCA"}</script></head><body><main><h1>Income Tax Filing</h1><p>Guided filing with CA review.</p></main></body></html>',
    );
  });

  it("moves generated-route-only CSS to the shared static SEO stylesheet", () => {
    const template = `<html><head>
      <style>
        @keyframes skel{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .skel{animation:skel 1.5s infinite}
      </style>
      <style>
        .static-seo-shell{min-height:100vh}
        .static-seo-shell h1{font-weight:900}
      </style>
    </head><body></body></html>`;

    const prepared = prepareStaticRouteTemplate(template);

    expect(prepared).toContain('<link rel="stylesheet" href="/static-seo-shell.css" />');
    expect(prepared).not.toContain("@keyframes skel");
    expect(prepared).not.toContain(".static-seo-shell{min-height:100vh}");
  });
});
