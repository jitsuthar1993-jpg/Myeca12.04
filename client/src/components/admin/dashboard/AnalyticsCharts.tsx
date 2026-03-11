// Analytics Charts Component - Advanced visualizations

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, Eye, MousePointer } from 'lucide-react';
import { FONT_SIZES } from '@/styles/fonts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

interface AnalyticsChartsProps {
  data?: any;
  isLoading?: boolean;
}

// Page Views Chart
export function PageViewsChart({ data, isLoading }: AnalyticsChartsProps) {
  const chartData = [
    { date: 'Mon', views: 1200 },
    { date: 'Tue', views: 1900 },
    { date: 'Wed', views: 3000 },
    { date: 'Thu', views: 2780 },
    { date: 'Fri', views: 1890 },
    { date: 'Sat', views: 2390 },
    { date: 'Sun', views: 3490 },
  ];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-blue-600" />
          Page Views
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" fontSize={FONT_SIZES.xs} />
            <YAxis stroke="#666" fontSize={FONT_SIZES.xs} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Unique Visitors Chart
export function UniqueVisitorsChart({ data, isLoading }: AnalyticsChartsProps) {
  const chartData = [
    { date: 'Mon', visitors: 800 },
    { date: 'Tue', visitors: 1200 },
    { date: 'Wed', visitors: 1900 },
    { date: 'Thu', visitors: 1600 },
    { date: 'Fri', visitors: 1400 },
    { date: 'Sat', visitors: 1800 },
    { date: 'Sun', visitors: 2200 },
  ];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-green-600" />
          Unique Visitors
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" fontSize={FONT_SIZES.xs} />
            <YAxis stroke="#666" fontSize={FONT_SIZES.xs} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Area
              type="monotone"
              dataKey="visitors"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVisitors)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Bounce Rate Chart
export function BounceRateChart({ data, isLoading }: AnalyticsChartsProps) {
  const chartData = [
    { date: 'Mon', rate: 42 },
    { date: 'Tue', rate: 38 },
    { date: 'Wed', rate: 45 },
    { date: 'Thu', rate: 40 },
    { date: 'Fri', rate: 35 },
    { date: 'Sat', rate: 32 },
    { date: 'Sun', rate: 30 },
  ];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MousePointer className="h-5 w-5 text-orange-600" />
          Bounce Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#666" fontSize={FONT_SIZES.xs} />
            <YAxis stroke="#666" fontSize={FONT_SIZES.xs} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="rate" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Revenue by Service Type
export function RevenueByServiceChart({ data, isLoading }: AnalyticsChartsProps) {
  const serviceData = [
    { name: 'ITR Filing', value: 35, amount: 435000 },
    { name: 'Tax Consultation', value: 25, amount: 310000 },
    { name: 'GST Filing', value: 20, amount: 248000 },
    { name: 'Company Registration', value: 12, amount: 149000 },
    { name: 'Other', value: 8, amount: 99000 },
  ];

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-6">
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          Revenue by Service
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={serviceData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {serviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => [
                `\u20B9${props.payload.amount.toLocaleString()}`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

// Combined Analytics Charts Component
export function AnalyticsCharts({ data, isLoading }: AnalyticsChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PageViewsChart data={data} isLoading={isLoading} />
        <UniqueVisitorsChart data={data} isLoading={isLoading} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BounceRateChart data={data} isLoading={isLoading} />
        <RevenueByServiceChart data={data} isLoading={isLoading} />
      </div>
    </div>
  );
}

