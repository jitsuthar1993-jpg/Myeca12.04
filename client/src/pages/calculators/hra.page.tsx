import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { calculateHRA } from "@/lib/tax-calculations";
import { HRAInputs } from "@/types/calculator";
import { Home, IndianRupee, Building2, Info, Calculator, MapPin, Shield, FileText } from "lucide-react";
import { CalculatorExport } from "@/components/ui/calculator-export";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema, getFAQSchema } from "@/utils/seo-defaults";
import { CalculatorHeader } from "@/components/ui/calculator-header";

export default function HRACalculator() {
  const [inputs, setInputs] = useState<HRAInputs>({
    salary: 0,
    hra: 0,
    rent: 0,
    city: 'metro'
  });

  const [result, setResult] = useState<{
    exemption: number;
    taxableHRA: number;
    savings: number;
    breakdown: {
      actualHRA: number;
      rentMinus10Percent: number;
      cityAllowance: number;
      minimumValue: number;
    };
  } | null>(null);

  const handleCalculate = () => {
    if (inputs.salary > 0 && inputs.hra > 0 && inputs.rent > 0) {
      const hraResult = calculateHRA(inputs.salary, inputs.hra, inputs.rent, inputs.city);
      setResult(hraResult);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const howToSchema = getHowToSchema({
    name: "How to Calculate HRA Exemption",
    description: "Calculate your House Rent Allowance exemption in 3 simple steps",
    totalTime: "PT3M",
    steps: [
      {
        name: "Enter your basic salary",
        text: "Input your monthly basic salary amount"
      },
      {
        name: "Enter HRA received",
        text: "Input the HRA component from your salary"
      },
      {
        name: "Enter actual rent paid",
        text: "Input the actual monthly rent you pay"
      },
      {
        name: "Select city type",
        text: "Choose Metro (50%) or Non-Metro (40%) city"
      }
    ]
  });

  return (
    <>
      <EnhancedSEO
        title="HRA Calculator 2025 | House Rent Allowance Tax Exemption Calculator"
        description="Free HRA calculator to calculate tax exemption on house rent allowance. Calculate HRA exemption u/s 10(13A) for metro & non-metro cities. Save tax on rent paid."
        keywords={[
          'HRA calculator',
          'house rent allowance calculator',
          'HRA exemption calculator',
          'HRA tax benefit',
          'rent tax exemption',
          'HRA calculation formula',
          'section 10(13A)',
          'metro non-metro HRA'
        ]}
        url="https://myeca.in/calculators/hra"
        type="website"
        jsonLd={howToSchema}
      />
    <TooltipProvider>
      <div className="calculator-page min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Compact Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-semibold mb-4 border border-green-100">
              <Home className="w-4 h-4 mr-2" />
              HRA Exemption Calculator
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              HRA Calculator
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Calculate your House Rent Allowance (HRA) exemption and maximize tax savings for FY 2024-25.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="shadow-sm border-gray-200">
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">HRA Details</h3>
                    <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                      <Building2 className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="salary" className="text-sm font-medium text-gray-700">
                        Annual Basic Salary
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Your basic salary component excluding allowances</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="salary"
                        type="number"
                        placeholder="0"
                        value={inputs.salary || ''}
                        onChange={(e) => setInputs(prev => ({ ...prev, salary: Number(e.target.value) }))}
                        className="pl-10 h-12 border-gray-300 focus:border-green-500 text-lg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="hra" className="text-sm font-medium text-gray-700">
                        Annual HRA Received
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>House Rent Allowance received from employer</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="hra"
                        type="number"
                        placeholder="0"
                        value={inputs.hra || ''}
                        onChange={(e) => setInputs(prev => ({ ...prev, hra: Number(e.target.value) }))}
                        className="pl-10 h-12 border-gray-300 focus:border-green-500 text-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="rent" className="text-sm font-medium text-gray-700">
                        Annual Rent Paid
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total rent paid to landlord in a year</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="rent"
                        type="number"
                        placeholder="0"
                        value={inputs.rent || ''}
                        onChange={(e) => setInputs(prev => ({ ...prev, rent: Number(e.target.value) }))}
                        className="pl-10 h-12 border-gray-300 focus:border-green-500 text-lg"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <Label className="text-sm font-medium text-gray-700">
                        City Type
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Metro: Mumbai, Delhi, Kolkata, Chennai, Bengaluru, Hyderabad</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <RadioGroup
                      value={inputs.city}
                      onValueChange={(value: 'metro' | 'non-metro') => setInputs(prev => ({ ...prev, city: value }))}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div
                        onClick={() => setInputs(prev => ({ ...prev, city: 'metro' }))}
                        className={`relative flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          inputs.city === 'metro'
                            ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <RadioGroupItem value="metro" id="metro" className="text-green-600 border-gray-400" />
                        <Label htmlFor="metro" className="cursor-pointer flex-1">
                          <span className="font-semibold text-gray-900 block">Metro City</span>
                          <span className="text-xs text-gray-500 block mt-0.5">50% of basic</span>
                        </Label>
                        <MapPin className={`w-5 h-5 ${inputs.city === 'metro' ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                      <div
                        onClick={() => setInputs(prev => ({ ...prev, city: 'non-metro' }))}
                        className={`relative flex items-center space-x-3 p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                          inputs.city === 'non-metro'
                            ? 'border-green-500 bg-green-50/50 ring-1 ring-green-500'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <RadioGroupItem value="non-metro" id="non-metro" className="text-green-600 border-gray-400" />
                        <Label htmlFor="non-metro" className="cursor-pointer flex-1">
                          <span className="font-semibold text-gray-900 block">Non-Metro</span>
                          <span className="text-xs text-gray-500 block mt-0.5">40% of basic</span>
                        </Label>
                        <MapPin className={`w-5 h-5 ${inputs.city === 'non-metro' ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={handleCalculate}
                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 rounded-xl font-semibold text-lg shadow-lg shadow-green-200 transition-all hover:shadow-xl"
                    disabled={inputs.salary <= 0 || inputs.hra <= 0 || inputs.rent <= 0}
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Calculate HRA Exemption
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="h-full bg-white border-green-100 shadow-lg border">
                <div className="p-6 border-b border-green-50 bg-gradient-to-r from-green-50/50 to-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      Exemption Result
                    </h4>
                    {result !== null && (
                      <CalculatorExport 
                        title="HRA Exemption Calculation"
                        data={{
                          "Annual Basic Salary": inputs.salary,
                          "Annual HRA Received": inputs.hra,
                          "Annual Rent Paid": inputs.rent,
                          "City Type": inputs.city === 'metro' ? 'Metro City' : 'Non-Metro City',
                          "HRA Exemption": result.exemption,
                          "Taxable HRA": result.taxableHRA,
                          "Tax Savings (30% bracket)": result.exemption * 0.3
                        }}
                      />
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                {result !== null ? (
                  <div className="space-y-6">
                    {/* Main Result Card */}
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-center p-6 bg-green-50 rounded-xl border border-green-200"
                    >
                      <p className="text-sm text-green-700 mb-1 font-semibold uppercase tracking-wide">
                        Maximum HRA Exemption
                      </p>
                      <div className="text-4xl font-bold text-green-800 mb-2">
                        {formatCurrency(result.exemption)}
                      </div>
                      <p className="text-green-600 text-sm font-medium">
                        Tax-free amount annually
                      </p>
                    </motion.div>
                    
                    {/* Calculation Breakdown */}
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-900 flex items-center text-sm uppercase tracking-wide">
                        <Calculator className="w-4 h-4 mr-2 text-gray-500" />
                        Calculation Breakdown
                      </h5>
                      
                      <div className="space-y-3 bg-gray-50 rounded-xl p-4 border border-gray-100">
                        {/* HRA Details */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                          className="space-y-3"
                        >
                          <div className="flex justify-between items-center py-1">
                            <span className="text-sm text-gray-600">1. Actual HRA Received</span>
                            <span className="font-semibold text-gray-900">{formatCurrency(inputs.hra)}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-t border-gray-200">
                            <div>
                              <span className="text-sm text-gray-600 block">2. Rent Paid - 10% of Basic</span>
                              <span className="text-xs text-gray-400">
                                {formatCurrency(inputs.rent)} - {formatCurrency(inputs.salary * 0.1)}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(Math.max(0, inputs.rent - (inputs.salary * 0.1)))}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-t border-gray-200">
                            <div>
                              <span className="text-sm text-gray-600 block">
                                3. {inputs.city === 'metro' ? '50%' : '40%'} of Basic Salary
                              </span>
                              <span className="text-xs text-gray-400">
                                {inputs.city === 'metro' ? 'Metro City Rate' : 'Non-Metro City Rate'}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(inputs.salary * (inputs.city === 'metro' ? 0.5 : 0.4))}
                            </span>
                          </div>
                        </motion.div>
                        
                        {/* Final Result */}
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="border-t border-green-200 pt-3 mt-3"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-900">
                              Exempted Amount (Minimum of 3)
                            </span>
                            <span className="font-bold text-lg text-green-600">
                              {formatCurrency(result.exemption)}
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    </div>

                    {/* Tax Savings Info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="bg-blue-50 p-6 rounded-xl border border-blue-100"
                    >
                      <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                        <IndianRupee className="w-5 h-5 mr-2" />
                        Tax Savings Potential
                      </h5>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">In 30% Tax Bracket:</span>
                          <span className="font-bold text-blue-900">
                            {formatCurrency(result.exemption * 0.3)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-blue-700">In 20% Tax Bracket:</span>
                          <span className="font-bold text-blue-900">
                            {formatCurrency(result.exemption * 0.2)}
                          </span>
                        </div>
                        <p className="text-xs text-blue-600 mt-3 opacity-80">
                          *Actual savings depend on your total taxable income and applicable tax slab
                        </p>
                      </div>
                    </motion.div>
                  </div>
                ) : (
                  <div className="text-center py-16 h-full flex flex-col justify-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                      <Home className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Enter HRA Details
                    </h3>
                    <p className="text-gray-500 text-center max-w-xs mx-auto">
                      Enter your salary and rent details to calculate your HRA tax exemption
                    </p>
                  </div>
                )}
                </div>
              </Card>
            </motion.div>
          </div>

          {/* HRA Tips and Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* HRA Rules Card */}
            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-green-600" />
                  HRA Exemption Rules
                </h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-3">Eligibility Criteria:</h4>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 font-bold">✓</span>
                        <span>Must be paying rent for accommodation</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 font-bold">✓</span>
                        <span>Should be receiving HRA from employer</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 font-bold">✓</span>
                        <span>Cannot own property in the same city</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-green-500 mr-2 font-bold">✓</span>
                        <span>Rent receipts needed for rent &gt; \u20B91 lakh/year</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </Card>

            {/* Required Documents Card */}
            <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Required Documents
                </h3>
                <div className="space-y-4">
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs mr-3 shrink-0">1</div>
                      <span>Rent agreement copy (valid for the financial year)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs mr-3 shrink-0">2</div>
                      <span>Rent receipts (monthly/quarterly)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs mr-3 shrink-0">3</div>
                      <span>Landlord's PAN (mandatory if annual rent &gt; \u20B91 lakh)</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs mr-3 shrink-0">4</div>
                      <span>Form 12BB declaration to employer</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
    </>
  );
}
