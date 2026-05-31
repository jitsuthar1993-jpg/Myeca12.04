import { z } from "zod";

export const ITR_FORMS = ["ITR-1", "ITR-2", "ITR-3", "ITR-4"] as const;
export const ITR_REVIEW_FORM = "CA_SCOPE_REVIEW" as const;

export const ITR_REVIEW_STATUSES = [
  "draft",
  "ready_for_review",
  "ca_review",
  "changes_requested",
  "approved_for_filing",
  "filed",
  "e_verified",
  "refund_or_demand_tracking",
] as const;

export type ItrForm = (typeof ITR_FORMS)[number];
export type ItrRecommendationForm = ItrForm | typeof ITR_REVIEW_FORM;
export type ItrReviewStatus = (typeof ITR_REVIEW_STATUSES)[number];

export const itrTaxpayerSchema = z.object({
  type: z.enum(["individual", "huf", "firm", "llp", "company", "trust", "aop", "boi", "other"]).default("individual"),
  residentialStatus: z.enum(["resident", "rnor", "nri"]).default("resident"),
  pan: z.string().trim().toUpperCase().optional().default(""),
  firstName: z.string().trim().optional().default(""),
  lastName: z.string().trim().optional().default(""),
  dateOfBirth: z.string().trim().optional().default(""),
  mobile: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  aadhaarStatus: z.string().trim().optional().default(""),
  bankAccount: z.string().trim().optional().default(""),
  ifsc: z.string().trim().toUpperCase().optional().default(""),
});

export const itrFilingSchema = z.object({
  returnKind: z.enum(["original", "belated", "revised", "updated"]).default("original"),
  wantsOldRegime: z.boolean().default(false),
  filedForm10IEA: z.boolean().default(false),
  form10IEAAcknowledgement: z.string().trim().optional().default(""),
});

export const itrIncomeSchema = z.object({
  salary: z.number().default(0),
  pension: z.number().default(0),
  houseProperties: z.number().int().min(0).default(0),
  housePropertyIncome: z.number().default(0),
  otherSources: z.number().default(0),
  agriculturalIncome: z.number().default(0),
  shortTermCapitalGains: z.number().default(0),
  section112aLtcg: z.number().default(0),
  otherCapitalGains: z.number().default(0),
  businessIncome: z.number().default(0),
  professionalIncome: z.number().default(0),
  presumptiveScheme: z.enum(["none", "44AD", "44ADA", "44AE"]).default("none"),
  foreignIncome: z.number().default(0),
  winningsOrSpecialRateIncome: z.number().default(0),
});

export const itrDeductionsSchema = z.object({
  section80C: z.number().default(0),
  section80D: z.number().default(0),
  section80G: z.number().default(0),
  section80E: z.number().default(0),
  nps: z.number().default(0),
  homeLoanInterest: z.number().default(0),
  otherChapterVia: z.number().default(0),
});

export const itrTaxPaidSchema = z.object({
  tds: z.number().default(0),
  tcs: z.number().default(0),
  advanceTax: z.number().default(0),
  selfAssessmentTax: z.number().default(0),
});

export const itrFlagsSchema = z.object({
  directorInCompany: z.boolean().default(false),
  heldUnlistedEquity: z.boolean().default(false),
  hasForeignAssets: z.boolean().default(false),
  hasForeignSigningAuthority: z.boolean().default(false),
  hasDeferredEsopTax: z.boolean().default(false),
  hasBroughtForwardLoss: z.boolean().default(false),
  hasCarryForwardLoss: z.boolean().default(false),
  section194NCashWithdrawal: z.boolean().default(false),
  governedByPortugueseCivilCode: z.boolean().default(false),
});

export const itrDocumentStateSchema = z.record(z.string(), z.string()).default({});

export const itrFilingDraftSchema = z.object({
  assessmentYear: z.string().trim().default("2026-27"),
  taxpayer: itrTaxpayerSchema.default({}),
  filing: itrFilingSchema.default({}),
  income: itrIncomeSchema.default({}),
  deductions: itrDeductionsSchema.default({}),
  taxPaid: itrTaxPaidSchema.default({}),
  flags: itrFlagsSchema.default({}),
  documents: itrDocumentStateSchema,
  notes: z.string().trim().optional().default(""),
});

