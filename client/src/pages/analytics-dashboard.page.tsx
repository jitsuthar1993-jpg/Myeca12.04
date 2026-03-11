import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, 
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { 
  TrendingUp, TrendingDown, Users, FileText, IndianRupee, 
  Calendar, Award, Target, Activity, Download, Filter,
  RefreshCw, Eye, Clock, Zap
} from "lucide-react";
import { useAccessibility } from "@/components/accessibility/AccessibilityProvider";
import SEO from "@/components/SEO";
import { motion } from "framer-motion";

// Sample data - In production, this would come from API
const revenueData = [
  { month: "Jan", revenue: 450000, users: 3200, filings: 2800 },
  { month: "Feb", revenue: 520000, users: 3800, filings: 3400 },
  { month: "Mar", revenue: 890000, users: 5600, filings: 5200 },
  { month: "Apr", revenue: 1250000, users: 8900, filings: 8500 },
  { month: "May", revenue: 980000, users: 7200, filings: 6800 },
  { month: "Jun", revenue: 1450000, users: 10500, filings: 9800 },
  { month: "Jul", revenue: 2100000, users: 15000, filings: 14200 },
];

const serviceDistribution = [
  { name: "ITR Filing", value: 45, color: "#3b82f6" },
  { name: "GST Returns", value: 20, color: "#10b981" },
  { name: "Company Registration", value: 15, color: "#f59e0b" },
  { name: "Compliance Services", value: 12, color: "#8b5cf6" },
  { name: "Others", value: 8, color: "#6b7280" },
];

const userDemographics = [
  { age: "18-25", male: 2500, female: 2200 },
  { age: "26-35", male: 4500, female: 3800 },
  { age: "36-45", male: 3200, female: 2800 },
  { age: "46-55", male: 2100, female: 1900 },
  { age: "56+", male: 1200, female: 1000 },
];

const performanceMetrics = [
  { metric: "Page Load Time", value: 1.2, target: 2.0, unit: "s" },
  { metric: "Success Rate", value: 99.8, target: 99.0, unit: "%" },
  { metric: "User Satisfaction", value: 4.8, target: 4.5, unit: "/5" },
  { metric: "Support Response", value: 15, target: 30, unit: "min" },
  { metric: "Uptime", value: 99.9, target: 99.5, unit: "%" },
];

const geographicData = [
  { state: "Maharashtra", users: 25000 },
  { state: "Karnataka", users: 18000 },
  { state: "Delhi NCR", users: 15000 },
  { state: "Tamil Nadu", users: 12000 },
  { state: "Gujarat", users: 10000 },
  { state: "West Bengal", users: 8000 },
  { state: "Others", users: 27000 },
];

