import "dotenv/config";
import { getSql } from "../db.js";
import { adminDb } from "../neon-admin.js";
import { TEMPORARY_TEST_USERS } from "../../shared/temporary-test-users.js";

const documentTables = [
  "activity_logs",
  "audit_logs",
  "blog_posts",
  "categories",
  "chat_messages",
  "chat_sessions",
  "daily_updates",
  "document_drafts",
  "documents",
  "email_templates",
  "notifications",
  "pages",
  "profiles",
  "referrals",
  "reports",
  "site_settings",
  "tax_returns",
  "teams",
  "user_services",
  "users",
  "workflows",
];

function assertTableName(table: string) {
  if (!/^[a-z_]+$/.test(table)) {
    throw new Error(`Unsafe table name: ${table}`);
  }
}

async function ensureDocumentTables() {
  const sql = getSql();

  for (const table of documentTables) {
    assertTableName(table);
    await sql.query(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id text PRIMARY KEY NOT NULL,
        data jsonb DEFAULT '{}'::jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      )
    `);
  }
}

async function clearDocumentTables() {
  const sql = getSql();

  for (const table of documentTables) {
    assertTableName(table);
    await sql.query(`TRUNCATE TABLE ${table}`);
  }
}

async function seedTemporaryUsers() {
  const now = new Date();

  for (const testUser of TEMPORARY_TEST_USERS) {
    const [firstName, ...lastNameParts] = testUser.label.split(" ");
    await adminDb.collection("users").doc(testUser.id).set({
      id: testUser.id,
      email: testUser.email,
      firstName,
      lastName: lastNameParts.join(" ") || "Tester",
      role: testUser.role,
      status: "active",
      isVerified: true,
      isTemporaryTestUser: true,
      createdAt: now,
      updatedAt: now,
    });
  }
}

async function seedMinimalSettings() {
  const now = new Date();

  await adminDb.collection("site_settings").doc("default").set({
    id: "default",
    appName: "MyeCA.in",
    appUrl: process.env.PUBLIC_APP_URL || process.env.APP_URL || "https://myeca.in",
    zeroDataBaseline: true,
    createdAt: now,
    updatedAt: now,
  });
}

async function main() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL && !process.env.POSTGRES_URL_NON_POOLING) {
    throw new Error("DATABASE_URL, POSTGRES_URL, or POSTGRES_URL_NON_POOLING is required.");
  }

  await ensureDocumentTables();
  await clearDocumentTables();
  await seedMinimalSettings();
  await seedTemporaryUsers();

  console.log("Reset Neon document data to zero baseline.");
  console.log(`Created ${TEMPORARY_TEST_USERS.length} temporary DB-backed test users.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
