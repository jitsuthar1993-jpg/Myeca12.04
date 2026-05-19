import { adminDb } from "../data-admin.js";
import { normalizeAppRole, type AppRole } from "../../shared/app-roles.js";

export type AppUserRecord = {
  id: string;
  role?: AppRole | string | null;
  assignedCaId?: string | null;
  status?: string | null;
  [key: string]: unknown;
};

export function isAdmin(user?: AppUserRecord | null) {
  return normalizeAppRole(user?.role) === "admin";
}

export function isTeamMember(user?: AppUserRecord | null) {
  return normalizeAppRole(user?.role) === "team_member";
}

export function isCa(user?: AppUserRecord | null) {
  return normalizeAppRole(user?.role) === "ca";
}

export function isPrivileged(user?: AppUserRecord | null) {
  return isAdmin(user) || isTeamMember(user);
}

export async function getUserById(userId?: string | null) {
  if (!userId) return null;
  const doc = await adminDb.collection("users").doc(userId).get();
  return doc.exists ? ({ id: doc.id, ...(doc.data() as Record<string, unknown>) } as AppUserRecord) : null;
}

export async function canAccessUserData(actor: AppUserRecord | null | undefined, targetUserId?: string | null) {
  if (!actor || !targetUserId) return false;
  if (actor.id === targetUserId) return true;
  if (isAdmin(actor)) return true;

  if (isCa(actor)) {
    const targetUser = await getUserById(targetUserId);
    return targetUser?.assignedCaId === actor.id;
  }

  return false;
}

export async function assertCanAccessUserData(actor: AppUserRecord | null | undefined, targetUserId?: string | null) {
  if (!(await canAccessUserData(actor, targetUserId))) {
    const error = new Error("Access denied");
    (error as Error & { status?: number }).status = 403;
    throw error;
  }
}

export async function getOwnedDocument(collectionName: string, id?: string | null) {
  if (!id) return null;
  const doc = await adminDb.collection(collectionName).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...(doc.data() as Record<string, unknown>) } as Record<string, unknown> & { id: string };
}

export async function recordBelongsToUser(collectionName: string, id: string | null | undefined, userId: string) {
  if (!id) return true;
  const record = await getOwnedDocument(collectionName, id);
  if (!record) return false;
  return record.userId === userId;
}

export async function getUserOwnedSnapshot(collectionName: string, id: string | null | undefined, userId: string) {
  if (!id) return null;
  const doc = await adminDb.collection(collectionName).doc(id).get();
  if (!doc.exists) return null;
  return doc.data()?.userId === userId ? doc : null;
}

export async function getAccessibleSnapshot(
  collectionName: string,
  id: string | null | undefined,
  actor: AppUserRecord | null | undefined,
) {
  if (!id) return null;
  const doc = await adminDb.collection(collectionName).doc(id).get();
  if (!doc.exists) return null;
  return (await canAccessUserData(actor, doc.data()?.userId)) ? doc : null;
}

export async function getUserOwnedRecords(collectionName: string, userId: string, extraFilters: Record<string, unknown> = {}) {
  let query: any = adminDb.collection(collectionName).where("userId", "==", userId);

  for (const [field, value] of Object.entries(extraFilters)) {
    query = query.where(field, "==", value);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }));
}

export function ownerIdFromRecord(record: Record<string, unknown> | null | undefined) {
  const userId = record?.userId;
  return typeof userId === "string" ? userId : null;
}
