import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { type User as AppUser } from "@shared/schema";
import {
  createTemporaryAppUser,
  getTemporaryTestUserByEmail,
  TEMPORARY_TEST_AUTH_STORAGE_KEY,
} from "@/lib/temporary-test-users";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/authToken";
import { clearTemporaryAuthState } from "@/lib/auth-session-state";
import { authUserToSyncPayload } from "@/lib/auth-user-sync";
import { isGoogleAuthEnabled, isSupabaseEnabled, supabase } from "@/lib/supabase";

type LogoutReason = "manual" | "timeout" | "session_expired";

interface AuthContextType {
  user: AppUser | null;
  authUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, userData: Partial<AppUser>) => Promise<{ needsEmailConfirmation: boolean }>;
  loginWithGoogle: () => Promise<void>;
  logout: (reason?: LogoutReason) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readTemporaryUserFromSession(): AppUser | null {
  if (typeof window === "undefined") return null;

  try {
    const rawUser = window.sessionStorage.getItem(TEMPORARY_TEST_AUTH_STORAGE_KEY);
    if (!rawUser) return null;

    const parsedUser = JSON.parse(rawUser) as AppUser;
    if (!parsedUser?.email || !parsedUser?.role) return null;

    return parsedUser;
  } catch {
    window.sessionStorage.removeItem(TEMPORARY_TEST_AUTH_STORAGE_KEY);
    return null;
  }
}

function writeTemporaryUserToSession(user: AppUser) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(TEMPORARY_TEST_AUTH_STORAGE_KEY, JSON.stringify(user));
}

function localMockUser(email: string): AppUser {
  let role = "user";
  const lowerEmail = email.toLowerCase();
  if (lowerEmail.includes("admin")) role = "admin";
  else if (lowerEmail.includes("ca")) role = "ca";
  else if (lowerEmail.includes("team")) role = "team_member";

  return {
    id: "mock_id_" + role,
    email: email || "local@example.com",
    firstName: "Test",
    lastName: role.toUpperCase(),
    role,
    status: "active",
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as AppUser;
}

function appUserFromAuthUser(authUser: SupabaseUser): AppUser {
  const syncPayload = authUserToSyncPayload(authUser);
  const metadataRole =
    authUser.app_metadata?.role ||
    authUser.user_metadata?.role ||
    authUser.user_metadata?.userRole ||
    "user";

  return {
    id: authUser.id,
    email: authUser.email || syncPayload.email || "",
    firstName: syncPayload.firstName || "User",
    lastName: syncPayload.lastName || "",
    phoneNumber: syncPayload.phoneNumber || null,
    role: metadataRole,
    status: "active",
    isVerified: Boolean(authUser.email_confirmed_at || authUser.confirmed_at),
    createdAt: new Date(authUser.created_at || Date.now()),
    updatedAt: new Date(),
  } as AppUser;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error(message)), timeoutMs);

    promise
      .then(resolve)
      .catch(reject)
      .finally(() => window.clearTimeout(timeout));
  });
}

async function fetchAppUser(token: string, authUser?: SupabaseUser | null) {
  if (authUser?.email) {
    await fetch("/api/v1/auth/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(authUserToSyncPayload(authUser)),
    }).catch(() => null);
  }

  const response = await fetch("/api/v1/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Unable to load your MyeCA profile.");
  }

  const data = await response.json();
  return data.user as AppUser;
}

