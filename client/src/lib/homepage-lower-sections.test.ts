import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("homepage lower-section redesign", () => {
  it("keeps the upper homepage stable while adding compact mobile summaries", () => {
    const home = readSource("client/src/pages/home.page.tsx");

    expect(home).toContain("<LowerHomepageMobileSummary />");
    expect(home).toContain("md:hidden");
    expect(home).toContain("For salaried professionals");
    expect(home).toContain("Business / GST");
    expect(home).toContain("Start ITR Filing");
  });

  it("frames desktop lower sections around trust, personas, and scope-first action", () => {
    const features = readSource("client/src/components/FeaturesSection.tsx");
    const personaPaths = readSource("client/src/components/EverythingSection.tsx");
    const advisory =
      readSource("client/src/components/OtherServicesSection.tsx") +
      readSource("client/src/components/ProfessionalServicesSection.tsx");

    expect(features).toContain("Why MyeCA works better than self-filing");
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
