import { useState } from "react";
import { Calculator, Car, TrendingUp, PieChart, Info, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import EnhancedSEO from "@/components/EnhancedSEO";
import { getHowToSchema } from "@/utils/seo-defaults";

export default function CarLoanCalculatorPage() {
  const [carPrice, setCarPrice] = useState<string>("800000");
  const [downPayment, setDownPayment] = useState<string>("160000");
  const [interestRate, setInterestRate] = useState<string>("9.5");
  const [tenure, setTenure] = useState<string>("5");
  const [tenureType, setTenureType] = useState<string>("years");
  const [carType, setCarType] = useState<string>("new");

  const calculateCarLoan = () => {
    const totalPrice = parseFloat(carPrice) || 0;
    const downPay = parseFloat(downPayment) || 0;
    const principal = totalPrice - downPay;
    const monthlyRate = (parseFloat(interestRate) || 0) / 12 / 100;
    const tenureMonths = tenureType === "years" 
      ? (parseFloat(tenure) || 0) * 12 
      : (parseFloat(tenure) || 0);
    
    if (principal <= 0 || monthlyRate <= 0 || tenureMonths <= 0) {
      return {
        loanAmount: 0,
        emi: 0,
        totalPayment: 0,
        totalInterest: 0,
        downPaymentPercent: 0,
        monthlyIncome: 0,
        schedule: []
      };
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) / 
                (Math.pow(1 + monthlyRate, tenureMonths) - 1);
    
    const totalPayment = emi * tenureMonths;
    const totalInterest = totalPayment - principal;
    const downPaymentPercent = (downPay / totalPrice) * 100;
    const monthlyIncome = emi / 0.35; // Car loan EMI should be max 35% of income

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
      loanAmount: Math.round(principal),
      emi: Math.round(emi),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
      downPaymentPercent: Math.round(downPaymentPercent * 100) / 100,
      monthlyIncome: Math.round(monthlyIncome),
      schedule
    };
  };

  const result = calculateCarLoan();

  const getInterestRateRange = () => {
    switch (carType) {
      case "new":
        return "8.25% - 10.5%";
      case "used":
        return "10.0% - 15.0%";
      default:
        return "8.25% - 15.0%";
    }
  };

  const howToSchema = getHowToSchema({
    name: "How to Calculate Car Loan EMI",
    description: "Calculate your car loan EMI in 3 simple steps",
    totalTime: "PT2M",
    steps: [
      {
        name: "Enter car price and down payment",
        text: "Input the on-road price of the car and your down payment amount"
      },
      {
        name: "Select interest rate and tenure",
        text: "Choose the interest rate offered by your bank and loan tenure"
      },
      {
        name: "View EMI and total payment",
        text: "See your monthly EMI, total interest, and complete payment breakdown"
      }
    ]
  });

  return (
    <>
      <EnhancedSEO
        title="Car Loan EMI Calculator 2025 | New & Used Car Loan Calculator"
        description="Calculate car loan EMI for new cars (8.25-10.5%) & used cars (10-15%). Compare interest rates, down payment options & get instant EMI breakdown."
        keywords={[
          'car loan EMI calculator',
          'vehicle loan calculator',
          'car loan interest rates',
          'used car loan calculator',
          'car finance calculator',
          'auto loan EMI',
          'down payment calculator',
          'car loan eligibility'
        ]}
        url="https://myeca.in/calculators/car-loan"
        type="website"
        jsonLd={howToSchema}
      />
    <div className="calculator-page min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Car className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Car Loan EMI Calculator
            </h1>
            <p className="text-xl text-orange-100 max-w-3xl mx-auto">
              Calculate your car loan EMI for new and used cars. Compare different loan scenarios 
              and find the best financing option for your dream car.
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
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Calculator className="w-5 h-5" />
                  Car Loan Calculator
                </CardTitle>
                <CardDescription>
                  Enter your car and loan details to calculate EMI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="car-type">Car Type</Label>
                  <Select value={carType} onValueChange={setCarType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New Car</SelectItem>
                      <SelectItem value="used">Used Car</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="car-price">Car Price (\u20B9)</Label>
                  <Input
                    id="car-price"
                    type="number"
                    value={carPrice}
                    onChange={(e) => setCarPrice(e.target.value)}
                    placeholder="800000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="down-payment">Down Payment (\u20B9)</Label>
                  <Input
                    id="down-payment"
                    type="number"
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value)}
                    placeholder="160000"
                  />
                  <p className="text-sm text-gray-600">
                    Recommended: {((parseFloat(carPrice) || 0) * 0.2).toLocaleString('en-IN')} 
                    (20% of car price)
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
                    placeholder="9.5"
                  />
                  <p className="text-sm text-gray-600">
                    Current {carType} car rates: {getInterestRateRange()}
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
                      placeholder="5"
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
                    {carType === "new" 
                      ? "New car loans offer up to 90% financing with lower interest rates (8.25%-10.5%)."
                      : "Used car loans typically finance 80% of car value with higher rates (10%-15%)."
                    }
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
                      <div className="text-sm text-gray-600">Loan Amount</div>
                      <div className="text-lg font-semibold text-blue-600">
                        \u20B9{result.loanAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-gray-600">Total Interest</div>
                      <div className="text-lg font-semibold text-orange-600">
                        \u20B9{result.totalInterest.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loan Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <PieChart className="w-5 h-5" />
                  Loan Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Down Payment %</span>
                    <span className="text-lg font-semibold text-purple-600">
                      {result.downPaymentPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Required Monthly Income</span>
                    <span className="text-lg font-semibold text-blue-600">
                      \u20B9{result.monthlyIncome.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Total Payment</span>
                    <span className="text-lg font-semibold text-green-600">
                      \u20B9{result.totalPayment.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 p-3 bg-yellow-50 rounded-lg">
                    <strong>Tip:</strong> Car loan EMI should not exceed 35% of your monthly income. 
                    Higher down payment reduces EMI and total interest cost.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" className="flex-1">
                Compare Offers
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
                  Monthly breakdown of your car loan payments
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