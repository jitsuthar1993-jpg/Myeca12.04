import { useCallback } from 'react';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import { AdminBreadcrumb } from '@/components/admin/layout/AdminBreadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics } from '@/hooks/admin/useAnalytics';
import { Activity, FileText, FolderOpen, RefreshCw, Users } from 'lucide-react';

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

function StatCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: number | undefined;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <Card className="rounded-xl border border-indigo-100 bg-white/90 shadow-md backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{formatNumber(value)}</div>
        <p className="mt-2 text-xs font-medium text-gray-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsOverviewPage() {
  const { data, isLoading, error, refetch, isFetching } = useAnalytics();
  const stats = data?.data;

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <AdminLayout
      title="Analytics Overview"
      description="Database-backed operational counts for users, returns, documents, and content"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <AdminBreadcrumb
            items={[
              { label: 'Dashboard', href: '/admin' },
              { label: 'Analytics', href: '/admin/analytics' },
              { label: 'Overview', href: '/admin/analytics/overview' },
            ]}
          />

          <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error || data?.success === false ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-sm font-medium text-red-700">
                Error loading analytics data: {data?.error || (error instanceof Error ? error.message : 'Request failed')}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="rounded-xl border border-indigo-100 bg-white/90 shadow-md">
                <CardContent className="p-6">
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-8 w-16 animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 h-4 w-36 animate-pulse rounded bg-slate-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Users"
                value={stats?.userStats?.totalUsers}
                detail={`${formatNumber(stats?.userStats?.activeUsers)} active accounts`}
                icon={Users}
              />
              <StatCard
                title="Profiles"
                value={stats?.profileStats?.totalProfiles}
                detail="Stored taxpayer or business profiles"
                icon={FolderOpen}
              />
              <StatCard
                title="Tax Returns"
                value={stats?.returnStats?.totalReturns}
                detail={`${formatNumber(stats?.returnStats?.filedReturns)} filed or completed`}
                icon={FileText}
              />
              <StatCard
                title="Documents"
                value={stats?.docStats?.totalDocuments}
                detail="Document records available to the app"
                icon={Activity}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="rounded-xl border border-indigo-100 bg-white/90 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">Return Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ['Filed', stats?.returnStats?.filedReturns],
                    ['Draft', stats?.returnStats?.draftReturns],
                    ['Pending', stats?.returnStats?.pendingReturns],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-600">{label}</span>
                      <span className="text-sm font-black text-slate-950">{formatNumber(value as number)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-indigo-100 bg-white/90 shadow-md">
                <CardHeader>
                  <CardTitle className="text-base">Content Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ['Published posts', stats?.contentStats?.publishedPosts],
                    ['Total posts', stats?.contentStats?.totalPosts],
                    ['Admin users', stats?.userStats?.admins],
                    ['CA professionals', stats?.userStats?.caProfessionals],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-600">{label}</span>
                      <span className="text-sm font-black text-slate-950">{formatNumber(value as number)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
