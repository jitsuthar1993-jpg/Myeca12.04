// Analytics Overview Page

import { useState, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb';
import { DashboardFilters } from '@/components/admin/dashboard/DashboardFilters';
import { AnalyticsCharts } from '@/components/admin/dashboard/AnalyticsCharts';
import { useAnalytics } from '@/hooks/admin/useAnalytics';
import { DATE_RANGES } from '@/lib/admin/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Eye, Clock, MousePointerClick } from 'lucide-react';

export default function AnalyticsOverviewPage() {
  const [dateRange, setDateRange] = useState<string>(DATE_RANGES.LAST_30_DAYS);
  const { data: analyticsData, isLoading, error, refetch } = useAnalytics({ date_from: dateRange });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <AdminLayout
      title="Analytics Overview"
      description="Comprehensive analytics and insights for your platform"
    >
      <div className="space-y-6">
        {/* Breadcrumb */}
        <AdminBreadcrumb
          items={[
            { label: 'Dashboard', href: '/admin' },
            { label: 'Analytics', href: '/admin/analytics' },
            { label: 'Overview', href: '/admin/analytics/overview' },
          ]}
        />

        {/* Filters */}
        <DashboardFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onRefresh={handleRefresh}
        />

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Page Views</CardTitle>
              <Eye className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">24,578</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-100 text-green-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </Badge>
                <span className="text-xs text-gray-500">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Unique Visitors</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">8,934</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-100 text-green-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.3%
                </Badge>
                <span className="text-xs text-gray-500">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Session Duration</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">4:23</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-100 text-green-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15.2%
                </Badge>
                <span className="text-xs text-gray-500">vs last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Bounce Rate</CardTitle>
              <MousePointerClick className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">42.3%</div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-100 text-green-700">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  -5.2%
                </Badge>
                <span className="text-xs text-gray-500">vs last period</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Banner */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-sm text-red-600">
                Error loading analytics data. Please try refreshing.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Analytics Charts */}
        <AnalyticsCharts data={analyticsData} isLoading={isLoading} />
      </div>
    </AdminLayout>
  );
}
