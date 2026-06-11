import { z } from "zod";

export const ITR_FORMS = ["ITR-1", "ITR-2", "ITR-3", "ITR-4"] as const;
export const ITR_REVIEW_FORM = "CA_SCOPE_REVIEW" as const;
export const ITR_INCOME_TYPES = [
  "salary",
  "otherSources",
  "houseProperty",
  "capitalGains",
  "business",
  "foreign",
] as const;

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
export type ItrIncomeType = (typeof ITR_INCOME_TYPES)[number];

export const itrFilingOwnerSchema = z.object({
  mode: z.enum(["self", "other"]).default("self"),
  personId: z.string().trim().optional().default(""),
  relationship: z.string().trim().optional().default(""),
  displayName: z.string().trim().optional().default(""),
});

export const itrTaxpayerSchema = z.object({
  type: z.enum(["individual", "huf", "firm", "llp", "company", "trust", "aop", "boi", "other"]).default("individual"),
  residentialStatus: z.enum(["resident", "rnor", "nri"]).default("resident"),
  pan: z.string().trim().toUpperCase().optional().default(""),
  firstName: z.string().trim().optional().default(""),
  lastName: z.string().trim().optional().default(""),
  dateOfBirth: z.string().trim().optional().default(""),
  mobile: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  aadhaar: z.string().trim().optional().default(""),
  aadhaarStatus: z.string().trim().optional().default(""),
  bankName: z.string().trim().optional().default(""),
  bankAccountHolder: z.string().trim().optional().default(""),
  bankAccount: z.string().trim().optional().default(""),
  bankAccountConfirm: z.string().trim().optional().default(""),
  bankAccountType: z.enum(["savings", "current", "other"]).optional().default("savings"),
  ifsc: z.string().trim().toUpperCase().optional().default(""),
});

export const itrFilingSchema = z.object({
  returnKind: z.enum(["original", "belated", "revised", "updated"]).default("original"),
  wantsOldRegime: z.boolean().default(false),
  filedForm10IEA: z.boolean().default(false),
  form10IEAAcknowledgement: z.string().trim().optional().default(""),
});

export const itrIncomeSchema = z.object({
  selectedTypes: z.array(z.enum(ITR_INCOME_TYPES)).default([]),
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
  filingOwner: itrFilingOwnerSchema.default({}),
  taxpayer: itrTaxpayerSchema.default({}),
  filing: itrFilingSchema.default({}),
  income: itrIncomeSchema.default({}),
  deductions: itrDeductionsSchema.default({}),
  taxPaid: itrTaxPaidSchema.default({}),
  flags: itrFlagsSchema.default({}),
  documents: itrDocumentStateSchema,
  notes: z.string().trim().optional().default(""),
});

export type ItrFilingOwner = z.infer<typeof itrFilingOwnerSchema>;
export type ItrTaxpayer = z.infer<typeof itrTaxpayerSchema>;
export type ItrFilingDraft = z.infer<typeof itrFilingDraftSchema>;

export type ItrVerificationSeverity = "info" | "warning" | "critical";

export type ItrVerificationIssue = {
  id: string;
  severity: ItrVerificationSeverity;
  area: "owner" | "identity" | "income" | "documents" | "computation" | "review";
  paneId?: string;
  title: string;
  detail: string;
  action: string;
};

export type ItrIdentityValidation = {
  panFormatValid: boolean;
  panVerificationMode: "format_only";
  aadhaarFormatValid: boolean;
  ifscFormatValid: boolean;
  bankAccountConfirmed: boolean;
  missingRequiredFields: string[];
  issues: ItrVerificationIssue[];
};

export type ItrVerificationReport = {
  status: "ready" | "review" | "blocked";
  issues: ItrVerificationIssue[];
  summary: {
    critical: number;
    warning: number;
    info: number;
  };
};

export type ItrRegimeComputation = {
  regime: "old" | "new";
  grossIncome: number;
  standardDeduction: number;
  eligibleDeductions: number;
  taxableIncome: number;
  normalSlabTax: number;
  specialRateTax: number;
  rebate87A: number;
  marginalRelief: number;
  taxBeforeCess: number;
  cess: number;
  grossTaxLiability: number;
};

