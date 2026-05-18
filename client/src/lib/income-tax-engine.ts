import type { SpecialRateTaxBreakdown, TaxCalculationResult, TaxSlabBreakdown } from "@/types/calculator";
import {
  DEFAULT_ASSESSMENT_YEAR,
  HEALTH_AND_EDUCATION_CESS_RATE,
  REBATE_87A_BY_REGIME,
  STANDARD_DEDUCTION_BY_REGIME,
  formatSlabRange,
  getAgeCategory,
  getSlabsForRegime,
  type AgeCategory,
  type TaxRegime,
} from "@/lib/tax-law-reference";

export type ResidentialStatus = "resident" | "nonResident";

export interface IndividualTaxProfile {
  residentialStatus?: ResidentialStatus;
  age?: number;
  ageCategory?: AgeCategory;
}

export interface IndividualIncomeHeads {
  salary?: number;
  rentalIncome?: number;
  savingsInterest?: number;
  otherIncome?: number;
  stcg111a?: number;
  ltcg112a?: number;
  ltcg112?: number;
  cryptoAndWinnings?: number;
  dividendSurchargeCapIncome?: number;
}

export interface IndividualDeductionInputs {
  section80C?: number;
  section80D?: number;
  otherDeductions?: number;
  section80TTA?: number;
  oldRegimeDeductions?: number;
}

export interface IndividualTaxCreditInputs {
  tdsTcs?: number;
  advanceTax?: number;
  selfAssessmentTax?: number;
}

export interface IndividualTaxEngineInputs {
  assessmentYear?: string;
  regime: TaxRegime;
  profile?: IndividualTaxProfile;
  income: IndividualIncomeHeads;
  deductions?: IndividualDeductionInputs;
  taxCredits?: IndividualTaxCreditInputs;
}

interface TaxComponent {
  tax: number;
  surchargeCapRate: number;
}

const NEW_REGIME_MAX_SURCHARGE_RATE = 0.25;
const OLD_REGIME_MAX_SURCHARGE_RATE = 0.37;
const SPECIAL_SURCHARGE_CAP_RATE = 0.15;
const DEFAULT_SPECIAL_LTCG_EXEMPTION_112A = 125000;

const roundAmount = (amount: number): number => Math.round(Math.max(0, amount));
const safeAmount = (amount: number | undefined): number => Math.max(0, Number(amount) || 0);

const ageFromCategory = (ageCategory?: AgeCategory): number => {
  if (ageCategory === "superSenior") return 80;
  if (ageCategory === "senior") return 60;
  return 30;
};

const buildSlabBreakdown = (
  regime: TaxRegime,
  assessmentYear: string,
  age: number,
  taxableIncome: number,
): TaxSlabBreakdown[] => {
  const slabs = getSlabsForRegime(regime, assessmentYear, age);

  return slabs.map((slab) => {
    const taxableAmount = taxableIncome > slab.min
      ? Math.max(0, Math.min(taxableIncome, slab.max) - slab.min)
      : 0;

    return {
      label: formatSlabRange(slab),
      min: slab.min,
      max: slab.max,
      rate: slab.rate,
      taxableAmount: roundAmount(taxableAmount),
      tax: roundAmount(taxableAmount * slab.rate),
    };
  });
};

const totalTaxFromBreakdown = (breakdown: TaxSlabBreakdown[]): number =>
  breakdown.reduce((total, slab) => total + slab.tax, 0);

const getSurchargeRate = (totalIncome: number, regime: TaxRegime): { rate: number; threshold: number } => {
  if (totalIncome > 50000000) return { rate: regime === "new" ? 0.25 : 0.37, threshold: 50000000 };
  if (totalIncome > 20000000) return { rate: 0.25, threshold: 20000000 };
  if (totalIncome > 10000000) return { rate: 0.15, threshold: 10000000 };
  if (totalIncome > 5000000) return { rate: 0.1, threshold: 5000000 };
  return { rate: 0, threshold: 0 };
};

const getRegimeSurchargeCap = (regime: TaxRegime): number =>
  regime === "new" ? NEW_REGIME_MAX_SURCHARGE_RATE : OLD_REGIME_MAX_SURCHARGE_RATE;

const computeSurcharge = (components: TaxComponent[], surchargeRate: number): number =>
  components.reduce((total, component) => {
    const rate = Math.min(surchargeRate, component.surchargeCapRate);
    return total + component.tax * rate;
  }, 0);

const getNormalTaxAtThreshold = (
  regime: TaxRegime,
  assessmentYear: string,
  age: number,
  threshold: number,
): number => totalTaxFromBreakdown(buildSlabBreakdown(regime, assessmentYear, age, threshold));

