import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateTDS } from "@/lib/tax-calculations";
import { Receipt, AlertCircle, Coins, Percent, FileText, CheckCircle, Info, Calculator, IndianRupee, FileCheck, Calendar } from "lucide-react";
import { CalculatorExport } from "@/components/ui/calculator-export";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema } from "@/utils/seo-defaults";
import { CalculatorHeader } from "@/components/ui/calculator-header";
import { Switch } from "@/components/ui/switch";
import { assessmentYears } from "@/data/tds-rules";
import { CalculatorGuide } from "@/components/ui/calculator-guide";

export default function TDSCalculatorPage() {
  const [income, setIncome] = useState<number>(0);
  const [incomeType, setIncomeType] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [selectedYear, setSelectedYear] = useState<string>("2025-26");
  const [panProvided, setPanProvided] = useState<boolean>(true);
  const [isSeniorCitizen, setIsSeniorCitizen] = useState<boolean>(false);
  const [form15G15HSubmitted, setForm15G15HSubmitted] = useState<boolean>(false);

  const handleCalculate = () => {
    if (income > 0 && incomeType) {
      const tdsResult = calculateTDS({
        income,
        incomeType,
        assessmentYear: selectedYear,
        panProvided,
        isSeniorCitizen,
        form15G15HSubmitted,
      });
      setResult(tdsResult);
    }
  };

  const incomeTypes = [
    { value: 'salary', label: 'Salary (No TDS)', section: 'N/A' },
    { value: 'interest', label: 'Interest on Deposits', section: '194A' },
    { value: 'dividend', label: 'Dividend Income', section: '194' },
    { value: 'rent', label: 'Rent Income', section: '194I' },
    { value: 'commission', label: 'Commission', section: '194H' },
    { value: 'professional_fees', label: 'Professional Fees', section: '194J' },
    { value: 'contractor_payment', label: 'Contractor Payment', section: '194C' }
  ];

  const selectedIncomeType = incomeTypes.find(type => type.value === incomeType);

  const howToSchema = getHowToSchema({
    name: "How to Calculate TDS on Various Income",
    description: "Calculate Tax Deducted at Source in 3 simple steps",
    totalTime: "PT3M",
    steps: [
      {
        name: "Select income type",
        text: "Choose the type of income (Interest, Rent, Professional Fees, etc.)"
      },
      {
        name: "Enter income amount",
        text: "Input the total income amount on which TDS is applicable"
      },
      {
        name: "View TDS calculation",
        text: "See the TDS amount, applicable section, and net amount receivable"
      }
    ]
  });

  return (
    <>
      <EnhancedSEO
        title="TDS Calculator 2025 | Tax Deducted at Source Calculator"
        description={`Calculate TDS across income types. AY ${selectedYear} rates, sections & threshold limits.`}
        keywords={[
          'TDS calculator',
          'tax deducted at source',
          'TDS on salary',
          'TDS on rent',
          'TDS rates 2025',
          'section 194A',
          'section 194J',
          'TDS calculation online'
        ]}
        url="https://myeca.in/calculators/tds"
        type="website"
        jsonLd={howToSchema}
      />
    <TooltipProvider>
      <div className="calculator-page min-h-screen bg-gray-50 dark:bg-gray-900 py-4 px-4 transition-colors duration-200">
        <div className="max-w-6xl mx-auto">
          {/* Compact Header */}
          <CalculatorHeader
            icon={Receipt}
            title="TDS Calculator"
            subtitle={`Calculate TDS across income types and view applicable rates for AY ${selectedYear}.`}
            color="purple"
            align="center"
          />

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg transition-colors duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      Income Details
                    </CardTitle>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <Coins className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Enter your income details to calculate TDS
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <Label htmlFor="assessment-year" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Assessment Year
                      </Label>
                    </div>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select assessment year" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {assessmentYears.map((year) => (
                          <SelectItem key={year.value} value={year.value} className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700">
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="income" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Income Amount
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Enter the gross income amount before any deductions</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <Input
                        id="income"
                        type="number"
                        value={income || ''}
                        onChange={(e) => setIncome(Number(e.target.value))}
                        placeholder="0"
                        className="pl-10 text-lg bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="income-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Income Type
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select the type of income to apply correct TDS rate</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select value={incomeType} onValueChange={setIncomeType}>
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                        <SelectValue placeholder="Select income type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {incomeTypes.map((type) => (
                          <SelectItem 
                            key={type.value} 
                            value={type.value}
                            className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              <span>{type.label}</span>
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
                              >
                                {type.section}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">PAN Provided</p>
                        <p className="text-xs text-gray-500">Apply Section 206AA (20%) if off</p>
                      </div>
                      <Switch checked={panProvided} onCheckedChange={setPanProvided} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Senior Citizen</p>
                        <p className="text-xs text-gray-500">Interest threshold \u20B950,000</p>
                      </div>
                      <Switch checked={isSeniorCitizen} onCheckedChange={setIsSeniorCitizen} />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Form 15G/15H</p>
                        <p className="text-xs text-gray-500">No TDS on interest if eligible</p>
                      </div>
                      <Switch checked={form15G15HSubmitted} onCheckedChange={setForm15G15HSubmitted} />
                    </div>
                  </div>

                  <Button 
                    onClick={handleCalculate} 
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    disabled={!income || !incomeType}
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    Calculate TDS
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg transition-colors duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                      TDS Calculation Results
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {result && (
                        <CalculatorExport 
                          title="TDS Calculation"
                          data={{
                            "Income Type": selectedIncomeType?.label || incomeType,
                            "Gross Income": income,
                            "Assessment Year": selectedYear,
                            "TDS Rate": `${result.tdsRate}%`,
                            "Threshold": result.threshold,
                            "TDS Deducted": result.tdsAmount,
                            "Net Income": result.netIncome
                          }}
                        />
                      )}
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    Your TDS calculation breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {result ? (
                    <div className="space-y-6">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-xl border border-purple-200 dark:border-purple-700"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">TDS Rate</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{result.tdsRate}%</p>
                        </motion.div>
                        
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-xl border border-green-200 dark:border-green-700"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FileCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Threshold</span>
                          </div>
                          <p className="text-2xl font-bold text-green-900 dark:text-green-100">\u20B9{result.threshold.toLocaleString()}</p>
                        </motion.div>
                      </div>

                      <Separator className="dark:border-gray-700" />

                      {/* Calculation Breakdown */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                          <Calculator className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-400" />
                          Amount Breakdown
                        </h4>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2">
                            <span className="text-gray-600 dark:text-gray-400">Gross Income</span>
                            <span className="font-semibold text-gray-900 dark:text-white">\u20B9{income.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-600">
                            <span className="text-gray-600 dark:text-gray-400">TDS Deducted</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">-\u20B9{result.tdsAmount.toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center py-2 border-t-2 border-gray-300 dark:border-gray-600">
                            <span className="font-medium text-gray-900 dark:text-white">Net Income</span>
                            <span className="font-bold text-lg text-green-600 dark:text-green-400">\u20B9{result.netIncome.toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Status Alert */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className={`p-4 rounded-xl flex items-center gap-3 ${
                          result.applicable 
                            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700' 
                            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700'
                        }`}
                      >
                        {result.applicable ? (
                          <>
                            <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            <div>
                              <p className="font-medium text-orange-900 dark:text-orange-100">TDS is applicable</p>
                              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                                Income exceeds the threshold limit of \u20B9{result.threshold.toLocaleString()}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <div>
                              <p className="font-medium text-green-900 dark:text-green-100">No TDS applicable</p>
                              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                                Income is below the threshold limit of \u20B9{result.threshold.toLocaleString()}
                              </p>
                            </div>
                          </>
                        )}
                      </motion.div>

                      {/* Income Type Details */}
                      {selectedIncomeType && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                          className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl"
                        >
                          <h5 className="font-medium text-gray-900 dark:text-white mb-2">Income Type Details</h5>
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Section:</span> {selectedIncomeType.section}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Income Type:</span> {selectedIncomeType.label}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full inline-block mb-4">
                        <Receipt className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        Enter income details to calculate TDS
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                        Select income type and amount to see deduction
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* TDS Information Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* TDS Guidelines Card */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 transition-colors duration-200">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Info className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
                TDS Guidelines
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-start mb-2">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>TDS is deducted at source when payments exceed threshold limits</span>
                  </p>
                  <p className="flex items-start mb-2">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>Different income types have different TDS rates and thresholds</span>
                  </p>
                  <p className="flex items-start mb-2">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>PAN is mandatory for TDS deduction at correct rates</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    <span>Form 26AS shows all TDS deducted against your PAN</span>
                  </p>
                </div>
              </div>
            </Card>

            {/* Important Notes Card */}
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg p-6 transition-colors duration-200">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
                Important Notes
              </h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p className="flex items-start mb-2">
                    <span className="text-blue-500 mr-2">📌</span>
                    <span>No TDS on salary for individuals earning below \u20B92.5 lakh</span>
                  </p>
                  <p className="flex items-start mb-2">
                    <span className="text-blue-500 mr-2">📌</span>
                    <span>Higher TDS rate (20%) if PAN not provided</span>
                  </p>
                  <p className="flex items-start mb-2">
                    <span className="text-blue-500 mr-2">📌</span>
                    <span>TDS credit can be claimed while filing ITR</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-blue-500 mr-2">📌</span>
                    <span>Form 15G/15H can be submitted to avoid TDS</span>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* TDS Rates Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-8"
          >
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg transition-colors duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
-                    TDS Rates & Thresholds (FY 2024-25)
+                    TDS Rates & Thresholds (AY {selectedYear})
                  </CardTitle>
                  <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    Current Rates
                  </Badge>
                </div>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Current TDS rates and applicability thresholds as per Income Tax Act
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {incomeTypes.map((type) => (
                    <motion.div
                      key={type.value}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md dark:hover:shadow-gray-700 transition-all duration-300 bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{type.label}</h3>
                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-gray-300">
                          {type.section}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Rate:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {type.value === 'salary' ? '0%' : 
                             type.value === 'commission' ? '5%' :
                             type.value === 'contractor_payment' ? '1%' : '10%'}
                          </span>
                        </p>
                        <p className="text-sm flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Threshold:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            \u20B9{type.value === 'salary' ? '0' :
                              type.value === 'dividend' ? '5,000' :
                              type.value === 'commission' ? '15,000' :
                              type.value === 'professional_fees' ? '30,000' :
                              type.value === 'contractor_payment' ? '30,000' :
                              type.value === 'rent' ? '2,40,000' : '40,000'}
                          </span>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </TooltipProvider>
    </>
  );
}