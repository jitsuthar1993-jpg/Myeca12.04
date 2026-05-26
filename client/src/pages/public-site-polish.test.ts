import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

describe("public site polish boundaries", () => {
  it("keeps service scope sections before social proof and dense resources on the homepage", () => {
    const home = source("client/src/pages/home.page.tsx");

    const serviceScopeIndex = home.indexOf("<EverythingSection />");
    const socialProofIndex = home.indexOf("<Testimonials />");
    const resourcesIndex = home.indexOf("<FeaturedResources />");

    expect(serviceScopeIndex).toBeGreaterThan(-1);
    expect(socialProofIndex).toBeGreaterThan(-1);
    expect(resourcesIndex).toBeGreaterThan(-1);
    expect(serviceScopeIndex).toBeLessThan(socialProofIndex);
    expect(socialProofIndex).toBeLessThan(resourcesIndex);
  });

  it("keeps homepage and pricing public copy away from self-service positioning", () => {
    const combined = [
      source("client/src/pages/home.page.tsx"),
      source("client/src/pages/pricing.page.tsx"),
      source("client/src/data/pricing.ts"),
    ].join("\n");

    expect(combined).not.toMatch(/self-service|self-guided/i);
  });

  it("keeps trust and contact pages light, static, and scoped", () => {
    const trust = source("client/src/pages/trust.page.tsx");
    const contact = source("client/src/pages/contact.page.tsx");

    expect(trust).not.toContain("bg-blue-700 py-12 text-white");
    expect(contact).not.toContain('from "framer-motion"');
    expect(contact).not.toMatch(/<m\./);
  });
});
