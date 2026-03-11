import { TaxCalculationResult, IncomeTaxInputs, TaxSlabs } from "@/types/calculator";
import { tdsRulesByAY, assessmentYears, type AssessmentYear, type TDSIncomeType } from "@/data/tds-rules";

// Updated for FY 2024-25 (AY 2025-26)
const OLD_REGIME_SLABS: TaxSlabs[] = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.2 },
  { min: 1000000, max: Infinity, rate: 0.3 }
];

const OLD_REGIME_SENIOR_SLABS: TaxSlabs[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.2 },
  { min: 1000000, max: Infinity, rate: 0.3 }
];

const OLD_REGIME_SUPER_SENIOR_SLABS: TaxSlabs[] = [
  { min: 0, max: 500000, rate: 0 },
  { min: 500000, max: 1000000, rate: 0.2 },
  { min: 1000000, max: Infinity, rate: 0.3 }
];

// Updated for FY 2024-25 (AY 2025-26) - Budget 2024 Rates
const NEW_REGIME_SLABS_2025_26: TaxSlabs[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 0.05 },
  { min: 700000, max: 1000000, rate: 0.1 },
  { min: 1000000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.2 },
  { min: 1500000, max: Infinity, rate: 0.3 }
];

// Updated for FY 2025-26 (AY 2026-27) - Expected/New Rules
const NEW_REGIME_SLABS_2026_27: TaxSlabs[] = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.1 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.2 },
  { min: 2000000, max: Infinity, rate: 0.3 }
];

export function calculateIncomeTax(inputs: IncomeTaxInputs & { age?: number; assessmentYear?: string }): TaxCalculationResult {
  const { income, regime, deductions, age = 30, assessmentYear = "2026-27" } = inputs;
  
  // Calculate taxable income
  let taxableIncome = Math.max(0, income - deductions);
  
  // Standard deduction for new regime
  if (regime === 'new') {
    // AY 2026-27: Standard deduction increased to 75,000 (confirmed)
    // AY 2025-26: Standard deduction was 75,000 (Budget 2024)
    taxableIncome = Math.max(0, income - 75000); 
  }
  
  // Select tax slabs based on regime and age
  let slabs: TaxSlabs[];
  if (regime === 'old') {
    if (age >= 80) {
      slabs = OLD_REGIME_SUPER_SENIOR_SLABS;
    } else if (age >= 60) {
      slabs = OLD_REGIME_SENIOR_SLABS;
    } else {
      slabs = OLD_REGIME_SLABS;
    }
  } else {
    // Select New Regime slabs based on AY
    slabs = assessmentYear === "2026-27" ? NEW_REGIME_SLABS_2026_27 : NEW_REGIME_SLABS_2025_26;
  }
  
  let tax = 0;
  const breakdown = { slab1: 0, slab2: 0, slab3: 0, slab4: 0 };
  
  // Calculate tax for each slab
  slabs.forEach((slab, index) => {
    if (taxableIncome > slab.min) {
      const taxableInThisSlab = Math.min(taxableIncome, slab.max) - slab.min;
      const taxForThisSlab = taxableInThisSlab * slab.rate;
      tax += taxForThisSlab;
      
      // Store breakdown (limit to 4 slabs for display)
      if (index < 4) {
        (breakdown as any)[`slab${index + 1}`] = taxForThisSlab;
      }
    }
  });
  
  // Apply Rebate under Section 87A and Marginal Relief
  if (regime === 'new') {
    const threshold = assessmentYear === "2026-27" ? 1200000 : 700000;
    // Max rebate isn't strictly needed if we assume tax is 0 at threshold, 
    // but for AY 25-26 tax at 7L is 20k (covered by 25k limit).
    // For AY 26-27 tax at 12L is 60k.
    const maxRebate = assessmentYear === "2026-27" ? 60000 : 25000;

    if (taxableIncome <= threshold) {
       const rebate = Math.min(tax, maxRebate);
       tax = Math.max(0, tax - rebate);
    } else {
       // Marginal Relief:
       // Ensure tax payable does not exceed the income earned above the threshold.
       // This prevents the "cliff effect" where earning \u20B91 extra costs \u20B960,000 in tax.
       const excessIncome = taxableIncome - threshold;
       if (tax > excessIncome) {
          tax = excessIncome;
       }
    }
  } else if (regime === 'old' && taxableIncome <= 500000) {
    const rebate = Math.min(tax, 12500);
    tax = Math.max(0, tax - rebate);
  }
  
  // Calculate surcharge based on FY 2024-25 rates
  // Surcharge slabs:
  // 50L - 1Cr: 10%
  // 1Cr - 2Cr: 15%
  // 2Cr - 5Cr: 25%
  // Above 5Cr: 37% (old regime) / 25% (new regime - capped)
  let surcharge = 0;
  if (income > 50000000) {
    // Above 5 crore
    surcharge = tax * (regime === 'new' ? 0.25 : 0.37);
  } else if (income > 20000000) {
    // 2 crore to 5 crore
    surcharge = tax * 0.25;
  } else if (income > 10000000) {
    // 1 crore to 2 crore
    surcharge = tax * 0.15;
  } else if (income > 5000000) {
    // 50 lakh to 1 crore
    surcharge = tax * 0.10;
  }
  
  tax += surcharge;
  
  // Add cess (4% on tax + surcharge)
  tax = tax * 1.04;
  
  const netIncome = income - tax;
  
  return {
    grossIncome: income,
    taxableIncome,
    taxPayable: Math.round(tax),
    netIncome: Math.round(netIncome),
    breakdown: {
      slab1: Math.round(breakdown.slab1),
      slab2: Math.round(breakdown.slab2),
      slab3: Math.round(breakdown.slab3),
      slab4: Math.round(breakdown.slab4)
    }
  };
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
  // - Equity: 12 months for LTCG, STCG @ 20%, LTCG @ 12.5% (\u20B91.25L exemption)
  // - Property/Gold/Bonds: 24 months for LTCG, STCG as per slab, LTCG @ 12.5%
  switch (assetType) {
    case 'equity':
      // Equity: LTCG if held > 12 months (365 days)
      gainType = holdingPeriodDays >= 365 ? 'LTCG' : 'STCG';
      taxRate = gainType === 'LTCG' ? 12.5 : 20; // LTCG: 12.5%, STCG: 20%
      // LTCG exemption of \u20B91.25 lakh for equity
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
    assessmentYear = "2025-26",
    panProvided = true,
    isSeniorCitizen = false,
    form15G15HSubmitted = false,
  } = options;

  const ay: AssessmentYear = ["2025-26","2024-25","2023-24","2022-23","2021-22"].includes(assessmentYear as AssessmentYear)
    ? (assessmentYear as AssessmentYear)
    : "2025-26";

  const typeKey = (incomeType as TDSIncomeType);
  const rulesForAY = tdsRulesByAY[ay];
  const baseRule = rulesForAY[typeKey] || { rate: 10, threshold: 40000, section: "194A" };

  // Derive threshold adjustments
  let threshold = baseRule.threshold;
  if (typeKey === "interest" && isSeniorCitizen) {
    threshold = 50000; // Senior citizen threshold
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
