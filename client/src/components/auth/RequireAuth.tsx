import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation(`/auth/login?next=${encodeURIComponent(location)}`);
    }
  }, [isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return <PageSkeleton />;
  }

  return <>{children}</>;
}
