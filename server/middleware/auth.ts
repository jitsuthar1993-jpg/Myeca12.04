import { Request, Response, NextFunction } from "express";
import { findOrCreateUserProfile } from "../services/user-accounts.js";
import { safeError } from "../utils/error-response.js";
import { getCachedUser, setCachedUser } from "../utils/user-cache.js";
import { getTemporaryTestUserByToken } from "../../shared/temporary-test-users.js";
import { APP_ROLES, normalizeAppRole, type AppRole } from "../../shared/app-roles.js";
import { getSupabaseAuthClient } from "../lib/supabase.js";
import { getRequestId } from "./request-id.js";

export { getCachedUser, setCachedUser } from "../utils/user-cache.js";

export interface AuthRequest extends Request {
  user?: any;
  auth?: {
    userId: string;
    email?: string;
  };
}

async function readAuth(req: Request) {
  const authorization = req.get("authorization") || "";
  const bearerToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1];

  if (bearerToken) {
    const temporaryUser = getTemporaryTestUserByToken(bearerToken);
    if (temporaryUser && process.env.NODE_ENV !== "production") {
      return {
        userId: temporaryUser.id,
        email: temporaryUser.email,
      };
    }

    const { data, error } = await getSupabaseAuthClient().auth.getUser(bearerToken);
    if (!error && data.user) {
      return {
        userId: data.user.id,
        email: data.user.email ?? undefined,
      };
    }
  }

  if (process.env.NODE_ENV !== "production" && process.env.ALLOW_MOCK_AUTH === "true") {
    return {
      userId: "local_test_user",
      email: "local@example.com",
    };
  }

  return null;
}

async function attachAuthUser(req: Request, auth: { userId: string; email?: string }) {
  (req as AuthRequest).auth = auth;

  let userData = getCachedUser(auth.userId);
  if (!userData) {
    const userDoc = await findOrCreateUserProfile(auth);
    if (userDoc.exists) {
      userData = { id: userDoc.id, ...(userDoc.data() as any) };
      setCachedUser(auth.userId, userData);
    }
  }

  if (userData) {
    (req as AuthRequest).user = userData;
  }

  return userData;
}

function authError(res: Response, status: number, error: string) {
  return res.status(status).json({
    success: false,
    error,
    requestId: getRequestId(undefined, res),
  });
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = await readAuth(req);
    if (auth) {
      await attachAuthUser(req, auth);
    }
    next();
  } catch {
    next();
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = await readAuth(req);
    if (!auth) {
      return authError(res, 401, "Unauthorized");
    }

    await attachAuthUser(req, auth);
    next();
  } catch (error) {
    return safeError(res, error, "Authentication failed");
  }
}

export const authenticateToken = requireAuth;

export function requireRole(allowedRoles: readonly AppRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = await readAuth(req);
      if (!auth) {
        return authError(res, 401, "Unauthorized");
      }

      const userData = await attachAuthUser(req, auth);
      if (!userData) {
        return authError(res, 403, "Access denied. Profile not found.");
      }

      const userRole = normalizeAppRole(userData.role);

      if (!allowedRoles.includes(userRole)) {
        return authError(res, 403, "Access denied. Insufficient permissions.");
      }

      next();
    } catch (error) {
      return safeError(res, error, "Authorization failed");
    }
  };
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(["admin"])(req, res, next);
}

export async function requireTeamMember(req: Request, res: Response, next: NextFunction) {
  return requireRole(["admin", "team_member"])(req, res, next);
}

export async function requireCA(req: Request, res: Response, next: NextFunction) {
  return requireRole(["admin", "ca"])(req, res, next);
}

export async function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(["admin"])(req, res, next);
}

export async function requireAnyAuth(req: Request, res: Response, next: NextFunction) {
  return requireRole(APP_ROLES)(req, res, next);
}
