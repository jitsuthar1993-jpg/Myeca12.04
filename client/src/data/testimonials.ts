export interface FilingSituation {
  id: string;
  title: string;
  profile: string;
  documents: string[];
  checks: string[];
  nextStep: string;
  href: string;
}

export const filingSituations: FilingSituation[] = [
  {
    id: "dual-form-16",
    title: "Two Form 16s after a job switch",
    profile: "Salaried ITR-1 or ITR-2 filer",
    documents: ["Both Form 16s", "AIS / Form 26AS", "Bank interest and deduction proofs"],
    checks: ["Salary overlap or missing months", "TDS credit visibility", "Old vs new regime fit"],
    nextStep: "Start ITR",
    href: "/itr/form-selector",
  },
  {
    id: "capital-gains",
    title: "Capital gains from broker reports",
    profile: "Investor with equity, mutual fund, ESOP, crypto, or property sale facts",
    documents: ["Broker capital gains report", "AIS capital gains entries", "Purchase and sale records"],
    checks: ["STCG / LTCG split", "AIS mismatch risk", "Loss carry-forward treatment"],
    nextStep: "Request scope review",
    href: "/capital-gains-import",
  },
  {
    id: "nri-tax",
    title: "NRI income and Indian TDS",
    profile: "Resident status, Indian income, or refund question",
    documents: ["Residency days summary", "Indian income proofs", "TDS and bank details"],
    checks: ["Residential status facts", "DTAA or foreign income flags", "Refund and notice exposure"],
    nextStep: "Request scope review",
    href: "/expert-consultation?service=nri-tax",
  },
  {
    id: "tax-notice",
    title: "Income-tax notice response",
    profile: "Mismatch, demand, defective return, or compliance notice",
    documents: ["Notice PDF or DIN", "Filed return copy", "Evidence for disputed income or deduction"],
    checks: ["Response deadline", "Reason for mismatch", "Documents needed before portal reply"],
    nextStep: "View service",
    href: "/services/notice-compliance",
  },
  {
    id: "business-gst",
    title: "Business GST or TDS cleanup",
    profile: "Founder, proprietor, or finance team with recurring filings",
    documents: ["Sales and purchase registers", "GST or TDS challans", "Last filed return status"],
    checks: ["Period-wise gaps", "ITC or challan matching", "Next filing deadline"],
    nextStep: "Request scope review",
    href: "/contact",
  },
];
