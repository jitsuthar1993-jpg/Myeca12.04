export interface ItrAcquisitionChannel {
  channel: string;
  allocationPercent: number;
  budgetInr: number;
}

export interface ItrAcquisitionAdVariant {
  headline: string;
  description: string;
  path: string;
}

export interface ItrAcquisitionAdGroup {
  name: string;
  intent: string;
  landingPath: string;
  keywords: string[];
  ads: ItrAcquisitionAdVariant[];
}

export const ITR_ACQUISITION_SUPPORTING_ROUTES = [
  "/form16-parser",
  "/calculators/income-tax",
  "/calculators/regime-comparator",
  "/capital-gains-import",
  "/itr-season-2026",
  "/expert-consultation",
] as const;

export const ITR_ACQUISITION_PAID_MEDIA_PLAN = {
  primaryRoute: "/which-itr-form-to-file",
  primaryCta: "Check my ITR scope",
  monthlyBudgetInr: 200000,
  channels: [
    { channel: "Google Search", allocationPercent: 75, budgetInr: 150000 },
    { channel: "Retargeting", allocationPercent: 20, budgetInr: 40000 },
    { channel: "Controlled experiments", allocationPercent: 5, budgetInr: 10000 },
  ] satisfies ItrAcquisitionChannel[],
  scaleControls: [
    "paid CPA below allowable CPA",
    "attribution accuracy above 95%",
    "payment and backend records reconciled",
    "fulfillment capacity above 1.5x forecast demand",
    "SLA breach rate below 5%",
    "refund and cancellation rate below 10%",
  ],
} as const;

export const ITR_ACQUISITION_NEGATIVE_KEYWORDS = [
  "free only",
  "government login",
  "jobs",
  "PDF download",
  "refund guarantee",
  "US tax",
  "non India",
  "GST only",
] as const;

