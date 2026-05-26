import React from "react";
import { cn } from "@/lib/utils";

interface CalcInputCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  contentClassName?: string;
  icon?: React.ReactNode;
}

export default function CalcInputCard({ 
  children, 
  title, 
  className,
  contentClassName,
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
          <h3 className="type-card-title font-normal text-slate-900">
            {title}
          </h3>
        </div>
      )}
      
      <div className={cn("space-y-10", contentClassName)}>
        {children}
      </div>
    </div>
  );
}

export function CalcInputGroup({ 
  label, 
  children, 
  badgeValue,
  onBadgeClick,
  className,
  controlClassName
}: { 
  label: React.ReactNode; 
  children: React.ReactNode; 
  badgeValue?: string;
  onBadgeClick?: () => void;
  className?: string;
  controlClassName?: string;
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <label className="type-meta font-normal uppercase tracking-widest text-slate-500">
          {label}
        </label>
        {badgeValue && (
          <button 
            onClick={onBadgeClick}
            className="px-4 py-1.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary font-normal text-sm transition-all border border-primary/10"
          >
            {badgeValue}
          </button>
        )}
      </div>
      <div className={cn("px-2", controlClassName)}>
        {children}
      </div>
    </div>
  );
}
