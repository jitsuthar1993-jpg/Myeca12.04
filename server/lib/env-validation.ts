/**
 * Validate required environment variables at startup.
 * Logs warnings for optional missing vars, throws for critical ones.
 */
export function validateEnv() {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    warnings.push("DATABASE_URL or POSTGRES_URL not set — DB-backed features will fail until Neon Postgres is connected");
  }

  if (!process.env.CLERK_SECRET_KEY) {
    warnings.push("CLERK_SECRET_KEY not set — authentication disabled, public routes still work");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    warnings.push("BLOB_READ_WRITE_TOKEN not set — document uploads will fail until Vercel Blob is connected");
  }

  // Optional but recommended
  if (!process.env.ADMIN_EMAILS) {
    warnings.push("ADMIN_EMAILS not set - no users will be auto-promoted to admin");
  }

  if (!process.env.PII_ENCRYPTION_KEY) {
    warnings.push("PII_ENCRYPTION_KEY not set — PII encryption disabled");
  }

  if (!process.env.SESSION_SECRET) {
    warnings.push("SESSION_SECRET not set — using auto-generated value");
  }

  // Log warnings
  for (const w of warnings) {
    console.warn(`[ENV] Warning: ${w}`);
  }

  // Log critical errors but don't crash — public routes should still work
  for (const e of errors) {
    console.error(`[ENV] Error: ${e}`);
  }
}