export const ITR_ACQUISITION_AD_GROUPS: ItrAcquisitionAdGroup[] = [
  {
    name: "ITR filing online",
    intent: "Filing-ready individual taxpayer",
    landingPath: "/which-itr-form-to-file",
    keywords: ["itr filing online", "file itr online", "income tax return filing online"],
    ads: [
      {
        headline: "File AY 2026-27 ITR With Scope Clarity",
        description: "Start with a guided ITR scope check, clear pricing, and optional CA-assisted review.",
        path: "/which-itr-form-to-file",
      },
      {
        headline: "Check Your ITR Filing Path",
        description: "Answer a few filing facts and see whether your return needs guided filing or CA review.",
        path: "/which-itr-form-to-file",
      },
      {
        headline: "ITR Filing With Document Checks",
        description: "Use MyeCA to review Form 16, AIS, and filing scope before you pay.",
        path: "/which-itr-form-to-file",
      },
    ],
  },
  {
    name: "CA assisted ITR filing",
    intent: "User wants expert review before filing",
    landingPath: "/which-itr-form-to-file",
    keywords: ["ca assisted itr filing", "ca assisted income tax filing", "expert itr filing"],
    ads: [
      {
        headline: "CA-Assisted ITR Review Where Needed",
        description: "Get a scoped review path for deductions, AIS mismatch, notices, and complex income.",
        path: "/which-itr-form-to-file",
      },
      {
        headline: "Know Your ITR Scope Before Payment",
        description: "MyeCA shows the filing path and review need before you move into paid filing.",
        path: "/which-itr-form-to-file",
      },
      {
        headline: "Expert Review For ITR Cases",
        description: "Use guided filing for simple returns and request expert review for complex facts.",
        path: "/expert-consultation",
      },
    ],
  },
  {
    name: "file ITR with Form 16",
    intent: "Salary user preparing from Form 16",
    landingPath: "/form16-parser",
    keywords: ["file itr with form 16", "form 16 itr filing", "form 16 parser itr"],
    ads: [
      {
        headline: "Turn Form 16 Into ITR Inputs",
        description: "Parse salary and TDS fields, then continue to a scoped AY 2026-27 filing path.",
        path: "/form16-parser",
      },
      {
        headline: "Review Form 16 Before Filing",
        description: "Check salary, deductions, and TDS against your records before starting ITR filing.",
        path: "/form16-parser",
      },
      {
        headline: "Salary ITR Filing From Form 16",
        description: "Use Form 16, AIS, and Form 26AS checks before choosing your ITR form.",
        path: "/form16-parser",
      },
    ],
  },
  {
    name: "AIS mismatch ITR",
    intent: "User has AIS, TIS, or Form 26AS mismatch risk",
    landingPath: "/itr-season-2026/ais-form-26as-mismatch-checklist",
    keywords: ["ais mismatch itr", "form 26as mismatch itr", "tds mismatch itr filing"],
    ads: [
      {
        headline: "Fix AIS Mismatch Before ITR",
        description: "Use a checklist to compare AIS, TIS, Form 26AS, and source records before filing.",
        path: "/itr-season-2026/ais-form-26as-mismatch-checklist",
      },
      {
        headline: "TDS Credit Mismatch Review",
        description: "Organize mismatch evidence and choose whether your return needs expert review.",
        path: "/itr-season-2026/ais-form-26as-mismatch-checklist",
      },
      {
        headline: "Check AIS Before Refund Filing",
        description: "Avoid filing from incomplete records. Match income and TDS before submitting ITR.",
        path: "/itr-season-2026/ais-form-26as-mismatch-checklist",
      },
    ],
  },
  {
    name: "capital gains ITR",
    intent: "Investor with broker statement, equity, MF, F&O, or VDA activity",
    landingPath: "/capital-gains-import",
    keywords: ["capital gains itr", "itr for capital gains", "broker statement itr filing"],
    ads: [
      {
        headline: "Capital Gains ITR Scope Check",
        description: "Prepare broker records and understand whether ITR-2, ITR-3, or CA review fits.",
        path: "/capital-gains-import",
      },
      {
        headline: "Import Broker Statement For ITR",
        description: "Organize gains, losses, and schedules before starting your AY 2026-27 return.",
        path: "/capital-gains-import",
      },
      {
        headline: "Investor ITR Filing Support",
        description: "Use capital-gains tools and request expert review for F&O, VDA, or foreign broker facts.",
        path: "/capital-gains-import",
      },
    ],
  },
  {
    name: "ITR-2 filing",
    intent: "Capital gains, multiple properties, or foreign disclosure searcher",
    landingPath: "/which-itr-form-to-file",
    keywords: ["itr 2 filing", "itr-2 online filing", "who should file itr 2"],
    ads: [
      {
        headline: "Check If ITR-2 Applies",
        description: "Answer filing facts for AY 2026-27 and see whether ITR-2 or review is needed.",
        path: "/which-itr-form-to-file",
      },
      {
        headline: "ITR-2 Filing Scope Before Payment",
        description: "Use MyeCA to map capital gains, house property, and disclosure facts before filing.",
        path: "/which-itr-form-to-file",
      },
      {
        headline: "ITR-2 Support For Investors",
        description: "Prepare broker and AIS records before moving into your filing workflow.",
        path: "/capital-gains-import",
      },
    ],
  },
  {
    name: "ITR-3 filing",
    intent: "Business, profession, F&O, or freelancer searcher",
    landingPath: "/which-itr-form-to-file",
    keywords: ["itr 3 filing", "itr-3 online filing", "fno itr 3 filing"],
    ads: [
      {
        headline: "Check If ITR-3 Applies",
        description: "Map business, profession, F&O, and loss facts before choosing the filing route.",
        path: "/which-itr-form-to-file",
      },
      {
        headline: "ITR-3 Scope Review For AY 2026-27",
        description: "Use a scope-first workflow for business income, trading, and professional receipts.",
        path: "/expert-consultation",
      },
      {
        headline: "Freelancer And F&O ITR Support",
        description: "Organize income, TDS, and capital-gains facts before paid filing starts.",
        path: "/which-itr-form-to-file",
      },
    ],
  },
  {
    name: "NRI ITR filing",
    intent: "NRI or foreign-income taxpayer",
    landingPath: "/which-itr-form-to-file",
    keywords: ["nri itr filing", "nri income tax return filing", "foreign assets itr filing"],
    ads: [
      {
        headline: "NRI ITR Scope Check",
        description: "Review residential status, India income, DTAA, and foreign-asset flags before filing.",
        path: "/which-itr-form-to-file",
      },
      {
        headline: "NRI Tax Filing Review",
        description: "Start with a safe scope check before sharing documents or paying for filing.",
        path: "/expert-consultation",
      },
      {
        headline: "Foreign Income ITR Support",
        description: "Use MyeCA for a scoped review path for NRI and foreign disclosure cases.",
        path: "/which-itr-form-to-file",
      },
    ],
  },
];

export function buildItrCampaignUrl(path: string, source: string, medium: string, content: string) {
  const params = new URLSearchParams({
    utm_campaign: "itr-season-2026",
    utm_source: source,
    utm_medium: medium,
    utm_content: content,
  });
  return `${path}?${params.toString()}`;
}
