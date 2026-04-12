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
  const clerk = useClerk();
  const { getToken, isLoaded: authLoaded, isSignedIn } = useClerkAuth();
  const { signIn, setActive: setSignInActive, isLoaded: signInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: signUpLoaded } = useSignUp();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(true);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(WARNING_COUNTDOWN_SECONDS);
  const warningTimerRef = useRef<number | null>(null);
  const logoutTimerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const lastActivityAtRef = useRef(Date.now());
  const warningVisibleRef = useRef(false);
  const logoutInProgressRef = useRef(false);

  const clearSessionTimers = useCallback(() => {
    if (warningTimerRef.current) window.clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) window.clearTimeout(logoutTimerRef.current);
    if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current);
    warningTimerRef.current = null;
    logoutTimerRef.current = null;
    countdownTimerRef.current = null;
  }, []);

  const postLogoutEvent = useCallback(
    async (reason: LogoutReason) => {
      try {
        const token = await getToken();
        await fetch("/api/v1/auth/logout-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ reason }),
          keepalive: true,
        });
      } catch (error) {
        console.warn("[AUTH] Could not audit logout event:", error);
      }
    },
    [getToken],
  );

  const broadcastLogout = useCallback((reason: LogoutReason) => {
    try {
      const channel = new BroadcastChannel(SESSION_CHANNEL);
      channel.postMessage({ type: "LOGOUT", reason });
      channel.close();
    } catch {
      window.localStorage.setItem(
        SESSION_CHANNEL,
        JSON.stringify({ type: "LOGOUT", reason, ts: Date.now() }),
      );
    }
  }, []);

  const performLogout = useCallback(
    async (reason: LogoutReason = "manual", broadcast = true) => {
      if (logoutInProgressRef.current) return;
      logoutInProgressRef.current = true;
      clearSessionTimers();
      warningVisibleRef.current = false;
      setShowTimeoutWarning(false);

      const email = clerkUser?.primaryEmailAddress?.emailAddress;
      await postLogoutEvent(reason);

      try {
        await clerk.signOut();
      } finally {
        clearAuthToken();
        setAppUser(null);
        await logAuditEvent({
          action: reason === "timeout" ? "logout_timeout" : "logout_success",
          category: "authentication",
          metadata: { email, reason },
        });
        if (broadcast) broadcastLogout(reason);
        logoutInProgressRef.current = false;
        const reasonParam = reason === "manual" ? "" : `?reason=${encodeURIComponent(reason)}`;
        window.location.href = `/auth/login${reasonParam}`;
      }
    },
    [broadcastLogout, clearSessionTimers, clerk, clerkUser?.primaryEmailAddress?.emailAddress, postLogoutEvent],
  );

  const startSessionTimers = useCallback(
    (refreshToken = false) => {
      clearSessionTimers();
      if (!isSignedIn) return;

      if (refreshToken) {
        getToken()
          .then((token) => {
            if (token) setAuthToken(token);
          })
          .catch((error) => console.warn("[AUTH] Token refresh failed:", error));
      }

      lastActivityAtRef.current = Date.now();
      warningVisibleRef.current = false;
      setShowTimeoutWarning(false);
      setCountdownSeconds(WARNING_COUNTDOWN_SECONDS);

      warningTimerRef.current = window.setTimeout(() => {
        warningVisibleRef.current = true;
        setCountdownSeconds(WARNING_COUNTDOWN_SECONDS);
        setShowTimeoutWarning(true);
        countdownTimerRef.current = window.setInterval(() => {
          setCountdownSeconds((value) => Math.max(0, value - 1));
        }, 1000);
      }, IDLE_WARNING_MS);

      logoutTimerRef.current = window.setTimeout(() => {
        void performLogout("timeout");
      }, IDLE_TIMEOUT_MS);
    },
    [clearSessionTimers, getToken, isSignedIn, performLogout],
  );

  useEffect(() => {
    let cancelled = false;

    const syncUser = async () => {
      if (!authLoaded || !userLoaded) return;

      if (!isSignedIn || !clerkUser) {
        clearAuthToken();
        setAppUser(null);
        setIsSyncing(false);
        clearSessionTimers();
        return;
      }

      setIsSyncing(true);
      try {
        const token = await getToken();
        if (token) {
          setAuthToken(token);
        }

        const response = await fetch("/api/v1/auth/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            email: clerkUser.primaryEmailAddress?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            phoneNumber: clerkUser.primaryPhoneNumber?.phoneNumber,
          }),
        });

        if (!response.ok) {
          throw new Error("Unable to sync Clerk profile");
        }

        const data = await response.json();
        if (!cancelled) {
          setAppUser(normalizeUser(data.user || data, clerkUser));
        }
      } catch (error) {
        console.error("Error syncing Clerk profile:", error);
        if (!cancelled) {
          setAppUser(normalizeUser(null, clerkUser));
        }
      } finally {
        if (!cancelled) setIsSyncing(false);
      }
    };

    syncUser();
    const interval = window.setInterval(syncUser, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [authLoaded, userLoaded, isSignedIn, clerkUser?.id, getToken]);

  useEffect(() => {
    if (!authLoaded || !userLoaded || !isSignedIn) {
      clearSessionTimers();
      return;
    }

    startSessionTimers(false);
    const activityEvents: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];
    const onActivity = () => {
      if (warningVisibleRef.current) return;
      const now = Date.now();
      if (now - lastActivityAtRef.current < ACTIVITY_THROTTLE_MS) return;
      startSessionTimers(false);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") onActivity();
    };

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, onActivity, { passive: true });
    });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, onActivity);
      });
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearSessionTimers();
    };
  }, [authLoaded, clearSessionTimers, isSignedIn, startSessionTimers, userLoaded]);

  useEffect(() => {
    const handleMessage = (message: MessageEvent) => {
      if (message.data?.type !== "LOGOUT") return;
      void performLogout(message.data.reason || "session_expired", false);
    };

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(SESSION_CHANNEL);
      channel.addEventListener("message", handleMessage);
    } catch {}

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== SESSION_CHANNEL || !event.newValue) return;
      try {
        const payload = JSON.parse(event.newValue);
        if (payload?.type === "LOGOUT") {
          void performLogout(payload.reason || "session_expired", false);
        }
      } catch {}
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      channel?.removeEventListener("message", handleMessage);
      channel?.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [performLogout]);

  const staySignedIn = useCallback(() => {
    startSessionTimers(true);
  }, [startSessionTimers]);

  const login = async (email: string, password: string) => {
    if (!signInLoaded || !signIn || !setSignInActive) {
      throw new Error("Authentication is still loading. Please try again.");
    }

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status !== "complete") {
        throw new Error("Additional verification is required. Please complete it in the Clerk flow.");
      }
      await setSignInActive({ session: result.createdSessionId });
      await logLogin(email);
    } catch (error: any) {
      await logAuditEvent({
        action: "login_failure",
        category: "authentication",
        metadata: { email, error: error?.errors?.[0]?.code || error?.message },
        status: "failure",
      });
      throw new Error(error?.errors?.[0]?.message || error?.message || "Failed to sign in.");
    }
  };

  const register = async (email: string, password: string, userData: Partial<AppUser>) => {
    if (!signUpLoaded || !signUp || !setSignUpActive) {
      throw new Error("Authentication is still loading. Please try again.");
    }

    const result = await signUp.create({
      emailAddress: email,
      password,
      firstName: userData.firstName || undefined,
      lastName: userData.lastName || undefined,
    });

    if (result.status === "complete") {
      await setSignUpActive({ session: result.createdSessionId });
      return;
    }

    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    throw new Error("Check your email for the verification code to finish creating your account.");
  };

  const loginWithGoogle = async () => {
    if (!signInLoaded || !signIn) {
      throw new Error("Authentication is still loading. Please try again.");
    }

    await signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/auth/callback",
      redirectUrlComplete: "/dashboard",
    });
  };

  const logout = async (reason: LogoutReason = "manual") => performLogout(reason);

  const sendPasswordReset = async (email: string) => {
    if (!signInLoaded || !signIn) {
      throw new Error("Authentication is still loading. Please try again.");
    }

    await signIn.create({ strategy: "reset_password_email_code", identifier: email });
  };

  const sendEmailVerification = async () => {
    const primaryEmail = clerkUser?.primaryEmailAddress as any;
    if (!primaryEmail?.prepareVerification) return;
    await primaryEmail.prepareVerification({ strategy: "email_code" });
  };

  const deleteAccount = async () => {
    if (!clerkUser) return;
    await (clerkUser as any).delete();
    clearAuthToken();
    setAppUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: appUser,
        authUser: clerkUser,
        isLoading: !authLoaded || !userLoaded || isSyncing,
        isAuthenticated: !!isSignedIn,
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
      <SessionTimeoutDialog
        open={showTimeoutWarning}
        countdownSeconds={countdownSeconds}
        onStaySignedIn={staySignedIn}
        onLogout={() => void performLogout("manual")}
      />
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
  login: async () => { throw new Error("Auth service unavailable"); },
  register: async () => { throw new Error("Auth service unavailable"); },
  loginWithGoogle: async () => { throw new Error("Auth service unavailable"); },
  logout: async () => {},
  sendPasswordReset: async () => { throw new Error("Auth service unavailable"); },
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
    if (this.state.hasError) {
      return (
        <AuthContext.Provider value={FALLBACK_AUTH_VALUE}>
          {this.props.children}
        </AuthContext.Provider>
      );
    }
    return this.props.children;
  }
}

export function SafeAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthErrorBoundary>
      <AuthProvider>{children}</AuthProvider>
    </AuthErrorBoundary>
  );
}
