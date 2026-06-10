export const REFERRAL_ACCOUNT_CREDIT_RATE = 0.1;

export function calculateReferralAccountCredit({
  netCollectedRevenue,
  serviceCompleted,
  hasStackedDiscount = false,
}: {
  netCollectedRevenue: number;
  serviceCompleted: boolean;
  hasStackedDiscount?: boolean;
}) {
  if (!serviceCompleted || hasStackedDiscount || !Number.isFinite(netCollectedRevenue) || netCollectedRevenue <= 0) {
    return 0;
  }

  return Math.floor(netCollectedRevenue * REFERRAL_ACCOUNT_CREDIT_RATE);
}
