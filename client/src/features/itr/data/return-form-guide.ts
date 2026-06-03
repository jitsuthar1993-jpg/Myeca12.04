export const incomeTaxReturnsFaqUrl =
  "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/%20income%20tax%20returns-faq";
export const itr1FaqUrl =
  "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/file-itr-1-sahaj-online";
export const itr4FaqUrl =
  "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/file-itr-4-sugam-online";
export const incomeTaxPortalUrl = "https://www.incometax.gov.in/iec/foportal/";

export const itrReturnFormSourceLinks = [
  { label: "Income Tax Returns FAQ", href: incomeTaxReturnsFaqUrl },
  { label: "ITR-1 FAQ", href: itr1FaqUrl },
  { label: "ITR-4 FAQ", href: itr4FaqUrl },
  { label: "Income Tax portal", href: incomeTaxPortalUrl },
] as const;

export const ITR_RETURN_FORM_IDS = [
  "ITR-1",
  "ITR-2",
  "ITR-3",
  "ITR-4",
  "ITR-5",
  "ITR-6",
  "ITR-7",
  "ITR-U",
] as const;

export type ItrReturnFormId = (typeof ITR_RETURN_FORM_IDS)[number];
export type ItrReturnFormCtaCategory = "individual-selector" | "ca-review" | "official-only";

export type ItrReturnFormGuide = {
  id: ItrReturnFormId;
  title: string;
  shortLabel: string;
  summary: string;
  appliesTo: string[];
  notFor: string[];
  incomeSources: string[];
  keySchedules: string[];
  typicalDocuments: string[];
  deadlineNote: string;
  lateFilingNote: string;
  ctaCategory: ItrReturnFormCtaCategory;
  sourceLinks: typeof itrReturnFormSourceLinks[number][];
};

const commonLateFee =
  "For AY 2026-27, the official FAQ states that a belated return may be filed on or before 31 December 2026, or before assessment completion if earlier. Sec. 234F late-filing fee can be Rs 1,000 where total income does not exceed Rs 5 lakh and Rs 5,000 in other cases, with interest where tax is payable.";

