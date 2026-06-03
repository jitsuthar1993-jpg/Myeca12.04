import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { getRoleHome, normalizeAppRole, type AppRole } from '@shared/app-roles';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: AppRole;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requiredRole,
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const role = normalizeAppRole(user?.role);
  const roleRedirectPath = requiredRole && role !== requiredRole ? getRoleHome(role) : null;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setLocation(redirectTo);
      return;
    }

    if (roleRedirectPath) {
      setLocation(roleRedirectPath);
    }
  }, [isAuthenticated, isLoading, redirectTo, roleRedirectPath, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Opening sign in...</p>
        </div>
      </div>
    );
  }

  if (roleRedirectPath) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Opening your workspace...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
