import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { type User as AppUser } from "@shared/schema";
import { normalizeAppRole, type AppRole } from "@shared/app-roles";
import {
  normalizeCampaignAttribution,
  normalizeReferralCode,
  normalizeReferralService,
  type CampaignAttribution,
} from "@shared/campaign-attribution";
import {
  createTemporaryAppUser,
  getTemporaryTestUserByEmail,
  TEMPORARY_TEST_AUTH_STORAGE_KEY,
} from "@/lib/temporary-test-users";
import {
  clearAuthToken,
  getAuthToken,
  hasStoredSupabaseSession,
  setAuthToken,
} from "@/lib/authToken";
import { clearTemporaryAuthState } from "@/lib/auth-session-state";
import { shouldUseBlockingAuthLoading } from "@/lib/auth-transition";
import { authUserToSyncPayload } from "@/lib/auth-user-sync";
import {
  buildSignupConfirmationRedirectUrl,
  buildSignupConfirmationResendOptions,
} from "@/lib/auth-confirmation";
import { isSupabaseEnabled } from "@/lib/supabase-config";
import { allowLocalAuthFallbacks } from "@/utils/runtime-env";

type LogoutReason = "manual" | "timeout" | "session_expired";

type SignupTrackingMetadata = {
  campaignAttribution?: CampaignAttribution;
  referralCode?: string;
  referralService?: string;
};