export const itrReturnFormGuide: ItrReturnFormGuide[] = [
  {
    id: "ITR-1",
    title: "ITR-1 (Sahaj)",
    shortLabel: "Simple resident individual",
    summary: "For resident individuals with eligible salary or pension, limited house property, other-source income, and simple eligible Section 112A gains.",
    appliesTo: [
      "Resident individual taxpayer",
      "Total income up to Rs 50 lakh",
      "Salary, pension, up to two house properties, interest, dividend, family pension, and agricultural income up to Rs 5,000",
      "Long-term capital gain under Section 112A up to Rs 1.25 lakh",
    ],
    notFor: [
      "RNOR or NRI taxpayers",
      "Business or profession income",
      "Short-term capital gains or Section 112A gains above Rs 1.25 lakh",
      "Foreign assets, foreign income, company directors, unlisted equity, ESOP deferral, special-rate income, or carry-forward losses",
    ],
    incomeSources: ["Salary or pension", "House property", "Other sources", "Eligible Section 112A LTCG"],
    keySchedules: ["Salary", "House Property", "Other Sources", "Exempt Income", "Deductions", "Tax Paid"],
    typicalDocuments: ["Form 16", "AIS and TIS", "Form 26AS", "Bank interest certificates", "Rent or home-loan interest proof", "Deduction proofs"],
    deadlineNote: "For AY 2026-27, use the live Income Tax portal due date for non-audit individual returns before submission.",
    lateFilingNote: commonLateFee,
    ctaCategory: "individual-selector",
    sourceLinks: [itrReturnFormSourceLinks[0], itrReturnFormSourceLinks[1], itrReturnFormSourceLinks[3]],
  },
  {
    id: "ITR-2",
    title: "ITR-2",
    shortLabel: "Individual or HUF without business income",
    summary: "For individuals and HUFs without business or profession income when facts are beyond ITR-1.",
    appliesTo: [
      "Individual or HUF taxpayers",
      "Capital gains beyond ITR-1 limits",
      "More complex house property, foreign assets, foreign income, NRI/RNOR facts, or special disclosures",
      "Lottery, race-horse, special-rate income, or losses that need detailed schedules",
    ],
    notFor: [
      "Business or profession income",
      "Firm, LLP, company, trust, AOP, BOI, local authority, or other entity returns",
      "Presumptive business cases that fit ITR-4",
    ],
    incomeSources: ["Salary or pension", "Any house property count", "Capital gains", "Other sources", "Foreign income or assets"],
    keySchedules: ["Salary", "House Property", "Capital Gains", "Other Sources", "Loss schedules", "Foreign Assets", "Tax Paid"],
    typicalDocuments: ["Form 16 or 16A", "AIS and Form 26AS", "Broker statements", "Property sale deeds", "Foreign asset statements", "Deduction and tax-payment proofs"],
    deadlineNote: "For AY 2026-27, non-audit ITR-2 cases should follow the current live portal due date before filing.",
    lateFilingNote: `${commonLateFee} Late filing can also affect eligible loss carry-forward.`,
    ctaCategory: "individual-selector",
    sourceLinks: [itrReturnFormSourceLinks[0], itrReturnFormSourceLinks[3]],
  },
  {
    id: "ITR-3",
    title: "ITR-3",
    shortLabel: "Individual or HUF with business income",
    summary: "For individuals or HUFs with business, profession, F&O, partner income, regular books, audit, or transfer-pricing complexity.",
    appliesTo: [
      "Individual or HUF with profits and gains from business or profession",
      "Freelancers and professionals using books rather than a simple ITR-4 presumptive path",
      "F&O or commodity activity treated as business income",
      "Cases requiring audit, depreciation schedules, loss schedules, or Form 3CEB",
    ],
    notFor: [
      "Companies, LLPs, firms, trusts, AOPs, BOIs, and other entities",
      "Individuals or HUFs without business or profession income",
      "Eligible presumptive cases where ITR-4 is suitable",
    ],
    incomeSources: ["Business or profession", "Salary or pension", "House property", "Capital gains", "Other sources", "Foreign income or assets"],
    keySchedules: ["Business/Profession", "Balance Sheet", "Profit and Loss", "Depreciation", "Capital Gains", "Loss schedules", "Tax Paid"],
    typicalDocuments: ["Books of account", "Invoices and receipts", "Bank statements", "P and L and balance sheet", "GST turnover details", "Form 3CA/3CB/3CD or Form 3CEB where applicable"],
    deadlineNote: "For AY 2026-27, ITR-3 deadlines depend on audit and transfer-pricing status; audit reports are generally due before the return due date.",
    lateFilingNote: `${commonLateFee} Late filing may also affect loss carry-forward and audit-related compliance.`,
    ctaCategory: "individual-selector",
    sourceLinks: [itrReturnFormSourceLinks[0], itrReturnFormSourceLinks[3]],
  },
  {
    id: "ITR-4",
    title: "ITR-4 (Sugam)",
    shortLabel: "Presumptive business or profession",
    summary: "For eligible resident individuals, HUFs, and firms other than LLP using presumptive taxation under Section 44AD, 44ADA, or 44AE.",
    appliesTo: [
      "Resident individual, HUF, or firm other than LLP",
      "Total income up to Rs 50 lakh",
      "Business or profession income computed on presumptive basis",
      "Salary, two house properties, other-source income, agricultural income up to Rs 5,000, and eligible Section 112A gains up to Rs 1.25 lakh",
    ],
    notFor: [
      "RNOR or NRI taxpayers",
      "LLPs, companies, trusts, or other entities",
      "Short-term capital gains, Section 112A gains above Rs 1.25 lakh, foreign assets/income, directors, unlisted equity, ESOP deferral, special-rate income, or carry-forward losses",
      "Regular books-led business cases needing ITR-3",
    ],
    incomeSources: ["Presumptive business", "Presumptive profession", "Salary or pension", "House property", "Other sources"],
    keySchedules: ["Presumptive Business/Profession", "Salary", "House Property", "Other Sources", "Tax Paid"],
    typicalDocuments: ["Turnover summary", "Invoice or receipt summary", "Bank statements", "Form 16 or 16A", "AIS and Form 26AS", "Deduction proofs"],
    deadlineNote: "For AY 2026-27, the official ITR-4 FAQ states the ITR-4 filing due date as 31 August 2026; confirm the live portal before filing.",
    lateFilingNote: commonLateFee,
    ctaCategory: "individual-selector",
    sourceLinks: [itrReturnFormSourceLinks[0], itrReturnFormSourceLinks[2], itrReturnFormSourceLinks[3]],
  },
  {
    id: "ITR-5",
    title: "ITR-5",
    shortLabel: "Firms, LLPs, AOPs, BOIs, and similar entities",
    summary: "For non-company entities such as firms, LLPs, AOPs, BOIs, co-operative societies, business trusts, investment funds, and similar taxpayers.",
    appliesTo: [
      "Firm or LLP",
      "AOP, BOI, co-operative society, local authority, business trust, investment fund, estate, or similar non-company taxpayer",
      "Entity business income, capital gains, house property, other-source income, or foreign disclosure cases",
    ],
    notFor: [
      "Individuals and HUFs using ITR-1 to ITR-4",
      "Companies using ITR-6",
      "Trusts and institutions required to file ITR-7",
    ],
    incomeSources: ["Business income", "Capital gains", "House property", "Other sources", "Foreign income or assets"],
    keySchedules: ["Business/Profession", "Balance Sheet", "Profit and Loss", "Capital Gains", "Loss schedules", "Foreign Assets", "Tax Paid"],
    typicalDocuments: ["Entity financial statements", "Books of account", "Audit report where applicable", "Form 3CD", "GST turnover details", "Tax payment challans"],
    deadlineNote: "For AY 2026-27, ITR-5 deadlines depend on audit, entity type, and transfer-pricing status; check the live portal and applicable notices.",
    lateFilingNote: `${commonLateFee} Entity cases may also face interest, audit-report, and loss carry-forward consequences.`,
    ctaCategory: "ca-review",
    sourceLinks: [itrReturnFormSourceLinks[0], itrReturnFormSourceLinks[3]],
  },
  {
    id: "ITR-6",
    title: "ITR-6",
    shortLabel: "Companies other than charitable exemption cases",
    summary: "For domestic or foreign companies other than companies claiming exemption under Section 11.",
    appliesTo: [
      "Domestic company",
      "Foreign company",
      "Companies with business income, capital gains, house property, other-source income, MAT, audit, or transfer-pricing schedules",
    ],
    notFor: [
      "Companies claiming exemption under Section 11",
      "Individuals, HUFs, firms, LLPs, AOPs, BOIs, or trusts using other ITR forms",
    ],
    incomeSources: ["Business income", "Capital gains", "House property", "Other sources", "Foreign income or assets"],
    keySchedules: ["Business/Profession", "Balance Sheet", "Profit and Loss", "MAT", "Capital Gains", "Foreign Assets", "Tax Paid"],
    typicalDocuments: ["Audited financial statements", "Directors report", "Form 3CA/3CB/3CD", "Form 29B where applicable", "Form 3CEB where applicable", "Tax payment challans"],
    deadlineNote: "For AY 2026-27, company due dates depend on audit and transfer-pricing status; confirm on the live portal before filing.",
    lateFilingNote: `${commonLateFee} Companies may also face interest and audit-related penalties where reports are delayed.`,
    ctaCategory: "ca-review",
    sourceLinks: [itrReturnFormSourceLinks[0], itrReturnFormSourceLinks[3]],
  },
  {
    id: "ITR-7",
    title: "ITR-7",
    shortLabel: "Trusts, charities, political parties, and institutions",
    summary: "For persons and entities required to file under special return provisions for charitable, religious, political, research, educational, medical, or institutional cases.",
    appliesTo: [
      "Charitable or religious trusts",
      "Political parties",
      "Research associations, universities, colleges, hospitals, and other institutions covered by special return provisions",
      "Entities with Section 11/12 exemption records, corpus, donation, or institutional compliance",
    ],
    notFor: [
      "Individuals, HUFs, firms, LLPs, companies, or other entities that use ITR-1 to ITR-6",
      "Private taxable entity cases not covered by the ITR-7 provisions",
    ],
    incomeSources: ["Income from property held for charitable purposes", "Voluntary contributions", "Corpus donations", "Business income where applicable", "Other heads where applicable"],
    keySchedules: ["Income from property held for charitable purposes", "Exempt Income", "Donations", "Business/Profession where applicable", "Tax Paid"],
    typicalDocuments: ["Trust deed", "Registration certificates", "Form 10B or audit report where applicable", "Donation records", "Bank statements", "TDS certificates"],
    deadlineNote: "For AY 2026-27, ITR-7 deadlines depend on audit and institution status; confirm the current portal and applicable forms before filing.",
    lateFilingNote: `${commonLateFee} ITR-7 delays can also affect exemption and institutional compliance positions.`,
    ctaCategory: "ca-review",
    sourceLinks: [itrReturnFormSourceLinks[0], itrReturnFormSourceLinks[3]],
  },
  {
    id: "ITR-U",
    title: "ITR-U (Updated Return)",
    shortLabel: "Updated return after original filing window",
    summary: "For taxpayers who need to disclose additional income or correct eligible omissions after the original, belated, or revised return route is no longer the right path.",
    appliesTo: [
      "Any eligible taxpayer type where updated return provisions permit filing",
      "Additional income disclosure or eligible correction cases",
      "Situations where the update does not reduce tax, increase refund, or create an impermissible loss position",
    ],
    notFor: [
      "Reducing tax liability or increasing refund",
      "Increasing loss or creating prohibited updated-return outcomes",
      "Cases where scrutiny, search, survey, or other statutory restrictions block ITR-U",
    ],
    incomeSources: ["Additional salary", "Additional other-source income", "Business or profession corrections", "Capital gains corrections", "Other eligible omitted income"],
    keySchedules: ["Applicable original ITR schedules", "Additional income details", "Tax payment details", "Verification"],
    typicalDocuments: ["Original ITR acknowledgement", "New income evidence", "AIS and Form 26AS", "Revised computation", "Additional tax and interest challans", "Supporting ledger or certificates"],
    deadlineNote: "For AY 2026-27, ITR-U availability and timing must be checked against the live old-Act updated return provisions and portal restrictions.",
    lateFilingNote: "For AY 2026-27, the official FAQ confirms ITR-U can be filed under old-Act Section 139(8A) within the prescribed time. Additional tax, interest, and restrictions apply, and ITR-U cannot reduce tax, increase refund, or create a prohibited loss outcome.",
    ctaCategory: "official-only",
    sourceLinks: [itrReturnFormSourceLinks[0], itrReturnFormSourceLinks[3]],
  },
];

export const itrReturnDecisionSteps = [
  {
    label: "Individual with simple salary facts",
    result: "Start with ITR-1, then check blockers.",
    href: "#ITR-1",
  },
  {
    label: "Individual or HUF with gains, NRI/RNOR, or foreign facts",
    result: "Review ITR-2 if there is no business income.",
    href: "#ITR-2",
  },
  {
    label: "Individual or HUF with business or profession",
    result: "Use ITR-3 unless eligible presumptive facts fit ITR-4.",
    href: "#ITR-3",
  },
  {
    label: "Firm, LLP, company, trust, or institution",
    result: "Move to entity return review before filing.",
    href: "#ITR-5",
  },
] as const;
