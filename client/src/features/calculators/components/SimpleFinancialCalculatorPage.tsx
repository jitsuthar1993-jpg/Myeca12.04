import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  BadgeIndianRupee,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Landmark,
  PiggyBank,
  Receipt,
  RotateCcw,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { getSEOConfig } from "@/config/seo.config";
import { cn } from "@/lib/utils";
import { MobileCard, MobilePageHeader } from "@/components/mobile";
import { getCalculatorByPath } from "@/data/calculator-manifest";
import {
  calculateEPF,
  calculateGST,
  calculateGratuity,
  calculateInflation,
  calculateLoanEligibility,
  calculateLumpsum,
  calculateRD,
  calculateSWP,
  calculateSalary,
} from "@/lib/high-demand-calculators";

type FieldValue = number | string;

interface NumberField {
  name: string;
  label: string;
  type?: "number";
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  helper?: string;
  chips?: Array<{ label: string; value: number }>;
}

interface SelectField {
  name: string;
  label: string;
  type: "select";
  helper?: string;
  options: Array<{ label: string; value: string }>;
}

type Field = NumberField | SelectField;

interface ResultRow {
  label: string;
  value: number | string | null;
  tone?: "default" | "green" | "blue" | "red";
}

interface CalculatorConfig {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  icon: typeof Calculator;
  accent: "blue" | "green" | "orange" | "violet";
  inputs: Record<string, FieldValue>;
  fields: Field[];
  calculate: (inputs: Record<string, FieldValue>) => {
    primaryLabel: string;
    primaryValue: number | string | null;
    summary: string;
    rows: ResultRow[];
  };
  notes: string[];
  validate?: (inputs: Record<string, FieldValue>) => Record<string, string>;
}

