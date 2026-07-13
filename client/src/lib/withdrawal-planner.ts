export type WithdrawalFrequency = "monthly" | "quarterly" | "yearly";

export interface WithdrawalPeriodEntry {
  period: number;
  year: number;
  beginningBalance: number;
  interestAccrued: number;
  withdrawal: number;
  endingBalance: number;
}

export interface WithdrawalPlanResult {
  principal: number;
  annualRate: number; // in %
  withdrawalAmount: number; // per period
  frequency: WithdrawalFrequency;
  years: number;
  periodsPerYear: number;
  periodicRate: number; // decimal
  totalPeriods: number;
  schedule: WithdrawalPeriodEntry[];
  totalInterestAccrued: number;
  totalWithdrawn: number;
  endingBalance: number;
  depleted: boolean;
  depletionPeriod?: number;
}

function requireNonNegative(name: string, value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new RangeError(`${name} must be a finite non-negative number`);
  return value;
}

function getPeriodsPerYear(freq: WithdrawalFrequency): number {
  switch (freq) {
    case "monthly":
      return 12;
    case "quarterly":
      return 4;
    case "yearly":
    default:
      throw new RangeError("Frequency must be monthly, quarterly, or yearly");
  }
}

/**
 * Calculates a fixed income withdrawal schedule with interest accrual.
 * Interest is applied each period and then the withdrawal is deducted.
 * If the balance would go negative, the final withdrawal is capped and the schedule ends.
 */
export function calculateWithdrawalPlan(
  principalInput: number,
  annualRateInput: number,
  withdrawalAmountInput: number,
  frequency: WithdrawalFrequency,
  yearsInput: number
): WithdrawalPlanResult {
  const principal = requireNonNegative("Principal", principalInput);
  const annualRate = requireNonNegative("Annual rate", annualRateInput);
  const withdrawalAmount = requireNonNegative("Withdrawal", withdrawalAmountInput);
  if (!Number.isInteger(yearsInput) || yearsInput <= 0) throw new RangeError("Years must be a positive whole number");
  const years = yearsInput;

  const periodsPerYear = getPeriodsPerYear(frequency);
  const totalPeriods = periodsPerYear * years;
  const periodicRate = annualRate / 100 / periodsPerYear; // decimal

  let balance = principal;
  let totalInterestAccrued = 0;
  let totalWithdrawn = 0;
  const schedule: WithdrawalPeriodEntry[] = [];

  let depleted = false;
  let depletionPeriod: number | undefined;

  for (let p = 1; p <= totalPeriods; p++) {
    const beginningBalance = balance;
    const interestAccrued = beginningBalance * periodicRate;
    let available = beginningBalance + interestAccrued;

    // Apply withdrawal, capped to what's available
    const withdrawal = Math.min(withdrawalAmount, available);
    const endingBalance = Math.max(0, available - withdrawal);

    schedule.push({
      period: p,
      year: Math.floor((p - 1) / periodsPerYear) + 1,
      beginningBalance,
      interestAccrued,
      withdrawal,
      endingBalance,
    });

    totalInterestAccrued += interestAccrued;
    totalWithdrawn += withdrawal;
    balance = endingBalance;

    if (balance <= 0 && withdrawalAmount > 0 && !depleted) {
      depleted = true;
      depletionPeriod = p;
      break;
    }
  }

  return {
    principal,
    annualRate,
    withdrawalAmount,
    frequency,
    years,
    periodsPerYear,
    periodicRate,
    totalPeriods: depleted ? (depletionPeriod as number) : totalPeriods,
    schedule,
    totalInterestAccrued,
    totalWithdrawn,
    endingBalance: balance,
    depleted,
    depletionPeriod,
  };
}
