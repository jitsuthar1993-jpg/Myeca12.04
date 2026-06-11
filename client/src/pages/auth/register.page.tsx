import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2, Chrome, Loader2, Lock, Mail, Send, UserRound } from "lucide-react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { getAuthRedirectPath } from "@/lib/auth-confirmation";
import { captureCampaignAttribution } from "@/lib/campaign-attribution";
import { normalizeReferralCode, normalizeReferralService } from "@shared/campaign-attribution";

export default function RegisterPage() {
  const { register, loginWithGoogle, resendSignupConfirmation } = useAuth();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = getAuthRedirectPath(params.get("redirect_url") || params.get("next"));
  const signInUrl = `/auth/login?redirect_url=${encodeURIComponent(redirectUrl)}`;
  const campaignAttribution = useMemo(() => captureCampaignAttribution(params), []);
  const referralCode = normalizeReferralCode(params.get("ref"));
  const referralService = normalizeReferralService(params.get("service"));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim();
      const result = await register(normalizedEmail, password, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phoneNumber: null,
      }, redirectUrl, {
        campaignAttribution,
        referralCode,
        referralService,
      });
      if (result.needsEmailConfirmation) {
        setPassword("");
        setConfirmPassword("");
        setPendingEmail(normalizedEmail);
        setNotice("Account created. Check your email and confirm the account before signing in.");
        return;
      }

      setLocation(redirectUrl);
    } catch (err: any) {
      setError(err?.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const targetEmail = (pendingEmail || email).trim();
    setError(null);
    setNotice(null);
    setResendLoading(true);

    try {
      await resendSignupConfirmation(targetEmail, redirectUrl);
      setPendingEmail(targetEmail);
      setNotice("Confirmation email sent. Use the link in your inbox to activate this account.");
    } catch (err: any) {
      setError(err?.message || "Unable to resend confirmation email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setNotice(null);
    setGoogleLoading(true);

    try {
      await loginWithGoogle(redirectUrl);
    } catch (err: any) {
      setError(err?.message || "Google sign up failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <AuthPageShell
      variant="compact"
      eyebrow="ITR sign up"
      title="Create your account"
      description=""
      panelTitle="Keep these ready"
      panelDescription="Create your account first, then add these documents when filing starts."
      primaryLink={{
        href: signInUrl,
        text: "Already have an account?",
        label: "Sign in",
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
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="font-bold">{notice}</span>
            </div>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={loading || googleLoading || resendLoading}
          className="h-10 w-full rounded-lg border-slate-300 bg-white font-bold text-slate-900 hover:border-brand-600 hover:bg-slate-50"
        >
          {googleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Chrome className="mr-2 h-4 w-4" />}
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 text-xs font-black uppercase text-slate-400">
          <div className="h-px flex-1 bg-slate-200" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-sm font-black text-slate-800">
              First name
            </Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="h-10 rounded-lg border-slate-300 pl-10 text-sm" required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-sm font-black text-slate-800">
              Last name
            </Label>
            <Input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} className="h-10 rounded-lg border-slate-300 text-sm" required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-black text-slate-800">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-10 rounded-lg border-slate-300 pl-10 text-sm" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-black text-slate-800">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 rounded-lg border-slate-300 pl-10 text-sm" required minLength={8} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-black text-slate-800">
              Confirm
            </Label>
            <Input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-10 rounded-lg border-slate-300 text-sm" required minLength={8} />
          </div>
        </div>

        <Button type="submit" disabled={loading || googleLoading || resendLoading} className="h-10 w-full rounded-lg bg-brand-600 text-sm font-black text-white hover:bg-[#06439f]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create account
        </Button>

        {(notice || pendingEmail) && (
          <div className="border-t border-slate-200 pt-3 text-sm text-slate-700">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-bold text-slate-900">Need a new confirmation email?</p>
                <p className="mt-0.5 text-xs leading-4 text-slate-600">Resend the account activation link.</p>
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
    </AuthPageShell>
  );
}
