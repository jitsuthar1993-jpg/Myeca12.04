import { describe, expect, it } from "vitest";
import {
  campaignAttributionSchema,
  mergeCampaignAttribution,
  normalizeReferralCode,
  normalizeReferralService,
  readCampaignAttributionFromParams,
} from "./campaign-attribution";

describe("campaign attribution", () => {
  it("reads and normalizes paid and partner attribution from query parameters", () => {
    const attribution = readCampaignAttributionFromParams(
      new URLSearchParams(
        "source=paid_search&utm_source=google&utm_medium=cpc&utm_campaign=itr-season-2026&utm_content=salary-ad&partner=CA-DELHI-01&plan=salary&ref=REF-MYECA-123456",
      ),
      "2026-06-10T06:00:00.000Z",
    );

    expect(attribution).toEqual({
      source: "paid_search",
      utmSource: "google",
      utmMedium: "cpc",
      utmCampaign: "itr-season-2026",
      utmContent: "salary-ad",
      partnerCode: "CA-DELHI-01",
      planId: "salary",
      referralCode: "REF-MYECA-123456",
      firstTouchAt: "2026-06-10T06:00:00.000Z",
    });
  });

  it("rejects unsafe or oversized attribution values", () => {
    expect(
      campaignAttributionSchema.safeParse({
        source: "<script>alert(1)</script>",
        partnerCode: "../../admin",
        firstTouchAt: "not-a-date",
      }).success,
    ).toBe(false);
  });

  it("keeps first-touch fields while adding later missing fields", () => {
    expect(
      mergeCampaignAttribution(
        {
          source: "paid_search",
          utmCampaign: "itr-season-2026",
          firstTouchAt: "2026-06-10T06:00:00.000Z",
        },
        {
          source: "remarketing",
          partnerCode: "CA-MUMBAI-02",
          firstTouchAt: "2026-06-12T06:00:00.000Z",
        },
      ),
    ).toEqual({
      source: "paid_search",
      utmCampaign: "itr-season-2026",
      partnerCode: "CA-MUMBAI-02",
      firstTouchAt: "2026-06-10T06:00:00.000Z",
    });
  });

  it("normalizes referral signup metadata without accepting arbitrary values", () => {
    expect(normalizeReferralCode(" REF-MYECA-123456 ")).toBe("REF-MYECA-123456");
    expect(normalizeReferralService("itr_filing")).toBe("itr_filing");
    expect(normalizeReferralCode("../../admin")).toBeUndefined();
    expect(normalizeReferralService("free_cashback")).toBeUndefined();
  });
});
