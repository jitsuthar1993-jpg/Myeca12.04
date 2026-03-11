import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee, TrendingUp, ShieldCheck, Zap } from "lucide-react";
import { TaxCalculationResult } from "@/types/calculator";
import { cn } from "@/lib/utils";

interface TaxStickySidebarProps {
  result: TaxCalculationResult | null;
  inputs: any;
  assessmentYear: string;
}

export default function TaxStickySidebar({ result, inputs, assessmentYear }: TaxStickySidebarProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (!result) return null;

  const totalIncome = inputs.income || 0;
  const taxPayable = result.taxPayable || 0;
  const netIncome = result.netIncome || 0;
  const effectiveRate = totalIncome > 0 ? (taxPayable / totalIncome) * 100 : 0;

  return (
    <div className="sticky top-24 space-y-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl shadow-slate-200 overflow-hidden relative"
      >
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-6 opacity-60">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Live Tax Summary</span>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Tax Payable</p>
              <h2 className="text-3xl font-black tracking-tight text-white flex items-baseline gap-1">
                {formatCurrency(taxPayable)}
                <span className="text-xs font-medium text-slate-500">/year</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Taxable Income</p>
                <p className="text-sm font-black text-slate-200">{formatCurrency(result.taxableIncome)}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">Effective Rate</p>
                <div className="flex items-center gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                   <p className="text-sm font-black text-emerald-400">{effectiveRate.toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
               <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Take Home Income</span>
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
               </div>
               <p className="text-lg font-black text-white">{formatCurrency(netIncome)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Regime Comparison Quick Peek */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
         <div className="flex items-center justify-between mb-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Comparison</h4>
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
         </div>
         <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
               <span className="text-slate-500 font-bold">New Regime</span>
               <span className="text-slate-900 font-black">{formatCurrency(taxPayable)}</span>
            </div>
            <div className="w-full bg-slate-50 h-1 rounded-full overflow-hidden">
               <div className="bg-blue-600 h-full" style={{ width: '100%' }} />
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic">
               Assumes {inputs.regime === 'new' ? 'New' : 'Old'} Regime is active.
            </p>
         </div>
      </div>
    </div>
  );
}
