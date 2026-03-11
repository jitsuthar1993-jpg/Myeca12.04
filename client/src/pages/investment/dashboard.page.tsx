import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, PieChart, ArrowUpRight, DollarSign, Wallet, Target, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "wouter";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Pie,
  Cell
} from "recharts";
import { FONT_SIZES } from "@/styles/fonts";
import SEO from "@/components/SEO";

// Mock data
const performanceData = [
  { month: "Jan", value: 100000 },
  { month: "Feb", value: 112000 },
  { month: "Mar", value: 108000 },
  { month: "Apr", value: 125000 },
  { month: "May", value: 135000 },
  { month: "Jun", value: 142000 },
];

const allocationData = [
  { name: "Stocks", value: 45, color: "#2563eb" }, // blue-600
  { name: "Mutual Funds", value: 30, color: "#16a34a" }, // green-600
  { name: "Gold", value: 10, color: "#eab308" }, // yellow-500
  { name: "Cash", value: 15, color: "#94a3b8" }, // slate-400
];

const goalsData = [
  { id: 1, name: "Retirement", current: 850000, target: 5000000, color: "bg-blue-600" },
  { id: 2, name: "New Car", current: 320000, target: 1500000, color: "bg-green-600" },
  { id: 3, name: "Vacation", current: 150000, target: 200000, color: "bg-purple-600" },
];

export default function InvestmentDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="Investment Dashboard - MyeCA"
        description="Track your portfolio, analyze performance, and optimize your investments."
      />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Investment Dashboard</h1>
          <p className="text-slate-600">Track and manage your financial portfolio</p>
        </div>
        <div className="flex gap-3">
          <Link href="/investment/add-transaction">
             <Button>
                <TrendingUp className="w-4 h-4 mr-2" />
                Add Transaction
             </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Portfolio Value</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">\u20B914,20,000</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +12.5% all time
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Today's Gain/Loss</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+\u20B94,250</div>
            <p className="text-xs text-slate-500 mt-1">
              +0.3% today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Invested Amount</CardTitle>
            <Wallet className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">\u20B910,50,000</div>
            <p className="text-xs text-slate-500 mt-1">
              Across 12 assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">XIRR</CardTitle>
            <BarChart3 className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">14.2%</div>
            <p className="text-xs text-slate-500 mt-1">
              Annualized return
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Portfolio Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Value over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: FONT_SIZES.xs }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748b', fontSize: FONT_SIZES.xs }}
                  tickFormatter={(value) => `\u20B9${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`\u20B9${value.toLocaleString()}`, 'Value']}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Allocation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Distribution by asset class</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
          <div className="px-6 pb-6">
            <div className="space-y-2">
              {allocationData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Goals Tracking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Financial Goals</CardTitle>
              <CardDescription>Track progress towards your dreams</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add Goal
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {goalsData.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-500" />
                      <span>{goal.name}</span>
                    </div>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>\u20B9{goal.current.toLocaleString()}</span>
                    <span>Target: \u20B9{goal.target.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/investment/tax-optimization">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-green-100 text-green-600 rounded-full">
                  <PieChart className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">Tax Optimization</h3>
                  <p className="text-sm text-slate-500 mt-1">Analyze harvesting opportunities</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/investment/watchlist">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">Watchlist</h3>
                  <p className="text-sm text-slate-500 mt-1">Track your favorite stocks</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/investment/portfolio-simulation">
             <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
               <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                 <div className="p-4 bg-orange-100 text-orange-600 rounded-full">
                   <TrendingUp className="w-8 h-8" />
                 </div>
                 <div>
                   <h3 className="font-semibold text-slate-900 text-lg">Simulator</h3>
                   <p className="text-sm text-slate-500 mt-1">Project future wealth</p>
                 </div>
               </CardContent>
             </Card>
           </Link>

          <Link href="/investment/reports">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg">Reports</h3>
                  <p className="text-sm text-slate-500 mt-1">Download statements</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
