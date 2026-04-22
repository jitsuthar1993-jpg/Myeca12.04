import React from "react";
import { cn } from "@/lib/utils";

interface CalcGlassSidebarProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function CalcGlassSidebar({ 
  children, 
  title = "Result Summary",
  className 
}: CalcGlassSidebarProps) {
  return (
    <div className={cn(
      "sticky top-24 space-y-6",
      className
    )}>
      <div className="relative group">
        {/* Glass Container */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl rounded-[2.5rem] -z-10 border border-white/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] transition-all group-hover:bg-white/60" />
        
        <div className="p-8 lg:p-10 space-y-8">
          {title && (
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
              <div className="w-12 h-1 bg-primary/20 rounded-full" />
            </div>
          )}
          
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CalcResultRow({ 
  label, 
  value, 
  subValue,
  variant = "default",
  className
}: { 
  label: string; 
  value: string | React.ReactNode; 
  subValue?: string;
  variant?: "default" | "highlight" | "success" | "warning";
  className?: string;
}) {
  const variantStyles = {
    default: "text-slate-900",
    highlight: "text-primary font-bold",
    success: "text-emerald-600 font-bold",
    warning: "text-amber-600 font-bold",
  };

  return (
    <div className={cn("flex items-center justify-between gap-4 py-1", className)}>
      <div className="space-y-0.5">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        {subValue && (
          <p className="text-[10px] text-slate-400 font-medium italic">
            {subValue}
          </p>
        )}
      </div>
      <div className={cn("text-lg tabular-nums", variantStyles[variant])}>
        {value}
      </div>
    </div>
  );
}
