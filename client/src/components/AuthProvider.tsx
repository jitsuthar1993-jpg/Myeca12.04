import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import {
  useAuth as useClerkAuth,
  useClerk,
  useSignIn,
  useSignUp,
  useUser,
} from "@clerk/clerk-react";
import { type User as AppUser } from "@shared/schema";
import { logAuditEvent, logLogin } from "@/lib/audit";
import { SessionTimeoutDialog } from "@/components/auth/SessionTimeoutDialog";
import { clearAuthToken, setAuthToken } from "@/lib/authToken";

type ClerkUserCompat = ReturnType<typeof useUser>["user"];
type LogoutReason = "manual" | "timeout" | "session_expired";

const SESSION_CHANNEL = "session_sync_channel";
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const IDLE_WARNING_MS = 14 * 60 * 1000;
const WARNING_COUNTDOWN_SECONDS = 60;
const ACTIVITY_THROTTLE_MS = 30 * 1000;

interface AuthContextType {
  user: AppUser | null;
  authUser: ClerkUserCompat | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<AppUser>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: (reason?: LogoutReason) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUser(payload: any, fallback: ClerkUserCompat | null): AppUser {
  const email = fallback?.primaryEmailAddress?.emailAddress || payload?.email || "";
  const firstName = payload?.firstName || fallback?.firstName || "";
  const lastName = payload?.lastName || fallback?.lastName || "";

  return {
    id: payload?.id || fallback?.id || "",
    email,
    firstName,
    lastName,
    role: payload?.role || "user",
    status: payload?.status || "active",
    isVerified: payload?.isVerified ?? !!fallback?.primaryEmailAddress?.verification,
    createdAt: payload?.createdAt ? new Date(payload.createdAt) : new Date(),
    updatedAt: payload?.updatedAt ? new Date(payload.updatedAt) : new Date(),
    phoneNumber: payload?.phoneNumber || null,
    assignedCaId: payload?.assignedCaId || null,
    assignedCaName: payload?.assignedCaName || null,
    assignedCaEmail: payload?.assignedCaEmail || null,
    approvedBy: payload?.approvedBy || null,
    approvedAt: payload?.approvedAt ? new Date(payload.approvedAt) : null,
    rejectedReason: payload?.rejectedReason || null,
  } as AppUser;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mocked AuthProvider for local development with selectable roles
  const [appUser, setAppUser] = useState<AppUser | null>(null);

  const login = async (email: string, password?: string) => {
    // Simple mock logic: if email contains "admin", make them admin, etc.
    let role = "user";
    const lowerEmail = email.toLowerCase();
    if (lowerEmail.includes("admin")) role = "admin";
    else if (lowerEmail.includes("ca")) role = "ca";
    else if (lowerEmail.includes("team")) role = "team_member";

    setAppUser({
      id: "mock_id_" + role,
      email: email || "local@example.com",
      firstName: "Test",
      lastName: role.toUpperCase(),
      role: role,
      status: "active",
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as AppUser);
  };

  const register = async () => {};
  const loginWithGoogle = async () => { await login("user@gmail.com"); };
  const logout = async () => { 
    setAppUser(null);
    window.location.href = "/"; 
  };
  const sendPasswordReset = async () => {};
  const sendEmailVerification = async () => {};
  const deleteAccount = async () => {};

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        authUser: null,
        isLoading: false,
        isAuthenticated: !!appUser,
        login,
        register,
        loginWithGoogle,
        logout,
        sendPasswordReset,
        sendEmailVerification,
        deleteAccount,
        role: appUser?.role || "user",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

const FALLBACK_AUTH_VALUE: AuthContextType = {
  user: null,
  authUser: null,
  isLoading: false,
  isAuthenticated: true,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  sendPasswordReset: async () => {},
  sendEmailVerification: async () => {},
  deleteAccount: async () => {},
  role: "admin",
};

class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error) {
    console.error("AuthProvider crashed:", error);
  }
  render() {
    return (
      <AuthContext.Provider value={FALLBACK_AUTH_VALUE}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}

export function SafeAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthErrorBoundary>
      <AuthProvider>{children}</AuthProvider>
    </AuthErrorBoundary>
  );
}
