import { SignIn } from "@clerk/clerk-react";
import { Link } from "wouter";
import { ArrowLeft, KeyRound, ShieldCheck, UserRoundPlus } from "lucide-react";
import Logo from "@/components/ui/logo";

export default function AdminLoginPage() {
  const redirectUrl = new URLSearchParams(window.location.search).get("redirect_url") || "/admin/dashboard";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,48,135,0.18),transparent_34%),linear-gradient(135deg,#f8fbff_0%,#eef5ff_52%,#ffffff_100%)] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-blue-100 bg-white shadow-[0_35px_120px_-70px_rgba(0,48,135,0.75)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="mye-brand-panel p-8 text-white sm:p-10">
            <Link href="/" className="inline-flex items-center gap-3 font-black">
              <Logo size="sm" />
              MyeCA.in
            </Link>
            <div className="mt-16">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">
                Admin access
              </p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                Clerk-secured control room for trusted operators.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-8 text-blue-50/90">
                This compatibility route now uses Clerk sign-in only. Admin, CA, and team roles are
                provisioned from Neon-backed records and mirrored into Clerk metadata.
              </p>
            </div>
            <div className="mt-12 grid gap-3">
              {[
                ["No shared admin passwords", KeyRound],
                ["Invite-first provisioning", UserRoundPlus],
                ["Neon roles remain authoritative", ShieldCheck],
              ].map(([label, Icon]) => {
                const TypedIcon = Icon as typeof ShieldCheck;
                return (
                  <div key={String(label)} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                    <TypedIcon className="h-5 w-5 text-emerald-200" />
                    <span className="font-bold">{String(label)}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="flex items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-md">
              <Link href="/auth/login" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#003087] hover:text-[#082a5c]">
                <ArrowLeft className="h-4 w-4" />
                User sign in
              </Link>
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0050b5]">
                  Administrator
                </p>
                <h2 className="mt-2 text-3xl font-black text-slate-950">Sign in with Clerk</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  If you were invited as an admin, team member, or CA, use the same email address
                  from the Clerk invitation.
                </p>
              </div>
              <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_-60px_rgba(0,48,135,0.65)]">
                <SignIn
                  path="/auth/admin-login"
                  routing="path"
                  signUpUrl="/auth/register?redirect_url=%2Fadmin%2Fdashboard"
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
        </div>
      </div>
    </main>
  );
}
