import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Chrome,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Send,
  ShieldCheck,
  UserCog,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import { TEMPORARY_TEST_USERS, type TemporaryTestUser } from '@/lib/temporary-test-users';
import {
  AuthPageShell,
} from '@/components/auth/AuthPageShell';
import { allowLocalAuthFallbacks as shouldAllowLocalAuthFallbacks } from '@/utils/runtime-env';
import { getSafeRedirectPath, resolvePostLoginRedirect } from '@/lib/role-redirect';

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
    message: 'Use your Supabase administrator or team-member account to continue.',
  },
  email_confirmed: {
    title: 'Email confirmed',
    message: 'Your account is active. Sign in to open your workspace.',
  },
  confirmation_required: {
    title: 'Confirm your email',
    message: 'Use the confirmation link sent by Supabase before signing in.',
  },
};

function getLoginErrorMessage(error: any) {
  const message = error?.message || "";
  if (/invalid login credentials/i.test(message)) {
    return "Email or password did not match a confirmed account. Use Forgot to reset your password, or create the account here if it was made on another deployment.";
  }
  if (/email not confirmed|not confirmed/i.test(message)) {
    return "Confirm your email before signing in. You can resend the Supabase confirmation link below.";
  }

  return message || 'Unable to sign in. Check your details and try again.';
}

export default function LoginPage() {
  const { user, isAuthenticated, isLoading: authLoading, login, loginWithGoogle, resendSignupConfirmation } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const requestedRedirectPath = getSafeRedirectPath(params.get('redirect_url') || params.get('next'));
  const reason = params.get('reason');
  const reasonState = reason ? reasonCopy[reason] : null;
  const signUpUrl = `/auth/register?redirect_url=${encodeURIComponent(requestedRedirectPath || '/dashboard')}`;
  const allowLocalAuthFallbacks = shouldAllowLocalAuthFallbacks();
  const testEmail = allowLocalAuthFallbacks ? params.get('test_email') : null;
  const showTemporaryLogin = allowLocalAuthFallbacks && params.get('test_login') === '1';
  const reloadAfterLogin = (target: string) => {
    window.location.replace(target);
  };

  useEffect(() => {
    if (!authLoading && !loading && !googleLoading && isAuthenticated) {
      reloadAfterLogin(resolvePostLoginRedirect(user?.role, requestedRedirectPath));
    }
  }, [authLoading, googleLoading, isAuthenticated, loading, requestedRedirectPath, user?.role]);

  useEffect(() => {
    if (testEmail) {
      setLoading(true);
      login(testEmail, 'temporary_test_login').then((signedInUser) => {
        reloadAfterLogin(resolvePostLoginRedirect(signedInUser.role, requestedRedirectPath));
      }).catch(err => {
        setError(err?.message || 'Temporary test login failed');
        setLoading(false);
      });
    }
  }, [testEmail, login, requestedRedirectPath]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const signedInUser = await login(email.trim(), password);
      reloadAfterLogin(resolvePostLoginRedirect(signedInUser.role, requestedRedirectPath));
    } catch (err: any) {
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setNotice(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle(requestedRedirectPath || '/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleTemporaryLogin = async (testUser: TemporaryTestUser) => {
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const signedInUser = await login(testUser.email, 'temporary_test_login');
      reloadAfterLogin(resolvePostLoginRedirect(signedInUser.role, requestedRedirectPath || testUser.redirectTo));
    } catch (err: any) {
      setError(err?.message || `Unable to sign in as ${testUser.label}.`);
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setError(null);
    setNotice(null);
    setResendLoading(true);

    try {
      await resendSignupConfirmation(email, requestedRedirectPath || '/dashboard');
      setNotice('Confirmation email sent. Use the link in your inbox, then sign in here.');
    } catch (err: any) {
      setError(err?.message || 'Unable to resend confirmation email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  const temporaryLoginIcons = [UserRound, ShieldCheck, UserCog, UsersRound];
  const showConfirmationResend = Boolean(notice || (error && /confirm/i.test(error)));

  return (
    <AuthPageShell
      variant="compact"
      eyebrow="Finance login"
      title="Sign in to MyeCA"
      description="Open your secure tax workspace and continue where you left off."
      notice={reasonState}
      panelTitle="Account summary"
      panelDescription="Your latest filing and document status appear first."
      primaryLink={{
        href: signUpUrl,
        text: 'New to MyeCA?',
        label: 'Create an account',
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={loading || googleLoading || resendLoading}
          className="h-10 w-full rounded-lg border-slate-300 bg-white font-bold text-slate-900 hover:border-[#315efb] hover:bg-slate-50"
        >
          {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs font-black uppercase text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-bold text-slate-800">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-10 rounded-lg border-slate-300 bg-white pl-10 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-sm font-bold text-slate-800">
              Password
            </Label>
            <Link href="/forgot-password" className="text-sm font-bold text-[#315efb] hover:text-[#06439f]">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-10 rounded-lg border-slate-300 bg-white pl-10 pr-12 text-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || googleLoading || resendLoading}
          className="h-10 w-full rounded-lg bg-blue-700 text-sm font-bold text-white hover:bg-blue-800"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign in
          {!loading ? <ArrowRight className="ml-1 h-4 w-4" /> : null}
        </Button>

        {showConfirmationResend && (
          <div className="border-t border-slate-200 pt-3 text-sm text-slate-700">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-bold text-slate-900">Missing confirmation email?</p>
                <p className="mt-0.5 text-xs leading-4 text-slate-600">Enter your email above and resend the link.</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || googleLoading || resendLoading}
                onClick={handleResendConfirmation}
                className="h-8 rounded-lg sm:w-auto"
              >
                {resendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Resend
              </Button>
            </div>
          </div>
        )}
      </form>

      {showTemporaryLogin && (
        <section className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.7)]">
          <div className="mb-3">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-amber-700">
              Temporary test login
            </p>
            <p className="mt-1 text-sm font-medium leading-5 text-amber-900">
              Use these tab-only test sessions to check each role.
            </p>
          </div>

          <div className="grid gap-2">
            {TEMPORARY_TEST_USERS.map((testUser, index) => {
              const Icon = temporaryLoginIcons[index] || UserRound;

              return (
                <Button
                  key={testUser.email}
                  type="button"
                  variant="outline"
                  disabled={loading || googleLoading}
                  onClick={() => handleTemporaryLogin(testUser)}
                  className="h-auto justify-start gap-3 rounded-lg border-amber-200 bg-white px-3 py-3 text-left text-slate-900 hover:border-amber-400 hover:bg-amber-100"
                >
                  <Icon className="h-4 w-4 shrink-0 text-amber-700" />
                  <span className="min-w-0">
                    <span className="block text-sm font-black">{testUser.label}</span>
                    <span className="block text-xs font-medium text-slate-500">
                      {testUser.description}
                    </span>
                  </span>
                </Button>
              );
            })}
          </div>
        </section>
      )}
    </AuthPageShell>
  );
}
