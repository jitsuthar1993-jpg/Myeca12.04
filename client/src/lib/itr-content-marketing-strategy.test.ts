import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const strategyPath = "docs/marketing/itr-season-2026-paid-content-funnel.md";
const paidMediaPath = "docs/marketing/itr-season-2026-paid-media-plan.csv";
const nurturePath = "docs/marketing/itr-season-2026-lead-nurture-sequence.csv";
const kpiPath = "docs/marketing/itr-season-2026-weekly-kpi-template.csv";
const campaignPath = "docs/marketing/itr-season-2026-content-growth-campaign.md";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function parseCsv(csv: string) {
  const [headerLine, ...lines] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",").map((header) => header.trim());

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const fields: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let index = 0; index < line.length; index += 1) {
        const char = line[index];
        const nextChar = line[index + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
          current += "\"";
          index += 1;
          continue;
        }

        if (char === "\"") {
          inQuotes = !inQuotes;
          continue;
        }

        if (char === "," && !inQuotes) {
          fields.push(current.trim());
          current = "";
          continue;
        }

        current += char;
      }

      fields.push(current.trim());

      return Object.fromEntries(headers.map((header, index) => [header, fields[index] ?? ""]));
    });
}

function assertCampaignUtm(url: string, label: string) {
  const parsed = new URL(url);

  expect(parsed.searchParams.get("utm_campaign"), label).toBe("itr-season-2026");
  expect(parsed.searchParams.get("utm_medium"), label).toBeTruthy();
  expect(parsed.searchParams.get("utm_content"), label).toBeTruthy();
}

describe("ITR content marketing strategy implementation", () => {
  it("ships the strategy runbook and campaign execution files", () => {
    [strategyPath, paidMediaPath, nurturePath, kpiPath].forEach((path) => {
      expect(existsSync(path), path).toBe(true);
    });
  });

  it("documents the paid filing conversion funnel without unsafe claims", () => {
    const strategy = read(strategyPath);
    const forbiddenClaims = /guaranteed refund|assured notice avoidance|fastest processing|paid dofollow/i;
    const requiredPhrases = [
      "Primary conversion: paid ITR filing start",
      "Secondary conversion: expert consultation for complex cases",
      "INR 200,000 monthly paid budget",
      "Filing readiness",
      "Risk and correction",
      "Complex filing",
      "Tool-led education",
      "Trust and comparison",
      "/itr/form-selector",
      "/form16-parser",
      "/calculators/income-tax",
      "/calculators/regime-comparator",
      "/capital-gains-import",
      "Income Tax e-Filing portal",
      "Google Search Central helpful content guidance",
    ];

    requiredPhrases.forEach((phrase) => {
      expect(strategy, phrase).toContain(phrase);
    });
    expect(strategy).not.toMatch(forbiddenClaims);
  });

  it("allocates the INR 200,000 paid media budget across the approved launch channels", () => {
    const rows = parseCsv(read(paidMediaPath));
    const expectedBudgets = new Map([
      ["Google Search", 100000],
      ["Remarketing", 50000],
      ["Meta Retargeting", 30000],
      ["LinkedIn/YouTube Tests", 20000],
    ]);

    expect(rows).toHaveLength(expectedBudgets.size);
    expect(rows.reduce((sum, row) => sum + Number(row.monthly_budget_inr), 0)).toBe(200000);

    rows.forEach((row) => {
      expect(Number(row.monthly_budget_inr), row.channel).toBe(expectedBudgets.get(row.channel));
      expect(row.primary_conversion, row.channel).toBe("paid_filing_start");
      expect(row.guardrail, row.channel).toMatch(/negative keywords|retarget|no refund guarantees/i);
      assertCampaignUtm(row.utm_url, row.channel);
    });
  });

  it("defines the five-touch lead nurture path from checklist/tool usage to paid filing", () => {
    const rows = parseCsv(read(nurturePath));
    const expectedDays = ["0", "2", "4", "6", "10"];
    const ctas = rows.map((row) => row.cta);

    expect(rows.map((row) => row.day)).toEqual(expectedDays);
    expect(ctas).toContain("Start paid ITR filing");
    expect(ctas).toContain("Check your filing scope");
    expect(ctas).toContain("Upload Form 16");
    expect(ctas).toContain("Ask for CA review");

    rows.forEach((row) => {
      expect(row.primary_link, `day ${row.day}`).toMatch(/^https:\/\/myeca\.in\//);
      expect(row.claim_guardrail, `day ${row.day}`).toMatch(/no refund guarantees|educational|scope/i);
      assertCampaignUtm(row.utm_url, `day ${row.day}`);
    });
  });

  it("keeps the weekly KPI template tied to attract, engage, and convert signals", () => {
    const header = read(kpiPath).split(/\r?\n/)[0];
    const expectedColumns = [
      "organic_impressions",
      "organic_ctr",
      "paid_ctr",
      "paid_cpc_inr",
      "tool_starts",
      "checklist_downloads",
      "whatsapp_email_optins",
      "paid_filing_starts",
      "paid_cpa_inr",
      "expert_consultation_requests",
      "best_converting_asset",
    ];

    expectedColumns.forEach((column) => {
      expect(header).toContain(column);
    });
  });

  it("updates the base campaign doc with hybrid paid and nurture execution rules", () => {
    const campaign = read(campaignPath);

    expect(campaign).toContain("Hybrid Content and Paid Conversion Plan");
    expect(campaign).toContain(paidMediaPath);
    expect(campaign).toContain(nurturePath);
    expect(campaign).toContain(kpiPath);
    expect(campaign).toContain("paid_filing_start");
  });
});
