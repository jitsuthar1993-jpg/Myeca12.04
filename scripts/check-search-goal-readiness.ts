import fs from "node:fs";
import path from "node:path";
import {
  BING_SEARCH_REQUIRED_EVIDENCE_ITEMS,
  GOOGLE_SEARCH_REQUIRED_EVIDENCE_ITEMS,
  evaluateSearchGoalReadiness,
  formatSearchGoalReadinessReport,
} from "../shared/search-goal-readiness.js";
import {
  evaluateSeoOutreachReadiness,
  formatSeoOutreachReadinessIssues,
  OUTREACH_REQUIRED_CHANNELS,
} from "../shared/seo-outreach-readiness.js";

const evidenceLogs = [
  {
    name: "Google",
    path: path.resolve("docs/google-search-console-evidence-log.csv"),
    requiredItems: GOOGLE_SEARCH_REQUIRED_EVIDENCE_ITEMS,
  },
  {
    name: "Bing",
    path: path.resolve("docs/bing-search-console-evidence-log.csv"),
    requiredItems: BING_SEARCH_REQUIRED_EVIDENCE_ITEMS,
  },
] as const;

const outreachTrackerPath = path.resolve("docs/marketing/itr-season-2026-outreach-tracker.csv");

function readEvidenceLog(log: (typeof evidenceLogs)[number]) {
  if (!fs.existsSync(log.path)) {
    return {
      csv: "date,item,status,evidence,next_action\n",
      issue: `${log.name} evidence log is missing at ${path.relative(process.cwd(), log.path)}`,
      name: log.name,
      requiredItems: log.requiredItems,
    };
  }

  return {
    csv: fs.readFileSync(log.path, "utf8"),
    issue: null,
    name: log.name,
    requiredItems: log.requiredItems,
  };
}

function main() {
  const logs = evidenceLogs.map(readEvidenceLog);
  const readiness = evaluateSearchGoalReadiness(logs.map(({ name, csv, requiredItems }) => ({ name, csv, requiredItems })));
  const missingLogIssues = logs.flatMap((log) => log.issue ? [log.issue] : []);
  const outreachIssues = fs.existsSync(outreachTrackerPath)
    ? formatSeoOutreachReadinessIssues(evaluateSeoOutreachReadiness(fs.readFileSync(outreachTrackerPath, "utf8"), {
      minimumQualifiedProspects: 20,
      requiredChannels: OUTREACH_REQUIRED_CHANNELS,
    }))
    : [`SEO outreach readiness tracker is missing at ${path.relative(process.cwd(), outreachTrackerPath)}`];
  const extraIssues = [...missingLogIssues, ...outreachIssues];
  console.log(formatSearchGoalReadinessReport(readiness, extraIssues));

  if (extraIssues.length || readiness.issues.length || readiness.pendingExternalEvidence.length) {
    process.exit(1);
  }
}

main();
