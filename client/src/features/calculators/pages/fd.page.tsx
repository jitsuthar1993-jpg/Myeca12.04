import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateFD } from "@/lib/tax-calculations";
import { PiggyBank, Coins, Percent, TrendingUp, Calendar, Target } from "lucide-react";
import { CalculatorExport } from "@/components/ui/calculator-export";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { getHowToSchema } from "@/utils/seo-defaults";
import { CalculatorHeader } from "@/components/ui/calculator-header";

export default function FDCalculatorPage() {
  const seo = getSEOConfig('/calculators/fd');
  const [principal, setPrincipal] = useState<number>(0);
  const [rate, setRate] = useState<number>(0);
  const [tenure, setTenure] = useState<number>(0);
  const [compoundingFrequency, setCompoundingFrequency] = useState<number>(4);
  const [result, setResult] = useState<any>(null);

  const handleCalculate = () => {
    if (principal > 0 && rate > 0 && tenure > 0) {
      const fdResult = calculateFD(principal, rate, tenure, compoundingFrequency);
      setResult(fdResult);
    }
  };

  const compoundingOptions = [
    { value: 1, label: 'Annually' },
    { value: 2, label: 'Half-yearly' },
    { value: 4, label: 'Quarterly' },
    { value: 12, label: 'Monthly' }
  ];

  const currentRates = [
    { bank: 'SBI', rate: '6.50%', tenure: '1-2 years' },
    { bank: 'HDFC Bank', rate: '6.75%', tenure: '1-2 years' },
    { bank: 'ICICI Bank', rate: '6.70%', tenure: '1-2 years' },
    { bank: 'Axis Bank', rate: '6.75%', tenure: '1-2 years' },
    { bank: 'Kotak Mahindra', rate: '6.80%', tenure: '1-2 years' },
    { bank: 'Yes Bank', rate: '7.25%', tenure: '1-2 years' }
  ];

  const howToSchema = getHowToSchema({
    name: "How to Calculate Fixed Deposit Returns",
    description: "Calculate your FD maturity amount in 4 simple steps",
    totalTime: "PT2M",
    steps: [
      {
        name: "Enter principal amount",
        text: "Input the amount you want to invest in fixed deposit"
      },
      {
        name: "Enter interest rate",
        text: "Input the annual interest rate offered by your bank"
      },
      {
        name: "Select tenure",
        text: "Choose the duration of your fixed deposit in years"
      },
      {
        name: "Select compounding frequency",
        text: "Choose how often interest is compounded (quarterly, monthly, etc.)"
      }
    ]
  });

  return (
    <>
      <MetaSEO
        title={seo?.title || "FD Calculator 2025 | MyeCA.in"}
        description={seo?.description || "Calculate fixed deposit maturity amount & interest earned."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
        howToData={{
          name: "How to Calculate Fixed Deposit Returns",
          description: "Calculate your FD maturity amount in 4 simple steps",
          steps: [
            { name: "Enter principal amount", text: "Input the amount you want to invest in fixed deposit" },
            { name: "Enter interest rate", text: "Input the annual interest rate offered by your bank" },
            { name: "Select tenure", text: "Choose the duration of your fixed deposit in years" },
            { name: "Select compounding frequency", text: "Choose how often interest is compounded (quarterly, monthly, etc.)" }
          ]
        }}
      />
    <div className="calculator-page min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <CalculatorHeader
          icon={PiggyBank}
          title="Fixed Deposit Calculator"
          subtitle="Calculate your fixed deposit returns with compound interest and current market rates."
          color="blue"
          align="center"
        />

        <div className="grid gap-8 md:grid-cols-2">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                Investment Details
              </CardTitle>
              <CardDescription>
                Enter your fixed deposit investment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="principal">Principal Amount (₹)</Label>
                <Input
                  id="principal"
                  type="number"
                  value={principal || ''}
                  onChange={(e) => setPrincipal(Math.max(0, Number(e.target.value)))}
                  placeholder="Enter principal amount"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate">Annual Interest Rate (%)</Label>
                <Input
                  id="rate"
                  type="number"
                  step="0.1"
                  value={rate || ''}
                  onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                  placeholder="Enter annual interest rate"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tenure">Tenure (Years)</Label>
                <Input
                  id="tenure"
                  type="number"
                  value={tenure || ''}
                  onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))}
                  placeholder="Enter tenure in years"
                  className="text-lg"
                  min={1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="compounding">Compounding Frequency</Label>
                <Select value={compoundingFrequency.toString()} onValueChange={(value) => setCompoundingFrequency(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select compounding frequency" />
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

              <Button 
                onClick={handleCalculate} 
                className="w-full"
                disabled={!principal || !rate || !tenure}
              >
                Calculate Returns
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Investment Returns
                </CardTitle>
                {result && (
                  <CalculatorExport 
                    title="Fixed Deposit Calculation"
                    data={{
                      "Principal Amount": principal,
                      "Interest Rate": `${rate}% p.a.`,
                      "Tenure": `${tenure} years`,
                      "Compounding": compoundingOptions.find(o => o.value === compoundingFrequency)?.label || 'Quarterly',
                      "Total Interest": result.totalInterest,
                      "Maturity Amount": result.maturityAmount,
                      "Effective Rate": `${result.effectiveRate}%`
                    }}
                  />
                )}
              </div>
              <CardDescription>
                Your fixed deposit calculation results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">Maturity Amount</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">₹{result.maturityAmount.toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Effective Rate</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{result.effectiveRate}%</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Principal Amount</span>
                      <span className="font-semibold">₹{principal.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Interest</span>
                      <span className="font-semibold text-green-600">₹{result.totalInterest.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Maturity Amount</span>
                      <span className="font-semibold text-blue-600">₹{result.maturityAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Yearly Breakdown */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Yearly Breakdown
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {result.yearlyBreakdown.map((year: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>Year {year.year}</span>
                          <div className="flex gap-4">
                            <span className="text-green-600">+₹{year.interest.toLocaleString()}</span>
                            <span className="font-semibold">₹{year.total.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <PiggyBank className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Enter investment details to calculate returns</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current FD Rates */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Current FD Rates (2024-25)</CardTitle>
            <CardDescription>
              Latest fixed deposit interest rates from major banks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentRates.map((bank, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{bank.bank}</h3>
                    <Badge variant="outline">{bank.rate}</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    Tenure: {bank.tenure}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Rates are subject to change. Senior citizens may get additional 0.5% interest. 
                TDS is applicable on interest income above ₹40,000 per year.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}