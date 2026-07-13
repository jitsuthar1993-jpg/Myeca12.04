import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("public trust copy", () => {
  it("presents consultation services without fabricated-looking expert profiles", () => {
    const expertsIndexSource = readSource("client/src/pages/experts/index.page.tsx");
    const expertProfileSource = readSource("client/src/pages/experts/profile.page.tsx");
    const expertSources = [
      "client/src/data/experts.ts",
      "client/src/pages/learn/index.page.tsx",
      "client/src/pages/learn/consultations.page.tsx",
    ].map(readSource).concat(expertsIndexSource, expertProfileSource).join("\n");

    expect(expertSources).not.toMatch(/images\.unsplash\.com|\/images\/experts\/(?:rajesh|priya|amit|sneha|vikram)\.jpg/i);
    expect(expertSources).not.toMatch(/verified (?:professional|cas|profile)|credential(?:s|[- ]checked| and scope checked)|years exp/i);
    expect(expertSources).not.toContain("expert.languages");
    expect(expertsIndexSource).not.toMatch(/ca-(?:rahul-sharma|priya-nair|amit-verma)/i);
    expect(expertProfileSource).toContain('"ca-rahul-sharma"');
    expect(expertSources).toContain("Tax Review Team");
    expect(expertSources).toContain('href="/learn/consultations"');
    expect(expertSources).toContain("Request Consultation");
    expect(expertProfileSource).toContain('consultationService: "tax-consultation"');
    expect(expertProfileSource).toContain('consultationService: "business-tax-review"');
    expect(expertProfileSource).toContain('source: "expert-profile"');
    expect(expertProfileSource).not.toContain("service=tax-review");
  });

  it("treats consultation slots as preferences and continues to the real request form", () => {
    const source = readSource("client/src/pages/learn/consultations.page.tsx");
    const requestFormSource = readSource("client/src/pages/expert-consultation.page.tsx");

    expect(source).not.toContain("Available Slots");
    expect(source).not.toContain("Confirm Booking");
    expect(source).not.toContain("You will receive a confirmation email");
    expect(source).toContain("Preferred Request Windows");
    expect(source).toContain("Availability, final scope, fee, and payment are confirmed after review.");
    expect(source).toContain("buildConsultationHref(consultationService");
    expect(source).toContain('source: "learn-consultations"');
    expect(source).toContain("team: selectedExpert?.id");
    expect(source).toContain("type: selectedType?.id");
    expect(source).toContain("date: selectedDate");
    expect(source).toContain("time: selectedSlot");
    expect(requestFormSource).toContain("buildConsultationPrefillMessage");
    expect(requestFormSource).not.toMatch(/verified tax and compliance expert/i);
  });

  it("removes unsupported Virtual CFO proof and keeps a scoped consultation route", () => {
    const source = readSource("client/src/pages/business/virtual-cfo.page.tsx");

    expect(source).not.toMatch(/500\+|free (?:financial )?audit|anonymized founder note/i);
    expect(source).not.toContain('"The virtual CFO workflow helped us review monthly finance tasks in one place."');
    expect(source).toContain("Request a Scoped Review");
    expect(source).toContain('buildConsultationHref("business-tax-review"');
    expect(source).toContain('serviceArea: "virtual-cfo"');
    expect(source).not.toContain("service=virtual-cfo");
  });

  it("removes unsupported Startup India volume and completion claims", () => {
    const source = readSource("client/src/pages/services/startup-india-registration.page.tsx");

    expect(source).not.toMatch(/5,000\+ startups registered|expert startup ca support|ca-guided process|2-3 week completion/i);
    expect(source).toContain("Application Document Checklist");
    expect(source).toContain('buildConsultationHref("business-tax-review"');
    expect(source).toContain('serviceArea: "startup-india-registration"');
    expect(source).not.toContain("service=startup-india-registration");
  });

  it("keeps city pages useful without implying local offices or city-based CAs", () => {
    const source = readSource("client/src/pages/services/city-landing.page.tsx");

    expect(source).not.toMatch(/city\.name}-based CAs|across the NCR|talk to a \{city\.name} ca|view local pricing/i);
    expect(source).not.toMatch(/local office visits|serving all major neighborhoods|hidden local charges/i);
    expect(source).not.toMatch(/business hubs|it parks|industrial zones|retail districts|startup clusters/i);
    expect(source).not.toContain("`CA in ${city.name}`");
    expect(source).not.toContain("`top ca firms in ${city.name}`");
    expect(source).toContain("Online filing support for {city.name}");
    expect(source).toContain('buildConsultationHref("business-tax-review"');
    expect(source).toContain("serviceArea: serviceKey");
    expect(source).toContain("city: cityKey");
    expect(source).not.toContain("service=${serviceKey}");
  });

  it("gives startup service calls to action real destinations", () => {
    const source = readSource("client/src/pages/startup-services.page.tsx");

    expect(source).toContain('<Link href="/pricing">');
    expect(source).toContain('buildConsultationHref("business-tax-review"');
    expect(source).toContain('serviceArea: "startup-services"');
  });
});
