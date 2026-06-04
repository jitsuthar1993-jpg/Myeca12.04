import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "../db.js";

/**
 * Drizzle-native helpers for operations the adminDb shim does not support.
 *
 * Background: server/data-admin.ts is a thin Postgres-backed shim that mimics the
 * Firestore API (collection().where().get(), .count()). It only supports the `==`
 * operator, so anything that needs `IN`, `ILIKE`, joins, or transactions has to fan
 * out into multiple shim queries or hand-write SQL.
 *
 * This module exists to make those operations easy without touching the shim.
 * The longer-term direction is to migrate route handlers off the shim onto Drizzle
 * directly; until then, prefer the helpers here over multi-query workarounds.
 */

// Every document table follows the same shape: { id, data jsonb, createdAt, updatedAt }.
// We address the JSON document fields via Drizzle's sql template helper.
type DocumentTable =
  | typeof schema.users
  | typeof schema.profiles
  | typeof schema.documents
  | typeof schema.taxReturns
  | typeof schema.userServices
  | typeof schema.blogPosts
  | typeof schema.categories
  | typeof schema.dailyUpdates
  | typeof schema.activityLogs
  | typeof schema.auditLogs
  | typeof schema.referrals
  | typeof schema.teams
  | typeof schema.notifications
  | typeof schema.workflows
  | typeof schema.reports
  | typeof schema.chatSessions
  | typeof schema.chatMessages
  | typeof schema.documentDrafts
  | typeof schema.consultationRequests
  | typeof schema.paymentLinkRequests
  | typeof schema.siteSettings
  | typeof schema.emailTemplates
  | typeof schema.pages;

/**
 * COUNT(*) over a document collection, optionally filtered by an exact userId match
 * AND a status value in a list. Replaces the fan-out pattern of issuing one
 * `where("status", "==", s).count()` per status to work around the shim's lack of
 * `IN` support.
 *
 * Example:
 *   const pending = await countByUserAndStatus(schema.userServices, userId, [
 *     "pending", "in_progress", "requested", "new",
 *   ]);
 */
export async function countByUserAndStatus(
  table: DocumentTable,
  userId: string,
  statuses: string[],
): Promise<number> {
  if (statuses.length === 0) return 0;

  const db = getDb();
  const result = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(table as any)
    .where(
      and(
        sql`${(table as any).data} ->> 'userId' = ${userId}`,
        inArray(sql`${(table as any).data} ->> 'status'`, statuses),
      ),
    );

  return Number(result[0]?.count ?? 0);
}

/**
 * COUNT(*) over a document collection filtered by a single JSON field equality.
 * The adminDb shim already supports this via `.where("foo", "==", value).count()`,
 * but for code that already imports getDb() this saves a layer of indirection.
 */
export async function countWhereEquals(
  table: DocumentTable,
  field: string,
  value: string,
): Promise<number> {
  const db = getDb();
  const result = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(table as any)
    .where(sql`${(table as any).data} ->> ${field} = ${value}`);

  return Number(result[0]?.count ?? 0);
}

/**
 * Find documents whose `id` (top-level column or JSON field) matches any in the
 * provided list. Useful for batched joins — e.g. fetching the user records for the
 * top 50 service cases returned by an admin list endpoint.
 */
export async function findByIdIn(
  table: DocumentTable,
  ids: string[],
): Promise<Array<{ id: string; data: Record<string, unknown> }>> {
  if (ids.length === 0) return [];

  const db = getDb();
  const result = await db
    .select({ id: (table as any).id, data: (table as any).data })
    .from(table as any)
    .where(inArray((table as any).id, ids));

  return result.map((row: any) => ({ id: row.id, data: row.data ?? {} }));
}

export { schema };
