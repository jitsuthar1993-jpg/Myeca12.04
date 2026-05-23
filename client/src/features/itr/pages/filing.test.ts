import { describe, expect, it } from "vitest";
import {
  AY_2026_27_ITR_GUIDE,
  ITR_DOCUMENT_CHECKLIST,
  ITR_FILING_LAYOUT,
  ITR_FILING_STEPS,
  getITRFilingSectionStatuses,
  recommendITRForAY2026,
} from "./filing.page";

describe("ITR filing workspace", () => {
  it("follows the signed-in guided filing sequence from documents to e-verification", () => {
    expect(ITR_FILING_STEPS.map((step) => step.id)).toEqual([
      "sources",
      "profile",
      "documents",
      "income",
      "deductions",
      "tax-paid",
      "review",
      "e-verify",
    ]);
  });

  it("asks for the core documents needed before filing an ITR", () => {
    expect(ITR_DOCUMENT_CHECKLIST.map((document) => document.id)).toEqual([
      "form16",
      "ais",
      "form26as",
      "bank",
      "deductions",
      "capital-gains",
    ]);
  });

  it("keeps filing progress in the main workspace instead of a separate left rail", () => {
    expect(ITR_FILING_LAYOUT).toEqual({
      usesDedicatedLeftRail: false,
      usesAuthenticatedWorkspaceShell: true,
      tone: "professional",
    });
  });

  it("keeps filing sections pending until the user updates that section", () => {
    const statuses = getITRFilingSectionStatuses();

    expect(Object.values(statuses).every((section) => section.tone === "pending")).toBe(true);
    expect(statuses.profile.label).toBe("Pending");
  });

  it("marks updated filing sections with a green status", () => {
    const statuses = getITRFilingSectionStatuses({
      sources: true,
      profile: true,
      documents: true,
    });

    expect(statuses.sources).toMatchObject({ tone: "updated", label: "Updated" });
    expect(statuses.profile).toMatchObject({ tone: "updated", label: "Updated" });
    expect(statuses.documents).toMatchObject({ tone: "updated", label: "Updated" });
    expect(statuses.income).toMatchObject({ tone: "pending", label: "Pending" });
  });

  it("documents the common and conditional AY 2026-27 filing records", () => {
    expect(AY_2026_27_ITR_GUIDE.commonDocuments.map((document) => document.id)).toEqual([
      "profile-pan",
      "aadhaar-status",
      "bank-refund",
      "form16-form16a",
      "ais-tis",
      "form26as",
      "bank-statements",
      "tax-challans",
    ]);

    expect(AY_2026_27_ITR_GUIDE.conditionalDocuments.map((document) => document.id)).toContain(
      "capital-gains-reports",
    );
    expect(AY_2026_27_ITR_GUIDE.conditionalDocuments.map((document) => document.id)).toContain(
      "business-books",
    );
    expect(AY_2026_27_ITR_GUIDE.conditionalDocuments.map((document) => document.id)).toContain(
      "foreign-assets-ftc",
    );
  });

  it("lists the compulsory sections every guided return must pass through", () => {
    expect(AY_2026_27_ITR_GUIDE.compulsorySections.map((section) => section.id)).toEqual([
      "personal-info",
      "filing-status",
      "income-details",
      "deductions-regime",
      "taxes-paid",
      "bank-refund",
      "verification",
    ]);
  });

  it("recommends ITR-1 for a simple eligible salary and other-sources profile", () => {
    const result = recommendITRForAY2026({
      sourceSelections: {
        salary: true,
        capitalGains: false,
        business: false,
        houseProperty: true,
        otherSources: true,
        foreignIncome: false,
      },
      totalIncome: 1_225_000,
      capitalGainsIncome: 0,
      isPresumptiveBusiness: false,
    });

    expect(result.recommendedForm).toBe("ITR-1");
    expect(result.requiredDocuments.map((document) => document.id)).toContain("form16-form16a");
    expect(result.compulsorySections.map((section) => section.id)).toContain("schedule-salary");
  });

  it("recommends ITR-2 when capital gains or higher-complexity non-business facts apply", () => {
    const result = recommendITRForAY2026({
      sourceSelections: {
        salary: true,
        capitalGains: true,
        business: false,
        houseProperty: false,
        otherSources: true,
        foreignIncome: false,
      },
      totalIncome: 5_800_000,
      capitalGainsIncome: 180_000,
      isPresumptiveBusiness: false,
    });

    expect(result.recommendedForm).toBe("ITR-2");
    expect(result.blockedForms).toContainEqual(
      expect.objectContaining({ form: "ITR-1", reason: expect.stringContaining("capital gains") }),
    );
    expect(result.compulsorySections.map((section) => section.id)).toContain("schedule-capital-gains");
  });

  it("recommends ITR-3 for non-presumptive business or profession income", () => {
    const result = recommendITRForAY2026({
      sourceSelections: {
        salary: false,
        capitalGains: false,
        business: true,
        houseProperty: false,
        otherSources: true,
        foreignIncome: false,
      },
      totalIncome: 3_200_000,
      capitalGainsIncome: 0,
      isPresumptiveBusiness: false,
    });

    expect(result.recommendedForm).toBe("ITR-3");
    expect(result.requiredDocuments.map((document) => document.id)).toContain("business-books");
    expect(result.nextSteps.join(" ")).toContain("business");
  });

  it("recommends ITR-4 for eligible presumptive business or profession income", () => {
    const result = recommendITRForAY2026({
      sourceSelections: {
        salary: false,
        capitalGains: false,
        business: true,
        houseProperty: false,
        otherSources: true,
        foreignIncome: false,
      },
      totalIncome: 2_400_000,
      capitalGainsIncome: 0,
      isPresumptiveBusiness: true,
    });

    expect(result.recommendedForm).toBe("ITR-4");
    expect(result.requiredDocuments.map((document) => document.id)).toContain("presumptive-turnover");
    expect(result.compulsorySections.map((section) => section.id)).toContain("schedule-presumptive");
  });
});
