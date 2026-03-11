import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export type StatusValue =
  | "draft"
  | "filed"
  | "verified"
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled"
  | string;

interface StatusChipProps extends React.HTMLAttributes<HTMLDivElement> {
  status: StatusValue;
  size?: "sm" | "md";
}

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-100 text-green-700 border-green-200",
  filed: "bg-green-100 text-green-700 border-green-200",
  verified: "bg-blue-100 text-blue-700 border-blue-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  completed: <CheckCircle className="h-4 w-4" />,
  filed: <CheckCircle className="h-4 w-4" />,
  verified: <CheckCircle className="h-4 w-4" />,
  in_progress: <Clock className="h-4 w-4" />,
  draft: <Clock className="h-4 w-4" />,
  pending: <AlertCircle className="h-4 w-4" />,
  cancelled: <AlertCircle className="h-4 w-4" />,
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completed",
  filed: "Filed",
  verified: "Verified",
  in_progress: "In Progress",
  draft: "Draft",
  pending: "Pending",
  cancelled: "Cancelled",
};

export function StatusChip({ status, size = "md", className, ...props }: StatusChipProps) {
  const key = String(status).toLowerCase();
  const colorClass = STATUS_STYLES[key] ?? "bg-gray-100 text-gray-700 border-gray-200";
  const icon = STATUS_ICONS[key] ?? <AlertCircle className="h-4 w-4" />;
  const label = STATUS_LABELS[key] ?? status;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1",
        size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-0.5",
        colorClass,
        className
      )}
      {...props}
    >
      {icon}
      <span className="capitalize">{label}</span>
    </Badge>
  );
}