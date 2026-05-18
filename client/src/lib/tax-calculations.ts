import { TaxCalculationResult, IncomeTaxInputs } from "@/types/calculator";
import { tdsRulesByAY, assessmentYears, type AssessmentYear, type TDSIncomeType } from "@/data/tds-rules";
import { DEFAULT_ASSESSMENT_YEAR } from "@/lib/tax-law-reference";
import { computeIndividualIncomeTax, type ResidentialStatus } from "@/lib/income-tax-engine";

export function calculateIncomeTax(inputs: IncomeTaxInputs & {
  age?: number;
  assessmentYear?: string;
  salaryIncome?: number;
  residentialStatus?: ResidentialStatus;
}): TaxCalculationResult {
  const {
    income,
    regime,
    deductions,
    age = 30,
    assessmentYear = DEFAULT_ASSESSMENT_YEAR,
    salaryIncome,
    residentialStatus = "resident",
  } = inputs;

  const salary = Math.max(0, salaryIncome ?? income);
  const otherIncome = Math.max(0, income - salary);

  return computeIndividualIncomeTax({
    assessmentYear,
    regime,
    profile: { age, residentialStatus },
    income: {
      salary,
      otherIncome,
    },
    deductions: {
      oldRegimeDeductions: deductions,
    },
  });
}

export function calculateHRA(salary: number, hra: number, rent: number, city: 'metro' | 'non-metro'): {
  exemption: number;
  taxableHRA: number;
  savings: number;
  breakdown: {
    actualHRA: number;
    rentMinus10Percent: number;
    cityAllowance: number;
    minimumValue: number;
  };
} {
  const cityAllowanceRate = city === 'metro' ? 0.5 : 0.4;
  
  const actualHRA = hra;
  const rentMinus10Percent = Math.max(0, rent - (salary * 0.1));
  const cityAllowance = salary * cityAllowanceRate;
  
  const exemption = Math.max(0, Math.min(actualHRA, rentMinus10Percent, cityAllowance));
  const taxableHRA = hra - exemption;
  const savings = exemption * 0.3; // Assuming 30% tax bracket
  
  return {
    exemption: Math.round(exemption),
    taxableHRA: Math.round(taxableHRA),
    savings: Math.round(savings),
    breakdown: {
      actualHRA: Math.round(actualHRA),
      rentMinus10Percent: Math.round(rentMinus10Percent),
      cityAllowance: Math.round(cityAllowance),
      minimumValue: Math.round(exemption)
    }
  };
}

