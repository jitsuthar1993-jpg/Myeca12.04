import { Request, Response, NextFunction } from "express";
import { findOrCreateUserProfile } from "../services/user-accounts.js";
import { safeError } from "../utils/error-response.js";
import { getCachedUser, setCachedUser } from "../utils/user-cache.js";
import { getTemporaryTestUserByToken, temporaryTestAuthEnabled } from "../../shared/temporary-test-users.js";
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
    if (temporaryUser && temporaryTestAuthEnabled()) {
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

/**
 * Status values that block access. A user record without a status field is treated as
 * active for backwards compatibility with older records that predate the status enum.
 * Mirrors the enum in admin.ts updateUserRoleSchema.
 */
const BLOCKED_USER_STATUSES = new Set(["inactive", "suspended", "rejected"]);

function isUserBlocked(userData: { status?: unknown } | null | undefined): boolean {
  if (!userData) return false;
  const normalized = String(userData.status || "active").toLowerCase();
  return BLOCKED_USER_STATUSES.has(normalized);
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const auth = await readAuth(req);
    if (auth) {
      await attachAuthUser(req, auth);
    }
    next();
  } catch (error) {
    // optionalAuth is meant to continue anonymously when auth resolution fails, but
    // silently swallowing every error hides genuine bugs (Supabase outages, DB write
    // failures during findOrCreateUserProfile). Log so they surface in observability
    // without breaking the request.
    console.warn("optionalAuth: continuing anonymously after error", {
      path: req.path,
      message: error instanceof Error ? error.message : String(error),
    });
    next();
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = await readAuth(req);
    if (!auth) {
      return authError(res, 401, "Unauthorized");
    }

    const userData = await attachAuthUser(req, auth);
    if (isUserBlocked(userData)) {
      return authError(res, 403, "Your account is not active. Please contact support.");
    }
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

      if (isUserBlocked(userData)) {
        return authError(res, 403, "Your account is not active. Please contact support.");
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

export async function requireAnyAuth(req: Request, res: Response, next: NextFunction) {
  return requireRole(APP_ROLES)(req, res, next);
}