export type ItrTaxpayer = z.infer<typeof itrTaxpayerSchema>;
export type ItrFilingDraft = z.infer<typeof itrFilingDraftSchema>;

export type ItrFormRecommendation = {
  form: ItrRecommendationForm;
  reasons: string[];
  blockers: string[];
  requiredSchedules: string[];
  caReviewRequired: boolean;
  exportAvailable: boolean;
  exportStatus: {
    available: boolean;
    reason: string;
  };
};

export type ItrDocumentChecklistItem = {
  id: string;
  title: string;
  required: boolean;
  reason: string;
};

export type ItrReviewPacket = {
  taxReturnId: string;
  status: "ready_for_review";
  generatedAt: string;
  recommendation: ItrFormRecommendation;
  documentChecklist: ItrDocumentChecklistItem[];
  summary: {
    assessmentYear: string;
    totalIncome: number;
    totalDeductions: number;
    totalTaxPaid: number;
    selectedTaxpayerType: ItrTaxpayer["type"];
    residentialStatus: ItrTaxpayer["residentialStatus"];
  };
  draft: ItrFilingDraft;
};

export const ITR_AY_2026_27_SCHEMA_EXPORTS = {
  "ITR-1": {
    schemaVersion: "V1.0",
    schemaUrl: "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITR-1_2026_Main_V1.0_0.json",
  },
  "ITR-2": {
    schemaVersion: "V1.0",
    schemaUrl: "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITR-2_2026_Main_V1.0.json",
  },
  "ITR-4": {
    schemaVersion: "V1.0",
    schemaUrl: "https://www.incometax.gov.in/iec/foportal/sites/default/files/2026-05/ITR-4_2026_Main_V1.0_0.json",
  },
} as const satisfies Partial<Record<ItrForm, { schemaVersion: string; schemaUrl: string }>>;

const ITR_SIMPLE_TOTAL_INCOME_LIMIT = 5_000_000;
const ITR_112A_SIMPLE_LIMIT = 125_000;
const ITR_AGRICULTURAL_INCOME_LIMIT = 5_000;

function amount(value: number | undefined) {
  return Math.max(0, Number(value) || 0);
}

export function normalizeItrDraft(input: unknown): ItrFilingDraft {
  return itrFilingDraftSchema.parse(input ?? {});
}

export function calculateItrTotalIncome(draftInput: ItrFilingDraft) {
  const draft = normalizeItrDraft(draftInput);
  const income = draft.income;

  return amount(income.salary) +
    amount(income.pension) +
    amount(income.housePropertyIncome) +
    amount(income.otherSources) +
    amount(income.shortTermCapitalGains) +
    amount(income.section112aLtcg) +
    amount(income.otherCapitalGains) +
    amount(income.businessIncome) +
    amount(income.professionalIncome) +
    amount(income.foreignIncome) +
    amount(income.winningsOrSpecialRateIncome);
}

export function calculateItrTotalDeductions(draftInput: ItrFilingDraft) {
  const deductions = normalizeItrDraft(draftInput).deductions;
  return Object.values(deductions).reduce((total, value) => total + amount(value), 0);
}

export function calculateItrTotalTaxPaid(draftInput: ItrFilingDraft) {
  const taxPaid = normalizeItrDraft(draftInput).taxPaid;
  return Object.values(taxPaid).reduce((total, value) => total + amount(value), 0);
}

function addUnique(items: string[], next: string) {
  if (!items.includes(next)) items.push(next);
}

function hasBusinessOrProfession(draft: ItrFilingDraft) {
  return amount(draft.income.businessIncome) > 0 || amount(draft.income.professionalIncome) > 0;
}

function hasForeignComplexity(draft: ItrFilingDraft) {
  return amount(draft.income.foreignIncome) > 0 ||
    draft.flags.hasForeignAssets ||
    draft.flags.hasForeignSigningAuthority;
}

function hasLossComplexity(draft: ItrFilingDraft) {
  return draft.flags.hasBroughtForwardLoss || draft.flags.hasCarryForwardLoss;
}