export function calculateSIP(monthlyAmount: number, years: number, expectedReturn: number): {
  totalInvestment: number;
  maturityAmount: number;
  totalGains: number;
  annualizedReturn: number;
  monthlyBreakdown: Array<{
    month: number;
    investment: number;
    balance: number;
    gains: number;
  }>;
} {
  const monthlyRate = expectedReturn / 12 / 100;
  const totalMonths = years * 12;
  
  const maturityAmount = monthlyAmount * (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
  const totalInvestment = monthlyAmount * totalMonths;
  const totalGains = maturityAmount - totalInvestment;
  const annualizedReturn = (Math.pow(maturityAmount / totalInvestment, 1 / years) - 1) * 100;
  
  // Monthly breakdown for chart
  const monthlyBreakdown = [];
  let cumulativeInvestment = 0;
  let cumulativeBalance = 0;
  
  for (let month = 1; month <= Math.min(totalMonths, 60); month++) { // Show first 5 years
    cumulativeInvestment += monthlyAmount;
    cumulativeBalance = cumulativeBalance * (1 + monthlyRate) + monthlyAmount;
    
    monthlyBreakdown.push({
      month,
      investment: cumulativeInvestment,
      balance: Math.round(cumulativeBalance),
      gains: Math.round(cumulativeBalance - cumulativeInvestment)
    });
  }
  
  return {
    totalInvestment: Math.round(totalInvestment),
    maturityAmount: Math.round(maturityAmount),
    totalGains: Math.round(totalGains),
    annualizedReturn: Math.round(annualizedReturn * 100) / 100,
    monthlyBreakdown
  };
}

export function calculateEMI(principal: number, rate: number, tenure: number): {
  emi: number;
  totalPayment: number;
  totalInterest: number;
  monthlyBreakdown: Array<{
    month: number;
    emi: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }>;
} {
  const monthlyRate = rate / 12 / 100;
  const totalMonths = tenure * 12;
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
              (Math.pow(1 + monthlyRate, totalMonths) - 1);
  
  const totalPayment = emi * totalMonths;
  const totalInterest = totalPayment - principal;
  
  // Monthly breakdown for amortization schedule
  const monthlyBreakdown = [];
  let remainingBalance = principal;
  
  for (let month = 1; month <= Math.min(totalMonths, 60); month++) { // Show first 5 years
    const interestPaid = remainingBalance * monthlyRate;
    const principalPaid = emi - interestPaid;
    remainingBalance = remainingBalance - principalPaid;
    
    monthlyBreakdown.push({
      month,
      emi: Math.round(emi),
      principalPaid: Math.round(principalPaid),
      interestPaid: Math.round(interestPaid),
      remainingBalance: Math.round(Math.max(0, remainingBalance))
    });
  }
  
  return {
    emi: Math.round(emi),
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    monthlyBreakdown
  };
}

// TDS Calculator (legacy implementation removed)
// See AY-aware implementation of calculateTDS below.

// Fixed Deposit Calculator
export function calculateFD(principal: number, rate: number, tenure: number, compoundingFrequency: number = 4): {
  maturityAmount: number;
  totalInterest: number;
  effectiveRate: number;
  yearlyBreakdown: Array<{
    year: number;
    principal: number;
    interest: number;
    total: number;
  }>;
} {
  // Sanitize inputs to enforce positive-only behavior
  const safePrincipal = Math.max(0, principal);
  const safeRate = Math.max(0, rate);
  const safeTenure = Math.max(0, tenure);
  const n = Math.max(1, compoundingFrequency); // At least annually
  const r = safeRate / 100;
  
  const maturityAmountRaw = safePrincipal * Math.pow(1 + r / n, n * safeTenure);
  const maturityAmount = Math.max(0, maturityAmountRaw);
  const totalInterestRaw = maturityAmount - safePrincipal;
  const totalInterest = Math.max(0, totalInterestRaw);
  const effectiveRateRaw = (Math.pow(1 + r / n, n) - 1) * 100;
  const effectiveRate = Math.max(0, Math.round(effectiveRateRaw * 100) / 100);
  
  // Yearly breakdown
  const yearlyBreakdown = [] as Array<{ year: number; principal: number; interest: number; total: number }>;
  let currentPrincipal = safePrincipal;
  
  for (let year = 1; year <= safeTenure; year++) {
    const yearEndAmountRaw = safePrincipal * Math.pow(1 + r / n, n * year);
    const yearEndAmount = Math.max(0, yearEndAmountRaw);
    const yearInterest = Math.max(0, yearEndAmount - currentPrincipal);
    
    yearlyBreakdown.push({
      year,
      principal: Math.round(Math.max(0, currentPrincipal)),
      interest: Math.round(yearInterest),
      total: Math.round(yearEndAmount)
    });
    
    currentPrincipal = yearEndAmount;
  }
  
  return {
    maturityAmount: Math.round(maturityAmount),
    totalInterest: Math.round(totalInterest),
    effectiveRate,
    yearlyBreakdown
  };
}

// PPF Calculator
export function calculatePPF(annualInvestment: number, years: number = 15): {
  totalInvestment: number;
  maturityAmount: number;
  totalInterest: number;
  yearlyBreakdown: Array<{
    year: number;
    investment: number;
    interest: number;
    balance: number;
  }>;
} {
  const rate = 7.1 / 100; // Current PPF rate
  const maxTenure = 15;
  const actualYears = Math.min(years, maxTenure);
  
  let balance = 0;
  let totalInvestment = 0;
  const yearlyBreakdown = [];
  
  for (let year = 1; year <= actualYears; year++) {
    const investment = Math.min(annualInvestment, 150000); // Max limit
    totalInvestment += investment;
    
    const interest = balance * rate;
    balance = balance + investment + interest;
    
    yearlyBreakdown.push({
      year,
      investment: Math.round(investment),
      interest: Math.round(interest),
      balance: Math.round(balance)
    });
  }
  
  const maturityAmount = balance;
  const totalInterest = maturityAmount - totalInvestment;
  
  return {
    totalInvestment: Math.round(totalInvestment),
    maturityAmount: Math.round(maturityAmount),
    totalInterest: Math.round(totalInterest),
    yearlyBreakdown
  };
}

// Capital Gains Calculator
// Updated with Budget 2024 rates and LTCG exemption
export function calculateCapitalGains(
  purchasePrice: number,
  salePrice: number,
  purchaseDate: Date,
  saleDate: Date,
  assetType: 'equity' | 'property' | 'gold' | 'bonds'
): {
  capitalGain: number;
  gainType: 'STCG' | 'LTCG';
  taxRate: number;
  taxPayable: number;
  netGain: number;
  holdingPeriod: number;
  holdingPeriodDays: number;
  ltcgExemption: number;
  taxableGain: number;
} {
  const holdingPeriodMs = saleDate.getTime() - purchaseDate.getTime();
  const holdingPeriodDays = Math.floor(holdingPeriodMs / (1000 * 60 * 60 * 24));
  const holdingPeriod = Math.floor(holdingPeriodDays / 365);
  
  const capitalGain = salePrice - purchasePrice;
  let gainType: 'STCG' | 'LTCG';
  let taxRate = 0;
  let ltcgExemption = 0;
  
  // Determine gain type and tax rate based on asset type and holding period
  // As per Budget 2024:
  // - Equity: 12 months for LTCG, STCG @ 20%, LTCG @ 12.5% (₹1.25L exemption)
  // - Property/Gold/Bonds: 24 months for LTCG, STCG as per slab, LTCG @ 12.5%
  switch (assetType) {
    case 'equity':
      // Equity: LTCG if held > 12 months (365 days)
      gainType = holdingPeriodDays >= 365 ? 'LTCG' : 'STCG';
      taxRate = gainType === 'LTCG' ? 12.5 : 20; // LTCG: 12.5%, STCG: 20%
      // LTCG exemption of ₹1.25 lakh for equity
      if (gainType === 'LTCG' && capitalGain > 0) {
        ltcgExemption = Math.min(capitalGain, 125000);
      }
      break;
    case 'property':
      // Property: LTCG if held > 24 months (730 days)
      gainType = holdingPeriodDays >= 730 ? 'LTCG' : 'STCG';
      // STCG on property is taxed as per income slab (assuming 30% for high income)
      // LTCG: 12.5% without indexation (Budget 2024)
      taxRate = gainType === 'LTCG' ? 12.5 : 30; // STCG as per slab (assumed 30%)
      break;
    case 'gold':
      // Gold: LTCG if held > 24 months
      gainType = holdingPeriodDays >= 730 ? 'LTCG' : 'STCG';
      taxRate = gainType === 'LTCG' ? 12.5 : 30; // STCG as per slab
      break;
    case 'bonds':
      // Bonds/Debentures: LTCG if held > 12 months (listed) or 36 months (unlisted)
      // Using 24 months as default
      gainType = holdingPeriodDays >= 730 ? 'LTCG' : 'STCG';
      taxRate = gainType === 'LTCG' ? 12.5 : 30; // STCG as per slab
      break;
  }
  
  // Calculate taxable gain after exemption
  const taxableGain = Math.max(0, capitalGain - ltcgExemption);
  
  // Calculate tax with 4% Health & Education Cess
  const baseTax = taxableGain > 0 ? (taxableGain * taxRate) / 100 : 0;
  const cess = baseTax * 0.04;
  const taxPayable = baseTax + cess;
  
  const netGain = capitalGain - taxPayable;
  
  return {
    capitalGain: Math.round(capitalGain),
    gainType,
    taxRate,
    taxPayable: Math.round(taxPayable),
    netGain: Math.round(netGain),
    holdingPeriod,
    holdingPeriodDays,
    ltcgExemption: Math.round(ltcgExemption),
    taxableGain: Math.round(taxableGain)
  };
}

export interface CalculateTDSOptions {
  income: number;
  incomeType: TDSIncomeType | string;
  assessmentYear?: AssessmentYear | string;
  panProvided?: boolean; // default true
  isSeniorCitizen?: boolean; // default false
  form15G15HSubmitted?: boolean; // default false (applies to interest under conditions)
}

export function calculateTDS(options: CalculateTDSOptions): {
  tdsAmount: number;
  netIncome: number;
  tdsRate: number;
  threshold: number;
  applicable: boolean;
} {
  const {
    income,
    incomeType,
    assessmentYear = "2026-27",
    panProvided = true,
    isSeniorCitizen = false,
    form15G15HSubmitted = false,
  } = options;

  const ay: AssessmentYear = ["2026-27","2025-26","2024-25","2023-24","2022-23","2021-22"].includes(assessmentYear as AssessmentYear)
    ? (assessmentYear as AssessmentYear)
    : "2026-27";

  const typeKey = (incomeType as TDSIncomeType);
  const rulesForAY = tdsRulesByAY[ay];
  const baseRule = rulesForAY[typeKey] || { rate: 10, threshold: 40000, section: "194A" };

  // Derive threshold adjustments
  let threshold = baseRule.threshold;
  if (typeKey === "interest" && isSeniorCitizen) {
    threshold = ay === "2026-27" ? 100000 : 50000;
  }

  // Form 15G/15H submission can prevent TDS on interest if eligible. Simplified toggle.
  if (typeKey === "interest" && form15G15HSubmitted) {
    return {
      tdsAmount: 0,
      netIncome: Math.round(income),
      tdsRate: 0,
      threshold,
      applicable: false,
    };
  }

  // PAN not provided → Section 206AA: 20% or higher of prescribed rate
  let effectiveRate = baseRule.rate;
  if (!panProvided) {
    effectiveRate = Math.max(baseRule.rate, 20);
  }

  // Salary handled via payroll
  if (typeKey === "salary") {
    return {
      tdsAmount: 0,
      netIncome: Math.round(income),
      tdsRate: 0,
      threshold: 0,
      applicable: false,
    };
  }

  const applicable = income > threshold;
  const tdsAmount = applicable ? (income * effectiveRate) / 100 : 0;
  const netIncome = income - tdsAmount;

  return {
    tdsAmount: Math.round(tdsAmount),
    netIncome: Math.round(netIncome),
    tdsRate: effectiveRate,
    threshold,
    applicable,
  };
}
