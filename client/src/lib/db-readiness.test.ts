import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  REQUIRED_DB_INDEXES,
  REQUIRED_DB_TABLES,
  assessDbReadiness,
} from "../../../scripts/check-db-readiness";

describe("database readiness check", () => {
  it("flags missing release-critical tables, indexes, and migration history", () => {
    const issues = assessDbReadiness({
      tables: ["users", "documents"],
      indexes: ["users_pkey"],
      drizzleMigrationCount: 1,
      expectedMigrationCount: 4,
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        "Missing table: consultation_requests",
        "Missing table: payment_link_requests",
        "Missing index: documents_data_user_status_idx",
        "Drizzle migrations applied: 1/4",
      ]),
    );
  });

  it("passes when all required database objects and migrations are present", () => {
    expect(
      assessDbReadiness({
        tables: REQUIRED_DB_TABLES,
        indexes: REQUIRED_DB_INDEXES,
        drizzleMigrationCount: 4,
        expectedMigrationCount: 4,
      }),
    ).toEqual([]);
  });

  it("exposes the DB readiness check as an npm script", () => {
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf8"));

    expect(packageJson.scripts["check:db"]).toBe("tsx scripts/check-db-readiness.ts");
  });
});
