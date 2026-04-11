import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { findOrCreateUserProfile } from "../services/user-accounts";
import { safeError } from "../utils/error-response";
import { getCachedUser, setCachedUser } from "../utils/user-cache";

export { getCachedUser, setCachedUser } from "../utils/user-cache";

export interface AuthRequest extends Request {
  user?: any;
  auth?: {
    userId: string;
    email?: string;
  };
}

function extractEmail(sessionClaims: unknown) {
  const claims = sessionClaims as Record<string, any> | null | undefined;
  return (
    claims?.email ??
    claims?.primary_email_address ??
    claims?.primaryEmailAddress ??
    claims?.email_address ??
    undefined
  );
}

function readAuth(req: Request) {
  const auth = getAuth(req);
  if (!auth.userId) return null;

  return {
    userId: auth.userId,
    email: extractEmail(auth.sessionClaims),
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = readAuth(req);

  if (!auth) {
    return res.status(401).json({ error: "Authentication required" });
  }

  (req as AuthRequest).auth = auth;
  next();
}

export const authenticateToken = requireAuth;

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = readAuth(req);

    if (!auth) {
      return res.status(401).json({ error: "Authentication required" });
    }

    (req as AuthRequest).auth = auth;

    try {
      let localUser = getCachedUser(auth.userId);

      if (!localUser) {
        const userDoc = await findOrCreateUserProfile(auth);
        localUser = userDoc.exists ? userDoc.data() : null;

        if (localUser) {
          setCachedUser(auth.userId, localUser);
        }
      }

      if (!localUser || !allowedRoles.includes(localUser.role)) {
        console.warn(
          `[AUTH] Access denied for ${auth.email ?? auth.userId}: Required ${allowedRoles.join(", ")}, found ${localUser?.role}`,
        );
        return res
          .status(403)
          .json({ error: `Access denied. Required role(s): ${allowedRoles.join(", ")}.` });
      }

      (req as AuthRequest).user = { id: auth.userId, ...localUser };
      next();
    } catch (error) {
      return safeError(res, error, "Role verification failed");
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
  return requireRole(["superadmin", "admin"])(req, res, next);
}

export async function requireAnyAuth(req: Request, res: Response, next: NextFunction) {
  return requireRole(["superadmin", "admin", "team_member", "ca", "user"])(req, res, next);
}
