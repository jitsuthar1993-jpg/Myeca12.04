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
  // Authentication temporarily disabled locally
  return {
    userId: "mock_id",
    email: "local@example.com",
  };
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  (req as AuthRequest).auth = {
    userId: "mock_id",
    email: "local@example.com",
  };
  next();
}

export const authenticateToken = requireAuth;

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = {
      userId: "mock_id",
      email: "local@example.com",
    };

    (req as AuthRequest).auth = auth;
    (req as AuthRequest).user = {
      id: auth.userId,
      email: auth.email,
      role: "admin",
      firstName: "Jitendra",
      lastName: "Suthar",
    };
    
    next();
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
