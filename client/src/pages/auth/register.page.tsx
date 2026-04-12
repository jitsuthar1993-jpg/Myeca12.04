import { SignUp } from "@clerk/clerk-react";
import { Link } from "wouter";
import { BadgeCheck, FileText, Fingerprint, UserRoundCheck } from "lucide-react";
import Logo from "@/components/ui/logo";

const onboardingSteps = [
  ["Authenticate", "Email, OAuth, passwordless, or invite flows via Clerk.", Fingerprint],
  ["Progressive profile", "PAN, Aadhaar-link state, user type, and family/business context.", UserRoundCheck],
  ["Personalized cockpit", "Recommended ITR, vault checklist, deadlines, and CA route.", FileText],
];

export default function RegisterPage() {
  const redirectUrl = new URLSearchParams(window.location.search).get("redirect_url") || "/dashboard";
  const signInUrl = `/auth/login?redirect_url=${encodeURIComponent(redirectUrl)}`;

  return (
    <main className="grid min-h-screen bg-[#f6f9fd] lg:grid-cols-[1.05fr_0.95fr]">
      <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2 font-black text-[#003087]">
              <Logo size="sm" />
              MyeCA.in
            </Link>
          </div>
          <div className="mb-6 text-center">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#0050b5]">
              Create account
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Start with secure identity</h2>
            <p className="mt-2 text-sm text-slate-600">
              We collect only what is needed first, then personalize the tax journey after sign-up.
            </p>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-[0_30px_90px_-60px_rgba(0,48,135,0.65)]">
            <SignUp
              path="/auth/register"
              routing="path"
              signInUrl={signInUrl}
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

      <section className="mye-brand-panel hidden p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex items-center gap-3 font-black">
          <Logo size="sm" />
          MyeCA.in
        </Link>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-100">
            Progressive onboarding
          </p>
          <h1 className="mt-4 max-w-xl text-5xl font-black tracking-tight">
            No giant tax form on day one.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-blue-50/90">
            The first session captures identity and intent, then MyeCA gathers deeper tax data only
            when it is needed for a service, wizard, upload, or CA review.
          </p>
        </div>
        <div className="grid gap-3">
          {onboardingSteps.map(([title, description, Icon], index) => {
            const TypedIcon = Icon as typeof Fingerprint;
            return (
              <div key={String(title)} className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-[#003087]">
                    {index + 1}
                  </span>
                  <TypedIcon className="h-5 w-5 text-emerald-200" />
                  <span className="font-black">{String(title)}</span>
                </div>
                <p className="mt-2 pl-20 text-sm text-blue-50/80">{String(description)}</p>
              </div>
            );
          })}
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 text-[#003087]">
            <BadgeCheck className="h-5 w-5" />
            <span className="font-black">Admin bootstrap remains Neon-role backed.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
