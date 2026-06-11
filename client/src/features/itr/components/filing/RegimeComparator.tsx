import { useEffect, useState } from "react";
import { formatInr, StatusBadge } from "@/components/platform/compliance-ui";
import { cn } from "@/lib/utils";
import type { ItrRegimeComputation, ItrTaxLiabilitySummary } from "@shared/itr-filing";

type Regime = "old" | "new";

function savingsLabel(liability: ItrTaxLiabilitySummary) {
  const difference = liability.oldRegime.grossTaxLiability - liability.newRegime.grossTaxLiability;
  if (difference === 0) return "Both regimes have the same gross tax liability.";
  return difference > 0
    ? `New regime saves ${formatInr(difference)}`
    : `Old regime saves ${formatInr(Math.abs(difference))}`;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <span className="text-sm font-black text-slate-950">{value}</span>
    </div>
  );
}

function RegimePanel({ regime, computation, active }: { regime: Regime; computation: ItrRegimeComputation; active: boolean }) {
  const title = regime === "new" ? "New regime" : "Old regime";
  return (
    <section className={cn("rounded-lg border p-5", active ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white")}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="type-card-title font-black text-slate-950">{title}</h3>
        {active ? <StatusBadge status="filed" label="Active" /> : null}
      </div>
      <div className="mt-4 grid gap-2">
        <SummaryLine label="Gross income" value={formatInr(computation.grossIncome)} />
        <SummaryLine label="Standard deduction" value={formatInr(computation.standardDeduction)} />
        <SummaryLine label="Eligible deductions" value={formatInr(computation.eligibleDeductions)} />
        <SummaryLine label="Taxable income" value={formatInr(computation.taxableIncome)} />
        <SummaryLine label="Tax before cess" value={formatInr(computation.taxBeforeCess)} />
        <SummaryLine label="Cess" value={formatInr(computation.cess)} />
      </div>
    </section>
  );
}

export function RegimeComparator({
  liability,
  selectedRegime,
  onRegimeChange,
}: {
  liability: ItrTaxLiabilitySummary;
  selectedRegime?: Regime;
  onRegimeChange?: (regime: Regime) => void;
}) {
  const [internalRegime, setInternalRegime] = useState<Regime>(selectedRegime ?? liability.activeRegime);
  const activeRegime = selectedRegime ?? internalRegime;

  useEffect(() => {
    if (!selectedRegime) setInternalRegime(liability.activeRegime);
  }, [liability.activeRegime, selectedRegime]);

  const selectRegime = (regime: Regime) => {
    setInternalRegime(regime);
    onRegimeChange?.(regime);
  };

  return (
    <div>
      <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1 lg:hidden">
        {(["new", "old"] as const).map((regime) => (
          <button
            key={regime}
            type="button"
            aria-pressed={activeRegime === regime}
            onClick={() => selectRegime(regime)}
            className={cn(
              "min-h-11 rounded-md px-3 text-sm font-black",
              activeRegime === regime ? "bg-white text-blue-800 shadow-sm" : "text-slate-600",
            )}
          >
            {regime === "new" ? "New regime" : "Old regime"}
          </button>
        ))}
      </div>
      <p className="my-3 text-sm font-black text-blue-800">{savingsLabel(liability)}</p>
      <div className="lg:hidden">
        <RegimePanel
          regime={activeRegime}
          computation={activeRegime === "new" ? liability.newRegime : liability.oldRegime}
          active={activeRegime === liability.activeRegime}
        />
      </div>
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <RegimePanel regime="new" computation={liability.newRegime} active={liability.activeRegime === "new"} />
        <RegimePanel regime="old" computation={liability.oldRegime} active={liability.activeRegime === "old"} />
      </div>
    </div>
  );
}
