import { useState } from 'react';
import { Layout } from '@/components/admin/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GoogleAnalyticsDashboard } from '@/components/admin/analytics/GoogleAnalyticsDashboard';
import { useAnalytics } from '@/hooks/admin/useAnalytics';
import type { AnalyticsDateRange } from '@/lib/admin/types';
import { Activity, ArrowUpRight, FileText, FolderOpen, RefreshCw, Users } from 'lucide-react';

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat('en-IN').format(value || 0);
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number | undefined;
  description: string;
  icon: typeof Users;
}) {
  return (
    <Card className="border-slate-200 bg-white p-3 rounded-lg shadow-none group transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-0">{title}</p>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5 leading-none">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900 leading-none">{formatNumber(value)}</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<AnalyticsDateRange>('30d');
  const { data, isLoading, error, refetch, isFetching } = useAnalytics({ range });
  const stats = data?.data;

  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Analytics Overview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Database-backed operational counts. Traffic and revenue metrics will appear after a live analytics source is connected.
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error || data?.success === false ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm font-medium text-red-700">
              Unable to load analytics overview: {data?.error || (error instanceof Error ? error.message : 'Request failed')}
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="rounded-xl border-slate-200">
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard
                title="Users"
                value={stats?.userStats?.totalUsers}
                description={`${formatNumber(stats?.userStats?.activeUsers)} active, ${formatNumber(stats?.userStats?.pendingUsers)} pending`}
                icon={Users}
              />
              <MetricCard
                title="Profiles"
                value={stats?.profileStats?.totalProfiles}
                description="Customer profile records in the database"
                icon={FolderOpen}
              />
              <MetricCard
                title="Tax Returns"
                value={stats?.returnStats?.totalReturns}
                description={`${formatNumber(stats?.returnStats?.filedReturns)} filed, ${formatNumber(stats?.returnStats?.draftReturns)} drafts`}
                icon={FileText}
              />
              <MetricCard
                title="Documents"
                value={stats?.docStats?.totalDocuments}
                description="Uploaded and generated document records"
                icon={Activity}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="rounded-xl border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">User Roles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    ['Admins', stats?.userStats?.admins],
                    ['CA professionals', stats?.userStats?.caProfessionals],
                    ['Active users', stats?.userStats?.activeUsers],
                    ['Pending users', stats?.userStats?.pendingUsers],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-600">{label}</span>
                      <span className="text-sm font-black text-slate-950">{formatNumber(value as number)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-xl border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base">Content And Returns</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    ['Published posts', stats?.contentStats?.publishedPosts],
                    ['Total posts', stats?.contentStats?.totalPosts],
                    ['Filed returns', stats?.returnStats?.filedReturns],
                    ['Pending returns', stats?.returnStats?.pendingReturns],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                      <span className="text-sm font-semibold text-slate-600">{label}</span>
                      <span className="text-sm font-black text-slate-950">{formatNumber(value as number)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <GoogleAnalyticsDashboard
              report={stats?.googleAnalytics}
              selectedRange={range}
              onRangeChange={setRange}
            />
          </>
        )}
      </div>
    </Layout>
  );
}
