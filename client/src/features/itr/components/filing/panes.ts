import type { ItrDocumentChecklistItem } from "@shared/itr-filing";

export const FILING_STEP_IDS = [
  "identity",
  "income",
  "documents",
  "verify",
  "compute",
  "review",
] as const;

export const INCOME_PANE_TYPES = [
  "salary",
  "otherSources",
  "houseProperty",
  "capitalGains",
  "business",
  "foreign",
] as const;

export type FilingStepId = (typeof FILING_STEP_IDS)[number];
export type IncomePaneType = (typeof INCOME_PANE_TYPES)[number];

export type FilingPaneDraft = {
  income?: {
    selectedTypes?: readonly IncomePaneType[];
    [key: string]: unknown;
  };
};

export type FilingPane = {
  id: string;
  stepId: FilingStepId;
  title: string;
  description: string;
  document?: ItrDocumentChecklistItem;
};

const STATIC_PANES: Record<Exclude<FilingStepId, "income" | "documents">, readonly FilingPane[]> = {
  identity: [
    { id: "identity-name", stepId: "identity", title: "Name and date of birth", description: "Enter the taxpayer's basic identity details." },
    { id: "identity-pan-aadhaar", stepId: "identity", title: "PAN and Aadhaar", description: "Add the identifiers used for income-tax filing." },
    { id: "identity-contact", stepId: "identity", title: "Contact details", description: "Add the mobile number and email used for updates." },
    { id: "identity-bank", stepId: "identity", title: "Refund bank", description: "Add the bank, account holder, and IFSC." },
    { id: "identity-account", stepId: "identity", title: "Account confirmation", description: "Confirm the refund account number and type." },
  ],
  verify: [
    { id: "verify-issues", stepId: "verify", title: "Rule checks", description: "Resolve open issues before review." },
  ],
  compute: [
    { id: "compute-regimes", stepId: "compute", title: "Compare tax regimes", description: "Compare old and new regime outcomes." },
    { id: "compute-liability", stepId: "compute", title: "Tax liability", description: "Review tax paid, payable, or refund." },
  ],
  review: [
    { id: "review-packet", stepId: "review", title: "Review packet", description: "Check the filing summary before CA review." },
  ],
};

const INCOME_PANES: Record<IncomePaneType, FilingPane> = {
  salary: { id: "income-salary", stepId: "income", title: "Salary income", description: "Enter salary and pension totals." },
  otherSources: { id: "income-other-sources", stepId: "income", title: "Other sources", description: "Enter interest, dividend, and other receipts." },
  houseProperty: { id: "income-house-property", stepId: "income", title: "House property", description: "Enter property count and property income." },
  capitalGains: { id: "income-capital-gains", stepId: "income", title: "Capital gains", description: "Enter short-term and long-term capital gains." },
  business: { id: "income-business", stepId: "income", title: "Business or profession", description: "Enter business and professional income." },
  foreign: { id: "income-foreign", stepId: "income", title: "Foreign income", description: "Enter foreign income and disclosure facts." },
};

export function getPanesForStep(
  stepId: FilingStepId,
  draft: FilingPaneDraft,
  documentChecklist: readonly ItrDocumentChecklistItem[] = [],
): FilingPane[] {
  if (stepId === "income") {
    const selectedTypes = draft.income?.selectedTypes ?? [];
    return [
      { id: "income-types", stepId, title: "Income types", description: "Select every income type that applies." },
      ...selectedTypes
        .filter((type): type is IncomePaneType => INCOME_PANE_TYPES.includes(type))
        .map((type) => ({ ...INCOME_PANES[type] })),
      { id: "income-deductions", stepId, title: "Deductions", description: "Enter deductions that apply to the filing." },
      { id: "income-taxes-paid", stepId, title: "Taxes paid", description: "Enter TDS, TCS, and advance tax already paid." },
      { id: "income-preferences", stepId, title: "Regime and special situations", description: "Set the regime preference and review special situations." },
    ];
  }

  if (stepId === "documents") {
    return [
      { id: "documents-overview", stepId, title: "Document checklist", description: "Review required and optional supporting documents." },
      ...documentChecklist.map((document) => ({
        id: `document-${document.id}`,
        stepId,
        title: document.title,
        description: document.reason,
        document: { ...document },
      })),
    ];
  }

  return STATIC_PANES[stepId].map((pane) => ({ ...pane }));
}
