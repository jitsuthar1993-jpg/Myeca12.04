import { ClerkLoaded, ClerkLoading, SignUp } from "@clerk/clerk-react";
import { BadgeCheck, Fingerprint, UserRoundCheck } from "lucide-react";
import {
  AuthFormSkeleton,
  AuthPageShell,
  clerkAuthAppearance,
} from "@/components/auth/AuthPageShell";

const registerSteps = [
  {
    title: "Create your Clerk identity",
    description: "Start with secure email, OAuth, or passwordless sign-up options.",
    icon: Fingerprint,
  },
  {
    title: "Build your MyeCA profile",
    description: "Add PAN, user type, family, business, and compliance context only when needed.",
    icon: UserRoundCheck,
  },
  {
    title: "Start with the right service",
    description: "Get filing, GST, startup, notice, payroll, or CA-review paths from one account.",
    icon: BadgeCheck,
  },
];

export default function RegisterPage() {
  const redirectUrl = new URLSearchParams(window.location.search).get("redirect_url") || "/dashboard";
  const signInUrl = `/auth/login?redirect_url=${encodeURIComponent(redirectUrl)}`;

  return (
    <AuthPageShell
      eyebrow="Create account"
      title="Start securely"
      description="Create your account with Clerk, then let MyeCA personalize your tax workspace."
      panelTitle="Start with identity, then add tax details only when they matter."
      panelDescription="MyeCA keeps onboarding light: secure account first, then focused questions for the filing, document, GST, startup, or CA workflow you choose."
      primaryLink={{
        href: signInUrl,
        text: "Already have an account?",
        label: "Sign in",
      }}
      steps={registerSteps}
    >
      <ClerkLoading>
        <AuthFormSkeleton />
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp
          path="/auth/register"
          routing="path"
          signInUrl={signInUrl}
          fallbackRedirectUrl={redirectUrl}
          appearance={clerkAuthAppearance}
        />
      </ClerkLoaded>
    </AuthPageShell>
  );
}
