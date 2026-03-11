import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, 
  Calendar, FileText, Star, Target, Clock, ArrowUp, ArrowDown,
  Download, Filter, RefreshCw, Eye, MessageSquare
} from "lucide-react";
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalUsers: number;
    totalServices: number;
    totalBookings: number;
    revenueGrowth: number;
    userGrowth: number;
    serviceGrowth: number;
    bookingGrowth: number;
  };
  revenueData: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  userGrowthData: Array<{
    date: string;
    users: number;
    activeUsers: number;
  }>;
  servicePerformance: Array<{
    name: string;
    bookings: number;
    revenue: number;
    growthRate: number;
  }>;
  topServices: Array<{
    name: string;
    bookings: number;
    revenue: number;
    category: string;
  }>;
  userActivity: Array<{
    hour: string;
    visits: number;
    conversions: number;
  }>;
  geographicData: Array<{
    state: string;
    users: number;
    revenue: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== 'admin')) {
      window.location.href = '/auth/login';
    }
  }, [currentUser, authLoading]);

  // Fetch analytics data
  const { data: analyticsData, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/admin/analytics", timeRange],
    enabled: !!currentUser && currentUser.role === 'admin',
  });

  // Generate mock data for demonstration
  const mockAnalyticsData: AnalyticsData = {
    overview: {
      totalRevenue: 2547000,
      totalUsers: 15420,
      totalServices: 32,
      totalBookings: 1847,
      revenueGrowth: 23.5,
      userGrowth: 18.2,
      serviceGrowth: 12.1,
      bookingGrowth: 31.7
    },
    revenueData: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      revenue: Math.floor(Math.random() * 50000) + 30000,
      bookings: Math.floor(Math.random() * 20) + 10
    })),
    userGrowthData: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      users: Math.floor(Math.random() * 100) + 400,
      activeUsers: Math.floor(Math.random() * 80) + 300
    })),
    servicePerformance: [
      { name: "ITR Filing", bookings: 523, revenue: 783450, growthRate: 25.3 },
      { name: "GST Registration", bookings: 287, revenue: 342100, growthRate: 18.7 },
      { name: "Company Registration", bookings: 156, revenue: 468000, growthRate: 31.2 },
      { name: "Trademark Registration", bookings: 134, revenue: 201000, growthRate: 15.8 },
      { name: "Compliance Services", bookings: 298, revenue: 447000, growthRate: 22.4 }
    ],
    topServices: [
      { name: "ITR-1 Filing", bookings: 342, revenue: 512000, category: "Tax Filing" },
      { name: "Pvt Ltd Registration", bookings: 89, revenue: 267000, category: "Business" },
      { name: "GST Registration", bookings: 234, revenue: 234000, category: "Compliance" },
      { name: "Trademark Registration", bookings: 67, revenue: 134000, category: "IP" },
      { name: "Professional Tax", bookings: 156, revenue: 78000, category: "Tax" }
    ],
    userActivity: Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      visits: Math.floor(Math.random() * 200) + 50,
      conversions: Math.floor(Math.random() * 20) + 5
    })),
    geographicData: [
      { state: "Maharashtra", users: 3420, revenue: 567800 },
      { state: "Karnataka", users: 2890, revenue: 445600 },
      { state: "Delhi", users: 2156, revenue: 398200 },
      { state: "Gujarat", users: 1876, revenue: 334500 },
      { state: "Tamil Nadu", users: 1654, revenue: 298700 }
    ]
  };

  const data = analyticsData || mockAnalyticsData;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? ArrowUp : ArrowDown;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <div className="ml-4 text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Monitor performance and track key metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(data.overview.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-2">
                    {React.createElement(getGrowthIcon(data.overview.revenueGrowth), {
                      className: `h-4 w-4 ${getGrowthColor(data.overview.revenueGrowth)}`
                    })}
                    <span className={`ml-1 text-sm ${getGrowthColor(data.overview.revenueGrowth)}`}>
                      {Math.abs(data.overview.revenueGrowth)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(data.overview.totalUsers)}
                  </p>
                  <div className="flex items-center mt-2">
                    {React.createElement(getGrowthIcon(data.overview.userGrowth), {
                      className: `h-4 w-4 ${getGrowthColor(data.overview.userGrowth)}`
                    })}
                    <span className={`ml-1 text-sm ${getGrowthColor(data.overview.userGrowth)}`}>
                      {Math.abs(data.overview.userGrowth)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Services</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(data.overview.totalServices)}
                  </p>
                  <div className="flex items-center mt-2">
                    {React.createElement(getGrowthIcon(data.overview.serviceGrowth), {
                      className: `h-4 w-4 ${getGrowthColor(data.overview.serviceGrowth)}`
                    })}
                    <span className={`ml-1 text-sm ${getGrowthColor(data.overview.serviceGrowth)}`}>
                      {Math.abs(data.overview.serviceGrowth)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatNumber(data.overview.totalBookings)}
                  </p>
                  <div className="flex items-center mt-2">
                    {React.createElement(getGrowthIcon(data.overview.bookingGrowth), {
                      className: `h-4 w-4 ${getGrowthColor(data.overview.bookingGrowth)}`
                    })}
                    <span className={`ml-1 text-sm ${getGrowthColor(data.overview.bookingGrowth)}`}>
                      {Math.abs(data.overview.bookingGrowth)}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">vs last period</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Target className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="enhanced">Enhanced</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Daily revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Area 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Service Performance</CardTitle>
                  <CardDescription>Top performing services</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.servicePerformance.slice(0, 5).map((service, index) => (
                      <div key={service.name} className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{service.name}</p>
                          <p className="text-sm text-gray-600">
                            {service.bookings} bookings • {formatCurrency(service.revenue)}
                          </p>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                          <span className="text-sm text-green-600 font-medium">
                            {service.growthRate}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Analytics</CardTitle>
                  <CardDescription>Detailed revenue breakdown and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Revenue"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>User acquisition and activity trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area 
                          type="monotone" 
                          dataKey="users" 
                          stackId="1"
                          stroke="#3b82f6" 
                          fill="#3b82f6"
                          name="Total Users"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="activeUsers" 
                          stackId="2"
                          stroke="#10b981" 
                          fill="#10b981"
                          name="Active Users"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Distribution</CardTitle>
                  <CardDescription>Revenue by service category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.topServices}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="revenue"
                          nameKey="name"
                        >
                          {data.topServices.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Services</CardTitle>
                  <CardDescription>Highest performing services by bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topServices.map((service, index) => (
                      <div key={service.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{service.name}</p>
                            <p className="text-sm text-gray-600">{service.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{service.bookings} bookings</p>
                          <p className="text-sm text-gray-600">{formatCurrency(service.revenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Users and revenue by state</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.geographicData.map((location, index) => (
                      <div key={location.state} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{location.state}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Users</p>
                            <p className="font-medium text-gray-900">{formatNumber(location.users)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Revenue</p>
                            <p className="font-medium text-gray-900">{formatCurrency(location.revenue)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-6">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}