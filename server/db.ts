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

function getSslConfig(): pg.PoolConfig["ssl"] {
  if (process.env.NODE_ENV !== "production") return undefined;

  // Prefer full certificate verification when a CA cert is supplied (DATABASE_CA_CERT).
  // Supabase publishes its CA bundle in the dashboard (Settings -> Database -> SSL).
  const ca = process.env.DATABASE_CA_CERT;
  if (ca) {
    return { ca, rejectUnauthorized: true };
  }

  // No CA configured: keep the connection encrypted but unverified (Supabase default).
  // Set DATABASE_CA_CERT to close the MITM gap, or DATABASE_SSL_NO_VERIFY=true to opt in explicitly.
  return { rejectUnauthorized: false };
}

export function getSql() {
  if (!pool) {
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required for Supabase Postgres access");
    }

    pool = new Pool({
      connectionString: databaseUrl,
      ssl: getSslConfig(),
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
