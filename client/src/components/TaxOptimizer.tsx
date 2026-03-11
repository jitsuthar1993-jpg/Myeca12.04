import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingDown, 
  PiggyBank, 
  Shield, 
  Heart, 
  Home, 
  GraduationCap,
  Wallet,
  IndianRupee,
  Lightbulb,
  ArrowRight,
  Check,
  Info,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "@/lib/utils";

interface DeductionCategory {
  id: string;
  name: string;
  section: string;
  limit: number;
  currentAmount: number;
  icon: React.ReactNode;
  description: string;
  suggestions: string[];
  priority: "high" | "medium" | "low";
}

interface TaxSavingResult {
  totalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  estimatedTax: number;
  potentialSavings: number;
  recommendations: DeductionCategory[];
}

export function TaxOptimizer() {
  const [step, setStep] = useState<"input" | "analysis" | "recommendations">("input");
  const [income, setIncome] = useState<number>(1200000);
  const [age, setAge] = useState<string>("below60");
  const [regime, setRegime] = useState<"old" | "new">("old");
  
  // Current deductions
  const [deductions, setDeductions] = useState({
    section80C: 0,
    section80D: 0,
    section80CCD: 0, // NPS additional
    homeLoanInterest: 0,
    educationLoan: 0,
    donationsSection80G: 0,
  });

  const deductionCategories: DeductionCategory[] = useMemo(() => [
    {
      id: "80C",
      name: "Section 80C",
      section: "80C",
      limit: 150000,
      currentAmount: deductions.section80C,
      icon: <PiggyBank className="h-5 w-5" />,
      description: "PPF, ELSS, Life Insurance, NSC, 5-yr FD",
      suggestions: [
        "Invest in ELSS funds for tax + wealth creation",
        "Open PPF account for guaranteed returns",
        "Pay children's tuition fees",
        "Claim home loan principal repayment"
      ],
      priority: "high"
    },
    {
      id: "80D",
      name: "Health Insurance",
      section: "80D",
      limit: age === "below60" ? 25000 : 50000,
      currentAmount: deductions.section80D,
      icon: <Heart className="h-5 w-5" />,
      description: "Health insurance for self, family & parents",
      suggestions: [
        "Buy health insurance for yourself (\u20B925,000)",
        "Add coverage for parents (+\u20B950,000 if senior)",
        "Include preventive health checkup",
        "Consider super top-up plans"
      ],
      priority: "high"
    },
    {
      id: "80CCD",
      name: "NPS Contribution",
      section: "80CCD(1B)",
      limit: 50000,
      currentAmount: deductions.section80CCD,
      icon: <Wallet className="h-5 w-5" />,
      description: "Additional NPS contribution beyond 80C",
      suggestions: [
        "Get extra \u20B950,000 deduction over 80C",
        "Tax-free maturity after retirement",
        "Employer contribution also eligible",
        "Low-cost pension fund option"
      ],
      priority: "medium"
    },
    {
      id: "homeLoan",
      name: "Home Loan Interest",
      section: "24(b)",
      limit: 200000,
      currentAmount: deductions.homeLoanInterest,
      icon: <Home className="h-5 w-5" />,
      description: "Interest on housing loan for self-occupied property",
      suggestions: [
        "Claim up to \u20B92 lakh on home loan interest",
        "Additional \u20B91.5 lakh under 80EEA for first home",
        "Joint home loan doubles the benefit",
        "Rent income set-off available"
      ],
      priority: "high"
    },
    {
      id: "educationLoan",
      name: "Education Loan Interest",
      section: "80E",
      limit: Infinity,
      currentAmount: deductions.educationLoan,
      icon: <GraduationCap className="h-5 w-5" />,
      description: "Interest on higher education loan (no limit)",
      suggestions: [
        "Full interest deduction for 8 years",
        "Covers education for self, spouse, children",
        "Includes foreign education",
        "No upper limit on deduction"
      ],
      priority: "low"
    },
    {
      id: "80G",
      name: "Donations",
      section: "80G",
      limit: income * 0.1,
      currentAmount: deductions.donationsSection80G,
      icon: <Shield className="h-5 w-5" />,
      description: "Donations to approved charitable organizations",
      suggestions: [
        "50-100% deduction on approved donations",
        "PM CARES Fund - 100% deduction",
        "Keep donation receipts safely",
        "Check organization's 80G certificate"
      ],
      priority: "low"
    }
  ], [deductions, age, income]);

  const calculateTaxSavings = (): TaxSavingResult => {
    const totalCurrentDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
    
    // Calculate potential deductions (maxed out)
    const maxPotentialDeductions = deductionCategories.reduce((total, cat) => {
      const remaining = Math.max(0, cat.limit === Infinity ? 0 : cat.limit - cat.currentAmount);
      return total + cat.currentAmount + remaining;
    }, 0);

    // Tax calculation for old regime
    const calculateOldRegimeTax = (taxableIncome: number) => {
      if (taxableIncome <= 250000) return 0;
      if (taxableIncome <= 500000) return (taxableIncome - 250000) * 0.05;
      if (taxableIncome <= 1000000) return 12500 + (taxableIncome - 500000) * 0.20;
      return 112500 + (taxableIncome - 1000000) * 0.30;
    };

    const currentTaxableIncome = Math.max(0, income - totalCurrentDeductions - 50000); // Standard deduction
    const optimizedTaxableIncome = Math.max(0, income - maxPotentialDeductions - 50000);
    
    const currentTax = calculateOldRegimeTax(currentTaxableIncome) * 1.04; // With cess
    const optimizedTax = calculateOldRegimeTax(optimizedTaxableIncome) * 1.04;

    return {
      totalIncome: income,
      totalDeductions: totalCurrentDeductions,
      taxableIncome: currentTaxableIncome,
      estimatedTax: currentTax,
      potentialSavings: currentTax - optimizedTax,
      recommendations: deductionCategories.filter(cat => 
        cat.limit !== Infinity && cat.currentAmount < cat.limit
      ).sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
    };
  };

  const result = useMemo(() => calculateTaxSavings(), [income, deductions, age]);

  const handleDeductionChange = (field: keyof typeof deductions, value: number) => {
    setDeductions(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Tax Optimizer</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Maximize Your Tax Savings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto">
          Get personalized recommendations to reduce your tax liability under the Old Regime
        </p>
      </div>

      <Tabs value={step} onValueChange={(v) => setStep(v as typeof step)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Income</span>
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span className="hidden sm:inline">Deductions</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Optimize</span>
          </TabsTrigger>
        </TabsList>

        {/* Step 1: Income Input */}
        <TabsContent value="input">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-blue-600" />
                Enter Your Income Details
              </CardTitle>
              <CardDescription>
                We'll analyze your income and suggest optimal tax-saving strategies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Annual Gross Income</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="pl-10 text-lg"
                    placeholder="1200000"
                  />
                </div>
                <Slider
                  value={[income]}
                  onValueChange={([v]) => setIncome(v)}
                  min={300000}
                  max={5000000}
                  step={50000}
                  className="mt-4"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>\u20B93L</span>
                  <span>\u20B950L</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Age Category</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "below60", label: "Below 60", limit: "\u20B92.5L" },
                    { value: "60to80", label: "60-80 yrs", limit: "\u20B93L" },
                    { value: "above80", label: "Above 80", limit: "\u20B95L" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={age === option.value ? "default" : "outline"}
                      onClick={() => setAge(option.value)}
                      className="flex flex-col h-auto py-3"
                    >
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs opacity-70">Exempt: {option.limit}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setStep("analysis")}
              >
                Continue to Deductions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 2: Current Deductions */}
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-green-600" />
                Current Deductions Claimed
              </CardTitle>
              <CardDescription>
                Enter the deductions you're already claiming this year
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {deductionCategories.slice(0, 4).map((category) => (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      {category.icon}
                      {category.name} ({category.section})
                    </Label>
                    <Badge variant="outline">
                      Limit: {category.limit === Infinity ? "No limit" : formatCurrency(category.limit)}
                    </Badge>
                  </div>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      value={category.currentAmount}
                      onChange={(e) => {
                        const field = {
                          "80C": "section80C",
                          "80D": "section80D",
                          "80CCD": "section80CCD",
                          "homeLoan": "homeLoanInterest",
                        }[category.id] as keyof typeof deductions;
                        if (field) handleDeductionChange(field, Number(e.target.value));
                      }}
                      className="pl-10"
                      max={category.limit === Infinity ? undefined : category.limit}
                    />
                  </div>
                  {category.limit !== Infinity && (
                    <Progress 
                      value={(category.currentAmount / category.limit) * 100} 
                      className="h-2"
                    />
                  )}
                </div>
              ))}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setStep("input")}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => setStep("recommendations")}
                >
                  Get Recommendations
                  <Lightbulb className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Recommendations */}
        <TabsContent value="recommendations">
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-blue-100 text-sm">Current Tax</p>
                    <p className="text-3xl font-bold">{formatCurrency(result.estimatedTax)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-100 text-sm">Potential Savings</p>
                    <p className="text-3xl font-bold text-green-300">
                      {formatCurrency(result.potentialSavings)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-blue-100 text-sm">After Optimization</p>
                    <p className="text-3xl font-bold">
                      {formatCurrency(result.estimatedTax - result.potentialSavings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations List */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Recommended Actions
              </h3>

              <AnimatePresence>
                {result.recommendations.map((rec, index) => {
                  const remaining = rec.limit - rec.currentAmount;
                  const percentUsed = (rec.currentAmount / rec.limit) * 100;
                  
                  return (
                    <motion.div
                      key={rec.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`border-l-4 ${
                        rec.priority === "high" 
                          ? "border-l-red-500" 
                          : rec.priority === "medium" 
                            ? "border-l-yellow-500" 
                            : "border-l-gray-300"
                      }`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                rec.priority === "high" 
                                  ? "bg-red-100 text-red-600" 
                                  : rec.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-600"
                                    : "bg-gray-100 text-gray-600"
                              }`}>
                                {rec.icon}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {rec.name}
                                </h4>
                                <p className="text-sm text-gray-500">{rec.description}</p>
                              </div>
                            </div>
                            <Badge variant={rec.priority === "high" ? "destructive" : "secondary"}>
                              {rec.priority === "high" ? "High Priority" : rec.priority === "medium" ? "Recommended" : "Optional"}
                            </Badge>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Used: {formatCurrency(rec.currentAmount)}</span>
                              <span className="text-green-600 font-medium">
                                Available: {formatCurrency(remaining)}
                              </span>
                            </div>
                            <Progress value={percentUsed} className="h-2" />
                          </div>

                          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              💡 Suggestions:
                            </p>
                            <ul className="space-y-1">
                              {rec.suggestions.slice(0, 2).map((suggestion, i) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                  <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {suggestion}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep("analysis")}>
                Modify Deductions
              </Button>
              <Button className="flex-1">
                Download Tax Plan
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                These recommendations are for the Old Tax Regime. The New Regime doesn't allow most deductions but may still be beneficial for lower incomes. Compare both regimes before deciding.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default TaxOptimizer;

