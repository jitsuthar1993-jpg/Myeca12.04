import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SEO_CONFIG } from "../config/seo.config";
import { itrSeasonCampaignAssets } from "../data/itr-season-campaign";
import { getGeneratedPublicRoutes } from "../data/missing-pages";
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
import { EMAIL_TEMPLATES } from "../../../server/services/email";

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
