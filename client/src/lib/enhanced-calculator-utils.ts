// Enhanced Financial Calculator Utilities
// Accurate calculations for Indian market conditions (2025)

export interface SIPResult {
  totalInvestment: number;
  maturityValue: number;
  wealthGain: number;
  yearlyBreakdown: Array<{
    year: number;
    investment: number;
    value: number;
    interestEarned: number;
  }>;
}

export interface PPFResult {
  totalInvestment: number;
  maturityValue: number;
  interestEarned: number;
  taxSaved: number;
  yearlyBreakdown: Array<{
    year: number;
    investment: number;
    balance: number;
    interest: number;
  }>;
}

export interface FDResult {
  principal: number;
  maturityValue: number;
  interest: number;
  effectiveRate: number;
  taxOnInterest: number;
  postTaxReturns: number;
  yearlyBreakdown: Array<{
    year: number;
    balance: number;
    interest: number;
  }>;
}

export interface LumpSumResult {
  totalInvestment: number;
  maturityValue: number;
  wealthGain: number;
  annualizedReturn: number;
  yearlyGrowth: Array<{
    year: number;
    value: number;
    growth: number;
  }>;
}

// Enhanced SIP calculation with accurate compounding
export function calculateEnhancedSIP(
  monthlyAmount: number,
  years: number,
  annualReturn: number
): SIPResult {
  const monthlyReturn = annualReturn / 100 / 12;
  const totalMonths = years * 12;
  const totalInvestment = monthlyAmount * totalMonths;
  
  // Calculate maturity value using SIP formula
  const maturityValue = monthlyAmount * 
    (((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * 
    (1 + monthlyReturn));
  
  const wealthGain = maturityValue - totalInvestment;
  
  // Generate yearly breakdown
  const yearlyBreakdown = [];
  let runningInvestment = 0;
  let runningValue = 0;
  
  for (let year = 1; year <= years; year++) {
    const monthsThisYear = 12;
    runningInvestment += monthlyAmount * monthsThisYear;
    
    // Calculate value at end of this year
    const monthsCompleted = year * 12;
    runningValue = monthlyAmount * 
      (((Math.pow(1 + monthlyReturn, monthsCompleted) - 1) / monthlyReturn) * 
      (1 + monthlyReturn));
    
    yearlyBreakdown.push({
      year,
      investment: runningInvestment,
      value: Math.round(runningValue),
      interestEarned: Math.round(runningValue - runningInvestment)
    });
  }
  
  return {
    totalInvestment,
    maturityValue: Math.round(maturityValue),
    wealthGain: Math.round(wealthGain),
    yearlyBreakdown
  };
}

// Enhanced PPF calculation with current rules (7.1% for FY 2024-25)
export function calculateEnhancedPPF(
  annualAmount: number,
  years: number = 15,
  interestRate: number = 7.1
): PPFResult {
  const rate = interestRate / 100;
  const totalInvestment = annualAmount * years;
  
  let balance = 0;
  const yearlyBreakdown = [];
  
  for (let year = 1; year <= years; year++) {
    balance += annualAmount;
    const interest = balance * rate;
    balance += interest;
    
    yearlyBreakdown.push({
      year,
      investment: annualAmount * year,
      balance: Math.round(balance),
      interest: Math.round(interest)
    });
  }
  
  const maturityValue = Math.round(balance);
  const interestEarned = maturityValue - totalInvestment;
  
  // Tax savings calculation (30% tax bracket assumed)
  const taxSaved = Math.min(annualAmount, 150000) * 0.30 * years;
  
  return {
    totalInvestment,
    maturityValue,
    interestEarned,
    taxSaved: Math.round(taxSaved),
    yearlyBreakdown
  };
}

// Enhanced FD calculation with quarterly compounding and tax implications
export function calculateEnhancedFD(
  principal: number,
  rate: number,
  years: number,
  compoundingFrequency: number = 4,
  taxRate: number = 30
): FDResult {
  // Sanitize inputs to enforce positive-only behavior
  const safePrincipal = Math.max(0, principal);
  const safeRate = Math.max(0, rate);
  const safeYears = Math.max(0, years);
  const safeFreq = Math.max(1, compoundingFrequency);
  const safeTax = Math.max(0, taxRate);

  const annualRate = safeRate / 100;
  const periodicRate = annualRate / safeFreq;
  const totalPeriods = safeYears * safeFreq;
  
  // Compound interest formula
  const maturityValueRaw = safePrincipal * Math.pow(1 + periodicRate, totalPeriods);
  const maturityValue = Math.max(0, maturityValueRaw);
  const interestRaw = maturityValue - safePrincipal;
  const interest = Math.max(0, interestRaw);
  
  // Effective annual rate
  const effectiveRateRaw = (Math.pow(1 + periodicRate, safeFreq) - 1) * 100;
  const effectiveRate = Math.max(0, Math.round(effectiveRateRaw * 100) / 100);
  
  // Tax on interest
  const taxOnInterestRaw = interest * (safeTax / 100);
  const taxOnInterest = Math.max(0, taxOnInterestRaw);
  const postTaxReturnsRaw = maturityValue - taxOnInterest;
  const postTaxReturns = Math.max(0, postTaxReturnsRaw);
  
  // Yearly breakdown
  const yearlyBreakdown = [] as Array<{ year: number; balance: number; interest: number }>;
  let currentBalance = safePrincipal;
  
  for (let year = 1; year <= safeYears; year++) {
    const periodsThisYear = safeFreq;
    currentBalance = currentBalance * Math.pow(1 + periodicRate, periodsThisYear);
    const prevBalance = year === 1 ? safePrincipal : yearlyBreakdown[year - 2].balance;
    const yearInterest = Math.max(0, currentBalance - prevBalance);
    
    yearlyBreakdown.push({
      year,
      balance: Math.round(Math.max(0, currentBalance)),
      interest: Math.round(yearInterest)
    });
  }
  
  return {
    principal: safePrincipal,
    maturityValue: Math.round(maturityValue),
    interest: Math.round(interest),
    effectiveRate,
    taxOnInterest: Math.round(taxOnInterest),
    postTaxReturns: Math.round(postTaxReturns),
    yearlyBreakdown
  };
}

// Lump sum investment calculator
export function calculateLumpSum(
  amount: number,
  years: number,
  annualReturn: number
): LumpSumResult {
  const rate = annualReturn / 100;
  const maturityValue = amount * Math.pow(1 + rate, years);
  const wealthGain = maturityValue - amount;
  const annualizedReturn = (Math.pow(maturityValue / amount, 1 / years) - 1) * 100;
  
  // Generate yearly growth
  const yearlyGrowth = [];
  let currentValue = amount;
  
  for (let year = 1; year <= years; year++) {
    currentValue = currentValue * (1 + rate);
    const growth = currentValue - amount;
    
    yearlyGrowth.push({
      year,
      value: Math.round(currentValue),
      growth: Math.round(growth)
    });
  }
  
  return {
    totalInvestment: amount,
    maturityValue: Math.round(maturityValue),
    wealthGain: Math.round(wealthGain),
    annualizedReturn: Math.round(annualizedReturn * 100) / 100,
    yearlyGrowth
  };
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Current market rates (updated for 2025)
export const CURRENT_RATES = {
  PPF: 7.1,
  EPF: 8.25,
  NSC: 6.8,
  ELSS_EXPECTED: 12,
  EQUITY_EXPECTED: 12,
  DEBT_EXPECTED: 7,
  HYBRID_EXPECTED: 10,
  FD_RATES: {
    SBI: 6.5,
    HDFC: 6.75,
    ICICI: 6.7,
    AXIS: 6.75,
    KOTAK: 6.8,
    YES_BANK: 7.25
  },
  INFLATION: 4.5
} as const;