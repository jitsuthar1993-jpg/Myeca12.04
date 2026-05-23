import { describe, expect, it } from "vitest";
import {
  AY_2026_27_ITR_GUIDE,
  ITR_DOCUMENT_CHECKLIST,
  ITR_FILING_LAYOUT,
  ITR_FILING_PATHS,
  ITR_FILING_STEPS,
  buildITRDraftApiPayload,
  canViewITRStatus,
  getUploadableITRDocuments,
  getITRFilingSectionStatuses,
  parseCachedITRDraft,
  recommendITRForAY2026,
} from "./filing.page";

describe("ITR filing workspace", () => {
  it("starts with filing path selection before document upload", () => {
    expect(ITR_FILING_STEPS.map((step) => step.id)).toEqual([
      "filing-path",
      "documents",
    ]);
  });

  it("offers the two filing paths as the entry choice", () => {
    expect(ITR_FILING_PATHS.map((path) => path.id)).toEqual(["self", "ca"]);
    expect(ITR_FILING_PATHS.map((path) => path.title)).toEqual(["File Self ITR", "File ITR by CA"]);
  });

  it("allows status viewing only after document upload and filing path selection", () => {
    expect(canViewITRStatus(false, null)).toBe(false);
    expect(canViewITRStatus(true, null)).toBe(false);
    expect(canViewITRStatus(false, "self")).toBe(false);
    expect(canViewITRStatus(true, "ca")).toBe(true);
  });

  it("shows upload controls only for required upload-worthy filing documents", () => {
    const recommendation = recommendITRForAY2026({
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

    const uploadableIds = getUploadableITRDocuments(recommendation.requiredDocuments, "self").map(
      (document) => document.id,
    );

    expect(uploadableIds).toContain("form16-form16a");
    expect(uploadableIds).toContain("ais-tis");
    expect(uploadableIds).toContain("form26as");
    expect(uploadableIds).toContain("bank-statements");
    expect(uploadableIds).not.toContain("profile-pan");
    expect(uploadableIds).not.toContain("aadhaar-status");
    expect(uploadableIds).not.toContain("bank-refund");
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
    expect(statuses["filing-path"].label).toBe("Pending");
  });

  it("marks updated filing sections with a green status", () => {
    const statuses = getITRFilingSectionStatuses({
      documents: true,
      "filing-path": true,
    });

    expect(statuses.documents).toMatchObject({ tone: "updated", label: "Updated" });
    expect(statuses["filing-path"]).toMatchObject({ tone: "updated", label: "Updated" });
  });

  it("restores a browser draft cache snapshot without throwing on bad cache data", () => {
    expect(parseCachedITRDraft("{bad json")).toBeNull();
    expect(parseCachedITRDraft(JSON.stringify({ selectedFilingPath: "ca", documentFiles: { form16: "form16.pdf" } }))).toMatchObject({
      selectedFilingPath: "ca",
      documentFiles: { form16: "form16.pdf" },
    });
  });

  it("builds a durable API draft payload with uploaded document state", () => {
    const recommendation = recommendITRForAY2026({
      sourceSelections: {
        salary: true,
        capitalGains: false,
        business: false,
        houseProperty: false,
        otherSources: true,
        foreignIncome: false,
      },
      totalIncome: 1_225_000,
      capitalGainsIncome: 0,
      isPresumptiveBusiness: false,
    });
    const uploadableDocuments = getUploadableITRDocuments(recommendation.requiredDocuments, "ca");

    const payload = buildITRDraftApiPayload({
      currentStep: 1,
      sourceSelections: { salary: true, otherSources: true },
      filingFacts: {
        isPresumptiveBusiness: false,
        hasMoreThanTwoHouseProperties: false,
        hasDirectorStatus: false,
        hasUnlistedShares: false,
        hasBroughtForwardLoss: false,
        hasDeferredEsop: false,
      },
      profileDraft: { pan: "ABCDE1234F", aadhaarStatus: "Linked", mobile: "", bankAccount: "", ifsc: "" },
      documentFiles: { "form16-form16a": "form16.pdf" },
      updatedSections: { documents: true },
      selectedFilingPath: "ca",
      salaryIncome: 1_200_000,
      interestIncome: 25_000,
      capitalGainsIncome: 0,
      deductions: 250_000,
      rentAmount: 300_000,
      tdsPaid: 95_000,
      recommendation,
      totalIncome: 1_225_000,
      regime: { newTax: 0, oldTax: 0, better: "New Regime", savings: 0, estimatedPayable: 0 },
      uploadableDocuments,
    });

    expect(payload).toMatchObject({
      assessmentYear: "2026-27",
      filingPath: "ca",
      recommendedForm: "ITR-1",
      workspaceState: {
        currentStep: 1,
        documentFiles: { "form16-form16a": "form16.pdf" },
      },
    });
    expect(payload.documentChecklist).toContainEqual(
      expect.objectContaining({ id: "form16-form16a", uploaded: true, fileName: "form16.pdf" }),
    );
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
