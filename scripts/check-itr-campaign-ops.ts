import { readFileSync } from "node:fs";
import { summarizeCampaignOps, validateCampaignOps } from "./itr-campaign-ops";

const calendarPath = "docs/marketing/itr-season-2026-content-calendar.csv";
const prospectsPath = "docs/marketing/itr-season-2026-prospect-segment-plan.csv";

const input = {
  calendarCsv: readFileSync(calendarPath, "utf8"),
  prospectsCsv: readFileSync(prospectsPath, "utf8"),
};

const errors = validateCampaignOps(input);
const summary = summarizeCampaignOps(input);

if (errors.length > 0) {
  console.error(`ITR campaign ops check failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `ITR campaign ops check passed: ${summary.calendarRows} calendar rows, ${summary.prospectRows} prospect segments, ${summary.quotaTotal} total prospects.`,
);
