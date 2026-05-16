import { getEnvReport } from "./env-requirements.js";

/**
 * Validate required environment variables at startup.
 * Logs warnings without exposing secret values. Production fails fast on missing
 * required values so protected APIs cannot boot with partial configuration.
 */
export function validateEnv(env: NodeJS.ProcessEnv = process.env) {
  const report = getEnvReport(env);

  for (const issue of report.issues) {
    console.warn(`[ENV] ${issue.level.toUpperCase()}: ${issue.message}`);
  }

  if (env.NODE_ENV === "production" && report.requiredIssues.length > 0) {
    const missing = report.requiredIssues.map((issue) => issue.key).join(", ");
    throw new Error(`Production environment is missing required configuration: ${missing}`);
  }

  return report;
}