async function fetchAppUserOrFallback(token: string, authUser?: SupabaseUser | null) {
  try {
    return await withTimeout(
      fetchAppUser(token, authUser),
      8000,
      "Profile sync timed out.",
    );
  } catch (error) {
    console.error("Auth profile sync failed:", error);
    if (authUser) {
      return appUserFromAuthUser(authUser);
    }
    throw error;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [appUser, setAppUser] = useState<AppUser | null>(() => readTemporaryUserFromSession());
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async (nextAuthUser?: SupabaseUser | null) => {
    const temporaryUser = readTemporaryUserFromSession();
    if (temporaryUser) {
      setAppUser(temporaryUser);
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    if (!isSupabaseEnabled) {
      setAppUser(null);
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      setAppUser(null);
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    const { data } = await supabase.auth.getUser(token);
    const resolvedAuthUser = nextAuthUser ?? data.user ?? null;
    setAuthUser(resolvedAuthUser);

    if (resolvedAuthUser) {
      setAppUser(appUserFromAuthUser(resolvedAuthUser));
    }

    setAppUser(await fetchAppUserOrFallback(token, resolvedAuthUser));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;

    refreshUser().catch((error) => {
      if (!active) return;
      console.error("Auth initialization failed:", error);
      setAppUser(null);
      setAuthUser(null);
      setIsLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setIsLoading(true);

      const temporaryUser = readTemporaryUserFromSession();
      if (temporaryUser) {
        setAppUser(temporaryUser);
        setAuthUser(null);
        setIsLoading(false);
        return;
      }

      if (!session?.access_token) {
        setAppUser(null);
        setAuthUser(null);
        setIsLoading(false);
        return;
      }

      setAuthToken(session.access_token);
      setAuthUser(session.user);
      if (session.user) {
        setAppUser(appUserFromAuthUser(session.user));
      }

      fetchAppUserOrFallback(session.access_token, session.user)
        .then((user) => {
          if (!active) return;
          setAuthUser(session.user);
          setAppUser(user);
        })
        .catch((error) => {
          if (!active) return;
          console.error("Auth profile sync failed:", error);
          setAuthUser(session.user);
          setAppUser(session.user ? appUserFromAuthUser(session.user) : null);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [refreshUser]);

  const login = async (email: string, password?: string) => {
    const temporaryTestUser = getTemporaryTestUserByEmail(email);
    if (temporaryTestUser) {
      const user = createTemporaryAppUser(temporaryTestUser);
      writeTemporaryUserToSession(user);
      setAuthToken(temporaryTestUser.token);
      setAuthUser(null);
      setAppUser(user);
      setIsLoading(false);
      return;
    }

    clearTemporaryAuthState();
    clearAuthToken();
    setIsLoading(true);

    if (!isSupabaseEnabled) {
      const user = localMockUser(email);
      writeTemporaryUserToSession(user);
      setAppUser(user);
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password ?? "",
      });

      if (error) {
        throw error;
      }
      if (!data.session?.access_token) throw new Error("Supabase did not return a session.");

      setAuthToken(data.session.access_token);
      setAuthUser(data.user);
      if (data.user) {
        setAppUser(appUserFromAuthUser(data.user));
      }

      setAppUser(await fetchAppUserOrFallback(data.session.access_token, data.user));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, userData: Partial<AppUser>) => {
    clearTemporaryAuthState();
    clearAuthToken();
    setAuthUser(null);
    setAppUser(null);
    setIsLoading(true);

    if (!isSupabaseEnabled) {
      const user = localMockUser(email);
      writeTemporaryUserToSession(user);
      setAppUser(user);
      setIsLoading(false);
      return { needsEmailConfirmation: false };
    }

    try {
      const redirectTo = `${window.location.origin}/auth/login`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
          },
        },
      });

      if (error) throw error;

      if (data.session?.access_token) {
        setAuthToken(data.session.access_token);
        setAuthUser(data.user);
        if (data.user) {
          setAppUser(appUserFromAuthUser(data.user));
        }

        setAppUser(await fetchAppUserOrFallback(data.session.access_token, data.user));
        return { needsEmailConfirmation: false };
      }

      return { needsEmailConfirmation: true };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!isGoogleAuthEnabled) {
      throw new Error("Google sign in is not enabled for this project yet. Use email and password to continue.");
    }

    clearTemporaryAuthState();
    clearAuthToken();
    setAuthUser(null);
    setAppUser(null);

    if (!isSupabaseEnabled) {
      await login("user@gmail.com", "local_mock");
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) throw error;
  };

  const logout = async (reason: LogoutReason = "manual") => {
    const token = await getAuthToken();
    if (token) {
      await fetch("/api/v1/auth/logout-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ reason }),
      }).catch(() => null);
    }

    clearTemporaryAuthState();
    clearAuthToken();
    if (isSupabaseEnabled) {
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setAppUser(null);
  };

  const sendPasswordReset = async (email: string) => {
    if (!isSupabaseEnabled) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login?reason=session_expired`,
    });
    if (error) throw error;
  };

  const sendEmailVerification = async () => {
    if (!isSupabaseEnabled || !appUser?.email) return;
    const { error } = await supabase.auth.resend({ type: "signup", email: appUser.email });
    if (error) throw error;
  };

  const deleteAccount = async () => {
    throw new Error("Account deletion must be requested through support.");
  };

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        authUser,
        isLoading,
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
  register: async () => ({ needsEmailConfirmation: false }),
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
