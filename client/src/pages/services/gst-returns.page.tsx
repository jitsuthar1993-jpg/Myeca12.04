import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Receipt, 
  FileText, 
  Clock, 
  Shield, 
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
  Star,
  IndianRupee,
  Target,
  Globe,
  Zap,
  FileCheck,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AnimatedServiceButton from "@/components/ui/animated-service-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CollapsibleFAQ } from "@/components/ui/collapsible-faq";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GSTReturnsPage() {
  const [selectedReturn, setSelectedReturn] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const gstReturns = [
    {
      return: "GSTR-1",
      frequency: "Monthly/Quarterly", 
      dueDate: "11th of following month",
      description: "Outward supplies of taxable goods and/or services",
      applicability: "All registered taxpayers",
      penalty: "\u20B9200 per day (max \u20B95,000)",
      changes2025: "3-year filing limit introduced, auto-locking after deadline",
      icon: Receipt,
      color: "blue"
    },
    {
      return: "GSTR-3B",
      frequency: "Monthly",
      dueDate: "20th of following month", 
      description: "Summary return with tax liability and input tax credit",
      applicability: "All registered taxpayers",
      penalty: "\u20B950 per day per return",
      changes2025: "Hard locking implemented, no filing after 3 years",
      icon: FileText,
      color: "green"
    },
    {
      return: "GSTR-2A",
      frequency: "Auto-generated",
      dueDate: "Not applicable",
      description: "Auto-drafted ITC statement based on supplier filings",
      applicability: "All registered taxpayers",
      penalty: "No penalty (system generated)",
      changes2025: "Real-time updates with supplier GSTR-1 filings",
      icon: Download,
      color: "purple"
    },
    {
      return: "GSTR-9",
      frequency: "Annual",
      dueDate: "31st December (for previous FY)",
      description: "Annual return consolidating all monthly/quarterly returns",
      applicability: "Turnover > \u20B92 crores",
      penalty: "0.25% of turnover (min \u20B925,000)",
      changes2025: "Simplified format with auto-population from monthly returns",
      icon: BookOpen,
      color: "orange"
    }
  ];

  const gstRates2025 = [
    {
      rate: "0%",
      items: ["Essential food items", "Educational services", "Healthcare", "Books & newspapers"],
      examples: "Rice, wheat, milk, education fees"
    },
    {
      rate: "5%",
      items: ["Essential goods", "Transport services", "Small restaurants"],
      examples: "Sugar, tea, coffee, economy class air travel"
    },
    {
      rate: "12%",
      items: ["Standard goods", "Business services", "Processed foods"],
      examples: "Medicines, business class travel, packed foods"
    },
    {
      rate: "18%",
      items: ["Most goods & services", "IT services", "Financial services"],
      examples: "Mobile phones, software, banking services"
    },
    {
      rate: "28%",
      items: ["Luxury goods", "Demerit goods", "Automobiles"],
      examples: "Cars, tobacco, luxury items"
    }
  ];

  const complianceCalendar = [
    {
      date: "10th",
      activity: "TDS/TCS Return Filing",
      description: "File quarterly TDS/TCS returns",
      icon: CreditCard
    },
    {
      date: "11th", 
      activity: "GSTR-1 Due",
      description: "Monthly/Quarterly outward supplies",
      icon: Receipt
    },
    {
      date: "13th",
      activity: "GSTR-6 Due",
      description: "Input Service Distributor returns",
      icon: Building2
    },
    {
      date: "20th",
      activity: "GSTR-3B Due", 
      description: "Summary return with tax payment",
      icon: FileText
    }
  ];

  const commonMistakes = [
    {
      mistake: "Incorrect GSTIN in invoices",
      impact: "Input tax credit denial",
      solution: "Verify GSTIN before invoice generation",
      icon: AlertTriangle,
      color: "red"
    },
    {
      mistake: "Mismatched invoice data in GSTR-1",
      impact: "Reconciliation issues",
      solution: "Regular data validation before filing",
      icon: FileCheck,
      color: "orange"
    },
    {
      mistake: "Late filing of returns",
      impact: "Penalty and interest charges",
      solution: "Set up automated filing reminders",
      icon: Clock,
      color: "yellow"
    },
    {
      mistake: "Incorrect ITC claims",
      impact: "Scrutiny and demand notices",
      solution: "Proper documentation and verification",
      icon: Shield,
      color: "blue"
    }
  ];

  const documentRequirements = [
    {
      category: "Sales Documents",
      icon: Receipt,
      color: "blue",
      documents: [
        "All sales invoices for the period",
        "Credit notes and debit notes issued",
        "Export invoices and shipping bills",
        "E-way bills for inter-state movement",
        "Job work challans and delivery notes",
        "Advance receipts and adjustment invoices"
      ]
    },
    {
      category: "Purchase Documents",
      icon: Upload,
      color: "green", 
      documents: [
        "Purchase invoices from suppliers",
        "Import invoices and custom documents",
        "Inward supplies subject to reverse charge",
        "Credit notes and debit notes received",
        "Input service invoices and receipts",
        "Capital goods purchase invoices"
      ]
    },
    {
      category: "ITC Documents",
      icon: Award,
      color: "purple",
      documents: [
        "GSTR-2A downloaded from portal",
        "ITC reconciliation statements",
        "Input tax credit eligibility certificates",
        "Stock transfer and branch transfer invoices",
        "Previous period ITC reversals",
        "ITC on capital goods calculation sheets"
      ]
    }
  ];

  const penaltyStructure = [
    {
      violation: "Late filing of GSTR-1",
      timeLimit: "Beyond due date",
      penalty: "\u20B9200 per day (max \u20B95,000)",
      additionalConsequences: "Restriction on filing GSTR-3B"
    },
    {
      violation: "Late filing of GSTR-3B",
      timeLimit: "Beyond 20th",
      penalty: "\u20B950 per day per return",
      additionalConsequences: "Interest @18% on outstanding tax"
    },
    {
      violation: "Non-filing of Annual Return",
      timeLimit: "Beyond 31st December",
      penalty: "0.25% of turnover (min \u20B925,000)",
      additionalConsequences: "Cancellation of registration"
    },
    {
      violation: "Incorrect ITC Claims",
      timeLimit: "Upon detection",
      penalty: "Interest + 24% additional tax",
      additionalConsequences: "Prosecution for tax evasion"
    }
  ];

  const newFeatures2025 = [
    {
      feature: "3-Year Filing Limit",
      description: "Returns older than 3 years cannot be filed",
      impact: "Strict deadline adherence required",
      icon: Clock
    },
    {
      feature: "Hard Locking System",
      description: "Auto-lock returns after deadline passes",
      impact: "No amendments possible after lock",
      icon: Shield
    },
    {
      feature: "Real-time ITC Matching",
      description: "Instant verification of input tax credits",
      impact: "Faster refund processing",
      icon: Zap
    },
    {
      feature: "AI-powered Validation",
      description: "Automated error detection before filing",
      impact: "Reduced compliance issues",
      icon: Target
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
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center soft-shadow">
                  <Receipt className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  GST Returns Filing Services
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                File GSTR-1, GSTR-3B, and Annual Return with 2025 compliance updates and expert help.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold">
                  <Receipt className="w-4 h-4 mr-2" />
                  File GST Returns
                </Button>
                <Link href="/expert-consultation?service=gst-returns">
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    GST Expert Consultation
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Meet deadlines, avoid penalties</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    GSTR-1 by 11th, GSTR-3B by 20th each month.
                  </li>
                  <li className="flex items-start">
                    <Download className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Reconcile GSTR-2A with purchases monthly.
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Hard locking after deadlines; avoid late fees.
                  </li>
                  <li className="flex items-start">
                    <Award className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Maintain documentation for 72 months post filing.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* GST Returns Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              GST Returns Filing with 2025 Updates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete guide to all GST returns with latest 2025 changes and compliance requirements
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {gstReturns.map((returnType, index) => (
              <Card key={index} className={`border-l-4 border-l-${returnType.color}-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-${returnType.color}-100 text-${returnType.color}-600`}>
                      <returnType.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">{returnType.return}</CardTitle>
                      <Badge className={`mt-1 bg-${returnType.color}-100 text-${returnType.color}-700`}>
                        {returnType.frequency}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Due Date:</span>
                      <Badge variant="outline" className="text-xs">{returnType.dueDate}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Penalty:</span>
                      <span className="text-red-600 text-xs font-semibold">{returnType.penalty}</span>
                    </div>
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="text-gray-600 text-xs mt-1">{returnType.description}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">2025 Changes:</h4>
                    <p className="text-xs text-gray-700 bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
                      {returnType.changes2025}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-sm">Applicability:</span>
                    <p className="text-xs text-gray-600 mt-1">{returnType.applicability}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* GST Rates 2025 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Current GST Rate Structure 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Updated GST rates and applicable goods/services categories
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GST Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Examples</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {gstRates2025.map((rate, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-lg text-blue-600">{rate.rate}</td>
                    <td className="px-6 py-4">
                      <ul className="text-sm text-gray-700 space-y-1">
                        {rate.items.map((item, itemIndex) => (
                          <li key={itemIndex}>• {item}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{rate.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Monthly Compliance Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Monthly GST Compliance Calendar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Important dates and deadlines for GST compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceCalendar.map((calendar, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-blue-100 text-blue-600">
                    <calendar.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900">{calendar.date}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <h4 className="font-semibold text-sm mb-2">{calendar.activity}</h4>
                  <p className="text-xs text-gray-600">{calendar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Document Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Required Documents for GST Filing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete documentation checklist for accurate GST return filing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {documentRequirements.map((docCategory, index) => (
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

        {/* New Features 2025 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              New GST Portal Features 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Latest technology enhancements for improved GST compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newFeatures2025.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900">{feature.feature}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">{feature.impact}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Common Mistakes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Common GST Filing Mistakes to Avoid
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn from common errors and ensure accurate GST compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {commonMistakes.map((mistake, index) => {
              const colorClasses = {
                red: "border-l-red-500 text-red-900",
                orange: "border-l-orange-500 text-orange-900",
                yellow: "border-l-yellow-500 text-yellow-900",
                blue: "border-l-blue-500 text-blue-900"
              };
              
              return (
                <Card key={index} className={`border-l-4 ${colorClasses[mistake.color as keyof typeof colorClasses]?.split(' ')[0] || 'border-l-gray-500'} hover:shadow-lg transition-shadow`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${colorClasses[mistake.color as keyof typeof colorClasses]?.split(' ')[1] || 'text-gray-900'}`}>
                      <mistake.icon className="w-6 h-6" />
                      {mistake.mistake}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-red-600">Impact:</h4>
                        <p className="text-sm text-gray-700">{mistake.impact}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-green-600">Solution:</h4>
                        <p className="text-sm text-gray-700">{mistake.solution}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Penalty Structure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              GST Penalty Structure 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Detailed penalty information for various GST compliance violations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Violation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penalty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Additional Consequences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {penaltyStructure.map((penalty, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-blue-600">{penalty.violation}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{penalty.timeLimit}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-bold">{penalty.penalty}</td>
                    <td className="px-6 py-4 text-xs text-gray-600">{penalty.additionalConsequences}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              Common queries about GST returns filing and compliance
            </p>
          </div>

          <CollapsibleFAQ
            items={[
              {
                id: 1,
                question: "What is GST and who needs to file GST returns?",
                answer: "GST (Goods and Services Tax) is an indirect tax levied on the supply of goods and services in India. Businesses with annual turnover exceeding \u20B920 lakh (\u20B910 lakh for special category states) must register for GST and file monthly/quarterly returns. Even voluntary registrations require regular filing."
              },
              {
                id: 2,
                question: "What are the key changes in GST filing for 2025?",
                answer: "Major 2025 updates include: 3-year filing limit (returns older than 3 years cannot be filed), hard locking system (no amendments after deadline), real-time ITC matching for instant verification, and AI-powered validation to detect errors before filing."
              },
              {
                id: 3,
                question: "What happens if I file GSTR-1 or GSTR-3B late?",
                answer: "GSTR-1 late filing: \u20B9200 per day penalty (maximum \u20B95,000) plus restriction on filing GSTR-3B. GSTR-3B late filing: \u20B950 per day penalty plus 18% interest on outstanding tax liability. With the new hard locking system, late filing becomes impossible after the 3-year limit."
              },
              {
                id: 4,
                question: "How do I reconcile my GSTR-2A with purchase invoices?",
                answer: "GSTR-2A is auto-generated based on your suppliers' GSTR-1 filings. Compare your purchase invoices with GSTR-2A data monthly. Discrepancies may arise from supplier non-filing, incorrect GSTIN on invoices, or delayed supplier returns. Contact suppliers immediately for mismatches and maintain proper documentation."
              },
              {
                id: 5,
                question: "Can I claim Input Tax Credit (ITC) on all business purchases?",
                answer: "No, ITC is blocked on certain items: motor vehicles (except specific business use), food and beverages, outdoor catering, beauty treatments, health services, rent-a-cab services, and works contract services for personal use. Ensure proper invoices and supplier GST compliance for eligible ITC claims."
              },
              {
                id: 6,
                question: "What documents should I maintain for GST compliance?",
                answer: "Maintain all sales/purchase invoices, credit/debit notes, e-way bills, bank statements, GSTR-2A downloads, export/import documents, job work challans, stock transfer documents, and payment proof for taxes. Records must be preserved for 72 months from the due date of annual return filing."
              },
              {
                id: 7,
                question: "What is the difference between CGST, SGST, and IGST?",
                answer: "CGST (Central GST): Collected by central government on intrastate supplies. SGST (State GST): Collected by state government on intrastate supplies. IGST (Integrated GST): Collected on interstate supplies and imports. For local sales within state, CGST + SGST applies; for interstate sales, IGST applies."
              },
              {
                id: 8,
                question: "What is the reverse charge mechanism and when does it apply?",
                answer: "Under reverse charge, the recipient pays GST instead of the supplier. It applies to specific services like legal, architect, interior decoration, manpower supply, security services, and goods like cashew nuts. The recipient must self-assess and pay GST, then claim ITC if eligible."
              },
              {
                id: 9,
                question: "Can I file nil returns if I have no business transactions?",
                answer: "Yes, nil returns must be filed even with zero turnover. File GSTR-1 and GSTR-3B with nil values by their respective due dates. This maintains GST registration validity and avoids cancellation. Our nil return filing service costs \u20B9590 for both returns with compliance support."
              },
              {
                id: 10,
                question: "What should I do if I receive a GST notice or demand?",
                answer: "Respond promptly within the specified timeframe (usually 30 days). Gather all supporting documents, analyze the notice thoroughly, and provide detailed explanations with evidence. Consider professional assistance for complex notices. Our experts handle GST notice responses with 95% success rate in avoiding penalties."
              }
            ]}
            subtitle="Common queries about GST returns filing and compliance"
            className="mb-16"
            accentColor="blue"
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
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Need Expert GST Filing Assistance?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Our GST experts ensure accurate and timely filing of all returns with complete 
                compliance to 2025 regulations. Avoid penalties with professional assistance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 shadow-lg">
                  <Receipt className="w-5 h-5 mr-2" />
                  File GST Returns \u20B9590/month
                </Button>
                <Link href="/expert-consultation?service=gst-returns">
                  <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white border-0 px-8 shadow-lg font-semibold">
                    <Phone className="w-5 h-5 mr-2" />
                    Get Expert Consultation
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-blue-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>99.9% Accuracy Guarantee</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Same Day Filing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>2025 Compliance Updates</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
