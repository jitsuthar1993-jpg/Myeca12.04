import type { User } from "../shared/schema.js";

// Extend Express Request interface to include user and session
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: {
        csrfToken?: string;
        userId?: number;
        [key: string]: any;
      };
    }
  }
}

// Auth request interface
export interface AuthRequest extends Express.Request {
  user: User;
}

// Session configuration
export interface SessionConfig {
  secret: string;
  resave: boolean;
  saveUninitialized: boolean;
  cookie: {
    secure: boolean;
    httpOnly: boolean;
    maxAge: number;
    sameSite: 'strict' | 'lax' | 'none';
  };
}
