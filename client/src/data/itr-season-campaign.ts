export interface SeasonGuideLink {
  label: string;
  href: string;
}

export interface ItrSeasonGuide {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  audience: string;
  purpose: string;
  icon: "search" | "form" | "gains" | "calendar";
  coverImage: string;
  checklist: string[];
  toolLink: SeasonGuideLink;
  conversionLink: SeasonGuideLink;
  relatedBlogLink: SeasonGuideLink;
  learnGuideLink: SeasonGuideLink;
  reviewNote: string;
  disclaimer: string;
  sourceLinks: SeasonGuideLink[];
}

export const ITR_SEASON_HUB_BASE = "/itr-season-2026";

const commonReviewNote =
  "Updated for FY 2025-26 / AY 2026-27 ITR season. Re-check the Income Tax e-Filing portal before filing because utilities, forms, and portal messages can change during the season.";

const commonDisclaimer =
  "This resource is for educational awareness only. It is not a tax opinion, refund assurance, or substitute for case-specific CA review.";

const officialSources = {
  efilingPortal: { label: "Income Tax e-Filing portal", href: "https://www.incometax.gov.in/iec/foportal" },
  aisFaq: { label: "AIS official FAQ", href: "https://www.incometax.gov.in/iec/foportal/ais-faq" },
  form16: { label: "Form 16 official page", href: "https://www.incometax.gov.in/iec/foportal/newformpage/form16" },
  salariedItr: {
    label: "Salaried individuals AY 2026-27",
    href: "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1?Id=292",
  },
  itrReturns: {
    label: "Income tax returns help",
    href: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/income-tax-returns",
  },
  itrStatus: {
    label: "Know ITR status FAQ",
    href: "https://www.incometax.gov.in/iec/foportal/help/e-filing-know-itr-status-faq",
  },
  eVerify: {
    label: "How to e-Verify FAQ",
    href: "https://www.incometax.gov.in/iec/foportal/help/e-filing-e-verify-your-return-faq",
  },
} satisfies Record<string, SeasonGuideLink>;