function getCommonBlockers(draft: ItrFilingDraft, form: "ITR-1" | "ITR-4") {
  const blockers: string[] = [];
  const totalIncome = calculateItrTotalIncome(draft);
  const prefix = `${form} cannot be used`;

  if (draft.taxpayer.residentialStatus !== "resident") {
    blockers.push(`${prefix} by RNOR or NRI taxpayers.`);
  }

  if (totalIncome > ITR_SIMPLE_TOTAL_INCOME_LIMIT) {
    blockers.push(`${prefix} when total income exceeds Rs 50 lakh.`);
  }

  if (amount(draft.income.shortTermCapitalGains) > 0) {
    blockers.push(`${prefix} for short-term capital gains.`);
  }

  if (amount(draft.income.section112aLtcg) > ITR_112A_SIMPLE_LIMIT) {
    blockers.push(`${prefix} when Section 112A LTCG exceeds Rs 1.25 lakh.`);
  }

  if (amount(draft.income.otherCapitalGains) > 0) {
    blockers.push(`${prefix} for capital gains other than eligible Section 112A LTCG.`);
  }

  if (draft.income.houseProperties > 2) {
    blockers.push(`${prefix} for more than two house properties.`);
  }

  if (amount(draft.income.agriculturalIncome) > ITR_AGRICULTURAL_INCOME_LIMIT) {
    blockers.push(`${prefix} when agricultural income exceeds Rs 5,000.`);
  }

  if (hasForeignComplexity(draft)) {
    blockers.push(`${prefix} for foreign assets, foreign signing authority, or foreign income.`);
  }

  if (amount(draft.income.winningsOrSpecialRateIncome) > 0) {
    blockers.push(`${prefix} for lottery, race-horse, or other special-rate income.`);
  }

  if (draft.flags.directorInCompany) {
    blockers.push(`${prefix} by directors in a company.`);
  }

  if (draft.flags.heldUnlistedEquity) {
    blockers.push(`${prefix} when unlisted equity shares were held.`);
  }

  if (draft.flags.hasDeferredEsopTax) {
    blockers.push(`${prefix} when ESOP tax is deferred.`);
  }

  if (draft.flags.section194NCashWithdrawal) {
    blockers.push(`${prefix} when TDS under Section 194N applies.`);
  }

  if (draft.flags.governedByPortugueseCivilCode) {
    blockers.push(`${prefix} for Portuguese Civil Code cases.`);
  }

  if (hasLossComplexity(draft)) {
    blockers.push(`${prefix} when losses must be brought forward or carried forward.`);
  }

  return blockers;
}

function getItr1Blockers(draft: ItrFilingDraft) {
  const blockers = getCommonBlockers(draft, "ITR-1");

  if (draft.taxpayer.type !== "individual") {
    blockers.push("ITR-1 is available only for individual taxpayers.");
  }

  if (hasBusinessOrProfession(draft)) {
    blockers.push("ITR-1 cannot be used for business or profession income.");
  }

  return blockers;
}

function getItr4Blockers(draft: ItrFilingDraft) {
  const blockers = getCommonBlockers(draft, "ITR-4");
  const allowedTaxpayer = ["individual", "huf", "firm"].includes(draft.taxpayer.type);

  if (!allowedTaxpayer) {
    blockers.push("ITR-4 is available only for eligible individuals, HUFs, and firms other than LLP.");
  }

  if (!hasBusinessOrProfession(draft)) {
    blockers.push("ITR-4 requires eligible presumptive business or profession income.");
  }

  if (draft.income.presumptiveScheme === "none") {
    blockers.push("ITR-4 requires eligible presumptive business or profession income.");
  }

  return Array.from(new Set(blockers));
}

function canUseItr2(draft: ItrFilingDraft) {
  return ["individual", "huf"].includes(draft.taxpayer.type) && !hasBusinessOrProfession(draft);
}

function canUseItr3(draft: ItrFilingDraft) {
  return ["individual", "huf"].includes(draft.taxpayer.type) && hasBusinessOrProfession(draft);
}

