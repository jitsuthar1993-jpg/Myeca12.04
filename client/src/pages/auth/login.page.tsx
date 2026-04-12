import { SignIn } from "@clerk/clerk-react";
import { Link } from "wouter";
import { Bot, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/logo";

const reasonCopy: Record<string, { title: string; message: string }> = {
  timeout: {
    title: "Session timed out",
    message: "For your security, we signed you out after 15 minutes of inactivity.",
  },
  forbidden: {
    title: "Access restricted",
    message: "Your account is signed in, but it does not have access to that area.",
  },
  session_expired: {
    title: "Session expired",
    message: "Please sign in again to continue where you left off.",
  },
  admin_required: {
    title: "Admin sign in required",
    message: "Use your Clerk administrator or team-member account to continue.",
  },
};

export default function LoginPage() {
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get("redirect_url") || "/dashboard";
  const reason = params.get("reason");
  const reasonState = reason ? reasonCopy[reason] : null;
  const signUpUrl = `/auth/register?redirect_url=${encodeURIComponent(redirectUrl)}`;

  return (
    <main className="grid min-h-screen bg-[#f6f9fd] lg:grid-cols-[0.95fr_1.05fr]">
      <section className="mye-brand-panel hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 font-black">
          <Logo size="sm" />
          MyeCA.in
        </Link>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">
            Secure login
          </p>
          <h1 className="mt-4 max-w-xl text-5xl font-black tracking-tight">
            Continue your filing without restarting the story.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50/90">
            Clerk manages authentication while MyeCA keeps PAN, documents, services, and role-based
            dashboards protected behind bearer-token API checks.
          </p>
        </div>
        <div className="grid gap-3">
          {[
            ["Passwordless-ready flows", Bot],
            ["Role-aware dashboard access", ShieldCheck],
            ["Private document vault protection", LockKeyhole],
            ["CA-reviewed compliance handoff", CheckCircle2],
          ].map(([label, Icon]) => {
            const TypedIcon = Icon as typeof Bot;
            return (
              <div key={String(label)} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <TypedIcon className="h-5 w-5 text-emerald-200" />
                <span className="font-bold">{String(label)}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 font-black text-[#003087]">
              <Logo size="sm" />
              MyeCA.in
            </Link>
          </div>
          <div className="mb-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0050b5]">
              Welcome back
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Sign in securely</h2>
            <p className="mt-2 text-sm text-slate-600">
              Prefer passwordless? Enable email code or magic link in Clerk and it appears here.
            </p>
          </div>
          {reasonState && (
            <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
              <p className="font-black">{reasonState.title}</p>
              <p className="mt-1 text-blue-800">{reasonState.message}</p>
            </div>
          )}
          <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_-60px_rgba(0,48,135,0.65)]">
            <SignIn
              path="/auth/login"
              routing="path"
              signUpUrl={signUpUrl}
              fallbackRedirectUrl={redirectUrl}
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none border-0 w-full",
                  headerTitle: "text-slate-950",
                  formButtonPrimary: "bg-[#003087] hover:bg-[#082a5c]",
                  footerActionLink: "text-[#003087]",
                },
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
