import { useState } from "react";
import { Calculator, Home, TrendingUp, PieChart, Info, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema, getFAQSchema } from "@/utils/seo-defaults";

export default function HomeLoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>("2500000");
  const [interestRate, setInterestRate] = useState<string>("8.5");
  const [tenure, setTenure] = useState<string>("20");
  const [tenureType, setTenureType] = useState<string>("years");
  const [propertyValue, setPropertyValue] = useState<string>("3000000");

  const calculateHomeLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const monthlyRate = (parseFloat(interestRate) || 0) / 12 / 100;
    const tenureMonths = tenureType === "years" 
      ? (parseFloat(tenure) || 0) * 12 
      : (parseFloat(tenure) || 0);
    
    if (principal <= 0 || monthlyRate <= 0 || tenureMonths <= 0) {
      return {
        emi: 0,
        totalPayment: 0,
        totalInterest: 0,
        ltvRatio: 0,
        monthlyIncome: 0,
        schedule: []
      };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;
    const ltvRatio = (principal / (parseFloat(propertyValue) || principal)) * 100;
    const monthlyIncome = emi / 0.4; // Assuming 40% of income goes to EMI

    // Generate amortization schedule (first 12 months)
    let balance = principal;
    const schedule = [];
    
    for (let month = 1; month <= Math.min(12, tenureMonths); month++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        month,
        emi: Math.round(emi),
        principal: Math.round(principalPayment),
        interest: Math.round(interestPayment),
        balance: Math.round(balance)
      });
    }

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      ltvRatio: Math.round(ltvRatio * 100) / 100,
      monthlyIncome: Math.round(monthlyIncome),
      schedule
    };
  };

  const result = calculateHomeLoan();

  const faqSchema = getFAQSchema([
    {
      question: "What is the current home loan interest rate in 2025?",
      answer: "Home loan interest rates in 2025 range from 8.5% to 10.5% depending on your credit score, loan amount, and lender. Top banks offer rates starting from 8.5% for salaried individuals."
    },
    {
      question: "How much home loan can I get on my salary?",
      answer: "Generally, banks approve home loans up to 60 times your monthly income, with EMI not exceeding 40-50% of your monthly salary. Eligibility also depends on age, existing loans, and credit score."
    },
    {
      question: "What is the maximum tenure for home loan?",
      answer: "Most banks offer home loans for a maximum tenure of 30 years or until the borrower reaches 65-70 years of age, whichever is earlier."
    }
  ]);

  return (
    <>
      <EnhancedSEO
        title="Home Loan EMI Calculator 2025 | Calculate Housing Loan EMI & Eligibility"
        description="Calculate home loan EMI with current interest rates 8.5-10.5%. Check eligibility, LTV ratio, tax benefits & compare 20+ banks. Plan your dream home purchase."
        keywords={[
          'home loan EMI calculator',
          'housing loan calculator',
          'home loan eligibility',
          'property loan EMI',
          'home loan interest rates 2025',
          'LTV ratio calculator',
          'home loan tax benefits',
          'mortgage calculator India'
        ]}
        url="https://myeca.in/calculators/home-loan"
        type="website"
        jsonLd={faqSchema}
      />
    <div className="calculator-page min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Home className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Home Loan EMI Calculator
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Calculate your home loan EMI, total interest, and eligibility. Compare different loan scenarios 
              and plan your home purchase with confidence.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Calculator className="w-5 h-5" />
                  Home Loan Calculator
                </CardTitle>
                <CardDescription>
                  Enter your loan details to calculate EMI and eligibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="property-value">Property Value (\u20B9)</Label>
                  <Input
                    id="property-value"
                    type="number"
                    value={propertyValue}
                    onChange={(e) => setPropertyValue(e.target.value)}
                    placeholder="3000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan-amount">Loan Amount (\u20B9)</Label>
                  <Input
                    id="loan-amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="2500000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interest-rate">Interest Rate (% p.a.)</Label>
                  <Input
                    id="interest-rate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="8.5"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenure">Loan Tenure</Label>
                    <Input
                      id="tenure"
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      placeholder="20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenure-type">Tenure Type</Label>
                    <Select value={tenureType} onValueChange={setTenureType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="years">Years</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Current home loan rates range from 8.25% to 9.5% for all major banks. 
                    Most banks approve loans up to 85% of property value.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* EMI Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="w-5 h-5" />
                  EMI Calculation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Monthly EMI</span>
                    <span className="text-2xl font-bold text-green-600">
                      \u20B9{result.emi.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Interest</div>
                      <div className="text-lg font-semibold text-blue-600">
                        \u20B9{result.totalInterest.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Payment</div>
                      <div className="text-lg font-semibold text-purple-600">
                        \u20B9{result.totalPayment.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eligibility Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <PieChart className="w-5 h-5" />
                  Eligibility Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">LTV Ratio</span>
                    <span className="text-lg font-semibold text-orange-600">
                      {result.ltvRatio}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Required Monthly Income</span>
                    <span className="text-lg font-semibold text-blue-600">
                      \u20B9{result.monthlyIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 p-3 bg-yellow-50 rounded-lg">
                    <strong>Note:</strong> Banks typically require EMI to be max 40% of monthly income. 
                    LTV ratio should be below 85% for better approval chances.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" className="flex-1">
                Compare Loans
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Amortization Schedule */}
        {result.schedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle>EMI Breakdown (First 12 Months)</CardTitle>
                <CardDescription>
                  See how your EMI is split between principal and interest payments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3 font-medium">Month</th>
                        <th className="text-left p-3 font-medium">EMI</th>
                        <th className="text-left p-3 font-medium">Principal</th>
                        <th className="text-left p-3 font-medium">Interest</th>
                        <th className="text-left p-3 font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row) => (
                        <tr key={row.month} className="border-b hover:bg-gray-50">
                          <td className="p-3">{row.month}</td>
                          <td className="p-3">\u20B9{row.emi.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-green-600">\u20B9{row.principal.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-red-600">\u20B9{row.interest.toLocaleString('en-IN')}</td>
                          <td className="p-3">\u20B9{row.balance.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
}