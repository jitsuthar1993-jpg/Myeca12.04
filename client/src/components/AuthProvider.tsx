import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { type User as AppUser } from "@shared/schema";
import {
  createTemporaryAppUser,
  getTemporaryTestUserByEmail,
  TEMPORARY_TEST_AUTH_STORAGE_KEY,
} from "@/lib/temporary-test-users";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/authToken";
import { isGoogleAuthEnabled, isSupabaseEnabled, supabase } from "@/lib/supabase";

type LogoutReason = "manual" | "timeout" | "session_expired";

interface AuthContextType {
  user: AppUser | null;
  authUser: SupabaseUser | null;
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

function clearTemporaryUserFromSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(TEMPORARY_TEST_AUTH_STORAGE_KEY);
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

async function fetchAppUser(token: string, authUser?: SupabaseUser | null) {
  if (authUser?.email) {
    await fetch("/api/v1/auth/sync", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        email: authUser.email,
        firstName:
          authUser.user_metadata?.firstName ||
          authUser.user_metadata?.first_name ||
          authUser.user_metadata?.name?.split(" ")?.[0] ||
          "User",
        lastName: authUser.user_metadata?.lastName || authUser.user_metadata?.last_name || "",
        phoneNumber: authUser.phone || null,
      }),
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
    setAppUser(await fetchAppUser(token, resolvedAuthUser));
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
      if (!session?.access_token) {
        setAppUser(null);
        setAuthUser(null);
        setIsLoading(false);
        return;
      }

      fetchAppUser(session.access_token, session.user)
        .then((user) => {
          if (!active) return;
          setAuthUser(session.user);
          setAppUser(user);
        })
        .catch((error) => {
          if (!active) return;
          console.error("Auth profile sync failed:", error);
          setAppUser(null);
          setAuthUser(null);
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

    clearTemporaryUserFromSession();
    clearAuthToken();

    if (!isSupabaseEnabled) {
      setAppUser(localMockUser(email));
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: password ?? "",
    });

    if (error) throw error;
    if (!data.session?.access_token) throw new Error("Supabase did not return a session.");

    setAuthUser(data.user);
    setAppUser(await fetchAppUser(data.session.access_token, data.user));
  };

  const register = async (email: string, password: string, userData: Partial<AppUser>) => {
    if (!isSupabaseEnabled) {
      await login(email, password);
      return;
    }

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
      setAuthUser(data.user);
      setAppUser(await fetchAppUser(data.session.access_token, data.user));
    }
  };

  const loginWithGoogle = async () => {
    if (!isGoogleAuthEnabled) {
      throw new Error("Google sign in is not enabled for this project yet. Use email and password to continue.");
    }

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

    clearTemporaryUserFromSession();
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
