import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, AlertCircle, CheckCircle2, ShieldQuestion } from "lucide-react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError(err.message || "Failed to send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="Account recovery"
      title={sent ? "Check your email" : "Reset password"}
      description={sent 
        ? "We've sent a recovery link to your inbox. Follow the instructions to securely reset your password." 
        : "Enter your registered email address and we'll send you a link to reset your password securely."
      }
      panelTitle="Need help?"
      panelDescription="If you're having trouble accessing your account, our team is here to assist you."
      panelItems={[
        { label: "Official recovery links", icon: ShieldQuestion },
        { label: "24/7 technical support", icon: CheckCircle2 },
        { label: "Secure encrypted reset", icon: CheckCircle2 },
      ]}
      primaryLink={{
        href: "/auth/login",
        text: "Remember your password?",
        label: "Sign in",
      }}
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.7)]">
        {sent ? (
          <div className="space-y-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 text-emerald-700 text-sm">
              <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <p className="font-black text-emerald-900">Reset email sent!</p>
                <p className="mt-1 leading-relaxed">
                  Check your inbox at <strong>{email}</strong> and follow the link to reset your password.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="h-11 w-full rounded-xl border-slate-200 font-bold"
              >
                Try a different email
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex items-start gap-3 text-rose-800 text-sm">
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <p className="font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-black text-slate-800">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-xl border-slate-200"
                  required
                  autoFocus
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-12 rounded-xl bg-[#315efb] hover:bg-[#06439f] text-white font-black text-sm shadow-lg shadow-blue-500/10 transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Send Reset Link
            </Button>
          </form>
        )}
      </div>
    </AuthPageShell>
  );
}
