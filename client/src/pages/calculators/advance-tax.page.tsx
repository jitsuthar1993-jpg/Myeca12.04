import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Calculator, 
  Calendar, 
  IndianRupee, 
  AlertTriangle,
  Clock,
  CheckCircle,
  Info,
  Bell,
  Download,
  TrendingUp,
  Wallet,
  FileText
} from "lucide-react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { CalculatorExport } from "@/components/ui/calculator-export";
import EnhancedSEO from "@/components/EnhancedSEO";

// Advance Tax Due Dates for FY 2024-25
const ADVANCE_TAX_SCHEDULE = [
  { quarter: "Q1", dueDate: "June 15, 2024", cumulativePercent: 15, label: "First Installment" },
  { quarter: "Q2", dueDate: "September 15, 2024", cumulativePercent: 45, label: "Second Installment" },
  { quarter: "Q3", dueDate: "December 15, 2024", cumulativePercent: 75, label: "Third Installment" },
  { quarter: "Q4", dueDate: "March 15, 2025", cumulativePercent: 100, label: "Fourth Installment" },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

interface TaxInputs {
  estimatedIncome: number;
  tdsDeducted: number;
  tcsCollected: number;
  selfAssessmentPaid: number;
  advanceTaxPaid: { q1: number; q2: number; q3: number; q4: number };
}

export default function AdvanceTaxCalculatorPage() {
  const [inputs, setInputs] = useState<TaxInputs>({
    estimatedIncome: 2000000,
    tdsDeducted: 150000,
    tcsCollected: 0,
    selfAssessmentPaid: 0,
    advanceTaxPaid: { q1: 0, q2: 0, q3: 0, q4: 0 },
  });

  const [regime, setRegime] = useState<"old" | "new">("new");

  // Calculate tax based on regime
  const calculateTax = (income: number, selectedRegime: "old" | "new") => {
    let tax = 0;
    
    if (selectedRegime === "new") {
      // New Regime Slabs FY 24-25
      const slabs = [
        { min: 0, max: 300000, rate: 0 },
        { min: 300000, max: 700000, rate: 5 },
        { min: 700000, max: 1000000, rate: 10 },
        { min: 1000000, max: 1200000, rate: 15 },
        { min: 1200000, max: 1500000, rate: 20 },
        { min: 1500000, max: Infinity, rate: 30 },
      ];
      
      // Standard deduction
      const taxableIncome = Math.max(0, income - 75000);
      
      for (const slab of slabs) {
        if (taxableIncome > slab.min) {
          const taxableInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
          tax += taxableInSlab * (slab.rate / 100);
        }
      }
      
      // Rebate under 87A
      if (taxableIncome <= 700000) {
        tax = Math.max(0, tax - 25000);
      }
    } else {
      // Old Regime Slabs
      const slabs = [
        { min: 0, max: 250000, rate: 0 },
        { min: 250000, max: 500000, rate: 5 },
        { min: 500000, max: 1000000, rate: 20 },
        { min: 1000000, max: Infinity, rate: 30 },
      ];
      
      // Standard deduction
      const taxableIncome = Math.max(0, income - 50000);
      
      for (const slab of slabs) {
        if (taxableIncome > slab.min) {
          const taxableInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
          tax += taxableInSlab * (slab.rate / 100);
        }
      }
      
      // Rebate under 87A
      if (taxableIncome <= 500000) {
        tax = Math.max(0, tax - 12500);
      }
    }
    
    // Add 4% Health & Education Cess
    const cess = tax * 0.04;
    return tax + cess;
  };

  const calculations = useMemo(() => {
    const totalTax = calculateTax(inputs.estimatedIncome, regime);
    const totalTdsAndTcs = inputs.tdsDeducted + inputs.tcsCollected;
    const netTaxLiability = Math.max(0, totalTax - totalTdsAndTcs);
    
    // Advance tax is required if tax liability > \u20B910,000
    const advanceTaxRequired = netTaxLiability > 10000;
    
    // Calculate advance tax installments
    const advanceTaxInstallments = ADVANCE_TAX_SCHEDULE.map((schedule, index) => {
      const previousPercent = index > 0 ? ADVANCE_TAX_SCHEDULE[index - 1].cumulativePercent : 0;
      const installmentPercent = schedule.cumulativePercent - previousPercent;
      const installmentAmount = (netTaxLiability * installmentPercent) / 100;
      const cumulativeAmount = (netTaxLiability * schedule.cumulativePercent) / 100;
      
      return {
        ...schedule,
        installmentPercent,
        installmentAmount,
        cumulativeAmount,
      };
    });
    
    // Calculate total advance tax paid
    const totalAdvanceTaxPaid = 
      inputs.advanceTaxPaid.q1 + 
      inputs.advanceTaxPaid.q2 + 
      inputs.advanceTaxPaid.q3 + 
      inputs.advanceTaxPaid.q4;
    
    // Calculate shortfall/excess for each quarter
    const quarterlyAnalysis = advanceTaxInstallments.map((inst, index) => {
      const paidTillQuarter = [
        inputs.advanceTaxPaid.q1,
        inputs.advanceTaxPaid.q1 + inputs.advanceTaxPaid.q2,
        inputs.advanceTaxPaid.q1 + inputs.advanceTaxPaid.q2 + inputs.advanceTaxPaid.q3,
        totalAdvanceTaxPaid,
      ][index];
      
      const shortfall = Math.max(0, inst.cumulativeAmount - paidTillQuarter);
      const excess = Math.max(0, paidTillQuarter - inst.cumulativeAmount);
      
      return {
        ...inst,
        paidTillQuarter,
        shortfall,
        excess,
        status: shortfall > 0 ? 'shortfall' : excess > 0 ? 'excess' : 'met',
      };
    });
    
    // Calculate interest under Section 234B and 234C
    // 234B: Interest on default in payment of advance tax
    // 234C: Interest on deferment of advance tax
    const today = new Date();
    let interest234C = 0;
    
    quarterlyAnalysis.forEach((q, index) => {
      if (q.shortfall > 0) {
        // Interest @ 1% per month for shortfall
        const monthsRemaining = Math.max(0, 12 - (index * 3));
        interest234C += q.shortfall * 0.01 * Math.min(3, monthsRemaining);
      }
    });
    
    // Balance tax payable
    const balanceTax = Math.max(0, netTaxLiability - totalAdvanceTaxPaid - inputs.selfAssessmentPaid);
    
    return {
      totalTax,
      totalTdsAndTcs,
      netTaxLiability,
      advanceTaxRequired,
      advanceTaxInstallments,
      quarterlyAnalysis,
      totalAdvanceTaxPaid,
      interest234C,
      balanceTax,
    };
  }, [inputs, regime]);

  const chartData = calculations.quarterlyAnalysis.map((q) => ({
    name: q.quarter,
    'Required': q.cumulativeAmount,
    'Paid': q.paidTillQuarter,
  }));

  const handleInputChange = (field: keyof TaxInputs, value: string | number) => {
    if (field === 'advanceTaxPaid') return;
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleAdvanceTaxChange = (quarter: 'q1' | 'q2' | 'q3' | 'q4', value: string) => {
    setInputs(prev => ({
      ...prev,
      advanceTaxPaid: {
        ...prev.advanceTaxPaid,
        [quarter]: Number(value) || 0,
      },
    }));
  };

  // Determine current quarter
  const getCurrentQuarter = () => {
    const month = new Date().getMonth();
    if (month < 3) return 4; // Jan-Mar = Q4
    if (month < 6) return 1; // Apr-Jun = Q1
    if (month < 9) return 2; // Jul-Sep = Q2
    return 3; // Oct-Dec = Q3
  };

  const currentQuarter = getCurrentQuarter();

  return (
    <>
      <EnhancedSEO
        title="Advance Tax Calculator - Calculate Quarterly Tax Payments | MyeCA"
        description="Calculate your advance tax liability for FY 2024-25. Know quarterly payment schedule, due dates, and interest on delayed payments under Section 234B & 234C."
        keywords={["advance tax calculator", "quarterly tax payment", "234B interest", "234C interest", "advance tax due dates", "income tax installment"]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full mb-4">
              <Calendar className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">FY 2024-25</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Advance Tax Calculator
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Calculate your advance tax liability and quarterly payment schedule. Avoid interest under Section 234B & 234C.
            </p>
          </div>

          {/* Due Date Alert */}
          {calculations.advanceTaxRequired && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <Bell className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Next Due Date</AlertTitle>
              <AlertDescription className="text-orange-700">
                {ADVANCE_TAX_SCHEDULE[currentQuarter - 1]?.label}: {ADVANCE_TAX_SCHEDULE[currentQuarter - 1]?.dueDate} - 
                Pay {ADVANCE_TAX_SCHEDULE[currentQuarter - 1]?.cumulativePercent}% of your estimated tax liability
              </AlertDescription>
            </Alert>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Income & Tax Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Regime Selection */}
                  <div className="space-y-2">
                    <Label>Tax Regime</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={regime === 'new' ? 'default' : 'outline'}
                        onClick={() => setRegime('new')}
                        className="justify-start"
                      >
                        <CheckCircle className={`h-4 w-4 mr-2 ${regime === 'new' ? 'text-white' : 'text-gray-400'}`} />
                        New Regime
                      </Button>
                      <Button
                        variant={regime === 'old' ? 'default' : 'outline'}
                        onClick={() => setRegime('old')}
                        className="justify-start"
                      >
                        <CheckCircle className={`h-4 w-4 mr-2 ${regime === 'old' ? 'text-white' : 'text-gray-400'}`} />
                        Old Regime
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Estimated Annual Income</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          value={inputs.estimatedIncome}
                          onChange={(e) => handleInputChange('estimatedIncome', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>TDS Already Deducted</Label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          type="number"
                          value={inputs.tdsDeducted}
                          onChange={(e) => handleInputChange('tdsDeducted', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tax Summary */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Total Tax</span>
                      <span className="font-semibold">{formatCurrency(calculations.totalTax)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Less: TDS/TCS</span>
                      <span className="font-semibold text-green-600">- {formatCurrency(calculations.totalTdsAndTcs)}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between">
                      <span className="font-medium">Net Tax Liability</span>
                      <span className="font-bold text-lg">{formatCurrency(calculations.netTaxLiability)}</span>
                    </div>
                  </div>

                  {!calculations.advanceTaxRequired && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">No Advance Tax Required</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Your tax liability is below \u20B910,000, so you don't need to pay advance tax.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Advance Tax Payment Tracker */}
              {calculations.advanceTaxRequired && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-green-600" />
                      Advance Tax Paid
                    </CardTitle>
                    <CardDescription>Enter the advance tax you've already paid</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {(['q1', 'q2', 'q3', 'q4'] as const).map((quarter, index) => (
                        <div key={quarter} className="space-y-2">
                          <Label className="text-xs">
                            {ADVANCE_TAX_SCHEDULE[index].label}
                            <span className="block text-gray-500">Due: {ADVANCE_TAX_SCHEDULE[index].dueDate.split(',')[0]}</span>
                          </Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500" />
                            <Input
                              type="number"
                              value={inputs.advanceTaxPaid[quarter]}
                              onChange={(e) => handleAdvanceTaxChange(quarter, e.target.value)}
                              className="pl-7 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Payment Schedule Chart */}
              {calculations.advanceTaxRequired && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis tickFormatter={(v) => `\u20B9${(v/100000).toFixed(1)}L`} />
                          <Tooltip formatter={(value: number) => formatCurrency(value)} />
                          <Legend />
                          <Bar dataKey="Required" fill="#f97316" name="Required Amount" />
                          <Bar dataKey="Paid" fill="#22c55e" name="Amount Paid" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-0">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-blue-100 text-sm">Total Advance Tax Required</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatCurrency(calculations.netTaxLiability)}
                    </p>
                  </div>
                  <hr className="my-4 border-blue-400/30" />
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-blue-100 text-xs">Paid</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(calculations.totalAdvanceTaxPaid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-blue-100 text-xs">Balance</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(calculations.balanceTax)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quarterly Breakdown */}
              {calculations.advanceTaxRequired && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quarterly Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {calculations.quarterlyAnalysis.map((q, index) => (
                      <div 
                        key={q.quarter}
                        className={`p-3 rounded-lg border ${
                          index + 1 === currentQuarter 
                            ? 'border-orange-300 bg-orange-50' 
                            : 'border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{q.quarter}</span>
                            {index + 1 === currentQuarter && (
                              <Badge className="bg-orange-500 text-xs">Current</Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{q.dueDate}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Required ({q.cumulativePercent}%)</span>
                          <span className="font-medium">{formatCurrency(q.cumulativeAmount)}</span>
                        </div>
                        <Progress 
                          value={Math.min(100, (q.paidTillQuarter / q.cumulativeAmount) * 100)} 
                          className="h-2 mt-2"
                        />
                        {q.shortfall > 0 && (
                          <p className="text-xs text-red-600 mt-1">
                            Shortfall: {formatCurrency(q.shortfall)}
                          </p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Interest Warning */}
              {calculations.interest234C > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Interest Liability</AlertTitle>
                  <AlertDescription>
                    You may have to pay ~{formatCurrency(calculations.interest234C)} as interest under Section 234C for delayed advance tax payment.
                  </AlertDescription>
                </Alert>
              )}

              {/* How to Pay */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    How to Pay
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
                    <p className="text-sm text-gray-600">Visit income tax e-filing portal</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">2</span>
                    <p className="text-sm text-gray-600">Select "e-Pay Tax" and choose Challan 280</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">3</span>
                    <p className="text-sm text-gray-600">Select "(100) Advance Tax" as type of payment</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">4</span>
                    <p className="text-sm text-gray-600">Enter amount and pay via net banking/UPI</p>
                  </div>
                  <Button className="w-full mt-4" variant="outline" asChild>
                    <a href="https://eportal.incometax.gov.in/iec/foloigin" target="_blank" rel="noopener noreferrer">
                      Go to e-Filing Portal
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Export */}
              <Card>
                <CardContent className="pt-6">
                  <CalculatorExport
                    title="Advance Tax Calculation"
                    data={{
                      "Estimated Income": inputs.estimatedIncome,
                      "Total Tax Liability": calculations.totalTax,
                      "TDS Deducted": inputs.tdsDeducted,
                      "Net Advance Tax": calculations.netTaxLiability,
                      "Paid Till Date": calculations.totalAdvanceTaxPaid,
                      "Balance Payable": calculations.balanceTax,
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Info Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                About Advance Tax
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Who Should Pay?</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Tax liability exceeds \u20B910,000 in a financial year
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Salaried employees with additional income
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Freelancers, consultants, business owners
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      Capital gains from stocks, property, etc.
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Interest on Late Payment</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span><strong>234B:</strong> 1% per month if total advance tax paid is less than 90%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span><strong>234C:</strong> 1% per month for deferment of individual installments</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

