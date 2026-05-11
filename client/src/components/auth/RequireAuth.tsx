import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";
import { Button } from "@/components/ui/button";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const loginPath = `/auth/login?next=${encodeURIComponent(location)}`;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(loginPath);
    }
  }, [isAuthenticated, isLoading, loginPath, setLocation]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-lg font-black text-slate-950">Please sign in again</p>
          <p className="mt-2 text-sm text-slate-600">
            Your session needs to be refreshed before opening this page.
          </p>
          <Button className="mt-5 w-full" onClick={() => setLocation(loginPath)}>
            Go to login
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
