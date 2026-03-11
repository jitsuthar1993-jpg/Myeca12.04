import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: string;
  label: string;
  description: string;
}

interface TaxStepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export default function TaxStepIndicator({ steps, currentStep, onStepClick }: TaxStepIndicatorProps) {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-10" />
        
        {/* Active Progress Line */}
        <div 
          className="absolute top-5 left-0 h-0.5 bg-blue-600 transition-all duration-500 -z-10" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <button
              key={step.id}
              onClick={() => onStepClick?.(index)}
              disabled={!isCompleted && !isActive}
              className="flex flex-col items-center group relative flex-1"
            >
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-white",
                  isActive && "border-blue-600 text-blue-600 shadow-lg shadow-blue-100 scale-110",
                  isCompleted && "border-blue-600 bg-blue-600 text-white",
                  !isActive && !isCompleted && "border-slate-200 text-slate-400"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3px]" />
                ) : (
                  <span className="text-sm font-bold">{index + 1}</span>
                )}
              </div>
              
              <div className="mt-3 text-center">
                <span className={cn(
                  "block text-[11px] font-black uppercase tracking-wider transition-colors",
                  isActive ? "text-slate-900" : "text-slate-400"
                )}>
                  {step.label}
                </span>
                <span className={cn(
                   "hidden md:block text-[10px] font-bold text-slate-300 mt-0.5 whitespace-nowrap",
                   isActive && "text-blue-500/60"
                )}>
                  {step.description}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
