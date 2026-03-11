// ELSS (Equity Linked Savings Scheme) Calculation Utilities

export interface SIPProjection {
  totalInvested: number;
  expectedValue: number;
  gains: number;
  ltcgTax: number;
  netValue: number;
  taxSaved: number;
  effectiveReturns: number;
  monthWiseData: { month: number; invested: number; value: number }[];
}

export interface LumpsumProjection {
  invested: number;
  expectedValue: number;
  gains: number;
  ltcgTax: number;
  netValue: number;
  taxSaved: number;
  effectiveReturns: number;
}

export interface TaxSavingsBreakdown {
  investment: number;
  deductionClaimed: number;
  taxSaved: number;
  effectiveCost: number;
  breakEvenReturn: number;
}

// Tax constants
const LTCG_EXEMPTION = 125000; // \u20B91.25 lakh exemption
const LTCG_TAX_RATE = 0.125; // 12.5%
const MAX_80C_DEDUCTION = 150000;
const LOCK_IN_YEARS = 3;

// Tax slabs (New Regime FY 2024-25)
const TAX_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 0.05 },
  { min: 700000, max: 1000000, rate: 0.10 },
  { min: 1000000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.20 },
  { min: 1500000, max: Infinity, rate: 0.30 },
];

// Get marginal tax rate
function getMarginalTaxRate(income: number): number {
  for (let i = TAX_SLABS.length - 1; i >= 0; i--) {
    if (income > TAX_SLABS[i].min) {
      return TAX_SLABS[i].rate;
    }
  }
  return 0;
}

// Calculate SIP returns
export function calculateSIPReturns(
  monthlyAmount: number,
  expectedReturn: number, // Annual percentage
  years: number,
  annualIncome: number
): SIPProjection {
  const monthlyRate = expectedReturn / 100 / 12;
  const totalMonths = years * 12;
  const yearlyInvestment = monthlyAmount * 12;
  
  // Calculate future value with SIP formula
  let totalValue = 0;
  let totalInvested = 0;
  const monthWiseData: SIPProjection['monthWiseData'] = [];
  
  for (let month = 1; month <= totalMonths; month++) {
    totalInvested += monthlyAmount;
    totalValue = (totalValue + monthlyAmount) * (1 + monthlyRate);
    
    if (month % 12 === 0 || month === totalMonths) {
      monthWiseData.push({
        month,
        invested: totalInvested,
        value: Math.round(totalValue),
      });
    }
  }
  
  const gains = totalValue - totalInvested;
  
  // Calculate LTCG tax (only on gains above \u20B91.25L)
  const taxableGains = Math.max(0, gains - LTCG_EXEMPTION);
  const ltcgTax = taxableGains * LTCG_TAX_RATE;
  
  const netValue = totalValue - ltcgTax;
  
  // Calculate tax saved under 80C
  const deductionPerYear = Math.min(yearlyInvestment, MAX_80C_DEDUCTION);
  const marginalRate = getMarginalTaxRate(annualIncome);
  const taxSavedPerYear = deductionPerYear * marginalRate * 1.04; // Include 4% cess
  const totalTaxSaved = taxSavedPerYear * years;
  
  // Effective returns including tax benefit
  const effectiveTotalValue = netValue + totalTaxSaved;
  const effectiveReturns = ((effectiveTotalValue / totalInvested) - 1) * 100;
  
  return {
    totalInvested: Math.round(totalInvested),
    expectedValue: Math.round(totalValue),
    gains: Math.round(gains),
    ltcgTax: Math.round(ltcgTax),
    netValue: Math.round(netValue),
    taxSaved: Math.round(totalTaxSaved),
    effectiveReturns: Math.round(effectiveReturns * 100) / 100,
    monthWiseData,
  };
}

// Calculate lumpsum returns
export function calculateLumpsumReturns(
  amount: number,
  expectedReturn: number,
  years: number,
  annualIncome: number
): LumpsumProjection {
  const annualRate = expectedReturn / 100;
  
  // Future value
  const expectedValue = amount * Math.pow(1 + annualRate, years);
  const gains = expectedValue - amount;
  
  // LTCG tax
  const taxableGains = Math.max(0, gains - LTCG_EXEMPTION);
  const ltcgTax = taxableGains * LTCG_TAX_RATE;
  
  const netValue = expectedValue - ltcgTax;
  
  // Tax saved
  const deduction = Math.min(amount, MAX_80C_DEDUCTION);
  const marginalRate = getMarginalTaxRate(annualIncome);
  const taxSaved = deduction * marginalRate * 1.04;
  
  // Effective returns
  const effectiveTotalValue = netValue + taxSaved;
  const effectiveReturns = ((effectiveTotalValue / amount) - 1) * 100 / years;
  
  return {
    invested: amount,
    expectedValue: Math.round(expectedValue),
    gains: Math.round(gains),
    ltcgTax: Math.round(ltcgTax),
    netValue: Math.round(netValue),
    taxSaved: Math.round(taxSaved),
    effectiveReturns: Math.round(effectiveReturns * 100) / 100,
  };
}

