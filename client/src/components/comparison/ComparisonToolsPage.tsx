import { useState } from "react";
import { motion } from "framer-motion";
import { 
  GitCompare, Calculator, TrendingUp, PiggyBank, 
  Home, Car, GraduationCap, CreditCard, Check, X
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SEO from "@/components/SEO";
import { formatCurrency } from "@/lib/utils";

// Tax Regime Comparison Data
const taxRegimeData = {
  oldRegime: {
    slabs: [
      { min: 0, max: 250000, rate: 0 },
      { min: 250001, max: 500000, rate: 5 },
      { min: 500001, max: 1000000, rate: 20 },
      { min: 1000001, max: Infinity, rate: 30 }
    ],
    deductions: [
      { name: "Section 80C", limit: 150000, description: "PPF, ELSS, LIC, etc." },
      { name: "Section 80D", limit: 25000, description: "Health Insurance" },
      { name: "HRA", limit: "Calculated", description: "House Rent Allowance" },
      { name: "Standard Deduction", limit: 50000, description: "For salaried employees" }
    ]
  },
  newRegime: {
    slabs: [
      { min: 0, max: 300000, rate: 0 },
      { min: 300001, max: 600000, rate: 5 },
      { min: 600001, max: 900000, rate: 10 },
      { min: 900001, max: 1200000, rate: 15 },
      { min: 1200001, max: 1500000, rate: 20 },
      { min: 1500001, max: Infinity, rate: 30 }
    ],
    deductions: [
      { name: "Standard Deduction", limit: 75000, description: "For salaried employees (FY 2024-25)" },
      { name: "No other deductions", limit: 0, description: "Simplified tax structure" }
    ]
  }
};

// Investment Options Data
const investmentOptions = [
  {
    name: "PPF",
    returns: 7.1,
    taxBenefit: "80C",
    liquidity: "15 years",
    risk: "None",
    pros: ["Government backed", "Tax-free returns", "Loan facility"],
    cons: ["Long lock-in", "Limited investment"]
  },
  {
    name: "ELSS",
    returns: 12,
    taxBenefit: "80C",
    liquidity: "3 years",
    risk: "Market-linked",
    pros: ["Shortest lock-in", "High returns potential", "SIP option"],
    cons: ["Market risk", "Returns not guaranteed"]
  },
  {
    name: "FD",
    returns: 6.5,
    taxBenefit: "80C (5-year)",
    liquidity: "5 years",
    risk: "Low",
    pros: ["Fixed returns", "Bank guarantee", "Regular income"],
    cons: ["Lower returns", "Taxable interest"]
  },
  {
    name: "NPS",
    returns: 9.5,
    taxBenefit: "80C + 80CCD",
    liquidity: "60 years",
    risk: "Market-linked",
    pros: ["Additional 50k deduction", "Pension benefit", "Flexible allocation"],
    cons: ["Very long lock-in", "Partial withdrawal only"]
  }
];

// Loan Comparison Data
const loanTypes = {
  home: {
    name: "Home Loan",
    icon: Home,
    avgRate: 8.5,
    maxTenure: 30,
    features: ["Tax benefits on principal and interest", "Lower interest rates", "Long tenure options"]
  },
  car: {
    name: "Car Loan",
    icon: Car,
    avgRate: 9.5,
    maxTenure: 7,
    features: ["Quick processing", "Minimal documentation", "New and used car options"]
  },
  personal: {
    name: "Personal Loan",
    icon: CreditCard,
    avgRate: 11.5,
    maxTenure: 5,
    features: ["No collateral", "Flexible use", "Quick disbursal"]
  },
  education: {
    name: "Education Loan",
    icon: GraduationCap,
    avgRate: 10.5,
    maxTenure: 15,
    features: ["Moratorium period", "Tax benefits u/s 80E", "Covers all expenses"]
  }
};

export default function ComparisonToolsPage() {
  const [taxIncome, setTaxIncome] = useState("1000000");
  const [selectedInvestments, setSelectedInvestments] = useState<string[]>([]);
  const [loanAmount, setLoanAmount] = useState("1000000");
  const [loanTenure, setLoanTenure] = useState("5");

  // Calculate tax for both regimes
  const calculateTax = (income: number, regime: "old" | "new") => {
    const data = regime === "old" ? taxRegimeData.oldRegime : taxRegimeData.newRegime;
    let tax = 0;
    
    // Apply standard deduction
    const standardDeduction = regime === "old" ? 50000 : 75000;
    const taxableIncome = Math.max(0, income - standardDeduction);
    
    // Calculate tax based on slabs
    for (const slab of data.slabs) {
      if (taxableIncome > slab.min) {
        const taxableInSlab = Math.min(taxableIncome - slab.min, slab.max - slab.min);
        tax += (taxableInSlab * slab.rate) / 100;
      }
    }
    
    // Add cess
    tax = tax * 1.04;
    
    return Math.round(tax);
  };

  const oldRegimeTax = calculateTax(Number(taxIncome), "old");
  const newRegimeTax = calculateTax(Number(taxIncome), "new");
  const taxSaving = oldRegimeTax - newRegimeTax;

  // Calculate EMI
  const calculateEMI = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / 12 / 100;
    const months = tenure * 12;
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Comparison Tools - Tax Regimes, Investments & Loans | MyeCA.in"
        description="Compare tax regimes, investment options, and loan types. Make informed financial decisions with our comprehensive comparison tools."
        keywords="tax regime comparison, investment comparison, loan comparison, old vs new tax regime, ELSS vs PPF"
      />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <GitCompare className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Comparison Tools</h1>
              <p className="text-gray-600">Compare and make informed financial decisions</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="tax-regime" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-2xl mx-auto">
            <TabsTrigger value="tax-regime" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Tax Regimes
            </TabsTrigger>
            <TabsTrigger value="investments" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Investments
            </TabsTrigger>
            <TabsTrigger value="loans" className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Loans
            </TabsTrigger>
          </TabsList>

          {/* Tax Regime Comparison */}
          <TabsContent value="tax-regime" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Old vs New Tax Regime Comparison</CardTitle>
                <CardDescription>
                  Compare your tax liability under both regimes for AY 2025-26
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="income">Annual Income</Label>
                  <Input
                    id="income"
                    type="number"
                    value={taxIncome}
                    onChange={(e) => setTaxIncome(e.target.value)}
                    className="mt-1"
                    placeholder="Enter your annual income"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Old Regime */}
                  <Card className={taxSaving > 0 ? "border-green-200" : ""}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Old Tax Regime</CardTitle>
                      {taxSaving > 0 && (
                        <Badge className="w-fit" variant="outline">Better Option</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Tax Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(oldRegimeTax)}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="font-medium mb-2">Available Deductions</p>
                        <div className="space-y-2">
                          {taxRegimeData.oldRegime.deductions.map((deduction) => (
                            <div key={deduction.name} className="flex justify-between text-sm">
                              <span className="text-gray-600">{deduction.name}</span>
                              <span className="font-medium">
                                {typeof deduction.limit === "number" 
                                  ? formatCurrency(deduction.limit) 
                                  : deduction.limit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* New Regime */}
                  <Card className={taxSaving < 0 ? "border-green-200" : ""}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">New Tax Regime</CardTitle>
                      {taxSaving < 0 && (
                        <Badge className="w-fit" variant="outline">Better Option</Badge>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">Tax Amount</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(newRegimeTax)}
                        </p>
                      </div>
                      
                      <Separator />
                      
                      <div>
                        <p className="font-medium mb-2">Key Features</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Lower tax rates</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Simplified structure</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Higher basic exemption</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <X className="h-4 w-4 text-red-500" />
                            <span>Limited deductions</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Comparison Result */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-lg font-medium text-blue-900">
                        {taxSaving > 0 
                          ? `You save ${formatCurrency(Math.abs(taxSaving))} with Old Regime`
                          : taxSaving < 0
                          ? `You save ${formatCurrency(Math.abs(taxSaving))} with New Regime`
                          : "Both regimes result in same tax"
                        }
                      </p>
                      <p className="text-sm text-blue-700 mt-1">
                        Based on standard deduction only. Actual savings may vary with investments.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Investment Comparison */}
          <TabsContent value="investments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Options Comparison</CardTitle>
                <CardDescription>
                  Compare popular tax-saving investment options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {investmentOptions.map((option) => (
                    <Card key={option.name} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{option.name}</CardTitle>
                          <Badge variant="outline">{option.returns}% Returns</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-600">Tax Benefit</p>
                            <p className="font-medium">{option.taxBenefit}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Lock-in</p>
                            <p className="font-medium">{option.liquidity}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Risk Level</p>
                            <p className="font-medium">{option.risk}</p>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <p className="font-medium text-green-700 mb-1">Pros</p>
                          <ul className="space-y-1">
                            {option.pros.map((pro, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-1">
                                <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <p className="font-medium text-red-700 mb-1">Cons</p>
                          <ul className="space-y-1">
                            {option.cons.map((con, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-1">
                                <X className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loan Comparison */}
          <TabsContent value="loans" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Loan Types Comparison</CardTitle>
                <CardDescription>
                  Compare different loan options and calculate EMI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="loanAmount">Loan Amount</Label>
                    <Input
                      id="loanAmount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(e.target.value)}
                      className="mt-1"
                      placeholder="Enter loan amount"
                    />
                  </div>
                  <div>
                    <Label htmlFor="loanTenure">Tenure (Years)</Label>
                    <Input
                      id="loanTenure"
                      type="number"
                      value={loanTenure}
                      onChange={(e) => setLoanTenure(e.target.value)}
                      className="mt-1"
                      placeholder="Enter tenure in years"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(loanTypes).map(([key, loan]) => {
                    const LoanIcon = loan.icon;
                    const emi = calculateEMI(Number(loanAmount), loan.avgRate, Number(loanTenure));
                    const totalAmount = emi * Number(loanTenure) * 12;
                    const totalInterest = totalAmount - Number(loanAmount);
                    
                    return (
                      <Card key={key} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <LoanIcon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{loan.name}</CardTitle>
                              <Badge variant="outline" className="mt-1">
                                {loan.avgRate}% Interest
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-sm text-gray-600">EMI Amount</p>
                              <p className="text-lg font-bold">{formatCurrency(emi)}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">Total Interest</p>
                              <p className="text-lg font-bold">{formatCurrency(totalInterest)}</p>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <p className="font-medium mb-2">Key Features</p>
                            <ul className="space-y-1">
                              {loan.features.map((feature, idx) => (
                                <li key={idx} className="text-sm flex items-start gap-1">
                                  <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            Max Tenure: {loan.maxTenure} years
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}