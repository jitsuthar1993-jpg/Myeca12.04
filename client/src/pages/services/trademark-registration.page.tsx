import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Shield, 
  FileText, 
  Clock, 
  Star, 
  CheckCircle, 
  Phone, 
  Mail, 
  Download,
  Award,
  TrendingUp,
  ArrowRight,
  Calendar,
  Calculator,
  AlertCircle,
  BookOpen,
  CreditCard,
  Building2,
  User,
  Upload,
  IndianRupee,
  Target,
  Globe,
  Zap,
  FileCheck,
  AlertTriangle,
  Search,
  Eye,
  Scale,
  Users,
  Briefcase
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedServiceButton from "@/components/ui/animated-service-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CollapsibleFAQ } from "@/components/ui/collapsible-faq";

export default function TrademarkRegistrationPage() {
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const registrationProcess = [
    {
      step: 1,
      title: "Trademark Search",
      duration: "1-2 days",
      description: "Comprehensive search across existing trademarks to ensure uniqueness",
      activities: ["Database search", "Similarity analysis", "Class identification", "Risk assessment"],
      icon: Search,
      color: "blue"
    },
    {
      step: 2,
      title: "Application Filing",
      duration: "3-5 days",
      description: "Professional filing with IP India including all required documentation",
      activities: ["Form preparation", "Class selection", "Fee payment", "Document submission"],
      icon: FileText,
      color: "green"
    },
    {
      step: 3,
      title: "Examination",
      duration: "12-18 months",
      description: "Government examination for compliance and potential objections",
      activities: ["Formal examination", "Substantive examination", "Objection handling", "Response filing"],
      icon: Eye,
      color: "orange"
    },
    {
      step: 4,
      title: "Publication",
      duration: "4 months",
      description: "Publication in Trademark Journal for opposition period",
      activities: ["Journal publication", "Opposition monitoring", "Opposition response", "Final clearance"],
      icon: BookOpen,
      color: "purple"
    },
    {
      step: 5,
      title: "Registration",
      duration: "2-3 months",
      description: "Final registration certificate issuance with 10-year validity",
      activities: ["Certificate preparation", "Registration number allocation", "Certificate dispatch", "Database update"],
      icon: Award,
      color: "indigo"
    },
    {
      step: 6,
      title: "Renewal",
      duration: "Ongoing",
      description: "10-year renewable protection with reminder services",
      activities: ["Renewal reminders", "Fee payment", "Certificate update", "Protection maintenance"],
      icon: Calendar,
      color: "teal"
    }
  ];

  const feeStructure2025 = [
    {
      applicantType: "Individual/Startup/Small Enterprise",
      filingFee: "\u20B94,500",
      searchFee: "\u20B91,500", 
      totalGovtFee: "\u20B96,000",
      professionalFee: "\u20B96,999",
      totalCost: "\u20B912,999",
      savings: "Save \u20B94,500 vs Standard",
      color: "green"
    },
    {
      applicantType: "Other than Small Enterprise",
      filingFee: "\u20B99,000",
      searchFee: "\u20B92,500",
      totalGovtFee: "\u20B911,500", 
      professionalFee: "\u20B98,999",
      totalCost: "\u20B920,499",
      savings: "Standard Rate",
      color: "blue"
    },
    {
      applicantType: "Foreign Applicant",
      filingFee: "\u20B918,000",
      searchFee: "\u20B95,000",
      totalGovtFee: "\u20B923,000",
      professionalFee: "\u20B912,999", 
      totalCost: "\u20B935,999",
      savings: "Includes priority claim",
      color: "purple"
    }
  ];

  const trademarkClasses = [
    {
      classNumber: "Class 9",
      description: "Computer software, mobile apps, electronics",
      examples: "Software, apps, computers, phones, cameras",
      popular: true
    },
    {
      classNumber: "Class 25", 
      description: "Clothing, footwear, headgear",
      examples: "Shirts, shoes, hats, uniforms, sportswear",
      popular: true
    },
    {
      classNumber: "Class 35",
      description: "Advertising, business management, retail services",
      examples: "Marketing, e-commerce, consulting, retail stores",
      popular: true
    },
    {
      classNumber: "Class 42",
      description: "Technology services, software development",
      examples: "IT services, cloud computing, web development",
      popular: true
    },
    {
      classNumber: "Class 5",
      description: "Pharmaceuticals, medical preparations",
      examples: "Medicines, supplements, medical devices",
      popular: false
    },
    {
      classNumber: "Class 30",
      description: "Food products, beverages",
      examples: "Packaged foods, beverages, confectionery",
      popular: false
    }
  ];

  const requiredDocuments = [
    {
      category: "Identity Documents",
      icon: User,
      color: "blue",
      documents: [
        "PAN Card of applicant (individual/company)",
        "Aadhaar Card (for individual applicants)",
        "Passport (for foreign applicants)",
        "Address proof of applicant",
        "Passport size photographs (2 copies)",
        "Authorized signatory proof (for companies)"
      ]
    },
    {
      category: "Business Documents", 
      icon: Building2,
      color: "green",
      documents: [
        "Certificate of Incorporation (companies)",
        "Partnership deed (partnerships)",
        "Proprietorship declaration (proprietorship)",
        "MSME/Startup certificate (if applicable)",
        "Business registration certificate",
        "GST registration certificate"
      ]
    },
    {
      category: "Trademark Documents",
      icon: Shield,
      color: "purple",
      documents: [
        "Trademark logo in JPG format (high resolution)",
        "Word mark details (if text-based)",
        "Class specification and goods/services list",
        "Priority document (if claiming priority)",
        "Power of Attorney (signed and notarized)",
        "User affidavit (if already in use)"
      ]
    }
  ];

  const trademarkBenefits = [
    {
      benefit: "Legal Protection",
      description: "Exclusive rights to use the trademark nationwide",
      icon: Shield,
      color: "blue"
    },
    {
      benefit: "Brand Recognition",
      description: "Enhanced brand value and customer recognition",
      icon: Star,
      color: "yellow"
    },
    {
      benefit: "Commercial Value",
      description: "Trademarked brands command premium pricing",
      icon: TrendingUp,
      color: "green"
    },
    {
      benefit: "Legal Recourse",
      description: "Right to take legal action against infringement",
      icon: Scale,
      color: "purple"
    },
    {
      benefit: "Business Asset",
      description: "Transferable intellectual property asset",
      icon: Briefcase,
      color: "orange"
    },
    {
      benefit: "Global Expansion",
      description: "Foundation for international trademark protection",
      icon: Globe,
      color: "indigo"
    }
  ];

  const renewalTimeline = [
    {
      period: "Year 1-9",
      requirement: "No action required",
      description: "Trademark remains valid with initial registration",
      icon: CheckCircle,
      color: "green"
    },
    {
      period: "Year 9-10",
      requirement: "Renewal notice period",
      description: "6-month advance notice for renewal preparation",
      icon: Calendar,
      color: "yellow"
    },
    {
      period: "Year 10",
      requirement: "Renewal filing",
      description: "Submit renewal application with required fees",
      icon: FileText,
      color: "blue"
    },
    {
      period: "Post Renewal",
      requirement: "Next 10-year term",
      description: "Trademark protection extended for another decade",
      icon: Award,
      color: "purple"
    }
  ];

  const commonRejectionReasons = [
    {
      reason: "Similarity with existing trademark",
      frequency: "40%",
      solution: "Comprehensive pre-filing search and modification",
      icon: Search,
      color: "red"
    },
    {
      reason: "Descriptive or generic mark",
      frequency: "25%", 
      solution: "Choose distinctive and unique marks",
      icon: AlertTriangle,
      color: "orange"
    },
    {
      reason: "Improper class specification",
      frequency: "20%",
      solution: "Accurate class selection with expert guidance",
      icon: FileCheck,
      color: "yellow"
    },
    {
      reason: "Incomplete documentation",
      frequency: "15%",
      solution: "Complete document checklist verification",
      icon: Upload,
      color: "blue"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 service-page">
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center soft-shadow">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Trademark Registration Services
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Complete registration from search to certificate with 10-year protection. Updated 2025 fee structure.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 font-semibold">
                  <Shield className="w-4 h-4 mr-2" />
                  Start Registration
                </Button>
                <Link href="/expert-consultation?service=trademark-registration">
                  <Button size="sm" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-5 py-2.5 font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    IP Expert Consultation
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Strengthen your application</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Search className="w-4 h-4 mr-2 text-purple-600 mt-0.5" />
                    Do a comprehensive search to reduce rejection risk.
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Prepare logo (JPG), class list, and POA in advance.
                  </li>
                  <li className="flex items-start">
                    <Eye className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Monitor objections during examination and respond timely.
                  </li>
                  <li className="flex items-start">
                    <Award className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Renew every 10 years to maintain protection.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 6-Step Registration Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Complete 6-Step Registration Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              End-to-end trademark registration process with expert guidance at each step
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {registrationProcess.map((step, index) => {
              const colorClasses = {
                blue: "border-l-blue-500 bg-blue-100 text-blue-600 text-blue-700 text-blue-500",
                green: "border-l-green-500 bg-green-100 text-green-600 text-green-700 text-green-500",
                purple: "border-l-purple-500 bg-purple-100 text-purple-600 text-purple-700 text-purple-500",
                orange: "border-l-orange-500 bg-orange-100 text-orange-600 text-orange-700 text-orange-500",
                red: "border-l-red-500 bg-red-100 text-red-600 text-red-700 text-red-500",
                indigo: "border-l-indigo-500 bg-indigo-100 text-indigo-600 text-indigo-700 text-indigo-500"
              };
              
              return (
                <Card key={index} className={`border-l-4 ${colorClasses[step.color as keyof typeof colorClasses]?.split(' ')[0] || 'border-l-gray-500'} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${colorClasses[step.color as keyof typeof colorClasses]?.split(' ')[1] || 'bg-gray-100'} ${colorClasses[step.color as keyof typeof colorClasses]?.split(' ')[2] || 'text-gray-600'}`}>
                        <step.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">Step {step.step}: {step.title}</CardTitle>
                        <Badge className={`mt-1 ${colorClasses[step.color as keyof typeof colorClasses]?.split(' ')[1] || 'bg-gray-100'} ${colorClasses[step.color as keyof typeof colorClasses]?.split(' ')[3] || 'text-gray-700'}`}>
                          {step.duration}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                    
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Key Activities:</h4>
                      <ul className="space-y-1">
                        {step.activities.map((activity, actIndex) => (
                          <li key={actIndex} className="flex items-start text-xs">
                            <CheckCircle className={`w-3 h-3 mr-2 ${colorClasses[step.color as keyof typeof colorClasses]?.split(' ')[4] || 'text-gray-500'} flex-shrink-0 mt-0.5`} />
                            {activity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* 2025 Fee Structure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Government Fee Structure 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Updated trademark registration fees with startup and small enterprise benefits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {feeStructure2025.map((fee, index) => (
              <Card key={index} className={`border-l-4 border-l-${fee.color}-500 hover:shadow-lg transition-shadow ${index === 0 ? 'ring-2 ring-green-200' : ''}`}>
                <CardHeader>
                  <CardTitle className={`text-${fee.color}-900`}>{fee.applicantType}</CardTitle>
                  {index === 0 && (
                    <Badge className="bg-green-100 text-green-700 w-fit">Most Popular</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span>Filing Fee:</span>
                      <span className="font-semibold">{fee.filingFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Search Fee:</span>
                      <span className="font-semibold">{fee.searchFee}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Total Govt Fee:</span>
                      <span className="font-bold text-red-600">{fee.totalGovtFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional Fee:</span>
                      <span className="font-semibold">{fee.professionalFee}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-bold">Total Cost:</span>
                      <span className="font-bold text-2xl text-blue-600">{fee.totalCost}</span>
                    </div>
                  </div>
                  
                  <Badge className={`w-full justify-center bg-${fee.color}-100 text-${fee.color}-700`}>
                    {fee.savings}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Popular Trademark Classes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Trademark Classes
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right class for your trademark registration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trademarkClasses.map((tmClass, index) => (
              <Card key={index} className={`hover:shadow-lg transition-shadow ${tmClass.popular ? 'ring-2 ring-purple-200' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-900">{tmClass.classNumber}</CardTitle>
                    {tmClass.popular && (
                      <Badge className="bg-purple-100 text-purple-700">Popular</Badge>
                    )}
                  </div>
                  <CardDescription className="font-semibold">{tmClass.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Examples: </span>
                    {tmClass.examples}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Required Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Required Documents Checklist
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete documentation requirements for trademark registration
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {requiredDocuments.map((docCategory, index) => (
              <Card key={index} className={`border-l-4 border-l-${docCategory.color}-500 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-${docCategory.color}-900`}>
                    <docCategory.icon className="w-6 h-6" />
                    {docCategory.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {docCategory.documents.map((doc, docIndex) => (
                      <li key={docIndex} className="flex items-start">
                        <CheckCircle className={`w-4 h-4 mr-3 text-${docCategory.color}-500 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Trademark Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Benefits of Trademark Registration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive protection and business advantages of registered trademarks
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trademarkBenefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-${benefit.color}-100 text-${benefit.color}-600`}>
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">{benefit.benefit}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Renewal Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              10-Year Renewal Timeline
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trademark protection lifecycle and renewal requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {renewalTimeline.map((renewal, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-${renewal.color}-100 text-${renewal.color}-600`}>
                    <renewal.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">{renewal.period}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <h4 className="font-semibold text-sm mb-2">{renewal.requirement}</h4>
                  <p className="text-xs text-gray-600">{renewal.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Common Rejection Reasons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Common Rejection Reasons & Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from common mistakes and ensure successful trademark registration
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {commonRejectionReasons.map((rejection, index) => {
              const colorClasses = {
                red: "border-l-red-500 text-red-900 bg-red-100 text-red-700",
                orange: "border-l-orange-500 text-orange-900 bg-orange-100 text-orange-700",
                yellow: "border-l-yellow-500 text-yellow-900 bg-yellow-100 text-yellow-700",
                blue: "border-l-blue-500 text-blue-900 bg-blue-100 text-blue-700"
              };
              
              return (
                <Card key={index} className={`border-l-4 ${colorClasses[rejection.color as keyof typeof colorClasses]?.split(' ')[0] || 'border-l-gray-500'} hover:shadow-lg transition-shadow`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className={`flex items-center gap-2 ${colorClasses[rejection.color as keyof typeof colorClasses]?.split(' ')[1] || 'text-gray-900'}`}>
                        <rejection.icon className="w-6 h-6" />
                        {rejection.reason}
                      </CardTitle>
                      <Badge className={`${colorClasses[rejection.color as keyof typeof colorClasses]?.split(' ')[2] || 'bg-gray-100'} ${colorClasses[rejection.color as keyof typeof colorClasses]?.split(' ')[3] || 'text-gray-700'}`}>
                        {rejection.frequency}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <h4 className="font-semibold text-sm text-green-600 mb-1">Solution:</h4>
                      <p className="text-sm text-gray-700">{rejection.solution}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Common queries about trademark registration process and protection
            </p>
          </div>

          <CollapsibleFAQ
            items={[
              {
                id: 1,
                question: "What is a trademark and why should I register it?",
                answer: "A trademark is any distinctive sign, symbol, word, or design that identifies and distinguishes your goods/services from competitors. Registration provides exclusive nationwide rights, legal protection against infringement, enhanced brand value, and the foundation for global expansion. It's a valuable business asset that can be licensed, sold, or used as collateral."
              },
              {
                id: 2,
                question: "How long does trademark registration take and what are the costs?",
                answer: "The complete process takes 12-18 months including examination, publication, and registration. 2025 costs: Individual/Startup \u20B94,500, Small Enterprise \u20B94,500, Standard \u20B99,000, Foreign \u20B918,000 (government fees). Our professional services start from \u20B912,999 including search, filing, and complete assistance until registration."
              },
              {
                id: 3,
                question: "Can I use my trademark before registration is complete?",
                answer: "Yes, you can use your trademark immediately after filing the application. You'll receive a 'TM' symbol right to use, which provides statutory protection. However, full exclusive rights and the '®' symbol are only available after registration certificate issuance. Early use also strengthens your application."
              },
              {
                id: 4,
                question: "What happens if my trademark application is rejected?",
                answer: "Common rejection reasons include similarity with existing marks (40%), descriptive nature (25%), wrong class selection (20%), or incomplete documents (15%). You can file a response within 30 days addressing objections, modify the application, or provide supporting evidence. Our experts handle objection responses with high success rates."
              },
              {
                id: 5,
                question: "How do I choose the right class for my trademark?",
                answer: "Select classes based on your actual goods/services. Popular classes include: Class 9 (software/electronics), Class 25 (clothing), Class 35 (business services/retail), Class 42 (IT services). You can register in multiple classes but must pay separate fees for each. Our experts help identify the most appropriate classes for your business."
              },
              {
                id: 6,
                question: "Is trademark search mandatory before filing?",
                answer: "While not legally mandatory, trademark search is highly recommended to avoid rejection and conflicts. Our comprehensive search covers identical marks, similar marks, phonetic similarities, and visual similarities across all 45 classes. This reduces rejection risk and saves time and money in the long run."
              },
              {
                id: 7,
                question: "Can I register a trademark that's already in use by someone else?",
                answer: "No, you cannot register an identical or confusingly similar trademark in the same or related class. However, the same mark can be registered in different unrelated classes by different parties. Prior user rights may also apply even without registration, which is why thorough search and legal advice are essential before filing."
              },
              {
                id: 8,
                question: "What documents do I need for trademark registration?",
                answer: "Required documents include: applicant PAN and Aadhaar, business registration certificate, high-resolution trademark logo (JPG format), detailed goods/services list, power of attorney, user affidavit (if already using), and priority document (if claiming foreign priority). Company applicants need incorporation certificate and authorized signatory details."
              },
              {
                id: 9,
                question: "How long is trademark protection valid and can it be renewed?",
                answer: "Trademark registration is valid for 10 years from the date of registration and can be renewed indefinitely for successive 10-year periods. Renewal applications must be filed between 6 months before expiry and 6 months after (with additional fees). We provide renewal reminder services to ensure continuous protection."
              },
              {
                id: 10,
                question: "What can I do if someone infringes my registered trademark?",
                answer: "With registered trademark, you can: send cease and desist notices, file civil suits for injunction and damages, seek customs enforcement for imports, file opposition against similar mark applications, and claim monetary compensation. Registration provides strong legal standing in courts and enforcement agencies for protecting your brand rights."
              }
            ]}
            subtitle="Common queries about trademark registration process and protection"
            className="mb-16"
            accentColor="purple"
            allowMultiple={false}
            defaultOpenIndex={0}
          />
        </motion.div>

        {/* Expert Assistance CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Protect Your Brand?
              </h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Our trademark experts handle the complete registration process from search to certificate. 
                Secure your brand with 10-year protection starting from {"\u20B9"}12,999.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-purple-50 px-8">
                  <Shield className="w-5 h-5 mr-2" />
                  Register Trademark \u20B912,999
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600 px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Free Trademark Search
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-purple-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>95% Success Rate</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Expert IP Lawyers</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>10-Year Protection</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
