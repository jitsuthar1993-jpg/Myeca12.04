import { ClerkLoaded, ClerkLoading, SignIn } from '@clerk/clerk-react';
import { CalendarCheck2, FileCheck2, ShieldCheck } from 'lucide-react';
import {
  AuthFormSkeleton,
  AuthPageShell,
  clerkAuthAppearance,
} from '@/components/auth/AuthPageShell';

const reasonCopy: Record<string, { title: string; message: string }> = {
  timeout: {
    title: 'Session timed out',
    message: 'For your security, we signed you out after 15 minutes of inactivity.',
  },
  forbidden: {
    title: 'Access restricted',
    message: 'Your account is signed in, but it does not have access to that area.',
  },
  session_expired: {
    title: 'Session expired',
    message: 'Please sign in again to continue where you left off.',
  },
  admin_required: {
    title: 'Admin sign in required',
    message: 'Use your Clerk administrator or team-member account to continue.',
  },
};

const loginSteps = [
  {
    title: 'Verify your identity',
    description: 'Sign in securely before opening tax documents or saved returns.',
    icon: ShieldCheck,
  },
  {
    title: 'Resume your ITR',
    description: 'Continue Form 16, AIS, deductions, refund tracking, or CA review.',
    icon: FileCheck2,
  },
  {
    title: 'File with confidence',
    description: 'Submit after checks for tax regime, deductions, and common errors.',
    icon: CalendarCheck2,
  },
];

export default function LoginPage() {
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get('redirect_url') || '/dashboard';
  const reason = params.get('reason');
  const reasonState = reason ? reasonCopy[reason] : null;
  const signUpUrl = `/auth/register?redirect_url=${encodeURIComponent(redirectUrl)}`;

  return (
    <AuthPageShell
      eyebrow="ITR sign in"
      title="Welcome back"
      description="Continue your income tax return, refund estimate, documents, and CA review."
      notice={reasonState}
      panelTitle="Your data, your return"
      panelDescription="MyeCA keeps PAN, Form 16, AIS, deductions, and refund details protected while your return moves forward."
      primaryLink={{
        href: signUpUrl,
        text: 'New to MyeCA?',
        label: 'Create an account',
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
