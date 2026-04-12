import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";
import { logAuditEvent } from "@/lib/audit";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface RequireRoleProps {
  roles: string[];
  children: React.ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const userRole = user?.role || "user";
  const isForbidden = Boolean(isAuthenticated && user && !roles.includes(userRole));
  const requiredRoles = roles.join(",");
  const loginReason = roles.includes("admin") ? "admin_required" : "session_expired";

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      const redirectUrl = encodeURIComponent(location || window.location.pathname + window.location.search);
      setLocation(`/auth/login?reason=${loginReason}&redirect_url=${redirectUrl}`);
      return;
    }

    if (isForbidden) {
      void logAuditEvent({
        action: "unauthorized_access_attempt",
        category: "access",
        metadata: {
          path: location,
          requiredRoles: requiredRoles.split(","),
          userRole,
        },
        status: "failure",
      });
      setLocation("/403?reason=forbidden");
    }
  }, [isForbidden, isLoading, isAuthenticated, location, loginReason, requiredRoles, setLocation, user, userRole]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" aria-label="Redirecting to sign in" />
      </div>
    );
  }

  if (isForbidden) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" aria-label="Redirecting to forbidden page" />
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireRole;
