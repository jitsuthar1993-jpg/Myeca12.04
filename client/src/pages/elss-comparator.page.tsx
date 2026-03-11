import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  Star,
  Info,
  ArrowUpDown,
  Filter,
  Download,
  IndianRupee,
  Calculator,
  PiggyBank,
  Clock,
  Shield,
  Target,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Percent
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { ELSS_FUNDS, ELSSFund, FUND_CATEGORIES, getTopFundsByReturns } from "@/data/elss-funds";
import { calculateSIPReturns, calculateTaxSavings, compareWith80COptions } from "@/lib/elss-calculations";

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function ELSSComparatorPage() {
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<'returns3Y' | 'rating' | 'expense' | 'aum'>('returns3Y');
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  
  // Calculator inputs
  const [monthlyInvestment, setMonthlyInvestment] = useState(12500); // \u20B91.5L/year
  const [investmentYears, setInvestmentYears] = useState(10);
  const [annualIncome, setAnnualIncome] = useState(1200000);

  // Filter and sort funds
  const filteredFunds = useMemo(() => {
    let funds = [...ELSS_FUNDS];
    
    // Search filter
    if (searchTerm) {
      funds = funds.filter(f => 
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.amc.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      funds = funds.filter(f => f.category === selectedCategory);
    }
    
    // Sort
    funds.sort((a, b) => {
      switch (sortBy) {
        case 'returns3Y':
          return b.returns.threeYear - a.returns.threeYear;
        case 'rating':
          return b.rating - a.rating;
        case 'expense':
          return a.expenseRatio - b.expenseRatio;
        case 'aum':
          return b.aum - a.aum;
        default:
          return 0;
      }
    });
    
    return funds;
  }, [searchTerm, selectedCategory, sortBy]);

  // Get selected fund objects
  const selectedFundObjects = useMemo(() => {
    return ELSS_FUNDS.filter(f => selectedFunds.includes(f.id));
  }, [selectedFunds]);

  // Calculate SIP projections for selected funds
  const sipProjections = useMemo(() => {
    return selectedFundObjects.map(fund => ({
      fund,
      projection: calculateSIPReturns(
        monthlyInvestment,
        fund.returns.threeYear, // Use 3Y return as expected return
        investmentYears,
        annualIncome
      ),
    }));
  }, [selectedFundObjects, monthlyInvestment, investmentYears, annualIncome]);

  // Tax savings calculation
  const taxSavings = useMemo(() => {
    return calculateTaxSavings(monthlyInvestment * 12, annualIncome);
  }, [monthlyInvestment, annualIncome]);

  // 80C comparison
  const comparison80C = useMemo(() => {
    const avgReturn = selectedFundObjects.length > 0
      ? selectedFundObjects.reduce((sum, f) => sum + f.returns.threeYear, 0) / selectedFundObjects.length
      : 12;
    return compareWith80COptions(monthlyInvestment * 12, investmentYears, avgReturn);
  }, [selectedFundObjects, monthlyInvestment, investmentYears]);

  // Toggle fund selection
  const toggleFundSelection = (fundId: string) => {
    setSelectedFunds(prev => 
      prev.includes(fundId)
        ? prev.filter(id => id !== fundId)
        : prev.length < 5 ? [...prev, fundId] : prev
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `\u20B9${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `\u20B9${(amount / 100000).toFixed(2)} L`;
    }
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  // Chart data for comparison
  const comparisonChartData = sipProjections.map(({ fund, projection }) => ({
    name: fund.name.split(' ').slice(0, 2).join(' '),
    invested: projection.totalInvested,
    value: projection.expectedValue,
    gains: projection.gains,
  }));

  // Radar chart data
  const radarData = selectedFundObjects.length > 0 ? [
    { metric: '1Y Returns', ...Object.fromEntries(selectedFundObjects.map(f => [f.id, f.returns.oneYear])) },
    { metric: '3Y Returns', ...Object.fromEntries(selectedFundObjects.map(f => [f.id, f.returns.threeYear])) },
    { metric: '5Y Returns', ...Object.fromEntries(selectedFundObjects.map(f => [f.id, f.returns.fiveYear])) },
    { metric: 'Rating', ...Object.fromEntries(selectedFundObjects.map(f => [f.id, f.rating * 10])) },
    { metric: 'Low Expense', ...Object.fromEntries(selectedFundObjects.map(f => [f.id, (2 - f.expenseRatio) * 25])) },
  ] : [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-green-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-green-300" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/calculators" className="text-green-200 hover:text-white">Calculators</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-green-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">ELSS Comparator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">ELSS Fund Comparator</h1>
              <p className="text-green-200 mt-1">
                Compare tax-saving mutual funds and maximize your 80C benefits
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-green-200">Tax Benefit (80C)</p>
              <p className="text-2xl font-bold">\u20B91.5 Lakh</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-green-200">Lock-in Period</p>
              <p className="text-2xl font-bold">3 Years</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-green-200">Your Tax Saved</p>
              <p className="text-2xl font-bold">{formatCurrency(taxSavings.taxSaved)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-green-200">Funds Selected</p>
              <p className="text-2xl font-bold">{selectedFunds.length}/5</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="compare" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="compare">Compare</TabsTrigger>
            <TabsTrigger value="all-funds">All Funds</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="vs-80c">vs Other 80C</TabsTrigger>
          </TabsList>

          {/* Compare Tab */}
          <TabsContent value="compare" className="space-y-6">
            {selectedFunds.length === 0 ? (
              <Card className="p-12 text-center">
                <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Funds Selected</h3>
                <p className="text-gray-500 mb-4">
                  Select up to 5 funds from the "All Funds" tab to compare them
                </p>
                <Button onClick={() => document.querySelector('[value="all-funds"]')?.dispatchEvent(new Event('click'))}>
                  Browse Funds
                </Button>
              </Card>
            ) : (
              <>
                {/* Comparison Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fund Comparison</CardTitle>
                    <CardDescription>{selectedFunds.length} funds selected</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="w-full">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">Fund</TableHead>
                            <TableHead className="text-right">1Y Return</TableHead>
                            <TableHead className="text-right">3Y Return</TableHead>
                            <TableHead className="text-right">5Y Return</TableHead>
                            <TableHead className="text-right">Expense</TableHead>
                            <TableHead className="text-right">Rating</TableHead>
                            <TableHead className="text-right">AUM</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedFundObjects.map((fund, index) => (
                            <TableRow key={fund.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                  />
                                  <div>
                                    <p className="font-medium text-sm">{fund.name}</p>
                                    <p className="text-xs text-gray-500">{fund.category}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={fund.returns.oneYear >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {fund.returns.oneYear}%
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={fund.returns.threeYear >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {fund.returns.threeYear}%
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={fund.returns.fiveYear >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {fund.returns.fiveYear}%
                                </span>
                              </TableCell>
                              <TableCell className="text-right">{fund.expenseRatio}%</TableCell>
                              <TableCell className="text-right">{renderStars(fund.rating)}</TableCell>
                              <TableCell className="text-right">{formatCurrency(fund.aum * 10000000)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Returns Comparison Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Returns Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={[
                            { period: '1 Year', ...Object.fromEntries(selectedFundObjects.map(f => [f.id, f.returns.oneYear])) },
                            { period: '3 Years', ...Object.fromEntries(selectedFundObjects.map(f => [f.id, f.returns.threeYear])) },
                            { period: '5 Years', ...Object.fromEntries(selectedFundObjects.map(f => [f.id, f.returns.fiveYear])) },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="period" />
                            <YAxis tickFormatter={(v) => `${v}%`} />
                            <Tooltip formatter={(value: number) => `${value}%`} />
                            <Legend />
                            {selectedFundObjects.map((fund, index) => (
                              <Bar 
                                key={fund.id} 
                                dataKey={fund.id} 
                                fill={COLORS[index % COLORS.length]} 
                                name={fund.name.split(' ').slice(0, 2).join(' ')}
                                radius={[4, 4, 0, 0]}
                              />
                            ))}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Fund Characteristics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" />
                            <PolarRadiusAxis angle={30} domain={[0, 50]} />
                            {selectedFundObjects.map((fund, index) => (
                              <Radar
                                key={fund.id}
                                name={fund.name.split(' ').slice(0, 2).join(' ')}
                                dataKey={fund.id}
                                stroke={COLORS[index % COLORS.length]}
                                fill={COLORS[index % COLORS.length]}
                                fillOpacity={0.2}
                              />
                            ))}
                            <Legend />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* SIP Projection */}
                <Card>
                  <CardHeader>
                    <CardTitle>SIP Projection ({investmentYears} Years)</CardTitle>
                    <CardDescription>Based on {formatCurrency(monthlyInvestment)}/month investment</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={comparisonChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(v) => `\u20B9${(v/100000).toFixed(0)}L`} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="invested" fill="#94a3b8" name="Invested" stackId="a" />
                          <Bar dataKey="gains" fill="#22c55e" name="Gains" stackId="a" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* All Funds Tab */}
          <TabsContent value="all-funds" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Search funds..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {FUND_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="returns3Y">3Y Returns</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="expense">Expense Ratio</SelectItem>
                      <SelectItem value="aum">AUM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fund List */}
            <Card>
              <CardHeader>
                <CardTitle>ELSS Funds ({filteredFunds.length})</CardTitle>
                <CardDescription>Select up to 5 funds to compare</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredFunds.map((fund) => (
                      <div 
                        key={fund.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedFunds.includes(fund.id) 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                            : 'hover:border-gray-400'
                        }`}
                        onClick={() => toggleFundSelection(fund.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={selectedFunds.includes(fund.id)}
                              onCheckedChange={() => toggleFundSelection(fund.id)}
                            />
                            <div>
                              <h4 className="font-semibold">{fund.name}</h4>
                              <p className="text-sm text-gray-500">{fund.amc}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{fund.category}</Badge>
                                <Badge variant="outline" className="text-xs">
                                  Min SIP: \u20B9{fund.minSIP}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            {renderStars(fund.rating)}
                            <p className="text-sm text-gray-500 mt-1">AUM: {formatCurrency(fund.aum * 10000000)}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                          <div>
                            <p className="text-xs text-gray-500">1Y Return</p>
                            <p className={`font-semibold ${fund.returns.oneYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {fund.returns.oneYear}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">3Y Return</p>
                            <p className={`font-semibold ${fund.returns.threeYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {fund.returns.threeYear}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">5Y Return</p>
                            <p className={`font-semibold ${fund.returns.fiveYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {fund.returns.fiveYear}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Expense Ratio</p>
                            <p className="font-semibold">{fund.expenseRatio}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calculator Tab */}
          <TabsContent value="calculator" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-green-600" />
                    Investment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="monthly">Monthly SIP Amount</Label>
                    <div className="relative mt-1">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="monthly"
                        type="number"
                        value={monthlyInvestment}
                        onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Yearly: {formatCurrency(monthlyInvestment * 12)}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="years">Investment Period (Years)</Label>
                    <Input
                      id="years"
                      type="number"
                      value={investmentYears}
                      onChange={(e) => setInvestmentYears(Number(e.target.value))}
                      min={3}
                      max={30}
                    />
                  </div>

                  <div>
                    <Label htmlFor="income">Annual Income</Label>
                    <div className="relative mt-1">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="income"
                        type="number"
                        value={annualIncome}
                        onChange={(e) => setAnnualIncome(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Savings */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-purple-600" />
                    Tax Savings Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-sm text-blue-700">Investment</p>
                      <p className="text-xl font-bold text-blue-800">{formatCurrency(taxSavings.investment)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-sm text-green-700">Deduction (80C)</p>
                      <p className="text-xl font-bold text-green-800">{formatCurrency(taxSavings.deductionClaimed)}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg text-center">
                      <p className="text-sm text-purple-700">Tax Saved</p>
                      <p className="text-xl font-bold text-purple-800">{formatCurrency(taxSavings.taxSaved)}</p>
                    </div>
                    <div className="p-4 bg-orange-50 rounded-lg text-center">
                      <p className="text-sm text-orange-700">Effective Cost</p>
                      <p className="text-xl font-bold text-orange-800">{formatCurrency(taxSavings.effectiveCost)}</p>
                    </div>
                  </div>

                  <Alert className="mt-4 bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Your effective investment cost is just <strong>{formatCurrency(taxSavings.effectiveCost)}</strong> after 
                      considering tax savings. That's a <strong>{((1 - taxSavings.effectiveCost / taxSavings.investment) * 100).toFixed(0)}% discount</strong> on your investment!
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            {/* SIP Projections for selected funds */}
            {selectedFunds.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>SIP Projections for Selected Funds</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sipProjections.map(({ fund, projection }) => (
                      <div key={fund.id} className="p-4 border rounded-lg">
                        <h4 className="font-semibold text-sm mb-3">{fund.name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Total Invested</span>
                            <span>{formatCurrency(projection.totalInvested)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Expected Value</span>
                            <span className="text-green-600 font-medium">{formatCurrency(projection.expectedValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Gains</span>
                            <span className="text-green-600">{formatCurrency(projection.gains)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">LTCG Tax</span>
                            <span className="text-red-600">-{formatCurrency(projection.ltcgTax)}</span>
                          </div>
                          <div className="flex justify-between border-t pt-2">
                            <span className="font-medium">Net Value</span>
                            <span className="font-bold">{formatCurrency(projection.netValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tax Saved (80C)</span>
                            <span className="text-purple-600">+{formatCurrency(projection.taxSaved)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* vs 80C Tab */}
          <TabsContent value="vs-80c" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ELSS vs Other 80C Options</CardTitle>
                <CardDescription>
                  Compare ELSS with PPF, Tax-Saver FD, and NSC over {investmentYears} years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'ELSS', value: comparison80C.elss.value, taxBenefit: comparison80C.elss.taxBenefit },
                      { name: 'PPF', value: comparison80C.ppf.value, taxBenefit: comparison80C.ppf.taxBenefit },
                      { name: 'Tax-Saver FD', value: comparison80C.fd.value, taxBenefit: comparison80C.fd.taxBenefit },
                      { name: 'NSC', value: comparison80C.nsc.value, taxBenefit: comparison80C.nsc.taxBenefit },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `\u20B9${(v/100000).toFixed(0)}L`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="value" fill="#22c55e" name="Corpus Value" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="taxBenefit" fill="#8b5cf6" name="Tax Benefit" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Comparison Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-2 border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-lg text-green-800">ELSS</CardTitle>
                  <CardDescription>Expected ~12% returns</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Corpus</span>
                    <span className="font-bold">{formatCurrency(comparison80C.elss.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Benefit</span>
                    <span className="font-bold text-purple-600">{formatCurrency(comparison80C.elss.taxBenefit)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-green-600">{formatCurrency(comparison80C.elss.value + comparison80C.elss.taxBenefit)}</span>
                  </div>
                  <Badge className="w-full justify-center bg-green-100 text-green-700">
                    3 Year Lock-in
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-lg text-blue-800">PPF</CardTitle>
                  <CardDescription>Guaranteed 7.1%</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Corpus</span>
                    <span className="font-bold">{formatCurrency(comparison80C.ppf.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Benefit</span>
                    <span className="font-bold text-purple-600">{formatCurrency(comparison80C.ppf.taxBenefit)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-blue-600">{formatCurrency(comparison80C.ppf.value + comparison80C.ppf.taxBenefit)}</span>
                  </div>
                  <Badge className="w-full justify-center bg-blue-100 text-blue-700">
                    15 Year Lock-in
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-lg text-orange-800">Tax-Saver FD</CardTitle>
                  <CardDescription>~6.5% returns</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Corpus (post-tax)</span>
                    <span className="font-bold">{formatCurrency(comparison80C.fd.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Benefit</span>
                    <span className="font-bold text-purple-600">{formatCurrency(comparison80C.fd.taxBenefit)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-orange-600">{formatCurrency(comparison80C.fd.value + comparison80C.fd.taxBenefit)}</span>
                  </div>
                  <Badge className="w-full justify-center bg-orange-100 text-orange-700">
                    5 Year Lock-in
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-lg text-purple-800">NSC</CardTitle>
                  <CardDescription>7.7% returns</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Corpus (post-tax)</span>
                    <span className="font-bold">{formatCurrency(comparison80C.nsc.value)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax Benefit</span>
                    <span className="font-bold text-purple-600">{formatCurrency(comparison80C.nsc.taxBenefit)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-purple-600">{formatCurrency(comparison80C.nsc.value + comparison80C.nsc.taxBenefit)}</span>
                  </div>
                  <Badge className="w-full justify-center bg-purple-100 text-purple-700">
                    5 Year Lock-in
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <Alert className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertTitle className="text-blue-800">Key Differences</AlertTitle>
              <AlertDescription className="text-blue-700">
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>ELSS:</strong> Shortest lock-in (3 years), market-linked returns, LTCG tax applicable</li>
                  <li><strong>PPF:</strong> Tax-free returns, longest lock-in (15 years), government-backed</li>
                  <li><strong>FD:</strong> Guaranteed returns, interest fully taxable, 5 year lock-in</li>
                  <li><strong>NSC:</strong> Government-backed, interest taxable, good for conservative investors</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

