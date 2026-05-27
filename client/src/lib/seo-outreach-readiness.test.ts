import { describe, expect, it } from "vitest";
import {
  evaluateSeoOutreachReadiness,
  formatSeoOutreachReadinessIssues,
  OUTREACH_REQUIRED_CHANNELS,
} from "@shared/seo-outreach-readiness";

const headers = "date,channel,segment,prospect_name,site_or_org,url,contact_name,contact_email,social_url,asset_to_pitch,target_url,utm_url,anchor_text,rel_attribute,status,owner,last_contacted,next_follow_up,notes";

const qualifiedRows = [
  "2026-05-27,CA blogs,Tax professional article submission,CAclubindia articles,CAclubindia,https://www.caclubindia.com/articles,Editorial team,article@caclubindia.com,TBD,AIS Form 26AS mismatch checklist,https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist,https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026&utm_medium=outreach&utm_content=caclubindia-ais-checklist,MyeCA AIS checklist,editorial,prospect,TBD,TBD,TBD,Visible article submission email on articles page",
  "2026-05-27,StartupIndia listings,Founder directory submission,SuperLaunch,SuperLaunch,https://superlaunch.in/,TBD,TBD,TBD,Startup business planning resource,https://myeca.in/startup/planning,https://myeca.in/startup/planning?utm_campaign=itr-season-2026&utm_medium=partner&utm_content=superlaunch-startup-planning,Startup planning checklist,unknown,prospect,TBD,TBD,TBD,Directory has visible submit startup flow",
  "2026-05-27,Medium articles,Owner controlled explainers,MyeCA owner Medium post,Medium,https://medium.com/,MyeCA owner,TBD,TBD,ITR season hub summary,https://myeca.in/itr-season-2026,https://myeca.in/itr-season-2026?utm_campaign=itr-season-2026&utm_medium=outreach&utm_content=medium-itr-season-summary,MyeCA ITR season hub,nofollow,planned,MyeCA owner,TBD,TBD,Owner-controlled educational summary",
  "2026-05-27,LinkedIn,Finance creators and newsletters,MyeCA owner LinkedIn post,LinkedIn,https://www.linkedin.com/,MyeCA owner,TBD,TBD,Form 16 parser workflow,https://myeca.in/form16-parser,https://myeca.in/form16-parser?utm_campaign=itr-season-2026&utm_medium=newsletter&utm_content=linkedin-form16-parser,Form 16 parser,nofollow,planned,MyeCA owner,TBD,TBD,Owner-controlled short post",
  "2026-05-27,Guest posts,Personal finance guide updates,DesiSalary Form 16 guide,DesiSalary,https://desisalary.com/guides/form-16-guide-india/,TBD,TBD,TBD,Form 16 parser workflow,https://myeca.in/form16-parser,https://myeca.in/form16-parser?utm_campaign=itr-season-2026&utm_medium=outreach&utm_content=desisalary-form16-parser,Form 16 parser workflow,editorial,prospect,TBD,TBD,TBD,Recent Form 16 guide aligns with employee prefiling workflow pitch",
  "2026-05-27,Finance forums,Taxpayer community answers,IndiaTax subreddit,Reddit,https://www.reddit.com/r/IndiaTax/,TBD,TBD,https://www.reddit.com/r/IndiaTax/,Income tax calculator,https://myeca.in/calculators/income-tax,https://myeca.in/calculators/income-tax?utm_campaign=itr-season-2026&utm_medium=community&utm_content=reddit-indiatax-income-tax-calculator,income tax calculator,nofollow,queued,TBD,TBD,TBD,Answer only specific taxpayer questions and disclose affiliation",
  "2026-05-27,HR/payroll,Employee tax education pages,HROne Form 16 glossary,HROne,https://hrone.cloud/hr-glossary/form-16/,TBD,TBD,TBD,Form 16 parser workflow,https://myeca.in/form16-parser,https://myeca.in/form16-parser?utm_campaign=itr-season-2026&utm_medium=outreach&utm_content=hrone-form16-parser,MyeCA Form 16 parser workflow,editorial,prospect,TBD,TBD,TBD,Updated Form 16 page aligns with employee prefiling checklist pitch",
];

