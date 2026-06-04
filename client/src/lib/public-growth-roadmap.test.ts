import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { competitorPages, competitiveProofPoints } from "../data/competitive-growth";
import { PUBLIC_HEADER_PRIMARY_LINKS } from "../data/public-navigation-links";
import { getTaxFilingPlans } from "../data/pricing";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("public growth roadmap implementation", () => {
  it("keeps the homepage hero stable and conversion-focused", () => {
    const source = readSource("client/src/pages/home.page.tsx");

    expect(source).toContain("Income Tax Returns");
    expect(source).toContain("GST Returns");
    expect(source).toContain("TDS Returns");
    expect(source).toContain("Compliances");
    expect(source).toContain("Expert eCA Assistance");
    expect(source).toContain("Free Notice Assistance");
    expect(source).toContain("ITR FILING 2026-27 STARTED");
    expect(source).toContain("rounded-[3px] border-2 border-dashed border-emerald-500/70 bg-transparent");
    expect(source).toContain("text-emerald-700/85");
    expect(source).not.toContain("for tax, GST, notices");
    expect(source).not.toContain("ITR Filing Started");
    expect(source).not.toContain("<HeroTypingPhrase");
    expect(source).not.toContain("with expert CA assistance");
    expect(source).toContain("justify-center text-center text-blue-600");
    expect(source).toContain("animate-pulse");
    expect(source).toContain("Start Filing Now");
    expect(source).toContain("Free Tax Calculator");
    expect(source).toContain("heroProofItems");
    expect(source).toContain("Document handling");
    expect(source).toContain("Scope before payment");
    expect(source).toContain("/calculators/regime-comparator");
    expect(source).toContain("/calculators/tds");
    expect(source).toContain("/calculators/capital-gains");
  });

  it("adds public mobile conversion chrome outside authenticated surfaces", () => {
    const appSource = readSource("client/src/App.tsx");
    const barSource = readSource("client/src/components/conversion/PublicMobileConversionBar.tsx");

    expect(appSource).toContain("PublicMobileConversionBar");
    expect(barSource).toContain("Start ITR");
    expect(barSource).toContain("Talk to Expert");
    expect(barSource).toContain("/itr/start");
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
    expect(headerSource).toContain("/auth/login?next=%2Fitr%2Fstart%3Fsource%3Dheader_desktop_login_file");
    expect(headerSource).toContain("/auth/login?next=%2Fitr%2Fstart%3Fsource%3Dmobile_menu_login_file");
    expect(headerSource).not.toContain("<span>Log in</span>");
    expect(headerSource).not.toContain("Join / Sign in");
    expect(headerSource).not.toContain(">Blog<");
    expect(headerSource).not.toContain("Check ITR Plan");
    expect(headerSource).not.toContain("hidden lg:flex text-slate-400");
    expect(headerSource).not.toContain(">Trust<");
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

    expect(itrStartSource).toContain("Individual ITR form selector");
    expect(itrStartSource).toContain("Individual filing facts");
    expect(itrStartSource).toContain("recommendItrForm");
    expect(itrStartSource).toContain("itrStartProofItems");
    expect(itrStartSource).toContain("Current recommendation");
    expect(itrStartSource).toContain("lg:hidden");
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
    expect(formSelectorSource).toContain("/itr/start?source=form_selector_full_guide");
    expect(formSelectorSource).toContain("/expert-consultation?service=itr-filing&source=form_selector_full_guide");
  });

  it("applies the balanced mobile visual-flow polish layer", () => {
    const pricingSource = readSource("client/src/pages/pricing.page.tsx");
    const blogSource = readSource("client/src/pages/blog.page.tsx");

    expect(pricingSource).toContain("PricingPromiseCard");
    expect(pricingSource).toContain("hidden lg:grid");
    expect(pricingSource).toContain("lg:hidden");
    expect(pricingSource).toContain("mobile pricing promise");

    expect(blogSource).toContain("isTopicFilterOpen");
    expect(blogSource).toContain("selectedCategoryLabel");
    expect(blogSource).toContain("Topic");
    expect(blogSource).toContain("hidden md:flex");
    expect(blogSource).toContain("mobile-first-content-cta");
  });
});
