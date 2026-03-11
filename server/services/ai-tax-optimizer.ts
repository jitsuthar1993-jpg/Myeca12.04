import { TaxSlab } from "@shared/schema";

interface TaxRegimeComparison {
  oldRegime: {
    taxAmount: number;
    effectiveTaxRate: number;
    taxableIncome: number;
    taxSlabs: TaxSlab[];
  };
  newRegime: {
    taxAmount: number;
    effectiveTaxRate: number;
    taxableIncome: number;
    taxSlabs: TaxSlab[];
  };
  recommendation: "old" | "new";
  savings: number;
  breakdownOld: {
    income: number;
    deductions: number;
    taxableIncome: number;
    tax: number;
    cess: number;
    totalTax: number;
  };
  breakdownNew: {
    income: number;
    standardDeduction: number;
    taxableIncome: number;
    tax: number;
    cess: number;
    totalTax: number;
  };
}

interface TaxSavingRecommendation {
  category: string;
  currentAmount: number;
  recommendedAmount: number;
  additionalSaving: number;
  taxBenefit: number;
  description: string;
  priority: "high" | "medium" | "low";
}

interface MonthlyTaxPlan {
  month: string;
  tdsAmount: number;
  investmentAmount: number;
  recommendedInvestments: string[];
  cumulativeTds: number;
  remainingInvestment: number;
}

// Tax slabs for FY 2024-25
const TAX_SLABS_OLD_REGIME_2024_25: TaxSlab[] = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: null, rate: 30 }
];

const TAX_SLABS_NEW_REGIME_2024_25: TaxSlab[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 600000, rate: 5 },
  { min: 600000, max: 900000, rate: 10 },
  { min: 900000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: null, rate: 30 }
];

function calculateTax(income: number, slabs: TaxSlab[]): number {
  let tax = 0;
  
  for (const slab of slabs) {
    if (income <= slab.min) break;
    
    const taxableInThisSlab = Math.min(
      income - slab.min,
      slab.max ? slab.max - slab.min : income - slab.min
    );
    
    tax += (taxableInThisSlab * slab.rate) / 100;
  }
  
  return tax;
}

export function calculateOptimalTaxRegime(
  income: number,
  deductions: {
    section80C?: number;
    section80D?: number;
    section80G?: number;
    hra?: number;
    lta?: number;
    otherDeductions?: number;
  } = {}
): TaxRegimeComparison {
  // Old regime calculation
  const totalDeductionsOld = 
    (deductions.section80C || 0) +
    (deductions.section80D || 0) +
    (deductions.section80G || 0) +
    (deductions.hra || 0) +
    (deductions.lta || 0) +
    (deductions.otherDeductions || 0) +
    50000; // Standard deduction
  
  const taxableIncomeOld = Math.max(0, income - totalDeductionsOld);
  const taxOld = calculateTax(taxableIncomeOld, TAX_SLABS_OLD_REGIME_2024_25);
  const cessOld = taxOld * 0.04;
  const totalTaxOld = taxOld + cessOld;
  
  // Apply rebate u/s 87A for old regime
  let finalTaxOld = totalTaxOld;
  if (taxableIncomeOld <= 500000 && taxOld > 0) {
    finalTaxOld = Math.max(0, totalTaxOld - 12500);
  }
  
  // New regime calculation
  const standardDeductionNew = 50000;
  const taxableIncomeNew = Math.max(0, income - standardDeductionNew);
  const taxNew = calculateTax(taxableIncomeNew, TAX_SLABS_NEW_REGIME_2024_25);
  const cessNew = taxNew * 0.04;
  const totalTaxNew = taxNew + cessNew;
  
  // Apply rebate u/s 87A for new regime
  let finalTaxNew = totalTaxNew;
  if (taxableIncomeNew <= 700000 && taxNew > 0) {
    finalTaxNew = Math.max(0, totalTaxNew - 25000);
  }
  
  return {
    oldRegime: {
      taxAmount: finalTaxOld,
      effectiveTaxRate: (finalTaxOld / income) * 100,
      taxableIncome: taxableIncomeOld,
      taxSlabs: TAX_SLABS_OLD_REGIME_2024_25
    },
    newRegime: {
      taxAmount: finalTaxNew,
      effectiveTaxRate: (finalTaxNew / income) * 100,
      taxableIncome: taxableIncomeNew,
      taxSlabs: TAX_SLABS_NEW_REGIME_2024_25
    },
    recommendation: finalTaxOld < finalTaxNew ? "old" : "new",
    savings: Math.abs(finalTaxOld - finalTaxNew),
    breakdownOld: {
      income,
      deductions: totalDeductionsOld,
      taxableIncome: taxableIncomeOld,
      tax: taxOld,
      cess: cessOld,
      totalTax: finalTaxOld
    },
    breakdownNew: {
      income,
      standardDeduction: standardDeductionNew,
      taxableIncome: taxableIncomeNew,
      tax: taxNew,
      cess: cessNew,
      totalTax: finalTaxNew
    }
  };
}

