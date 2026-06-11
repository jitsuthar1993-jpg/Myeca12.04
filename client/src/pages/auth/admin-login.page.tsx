import { useState } from "react";
import { useLocation } from "wouter";
import { AlertCircle, KeyRound, Loader2, Lock, Mail, ShieldCheck, UserRoundPlus } from "lucide-react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/AuthProvider";
import { getSafeRedirectPath, resolvePostLoginRedirect } from "@/lib/role-redirect";

export default function AdminLoginPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const requestedRedirectPath = getSafeRedirectPath(params.get("redirect_url") || params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const signedInUser = await login(email.trim(), password);
      setLocation(resolvePostLoginRedirect(signedInUser.role, requestedRedirectPath || "/admin/dashboard"));
    } catch (err: any) {
      setError(err?.message || "Unable to sign in. Check your Supabase account details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      eyebrow="Admin access"
      title="Trusted operator sign in"
      description="Access the Supabase-secured control room. Admin and team roles are provisioned from Supabase records."
      panelTitle="Security first"
      panelDescription="We use Supabase Auth with app-level role checks to keep privileged workflows protected."
      panelItems={[
        { label: "No shared admin passwords", icon: KeyRound },
        { label: "Invite-first provisioning", icon: UserRoundPlus },
        { label: "Supabase roles remain authoritative", icon: ShieldCheck },
      ]}
      primaryLink={{
        href: "/auth/login",
        text: "Are you a taxpayer?",
        label: "User sign in",
      }}
    >
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-800">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="adminEmail" className="text-sm font-black text-slate-800">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="adminEmail" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 rounded-lg border-slate-300 pl-10 text-sm" required />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="adminPassword" className="text-sm font-black text-slate-800">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input id="adminPassword" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 rounded-lg border-slate-300 pl-10 text-sm" required />
          </div>
        </div>

        <Button type="submit" disabled={loading} className="h-11 w-full rounded-lg bg-brand-600 text-sm font-black text-white hover:bg-[#06439f]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Sign in to admin
        </Button>
      </form>
    </AuthPageShell>
  );
}
