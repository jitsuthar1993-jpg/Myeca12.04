import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SEO_CONFIG } from "../config/seo.config";
import { itrSeasonCampaignAssets } from "../data/itr-season-campaign";
import { TAX_GUIDES } from "../data/tax-guides";
import {
  getGeneratedPublicRoutes,
  getGeneratedRouteSEOConfig,
} from "../data/missing-pages";
import { buildApiSitemapXml } from "../../../api/index";
import {
  classifyPublicHref,
  getPublicLinkAuditSeedRoutes,
  parsePublicSitemapRoutes,
} from "@shared/public-link-audit";
import {
  PRIVATE_NOINDEX_ROUTES,
  getIndexablePublicRoutes,
  isPrivateRoute,
} from "@shared/seo-public";
import {
  isValidGoogleSiteVerificationToken,
  parseGoogleSiteVerificationTxtRecord,
} from "@shared/search-console-verification";
import { EMAIL_TEMPLATES } from "../../../server/services/email";
import { defaultBlogPosts } from "../../../server/data/default-blog-content";
import { getBlogConversionLinks } from "./blog-conversion-links";

describe("public link audit", () => {
  it("classifies route, anchor, placeholder, and external links", () => {
    expect(classifyPublicHref("#", "/compliance-calendar")).toMatchObject({
      kind: "placeholder",
    });
    expect(classifyPublicHref("#all", "/learn/videos")).toMatchObject({
      hash: "#all",
      kind: "same-page-anchor",
      path: "/learn/videos",
    });
    expect(classifyPublicHref("https://myeca.in/tds-refund-tracker", "/")).toMatchObject({
      kind: "internal-route",
      path: "/tds-refund-tracker",
    });
    expect(classifyPublicHref("https://eportal.incometax.gov.in", "/")).toMatchObject({
      kind: "external",
    });
  });

  it("extracts public routes from sitemap entries", () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset>
        <url><loc>https://myeca.in/</loc></url>
        <url><loc>https://myeca.in/services</loc></url>
        <url><loc>https://docs.example.com/ignored</loc></url>
      </urlset>`;

    expect(parsePublicSitemapRoutes(sitemap)).toEqual(["/", "/services"]);
  });

  it("seeds audit routes from the public inventory and sitemap-only routes", () => {
    expect(getPublicLinkAuditSeedRoutes(["/learn/guide/example"], ["/help"])).toEqual(
      expect.arrayContaining(["/", "/services", "/help", "/learn/guide/example"]),
    );
  });

  it("exposes generated service, calculator, and startup routes for public SEO coverage", () => {
    expect(getGeneratedPublicRoutes()).toEqual(
      expect.arrayContaining([
        "/services/pan-card",
        "/calculators/vda-tax",
        "/startup/planning",
      ]),
    );
  });

  it("uses tailored SEO metadata for high-value generated public routes", () => {
    const expectedMetadata = [
      {
        route: "/services/pan-card",
        title: "PAN Card Assistance Online | Correction & Business PAN Support | MyeCA.in",
      },
      {
        route: "/calculators/vda-tax",
        title: "VDA & Crypto Tax Guide for ITR Filing | MyeCA.in",
      },
      {
        route: "/startup/planning",
        title: "Startup Business Planning Services India | Founder Roadmap | MyeCA.in",
      },
    ];

    expectedMetadata.forEach(({ route, title }) => {
      expect(SEO_CONFIG[route], route).toBeDefined();
      expect(SEO_CONFIG[route].title, route).toBe(title);
      expect(SEO_CONFIG[route].description, route).not.toMatch(/ on MyeCA\.in: Indian tax/i);
      expect(SEO_CONFIG[route].keywords.length, route).toBeGreaterThanOrEqual(4);
    });
  });

  it("derives route-specific SEO metadata for every generated public page", () => {
    getGeneratedPublicRoutes().forEach((route) => {
      const config = SEO_CONFIG[route] ?? getGeneratedRouteSEOConfig(route);

      expect(config, route).toBeDefined();
      expect(config?.title, route).not.toBe(`${route.split("/").filter(Boolean).slice(-2).join(" ")} | MyeCA.in`);
      expect(config?.description, route).not.toMatch(/ on MyeCA\.in: Indian tax/i);
      expect(config?.keywords.length, route).toBeGreaterThanOrEqual(4);
      expect(config?.breadcrumbs.at(-1)?.url, route).toBe(route);
    });
  });

  it("keeps authenticated ITR filing private while preserving the public selector entry point", () => {
    const routes = getIndexablePublicRoutes(
      [
        ...Object.entries(SEO_CONFIG)
          .filter(([, config]) => !config.noindex)
          .map(([route]) => route),
        ...getGeneratedPublicRoutes(),
      ],
      [],
    );

    expect(routes).toContain("/itr/form-selector");
    expect(routes).toContain("/itr/form-recommender");
    expect(routes).not.toContain("/itr/filing");
    expect(isPrivateRoute("/itr/filing")).toBe(true);
    expect(isPrivateRoute("/itr/form-selector")).toBe(false);
    expect(PRIVATE_NOINDEX_ROUTES).toContain("/itr/filing");
  });

  it("uses filing-specific SEO metadata for public ITR selector routes", () => {
    const expectedMetadata = [
      {
        route: "/itr/form-selector",
        title: "ITR Form Selector AY 2026-27 | Find ITR-1, ITR-2 or ITR-3 | MyeCA.in",
      },
      {
        route: "/itr/form-recommender",
        title: "ITR Form Recommender AY 2026-27 | Guided Filing Path | MyeCA.in",
      },
    ];

    expectedMetadata.forEach(({ route, title }) => {
      expect(SEO_CONFIG[route], route).toBeDefined();
      expect(SEO_CONFIG[route].title, route).toBe(title);
      expect(SEO_CONFIG[route].description, route).toMatch(/ITR|income tax/i);
      expect(SEO_CONFIG[route].keywords.length, route).toBeGreaterThanOrEqual(4);
    });
  });

  it("rejects placeholder Search Console verification tokens", () => {
    expect(isValidGoogleSiteVerificationToken("google123_real-token")).toBe(true);
    expect(isValidGoogleSiteVerificationToken("")).toBe(false);
    expect(isValidGoogleSiteVerificationToken("%VITE_GOOGLE_SITE_VERIFICATION%")).toBe(false);
    expect(isValidGoogleSiteVerificationToken("google-site-verification=")).toBe(false);
    expect(parseGoogleSiteVerificationTxtRecord("google-site-verification=google123_real-token")).toBe("google123_real-token");
    expect(parseGoogleSiteVerificationTxtRecord("google-site-verification=")).toBeNull();
  });

  it("builds the Vercel API sitemap from the full generated public route inventory", () => {
    const sitemap = buildApiSitemapXml();

    expect(sitemap).toContain("<loc>https://myeca.in/services/pan-card</loc>");
    expect(sitemap).toContain("<loc>https://myeca.in/calculators/vda-tax</loc>");
    expect(sitemap).toContain("<loc>https://myeca.in/startup/planning</loc>");
    expect(sitemap).toContain("<loc>https://myeca.in/learn/guide/complete-itr-guide-salaried</loc>");
    expect(sitemap).toContain("<loc>https://myeca.in/itr/form-selector</loc>");
    expect(sitemap).not.toContain("<loc>https://myeca.in/itr/filing</loc>");
    expect(sitemap).not.toContain("<loc>https://myeca.in/dashboard</loc>");
    expect(sitemap).not.toContain("<loc>https://myeca.in/documents</loc>");
  });

  it("indexes the ITR season campaign assets and competitor capture pages", () => {
    const routes = getIndexablePublicRoutes(
      [
        ...Object.entries(SEO_CONFIG)
          .filter(([, config]) => !config.noindex)
          .map(([route]) => route),
        ...getGeneratedPublicRoutes(),
      ],
      [],
    );
    const sitemap = buildApiSitemapXml();
    const expectedRoutes = [
      "/itr-season-2026",
      "/itr-season-2026/ais-form-26as-mismatch-checklist",
      "/itr-season-2026/form-16-parser-guide",
      "/itr-season-2026/capital-gains-broker-statement-checklist",
      "/itr-season-2026/itr-deadline-refund-status-tracker",
      "/compare/cleartax-alternative",
      "/compare/taxbuddy-alternative",
      "/compare/quicko-capital-gains-alternative",
      "/compare/indiafilings-alternative",
      "/compare/best-ca-assisted-itr-filing",
    ];

    expectedRoutes.forEach((route) => {
      expect(SEO_CONFIG[route], route).toBeDefined();
      expect(routes, route).toContain(route);
      expect(sitemap, route).toContain(`<loc>https://myeca.in${route}</loc>`);
      expect(SEO_CONFIG[route].title, route).not.toBe(SEO_CONFIG["/"].title);
    });
  });

  it("keeps high-intent tax guide topics discoverable for topical authority", () => {
    const expectedGuideSlugs = [
      "itr-1-filing-guide-ay-2026-27",
      "section-80c-deductions-ay-2026-27",
      "ais-explained-ay-2026-27",
      "gst-notice-handling-guide",
    ];
    const guideSlugs = TAX_GUIDES.map((guide) => guide.slug);
    const sitemap = buildApiSitemapXml();

    expectedGuideSlugs.forEach((slug) => {
      expect(guideSlugs, slug).toContain(slug);
      expect(sitemap, slug).toContain(`<loc>https://myeca.in/learn/guide/${slug}</loc>`);
    });
  });

  it("keeps high-intent guides linked into calculator, service, pricing, and filing paths", () => {
    const highIntentGuides = TAX_GUIDES.filter((guide) =>
      [
        "itr-1-filing-guide-ay-2026-27",
        "section-80c-deductions-ay-2026-27",
        "ais-explained-ay-2026-27",
        "gst-notice-handling-guide",
      ].includes(guide.slug),
    );

    expect(highIntentGuides).toHaveLength(4);

    highIntentGuides.forEach((guide) => {
      const links = [
        ...guide.relatedCalculators,
        ...(guide.relatedResources?.map((resource) => resource.href) ?? []),
      ];

      expect(links.some((href) => href.startsWith("/calculators/")), guide.slug).toBe(true);
      expect(links.some((href) => href.startsWith("/services/") || href === "/expert-consultation"), guide.slug).toBe(true);
      expect(links, guide.slug).toContain("/pricing");

      if (guide.slug === "gst-notice-handling-guide") {
        expect(links, guide.slug).toContain("/services/notice-compliance");
      } else {
        expect(links, guide.slug).toContain("/itr/form-selector");
      }
    });
  });

  it("keeps each ITR season asset source-reviewed and conversion-linked", () => {
    itrSeasonCampaignAssets.forEach((asset) => {
      expect(asset.reviewNote, asset.slug).toMatch(/FY 2025-26|AY 2026-27/);
      expect(asset.disclaimer, asset.slug).toMatch(/educational/i);
      expect(asset.sourceLinks.length, asset.slug).toBeGreaterThanOrEqual(2);
      expect(asset.toolLink.href, asset.slug).toMatch(/^\//);
      expect(asset.conversionLink.href, asset.slug).toMatch(/^\//);
      expect(asset.relatedBlogLink.href, asset.slug).toMatch(/^\/blog\//);
      expect(asset.learnGuideLink.href, asset.slug).toMatch(/^\/learn\/guide\//);
    });
  });

  it("keeps every default blog article linked into calculator, service, pricing, and filing paths", () => {
    const publishedPosts = defaultBlogPosts.filter((post) => post.status === "published");

    expect(publishedPosts.length).toBeGreaterThan(20);

    publishedPosts.forEach((post) => {
      const links = getBlogConversionLinks(post).map((link) => link.href);

      expect(links.some((href) => href.startsWith("/calculators/")), post.slug).toBe(true);
      expect(links.some((href) => href.startsWith("/services/") || href === "/expert-consultation"), post.slug).toBe(true);
      expect(links, post.slug).toContain("/pricing");
      expect(links.some((href) => href === "/itr/form-selector" || href.startsWith("/services/")), post.slug).toBe(true);
    });
  });

  it("links the ITR season hub from public global footer crawl paths", () => {
    const footerSource = readFileSync("client/src/components/layout/Footer.tsx", "utf8");

    expect(footerSource).toContain('href="/itr-season-2026"');
    expect(SEO_CONFIG["/itr-season-2026"]).toBeDefined();
  });

  it("keeps the public HTML template free of unverifiable SEO claims", () => {
    const indexTemplate = readFileSync("client/index.html", "utf8");
    const glossarySource = readFileSync("client/src/components/seo/FinancialGlossary.tsx", "utf8");
    const referralEmailSource = readFileSync("server/services/referral-email.ts", "utf8");
    const shareButtonsSource = readFileSync("client/src/components/ShareButtons.tsx", "utf8");
    const gstReturnsSource = readFileSync("client/src/pages/services/gst-returns.page.tsx", "utf8");
    const trademarkSource = readFileSync("client/src/pages/services/trademark-registration.page.tsx", "utf8");

    expect(indexTemplate).not.toMatch(/most trusted|maximum refund guaranteed|save up to|15l\+/i);
    expect(glossarySource).not.toContain('href={item.href || "#"}');
    expect(referralEmailSource).not.toMatch(/100% secure and confidential/i);
    expect(shareButtonsSource).not.toMatch(/most trusted/i);
    expect(gstReturnsSource).not.toMatch(/real-time updates with supplier GSTR-1 filings|real-time ITC matching|AI-powered validation|95% success rate/i);
    expect(trademarkSource).not.toMatch(/95% success rate/i);
  });
});

describe("public email links", () => {
  it("keeps refund and account security CTAs on existing MyeCA routes", () => {
    const welcomeHtml = EMAIL_TEMPLATES.welcome.html({ userName: "Asha" });
    const welcomeText = EMAIL_TEMPLATES.welcome.text({ userName: "Asha" });
    const confirmationHtml = EMAIL_TEMPLATES.taxFilingConfirmation.html({
      userName: "Asha",
      acknowledgmentNumber: "ACK-1",
      filingDate: "2026-05-22",
      assessmentYear: "2026-27",
    });
    const confirmationText = EMAIL_TEMPLATES.taxFilingConfirmation.text({
      userName: "Asha",
      acknowledgmentNumber: "ACK-1",
      filingDate: "2026-05-22",
      assessmentYear: "2026-27",
    });
    const loginAlertHtml = EMAIL_TEMPLATES.loginAlert.html({
      userName: "Asha",
      loginTime: "2026-05-22T09:00:00Z",
      device: "Chrome",
      location: "India",
      ipAddress: "127.0.0.1",
    });
    const loginAlertText = EMAIL_TEMPLATES.loginAlert.text({
      userName: "Asha",
      loginTime: "2026-05-22T09:00:00Z",
      device: "Chrome",
      location: "India",
      ipAddress: "127.0.0.1",
    });

    expect(`${welcomeHtml}\n${welcomeText}`).not.toMatch(/most trusted|real-time/i);
    expect(`${confirmationHtml}\n${confirmationText}`).toContain("https://myeca.in/tds-refund-tracker");
    expect(`${confirmationHtml}\n${confirmationText}`).not.toContain("https://myeca.in/track-refund");
    expect(`${loginAlertHtml}\n${loginAlertText}`).toContain("https://myeca.in/settings/account");
    expect(`${loginAlertHtml}\n${loginAlertText}`).not.toContain("https://myeca.in/security");
  });
});
