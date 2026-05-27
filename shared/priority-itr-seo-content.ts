import type { PRIORITY_ITR_SEARCH_ROUTES } from "./search-engine-readiness";
import type { StaticRouteBodyLink, StaticRouteBodySection } from "./static-seo-content";

type PriorityItrSearchRoute = (typeof PRIORITY_ITR_SEARCH_ROUTES)[number];

export const PRIORITY_ITR_CONTENT_MIN_WORDS = 120;
export const PRIORITY_ITR_CONTENT_MIN_INTERNAL_LINKS = 2;

export type PriorityItrRouteContent = {
  highlights: string[];
  sections: StaticRouteBodySection[];
  links: StaticRouteBodyLink[];
  requiredTerms: string[];
};

export const PRIORITY_ITR_ROUTE_CONTENT = {
  "/": {
    highlights: [
      "AY 2026-27 ITR filing path",
      "Form 16, AIS, and Form 26AS checks",
      "Income tax calculator and CA review options",
    ],
    sections: [
      {
        heading: "AY 2026-27 filing path",
        body:
          "MyeCA helps Indian taxpayers move from income records to the right ITR form for AY 2026-27. The public workflow starts with salary, Form 16, AIS, Form 26AS, deductions, capital gains, and refund-readiness checks before a filing path is selected.",
        items: ["Choose ITR-1, ITR-2, ITR-3, or ITR-4 based on facts", "Compare old and new regimes before submission"],
      },
      {
        heading: "Documents and review signals",
        body:
          "The priority season pages connect calculators, Form 16 extraction, filing checklists, and assisted review. This gives search crawlers and taxpayers a consistent topical path around salary income, TDS, deductions, AIS mismatch, and e-verification.",
        items: ["Review Form 16 against AIS and Form 26AS", "Use calculators as estimates, then verify the return"],
      },
    ],
    links: [
      { label: "Choose your ITR form", href: "/itr/form-selector" },
      { label: "ITR filing for salaried employees", href: "/services/itr-for-salaried" },
      { label: "Income tax calculator AY 2026-27", href: "/calculators/income-tax" },
      { label: "Form 16 parser", href: "/form16-parser" },
      { label: "ITR season hub", href: "/itr-season-2026" },
    ],
    requiredTerms: ["AY 2026-27", "ITR", "Form 16", "AIS"],
  },
  "/blog": {
    highlights: [
      "ITR season explainers",
      "Salary, TDS, AIS, and refund topics",
      "Links from guides to filing tools",
    ],
    sections: [
      {
        heading: "ITR season knowledge hub",
        body:
          "The MyeCA blog groups AY 2026-27 income tax articles around taxpayer questions that usually appear during filing season: when to file, whether to wait for Form 16, how to match TDS, and which form to choose.",
        items: ["Use practical filing examples", "Link back to calculators and form-selection tools"],
      },
      {
        heading: "Evidence-first filing guidance",
        body:
          "Crawler-visible blog summaries should make the topical relationship clear before JavaScript loads. The priority path connects salary records, AIS and Form 26AS checks, tax regime comparison, refund status, and CA review decisions.",
        items: ["Keep official-record checks visible", "Avoid unsupported ranking or guarantee claims"],
      },
    ],
    links: [
      { label: "When will ITR filing start AY 2026-27", href: "/blog/when-will-itr-filing-start-ay-2026-27" },
      { label: "ITR season hub", href: "/itr-season-2026" },
      { label: "Choose your ITR form", href: "/itr/form-selector" },
      { label: "Income tax calculator", href: "/calculators/income-tax" },
    ],
    requiredTerms: ["AY 2026-27", "ITR", "Form 16", "AIS"],
  },
  "/services/itr-for-salaried": {
    highlights: [
      "Salaried ITR filing support",
      "Form 16 and TDS review",
      "Regime comparison before filing",
    ],
    sections: [
      {
        heading: "Salaried ITR review",
        body:
          "This service page supports taxpayers with salary income who need to prepare an AY 2026-27 return using Form 16, AIS, Form 26AS, deductions, bank interest, and refund-bank validation. It explains the filing workflow without promising a guaranteed refund or outcome.",
        items: ["Check Form 16 against salary slips", "Match TDS with AIS and Form 26AS"],
      },
      {
        heading: "When expert review helps",
        body:
          "A CA-assisted path is useful when the taxpayer changed jobs, has multiple Form 16s, receives notice or demand communication, sees AIS mismatch, or needs old-versus-new regime comparison before choosing the final return position.",
        items: ["Multiple employers or arrears", "Mismatch, refund, or deduction questions"],
      },
    ],
    links: [
      { label: "Start with ITR form selection", href: "/itr/form-selector" },
      { label: "Parse Form 16", href: "/form16-parser" },
      { label: "Estimate income tax", href: "/calculators/income-tax" },
      { label: "Salary tax calculator guide", href: "/learn/guide/salary-tax-calculator-guide-ay-2026-27" },
    ],
    requiredTerms: ["salaried", "Form 16", "AY 2026-27", "TDS"],
  },
  "/calculators/income-tax": {
    highlights: [
      "AY 2026-27 income tax estimate",
      "Old versus new regime comparison",
      "Use before selecting the ITR path",
    ],
    sections: [
      {
        heading: "Estimate before filing",
        body:
          "The income tax calculator gives taxpayers a planning estimate for AY 2026-27 before they choose an ITR path. It should be used with Form 16, AIS, Form 26AS, salary components, deductions, other income, and tax paid records.",
        items: ["Compare old and new regimes", "Check rebate, cess, and deduction impact"],
      },
      {
        heading: "Calculator result is not the return",
        body:
          "The final return still needs official-record matching and correct form selection. The calculator page links to the filing selector, salaried ITR service, and salary guide so users can move from estimate to evidence-backed filing.",
        items: ["Keep a copy of the calculation", "Review mismatches before e-verification"],
      },
    ],
    links: [
      { label: "Choose ITR form", href: "/itr/form-selector" },
      { label: "ITR for salaried employees", href: "/services/itr-for-salaried" },
      { label: "Salary tax guide", href: "/learn/guide/salary-tax-calculator-guide-ay-2026-27" },
      { label: "ITR season hub", href: "/itr-season-2026" },
    ],
    requiredTerms: ["income tax", "AY 2026-27", "old", "new regime"],
  },
  "/itr/form-selector": {
    highlights: [
      "ITR-1, ITR-2, ITR-3, and ITR-4 guidance",
      "Salary, capital gains, business, and foreign asset checks",
      "Pre-filing route before assisted review",
    ],
    sections: [
      {
        heading: "Choose the correct ITR form",
        body:
          "The form selector helps taxpayers decide whether a simple salary return is enough or whether facts such as capital gains, business income, foreign assets, multiple properties, or carried-forward losses require another ITR form.",
        items: ["Use ITR-1 only when eligibility fits", "Move to ITR-2 or ITR-3 when facts require it"],
      },
      {
        heading: "Connect form choice to evidence",
        body:
          "Form selection should happen after checking Form 16, AIS, Form 26AS, broker statements, bank interest, and deduction proofs. The page links to calculators and document tools so search crawlers see the full filing topic cluster.",
        items: ["Review income heads before filing", "Ask for CA review when records conflict"],
      },
    ],
    links: [
      { label: "ITR filing for salaried employees", href: "/services/itr-for-salaried" },
      { label: "Income tax calculator", href: "/calculators/income-tax" },
      { label: "Form 16 parser", href: "/form16-parser" },
      { label: "ITR season hub", href: "/itr-season-2026" },
    ],
    requiredTerms: ["ITR-1", "ITR-2", "ITR-3", "Form 16"],
  },
  "/form16-parser": {
    highlights: [
      "Form 16 extraction workflow",
      "Salary, TDS, deductions, and employer details",
      "Pre-fill support before ITR review",
    ],
    sections: [
      {
        heading: "Form 16 to filing inputs",
        body:
          "The Form 16 parser page explains how salary, employer TAN, exemptions, deductions, and TDS fields can be extracted or organized before the taxpayer chooses the AY 2026-27 return path.",
        items: ["Compare extracted salary with payslips", "Match TDS with AIS and Form 26AS"],
      },
      {
        heading: "Use extracted data carefully",
        body:
          "Parsed data should be reviewed before filing because AIS, Form 26AS, bank interest, capital gains, and other income can change the final tax computation. The page links back to calculators and the ITR form selector for the next step.",
        items: ["Do not file from Form 16 alone", "Keep proof for deductions and refund claims"],
      },
    ],
    links: [
      { label: "Choose ITR form", href: "/itr/form-selector" },
      { label: "ITR for salaried employees", href: "/services/itr-for-salaried" },
      { label: "Income tax calculator", href: "/calculators/income-tax" },
      { label: "Salary tax guide", href: "/learn/guide/salary-tax-calculator-guide-ay-2026-27" },
    ],
    requiredTerms: ["Form 16", "TDS", "AY 2026-27", "AIS"],
  },
  "/itr-season-2026": {
    highlights: [
      "AY 2026-27 filing checklist",
      "Form 16, AIS, and refund readiness",
      "Tools and guides for priority ITR queries",
    ],
    sections: [
      {
        heading: "ITR season readiness",
        body:
          "The AY 2026-27 ITR season hub connects the most important pre-filing tasks: collect Form 16, download AIS and Form 26AS, compare tax regimes, identify the correct ITR form, and keep refund-bank validation ready.",
        items: ["Prepare records before utility submission", "Check mismatch risk before filing"],
      },
      {
        heading: "Priority taxpayer journeys",
        body:
          "The hub links salary, capital gains, refund, and mismatch topics to tools that help users act. This strengthens the ITR topic cluster for crawlers while keeping the page useful for taxpayers who need a direct next step.",
        items: ["Move from checklist to calculator", "Move from calculator to filing path"],
      },
    ],
    links: [
      { label: "Choose ITR form", href: "/itr/form-selector" },
      { label: "Parse Form 16", href: "/form16-parser" },
      { label: "Income tax calculator", href: "/calculators/income-tax" },
      { label: "ITR for salaried employees", href: "/services/itr-for-salaried" },
      { label: "When will filing start", href: "/blog/when-will-itr-filing-start-ay-2026-27" },
    ],
    requiredTerms: ["AY 2026-27", "ITR", "Form 16", "AIS"],
  },
} satisfies Partial<Record<PriorityItrSearchRoute, PriorityItrRouteContent>>;
