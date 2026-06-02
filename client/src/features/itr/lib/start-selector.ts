import {
  normalizeItrDraft,
  recommendItrForm,
  type ItrFilingDraft,
  type ItrFormRecommendation,
} from "@shared/itr-filing";

export const ITR_START_SELECTOR_STORAGE_KEY = "myeca:itr-start-form-selector";
export const ITR_START_HANDOFF_VERSION = 1;
export const ITR_START_HANDOFF_TTL_MS = 24 * 60 * 60 * 1000;

export type ItrStartTotalIncomeRange = "under-50-lakh" | "above-50-lakh";
export type ItrStartHousePropertyCount = "none" | "one" | "two" | "more-than-two";
export type ItrStartCapitalGains = "none" | "section112a-under-limit" | "section112a-over-limit" | "short-term" | "other";
export type ItrStartBusinessOrProfession = "none" | "business" | "profession";

export type ItrStartSelectorAnswers = {
  assessmentYear: "2026-27" | "2025-26";
  residentialStatus: ItrFilingDraft["taxpayer"]["residentialStatus"];
  totalIncomeRange: ItrStartTotalIncomeRange;
  salaryOrPension: boolean;
  housePropertyCount: ItrStartHousePropertyCount;
  otherSources: boolean;
  agriculturalIncomeAboveLimit: boolean;
  capitalGains: ItrStartCapitalGains;
  businessOrProfession: ItrStartBusinessOrProfession;
  presumptiveScheme: ItrFilingDraft["income"]["presumptiveScheme"];
  foreignIncomeOrAssets: boolean;
  directorInCompany: boolean;
  heldUnlistedEquity: boolean;
  hasDeferredEsopTax: boolean;
  hasBroughtForwardOrCarryForwardLoss: boolean;
  section194NCashWithdrawal: boolean;
  governedByPortugueseCivilCode: boolean;
};

export type ItrStartHandoffPayload = {
  version: typeof ITR_START_HANDOFF_VERSION;
  flowId: string;
  createdAt: number;
  expiresAt: number;
  source: string;
  answers: ItrStartSelectorAnswers;
  draft: ItrFilingDraft;
  recommendation: ItrFormRecommendation;
};

export const DEFAULT_ITR_START_SELECTOR_ANSWERS: ItrStartSelectorAnswers = {
  assessmentYear: "2026-27",
  residentialStatus: "resident",
  totalIncomeRange: "under-50-lakh",
  salaryOrPension: true,
  housePropertyCount: "none",
  otherSources: true,
  agriculturalIncomeAboveLimit: false,
  capitalGains: "none",
  businessOrProfession: "none",
  presumptiveScheme: "none",
  foreignIncomeOrAssets: false,
  directorInCompany: false,
  heldUnlistedEquity: false,
  hasDeferredEsopTax: false,
  hasBroughtForwardOrCarryForwardLoss: false,
  section194NCashWithdrawal: false,
  governedByPortugueseCivilCode: false,
};

const residentialStatuses: ItrFilingDraft["taxpayer"]["residentialStatus"][] = ["resident", "rnor", "nri"];
const presumptiveSchemes: ItrFilingDraft["income"]["presumptiveScheme"][] = ["none", "44AD", "44ADA", "44AE"];

function isResidentialStatus(value: string | null): value is ItrFilingDraft["taxpayer"]["residentialStatus"] {
  return residentialStatuses.includes(value as ItrFilingDraft["taxpayer"]["residentialStatus"]);
}

function isPresumptiveScheme(value: string | null): value is ItrFilingDraft["income"]["presumptiveScheme"] {
  return presumptiveSchemes.includes(value as ItrFilingDraft["income"]["presumptiveScheme"]);
}

function propertyCountValue(value: ItrStartHousePropertyCount) {
  if (value === "one") return 1;
  if (value === "two") return 2;
  if (value === "more-than-two") return 3;
  return 0;
}

