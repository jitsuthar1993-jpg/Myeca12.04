import { CalculatorFeature } from "@/types/calculator";

export const taxCalculators: CalculatorFeature[] = [
  {
    id: "income-tax",
    title: "Income Tax Calculator",
    description: "Calculate your income tax liability under both old and new tax regimes with age-based slabs",
    icon: "Calculator",
    path: "/calculators/income-tax",
    color: "blue"
  },
  {
    id: "tax-regime",
    title: "Tax Regime Calculator",
    description: "Compare old vs new tax regime to find the best option for you with FY 2024-25 rates",
    icon: "GitCompare",
    path: "/calculators/tax-regime",
    color: "green"
  },
  {
    id: "hra",
    title: "HRA Calculator",
    description: "Calculate House Rent Allowance exemption with metro/non-metro rates (50%/40%)",
    icon: "Home",
    path: "/calculators/hra",
    color: "purple"
  },
  {
    id: "tds",
    title: "TDS Calculator",
    description: "Calculate Tax Deducted at Source for salary, interest, rent, and professional fees",
    icon: "Receipt",
    path: "/calculators/tds",
    color: "orange"
  },
  {
    id: "capital-gains",
    title: "Capital Gains Calculator",
    description: "Calculate STCG/LTCG tax on equity, property, gold with new 12.5% rates",
    icon: "TrendingUp",
    path: "/calculators/capital-gains",
    color: "emerald"
  }
];

export const investmentCalculators: CalculatorFeature[] = [
  {
    id: "sip",
    title: "SIP Calculator",
    description: "Plan mutual fund investments with compound interest formula and monthly breakdowns",
    icon: "TrendingUp",
    path: "/calculators/sip",
    color: "green"
  },
  {
    id: "fd",
    title: "FD Calculator",
    description: "Calculate fixed deposit returns with quarterly compounding at current rates",
    icon: "PiggyBank",
    path: "/calculators/fd",
    color: "blue"
  },
  {
    id: "ppf",
    title: "PPF Calculator",
    description: "Calculate Public Provident Fund maturity at 7.1% with \u20B91.5L annual limit",
    icon: "Shield",
    path: "/calculators/ppf",
    color: "purple"
  },
  {
    id: "elss",
    title: "ELSS Fund Comparator",
    description: "Compare ELSS funds, track returns, and maximize 80C tax benefits",
    icon: "BarChart3",
    path: "/elss-comparator",
    color: "indigo"
  },
  {
    id: "nps",
    title: "NPS Tax Calculator",
    description: "Calculate NPS returns with 80CCD(1B) extra \u20B950K deduction and retirement planning",
    icon: "Shield",
    path: "/calculators/nps",
    color: "teal"
  },
  {
    id: "portfolio",
    title: "Portfolio Tax Dashboard",
    description: "Track STCG/LTCG, tax-loss harvesting, and optimize your investment taxes",
    icon: "PieChart",
    path: "/portfolio-dashboard",
    color: "violet"
  }
];

export const loanCalculators: CalculatorFeature[] = [
  {
    id: "emi",
    title: "EMI Calculator",
    description: "Calculate loan EMIs with amortization schedule and interest rates starting 8.25%",
    icon: "CreditCard",
    path: "/calculators/emi",
    color: "red"
  },
  {
    id: "home-loan",
    title: "Home Loan Calculator",
    description: "Calculate home loan EMIs starting 7.90% with eligibility and tax benefits",
    icon: "Home",
    path: "/calculators/home-loan",
    color: "indigo"
  },
  {
    id: "car-loan",
    title: "Car Loan Calculator",
    description: "Calculate car loan EMIs with rates from 8.25% to 11.5% for new/used cars",
    icon: "Car",
    path: "/calculators/car-loan",
    color: "yellow"
  },
  {
    id: "personal-loan",
    title: "Personal Loan Calculator",
    description: "Calculate personal loan EMIs with higher interest rates and shorter tenure",
    icon: "Wallet",
    path: "/calculators/personal-loan",
    color: "orange"
  },
  {
    id: "education-loan",
    title: "Education Loan Calculator",
    description: "Calculate education loan EMIs with 80E tax benefits and moratorium period",
    icon: "GraduationCap",
    path: "/calculators/education-loan",
    color: "cyan"
  }
];
