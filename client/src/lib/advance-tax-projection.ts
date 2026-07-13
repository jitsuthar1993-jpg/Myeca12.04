import {
  isVerifiedAdvanceTaxRuleset,
  type AdvanceTaxInstallmentRule,
  type TaxPeriodIdentity,
} from "@/data/calculator-rule-datasets";

type ProjectionAmounts = {
  totalTax: number;
  tdsAndTcs: number;
  paidInstallments: readonly [number, number, number, number];
  selfAssessmentPaid: number;
};

type ProjectionInput = ProjectionAmounts & {
  readonly dataset: unknown;
  readonly period: TaxPeriodIdentity;
};

type UnavailableProjection = {
  status: "unavailable";
  reason: string;
};

type AvailableProjection = {
  status: "available";
  totalTax: number;
  netTaxLiability: number;
  meetsAdvanceTaxThreshold: boolean;
  installments: ReadonlyArray<AdvanceTaxInstallmentRule & {
    cumulativeAmount: number;
    paidTillQuarter: number;
    shortfall: number;
  }>;
  totalAdvanceTaxPaid: number;
  balanceTax: number;
};

export type AdvanceTaxProjection = AvailableProjection | UnavailableProjection;

const INVALID_AMOUNTS_REASON = "Projection inputs must be finite, non-negative amounts.";

function periodsMatch(selected: TaxPeriodIdentity, dataset: TaxPeriodIdentity): boolean {
  if (selected.kind !== dataset.kind) return false;

  if (selected.kind === "tax-year" && dataset.kind === "tax-year") {
    return selected.taxYear === dataset.taxYear;
  }

  return selected.kind === "financial-assessment-year"
    && dataset.kind === "financial-assessment-year"
    && selected.financialYear === dataset.financialYear
    && selected.assessmentYear === dataset.assessmentYear;
}

export function projectAdvanceTax(input: ProjectionInput): AdvanceTaxProjection {
  if (!isVerifiedAdvanceTaxRuleset(input.dataset)) {
    return {
      status: "unavailable",
      reason: "The selected tax-period dataset is not verified for advance-tax calculation.",
    };
  }

  if (!periodsMatch(input.period, input.dataset.period)) {
    return { status: "unavailable", reason: "The selected period does not match the verified advance-tax dataset." };
  }

  const amounts = [input.totalTax, input.tdsAndTcs, input.selfAssessmentPaid, ...input.paidInstallments];
  if (amounts.some((amount) => !Number.isFinite(amount) || amount < 0)) {
    return { status: "unavailable", reason: INVALID_AMOUNTS_REASON };
  }

  const netTaxLiability = Math.max(0, input.totalTax - input.tdsAndTcs);
  const meetsAdvanceTaxThreshold = netTaxLiability >= input.dataset.advanceTax.threshold;
  const totalAdvanceTaxPaid = input.paidInstallments.reduce((sum, amount) => sum + amount, 0);
  const installments = input.dataset.advanceTax.installments.map((installment, index) => {
    const paidTillQuarter = input.paidInstallments.slice(0, index + 1).reduce((sum, amount) => sum + amount, 0);
    const cumulativeAmount = meetsAdvanceTaxThreshold
      ? (netTaxLiability * installment.cumulativePercent) / 100
      : 0;

    return {
      ...installment,
      cumulativeAmount,
      paidTillQuarter,
      shortfall: Math.max(0, cumulativeAmount - paidTillQuarter),
    };
  });

  return {
    status: "available",
    totalTax: input.totalTax,
    netTaxLiability,
    meetsAdvanceTaxThreshold,
    installments,
    totalAdvanceTaxPaid,
    balanceTax: Math.max(0, netTaxLiability - totalAdvanceTaxPaid - input.selfAssessmentPaid),
  };
}
