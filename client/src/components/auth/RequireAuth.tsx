import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirectUrl = encodeURIComponent(location || window.location.pathname + window.location.search);
      setLocation(`/auth/login?redirect_url=${redirectUrl}`);
    }
  }, [isLoading, isAuthenticated, location, setLocation]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
