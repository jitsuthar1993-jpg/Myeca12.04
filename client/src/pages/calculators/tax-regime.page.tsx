import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, Search, TrendingUp, Coins, FileText, Calendar, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema } from "@/utils/seo-defaults";
import { CalculatorHeader } from "@/components/ui/calculator-header";

interface TaxSlab {
  min: number;
  max: number | null;
  rate: number;
}

interface TaxRates {
  year: string;
  oldRegime: TaxSlab[];
  newRegime: TaxSlab[];
  standardDeduction: number;
  basicExemption: number;
}

interface TaxCalculation {
  grossIncome: number;
  taxableIncome: number;
  taxPayable: number;
  netIncome: number;
  effectiveRate: number;
  slabWiseBreakdown: Array<{
    slab: string;
    taxableAmount: number;
    tax: number;
  }>;
}

const assessmentYears = [
  { value: "2025-26", label: "AY 2025-26 (FY 2024-25)" },
  { value: "2024-25", label: "AY 2024-25 (FY 2023-24)" },
  { value: "2023-24", label: "AY 2023-24 (FY 2022-23)" },
  { value: "2022-23", label: "AY 2022-23 (FY 2021-22)" },
  { value: "2021-22", label: "AY 2021-22 (FY 2020-21)" }
];

// Default tax rates (Budget 2024 rates for FY 2024-25)
const defaultTaxRates: { [key: string]: TaxRates } = {
  "2025-26": {
    year: "2025-26",
    oldRegime: [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 5 },
      { min: 500000, max: 1000000, rate: 20 },
      { min: 1000000, max: null, rate: 30 }
    ],
    newRegime: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 5 },
      { min: 700000, max: 1000000, rate: 10 },
      { min: 1000000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: null, rate: 30 }
    ],
    standardDeduction: 75000, // Updated as per Budget 2024
    basicExemption: 300000
  },
  "2024-25": {
    year: "2024-25",
    oldRegime: [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 5 },
      { min: 500000, max: 1000000, rate: 20 },
      { min: 1000000, max: null, rate: 30 }
    ],
    newRegime: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 700000, rate: 5 },
      { min: 700000, max: 1000000, rate: 10 },
      { min: 1000000, max: 1200000, rate: 15 },
      { min: 1200000, max: 1500000, rate: 20 },
      { min: 1500000, max: null, rate: 30 }
    ],
    standardDeduction: 75000, // Updated as per Budget 2024
    basicExemption: 300000
  }
};

