import { ChevronUp } from "lucide-react";
import { formatInr } from "@/components/platform/compliance-ui";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import type { ItrTaxLiabilitySummary } from "@shared/itr-filing";
import { FilingSummaryStrip } from "./guided-filing-ui";

function getLiabilityPresentation(liability: ItrTaxLiabilitySummary) {
  if (liability.refundDue > 0) {
    return { label: `Refund ${formatInr(liability.refundDue)}`, tone: "border-emerald-200 bg-emerald-50 text-emerald-800" };
  }
  if (liability.taxPayable > 0) {
    return { label: `Payable ${formatInr(liability.taxPayable)}`, tone: "border-amber-200 bg-amber-50 text-amber-900" };
  }
  if (liability.status === "review_required") {
    return { label: "Tax estimate needs review", tone: "border-slate-200 bg-slate-50 text-slate-700" };
  }
  return { label: "No payable tax", tone: "border-emerald-200 bg-emerald-50 text-emerald-800" };
}

export function LiabilityChip({
  liability,
  onClick,
  className,
}: {
  liability: ItrTaxLiabilitySummary;
  onClick: () => void;
  className?: string;
}) {
  const presentation = getLiabilityPresentation(liability);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex min-h-11 w-full items-center justify-between rounded-lg border px-4 text-sm font-black", presentation.tone, className)}
    >
      {presentation.label}
      <ChevronUp className="h-4 w-4" />
    </button>
  );
}

export function LiabilitySheet({
  open,
  onOpenChange,
  liability,
  recommendation = "Pending",
  requiredDocuments = 0,
  issueCount = 0,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liability: ItrTaxLiabilitySummary;
  recommendation?: string;
  requiredDocuments?: number;
  issueCount?: number;
}) {
  const activeRegime = liability.activeRegime === "old" ? "Old regime" : "New regime";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto rounded-t-2xl border-slate-200">
        <SheetHeader>
          <SheetTitle className="font-black text-slate-950">Tax liability</SheetTitle>
          <SheetDescription className="font-semibold text-slate-600">
            {activeRegime} is active. Figures update with the filing draft.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-5">
          <FilingSummaryStrip
            recommendation={recommendation}
            requiredDocuments={requiredDocuments}
            issueCount={issueCount}
            liability={liability}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
