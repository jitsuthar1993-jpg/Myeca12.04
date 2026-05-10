import { adminDb } from "../server/data-admin.js";
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

export function readTemporaryAuth(req: any) {
  const authorization = String(req.headers?.authorization ?? "");
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return null;
  return getTemporaryTestUserByToken(token);
}

export async function requireTemporaryRole(req: any, res: any, roles: TemporaryTestRole[]) {
  const authUser = readTemporaryAuth(req);
  if (!authUser) {
    sendJson(res, 401, { error: "Unauthorized" });
    return null;
  }

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
