import { describe, expect, it } from "vitest";
import generatorRegistry from "./generator-registry.json";
import { FORM_CATALOGUE, PUBLIC_FORM_CATALOGUE } from "./form-catalog";

describe("public form catalogue coverage", () => {
  it("publishes every implemented and available document generator", () => {
    const availableIds = generatorRegistry.generators
      .filter((entry) => entry.status === "available")
      .map((entry) => entry.id)
      .sort();

    expect(PUBLIC_FORM_CATALOGUE.map((entry) => entry.generatorId).sort()).toEqual(availableIds);
    expect(PUBLIC_FORM_CATALOGUE).toHaveLength(60);
  });

  it("keeps catalogue ids unique and routes each entry to its generator", () => {
    expect(new Set(FORM_CATALOGUE.map((entry) => entry.id)).size).toBe(FORM_CATALOGUE.length);
    expect(FORM_CATALOGUE.every((entry) => entry.id === entry.generatorId)).toBe(true);
  });

  it("labels statutory GST outputs for review instead of presenting them as ordinary drafts", () => {
    expect(FORM_CATALOGUE.find((entry) => entry.id === "invoice")?.legalStatus).toBe("statutory-review");
    expect(FORM_CATALOGUE.find((entry) => entry.id === "gst-quotation")?.legalStatus).toBe("draft-template");
    expect(FORM_CATALOGUE.find((entry) => entry.id === "form-15g")?.legalStatus).toBe("statutory-review");
    expect(FORM_CATALOGUE.find((entry) => entry.id === "form-15g")?.verificationNote).toContain("Form 121");
    expect(FORM_CATALOGUE.find((entry) => entry.id === "form-12bb")?.verificationNote).toContain("Form 124");
  });
});
