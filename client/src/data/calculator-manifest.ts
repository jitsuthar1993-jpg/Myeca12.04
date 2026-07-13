export type CalculatorCategory = "tax" | "business" | "salary" | "investment" | "loan" | "utility";

export type CalculatorManifestEntry = {
  slug: string;
  title: string;
  category: CalculatorCategory;
  canonicalPath: `/calculators/${string}`;
  aliases: readonly `/calculators/${string}`[];
  source: `client/src/${string}`;
  engine: string;
  ruleVersion: string;
  sourceNotes: readonly [string, ...string[]];
  officialSources: readonly OfficialCalculatorSource[];
};

export type OfficialCalculatorSource = {
  title: string;
  url: `https://${string}`;
  checkedOn: `${number}-${number}-${number}`;
};

const TAX_YEAR = "AY 2026-27 / FY 2025-26";
const USER_ASSUMPTIONS = "User-entered assumptions; review the calculator caveats before acting";
const TAX_SOURCE = "Income Tax Department rules and enacted Finance Act provisions for the stated year";
const GST_SOURCE = "CBIC/GST Council rules; rates and classifications require transaction-specific verification";
const CHECKED_ON = "2026-07-11" as const;
const INCOME_TAX_SOURCE: OfficialCalculatorSource = {
  title: "Income Tax Department: AY 2026-27 tax rates and return guidance",
  url: "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable",
  checkedOn: CHECKED_ON,
};
const GST_RATE_SOURCE: OfficialCalculatorSource = {
  title: "CBIC: GST goods and services rates",
  url: "https://cbic-gst.gov.in/gst-goods-services-rates.html",
  checkedOn: CHECKED_ON,
};
const EPF_SOURCE: OfficialCalculatorSource = {
  title: "EPFO: present rates of contribution",
  url: "https://www.epfindia.gov.in/site_docs/PDFs/MiscPDFs/ContributionRate.pdf",
  checkedOn: CHECKED_ON,
};
const GRATUITY_SOURCE: OfficialCalculatorSource = {
  title: "Ministry of Labour and Employment: Payment of Gratuity Act, 1972",
  url: "https://www.labour.gov.in/static/uploads/2025/06/072a4b7ea8246533c62b96b68a30da53.pdf",
  checkedOn: "2026-07-13",
};
const PPF_SOURCE: OfficialCalculatorSource = {
  title: "Department of Economic Affairs: small-savings interest-rate notifications",
  url: "https://dea.gov.in/budget-division/475",
  checkedOn: "2026-07-13",
};
const NPS_SOURCE: OfficialCalculatorSource = {
  title: "PFRDA: NPS exit regulations amended 16 December 2025",
  url: "https://www.pfrda.org.in/w/regulatory-framework/regulations/pension-fund-regulatory-and-development-authority-exits-and-withdrawals-under-the-national-pension-system-regulations-2015-last-amended-on-16-december-2025-",
  checkedOn: "2026-07-13",
};
const TAX_YEAR_2026_SOURCE: OfficialCalculatorSource = {
  title: "Income Tax Department: Tax Year 2026-27 and Income-tax Act, 2025 transition",
  url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/objective-and-scope-new-act",
  checkedOn: "2026-07-13",
};
const ADVANCE_TAX_THRESHOLD_SOURCE: OfficialCalculatorSource = {
  title: "Income Tax Department: section 208 advance-tax threshold",
  url: "https://www.incometaxindia.gov.in/w/section-208-62",
  checkedOn: "2026-07-13",
};
const ADVANCE_TAX_SCHEDULE_SOURCE: OfficialCalculatorSource = {
  title: "Income Tax Department: section 211 instalments and due dates",
  url: "https://www.incometaxindia.gov.in/w/section-211-64",
  checkedOn: "2026-07-13",
};

