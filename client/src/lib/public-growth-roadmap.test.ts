import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { competitorPages, competitiveProofPoints } from "../data/competitive-growth";
import { PUBLIC_HEADER_PRIMARY_LINKS } from "../data/public-navigation-links";
import { getTaxFilingPlans } from "../data/pricing";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function hexToRgb(hex: string) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) throw new Error(`Invalid hex color: ${hex}`);

  return {
    r: Number.parseInt(match[1], 16),
    g: Number.parseInt(match[2], 16),
    b: Number.parseInt(match[3], 16),
  };
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = luminance(foreground);
  const backgroundLuminance = luminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

describe("public growth roadmap implementation", () => {
  it("keeps the homepage hero stable and conversion-focused", () => {
    const source = readSource("client/src/pages/home.page.tsx");

    expect(source).toContain('File your <span className="text-blue-600">Income Tax Return</span> for AY 2026-27');
    expect(source).toContain("Expert eCA assistance");
    expect(source).toContain("Notice guidance included for eligible filing cases");
    expect(source).toContain("ITR FILING 2026-27 STARTED");
    expect(source).toContain("rounded-[3px] border-2 border-dashed border-emerald-500/70 bg-transparent");
    expect(source).toContain("text-emerald-800");
    expect(source).not.toContain("for tax, GST, notices");
    expect(source).not.toContain("ITR Filing Started");
    expect(source).not.toContain("<HeroTypingPhrase");
    expect(source).not.toContain("with expert CA assistance");
    expect(source).not.toContain("HeroTypewriter");
    expect(source).not.toContain("animate-pulse");
    expect(source).toContain("Start Filing Now");
    expect(source).toContain("Free Tax Calculator");
    expect(source).toContain("heroProofItems");
    expect(source).toContain("Document handling");
    expect(source).toContain("Scope before payment");
    expect(source).toContain("/calculators/regime-comparator");
    expect(source).toContain("/calculators/tds");
    expect(source).toContain("/calculators/capital-gains");
  });

  it("keeps the mobile homepage hero contrast-safe and first-paint visible", () => {
    const source = readSource("client/src/pages/home.page.tsx");
    const heroStart = source.indexOf("<section className=\"bg-gradient-to-b");
    const heroEnd = source.indexOf("<section className=\"py-6 md:py-8\"", heroStart);
    const heroSource = source.slice(heroStart, heroEnd);

    expect(heroSource).toContain('<span className="text-emerald-800">AY 2026-27</span>');
    expect(heroSource).not.toContain('<span className="text-emerald-600">AY 2026-27</span>');
    expect(heroSource).toContain("text-emerald-800");
    expect(heroSource).not.toContain("text-emerald-700/85");
    expect(heroSource).not.toContain("m-hero-rise");
    expect(source).not.toContain('window.matchMedia("(max-width: 767px)")');
    expect(source).not.toContain("setShouldAnimateTypewriter");
    expect(contrastRatio("#065f46", "#ffffff")).toBeGreaterThanOrEqual(4.5);
  });

  it("adds public mobile conversion chrome outside authenticated surfaces", () => {
    const appSource = readSource("client/src/App.tsx");
    const barSource = readSource("client/src/components/conversion/PublicMobileConversionBar.tsx");

    expect(appSource).toContain("PublicMobileConversionBar");
    expect(barSource).toContain("Start ITR");
    expect(barSource).toContain("Talk to Expert");
    expect(barSource).toContain("Get GST help");
    expect(barSource).toContain("GST services");
    expect(barSource).toContain("data-mobile-conversion-context");
    expect(barSource).toContain("/which-itr-form-to-file");
    expect(barSource).toContain("HIDDEN_PATH_PREFIXES");
    expect(barSource).toContain('"/auth"');
    expect(barSource).toContain("hasScrolledPastFirstViewport");
    expect(barSource).toContain("focusin");
    expect(barSource).toContain("window.scrollY");
    expect(barSource).toContain("/expert-consultation?service=itr-filing");
  });

  it("keeps the public desktop header CTA focused", () => {
    const headerSource = readSource("client/src/components/layout/Header.tsx");

    expect(headerSource).toContain("Login &amp; File ITR");
    expect(headerSource).toContain("PUBLIC_HEADER_PRIMARY_LINKS.map");
    expect(PUBLIC_HEADER_PRIMARY_LINKS).toContainEqual({ href: "/blog", label: "Blogs" });
    expect(PUBLIC_HEADER_PRIMARY_LINKS).toContainEqual({ href: "/trust", icon: "trust", label: "Trust" });
    expect(PUBLIC_HEADER_PRIMARY_LINKS).not.toContainEqual({ href: "/pricing", label: "Pricing" });
    expect(headerSource).toContain("aria-label={item.label}");
    expect(headerSource).toContain("/auth/login?next=%2Fdashboard");
    expect(headerSource).not.toContain("/auth/login?next=%2Fitr%2Fstart%3Fsource%3Dheader_desktop_login_file");
    expect(headerSource).not.toContain("/auth/login?next=%2Fitr%2Fstart%3Fsource%3Dmobile_menu_login_file");
    expect(headerSource).not.toContain("<span>Log in</span>");
    expect(headerSource).not.toContain("Join / Sign in");
    expect(headerSource).not.toContain(">Blog<");
    expect(headerSource).not.toContain("Check ITR Plan");
    expect(headerSource).not.toContain("hidden lg:flex text-slate-400");
    expect(headerSource).toContain("{item.label}");
    expect(headerSource).not.toContain("Trust & Security");
  });

  it("standardizes core pricing CTA labels", () => {
    const labels = getTaxFilingPlans().map((plan) => plan.cta.label);

    expect(labels).not.toContain("Start this workflow");
    expect(labels).toContain("Start Salary ITR - Rs 499");
    expect(labels).toContain("Start CA-Assisted ITR - Rs 999");
    expect(labels).toContain("Get Scope Review");
    expect(labels).toContain("View Business Services");
  });

  it("covers the requested competitor and positioning proof", () => {
    expect(competitiveProofPoints).toContain("Scope-first CA-assisted tax filing");
    expect(competitorPages.some((page) => page.slug === "tax2win-alternative")).toBe(true);
  });

  it("uses stronger route-level conversion and SEO copy", () => {
    const itrStartSource = readSource("client/src/features/itr/pages/start.page.tsx");

    expect(itrStartSource).toContain("ITR selector");
    expect(itrStartSource).toContain("Check my ITR scope");
    expect(itrStartSource).toContain("File AY 2026-27 ITR with scope clarity before payment");
    expect(itrStartSource).toContain("Individual filing facts");
    expect(itrStartSource).toContain("recommendItrForm");
    expect(itrStartSource).toContain("ITR_START_STEPS");
    expect(itrStartSource).toContain("itr-selector-progress-strip");
    expect(itrStartSource).toContain("aria-valuenow={Math.round(progress)}");
    expect(itrStartSource).toContain("Your likely form is");
    expect(itrStartSource).toContain("AnimatePresence");
    expect(itrStartSource).toContain("Continue to MY ITR");
    expect(itrStartSource).not.toContain("taxpayerOptions");
    expect(itrStartSource).not.toContain("Taxpayer type");
    expect(itrStartSource).not.toContain("GST Returns");
    expect(itrStartSource).not.toContain("Recommended plan");
    expect(itrStartSource).not.toContain("request-link");
    expect(itrStartSource).not.toContain("/api/user-services");
    expect(readSource("client/src/pages/blog.page.tsx")).toContain(
      "ITR Filing & Tax Guides AY 2026-27"
    );
    expect(readSource("client/src/features/calculators/pages/income-tax.page.tsx")).toContain(
      "File with this estimate"
    );
    expect(readSource("client/src/features/calculators/pages/income-tax.page.tsx")).toContain(
      "Ask CA before paying"
    );
    expect(readSource("client/src/features/itr/pages/form-selector.page.tsx")).toContain(
      "Check my ITR plan in 60 sec"
    );
    const formSelectorSource = readSource("client/src/features/itr/pages/form-selector.page.tsx");
    expect(formSelectorSource).toContain("Which ITR Return Should You File for AY 2026-27?");
    expect(formSelectorSource).toContain("ITR-7");
    expect(formSelectorSource).toContain("ITR-U");
    expect(formSelectorSource).toContain("AY 2026-27");
    expect(formSelectorSource).toContain("Income Tax Act, 1961");
    expect(formSelectorSource).toContain("/which-itr-form-to-file?source=form_selector_full_guide");
    expect(formSelectorSource).toContain("/expert-consultation?service=itr-filing&source=form_selector_full_guide");
  });

  it("applies the balanced mobile visual-flow polish layer", () => {
    const pricingSource = readSource("client/src/pages/pricing.page.tsx");
    const blogSource = readSource("client/src/pages/blog.page.tsx");

    expect(pricingSource).toContain("PricingPromiseCard");
    expect(pricingSource).toContain("hidden lg:grid");
    expect(pricingSource).toContain("lg:hidden");
    expect(pricingSource).toContain("mobile pricing promise");

    expect(blogSource).toContain("Topic filters");
    expect(blogSource).toContain("selectedCategoryLabel");
    expect(blogSource).toContain("snap-x");
    expect(blogSource).toContain("aria-pressed");
    expect(blogSource).toContain("mobile-first-content-cta");
  });
});