interface AuthContextType {
  user: AppUser | null;
  authUser: SupabaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (
    email: string,
    password: string,
    userData: Partial<AppUser>,
    redirectPath?: string | null,
    tracking?: SignupTrackingMetadata,
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  resendSignupConfirmation: (email: string, redirectPath?: string | null) => Promise<void>;
  loginWithGoogle: (redirectPath?: string | null) => Promise<void>;
  logout: (reason?: LogoutReason) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  sendEmailVerification: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  role: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function getSupabaseClient() {
  const { supabase } = await import("@/lib/supabase");
  return supabase;
}

function readTemporaryUserFromSession(): AppUser | null {
  if (typeof window === "undefined") return null;
  if (!allowLocalAuthFallbacks()) {
    window.sessionStorage.removeItem(TEMPORARY_TEST_AUTH_STORAGE_KEY);
    return null;
  }

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

function localFallbackUser(email: string): AppUser {
  let role: AppRole = "user";
  const lowerEmail = email.toLowerCase();
  if (lowerEmail.includes("admin")) role = "admin";
  else if (lowerEmail.includes("ca")) role = "ca";
  else if (lowerEmail.includes("team")) role = "team_member";

  return {
    id: "local_test_" + role,
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
  const metadataRole = normalizeAppRole(
    authUser.app_metadata?.role ||
    authUser.user_metadata?.role ||
    authUser.user_metadata?.userRole ||
    "user",
  );

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

function logoutRedirectPath(reason: LogoutReason) {
  if (reason === "timeout") return "/auth/login?reason=timeout";
  if (reason === "session_expired") return "/auth/login?reason=session_expired";
  return "/";
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
  const appUserRef = useRef<AppUser | null>(appUser);

  const setResolvedAppUser = useCallback((user: AppUser | null) => {
    appUserRef.current = user;
    setAppUser(user);
  }, []);

  useEffect(() => {
    appUserRef.current = appUser;
  }, [appUser]);

  const refreshUser = useCallback(async (nextAuthUser?: SupabaseUser | null) => {
    const temporaryUser = readTemporaryUserFromSession();
    if (temporaryUser) {
      setResolvedAppUser(temporaryUser);
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    if (!isSupabaseEnabled) {
      setResolvedAppUser(null);
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    const token = await getAuthToken();
    if (!token) {
      setResolvedAppUser(null);
      setAuthUser(null);
      setIsLoading(false);
      return;
    }

    const supabase = await getSupabaseClient();
    const { data } = await supabase.auth.getUser(token);
    const resolvedAuthUser = nextAuthUser ?? data.user ?? null;
    setAuthUser(resolvedAuthUser);

    if (resolvedAuthUser) {
      setResolvedAppUser(appUserFromAuthUser(resolvedAuthUser));
    }

    setResolvedAppUser(await fetchAppUserOrFallback(token, resolvedAuthUser));
    setIsLoading(false);
  }, [setResolvedAppUser]);

  useEffect(() => {
    let active = true;

    refreshUser().catch((error) => {
      if (!active) return;
      console.error("Auth initialization failed:", error);
      setResolvedAppUser(null);
      setAuthUser(null);
      setIsLoading(false);
    });

    let unsubscribe: (() => void) | null = null;

    if (isSupabaseEnabled && hasStoredSupabaseSession()) {
      void getSupabaseClient()
        .then((supabase) => {
          if (!active) return;

          const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!active) return;
            const shouldBlock = shouldUseBlockingAuthLoading(
              _event,
              Boolean(appUserRef.current),
              Boolean(session?.access_token),
            );
            if (shouldBlock) {
              setIsLoading(true);
            }

            const temporaryUser = readTemporaryUserFromSession();
            if (temporaryUser) {
              setResolvedAppUser(temporaryUser);
              setAuthUser(null);
              setIsLoading(false);
              return;
            }

            if (!session?.access_token) {
              refreshUser(null).catch((error) => {
                if (!active) return;
                console.error("Auth session recovery failed:", error);
                setResolvedAppUser(null);
                setAuthUser(null);
                setIsLoading(false);
              });
              return;
            }

            setAuthToken(session.access_token);
            setAuthUser(session.user);
            if (session.user) {
              setResolvedAppUser(appUserFromAuthUser(session.user));
            }

            fetchAppUserOrFallback(session.access_token, session.user)
              .then((user) => {
                if (!active) return;
                setAuthUser(session.user);
                setResolvedAppUser(user);
              })
              .catch((error) => {
                if (!active) return;
                console.error("Auth profile sync failed:", error);
                setAuthUser(session.user);
                setResolvedAppUser(session.user ? appUserFromAuthUser(session.user) : null);
              })
              .finally(() => {
                if (active) setIsLoading(false);
              });
          });

          unsubscribe = () => data.subscription.unsubscribe();
        })
        .catch((error) => {
          if (!active) return;
          console.error("Auth subscription failed:", error);
        });
    }

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [refreshUser]);

  const login = async (email: string, password?: string) => {
    const temporaryTestUser = allowLocalAuthFallbacks() ? getTemporaryTestUserByEmail(email) : null;
    if (temporaryTestUser) {
      const user = createTemporaryAppUser(temporaryTestUser);
      writeTemporaryUserToSession(user);
      setAuthToken(temporaryTestUser.token);
      setAuthUser(null);
      setResolvedAppUser(user);
      setIsLoading(false);
      return user;
    }

    clearTemporaryAuthState();
    clearAuthToken();
    setIsLoading(true);

    if (!isSupabaseEnabled) {
      if (!allowLocalAuthFallbacks()) {
        throw new Error("Authentication is not configured for this deployment.");
      }

      const user = localFallbackUser(email);
      writeTemporaryUserToSession(user);
      setResolvedAppUser(user);
      setAuthUser(null);
      setIsLoading(false);
      return user;
    }

    try {
      const supabase = await getSupabaseClient();
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
        setResolvedAppUser(appUserFromAuthUser(data.user));
      }

      const user = await fetchAppUserOrFallback(data.session.access_token, data.user);
      setResolvedAppUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    userData: Partial<AppUser>,
    redirectPath?: string | null,
    tracking?: SignupTrackingMetadata,
  ) => {
    clearTemporaryAuthState();
    clearAuthToken();
    setAuthUser(null);
    setResolvedAppUser(null);
    setIsLoading(true);

    if (!isSupabaseEnabled) {
      if (!allowLocalAuthFallbacks()) {
        throw new Error("Authentication is not configured for this deployment.");
      }

      const user = localFallbackUser(email);
      writeTemporaryUserToSession(user);
      setResolvedAppUser(user);
      setIsLoading(false);
      return { needsEmailConfirmation: false };
    }

    try {
      const supabase = await getSupabaseClient();
      const redirectTo = buildSignupConfirmationRedirectUrl(redirectPath);
      const campaignAttribution = normalizeCampaignAttribution(tracking?.campaignAttribution);
      const referralCode = normalizeReferralCode(tracking?.referralCode);
      const referralService = normalizeReferralService(tracking?.referralService);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phoneNumber: userData.phoneNumber,
            ...(campaignAttribution ? { campaignAttribution } : {}),
            ...(referralCode ? { referralCode } : {}),
            ...(referralService ? { referralService } : {}),
          },
        },
      });

      if (error) throw error;

      if (data.session?.access_token) {
        setAuthToken(data.session.access_token);
        setAuthUser(data.user);
        if (data.user) {
          setResolvedAppUser(appUserFromAuthUser(data.user));
        }

        setResolvedAppUser(await fetchAppUserOrFallback(data.session.access_token, data.user));
        return { needsEmailConfirmation: false };
      }

      return { needsEmailConfirmation: true };
    } finally {
      setIsLoading(false);
    }
  };

  const resendSignupConfirmation = async (email: string, redirectPath?: string | null) => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) throw new Error("Enter your email address first.");
    if (!isSupabaseEnabled) return;

    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: buildSignupConfirmationResendOptions(redirectPath),
    });
    if (error) throw error;
  };

  const loginWithGoogle = async (redirectPath?: string | null) => {
    clearTemporaryAuthState();
    clearAuthToken();
    setAuthUser(null);
    setResolvedAppUser(null);

    if (!isSupabaseEnabled) {
      if (!allowLocalAuthFallbacks()) {
        throw new Error("Authentication is not configured for this deployment.");
      }

      await login("user@gmail.com", "local_test");
      return;
    }

    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: buildSignupConfirmationRedirectUrl(redirectPath),
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
      const supabase = await getSupabaseClient();
      await supabase.auth.signOut();
    }
    setAuthUser(null);
    setResolvedAppUser(null);

    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", logoutRedirectPath(reason));
      window.dispatchEvent(new Event("popstate"));
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!isSupabaseEnabled) return;

    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login?reason=session_expired`,
    });
    if (error) throw error;
  };

  const sendEmailVerification = async () => {
    if (!isSupabaseEnabled || !appUser?.email) return;
    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: appUser.email,
      options: buildSignupConfirmationResendOptions("/dashboard"),
    });
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
        resendSignupConfirmation,
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
  login: async () => {
    throw new Error("Authentication is unavailable.");
  },
  register: async () => ({ needsEmailConfirmation: false }),
  resendSignupConfirmation: async () => {},
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
