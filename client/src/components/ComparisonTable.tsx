import { Calculator, Check, ClipboardCheck, Clock, FileText, Shield, UserCheck } from "lucide-react";
import { MobileCard } from "@/components/mobile";

const comparisonData = [
  {
    need: "Straightforward salary return",
    usefulWhen: "You want the right ITR form, AIS / 26AS checks, and deduction documents in one checklist.",
    prepareFirst: "Form 16, AIS / 26AS, bank interest, deduction proofs.",
    nextStep: "Start ITR",
    icon: FileText,
  },
  {
    need: "Capital gains or multiple income sources",
    usefulWhen: "Broker reports, AIS entries, salary, rent, or other income need to be reconciled before filing.",
    prepareFirst: "Broker report, AIS, purchase / sale details, salary or interest records.",
    nextStep: "Request scope review",
    icon: Calculator,
  },
  {
    need: "NRI, foreign asset, or residency facts",
    usefulWhen: "The filing path depends on residential status, India-sourced income, DTAA facts, or foreign disclosures.",
    prepareFirst: "Travel days, Indian income records, TDS details, foreign asset summary.",
    nextStep: "Request consultation",
    icon: UserCheck,
  },
  {
    need: "Tax notice or mismatch",
    usefulWhen: "You need to understand the notice reason, deadline, and evidence before responding on the portal.",
    prepareFirst: "Notice PDF or DIN, filed ITR, computation, supporting proofs.",
    nextStep: "Open notice service",
    icon: Shield,
  },
  {
    need: "Business GST, TDS, or audit-linked work",
    usefulWhen: "The service should begin with books, returns, due dates, and responsibility split before quoting.",
    prepareFirst: "Sales and purchase data, challans, books, last return status.",
    nextStep: "Request scope review",
    icon: Clock,
  },
];

export function ComparisonTable() {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {comparisonData.map((item) => {
          const Icon = item.icon;
          return (
            <MobileCard key={item.need} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-snug text-slate-950">{item.need}</h3>
                  <p className="type-meta font-semibold uppercase tracking-wide text-blue-600">When MyeCA is useful</p>
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold leading-snug text-blue-950">
                {item.usefulWhen}
              </div>

              <div className="space-y-2 text-xs leading-snug text-slate-600">
                <div className="flex gap-2">
                  <ClipboardCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span><span className="font-semibold text-slate-800">Prepare:</span> {item.prepareFirst}</span>
                </div>
                <div className="flex gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span><span className="font-semibold text-slate-800">Next:</span> {item.nextStep}</span>
                </div>
              </div>
            </MobileCard>
          );
        })}
      </div>

      <div className="hidden w-full overflow-x-auto md:block">
        <table className="w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <thead>
            <tr className="bg-slate-50">
              <th className="border-b border-slate-100 p-5 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">Filing need</th>
              <th className="border-b border-slate-100 bg-blue-50/70 p-5 text-left text-xs font-black uppercase tracking-[0.16em] text-blue-700">MyeCA support</th>
              <th className="border-b border-slate-100 p-5 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">Prepare first</th>
              <th className="border-b border-slate-100 p-5 text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">Best next step</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {comparisonData.map((item) => {
              const Icon = item.icon;
              return (
                <tr key={item.need} className="transition-colors hover:bg-slate-50/70">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-bold leading-snug text-slate-950">{item.need}</span>
                    </div>
                  </td>
                  <td className="bg-blue-50/30 p-5">
                    <div className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span className="text-sm font-semibold leading-6 text-slate-800">{item.usefulWhen}</span>
                    </div>
                  </td>
                  <td className="p-5 text-sm font-medium leading-6 text-slate-600">{item.prepareFirst}</td>
                  <td className="p-5 text-sm font-bold leading-6 text-blue-700">{item.nextStep}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
