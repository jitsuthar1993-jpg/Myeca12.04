// Dashboard Statistics Cards Component

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Users, ShoppingBag, Activity, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/admin/utils';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/lib/admin/types';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  icon: React.ElementType;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, subtitle, change, icon: Icon, iconBg = 'bg-blue-100', trend = 'neutral' }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const ChangeIcon = isPositive ? ArrowUp : ArrowDown;
  
  return (
    <Card className="h-full bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn('p-3 rounded-lg', iconBg)}>
            <Icon className={cn('h-6 w-6', iconBg.includes('blue') ? 'text-[#003087]' : iconBg.includes('green') ? 'text-green-600' : 'text-[#003087]')} />
          </div>
          {change !== undefined && (
            <Badge className={cn(
              'flex items-center gap-1',
              isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}>
              <ChangeIcon className="h-3 w-3" />
              {Math.abs(change).toFixed(1)}%
            </Badge>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-[#003087] mb-1">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export function DashboardStats({ stats, isLoading = false }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="h-full animate-pulse">
            <CardContent className="p-6">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Revenue"
        value={formatCurrency(stats.revenue.total)}
        subtitle={`This month: ${formatCurrency(stats.revenue.thisMonth)}`}
        change={stats.revenue.growthPercent}
        icon={Coins}
        iconBg="bg-gradient-to-br from-blue-100 to-indigo-100"
        trend={stats.revenue.growthPercent >= 0 ? 'up' : 'down'}
      />
      
      <StatCard
        title="Total Users"
        value={formatNumber(stats.users.total)}
        subtitle={`Active: ${formatNumber(stats.users.active)}`}
        change={stats.users.growthPercent}
        icon={Users}
        iconBg="bg-gradient-to-br from-green-100 to-emerald-100"
        trend={stats.users.growthPercent >= 0 ? 'up' : 'down'}
      />
      
      <StatCard
        title="Active Services"
        value={formatNumber(stats.services.active)}
        subtitle={`Total: ${formatNumber(stats.services.total)} services`}
        icon={ShoppingBag}
        iconBg="bg-gradient-to-br from-purple-100 to-pink-100"
      />
      
      <StatCard
        title="System Health"
        value={stats.systemHealth.status === 'healthy' ? '99.9%' : 'Warning'}
        subtitle={`Uptime: ${stats.systemHealth.uptime}%`}
        icon={Activity}
        iconBg={cn(
          stats.systemHealth.status === 'healthy' 
            ? 'bg-gradient-to-br from-green-100 to-emerald-100'
            : 'bg-gradient-to-br from-yellow-100 to-orange-100'
        )}
      />
    </div>
  );
}

