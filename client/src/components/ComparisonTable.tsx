import React from "react";
import { Check, X, Shield, Clock, Calculator, UserCheck, Smartphone } from "lucide-react";
import { MobileCard } from "@/components/mobile";

const comparisonData = [
  {
    feature: "CA Review",
    myeCA: "Every return manually reviewed by a named CA",
    diy: "None - You're on your own",
    other: "AI/Bot review or optional batch review",
    icon: UserCheck
  },
  {
    feature: "Refund Optimization",
    myeCA: "Maximum refund guaranteed (Section 80C, 80D, etc.)",
    diy: "Likely to miss common deductions",
    other: "Basic automated deduction matching",
    icon: Calculator
  },
  {
    feature: "Accuracy Guarantee",
    myeCA: "Professional liability assumed for every filing",
    diy: "High risk of notices due to errors",
    other: "Standard disclaimer - no liability",
    icon: Shield
  },
  {
    feature: "Filing Speed",
    myeCA: "Done in 15 mins; CA review within 24 hours",
    diy: "Hours of manual data entry",
    other: "3-5 business days for batch processing",
    icon: Clock
  },
  {
    feature: "Post-Filing Support",
    myeCA: "Year-round expert assistance for tax notices",
    diy: "None",
    other: "Paid add-ons or bot support only",
    icon: Smartphone
  }
];

export function ComparisonTable() {
  return (
    <>
      <div className="md:hidden space-y-3">
        {comparisonData.map((item, idx) => {
          const Icon = item.icon;
          return (
            <MobileCard key={idx} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold leading-snug text-slate-950">{item.feature}</h3>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-600">MyeCA.in advantage</p>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-900">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={3} />
                <span className="text-sm font-semibold leading-snug">{item.myeCA}</span>
              </div>

              <div className="space-y-1.5 text-xs leading-snug text-slate-500">
                <div className="flex gap-2">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" strokeWidth={3} />
                  <span><span className="font-semibold text-slate-700">DIY:</span> {item.diy}</span>
                </div>
                <div className="flex gap-2">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" strokeWidth={3} />
                  <span><span className="font-semibold text-slate-700">Others:</span> {item.other}</span>
                </div>
              </div>
            </MobileCard>
          );
        })}
      </div>

      <div className="hidden w-full overflow-x-auto md:block">
      <table className="w-full border-collapse bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="p-6 text-left text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Feature</th>
            <th className="p-6 text-left border-b border-slate-100 bg-blue-50/30">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-blue-600">MyeCA.in</span>
                <span className="px-2 py-0.5 bg-blue-600 text-[10px] text-white font-bold rounded-full uppercase tracking-tighter">Recommended</span>
              </div>
            </th>
            <th className="p-6 text-left text-sm font-bold text-slate-600 border-b border-slate-100">DIY / Govt Portal</th>
            <th className="p-6 text-left text-sm font-bold text-slate-600 border-b border-slate-100">Other Platforms</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {comparisonData.map((item, idx) => {
            const Icon = item.icon;
            return (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900">{item.feature}</span>
                    </div>
                  </div>
                </td>
                <td className="p-6 bg-blue-50/10">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 p-0.5 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{item.myeCA}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-start gap-2">
                    <div className="mt-0.5 p-0.5 bg-rose-100 text-rose-600 rounded-full shrink-0">
                      <X className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-slate-500 font-medium">{item.diy}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-start gap-2 opacity-70">
                    <div className="mt-0.5 p-0.5 bg-amber-100 text-amber-600 rounded-full shrink-0">
                      <X className="w-3.5 h-3.5" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-slate-500 font-medium">{item.other}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        </table>
      </div>
    </>
  );
}
