import { ReactNode } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { getRoleHome, type AppRole } from '@shared/app-roles';

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
    setLocation(redirectTo);
    return null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    setLocation(getRoleHome(user?.role));
    return null;
  }

  return <>{children}</>;
};
