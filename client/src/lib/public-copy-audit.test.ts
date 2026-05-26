import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { allServices } from "../data/all-services";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("public anti-AI copy audit", () => {
  it("keeps the all-services page free of dashboard scaffold language", () => {
    const source = read("client/src/pages/all-services.page.tsx");
    const forbidden = [
      "MyeCAHub",
      "Buy Credits",
      "System Status",
      "Jitendra Suthar",
      "cajsuthar@gmail.com",
      "Lesson Guide",
      "Documentation",
      "Subscribe Now",
      "Search services, APIs, calculators",
    ];

    forbidden.forEach((term) => expect(source, term).not.toContain(term));
  });

  it("keeps homepage proof and comparison copy away from fake-testimonial and strawman patterns", () => {
    const sources = [
      "client/src/components/Testimonials.tsx",
      "client/src/data/testimonials.ts",
      "client/src/components/ComparisonTable.tsx",
      "client/src/components/FeaturesSection.tsx",
    ].map(read).join("\n");
    const forbidden = [
      "Salaried user, Mumbai",
      "Investor user, Bengaluru",
      "NRI user",
      "Anonymized feedback",
      "None - You're on your own",
      "High risk of notices",
      "bot support only",
      "Outperforms Self-Filing",
    ];

    forbidden.forEach((term) => expect(sources, term).not.toContain(term));
  });

  it("keeps public story pages away from generic mission-and-pillars language", () => {
    const sources = [
      "client/src/pages/about.page.tsx",
      "client/src/pages/pricing.page.tsx",
      "client/src/pages/trust.page.tsx",
      "client/src/pages/contact.page.tsx",
    ].map(read).join("\n");
    const forbidden = [
      "Humanize Tax Filing",
      "The MyeCA Way",
      "four pillars",
      "Scope-first support",
      "Scope promise",
      "case path",
    ];

    forbidden.forEach((term) => expect(sources, term).not.toContain(term));
  });

  it("gives every catalogue item concrete proof fields and a public CTA", () => {
    allServices.forEach((service) => {
      expect(service.description.trim().length, service.id).toBeGreaterThan(24);
      expect(service.turnaround, service.id).toBeTruthy();
      expect(service.ctaLabel, service.id).toMatch(/^(Start ITR|Request scope review|Open calculator|View service)$/);
      expect(service.documents?.length, service.id).toBeGreaterThanOrEqual(2);
      expect(service.checks?.length, service.id).toBeGreaterThanOrEqual(2);
    });
  });
});
