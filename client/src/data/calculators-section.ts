export interface CalculatorItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  href: string;
  category: 'tax' | 'investment' | 'loan' | 'other';
}

export const calculators: CalculatorItem[] = [
  // Tax Calculators
  {
    id: "income-tax",
    title: "Income Tax Calculator",
    description: "Calculate your income tax liability for FY 2024-25 with both old and new tax regimes comparison.",
    icon: "Calculator",
    color: "blue",
    href: "/calculators/income-tax",
    category: "tax"
  },
  {
    id: "hra",
    title: "HRA Calculator",
    description: "Calculate House Rent Allowance exemption and tax savings based on your salary and rent paid.",
    icon: "Home",
    color: "green",
    href: "/calculators/hra",
    category: "tax"
  },
  {
    id: "tds",
    title: "TDS Calculator",
    description: "Calculate Tax Deducted at Source for various income types including salary, interest, and professional fees.",
    icon: "Receipt",
    color: "orange",
    href: "/calculators/tds",
    category: "tax"
  },
  {
    id: "capital-gains",
    title: "Capital Gains Calculator",
    description: "Calculate short-term and long-term capital gains tax on equity, property, and other investments.",
    icon: "TrendingUp",
    color: "purple",
    href: "/calculators/capital-gains",
    category: "tax"
  },
  {
    id: "tax-regime",
    title: "Tax Regime Comparison",
    description: "Compare old vs new tax regime to find which one saves you more tax for FY 2024-25.",
    icon: "GitCompare",
    color: "indigo",
    href: "/calculators/tax-regime",
    category: "tax"
  },

  // Investment Calculators
  {
    id: "sip",
    title: "SIP Calculator",
    description: "Calculate returns on Systematic Investment Plan with compound growth and rupee cost averaging.",
    icon: "PiggyBank",
    color: "emerald",
    href: "/calculators/sip",
    category: "investment"
  },
  {
    id: "ppf",
    title: "PPF Calculator",
    description: "Calculate Public Provident Fund returns with 7.1% interest rate and 15-year lock-in period.",
    icon: "Shield",
    color: "cyan",
    href: "/calculators/ppf",
    category: "investment"
  },
  {
    id: "fd",
    title: "Fixed Deposit Calculator",
    description: "Calculate FD maturity amount and interest earned with quarterly compounding for all major banks.",
    icon: "Landmark",
    color: "teal",
    href: "/calculators/fd",
    category: "investment"
  },

  // Loan Calculators
  {
    id: "emi",
    title: "EMI Calculator",
    description: "Calculate Equated Monthly Installment for home loan, personal loan, and car loan with amortization schedule.",
    icon: "CreditCard",
    color: "rose",
    href: "/calculators/emi",
    category: "loan"
  },
  {
    id: "home-loan",
    title: "Loan Calculator",
    description: "Calculate Home, Car, Personal & Education loan EMIs with eligibility and tax benefits.",
    icon: "Briefcase",
    color: "blue",
    href: "/calculators/home-loan",
    category: "loan"
  },

  // Other Tools
  {
    id: "compliance-calendar",
    title: "Compliance Calendar",
    description: "Stay ahead of regulatory deadlines for GST, Income Tax, and MCA with our automated timeline.",
    icon: "Calendar",
    color: "indigo",
    href: "/compliance-calendar",
    category: "loan"
  },
  {
    id: "penalty-calculator",
    title: "Penalty Calculator",
    description: "Estimate potential late fees and penalties for delayed GST filings and Income Tax returns.",
    icon: "ShieldAlert",
    color: "red",
    href: "/calculators/penalty",
    category: "loan"
  }
];

export const calculatorCategories = [
  {
    id: "tax",
    title: "Tax Calculators",
    description: "Essential calculators for income tax planning and compliance"
  },
  {
    id: "investment",
    title: "Investment Calculators", 
    description: "Plan your investments and calculate returns"
  },
  {
    id: "loan",
    title: "Loan Calculators",
    description: "Calculate EMI and loan repayment schedules"
  },
];