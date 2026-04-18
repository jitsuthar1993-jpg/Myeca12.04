import { useState } from "react";
import { m } from "framer-motion";
import { FileSearch, Shield, Calculator, TrendingUp, CheckCircle, ArrowRight, FileText, AlertTriangle, Award, BarChart3, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import SEO from "@/components/SEO";
import { ServiceCheckoutModal } from "@/components/services/ServiceCheckoutModal";

const AuditServicesPage = () => {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("statutory");

  const auditServices = {
    statutory: [
      {
        title: "Statutory Audit",
        description: "Mandatory annual audit as per Companies Act 2013",
        scope: ["Financial statements audit", "Compliance verification", "Internal controls review", "Management letter"],
        threshold: "Turnover > ₹1 Cr or Paid-up capital > ₹50L",
        icon: FileSearch,
        color: "blue"
      },
      {
        title: "Tax Audit",
        description: "Section 44AB audit for businesses exceeding limits",
        scope: ["Books of accounts review", "Tax compliance check", "Form 3CA/3CD", "Tax planning advice"],
        threshold: "Turnover > ₹1 Cr (business) or ₹50L (profession)",
        icon: Calculator,
        color: "green"
      },
      {
        title: "GST Audit",
        description: "Annual GST audit and reconciliation",
        scope: ["GSTR-9 preparation", "ITC reconciliation", "GSTR-9C certification", "GST compliance review"],
        threshold: "Turnover > ₹2 Cr",
        icon: FileText,
        color: "purple"
      },
      {
        title: "Internal Audit",
        description: "Risk assessment and process improvement",
        scope: ["Process evaluation", "Risk identification", "Control testing", "Improvement recommendations"],
        threshold: "Recommended for all startups",
        icon: Shield,
        color: "orange"
      }
    ],
    specialized: [
      {
        title: "Due Diligence Audit",
        description: "Comprehensive review for investors and acquirers",
        includes: ["Financial due diligence", "Legal compliance check", "Tax position review", "Risk assessment"],
        ideal: "Fund raising, M&A, partnerships"
      },
      {
        title: "ESOP Audit",
        description: "Employee stock option plan compliance and valuation",
        includes: ["ESOP policy review", "409A valuation", "Tax implications", "Compliance check"],
        ideal: "Startups with ESOP schemes"
      },
      {
        title: "Forensic Audit",
        description: "Investigation of fraud and financial irregularities",
        includes: ["Fraud detection", "Evidence gathering", "Loss quantification", "Legal support"],
        ideal: "Suspected fraud or disputes"
      },
      {
        title: "ESG Audit",
        description: "Environmental, Social, and Governance compliance",
        includes: ["Sustainability metrics", "CSR compliance", "ESG reporting", "Impact assessment"],
        ideal: "Impact startups, CSR compliance"
      }
    ]
  };

  const auditProcess = [
    {
      step: 1,
      title: "Planning",
      description: "Understanding business, risk assessment, audit plan",
      duration: "2-3 days"
    },
    {
      step: 2,
      title: "Fieldwork",
      description: "Testing controls, verifying transactions, gathering evidence",
      duration: "5-10 days"
    },
    {
      step: 3,
      title: "Reporting",
      description: "Draft findings, management discussion, final report",
      duration: "3-5 days"
    },
    {
      step: 4,
      title: "Follow-up",
      description: "Implementation support, compliance assistance",
      duration: "Ongoing"
    }
  ];

  const benefits = [
    {
      title: "Investor Confidence",
      description: "Build trust with audited financials",
      icon: TrendingUp
    },
    {
      title: "Risk Mitigation",
      description: "Identify and address compliance gaps",
      icon: Shield
    },
    {
      title: "Tax Optimization",
      description: "Discover tax saving opportunities",
      icon: Calculator
    },
    {
      title: "Process Improvement",
      description: "Enhance internal controls and efficiency",
      icon: BarChart3
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Startup Audit Services - Statutory, Tax & Internal Audits | MyeCA.in"
        description="Professional audit services for startups including statutory audit, tax audit, GST audit, and due diligence. Build investor confidence with certified audits."
        keywords="startup audit services, statutory audit, tax audit, GST audit, due diligence, internal audit, forensic audit"
      />

      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center soft-shadow">
                  <FileSearch className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Professional Audit Services for Startups
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Build investor confidence and ensure compliance with comprehensive audits.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 font-semibold"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Book Audit Consultation
                </Button>
                <Button size="sm" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-5 py-2.5 font-semibold">
                  Download Audit Checklist
                </Button>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Plan audits efficiently</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Calendar className="w-4 h-4 mr-2 text-purple-600 mt-0.5" />
                    Schedule audits post year-end for complete data.
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Prepare ledgers, vouchers, and bank reconciliations.
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Address control gaps with internal audit follow-ups.
                  </li>
                  <li className="flex items-start">
                    <Award className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Maintain audit reports and management letters safely.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Audit Services Tabs */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Audit Solutions
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From statutory compliance to investor due diligence, we've got you covered
            </p>
          </div>

          <Tabs defaultValue="statutory" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="statutory">Mandatory Audits</TabsTrigger>
              <TabsTrigger value="specialized">Specialized Audits</TabsTrigger>
            </TabsList>

            <TabsContent value="statutory">
              <div className="grid md:grid-cols-2 gap-6">
                {auditServices.statutory.map((service, index) => (
                  <m.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 bg-${service.color}-100 rounded-lg flex items-center justify-center`}>
                            <service.icon className={`h-6 w-6 text-${service.color}-600`} />
                          </div>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            Mandatory
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mt-4">{service.title}</CardTitle>
                        <CardDescription className="text-base mt-2">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-sm text-gray-700 mb-2">Scope:</p>
                            <ul className="space-y-1">
                              {service.scope.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              <AlertTriangle className="h-4 w-4 text-orange-500 inline mr-1" />
                              <span className="font-medium">Applicability:</span> {service.threshold}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </m.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="specialized">
              <div className="grid md:grid-cols-2 gap-6">
                {auditServices.specialized.map((service, index) => (
                  <m.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="text-xl">{service.title}</CardTitle>
                          <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <CardDescription className="text-base">
                          {service.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <p className="font-semibold text-sm text-gray-700 mb-2">Includes:</p>
                            <ul className="space-y-1">
                              {service.includes.map((item, idx) => (
                                <li key={idx} className="text-sm text-gray-600 flex items-start">
                                  <CheckCircle className="h-4 w-4 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="pt-3 border-t">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Ideal for:</span> {service.ideal}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </m.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* Audit Process */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Audit Process
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Systematic approach ensuring thorough review and timely completion
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {auditProcess.map((phase, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-purple-600">{phase.step}</span>
                    </div>
                    <CardTitle className="text-lg">{phase.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{phase.description}</p>
                    <Badge variant="secondary" className="text-xs">
                      {phase.duration}
                    </Badge>
                  </CardContent>
                </Card>
                {index < auditProcess.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-6 w-6 text-purple-400" />
                  </div>
                )}
              </m.div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Why Regular Audits Matter for Startups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                      <benefit.icon className="h-8 w-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
            <CardContent className="py-12">
              <h3 className="text-2xl font-bold mb-4">
                Ready for Your Next Audit?
              </h3>
              <p className="text-lg mb-8 text-purple-100 max-w-2xl mx-auto">
                Get a clean audit report and build investor confidence. Our startup-focused 
                CAs ensure smooth and timely audit completion.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                >
                  Schedule Audit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-white border-white hover:bg-white/10"
                >
                  Get Quote
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
      {isCheckoutOpen && (
        <ServiceCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          serviceId="audit-services"
          serviceTitle="Audit & Assurance Services"
          category="Legal & Compliance"
          priceAmount={4999}
        />
      )}
    </div>
  );
};

export default AuditServicesPage;
