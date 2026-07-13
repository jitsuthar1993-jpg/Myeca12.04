export type OfficialRuleSource = {
  title: string;
  url: `https://${string}`;
};

type DatasetBase = {
  checkedOn: `${number}-${number}-${number}`;
  officialSources: readonly [OfficialRuleSource, ...OfficialRuleSource[]];
};

export type TaxPeriodIdentity =
  | { readonly kind: "financial-assessment-year"; readonly financialYear: string; readonly assessmentYear: string }
  | { readonly kind: "tax-year"; readonly taxYear: string };

export type AdvanceTaxInstallmentRule = {
  readonly quarter: string;
  readonly dueDate: string;
  readonly cumulativePercent: number;
  readonly label: string;
};

export type VerifiedAdvanceTaxRuleset = {
  readonly status: "verified";
  readonly period: TaxPeriodIdentity;
  readonly governingAct: string;
  readonly advanceTax: {
    readonly threshold: number;
    readonly installments: readonly [
      AdvanceTaxInstallmentRule,
      AdvanceTaxInstallmentRule,
      AdvanceTaxInstallmentRule,
      AdvanceTaxInstallmentRule,
    ];
  };
  readonly checkedOn: `${number}-${number}-${number}`;
  readonly officialSources: readonly [OfficialRuleSource, ...OfficialRuleSource[]];
};

type VerifiedAdvanceTaxRulesetInput = Omit<VerifiedAdvanceTaxRuleset, "status">;

const OFFICIAL_RULE_HOSTS = new Set([
  "cbic-gst.gov.in",
  "www.incometax.gov.in",
  "www.incometaxindia.gov.in",
  "www.mca.gov.in",
  "www.rbi.org.in",
]);
const verifiedAdvanceTaxRulesets = new WeakSet<object>();

