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
  // Role requirement temporarily disabled locally
  return <>{children}</>;
}

export default RequireRole;
