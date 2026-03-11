import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Calendar, Shield, AlertCircle, CheckCircle2, Clock, ArrowRight, Building2, Scale, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import SEO from "@/components/SEO";

const ComplianceManagementPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const complianceServices = {
    statutory: [
      {
        title: "ROC Compliance",
        description: "Annual filings, board resolutions, share transfers, and statutory registers",
        frequency: "Annual/Event-based",
        penalty: "Up to \u20B91L + \u20B9100/day",
        icon: Building2,
        critical: true
      },
      {
        title: "GST Compliance",
        description: "Monthly/quarterly returns, annual returns, e-way bills, and reconciliation",
        frequency: "Monthly/Quarterly",
        penalty: "Up to \u20B910K + 18% interest",
        icon: FileText,
        critical: true
      },
      {
        title: "Income Tax Compliance",
        description: "TDS returns, advance tax, ITR filing, and tax audit",
        frequency: "Quarterly/Annual",
        penalty: "Up to \u20B910K per default",
        icon: Scale,
        critical: true
      },
      {
        title: "Labour Law Compliance",
        description: "PF, ESI, PT, LWF registrations and returns",
        frequency: "Monthly",
        penalty: "Up to 100% of dues",
        icon: Briefcase,
        critical: false
      }
    ],
    startup: [
      {
        title: "DPIIT Recognition",
        description: "Startup India recognition for tax benefits and exemptions",
        requirements: ["Certificate of Incorporation", "PAN Card", "Business Description"],
        benefits: ["3-year tax holiday", "Angel tax exemption", "Fast-track patents"]
      },
      {
        title: "Startup Compliance Calendar",
        description: "Customized compliance tracking for startups",
        requirements: ["Company type", "State of incorporation", "Business activities"],
        benefits: ["Never miss deadlines", "Penalty avoidance", "Peace of mind"]
      },
      {
        title: "FEMA Compliance",
        description: "Foreign investment reporting and approvals",
        requirements: ["Investment details", "Investor KYC", "Valuation report"],
        benefits: ["Legal foreign investment", "RBI compliance", "Smooth fund raising"]
      },
      {
        title: "IP Compliance",
        description: "Trademark, copyright, and patent compliance",
        requirements: ["IP details", "Usage rights", "Registration documents"],
        benefits: ["IP protection", "Legal certainty", "Asset value creation"]
      }
    ]
  };

  const compliancePackages = [
    {
      name: "Startup Essentials",
      price: "\u20B99,999",
      period: "per month",
      features: [
        "ROC compliance management",
        "GST return filing",
        "Income tax compliance",
        "Basic labour law compliance",
        "Monthly compliance calendar",
        "24/7 support"
      ],
      recommended: false
    },
    {
      name: "Growth Package",
      price: "\u20B919,999",
      period: "per month",
      features: [
        "Everything in Essentials",
        "DPIIT recognition assistance",
        "FEMA compliance",
        "Advanced tax planning",
        "Dedicated compliance manager",
        "Quarterly reviews"
      ],
      recommended: true
    },
    {
      name: "Enterprise",
      price: "\u20B949,999",
      period: "per month",
      features: [
        "Everything in Growth",
        "Multi-state compliance",
        "International compliance",
        "Board meeting support",
        "Compliance audit",
        "Custom reporting"
      ],
      recommended: false
    }
  ];

  const monthlyCompliance = [
    { day: "7th", task: "GST GSTR-3B Filing", type: "GST", critical: true },
    { day: "10th", task: "TDS Deposit", type: "Tax", critical: true },
    { day: "11th", task: "GSTR-1 Filing", type: "GST", critical: false },
    { day: "15th", task: "PF/ESI Payment", type: "Labour", critical: true },
    { day: "20th", task: "GST Payment", type: "GST", critical: true },
    { day: "30th", task: "Professional Tax", type: "Labour", critical: false }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Startup Compliance Management Services - Never Miss a Deadline | MyeCA.in"
        description="End-to-end compliance management for startups. ROC, GST, Income Tax, Labour Law compliance with zero penalties. Get dedicated compliance manager."
        keywords="startup compliance, ROC compliance, GST compliance, labour law compliance, DPIIT compliance, compliance management services"
      />

      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center soft-shadow">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Startup Compliance Management
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Never miss a compliance deadline. We manage statutory filings while you scale.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 font-semibold">
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Get Compliance Audit
                </Button>
                <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-5 py-2.5 font-semibold">
                  View Compliance Calendar
                </Button>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Stay penalty-free</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Track monthly GST and TDS deadlines proactively.
                  </li>
                  <li className="flex items-start">
                    <Building2 className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Maintain ROC registers and board resolutions.
                  </li>
                  <li className="flex items-start">
                    <Scale className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Schedule quarterly compliance reviews.
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Keep proofs and acknowledgments for 6 years.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Compliance Services Tabs */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Compliance Services
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From incorporation to IPO, we handle all your compliance needs
            </p>
          </div>

          <Tabs defaultValue="statutory" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="statutory">Statutory Compliance</TabsTrigger>
              <TabsTrigger value="startup">Startup Specific</TabsTrigger>
            </TabsList>

            <TabsContent value="statutory">
              <div className="grid md:grid-cols-2 gap-6">
                {complianceServices.statutory.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className={`h-full ${service.critical ? 'border-red-200' : 'border-gray-200'}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 ${service.critical ? 'bg-red-100' : 'bg-green-100'} rounded-lg flex items-center justify-center`}>
                            <service.icon className={`h-6 w-6 ${service.critical ? 'text-red-600' : 'text-green-600'}`} />
                          </div>
                          {service.critical && (
                            <Badge variant="destructive" className="bg-red-100 text-red-700">
                              High Priority
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl mt-4">{service.title}</CardTitle>
                        <CardDescription className="text-base mt-2">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>Frequency: {service.frequency}</span>
                          </div>
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="h-4 w-4 mr-2" />
                            <span>Penalty: {service.penalty}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="startup">
              <div className="grid md:grid-cols-2 gap-6">
                {complianceServices.startup.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <CardTitle className="text-xl flex items-center">
                          <Shield className="h-5 w-5 text-blue-600 mr-2" />
                          {service.title}
                        </CardTitle>
                        <CardDescription className="text-base mt-2">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-sm text-gray-700 mb-2">Requirements:</p>
                            <ul className="space-y-1">
                              {service.requirements.map((req, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-700 mb-2">Benefits:</p>
                            <ul className="space-y-1">
                              {service.benefits.map((benefit, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <CheckCircle2 className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Monthly Compliance Calendar */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Calendar className="h-6 w-6 text-green-600 mr-3" />
                Monthly Compliance Calendar
              </CardTitle>
              <CardDescription className="text-base">
                Key compliance dates you can't afford to miss
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthlyCompliance.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      item.critical 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl font-bold text-gray-900">{item.day}</span>
                      <Badge 
                        variant={item.critical ? "destructive" : "secondary"}
                        className={item.critical ? "bg-red-100 text-red-700" : ""}
                      >
                        {item.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-gray-700">{item.task}</p>
                    {item.critical && (
                      <p className="text-xs text-red-600 mt-2 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Heavy penalties apply
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Pricing Packages */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Compliance Packages for Every Stage
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose a package that fits your startup's needs and budget
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {compliancePackages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`h-full ${pkg.recommended ? 'border-green-500 border-2' : 'border-gray-200'}`}>
                  {pkg.recommended && (
                    <div className="bg-green-500 text-white text-center py-2 text-sm font-semibold">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">\u20B9pkg.price.replace('\u20B9', '')</span>
                      <span className="text-gray-600 ml-2">{pkg.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className={`w-full mt-6 ${
                        pkg.recommended 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">
                Stop Worrying About Compliance Deadlines
              </h3>
              <p className="text-lg mb-8 text-green-100 max-w-2xl mx-auto">
                Let our experts handle your compliance while you focus on growth. 
                Get started with a free compliance audit.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-green-600 hover:bg-green-50 font-semibold"
                >
                  Get Free Compliance Audit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white/10"
                >
                  Schedule Demo
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default ComplianceManagementPage;
