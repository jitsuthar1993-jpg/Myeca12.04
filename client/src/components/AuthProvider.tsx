import React, { createContext, useContext, useState } from "react";
import { type User as AppUser } from "@shared/schema";

type LogoutReason = "manual" | "timeout" | "session_expired";

interface AuthContextType {
  user: AppUser | null;
  authUser: null;
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
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  sendPasswordReset: async () => {},
  sendEmailVerification: async () => {},
  deleteAccount: async () => {},
  role: "user",
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
