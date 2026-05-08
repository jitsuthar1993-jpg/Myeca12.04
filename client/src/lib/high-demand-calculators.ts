import { calculateEMI, calculateIncomeTax } from "@/lib/tax-calculations";

const round = (value: number) => Math.round(Number.isFinite(value) ? value : 0);

export interface GstInputs {
  amount: number;
  rate: number;
  mode: "exclusive" | "inclusive";
  supplyType: "intra" | "inter";
}

export function calculateGST({ amount, rate, mode, supplyType }: GstInputs) {
  const safeAmount = Math.max(0, amount);
  const safeRate = Math.max(0, rate);
  const baseAmount = mode === "inclusive" ? safeAmount / (1 + safeRate / 100) : safeAmount;
  const taxAmount = baseAmount * (safeRate / 100);
  const totalAmount = mode === "inclusive" ? safeAmount : baseAmount + taxAmount;
  const isIntra = supplyType === "intra";

  return {
    baseAmount: round(baseAmount),
    taxAmount: round(taxAmount),
    totalAmount: round(totalAmount),
    cgst: isIntra ? round(taxAmount / 2) : 0,
    sgst: isIntra ? round(taxAmount / 2) : 0,
    igst: isIntra ? 0 : round(taxAmount),
    rate: safeRate,
  };
}

export interface SalaryInputs {
  annualCtc: number;
  basicPercent: number;
  hraPercent: number;
  variablePay: number;
  employeePfPercent: number;
  employerPfPercent: number;
  professionalTaxMonthly: number;
}

export function calculateSalary(inputs: SalaryInputs) {
  const annualCtc = Math.max(0, inputs.annualCtc);
  const variablePay = Math.max(0, inputs.variablePay);
  const monthlyCtc = annualCtc / 12;
  const monthlyBasic = monthlyCtc * (Math.max(0, inputs.basicPercent) / 100);
  const monthlyHra = monthlyBasic * (Math.max(0, inputs.hraPercent) / 100);
  const monthlyEmployerPf = monthlyBasic * (Math.max(0, inputs.employerPfPercent) / 100);
  const monthlyEmployeePf = monthlyBasic * (Math.max(0, inputs.employeePfPercent) / 100);
  const monthlyGross = Math.max(0, monthlyCtc - monthlyEmployerPf - variablePay / 12);
  const annualGross = monthlyGross * 12;
  const annualEmployeePf = monthlyEmployeePf * 12;
  const estimatedTax = calculateIncomeTax({
    income: annualGross,
    regime: "new",
    deductions: annualEmployeePf,
    assessmentYear: "2026-27",
  }).taxPayable;
  const monthlyTds = estimatedTax / 12;
  const professionalTaxMonthly = Math.max(0, inputs.professionalTaxMonthly);
  const monthlyInHand = monthlyGross - monthlyEmployeePf - monthlyTds - professionalTaxMonthly;

  return {
    monthlyCtc: round(monthlyCtc),
    monthlyGross: round(monthlyGross),
    monthlyBasic: round(monthlyBasic),
    monthlyHra: round(monthlyHra),
    monthlyEmployeePf: round(monthlyEmployeePf),
    monthlyEmployerPf: round(monthlyEmployerPf),
    monthlyTds: round(monthlyTds),
    monthlyProfessionalTax: round(professionalTaxMonthly),
    monthlyInHand: round(monthlyInHand),
    annualTax: round(estimatedTax),
  };
}

export function roundGratuityYears(years: number, months: number) {
  const safeYears = Math.max(0, Math.floor(years));
  const safeMonths = Math.max(0, Math.floor(months));
  return safeYears + (safeMonths >= 6 ? 1 : 0);
}

export function calculateGratuity(basicDaMonthly: number, years: number, months: number) {
  const roundedYears = roundGratuityYears(years, months);
  const eligible = years > 5 || (years === 5 && months >= 0);
  const gratuity = (Math.max(0, basicDaMonthly) * 15 * roundedYears) / 26;

  return {
    roundedYears,
    eligible,
    gratuity: eligible ? round(gratuity) : 0,
    formulaAmount: round(gratuity),
  };
}

export interface EpfInputs {
  monthlyBasic: number;
  employeePercent: number;
  employerPercent: number;
  annualRate: number;
  years: number;
  openingBalance: number;
}

