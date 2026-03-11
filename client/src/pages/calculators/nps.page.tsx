import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";
import {
  Calculator,
  PiggyBank,
  TrendingUp,
  Shield,
  Info,
  Download,
  ArrowRight,
  CheckCircle,
  Wallet,
  Calendar,
  Target,
  Building2,
  Users,
  Percent,
  IndianRupee,
  Clock,
  Gift
} from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
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
  calculateNPSTaxBenefits,
  projectNPSCorpus,
  compareInvestments,
  NPS_LIMITS,
  NPS_ASSET_CLASSES,
  NPS_FUND_MANAGERS,
  NPS_TIERS,
} from "@/lib/nps-calculations";

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

export default function NPSCalculatorPage() {
  // Basic inputs
  const [annualIncome, setAnnualIncome] = useState(1200000);
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(60);
  const [monthlyContribution, setMonthlyContribution] = useState(10000);
  const [currentCorpus, setCurrentCorpus] = useState(0);
  
  // Advanced inputs
  const [isGovernmentEmployee, setIsGovernmentEmployee] = useState(false);
  const [employerContribution, setEmployerContribution] = useState(0);
  const [existing80CDeductions, setExisting80CDeductions] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(10);
  const [annuityPercentage, setAnnuityPercentage] = useState(40);
  const [annuityReturn, setAnnuityReturn] = useState(6);
  
  // Asset allocation
  const [equityAllocation, setEquityAllocation] = useState(50);
  const [corporateBondAllocation, setCorporateBondAllocation] = useState(30);
  const [govtSecAllocation, setGovtSecAllocation] = useState(20);

  // Calculate tax benefits
  const taxBenefits = useMemo(() => {
    const yearlyContribution = monthlyContribution * 12;
    return calculateNPSTaxBenefits(
      {
        employeeContribution: yearlyContribution,
        employerContribution: employerContribution * 12,
        additionalContribution: Math.min(yearlyContribution, 50000),
      },
      annualIncome,
      isGovernmentEmployee,
      existing80CDeductions
    );
  }, [monthlyContribution, employerContribution, annualIncome, isGovernmentEmployee, existing80CDeductions]);

  // Project corpus
  const projection = useMemo(() => {
    return projectNPSCorpus({
      currentAge,
      retirementAge,
      currentCorpus,
      monthlyContribution,
      expectedReturn,
      annuityPercentage,
      annuityReturn,
    });
  }, [currentAge, retirementAge, currentCorpus, monthlyContribution, expectedReturn, annuityPercentage, annuityReturn]);

  // Compare with other investments
  const comparison = useMemo(() => {
    return compareInvestments(monthlyContribution, retirementAge - currentAge, annualIncome);
  }, [monthlyContribution, currentAge, retirementAge, annualIncome]);

  // Format currency
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) {
      return `\u20B9${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) {
      return `\u20B9${(amount / 100000).toFixed(2)} L`;
    }
    return `\u20B9${amount.toLocaleString('en-IN')}`;
  };

  // Chart data for projection
  const projectionChartData = projection.yearWiseProjection.filter((_, i) => i % 5 === 0 || i === projection.yearWiseProjection.length - 1);

  // Comparison chart data
  const comparisonChartData = [
    { name: 'NPS', corpus: comparison.nps.corpus, taxBenefit: comparison.nps.taxBenefit },
    { name: 'PPF', corpus: comparison.ppf.corpus, taxBenefit: comparison.ppf.taxBenefit },
    { name: 'ELSS', corpus: comparison.elss.corpus, taxBenefit: comparison.elss.taxBenefit },
  ];

  // Asset allocation chart data
  const assetAllocationData = [
    { name: 'Equity (E)', value: equityAllocation, color: '#3b82f6' },
    { name: 'Corporate Bonds (C)', value: corporateBondAllocation, color: '#22c55e' },
    { name: 'Govt Securities (G)', value: govtSecAllocation, color: '#f59e0b' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-indigo-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-indigo-300" />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/calculators" className="text-indigo-200 hover:text-white">Calculators</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-indigo-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">NPS Calculator</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">NPS Tax Benefit Calculator</h1>
              <p className="text-indigo-200 mt-1">
                Calculate your NPS tax savings under 80CCD and plan your retirement corpus
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-indigo-200">Total Tax Benefit</p>
              <p className="text-2xl font-bold">{formatCurrency(taxBenefits.totalDeduction)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-indigo-200">Tax Saved</p>
              <p className="text-2xl font-bold">{formatCurrency(taxBenefits.taxSaved)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-indigo-200">Retirement Corpus</p>
              <p className="text-2xl font-bold">{formatCurrency(projection.corpusAtRetirement)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <p className="text-sm text-indigo-200">Monthly Pension</p>
              <p className="text-2xl font-bold">{formatCurrency(projection.monthlyPension)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-indigo-600" />
                  Basic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currentAge">Current Age</Label>
                    <Input
                      id="currentAge"
                      type="number"
                      value={currentAge}
                      onChange={(e) => setCurrentAge(Number(e.target.value))}
                      min={18}
                      max={65}
                    />
                  </div>
                  <div>
                    <Label htmlFor="retirementAge">Retirement Age</Label>
                    <Input
                      id="retirementAge"
                      type="number"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(Number(e.target.value))}
                      min={currentAge + 1}
                      max={75}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                  <div className="relative mt-1">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="monthlyContribution"
                      type="number"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Yearly: {formatCurrency(monthlyContribution * 12)}
                  </p>
                </div>

                <div>
                  <Label htmlFor="currentCorpus">Existing NPS Corpus</Label>
                  <div className="relative mt-1">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="currentCorpus"
                      type="number"
                      value={currentCorpus}
                      onChange={(e) => setCurrentCorpus(Number(e.target.value))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="govtEmployee" className="cursor-pointer">Government Employee</Label>
                  <Switch
                    id="govtEmployee"
                    checked={isGovernmentEmployee}
                    onCheckedChange={setIsGovernmentEmployee}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <Label>Expected Return (%)</Label>
                    <span className="text-sm font-medium">{expectedReturn}%</span>
                  </div>
                  <Slider
colorTheme="purple"                     value={[expectedReturn]}
                    onValueChange={(v) => setExpectedReturn(v[0])}
                    min={6}
                    max={14}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between">
                    <Label>Annuity Percentage (%)</Label>
                    <span className="text-sm font-medium">{annuityPercentage}%</span>
                  </div>
                  <Slider
colorTheme="purple"                     value={[annuityPercentage]}
                    onValueChange={(v) => setAnnuityPercentage(v[0])}
                    min={40}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 40% must be invested in annuity</p>
                </div>

                <div>
                  <Label htmlFor="existing80C">Existing 80C Deductions</Label>
                  <div className="relative mt-1">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="existing80C"
                      type="number"
                      value={existing80CDeductions}
                      onChange={(e) => setExisting80CDeductions(Number(e.target.value))}
                      className="pl-10"
                      max={150000}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">EPF, PPF, LIC, etc. (max \u20B91.5L)</p>
                </div>

                {isGovernmentEmployee && (
                  <div>
                    <Label htmlFor="employerContribution">Employer Monthly Contribution</Label>
                    <div className="relative mt-1">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="employerContribution"
                        type="number"
                        value={employerContribution}
                        onChange={(e) => setEmployerContribution(Number(e.target.value))}
                        className="pl-10"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="benefits" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="benefits">Tax Benefits</TabsTrigger>
                <TabsTrigger value="projection">Projection</TabsTrigger>
                <TabsTrigger value="compare">Compare</TabsTrigger>
                <TabsTrigger value="info">NPS Info</TabsTrigger>
              </TabsList>

              {/* Tax Benefits Tab */}
              <TabsContent value="benefits" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-80">Section 80CCD(1)</p>
                          <p className="text-2xl font-bold">{formatCurrency(taxBenefits.section80CCD1)}</p>
                          <p className="text-xs opacity-70 mt-1">Within 80C limit (\u20B91.5L)</p>
                        </div>
                        <Shield className="h-10 w-10 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-80">Section 80CCD(1B)</p>
                          <p className="text-2xl font-bold">{formatCurrency(taxBenefits.section80CCD1B)}</p>
                          <p className="text-xs opacity-70 mt-1">Additional \u20B950,000</p>
                        </div>
                        <Gift className="h-10 w-10 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>

                  {isGovernmentEmployee && (
                    <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm opacity-80">Section 80CCD(2)</p>
                            <p className="text-2xl font-bold">{formatCurrency(taxBenefits.section80CCD2)}</p>
                            <p className="text-xs opacity-70 mt-1">Employer contribution (14%)</p>
                          </div>
                          <Building2 className="h-10 w-10 opacity-80" />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-80">Total Tax Saved</p>
                          <p className="text-2xl font-bold">{formatCurrency(taxBenefits.taxSaved)}</p>
                          <p className="text-xs opacity-70 mt-1">Effective return: {taxBenefits.effectiveReturn}%</p>
                        </div>
                        <Wallet className="h-10 w-10 opacity-80" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tax Benefit Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Tax Benefit Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b">
                        <div>
                          <p className="font-medium">Your Annual Contribution</p>
                          <p className="text-sm text-gray-500">Monthly × 12</p>
                        </div>
                        <p className="text-lg font-semibold">{formatCurrency(monthlyContribution * 12)}</p>
                      </div>
                      
                      <div className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-700">80CCD(1)</Badge>
                          <p className="text-sm">Within 80C limit</p>
                        </div>
                        <p className="font-medium text-blue-600">{formatCurrency(taxBenefits.section80CCD1)}</p>
                      </div>

                      <div className="flex justify-between items-center py-3 border-b">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-700">80CCD(1B)</Badge>
                          <p className="text-sm">Additional deduction</p>
                        </div>
                        <p className="font-medium text-green-600">{formatCurrency(taxBenefits.section80CCD1B)}</p>
                      </div>

                      {taxBenefits.section80CCD2 > 0 && (
                        <div className="flex justify-between items-center py-3 border-b">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-purple-100 text-purple-700">80CCD(2)</Badge>
                            <p className="text-sm">Employer contribution</p>
                          </div>
                          <p className="font-medium text-purple-600">{formatCurrency(taxBenefits.section80CCD2)}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-3 bg-indigo-50 rounded-lg px-4">
                        <p className="font-bold">Total Deduction</p>
                        <p className="text-xl font-bold text-indigo-600">{formatCurrency(taxBenefits.totalDeduction)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">NPS Unique Advantage</AlertTitle>
                  <AlertDescription className="text-green-700">
                    NPS offers an <strong>additional \u20B950,000</strong> deduction under 80CCD(1B) over and above the \u20B91.5 lakh limit of Section 80C. 
                    This is exclusive to NPS and not available with PPF, ELSS, or other 80C investments.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Projection Tab */}
              <TabsContent value="projection" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Target className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
                      <p className="text-sm text-gray-500">Corpus at Retirement</p>
                      <p className="text-2xl font-bold text-indigo-600">{formatCurrency(projection.corpusAtRetirement)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Wallet className="h-8 w-8 mx-auto text-green-600 mb-2" />
                      <p className="text-sm text-gray-500">Lump Sum (Tax-Free)</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(projection.lumpSumWithdrawal)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Calendar className="h-8 w-8 mx-auto text-purple-600 mb-2" />
                      <p className="text-sm text-gray-500">Monthly Pension</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(projection.monthlyPension)}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Corpus Growth Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Corpus Growth Projection</CardTitle>
                    <CardDescription>
                      {retirementAge - currentAge} years until retirement
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={projectionChartData}>
                          <defs>
                            <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorContribution" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="age" label={{ value: 'Age', position: 'bottom' }} />
                          <YAxis tickFormatter={(v) => `\u20B9${(v/100000).toFixed(0)}L`} />
                          <Tooltip 
                            formatter={(value: number) => formatCurrency(value)}
                            labelFormatter={(label) => `Age: ${label}`}
                          />
                          <Legend />
                          <Area type="monotone" dataKey="corpus" stroke="#6366f1" fillOpacity={1} fill="url(#colorCorpus)" name="Total Corpus" />
                          <Area type="monotone" dataKey="contribution" stroke="#22c55e" fillOpacity={1} fill="url(#colorContribution)" name="Your Contribution" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Retirement Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Contribution</p>
                        <p className="text-xl font-bold">{formatCurrency(projection.totalContribution)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Gains</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(projection.totalGains)}</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">Tax-Free Withdrawal (60%)</p>
                        <p className="text-xl font-bold text-green-700">{formatCurrency(projection.lumpSumWithdrawal)}</p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-700">Annuity Corpus (40%)</p>
                        <p className="text-xl font-bold text-purple-700">{formatCurrency(projection.annuityCorpus)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Compare Tab */}
              <TabsContent value="compare" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>NPS vs PPF vs ELSS Comparison</CardTitle>
                    <CardDescription>
                      Based on {formatCurrency(monthlyContribution)}/month for {retirementAge - currentAge} years
                    </CardDescription>
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
                          <Bar dataKey="corpus" fill="#6366f1" name="Corpus" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="taxBenefit" fill="#22c55e" name="Tax Benefit" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparison Table */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-indigo-200">
                    <CardHeader className="bg-indigo-50">
                      <CardTitle className="text-lg text-indigo-800">NPS</CardTitle>
                      <CardDescription>Expected Return: ~10%</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Corpus</span>
                        <span className="font-bold">{formatCurrency(comparison.nps.corpus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Benefit</span>
                        <span className="font-bold text-green-600">{formatCurrency(comparison.nps.taxBenefit)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Net Return</span>
                        <span className="font-bold text-indigo-600">{formatCurrency(comparison.nps.netReturn)}</span>
                      </div>
                      <Badge className="w-full justify-center bg-indigo-100 text-indigo-700">Extra \u20B950K deduction</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="bg-green-50">
                      <CardTitle className="text-lg text-green-800">PPF</CardTitle>
                      <CardDescription>Guaranteed Return: 7.1%</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Corpus</span>
                        <span className="font-bold">{formatCurrency(comparison.ppf.corpus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Benefit</span>
                        <span className="font-bold text-green-600">{formatCurrency(comparison.ppf.taxBenefit)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Net Return</span>
                        <span className="font-bold text-green-600">{formatCurrency(comparison.ppf.netReturn)}</span>
                      </div>
                      <Badge className="w-full justify-center bg-green-100 text-green-700">100% Tax-Free</Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="bg-orange-50">
                      <CardTitle className="text-lg text-orange-800">ELSS</CardTitle>
                      <CardDescription>Expected Return: ~12%</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Corpus (after LTCG)</span>
                        <span className="font-bold">{formatCurrency(comparison.elss.corpus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax Benefit</span>
                        <span className="font-bold text-green-600">{formatCurrency(comparison.elss.taxBenefit)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Net Return</span>
                        <span className="font-bold text-orange-600">{formatCurrency(comparison.elss.netReturn)}</span>
                      </div>
                      <Badge className="w-full justify-center bg-orange-100 text-orange-700">3-Year Lock-in</Badge>
                    </CardContent>
                  </Card>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Pro Tip:</strong> Consider investing in both NPS (for additional \u20B950K deduction) and ELSS (for liquidity after 3 years) 
                    to maximize tax benefits and returns.
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Info Tab */}
              <TabsContent value="info" className="space-y-6">
                {/* Tier Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>NPS Tier-I vs Tier-II</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-bold text-lg mb-3 text-indigo-700">Tier-I (Main Account)</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Min. Contribution</span>
                            <span>\u20B9500/year</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lock-in</span>
                            <span>Till 60 years</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax Benefit</span>
                            <span className="text-green-600 font-medium">Yes (80CCD)</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Withdrawal</span>
                            <span>60% tax-free</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-bold text-lg mb-3 text-purple-700">Tier-II (Voluntary)</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Min. Contribution</span>
                            <span>\u20B9250</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lock-in</span>
                            <span>None*</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax Benefit</span>
                            <span className="text-gray-500">Only for Govt.</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Withdrawal</span>
                            <span>Taxable</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Fund Managers */}
                <Card>
                  <CardHeader>
                    <CardTitle>NPS Fund Managers</CardTitle>
                    <CardDescription>You can choose any one fund manager for all your investments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {NPS_FUND_MANAGERS.map((fm) => (
                        <div key={fm.id} className="p-3 border rounded-lg text-center">
                          <p className="font-medium text-sm">{fm.name}</p>
                          <p className="text-xs text-gray-500">AUM: {fm.aum}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Asset Classes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Asset Allocation Options</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(NPS_ASSET_CLASSES).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-bold">{key}</Badge>
                            <span className="font-medium">{value.name}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">Max: {value.maxAllocation}%</p>
                            <p className="text-xs text-gray-500">Expected: ~{value.expectedReturn}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Key Benefits */}
                <Alert className="bg-indigo-50 border-indigo-200">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <AlertTitle className="text-indigo-800">Why Choose NPS?</AlertTitle>
                  <AlertDescription className="text-indigo-700">
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Additional \u20B950,000 tax deduction under 80CCD(1B)</li>
                      <li>Low expense ratio (0.01% fund management)</li>
                      <li>Regulated by PFRDA - Government backed</li>
                      <li>Flexible asset allocation</li>
                      <li>Portable across jobs and locations</li>
                      <li>60% corpus is tax-free at maturity</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

