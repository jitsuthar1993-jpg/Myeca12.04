import { calculateEMI, calculateIncomeTax } from "@/lib/tax-calculations";

const round = (value: number) => Math.round(Number.isFinite(value) ? value : 0);

export interface GstInputs {
  amount: number;
  rate: number;
  mode: "exclusive" | "inclusive";
  supplyType: "intra" | "inter";
}

export function calculateGST({ amount, rate, mode, supplyType }: GstInputs) {
  if (![amount, rate].every(Number.isFinite)) throw new Error("GST inputs must be finite numbers");
  if (amount < 0 || rate < 0) throw new Error("GST inputs cannot be negative");
  if (amount > 10_000_000 || rate > 40) throw new Error("GST inputs exceed the supported planning range");
  if (!["exclusive", "inclusive"].includes(mode) || !["intra", "inter"].includes(supplyType)) throw new Error("GST calculation mode is unsupported");
  const safeAmount = amount;
  const safeRate = rate;
  const roundMoney = (value: number) => Math.round(value * 100) / 100;
  const rawBase = mode === "inclusive" ? safeAmount / (1 + safeRate / 100) : safeAmount;
  const roundedTax = roundMoney(rawBase * (safeRate / 100));
  const totalAmount = mode === "inclusive" ? roundMoney(safeAmount) : roundMoney(safeAmount) + roundedTax;
  const baseAmount = mode === "inclusive" ? totalAmount - roundedTax : roundMoney(safeAmount);
  const isIntra = supplyType === "intra";

  const roundedCgst = isIntra ? roundMoney(roundedTax / 2) : 0;
  return {
    baseAmount,
    taxAmount: roundedTax,
    totalAmount,
    cgst: roundedCgst,
    sgst: isIntra ? roundedTax - roundedCgst : 0,
    igst: isIntra ? 0 : roundedTax,
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
  return years + (months > 6 ? 1 : 0);
}

export function calculateGratuity(basicDaMonthly: number, years: number, months: number) {
  if (![basicDaMonthly, years, months].every(Number.isFinite)) throw new Error("Gratuity inputs must be finite numbers");
  if (basicDaMonthly < 0 || years < 0 || months < 0) throw new Error("Gratuity inputs cannot be negative");
  if (!Number.isInteger(years) || !Number.isInteger(months)) throw new Error("Gratuity service must use whole years and months");
  if (months > 11) throw new Error("Gratuity service months must be from 0 to 11");
  if (basicDaMonthly > 1_000_000 || years > 50) throw new Error("Gratuity inputs exceed the supported planning range");
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
  const values = [inputs.monthlyBasic, inputs.employeePercent, inputs.employerPercent, inputs.annualRate, inputs.years, inputs.openingBalance];
  if (!values.every(Number.isFinite)) throw new Error("EPF inputs must be finite numbers");
  if (values.some(value => value < 0)) throw new Error("EPF inputs cannot be negative");
  if (!Number.isInteger(inputs.years) || inputs.years <= 0) throw new Error("EPF period must be a positive integer");
  if (inputs.monthlyBasic > 1_000_000 || inputs.employeePercent > 20 || inputs.employerPercent > 20 || inputs.annualRate > 12 || inputs.years > 40 || inputs.openingBalance > 10_000_000) throw new Error("EPF inputs exceed the supported planning range");
  const months = inputs.years * 12;
  const monthlyBasic = inputs.monthlyBasic;
  const employeeContribution = monthlyBasic * (inputs.employeePercent / 100);
  const employerContribution = monthlyBasic * (inputs.employerPercent / 100);
  const epsContribution = Math.min(employerContribution, Math.round(Math.min(monthlyBasic, 15000) * 0.0833));
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
  if (![monthlyDeposit, annualRate, months].every(Number.isFinite)) throw new Error("RD inputs must be finite numbers");
  if (monthlyDeposit < 0 || annualRate < 0) throw new Error("RD inputs cannot be negative");
  if (!Number.isInteger(months) || months <= 0) throw new Error("RD tenure must be a positive integer");
  if (monthlyDeposit > 100_000_000 || annualRate > 100 || months > 1200) throw new Error("RD inputs exceed the supported planning range");
  const safeMonths = months;
  const quarterlyRate = annualRate / 400;
  let maturityAmount = 0;

  for (let month = 1; month <= safeMonths; month += 1) {
    const remainingMonths = safeMonths - month + 1;
    const quarters = Math.floor(remainingMonths / 3);
    const extraMonths = remainingMonths % 3;
    const depositValue = monthlyDeposit * Math.pow(1 + quarterlyRate, quarters) * (1 + (quarterlyRate * extraMonths) / 3);
    maturityAmount += depositValue;
  }

  const totalInvestment = monthlyDeposit * safeMonths;
  return {
    totalInvestment: round(totalInvestment),
    maturityAmount: round(maturityAmount),
    totalInterest: round(maturityAmount - totalInvestment),
  };
}

export function calculateLumpsum(principal: number, annualReturn: number, years: number, inflationRate: number) {
  if (![principal, annualReturn, years, inflationRate].every(Number.isFinite)) throw new Error("Lumpsum inputs must be finite numbers");
  if (principal < 0 || inflationRate < 0) throw new Error("Lumpsum inputs cannot be negative");
  if (!Number.isInteger(years) || years <= 0) throw new Error("Lumpsum period must be a positive integer");
  if (principal > 100_000_000 || annualReturn <= -100 || annualReturn > 100 || years > 100 || inflationRate > 100) throw new Error("Lumpsum inputs exceed the supported planning range");
  const safePrincipal = principal;
  const maturityAmount = safePrincipal * Math.pow(1 + annualReturn / 100, years);
  const inflationAdjusted = maturityAmount / Math.pow(1 + inflationRate / 100, years);

  return {
    investedAmount: round(safePrincipal),
    maturityAmount: round(maturityAmount),
    wealthGain: round(maturityAmount - safePrincipal),
    inflationAdjustedValue: round(inflationAdjusted),
  };
}

export function calculateSWP(corpus: number, annualReturn: number, monthlyWithdrawal: number, years: number) {
  if (![corpus, annualReturn, monthlyWithdrawal, years].every(Number.isFinite)) throw new Error("SWP inputs must be finite numbers");
  if (corpus < 0 || monthlyWithdrawal < 0) throw new Error("SWP inputs cannot be negative");
  if (!Number.isInteger(years) || years <= 0) throw new Error("SWP period must be a positive integer");
  if (corpus > 100_000_000 || monthlyWithdrawal > 10_000_000 || annualReturn <= -100 || annualReturn > 100 || years > 100) throw new Error("SWP inputs exceed the supported planning range");
  const targetMonths = years * 12;
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  let balance = corpus;
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
  if (![currentCost, inflationRate, years].every(Number.isFinite)) throw new Error("Inflation inputs must be finite numbers");
  if (currentCost < 0 || inflationRate < 0) throw new Error("Inflation inputs cannot be negative");
  if (!Number.isInteger(years) || years <= 0) throw new Error("Inflation period must be a positive integer");
  if (currentCost > 100_000_000 || inflationRate > 20 || years > 50) throw new Error("Inflation inputs exceed the supported planning range");
  const safeCost = currentCost;
  const factor = Math.pow(1 + inflationRate / 100, years);
  const futureCost = safeCost * factor;
  const futurePurchasingPower = safeCost / factor;

  return {
    currentCost: round(safeCost),
    futureCost: round(futureCost),
    futurePurchasingPower: round(futurePurchasingPower),
    purchasingPowerLoss: round(safeCost - futurePurchasingPower),
  };
}

export function calculateLoanEligibility(
  netMonthlyIncome: number,
  existingEmi: number,
  foirPercent: number,
  annualRate: number,
  tenureYears: number,
) {
  const values = [netMonthlyIncome, existingEmi, foirPercent, annualRate, tenureYears];
  if (!values.every(Number.isFinite)) throw new Error("Loan eligibility inputs must be finite numbers");
  if (netMonthlyIncome < 0 || existingEmi < 0 || annualRate < 0) throw new Error("Loan eligibility inputs cannot be negative");
  if (!Number.isInteger(tenureYears) || tenureYears <= 0) throw new Error("Loan tenure must be a positive integer");
  if (netMonthlyIncome > 5_000_000 || existingEmi > 1_000_000 || foirPercent < 10 || foirPercent > 80 || annualRate > 25 || tenureYears > 30) throw new Error("Loan eligibility inputs exceed the supported planning range");
  const maxTotalEmi = netMonthlyIncome * (foirPercent / 100);
  const eligibleEmi = Math.max(0, maxTotalEmi - existingEmi);
  const monthlyRate = annualRate / 1200;
  const months = tenureYears * 12;
  const eligibleLoanAmount = monthlyRate === 0
    ? eligibleEmi * months
    : eligibleEmi * ((Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months)));
  const repayment = eligibleLoanAmount === 0
    ? { totalInterest: 0, totalPayment: 0 }
    : calculateEMI(round(eligibleLoanAmount), annualRate, tenureYears);

  return {
    maxTotalEmi: round(maxTotalEmi),
    eligibleEmi: round(eligibleEmi),
    eligibleLoanAmount: round(eligibleLoanAmount),
    totalInterest: round(repayment.totalInterest),
    totalPayment: round(repayment.totalPayment),
  };
}