describe("SEO outreach readiness", () => {
  it("does not count template rows but accepts concrete planned and prospect rows", () => {
    const csv = [
      headers,
      "2026-05-27,CA blogs,Reusable template,TBD,TBD,TBD,TBD,TBD,TBD,AIS Form 26AS mismatch checklist,https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist,https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026&utm_medium=outreach&utm_content=ca-template,MyeCA AIS checklist,editorial,template,TBD,TBD,TBD,Template row for pitch angle only",
      ...qualifiedRows,
    ].join("\n");

    const readiness = evaluateSeoOutreachReadiness(csv, {
      minimumQualifiedProspects: qualifiedRows.length,
      requiredChannels: OUTREACH_REQUIRED_CHANNELS,
    });

    expect(readiness.ok).toBe(true);
    expect(readiness.qualifiedProspectCount).toBe(qualifiedRows.length);
    expect(readiness.templateRowCount).toBe(1);
    expect(readiness.channelCoverage).toEqual(OUTREACH_REQUIRED_CHANNELS);
  });

  it("flags placeholders in active prospect rows", () => {
    const csv = [
      headers,
      "2026-05-27,CA blogs,Tax professional article submission,TBD,CAclubindia,https://www.caclubindia.com/articles,Editorial team,article@caclubindia.com,TBD,AIS Form 26AS mismatch checklist,https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist,https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026&utm_medium=outreach&utm_content=caclubindia-ais-checklist,MyeCA AIS checklist,editorial,prospect,TBD,TBD,TBD,Visible article submission email on articles page",
    ].join("\n");

    const readiness = evaluateSeoOutreachReadiness(csv, {
      minimumQualifiedProspects: 1,
      requiredChannels: ["CA blogs"],
    });

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toContain("line 2 prospect_name is placeholder for active prospect");
  });

  it("requires campaign UTM discipline for active outreach rows", () => {
    const csv = [
      headers,
      "2026-05-27,Finance forums,Taxpayer community answers,IndiaTax subreddit,Reddit,https://www.reddit.com/r/IndiaTax/,TBD,TBD,https://www.reddit.com/r/IndiaTax/,Income tax calculator,https://myeca.in/calculators/income-tax,https://myeca.in/calculators/income-tax?utm_medium=community&utm_content=reddit-indiatax-income-tax-calculator,income tax calculator,nofollow,queued,TBD,TBD,TBD,Answer only specific taxpayer questions and disclose affiliation",
    ].join("\n");

    const readiness = evaluateSeoOutreachReadiness(csv, {
      minimumQualifiedProspects: 1,
      requiredChannels: ["Finance forums"],
    });

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toContain("line 2 utm_url must include utm_campaign=itr-season-2026");
  });

  it("formats outreach tracker issues for the final search goal gate", () => {
    const csv = [
      headers,
      "2026-05-27,CA blogs,Tax professional article submission,TBD,CAclubindia,https://www.caclubindia.com/articles,Editorial team,article@caclubindia.com,TBD,AIS Form 26AS mismatch checklist,https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist,https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026&utm_medium=outreach&utm_content=caclubindia-ais-checklist,MyeCA AIS checklist,editorial,prospect,TBD,TBD,TBD,Visible article submission email on articles page",
    ].join("\n");

    const readiness = evaluateSeoOutreachReadiness(csv, {
      minimumQualifiedProspects: 2,
      requiredChannels: ["CA blogs", "LinkedIn"],
    });

    expect(formatSeoOutreachReadinessIssues(readiness)).toEqual([
      "SEO outreach readiness: line 2 prospect_name is placeholder for active prospect",
      "SEO outreach readiness: qualified outreach prospects 1; expected at least 2",
      "SEO outreach readiness: missing outreach channel coverage: LinkedIn",
    ]);
  });
});
