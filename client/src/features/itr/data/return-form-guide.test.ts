import { describe, expect, it } from "vitest";
import {
  ITR_RETURN_FORM_IDS,
  itrReturnFormGuide,
  itrReturnFormSourceLinks,
  type ItrReturnFormId,
} from "./return-form-guide";

describe("ITR return form guide data", () => {
  it("covers every AY 2026-27 return form from ITR-1 through ITR-7 plus ITR-U", () => {
    expect(ITR_RETURN_FORM_IDS).toEqual([
      "ITR-1",
      "ITR-2",
      "ITR-3",
      "ITR-4",
      "ITR-5",
      "ITR-6",
      "ITR-7",
      "ITR-U",
    ]);
    expect(itrReturnFormGuide.map((form) => form.id)).toEqual(ITR_RETURN_FORM_IDS);
  });

  it("keeps each form useful for public selection and CA-assisted handoff", () => {
    for (const form of itrReturnFormGuide) {
      expect(form.title, form.id).toContain(form.id);
      expect(form.appliesTo.length, `${form.id} appliesTo`).toBeGreaterThan(0);
      expect(form.notFor.length, `${form.id} notFor`).toBeGreaterThan(0);
      expect(form.keySchedules.length, `${form.id} keySchedules`).toBeGreaterThan(0);
      expect(form.typicalDocuments.length, `${form.id} typicalDocuments`).toBeGreaterThan(0);
      expect(form.deadlineNote, `${form.id} deadlineNote`).toContain("AY 2026-27");
      if (form.id === "ITR-U") {
        expect(form.lateFilingNote, `${form.id} lateFilingNote`).toContain("Section 139(8A)");
        expect(form.lateFilingNote, `${form.id} lateFilingNote`).toContain("Additional tax");
      } else {
        expect(form.lateFilingNote, `${form.id} lateFilingNote`).toContain("Sec. 234F");
      }
      expect(["individual-selector", "ca-review", "official-only"]).toContain(form.ctaCategory);
      expect(form.sourceLinks.length, `${form.id} sourceLinks`).toBeGreaterThan(0);
    }
  });

  it("routes entity and updated-return forms away from the individual draft selector", () => {
    const formById = new Map<ItrReturnFormId, string>(
      itrReturnFormGuide.map((form) => [form.id, form.ctaCategory]),
    );

    expect(formById.get("ITR-1")).toBe("individual-selector");
    expect(formById.get("ITR-2")).toBe("individual-selector");
    expect(formById.get("ITR-3")).toBe("individual-selector");
    expect(formById.get("ITR-4")).toBe("individual-selector");
    expect(formById.get("ITR-5")).toBe("ca-review");
    expect(formById.get("ITR-6")).toBe("ca-review");
    expect(formById.get("ITR-7")).toBe("ca-review");
    expect(formById.get("ITR-U")).toBe("official-only");
  });

  it("includes official Income Tax Department source links used by the page", () => {
    expect(itrReturnFormSourceLinks.map((source) => source.label)).toEqual([
      "Income Tax Returns FAQ",
      "ITR-1 FAQ",
      "ITR-4 FAQ",
      "Income Tax portal",
    ]);
  });
});
