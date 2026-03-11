import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingDown,
  TrendingUp,
  IndianRupee,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Calculator,
  Lightbulb,
  Calendar,
  PieChart,
  ArrowRight,
  Download,
  Sparkles,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { CalculatorExport } from "@/components/ui/calculator-export";
import EnhancedSEO from "@/components/EnhancedSEO";

interface Investment {
  id: string;
  name: string;
  type: 'equity' | 'equity_mf' | 'debt_mf' | 'gold' | 'other';
  purchaseDate: string;
  purchasePrice: number;
  currentPrice: number;
  quantity: number;
}

const ASSET_TYPES = [
  { value: 'equity', label: 'Stocks/Equity', holdingPeriod: 12 },
  { value: 'equity_mf', label: 'Equity Mutual Funds', holdingPeriod: 12 },
  { value: 'debt_mf', label: 'Debt Mutual Funds', holdingPeriod: 24 },
  { value: 'gold', label: 'Gold/Gold ETF', holdingPeriod: 24 },
  { value: 'other', label: 'Other Assets', holdingPeriod: 24 },
];

const TAX_RATES = {
  equity_stcg: 20, // Changed from 15% to 20% for FY 2024-25
  equity_ltcg: 12.5, // Changed from 10% to 12.5%
  equity_ltcg_exemption: 125000,
  debt_stcg: 30, // As per slab
  debt_ltcg: 20, // With indexation benefit removed for new purchases
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculateHoldingDays = (purchaseDate: string) => {
  const purchase = new Date(purchaseDate);
  const today = new Date();
  return Math.floor((today.getTime() - purchase.getTime()) / (1000 * 60 * 60 * 24));
};

const isLongTerm = (type: Investment['type'], holdingDays: number) => {
  const assetConfig = ASSET_TYPES.find(a => a.value === type);
  if (!assetConfig) return false;
  return holdingDays >= assetConfig.holdingPeriod * 30;
};

export default function TaxLossHarvestingPage() {
  const [investments, setInvestments] = useState<Investment[]>([
    {
      id: '1',
      name: 'Reliance Industries',
      type: 'equity',
      purchaseDate: '2024-01-15',
      purchasePrice: 2800,
      currentPrice: 2650,
      quantity: 50,
    },
    {
      id: '2',
      name: 'HDFC Bank',
      type: 'equity',
      purchaseDate: '2023-06-10',
      purchasePrice: 1650,
      currentPrice: 1720,
      quantity: 100,
    },
    {
      id: '3',
      name: 'Nifty 50 Index Fund',
      type: 'equity_mf',
      purchaseDate: '2023-03-01',
      purchasePrice: 180,
      currentPrice: 165,
      quantity: 500,
    },
  ]);

  const [newInvestment, setNewInvestment] = useState<Partial<Investment>>({
    type: 'equity',
    quantity: 1,
  });

  const addInvestment = () => {
    if (!newInvestment.name || !newInvestment.purchaseDate || !newInvestment.purchasePrice || !newInvestment.currentPrice) {
      return;
    }

    const investment: Investment = {
      id: Date.now().toString(),
      name: newInvestment.name,
      type: newInvestment.type as Investment['type'],
      purchaseDate: newInvestment.purchaseDate,
      purchasePrice: Number(newInvestment.purchasePrice),
      currentPrice: Number(newInvestment.currentPrice),
      quantity: Number(newInvestment.quantity) || 1,
    };

    setInvestments([...investments, investment]);
    setNewInvestment({ type: 'equity', quantity: 1 });
  };

  const removeInvestment = (id: string) => {
    setInvestments(investments.filter(inv => inv.id !== id));
  };

  const analysis = useMemo(() => {
    const analyzed = investments.map(inv => {
      const holdingDays = calculateHoldingDays(inv.purchaseDate);
      const totalCost = inv.purchasePrice * inv.quantity;
      const currentValue = inv.currentPrice * inv.quantity;
      const gainLoss = currentValue - totalCost;
      const gainLossPercent = (gainLoss / totalCost) * 100;
      const isLT = isLongTerm(inv.type, holdingDays);
      
      // Calculate potential tax impact
      let taxRate = 0;
      if (inv.type === 'equity' || inv.type === 'equity_mf') {
        taxRate = isLT ? TAX_RATES.equity_ltcg : TAX_RATES.equity_stcg;
      } else {
        taxRate = isLT ? TAX_RATES.debt_ltcg : TAX_RATES.debt_stcg;
      }
      
      const potentialTax = gainLoss > 0 ? (gainLoss * taxRate) / 100 : 0;
      const taxSavings = gainLoss < 0 ? Math.abs(gainLoss * taxRate) / 100 : 0;

      return {
        ...inv,
        holdingDays,
        totalCost,
        currentValue,
        gainLoss,
        gainLossPercent,
        isLongTerm: isLT,
        taxRate,
        potentialTax,
        taxSavings,
        recommendation: gainLoss < 0 ? 'harvest' : gainLoss > 0 ? 'hold' : 'neutral',
      };
    });

    // Summary calculations
    const totalUnrealizedGain = analyzed.filter(a => a.gainLoss > 0).reduce((sum, a) => sum + a.gainLoss, 0);
    const totalUnrealizedLoss = analyzed.filter(a => a.gainLoss < 0).reduce((sum, a) => sum + Math.abs(a.gainLoss), 0);
    const netGainLoss = totalUnrealizedGain - totalUnrealizedLoss;
    
    // Potential tax savings from harvesting losses
    const harvestableInvestments = analyzed.filter(a => a.gainLoss < 0);
    const totalPotentialSavings = harvestableInvestments.reduce((sum, a) => sum + a.taxSavings, 0);

    // Sort by recommendation priority
    const sortedAnalysis = [...analyzed].sort((a, b) => {
      if (a.recommendation === 'harvest' && b.recommendation !== 'harvest') return -1;
      if (a.recommendation !== 'harvest' && b.recommendation === 'harvest') return 1;
      return a.gainLoss - b.gainLoss;
    });

    return {
      investments: sortedAnalysis,
      totalUnrealizedGain,
      totalUnrealizedLoss,
      netGainLoss,
      totalPotentialSavings,
      harvestableCount: harvestableInvestments.length,
    };
  }, [investments]);

  const chartData = [
    { name: 'Gains', value: analysis.totalUnrealizedGain, color: '#22c55e' },
    { name: 'Losses', value: analysis.totalUnrealizedLoss, color: '#ef4444' },
  ];

  return (
    <>
      <EnhancedSEO
        title="Tax Loss Harvesting Calculator - Optimize Your Capital Gains Tax | MyeCA"
        description="Analyze your investment portfolio for tax loss harvesting opportunities. Offset capital gains with losses and reduce your tax liability legally."
        keywords={["tax loss harvesting", "capital gains tax", "offset capital gains", "investment tax planning", "STCG LTCG calculator", "portfolio tax analysis"]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full mb-4">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Tax Optimization</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Tax Loss Harvesting Advisor
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Analyze your portfolio to identify opportunities to offset capital gains with losses and reduce your tax liability
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className={`${analysis.netGainLoss >= 0 ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} text-white border-0`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Net Position</p>
                    <p className="text-2xl font-bold">{formatCurrency(analysis.netGainLoss)}</p>
                  </div>
                  {analysis.netGainLoss >= 0 ? (
                    <TrendingUp className="h-8 w-8 text-white/60" />
                  ) : (
                    <TrendingDown className="h-8 w-8 text-white/60" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Unrealized Gains</p>
                    <p className="text-2xl font-bold">{formatCurrency(analysis.totalUnrealizedGain)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-white/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-rose-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Unrealized Losses</p>
                    <p className="text-2xl font-bold">{formatCurrency(analysis.totalUnrealizedLoss)}</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-white/60" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">Potential Tax Savings</p>
                    <p className="text-2xl font-bold">{formatCurrency(analysis.totalPotentialSavings)}</p>
                  </div>
                  <Sparkles className="h-8 w-8 text-white/60" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Harvest Recommendation */}
          {analysis.harvestableCount > 0 && (
            <Alert className="mb-6 border-purple-200 bg-purple-50">
              <Lightbulb className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-800">Harvesting Opportunity Found!</AlertTitle>
              <AlertDescription className="text-purple-700">
                You have {analysis.harvestableCount} investment(s) with unrealized losses. 
                Selling them could save you up to <strong>{formatCurrency(analysis.totalPotentialSavings)}</strong> in taxes 
                by offsetting capital gains.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Portfolio List */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    Your Investments
                  </CardTitle>
                  <CardDescription>
                    Add your investments to analyze tax loss harvesting opportunities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Investment Form */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h4 className="font-medium text-sm text-gray-700">Add Investment</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="col-span-2 md:col-span-1">
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={newInvestment.name || ''}
                          onChange={(e) => setNewInvestment({ ...newInvestment, name: e.target.value })}
                          placeholder="Stock/MF name"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Type</Label>
                        <Select
                          value={newInvestment.type}
                          onValueChange={(v) => setNewInvestment({ ...newInvestment, type: v as Investment['type'] })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ASSET_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs">Purchase Date</Label>
                        <Input
                          type="date"
                          value={newInvestment.purchaseDate || ''}
                          onChange={(e) => setNewInvestment({ ...newInvestment, purchaseDate: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Buy Price</Label>
                        <Input
                          type="number"
                          value={newInvestment.purchasePrice || ''}
                          onChange={(e) => setNewInvestment({ ...newInvestment, purchasePrice: Number(e.target.value) })}
                          placeholder={"\u20B9"}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Current Price</Label>
                        <Input
                          type="number"
                          value={newInvestment.currentPrice || ''}
                          onChange={(e) => setNewInvestment({ ...newInvestment, currentPrice: Number(e.target.value) })}
                          placeholder={"\u20B9"}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          value={newInvestment.quantity || ''}
                          onChange={(e) => setNewInvestment({ ...newInvestment, quantity: Number(e.target.value) })}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <Button onClick={addInvestment} size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Investment
                    </Button>
                  </div>

                  {/* Investment List */}
                  <AnimatePresence>
                    {analysis.investments.map((inv, index) => (
                      <motion.div
                        key={inv.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 border rounded-xl ${
                          inv.recommendation === 'harvest' 
                            ? 'border-purple-300 bg-purple-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{inv.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {ASSET_TYPES.find(t => t.value === inv.type)?.label}
                              </Badge>
                              <Badge className={inv.isLongTerm ? 'bg-blue-500' : 'bg-orange-500'}>
                                {inv.isLongTerm ? 'LTCG' : 'STCG'}
                              </Badge>
                              {inv.recommendation === 'harvest' && (
                                <Badge className="bg-purple-500">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Harvest
                                </Badge>
                              )}
                            </div>
                            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                              <div>
                                <span className="text-gray-500">Qty:</span> {inv.quantity}
                              </div>
                              <div>
                                <span className="text-gray-500">Buy:</span> {formatCurrency(inv.purchasePrice)}
                              </div>
                              <div>
                                <span className="text-gray-500">Now:</span> {formatCurrency(inv.currentPrice)}
                              </div>
                              <div>
                                <span className="text-gray-500">Holding:</span> {inv.holdingDays} days
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${inv.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {inv.gainLoss >= 0 ? '+' : ''}{formatCurrency(inv.gainLoss)}
                            </p>
                            <p className={`text-xs ${inv.gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {inv.gainLossPercent >= 0 ? '+' : ''}{inv.gainLossPercent.toFixed(2)}%
                            </p>
                            {inv.taxSavings > 0 && (
                              <p className="text-xs text-purple-600 mt-1">
                                Save {formatCurrency(inv.taxSavings)} tax
                              </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeInvestment(inv.id)}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {investments.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <PieChart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No investments added yet</p>
                      <p className="text-sm">Add your holdings above to analyze tax loss harvesting opportunities</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Analysis Panel */}
            <div className="space-y-6">
              {/* Chart */}
              {(analysis.totalUnrealizedGain > 0 || analysis.totalUnrealizedLoss > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Gain/Loss Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <Pie
                            data={chartData.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                            labelLine={false}
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tax Rates Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Tax Rates (FY 2024-25)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Equity STCG</span>
                    <span className="font-medium">{TAX_RATES.equity_stcg}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Equity LTCG</span>
                    <span className="font-medium">{TAX_RATES.equity_ltcg}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">LTCG Exemption</span>
                    <span className="font-medium">{formatCurrency(TAX_RATES.equity_ltcg_exemption)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Debt STCG</span>
                    <span className="font-medium">As per slab</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Debt LTCG</span>
                    <span className="font-medium">{TAX_RATES.debt_ltcg}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Wash Sale Warning */}
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-800">Wash Sale Rule</AlertTitle>
                <AlertDescription className="text-orange-700 text-sm">
                  If you plan to repurchase the same security, wait at least 30 days to avoid wash sale concerns 
                  and ensure the loss is allowed for tax purposes.
                </AlertDescription>
              </Alert>

              {/* Export */}
              <Card>
                <CardContent className="pt-6">
                  <CalculatorExport
                    title="Tax Loss Harvesting Analysis"
                    data={{
                      "Total Unrealized Gains": analysis.totalUnrealizedGain,
                      "Total Unrealized Losses": analysis.totalUnrealizedLoss,
                      "Net Position": analysis.netGainLoss,
                      "Potential Tax Savings": analysis.totalPotentialSavings,
                      "Harvestable Investments": analysis.harvestableCount,
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* How It Works */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                How Tax Loss Harvesting Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Identify Losses</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Find investments that are currently trading below your purchase price
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Sell to Book Losses</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Sell these investments to realize the loss for tax purposes
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Offset Gains</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Use booked losses to offset capital gains and reduce your tax liability
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Key Rules:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    STCG can be offset against both STCG and LTCG
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    LTCG can only be offset against LTCG
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    Unabsorbed losses can be carried forward for 8 years
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    Wait 30 days before repurchasing the same security
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

