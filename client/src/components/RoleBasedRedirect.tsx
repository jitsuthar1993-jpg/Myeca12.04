import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/components/AuthProvider";
import HomePage from "@/pages/home.page";
import { Loader2 } from "lucide-react";

export default function RoleBasedRedirect() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === "admin") {
        setLocation("/admin/dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If not authenticated, show the homepage
  if (!isAuthenticated) {
    return <HomePage />;
  }

  // While redirecting, show loading
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );
}