export const CALCULATOR_MANIFEST = [
  calculator("income-tax", "Income Tax Calculator", "tax", "income-tax.page.tsx", "income-tax-engine", TAX_YEAR, [TAX_SOURCE]),
  calculator("tax-regime", "Tax Regime Calculator", "tax", "tax-regime.page.tsx", "income-tax-engine", TAX_YEAR, [TAX_SOURCE], ["regime-comparator"]),
  calculator("hra", "HRA Calculator", "tax", "hra.page.tsx", "hra page calculation", TAX_YEAR, [TAX_SOURCE]),
  calculator("tds", "TDS Calculator", "tax", "tds.page.tsx", "tds page calculation", TAX_YEAR, [TAX_SOURCE]),
  calculator("capital-gains", "Capital Gains Calculator", "tax", "capital-gains.page.tsx", "capital gains page calculation", TAX_YEAR, [TAX_SOURCE]),
  calculator("advance-tax", "Advance Tax Calculator", "tax", "advance-tax.page.tsx", "tax-calculations", TAX_YEAR, ["Tax Year 2026-27 is not enabled pending a separate verified ruleset"]),
  calculator("gst", "GST Calculator", "business", "gst.page.tsx", "high-demand-calculators", "Current selectable GST rates", [GST_SOURCE]),
  calculator("hsn-finder", "HSN / SAC Reference", "business", "hsn-finder.page.tsx", "Limited reference shortlist", "Noindexed pending notification-backed dataset", [GST_SOURCE]),
  calculator("salary", "Salary Calculator", "salary", "salary.page.tsx", "high-demand-calculators", TAX_YEAR, [TAX_SOURCE, "Employer payroll policies vary"]),
  calculator("gratuity", "Gratuity Calculator", "salary", "gratuity.page.tsx", "high-demand-calculators", "Payment of Gratuity Act 15/26 model", ["Payment of Gratuity Act formula; eligibility exceptions require review"]),
  calculator("epf", "EPF Calculator", "salary", "epf.page.tsx", "high-demand-calculators", "User-selectable EPF rate", ["EPFO contribution and EPS rules; notified interest rates may change"]),
  calculator("sip", "SIP Calculator", "investment", "sip.page.tsx", "SIP page projection", USER_ASSUMPTIONS, ["Constant-return projection; not an investment guarantee"], ["sip-enhanced"]),
  calculator("fd", "FD Calculator", "investment", "fd.page.tsx", "FD page projection", USER_ASSUMPTIONS, ["Bank product terms, compounding and tax treatment vary"], ["fd-enhanced"]),
  calculator("ppf", "PPF Calculator", "investment", "ppf.page.tsx", "PPF page projection", "7.1% planning assumption", ["Government-notified PPF rates and scheme rules may change"]),
  calculator("withdrawal-planner", "Withdrawal Planner", "investment", "withdrawal-planner.page.tsx", "withdrawal planner projection", USER_ASSUMPTIONS, ["Constant-return projection; sequence-of-returns risk is excluded"]),
  calculator("nps", "NPS Calculator", "investment", "nps.page.tsx", "NPS page projection", "PFRDA exit rules amended 16 December 2025", ["Market returns, annuity pricing, tax treatment and exit eligibility vary"]),
  calculator("rd", "RD Calculator", "investment", "rd.page.tsx", "high-demand-calculators", USER_ASSUMPTIONS, ["Bank compounding and rounding conventions may vary"]),
  calculator("lumpsum", "Lumpsum Calculator", "investment", "lumpsum.page.tsx", "high-demand-calculators", USER_ASSUMPTIONS, ["Constant-return projection; not an investment guarantee"]),
  calculator("swp", "SWP Calculator", "investment", "swp.page.tsx", "high-demand-calculators", USER_ASSUMPTIONS, ["Constant-return projection; sequence-of-returns risk is excluded"]),
  calculator("inflation", "Inflation Calculator", "investment", "inflation.page.tsx", "high-demand-calculators", USER_ASSUMPTIONS, ["Actual category inflation can differ from the selected rate"]),
  calculator("emi", "EMI Calculator", "loan", "emi.page.tsx", "EMI page calculation", USER_ASSUMPTIONS, ["Lender rates, fees and rounding conventions vary"]),
  calculator("home-loan", "Loan Calculator", "loan", "loan-calculator.page.tsx", "unified loan page calculation", USER_ASSUMPTIONS, ["Lender terms, fees and eligibility policies vary"], ["car-loan", "personal-loan", "education-loan"]),
  calculator("loan-eligibility", "Loan Eligibility Calculator", "loan", "loan-eligibility.page.tsx", "high-demand-calculators", USER_ASSUMPTIONS, ["FOIR and underwriting policies vary by lender"]),
  calculator("penalty", "Late Charge Reference", "tax", "penalty-calculator.page.tsx", "official-source directory", "Noindexed pending source-verified datasets", ["Calculation unavailable until effective-dated rules are verified"]),
  calculator("general", "General Calculator", "utility", "general.page.tsx", "general arithmetic engine", "Standard arithmetic", ["Browser arithmetic with display rounding"]),
] as const satisfies readonly CalculatorManifestEntry[];

