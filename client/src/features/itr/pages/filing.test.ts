import { describe, expect, it } from "vitest";
import { ITR_DOCUMENT_CHECKLIST, ITR_FILING_LAYOUT, ITR_FILING_STEPS } from "./filing.page";

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
      mobileActionBarOffset: "above-user-bottom-nav",
      tone: "professional",
    });
  });
});
