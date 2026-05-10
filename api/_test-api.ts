import { adminDb } from "../server/data-admin.js";
import { getSupabaseAuthClient } from "../server/lib/supabase.js";
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

function roleFromSupabaseUser(user: any) {
  return user?.app_metadata?.role || user?.user_metadata?.role || "user";
}

async function findOrCreateApiUser(authUser: any) {
  const userRef = adminDb.collection("users").doc(authUser.id);
  let snapshot = await userRef.get();

  if (!snapshot.exists) {
    await userRef.set({
      id: authUser.id,
      email: authUser.email ?? null,
      firstName: authUser.user_metadata?.firstName || authUser.user_metadata?.first_name || "User",
      lastName: authUser.user_metadata?.lastName || authUser.user_metadata?.last_name || "",
      role: roleFromSupabaseUser(authUser),
      status: "active",
      isVerified: Boolean(authUser.email_confirmed_at || authUser.confirmed_at),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    snapshot = await userRef.get();
  }

  return { id: snapshot.id, ...(snapshot.data() as ApiUser) };
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

    const { data, error } = await getSupabaseAuthClient().auth.getUser(token);
    if (error || !data.user?.id) {
      sendJson(res, 401, { error: "Invalid or expired session." });
      return null;
    }

    const user = await findOrCreateApiUser(data.user);
    if (!roles.includes(user.role as TemporaryTestRole)) {
      sendJson(res, 403, { error: "Access denied. Insufficient permissions." });
      return null;
    }

    return user;
  } catch (error: any) {
    console.error("[API_AUTH] Supabase auth/database check failed:", error);
    sendJson(res, 500, {
      error: "Auth database check failed",
      message: "Could not verify the authenticated user.",
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
