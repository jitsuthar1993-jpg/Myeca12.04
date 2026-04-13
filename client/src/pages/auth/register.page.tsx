import { ClerkLoaded, ClerkLoading, SignUp } from '@clerk/clerk-react';
import { BadgeCheck, Fingerprint, UserRoundCheck } from 'lucide-react';
import {
  AuthFormSkeleton,
  AuthPageShell,
  clerkAuthAppearance,
} from '@/components/auth/AuthPageShell';

const registerSteps = [
  {
    title: 'Create secure access',
    description: 'Start with your email before adding tax details.',
    icon: Fingerprint,
  },
  {
    title: 'Prepare ITR profile',
    description: 'Add PAN, Form 16, income, deductions, and bank details when needed.',
    icon: UserRoundCheck,
  },
  {
    title: 'Get CA review',
    description: 'Check regime, deductions, refund, and filing status from one dashboard.',
    icon: BadgeCheck,
  },
];

export default function RegisterPage() {
  const redirectUrl =
    new URLSearchParams(window.location.search).get('redirect_url') || '/dashboard';
  const signInUrl = `/auth/login?redirect_url=${encodeURIComponent(redirectUrl)}`;

  return (
    <AuthPageShell
      eyebrow="ITR sign up"
      title="Create account"
      description="Start your ITR filing workspace for Form 16, AIS, deductions, refunds, and CA review."
      panelTitle="Your data, your rules"
      panelDescription="Add tax details only when needed. MyeCA helps organize documents, calculate refund, and prepare filing checks."
      primaryLink={{
        href: signInUrl,
        text: 'Already have an account?',
        label: 'Sign in',
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
