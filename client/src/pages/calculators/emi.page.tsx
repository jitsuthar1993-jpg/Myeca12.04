import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { CreditCard, Calculator, TrendingDown, Percent } from "lucide-react";
import { CalculatorExport } from "@/components/ui/calculator-export";
import { calculateEMI } from "@/lib/tax-calculations";
import { EMIInputs } from "@/types/calculator";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema } from "@/utils/seo-defaults";
import { CalculatorHeader } from "@/components/ui/calculator-header";

export default function EMICalculator() {
  const [inputs, setInputs] = useState<EMIInputs>({
    principal: 1000000,
    rate: 8.5,
    tenure: 20
  });

  const result = calculateEMI(inputs.principal, inputs.rate, inputs.tenure);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const howToSchema = getHowToSchema({
    name: "How to Calculate EMI for Your Loan",
    description: "Calculate your monthly EMI in 3 simple steps",
    totalTime: "PT2M",
    steps: [
      {
        name: "Enter loan amount",
        text: "Input the principal amount you want to borrow"
      },
      {
        name: "Enter interest rate",
        text: "Input the annual interest rate offered by your lender"
      },
      {
        name: "Select loan tenure",
        text: "Choose the repayment period in years"
      }
    ]
  });

  return (
    <>
      <EnhancedSEO
        title="EMI Calculator 2025 | Home Loan, Car Loan & Personal Loan EMI Calculator"
        description="Calculate EMI for home loan, car loan, personal loan & more. Get detailed amortization schedule, total interest & monthly payment breakdown."
        keywords={[
          'EMI calculator',
          'home loan EMI calculator',
          'car loan EMI calculator',
          'personal loan EMI',
          'loan calculator',
          'monthly EMI calculator',
          'EMI calculation formula',
          'loan repayment calculator'
        ]}
        url="https://myeca.in/calculators/emi"
        type="website"
        jsonLd={howToSchema}
      />
    <div className="calculator-page min-h-screen bg-gray-50 py-4 mobile-safe-bottom">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <CalculatorHeader
          title="EMI Calculator"
          subtitle="Calculate your Equated Monthly Installment (EMI) for home, car, and personal loans. Plan finances with accurate EMI calculations."
          color="purple"
          align="center"
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="bg-white rounded-2xl shadow-lg p-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Loan Details</h3>
              
              <div className="space-y-8">
                <div>
                  <Label htmlFor="principal" className="text-sm font-medium text-gray-700 mb-4 block">
                    Loan Amount: {formatCurrency(inputs.principal)}
                  </Label>
                  <Slider
colorTheme="purple"                     value={[inputs.principal]}
                    onValueChange={(value) => setInputs(prev => ({ ...prev, principal: value[0] }))}
                    max={10000000}
                    min={100000}
                    step={50000}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>\u20B91 Lakh</span>
                    <span>\u20B91 Crore</span>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="rate" className="text-sm font-medium text-gray-700 mb-4 block">
                    Interest Rate: {inputs.rate}% per annum
                  </Label>
                  <Slider
colorTheme="purple"                     value={[inputs.rate]}
                    onValueChange={(value) => setInputs(prev => ({ ...prev, rate: value[0] }))}
                    max={20}
                    min={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1%</span>
                    <span>20%</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tenure" className="text-sm font-medium text-gray-700 mb-4 block">
                    Loan Tenure: {inputs.tenure} years
                  </Label>
                  <Slider
colorTheme="purple"                     value={[inputs.tenure]}
                    onValueChange={(value) => setInputs(prev => ({ ...prev, tenure: value[0] }))}
                    max={30}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 year</span>
                    <span>30 years</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setInputs(prev => ({ ...prev, principal: 2500000, rate: 8.5, tenure: 20 }))}
                    className="text-sm"
                  >
                    Home Loan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInputs(prev => ({ ...prev, principal: 800000, rate: 9.5, tenure: 7 }))}
                    className="text-sm"
                  >
                    Car Loan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInputs(prev => ({ ...prev, principal: 500000, rate: 12, tenure: 5 }))}
                    className="text-sm"
                  >
                    Personal Loan
                  </Button>
                </div>

                <div className="pt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Actual interest rates may vary based on your credit score, 
                    income, and lender policies. This is an indicative calculation.
                  </p>
                </div>
              </div>
            </motion.div>
          </Card>

          {/* Results */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {/* Export Buttons */}
            <div className="flex justify-end mb-4">
              <CalculatorExport 
                title="EMI Calculation"
                data={{
                  "Loan Amount": inputs.principal,
                  "Interest Rate": `${inputs.rate}% p.a.`,
                  "Loan Tenure": `${inputs.tenure} years`,
                  "Monthly EMI": result.emi,
                  "Total Interest": result.totalInterest,
                  "Total Payment": result.totalPayment
                }}
              />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Monthly EMI</p>
                    <p className="text-3xl font-bold">{formatCurrency(result.emi)}</p>
                  </div>
                  <CreditCard className="w-8 h-8 text-blue-100" />
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Total Interest</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.totalInterest)}</p>
                  </div>
                  <Percent className="w-8 h-8 text-red-100" />
                </div>
              </Card>

              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Total Amount Payable</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.totalPayment)}</p>
                  </div>
                  <Calculator className="w-8 h-8 text-purple-100" />
                </div>
              </Card>
            </div>

            {/* Detailed Breakdown */}
            <Card className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Loan Breakdown</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Principal Amount:</span>
                  <span className="font-semibold">{formatCurrency(inputs.principal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Interest Rate:</span>
                  <span className="font-semibold">{inputs.rate}% per annum</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Loan Tenure:</span>
                  <span className="font-semibold">{inputs.tenure} years ({inputs.tenure * 12} months)</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly EMI:</span>
                    <span className="font-semibold text-blue-600">{formatCurrency(result.emi)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Interest:</span>
                    <span className="font-semibold text-red-600">{formatCurrency(result.totalInterest)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-gray-900">Total Payment:</span>
                    <span className="text-purple-600">{formatCurrency(result.totalPayment)}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Interest vs Principal Ratio */}
            <Card className="bg-white rounded-xl p-6 shadow-lg">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Payment Composition</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Principal ({((inputs.principal / result.totalPayment) * 100).toFixed(1)}%)</span>
                    <span>Interest ({((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-500 h-4 rounded-l-full"
                      style={{ width: `${(inputs.principal / result.totalPayment) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Out of your total payment of {formatCurrency(result.totalPayment)}, 
                  you'll pay {formatCurrency(result.totalInterest)} as interest.
                </p>
              </div>
            </Card>

            {/* Loan Tips */}
            <Card className="bg-yellow-50 border border-yellow-200 p-6">
              <h5 className="font-semibold text-yellow-900 mb-3">💡 Smart Loan Tips</h5>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• Make a larger down payment to reduce loan amount</li>
                <li>• Compare interest rates from multiple lenders</li>
                <li>• Consider shorter tenure to save on total interest</li>
                <li>• Maintain good credit score for better rates</li>
                <li>• Make prepayments when possible to reduce interest burden</li>
                <li>• Check for tax benefits on home loan interest payments</li>
              </ul>
            </Card>
          </motion.div>
        </div>

        {/* EMI vs Income Guidance */}
        <motion.div
          className="mt-8 bg-white rounded-xl p-6 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">EMI Affordability Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Ideal EMI Ratio</h4>
              <p className="text-2xl font-bold text-green-600 mb-2">≤ 30%</p>
              <p className="text-green-700">of your monthly income</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Manageable EMI Ratio</h4>
              <p className="text-2xl font-bold text-yellow-600 mb-2">30-40%</p>
              <p className="text-yellow-700">of your monthly income</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">High Risk EMI Ratio</h4>
              <p className="text-2xl font-bold text-red-600 mb-2">&gt; 40%</p>
              <p className="text-red-700">of your monthly income</p>
            </div>
          </div>
          <p className="text-gray-600 text-center mt-4">
            Your current EMI of {formatCurrency(result.emi)} should ideally not exceed 30-40% of your monthly income.
          </p>
        </motion.div>
      </div>
    </div>
    </>
  );
}
