import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Calculator, FileText, TrendingUp, Clock, CheckCircle, ArrowRight, IndianRupee, Building2, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import SEO from "@/components/SEO";

const TaxPlanningPage = () => {
  const [selectedSection, setSelectedSection] = useState("startup");

  const startupTaxBenefits = [
    {
      title: "Section 80-IAC Benefits",
      description: "100% profit deduction for 3 consecutive years out of first 10 years",
      savings: "Up to \u20B925L annually",
      eligibility: "DPIIT recognized startups",
      icon: Shield,
      color: "blue"
    },
    {
      title: "Capital Gains Exemption",
      description: "Complete exemption on long-term capital gains if reinvested in startup",
      savings: "Unlimited",
      eligibility: "Investment in Fund of Funds",
      icon: TrendingUp,
      color: "green"
    },
    {
      title: "Angel Tax Exemption",
      description: "No angel tax on investments up to \u20B925 crores",
      savings: "30.9% of investment",
      eligibility: "DPIIT recognized startups",
      icon: Building2,
      color: "purple"
    },
    {
      title: "Carry Forward Losses",
      description: "Carry forward losses for 8 years instead of regular 4 years",
      savings: "Future tax offset",
      eligibility: "All startups",
      icon: Calculator,
      color: "orange"
    }
  ];

  const taxPlanningStrategies = [
    {
      category: "R&D Incentives",
      strategies: [
        "200% weighted deduction on R&D expenses",
        "Patent box regime with 10% tax rate",
        "Accelerated depreciation on R&D assets",
        "Export incentives under various schemes"
      ]
    },
    {
      category: "Employee Benefits",
      strategies: [
        "ESOP taxation deferred by 5 years",
        "Tax-free perquisites optimization",
        "Retirement benefit structuring",
        "Medical reimbursement planning"
      ]
    },
    {
      category: "Investment Planning",
      strategies: [
        "Section 54GB for residential property",
        "Investment in specified bonds",
        "Startup India Seed Fund benefits",
        "CSR spending optimization"
      ]
    },
    {
      category: "International Tax",
      strategies: [
        "Transfer pricing optimization",
        "Tax treaty benefits",
        "Offshore IP structuring",
        "Foreign tax credit planning"
      ]
    }
  ];

  const complianceCalendar = [
    { month: "April", tasks: ["Advance tax Q1", "TDS returns Q4"], critical: true },
    { month: "July", tasks: ["ITR filing", "Tax audit", "GST annual return"], critical: true },
    { month: "September", tasks: ["Advance tax Q2", "Half-yearly GST return"], critical: false },
    { month: "December", tasks: ["Advance tax Q3", "Tax planning review"], critical: false },
    { month: "March", tasks: ["Advance tax Q4", "Year-end planning"], critical: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Startup Tax Planning & Benefits - Save up to 100% Tax | MyeCA.in"
        description="Maximize tax savings for your startup with Section 80-IAC benefits, angel tax exemption, R&D incentives, and expert CA guidance. Save up to \u20B925L annually."
        keywords="startup tax benefits, section 80-IAC, angel tax exemption, startup tax planning, DPIIT tax benefits, R&D tax incentives"
      />

      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Startup Tax Planning
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Save up to 100% tax with government schemes and expert strategies.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Get Consultation
                </Button>
                <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 font-semibold">
                  Download Guide
                </Button>
              </div>
            </div>
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Maximize startup benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Get DPIIT recognition to unlock 80-IAC benefits.
                  </li>
                  <li className="flex items-start">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Use angel tax exemption for investments up to \u20B925 Cr.
                  </li>
                  <li className="flex items-start">
                    <IndianRupee className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Plan capital gains exemptions via Startup funds.
                  </li>
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Review tax plan quarterly to stay optimized.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Tax Benefits Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Exclusive Startup Tax Benefits
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Government-backed incentives designed to help startups grow without tax burden
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {startupTaxBenefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow duration-300 border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`w-12 h-12 bg-${benefit.color}-100 rounded-lg flex items-center justify-center`}>
                        <benefit.icon className={`h-6 w-6 text-${benefit.color}-600`} />
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        {benefit.savings}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl mt-4">{benefit.title}</CardTitle>
                    <CardDescription className="text-base mt-2">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Eligibility: {benefit.eligibility}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tax Planning Strategies */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Advanced Tax Planning Strategies
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Comprehensive strategies to minimize tax liability and maximize growth capital
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {taxPlanningStrategies.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Sparkles className="h-5 w-5 text-yellow-500 mr-2" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.strategies.map((strategy, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{strategy}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Compliance Calendar */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Clock className="h-6 w-6 text-blue-600 mr-3" />
                Tax Compliance Calendar
              </CardTitle>
              <CardDescription className="text-base">
                Never miss a deadline with our comprehensive tax calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-5 gap-4">
                {complianceCalendar.map((month, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${
                      month.critical ? 'bg-red-50 border border-red-200' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <div className="font-semibold text-lg mb-2 flex items-center">
                      {month.month}
                      {month.critical && (
                        <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                      )}
                    </div>
                    <ul className="space-y-1">
                      {month.tasks.map((task, idx) => (
                        <li key={idx} className="text-sm text-gray-600">
                          • {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Optimize Your Startup's Tax Strategy?
              </h3>
              <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
                Get personalized tax planning from our startup tax experts and save lakhs in taxes
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
                >
                  Book Free Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white/10"
                >
                  Calculate Tax Savings
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default TaxPlanningPage;