export const itrSeasonGuides: ItrSeasonGuide[] = [
  {
    slug: "ais-form-26as-mismatch-checklist",
    title: "AIS and Form 26AS Mismatch Checklist for AY 2026-27",
    shortTitle: "AIS mismatch checklist",
    eyebrow: "Data reconciliation",
    description:
      "A practical checklist for matching AIS, TIS, Form 26AS, bank credits, salary TDS, and return values before filing.",
    audience: "For you if your AIS, TIS, or Form 26AS entries do not match your salary, bank, broker, or TDS records.",
    purpose: "Decide which entries to verify, what evidence to keep, and when a mismatch needs review before you file.",
    icon: "search",
    coverImage: "/assets/blog/text-covers/handle-ais-mismatch-before-after-itr.svg",
    checklist: [
      "Download the latest AIS, TIS, and Form 26AS before final computation.",
      "Match salary, interest, dividend, rent, and broker income against bank and payroll records.",
      "Flag entries with wrong PAN, wrong amount, duplicate reporting, or missing TDS.",
      "Keep evidence for feedback submitted on the income-tax portal.",
      "Use expert review before filing when the mismatch affects refund, demand, or notice risk.",
    ],
    toolLink: { label: "Check filing path", href: "/itr/form-selector" },
    conversionLink: { label: "Request AIS review", href: "/expert-consultation?service=tax-consultation" },
    relatedBlogLink: { label: "Read AIS mismatch guide", href: "/blog/handle-ais-mismatch-before-after-itr" },
    learnGuideLink: { label: "See salaried ITR guide", href: "/learn/guide/complete-itr-guide-salaried" },
    reviewNote: commonReviewNote,
    disclaimer: commonDisclaimer,
    sourceLinks: [officialSources.aisFaq, officialSources.efilingPortal, officialSources.itrReturns],
  },
  {
    slug: "form-16-parser-guide",
    title: "Form 16 Parser Workflow for Faster ITR Pre-Filing",
    shortTitle: "Form 16 parser workflow",
    eyebrow: "Salary filing workflow",
    description:
      "A step-by-step workflow for extracting salary, TDS, deductions, and employer details from Form 16 before ITR filing.",
    audience: "For you if you file ITR-1 or ITR-2 from a Form 16, including a year with a job switch and two employers.",
    purpose: "Turn your Form 16 into checked salary, TDS, and deduction figures before you start the return.",
    icon: "form",
    coverImage: "/assets/blog/text-covers/mye-ca-complete-tax-filing-playbook.svg",
    checklist: [
      "Confirm assessment year, employer TAN, salary breakup, TDS, and tax regime declaration.",
      "Parse Form 16 and compare extracted salary against payslips and AIS entries.",
      "Check standard deduction, HRA, Chapter VI-A deductions, and professional tax fields.",
      "Export or copy the parser notes before moving into the filing workflow.",
      "Ask for expert review when there are two Form 16s, arrears, or missing TDS entries.",
    ],
    toolLink: { label: "Open Form 16 parser", href: "/form16-parser" },
    conversionLink: { label: "Start ITR filing", href: "/which-itr-form-to-file?source=itr_season_form16_workflow" },
    relatedBlogLink: { label: "Read filing playbook", href: "/blog/mye-ca-complete-tax-filing-playbook" },
    learnGuideLink: { label: "See Form 16 steps", href: "/learn/guide/complete-itr-guide-salaried" },
    reviewNote: commonReviewNote,
    disclaimer: commonDisclaimer,
    sourceLinks: [officialSources.form16, officialSources.salariedItr, officialSources.efilingPortal],
  },
  {
    slug: "capital-gains-broker-statement-checklist",
    title: "Capital Gains Broker Statement Checklist for ITR-2 and ITR-3",
    shortTitle: "Broker statement checklist",
    eyebrow: "Investor filing",
    description:
      "A broker-statement checklist for organizing equity, mutual fund, intraday, F&O, and VDA records before ITR filing.",
    audience: "For you if you sold equity, mutual funds, F&O, VDAs, or ESOP/RSU shares and your case lands in ITR-2 or ITR-3.",
    purpose: "Organize broker statements into clean capital-gains inputs before you compute the return or hand it to a CA.",
    icon: "gains",
    coverImage: "/assets/blog/text-covers/which-itr-form-salary-plus-capital-gains-ay-2026-27.svg",
    checklist: [
      "Collect broker tax P&L, tradebook, contract notes, mutual fund statements, and AIS capital-gains entries.",
      "Separate equity delivery, mutual funds, intraday, F&O, VDA, and foreign broker activity.",
      "Check acquisition dates, cost, sale value, STT, expenses, and grandfathering fields where relevant.",
      "Map the case to ITR-2 or ITR-3 before starting the return.",
      "Use CA review when there is F&O loss, foreign stock, unlisted shares, or large set-off questions.",
    ],
    toolLink: { label: "Import broker statement", href: "/capital-gains-import" },
    conversionLink: { label: "Request capital gains review", href: "/expert-consultation?service=capital-gains" },
    relatedBlogLink: { label: "Read ITR form guide", href: "/blog/which-itr-form-salary-plus-capital-gains-ay-2026-27" },
    learnGuideLink: { label: "See capital gains guide", href: "/learn/guide/stock-capital-gains-tax" },
    reviewNote: commonReviewNote,
    disclaimer: commonDisclaimer,
    sourceLinks: [officialSources.salariedItr, officialSources.itrReturns, officialSources.aisFaq],
  },
  {
    slug: "itr-deadline-refund-status-tracker",
    title: "AY 2026-27 ITR Deadline and Refund Status Tracker",
    shortTitle: "Deadline and refund tracker",
    eyebrow: "Filing operations",
    description:
      "A tracker-style guide for moving from Form 16 readiness to ITR submission, e-verification, refund follow-up, and notice monitoring.",
    audience: "For you if you want to know when filing opens, what happens after you submit, and where your refund is.",
    purpose: "Follow your return from Form 16 readiness through submission, e-verification, refund, and any follow-up notice.",
    icon: "calendar",
    coverImage: "/assets/blog/text-covers/when-will-itr-filing-start-ay-2026-27.svg",
    checklist: [
      "Confirm Form 16, AIS, Form 26AS, bank validation, and deduction proofs before filing.",
      "Track filing status: draft return, submitted return, e-verified return, processed return, refund or demand.",
      "Save the acknowledgment number and e-verification confirmation.",
      "Check refund status only after processing starts and bank validation is complete.",
      "Use expert review for defective return notices, demand notices, or revised return decisions.",
    ],
    toolLink: { label: "Track refund context", href: "/tds-refund-tracker" },
    conversionLink: { label: "Start filing path", href: "/which-itr-form-to-file?source=itr_season_deadline_tracker" },
    relatedBlogLink: { label: "Read filing start guide", href: "/blog/when-will-itr-filing-start-ay-2026-27" },
    learnGuideLink: { label: "See deadline guide", href: "/learn/guide/important-tax-deadlines" },
    reviewNote: commonReviewNote,
    disclaimer: commonDisclaimer,
    sourceLinks: [officialSources.itrStatus, officialSources.eVerify, officialSources.efilingPortal],
  },
];

export function getItrSeasonGuide(slug: string) {
  return itrSeasonGuides.find((guide) => guide.slug === slug);
}