function capitalGainsAmounts(value: ItrStartCapitalGains) {
  return {
    shortTermCapitalGains: value === "short-term" ? 50_000 : 0,
    section112aLtcg:
      value === "section112a-under-limit" ? 125_000 :
        value === "section112a-over-limit" ? 175_000 :
          0,
    otherCapitalGains: value === "other" ? 50_000 : 0,
  };
}

export function normalizeItrStartSelectorAnswers(input: Partial<ItrStartSelectorAnswers> = {}): ItrStartSelectorAnswers {
  const answers = {
    ...DEFAULT_ITR_START_SELECTOR_ANSWERS,
    ...input,
  };

  if (!isResidentialStatus(answers.residentialStatus)) {
    answers.residentialStatus = DEFAULT_ITR_START_SELECTOR_ANSWERS.residentialStatus;
  }

  if (!isPresumptiveScheme(answers.presumptiveScheme)) {
    answers.presumptiveScheme = "none";
  }

  if (answers.businessOrProfession === "none") {
    answers.presumptiveScheme = "none";
  }

  return answers;
}

export function buildItrStartDraft(input: ItrStartSelectorAnswers): ItrFilingDraft {
  const answers = normalizeItrStartSelectorAnswers(input);
  const hasBusiness = answers.businessOrProfession === "business";
  const hasProfession = answers.businessOrProfession === "profession";
  const highIncome = answers.totalIncomeRange === "above-50-lakh";
  const primarySimpleIncome = highIncome ? 5_100_000 : 900_000;
  const sideIncome = highIncome ? 100_000 : 40_000;
  const businessIncome = hasBusiness ? (highIncome && !answers.salaryOrPension ? 5_100_000 : 900_000) : 0;
  const professionalIncome = hasProfession ? (highIncome && !answers.salaryOrPension ? 5_100_000 : 900_000) : 0;
  const capitalGains = capitalGainsAmounts(answers.capitalGains);

  return normalizeItrDraft({
    assessmentYear: answers.assessmentYear,
    taxpayer: {
      type: "individual",
      residentialStatus: answers.residentialStatus,
    },
    filing: {
      returnKind: "original",
      wantsOldRegime: false,
    },
    income: {
      salary: answers.salaryOrPension ? primarySimpleIncome : 0,
      pension: 0,
      houseProperties: propertyCountValue(answers.housePropertyCount),
      housePropertyIncome: answers.housePropertyCount === "none" ? 0 : sideIncome,
      otherSources: answers.otherSources ? sideIncome : 0,
      agriculturalIncome: answers.agriculturalIncomeAboveLimit ? 6_000 : 0,
      ...capitalGains,
      businessIncome,
      professionalIncome,
      presumptiveScheme: answers.presumptiveScheme,
      foreignIncome: answers.foreignIncomeOrAssets ? 25_000 : 0,
      winningsOrSpecialRateIncome: 0,
    },
    flags: {
      directorInCompany: answers.directorInCompany,
      heldUnlistedEquity: answers.heldUnlistedEquity,
      hasForeignAssets: answers.foreignIncomeOrAssets,
      hasForeignSigningAuthority: false,
      hasDeferredEsopTax: answers.hasDeferredEsopTax,
      hasBroughtForwardLoss: answers.hasBroughtForwardOrCarryForwardLoss,
      hasCarryForwardLoss: answers.hasBroughtForwardOrCarryForwardLoss,
      section194NCashWithdrawal: answers.section194NCashWithdrawal,
      governedByPortugueseCivilCode: answers.governedByPortugueseCivilCode,
    },
    documents: {},
  });
}

