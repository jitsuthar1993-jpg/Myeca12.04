// Stat Card Component - Simple and Reusable

import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, description, change, icon, className }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;

  return (
    <Card className={cn(
      'bg-white/80 backdrop-blur-xl border border-white/20 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.05)] transition-all duration-500 overflow-hidden group',
      className
    )}>
      <CardContent className="p-7">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[13px] font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          {icon && (
            <div className="p-2.5 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors duration-500">
              {icon}
            </div>
          )}
        </div>
        <div className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">{value}</div>
        {description && (
          <p className="text-[11px] font-medium text-slate-400 mb-3 leading-none italic">{description}</p>
        )}
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1.5 text-[13px] font-medium py-1 px-2 rounded-full w-fit',
            isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          )}>
            {isPositive ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
            <span>{Math.abs(change).toFixed(1)}%</span>
            <span className="text-slate-400 font-normal ml-0.5">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

