import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  Plus,
  Trash2,
  Info,
  ArrowUpDown,
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
  Percent,
  Wallet,
  Calendar,
  LineChart as LineChartIcon,
  RefreshCw,
  Lightbulb,
  AlertCircle
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Holding,
  AssetType,
  ASSET_TYPE_NAMES,
  SAMPLE_HOLDINGS,
  analyzeHolding,
  calculatePortfolioTax,
  getTaxHarvestingSuggestions,
  HoldingTaxAnalysis,
} from "@/lib/portfolio-tax-utils";

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

export default function PortfolioDashboardPage() {
  const [holdings, setHoldings] = useState<Holding[]>(SAMPLE_HOLDINGS);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newHolding, setNewHolding] = useState<Partial<Holding>>({
    type: 'equity',
    quantity: 0,
    buyPrice: 0,
    currentPrice: 0,
  });

  // Calculate portfolio analysis
  const portfolioSummary = useMemo(() => calculatePortfolioTax(holdings), [holdings]);
  const holdingAnalyses = useMemo(() => holdings.map(analyzeHolding), [holdings]);
  const harvestingSuggestions = useMemo(() => getTaxHarvestingSuggestions(holdings), [holdings]);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `\u20B9${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `\u20B9${(amount / 100000).toFixed(2)} L`;
    }
    return `\u20B9${Math.abs(amount).toLocaleString('en-IN')}`;
  };

  // Asset allocation data for pie chart
  const assetAllocationData = useMemo(() => {
    const allocation: Record<AssetType, number> = {
      equity: 0,
      equity_mf: 0,
      debt_mf: 0,
      gold: 0,
      property: 0,
      fd: 0,
      bonds: 0,
    };
    
    holdings.forEach(h => {
      allocation[h.type] += h.quantity * h.currentPrice;
    });
    
    return Object.entries(allocation)
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: ASSET_TYPE_NAMES[key as AssetType],
        value,
        type: key,
      }));
  }, [holdings]);

  // Tax breakdown data
  const taxBreakdownData = [
    { name: 'STCG', value: portfolioSummary.stcgTax, fill: '#ef4444' },
    { name: 'LTCG', value: portfolioSummary.ltcgTax, fill: '#f59e0b' },
    { name: 'Dividend TDS', value: portfolioSummary.dividendTDS, fill: '#8b5cf6' },
  ].filter(d => d.value > 0);

  // Gains vs losses
  const gainsLossData = holdingAnalyses.map(analysis => ({
    name: analysis.holding.name.substring(0, 15),
    gain: Math.max(0, analysis.unrealizedGain),
    loss: Math.min(0, analysis.unrealizedGain),
  }));

  // Add new holding
  const handleAddHolding = () => {
    if (newHolding.name && newHolding.quantity && newHolding.buyPrice && newHolding.currentPrice) {
      const holding: Holding = {
        id: Date.now().toString(),
        name: newHolding.name,
        type: newHolding.type as AssetType,
        quantity: Number(newHolding.quantity),
        buyPrice: Number(newHolding.buyPrice),
        currentPrice: Number(newHolding.currentPrice),
        buyDate: new Date(newHolding.buyDate || new Date()),
        dividendYield: newHolding.dividendYield ? Number(newHolding.dividendYield) : undefined,
      };
      setHoldings([...holdings, holding]);
      setNewHolding({ type: 'equity', quantity: 0, buyPrice: 0, currentPrice: 0 });
      setIsAddDialogOpen(false);
    }
  };

  // Remove holding
  const removeHolding = (id: string) => {
    setHoldings(holdings.filter(h => h.id !== id));
  };

  // Get recommendation badge
  const getRecommendationBadge = (analysis: HoldingTaxAnalysis) => {
    switch (analysis.recommendation) {
      case 'hold':
        return <Badge className="bg-blue-100 text-blue-700">Hold</Badge>;
      case 'sell':
        return <Badge className="bg-green-100 text-green-700">Consider Selling</Badge>;
      case 'book_loss':
        return <Badge className="bg-orange-100 text-orange-700">Book Loss</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-blue-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-blue-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">Portfolio Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <PieChartIcon className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Portfolio Tax Dashboard</h1>
                <p className="text-blue-200 mt-1">
                  Track your investment tax liability and optimize for maximum returns
                </p>
              </div>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white/20 hover:bg-white/30">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holding
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Holding</DialogTitle>
                  <DialogDescription>Enter the details of your investment</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="name">Asset Name</Label>
                    <Input 
                      id="name" 
                      value={newHolding.name || ''} 
                      onChange={e => setNewHolding({...newHolding, name: e.target.value})}
                      placeholder="e.g., Reliance Industries"
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Asset Type</Label>
                    <Select 
                      value={newHolding.type} 
                      onValueChange={v => setNewHolding({...newHolding, type: v as AssetType})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(ASSET_TYPE_NAMES).map(([key, name]) => (
                          <SelectItem key={key} value={key}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input 
                        id="quantity" 
                        type="number"
                        value={newHolding.quantity || ''} 
                        onChange={e => setNewHolding({...newHolding, quantity: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="buyDate">Buy Date</Label>
                      <Input 
                        id="buyDate" 
                        type="date"
                        value={newHolding.buyDate?.toString().split('T')[0] || ''} 
                        onChange={e => setNewHolding({...newHolding, buyDate: new Date(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="buyPrice">Buy Price (\u20B9)</Label>
                      <Input 
                        id="buyPrice" 
                        type="number"
                        value={newHolding.buyPrice || ''} 
                        onChange={e => setNewHolding({...newHolding, buyPrice: Number(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentPrice">Current Price (\u20B9)</Label>
                      <Input 
                        id="currentPrice" 
                        type="number"
                        value={newHolding.currentPrice || ''} 
                        onChange={e => setNewHolding({...newHolding, currentPrice: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dividendYield">Dividend Yield % (Optional)</Label>
                    <Input 
                      id="dividendYield" 
                      type="number"
                      step="0.1"
                      value={newHolding.dividendYield || ''} 
                      onChange={e => setNewHolding({...newHolding, dividendYield: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddHolding}>Add Holding</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-200">Portfolio Value</p>
              <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.currentValue)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-200">Unrealized Gain</p>
              <p className={`text-2xl font-bold ${portfolioSummary.unrealizedGain >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {portfolioSummary.unrealizedGain >= 0 ? '+' : '-'}{formatCurrency(portfolioSummary.unrealizedGain)}
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-200">Total Tax Liability</p>
              <p className="text-2xl font-bold text-orange-300">{formatCurrency(portfolioSummary.totalTaxLiability)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-blue-200">Tax Harvesting Potential</p>
              <p className="text-2xl font-bold text-green-300">
                {formatCurrency(harvestingSuggestions.reduce((sum, s) => sum + s.potentialSavings, 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-lg">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
            <TabsTrigger value="tax-analysis">Tax Analysis</TabsTrigger>
            <TabsTrigger value="harvesting">Tax Harvesting</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Asset Allocation */}
              <Card>
                <CardHeader>
                  <CardTitle>Asset Allocation</CardTitle>
                  <CardDescription>Distribution by asset type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={assetAllocationData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {assetAllocationData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Tax Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Estimated Tax Breakdown</CardTitle>
                  <CardDescription>Tax liability by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {taxBreakdownData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={taxBreakdownData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} />
                          <YAxis type="category" dataKey="name" width={100} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {taxBreakdownData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                          <p>No tax liability!</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-80">Total Invested</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.totalInvested)}</p>
                    </div>
                    <Wallet className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-80">STCG Gains</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.stcgAmount)}</p>
                      <p className="text-xs opacity-80">Tax: {formatCurrency(portfolioSummary.stcgTax)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-80">LTCG Gains</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.ltcgAmount)}</p>
                      <p className="text-xs opacity-80">Tax: {formatCurrency(portfolioSummary.ltcgTax)}</p>
                    </div>
                    <Target className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm opacity-80">Dividend Income</p>
                      <p className="text-2xl font-bold">{formatCurrency(portfolioSummary.dividendIncome)}</p>
                      <p className="text-xs opacity-80">TDS: {formatCurrency(portfolioSummary.dividendTDS)}</p>
                    </div>
                    <PiggyBank className="h-8 w-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gains Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Holdings Performance</CardTitle>
                <CardDescription>Unrealized gains/losses by holding</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gainsLossData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(v) => `\u20B9${(v/1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="gain" fill="#22c55e" name="Gain" stackId="a" />
                      <Bar dataKey="loss" fill="#ef4444" name="Loss" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Holdings Tab */}
          <TabsContent value="holdings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Your Holdings</CardTitle>
                    <CardDescription>{holdings.length} assets in portfolio</CardDescription>
                  </div>
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Holding
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Buy Price</TableHead>
                        <TableHead className="text-right">Current Price</TableHead>
                        <TableHead className="text-right">Invested</TableHead>
                        <TableHead className="text-right">Current Value</TableHead>
                        <TableHead className="text-right">Gain/Loss</TableHead>
                        <TableHead className="text-center">Type</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdingAnalyses.map((analysis) => (
                        <TableRow key={analysis.holding.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{analysis.holding.name}</p>
                              <p className="text-xs text-gray-500">
                                {analysis.holdingPeriodDays} days • {analysis.isLTCG ? 'LTCG' : 'STCG'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{analysis.holding.quantity}</TableCell>
                          <TableCell className="text-right">\u20B9{analysis.holding.buyPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right">\u20B9{analysis.holding.currentPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(analysis.investedValue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(analysis.currentValue)}</TableCell>
                          <TableCell className="text-right">
                            <div className={analysis.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'}>
                              <p className="font-medium">
                                {analysis.unrealizedGain >= 0 ? '+' : ''}{formatCurrency(analysis.unrealizedGain)}
                              </p>
                              <p className="text-xs">({analysis.gainPercent}%)</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline">{ASSET_TYPE_NAMES[analysis.holding.type]}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeHolding(analysis.holding.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Analysis Tab */}
          <TabsContent value="tax-analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Analysis by Holding</CardTitle>
                <CardDescription>Detailed tax implications for each investment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {holdingAnalyses.map((analysis) => (
                    <div 
                      key={analysis.holding.id}
                      className="p-4 border rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{analysis.holding.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{ASSET_TYPE_NAMES[analysis.holding.type]}</Badge>
                            <Badge className={analysis.isLTCG ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                              {analysis.isLTCG ? 'Long Term' : 'Short Term'}
                            </Badge>
                            {getRecommendationBadge(analysis)}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${analysis.unrealizedGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {analysis.unrealizedGain >= 0 ? '+' : ''}{formatCurrency(analysis.unrealizedGain)}
                          </p>
                          <p className="text-sm text-gray-500">{analysis.gainPercent}% return</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Holding Period</p>
                          <p className="font-semibold">{analysis.holdingPeriodDays} days</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Tax Rate</p>
                          <p className="font-semibold">{analysis.taxRate}%</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-gray-500">Taxable Gain</p>
                          <p className="font-semibold">{formatCurrency(analysis.taxableGain)}</p>
                        </div>
                        <div className="bg-orange-50 p-3 rounded-lg">
                          <p className="text-xs text-orange-700">Estimated Tax</p>
                          <p className="font-semibold text-orange-700">{formatCurrency(analysis.estimatedTax)}</p>
                        </div>
                      </div>
                      
                      {analysis.recommendationReason && (
                        <Alert className="mt-3 bg-blue-50 border-blue-200">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800">{analysis.recommendationReason}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* LTCG Exemption Info */}
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">LTCG Exemption Applied</AlertTitle>
              <AlertDescription className="text-green-700">
                For equity and equity mutual funds, LTCG up to \u20B91.25 lakh is exempt from tax. 
                This exemption has been applied to your portfolio-level tax calculation.
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* Tax Harvesting Tab */}
          <TabsContent value="harvesting" className="space-y-6">
            {harvestingSuggestions.length > 0 ? (
              <>
                <Alert className="bg-green-50 border-green-200">
                  <Lightbulb className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Tax Harvesting Opportunity</AlertTitle>
                  <AlertDescription className="text-green-700">
                    You can save up to <strong>{formatCurrency(harvestingSuggestions.reduce((sum, s) => sum + s.potentialSavings, 0))}</strong> by 
                    booking losses in loss-making positions to offset your capital gains.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <CardTitle>Tax Loss Harvesting Suggestions</CardTitle>
                    <CardDescription>
                      Strategic selling to reduce your tax liability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {harvestingSuggestions.map((suggestion, index) => (
                        <div 
                          key={suggestion.holding.id}
                          className="p-4 border rounded-lg border-orange-200 bg-orange-50/50"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-orange-100 rounded-full">
                                <span className="text-lg font-bold text-orange-600">#{index + 1}</span>
                              </div>
                              <div>
                                <h4 className="font-semibold">{suggestion.holding.name}</h4>
                                <Badge className="bg-red-100 text-red-700 mt-1">
                                  Loss: {formatCurrency(suggestion.loss)}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Potential Tax Savings</p>
                              <p className="text-xl font-bold text-green-600">
                                {formatCurrency(suggestion.potentialSavings)}
                              </p>
                            </div>
                          </div>
                          
                          <Alert className="bg-white border-orange-200">
                            <Info className="h-4 w-4 text-orange-600" />
                            <AlertDescription className="text-gray-700">{suggestion.reason}</AlertDescription>
                          </Alert>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tax Harvesting Rules */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Loss Harvesting Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">STCG losses can offset both STCG and LTCG gains</p>
                          <p className="text-gray-500">Short-term capital losses are more flexible</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">LTCG losses can only offset LTCG gains</p>
                          <p className="text-gray-500">Long-term losses cannot offset short-term gains</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Losses can be carried forward for 8 years</p>
                          <p className="text-gray-500">If you can't use them this year, they carry over</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Beware of wash sale implications</p>
                          <p className="text-gray-500">Avoid buying back the same stock within 30 days</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Tax Harvesting Needed</h3>
                <p className="text-gray-500">
                  Great news! All your holdings are in profit, so there are no loss-making 
                  positions to harvest for tax benefits.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

