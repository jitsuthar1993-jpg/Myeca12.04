import { describe, expect, it } from "vitest";
import {
  evaluateSearchGoalReadiness,
  formatSearchGoalReadinessReport,
} from "@shared/search-goal-readiness";

const googleReadyCsv = `date,item,status,evidence,next_action
2026-05-27,Search Console verification access,repo_resolved,DNS TXT token detected,Confirm UI state
2026-05-27,Sitemap submitted,live_verified,Sitemap accepted in Search Console,Monitor discovered URL count
`;

const bingPendingCsv = `date,item,status,evidence,next_action
2026-05-27,Bing Webmaster Tools property,pending_external,Awaiting Bing Webmaster Tools site verification for https://myeca.in,Verify property or import from Google Search Console
2026-05-27,IndexNow priority dry run,recorded,"Dry run selected 9 URLs, without sending a request",Set INDEXNOW_KEY and submit
`;

describe("search goal readiness", () => {
  it("fails readiness when any search engine evidence still has owner-side pending work", () => {
    const readiness = evaluateSearchGoalReadiness([
      { name: "Google", csv: googleReadyCsv },
      { name: "Bing", csv: bingPendingCsv },
    ]);

    expect(readiness.ok).toBe(false);
    expect(readiness.pendingExternalEvidence).toEqual([
      {
        date: "2026-05-27",
        engine: "Bing",
        item: "Bing Webmaster Tools property",
        evidence: "Awaiting Bing Webmaster Tools site verification for https://myeca.in",
        nextAction: "Verify property or import from Google Search Console",
        line: 2,
        status: "pending_external",
      },
    ]);
  });

  it("passes readiness when all evidence rows are resolved or recorded", () => {
    const readiness = evaluateSearchGoalReadiness([
      { name: "Google", csv: googleReadyCsv },
      {
        name: "Bing",
        csv: bingPendingCsv.replace("pending_external", "live_verified").replace("Awaiting", "Verified"),
      },
    ]);

    expect(readiness.ok).toBe(true);
    expect(readiness.pendingExternalEvidence).toEqual([]);
    expect(readiness.issues).toEqual([]);
  });

  it("fails readiness when a required evidence item is missing", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Google",
        requiredItems: ["Domain property", "Sitemap submitted"],
        csv: `date,item,status,evidence,next_action
2026-05-27,Sitemap submitted,recorded,Sitemap accepted in Search Console,Monitor discovered URLs
`,
      },
    ]);

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toEqual([
      "Google required evidence item is missing: Domain property",
    ]);
  });

  it("uses the latest row for append-only evidence items", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Google",
        csv: `date,item,status,evidence,next_action
2026-05-26,Sitemap submitted,pending_external,Awaiting owner submission,Submit sitemap
2026-05-27,Sitemap submitted,live_verified,Sitemap accepted in Search Console,Monitor discovered URLs
`,
      },
    ]);

    expect(readiness.ok).toBe(true);
    expect(readiness.pendingExternalEvidence).toEqual([]);
  });

  it("uses the newer dated row when evidence files keep newer entries near the top", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Google",
        csv: `date,item,status,evidence,next_action
2026-05-27,Search Console verification access,repo_resolved,DNS TXT token detected,Confirm Search Console UI
2026-05-26,Search Console verification access,pending_external,No verification token found,Add DNS TXT
`,
      },
    ]);

    expect(readiness.ok).toBe(true);
    expect(readiness.pendingExternalEvidence).toEqual([]);
  });

  it("uses concrete same-day owner proof instead of a stale pending row", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Bing",
        csv: `date,item,status,evidence,next_action
2026-05-27,IndexNow key configured,pending_external,INDEXNOW_KEY support added but production key file proof is not recorded,Set INDEXNOW_KEY in production and verify key file
2026-05-27,IndexNow key configured,recorded,npm run check:indexnow-key returned the configured key without logging it,Submit priority URLs with IndexNow
`,
      },
    ]);

    expect(readiness.ok).toBe(true);
    expect(readiness.pendingExternalEvidence).toEqual([]);
  });

  it("flags malformed evidence logs before allowing completion", () => {
    const readiness = evaluateSearchGoalReadiness([
      { name: "Google", csv: "date,item,status,evidence,next_action\n2026-05-27,Only three fields,pending_external" },
    ]);

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toEqual([
      "Google line 2 has 3 CSV field(s); expected 5",
    ]);
  });

  it("flags malformed evidence dates before allowing completion", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Bing",
        csv: `date,item,status,evidence,next_action
May 27 2026,Bing sitemap submitted,recorded,Sitemap accepted in Bing Webmaster Tools,Monitor discovered URL count
`,
      },
    ]);

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toEqual([
      "Bing Bing sitemap submitted has invalid date May 27 2026; expected YYYY-MM-DD",
    ]);
  });

  it("flags vague placeholder text in the latest pending evidence row", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Google",
        csv: `date,item,status,evidence,next_action
2026-05-27,Domain property,pending_external,TBD,Add or confirm myeca.in Domain property in Google Search Console
`,
      },
    ]);

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toEqual([
      "Google Domain property has placeholder evidence text: TBD",
    ]);
  });

  it("flags empty evidence text in the latest pending evidence row", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Bing",
        csv: `date,item,status,evidence,next_action
2026-05-27,IndexNow key configured,pending_external,,Set production key and verify key file
`,
      },
    ]);

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toEqual([
      "Bing IndexNow key configured has placeholder evidence text: (empty)",
    ]);
  });

  it("flags vague placeholder text in the latest pending next action", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Bing",
        csv: `date,item,status,evidence,next_action
2026-05-27,IndexNow priority submission,pending_external,Awaiting real IndexNow submission after key file is live,TBD
`,
      },
    ]);

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toEqual([
      "Bing IndexNow priority submission has placeholder next action text: TBD",
    ]);
  });

  it("rejects repo-only statuses for owner-side completion evidence", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Google",
        csv: `date,item,status,evidence,next_action
2026-05-27,Sitemap submitted,repo_updated,Added sitemap submission instructions,Submit sitemap in Search Console
`,
      },
    ]);

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toEqual([
      "Google Sitemap submitted has status repo_updated; expected live_verified or recorded",
    ]);
  });

  it("rejects repo-only status for custom-domain access evidence", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Google",
        csv: `date,item,status,evidence,next_action
2026-05-27,Vercel domain access,repo_updated,Added notes about the owner Vercel account,Alias myeca.in from the owning account
`,
      },
    ]);

    expect(readiness.ok).toBe(false);
    expect(readiness.issues).toEqual([
      "Google Vercel domain access has status repo_updated; expected live_verified or recorded",
    ]);
  });

  it("allows recorded evidence for measurement and outreach milestones", () => {
    const readiness = evaluateSearchGoalReadiness([
      {
        name: "Google",
        csv: `date,item,status,evidence,next_action
2026-05-27,Field INP evidence,recorded,Search Console Core Web Vitals field INP screenshot recorded,Monitor field data
2026-05-27,First outreach/publishing batch,recorded,Live owner-channel post URL recorded,Track replies and placements
`,
      },
    ]);

    expect(readiness.ok).toBe(true);
    expect(readiness.issues).toEqual([]);
  });

  it("formats an ordered report with the incomplete status as the final line", () => {
    const readiness = evaluateSearchGoalReadiness([
      { name: "Google", csv: googleReadyCsv },
      { name: "Bing", csv: bingPendingCsv },
    ]);

    const report = formatSearchGoalReadinessReport(readiness, ["Bing evidence log is missing"]);
    const lines = report.split("\n");

    expect(lines).toContain("Evidence log issue(s):");
    expect(lines).toContain("FAIL Bing evidence log is missing");
    expect(lines).toContain("Pending owner/account evidence:");
    expect(lines).toContain("FAIL Bing Bing Webmaster Tools property: Awaiting Bing Webmaster Tools site verification for https://myeca.in");
    expect(lines.at(-1)).toBe("Search goal readiness is not complete yet.");
  });
});
