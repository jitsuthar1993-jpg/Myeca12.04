// Analytics Dashboard Component for Admin Panel

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, ShoppingCart, FileText, Calculator, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Mock data - in production, this would come from your analytics API
const mockAnalyticsData = {
  overview: {
    totalUsers: 15234,
    newUsers: 3421,
    sessions: 45678,
    bounceRate: 32.5,
    avgSessionDuration: 245, // seconds
    conversions: 892,
    conversionRate: 4.2,
    revenue: 125600
  },
  userMetrics: [
    { date: '2025-01-19', users: 1200, newUsers: 450, sessions: 2100 },
    { date: '2025-01-20', users: 1350, newUsers: 520, sessions: 2400 },
    { date: '2025-01-21', users: 1100, newUsers: 380, sessions: 1900 },
    { date: '2025-01-22', users: 1450, newUsers: 580, sessions: 2600 },
    { date: '2025-01-23', users: 1600, newUsers: 650, sessions: 2900 },
    { date: '2025-01-24', users: 1750, newUsers: 720, sessions: 3200 },
    { date: '2025-01-25', users: 1900, newUsers: 800, sessions: 3500 }
  ],
  conversionFunnel: [
    { stage: 'Homepage Visit', users: 10000, percentage: 100 },
    { stage: 'Service Page View', users: 6500, percentage: 65 },
    { stage: 'Start Process', users: 3200, percentage: 32 },
    { stage: 'Form Completion', users: 1600, percentage: 16 },
    { stage: 'Payment', users: 892, percentage: 8.9 }
  ],
  topPages: [
    { page: '/services/itr-filing', views: 8234, avgTime: 187 },
    { page: '/calculators/income-tax', views: 6789, avgTime: 243 },
    { page: '/services/gst-registration', views: 4567, avgTime: 156 },
    { page: '/pricing', views: 3456, avgTime: 98 },
    { page: '/blog/tax-saving-tips', views: 2345, avgTime: 324 }
  ],
  trafficSources: [
    { source: 'Organic Search', sessions: 18500, percentage: 40.5 },
    { source: 'Direct', sessions: 11200, percentage: 24.5 },
    { source: 'Social Media', sessions: 8900, percentage: 19.5 },
    { source: 'Referral', sessions: 4500, percentage: 9.8 },
    { source: 'Email', sessions: 2578, percentage: 5.7 }
  ],
  events: {
    calculatorUsage: 15678,
    formSubmissions: 3456,
    serviceClicks: 8901,
    documentUploads: 2345
  }
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState('7days');
  const [activeMetric, setActiveMetric] = useState('users');

  // Calculate percentage changes
  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    };
  };

  const metricsCards = [
    {
      title: 'Total Users',
      value: mockAnalyticsData.overview.totalUsers.toLocaleString(),
      change: calculateChange(15234, 13456),
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Conversions',
      value: mockAnalyticsData.overview.conversions.toLocaleString(),
      change: calculateChange(892, 756),
      icon: ShoppingCart,
      color: 'text-green-600'
    },
    {
      title: 'Conversion Rate',
      value: `${mockAnalyticsData.overview.conversionRate}%`,
      change: calculateChange(4.2, 3.8),
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      title: 'Revenue',
      value: `\u20B9${(mockAnalyticsData.overview.revenue / 1000).toFixed(1)}K`,
      change: calculateChange(125600, 98700),
      icon: FileText,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your website performance and user behavior</p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsCards.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.change.isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${metric.change.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change.value}%
                    </span>
                  </div>
                </div>
                <metric.icon className={`w-8 h-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="traffic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="traffic">Traffic & Users</TabsTrigger>
          <TabsTrigger value="conversions">Conversions</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="space-y-4">
          {/* User Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>User Metrics Over Time</CardTitle>
              <CardDescription>Track users, new users, and sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockAnalyticsData.userMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="newUsers" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="sessions" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={mockAnalyticsData.trafficSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.source}: ${entry.percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="sessions"
                    >
                      {mockAnalyticsData.trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>Most visited pages on your site</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockAnalyticsData.topPages.map((page, index) => (
                    <div key={page.page} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{page.page}</p>
                        <p className="text-xs text-gray-600">{page.views.toLocaleString()} views • {page.avgTime}s avg</p>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversions" className="space-y-4">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey from visit to purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockAnalyticsData.conversionFunnel} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Event Tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Event Tracking</CardTitle>
              <CardDescription>Key user interactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(mockAnalyticsData.events).map(([event, count]) => (
                  <div key={event} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 capitalize">{event.replace(/([A-Z])/g, ' $1').trim()}</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{count.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Behavior Metrics</CardTitle>
              <CardDescription>How users interact with your site</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Avg. Session Duration</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {Math.floor(mockAnalyticsData.overview.avgSessionDuration / 60)}:
                    {(mockAnalyticsData.overview.avgSessionDuration % 60).toString().padStart(2, '0')}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Bounce Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{mockAnalyticsData.overview.bounceRate}%</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pages per Session</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">3.4</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Users</CardTitle>
              <CardDescription>Users on your site right now</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-6xl font-bold text-blue-600">47</p>
                <p className="text-gray-600 mt-2">Active users in the last 5 minutes</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}