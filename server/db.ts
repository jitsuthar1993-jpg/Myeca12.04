import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import pg from "pg";
import Database from "better-sqlite3";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const isSqlite = process.env.DATABASE_URL.startsWith("file:");

export const pool = !isSqlite ? new Pool({ connectionString: process.env.DATABASE_URL }) : null;
export const db = isSqlite 
  ? drizzleSqlite(new Database(process.env.DATABASE_URL.replace("file:", "")), { schema })
  : drizzlePg(pool!, { schema });
