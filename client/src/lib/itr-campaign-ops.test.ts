import { describe, expect, it } from "vitest";
import { validateCampaignOps } from "../../../scripts/itr-campaign-ops";

const validCalendarCsv = `"week","day","content_type","working_title","intent_cluster","primary_url","tool_link","conversion_link","supporting_internal_link","source_guardrail","status"
"Week 1","Day 1","short Q&A","Sample ITR topic","ITR filing start","/blog/sample","/form16-parser","/itr/form-selector","/learn/guide/complete-itr-guide-salaried","Check official sources and avoid refund guarantees","ready_to_draft"`;

const validProspectsCsv = `"segment","quota","best_asset_to_pitch","primary_pitch_angle","sample_utm_url","qualification_notes","reject_if"
"Finance bloggers","900","AIS checklist","Practical mismatch checklist","https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026&utm_medium=outreach&utm_content=ais-form-26as-mismatch-checklist","Relevant tax audience","Paid dofollow demand"`;

const validOutreachCsv = `"segment","prospect_name","site_or_org","url","contact_name","contact_email","social_url","asset_to_pitch","utm_url","status","last_contacted","next_follow_up","notes"`;

describe("ITR campaign ops validation", () => {
  it("accepts rows with internal links, approved UTMs, a 900-prospect quota, and tracker columns", () => {
    expect(
      validateCampaignOps({
        calendarCsv: validCalendarCsv,
        prospectsCsv: validProspectsCsv,
        outreachCsv: validOutreachCsv,
      }),
    ).toEqual([]);
  });

  it("rejects broken campaign ops data before outreach starts", () => {
    const errors = validateCampaignOps({
      calendarCsv: validCalendarCsv.replace("/form16-parser", "https://example.com/form16-parser"),
      outreachCsv: validOutreachCsv.replace('"status"', '"stage"'),
      prospectsCsv: validProspectsCsv
        .replace('"900"', '"899"')
        .replace("utm_medium=outreach", "utm_medium=paid"),
    });

    expect(errors).toEqual(
      expect.arrayContaining([
        "content calendar row 1 tool_link must be an internal route",
        "outreach tracker is missing required column status",
        "prospect quotas must sum to 900, got 899",
        "prospect row 1 sample_utm_url has unsupported utm_medium paid",
      ]),
    );
  });
});
