import type { TaxSlabs } from "@/types/calculator";

export type TaxRegime = "old" | "new";
export type AgeCategory = "regular" | "senior" | "superSenior";

export interface SectionReference {
  oldAct: string;
  newAct: string;
  label: string;
}

export const DEFAULT_ASSESSMENT_YEAR = "2026-27";
export const DEFAULT_FINANCIAL_YEAR = "2025-26";
export const DEFAULT_TAX_YEAR = "2026-27";

export const TAX_TRANSITION_NOTE =
  "AY 2026-27 filing uses the Income-tax Act, 1961 forms. Income-tax Act, 2025 applies from Tax Year 2026-27 for income beginning 1 April 2026.";

export const HEALTH_AND_EDUCATION_CESS_RATE = 0.04;

export const STANDARD_DEDUCTION_BY_REGIME: Record<TaxRegime, number> = {
  old: 50000,
  new: 75000,
};

export const AY_2026_27_OLD_REGIME_SLABS: Record<AgeCategory, TaxSlabs[]> = {
  regular: [
    { min: 0, max: 250000, rate: 0 },
    { min: 250000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.2 },
    { min: 1000000, max: Infinity, rate: 0.3 },
  ],
  senior: [
    { min: 0, max: 300000, rate: 0 },
    { min: 300000, max: 500000, rate: 0.05 },
    { min: 500000, max: 1000000, rate: 0.2 },
    { min: 1000000, max: Infinity, rate: 0.3 },
  ],
  superSenior: [
    { min: 0, max: 500000, rate: 0 },
    { min: 500000, max: 1000000, rate: 0.2 },
    { min: 1000000, max: Infinity, rate: 0.3 },
  ],
};

export const AY_2026_27_NEW_REGIME_SLABS: TaxSlabs[] = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.1 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.2 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: Infinity, rate: 0.3 },
];

export const AY_2025_26_NEW_REGIME_SLABS: TaxSlabs[] = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 0.05 },
  { min: 700000, max: 1000000, rate: 0.1 },
  { min: 1000000, max: 1200000, rate: 0.15 },
  { min: 1200000, max: 1500000, rate: 0.2 },
  { min: 1500000, max: Infinity, rate: 0.3 },
];

export const REBATE_87A_BY_REGIME: Record<TaxRegime, { incomeLimit: number; maxRebate: number }> = {
  old: { incomeLimit: 500000, maxRebate: 12500 },
  new: { incomeLimit: 1200000, maxRebate: 60000 },
};

export const SECTION_REFERENCES: Record<string, SectionReference> = {
  "16": { oldAct: "Section 16", newAct: "Section 19", label: "Deductions from salaries" },
  "80C": { oldAct: "Section 80C", newAct: "Section 123", label: "Specified savings and payments" },
  "80CCD(2)": { oldAct: "Section 80CCD(2)", newAct: "Section 124", label: "Employer NPS contribution" },
  "80D": { oldAct: "Section 80D", newAct: "Section 126", label: "Health insurance premium" },
  "80E": { oldAct: "Section 80E", newAct: "Section 129", label: "Education loan interest" },
  "80G": { oldAct: "Section 80G", newAct: "Section 133", label: "Donations" },
  "80TTA": { oldAct: "Section 80TTA", newAct: "Section 153", label: "Savings interest" },
  "80U": { oldAct: "Section 80U", newAct: "Section 154", label: "Person with disability" },
  "87A": { oldAct: "Section 87A", newAct: "Section 156", label: "Income-tax rebate" },
  "111A": { oldAct: "Section 111A", newAct: "Section 196", label: "STCG on listed equity" },
  "112A": { oldAct: "Section 112A", newAct: "Section 198", label: "LTCG on listed equity" },
  "115BAC": { oldAct: "Section 115BAC", newAct: "Section 202", label: "Default new tax regime" },
  "139": { oldAct: "Section 139", newAct: "Section 263", label: "Return of income" },
  "140A": { oldAct: "Section 140A", newAct: "Section 266", label: "Self-assessment" },
  "154": { oldAct: "Section 154", newAct: "Section 287", label: "Rectification" },
  "192": { oldAct: "Section 192", newAct: "Section 392", label: "Salary TDS" },
  "194A": { oldAct: "Section 194A", newAct: "Section 393 table", label: "Interest TDS" },
  "194C": { oldAct: "Section 194C", newAct: "Section 393 table", label: "Contractor TDS" },
  "194J": { oldAct: "Section 194J", newAct: "Section 393 table", label: "Professional fee TDS" },
  "206AA": { oldAct: "Section 206AA", newAct: "Section 397(2)", label: "PAN requirement" },
  "234A": { oldAct: "Section 234A", newAct: "Section 423", label: "Interest for late return" },
  "234B": { oldAct: "Section 234B", newAct: "Section 424", label: "Advance tax interest" },
  "234C": { oldAct: "Section 234C", newAct: "Section 425", label: "Advance tax deferment interest" },
  "234F": { oldAct: "Section 234F", newAct: "Section 428", label: "Late return fee" },
  "44ADA": { oldAct: "Section 44ADA", newAct: "Section 58", label: "Presumptive profession income" },
  "10(13A)": { oldAct: "Section 10(13A)", newAct: "Schedule III, Table 11", label: "HRA exemption" },
  "10(5)": { oldAct: "Section 10(5)", newAct: "Schedule III, Table 8", label: "LTA exemption" },
  "24(b)": { oldAct: "Section 24(b)", newAct: "House property provisions", label: "Home loan interest" },
};

export const getAgeCategory = (age: number): AgeCategory => {
  if (age >= 80) return "superSenior";
  if (age >= 60) return "senior";
  return "regular";
};

export const getSlabsForRegime = (
  regime: TaxRegime,
  assessmentYear = DEFAULT_ASSESSMENT_YEAR,
  age = 30,
): TaxSlabs[] => {
  if (regime === "old") {
    return AY_2026_27_OLD_REGIME_SLABS[getAgeCategory(age)];
  }

  return assessmentYear === DEFAULT_ASSESSMENT_YEAR
    ? AY_2026_27_NEW_REGIME_SLABS
    : AY_2025_26_NEW_REGIME_SLABS;
};

export const getSectionReference = (section: string): SectionReference | undefined =>
  SECTION_REFERENCES[section];

export const formatCurrency = (amount: number): string =>
  `₹${Math.round(amount).toLocaleString("en-IN")}`;

export const formatSlabRange = (slab: TaxSlabs): string => {
  if (!Number.isFinite(slab.max)) return `Above ${formatCurrency(slab.min)}`;
  if (slab.min === 0) return `Up to ${formatCurrency(slab.max)}`;
  return `${formatCurrency(slab.min + 1)} to ${formatCurrency(slab.max)}`;
};
