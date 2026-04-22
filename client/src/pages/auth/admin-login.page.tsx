import { SignIn } from "@clerk/clerk-react";
import { Link } from "wouter";
import { KeyRound, ShieldCheck, UserRoundPlus, Lock } from "lucide-react";
import { AuthPageShell, clerkAuthAppearance } from "@/components/auth/AuthPageShell";

export default function AdminLoginPage() {
  const redirectUrl = new URLSearchParams(window.location.search).get("redirect_url") || "/admin/dashboard";

  return (
    <AuthPageShell
      eyebrow="Admin access"
      title="Trusted operator sign in"
      description="Access the Clerk-secured control room. Admin and team roles are provisioned from Neon records."
      panelTitle="Security first"
      panelDescription="We use enterprise-grade authentication to ensure your data remains protected."
      panelItems={[
        { label: "No shared admin passwords", icon: KeyRound },
        { label: "Invite-first provisioning", icon: UserRoundPlus },
        { label: "Neon roles remain authoritative", icon: ShieldCheck },
      ]}
      primaryLink={{
        href: "/auth/login",
        text: "Are you a taxpayer?",
        label: "User sign in",
      }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.7)]">
        {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
          <SignIn
            path="/auth/admin-login"
            routing="path"
            signUpUrl="/auth/register?redirect_url=%2Fadmin%2Fdashboard"
            fallbackRedirectUrl={redirectUrl}
            appearance={clerkAuthAppearance}
          />
        ) : (
          <div className="p-6 text-center">
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-amber-100 p-3 text-amber-600">
              <KeyRound className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-bold text-slate-900">Local Development Mode</h3>
            <p className="mb-6 text-sm text-slate-500 leading-relaxed">
              Clerk keys are missing. Use these buttons to simulate signing in with different roles.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  window.location.href = `/auth/login?mock_email=admin@myeca.in&redirect_url=${encodeURIComponent(redirectUrl)}`;
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#315efb] px-4 py-3 text-sm font-black text-white hover:bg-[#082a5c] transition-all"
              >
                <Lock className="h-4 w-4" />
                Sign in as Admin
              </button>
              <button 
                onClick={() => {
                  window.location.href = `/auth/login?mock_email=ca@myeca.in&redirect_url=${encodeURIComponent("/ca/dashboard")}`;
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white hover:bg-emerald-700 transition-all"
              >
                <ShieldCheck className="h-4 w-4" />
                Sign in as CA
              </button>
              <button 
                onClick={() => {
                  window.location.href = `/auth/login?mock_email=team@myeca.in&redirect_url=${encodeURIComponent("/admin/dashboard")}`;
                }}
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-black text-white hover:bg-slate-950 transition-all"
              >
                <UserRoundPlus className="h-4 w-4" />
                Sign in as Team Member
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthPageShell>
  );
}
