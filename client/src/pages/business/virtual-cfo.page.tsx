import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  IndianRupee,
  Wallet,
  CreditCard,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Users,
  Building2,
  Receipt,
  BarChart3,
  Briefcase
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Mock financial data
const monthlyRevenueData = [
  { month: 'Apr', revenue: 850000, expenses: 620000, profit: 230000 },
  { month: 'May', revenue: 920000, expenses: 680000, profit: 240000 },
  { month: 'Jun', revenue: 780000, expenses: 590000, profit: 190000 },
  { month: 'Jul', revenue: 1050000, expenses: 720000, profit: 330000 },
  { month: 'Aug', revenue: 980000, expenses: 710000, profit: 270000 },
  { month: 'Sep', revenue: 1120000, expenses: 780000, profit: 340000 },
  { month: 'Oct', revenue: 1200000, expenses: 820000, profit: 380000 },
  { month: 'Nov', revenue: 1350000, expenses: 890000, profit: 460000 },
];

const expenseBreakdown = [
  { name: 'Salaries', value: 450000, color: '#3B82F6' },
  { name: 'Rent & Utilities', value: 120000, color: '#10B981' },
  { name: 'Marketing', value: 80000, color: '#F59E0B' },
  { name: 'Technology', value: 95000, color: '#8B5CF6' },
  { name: 'Operations', value: 145000, color: '#EF4444' },
];

const cashFlowData = [
  { month: 'Apr', inflow: 920000, outflow: 680000 },
  { month: 'May', inflow: 980000, outflow: 720000 },
  { month: 'Jun', inflow: 850000, outflow: 640000 },
  { month: 'Jul', inflow: 1100000, outflow: 780000 },
  { month: 'Aug', inflow: 1050000, outflow: 760000 },
  { month: 'Sep', inflow: 1180000, outflow: 830000 },
  { month: 'Oct', inflow: 1280000, outflow: 870000 },
  { month: 'Nov', inflow: 1420000, outflow: 940000 },
];

const recentTransactions = [
  { id: 1, description: 'Client Payment - ABC Corp', amount: 250000, type: 'credit', date: '2024-11-28', category: 'Revenue' },
  { id: 2, description: 'AWS Cloud Services', amount: -45000, type: 'debit', date: '2024-11-27', category: 'Technology' },
  { id: 3, description: 'Office Rent - November', amount: -85000, type: 'debit', date: '2024-11-25', category: 'Rent' },
  { id: 4, description: 'Client Payment - XYZ Ltd', amount: 180000, type: 'credit', date: '2024-11-24', category: 'Revenue' },
  { id: 5, description: 'Salary Disbursement', amount: -320000, type: 'debit', date: '2024-11-22', category: 'Salaries' },
  { id: 6, description: 'Marketing Campaign', amount: -65000, type: 'debit', date: '2024-11-20', category: 'Marketing' },
];

const invoices = [
  { id: 'INV-001', client: 'ABC Corp', amount: 350000, status: 'paid', dueDate: '2024-11-15', paidDate: '2024-11-12' },
  { id: 'INV-002', client: 'XYZ Ltd', amount: 180000, status: 'paid', dueDate: '2024-11-20', paidDate: '2024-11-18' },
  { id: 'INV-003', client: 'PQR Inc', amount: 420000, status: 'pending', dueDate: '2024-12-05', paidDate: null },
  { id: 'INV-004', client: 'LMN Co', amount: 95000, status: 'overdue', dueDate: '2024-11-25', paidDate: null },
  { id: 'INV-005', client: 'DEF Tech', amount: 280000, status: 'pending', dueDate: '2024-12-10', paidDate: null },
];

const budgetVsActual = [
  { category: 'Revenue', budget: 1300000, actual: 1350000, variance: 50000 },
  { category: 'Salaries', budget: 460000, actual: 450000, variance: 10000 },
  { category: 'Marketing', budget: 100000, actual: 80000, variance: 20000 },
  { category: 'Operations', budget: 140000, actual: 145000, variance: -5000 },
  { category: 'Technology', budget: 90000, actual: 95000, variance: -5000 },
];

