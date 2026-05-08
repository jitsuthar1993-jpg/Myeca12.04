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

export type AssessmentYear = "2026-27" | "2025-26" | "2024-25" | "2023-24" | "2022-23" | "2021-22";

export const assessmentYears: { value: AssessmentYear; label: string }[] = [
  { value: "2026-27", label: "AY 2026-27 (FY 2025-26)" },
  { value: "2025-26", label: "AY 2025-26 (FY 2024-25 - archive)" },
  { value: "2024-25", label: "AY 2024-25 (FY 2023-24 - archive)" },
  { value: "2023-24", label: "AY 2023-24 (FY 2022-23 - archive)" },
  { value: "2022-23", label: "AY 2022-23 (FY 2021-22 - archive)" },
  { value: "2021-22", label: "AY 2021-22 (FY 2020-21 - archive)" },
];

const currentRules: Record<TDSIncomeType, TDSRule> = {
  salary: {
    rate: 0,
    threshold: 0,
    section: "192",
    notes: "Salary TDS is computed by payroll using the employee's estimated annual income and selected regime.",
  },
  interest: {
    rate: 10,
    threshold: 50000,
    section: "194A",
    notes: "Bank/post office deposit threshold shown for non-seniors. Senior citizen bank/post office threshold is ₹1,00,000; other interest categories can differ.",
  },
  dividend: {
    rate: 10,
    threshold: 10000,
    section: "194",
    notes: "Resident shareholder dividend threshold shown for common cases.",
  },
  rent: {
    rate: 10,
    threshold: 600000,
    section: "194I",
    notes: "Land/building/furniture rent estimate. Plant/machinery rent can be 2%; individual/HUF rent under 194IB may be 2% above ₹50,000/month.",
  },
  commission: {
    rate: 2,
    threshold: 20000,
    section: "194H",
  },
  professional_fees: {
    rate: 10,
    threshold: 50000,
    section: "194J",
    notes: "Professional-services rate shown. Technical services, call centre payments, and some royalty/distribution payments can be 2%.",
  },
  contractor_payment: {
    rate: 1,
    threshold: 30000,
    section: "194C",
    notes: "Single-payment threshold shown. Aggregate threshold is ₹1,00,000. Rate can be 1% for individual/HUF contractors and 2% for others.",
  },
};

const legacyRules: Record<TDSIncomeType, TDSRule> = {
  ...currentRules,
  interest: {
    rate: 10,
    threshold: 40000,
    section: "194A",
    notes: "Historical bank/post office threshold for non-seniors; senior citizen threshold was ₹50,000.",
  },
  dividend: {
    rate: 10,
    threshold: 5000,
    section: "194",
    notes: "Historical resident shareholder dividend threshold.",
  },
  rent: {
    rate: 10,
    threshold: 240000,
    section: "194I",
    notes: "Historical annual aggregate threshold for common 194I rent cases.",
  },
  commission: {
    rate: 5,
    threshold: 15000,
    section: "194H",
  },
  professional_fees: {
    rate: 10,
    threshold: 30000,
    section: "194J",
    notes: "Historical professional-services threshold.",
  },
};

export const tdsRulesByAY: Record<AssessmentYear, Record<TDSIncomeType, TDSRule>> = {
  "2026-27": currentRules,
  "2025-26": legacyRules,
  "2024-25": legacyRules,
  "2023-24": legacyRules,
  "2022-23": legacyRules,
  "2021-22": legacyRules,
};
