import { ClerkLoaded, ClerkLoading, SignUp } from '@clerk/clerk-react';
import {
  AuthFormSkeleton,
  AuthPageShell,
  clerkAuthAppearance,
} from '@/components/auth/AuthPageShell';

export default function RegisterPage() {
  const redirectUrl =
    new URLSearchParams(window.location.search).get('redirect_url') || '/dashboard';
  const signInUrl = `/auth/login?redirect_url=${encodeURIComponent(redirectUrl)}`;

  return (
    <AuthPageShell
      eyebrow="ITR sign up"
      title="Create account"
      description="Start your ITR filing workspace for Form 16, AIS, deductions, refunds, and CA review."
      panelTitle="Keep these ready"
      panelDescription="Create your account first, then add these documents when filing starts."
      primaryLink={{
        href: signInUrl,
        text: 'Already have an account?',
        label: 'Sign in',
      }}
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
