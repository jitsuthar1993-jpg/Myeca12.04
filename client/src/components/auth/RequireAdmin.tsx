import React from "react";
import { useAuth } from "@/components/AuthProvider";
import { Loader2 } from "lucide-react";

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin" && !(user as any).is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">403 • Forbidden</h1>
          <p className="text-gray-600">You don’t have permission to access this section.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;

