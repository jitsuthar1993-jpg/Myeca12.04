import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AlertCircle, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { clearAuthToken, setAuthToken } from "@/lib/authToken";
import { clearTemporaryAuthState } from "@/lib/auth-session-state";
import {
  getAuthCallbackCode,
  getAuthCallbackError,
  getAuthCallbackTarget,
  getAuthCallbackTokens,
} from "@/lib/auth-confirmation";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";

type CallbackState = {
  status: "loading" | "success" | "error";
  title: string;
  message: string;
  target?: string;
};

export default function AuthCallbackPage() {
  const [state, setState] = useState<CallbackState>({
    status: "loading",
    title: "Confirming your email",
    message: "Please wait while Supabase verifies this sign-in link.",
  });

  useEffect(() => {
    let active = true;
    let redirectTimer: number | undefined;

    async function completeCallback() {
      const target = getAuthCallbackTarget(window.location.search, window.location.hash);
      clearTemporaryAuthState();
      clearAuthToken();

      if (!isSupabaseEnabled) {
        throw new Error("Authentication is not configured for this deployment.");
      }

      const callbackError = getAuthCallbackError(window.location.search, window.location.hash);
      if (callbackError) {
        throw new Error(callbackError);
      }

      const code = getAuthCallbackCode(window.location.search);
      const tokens = getAuthCallbackTokens(window.location.hash);
      let session = null;

      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) throw error;
        session = data.session;
      } else if (tokens.accessToken && tokens.refreshToken) {
        const { data, error } = await supabase.auth.setSession({
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
        });
        if (error) throw error;
        session = data.session;
      } else {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        session = data.session;
      }

      if (!session?.access_token) {
        throw new Error("Email confirmation finished, but no active session was returned. Sign in with your confirmed email to continue.");
      }

      setAuthToken(session.access_token);
      if (!active) return;

      setState({
        status: "success",
        title: "Email confirmed",
        message: "Your account is ready. Opening your MyeCA workspace now.",
        target,
      });

      redirectTimer = window.setTimeout(() => {
        window.location.replace(target);
      }, 700);
    }

    completeCallback().catch((error: any) => {
      if (!active) return;
      setState({
        status: "error",
        title: "Confirmation link needs attention",
        message: error?.message || "This confirmation link could not be completed. Request a fresh email and try again.",
      });
    });

    return () => {
      active = false;
      if (redirectTimer) window.clearTimeout(redirectTimer);
    };
  }, []);

  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  return (
    <AuthPageShell
      eyebrow="Email confirmation"
      title={state.title}
      description={state.message}
      panelTitle="Secure account"
      panelDescription="Confirmation links are handled by Supabase and then return you to your MyeCA workspace."
      panelItems={[
        { label: "Supabase email verified", icon: ShieldCheck },
        { label: "Secure session created", icon: CheckCircle2 },
        { label: "Workspace redirect", icon: ShieldCheck },
      ]}
      primaryLink={{
        href: "/auth/login",
        text: "Already confirmed?",
        label: "Sign in",
      }}
    >
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-[0_18px_45px_-34px_rgba(15,23,42,0.7)]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-blue-700 ring-1 ring-slate-200">
            {state.status === "loading" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-700" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-black text-slate-950">{state.title}</p>
            <p className="mt-1 leading-6 text-slate-600">{state.message}</p>
            {isSuccess && state.target ? (
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                Redirecting to {state.target}
              </p>
            ) : null}
          </div>
        </div>

        {isError ? (
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Button asChild variant="outline" className="h-10 rounded-lg">
              <Link href="/auth/register">Create account</Link>
            </Button>
            <Button asChild className="h-10 rounded-lg">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        ) : null}
      </div>
    </AuthPageShell>
  );
}