function isValidIsoDate(value: string): value is `${number}-${number}-${number}` {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidTaxPeriod(period: TaxPeriodIdentity): boolean {
  const yearPattern = /^\d{4}-\d{2}$/;
  return period.kind === "tax-year"
    ? yearPattern.test(period.taxYear)
    : yearPattern.test(period.financialYear) && yearPattern.test(period.assessmentYear);
}

export function createVerifiedAdvanceTaxRuleset(input: VerifiedAdvanceTaxRulesetInput): VerifiedAdvanceTaxRuleset {
  if (!isValidIsoDate(input.checkedOn) || !input.governingAct.trim() || !isValidTaxPeriod(input.period)) {
    throw new TypeError("Verified advance-tax rules require valid metadata and a real checked date.");
  }
  if (input.officialSources.length === 0 || input.officialSources.some((source) => {
    if (!source.title.trim()) return true;
    try {
      const url = new URL(source.url);
      return url.protocol !== "https:" || !OFFICIAL_RULE_HOSTS.has(url.hostname);
    } catch {
      return true;
    }
  })) {
    throw new TypeError("Verified advance-tax rules require official HTTPS sources.");
  }
  if (!Number.isFinite(input.advanceTax.threshold) || input.advanceTax.threshold < 0) {
    throw new TypeError("The advance-tax threshold must be finite and non-negative.");
  }
  if (input.advanceTax.installments.length !== 4) {
    throw new TypeError("Verified advance-tax rules require exactly four installments.");
  }

  let previousPercent = 0;
  for (const installment of input.advanceTax.installments) {
    const percent = installment.cumulativePercent;
    if (!installment.quarter.trim() || !installment.label.trim() || !installment.dueDate.trim()
      || !Number.isFinite(percent) || percent <= previousPercent || percent <= 0 || percent > 100) {
      throw new TypeError("Advance-tax installments must contain ordered, complete rule metadata.");
    }
    previousPercent = percent;
  }
  if (previousPercent !== 100) {
    throw new TypeError("The final cumulative advance-tax percentage must be 100.");
  }

  const ruleset: VerifiedAdvanceTaxRuleset = Object.freeze({
    status: "verified",
    period: Object.freeze({ ...input.period }),
    governingAct: input.governingAct,
    advanceTax: Object.freeze({
      threshold: input.advanceTax.threshold,
      installments: Object.freeze(input.advanceTax.installments.map((rule) => Object.freeze({ ...rule }))) as unknown as VerifiedAdvanceTaxRuleset["advanceTax"]["installments"],
    }),
    checkedOn: input.checkedOn,
    officialSources: Object.freeze(input.officialSources.map((source) => Object.freeze({ ...source }))) as unknown as VerifiedAdvanceTaxRuleset["officialSources"],
  });
  verifiedAdvanceTaxRulesets.add(ruleset);
  return ruleset;
}

export function isVerifiedAdvanceTaxRuleset(value: unknown): value is VerifiedAdvanceTaxRuleset {
  return typeof value === "object" && value !== null && verifiedAdvanceTaxRulesets.has(value);
}

export const HSN_REFERENCE_DATASET = {
  status: "reference-only",
  checkedOn: "2026-07-13",
  effectiveFrom: "2021-04-01",
  entries: [
    { kind: "hsn", code: "1001", digits: 4, description: "Wheat and meslin" },
    { kind: "hsn", code: "6109", digits: 4, description: "T-shirts, singlets and other vests" },
    { kind: "hsn", code: "8471", digits: 4, description: "Automatic data-processing machines and units" },
    { kind: "hsn", code: "8517", digits: 4, description: "Telephone sets and communication apparatus" },
    { kind: "hsn", code: "3304", digits: 4, description: "Beauty, make-up and skin-care preparations" },
    { kind: "sac", code: "9983", digits: 4, description: "Other professional, technical and business services" },
    { kind: "sac", code: "9984", digits: 4, description: "Telecommunications, broadcasting and information supply services" },
    { kind: "sac", code: "9963", digits: 4, description: "Accommodation, food and beverage services" },
    { kind: "sac", code: "9965", digits: 4, description: "Goods transport services" },
  ] as const,
  officialSources: [
    { title: "CBIC Notification 78/2020 - HSN digits on tax invoices", url: "https://cbic-gst.gov.in/pdf/central-tax/notfctn-78-central-tax-english-2020.pdf" },
    { title: "CBIC GST goods and services rates", url: "https://cbic-gst.gov.in/gst-goods-services-rates.html" },
  ],
} as const satisfies DatasetBase & Record<string, unknown>;

export const PENALTY_RULE_DATASET = {
  status: "unavailable",
  checkedOn: "2026-07-13",
  rules: [] as const,
  officialSources: [
    { title: "CBIC Central Tax notifications", url: "https://cbic-gst.gov.in/central-tax-notifications.html" },
    { title: "CBDT Acts, Rules, Circulars and Notifications", url: "https://www.incometaxindia.gov.in/" },
    { title: "MCA Acts and Rules", url: "https://www.mca.gov.in/content/mca/global/en/acts-rules.html" },
    { title: "RBI FEMA notifications", url: "https://www.rbi.org.in/Scripts/Fema.aspx" },
  ],
} as const satisfies DatasetBase & Record<string, unknown>;

export const TAX_PERIOD_DATASETS = {
  legacyAy2026_27: createVerifiedAdvanceTaxRuleset({
    period: {
      kind: "financial-assessment-year",
      financialYear: "2025-26",
      assessmentYear: "2026-27",
    },
    governingAct: "Income-tax Act, 1961",
    advanceTax: {
      threshold: 10_000,
      installments: [
        { quarter: "Q1", dueDate: "June 15, 2025", cumulativePercent: 15, label: "First Installment" },
        { quarter: "Q2", dueDate: "September 15, 2025", cumulativePercent: 45, label: "Second Installment" },
        { quarter: "Q3", dueDate: "December 15, 2025", cumulativePercent: 75, label: "Third Installment" },
        { quarter: "Q4", dueDate: "March 15, 2026", cumulativePercent: 100, label: "Fourth Installment" },
      ],
    },
    checkedOn: "2026-07-13",
    officialSources: [
      { title: "Income Tax Department section 208 advance-tax threshold (Finance Act 2024)", url: "https://www.incometaxindia.gov.in/w/section-208-62" },
      { title: "Income Tax Department section 211 instalments and due dates (Finance Act 2025)", url: "https://www.incometaxindia.gov.in/w/section-211-64" },
    ],
  }),
  taxYear2026_27: {
    status: "partial",
    period: { kind: "tax-year", taxYear: "2026-27" },
    incomePeriod: { from: "2026-04-01", to: "2027-03-31" },
    governingAct: "Income-tax Act, 2025",
    unsupported: ["complete deduction eligibility", "special-rate income", "surcharge and marginal relief", "advance-tax interest"],
    checkedOn: "2026-07-13",
    officialSources: [
      { title: "Income Tax Department - objective and scope of the new Act", url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/objective-and-scope-new-act" },
      { title: "Income Tax Department - Tax Year 2026-27 payment guidance", url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/general-questions-0" },
    ],
  },
} as const;
