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
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { getSEOConfig } from "@/config/seo.config";
import { cn } from "@/lib/utils";
import { MobileCard, MobilePageHeader } from "@/components/mobile";
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
      { name: "amount", label: "Amount", min: 0, max: 10000000, step: 100, helper: "Use taxable value or GST-inclusive invoice value." },
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
    notes: ["Use the exact HSN/SAC rate for filing.", "The 12% and 28% chips are kept for legacy invoices and transition cases."],
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
        primaryLabel: "Gratuity Payable",
        primaryValue: result.gratuity,
        summary: result.eligible ? `Service rounded to ${result.roundedYears} year(s).` : "Usually payable after 5 years of continuous service.",
        rows: [
          { label: "Rounded Service Years", value: `${result.roundedYears} years` },
          { label: "Formula Amount", value: result.formulaAmount },
          { label: "Eligibility", value: result.eligible ? "Eligible" : "Below 5 years", tone: result.eligible ? "green" : "red" },
        ],
      };
    },
    notes: ["Formula: (Basic + DA) x 15 x years / 26.", "Actual tax exemption and employer policy can affect final payout."],
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
          { label: "Total Contribution", value: result.totalContribution },
          { label: "Interest Earned", value: result.totalInterest, tone: "green" },
        ],
      };
    },
    notes: ["Default interest is 8.25%, editable for future notifications.", "EPS is estimated at 8.33% of wage capped at Rs 15,000."],
  },
  rd: {
    slug: "rd",
    title: "RD Calculator",
    eyebrow: "Deposit Planning",
    description: "Calculate recurring deposit maturity using quarterly compounding.",
    icon: PiggyBank,
    accent: "orange",
    inputs: { monthlyDeposit: 10000, annualRate: 7, months: 60 },
    fields: [
      { name: "monthlyDeposit", label: "Monthly Deposit", min: 0, max: 1000000, step: 500 },
      { name: "annualRate", label: "Interest Rate", suffix: "%", min: 0, max: 15, step: 0.1 },
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
    notes: ["Banks may round interest differently by product.", "TDS and tax slab impact are not included in the maturity figure."],
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
      { name: "principal", label: "Investment Amount", min: 0, max: 100000000, step: 10000 },
      { name: "annualReturn", label: "Expected Return", suffix: "%", min: 0, max: 30, step: 0.5 },
      { name: "years", label: "Investment Period", suffix: "years", min: 1, max: 40, step: 1 },
      { name: "inflationRate", label: "Inflation Rate", suffix: "%", min: 0, max: 15, step: 0.5 },
    ],
    calculate: (inputs) => {
      const result = calculateLumpsum(toNumber(inputs.principal), toNumber(inputs.annualReturn), toNumber(inputs.years), toNumber(inputs.inflationRate));
      return {
        primaryLabel: "Future Value",
        primaryValue: result.maturityAmount,
        summary: `Inflation-adjusted value is ${formatCurrency(result.inflationAdjustedValue)}.`,
        rows: [
          { label: "Invested Amount", value: result.investedAmount },
          { label: "Wealth Gain", value: result.wealthGain, tone: "green" },
          { label: "Real Value", value: result.inflationAdjustedValue },
        ],
      };
    },
    notes: ["Returns are assumptions, not guarantees.", "Tax, exit load and expense ratios are not included."],
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
      { name: "corpus", label: "Starting Corpus", min: 0, max: 100000000, step: 50000 },
      { name: "annualReturn", label: "Expected Return", suffix: "%", min: 0, max: 20, step: 0.5 },
      { name: "monthlyWithdrawal", label: "Monthly Withdrawal", min: 0, max: 1000000, step: 1000 },
      { name: "years", label: "Withdrawal Period", suffix: "years", min: 1, max: 40, step: 1 },
    ],
    calculate: (inputs) => {
      const result = calculateSWP(toNumber(inputs.corpus), toNumber(inputs.annualReturn), toNumber(inputs.monthlyWithdrawal), toNumber(inputs.years));
      return {
        primaryLabel: "Remaining Corpus",
        primaryValue: result.remainingCorpus,
        summary: result.sustainable ? "Corpus lasts through the selected period." : `Corpus depletes around month ${result.depletionMonth}.`,
        rows: [
          { label: "Total Withdrawn", value: result.totalWithdrawn, tone: "blue" },
          { label: "Depletion Month", value: result.depletionMonth === null ? "Not depleted" : `${result.depletionMonth}` },
          { label: "Status", value: result.sustainable ? "Sustainable" : "Depletes early", tone: result.sustainable ? "green" : "red" },
        ],
      };
    },
    notes: ["Market returns are not linear in real life.", "This projection uses a constant monthly return assumption."],
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
      { name: "currentCost", label: "Current Cost", min: 0, max: 100000000, step: 1000 },
      { name: "inflationRate", label: "Inflation Rate", suffix: "%", min: 0, max: 20, step: 0.5 },
      { name: "years", label: "Years", min: 1, max: 50, step: 1 },
    ],
    calculate: (inputs) => {
      const result = calculateInflation(toNumber(inputs.currentCost), toNumber(inputs.inflationRate), toNumber(inputs.years));
      return {
        primaryLabel: "Future Cost",
        primaryValue: result.futureCost,
        summary: `${formatCurrency(result.currentCost)} today may cost ${formatCurrency(result.futureCost)} later.`,
        rows: [
          { label: "Current Cost", value: result.currentCost },
          { label: "Present Value Later", value: result.presentValue },
          { label: "Purchasing Power Loss", value: result.purchasingPowerLoss, tone: "red" },
        ],
      };
    },
    notes: ["Use long-term average inflation for planning.", "Education and healthcare inflation can differ from CPI."],
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
      { name: "netMonthlyIncome", label: "Net Monthly Income", min: 0, max: 5000000, step: 5000 },
      { name: "existingEmi", label: "Existing EMI", min: 0, max: 1000000, step: 1000 },
      { name: "foirPercent", label: "FOIR", suffix: "%", min: 10, max: 80, step: 1, chips: [{ label: "40%", value: 40 }, { label: "50%", value: 50 }, { label: "60%", value: 60 }] },
      { name: "annualRate", label: "Interest Rate", suffix: "%", min: 0, max: 25, step: 0.1 },
      { name: "tenureYears", label: "Tenure", suffix: "years", min: 1, max: 30, step: 1 },
    ],
    calculate: (inputs) => {
      const result = calculateLoanEligibility(toNumber(inputs.netMonthlyIncome), toNumber(inputs.existingEmi), toNumber(inputs.foirPercent), toNumber(inputs.annualRate), toNumber(inputs.tenureYears));
      return {
        primaryLabel: "Eligible Loan Amount",
        primaryValue: result.eligibleLoanAmount,
        summary: `Available EMI capacity is ${formatCurrency(result.eligibleEmi)} per month.`,
        rows: [
          { label: "Max Total EMI", value: result.maxTotalEmi },
          { label: "Eligible EMI", value: result.eligibleEmi, tone: "blue" },
          { label: "Total Interest", value: result.totalInterest },
          { label: "Total Payment", value: result.totalPayment },
        ],
      };
    },
    notes: ["Banks use additional credit score, age, employer and collateral checks.", "FOIR policy varies by lender and loan product."],
  },
};

