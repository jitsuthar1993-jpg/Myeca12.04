import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, PiggyBank, Target, AlertCircle, IndianRupee, Calendar, Percent, BarChart3, LineChart } from "lucide-react";
import { calculateEnhancedSIP, formatCurrency, CURRENT_RATES } from "@/lib/enhanced-calculator-utils";
import { SIPGrowthChart } from "@/components/ui/calculator-chart";
import { CalculatorHeader } from "@/components/ui/calculator-header";

export default function EnhancedSIPCalculator() {
  const [monthlyAmount, setMonthlyAmount] = useState(5000);
  const [years, setYears] = useState(10);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [investmentType, setInvestmentType] = useState('equity');
  const [showChart, setShowChart] = useState(true);
  
  const result = calculateEnhancedSIP(monthlyAmount, years, expectedReturn);
  
  // Update expected return based on investment type
  useEffect(() => {
    switch (investmentType) {
      case 'equity':
        setExpectedReturn(CURRENT_RATES.EQUITY_EXPECTED);
        break;
      case 'debt':
        setExpectedReturn(CURRENT_RATES.DEBT_EXPECTED);
        break;
      case 'hybrid':
        setExpectedReturn(CURRENT_RATES.HYBRID_EXPECTED);
        break;
      case 'elss':
        setExpectedReturn(CURRENT_RATES.ELSS_EXPECTED);
        break;
      default:
        setExpectedReturn(12);
    }
  }, [investmentType]);

  const investmentTypes = [
    { value: 'equity', label: 'Equity Funds', return: CURRENT_RATES.EQUITY_EXPECTED },
    { value: 'debt', label: 'Debt Funds', return: CURRENT_RATES.DEBT_EXPECTED },
    { value: 'hybrid', label: 'Hybrid Funds', return: CURRENT_RATES.HYBRID_EXPECTED },
    { value: 'elss', label: 'ELSS Funds', return: CURRENT_RATES.ELSS_EXPECTED }
  ];

  const monthlyAmountSuggestions = [
    { amount: 1000, description: "Beginner friendly" },
    { amount: 5000, description: "Most popular choice" },
    { amount: 10000, description: "Aggressive wealth building" },
    { amount: 25000, description: "High net worth" }
  ];

  return (
    <div className="calculator-page min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <CalculatorHeader
          icon={TrendingUp}
          title="Enhanced SIP Calculator"
          subtitle="Plan your mutual fund investments with accurate calculations and visualizations. Make informed decisions for long-term wealth creation."
          color="blue"
          align="center"
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  SIP Investment Details
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PiggyBank className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Investment Type Selection */}
              <div className="space-y-2">
                <Label>Investment Type</Label>
                <Select value={investmentType} onValueChange={setInvestmentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {investmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} (~{type.return}% p.a.)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Monthly Amount */}
              <div className="space-y-2">
                <Label>Monthly Investment Amount</Label>
                <Input
                  type="number"
                  value={monthlyAmount}
                  onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                  className="text-lg"
                />
                <div className="grid grid-cols-2 gap-2">
                  {monthlyAmountSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion.amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setMonthlyAmount(suggestion.amount)}
                      className="text-xs"
                    >
                      \u20B9{suggestion.amount.toLocaleString()}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Investment Period */}
              <div className="space-y-2">
                <Label>Investment Period (Years)</Label>
                <div className="px-4 py-3 bg-green-50 rounded-lg">
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-green-700">{years} years</span>
                  </div>
                  <Slider
colorTheme="blue"                     value={[years]}
                    onValueChange={(value) => setYears(value[0])}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 year</span>
                    <span>30 years</span>
                  </div>
                </div>
              </div>

              {/* Expected Return */}
              <div className="space-y-2">
                <Label>Expected Annual Return (%)</Label>
                <div className="px-4 py-3 bg-purple-50 rounded-lg">
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-purple-700">{expectedReturn}%</span>
                  </div>
                  <Slider
colorTheme="blue"                     value={[expectedReturn]}
                    onValueChange={(value) => setExpectedReturn(value[0])}
                    max={25}
                    min={1}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>

              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Disclaimer:</strong> SIP investments are subject to market risks. 
                  Returns are not guaranteed and may vary.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white rounded-2xl shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Investment Results
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={showChart ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowChart(true)}
                  >
                    <LineChart className="w-4 h-4 mr-1" />
                    Chart
                  </Button>
                  <Button
                    variant={!showChart ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowChart(false)}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Table
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Total Investment</p>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(result.totalInvestment)}</p>
                    </div>
                    <PiggyBank className="w-8 h-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Wealth Gain</p>
                      <p className="text-2xl font-bold text-green-900">+{formatCurrency(result.wealthGain)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Maturity Value</p>
                      <p className="text-2xl font-bold text-purple-900">{formatCurrency(result.maturityValue)}</p>
                    </div>
                    <Target className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Chart or Table View */}
              <div className="h-96">
                {showChart ? (
                  <SIPGrowthChart data={result.yearlyBreakdown} />
                ) : (
                  <div className="overflow-auto h-full">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Year</th>
                          <th className="text-right p-2">Investment</th>
                          <th className="text-right p-2">Value</th>
                          <th className="text-right p-2">Returns</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.yearlyBreakdown.map((year) => (
                          <tr key={year.year} className="border-b">
                            <td className="p-2">{year.year}</td>
                            <td className="text-right p-2">{formatCurrency(year.investment)}</td>
                            <td className="text-right p-2">{formatCurrency(year.value)}</td>
                            <td className="text-right p-2 text-green-600">+{formatCurrency(year.interestEarned)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Key Metrics */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold mb-3">Key Metrics</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Wealth Multiplier:</span>
                    <span className="font-semibold ml-2">{(result.maturityValue / result.totalInvestment).toFixed(2)}x</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Monthly Commitment:</span>
                    <span className="font-semibold ml-2">{formatCurrency(monthlyAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}