function calculator(
  slug: string,
  title: string,
  category: CalculatorCategory,
  page: string,
  engine: string,
  ruleVersion: string,
  sourceNotes: readonly [string, ...string[]],
  aliases: readonly string[] = [],
): CalculatorManifestEntry {
  return {
    slug,
    title,
    category,
    canonicalPath: `/calculators/${slug}`,
    aliases: aliases.map((alias) => `/calculators/${alias}` as `/calculators/${string}`),
    source: `client/src/features/calculators/pages/${page}`,
    engine,
    ruleVersion,
    sourceNotes,
    officialSources: getOfficialSources(category, slug),
  };
}

function getOfficialSources(category: CalculatorCategory, slug: string): readonly OfficialCalculatorSource[] {
  if (slug === "gratuity") return [GRATUITY_SOURCE, INCOME_TAX_SOURCE];
  if (slug === "ppf") return [PPF_SOURCE];
  if (slug === "nps") return [NPS_SOURCE];
  if (slug === "advance-tax") return [ADVANCE_TAX_THRESHOLD_SOURCE, ADVANCE_TAX_SCHEDULE_SOURCE];
  if (slug === "hsn-finder") return manifestSourcesFromDataset(HSN_REFERENCE_DATASET);
  if (slug === "penalty") return manifestSourcesFromDataset(PENALTY_RULE_DATASET);
  if (category === "tax" || slug === "salary") return [INCOME_TAX_SOURCE];
  if (category === "business") return [GST_RATE_SOURCE];
  if (slug === "epf") return [EPF_SOURCE];
  return [];
}

function manifestSourcesFromDataset(dataset: {
  checkedOn: `${number}-${number}-${number}`;
  officialSources: readonly { title: string; url: `https://${string}` }[];
}): readonly OfficialCalculatorSource[] {
  return dataset.officialSources.map((source) => ({ ...source, checkedOn: dataset.checkedOn }));
}

const CALCULATOR_ROUTE_SOURCE_OVERRIDES: Readonly<Record<string, `client/src/${string}`>> = {
  "/calculators/sip-enhanced": "client/src/features/calculators/pages/sip-enhanced.page.tsx",
  "/calculators/fd-enhanced": "client/src/features/calculators/pages/fd-enhanced.page.tsx",
};

export function getCalculatorRouteEntries() {
  return CALCULATOR_MANIFEST.flatMap((calculatorEntry) => [
    { path: calculatorEntry.canonicalPath, source: calculatorEntry.source },
    ...calculatorEntry.aliases.map((path) => ({
      path,
      source: CALCULATOR_ROUTE_SOURCE_OVERRIDES[path] ?? calculatorEntry.source,
    })),
  ]);
}

export function getCalculatorByPath(path: string) {
  return CALCULATOR_MANIFEST.find(
    (calculatorEntry) => calculatorEntry.canonicalPath === path || calculatorEntry.aliases.includes(path as `/calculators/${string}`),
  );
}

export function getCanonicalCalculatorPath(path: string) {
  return getCalculatorByPath(path)?.canonicalPath;
}
import { HSN_REFERENCE_DATASET, PENALTY_RULE_DATASET } from "./calculator-rule-datasets";
