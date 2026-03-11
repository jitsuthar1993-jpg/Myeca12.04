export interface TaxSlabs {
  min: number;
  max: number;
  rate: number;
}

export interface TaxCalculationResult {
  grossIncome: number;
  taxableIncome: number;
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
