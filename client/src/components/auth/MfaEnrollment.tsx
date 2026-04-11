import { useClerk } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export function MfaEnrollment() {
  const clerk = useClerk();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 text-blue-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">
            Account security is managed by Clerk
          </h4>
          <p className="text-sm text-slate-500">
            Configure multi-factor authentication, passkeys, email, and phone verification from
            your secure account profile.
          </p>
        </div>
      </div>

      <Button onClick={() => clerk.openUserProfile()}>
        Open Security Settings
      </Button>
    </div>
  );
}
