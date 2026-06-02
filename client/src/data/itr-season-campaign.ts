export interface CampaignLink {
  label: string;
  href: string;
}

export interface ItrSeasonCampaignAsset {
  slug: string;
  title: string;
  shortTitle: string;
  eyebrow: string;
  description: string;
  audience: string;
  intent: string;
  icon: "search" | "form" | "gains" | "calendar";
  coverImage: string;
  checklist: string[];
  outreachAngles: string[];
  toolLink: CampaignLink;
  conversionLink: CampaignLink;
  relatedBlogLink: CampaignLink;
  learnGuideLink: CampaignLink;
  reviewNote: string;
  disclaimer: string;
  sourceLinks: CampaignLink[];
}

export const ITR_SEASON_CAMPAIGN_BASE = "/itr-season-2026";

export const campaignUtmMediums = ["pr", "community", "partner", "newsletter", "outreach"] as const;

export type CampaignUtmMedium = (typeof campaignUtmMediums)[number];

export function buildCampaignUrl(path: string, medium: CampaignUtmMedium, content: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}utm_campaign=itr-season-2026&utm_medium=${medium}&utm_content=${content}`;
}

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
} satisfies Record<string, CampaignLink>;

export const itrSeasonCampaignAssets: ItrSeasonCampaignAsset[] = [
  {
    slug: "ais-form-26as-mismatch-checklist",
    title: "AIS and Form 26AS Mismatch Checklist for AY 2026-27",
    shortTitle: "AIS mismatch checklist",
    eyebrow: "Data reconciliation",
    description:
      "A practical checklist for matching AIS, TIS, Form 26AS, bank credits, salary TDS, and return values before filing.",
    audience: "Salaried taxpayers, investors, refund claimants, and anyone with mismatched income or TDS data.",
    intent: "Help users decide what to verify before filing or requesting expert review.",
    icon: "search",
    coverImage: "/assets/blog/text-covers/handle-ais-mismatch-before-after-itr.svg",
    checklist: [
      "Download the latest AIS, TIS, and Form 26AS before final computation.",
      "Match salary, interest, dividend, rent, and broker income against bank and payroll records.",
      "Flag entries with wrong PAN, wrong amount, duplicate reporting, or missing TDS.",
      "Keep evidence for feedback submitted on the income-tax portal.",
      "Use expert review before filing when the mismatch affects refund, demand, or notice risk.",
    ],
    outreachAngles: [
      "Offer this as an HR/payroll pre-filing checklist for employees.",
      "Pitch it to personal finance newsletters during AIS update periods.",
      "Use it in community replies where users ask why their refund or TDS does not match.",
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
    audience: "Salary earners, job switchers, HR teams, and users preparing ITR-1 or ITR-2.",
    intent: "Move users from document preparation into a guided filing or CA review workflow.",
    icon: "form",
    coverImage: "/assets/blog/text-covers/mye-ca-complete-tax-filing-playbook.svg",
    checklist: [
      "Confirm assessment year, employer TAN, salary breakup, TDS, and tax regime declaration.",
      "Parse Form 16 and compare extracted salary against payslips and AIS entries.",
      "Check standard deduction, HRA, Chapter VI-A deductions, and professional tax fields.",
      "Export or copy the parser notes before moving into the filing workflow.",
      "Ask for expert review when there are two Form 16s, arrears, or missing TDS entries.",
    ],
    outreachAngles: [
      "Pitch as a free utility for salary filing explainers.",
      "Offer HR teams a neutral pre-filing document checklist for employees.",
      "Use short demos in LinkedIn and community posts around Form 16 release windows.",
    ],
    toolLink: { label: "Open Form 16 parser", href: "/form16-parser" },
    conversionLink: { label: "Start ITR filing", href: "/itr/start?source=itr_season_form16_workflow" },
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
    audience: "Investors, traders, startup employees with ESOP/RSU questions, and capital-gains filers.",
    intent: "Help document-heavy users prepare clean inputs before capital-gains computation or CA review.",
    icon: "gains",
    coverImage: "/assets/blog/text-covers/which-itr-form-salary-plus-capital-gains-ay-2026-27.svg",
    checklist: [
      "Collect broker tax P&L, tradebook, contract notes, mutual fund statements, and AIS capital-gains entries.",
      "Separate equity delivery, mutual funds, intraday, F&O, VDA, and foreign broker activity.",
      "Check acquisition dates, cost, sale value, STT, expenses, and grandfathering fields where relevant.",
      "Map the case to ITR-2 or ITR-3 before starting the return.",
      "Use CA review when there is F&O loss, foreign stock, unlisted shares, or large set-off questions.",
    ],
    outreachAngles: [
      "Pitch to investor communities as a practical pre-filing record checklist.",
      "Offer finance creators a quote on common broker-statement mistakes.",
      "Use resource-page outreach around capital-gains and ITR-2 filing guides.",
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
    audience: "Taxpayers tracking filing start dates, refund status, revised returns, or post-filing notices.",
    intent: "Connect awareness traffic to filing readiness, refund tracking, and expert consultation.",
    icon: "calendar",
    coverImage: "/assets/blog/text-covers/when-will-itr-filing-start-ay-2026-27.svg",
    checklist: [
      "Confirm Form 16, AIS, Form 26AS, bank validation, and deduction proofs before filing.",
      "Track filing status: draft return, submitted return, e-verified return, processed return, refund or demand.",
      "Save the acknowledgment number and e-verification confirmation.",
      "Check refund status only after processing starts and bank validation is complete.",
      "Use expert review for defective return notices, demand notices, or revised return decisions.",
    ],
    outreachAngles: [
      "Pitch as a seasonal reference for ITR filing start and refund-status stories.",
      "Share with HR/payroll newsletters as an employee filing timeline.",
      "Use it as a linkable resource in communities asking when refunds will arrive.",
    ],
    toolLink: { label: "Track refund context", href: "/tds-refund-tracker" },
    conversionLink: { label: "Start filing path", href: "/itr/start?source=itr_season_deadline_tracker" },
    relatedBlogLink: { label: "Read filing start guide", href: "/blog/when-will-itr-filing-start-ay-2026-27" },
    learnGuideLink: { label: "See deadline guide", href: "/learn/guide/important-tax-deadlines" },
    reviewNote: commonReviewNote,
    disclaimer: commonDisclaimer,
    sourceLinks: [officialSources.itrStatus, officialSources.eVerify, officialSources.efilingPortal],
  },
];

export function getItrSeasonAsset(slug: string) {
  return itrSeasonCampaignAssets.find((asset) => asset.slug === slug);
}

export function getItrSeasonCampaignRoutes() {
  return [ITR_SEASON_CAMPAIGN_BASE, ...itrSeasonCampaignAssets.map((asset) => `${ITR_SEASON_CAMPAIGN_BASE}/${asset.slug}`)];
}
