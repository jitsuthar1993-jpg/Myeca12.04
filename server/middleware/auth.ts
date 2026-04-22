import { getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";
import { findOrCreateUserProfile } from "../services/user-accounts.js";
import { safeError } from "../utils/error-response.js";
import { getCachedUser, setCachedUser } from "../utils/user-cache.js";

export { getCachedUser, setCachedUser } from "../utils/user-cache.js";

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
  try {
    const auth = getAuth(req);
    if (auth?.userId) {
      return {
        userId: auth.userId,
        email: extractEmail(auth.sessionClaims)
      };
    }
  } catch (error) {
    // Clerk middleware not properly configured or missing keys
  }

  // Strict local dev bypass ONLY if explicitly configured
  if (process.env.NODE_ENV !== "production" && process.env.ALLOW_MOCK_AUTH === "true") {
    return {
      userId: "mock_id",
      email: "local@example.com",
    };
  }

  return null;
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = readAuth(req);
  if (!auth) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  (req as AuthRequest).auth = auth;
  next();
}

export const authenticateToken = requireAuth;

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const auth = readAuth(req);
      if (!auth) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      let userData = getCachedUser(auth.userId);
      
      if (!userData) {
        const userDoc = await findOrCreateUserProfile(auth);
        if (!userDoc.exists) {
          return res.status(403).json({ error: "Access denied. Profile not found." });
        }
        userData = { id: userDoc.id, ...(userDoc.data() as any) };
        setCachedUser(auth.userId, userData);
      }

      const userRole = userData.role || "user";
      
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          error: "Access denied. Insufficient permissions.",
        });
      }

      (req as AuthRequest).auth = auth;
      (req as AuthRequest).user = userData;
      
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
  return requireRole(["superadmin", "admin"])(req, res, next);
}

export async function requireAnyAuth(req: Request, res: Response, next: NextFunction) {
  return requireRole(["superadmin", "admin", "team_member", "ca", "user"])(req, res, next);
}