export function computeIndividualIncomeTax(inputs: IndividualTaxEngineInputs): TaxCalculationResult {
  const assessmentYear = inputs.assessmentYear ?? DEFAULT_ASSESSMENT_YEAR;
  const { regime } = inputs;
  const income = inputs.income;
  const deductions = inputs.deductions ?? {};
  const profile = inputs.profile ?? {};
  const age = profile.age ?? ageFromCategory(profile.ageCategory);
  const ageCategory = profile.ageCategory ?? getAgeCategory(age);
  const residentialStatus = profile.residentialStatus ?? "resident";

  const salary = safeAmount(income.salary);
  const rentalIncome = safeAmount(income.rentalIncome);
  const savingsInterest = safeAmount(income.savingsInterest);
  const otherIncome = safeAmount(income.otherIncome);
  const dividendSurchargeCapIncome = safeAmount(income.dividendSurchargeCapIncome);
  const stcg111a = safeAmount(income.stcg111a);
  const ltcg112a = safeAmount(income.ltcg112a);
  const ltcg112 = safeAmount(income.ltcg112);
  const cryptoAndWinnings = safeAmount(income.cryptoAndWinnings);

  const normalGrossIncome = salary + rentalIncome + savingsInterest + otherIncome + dividendSurchargeCapIncome;
  const specialRateIncome = stcg111a + ltcg112a + ltcg112 + cryptoAndWinnings;
  const grossIncome = normalGrossIncome + specialRateIncome;
  const standardDeduction = Math.min(salary, STANDARD_DEDUCTION_BY_REGIME[regime]);

  const section80C = safeAmount(deductions.section80C);
  const section80D = safeAmount(deductions.section80D);
  const otherOldDeductions = safeAmount(deductions.otherDeductions) + safeAmount(deductions.oldRegimeDeductions);
  const section80TTA = Math.min(savingsInterest, safeAmount(deductions.section80TTA));
  const eligibleDeductions = regime === "old"
    ? section80C + section80D + otherOldDeductions + section80TTA
    : 0;

  const normalTaxableIncome = Math.max(0, normalGrossIncome - standardDeduction - eligibleDeductions);
  const taxableLtcg112a = Math.max(0, ltcg112a - DEFAULT_SPECIAL_LTCG_EXEMPTION_112A);
  const specialRateBreakdown: SpecialRateTaxBreakdown[] = [
    {
      key: "stcg111a",
      label: "STCG u/s 111A",
      taxableAmount: roundAmount(stcg111a),
      rate: 0.2,
      tax: roundAmount(stcg111a * 0.2),
      surchargeCapRate: SPECIAL_SURCHARGE_CAP_RATE,
    },
    {
      key: "ltcg112a",
      label: "LTCG u/s 112A after exemption",
      taxableAmount: roundAmount(taxableLtcg112a),
      rate: 0.125,
      tax: roundAmount(taxableLtcg112a * 0.125),
      surchargeCapRate: SPECIAL_SURCHARGE_CAP_RATE,
    },
    {
      key: "ltcg112",
      label: "Other LTCG u/s 112",
      taxableAmount: roundAmount(ltcg112),
      rate: 0.125,
      tax: roundAmount(ltcg112 * 0.125),
      surchargeCapRate: SPECIAL_SURCHARGE_CAP_RATE,
    },
    {
      key: "cryptoAndWinnings",
      label: "Crypto / winnings",
      taxableAmount: roundAmount(cryptoAndWinnings),
      rate: 0.3,
      tax: roundAmount(cryptoAndWinnings * 0.3),
      surchargeCapRate: getRegimeSurchargeCap(regime),
    },
  ];

  const slabBreakdown = buildSlabBreakdown(regime, assessmentYear, age, normalTaxableIncome);
  const normalSlabTax = totalTaxFromBreakdown(slabBreakdown);
  const specialRateTax = specialRateBreakdown.reduce((total, item) => total + item.tax, 0);
  const specialRateTaxableIncome = specialRateBreakdown.reduce((total, item) => total + item.taxableAmount, 0);
  const taxableIncome = normalTaxableIncome + specialRateTaxableIncome;
  const taxBeforeRebate = normalSlabTax + specialRateTax;

  let rebate87A = 0;
  let marginalRelief = 0;
  let normalTaxAfterRebate = normalSlabTax;

  const isResidentIndividual = residentialStatus === "resident";
  if (isResidentIndividual && regime === "new") {
    const { incomeLimit: threshold, maxRebate } = assessmentYear === DEFAULT_ASSESSMENT_YEAR
      ? REBATE_87A_BY_REGIME.new
      : { incomeLimit: 700000, maxRebate: 25000 };

    if (taxableIncome <= threshold) {
      rebate87A = Math.min(normalSlabTax, maxRebate);
      normalTaxAfterRebate = Math.max(0, normalSlabTax - rebate87A);
    } else {
      const excessIncome = taxableIncome - threshold;
      if (normalSlabTax > excessIncome) {
        marginalRelief = normalSlabTax - excessIncome;
        normalTaxAfterRebate = excessIncome;
      }
    }
  } else if (
    isResidentIndividual
    && regime === "old"
    && taxableIncome <= REBATE_87A_BY_REGIME.old.incomeLimit
  ) {
    rebate87A = Math.min(normalSlabTax, REBATE_87A_BY_REGIME.old.maxRebate);
    normalTaxAfterRebate = Math.max(0, normalSlabTax - rebate87A);
  }

  const taxAfterRebate = normalTaxAfterRebate + specialRateTax;
  const { rate: surchargeRate, threshold: surchargeThreshold } = getSurchargeRate(taxableIncome, regime);
  const componentCap = getRegimeSurchargeCap(regime);
  const dividendTaxShare = normalTaxableIncome > 0
    ? normalTaxAfterRebate * (Math.min(dividendSurchargeCapIncome, normalTaxableIncome) / normalTaxableIncome)
    : 0;
  const regularNormalTax = Math.max(0, normalTaxAfterRebate - dividendTaxShare);
  const surchargeBeforeRelief = computeSurcharge(
    [
      { tax: regularNormalTax, surchargeCapRate: componentCap },
      { tax: dividendTaxShare, surchargeCapRate: SPECIAL_SURCHARGE_CAP_RATE },
      ...specialRateBreakdown.map((item) => ({
        tax: item.tax,
        surchargeCapRate: item.surchargeCapRate ?? componentCap,
      })),
    ],
    surchargeRate,
  );

  let surchargeMarginalRelief = 0;
  let surcharge = surchargeBeforeRelief;
  if (surchargeThreshold > 0) {
    const thresholdTax = getNormalTaxAtThreshold(regime, assessmentYear, age, surchargeThreshold);
    const maxTaxAndSurcharge = thresholdTax + Math.max(0, taxableIncome - surchargeThreshold);
    const currentTaxAndSurcharge = taxAfterRebate + surchargeBeforeRelief;

    if (currentTaxAndSurcharge > maxTaxAndSurcharge) {
      surchargeMarginalRelief = Math.min(surchargeBeforeRelief, currentTaxAndSurcharge - maxTaxAndSurcharge);
      surcharge = Math.max(0, surchargeBeforeRelief - surchargeMarginalRelief);
    }
  }

  const taxBeforeCess = taxAfterRebate + surcharge;
  const cess = taxBeforeCess * HEALTH_AND_EDUCATION_CESS_RATE;
  const grossTaxLiability = taxBeforeCess + cess;
  const taxCredits = safeAmount(inputs.taxCredits?.tdsTcs)
    + safeAmount(inputs.taxCredits?.advanceTax)
    + safeAmount(inputs.taxCredits?.selfAssessmentTax);
  const taxPayable = Math.max(0, grossTaxLiability - taxCredits);
  const refundDue = Math.max(0, taxCredits - grossTaxLiability);

  return {
    grossIncome: roundAmount(grossIncome),
    normalGrossIncome: roundAmount(normalGrossIncome),
    specialRateIncome: roundAmount(specialRateIncome),
    standardDeduction: roundAmount(standardDeduction),
    eligibleDeductions: roundAmount(eligibleDeductions),
    deductionBreakdown: {
      section80C: regime === "old" ? roundAmount(section80C) : 0,
      section80D: regime === "old" ? roundAmount(section80D) : 0,
      otherDeductions: regime === "old" ? roundAmount(otherOldDeductions) : 0,
      section80TTA: regime === "old" ? roundAmount(section80TTA) : 0,
    },
    taxableIncome: roundAmount(taxableIncome),
    normalTaxableIncome: roundAmount(normalTaxableIncome),
    specialRateTaxableIncome: roundAmount(specialRateTaxableIncome),
    slabBreakdown,
    specialRateBreakdown,
    normalSlabTax: roundAmount(normalSlabTax),
    specialRateTax: roundAmount(specialRateTax),
    taxBeforeRebate: roundAmount(taxBeforeRebate),
    rebate87A: roundAmount(rebate87A),
    marginalRelief: roundAmount(marginalRelief),
    taxAfterRebate: roundAmount(taxAfterRebate),
    surchargeBeforeRelief: roundAmount(surchargeBeforeRelief),
    surchargeMarginalRelief: roundAmount(surchargeMarginalRelief),
    surcharge: roundAmount(surcharge),
    cess: roundAmount(cess),
    taxBeforeCess: roundAmount(taxBeforeCess),
    grossTaxLiability: roundAmount(grossTaxLiability),
    taxCredits: roundAmount(taxCredits),
    refundDue: roundAmount(refundDue),
    taxPayable: roundAmount(taxPayable),
    netIncome: roundAmount(grossIncome - taxPayable),
    breakdown: {
      slab1: slabBreakdown[0]?.tax ?? 0,
      slab2: slabBreakdown[1]?.tax ?? 0,
      slab3: slabBreakdown[2]?.tax ?? 0,
      slab4: slabBreakdown[3]?.tax ?? 0,
    },
  };
}
