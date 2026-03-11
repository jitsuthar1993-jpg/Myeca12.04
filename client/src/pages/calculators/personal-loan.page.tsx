import { useState } from "react";
import { Calculator, Wallet, TrendingUp, AlertTriangle, Info, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema, getFAQSchema } from "@/utils/seo-defaults";

export default function PersonalLoanCalculatorPage() {
  const [loanAmount, setLoanAmount] = useState<string>("500000");
  const [interestRate, setInterestRate] = useState<string>("14.5");
  const [tenure, setTenure] = useState<string>("3");
  const [tenureType, setTenureType] = useState<string>("years");
  const [loanPurpose, setLoanPurpose] = useState<string>("general");
  const [monthlyIncome, setMonthlyIncome] = useState<string>("75000");

  const calculatePersonalLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const monthlyRate = (parseFloat(interestRate) || 0) / 12 / 100;
    const tenureMonths = tenureType === "years" 
      ? (parseFloat(tenure) || 0) * 12 
      : (parseFloat(tenure) || 0);
    const income = parseFloat(monthlyIncome) || 0;
    
    if (principal <= 0 || monthlyRate <= 0 || tenureMonths <= 0) {
      return {
        emi: 0,
        totalPayment: 0,
        totalInterest: 0,
        interestPercent: 0,
        eligibilityAmount: 0,
        emiToIncomeRatio: 0,
        schedule: []
      };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;
    const interestPercent = (totalInterest / principal) * 100;
    const eligibilityAmount = income * 0.5 * tenureMonths; // 50% of income eligibility
    const emiToIncomeRatio = income > 0 ? (emi / income) * 100 : 0;

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
      interestPercent: Math.round(interestPercent * 100) / 100,
      eligibilityAmount: Math.round(eligibilityAmount),
      emiToIncomeRatio: Math.round(emiToIncomeRatio * 100) / 100,
      schedule
    };
  };

  const result = calculatePersonalLoan();

  const getInterestRateRange = () => {
    switch (loanPurpose) {
      case "medical":
        return "10.5% - 16.0%";
      case "education":
        return "12.0% - 18.0%";
      case "wedding":
        return "11.0% - 17.0%";
      case "travel":
        return "13.0% - 19.0%";
      case "debt_consolidation":
        return "11.5% - 17.5%";
      default:
        return "10.5% - 24.0%";
    }
  };

  const getEligibilityStatus = () => {
    if (result.emiToIncomeRatio > 50) {
      return { status: "high_risk", color: "red", message: "EMI exceeds 50% of income - high risk" };
    } else if (result.emiToIncomeRatio > 30) {
      return { status: "moderate_risk", color: "orange", message: "EMI is 30-50% of income - moderate risk" };
    } else {
      return { status: "low_risk", color: "green", message: "EMI is below 30% of income - low risk" };
    }
  };

  const eligibilityStatus = getEligibilityStatus();

  const faqSchema = getFAQSchema([
    {
      question: "What is the interest rate for personal loans in 2025?",
      answer: "Personal loan interest rates in 2025 range from 10.5% to 24% per annum, depending on your credit score, income, and lender. Banks typically offer lower rates than NBFCs."
    },
    {
      question: "How much personal loan can I get?",
      answer: "Personal loan eligibility is typically 10-20 times your monthly income, with maximum amounts ranging from \u20B920-40 lakhs depending on the lender and your repayment capacity."
    },
    {
      question: "Is it safe to take a personal loan?",
      answer: "Personal loans are safe if EMI is below 30% of your monthly income. Always compare rates, read terms carefully, and borrow only what you need to avoid debt traps."
    }
  ]);

  return (
    <>
      <EnhancedSEO
        title="Personal Loan EMI Calculator 2025 | Calculate Interest & Eligibility"
        description="Calculate personal loan EMI with interest rates 10.5-24%. Check eligibility, EMI to income ratio & risk assessment. Compare top banks & NBFCs instantly."
        keywords={[
          'personal loan EMI calculator',
          'personal loan calculator',
          'personal loan interest rates',
          'unsecured loan calculator',
          'personal loan eligibility',
          'EMI to income ratio',
          'personal finance calculator',
          'instant loan calculator'
        ]}
        url="https://myeca.in/calculators/personal-loan"
        type="website"
        jsonLd={faqSchema}
      />
    <div className="calculator-page min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Personal Loan EMI Calculator
            </h1>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto">
              Calculate personal loan EMI for various purposes. Compare offers and find the most 
              affordable financing option for your personal needs.
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
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Calculator className="w-5 h-5" />
                  Personal Loan Calculator
                </CardTitle>
                <CardDescription>
                  Enter your loan details to calculate EMI and eligibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="loan-purpose">Loan Purpose</Label>
                  <Select value={loanPurpose} onValueChange={setLoanPurpose}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Purpose</SelectItem>
                      <SelectItem value="medical">Medical Emergency</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="travel">Travel</SelectItem>
                      <SelectItem value="debt_consolidation">Debt Consolidation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan-amount">Loan Amount (\u20B9)</Label>
                  <Input
                    id="loan-amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="500000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthly-income">Monthly Income (\u20B9)</Label>
                  <Input
                    id="monthly-income"
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    placeholder="75000"
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
                    placeholder="14.5"
                  />
                  <p className="text-sm text-gray-600">
                    Current rates for {loanPurpose}: {getInterestRateRange()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenure">Loan Tenure</Label>
                    <Input
                      id="tenure"
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      placeholder="3"
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
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Personal loans are unsecured with higher interest rates (10.5%-24%). 
                    Keep EMI below 30% of monthly income for better financial health.
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
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Interest</div>
                      <div className="text-lg font-semibold text-red-600">
                        \u20B9{result.totalInterest.toLocaleString('en-IN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        ({result.interestPercent}% of loan)
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
                  <AlertTriangle className="w-5 h-5" />
                  Eligibility & Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">EMI to Income Ratio</span>
                    <span className={`text-lg font-semibold text-${eligibilityStatus.color}-600`}>
                      {result.emiToIncomeRatio}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Eligibility Amount</span>
                    <span className="text-lg font-semibold text-blue-600">
                      \u20B9{result.eligibilityAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={`p-3 bg-${eligibilityStatus.color}-50 rounded-lg`}>
                    <div className={`text-sm text-${eligibilityStatus.color}-700 font-medium`}>
                      {eligibilityStatus.message}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                    <strong>Tip:</strong> Personal loans have higher interest rates due to no collateral. 
                    Consider prepayment to reduce total interest cost.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" className="flex-1">
                Compare Lenders
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
                  Monthly payment breakdown showing principal and interest components
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

        {/* Personal Loan Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Personal Loan Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700">✓ Good Practices</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Keep EMI below 30% of monthly income</li>
                    <li>• Compare rates from 3-4 lenders</li>
                    <li>• Check CIBIL score before applying</li>
                    <li>• Consider prepayment for interest savings</li>
                    <li>• Read loan terms carefully</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-700">✗ Avoid These</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Taking loan for luxury purchases</li>
                    <li>• Multiple simultaneous loan applications</li>
                    <li>• Ignoring processing fees and charges</li>
                    <li>• Borrowing without emergency fund</li>
                    <li>• Choosing longest tenure always</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
    </>
  );
}