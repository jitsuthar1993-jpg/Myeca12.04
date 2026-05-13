import "dotenv/config";
import { getEnvReport } from "../server/lib/env-requirements.js";

const strict = process.argv.includes("--strict");
const json = process.argv.includes("--json");

const report = getEnvReport(process.env);
const failingIssues = strict ? report.issues : report.requiredIssues;

if (json) {
  console.log(JSON.stringify({
    ok: failingIssues.length === 0,
    strict,
    missingOrInvalid: report.issues.map((issue) => ({
      key: issue.key,
      level: issue.level,
      message: issue.message,
    })),
  }, null, 2));
} else {
  console.log(`Environment readiness report${strict ? " (strict)" : ""}`);

  if (report.issues.length === 0) {
    console.log("All required and recommended environment variables are present.");
  } else {
    for (const issue of report.requiredIssues) {
      console.error(`Required: ${issue.message}`);
    }
    for (const issue of report.recommendedIssues) {
      console.warn(`Recommended: ${issue.message}`);
    }
  }

  const optionalConfigured = report.requirements
    .filter((requirement) => requirement.level === "optional")
    .filter((requirement) => Boolean(process.env[requirement.key]?.trim()))
    .map((requirement) => requirement.key);

  if (optionalConfigured.length > 0) {
    console.log(`Optional configured: ${optionalConfigured.join(", ")}`);
  }

  console.log("Secret values were not printed.");
}

if (failingIssues.length > 0) {
  process.exit(1);
}
