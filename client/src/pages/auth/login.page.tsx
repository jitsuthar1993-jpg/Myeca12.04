import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/clerk-react";
import { CalendarCheck2, FileCheck2, ShieldCheck } from "lucide-react";
import {
  AuthFormSkeleton,
  AuthPageShell,
  clerkAuthAppearance,
} from "@/components/auth/AuthPageShell";

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

const loginSteps = [
  {
    title: "Clerk verifies identity",
    description: "Use email, password, OAuth, or any passwordless method enabled in Clerk.",
    icon: ShieldCheck,
  },
  {
    title: "MyeCA syncs your profile",
    description: "Your role, account status, and dashboard access are refreshed after sign-in.",
    icon: FileCheck2,
  },
  {
    title: "Continue your work",
    description: "Return to filings, saved calculators, uploads, notices, and service requests.",
    icon: CalendarCheck2,
  },
];

export default function LoginPage() {
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get("redirect_url") || "/dashboard";
  const reason = params.get("reason");
  const reasonState = reason ? reasonCopy[reason] : null;
  const signUpUrl = `/auth/register?redirect_url=${encodeURIComponent(redirectUrl)}`;

  return (
    <AuthPageShell
      eyebrow="Secure sign in"
      title="Welcome back"
      description="Sign in with Clerk to continue into your MyeCA dashboard."
      notice={reasonState}
      panelTitle="Pick up your tax and compliance work exactly where it paused."
      panelDescription="A single secure account connects your documents, calculators, service requests, invoices, and CA conversations across MyeCA."
      primaryLink={{
        href: signUpUrl,
        text: "New to MyeCA?",
        label: "Create an account",
      }}
      steps={loginSteps}
    >
      <ClerkLoading>
        <AuthFormSkeleton />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn
          path="/auth/login"
          routing="path"
          signUpUrl={signUpUrl}
          fallbackRedirectUrl={redirectUrl}
          appearance={clerkAuthAppearance}
        />
      </ClerkLoaded>
    </AuthPageShell>
  );
}