export function SimpleFinancialCalculatorPage({ slug }: { slug: keyof typeof calculatorConfigs }) {
  const config = calculatorConfigs[slug];
  const seo = getSEOConfig(`/calculators/${config.slug}`);
  const accent = accentClasses[config.accent];
  const [inputs, setInputs] = useState<Record<string, FieldValue>>(config.inputs);
  const result = useMemo(() => config.calculate(inputs), [config, inputs]);
  const Icon = config.icon;

  const setInput = (name: string, value: FieldValue) => {
    setInputs((current) => ({ ...current, [name]: value }));
  };

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
            <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-normal uppercase tracking-widest mb-4", accent.bg, accent.border, accent.text)}>
              <Icon className="w-3.5 h-3.5" />
              {config.eyebrow}
            </div>
            <h1 className="text-4xl md:text-5xl font-normal text-slate-950 tracking-tight">{config.title}</h1>
            <p className="mt-3 text-slate-500 max-w-2xl">{config.description}</p>
          </div>
          <Link href="/calculators" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
            All calculators <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-12 lg:items-start">
          <MobileCard as="section" className="lg:col-span-7 md:rounded-[28px] md:p-6">
            <div className="grid gap-4 md:grid-cols-2 md:gap-5">
              {config.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label htmlFor={`${config.slug}-${field.name}`} className="flex items-center justify-between gap-3 text-sm font-medium text-slate-700">
                    <span>{field.label}</span>
                    {field.type !== "select" && (
                      <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-500 md:bg-white">
                        {String(inputs[field.name])}{field.suffix ? ` ${field.suffix}` : ""}
                      </span>
                    )}
                  </label>
                  {field.type === "select" ? (
                    <select
                      id={`${config.slug}-${field.name}`}
                      name={field.name}
                      value={String(inputs[field.name])}
                      onChange={(event) => setInput(field.name, event.target.value)}
                      className={cn("h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-4 md:rounded-xl md:bg-slate-50", accent.ring)}
                    >
                      {field.options.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        id={`${config.slug}-${field.name}`}
                        name={field.name}
                        type="number"
                        value={Number(inputs[field.name])}
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        onChange={(event) => setInput(field.name, Number(event.target.value))}
                        className={cn("h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-4 md:rounded-xl md:bg-slate-50", accent.ring)}
                      />
                      {typeof field.min === "number" && typeof field.max === "number" && (
                        <input
                          type="range"
                          value={Number(inputs[field.name])}
                          min={field.min}
                          max={field.max}
                          step={field.step || 1}
                          onChange={(event) => setInput(field.name, Number(event.target.value))}
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
                              className={cn("min-h-9 shrink-0 rounded-lg border px-3 text-xs font-medium transition-colors", Number(inputs[field.name]) === chip.value ? `${accent.bg} ${accent.border} ${accent.text}` : "border-slate-200 text-slate-500 hover:bg-slate-50")}
                            >
                              {chip.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  {field.helper && <p className="text-xs text-slate-400">{field.helper}</p>}
                </div>
              ))}
            </div>
          </MobileCard>

          <MobileCard as="aside" className="lg:col-span-5 md:rounded-[28px] md:p-6 lg:sticky lg:top-24">
            <div className={cn("rounded-lg p-4 text-white md:rounded-[24px] md:p-5", accent.button)}>
              <p className="text-xs uppercase tracking-[0.18em] text-white/75">{result.primaryLabel}</p>
              <div className="mt-2 text-[32px] font-semibold tracking-tight md:mt-3 md:text-4xl md:font-normal">{formatCurrency(result.primaryValue)}</div>
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

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 md:mt-5 md:rounded-2xl md:bg-white md:p-4">
              <div className="flex items-center gap-2 text-sm font-normal text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Important assumptions
              </div>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-500 md:mt-3 md:space-y-2">
                {config.notes.map((note) => <li key={note}>{note}</li>)}
              </ul>
            </div>
          </MobileCard>
        </div>
      </div>
    </div>
  );
}
