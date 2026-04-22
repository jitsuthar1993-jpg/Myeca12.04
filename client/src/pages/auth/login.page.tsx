import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { AlertCircle, Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/components/AuthProvider';
import {
  AuthPageShell,
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

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get('redirect_url') || '/dashboard';
  const reason = params.get('reason');
  const reasonState = reason ? reasonCopy[reason] : null;
  const signUpUrl = `/auth/register?redirect_url=${encodeURIComponent(redirectUrl)}`;
  const mockEmail = params.get('mock_email');

  useEffect(() => {
    if (mockEmail) {
      setLoading(true);
      login(mockEmail, 'mock_password').then(() => {
        window.location.href = redirectUrl;
      }).catch(err => {
        setError(err?.message || 'Mock login failed');
        setLoading(false);
      });
    }
  }, [mockEmail, login, redirectUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email.trim(), password);
      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="ITR sign in"
      title="Welcome back"
      description="Continue your income tax return, refund estimate, documents, and CA review."
      notice={reasonState}
      panelTitle="Keep these ready"
      panelDescription="Use these details to continue ITR filing without delays."
      primaryLink={{
        href: signUpUrl,
        text: 'New to MyeCA?',
        label: 'Create an account',
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.7)]">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={loading || googleLoading}
          className="h-11 w-full rounded-lg border-slate-200 bg-white font-black text-slate-900 hover:border-[#315efb] hover:bg-[#f4f8ff]"
        >
          {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs font-black uppercase text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-black text-slate-800">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-11 rounded-lg border-slate-300 pl-10 text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-sm font-black text-slate-800">
              Password
            </Label>
            <Link href="/forgot-password" className="text-sm font-black text-[#315efb] hover:text-[#06439f]">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-11 rounded-lg border-slate-300 pl-10 text-sm"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || googleLoading}
          className="h-11 w-full rounded-lg bg-[#315efb] text-sm font-black text-white hover:bg-[#06439f]"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign in
        </Button>
      </form>
    </AuthPageShell>
  );
}
