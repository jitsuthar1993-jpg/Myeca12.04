import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { competitorPages, competitiveProofPoints } from "../data/competitive-growth";
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
    expect(source).not.toContain("for tax, GST, notices");
    expect(source).not.toContain("<HeroTypingPhrase");
    expect(source).not.toContain("with expert CA assistance");
    expect(source).toContain("justify-start text-left text-blue-600");
    expect(source).toContain("animate-pulse");
    expect(source).toContain("Start Filing Now");
    expect(source).toContain("Free Tax Calculator");
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
    expect(barSource).toContain("/expert-consultation?service=itr-filing");
  });

  it("keeps the public desktop header CTA focused", () => {
    const headerSource = readSource("client/src/components/layout/Header.tsx");

    expect(headerSource).toContain("Login &amp; File");
    expect(headerSource).toContain("/auth/login?next=%2Fitr%2Fstart%3Fsource%3Dheader_desktop_login_file");
    expect(headerSource).not.toContain("<span>Log in</span>");
    expect(headerSource).not.toContain("Check ITR Plan");
    expect(headerSource).not.toContain("hidden lg:flex text-slate-400");
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
  });
});