export function getItrStartSelectorAnswersFromParams(params: URLSearchParams): ItrStartSelectorAnswers {
  const answers = { ...DEFAULT_ITR_START_SELECTOR_ANSWERS };
  const profile = params.get("profile");
  const plan = params.get("plan");

  if (profile === "capital-gains") {
    answers.capitalGains = "short-term";
  }

  if (profile === "business-freelance") {
    answers.salaryOrPension = false;
    answers.businessOrProfession = "profession";
    answers.presumptiveScheme = "44ADA";
  }

  if (profile === "nri-foreign") {
    answers.residentialStatus = "nri";
    answers.foreignIncomeOrAssets = true;
  }

  if (plan === "expert-assisted") {
    answers.otherSources = true;
  }

  return normalizeItrStartSelectorAnswers(answers);
}

function storageCandidates(): Storage[] {
  if (typeof window === "undefined") return [];

  const candidates: Storage[] = [];

  try {
    if (window.localStorage) {
      candidates.push(window.localStorage);
    }
  } catch {
    // localStorage can be unavailable in restricted browser modes.
  }

  try {
    if (window.sessionStorage) {
      candidates.push(window.sessionStorage);
    }
  } catch {
    // sessionStorage fallback is best effort too.
  }

  return candidates;
}

function getWritableStorage() {
  for (const storage of storageCandidates()) {
    try {
      const probeKey = `${ITR_START_SELECTOR_STORAGE_KEY}:probe`;
      storage.setItem(probeKey, "1");
      storage.removeItem(probeKey);
      return storage;
    } catch {
      // Try the next available browser storage.
    }
  }

  return null;
}

function generateFlowId(now: number) {
  const randomId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2, 10);

  return `itr-start-${now}-${randomId}`;
}

export function buildItrStartHandoffPayload({
  answers,
  source,
  now = Date.now(),
  flowId = generateFlowId(now),
}: {
  answers: Partial<ItrStartSelectorAnswers>;
  source: string;
  now?: number;
  flowId?: string;
}): ItrStartHandoffPayload {
  const normalizedAnswers = normalizeItrStartSelectorAnswers(answers);
  const draft = buildItrStartDraft(normalizedAnswers);

  return {
    version: ITR_START_HANDOFF_VERSION,
    flowId,
    createdAt: now,
    expiresAt: now + ITR_START_HANDOFF_TTL_MS,
    source,
    answers: normalizedAnswers,
    draft,
    recommendation: recommendItrForm(draft),
  };
}

export function clearItrStartHandoff() {
  for (const storage of storageCandidates()) {
    try {
      storage.removeItem(ITR_START_SELECTOR_STORAGE_KEY);
    } catch {
      // Ignore storage access failures; clearing is best effort.
    }
  }
}

export function writeItrStartHandoff(input: {
  answers: Partial<ItrStartSelectorAnswers>;
  source: string;
  now?: number;
}): ItrStartHandoffPayload {
  const payload = buildItrStartHandoffPayload(input);
  const storage = getWritableStorage();

  if (storage) {
    storage.setItem(ITR_START_SELECTOR_STORAGE_KEY, JSON.stringify(payload));
  }

  return payload;
}

export function readItrStartHandoff({ now = Date.now() }: { now?: number } = {}): ItrStartHandoffPayload | null {
  for (const storage of storageCandidates()) {
    let raw: string | null = null;
    try {
      raw = storage.getItem(ITR_START_SELECTOR_STORAGE_KEY);
    } catch {
      continue;
    }
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw) as Partial<ItrStartHandoffPayload>;
      if (parsed.version !== ITR_START_HANDOFF_VERSION || !parsed.answers || !parsed.source || !parsed.createdAt || !parsed.expiresAt) {
        clearItrStartHandoff();
        return null;
      }

      if (parsed.expiresAt <= now) {
        clearItrStartHandoff();
        return null;
      }

      return buildItrStartHandoffPayload({
        answers: parsed.answers,
        source: parsed.source,
        now: parsed.createdAt,
        flowId: parsed.flowId || generateFlowId(parsed.createdAt),
      });
    } catch {
      clearItrStartHandoff();
      return null;
    }
  }

  return null;
}
