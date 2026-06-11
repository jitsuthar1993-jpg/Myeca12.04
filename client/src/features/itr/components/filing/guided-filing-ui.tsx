import { useId, type ComponentPropsWithoutRef } from "react";
import { CheckCircle2, CircleAlert, FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatInr } from "@/components/platform/compliance-ui";
import { cn } from "@/lib/utils";
import type {
  ItrTaxLiabilitySummary,
  ItrVerificationIssue,
} from "@shared/itr-filing";

export type GuidedStep = {
  id: string;
  title: string;
  description: string;
};

export function GuidedStepNav({
  steps,
  currentStep,
  onStepChange,
}: {
  steps: readonly GuidedStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-2">
      <div className="flex min-w-max gap-2">
        {steps.map((step, index) => {
          const active = index === currentStep;
          const complete = index < currentStep;

          return (
            <button
              key={step.id}
              type="button"
              aria-current={active ? "step" : undefined}
              onClick={() => onStepChange(index)}
              className={cn(
                "flex min-h-14 w-[164px] items-center gap-2 rounded-lg border px-3 text-left transition",
                active && "border-blue-500 bg-blue-50 text-blue-950",
                complete && "border-emerald-200 bg-emerald-50 text-emerald-950",
                !active && !complete && "border-transparent bg-slate-50 text-slate-600 hover:bg-slate-100",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-black",
                  active && "border-blue-500 bg-blue-600 text-white",
                  complete && "border-emerald-500 bg-emerald-600 text-white",
                  !active && !complete && "border-slate-200 bg-white text-slate-500",
                )}
              >
                {complete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-black">{step.title}</span>
                <span className="mt-0.5 hidden truncate text-xs font-semibold opacity-75 lg:block">
                  {step.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ChoiceButton({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "min-h-[88px] rounded-lg border p-4 text-left transition",
        selected
          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
          : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50",
      )}
    >
      <span className="flex items-start gap-3">
        {selected ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
        ) : (
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
        )}
        <span>
          <span className="block text-sm font-black text-slate-950">{title}</span>
          <span className="mt-1 block text-sm font-semibold leading-6 text-slate-600">
            {description}
          </span>
        </span>
      </span>
    </button>
  );
}

export type TextInputProps = Omit<ComponentPropsWithoutRef<typeof Input>, "value" | "onChange"> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helper?: string;
  error?: string;
};

export function TextInput({
  label,
  value,
  onChange,
  type = "text",
  helper,
  error,
  className,
  ...inputProps
}: TextInputProps) {
  const inputId = useId();
  const helperId = helper ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        {...inputProps}
        id={inputId}
        type={type}
        value={value ?? ""}
        aria-invalid={Boolean(error)}
        aria-describedby={[helperId, errorId].filter(Boolean).join(" ") || undefined}
        onChange={(event) => onChange(event.target.value)}
        className={cn("mt-2 h-11 scroll-mb-24 rounded-lg", className)}
      />
      {helper ? <p id={helperId} className="mt-1 text-xs font-semibold text-slate-500">{helper}</p> : null}
      {error ? <p id={errorId} className="mt-1 text-xs font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}

export function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const inputId = useId();

  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <Input
        id={inputId}
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-2 h-11 rounded-lg"
      />
    </div>
  );
}

export function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-[82px] items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm font-black text-slate-950">{title}</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function FilingSummaryStrip({
  recommendation,
  requiredDocuments,
  issueCount,
  liability,
}: {
  recommendation: string;
  requiredDocuments: number;
  issueCount: number;
  liability: ItrTaxLiabilitySummary;
}) {
  const amountLabel = liability.refundDue > 0
    ? `Refund ${formatInr(liability.refundDue)}`
    : liability.taxPayable > 0
      ? `Payable ${formatInr(liability.taxPayable)}`
      : "No payable tax";

  return (
    <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-4">
      <SummaryItem label="ITR recommendation" value={recommendation} />
      <SummaryItem label="Required documents" value={`${requiredDocuments}`} />
      <SummaryItem label="Rule checks" value={issueCount ? `${issueCount} open` : "Clear"} />
      <SummaryItem label="Tax liability" value={amountLabel} emphasis />
    </div>
  );
}

function SummaryItem({ label, value, emphasis = false }: { label: string; value: string; emphasis?: boolean }) {
  return (
    <div className="rounded-md bg-white px-3 py-2">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className={cn("mt-1 text-sm font-black", emphasis ? "text-blue-700" : "text-slate-950")}>{value}</p>
    </div>
  );
}

export function IssueList({
  issues,
  onIssueNavigate,
}: {
  issues: ItrVerificationIssue[];
  onIssueNavigate?: (issue: ItrVerificationIssue) => void;
}) {
  if (!issues.length) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
        <ShieldCheck className="h-5 w-5 text-emerald-700" />
        <p className="mt-2 text-sm font-black text-emerald-950">No open rule issues</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-emerald-800">
          The draft is ready for the next review step based on current inputs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className={cn(
            "rounded-lg border p-4",
            issue.severity === "critical"
              ? "border-red-200 bg-red-50"
              : issue.severity === "warning"
                ? "border-amber-200 bg-amber-50"
                : "border-blue-200 bg-blue-50",
          )}
        >
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-slate-700" />
            <div>
              <p className="text-sm font-black text-slate-950">{issue.title}</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">{issue.detail}</p>
              {onIssueNavigate ? (
                <button
                  type="button"
                  onClick={() => onIssueNavigate(issue)}
                  className="mt-2 text-left text-xs font-black uppercase tracking-[0.12em] text-blue-700 underline-offset-4 hover:underline"
                >
                  {issue.action}
                </button>
              ) : (
                <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-slate-500">{issue.action}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
