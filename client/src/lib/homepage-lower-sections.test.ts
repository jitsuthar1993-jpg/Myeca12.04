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
    expect(home).toContain("<NoticeComplianceSection />");
    expect(home.indexOf("<GSTNoticeSection />")).toBeGreaterThan(
      home.indexOf("<NoticeComplianceSection />"),
    );

    // The filing promise is complete on first paint and does not resemble a stalled animation.
    expect(home).toContain('File your <span className="text-blue-600">Income Tax Return</span> for AY 2026-27');
    expect(home).not.toContain("HeroTypewriter");
    expect(home).not.toContain("Free Notice Assistance");
    expect(home).toContain("Notice guidance included for eligible filing cases");
    expect(home).toContain('className="hidden border-b border-slate-200 bg-white py-12 md:block md:py-16"');
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

  it("keeps the old red notice section and AI-search resource sections", () => {
    const notice = readSource("client/src/components/NoticeComplianceSection.tsx");
    const gst = readSource("client/src/components/GSTNoticeSection.tsx");
    const glossary = readSource("client/src/components/seo/FinancialGlossary.tsx");
    const resources = readSource("client/src/components/seo/FeaturedResources.tsx");

    expect(notice).toContain("from-red-50 to-orange-50");
    expect(notice).toContain("Notice compliance support");
    expect(notice).toContain("Income Tax Notice?");
    expect(notice).toContain("Start with the facts.");
    expect(notice).toContain("Get notice review");
    expect(notice).toContain("Request Callback");
    expect(notice).not.toContain(["text", "gray"].join("-") + "-");
    expect(gst).toContain("GST support without guesswork");
    expect(glossary).toContain("People also ask before filing");
    expect(resources).toContain("Questions people ask before choosing a tax service");
  });
});
