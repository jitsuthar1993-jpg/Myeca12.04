import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    void logout("manual");
  }, [logout]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
        <h1 className="mt-4 text-2xl font-black text-slate-950">Signing you out</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">You will be redirected to the homepage in a moment.</p>
      </div>
    </main>
  );
}
