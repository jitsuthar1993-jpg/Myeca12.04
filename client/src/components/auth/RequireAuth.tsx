import { useAuth } from "@/components/AuthProvider";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { PageSkeleton } from "@/components/ui/page-skeleton";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  // Authentication temporarily disabled locally
  return <>{children}</>;
}
