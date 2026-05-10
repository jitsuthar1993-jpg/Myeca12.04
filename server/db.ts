import "dotenv/config";
import pg from "pg";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./db/schema.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;
let drizzleClient: NodePgDatabase<typeof schema> | null = null;

export function getDatabaseUrl() {
  return process.env.DATABASE_URL;
}

export function getSql() {
  if (!pool) {
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required for Supabase Postgres access");
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  }

  return pool;
}

export function getDb() {
  if (!drizzleClient) {
    drizzleClient = drizzle(getSql(), { schema });
  }

  return drizzleClient;
}

export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, property) {
    const currentDb = getDb() as any;
    const value = currentDb[property];
    return typeof value === "function" ? value.bind(currentDb) : value;
  },
});

export { schema };
