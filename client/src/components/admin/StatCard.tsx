// Stat Card Component - Simple and Reusable

import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({ title, value, change, icon, className }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  
  return (
    <Card className={cn('bg-white', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-600">{title}</p>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}>
            {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{Math.abs(change).toFixed(1)}%</span>
            <span className="text-gray-500">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