export type ItrTaxLiabilitySummary = {
  status: "computed" | "review_required";
  activeRegime: "old" | "new";
  recommendedRegime: "old" | "new";
  unsupportedReasons: string[];
  oldRegime: ItrRegimeComputation;
  newRegime: ItrRegimeComputation;
  totalTaxPaid: number;
  grossTaxLiability: number;
  taxPayable: number;
  refundDue: number;
};

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
    taxLiability: ItrTaxLiabilitySummary;
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
const HEALTH_AND_EDUCATION_CESS_RATE = 0.04;
const NEW_REGIME_REBATE_LIMIT = 1_200_000;
const NEW_REGIME_MAX_REBATE = 60_000;
const OLD_REGIME_REBATE_LIMIT = 500_000;
const OLD_REGIME_MAX_REBATE = 12_500;
const STANDARD_DEDUCTION = {
  old: 50_000,
  new: 75_000,
} as const;
const NEW_REGIME_SLABS = [
  { min: 0, max: 400_000, rate: 0 },
  { min: 400_000, max: 800_000, rate: 0.05 },
  { min: 800_000, max: 1_200_000, rate: 0.1 },
  { min: 1_200_000, max: 1_600_000, rate: 0.15 },
  { min: 1_600_000, max: 2_000_000, rate: 0.2 },
  { min: 2_000_000, max: 2_400_000, rate: 0.25 },
  { min: 2_400_000, max: Infinity, rate: 0.3 },
] as const;
const OLD_REGIME_SLABS = {
  regular: [
    { min: 0, max: 250_000, rate: 0 },
    { min: 250_000, max: 500_000, rate: 0.05 },
    { min: 500_000, max: 1_000_000, rate: 0.2 },
    { min: 1_000_000, max: Infinity, rate: 0.3 },
  ],
  senior: [
    { min: 0, max: 300_000, rate: 0 },
    { min: 300_000, max: 500_000, rate: 0.05 },
    { min: 500_000, max: 1_000_000, rate: 0.2 },
    { min: 1_000_000, max: Infinity, rate: 0.3 },
  ],
  superSenior: [
    { min: 0, max: 500_000, rate: 0 },
    { min: 500_000, max: 1_000_000, rate: 0.2 },
    { min: 1_000_000, max: Infinity, rate: 0.3 },
  ],
} as const;
const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const AADHAAR_PATTERN = /^[0-9]{12}$/;
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const BANK_ACCOUNT_PATTERN = /^[0-9]{6,18}$/;

function amount(value: number | undefined) {
  return Math.max(0, Number(value) || 0);
}

