import "dotenv/config";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import pg from "pg";

const { Pool } = pg;

export const REQUIRED_DB_TABLES = [
  "activity_logs",
  "audit_logs",
  "blog_posts",
  "categories",
  "chat_messages",
  "chat_sessions",
  "consultation_requests",
  "daily_updates",
  "document_drafts",
  "documents",
  "email_templates",
  "notifications",
  "pages",
  "payment_link_requests",
  "profiles",
  "referrals",
  "reminders",
  "reports",
  "site_settings",
  "tax_returns",
  "teams",
  "user_services",
  "users",
  "webhooks",
  "workflow_events",
  "workflows",
];

export const REQUIRED_DB_INDEXES = [
  "blog_posts_data_category_idx",
  "blog_posts_data_slug_idx",
  "blog_posts_data_status_idx",
  "daily_updates_data_active_idx",
  "documents_data_profile_idx",
  "documents_data_service_idx",
  "documents_data_tax_return_idx",
  "documents_data_user_status_idx",
  "notifications_data_user_read_idx",
  "profiles_data_status_idx",
  "profiles_data_user_id_idx",
  "reminders_data_due_status_idx",
  "reminders_data_target_status_idx",
  "tax_returns_data_profile_idx",
  "tax_returns_data_user_service_idx",
  "tax_returns_data_user_status_idx",
  "user_services_data_assigned_ca_status_idx",
  "user_services_data_payment_status_idx",
  "user_services_data_profile_idx",
  "user_services_data_user_status_idx",
  "users_data_assigned_ca_idx",
  "users_data_email_idx",
  "users_data_role_idx",
  "users_data_status_idx",
  "workflow_events_data_case_idx",
  "workflow_events_data_source_idx",
];

export type DbReadinessSnapshot = {
  tables: readonly string[];
  indexes: readonly string[];
  drizzleMigrationCount: number;
  expectedMigrationCount: number;
};

type Journal = {
  entries?: unknown[];
};

export function getExpectedMigrationCount() {
  const journalPath = resolve(process.cwd(), "migrations", "meta", "_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf8")) as Journal;
  return Array.isArray(journal.entries) ? journal.entries.length : 0;
}

export function assessDbReadiness(snapshot: DbReadinessSnapshot) {
  const tables = new Set(snapshot.tables);
  const indexes = new Set(snapshot.indexes);
  const issues: string[] = [];

  for (const table of REQUIRED_DB_TABLES) {
    if (!tables.has(table)) {
      issues.push(`Missing table: ${table}`);
    }
  }

  for (const index of REQUIRED_DB_INDEXES) {
    if (!indexes.has(index)) {
      issues.push(`Missing index: ${index}`);
    }
  }

  if (snapshot.drizzleMigrationCount < snapshot.expectedMigrationCount) {
    issues.push(`Drizzle migrations applied: ${snapshot.drizzleMigrationCount}/${snapshot.expectedMigrationCount}`);
  }

  return issues;
}

async function collectDbReadinessSnapshot(databaseUrl: string): Promise<DbReadinessSnapshot> {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const [tablesResult, indexesResult] = await Promise.all([
      pool.query<{ table_name: string }>(
        "select table_name from information_schema.tables where table_schema = 'public'",
      ),
      pool.query<{ indexname: string }>(
        "select indexname from pg_indexes where schemaname = 'public'",
      ),
    ]);

    let drizzleMigrationCount = 0;
    try {
      const migrationResult = await pool.query<{ count: number }>(
        "select count(*)::int as count from drizzle.__drizzle_migrations",
      );
      drizzleMigrationCount = Number(migrationResult.rows[0]?.count ?? 0);
    } catch {
      drizzleMigrationCount = 0;
    }

    return {
      tables: tablesResult.rows.map((row) => row.table_name),
      indexes: indexesResult.rows.map((row) => row.indexname),
      drizzleMigrationCount,
      expectedMigrationCount: getExpectedMigrationCount(),
    };
  } finally {
    await pool.end();
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    console.error("Database readiness check failed.");
    console.error("Missing DATABASE_URL.");
    process.exit(1);
  }

  const snapshot = await collectDbReadinessSnapshot(databaseUrl);
  const issues = assessDbReadiness(snapshot);

  console.log("Database readiness report");
  console.log(`Required tables checked: ${REQUIRED_DB_TABLES.length}`);
  console.log(`Required indexes checked: ${REQUIRED_DB_INDEXES.length}`);
  console.log(`Drizzle migrations applied: ${snapshot.drizzleMigrationCount}/${snapshot.expectedMigrationCount}`);

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(issue);
    }
    console.error("Secret values and row data were not printed.");
    process.exit(1);
  }

  console.log("All required database tables, indexes, and migrations are present.");
  console.log("Secret values and row data were not printed.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("Database readiness check failed.");
    console.error(error instanceof Error ? error.message : String(error));
    console.error("Secret values and row data were not printed.");
    process.exit(1);
  });
}
