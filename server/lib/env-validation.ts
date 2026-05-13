import { getEnvReport } from "./env-requirements.js";

/**
 * Validate required environment variables at startup.
 * Logs warnings without exposing secret values; public routes should still boot.
 */
export function validateEnv() {
  const report = getEnvReport();

  for (const issue of report.issues) {
    console.warn(`[ENV] ${issue.level.toUpperCase()}: ${issue.message}`);
  }
}
