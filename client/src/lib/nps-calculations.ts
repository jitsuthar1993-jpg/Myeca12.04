// NPS (National Pension System) Tax Calculation Utilities

export interface NPSContribution {
  employeeContribution: number; // Annual employee contribution
  employerContribution: number; // Annual employer contribution
  additionalContribution: number; // Additional voluntary contribution for 80CCD(1B)
}

export interface NPSProjectionInput {
  currentAge: number;
  retirementAge: number;
  currentCorpus: number;
  monthlyContribution: number;
  expectedReturn: number; // Annual percentage
  annuityPercentage: number; // Percentage to be invested in annuity (min 40%)
  annuityReturn: number; // Expected annuity return rate
}

export interface NPSTaxBenefit {
  section80CCD1: number; // Within 80C limit
  section80CCD1B: number; // Additional \u20B950,000
  section80CCD2: number; // Employer contribution
  totalDeduction: number;
  taxSaved: number;
  effectiveReturn: number; // Return including tax benefit
}

export interface NPSProjection {
  corpusAtRetirement: number;
  lumpSumWithdrawal: number; // 60% tax-free
  annuityCorpus: number; // 40% minimum for annuity
  monthlyPension: number;
  yearWiseProjection: { year: number; age: number; corpus: number; contribution: number }[];
  totalContribution: number;
  totalGains: number;
}

export interface NPSComparison {
  nps: { corpus: number; taxBenefit: number; netReturn: number };
  ppf: { corpus: number; taxBenefit: number; netReturn: number };
  elss: { corpus: number; taxBenefit: number; netReturn: number };
}

// Tax slabs for tax saving calculation (FY 2024-25, New Regime)
const TAX_SLABS_NEW = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 0.05 },
  { min: 700000, max: 1000000, rate: 0.10 },
  { min: 1000000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.20 },
  { min: 1500000, max: Infinity, rate: 0.30 },
];

// NPS contribution limits
export const NPS_LIMITS = {
  section80CCD1_limit: 150000, // Within 80C overall limit
  section80CCD1B_limit: 50000, // Additional deduction
  section80CCD2_limit_private: 0.10, // 10% of salary for private
  section80CCD2_limit_govt: 0.14, // 14% of salary for government
  minAnnuityPercentage: 0.40, // 40% must go to annuity
  taxFreeWithdrawal: 0.60, // 60% is tax-free
};

// Calculate marginal tax rate based on income
function getMarginalTaxRate(income: number): number {
  for (let i = TAX_SLABS_NEW.length - 1; i >= 0; i--) {
    if (income > TAX_SLABS_NEW[i].min) {
      return TAX_SLABS_NEW[i].rate;
    }
  }
  return 0;
}

// Calculate NPS tax benefits
export function calculateNPSTaxBenefits(
  contribution: NPSContribution,
  annualIncome: number,
  isGovernmentEmployee: boolean = false,
  existing80CDeductions: number = 0
): NPSTaxBenefit {
  const { employeeContribution, employerContribution, additionalContribution } = contribution;
  
  // Section 80CCD(1) - Employee contribution (within 80C limit)
  const available80CLimit = Math.max(0, NPS_LIMITS.section80CCD1_limit - existing80CDeductions);
  const section80CCD1 = Math.min(employeeContribution, available80CLimit, annualIncome * 0.10);
  
  // Section 80CCD(1B) - Additional \u20B950,000
  const section80CCD1B = Math.min(additionalContribution, NPS_LIMITS.section80CCD1B_limit);
  
  // Section 80CCD(2) - Employer contribution
  const maxEmployerDeduction = annualIncome * (isGovernmentEmployee ? NPS_LIMITS.section80CCD2_limit_govt : NPS_LIMITS.section80CCD2_limit_private);
  const section80CCD2 = Math.min(employerContribution, maxEmployerDeduction);
  
  const totalDeduction = section80CCD1 + section80CCD1B + section80CCD2;
  
  // Calculate tax saved based on marginal rate
  const marginalRate = getMarginalTaxRate(annualIncome);
  const taxSaved = totalDeduction * marginalRate * 1.04; // Include 4% cess
  
  // Calculate effective return (tax benefit as % of contribution)
  const totalContribution = employeeContribution + additionalContribution;
  const effectiveReturn = totalContribution > 0 ? (taxSaved / totalContribution) * 100 : 0;
  
  return {
    section80CCD1,
    section80CCD1B,
    section80CCD2,
    totalDeduction,
    taxSaved: Math.round(taxSaved),
    effectiveReturn: Math.round(effectiveReturn * 100) / 100,
  };
}

