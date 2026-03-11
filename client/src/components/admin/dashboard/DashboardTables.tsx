// Dashboard Tables Component - Recent Activity and Data Tables

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, Clock, User, FileText } from 'lucide-react';
import { formatTimeAgo } from '@/lib/admin/utils';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/lib/admin/types';

interface DashboardTablesProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

function getActivityIcon(type: string) {
  if (type.includes('user')) return User;
  if (type.includes('calculation') || type.includes('tax')) return FileText;
  return Activity;
}

function getActivityColor(action: string) {
  if (action.includes('user')) return 'text-blue-600 bg-blue-100';
  if (action.includes('calculation') || action.includes('tax')) return 'text-green-600 bg-green-100';
  if (action.includes('payment')) return 'text-yellow-600 bg-yellow-100';
  return 'text-gray-600 bg-gray-100';
}

export function RecentActivityTable({ stats, isLoading }: DashboardTablesProps) {
  const activities = stats.recent_activity || [];

  if (isLoading) {
    return (
      <Card className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-indigo-600" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {activities.map((activity) => {
                const Icon = getActivityIcon(activity.resource_type || '');
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={cn('p-2 rounded-lg', getActivityColor(activity.action || ''))}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.action || 'Activity'}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">{activity.user || 'System'}</span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardTables({ stats, isLoading }: DashboardTablesProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RecentActivityTable stats={stats} isLoading={isLoading} />
      
      {/* Quick Stats Card */}
      <Card className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Total Calculations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.calculations.total.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.new_this_month}</p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Popular Services</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.services.popular.slice(0, 2).join(', ')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

