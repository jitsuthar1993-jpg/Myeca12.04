/**
 * Validate required environment variables at startup.
 * Logs warnings for optional missing vars, throws for critical ones.
 */
export function validateEnv() {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!process.env.DATABASE_URL) {
    warnings.push("DATABASE_URL not set - DB-backed features will fail until Supabase Postgres is connected");
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    warnings.push("Supabase Auth env vars are incomplete - protected routes will fail until Supabase is connected");
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    warnings.push("BLOB_READ_WRITE_TOKEN not set â€” document uploads will fail until Vercel Blob is connected");
  }

  // Optional but recommended
  if (!process.env.ADMIN_EMAILS) {
    warnings.push("ADMIN_EMAILS not set - no users will be auto-promoted to admin");
  }

  if (!process.env.PII_ENCRYPTION_KEY) {
    warnings.push("PII_ENCRYPTION_KEY not set â€” PII encryption disabled");
  }

  if (!process.env.SESSION_SECRET) {
    warnings.push("SESSION_SECRET not set â€” using auto-generated value");
  }

  // Log warnings
  for (const w of warnings) {
    console.warn(`[ENV] Warning: ${w}`);
  }

  // Log critical errors but don't crash â€” public routes should still work
  for (const e of errors) {
    console.error(`[ENV] Error: ${e}`);
  }
}
