import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { 
  ArrowRight, 
  CheckCircle, 
  TrendingUp, 
  Users, 
  Lightbulb, 
  Shield, 
  Coins,
  FileText,
  BarChart,
  Star,
  Phone,
  Target,
  Rocket,
  Building,
  CreditCard,
  Award,
  PieChart,
  Briefcase,
  Clock,
  Zap,
  IndianRupee
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getGradientColorClass } from '@/utils/colorClasses';
import { EngagementTooltip, useEngagementTooltips, startupTooltips } from '@/components/ui/engagement-tooltip';
import { SectionHeader } from '@/components/ui/section-header';

const StartupServicesPage = () => {
  const { isCompleted, markCompleted, resetTooltips } = useEngagementTooltips();

  const renderPrice = (p: string) => {
    if (!p) return null;
    return (
      <span className="inline-flex items-center">
        <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
        {p.replace(/\\u20B9|₹|â‚¹/g, "")}
      </span>
    );
  };

  const servicePackages = [
    {
      title: "Startup Essentials",
      price: "\u20B92,999",
      period: "/month",
      stage: "Early Stage & Bootstrap",
      savings: "Save \u20B915,000 annually",
      icon: Rocket,
      color: "emerald",
      features: [
        "Company Incorporation (Pvt Ltd/LLP)",
        "Basic Bookkeeping & Accounting",
        "GST Registration & Monthly Returns",
        "PAN/TAN Application & Management", 
        "Basic Compliance Calendar",
        "Monthly Financial Reports",
        "Statutory Filing Support",
        "Email Support & Consultation"
      ]
    },
    {
      title: "Growth Accelerator",
      price: "\u20B98,999",
      period: "/month", 
      stage: "Funding Ready & Scaling",
      savings: "Save \u20B950,000 annually",
      icon: TrendingUp,
      color: "blue",
      popular: true,
      features: [
        "Everything in Startup Essentials",
        "Investor-Ready Financial Statements",
        "Virtual CFO Services (2 hours/month)",
        "Funding Documentation Support",
        "Due Diligence Assistance",
        "Board Meeting Preparations",
        "Advanced Tax Planning",
        "Priority Phone & Video Support"
      ]
    },
    {
      title: "Enterprise Suite",
      price: "\u20B919,999",
      period: "/month",
      stage: "Series Funding & IPO Ready",
      savings: "Save \u20B91,00,000 annually",
      icon: Building,
      color: "purple",
      features: [
        "Everything in Growth Accelerator",
        "Dedicated Virtual CFO (8 hours/month)",
        "IPO Readiness Assessment",
        "Advanced Financial Modeling",
        "International Compliance Support",
        "Strategic Business Advisory",
        "Quarterly Business Reviews",
        "24/7 Priority Support & Site Visits"
      ]
    }
  ];

  const governmentSchemeServices = [
    {
      title: "Startup India Registration & DPIIT Recognition",
      price: "\u20B94,999 - \u20B912,999",
      schemes: ["Startup India", "DPIIT Recognition"],
      benefits: "3-year profit tax holiday under Section 80-IAC",
      icon: Rocket,
      color: "emerald",
      description: "Complete entity formation (LLP/Pvt Ltd) with DPIIT recognition for Startup India eligibility and ongoing compliance"
    },
    {
      title: "Funding & Grant Assistance",
      price: "\u20B915,999 - \u20B945,000", 
      schemes: ["SISFS", "BIG", "CGSS", "PMMY", "Stand-Up India"],
      benefits: "Up to \u20B950 Lakh funding, collateral-free loans",
      icon: Coins,
      color: "blue",
      description: "Complete support for grant applications, financial models, pitch decks, and VC connections under government schemes"
    },
    {
      title: "Tax Planning & Incentives Optimization",
      price: "\u20B98,999 - \u20B925,000",
      schemes: ["Section 80-IAC", "Capital Gains Relief", "R&D Incentives"],
      benefits: "Maximum tax exemptions & IP reimbursements",
      icon: TrendingUp,
      color: "purple",
      description: "Optimize all available tax exemptions, handle GST/IT filings, R&D incentives, and IP reimbursements"
    },
    {
      title: "Audit & Financial Management",
      price: "\u20B912,999 - \u20B935,000",
      schemes: ["Statutory Audit", "ESOP Structuring", "Risk Assessment"],
      benefits: "Maintain scheme eligibility & financial health",
      icon: Shield,
      color: "orange",
      description: "Statutory/internal audits, cash flow forecasting, ESOP structuring, and risk assessments for scheme compliance"
    },
    {
      title: "Strategic Advisory & Mentorship",
      price: "\u20B918,999 - \u20B950,000",
      schemes: ["FFS", "Export Promotion", "ICAI Networks"],
      benefits: "Holistic business growth & scaling support",
      icon: Briefcase,
      color: "indigo",
      description: "Strategic business modeling, export promotion guidance, ICAI mentorship, and equity structuring for sustainable scaling"
    },
    {
      title: "Comprehensive Compliance Management",
      price: "\u20B99,999 - \u20B928,000",
      schemes: ["ROC", "GST", "TDS", "FEMA", "Labor Law Self-Certification"],
      benefits: "Complete regulatory compliance coverage",
      icon: FileText,
      color: "teal",
      description: "End-to-end compliance for all regulatory requirements including ROC, GST, TDS, FEMA filings and labor law compliance"
    }
  ];

  const specializedServices = [
    {
      title: "Business Valuation Services",
      price: "\u20B915,999 - \u20B975,000",
      duration: "1-2 weeks",
      guarantee: "100% Accurate",
      icon: PieChart,
      description: "Professional valuations for funding rounds, acquisitions, and strategic planning"
    },
    {
      title: "Due Diligence Support",
      price: "\u20B925,999 - \u20B91,50,000", 
      duration: "2-4 weeks",
      guarantee: "Investor Approved",
      icon: Shield,
      description: "Complete financial and legal due diligence for funding readiness"
    },
    {
      title: "IPO Readiness Advisory",
      price: "\u20B92,99,999 - \u20B915,00,000",
      duration: "6-12 months",
      guarantee: "IPO Success",
      icon: Award,
      description: "End-to-end IPO preparation, compliance, and listing advisory"
    },
    {
      title: "Investor Pitch Deck",
      price: "\u20B99,999 - \u20B935,000",
      duration: "3-7 days",
      guarantee: "Funding Ready",
      icon: FileText,
      description: "Professional pitch decks with financial projections and market analysis"
    }
  ];



  const ourAdvantages = [
    {
      title: "Expert CA Team",
      description: "Dedicated CAs with 10+ years startup experience",
      stat: "50+ Expert CAs",
      benefit: "Deep industry knowledge",
      icon: Users,
      color: "emerald"
    },
    {
      title: "Technology First", 
      description: "AI-powered compliance and automated reporting",
      stat: "24/7 Platform",
      benefit: "Real-time updates",
      icon: Zap,
      color: "blue"
    },
    {
      title: "Investor Network",
      description: "Connected with 200+ VCs and angel investors",
      stat: "200+ VCs",
      benefit: "Funding connections",
      icon: Building,
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-blue-50">
      {/* Header (Calculators-style) */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <Rocket className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Startup Services
                </h1>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl">
                Leverage Startup India, SISFS, CGSS, PMMY and other government schemes for funding, tax benefits and growth with expert CA guidance.
              </p>
            </div>
            
            <div className="flex gap-3">
               <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                 <Briefcase className="w-4 h-4 mr-2" />
                 Explore Packages
               </Button>
               <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold">
                 <Phone className="w-4 h-4 mr-2" />
                 Free Consultation
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Government Scheme-Backed Services */}
      <motion.div
        id="funding-services"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="py-20 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center bg-gradient-to-r from-emerald-100 to-blue-100 rounded-full px-6 py-3 mb-8"
            >
              <Award className="w-5 h-5 mr-2 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Government Scheme Specialists</span>
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Comprehensive CA Services Leveraging Government Schemes
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Navigate funding, compliance, and growth with expert support across Startup India, SISFS, CGSS, PMMY, and other key government initiatives
            </p>
          </div>

          {/* Government Scheme Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {governmentSchemeServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="group h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-emerald-500">
                  <CardContent className="p-8">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 bg-${service.color}-100 group-hover:bg-${service.color}-600 text-${service.color}-600 group-hover:text-white`}>
                        <service.icon className="w-8 h-8" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{service.price}</div>
                        <div className="text-sm text-gray-500">Starting from</div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">
                      {service.description}
                    </p>
                    
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-700 mb-2">Key Schemes:</div>
                      <div className="flex flex-wrap gap-2">
                        {service.schemes.map((scheme, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded">
                            {scheme}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-emerald-50 rounded-lg border-l-3 border-l-emerald-500">
                      <div className="text-sm font-semibold text-emerald-800 mb-1">Benefits:</div>
                      <div className="text-sm text-emerald-700">{service.benefits}</div>
                    </div>
                    
                    <Button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700">
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>



      {/* Service Packages */}
      <motion.div
        id="tax-benefits"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Startup Growth Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Affordable, scalable packages designed for every stage of your startup journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {servicePackages.map((pkg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                className="relative"
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <Card className={`h-full border-2 ${pkg.popular ? 'border-blue-200 shadow-xl' : 'border-gray-200'} hover:shadow-lg transition-shadow`}>
                  <CardHeader className="text-center pb-8">
                    <div className={`w-16 h-16 bg-gradient-to-r ${getGradientColorClass(pkg.color)} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <pkg.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">{pkg.title}</CardTitle>
                    <div className="text-center mt-4">
                      <span className="text-4xl font-bold text-gray-900">{renderPrice(pkg.price)}</span>
                      <span className="text-gray-600">{pkg.period}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{pkg.stage}</p>
                    <p className="text-sm font-medium text-green-600">{renderPrice(pkg.savings)}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-8">
                      {pkg.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Get Started with {pkg.title.split(' ')[0]} Package
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Specialized Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premium Startup Advisory Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert solutions for funding, valuation, and strategic growth initiatives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {specializedServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <service.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                        <p className="text-gray-600 mb-4">{service.description}</p>
                        
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Price Range</p>
                            <p className="font-semibold text-gray-900">{renderPrice(service.price)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Duration</p>
                            <p className="font-semibold text-gray-900">{service.duration}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Guarantee</p>
                            <p className="font-semibold text-green-600">{service.guarantee}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Our Advantages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="py-16 bg-white border-y border-gray-100"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Why Choose MyeCA for Your Startup?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Your trusted partner with deep startup expertise and proven track record
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {ourAdvantages.map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="bg-white border-gray-200 h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 bg-${advantage.color}-100 rounded-lg flex items-center justify-center mb-6`}>
                      <advantage.icon className={`w-6 h-6 text-${advantage.color}-600`} />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-4 text-gray-900">{advantage.title}</h3>
                    <p className="text-gray-600 mb-4">{advantage.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Our Strength:</span>
                        <span className="font-medium text-emerald-600">{advantage.stat}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Your Benefit:</span>
                        <span className="font-medium text-gray-900">{advantage.benefit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Why Startups Trust Us */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="py-16 bg-white"
      >
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why 2,500+ Startups Trust MyeCA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive startup support with proven expertise and innovative solutions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Startup Expertise",
                description: "Deep understanding of startup challenges from incorporation to IPO with specialized CA team",
                icon: Lightbulb,
                color: "yellow"
              },
              {
                title: "Technology First",
                description: "AI-powered platform for real-time compliance monitoring and automated financial reporting",
                icon: Zap,
                color: "blue"
              },
              {
                title: "Investor Ready",
                description: "Professional documentation and reporting that meets investor and regulatory standards",
                icon: Shield,
                color: "green"
              },
              {
                title: "Scalable Solutions",
                description: "Flexible packages that grow with your startup from essentials to enterprise-level support",
                icon: TrendingUp,
                color: "purple"
              }
            ].map((factor, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="text-center hover:shadow-lg transition-shadow h-full">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 bg-gradient-to-r from-${factor.color}-500 to-${factor.color}-600 rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <factor.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{factor.title}</h3>
                    <p className="text-gray-600 text-sm">{factor.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        id="get-started"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="py-16 bg-gray-50"
      >
        <div className="container mx-auto px-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
                Ready to Scale Your Startup?
              </h2>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Join 2,500+ successful startups who trust MyeCA for their financial and compliance needs. 
                From {"\u20B9"}2,999/month essentials to enterprise solutions - we grow with you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-8">
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Your Package Today
                </Button>
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8">
                  <Phone className="w-5 h-5 mr-2" />
                  Free Startup Consultation
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <span>2,500+ Startups Served</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <span>{"\u20B9"}850+ Cr Funding Facilitated</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <span>98.5% Success Rate</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  <span>Complete Lifecycle Support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Dynamic Engagement Tooltips */}
      {!isCompleted && (
        <EngagementTooltip
          tooltips={startupTooltips}
          onComplete={markCompleted}
        />
      )}

      {/* Debug button for testing */}
      {import.meta.env.DEV && isCompleted && (
        <div className="fixed bottom-4 right-4">
          <Button 
            onClick={resetTooltips}
            className="bg-gray-800 text-white hover:bg-gray-700 text-xs px-3 py-2"
          >
            Reset Tooltips
          </Button>
        </div>
      )}
    </div>
  );
};

export default StartupServicesPage;