// Analytics Page - Simple and Clean

import { useState } from 'react';
import { Layout } from '@/components/admin/Layout';
import { StatCard } from '@/components/admin/StatCard';
import { Chart } from '@/components/admin/Chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Users, Clock, MousePointerClick } from 'lucide-react';

// Mock analytics data - replace with real API call later
const mockData = {
  pageViews: [
    { name: 'Mon', value: 1200 },
    { name: 'Tue', value: 1900 },
    { name: 'Wed', value: 3000 },
    { name: 'Thu', value: 2780 },
    { name: 'Fri', value: 1890 },
    { name: 'Sat', value: 2390 },
    { name: 'Sun', value: 3490 },
  ],
  visitors: [
    { name: 'Mon', value: 800 },
    { name: 'Tue', value: 1200 },
    { name: 'Wed', value: 1900 },
    { name: 'Thu', value: 1600 },
    { name: 'Fri', value: 1400 },
    { name: 'Sat', value: 1800 },
    { name: 'Sun', value: 2200 },
  ],
};

export default function AnalyticsPage() {
  return (
    <Layout title="Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Track and analyze platform performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Page Views"
            value="24,578"
            change={12.5}
            icon={<Eye className="h-5 w-5" />}
          />
          <StatCard
            title="Unique Visitors"
            value="8,934"
            change={8.3}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Avg. Session Duration"
            value="4:23"
            change={15.2}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            title="Bounce Rate"
            value="42.3%"
            change={-5.2}
            icon={<MousePointerClick className="h-5 w-5" />}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chart title="Page Views" data={mockData.pageViews} type="line" />
          <Chart title="Unique Visitors" data={mockData.visitors} type="area" />
        </div>
      </div>
    </Layout>
  );
}

