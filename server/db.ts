import "dotenv/config";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";

let sqlClient: NeonQueryFunction<false, false> | null = null;
let drizzleClient: NeonHttpDatabase<typeof schema> | null = null;

export function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
}

export function getSql() {
  if (!sqlClient) {
    const databaseUrl = getDatabaseUrl();
    if (!databaseUrl) {
      throw new Error("DATABASE_URL or POSTGRES_URL is required for Neon Postgres access");
    }
    sqlClient = neon(databaseUrl);
  }

  return sqlClient;
}

export function getDb() {
  if (!drizzleClient) {
    drizzleClient = drizzle(getSql(), { schema });
  }

  return drizzleClient;
}

export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_target, property) {
    const currentDb = getDb() as any;
    const value = currentDb[property];
    return typeof value === "function" ? value.bind(currentDb) : value;
  },
});
export { schema };