export function calculateEPF(inputs: EpfInputs) {
  const months = Math.max(0, Math.round(inputs.years * 12));
  const monthlyBasic = Math.max(0, inputs.monthlyBasic);
  const employeeContribution = monthlyBasic * (Math.max(0, inputs.employeePercent) / 100);
  const employerContribution = monthlyBasic * (Math.max(0, inputs.employerPercent) / 100);
  const epsContribution = Math.min(monthlyBasic, 15000) * 0.0833;
  const monthlyEpfContribution = employeeContribution + Math.max(0, employerContribution - epsContribution);
  const monthlyRate = Math.max(0, inputs.annualRate) / 1200;
  let balance = Math.max(0, inputs.openingBalance);
  let totalContribution = 0;

  for (let month = 0; month < months; month += 1) {
    balance += monthlyEpfContribution;
    totalContribution += monthlyEpfContribution;
    balance += balance * monthlyRate;
  }

  return {
    employeeContribution: round(employeeContribution),
    employerContribution: round(employerContribution),
    epsContribution: round(epsContribution),
    monthlyEpfContribution: round(monthlyEpfContribution),
    maturityAmount: round(balance),
    totalContribution: round(totalContribution + Math.max(0, inputs.openingBalance)),
    totalInterest: round(balance - totalContribution - Math.max(0, inputs.openingBalance)),
  };
}

export function calculateRD(monthlyDeposit: number, annualRate: number, months: number) {
  const safeMonths = Math.max(0, Math.round(months));
  const quarterlyRate = Math.max(0, annualRate) / 400;
  let maturityAmount = 0;

  for (let month = 1; month <= safeMonths; month += 1) {
    const remainingMonths = safeMonths - month + 1;
    const quarters = Math.floor(remainingMonths / 3);
    const extraMonths = remainingMonths % 3;
    const depositValue = monthlyDeposit * Math.pow(1 + quarterlyRate, quarters) * (1 + (quarterlyRate * extraMonths) / 3);
    maturityAmount += depositValue;
  }

  const totalInvestment = Math.max(0, monthlyDeposit) * safeMonths;
  return {
    totalInvestment: round(totalInvestment),
    maturityAmount: round(maturityAmount),
    totalInterest: round(maturityAmount - totalInvestment),
  };
}

export function calculateLumpsum(principal: number, annualReturn: number, years: number, inflationRate: number) {
  const safePrincipal = Math.max(0, principal);
  const maturityAmount = safePrincipal * Math.pow(1 + Math.max(0, annualReturn) / 100, Math.max(0, years));
  const inflationAdjusted = maturityAmount / Math.pow(1 + Math.max(0, inflationRate) / 100, Math.max(0, years));

  return {
    investedAmount: round(safePrincipal),
    maturityAmount: round(maturityAmount),
    wealthGain: round(maturityAmount - safePrincipal),
    inflationAdjustedValue: round(inflationAdjusted),
  };
}

export function calculateSWP(corpus: number, annualReturn: number, monthlyWithdrawal: number, years: number) {
  const targetMonths = Math.max(0, Math.round(years * 12));
  const monthlyRate = Math.max(0, annualReturn) / 1200;
  let balance = Math.max(0, corpus);
  let totalWithdrawn = 0;
  let depletionMonth: number | null = null;

  for (let month = 1; month <= targetMonths; month += 1) {
    balance += balance * monthlyRate;
    if (balance < monthlyWithdrawal) {
      totalWithdrawn += balance;
      balance = 0;
      depletionMonth = month;
      break;
    }
    balance -= monthlyWithdrawal;
    totalWithdrawn += monthlyWithdrawal;
  }

  return {
    remainingCorpus: round(balance),
    totalWithdrawn: round(totalWithdrawn),
    depletionMonth,
    sustainable: depletionMonth === null,
  };
}

export function calculateInflation(currentCost: number, inflationRate: number, years: number) {
  const safeCost = Math.max(0, currentCost);
  const factor = Math.pow(1 + Math.max(0, inflationRate) / 100, Math.max(0, years));
  const futureCost = safeCost * factor;
  const presentValue = factor === 0 ? safeCost : safeCost / factor;

  return {
    currentCost: round(safeCost),
    futureCost: round(futureCost),
    presentValue: round(presentValue),
    purchasingPowerLoss: round(safeCost - presentValue),
  };
}

export function calculateLoanEligibility(
  netMonthlyIncome: number,
  existingEmi: number,
  foirPercent: number,
  annualRate: number,
  tenureYears: number,
) {
  const maxTotalEmi = Math.max(0, netMonthlyIncome) * (Math.max(0, foirPercent) / 100);
  const eligibleEmi = Math.max(0, maxTotalEmi - Math.max(0, existingEmi));
  const monthlyRate = Math.max(0, annualRate) / 1200;
  const months = Math.max(1, Math.round(tenureYears * 12));
  const eligibleLoanAmount = monthlyRate === 0
    ? eligibleEmi * months
    : eligibleEmi * ((Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)));
  const repayment = calculateEMI(round(eligibleLoanAmount), annualRate, tenureYears);

  return {
    maxTotalEmi: round(maxTotalEmi),
    eligibleEmi: round(eligibleEmi),
    eligibleLoanAmount: round(eligibleLoanAmount),
    totalInterest: round(repayment.totalInterest),
    totalPayment: round(repayment.totalPayment),
  };
}
