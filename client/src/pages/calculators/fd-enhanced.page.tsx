import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PiggyBank, TrendingUp, AlertCircle, Calculator, Percent, IndianRupee, BarChart3, Table } from "lucide-react";
import { calculateEnhancedFD, formatCurrency, CURRENT_RATES } from "@/lib/enhanced-calculator-utils";
import { CalculatorChart } from "@/components/ui/calculator-chart";
import { CalculatorHeader } from "@/components/ui/calculator-header";

export default function EnhancedFDCalculator() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(6.5);
  const [years, setYears] = useState(5);
  const [compoundingFrequency, setCompoundingFrequency] = useState(4);
  const [taxRate, setTaxRate] = useState(30);
  const [bankSelected, setBankSelected] = useState('sbi');
  const [activeTab, setActiveTab] = useState('calculator');

  const result = calculateEnhancedFD(principal, rate, years, compoundingFrequency, taxRate);

  const banks = [
    { value: 'sbi', label: 'State Bank of India', rate: CURRENT_RATES.FD_RATES.SBI },
    { value: 'hdfc', label: 'HDFC Bank', rate: CURRENT_RATES.FD_RATES.HDFC },
    { value: 'icici', label: 'ICICI Bank', rate: CURRENT_RATES.FD_RATES.ICICI },
    { value: 'axis', label: 'Axis Bank', rate: CURRENT_RATES.FD_RATES.AXIS },
    { value: 'kotak', label: 'Kotak Mahindra Bank', rate: CURRENT_RATES.FD_RATES.KOTAK },
    { value: 'yes', label: 'Yes Bank', rate: CURRENT_RATES.FD_RATES.YES_BANK }
  ];

  const compoundingOptions = [
    { value: 1, label: 'Annually' },
    { value: 2, label: 'Half-yearly' },
    { value: 4, label: 'Quarterly' },
    { value: 12, label: 'Monthly' }
  ];

  const principalSuggestions = [25000, 50000, 100000, 500000, 1000000];

  const handleBankChange = (bankValue: string) => {
    setBankSelected(bankValue);
    const selectedBank = banks.find(bank => bank.value === bankValue);
    if (selectedBank) {
      setRate(selectedBank.rate);
    }
  };

  const chartData = result.yearlyBreakdown.map(year => ({
    year: year.year,
    investment: principal,
    interestEarned: Math.max(0, year.interest)
  }));

  return (
    <div className="calculator-page min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <CalculatorHeader
          icon={PiggyBank}
          title="Enhanced Fixed Deposit Calculator"
          subtitle="Calculate FD returns with accurate compounding, tax implications, and compare rates across major banks in India."
          color="green"
          align="center"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calculator">FD Calculator</TabsTrigger>
            <TabsTrigger value="comparison">Bank Comparison</TabsTrigger>
          </TabsList>

          <TabsContent value="calculator" className="space-y-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Input Section */}
              <Card className="bg-white rounded-2xl shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-900">
                      FD Investment Details
                    </CardTitle>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <PiggyBank className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bank Selection */}
                  <div className="space-y-2">
                    <Label>Select Bank</Label>
                    <Select value={bankSelected} onValueChange={handleBankChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {banks.map((bank) => (
                          <SelectItem key={bank.value} value={bank.value}>
                            {bank.label} ({bank.rate}% p.a.)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Principal Amount */}
                  <div className="space-y-2">
                    <Label>Principal Amount (\u20B9)</Label>
                    <Input
                      type="number"
                      value={principal}
                      onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                      className="text-lg"
                      min={0}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      {principalSuggestions.map((amount) => (
                        <Button
                          key={amount}
                          variant="outline"
                          size="sm"
                          onClick={() => setPrincipal(amount)}
                          className="text-xs"
                        >
                          \u20B9{(amount / 100000).toFixed(0)}L
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <Label>Annual Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                      className="text-lg"
                      min={0}
                    />
                  </div>

                  {/* Investment Period */}
                  <div className="space-y-2">
                    <Label>Investment Period (Years)</Label>
                    <Input
                      type="number"
                      value={years}
                      onChange={(e) => setYears(Math.max(1, Number(e.target.value)))}
                      className="text-lg"
                      min="1"
                      max="10"
                    />
                  </div>

                  {/* Compounding Frequency */}
                  <div className="space-y-2">
                    <Label>Compounding Frequency</Label>
                    <Select value={compoundingFrequency.toString()} onValueChange={(value) => setCompoundingFrequency(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {compoundingOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tax Rate */}
                  <div className="space-y-2">
                    <Label>Tax Rate (%)</Label>
                    <Select value={taxRate.toString()} onValueChange={(value) => setTaxRate(Number(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (No Tax)</SelectItem>
                        <SelectItem value="5">5% (Low Income)</SelectItem>
                        <SelectItem value="20">20% (Middle Income)</SelectItem>
                        <SelectItem value="30">30% (High Income)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                      <strong>Note:</strong> FD interest is subject to TDS if annual interest exceeds \u20B940,000 (\u20B950,000 for senior citizens).
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {/* Results Section */}
              <Card className="bg-white rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    FD Investment Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Principal Amount</p>
                          <p className="text-2xl font-bold text-blue-900">{formatCurrency(Math.max(0, result.principal))}</p>
                        </div>
                        <IndianRupee className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-600 text-sm font-medium">Interest Earned</p>
                          <p className="text-2xl font-bold text-green-900">{formatCurrency(Math.max(0, result.interest))}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Maturity Value</p>
                          <p className="text-2xl font-bold text-purple-900">{formatCurrency(Math.max(0, result.maturityValue))}</p>
                        </div>
                        <Calculator className="w-8 h-8 text-purple-600" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-600 text-sm font-medium">Post-Tax Returns</p>
                          <p className="text-2xl font-bold text-orange-900">{formatCurrency(Math.max(0, result.postTaxReturns))}</p>
                        </div>
                        <Percent className="w-8 h-8 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Key Metrics */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3">Key Metrics</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Effective Rate:</span>
                        <span className="font-semibold ml-2">{result.effectiveRate}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tax on Interest:</span>
                        <span className="font-semibold ml-2">{formatCurrency(Math.max(0, result.taxOnInterest))}</span>
                      </div>
                    </div>
                  </div>

                  {/* Year-wise Growth Chart/Table */}
                  <div className="h-64">
                    <CalculatorChart
                      data={chartData}
                      type="bar"
                      title="Year-wise FD Growth"
                      height={240}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-6">
            <Card className="bg-white rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Bank Interest Rate Comparison
                </CardTitle>
                <CardDescription>
                  Compare FD rates across major banks for \u20B9{principal.toLocaleString()} over {years} years
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Bank</th>
                        <th className="text-center p-3">Interest Rate</th>
                        <th className="text-center p-3">Maturity Value</th>
                        <th className="text-center p-3">Interest Earned</th>
                        <th className="text-center p-3">Post-Tax Returns</th>
                      </tr>
                    </thead>
                    <tbody>
                      {banks.map((bank) => {
                        const bankResult = calculateEnhancedFD(principal, bank.rate, years, compoundingFrequency, taxRate);
                        return (
                          <tr key={bank.value} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{bank.label}</td>
                            <td className="text-center p-3">
                              <Badge variant="outline">{bank.rate}%</Badge>
                            </td>
                            <td className="text-center p-3 font-semibold">
                              {formatCurrency(bankResult.maturityValue)}
                            </td>
                            <td className="text-center p-3 text-green-600">
                              {formatCurrency(bankResult.interest)}
                            </td>
                            <td className="text-center p-3 text-blue-600">
                              {formatCurrency(bankResult.postTaxReturns)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}