import { Request, Response, NextFunction } from "express";
import { requireAuth as clerkRequireAuth, getAuth } from "@clerk/express";

export interface AuthRequest extends Request {
  user?: any;
  auth?: { userId: string };
}

export const authenticateToken = clerkRequireAuth();

export const requireAuth = authenticateToken;

// For role-based access, we would need to check the local DB.
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    clerkRequireAuth()(req, res, async (err?: any) => {
      if (err) return next(err);
      
      const auth = getAuth(req);
      if (!auth || !auth.userId) return res.status(401).json({ error: "Not authenticated" });
      
      try {
        const localUsers = await db.select().from(users).where(eq(users.id, auth.userId));
        if (localUsers.length === 0) {
          return res.status(404).json({ error: "User profile not found in database" });
        }
        
        const localUser = localUsers[0];
        if (!allowedRoles.includes(localUser.role)) {
          return res.status(403).json({ error: `Access denied. Role(s) ${allowedRoles.join(', ')} required.` });
        }
        
        (req as AuthRequest).user = localUser; 
        next();
      } catch (error) {
        return res.status(500).json({ error: "Role verification failed" });
      }
    });
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(['super_admin', 'admin', 'editor', 'author'])(req, res, next);
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(['super_admin'])(req, res, next);
}