export default function AnalyticsDashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [isLoading, setIsLoading] = useState(false);
  const { setPageTitle } = useAccessibility();

  useEffect(() => {
    setPageTitle("Analytics Dashboard");
  }, [setPageTitle]);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  const MetricCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}>
            {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{change}%</span>
          </div>
        </div>
        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </Card>
  );

  const PerformanceMetric = ({ metric, value, target, unit }: any) => {
    const percentage = (value / target) * 100;
    const isExceeding = value >= target;
    
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{metric}</span>
          <span className={isExceeding ? "text-green-600" : "text-orange-600"}>
            {value}{unit}
          </span>
        </div>
        <Progress value={Math.min(percentage, 100)} className="h-2" />
        <p className="text-xs text-gray-500">Target: {target}{unit}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Analytics Dashboard - MyeCA.in"
        description="Comprehensive analytics and insights for MyeCA.in platform performance, user metrics, and tax filing statistics"
        keywords="analytics, dashboard, metrics, insights, tax filing statistics"
      />

      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Real-time insights and performance metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard 
            title="Total Revenue"
            value="\u20B982.5L"
            change={15.2}
            icon={IndianRupee}
            trend="up"
          />
          <MetricCard 
            title="Active Users"
            value="15,234"
            change={8.7}
            icon={Users}
            trend="up"
          />
          <MetricCard 
            title="ITR Filings"
            value="12,856"
            change={12.3}
            icon={FileText}
            trend="up"
          />
          <MetricCard 
            title="Success Rate"
            value="99.8%"
            change={0.2}
            icon={Award}
            trend="up"
          />
        </div>

        {/* Charts Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="revenue">Revenue & Growth</TabsTrigger>
            <TabsTrigger value="services">Service Analytics</TabsTrigger>
            <TabsTrigger value="users">User Insights</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue & User Growth</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.6}
                    name="Revenue (\u20B9)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Monthly Filing Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="filings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ITR Filing Services</span>
                    <span className="font-semibold">\u20B937.12L (45%)</span>
                  </div>
                  <Progress value={45} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">GST Returns</span>
                    <span className="font-semibold">\u20B916.50L (20%)</span>
                  </div>
                  <Progress value={20} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Company Registration</span>
                    <span className="font-semibold">\u20B912.37L (15%)</span>
                  </div>
                  <Progress value={15} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Other Services</span>
                    <span className="font-semibold">\u20B916.50L (20%)</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="services" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Service Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={serviceDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {serviceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Service Performance</h3>
                <div className="space-y-4">
                  {serviceDistribution.map((service) => (
                    <div key={service.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{service.name}</span>
                        <span className="text-sm text-gray-600">{service.value}%</span>
                      </div>
                      <div className="relative">
                        <Progress value={service.value} className="h-2" />
                        <div 
                          className="absolute top-0 h-2 rounded-full"
                          style={{ 
                            backgroundColor: service.color, 
                            width: `${service.value}%`,
                            opacity: 0.8 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Service Conversion Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-24 w-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">85%</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">ITR Filing</p>
                  <p className="text-xs text-gray-600">View to Purchase</p>
                </div>
                <div className="text-center">
                  <div className="h-24 w-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">72%</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">GST Services</p>
                  <p className="text-xs text-gray-600">View to Purchase</p>
                </div>
                <div className="text-center">
                  <div className="h-24 w-24 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">68%</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">Company Registration</p>
                  <p className="text-xs text-gray-600">View to Purchase</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">User Demographics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userDemographics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="male" fill="#3b82f6" />
                    <Bar dataKey="female" fill="#ec4899" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">User Engagement Metrics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Daily Active Users</span>
                      <span className="text-2xl font-bold">8,234</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Avg. Session Duration</span>
                      <span className="text-2xl font-bold">12m 45s</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Retention Rate (30 days)</span>
                      <span className="text-2xl font-bold">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">NPS Score</span>
                      <span className="text-2xl font-bold">72</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Journey Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <motion.div 
                  className="bg-blue-50 p-4 rounded-lg text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="font-semibold">Homepage Visit</p>
                  <p className="text-2xl font-bold mt-1">100%</p>
                </motion.div>
                
                <motion.div 
                  className="bg-green-50 p-4 rounded-lg text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold">Service View</p>
                  <p className="text-2xl font-bold mt-1">65%</p>
                </motion.div>
                
                <motion.div 
                  className="bg-purple-50 p-4 rounded-lg text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="font-semibold">Sign Up</p>
                  <p className="text-2xl font-bold mt-1">42%</p>
                </motion.div>
                
                <motion.div 
                  className="bg-orange-50 p-4 rounded-lg text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Award className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="font-semibold">Purchase</p>
                  <p className="text-2xl font-bold mt-1">28%</p>
                </motion.div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {performanceMetrics.map((metric) => (
                  <PerformanceMetric key={metric.metric} {...metric} />
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">API Response Times</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={[
                    { endpoint: "Auth", time: 45 },
                    { endpoint: "ITR Submit", time: 120 },
                    { endpoint: "Calculator", time: 30 },
                    { endpoint: "Documents", time: 85 },
                    { endpoint: "Dashboard", time: 60 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="endpoint" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="time" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Error Rate by Service</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ITR Filing API</span>
                    <span className="text-sm font-semibold text-green-600">0.02%</span>
                  </div>
                  <Progress value={2} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Payment Gateway</span>
                    <span className="text-sm font-semibold text-green-600">0.05%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Document Upload</span>
                    <span className="text-sm font-semibold text-yellow-600">0.12%</span>
                  </div>
                  <Progress value={12} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Email Service</span>
                    <span className="text-sm font-semibold text-green-600">0.08%</span>
                  </div>
                  <Progress value={8} className="h-2" />
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Geographic Distribution</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={geographicData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="state" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="users" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Top City</h4>
                <p className="text-2xl font-bold">Mumbai</p>
                <p className="text-sm text-gray-600 mt-1">12,345 users</p>
              </Card>
              
              <Card className="p-6 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-2">Fastest Growing</h4>
                <p className="text-2xl font-bold">Pune</p>
                <p className="text-sm text-green-600 mt-1">+45% this month</p>
              </Card>
              
              <Card className="p-6 text-center">
                <h4 className="text-sm font-medium text-gray-600 mb-2">New Market</h4>
                <p className="text-2xl font-bold">Tier 2 Cities</p>
                <p className="text-sm text-blue-600 mt-1">28% of new users</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Real-time Activity Feed */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Real-time Activity</h3>
          <div className="space-y-3">
            {[
              { time: "2 min ago", action: "New ITR filing", user: "Mumbai, MH", icon: FileText, color: "blue" },
              { time: "5 min ago", action: "GST return submitted", user: "Bangalore, KA", icon: Activity, color: "green" },
              { time: "8 min ago", action: "New user registration", user: "Delhi, DL", icon: Users, color: "purple" },
              { time: "12 min ago", action: "Payment received", user: "Chennai, TN", icon: IndianRupee, color: "orange" },
              { time: "15 min ago", action: "CA consultation booked", user: "Pune, MH", icon: Calendar, color: "pink" },
            ].map((activity, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
              >
                <div className={`h-10 w-10 bg-${activity.color}-100 rounded-full flex items-center justify-center`}>
                  <activity.icon className={`h-5 w-5 text-${activity.color}-600`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-600">{activity.user}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}