function cleanDigits(value: string | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

function roundAmount(value: number) {
  return Math.round(Math.max(0, Number(value) || 0));
}

function addIssue(issues: ItrVerificationIssue[], issue: ItrVerificationIssue) {
  if (!issues.some((item) => item.id === issue.id)) issues.push(issue);
}

function deriveLegacyIncomeTypes(draft: ItrFilingDraft): ItrIncomeType[] {
  const selectedTypes: ItrIncomeType[] = [];
  const hasValue = (...values: number[]) => values.some((value) => (Number(value) || 0) !== 0);

  if (hasValue(draft.income.salary, draft.income.pension)) selectedTypes.push("salary");
  if (
    hasValue(draft.income.otherSources, draft.income.agriculturalIncome, draft.income.winningsOrSpecialRateIncome)
  ) {
    selectedTypes.push("otherSources");
  }
  if (draft.income.houseProperties > 0 || hasValue(draft.income.housePropertyIncome)) selectedTypes.push("houseProperty");
  if (
    hasValue(draft.income.shortTermCapitalGains, draft.income.section112aLtcg, draft.income.otherCapitalGains)
  ) {
    selectedTypes.push("capitalGains");
  }
  if (
    hasValue(draft.income.businessIncome, draft.income.professionalIncome) ||
    draft.income.presumptiveScheme !== "none"
  ) {
    selectedTypes.push("business");
  }
  if (
    hasValue(draft.income.foreignIncome) ||
    draft.flags.hasForeignAssets ||
    draft.flags.hasForeignSigningAuthority ||
    draft.taxpayer.residentialStatus !== "resident"
  ) {
    selectedTypes.push("foreign");
  }

  return selectedTypes;
}

export function normalizeItrDraft(input: unknown): ItrFilingDraft {
  const rawDraft = input && typeof input === "object" ? input as Record<string, unknown> : {};
  const rawIncome = rawDraft.income && typeof rawDraft.income === "object"
    ? rawDraft.income as Record<string, unknown>
    : {};
  const hasPersistedSelections =
    Object.prototype.hasOwnProperty.call(rawIncome, "selectedTypes") &&
    rawIncome.selectedTypes !== undefined;
  const draft = itrFilingDraftSchema.parse(input ?? {});

  if (hasPersistedSelections) return draft;

  return {
    ...draft,
    income: {
      ...draft.income,
      selectedTypes: deriveLegacyIncomeTypes(draft),
    },
  };
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

function paneIdForRequiredIdentityField(field: string) {
  if (field === "pan" || field === "aadhaar") return "identity-pan-aadhaar";
  if (field === "ifsc") return "identity-bank";
  if (field === "bankAccount" || field === "bankAccountConfirm") return "identity-account";
  return "identity-name";
}

function paneIdForFormBlocker(blocker: string) {
  if (/capital gains|section 112a/i.test(blocker)) return "income-capital-gains";
  if (/business|profession|presumptive/i.test(blocker)) return "income-business";
  if (/foreign|rnor|nri/i.test(blocker)) return "income-foreign";
  if (/house propert/i.test(blocker)) return "income-house-property";
  return "income-preferences";
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

export function validateItrIdentity(draftInput: ItrFilingDraft): ItrIdentityValidation {
  const draft = normalizeItrDraft(draftInput);
  const taxpayer = draft.taxpayer;
  const pan = taxpayer.pan.trim().toUpperCase();
  const aadhaar = cleanDigits(taxpayer.aadhaar);
  const ifsc = taxpayer.ifsc.trim().toUpperCase();
  const bankAccount = cleanDigits(taxpayer.bankAccount);
  const bankAccountConfirm = cleanDigits(taxpayer.bankAccountConfirm);
  const missingRequiredFields: string[] = [];
  const issues: ItrVerificationIssue[] = [];

  [
    ["firstName", taxpayer.firstName],
    ["lastName", taxpayer.lastName],
    ["pan", taxpayer.pan],
    ["aadhaar", taxpayer.aadhaar],
    ["bankAccount", taxpayer.bankAccount],
    ["bankAccountConfirm", taxpayer.bankAccountConfirm],
    ["ifsc", taxpayer.ifsc],
  ].forEach(([field, value]) => {
    if (!String(value ?? "").trim()) missingRequiredFields.push(field);
  });

  const panFormatValid = PAN_PATTERN.test(pan);
  const aadhaarFormatValid = AADHAAR_PATTERN.test(aadhaar);
  const ifscFormatValid = IFSC_PATTERN.test(ifsc);
  const bankAccountFormatValid = BANK_ACCOUNT_PATTERN.test(bankAccount);
  const bankAccountConfirmed =
    bankAccountFormatValid &&
    BANK_ACCOUNT_PATTERN.test(bankAccountConfirm) &&
    bankAccount === bankAccountConfirm;

  if (!panFormatValid) {
    addIssue(issues, {
      id: "pan-format",
      severity: "critical",
      area: "identity",
      paneId: "identity-pan-aadhaar",
      title: "PAN format needs correction",
      detail: "PAN must follow the ten-character format such as ABCDE1234F. This is a format check only.",
      action: "Enter the taxpayer PAN in valid format.",
    });
  }

  if (!aadhaarFormatValid) {
    addIssue(issues, {
      id: "aadhaar-format",
      severity: "critical",
      area: "identity",
      paneId: "identity-pan-aadhaar",
      title: "Aadhaar format needs correction",
      detail: "Aadhaar must contain exactly 12 digits before the draft can move to review.",
      action: "Enter the full 12 digit Aadhaar number.",
    });
  }

  if (!ifscFormatValid) {
    addIssue(issues, {
      id: "ifsc-format",
      severity: "critical",
      area: "identity",
      paneId: "identity-bank",
      title: "IFSC format needs correction",
      detail: "IFSC must use the standard 11-character bank branch format.",
      action: "Enter the refund bank IFSC in valid format.",
    });
  }

  if (!bankAccountConfirmed) {
    addIssue(issues, {
      id: "bank-account-confirm",
      severity: "critical",
      area: "identity",
      paneId: "identity-account",
      title: "Refund bank account confirmation mismatch",
      detail: "The account number and confirmation field must match before review.",
      action: "Re-enter the refund bank account number in both fields.",
    });
  }

  for (const field of missingRequiredFields) {
    addIssue(issues, {
      id: `identity-required-${field}`,
      severity: "critical",
      area: "identity",
      paneId: paneIdForRequiredIdentityField(field),
      title: "Required identity field missing",
      detail: `${field} is required for the filing draft.`,
      action: "Complete the identity step before continuing.",
    });
  }

  return {
    panFormatValid,
    panVerificationMode: "format_only",
    aadhaarFormatValid,
    ifscFormatValid,
    bankAccountConfirmed,
    missingRequiredFields,
    issues,
  };
}

function ageCategoryFor(dateOfBirth: string) {
  const year = Number(dateOfBirth.slice(0, 4));
  if (!Number.isFinite(year) || year <= 1900) return "regular" as const;

  const ageAtFinancialYearEnd = 2026 - year;
  if (ageAtFinancialYearEnd >= 80) return "superSenior" as const;
  if (ageAtFinancialYearEnd >= 60) return "senior" as const;
  return "regular" as const;
}

function slabTax(
  taxableIncome: number,
  slabs: readonly { min: number; max: number; rate: number }[],
) {
  return slabs.reduce((total, slab) => {
    if (taxableIncome <= slab.min) return total;
    const taxableInSlab = Math.max(0, Math.min(taxableIncome, slab.max) - slab.min);
    return total + taxableInSlab * slab.rate;
  }, 0);
}

function computeRegimeTax(draft: ItrFilingDraft, regime: "old" | "new"): ItrRegimeComputation {
  const salaryOrPension = amount(draft.income.salary) + amount(draft.income.pension);
  const normalGrossIncome =
    salaryOrPension +
    amount(draft.income.housePropertyIncome) +
    amount(draft.income.otherSources) +
    amount(draft.income.agriculturalIncome);
  const standardDeduction = Math.min(salaryOrPension, STANDARD_DEDUCTION[regime]);
  const eligibleDeductions = regime === "old" ? calculateItrTotalDeductions(draft) : 0;
  const normalTaxableIncome = Math.max(0, normalGrossIncome - standardDeduction - eligibleDeductions);
  const taxable112a = Math.max(0, amount(draft.income.section112aLtcg) - ITR_112A_SIMPLE_LIMIT);
  const specialRateTax =
    amount(draft.income.shortTermCapitalGains) * 0.2 +
    taxable112a * 0.125 +
    amount(draft.income.otherCapitalGains) * 0.125 +
    amount(draft.income.winningsOrSpecialRateIncome) * 0.3;
  const specialRateTaxableIncome =
    amount(draft.income.shortTermCapitalGains) +
    taxable112a +
    amount(draft.income.otherCapitalGains) +
    amount(draft.income.winningsOrSpecialRateIncome);
  const taxableIncome = normalTaxableIncome + specialRateTaxableIncome;
  const slabs = regime === "new"
    ? NEW_REGIME_SLABS
    : OLD_REGIME_SLABS[ageCategoryFor(draft.taxpayer.dateOfBirth)];
  const normalSlabTax = slabTax(normalTaxableIncome, slabs);
  const taxBeforeRebate = normalSlabTax + specialRateTax;
  const isResidentIndividual = draft.taxpayer.type === "individual" && draft.taxpayer.residentialStatus === "resident";
  let rebate87A = 0;
  let marginalRelief = 0;
  let normalTaxAfterRebate = normalSlabTax;

  if (isResidentIndividual && regime === "new") {
    if (taxableIncome <= NEW_REGIME_REBATE_LIMIT) {
      rebate87A = Math.min(normalSlabTax, NEW_REGIME_MAX_REBATE);
      normalTaxAfterRebate = Math.max(0, normalSlabTax - rebate87A);
    } else {
      const excessIncome = taxableIncome - NEW_REGIME_REBATE_LIMIT;
      if (normalSlabTax > excessIncome) {
        marginalRelief = normalSlabTax - excessIncome;
        normalTaxAfterRebate = excessIncome;
      }
    }
  } else if (isResidentIndividual && regime === "old" && taxableIncome <= OLD_REGIME_REBATE_LIMIT) {
    rebate87A = Math.min(normalSlabTax, OLD_REGIME_MAX_REBATE);
    normalTaxAfterRebate = Math.max(0, normalSlabTax - rebate87A);
  }

  const taxBeforeCess = normalTaxAfterRebate + specialRateTax;
  const cess = taxBeforeCess * HEALTH_AND_EDUCATION_CESS_RATE;
  const grossTaxLiability = taxBeforeCess + cess;

  return {
    regime,
    grossIncome: roundAmount(normalGrossIncome + specialRateTaxableIncome),
    standardDeduction: roundAmount(standardDeduction),
    eligibleDeductions: roundAmount(eligibleDeductions),
    taxableIncome: roundAmount(taxableIncome),
    normalSlabTax: roundAmount(normalSlabTax),
    specialRateTax: roundAmount(specialRateTax),
    rebate87A: roundAmount(rebate87A),
    marginalRelief: roundAmount(marginalRelief),
    taxBeforeCess: roundAmount(taxBeforeCess),
    cess: roundAmount(cess),
    grossTaxLiability: roundAmount(grossTaxLiability),
  };
}

export function computeItrTaxLiability(draftInput: ItrFilingDraft): ItrTaxLiabilitySummary {
  const draft = normalizeItrDraft(draftInput);
  const recommendation = recommendItrForm(draft);
  const oldRegime = computeRegimeTax(draft, "old");
  const newRegime = computeRegimeTax(draft, "new");
  const recommendedRegime = oldRegime.grossTaxLiability < newRegime.grossTaxLiability ? "old" : "new";
  const activeRegime = draft.filing.wantsOldRegime ? "old" : recommendedRegime;
  const activeComputation = activeRegime === "old" ? oldRegime : newRegime;
  const totalTaxPaid = calculateItrTotalTaxPaid(draft);
  const grossTaxLiability = activeComputation.grossTaxLiability;
  const taxPayable = Math.max(0, grossTaxLiability - totalTaxPaid);
  const refundDue = Math.max(0, totalTaxPaid - grossTaxLiability);
  const unsupportedReasons: string[] = [];

  if (recommendation.form !== "ITR-1" || recommendation.blockers.length > 0) {
    const label = recommendation.form === ITR_REVIEW_FORM
      ? "Scope-review"
      : recommendation.form;
    unsupportedReasons.push(`${label} computation is gated for CA review in this phased release.`);
  }

  return {
    status: unsupportedReasons.length ? "review_required" : "computed",
    activeRegime,
    recommendedRegime,
    unsupportedReasons,
    oldRegime,
    newRegime,
    totalTaxPaid,
    grossTaxLiability,
    taxPayable: roundAmount(taxPayable),
    refundDue: roundAmount(refundDue),
  };
}

export function buildItrVerificationReport(draftInput: ItrFilingDraft): ItrVerificationReport {
  const draft = normalizeItrDraft(draftInput);
  const issues: ItrVerificationIssue[] = [...validateItrIdentity(draft).issues];
  const recommendation = recommendItrForm(draft);
  const taxLiability = computeItrTaxLiability(draft);

  if (draft.filingOwner.mode === "other" && !draft.filingOwner.personId && !draft.filingOwner.displayName) {
    addIssue(issues, {
      id: "owner-other-person",
      severity: "warning",
      area: "owner",
      paneId: "owner-person",
      title: "Other-person filing needs a taxpayer reference",
      detail: "A saved person or display name helps keep the draft separate from your own ITR.",
      action: "Select a saved taxpayer or add the person's name.",
    });
  }

  for (const blocker of recommendation.blockers) {
    addIssue(issues, {
      id: `form-blocker-${blocker.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
      severity: "warning",
      area: "review",
      paneId: paneIdForFormBlocker(blocker),
      title: "Form-selection review needed",
      detail: blocker,
      action: "Review the case before final portal filing.",
    });
  }

  for (const document of getItrDocumentChecklist(draft)) {
    if (document.required && !draft.documents[document.id]) {
      addIssue(issues, {
        id: `document-${document.id}`,
        severity: "warning",
        area: "documents",
        paneId: `document-${document.id}`,
        title: `${document.title} not linked`,
        detail: document.reason,
        action: "Upload or link this document before CA review.",
      });
    }
  }

  if (taxLiability.status === "review_required") {
    addIssue(issues, {
      id: "computation-gated",
      severity: "warning",
      area: "computation",
      paneId: "compute-regimes",
      title: "Computation needs CA review",
      detail: taxLiability.unsupportedReasons.join(" "),
      action: "Submit the draft for CA review after completing documents.",
    });
  }

  const summary = {
    critical: issues.filter((issue) => issue.severity === "critical").length,
    warning: issues.filter((issue) => issue.severity === "warning").length,
    info: issues.filter((issue) => issue.severity === "info").length,
  };

  return {
    status: summary.critical > 0 ? "blocked" : summary.warning > 0 ? "review" : "ready",
    issues,
    summary,
  };
}

export function validateItrPane(draftInput: ItrFilingDraft, paneId: string): ItrVerificationIssue[] {
  return buildItrVerificationReport(draftInput).issues.filter((issue) => issue.paneId === paneId);
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
  const taxLiability = computeItrTaxLiability(draft);

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
      taxLiability,
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
      TaxLiability: computeItrTaxLiability(draft),
      Schedules: recommendation.requiredSchedules,
    },
  };
}