function exportStatusFor(form: ItrRecommendationForm): ItrFormRecommendation["exportStatus"] {
  if (form === "CA_SCOPE_REVIEW") {
    return {
      available: false,
      reason: "V1 supports export only for ITR-1 to ITR-4 draft packets.",
    };
  }

  if (!ITR_AY_2026_27_SCHEMA_EXPORTS[form]) {
    return {
      available: false,
      reason: "ITR-3 AY 2026-27 schema is not synced yet; prepare the CA review packet until the official utility/schema is available.",
    };
  }

  return {
    available: true,
    reason: `${form} AY 2026-27 draft JSON export can be generated from the saved MyeCA draft.`,
  };
}

function requiredSchedulesFor(draft: ItrFilingDraft, form: ItrRecommendationForm) {
  const schedules: string[] = [];

  if (amount(draft.income.salary) > 0 || amount(draft.income.pension) > 0) addUnique(schedules, "Schedule Salary");
  if (draft.income.houseProperties > 0 || amount(draft.income.housePropertyIncome) > 0) addUnique(schedules, "Schedule House Property");
  if (amount(draft.income.otherSources) > 0) addUnique(schedules, "Schedule Other Sources");
  if (amount(draft.income.shortTermCapitalGains) > 0 || amount(draft.income.otherCapitalGains) > 0 || amount(draft.income.section112aLtcg) > ITR_112A_SIMPLE_LIMIT) {
    addUnique(schedules, "Schedule Capital Gains");
  }
  if (amount(draft.income.section112aLtcg) > 0) addUnique(schedules, "Schedule 112A summary");
  if (hasForeignComplexity(draft)) addUnique(schedules, "Schedule FA");
  if (hasBusinessOrProfession(draft)) addUnique(schedules, "Schedule Business/Profession");
  if (draft.income.presumptiveScheme !== "none") addUnique(schedules, `Schedule ${draft.income.presumptiveScheme}`);
  if (calculateItrTotalIncome(draft) > ITR_SIMPLE_TOTAL_INCOME_LIMIT && form !== "ITR-1" && form !== "ITR-4") {
    addUnique(schedules, "Schedule AL");
  }

  addUnique(schedules, "Schedule Tax Paid");
  return schedules;
}

export function recommendItrForm(draftInput: ItrFilingDraft): ItrFormRecommendation {
  const draft = normalizeItrDraft(draftInput);
  const reasons: string[] = [];
  let blockers: string[] = [];
  let form: ItrRecommendationForm = ITR_REVIEW_FORM;

  if (["llp", "company", "trust", "aop", "boi", "other"].includes(draft.taxpayer.type)) {
    blockers = ["V1 supports ITR-1 to ITR-4 only; this taxpayer type needs CA scope review."];
  } else if (!hasBusinessOrProfession(draft)) {
    const itr1Blockers = getItr1Blockers(draft);
    if (itr1Blockers.length === 0) {
      form = "ITR-1";
      reasons.push("Resident individual with eligible salary, house property, other-source, and simple capital-gain facts.");
      if (amount(draft.income.section112aLtcg) > 0) {
        reasons.push("Section 112A LTCG is within the Rs 1.25 lakh ITR-1/ITR-4 limit.");
      }
    } else if (canUseItr2(draft)) {
      form = "ITR-2";
      blockers = itr1Blockers;
      reasons.push("Taxpayer has no business/profession income, but the facts are beyond ITR-1.");
    } else {
      blockers = itr1Blockers;
    }
  } else {
    const itr4Blockers = getItr4Blockers(draft);
    if (itr4Blockers.length === 0) {
      form = "ITR-4";
      reasons.push("Business/profession income is declared under presumptive taxation.");
      if (amount(draft.income.section112aLtcg) > 0) {
        reasons.push("Section 112A LTCG is within the Rs 1.25 lakh ITR-1/ITR-4 limit.");
      }
    } else if (canUseItr3(draft)) {
      form = "ITR-3";
      blockers = itr4Blockers;
      reasons.push("Business/profession income needs the detailed ITR-3 path.");
    } else {
      blockers = itr4Blockers;
    }
  }

  const exportStatus = exportStatusFor(form);

  return {
    form,
    reasons,
    blockers,
    requiredSchedules: requiredSchedulesFor(draft, form),
    caReviewRequired: form !== "ITR-1" || blockers.length > 0,
    exportAvailable: exportStatus.available,
    exportStatus,
  };
}

