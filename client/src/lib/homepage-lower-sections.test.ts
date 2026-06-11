import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("homepage lower-section redesign", () => {
  it("keeps the mobile homepage compact with a single conversion path", () => {
    const home = readSource("client/src/pages/home.page.tsx");

    // Mobile pricing renders as compact rows; full cards stay desktop-only.
    expect(home).toContain("sm:hidden");
    expect(home).toContain("hidden gap-3 sm:grid sm:grid-cols-3");
    expect(home).toContain("Start ITR Filing");

    // Removed duplicated mobile sections must not return.
    expect(home).not.toContain("LowerHomepageMobileSummary");
    expect(home).not.toContain("Compact mobile summaries");
    expect(home).not.toContain("Know your number? Check the ITR path.");

    // Hero typewriter stays out of the accessibility tree and respects reduced motion.
    expect(home).toContain("prefers-reduced-motion");
    expect(home).toContain('aria-label="File your Income Tax Returns, GST Returns, TDS Returns, and Compliances"');
  });

  it("frames desktop lower sections around trust, personas, and scope-first action", () => {
    const features = readSource("client/src/components/FeaturesSection.tsx");
    const personaPaths = readSource("client/src/components/EverythingSection.tsx");
    const advisory =
      readSource("client/src/components/OtherServicesSection.tsx") +
      readSource("client/src/components/ProfessionalServicesSection.tsx");

    expect(features).toContain("How guided filing differs from self-filing");
    expect(features).toContain("Guided filing with guardrails");
    expect(personaPaths).toContain("For Salaried Professionals");
    expect(personaPaths).toContain("For Business / GST");
    expect(personaPaths).toContain("Start ITR Filing");
    expect(advisory).toContain("Scope-first pricing");
    expect(advisory).toContain("Request scoped review");
  });

  it("keeps notice and resource sections premium and AI-search friendly", () => {
    const notice = readSource("client/src/components/NoticeComplianceSection.tsx");
    const gst = readSource("client/src/components/GSTNoticeSection.tsx");
    const glossary = readSource("client/src/components/seo/FinancialGlossary.tsx");
    const resources = readSource("client/src/components/seo/FeaturedResources.tsx");

    expect(notice).not.toContain("from-red-50 to-orange-50");
    expect(notice).not.toContain("Don't Panic");
    expect(notice).toContain("Income tax notice support");
    expect(gst).toContain("GST support without guesswork");
    expect(glossary).toContain("People also ask before filing");
    expect(resources).toContain("Questions people ask before choosing a tax service");
  });
});