const formatCurrency = (value: number | string | null) => {
  if (value === null) return "Not depleted";
  if (typeof value === "string") return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const toNumber = (value: FieldValue) => Number(value) || 0;

function validateInputs(fields: Field[], inputs: Record<string, FieldValue>) {
  return Object.fromEntries(
    fields.flatMap((field) => {
      if (field.type === "select") return [];
      const value = inputs[field.name];
      if (value === "" || !Number.isFinite(Number(value))) {
        return [[field.name, `${field.label} is required.`]];
      }
      if (typeof field.min === "number" && Number(value) < field.min) {
        return [[field.name, `${field.label} must be ${field.min.toLocaleString("en-IN")} or more.`]];
      }
      if (typeof field.max === "number" && Number(value) > field.max) {
        return [[field.name, `${field.label} must be ${field.max.toLocaleString("en-IN")} or less.`]];
      }
      if (typeof field.step === "number") {
        const stepBase = field.min ?? 0;
        const steps = (Number(value) - stepBase) / field.step;
        if (Math.abs(steps - Math.round(steps)) > 1e-8) {
          return [[field.name, `${field.label} must use increments of ${field.step.toLocaleString("en-IN")}.`]];
        }
      }
      return [];
    }),
  ) as Record<string, string>;
}

const accentClasses = {
  blue: {
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-100",
    button: "bg-blue-600 hover:bg-blue-700",
    ring: "focus:ring-blue-500/30",
  },
  green: {
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    button: "bg-emerald-600 hover:bg-emerald-700",
    ring: "focus:ring-emerald-500/30",
  },
  orange: {
    text: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-100",
    button: "bg-amber-600 hover:bg-amber-700",
    ring: "focus:ring-amber-500/30",
  },
  violet: {
    text: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-100",
    button: "bg-violet-600 hover:bg-violet-700",
    ring: "focus:ring-violet-500/30",
  },
};

const resultTone = {
  default: "text-slate-900",
  green: "text-emerald-700",
  blue: "text-blue-700",
  red: "text-red-700",
};

export const calculatorConfigs: Record<string, CalculatorConfig> = {
  gst: {
    slug: "gst",
    title: "GST Calculator",
    eyebrow: "Indirect Tax",
    description: "Add or remove GST and split tax into CGST/SGST or IGST with clear assumptions.",
    icon: Receipt,
    accent: "blue",
    inputs: { amount: 10000, rate: 18, mode: "exclusive", supplyType: "intra" },
    fields: [
      { name: "amount", label: "Amount", min: 0, max: 10000000, step: 0.01, helper: "Use taxable value or GST-inclusive invoice value." },
      { name: "rate", label: "GST Rate", suffix: "%", min: 0, max: 40, step: 0.1, chips: [{ label: "0%", value: 0 }, { label: "5%", value: 5 }, { label: "18%", value: 18 }, { label: "40%", value: 40 }, { label: "12%", value: 12 }, { label: "28%", value: 28 }] },
      { name: "mode", label: "Mode", type: "select", options: [{ label: "Add GST", value: "exclusive" }, { label: "Remove GST", value: "inclusive" }] },
      { name: "supplyType", label: "Supply Type", type: "select", options: [{ label: "Intra-state", value: "intra" }, { label: "Inter-state", value: "inter" }] },
    ],
    calculate: (inputs) => {
      const result = calculateGST({
        amount: toNumber(inputs.amount),
        rate: toNumber(inputs.rate),
        mode: inputs.mode as "exclusive" | "inclusive",
        supplyType: inputs.supplyType as "intra" | "inter",
      });
      return {
        primaryLabel: "Invoice Total",
        primaryValue: result.totalAmount,
        summary: `Taxable value is ${formatCurrency(result.baseAmount)} at ${result.rate}%.`,
        rows: [
          { label: "Taxable Value", value: result.baseAmount },
          { label: "GST Amount", value: result.taxAmount, tone: "blue" },
          { label: "CGST", value: result.cgst },
          { label: "SGST", value: result.sgst },
          { label: "IGST", value: result.igst },
        ],
      };
    },
    notes: ["Use the notified rate for the exact HSN/SAC classification and transaction date; this arithmetic tool does not determine classification, exemption or place of supply.", "Intra-state output splits rounded GST between CGST and SGST; inter-state output shows IGST. Invoice-level statutory rounding can differ.", "The 12% and 28% chips remain available for legacy invoices and transition cases; 40% applies only to specified de-merit supplies."],
  },
  salary: {
    slug: "salary",
    title: "CTC to In-Hand Salary Calculator",
    eyebrow: "Salary Planning",
    description: "Estimate monthly take-home salary from CTC, PF, variable pay and TDS.",
    icon: Wallet,
    accent: "green",
    inputs: { annualCtc: 1200000, basicPercent: 40, hraPercent: 50, variablePay: 120000, employeePfPercent: 12, employerPfPercent: 12, professionalTaxMonthly: 200 },
    fields: [
      { name: "annualCtc", label: "Annual CTC", min: 0, max: 10000000, step: 10000 },
      { name: "basicPercent", label: "Basic as CTC", suffix: "%", min: 0, max: 100, step: 1 },
      { name: "hraPercent", label: "HRA as Basic", suffix: "%", min: 0, max: 100, step: 1 },
      { name: "variablePay", label: "Annual Variable Pay", min: 0, max: 5000000, step: 5000 },
      { name: "employeePfPercent", label: "Employee PF", suffix: "%", min: 0, max: 20, step: 0.5 },
      { name: "employerPfPercent", label: "Employer PF", suffix: "%", min: 0, max: 20, step: 0.5 },
      { name: "professionalTaxMonthly", label: "Professional Tax / Month", min: 0, max: 2500, step: 50 },
    ],
    calculate: (inputs) => {
      const result = calculateSalary({
        annualCtc: toNumber(inputs.annualCtc),
        basicPercent: toNumber(inputs.basicPercent),
        hraPercent: toNumber(inputs.hraPercent),
        variablePay: toNumber(inputs.variablePay),
        employeePfPercent: toNumber(inputs.employeePfPercent),
        employerPfPercent: toNumber(inputs.employerPfPercent),
        professionalTaxMonthly: toNumber(inputs.professionalTaxMonthly),
      });
      return {
        primaryLabel: "Estimated In-Hand / Month",
        primaryValue: result.monthlyInHand,
        summary: `Monthly gross after employer PF and variable pay is ${formatCurrency(result.monthlyGross)}.`,
        rows: [
          { label: "Monthly CTC", value: result.monthlyCtc },
          { label: "Basic Pay", value: result.monthlyBasic },
          { label: "HRA", value: result.monthlyHra },
          { label: "Employee PF", value: result.monthlyEmployeePf, tone: "red" },
          { label: "Estimated TDS / Month", value: result.monthlyTds, tone: "red" },
          { label: "Annual Tax", value: result.annualTax },
        ],
      };
    },
    notes: ["TDS uses the new tax regime estimate and may differ from employer payroll.", "Bonus, reimbursements, insurance, food cards and special allowances vary by company."],
    validate: (inputs) => toNumber(inputs.variablePay) > toNumber(inputs.annualCtc)
      ? { variablePay: "Annual Variable Pay cannot exceed Annual CTC." }
      : {},
  },
  gratuity: {
    slug: "gratuity",
    title: "Gratuity Calculator",
    eyebrow: "Employee Benefits",
    description: "Estimate gratuity using the 15/26 formula for covered employees.",
    icon: ShieldCheck,
    accent: "violet",
    inputs: { basicDaMonthly: 52000, years: 6, months: 7 },
    fields: [
      { name: "basicDaMonthly", label: "Monthly Basic + DA", min: 0, max: 1000000, step: 1000 },
      { name: "years", label: "Completed Years", min: 0, max: 50, step: 1 },
      { name: "months", label: "Additional Months", min: 0, max: 11, step: 1 },
    ],
    calculate: (inputs) => {
      const result = calculateGratuity(toNumber(inputs.basicDaMonthly), toNumber(inputs.years), toNumber(inputs.months));
      return {
        primaryLabel: "Estimated Gratuity Formula Amount",
        primaryValue: result.gratuity,
        summary: result.eligible ? `Service rounded to ${result.roundedYears} year(s).` : "Usually payable after 5 years of continuous service.",
        rows: [
          { label: "Rounded Service Years", value: `${result.roundedYears} years` },
          { label: "Formula Amount", value: result.formulaAmount },
          { label: "Standard five-year condition", value: result.eligible ? "Met" : "Not met", tone: result.eligible ? "green" : "red" },
        ],
      };
    },
    notes: ["For covered employees, the estimate uses (last-drawn Basic + DA) × 15 × formula service years ÷ 26.", "A part-year is rounded up only when it exceeds six months. The standard five-year condition has exceptions, including death and disablement, which are not modeled.", "This is not an entitlement decision; coverage, employer policy, forfeiture rules and tax treatment can affect the payout."],
  },
  epf: {
    slug: "epf",
    title: "EPF Calculator",
    eyebrow: "Retirement Savings",
    description: "Project employee provident fund maturity with EPS split and interest.",
    icon: Landmark,
    accent: "green",
    inputs: { monthlyBasic: 50000, employeePercent: 12, employerPercent: 12, annualRate: 8.25, years: 20, openingBalance: 250000 },
    fields: [
      { name: "monthlyBasic", label: "Monthly Basic", min: 0, max: 1000000, step: 1000 },
      { name: "employeePercent", label: "Employee Contribution", suffix: "%", min: 0, max: 20, step: 0.5 },
      { name: "employerPercent", label: "Employer Contribution", suffix: "%", min: 0, max: 20, step: 0.5 },
      { name: "annualRate", label: "EPF Interest", suffix: "%", min: 0, max: 12, step: 0.05 },
      { name: "years", label: "Years to Invest", min: 1, max: 40, step: 1 },
      { name: "openingBalance", label: "Opening EPF Balance", min: 0, max: 10000000, step: 10000 },
    ],
    calculate: (inputs) => {
      const result = calculateEPF({
        monthlyBasic: toNumber(inputs.monthlyBasic),
        employeePercent: toNumber(inputs.employeePercent),
        employerPercent: toNumber(inputs.employerPercent),
        annualRate: toNumber(inputs.annualRate),
        years: toNumber(inputs.years),
        openingBalance: toNumber(inputs.openingBalance),
      });
      return {
        primaryLabel: "Projected EPF Corpus",
        primaryValue: result.maturityAmount,
        summary: `Monthly EPF contribution after EPS split is ${formatCurrency(result.monthlyEpfContribution)}.`,
        rows: [
          { label: "Employee Share", value: result.employeeContribution },
          { label: "Employer Share", value: result.employerContribution },
          { label: "EPS Diversion", value: result.epsContribution },
          { label: "Opening balance + projected contributions", value: result.totalContribution },
          { label: "Interest Earned", value: result.totalInterest, tone: "green" },
        ],
      };
    },
    notes: ["Employee and employer contribution rates are editable assumptions; EPFO guidance commonly uses 12%, with specified 10% cases.", "The illustrative EPS diversion uses 8.33% of wages capped at ₹15,000 and never exceeds the entered employer share; actual EPS membership and higher-wage arrangements can differ.", "The interest rate is user-entered. This simplified monthly-growth projection does not reproduce EPFO passbook credit timing or guarantee the final corpus."],
  },
  rd: {
    slug: "rd",
    title: "RD Calculator",
    eyebrow: "Deposit Planning",
    description: "Estimate recurring-deposit maturity using an editable rate and quarterly-credit approximation.",
    icon: PiggyBank,
    accent: "orange",
    inputs: { monthlyDeposit: 10000, annualRate: 7, months: 60 },
    fields: [
      { name: "monthlyDeposit", label: "Monthly Deposit", min: 0, max: 1000000, step: 1 },
      { name: "annualRate", label: "Interest Rate", suffix: "%", min: 0, max: 15, step: 0.01 },
      { name: "months", label: "Tenure", suffix: "months", min: 6, max: 120, step: 1 },
    ],
    calculate: (inputs) => {
      const result = calculateRD(toNumber(inputs.monthlyDeposit), toNumber(inputs.annualRate), toNumber(inputs.months));
      return {
        primaryLabel: "RD Maturity Value",
        primaryValue: result.maturityAmount,
        summary: `Total deposits over the tenure are ${formatCurrency(result.totalInvestment)}.`,
        rows: [
          { label: "Total Investment", value: result.totalInvestment },
          { label: "Interest Earned", value: result.totalInterest, tone: "green" },
        ],
      };
    },
    notes: ["Each instalment is assumed to be deposited at the beginning of the month and earn interest using a quarterly-credit approximation.", "The 7% default is an editable example; verify the offered rate, deposit dates and compounding method with the bank.", "Bank rounding, premature closure, TDS and tax slab impact are not included in the maturity figure."],
  },
  lumpsum: {
    slug: "lumpsum",
    title: "Lumpsum Calculator",
    eyebrow: "Mutual Fund Planning",
    description: "Project one-time investment growth and inflation-adjusted value.",
    icon: TrendingUp,
    accent: "green",
    inputs: { principal: 500000, annualReturn: 12, years: 10, inflationRate: 6 },
    fields: [
      { name: "principal", label: "Investment Amount", min: 0, max: 100000000, step: 1 },
      { name: "annualReturn", label: "Expected Return", suffix: "%", min: -99.99, max: 30, step: 0.01 },
      { name: "years", label: "Investment Period", suffix: "years", min: 1, max: 40, step: 1 },
      { name: "inflationRate", label: "Inflation Rate", suffix: "%", min: 0, max: 15, step: 0.01 },
    ],
    calculate: (inputs) => {
      const result = calculateLumpsum(toNumber(inputs.principal), toNumber(inputs.annualReturn), toNumber(inputs.years), toNumber(inputs.inflationRate));
      return {
        primaryLabel: "Estimated Future Value",
        primaryValue: result.maturityAmount,
        summary: `Estimated value in today's money is ${formatCurrency(result.inflationAdjustedValue)}, discounted using your inflation assumption.`,
        rows: [
          { label: "Invested Amount", value: result.investedAmount },
          { label: result.wealthGain >= 0 ? "Nominal gain" : "Nominal loss", value: result.wealthGain, tone: result.wealthGain >= 0 ? "green" : "red" },
          { label: "Value in today's money", value: result.inflationAdjustedValue },
        ],
      };
    },
    notes: ["The model assumes constant annual compounding with no interim cash flows; returns are assumptions, not guarantees.", "The inflation-adjusted result is a purchasing-power estimate using your entered inflation rate.", "Tax, exit load and expense ratios are not included."],
  },
  swp: {
    slug: "swp",
    title: "SWP Calculator",
    eyebrow: "Withdrawal Planning",
    description: "Plan systematic withdrawals and see whether your corpus lasts.",
    icon: BadgeIndianRupee,
    accent: "blue",
    inputs: { corpus: 5000000, annualReturn: 8, monthlyWithdrawal: 40000, years: 20 },
    fields: [
      { name: "corpus", label: "Starting Corpus", min: 0, max: 100000000, step: 1 },
      { name: "annualReturn", label: "Expected Return", suffix: "%", min: -99.99, max: 20, step: 0.01 },
      { name: "monthlyWithdrawal", label: "Monthly Withdrawal", min: 0, max: 1000000, step: 1 },
      { name: "years", label: "Withdrawal Period", suffix: "years", min: 1, max: 40, step: 1 },
    ],
    calculate: (inputs) => {
      const result = calculateSWP(toNumber(inputs.corpus), toNumber(inputs.annualReturn), toNumber(inputs.monthlyWithdrawal), toNumber(inputs.years));
      return {
        primaryLabel: "Remaining Corpus",
        primaryValue: result.remainingCorpus,
        summary: result.sustainable ? "Under these constant-return assumptions, every planned withdrawal is funded." : `Under these assumptions, the first withdrawal shortfall occurs in month ${result.depletionMonth}.`,
        rows: [
          { label: "Total Withdrawn", value: result.totalWithdrawn, tone: "blue" },
          { label: "First shortfall month", value: result.depletionMonth === null ? "No shortfall" : `${result.depletionMonth}` },
          { label: "Projection status", value: result.sustainable ? "Covers selected period" : "Depletes early", tone: result.sustainable ? "green" : "red" },
        ],
      };
    },
    notes: ["The expected annual return is converted to an equivalent constant monthly rate; return is applied before each monthly withdrawal.", "Market returns are not linear; this estimate does not model sequence-of-returns risk and does not guarantee sustainability.", "If a full withdrawal cannot be funded, total withdrawn includes the available partial payment and the simulation stops. Tax, exit load, inflation and withdrawal changes are excluded."],
  },
  inflation: {
    slug: "inflation",
    title: "Inflation Calculator",
    eyebrow: "Purchasing Power",
    description: "Estimate future cost and today's value after inflation.",
    icon: TrendingUp,
    accent: "orange",
    inputs: { currentCost: 100000, inflationRate: 6, years: 10 },
    fields: [
      { name: "currentCost", label: "Current Cost", min: 0, max: 100000000, step: 1 },
      { name: "inflationRate", label: "Inflation Rate", suffix: "%", min: 0, max: 20, step: 0.01 },
      { name: "years", label: "Years", min: 1, max: 50, step: 1 },
    ],
    calculate: (inputs) => {
      const result = calculateInflation(toNumber(inputs.currentCost), toNumber(inputs.inflationRate), toNumber(inputs.years));
      return {
        primaryLabel: "Estimated Future Cost",
        primaryValue: result.futureCost,
        summary: `${formatCurrency(result.currentCost)} today may cost ${formatCurrency(result.futureCost)} later.`,
        rows: [
          { label: "Current Cost", value: result.currentCost },
          { label: `Purchasing power after ${toNumber(inputs.years)} years (today's rupees)`, value: result.futurePurchasingPower },
          { label: "Purchasing Power Loss", value: result.purchasingPowerLoss, tone: "red" },
        ],
      };
    },
    notes: ["The model assumes constant annual inflation compounded once per year; the entered rate is a planning assumption, not a forecast.", "The purchasing-power result is expressed in today's rupees and shows what the unchanged nominal amount may buy after the selected period.", "This inflation-only model does not cover deflation. Education, healthcare and other category inflation can differ from CPI; investment returns and taxes are excluded."],
  },
  "loan-eligibility": {
    slug: "loan-eligibility",
    title: "Loan Eligibility Calculator",
    eyebrow: "Borrowing Power",
    description: "Estimate eligible loan amount from income, existing EMIs and FOIR.",
    icon: Calculator,
    accent: "blue",
    inputs: { netMonthlyIncome: 100000, existingEmi: 20000, foirPercent: 50, annualRate: 9, tenureYears: 20 },
    fields: [
      { name: "netMonthlyIncome", label: "Net Monthly Income", min: 0, max: 5000000, step: 1 },
      { name: "existingEmi", label: "Existing EMI", min: 0, max: 1000000, step: 1 },
      { name: "foirPercent", label: "FOIR", suffix: "%", min: 10, max: 80, step: 0.1, chips: [{ label: "40%", value: 40 }, { label: "50%", value: 50 }, { label: "60%", value: 60 }] },
      { name: "annualRate", label: "Interest Rate", suffix: "%", min: 0, max: 25, step: 0.01 },
      { name: "tenureYears", label: "Tenure", suffix: "years", min: 1, max: 30, step: 1 },
    ],
    calculate: (inputs) => {
      const result = calculateLoanEligibility(toNumber(inputs.netMonthlyIncome), toNumber(inputs.existingEmi), toNumber(inputs.foirPercent), toNumber(inputs.annualRate), toNumber(inputs.tenureYears));
      return {
        primaryLabel: "Eligible Loan Amount",
        primaryValue: result.eligibleLoanAmount,
        summary: result.eligibleEmi === 0 ? "No additional EMI capacity under the selected FOIR assumption." : `Estimated available EMI capacity is ${formatCurrency(result.eligibleEmi)} per month.`,
        rows: [
          { label: "Max Total EMI", value: result.maxTotalEmi },
          { label: "Eligible EMI", value: result.eligibleEmi, tone: "blue" },
          { label: "Projected interest on estimated loan", value: result.totalInterest },
          { label: "Projected repayment on estimated loan", value: result.totalPayment },
        ],
      };
    },
    notes: ["FOIR is a user-entered lender-policy assumption and varies by lender and loan product.", "This estimate is not a loan approval; lenders also assess credit score, age, employer, obligations, collateral and documentation.", "Processing fees, insurance and other lender charges are excluded. Zero additional capacity under one FOIR assumption does not mean every lender will reject an application."],
  },
};

export function SimpleFinancialCalculatorPage({ slug }: { slug: keyof typeof calculatorConfigs }) {
  const config = calculatorConfigs[slug];
  const seo = getSEOConfig(`/calculators/${config.slug}`);
  const manifestEntry = getCalculatorByPath(`/calculators/${config.slug}`);
  const accent = accentClasses[config.accent];
  const [inputs, setInputs] = useState<Record<string, FieldValue>>({ ...config.inputs });
  const errors = useMemo(() => ({
    ...validateInputs(config.fields, inputs),
    ...(config.validate?.(inputs) ?? {}),
  }), [config, inputs]);
  const result = useMemo(
    () => Object.keys(errors).length === 0 ? config.calculate(inputs) : null,
    [config, errors, inputs],
  );
  const Icon = config.icon;

  const setInput = (name: string, value: FieldValue) => {
    setInputs((current) => ({ ...current, [name]: value }));
  };

  const resetCalculator = () => setInputs({ ...config.inputs });

  return (
    <div className="min-h-screen bg-slate-50">
      <MetaSEO
        title={seo?.title || `${config.title} | MyeCA.in`}
        description={seo?.description || config.description}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <div className="max-w-7xl mx-auto px-4 py-5 md:py-8">
        <div className="mb-5 md:hidden">
          <MobilePageHeader
            eyebrow={config.eyebrow}
            icon={<Icon className="h-4 w-4" />}
            title={config.title}
            description={config.description}
            action={
              <Link href="/calculators" className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm">
                All calculators <ChevronRight className="w-4 h-4" />
              </Link>
            }
          />
        </div>

        <div className="mb-8 hidden flex-col gap-4 md:flex md:flex-row md:items-end md:justify-between">
          <div>
            <div className={cn("type-meta mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-normal uppercase", accent.bg, accent.border, accent.text)}>
              <Icon className="w-3.5 h-3.5" />
              {config.eyebrow}
            </div>
            <h1 className="type-page-title font-normal text-slate-950">{config.title}</h1>
            <p className="type-body mt-3 max-w-2xl text-slate-500">{config.description}</p>
          </div>
          <Link href="/calculators" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
            All calculators <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-12 lg:items-start">
          <MobileCard as="section" className="lg:col-span-7 md:rounded-[28px] md:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">Enter your assumptions to update the estimate.</p>
              <button
                type="button"
                onClick={resetCalculator}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                aria-label="Reset calculator"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              {config.fields.map((field) => {
                const inputId = `${config.slug}-${field.name}`;
                const helperId = `${inputId}-helper`;
                const errorId = `${inputId}-error`;
                const error = errors[field.name];
                const describedBy = [field.helper ? helperId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

                return (
                <div key={field.name} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                    <label htmlFor={inputId}>{field.label}</label>
                    {field.type !== "select" && (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 md:bg-white">
                        {inputs[field.name] === "" ? "—" : String(inputs[field.name])}{field.suffix ? ` ${field.suffix}` : ""}
                      </span>
                    )}
                  </div>
                  {field.type === "select" ? (
                    <select
                      id={inputId}
                      name={field.name}
                      value={String(inputs[field.name])}
                      onChange={(event) => setInput(field.name, event.target.value)}
                      aria-describedby={describedBy}
                      className={cn("h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-4 md:rounded-xl md:bg-slate-50", accent.ring)}
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        id={inputId}
                        name={field.name}
                        type="number"
                        value={inputs[field.name]}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        onChange={(event) => setInput(field.name, event.target.value === "" ? "" : Number(event.target.value))}
                        aria-invalid={Boolean(error)}
                        aria-describedby={describedBy}
                        className={cn("h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-4 md:rounded-xl md:bg-slate-50", accent.ring)}
                      />
                      {typeof field.min === "number" && typeof field.max === "number" && (
                        <input
                          type="range"
                          value={inputs[field.name] === "" ? field.min : Number(inputs[field.name])}
                          min={field.min}
                          max={field.max}
                          step={field.step || 1}
                          onChange={(event) => setInput(field.name, Number(event.target.value))}
                          aria-label={`${field.label} slider`}
                          className="hidden w-full accent-slate-900 md:block"
                        />
                      )}
                      {field.chips && (
                        <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
                          {field.chips.map((chip) => (
                            <button
                              key={chip.label}
                              type="button"
                              onClick={() => setInput(field.name, chip.value)}
                              aria-pressed={Number(inputs[field.name]) === chip.value}
                              className={cn("min-h-9 shrink-0 rounded-lg border px-3 text-xs font-medium transition-colors", Number(inputs[field.name]) === chip.value ? `${accent.bg} ${accent.border} ${accent.text}` : "border-slate-200 text-slate-500 hover:bg-slate-50")}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {field.helper && <p id={helperId} className="text-xs text-slate-400">{field.helper}</p>}
                  {error && <p id={errorId} role="alert" className="text-xs font-medium text-red-700">{error}</p>}
                </div>
              )})}
            </div>
          </MobileCard>

          <MobileCard as="aside" className="lg:col-span-5 md:rounded-[28px] md:p-6 lg:sticky lg:top-24">
            {result ? (
              <>
                <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                  {result.primaryLabel}: {formatCurrency(result.primaryValue)}
                </div>
                <div className={cn("rounded-lg p-4 text-white md:rounded-[24px] md:p-5", accent.button)}>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/75">{result.primaryLabel}</p>
                  <div className="type-page-title mt-2 font-semibold md:mt-3 md:font-normal">{formatCurrency(result.primaryValue)}</div>
                  <p className="mt-3 text-sm text-white/80">{result.summary}</p>
                </div>

                <div className="mt-4 grid gap-2 md:mt-5 md:gap-3">
                  {result.rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 md:rounded-2xl md:px-4 md:py-3">
                      <span className="text-sm text-slate-500">{row.label}</span>
                      <span className={cn("text-sm font-normal", resultTone[row.tone || "default"])}>{formatCurrency(row.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 md:rounded-2xl">
                Correct the highlighted inputs to see the estimate.
              </div>
            )}

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 md:mt-5 md:rounded-2xl md:bg-white md:p-4">
              <div className="flex items-center gap-2 text-sm font-normal text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Important assumptions
              </div>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-500 md:mt-3 md:space-y-2">
                {config.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
              {manifestEntry && (
                <p className="mt-3 border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-500">
                  <span className="font-medium text-slate-700">Rules basis:</span> {manifestEntry.ruleVersion}
                </p>
              )}
            </div>
          </MobileCard>
        </div>
      </div>
    </div>
  );
}