export default function VirtualCFOPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // Calculate totals
  const totalRevenue = monthlyRevenueData.reduce((sum, m) => sum + m.revenue, 0);
  const totalExpenses = monthlyRevenueData.reduce((sum, m) => sum + m.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);
  
  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `\u20B9${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `\u20B9${(amount / 100000).toFixed(2)} L`;
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-emerald-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-emerald-300" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/business/dashboard" className="text-emerald-200 hover:text-white">Business</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-emerald-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Virtual CFO Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <BarChart3 className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Virtual CFO Dashboard</h1>
                <p className="text-emerald-200">Financial insights for TechStart Solutions Pvt Ltd</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/10 border-none text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-200">Total Revenue (YTD)</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-300" />
                </div>
                <div className="flex items-center gap-1 mt-2 text-green-300 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+12.5% vs last year</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-none text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-200">Total Expenses (YTD)</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                  </div>
                  <Wallet className="h-8 w-8 text-orange-300" />
                </div>
                <div className="flex items-center gap-1 mt-2 text-orange-300 text-sm">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+8.2% vs last year</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-none text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-200">Net Profit (YTD)</p>
                    <p className="text-2xl font-bold">{formatCurrency(totalProfit)}</p>
                  </div>
                  <PiggyBank className="h-8 w-8 text-green-300" />
                </div>
                <div className="flex items-center gap-1 mt-2 text-green-300 text-sm">
                  <span>{profitMargin}% margin</span>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-none text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-200">Cash Balance</p>
                    <p className="text-2xl font-bold">{formatCurrency(2850000)}</p>
                  </div>
                  <IndianRupee className="h-8 w-8 text-blue-300" />
                </div>
                <div className="flex items-center gap-1 mt-2 text-blue-300 text-sm">
                  <span>18 months runway</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pl">Profit & Loss</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="budget">Budget Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue vs Expenses Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue vs Expenses</CardTitle>
                  <CardDescription>Monthly comparison for FY 2024-25</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyRevenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                        <Tooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          labelStyle={{ color: '#333' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#10B981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                        <Area type="monotone" dataKey="expenses" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Expense Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Expense Breakdown</CardTitle>
                  <CardDescription>Current month expenses by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {expenseBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Latest financial activities</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">View All</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {tx.type === 'credit' ? (
                            <ArrowDownRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{tx.description}</p>
                          <p className="text-sm text-gray-500">{tx.category} • {tx.date}</p>
                        </div>
                      </div>
                      <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* P&L Tab */}
          <TabsContent value="pl" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
                <CardDescription>Monthly profit trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Expenses" />
                      <Bar dataKey="profit" fill="#3B82F6" name="Profit" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cashflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
                <CardDescription>Monthly inflows and outflows</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(val) => `${(val / 100000).toFixed(0)}L`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="inflow" stroke="#10B981" strokeWidth={2} name="Cash Inflow" />
                      <Line type="monotone" dataKey="outflow" stroke="#EF4444" strokeWidth={2} name="Cash Outflow" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Runway Calculator */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  Runway Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="text-sm text-blue-600 mb-1">Current Cash Balance</p>
                    <p className="text-2xl font-bold text-blue-800">{formatCurrency(2850000)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-orange-50">
                    <p className="text-sm text-orange-600 mb-1">Avg. Monthly Burn</p>
                    <p className="text-2xl font-bold text-orange-800">{formatCurrency(totalExpenses / 8)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50">
                    <p className="text-sm text-green-600 mb-1">Runway (Months)</p>
                    <p className="text-2xl font-bold text-green-800">~18 months</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Invoice Tracker</CardTitle>
                    <CardDescription>Manage your invoices and payments</CardDescription>
                  </div>
                  <Button>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoices.map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-gray-100">
                          <Receipt className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{inv.id} - {inv.client}</p>
                          <p className="text-sm text-gray-500">Due: {inv.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">{formatCurrency(inv.amount)}</p>
                        <Badge className={
                          inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                          inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }>
                          {inv.status === 'paid' ? <CheckCircle className="h-3 w-3 mr-1" /> :
                           inv.status === 'overdue' ? <AlertTriangle className="h-3 w-3 mr-1" /> :
                           <Clock className="h-3 w-3 mr-1" />}
                          {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Invoice Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-green-100">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Paid</p>
                      <p className="text-2xl font-bold">{formatCurrency(530000)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-yellow-100">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Pending</p>
                      <p className="text-2xl font-bold">{formatCurrency(700000)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-red-100">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Overdue</p>
                      <p className="text-2xl font-bold">{formatCurrency(95000)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Budget Analysis Tab */}
          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual</CardTitle>
                <CardDescription>Compare planned budget with actual spending</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {budgetVsActual.map((item) => {
                    const percentage = (item.actual / item.budget) * 100;
                    const isOverBudget = item.variance < 0;
                    return (
                      <div key={item.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.category}</span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-500">Budget: {formatCurrency(item.budget)}</span>
                            <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
                              Actual: {formatCurrency(item.actual)}
                            </span>
                            <Badge className={isOverBudget ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                              {isOverBudget ? '-' : '+'}{formatCurrency(Math.abs(item.variance))}
                            </Badge>
                          </div>
                        </div>
                        <Progress 
                          value={Math.min(percentage, 100)} 
                          className={`h-2 ${isOverBudget ? '[&>*]:bg-red-500' : '[&>*]:bg-green-500'}`}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

