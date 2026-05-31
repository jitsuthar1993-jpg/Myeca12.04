import { describe, expect, it } from "vitest";
import { ITR_FILING_LAYOUT, ITR_FILING_STEPS, WORKSPACE_ITR_REVIEW_STATUSES } from "./filing.page";

describe("ITR filing workspace", () => {
  it("follows the signed-in draft-to-CA-review filing sequence", () => {
    expect(ITR_FILING_STEPS.map((step) => step.id)).toEqual([
      "profile",
      "income-sources",
      "documents",
      "income-details",
      "deductions",
      "tax-paid",
      "form-selection",
      "ca-review",
      "e-verify",
    ]);
  });

  it("surfaces the full CA review status lifecycle", () => {
    expect(WORKSPACE_ITR_REVIEW_STATUSES).toEqual([
      "draft",
      "ready_for_review",
      "ca_review",
      "changes_requested",
      "approved_for_filing",
      "filed",
      "e_verified",
      "refund_or_demand_tracking",
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