// Calculate tax savings breakdown
export function calculateTaxSavings(
  investment: number,
  annualIncome: number
): TaxSavingsBreakdown {
  const deductionClaimed = Math.min(investment, MAX_80C_DEDUCTION);
  const marginalRate = getMarginalTaxRate(annualIncome);
  const taxSaved = deductionClaimed * marginalRate * 1.04;
  const effectiveCost = investment - taxSaved;
  
  // Break-even return needed to recover investment after tax benefit
  const breakEvenReturn = ((investment / effectiveCost) - 1) * 100 / LOCK_IN_YEARS;
  
  return {
    investment,
    deductionClaimed,
    taxSaved: Math.round(taxSaved),
    effectiveCost: Math.round(effectiveCost),
    breakEvenReturn: Math.round(breakEvenReturn * 100) / 100,
  };
}

// Compare fund expense ratio impact
export function calculateExpenseImpact(
  investment: number,
  years: number,
  grossReturn: number,
  expenseRatio: number
): { grossValue: number; netValue: number; expenseCost: number } {
  const grossRate = grossReturn / 100;
  const netRate = (grossReturn - expenseRatio) / 100;
  
  const grossValue = investment * Math.pow(1 + grossRate, years);
  const netValue = investment * Math.pow(1 + netRate, years);
  const expenseCost = grossValue - netValue;
  
  return {
    grossValue: Math.round(grossValue),
    netValue: Math.round(netValue),
    expenseCost: Math.round(expenseCost),
  };
}

// Calculate XIRR for irregular investments
export function calculateXIRR(
  cashflows: { date: Date; amount: number }[],
  guess: number = 0.1
): number {
  const maxIterations = 100;
  const tolerance = 0.0001;
  
  let rate = guess;
  
  for (let i = 0; i < maxIterations; i++) {
    let npv = 0;
    let dnpv = 0;
    
    const firstDate = cashflows[0].date;
    
    for (const cf of cashflows) {
      const days = (cf.date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
      const years = days / 365;
      
      npv += cf.amount / Math.pow(1 + rate, years);
      dnpv -= years * cf.amount / Math.pow(1 + rate, years + 1);
    }
    
    const newRate = rate - npv / dnpv;
    
    if (Math.abs(newRate - rate) < tolerance) {
      return newRate * 100;
    }
    
    rate = newRate;
  }
  
  return rate * 100;
}

// ELSS vs other 80C investments comparison
export function compareWith80COptions(
  investment: number,
  years: number,
  elssReturn: number
): {
  elss: { value: number; taxBenefit: number };
  ppf: { value: number; taxBenefit: number };
  fd: { value: number; taxBenefit: number };
  nsc: { value: number; taxBenefit: number };
} {
  // Returns assumptions
  const ppfReturn = 7.1;
  const fdReturn = 6.5; // Tax-saver FD
  const nscReturn = 7.7;
  
  const marginalRate = 0.30; // Assume highest slab for comparison
  const deduction = Math.min(investment, MAX_80C_DEDUCTION);
  const taxBenefit = deduction * marginalRate * 1.04;
  
  // ELSS (with LTCG)
  const elssValue = investment * Math.pow(1 + elssReturn / 100, years);
  const elssGains = elssValue - investment;
  const elssLTCG = Math.max(0, elssGains - LTCG_EXEMPTION) * LTCG_TAX_RATE;
  
  // PPF (tax-free returns)
  const ppfValue = investment * Math.pow(1 + ppfReturn / 100, years);
  
  // FD (interest taxable)
  const fdGrossValue = investment * Math.pow(1 + fdReturn / 100, years);
  const fdInterest = fdGrossValue - investment;
  const fdTax = fdInterest * marginalRate;
  const fdValue = fdGrossValue - fdTax;
  
  // NSC (interest taxable but accrued)
  const nscValue = investment * Math.pow(1 + nscReturn / 100, years);
  const nscInterest = nscValue - investment;
  const nscTax = nscInterest * marginalRate;
  
  return {
    elss: { value: Math.round(elssValue - elssLTCG), taxBenefit: Math.round(taxBenefit) },
    ppf: { value: Math.round(ppfValue), taxBenefit: Math.round(taxBenefit) },
    fd: { value: Math.round(fdValue), taxBenefit: Math.round(taxBenefit) },
    nsc: { value: Math.round(nscValue - nscTax), taxBenefit: Math.round(taxBenefit) },
  };
}

