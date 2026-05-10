import { adminDb } from "../server/data-admin.js";
import { getSupabaseAdminClient } from "../server/lib/supabase.js";
import { findOrCreateUserProfile } from "../server/services/user-accounts.js";
import { getTemporaryTestUserByToken, type TemporaryTestRole } from "../shared/temporary-test-users.js";

type ApiUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: TemporaryTestRole | string;
  status?: string;
};

export function sendJson(res: any, status: number, payload: unknown) {
  res.setHeader("Content-Type", "application/json");
  return res.status(status).json(payload);
}

function readBearerToken(req: any) {
  const authorization = String(req.headers?.authorization ?? "");
  return authorization.match(/^Bearer\s+(.+)$/i)?.[1] ?? null;
}

export function readTemporaryAuth(req: any) {
  const token = readBearerToken(req);
  if (!token) return null;
  return getTemporaryTestUserByToken(token);
}

export async function requireApiUser(req: any, res: any, roles: TemporaryTestRole[]) {
  try {
    const authUser = readTemporaryAuth(req);
    if (authUser) {
      if (!roles.includes(authUser.role)) {
        sendJson(res, 403, { error: "Access denied. Insufficient permissions." });
        return null;
      }

      const snapshot = await adminDb.collection("users").doc(authUser.id).get();
      if (!snapshot.exists) {
        sendJson(res, 403, { error: "Temporary test user not found in database." });
        return null;
      }

      return { id: snapshot.id, ...(snapshot.data() as ApiUser) };
    }

    const token = readBearerToken(req);
    if (!token) {
      sendJson(res, 401, { error: "Unauthorized" });
      return null;
    }

    const { data, error } = await getSupabaseAdminClient().auth.getUser(token);
    if (error || !data.user?.id) {
      sendJson(res, 401, { error: "Invalid or expired session." });
      return null;
    }

    const userDoc = await findOrCreateUserProfile({
      userId: data.user.id,
      email: data.user.email ?? undefined,
    });
    const user = { id: userDoc.id, ...(userDoc.data() as ApiUser) };
    if (!roles.includes(user.role as TemporaryTestRole)) {
      sendJson(res, 403, { error: "Access denied. Insufficient permissions." });
      return null;
    }

    return user;
  } catch (error: any) {
    console.error("[API_AUTH] Supabase auth/database check failed:", error);
    sendJson(res, 500, {
      error: "Auth database check failed",
      message: error?.message || "Unknown auth database error",
    });
    return null;
  }
}

export async function requireTemporaryRole(req: any, res: any, roles: TemporaryTestRole[]) {
  return requireApiUser(req, res, roles);
}

export async function countCollection(name: string) {
  const snapshot = await (adminDb.collection(name) as any).count().get();
  return Number(snapshot.data().count ?? 0);
}

export async function listCollection(name: string, limit = 100) {
  const snapshot = await (adminDb.collection(name) as any).limit(limit).get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export function methodAllowed(req: any, res: any, methods: string[]) {
  if (methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  sendJson(res, 405, { error: "Method not allowed" });
  return false;
}
