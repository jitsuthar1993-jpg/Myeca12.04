import fs from "node:fs";
import path from "node:path";
import {
  evaluateSeoOutreachReadiness,
  OUTREACH_REQUIRED_CHANNELS,
} from "../shared/seo-outreach-readiness.js";

const trackerPath = path.resolve("docs/marketing/itr-season-2026-outreach-tracker.csv");

function printCheck(ok: boolean, label: string, detail: string) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${detail}`);
}

function main() {
  if (!fs.existsSync(trackerPath)) {
    console.error(`Missing outreach tracker: ${path.relative(process.cwd(), trackerPath)}`);
    process.exit(1);
  }

  const csv = fs.readFileSync(trackerPath, "utf8");
  const readiness = evaluateSeoOutreachReadiness(csv, {
    minimumQualifiedProspects: 20,
    requiredChannels: OUTREACH_REQUIRED_CHANNELS,
  });

  printCheck(true, "outreach tracker rows", `${readiness.totalRows} row(s), ${readiness.templateRowCount} template row(s)`);
  printCheck(
    readiness.qualifiedProspectCount >= 20,
    "qualified outreach prospects",
    `${readiness.qualifiedProspectCount} active planned/prospect/queued row(s)`,
  );
  printCheck(
    OUTREACH_REQUIRED_CHANNELS.every((channel) => readiness.channelCoverage.includes(channel)),
    "required channel coverage",
    readiness.channelCoverage.join(", "),
  );

  readiness.issues.forEach((issue) => console.log(`FAIL ${issue}`));

  if (!readiness.ok) {
    console.error("\nSEO outreach readiness check failed.");
    process.exit(1);
  }

  console.log("\nSEO outreach readiness check passed.");
}

main();
