import { z } from "zod";

const attributionValue = z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/);
const partnerCode = z.string().trim().min(1).max(80).regex(/^[A-Z0-9][A-Z0-9_-]*$/i);
const referralCode = z.string().trim().min(1).max(120).regex(/^[A-Z0-9][A-Z0-9_-]*$/i);
const referralService = z.enum(["itr_filing", "gst_registration", "company_registration", "all_services"]);

export const campaignAttributionSchema = z.object({
  source: attributionValue.optional(),
  utmSource: attributionValue.optional(),
  utmMedium: attributionValue.optional(),
  utmCampaign: attributionValue.optional(),
  utmContent: attributionValue.optional(),
  partnerCode: partnerCode.optional(),
  planId: attributionValue.optional(),
  referralCode: referralCode.optional(),
  firstTouchAt: z.string().datetime({ offset: true }),
}).strict();

export type CampaignAttribution = z.infer<typeof campaignAttributionSchema>;

const PARAMETER_MAP = {
  source: "source",
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  partner: "partnerCode",
  plan: "planId",
  ref: "referralCode",
} as const;

export function normalizeCampaignAttribution(input: unknown): CampaignAttribution | undefined {
  const parsed = campaignAttributionSchema.safeParse(input);
  return parsed.success ? parsed.data : undefined;
}

export function normalizeReferralCode(input: unknown): string | undefined {
  const parsed = referralCode.safeParse(input);
  return parsed.success ? parsed.data : undefined;
}

export function normalizeReferralService(input: unknown): string | undefined {
  const parsed = referralService.safeParse(input);
  return parsed.success ? parsed.data : undefined;
}

export function readCampaignAttributionFromParams(
  params: URLSearchParams,
  firstTouchAt = new Date().toISOString(),
): CampaignAttribution | undefined {
  const values: Record<string, string> = { firstTouchAt };

  for (const [parameter, field] of Object.entries(PARAMETER_MAP)) {
    const value = params.get(parameter)?.trim();
    if (value) values[field] = value;
  }

  if (Object.keys(values).length === 1) return undefined;
  if (!values.source && values.partnerCode) values.source = "partner";
  return normalizeCampaignAttribution(values);
}

export function mergeCampaignAttribution(
  firstTouch: CampaignAttribution | undefined,
  laterTouch: CampaignAttribution | undefined,
): CampaignAttribution | undefined {
  if (!firstTouch) return laterTouch;
  if (!laterTouch) return firstTouch;

  return normalizeCampaignAttribution({
    ...laterTouch,
    ...firstTouch,
    partnerCode: firstTouch.partnerCode || laterTouch.partnerCode,
    planId: firstTouch.planId || laterTouch.planId,
    referralCode: firstTouch.referralCode || laterTouch.referralCode,
  });
}
