/**
 * Validate required environment variables at startup.
 * Logs warnings for optional missing vars, throws for critical ones.
 */
export function validateEnv() {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    errors.push("DATABASE_URL or POSTGRES_URL must be set for Neon Postgres");
  }

  if (!process.env.CLERK_SECRET_KEY) {
    errors.push("CLERK_SECRET_KEY must be set for Clerk authentication");
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

  // Throw on critical errors
  if (errors.length > 0) {
    for (const e of errors) {
      console.error(`[ENV] Error: ${e}`);
    }
    // Don't throw in development to allow easier setup
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${errors.join(', ')}`);
    }
  }
}
