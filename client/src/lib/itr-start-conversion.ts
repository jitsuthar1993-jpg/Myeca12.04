import { ITR_START_ROUTE } from "@shared/itr-start-route";

export { ITR_START_ROUTE } from "@shared/itr-start-route";

export const ITR_COMPLEX_PROFILE_IDS = [
  "capital-gains",
  "business-freelance",
  "nri-foreign",
  "notice",
] as const;

export type ItrIncomeProfile =
  | "salary"
  | "multiple-form16"
  | (typeof ITR_COMPLEX_PROFILE_IDS)[number];

export type ItrAssistanceLevel = "guided" | "ca-assisted" | "not-sure";

export type ItrRecommendedPlanId = "salary" | "expert-assisted" | "complex-scope";

export interface ItrStartAnswers {
  assessmentYear: string;
  incomeProfiles: ItrIncomeProfile[];
  assistanceLevel: ItrAssistanceLevel;
}

export interface ItrStartRecommendation {
  planId: ItrRecommendedPlanId;
  title: string;
  priceLabel: string;
  ctaLabel: string;
  serviceId: "itr-filing";
  serviceTitle: string;
  serviceCategory: "Individual Tax Services";
  paymentAmount: number | null;
  nextStep: "payment-link" | "scope-review";
  explanation: string;
}

export type ItrServiceMetadata = {
  requestDescription: string;
  source: "itr_start_funnel";
  requestedAt: string;
  originalServicePath: typeof ITR_START_ROUTE;
  conversionSource: string;
  recommendedPlanId: ItrRecommendedPlanId;
  assessmentYear: string;
  incomeProfile: ItrIncomeProfile[];
  assistanceLevel: ItrAssistanceLevel;
  ctaVariant: string;
};

const COMPLEX_PROFILE_SET = new Set<ItrIncomeProfile>(ITR_COMPLEX_PROFILE_IDS);

function hasComplexProfile(incomeProfiles: ItrIncomeProfile[]) {
  return incomeProfiles.some((profile) => COMPLEX_PROFILE_SET.has(profile));
}

export function getItrStartRecommendation(answers: ItrStartAnswers): ItrStartRecommendation {
  if (hasComplexProfile(answers.incomeProfiles)) {
    return {
      planId: "complex-scope",
      title: "Scope-first ITR review",
      priceLabel: "Scoped first",
      ctaLabel: "Get Scope Review",
      serviceId: "itr-filing",
      serviceTitle: "Complex ITR Scope Review",
      serviceCategory: "Individual Tax Services",
      paymentAmount: null,
      nextStep: "scope-review",
      explanation:
        "Your profile may need capital gains, business, NRI, foreign asset, or notice review before a fixed quote.",
    };
  }

  if (answers.assistanceLevel === "guided" && answers.incomeProfiles.length === 1) {
    return {
      planId: "salary",
      title: "Salary ITR Filing",
      priceLabel: "Rs 499",
      ctaLabel: "Start Salary ITR - Rs 499",
      serviceId: "itr-filing",
      serviceTitle: "Salary ITR Filing",
      serviceCategory: "Individual Tax Services",
      paymentAmount: 499,
      nextStep: "payment-link",
      explanation:
        "A simple salary return can move straight into a trackable case and payment-link request.",
    };
  }

  return {
    planId: "expert-assisted",
    title: "CA-Assisted ITR Filing",
    priceLabel: "Rs 999",
    ctaLabel: "Start CA-Assisted ITR - Rs 999",
    serviceId: "itr-filing",
    serviceTitle: "CA-Assisted ITR Filing",
    serviceCategory: "Individual Tax Services",
    paymentAmount: 999,
    nextStep: "payment-link",
    explanation:
      "You get CA review for multiple Form 16 cases, refund checks, HRA/rent support, or extra filing confidence.",
  };
}

export function buildItrServiceMetadata(
  answers: ItrStartAnswers,
  recommendation: ItrStartRecommendation,
  conversionSource: string,
  ctaVariant: string
): ItrServiceMetadata {
  return {
    requestDescription: `ITR start diagnosis recommended ${recommendation.title} for AY ${answers.assessmentYear}.`,
    source: "itr_start_funnel",
    requestedAt: new Date().toISOString(),
    originalServicePath: ITR_START_ROUTE,
    conversionSource,
    recommendedPlanId: recommendation.planId,
    assessmentYear: answers.assessmentYear,
    incomeProfile: answers.incomeProfiles,
    assistanceLevel: answers.assistanceLevel,
    ctaVariant,
  };
}
