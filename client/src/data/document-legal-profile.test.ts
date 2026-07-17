import { describe, expect, it } from "vitest";
import generatorRegistry from "./generator-registry.json";
import { DOCUMENT_LEGAL_PROFILES, getDocumentLegalProfile } from "./document-legal-profile";

describe("document legal profiles", () => {
  it("provides a complete profile for every registry generator", () => {
    expect(Object.keys(DOCUMENT_LEGAL_PROFILES).sort()).toEqual(
      generatorRegistry.generators.map(({ id }) => id).sort(),
    );

    for (const profile of Object.values(DOCUMENT_LEGAL_PROFILES)) {
      expect(profile.versionDate).toBe("2026-07-17");
      expect(profile.requiredFields.length).toBeGreaterThan(0);
      expect(profile.limitations.length).toBeGreaterThan(0);
      expect(profile.reviewer).toBeTruthy();
    }
  });

  it("preserves statutory and legal-draft safeguards", () => {
    expect(getDocumentLegalProfile("does-not-exist")).toBeNull();
    expect(getDocumentLegalProfile("invoice")).toMatchObject({
      documentClass: "statutory-gst",
      reviewStatus: "statutory-sensitive",
    });
    expect(getDocumentLegalProfile("will")).toMatchObject({
      documentClass: "legal-draft",
      reviewStatus: "draft-only",
    });
  });
});
