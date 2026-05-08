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
  const { isAuthenticated, isLoading, role, user } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setLocation(`/auth/login?next=${encodeURIComponent(location)}`);
      return;
    }

    if (!roles.includes(role)) {
      logAuditEvent({
        action: "role_guard_denied",
        category: "access",
        status: "failure",
        metadata: {
          requiredRoles: roles,
          actualRole: role,
          userId: user?.id,
          path: location,
        },
      });
      setLocation("/403");
    }
  }, [isAuthenticated, isLoading, location, role, roles, setLocation, user?.id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated || !roles.includes(role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return <>{children}</>;
}

export default RequireRole;