export default function TaxRegimeCalculator() {
  const [selectedYear, setSelectedYear] = useState("2025-26");
  const [income, setIncome] = useState("");
  const [deductions, setDeductions] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [taxRates, setTaxRates] = useState<{ [key: string]: TaxRates }>(defaultTaxRates);
  const [calculations, setCalculations] = useState<{
    oldRegime: TaxCalculation | null;
    newRegime: TaxCalculation | null;
  }>({ oldRegime: null, newRegime: null });
  
  const { toast } = useToast();

  const searchTaxRates = async () => {
    setIsSearching(true);
    try {
      // Get Google search URLs for manual lookup
      const response = await fetch('/api/search-tax-rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assessmentYear: selectedYear
        })
      });

      if (response.ok) {
        const searchData = await response.json();
        
        // Update tax rates with known values
        if (searchData.knownRates) {
          setTaxRates(prev => ({
            ...prev,
            [selectedYear]: {
              year: selectedYear,
              oldRegime: searchData.knownRates.oldRegime,
              newRegime: searchData.knownRates.newRegime,
              standardDeduction: searchData.knownRates.standardDeduction,
              basicExemption: searchData.knownRates.newRegime[0].max
            }
          }));
        }

        // Open Google search URLs for user to verify latest rates
        Object.entries(searchData.searchUrls).forEach(([key, url], index) => {
          setTimeout(() => {
            window.open(url as string, `_blank_${key}`);
          }, index * 500); // Stagger the opening of tabs
        });

        toast({
          title: "Search URLs Opened",
          description: `Opened Google search tabs for AY ${selectedYear} tax rates. Please verify the current rates from official sources.`,
        });
      } else {
        throw new Error('Failed to get search URLs');
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "Could not open search URLs. Please manually search for current tax rates.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const calculateTax = (
    grossIncome: number, 
    deductions: number, 
    regime: 'old' | 'new'
  ): TaxCalculation => {
    const currentRates = taxRates[selectedYear];
    if (!currentRates) return {
      grossIncome,
      taxableIncome: 0,
      taxPayable: 0,
      netIncome: grossIncome,
      effectiveRate: 0,
      slabWiseBreakdown: []
    };

    const slabs = regime === 'old' ? currentRates.oldRegime : currentRates.newRegime;
    const standardDeduction = regime === 'new' ? currentRates.standardDeduction : 0;
    const maxDeductions = regime === 'old' ? deductions : 0;
    
    const taxableIncome = Math.max(0, grossIncome - standardDeduction - maxDeductions);
    
    let taxPayable = 0;
    const slabWiseBreakdown: Array<{
      slab: string;
      taxableAmount: number;
      tax: number;
    }> = [];

    for (const slab of slabs) {
      if (taxableIncome <= slab.min) break;
      
      const maxForSlab = slab.max || taxableIncome;
      const taxableInThisSlab = Math.min(taxableIncome, maxForSlab) - slab.min;
      
      if (taxableInThisSlab > 0) {
        const taxForSlab = (taxableInThisSlab * slab.rate) / 100;
        taxPayable += taxForSlab;
        
        slabWiseBreakdown.push({
          slab: slab.max 
            ? `\u20B9${slab.min.toLocaleString()} - \u20B9${slab.max.toLocaleString()}` 
            : `\u20B9${slab.min.toLocaleString()}+`,
          taxableAmount: taxableInThisSlab,
          tax: taxForSlab
        });
      }
    }

    // Add cess (4% on tax)
    const cess = taxPayable * 0.04;
    const totalTax = taxPayable + cess;

    return {
      grossIncome,
      taxableIncome,
      taxPayable: totalTax,
      netIncome: grossIncome - totalTax,
      effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
      slabWiseBreakdown
    };
  };

  const handleCalculate = () => {
    const grossIncome = parseFloat(income) || 0;
    const totalDeductions = parseFloat(deductions) || 0;

    if (grossIncome <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid gross income amount.",
        variant: "destructive",
      });
      return;
    }

    const oldRegimeCalc = calculateTax(grossIncome, totalDeductions, 'old');
    const newRegimeCalc = calculateTax(grossIncome, totalDeductions, 'new');

    setCalculations({
      oldRegime: oldRegimeCalc,
      newRegime: newRegimeCalc
    });
  };

  const getRecommendation = () => {
    if (!calculations.oldRegime || !calculations.newRegime) return null;

    const savings = calculations.oldRegime.taxPayable - calculations.newRegime.taxPayable;
    if (Math.abs(savings) < 1000) {
      return {
        regime: 'either',
        savings: 0,
        message: 'Both regimes result in similar tax liability. Choose based on convenience.'
      };
    }
    
    return {
      regime: savings > 0 ? 'new' : 'old',
      savings: Math.abs(savings),
      message: savings > 0 
        ? `New regime saves you \u20B9${Math.abs(savings).toLocaleString()}` 
        : `Old regime saves you \u20B9${Math.abs(savings).toLocaleString()}`
    };
  };

  const recommendation = getRecommendation();

  const howToSchema = getHowToSchema({
    name: "How to Compare Old vs New Tax Regime",
    description: "Compare tax liability under old and new income tax regimes",
    totalTime: "PT5M",
    steps: [
      {
        name: "Enter your income details",
        text: "Input your gross annual income and deductions"
      },
      {
        name: "Select assessment year",
        text: "Choose the relevant assessment year for accurate tax rates"
      },
      {
        name: "Review calculations",
        text: "Compare tax liability under both regimes side by side"
      },
      {
        name: "Choose optimal regime",
        text: "Select the regime that saves you more tax"
      }
    ]
  });

  return (
    <>
      <EnhancedSEO
        title="Old vs New Tax Regime Calculator 2025 | Compare & Choose Best Option"
        description="Compare old vs new tax regime for AY 2025-26. Calculate which tax regime saves you more money. Make informed decision with side-by-side comparison."
        keywords={[
          'old vs new tax regime',
          'tax regime comparison',
          'which tax regime is better',
          'tax regime calculator 2025',
          'old regime vs new regime',
          'section 115BAC',
          'tax slab comparison',
          'income tax regime calculator'
        ]}
        url="https://myeca.in/calculators/tax-regime"
        type="website"
        jsonLd={howToSchema}
      />
    <div className="calculator-page min-h-screen bg-gray-50 py-4 mobile-safe-bottom">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" className="hover:bg-blue-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        <CalculatorHeader
          icon={Calculator}
          title="Tax Regime Calculator"
          subtitle="Compare old vs new tax regimes with real-time tax rates. Select your assessment year and get personalized recommendations."
          color="blue"
          align="center"
        />

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-600" />
                  Tax Calculator Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="assessment-year" className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    Assessment Year
                  </Label>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assessment year" />
                    </SelectTrigger>
                    <SelectContent>
                      {assessmentYears.map((year) => (
                        <SelectItem key={year.value} value={year.value}>
                          {year.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={searchTaxRates}
                    disabled={isSearching}
                    className="w-full"
                    variant="outline"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {isSearching ? 'Opening Search Tabs...' : 'Search Google for Latest Rates'}
                  </Button>
                  <p className="text-xs text-gray-500 text-center">
                    This will open Google search tabs for you to verify current tax rates from official sources
                  </p>
                </div>

                <div>
                  <Label htmlFor="income">Gross Annual Income (\u20B9)</Label>
                  <Input
                    id="income"
                    type="number"
                    placeholder="e.g., 1200000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="deductions">Total Deductions - 80C, 80D etc. (\u20B9)</Label>
                  <Input
                    id="deductions"
                    type="number"
                    placeholder="e.g., 150000"
                    value={deductions}
                    onChange={(e) => setDeductions(e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Only applicable for old tax regime
                  </p>
                </div>

                <Button onClick={handleCalculate} className="w-full" size="lg">
                  <Coins className="h-4 w-4 mr-2" />
                  Calculate Tax
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tax Rates Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Tax Rates for AY {selectedYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-3">Old Tax Regime</h4>
                    <div className="space-y-2">
                      {taxRates[selectedYear]?.oldRegime.map((slab, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {slab.max 
                              ? `\u20B9${slab.min.toLocaleString()} - \u20B9${slab.max.toLocaleString()}`
                              : `\u20B9${slab.min.toLocaleString()}+`}
                          </span>
                          <span className="font-medium">{slab.rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm text-gray-900 mb-3">New Tax Regime</h4>
                    <div className="space-y-2">
                      {taxRates[selectedYear]?.newRegime.map((slab, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {slab.max 
                              ? `\u20B9${slab.min.toLocaleString()} - \u20B9${slab.max.toLocaleString()}`
                              : `\u20B9${slab.min.toLocaleString()}+`}
                          </span>
                          <span className="font-medium">{slab.rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />
                
                <div className="text-sm text-gray-600">
                  <p>• Standard Deduction (New Regime): \u20B9{taxRates[selectedYear]?.standardDeduction.toLocaleString()}</p>
                  <p>• Section 80C Limit (Old Regime): \u20B91,50,000</p>
                  <p>• Health & Education Cess: 4% on income tax</p>
                  <p>• Rates shown: Baseline values (verify with latest search)</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Results Section */}
        {calculations.oldRegime && calculations.newRegime && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Recommendation */}
            {recommendation && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-xl font-bold text-blue-900">Recommendation</h3>
                  </div>
                  <div className="text-center">
                    <Badge 
                      variant={recommendation.regime === 'new' ? 'default' : recommendation.regime === 'old' ? 'secondary' : 'outline'}
                      className="text-lg px-4 py-2 mb-2"
                    >
                      {recommendation.regime === 'new' ? 'Choose New Regime' : 
                       recommendation.regime === 'old' ? 'Choose Old Regime' : 
                       'Either Regime'}
                    </Badge>
                    <p className="text-blue-800 font-medium">{recommendation.message}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comparison Results */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Old Regime */}
              <Card className="border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-orange-800">Old Tax Regime</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Income:</span>
                      <span className="font-semibold">\u20B9{calculations.oldRegime.grossIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxable Income:</span>
                      <span className="font-semibold">\u20B9{calculations.oldRegime.taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-900 font-medium">Total Tax:</span>
                      <span className="font-bold text-orange-600">\u20B9{calculations.oldRegime.taxPayable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Income:</span>
                      <span className="font-semibold text-green-600">\u20B9{calculations.oldRegime.netIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective Rate:</span>
                      <span className="font-semibold">{calculations.oldRegime.effectiveRate.toFixed(2)}%</span>
                    </div>
                    
                    {calculations.oldRegime.slabWiseBreakdown.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Slab-wise Breakdown:</h4>
                        {calculations.oldRegime.slabWiseBreakdown.map((slab, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{slab.slab}:</span>
                            <span>\u20B9{slab.tax.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* New Regime */}
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-800">New Tax Regime</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Income:</span>
                      <span className="font-semibold">\u20B9{calculations.newRegime.grossIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxable Income:</span>
                      <span className="font-semibold">\u20B9{calculations.newRegime.taxableIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-gray-900 font-medium">Total Tax:</span>
                      <span className="font-bold text-green-600">\u20B9{calculations.newRegime.taxPayable.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Income:</span>
                      <span className="font-semibold text-green-600">\u20B9{calculations.newRegime.netIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Effective Rate:</span>
                      <span className="font-semibold">{calculations.newRegime.effectiveRate.toFixed(2)}%</span>
                    </div>
                    
                    {calculations.newRegime.slabWiseBreakdown.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Slab-wise Breakdown:</h4>
                        {calculations.newRegime.slabWiseBreakdown.map((slab, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{slab.slab}:</span>
                            <span>\u20B9{slab.tax.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
}