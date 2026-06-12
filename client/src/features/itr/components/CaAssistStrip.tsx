import { BadgeCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const GENERIC_COPY = "Every filing is reviewed by a MyeCA chartered accountant before submission.";

export function CaAssistStrip({
  variant = "banner",
  assignedCaName,
  className,
}: {
  variant?: "banner" | "pill" | "inline";
  assignedCaName?: string | null;
  className?: string;
}) {
  const caName = typeof assignedCaName === "string" ? assignedCaName.trim() : "";

  if (variant === "pill") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-800",
          className,
        )}
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        CA-assisted
      </span>
    );
  }

  if (variant === "inline") {
    return (
      <p className={cn("flex items-start gap-2 text-sm font-semibold leading-6 text-slate-600", className)}>
        <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        <span>{caName ? `${caName}, your assigned CA, reviews this filing.` : GENERIC_COPY}</span>
      </p>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3",
        className,
      )}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700">
        <ShieldCheck className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-emerald-900">CA-assisted filing</p>
        <p className="mt-0.5 text-sm font-semibold leading-6 text-emerald-800">
          {caName
            ? `${caName}, your assigned chartered accountant, reviews your return before it is filed.`
            : GENERIC_COPY}
        </p>
      </div>
    </div>
  );
}