export function getItrDocumentChecklist(draftInput: ItrFilingDraft): ItrDocumentChecklistItem[] {
  const draft = normalizeItrDraft(draftInput);
  const items: ItrDocumentChecklistItem[] = [
    { id: "ais", title: "AIS / TIS statement", required: true, reason: "Required to reconcile reported income and high-value transactions." },
    { id: "form26as", title: "Form 26AS", required: true, reason: "Required to match TDS, TCS, and challans." },
    { id: "bank", title: "Bank statements and refund account proof", required: true, reason: "Required for income traceability and refund-bank review." },
  ];

  if (amount(draft.income.salary) > 0 || amount(draft.income.pension) > 0) {
    items.unshift({ id: "form16", title: "Form 16 / salary certificate", required: true, reason: "Required for salary, pension, employer TAN, and TDS details." });
  }

  if (calculateItrTotalDeductions(draft) > 0 || draft.filing.wantsOldRegime) {
    items.push({ id: "deductions", title: "Deduction and exemption proofs", required: false, reason: "Needed for old-regime claims, HRA, 80C, 80D, donations, NPS, and loan deductions." });
  }

  if (amount(draft.income.shortTermCapitalGains) > 0 || amount(draft.income.section112aLtcg) > 0 || amount(draft.income.otherCapitalGains) > 0) {
    items.push({ id: "capital-gains", title: "Capital gains statements", required: true, reason: "Needed for broker, mutual fund, property, ESOP, VDA, and Schedule 112A review." });
  }

  if (hasBusinessOrProfession(draft)) {
    items.push({ id: "business-receipts", title: "Business/profession receipts and expense records", required: true, reason: "Needed for presumptive eligibility, turnover, GST/TDS reconciliation, and ITR-3/4 review." });
  }

  if (hasForeignComplexity(draft)) {
    items.push({ id: "foreign-assets", title: "Foreign asset, income, and tax-credit records", required: true, reason: "Needed for Schedule FA/FSI/TR, Form 67, DTAA, RSU, ESPP, and NRI/RNOR review." });
  }

  return items;
}

export function buildItrReviewPacket(draftInput: ItrFilingDraft, taxReturnId: string): ItrReviewPacket {
  const draft = normalizeItrDraft(draftInput);

  return {
    taxReturnId,
    status: "ready_for_review",
    generatedAt: new Date().toISOString(),
    recommendation: recommendItrForm(draft),
    documentChecklist: getItrDocumentChecklist(draft),
    summary: {
      assessmentYear: draft.assessmentYear,
      totalIncome: calculateItrTotalIncome(draft),
      totalDeductions: calculateItrTotalDeductions(draft),
      totalTaxPaid: calculateItrTotalTaxPaid(draft),
      selectedTaxpayerType: draft.taxpayer.type,
      residentialStatus: draft.taxpayer.residentialStatus,
    },
    draft,
  };
}

export function buildItrDraftJsonExport(draftInput: ItrFilingDraft, taxReturnId: string) {
  const draft = normalizeItrDraft(draftInput);
  const recommendation = recommendItrForm(draft);

  if (!recommendation.exportAvailable) {
    return {
      available: false,
      reason: recommendation.exportStatus.reason,
      form: recommendation.form,
      taxReturnId,
    };
  }

  const officialSchema = ITR_AY_2026_27_SCHEMA_EXPORTS[recommendation.form as keyof typeof ITR_AY_2026_27_SCHEMA_EXPORTS];

  return {
    available: true,
    form: recommendation.form,
    taxReturnId,
    assessmentYear: draft.assessmentYear,
    generatedAt: new Date().toISOString(),
    officialSchema,
    warning: "Draft export for CA review only. This is not proof of filing on the Income Tax portal.",
    data: {
      Form: recommendation.form,
      AssessmentYear: draft.assessmentYear,
      Taxpayer: draft.taxpayer,
      Filing: draft.filing,
      Income: draft.income,
      Deductions: draft.deductions,
      TaxPaid: draft.taxPaid,
      Schedules: recommendation.requiredSchedules,
    },
  };
}
