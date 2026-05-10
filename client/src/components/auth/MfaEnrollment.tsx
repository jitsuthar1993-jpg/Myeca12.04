import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MfaEnrollment() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900">Account security</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Supabase Auth protects sign-in and recovery for this account. MFA enrollment will be
            enabled here after Supabase factors are configured for the production project.
          </p>
          <Button type="button" variant="outline" className="mt-3" disabled>
            MFA setup coming soon
          </Button>
        </div>
      </div>
    </div>
  );
}
