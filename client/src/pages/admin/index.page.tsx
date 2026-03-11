// Admin Dashboard - Simple and Clean

import { Layout } from '@/components/admin/Layout';
import { StatCard } from '@/components/admin/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStats } from '@/hooks/admin/useStats';
import { RefreshCw, Users, Coins, ShoppingBag, Activity, AlertCircle } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/admin/utils';
import { Chart } from '@/components/admin/Chart';

export default function AdminDashboard() {
  const { stats, isLoading, error, refetch } = useStats();

  if (error) {
    return (
      <Layout title="Dashboard">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Error loading dashboard</h3>
                <p className="text-sm text-red-700">{error.message || 'Failed to load data'}</p>
                <Button onClick={() => refetch()} variant="outline" className="mt-2" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
            <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
          </div>
          <Button onClick={() => refetch()} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(stats.revenue.total)}
            change={stats.revenue.growth_percent}
            icon={<Coins className="h-5 w-5" />}
          />
          <StatCard
            title="Total Users"
            value={formatNumber(stats.users.total)}
            change={stats.users.growth_percent}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Active Services"
            value={formatNumber(stats.services.active)}
            icon={<ShoppingBag className="h-5 w-5" />}
          />
          <StatCard
            title="Calculations"
            value={formatNumber(stats.calculations.total)}
            icon={<Activity className="h-5 w-5" />}
          />
        </div>

        {/* Revenue Chart */}
        <Chart
          title="Revenue Trend"
          type="area"
          data={stats.recent_calculations?.map((item, index) => ({
            name: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            value: item.count * 1000, // Mock revenue calculation
          })) || []}
        />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : stats.recent_activity.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No recent activity</div>
            ) : (
              <div className="space-y-3">
                {stats.recent_activity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-500">{activity.user}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

