import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  IndianRupee, 
  Check, 
  X, 
  Info,
  Lightbulb,
  Download,
  Scale,
  PiggyBank,
  Building2,
  GraduationCap,
  Heart,
  Home,
  Wallet,
  ArrowRight,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CalculatorExport } from "@/components/ui/calculator-export";
import EnhancedSEO from "@/components/EnhancedSEO";

// Tax calculation constants for FY 2024-25
const OLD_REGIME_SLABS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 5 },
  { min: 500000, max: 1000000, rate: 20 },
  { min: 1000000, max: Infinity, rate: 30 },
];

const NEW_REGIME_SLABS = [
  { min: 0, max: 300000, rate: 0 },
  { min: 300000, max: 700000, rate: 5 },
  { min: 700000, max: 1000000, rate: 10 },
  { min: 1000000, max: 1200000, rate: 15 },
  { min: 1200000, max: 1500000, rate: 20 },
  { min: 1500000, max: Infinity, rate: 30 },
];

const DEDUCTION_LIMITS = {
  section80C: 150000,
  section80CCD1B: 50000,
  section80D_self: 25000,
  section80D_parents: 50000,
  section80D_preventive: 5000,
  section80E: Infinity,
  section80G: Infinity,
  section80TTA: 10000,
  section80TTB: 50000,
  section24b: 200000,
  standardDeduction: 75000,
  standardDeductionOld: 50000,
};

interface IncomeInputs {
  basicSalary: number;
  hra: number;
  lta: number;
  specialAllowance: number;
  otherIncome: number;
  rentalIncome: number;
  interestIncome: number;
  businessIncome: number;
}

