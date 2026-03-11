import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { calculateEnhancedPPF, formatCurrency, CURRENT_RATES } from "@/lib/enhanced-calculator-utils";
import { PPFBreakdownChart } from "@/components/ui/calculator-chart";
import { Shield, Coins, TrendingUp, Calendar, Target, Award, AlertCircle, BarChart3, Table } from "lucide-react";
import { CalculatorExport } from "@/components/ui/calculator-export";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema, getFAQSchema } from "@/utils/seo-defaults";
import { CalculatorHeader } from "@/components/ui/calculator-header";

export default function PPFCalculatorPage() {
  const [annualInvestment, setAnnualInvestment] = useState<number>(150000);
  const [years, setYears] = useState<number>(15);
  const [showChart, setShowChart] = useState<boolean>(true);
  
  const result = calculateEnhancedPPF(annualInvestment, years, CURRENT_RATES.PPF);

  const ppfFeatures = [
    { title: "Tax Free", description: "No tax on maturity amount", icon: "🎯" },
    { title: "EEE Status", description: "Exempt-Exempt-Exempt taxation", icon: "✨" },
    { title: "15 Year Lock-in", description: "Minimum maturity period", icon: "🔒" },
    { title: "80C Benefit", description: "Up to \u20B91.5L tax deduction", icon: "💰" },
    { title: "7.1% Interest", description: "Current interest rate", icon: "📈" },
    { title: "Partial Withdrawal", description: "From 7th year onwards", icon: "🏦" }
  ];

  const investmentSuggestions = [
    { amount: 50000, benefit: "33% of 80C limit", description: "Good start for beginners" },
    { amount: 100000, benefit: "67% of 80C limit", description: "Moderate investment" },
    { amount: 150000, benefit: "Maximum 80C benefit", description: "Full tax benefit" }
  ];

  const faqSchema = getFAQSchema([
    {
      question: "What is the current PPF interest rate?",
      answer: "The current PPF interest rate is 7.1% per annum, compounded annually. This rate is reviewed quarterly by the government."
    },
    {
      question: "What is the minimum and maximum PPF investment?",
      answer: "Minimum investment is \u20B9500 per year and maximum is \u20B91,50,000 per year. You can invest in lump sum or in 12 installments."
    },
    {
      question: "Can I withdraw from PPF before 15 years?",
      answer: "Partial withdrawal is allowed from the 7th year onwards. You can withdraw up to 50% of the balance at the end of 4th preceding year."
    },
    {
      question: "Is PPF maturity amount taxable?",
      answer: "No, PPF enjoys EEE (Exempt-Exempt-Exempt) status. The investment, interest earned, and maturity amount are all tax-free."
    }
  ]);

  return (
    <>
      <EnhancedSEO
        title="PPF Calculator 2025 | Public Provident Fund Returns Calculator"
        description="Calculate PPF returns with current 7.1% interest rate. Plan your PPF investment with our accurate calculator showing maturity value, interest earned & year-wise breakdown."
        keywords={[
          'PPF calculator',
          'public provident fund calculator',
          'PPF interest rate 2025',
          'PPF maturity calculator',
          'PPF returns calculator',
          '80C tax benefits',
          'PPF investment calculator',
          'tax free investment'
        ]}
        url="https://myeca.in/calculators/ppf"
        type="website"
        jsonLd={faqSchema}
      />
    <div className="calculator-page min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <CalculatorHeader
          icon={Shield}
          title="PPF Calculator"
          subtitle="Calculate your Public Provident Fund returns with current 7.1% interest rate and tax benefits."
          color="green"
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
                Enter your PPF investment details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="annual-investment">Annual Investment (\u20B9)</Label>
                <Input
                  id="annual-investment"
                  type="number"
                  value={annualInvestment || ''}
                  onChange={(e) => setAnnualInvestment(Number(e.target.value))}
                  placeholder="Enter annual investment"
                  className="text-lg"
                />
                <p className="text-sm text-gray-500">
                  Minimum: \u20B9500, Maximum: \u20B91,50,000 per year
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="years">Investment Period (Years)</Label>
                <Input
                  id="years"
                  type="number"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  placeholder="Enter investment period"
                  className="text-lg"
                  min="15"
                  max="50"
                />
                <p className="text-sm text-gray-500">
                  Minimum 15 years, can be extended in blocks of 5 years
                </p>
              </div>

              <div className="space-y-3">
                <Label>Quick Investment Options</Label>
                <div className="grid gap-2">
                  {investmentSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start h-auto p-3"
                      onClick={() => setAnnualInvestment(suggestion.amount)}
                    >
                      <div className="text-left">
                        <div className="font-semibold">\u20B9{suggestion.amount.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{suggestion.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Investment Period (Years)</Label>
                <div className="px-4 py-3 bg-green-50 rounded-lg">
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-green-700">{years} years</span>
                  </div>
                  <Slider
colorTheme="green"                     value={[years]}
                    onValueChange={(value) => setYears(value[0])}
                    max={50}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15 years</span>
                    <span>50 years</span>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Current Rate:</strong> {CURRENT_RATES.PPF}% p.a. | 
                  <strong> Tax Status:</strong> EEE (Tax-free returns)
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  PPF Returns
                </CardTitle>
                {result && (
                  <CalculatorExport 
                    title="PPF Calculation"
                    data={{
                      "Annual Investment": annualInvestment,
                      "Investment Period": `${years} years`,
                      "Interest Rate": `${CURRENT_RATES.PPF}% p.a.`,
                      "Total Investment": result.totalInvestment,
                      "Interest Earned": result.interestEarned,
                      "Maturity Value": result.maturityValue,
                      "Tax Benefit (80C)": Math.min(annualInvestment, 150000)
                    }}
                  />
                )}
              </div>
              <CardDescription>
                Your PPF calculation results
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
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(result.maturityValue)}</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Total Interest</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(result.interestEarned)}</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Investment</span>
                      <span className="font-semibold">{formatCurrency(result.totalInvestment)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Interest Earned</span>
                      <span className="font-semibold text-green-600">{formatCurrency(result.interestEarned)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Maturity Value</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(result.maturityValue)}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="bg-amber-50 p-3 rounded-lg">
                    <p className="text-sm text-amber-700">
                      <strong>Tax Benefit:</strong> \u20B9{Math.min(annualInvestment, 150000).toLocaleString()} eligible for 80C deduction
                    </p>
                    <p className="text-sm text-amber-700">
                      <strong>Tax Saving:</strong> Up to \u20B9{Math.round(Math.min(annualInvestment, 150000) * 0.3).toLocaleString()} annually*
                    </p>
                  </div>

                  {/* Yearly Breakdown */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Yearly Growth
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {result.yearlyBreakdown.map((year: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                          <span>Year {year.year}</span>
                          <div className="flex gap-4">
                            <span className="text-green-600">+\u20B9{year.interest.toLocaleString()}</span>
                            <span className="font-semibold">\u20B9{year.balance.toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>Enter investment details to calculate PPF returns</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* PPF Features */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>PPF Features & Benefits</CardTitle>
            <CardDescription>
              Key features of Public Provident Fund for financial planning
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {ppfFeatures.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Important:</strong> PPF account has a 15-year lock-in period. Partial withdrawals are allowed from the 7th year onwards. 
                Interest rate is reviewed quarterly by the government. Current rate: 7.1% p.a.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
}