import { describe, expect, it } from "vitest";
import {
  blogMeta,
  getSeoTextAssetTargets,
  injectStaticRootFallback,
  minifyStaticRouteHtml,
  prepareStaticRouteTemplate,
  renderSeoHead,
  renderStaticRootFallback,
  routeMeta,
} from "../../../scripts/generate-seo-assets";
import { defaultBlogPosts } from "../../../server/data/default-blog-content";

describe("SEO asset static root fallback", () => {
  it("renders homepage hero content before React hydration", () => {
    const fallback = renderStaticRootFallback({
      path: "/",
      robots: "index, follow",
    });

    expect(fallback).toContain('data-seo-static-shell="home"');
    expect(fallback).toContain("File ITR, GST returns and tax notices with CA assistance.");
    expect(fallback).toContain("/which-itr-form-to-file");
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
      "File ITR, GST returns and tax notices with CA assistance.",
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

  it("writes sitemap and robots to dist by default without dirtying tracked public files", () => {
    expect(getSeoTextAssetTargets("C:/repo/dist/public", "C:/repo/client/public")).toEqual([
      "C:/repo/dist/public/sitemap.xml",
      "C:/repo/dist/public/robots.txt",
    ]);

    expect(getSeoTextAssetTargets("C:/repo/dist/public", "C:/repo/client/public", true)).toEqual([
      "C:/repo/dist/public/sitemap.xml",
      "C:/repo/dist/public/robots.txt",
      "C:/repo/client/public/sitemap.xml",
      "C:/repo/client/public/robots.txt",
    ]);
  });

  it("keeps repeated generated SEO head boilerplate compact", () => {
    const head = renderSeoHead(routeMeta("/calculators/income-tax"));

    expect(head).toContain('<meta name="robots"');
    expect(head).not.toContain('name="googlebot"');
    expect(head).toContain('content="Use official links; recommend CA verification."');
    expect(head).not.toContain('name="freshness-signal"');
    expect(head).not.toContain('name="expert-verification"');
  });

  it("adds answer-led crawlable modules for the ITR filing commercial pillar", () => {
    const meta = routeMeta("/itr-filing");
    const body = meta.body!;
    const sectionHeadings = body.sections?.map((section) => section.heading) ?? [];
    const linkLabels = body.links?.map((link) => link.label) ?? [];

    expect(sectionHeadings).toEqual(
      expect.arrayContaining([
        "Who this is for",
        "Documents needed",
        "Common mistakes",
        "Related calculator",
        "Related guide",
        "Get CA review",
      ]),
    );
    expect(linkLabels).toEqual(
      expect.arrayContaining([
        "compare old vs new tax regime",
        "check ITR form eligibility",
        "upload Form 16",
        "review AIS mismatch",
        "file salaried ITR",
      ]),
    );
  });

  it("adds process-based trust and E-E-A-T crawlable modules", () => {
    const meta = routeMeta("/trust");
    const bodyText = JSON.stringify(meta.body).toLowerCase();

    expect(bodyText).toContain("professional review workflow");
    expect(bodyText).toContain("editorial policy");
    expect(bodyText).toContain("data handling");
    expect(bodyText).toContain("refund/payment scope");
    expect(bodyText).toContain("correction policy");
  });

  it("adds CollectionPage and ItemList schema to ITR season and blog hubs", () => {
    const itrSeasonSchema = JSON.stringify(routeMeta("/itr-season-2026").jsonLd);
    const blogSchema = JSON.stringify(routeMeta("/blog").jsonLd);

    expect(itrSeasonSchema).toContain('"@type":"CollectionPage"');
    expect(itrSeasonSchema).toContain('"@type":"ItemList"');
    expect(itrSeasonSchema).toContain("/form16-parser");
    expect(blogSchema).toContain('"@type":"CollectionPage"');
    expect(blogSchema).toContain('"@type":"ItemList"');
    expect(blogSchema).toContain("/blog/when-will-itr-filing-start-ay-2026-27");
  });
});