// Project NPS corpus at retirement
export function projectNPSCorpus(input: NPSProjectionInput): NPSProjection {
  const { currentAge, retirementAge, currentCorpus, monthlyContribution, expectedReturn, annuityPercentage, annuityReturn } = input;
  
  const yearsToRetirement = retirementAge - currentAge;
  const monthlyRate = expectedReturn / 100 / 12;
  const yearlyContribution = monthlyContribution * 12;
  
  let corpus = currentCorpus;
  const yearWiseProjection: NPSProjection['yearWiseProjection'] = [];
  let totalContribution = currentCorpus;
  
  for (let year = 1; year <= yearsToRetirement; year++) {
    // Add contributions and calculate growth
    for (let month = 0; month < 12; month++) {
      corpus = corpus * (1 + monthlyRate) + monthlyContribution;
    }
    totalContribution += yearlyContribution;
    
    yearWiseProjection.push({
      year,
      age: currentAge + year,
      corpus: Math.round(corpus),
      contribution: totalContribution,
    });
  }
  
  const corpusAtRetirement = Math.round(corpus);
  const actualAnnuityPercentage = Math.max(annuityPercentage / 100, NPS_LIMITS.minAnnuityPercentage);
  
  // Calculate withdrawal and pension
  const lumpSumWithdrawal = Math.round(corpusAtRetirement * (1 - actualAnnuityPercentage));
  const annuityCorpus = Math.round(corpusAtRetirement * actualAnnuityPercentage);
  
  // Estimate monthly pension (simple annuity calculation)
  const monthlyPension = Math.round((annuityCorpus * (annuityReturn / 100)) / 12);
  
  return {
    corpusAtRetirement,
    lumpSumWithdrawal,
    annuityCorpus,
    monthlyPension,
    yearWiseProjection,
    totalContribution: Math.round(totalContribution),
    totalGains: Math.round(corpusAtRetirement - totalContribution),
  };
}

// Compare NPS with PPF and ELSS
export function compareInvestments(
  monthlyInvestment: number,
  years: number,
  annualIncome: number
): NPSComparison {
  const yearlyInvestment = monthlyInvestment * 12;
  
  // NPS: Expected return 10%, tax benefit under 80CCD(1B)
  const npsReturn = 0.10;
  const npsCorpus = calculateFutureValue(monthlyInvestment, npsReturn / 12, years * 12);
  const npsTaxBenefit = Math.min(yearlyInvestment, 50000) * getMarginalTaxRate(annualIncome) * years;
  
  // PPF: 7.1% return, tax-free, under 80C
  const ppfReturn = 0.071;
  const ppfCorpus = calculateFutureValue(monthlyInvestment, ppfReturn / 12, years * 12);
  const ppfTaxBenefit = Math.min(yearlyInvestment, 150000) * getMarginalTaxRate(annualIncome) * years;
  
  // ELSS: Expected return 12%, LTCG tax on gains
  const elssReturn = 0.12;
  const elssCorpus = calculateFutureValue(monthlyInvestment, elssReturn / 12, years * 12);
  const elssGains = elssCorpus - (yearlyInvestment * years);
  const elssLTCG = Math.max(0, elssGains - 125000) * 0.125; // 12.5% LTCG above \u20B91.25L
  const elssTaxBenefit = Math.min(yearlyInvestment, 150000) * getMarginalTaxRate(annualIncome) * years;
  
  return {
    nps: {
      corpus: Math.round(npsCorpus),
      taxBenefit: Math.round(npsTaxBenefit),
      netReturn: Math.round(npsCorpus + npsTaxBenefit),
    },
    ppf: {
      corpus: Math.round(ppfCorpus),
      taxBenefit: Math.round(ppfTaxBenefit),
      netReturn: Math.round(ppfCorpus + ppfTaxBenefit),
    },
    elss: {
      corpus: Math.round(elssCorpus - elssLTCG),
      taxBenefit: Math.round(elssTaxBenefit),
      netReturn: Math.round(elssCorpus - elssLTCG + elssTaxBenefit),
    },
  };
}

// Calculate future value with monthly contributions
function calculateFutureValue(monthlyPayment: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return monthlyPayment * months;
  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}

// NPS Asset allocation options
export const NPS_ASSET_CLASSES = {
  E: { name: 'Equity', maxAllocation: 75, expectedReturn: 12 },
  C: { name: 'Corporate Bonds', maxAllocation: 100, expectedReturn: 9 },
  G: { name: 'Government Securities', maxAllocation: 100, expectedReturn: 7 },
  A: { name: 'Alternate Assets', maxAllocation: 5, expectedReturn: 8 },
};

// NPS Fund Managers
export const NPS_FUND_MANAGERS = [
  { id: 'sbi', name: 'SBI Pension Funds', aum: '\u20B92.5L Cr' },
  { id: 'lic', name: 'LIC Pension Fund', aum: '\u20B91.8L Cr' },
  { id: 'uti', name: 'UTI Retirement Solutions', aum: '\u20B945K Cr' },
  { id: 'hdfc', name: 'HDFC Pension Management', aum: '\u20B965K Cr' },
  { id: 'icici', name: 'ICICI Prudential Pension', aum: '\u20B955K Cr' },
  { id: 'kotak', name: 'Kotak Mahindra Pension', aum: '\u20B930K Cr' },
  { id: 'aditya', name: 'Aditya Birla Sun Life', aum: '\u20B915K Cr' },
];

// Tier comparison
export const NPS_TIERS = {
  tier1: {
    name: 'Tier-I',
    minContribution: 500,
    lockIn: 'Till retirement (60 years)',
    withdrawal: 'Partial allowed after 3 years',
    taxBenefit: 'Yes (80CCD)',
    exitTax: '60% tax-free, 40% annuity',
  },
  tier2: {
    name: 'Tier-II',
    minContribution: 250,
    lockIn: 'None (except for govt. employees)',
    withdrawal: 'Anytime',
    taxBenefit: 'Only for govt. employees',
    exitTax: 'As per income slab',
  },
};

