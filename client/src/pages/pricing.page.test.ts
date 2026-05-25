import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pricingSource = () => readFileSync("client/src/pages/pricing.page.tsx", "utf8");
const standardPricingSource = () => readFileSync("client/src/components/pricing/StandardPricingSection.tsx", "utf8");

describe("pricing page visual treatment", () => {
  it("keeps the pricing landing area on light MyeCA surfaces", () => {
    const source = pricingSource();

    expect(source).not.toContain("bg-blue-700 px-4 py-16 text-white");
    expect(source).not.toContain("border-white/10 bg-white/10 text-white");
    expect(source).not.toContain('<header className="border-b border-slate-100 bg-white">');
    expect(source).toContain("bg-[#F8FAFC]");
    expect(source).toContain("border-blue-100 bg-white");
  });

  it("keeps the shared pricing cards aligned with the lighter website theme", () => {
    const source = standardPricingSource();

    expect(source).not.toContain("rounded-[28px]");
    expect(source).not.toContain("bg-blue-600 text-white");
    expect(source).not.toContain("hover:bg-blue-700");
  });
});
