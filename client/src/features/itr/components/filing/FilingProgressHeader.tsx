import { AlertTriangle, CheckCircle2, Loader2, WifiOff } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { GuidedStep } from "./guided-filing-ui";

export type FilingSaveState = "saved" | "saving" | "error" | "offline";

const SAVE_STATE_DETAILS = {
  saved: { label: "Saved", icon: CheckCircle2, className: "text-emerald-700" },
  saving: { label: "Saving", icon: Loader2, className: "animate-spin text-blue-700" },
  error: { label: "Save failed", icon: AlertTriangle, className: "text-red-700" },
  offline: { label: "Offline", icon: WifiOff, className: "text-amber-800" },
} as const;

export function FilingProgressHeader({
  steps,
  currentStep,
  currentPane,
  paneCount = 1,
  saveState,
  recommendation,
  ownerLabel,
  visitedSteps = [],
  onStepChange,
}: {
  steps: readonly GuidedStep[];
  currentStep: number;
  currentPane: number;
  paneCount?: number;
  saveState: FilingSaveState;
  recommendation?: string;
  ownerLabel?: string;
  visitedSteps?: readonly number[];
  onStepChange?: (step: number) => void;
}) {
  const activeStep = steps[currentStep];
  const saveDetails = SAVE_STATE_DETAILS[saveState];
  const SaveIcon = saveDetails.icon;
  const progress = steps.length ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-2 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">
            {activeStep?.title ?? "Filing"}
            {" \u00b7 "}
            {Math.min(currentStep + 1, steps.length)} of {steps.length}
          </p>
          <p className="text-xs font-semibold text-slate-500">
            Pane {Math.min(currentPane + 1, paneCount)} of {paneCount}
            {ownerLabel ? <> {"·"} {ownerLabel}</> : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span aria-label={saveDetails.label} title={saveDetails.label}>
            <SaveIcon className={cn("h-4 w-4", saveDetails.className)} />
          </span>
          {recommendation ? (
            <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-black text-blue-800">
              {recommendation}
            </span>
          ) : null}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="flex gap-1">
          {steps.map((step, index) => {
            const canVisit = index === currentStep || visitedSteps.includes(index);
            return (
              <button
                key={step.id}
                type="button"
                aria-label={step.title}
                aria-current={index === currentStep ? "step" : undefined}
                disabled={!onStepChange || !canVisit}
                onClick={() => onStepChange?.(index)}
                className={cn(
                  "h-3 min-w-3 rounded-full border",
                  index === currentStep ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white",
                  canVisit && onStepChange && "cursor-pointer",
                )}
              />
            );
          })}
        </div>
        <Progress value={progress} aria-label="Filing progress" className="h-1.5 bg-slate-100" indicatorClassName="bg-blue-600" />
      </div>
    </header>
  );
}
