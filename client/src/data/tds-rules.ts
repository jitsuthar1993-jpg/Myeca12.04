export type TDSIncomeType =
  | "salary"
  | "interest"
  | "dividend"
  | "rent"
  | "commission"
  | "professional_fees"
  | "contractor_payment";

export interface TDSRule {
  rate: number; // base rate in percent
  threshold: number; // applicability threshold in INR
  section: string; // Income Tax Act section
  notes?: string;
}

export type AssessmentYear = "2025-26" | "2024-25" | "2023-24" | "2022-23" | "2021-22";

export const assessmentYears: { value: AssessmentYear; label: string }[] = [
  { value: "2025-26", label: "AY 2025-26 (FY 2024-25)" },
  { value: "2024-25", label: "AY 2024-25 (FY 2023-24)" },
  { value: "2023-24", label: "AY 2023-24 (FY 2022-23)" },
  { value: "2022-23", label: "AY 2022-23 (FY 2021-22)" },
  { value: "2021-22", label: "AY 2021-22 (FY 2020-21)" },
];

// AY-specific rules. Rates/thresholds broadly stable across listed AYs.
const baseRules: Record<TDSIncomeType, TDSRule> = {
  salary: {
    rate: 0,
    threshold: 0,
    section: "N/A",
    notes: "Salary TDS handled via payroll (Form 24Q).",
  },
  interest: {
    rate: 10,
    threshold: 40000, // Bank/Post office interest threshold for non-seniors (Sec 194A)
    section: "194A",
    notes: "Senior citizens threshold \u20B950,000 (bank/post office).",
  },
  dividend: {
    rate: 10,
    threshold: 5000, // Sec 194
    section: "194",
    notes: "Resident shareholders typically face 10% TDS on dividends above \u20B95,000.",
  },
  rent: {
    rate: 10,
    threshold: 240000, // Sec 194I, annual aggregate
    section: "194I",
    notes: "Individuals/ HUFs paying >\u20B950,000/month may fall under Sec 194IB @5%.",
  },
  commission: {
    rate: 5,
    threshold: 15000, // Sec 194H
    section: "194H",
  },
  professional_fees: {
    rate: 10,
    threshold: 30000, // Sec 194J (professional services)
    section: "194J",
    notes: "Technical services may have 2% rate; simplified here as 10%.",
  },
  contractor_payment: {
    rate: 1,
    threshold: 30000, // Sec 194C single payment (aggregate threshold \u20B91,00,000)
    section: "194C",
    notes: "Aggregate threshold \u20B91,00,000 applies; simplified single-payment threshold shown.",
  },
};

export const tdsRulesByAY: Record<AssessmentYear, Record<TDSIncomeType, TDSRule>> = {
  "2025-26": baseRules,
  "2024-25": baseRules,
  "2023-24": baseRules,
  "2022-23": baseRules,
  "2021-22": baseRules,
};