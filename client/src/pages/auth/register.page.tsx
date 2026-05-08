import { ClerkLoaded, ClerkLoading, SignUp } from '@clerk/clerk-react';
import {
  AuthFormSkeleton,
  AuthPageShell,
  clerkAuthAppearance,
} from '@/components/auth/AuthPageShell';
import { isClerkEnabled } from '@/lib/clerk-config';

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
      {isClerkEnabled ? (
        <>
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
        </>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.7)]">
          Account creation is temporarily unavailable. You can still sign in with an existing account.
        </div>
      )}
    </AuthPageShell>
  );
}
