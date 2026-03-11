import { useState } from "react";
import { Calculator, GraduationCap, TrendingUp, Book, Info, Download, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema } from "@/utils/seo-defaults";

export default function EducationLoanCalculatorPage() {
  const [courseType, setCourseType] = useState<string>("domestic");
  const [courseFee, setCourseFee] = useState<string>("500000");
  const [interestRate, setInterestRate] = useState<string>("8.5");
  const [tenure, setTenure] = useState<string>("10");
  const [moratoriumPeriod, setMoratoriumPeriod] = useState<string>("4");
  const [hasMoratorium, setHasMoratorium] = useState<boolean>(true);
  const [loanAmount, setLoanAmount] = useState<string>("400000");

  const calculateEducationLoan = () => {
    const principal = parseFloat(loanAmount) || 0;
    const monthlyRate = (parseFloat(interestRate) || 0) / 12 / 100;
    const tenureMonths = (parseFloat(tenure) || 0) * 12;
    const moratoriumMonths = hasMoratorium ? (parseFloat(moratoriumPeriod) || 0) * 12 : 0;
    
    if (principal <= 0 || monthlyRate <= 0 || tenureMonths <= 0) {
      return {
        emi: 0,
        totalPayment: 0,
        totalInterest: 0,
        moratoriumInterest: 0,
        section80E: 0,
        effectiveCost: 0,
        schedule: []
      };
    }

    // Calculate interest during moratorium period
    let principalWithMoratoriumInterest = principal;
    if (hasMoratorium && moratoriumMonths > 0) {
      // Simple interest during moratorium (common practice)
      principalWithMoratoriumInterest = principal * Math.pow(1 + monthlyRate, moratoriumMonths);
    }

    const moratoriumInterest = principalWithMoratoriumInterest - principal;

    // Calculate EMI after moratorium
    const emi = (principalWithMoratoriumInterest * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;
    
    // Section 80E deduction (full interest amount)
    const section80E = totalInterest; // No upper limit for education loan interest deduction
    const taxSavings = section80E * 0.3; // Assuming 30% tax bracket
    const effectiveCost = totalInterest - taxSavings;

    // Generate payment schedule (first 12 payments after moratorium)
    let balance = principalWithMoratoriumInterest;
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
        balance: Math.round(balance),
        taxBenefit: Math.round(interestPayment * 0.3) // 30% tax benefit
      });
    }

    return {
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      moratoriumInterest: Math.round(moratoriumInterest),
      section80E: Math.round(section80E),
      taxSavings: Math.round(taxSavings),
      effectiveCost: Math.round(effectiveCost),
      schedule
    };
  };

  const result = calculateEducationLoan();

  const getInterestRateRange = () => {
    switch (courseType) {
      case "domestic":
        return "7.5% - 15.0%";
      case "international":
        return "10.0% - 15.5%";
      case "professional":
        return "8.0% - 14.0%";
      default:
        return "7.5% - 15.5%";
    }
  };

  const getLoanLimitInfo = () => {
    switch (courseType) {
      case "domestic":
        return "Up to \u20B910 lakhs (no collateral), \u20B920 lakhs+ (with collateral)";
      case "international":
        return "Up to \u20B91.5 crores with collateral required";
      case "professional":
        return "Up to \u20B920 lakhs (medical/engineering courses)";
      default:
        return "Varies by course and institution";
    }
  };

  const howToSchema = getHowToSchema({
    name: "How to Calculate Education Loan EMI with Moratorium",
    description: "Calculate education loan EMI including moratorium period benefits",
    totalTime: "PT3M",
    steps: [
      {
        name: "Enter course details",
        text: "Select course type (domestic/international) and total course fee"
      },
      {
        name: "Set moratorium period",
        text: "Enable moratorium period (course duration + 6 months grace period)"
      },
      {
        name: "Calculate with tax benefits",
        text: "View EMI, total interest, and Section 80E tax benefits calculation"
      }
    ]
  });

  return (
    <>
      <EnhancedSEO
        title="Education Loan EMI Calculator 2025 | Study Loan Calculator with 80E Benefits"
        description="Calculate education loan EMI with moratorium period & Section 80E tax benefits. For domestic (\u20B910L) & abroad studies (\u20B91.5Cr). Interest rates 8.5-11%."
        keywords={[
          'education loan calculator',
          'study loan EMI calculator',
          'student loan calculator',
          'moratorium period calculator',
          'section 80E tax benefits',
          'abroad education loan',
          'education loan interest rates',
          'student loan eligibility'
        ]}
        url="https://myeca.in/calculators/education-loan"
        type="website"
        jsonLd={howToSchema}
      />
    <div className="calculator-page min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Education Loan EMI Calculator
            </h1>
            <p className="text-xl text-teal-100 max-w-3xl mx-auto">
              Calculate education loan EMI with moratorium period and Section 80E tax benefits. 
              Plan your higher education financing with complete cost analysis.
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
                <CardTitle className="flex items-center gap-2 text-teal-900">
                  <Calculator className="w-5 h-5" />
                  Education Loan Calculator
                </CardTitle>
                <CardDescription>
                  Calculate EMI with moratorium period and tax benefits
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="course-type">Course Type</Label>
                  <Select value={courseType} onValueChange={setCourseType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="domestic">Domestic Course</SelectItem>
                      <SelectItem value="international">International Course</SelectItem>
                      <SelectItem value="professional">Professional Course</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-600">
                    Loan limit: {getLoanLimitInfo()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="course-fee">Total Course Fee ({"\u20B9"})</Label>
                  <Input
                    id="course-fee"
                    type="number"
                    value={courseFee}
                    onChange={(e) => setCourseFee(e.target.value)}
                    placeholder="500000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="loan-amount">Loan Amount Required ({"\u20B9"})</Label>
                  <Input
                    id="loan-amount"
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    placeholder="400000"
                  />
                  <p className="text-sm text-gray-600">
                    Usually 80-85% of course fee (remaining from own funds)
                  </p>
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
                  <p className="text-sm text-gray-600">
                    Current rates: {getInterestRateRange()}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tenure">Repayment Tenure (Years)</Label>
                  <Input
                    id="tenure"
                    type="number"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    placeholder="10"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="moratorium">Moratorium Period</Label>
                      <p className="text-sm text-gray-600">Study period + 6 months grace</p>
                    </div>
                    <Switch
                      id="moratorium"
                      checked={hasMoratorium}
                      onCheckedChange={setHasMoratorium}
                    />
                  </div>
                  
                  {hasMoratorium && (
                    <div className="space-y-2">
                      <Label htmlFor="moratorium-period">Moratorium Period (Years)</Label>
                      <Input
                        id="moratorium-period"
                        type="number"
                        value={moratoriumPeriod}
                        onChange={(e) => setMoratoriumPeriod(e.target.value)}
                        placeholder="4"
                      />
                    </div>
                  )}
                </div>

                <Alert>
                  <Book className="h-4 w-4" />
                  <AlertDescription>
                    Education loans offer Section 80E tax benefits with no upper limit. 
                    Interest during study period is typically added to principal.
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
                  {hasMoratorium && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <div className="text-sm">
                        <span className="text-blue-700 font-medium">Moratorium Period: </span>
                        <span className="text-gray-700">{moratoriumPeriod} years (no EMI)</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                    <span className="text-gray-700">Monthly EMI (After Study)</span>
                    <span className="text-2xl font-bold text-green-600">
                      {"\u20B9"}{result.emi.toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Interest</div>
                      <div className="text-lg font-semibold text-orange-600">
                        {"\u20B9"}{result.totalInterest.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Payment</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {"\u20B9"}{result.totalPayment.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  {hasMoratorium && result.moratoriumInterest > 0 && (
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="text-sm text-gray-600">Interest During Study</div>
                      <div className="text-lg font-semibold text-yellow-600">
                        {"\u20B9"}{result.moratoriumInterest.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tax Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Info className="w-5 h-5" />
                  Section 80E Tax Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Interest Deduction</span>
                    <span className="text-lg font-semibold text-blue-600">
                      {"\u20B9"}{result.section80E.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Tax Savings (30% bracket)</span>
                    <span className="text-lg font-semibold text-green-600">
                      {"\u20B9"}{result.taxSavings?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Effective Interest Cost</span>
                    <span className="text-lg font-semibold text-green-600">
                      {"\u20B9"}{result.effectiveCost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
                    <strong>Note:</strong> Section 80E allows full interest deduction with no upper limit. 
                    Deduction available for maximum 8 years or until loan is repaid.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button className="flex-1 bg-teal-600 hover:bg-teal-700">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" className="flex-1">
                Compare Banks
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Payment Schedule */}
        {result.schedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle>EMI Breakdown with Tax Benefits (First 12 Months)</CardTitle>
                <CardDescription>
                  Monthly payments after moratorium period with Section 80E tax benefits
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
                        <th className="text-left p-3 font-medium">Tax Benefit</th>
                        <th className="text-left p-3 font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.schedule.map((row) => (
                        <tr key={row.month} className="border-b hover:bg-gray-50">
                          <td className="p-3">{row.month}</td>
                          <td className="p-3">{"\u20B9"}{row.emi.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-green-600">{"\u20B9"}{row.principal.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-red-600">{"\u20B9"}{row.interest.toLocaleString('en-IN')}</td>
                          <td className="p-3 text-blue-600">{"\u20B9"}{row.taxBenefit.toLocaleString('en-IN')}</td>
                          <td className="p-3">{"\u20B9"}{row.balance.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Education Loan Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-teal-600" />
                Education Loan Key Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-teal-700">Tax Benefits</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Section 80E - No upper limit</li>
                    <li>• Available for 8 years or loan tenure</li>
                    <li>• Applies to interest component only</li>
                    <li>• Can be claimed by student/parent/spouse</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-blue-700">Loan Features</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Up to {"\u20B9"}10L without collateral</li>
                    <li>• Up to {"\u20B9"}20L+ with collateral</li>
                    <li>• Moratorium during study + 6 months</li>
                    <li>• Lower rates for premier institutions</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-purple-700">Repayment Options</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• EMI after course completion</li>
                    <li>• Prepayment without penalty</li>
                    <li>• Step-up EMI options available</li>
                    <li>• Flexible tenure: 5-15 years</li>
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