export function generateTaxSavingRecommendations(
  income: number,
  currentDeductions: {
    section80C?: number;
    section80D?: number;
    section80G?: number;
    hra?: number;
    nps?: number;
  } = {},
  profile: {
    age?: number;
    hasHomeLoan?: boolean;
    hasEducationLoan?: boolean;
    hasParents?: boolean;
  } = {}
): TaxSavingRecommendation[] {
  const recommendations: TaxSavingRecommendation[] = [];
  
  // Section 80C recommendations
  const current80C = currentDeductions.section80C || 0;
  if (current80C < 150000) {
    recommendations.push({
      category: "Section 80C",
      currentAmount: current80C,
      recommendedAmount: 150000,
      additionalSaving: 150000 - current80C,
      taxBenefit: ((150000 - current80C) * 0.3), // Assuming 30% tax bracket
      description: "Invest in ELSS, PPF, or tax-saving FD to maximize Section 80C benefits",
      priority: "high"
    });
  }
  
  // Section 80D recommendations
  const current80D = currentDeductions.section80D || 0;
  const max80D = profile.age && profile.age >= 60 ? 50000 : 25000;
  const parentBonus = profile.hasParents ? 25000 : 0;
  const total80D = max80D + parentBonus;
  
  if (current80D < total80D) {
    recommendations.push({
      category: "Section 80D",
      currentAmount: current80D,
      recommendedAmount: total80D,
      additionalSaving: total80D - current80D,
      taxBenefit: ((total80D - current80D) * 0.3),
      description: "Get health insurance for self and parents to claim Section 80D deduction",
      priority: "high"
    });
  }
  
  // NPS recommendations (80CCD(1B))
  const currentNPS = currentDeductions.nps || 0;
  if (currentNPS < 50000 && income > 1000000) {
    recommendations.push({
      category: "NPS (80CCD(1B))",
      currentAmount: currentNPS,
      recommendedAmount: 50000,
      additionalSaving: 50000 - currentNPS,
      taxBenefit: ((50000 - currentNPS) * 0.3),
      description: "Invest in NPS for additional ₹50,000 deduction over Section 80C limit",
      priority: "medium"
    });
  }
  
  // HRA recommendations
  if (!currentDeductions.hra && income > 500000) {
    const potentialHRA = income * 0.4 * 0.5; // Assuming 40% of salary as HRA
    recommendations.push({
      category: "HRA",
      currentAmount: 0,
      recommendedAmount: potentialHRA,
      additionalSaving: potentialHRA,
      taxBenefit: potentialHRA * 0.3,
      description: "Claim HRA exemption if you're paying rent",
      priority: "high"
    });
  }
  
  // Home loan interest (Section 24)
  if (profile.hasHomeLoan) {
    recommendations.push({
      category: "Home Loan Interest",
      currentAmount: 0,
      recommendedAmount: 200000,
      additionalSaving: 200000,
      taxBenefit: 200000 * 0.3,
      description: "Claim up to ₹2 lakh deduction on home loan interest under Section 24",
      priority: "high"
    });
  }
  
  // Education loan interest (Section 80E)
  if (profile.hasEducationLoan) {
    recommendations.push({
      category: "Education Loan Interest",
      currentAmount: 0,
      recommendedAmount: 100000, // Example amount
      additionalSaving: 100000,
      taxBenefit: 100000 * 0.3,
      description: "Claim full education loan interest deduction under Section 80E",
      priority: "medium"
    });
  }
  
  return recommendations.sort((a, b) => b.taxBenefit - a.taxBenefit);
}

export function calculateMonthlyTaxPlan(
  annualIncome: number,
  deductions: {
    section80C?: number;
    section80D?: number;
    nps?: number;
  } = {}
): MonthlyTaxPlan[] {
  const monthlyIncome = annualIncome / 12;
  const regime = calculateOptimalTaxRegime(annualIncome, deductions);
  const estimatedAnnualTax = regime.recommendation === "old" 
    ? regime.oldRegime.taxAmount 
    : regime.newRegime.taxAmount;
  
  const monthlyTDS = estimatedAnnualTax / 12;
  
  // Calculate investment distribution
  const total80C = deductions.section80C || 150000;
  const total80D = deductions.section80D || 25000;
  const totalNPS = deductions.nps || 50000;
  
  const totalInvestment = total80C + total80D + totalNPS;
  const monthlyInvestment = totalInvestment / 12;
  
  const months = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March"
  ];
  
  const monthlyPlans: MonthlyTaxPlan[] = [];
  let cumulativeTds = 0;
  let remainingInvestment = totalInvestment;
  
  months.forEach((month, index) => {
    cumulativeTds += monthlyTDS;
    const investmentThisMonth = Math.min(monthlyInvestment, remainingInvestment);
    remainingInvestment -= investmentThisMonth;
    
    const recommendedInvestments: string[] = [];
    
    // Recommend investments based on month
    if (index < 9) { // Apr-Dec
      recommendedInvestments.push("ELSS (Tax-saving mutual fund)");
      recommendedInvestments.push("PPF contribution");
    }
    
    if (index === 3 || index === 9) { // July and January
      recommendedInvestments.push("Health insurance premium");
    }
    
    if (index >= 9) { // Jan-Mar (last quarter)
      recommendedInvestments.push("Tax-saving FD");
      recommendedInvestments.push("NPS contribution");
      recommendedInvestments.push("Life insurance premium");
    }
    
    monthlyPlans.push({
      month,
      tdsAmount: monthlyTDS,
      investmentAmount: investmentThisMonth,
      recommendedInvestments,
      cumulativeTds,
      remainingInvestment
    });
  });
  
  return monthlyPlans;
}