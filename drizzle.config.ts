import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const isSqlite = process.env.DATABASE_URL?.startsWith("file:");

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: isSqlite ? "sqlite" : "postgresql",
  dbCredentials: {
    url: isSqlite ? process.env.DATABASE_URL!.replace("file:", "") : process.env.DATABASE_URL!,
  },
});
