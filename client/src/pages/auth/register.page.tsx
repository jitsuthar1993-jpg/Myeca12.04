import { useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail, Phone, Send, UserRound } from "lucide-react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { getAuthRedirectPath } from "@/lib/auth-confirmation";

export default function RegisterPage() {
  const { register, resendSignupConfirmation } = useAuth();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const redirectUrl = getAuthRedirectPath(params.get("redirect_url") || params.get("next"));
  const signInUrl = `/auth/login?redirect_url=${encodeURIComponent(redirectUrl)}`;
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
        phoneNumber: phoneNumber.trim() || null,
      }, redirectUrl);
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

  return (
    <AuthPageShell
      eyebrow="ITR sign up"
      title="Create account"
      description="Start your ITR filing workspace for Form 16, AIS, deductions, refunds, and CA review."
      panelTitle="Keep these ready"
      panelDescription="Create your account first, then add these documents when filing starts."
      primaryLink={{
        href: signInUrl,
        text: "Already have an account?",
        label: "Sign in",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.7)]">
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

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-sm font-black text-slate-800">
              First name
            </Label>
            <div className="relative">
              <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input id="firstName" value={firstName} onChange={(event) => setFirstName(event.target.value)} className="h-11 rounded-lg border-slate-300 pl-10 text-sm" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-sm font-black text-slate-800">
              Last name
            </Label>
            <Input id="lastName" value={lastName} onChange={(event) => setLastName(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-black text-slate-800">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-11 rounded-lg border-slate-300 pl-10 text-sm" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-black text-slate-800">
            Mobile number
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="phoneNumber" type="tel" autoComplete="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="Optional" className="h-11 rounded-lg border-slate-300 pl-10 text-sm" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-black text-slate-800">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-lg border-slate-300 pl-10 text-sm" required minLength={8} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-black text-slate-800">
            Confirm password
          </Label>
          <Input id="confirmPassword" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-11 rounded-lg border-slate-300 text-sm" required minLength={8} />
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg bg-[#315efb] text-sm font-black text-white hover:bg-[#06439f]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Create account
        </Button>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <p className="font-bold text-slate-900">Need a new confirmation email?</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Enter the account email above and resend the Supabase confirmation link.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || resendLoading}
            onClick={handleResendConfirmation}
            className="mt-3 h-9 rounded-lg"
          >
            {resendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Resend confirmation
          </Button>
        </div>
      </form>
    </AuthPageShell>
  );
}
