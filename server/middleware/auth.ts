import { Request, Response, NextFunction } from "express";
import { adminAuth, adminDb } from "../firebase-admin";
import { getCachedUser, setCachedUser } from "../utils/user-cache";

export { getCachedUser, setCachedUser } from "../utils/user-cache";

export interface AuthRequest extends Request {
  user?: any;
  auth?: {
    userId: string;
    email?: string;
  };
}

/**
 * Verifies the Firebase ID token in the Authorization header
 */
async function verifyToken(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error("[AUTH] Token verification failed:", error);
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const auth = await verifyToken(req);
  
  if (!auth) {
    return res.status(401).json({ error: "Authentication required" });
  }

  (req as AuthRequest).auth = auth;
  next();
}

export const authenticateToken = requireAuth;

export function requireRole(allowedRoles: string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const auth = await verifyToken(req);

    if (!auth) {
      return res.status(401).json({ error: "Authentication required" });
    }
    
    (req as AuthRequest).auth = auth;

    try {
      // Check in-memory cache first to avoid a Firestore read on every request
      let localUser = getCachedUser(auth.userId);

      if (!localUser) {
        let userDoc = await adminDb.collection("users").doc(auth.userId).get();

        if (!userDoc.exists) {
          // Auto-create user profile if it doesn't exist
          const usersSnapshot = await adminDb.collection("users").limit(1).get();
          const isFirstUser = usersSnapshot.empty;

          let role = "user";
          const userEmail = auth.email?.toLowerCase().trim();
          if (userEmail === "cajsuthar@gmail.com") {
            role = "admin";
          } else if (userEmail === "jitender.kingofcage.suthar@gmail.com") {
            role = "team_member";
          } else if (isFirstUser) {
            role = "admin";
          }

          const newUser = {
            id: auth.userId,
            email: auth.email || null,
            firstName: "User",
            lastName: "",
            role: role,
            status: "active",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await adminDb.collection("users").doc(auth.userId).set(newUser);
          console.log(`[AUTH] Auto-created profile for: ${auth.userId} (role: ${role})`);

          // Re-fetch to ensure we have correct data
          userDoc = await adminDb.collection("users").doc(auth.userId).get();
        }

        localUser = userDoc.exists ? userDoc.data() : null;

        const userEmail = auth.email?.toLowerCase().trim();

        // Hardcoded overrides for specific users to ensure they always have access
        if (userEmail === "cajsuthar@gmail.com") {
          if (!localUser || localUser.role !== 'admin') {
            const update = { role: 'admin', updatedAt: new Date() };
            await adminDb.collection("users").doc(auth.userId).set(update, { merge: true });
            localUser = { ...(localUser || {}), ...update };
          }
        } else if (userEmail === "jitender.kingofcage.suthar@gmail.com") {
          if (!localUser || localUser.role !== 'team_member') {
            const update = { role: 'team_member', updatedAt: new Date() };
            await adminDb.collection("users").doc(auth.userId).set(update, { merge: true });
            localUser = { ...(localUser || {}), ...update };
          }
        }

        if (localUser) {
          setCachedUser(auth.userId, localUser);
        }
      }

      if (!localUser || !allowedRoles.includes(localUser.role)) {
        console.warn(`[AUTH] Access denied for ${auth.email}: Required ${allowedRoles.join(', ')}, found ${localUser?.role}`);
        return res.status(403).json({ error: `Access denied. Required role(s): ${allowedRoles.join(', ')}.` });
      }

      (req as AuthRequest).user = { id: auth.userId, ...localUser };
      next();
    } catch (error) {
      console.error("[AUTH] Role verification failed:", error);
      return res.status(500).json({ error: "Role verification failed" });
    }
  };
}

// Role-specific middleware helpers
export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin'])(req, res, next);
}

export async function requireTeamMember(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin', 'team_member'])(req, res, next);
}

export async function requireCA(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin', 'ca'])(req, res, next);
}

export async function requireAnyAuth(req: Request, res: Response, next: NextFunction) {
  return requireRole(['admin', 'team_member', 'ca', 'user'])(req, res, next);
}