interface DeductionInputs {
  section80C: number;
  section80CCD1B: number;
  section80D_self: number;
  section80D_parents: number;
  section80E: number;
  section80G: number;
  section80TTA: number;
  section24b: number;
  hraExemption: number;
  ltaExemption: number;
  professionalTax: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatLakhs = (amount: number) => {
  if (amount >= 10000000) {
    return `\u20B9${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `\u20B9${(amount / 100000).toFixed(2)} L`;
  }
  return formatCurrency(amount);
};

export default function RegimeComparatorPage() {
  const [activeTab, setActiveTab] = useState("income");
  
  const [income, setIncome] = useState<IncomeInputs>({
    basicSalary: 1000000,
    hra: 400000,
    lta: 50000,
    specialAllowance: 300000,
    otherIncome: 0,
    rentalIncome: 0,
    interestIncome: 50000,
    businessIncome: 0,
  });

  const [deductions, setDeductions] = useState<DeductionInputs>({
    section80C: 150000,
    section80CCD1B: 50000,
    section80D_self: 25000,
    section80D_parents: 0,
    section80E: 0,
    section80G: 0,
    section80TTA: 10000,
    section24b: 0,
    hraExemption: 200000,
    ltaExemption: 50000,
    professionalTax: 2500,
  });

  const calculations = useMemo(() => {
    // Calculate gross income
    const grossSalary = income.basicSalary + income.hra + income.lta + income.specialAllowance;
    const grossIncome = grossSalary + income.otherIncome + income.rentalIncome + income.interestIncome + income.businessIncome;

    // OLD REGIME CALCULATION
    const oldRegimeDeductions = 
      Math.min(deductions.section80C, DEDUCTION_LIMITS.section80C) +
      Math.min(deductions.section80CCD1B, DEDUCTION_LIMITS.section80CCD1B) +
      Math.min(deductions.section80D_self, DEDUCTION_LIMITS.section80D_self) +
      Math.min(deductions.section80D_parents, DEDUCTION_LIMITS.section80D_parents) +
      deductions.section80E +
      deductions.section80G +
      Math.min(deductions.section80TTA, DEDUCTION_LIMITS.section80TTA) +
      Math.min(deductions.section24b, DEDUCTION_LIMITS.section24b) +
      deductions.hraExemption +
      deductions.ltaExemption +
      deductions.professionalTax +
      DEDUCTION_LIMITS.standardDeductionOld;

    const oldTaxableIncome = Math.max(0, grossIncome - oldRegimeDeductions);
    
    let oldTax = 0;
    for (const slab of OLD_REGIME_SLABS) {
      if (oldTaxableIncome > slab.min) {
        const taxableInSlab = Math.min(oldTaxableIncome - slab.min, slab.max - slab.min);
        oldTax += taxableInSlab * (slab.rate / 100);
      }
    }

    // Apply rebate under 87A for old regime
    if (oldTaxableIncome <= 500000) {
      oldTax = Math.max(0, oldTax - 12500);
    }

    // Add surcharge and cess
    let oldSurcharge = 0;
    if (oldTaxableIncome > 5000000) {
      oldSurcharge = oldTax * 0.37;
    } else if (oldTaxableIncome > 2000000) {
      oldSurcharge = oldTax * 0.25;
    } else if (oldTaxableIncome > 1000000) {
      oldSurcharge = oldTax * 0.15;
    } else if (oldTaxableIncome > 5000000) {
      oldSurcharge = oldTax * 0.10;
    }
    
    const oldCess = (oldTax + oldSurcharge) * 0.04;
    const oldTotalTax = oldTax + oldSurcharge + oldCess;

    // NEW REGIME CALCULATION
    const newRegimeDeductions = DEDUCTION_LIMITS.standardDeduction; // Only standard deduction in new regime
    const newTaxableIncome = Math.max(0, grossIncome - newRegimeDeductions);
    
    let newTax = 0;
    for (const slab of NEW_REGIME_SLABS) {
      if (newTaxableIncome > slab.min) {
        const taxableInSlab = Math.min(newTaxableIncome - slab.min, slab.max - slab.min);
        newTax += taxableInSlab * (slab.rate / 100);
      }
    }

    // Apply rebate under 87A for new regime (up to 7 lakhs)
    if (newTaxableIncome <= 700000) {
      newTax = Math.max(0, newTax - 25000);
    }

    // Add surcharge and cess for new regime
    let newSurcharge = 0;
    if (newTaxableIncome > 5000000) {
      newSurcharge = newTax * 0.25; // Max 25% in new regime
    } else if (newTaxableIncome > 2000000) {
      newSurcharge = newTax * 0.25;
    } else if (newTaxableIncome > 1000000) {
      newSurcharge = newTax * 0.15;
    } else if (newTaxableIncome > 5000000) {
      newSurcharge = newTax * 0.10;
    }
    
    const newCess = (newTax + newSurcharge) * 0.04;
    const newTotalTax = newTax + newSurcharge + newCess;

    // Calculate savings
    const savings = oldTotalTax - newTotalTax;
    const betterRegime = savings > 0 ? 'new' : savings < 0 ? 'old' : 'same';
    const absoluteSavings = Math.abs(savings);

    // Calculate breakeven deductions
    const breakevenDeductions = grossIncome - (newTaxableIncome + (newTotalTax / 0.3)); // Approximate

    // Effective tax rates
    const oldEffectiveRate = grossIncome > 0 ? (oldTotalTax / grossIncome) * 100 : 0;
    const newEffectiveRate = grossIncome > 0 ? (newTotalTax / grossIncome) * 100 : 0;

    return {
      grossIncome,
      grossSalary,
      oldRegime: {
        deductions: oldRegimeDeductions,
        taxableIncome: oldTaxableIncome,
        tax: oldTax,
        surcharge: oldSurcharge,
        cess: oldCess,
        totalTax: oldTotalTax,
        effectiveRate: oldEffectiveRate,
      },
      newRegime: {
        deductions: newRegimeDeductions,
        taxableIncome: newTaxableIncome,
        tax: newTax,
        surcharge: newSurcharge,
        cess: newCess,
        totalTax: newTotalTax,
        effectiveRate: newEffectiveRate,
      },
      savings: absoluteSavings,
      betterRegime,
      breakevenDeductions,
    };
  }, [income, deductions]);

  const comparisonChartData = [
    {
      name: 'Old Regime',
      'Gross Income': calculations.grossIncome,
      'Deductions': calculations.oldRegime.deductions,
      'Taxable Income': calculations.oldRegime.taxableIncome,
      'Tax Payable': calculations.oldRegime.totalTax,
    },
    {
      name: 'New Regime',
      'Gross Income': calculations.grossIncome,
      'Deductions': calculations.newRegime.deductions,
      'Taxable Income': calculations.newRegime.taxableIncome,
      'Tax Payable': calculations.newRegime.totalTax,
    },
  ];

  const taxBreakdownData = [
    { name: 'Old Regime Tax', value: calculations.oldRegime.totalTax, color: '#ef4444' },
    { name: 'New Regime Tax', value: calculations.newRegime.totalTax, color: '#22c55e' },
  ];

  const handleIncomeChange = (field: keyof IncomeInputs, value: string) => {
    setIncome(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const handleDeductionChange = (field: keyof DeductionInputs, value: string) => {
    setDeductions(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const getRecommendation = () => {
    const { betterRegime, savings, oldRegime, newRegime, grossIncome } = calculations;
    
    if (betterRegime === 'same') {
      return {
        regime: 'Either',
        reason: 'Both regimes result in the same tax liability. You can choose either.',
        tips: ['Consider future income changes', 'New regime is simpler with fewer compliance requirements'],
      };
    }

    if (betterRegime === 'new') {
      return {
        regime: 'New Tax Regime',
        reason: `You save ${formatCurrency(savings)} with the New Regime. Your deductions (${formatCurrency(oldRegime.deductions)}) are not high enough to benefit from the Old Regime.`,
        tips: [
          'No need to maintain investment proofs',
          'Simpler tax filing process',
          'Better if you have limited deductions',
          grossIncome <= 700000 ? 'You get full tax rebate under Section 87A' : '',
        ].filter(Boolean),
      };
    }

    return {
      regime: 'Old Tax Regime',
      reason: `You save ${formatCurrency(savings)} with the Old Regime. Your total deductions of ${formatCurrency(oldRegime.deductions)} significantly reduce your tax liability.`,
      tips: [
        'Continue your tax-saving investments',
        'Claim all eligible deductions',
        'Keep proper documentation for HRA, 80C, 80D claims',
        'Consider maximizing NPS contribution for additional 80CCD(1B) benefit',
      ],
    };
  };

  const recommendation = getRecommendation();

  return (
    <>
      <EnhancedSEO
        title="Tax Regime Comparator - Old vs New Regime Calculator | MyeCA"
        description="Compare Old and New Tax Regime for FY 2024-25. Get personalized recommendations on which regime saves more tax based on your income and deductions."
        keywords={["tax regime comparison", "old vs new regime", "tax calculator india", "which tax regime is better", "section 80c", "income tax 2024"]}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
              <Scale className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">FY 2024-25 (AY 2025-26)</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Tax Regime Comparator
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Compare Old vs New Tax Regime and find out which one saves you more tax based on your income and deductions
            </p>
          </div>

          {/* Quick Result Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className={`border-2 ${
              calculations.betterRegime === 'new' 
                ? 'border-green-500 bg-green-50' 
                : calculations.betterRegime === 'old'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50'
            }`}>
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      calculations.betterRegime === 'new' 
                        ? 'bg-green-500' 
                        : calculations.betterRegime === 'old'
                          ? 'bg-blue-500'
                          : 'bg-gray-500'
                    } text-white`}>
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Recommended Regime</p>
                      <p className="text-2xl font-bold text-gray-900">{recommendation.regime}</p>
                    </div>
                  </div>
                  <div className="text-center md:text-right">
                    <p className="text-sm text-gray-600">You Save</p>
                    <p className={`text-3xl font-bold ${
                      calculations.betterRegime === 'new' ? 'text-green-600' : 'text-blue-600'
                    }`}>
                      {formatCurrency(calculations.savings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Input Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    Enter Your Details
                  </CardTitle>
                  <CardDescription>
                    Provide your income and deduction details for accurate comparison
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="income" className="flex items-center gap-2">
                        <IndianRupee className="h-4 w-4" />
                        Income
                      </TabsTrigger>
                      <TabsTrigger value="deductions" className="flex items-center gap-2">
                        <PiggyBank className="h-4 w-4" />
                        Deductions
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="income" className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Basic Salary (Annual)</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              value={income.basicSalary}
                              onChange={(e) => handleIncomeChange('basicSalary', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>HRA Received</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              value={income.hra}
                              onChange={(e) => handleIncomeChange('hra', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>LTA Received</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              value={income.lta}
                              onChange={(e) => handleIncomeChange('lta', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Special Allowance</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              value={income.specialAllowance}
                              onChange={(e) => handleIncomeChange('specialAllowance', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Interest Income</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              value={income.interestIncome}
                              onChange={(e) => handleIncomeChange('interestIncome', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Other Income</Label>
                          <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              type="number"
                              value={income.otherIncome}
                              onChange={(e) => handleIncomeChange('otherIncome', e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Total Gross Income</span>
                          <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(calculations.grossIncome)}
                          </span>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="deductions" className="space-y-6">
                      <Accordion type="multiple" defaultValue={["80c", "80d", "housing"]}>
                        <AccordionItem value="80c">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <PiggyBank className="h-4 w-4 text-green-600" />
                              <span>Section 80C & 80CCD (Max \u20B92L)</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid md:grid-cols-2 gap-4 pt-4">
                              <div className="space-y-2">
                                <Label>80C (PPF, ELSS, LIC, etc.) - Max \u20B91.5L</Label>
                                <Input
                                  type="number"
                                  value={deductions.section80C}
                                  onChange={(e) => handleDeductionChange('section80C', e.target.value)}
                                  max={150000}
                                />
                                <Progress value={(deductions.section80C / 150000) * 100} className="h-2" />
                              </div>
                              <div className="space-y-2">
                                <Label>80CCD(1B) - NPS (Additional \u20B950K)</Label>
                                <Input
                                  type="number"
                                  value={deductions.section80CCD1B}
                                  onChange={(e) => handleDeductionChange('section80CCD1B', e.target.value)}
                                  max={50000}
                                />
                                <Progress value={(deductions.section80CCD1B / 50000) * 100} className="h-2" />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="80d">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-red-600" />
                              <span>Section 80D - Health Insurance</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid md:grid-cols-2 gap-4 pt-4">
                              <div className="space-y-2">
                                <Label>Self & Family (Max \u20B925K / \u20B950K for seniors)</Label>
                                <Input
                                  type="number"
                                  value={deductions.section80D_self}
                                  onChange={(e) => handleDeductionChange('section80D_self', e.target.value)}
                                  max={50000}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Parents (Max \u20B950K)</Label>
                                <Input
                                  type="number"
                                  value={deductions.section80D_parents}
                                  onChange={(e) => handleDeductionChange('section80D_parents', e.target.value)}
                                  max={50000}
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="housing">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Home className="h-4 w-4 text-blue-600" />
                              <span>Housing Benefits (HRA, Home Loan)</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid md:grid-cols-2 gap-4 pt-4">
                              <div className="space-y-2">
                                <Label>HRA Exemption</Label>
                                <Input
                                  type="number"
                                  value={deductions.hraExemption}
                                  onChange={(e) => handleDeductionChange('hraExemption', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Home Loan Interest - 24(b) (Max \u20B92L)</Label>
                                <Input
                                  type="number"
                                  value={deductions.section24b}
                                  onChange={(e) => handleDeductionChange('section24b', e.target.value)}
                                  max={200000}
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="other">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-2">
                              <Wallet className="h-4 w-4 text-purple-600" />
                              <span>Other Deductions</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="grid md:grid-cols-2 gap-4 pt-4">
                              <div className="space-y-2">
                                <Label>80E - Education Loan Interest</Label>
                                <Input
                                  type="number"
                                  value={deductions.section80E}
                                  onChange={(e) => handleDeductionChange('section80E', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>80TTA - Savings Interest (Max \u20B910K)</Label>
                                <Input
                                  type="number"
                                  value={deductions.section80TTA}
                                  onChange={(e) => handleDeductionChange('section80TTA', e.target.value)}
                                  max={10000}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>LTA Exemption</Label>
                                <Input
                                  type="number"
                                  value={deductions.ltaExemption}
                                  onChange={(e) => handleDeductionChange('ltaExemption', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Professional Tax</Label>
                                <Input
                                  type="number"
                                  value={deductions.professionalTax}
                                  onChange={(e) => handleDeductionChange('professionalTax', e.target.value)}
                                />
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700">Total Deductions (Old Regime)</span>
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(calculations.oldRegime.deductions)}
                          </span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {/* Comparison Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className={`${calculations.betterRegime === 'old' ? 'ring-2 ring-blue-500' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      Old Regime
                      {calculations.betterRegime === 'old' && (
                        <Badge className="bg-blue-500">Better</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatLakhs(calculations.oldRegime.totalTax)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {calculations.oldRegime.effectiveRate.toFixed(1)}% effective rate
                    </p>
                  </CardContent>
                </Card>

                <Card className={`${calculations.betterRegime === 'new' ? 'ring-2 ring-green-500' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      New Regime
                      {calculations.betterRegime === 'new' && (
                        <Badge className="bg-green-500">Better</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatLakhs(calculations.newRegime.totalTax)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {calculations.newRegime.effectiveRate.toFixed(1)}% effective rate
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Recommendation */}
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Our Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700">{recommendation.reason}</p>
                  <div className="space-y-2">
                    {recommendation.tips.map((tip, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{tip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Export */}
              <Card>
                <CardContent className="pt-6">
                  <CalculatorExport
                    title="Tax Regime Comparison"
                    data={{
                      "Gross Income": calculations.grossIncome,
                      "Old Regime Tax": calculations.oldRegime.totalTax,
                      "New Regime Tax": calculations.newRegime.totalTax,
                      "Recommended Regime": recommendation.regime,
                      "Tax Savings": calculations.savings,
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Detailed Comparison Chart */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Visual Comparison</CardTitle>
              <CardDescription>Side-by-side breakdown of both tax regimes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(v) => formatLakhs(v)} />
                    <YAxis type="category" dataKey="name" width={100} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Taxable Income" fill="#3b82f6" />
                    <Bar dataKey="Tax Payable" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tax Slab Comparison Table */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Old Regime Tax Slabs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {OLD_REGIME_SLABS.map((slab, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {slab.max === Infinity 
                          ? `Above ${formatLakhs(slab.min)}`
                          : `${formatLakhs(slab.min)} - ${formatLakhs(slab.max)}`
                        }
                      </span>
                      <Badge variant="outline">{slab.rate}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">New Regime Tax Slabs (FY 24-25)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {NEW_REGIME_SLABS.map((slab, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {slab.max === Infinity 
                          ? `Above ${formatLakhs(slab.min)}`
                          : `${formatLakhs(slab.min)} - ${formatLakhs(slab.max)}`
                        }
                      </span>
                      <Badge variant="outline">{slab.rate}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deductions Comparison */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Deductions Availability</CardTitle>
              <CardDescription>Which deductions are available in each regime</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Deduction</th>
                      <th className="text-center py-3 px-4">Old Regime</th>
                      <th className="text-center py-3 px-4">New Regime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: "Standard Deduction", old: "\u20B950,000", new: "\u20B975,000" },
                      { name: "Section 80C (PPF, ELSS, etc.)", old: "\u20B91.5L", new: false },
                      { name: "Section 80CCD(1B) - NPS", old: "\u20B950,000", new: false },
                      { name: "Section 80D - Health Insurance", old: "Up to \u20B91L", new: false },
                      { name: "HRA Exemption", old: true, new: false },
                      { name: "LTA Exemption", old: true, new: false },
                      { name: "Home Loan Interest (24b)", old: "\u20B92L", new: false },
                      { name: "Section 80E - Education Loan", old: "No limit", new: false },
                      { name: "Professional Tax", old: true, new: false },
                    ].map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="text-center py-3 px-4">
                          {typeof item.old === 'boolean' 
                            ? item.old 
                              ? <Check className="h-5 w-5 text-green-500 mx-auto" />
                              : <X className="h-5 w-5 text-red-500 mx-auto" />
                            : <span className="text-green-600 font-medium">{item.old}</span>
                          }
                        </td>
                        <td className="text-center py-3 px-4">
                          {typeof item.new === 'boolean' 
                            ? item.new 
                              ? <Check className="h-5 w-5 text-green-500 mx-auto" />
                              : <X className="h-5 w-5 text-red-500 mx-auto" />
                            : <span className="text-green-600 font-medium">{item.new}</span>
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

