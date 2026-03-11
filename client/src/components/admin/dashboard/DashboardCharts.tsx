// Dashboard Charts Component

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
import { TrendingUp } from 'lucide-react';
import type { DashboardStats } from '@/lib/admin/types';
import { FONT_SIZES } from '@/styles/fonts';

interface DashboardChartsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export function RevenueChart({ data }: { data: DashboardStats }) {
  // Transform recent calculations into chart data
  const chartData = data.recent_calculations.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    calculations: item.count,
  }));

  return (
    <Card className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Revenue Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
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
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="calculations"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function ServiceDistributionChart({ data }: { data: DashboardStats }) {
  const serviceData = data.services.popular.map((service, index) => ({
    name: service,
    value: Math.floor(Math.random() * 100) + 20, // Mock data - replace with actual
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Card className="h-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-indigo-100">
      <CardHeader>
        <CardTitle>Service Distribution</CardTitle>
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
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {serviceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function DashboardCharts({ stats, isLoading = false }: DashboardChartsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="h-full animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <RevenueChart data={stats} />
      <ServiceDistributionChart data={stats} />
    </div>
  );
}

