export interface TaxSlabs {
  min: number;
  max: number;
  rate: number;
}

export interface TaxSlabBreakdown {
  label: string;
  min: number;
  max: number;
  rate: number;
  taxableAmount: number;
  tax: number;
}

export interface SpecialRateTaxBreakdown {
  key: string;
  label: string;
  taxableAmount: number;
  rate: number;
  tax: number;
  surchargeCapRate?: number;
}

export interface TaxCalculationResult {
  grossIncome: number;
  normalGrossIncome: number;
  specialRateIncome: number;
  standardDeduction: number;
  eligibleDeductions: number;
  deductionBreakdown: {
    section80C: number;
    section80D: number;
    otherDeductions: number;
    section80TTA: number;
  };
  taxableIncome: number;
  normalTaxableIncome: number;
  specialRateTaxableIncome: number;
  slabBreakdown: TaxSlabBreakdown[];
  specialRateBreakdown: SpecialRateTaxBreakdown[];
  normalSlabTax: number;
  specialRateTax: number;
  taxBeforeRebate: number;
  rebate87A: number;
  marginalRelief: number;
  taxAfterRebate: number;
  surchargeBeforeRelief: number;
  surchargeMarginalRelief: number;
  surcharge: number;
  cess: number;
  taxBeforeCess: number;
  grossTaxLiability: number;
  taxCredits: number;
  refundDue: number;
  taxPayable: number;
  netIncome: number;
  breakdown: {
    slab1: number;
    slab2: number;
    slab3: number;
    slab4: number;
  };
}

export interface IncomeTaxInputs {
  income: number;
  regime: 'old' | 'new';
  deductions: number;
}

export interface HRAInputs {
  salary: number;
  hra: number;
  rent: number;
  city: 'metro' | 'non-metro';
}

export interface SIPInputs {
  monthlyAmount: number;
  years: number;
  expectedReturn: number;
}

export interface EMIInputs {
  principal: number;
  rate: number;
  tenure: number;
}

export interface CalculatorFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}
