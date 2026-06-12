import { describe, expect, it } from "vitest";
import type { ItrDocumentChecklistItem } from "@shared/itr-filing";
import { getPanesForStep, type FilingPaneDraft, type FilingStepId } from "./panes";

function draft(overrides: Partial<FilingPaneDraft> = {}): FilingPaneDraft {
  return {
    income: { selectedTypes: [] },
    ...overrides,
  };
}

describe("getPanesForStep", () => {
  it("defines panes for every macro step", () => {
    const steps: FilingStepId[] = [
      "identity",
      "income",
      "documents",
      "verify",
      "compute",
      "review",
    ];

    for (const step of steps) {
      expect(getPanesForStep(step, draft(), [])).not.toHaveLength(0);
    }
  });

  it("derives income panes from selectedTypes without inspecting amount values", () => {
    const panes = getPanesForStep(
      "income",
      draft({
        income: {
          selectedTypes: ["capitalGains", "salary"],
          salary: 0,
          shortTermCapitalGains: 0,
        },
      }),
      [],
    );

    expect(panes.map((pane) => pane.id)).toEqual([
      "income-types",
      "income-capital-gains",
      "income-salary",
      "income-deductions",
      "income-taxes-paid",
      "income-preferences",
    ]);
  });

  it("creates a document pane for every checklist item", () => {
    const checklist: ItrDocumentChecklistItem[] = [
      { id: "form16", title: "Form 16", required: true, reason: "Salary evidence" },
      { id: "deductions", title: "Deduction proofs", required: false, reason: "Optional evidence" },
    ];

    const panes = getPanesForStep("documents", draft(), checklist);

    expect(panes.map((pane) => pane.id)).toEqual([
      "documents-overview",
      "document-form16",
      "document-deductions",
    ]);
    expect(panes[1]).toMatchObject({ document: checklist[0] });
  });
});
