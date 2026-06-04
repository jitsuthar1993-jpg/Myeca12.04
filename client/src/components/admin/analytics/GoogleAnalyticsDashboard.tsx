import { Activity, BarChart3, Clock, Gauge, MousePointerClick, Target, TrendingUp, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AnalyticsDateRange, GoogleAnalyticsReport } from '@/lib/admin/types';

export type GoogleAnalyticsDashboardRange = AnalyticsDateRange;

const rangeOptions: Array<{ label: string; value: AnalyticsDateRange }> = [
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
];

function formatNumber(value: number | undefined) {
  return new Intl.NumberFormat('en-IN').format(Math.round(value || 0));
}

function formatPercent(value: number | undefined) {
  return `${(((value || 0) <= 1 ? value || 0 : (value || 0) / 100) * 100).toFixed(1)}%`;
}

function formatDuration(seconds: number | undefined) {
  const totalSeconds = Math.round(seconds || 0);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function formatTimestamp(value: string | null | undefined) {
  if (!value) return 'Not fetched yet';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function statusLabel(status: GoogleAnalyticsReport['status'] | undefined) {
  if (status === 'ready') return 'Connected';
  if (status === 'error') return 'API error';
  return 'Setup required';
}

function statusClassName(status: GoogleAnalyticsReport['status'] | undefined) {
  if (status === 'ready') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'error') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function SummaryCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof Users;
}) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-slate-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black text-slate-950">{value}</div>
        <p className="mt-1 text-xs font-medium text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  );
}

function EmptyRows({ columns }: { columns: number }) {
  return (
    <TableRow>
      <TableCell colSpan={columns} className="py-6 text-center text-sm text-slate-500">
        No Google Analytics rows for this range.
      </TableCell>
    </TableRow>
  );
}

function DataTable({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <Card className="rounded-xl border-slate-200 bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column} className="text-xs font-bold uppercase text-slate-500">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <EmptyRows columns={columns.length} />
            ) : (
              rows.map((row, rowIndex) => (
                <TableRow key={`${title}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={`${title}-${rowIndex}-${cellIndex}`} className="font-medium text-slate-700">
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function GoogleAnalyticsDashboard({
  report,
  selectedRange,
  onRangeChange,
}: {
  report?: GoogleAnalyticsReport;
  selectedRange: AnalyticsDateRange;
  onRangeChange: (range: AnalyticsDateRange) => void;
}) {
  const summary = report?.summary;

  return (
    <section className="space-y-4" aria-labelledby="google-analytics-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 id="google-analytics-heading" className="text-xl font-bold text-slate-950">
              Google Analytics
            </h3>
            <Badge variant="outline" className={statusClassName(report?.status)}>
              {statusLabel(report?.status)}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            GA4 traffic, engagement, acquisition, and event reports. Last fetched: {formatTimestamp(report?.lastFetchedAt)}
          </p>
        </div>

        <div className="inline-flex h-10 w-fit rounded-lg border border-slate-200 bg-white p-1">
          {rangeOptions.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant={selectedRange === option.value ? 'default' : 'ghost'}
              className="h-8 px-3 text-xs font-black"
              aria-pressed={selectedRange === option.value}
              onClick={() => onRangeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {report?.status === 'not_configured' ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm font-medium text-amber-800">
            Add GOOGLE_ANALYTICS_PROPERTY_ID, GOOGLE_ANALYTICS_CLIENT_EMAIL, and GOOGLE_ANALYTICS_PRIVATE_KEY to the server environment to enable GA4 reports.
          </CardContent>
        </Card>
      ) : null}

      {report?.status === 'error' ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-sm font-medium text-red-700">
            Google Analytics unavailable: {report.error || 'Request failed'}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Active Users" value={formatNumber(summary?.activeUsers)} detail="Users active in GA4" icon={Users} />
        <SummaryCard title="Sessions" value={formatNumber(summary?.sessions)} detail={`${formatNumber(summary?.newUsers)} new users`} icon={TrendingUp} />
        <SummaryCard title="Page Views" value={formatNumber(summary?.pageViews)} detail={`${formatNumber(summary?.eventCount)} total events`} icon={BarChart3} />
        <SummaryCard title="Key Events" value={formatNumber(summary?.keyEvents)} detail="GA4 conversion or key events" icon={Target} />
        <SummaryCard title="Engagement Rate" value={formatPercent(summary?.engagementRate)} detail="Engaged sessions ratio" icon={Gauge} />
        <SummaryCard title="Avg Session" value={formatDuration(summary?.averageSessionDuration)} detail="Average session duration" icon={Clock} />
        <SummaryCard title="Events" value={formatNumber(summary?.eventCount)} detail="All tracked GA4 events" icon={Activity} />
        <SummaryCard title="New Users" value={formatNumber(summary?.newUsers)} detail="First-time users in range" icon={MousePointerClick} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DataTable
          title="Top Pages"
          columns={['Path', 'Title', 'Views', 'Users', 'Engagement']}
          rows={(report?.topPages || []).map((row) => [
            row.path,
            row.title,
            formatNumber(row.pageViews),
            formatNumber(row.activeUsers),
            formatPercent(row.engagementRate),
          ])}
        />
        <DataTable
          title="Traffic Sources"
          columns={['Channel', 'Source / Medium', 'Sessions', 'Users', 'Key Events']}
          rows={(report?.trafficSources || []).map((row) => [
            row.channel,
            row.sourceMedium,
            formatNumber(row.sessions),
            formatNumber(row.activeUsers),
            formatNumber(row.keyEvents),
          ])}
        />
        <DataTable
          title="Devices"
          columns={['Category', 'Browser', 'Users', 'Sessions']}
          rows={(report?.devices || []).map((row) => [
            row.category,
            row.browser,
            formatNumber(row.activeUsers),
            formatNumber(row.sessions),
          ])}
        />
        <DataTable
          title="Locations"
          columns={['Country', 'City', 'Users', 'Sessions']}
          rows={(report?.locations || []).map((row) => [
            row.country,
            row.city,
            formatNumber(row.activeUsers),
            formatNumber(row.sessions),
          ])}
        />
        <DataTable
          title="Events"
          columns={['Event', 'Count', 'Users', 'Key Events']}
          rows={(report?.events || []).map((row) => [
            row.eventName,
            formatNumber(row.eventCount),
            formatNumber(row.activeUsers),
            formatNumber(row.keyEvents),
          ])}
        />
        <DataTable
          title="Key Events"
          columns={['Event', 'Key Events', 'Count', 'Users']}
          rows={(report?.keyEvents || []).map((row) => [
            row.eventName,
            formatNumber(row.keyEvents),
            formatNumber(row.eventCount),
            formatNumber(row.activeUsers),
          ])}
        />
      </div>
    </section>
  );
}
