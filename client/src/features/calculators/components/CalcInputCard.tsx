import React from "react";
import { cn } from "@/lib/utils";

interface CalcInputCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  icon?: React.ReactNode;
}

export default function CalcInputCard({ 
  children, 
  title, 
  className,
  icon 
}: CalcInputCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-[2.5rem] border border-slate-100 p-8 lg:p-10 space-y-8 shadow-sm transition-all hover:shadow-md",
      className
    )}>
      {title && (
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
              {icon}
            </div>
          )}
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
        </div>
      )}
      
      <div className="space-y-10">
        {children}
      </div>
    </div>
  );
}

export function CalcInputGroup({ 
  label, 
  children, 
  badgeValue,
  onBadgeClick 
}: { 
  label: string; 
  children: React.ReactNode; 
  badgeValue?: string;
  onBadgeClick?: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">
          {label}
        </label>
        {badgeValue && (
          <button 
            onClick={onBadgeClick}
            className="px-4 py-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary font-bold text-sm transition-all border border-primary/10"
          >
            {badgeValue}
          </button>
        )}
      </div>
      <div className="px-2">
        {children}
      </div>
    </div>
  );
}
