import { useState } from "react";
import { m } from "framer-motion";
import { Link } from "wouter";
import { RouteSeo } from "@/components/seo/RouteSeo";
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
      frequency: "Monthly or quarterly",
      dueDate: "Confirm for the filing period",
      description: "Outward supplies of taxable goods and/or services",
      applicability: "Registered persons required to furnish outward-supply details",
      penalty: "Late fee and downstream filing restrictions may apply",
      updateCheck: "Confirm the period-specific due date and whether an older return remains available under the GST portal's three-year filing restriction.",
      icon: Receipt,
      color: "blue"
    },
    {
      return: "GSTR-3B",
      frequency: "Monthly or quarterly",
      dueDate: "Confirm for the filing period",
      description: "Summary return with tax liability and input tax credit",
      applicability: "Registered persons required to furnish a summary return",
      penalty: "Late fee and interest may apply",
      updateCheck: "Reconcile liability, cash ledger, and eligible credit before filing; portal validations and filing restrictions can change the available action.",
      icon: FileText,
      color: "green"
    },
    {
      return: "GSTR-2B",
      frequency: "Auto-generated",
      dueDate: "Not applicable",
      description: "Static auto-drafted ITC statement for the period",
      applicability: "Used with purchase records to review eligible input tax credit",
      penalty: "No filing obligation for the statement itself",
      updateCheck: "Compare GSTR-2B with purchase records and investigate missing, duplicated, blocked, or otherwise ineligible credit before claiming ITC.",
      icon: Download,
      color: "purple"
    },
    {
      return: "GSTR-9",
      frequency: "Annual",
      dueDate: "Confirm for the financial year",
      description: "Annual return consolidating all monthly/quarterly returns",
      applicability: "Turnover- and category-based applicability; exemptions can vary by year",
      penalty: "Late fee may apply when the return is required",
      updateCheck: "Confirm annual-return applicability, threshold, exemption notifications, and due date for the relevant financial year.",
      icon: BookOpen,
      color: "orange"
    }
  ];

  const gstRateExamples = [
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
        "GSTR-2B downloaded from portal",
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
      timeLimit: "After the period-specific due date",
      penalty: "Late fee depends on the return, delay, and current relief notifications",
      additionalConsequences: "Downstream filing or invoice-reporting restrictions may apply"
    },
    {
      violation: "Late filing of GSTR-3B",
      timeLimit: "After the period-specific due date",
      penalty: "Late fee and interest on unpaid tax may apply",
      additionalConsequences: "Ledger balances and later filings can be affected"
    },
    {
      violation: "Non-filing of Annual Return",
      timeLimit: "After the applicable annual-return due date",
      penalty: "Late fee depends on current law and turnover-linked rules",
      additionalConsequences: "The portal may surface compliance action or notices"
    },
    {
      violation: "Incorrect ITC Claims",
      timeLimit: "When identified through reconciliation or review",
      penalty: "Reversal, tax, interest, and penalty exposure depend on the facts",
      additionalConsequences: "Document the correction and response trail"
    }
  ];

  const portalChecks = [
    {
      feature: "3-Year Filing Limit",
      description: "Older returns can become unavailable under the portal filing restriction",
      impact: "Check open periods early",
      icon: Clock
    },
    {
      feature: "Portal Availability",
      description: "Available actions depend on return status, period, and linked filings",
      impact: "Review before submission",
      icon: Shield
    },
    {
      feature: "ITC Reconciliation Checks",
      description: "Input tax credit verification checks",
      impact: "Earlier mismatch review",
      icon: Zap
    },
    {
      feature: "Filing Validation Checks",
      description: "Automated error detection before filing",
      impact: "Reduced data issues",
      icon: Target
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 service-page">
      <RouteSeo path="/services/gst-returns" />
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center soft-shadow">
                  <Receipt className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="type-page-title font-bold text-slate-900">
                  GST Returns Filing Services
                </h1>
              </div>
              <p className="text-base md:text-lg text-slate-600 max-w-2xl leading-relaxed mb-6">
                Reconcile books, identify the returns due for the period, and review portal validations before filing.
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
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Meet deadlines, avoid penalties</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Confirm each return's due date and filing frequency on the GST portal.
                  </li>
                  <li className="flex items-start">
                    <Download className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Reconcile purchase records with GSTR-2B before claiming ITC.
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Review older open periods before the portal's three-year restriction applies.
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
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-slate-900 mb-4">
              GST Returns Filing Guidance
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Return-by-return scope, record requirements, and portal checks
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
                      <p className="text-slate-600 text-xs mt-1">{returnType.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">What to verify:</h4>
                    <p className="text-xs text-slate-700 bg-yellow-50 p-2 rounded border-l-2 border-yellow-400">
                      {returnType.updateCheck}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-sm">Applicability:</span>
                    <p className="text-xs text-slate-600 mt-1">{returnType.applicability}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* GST rate classification examples */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-slate-900 mb-4">
              GST Rate Slabs for Classification Review
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              These are broad examples, not a rate determination. Verify the HSN or SAC, notification, supply facts, and conditions before invoicing.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-slate-200 rounded-lg">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">GST Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Categories</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Examples</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {gstRateExamples.map((rate, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-lg text-blue-600">{rate.rate}</td>
                    <td className="px-6 py-4">
                      <ul className="text-sm text-slate-700 space-y-1">
                        {rate.items.map((item, itemIndex) => (
                          <li key={itemIndex}>• {item}</li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{rate.examples}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </m.div>

        {/* Monthly Compliance Calendar */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-slate-900 mb-4">
              Monthly GST Compliance Calendar
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
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
                  <p className="text-xs text-slate-600">{calendar.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Document Requirements */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-slate-900 mb-4">
              Required Documents for GST Filing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
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
                        <span className="text-sm text-slate-700">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* GST portal checks */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-slate-900 mb-4">
              GST Portal Checks Before Filing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The portal can validate, restrict, or change available actions based on the filing period and linked returns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {portalChecks.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900">{feature.feature}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-slate-600 mb-3">{feature.description}</p>
                  <Badge className="bg-blue-100 text-blue-700 text-xs">{feature.impact}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Common Mistakes */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-slate-900 mb-4">
              Common GST Filing Mistakes to Avoid
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
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
                    <CardTitle className={`flex items-center gap-2 ${colorClasses[mistake.color as keyof typeof colorClasses]?.split(' ')[1] || 'text-slate-900'}`}>
                      <mistake.icon className="w-6 h-6" />
                      {mistake.mistake}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold text-sm text-red-600">Impact:</h4>
                        <p className="text-sm text-slate-700">{mistake.impact}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-green-600">Solution:</h4>
                        <p className="text-sm text-slate-700">{mistake.solution}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </m.div>

        {/* Penalty Structure */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-slate-900 mb-4">
              Late-Filing and Correction Risks
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Exact late fees, interest, relief, and consequences depend on the return, period, facts, and current notifications.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-slate-200 rounded-lg">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Violation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Time Limit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Penalty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Additional Consequences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {penaltyStructure.map((penalty, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-blue-600">{penalty.violation}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{penalty.timeLimit}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-bold">{penalty.penalty}</td>
                    <td className="px-6 py-4 text-xs text-slate-600">{penalty.additionalConsequences}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </m.div>

        {/* FAQ Section */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Common queries about GST returns filing and compliance
            </p>
          </div>

          <CollapsibleFAQ
            items={[
              {
                id: 1,
                question: "What is GST and who needs to file GST returns?",
                answer: "GST is an indirect tax on supplies of goods and services. Registration and return obligations depend on turnover, state, supply type, business category, compulsory-registration provisions, exemptions, and whether the person registered voluntarily. Confirm the applicable trigger before treating any single turnover figure as decisive."
              },
              {
                id: 2,
                question: "What should I check before filing a GST return?",
                answer: "Confirm the return and period shown on the GST portal, reconcile sales and purchase records, review GSTR-2B before claiming ITC, check cash and credit ledgers, and resolve portal validations. Also review current notifications when relying on an extension, waiver, or exemption."
              },
              {
                id: 3,
                question: "What happens if I file GSTR-1 or GSTR-3B late?",
                answer: "Late filing can trigger late fees, interest on unpaid tax, downstream filing restrictions, and loss of access to older periods under the portal's three-year filing restriction. The exact result depends on the return, period, liability, and any current relief notification; check the portal calculation before payment or submission."
              },
              {
                id: 4,
                question: "How do I reconcile GSTR-2B with purchase invoices?",
                answer: "Match GSTR-2B against the purchase register by supplier GSTIN, invoice number, date, taxable value, tax amount, place of supply, and eligibility. Investigate missing or duplicate invoices, supplier amendments, blocked credits, and prior-period claims before deciding the ITC amount to report."
              },
              {
                id: 5,
                question: "Can I claim Input Tax Credit (ITC) on all business purchases?",
                answer: "No, ITC is blocked on certain items: motor vehicles (except specific business use), food and beverages, outdoor catering, beauty treatments, health services, rent-a-cab services, and works contract services for personal use. Ensure proper invoices and supplier GST compliance for eligible ITC claims."
              },
              {
                id: 6,
                question: "What documents should I maintain for GST compliance?",
                answer: "Maintain sales and purchase invoices, credit and debit notes, e-way bills, bank and ledger evidence, GSTR-2B reconciliation, export or import documents, job-work and stock-transfer records, and tax-payment proof. Retention requirements depend on the applicable GST record-keeping rule and any ongoing proceeding, so document the relevant period before archiving."
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
                answer: "Yes, nil returns must be filed even with zero turnover. File GSTR-1 and GSTR-3B with nil values by their respective due dates. This maintains GST registration validity and avoids cancellation. Our nil return filing service costs ₹590 for both returns with compliance support."
              },
              {
                id: 10,
                question: "What should I do if I receive a GST notice or demand?",
                answer: "Respond promptly within the specified timeframe (usually 30 days). Gather all supporting documents, analyze the notice thoroughly, and provide detailed explanations with evidence. Consider professional assistance for complex notices and keep a clear response record."
              }
            ]}
            subtitle="Common queries about GST returns filing and compliance"
            className="mb-16"
            accentColor="blue"
            allowMultiple={false}
            defaultOpenIndex={0}
          />
        </m.div>

        {/* Expert Assistance CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.6 }}
        >
          <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50 shadow-sm">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4 text-slate-900">
                Need Expert GST Filing Assistance?
              </h3>
              <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                Get help identifying the returns due, reconciling books with portal data, and preparing a filing-ready exception list. Final filing still depends on your records and the current portal position.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 px-8 shadow-sm">
                  <Receipt className="w-5 h-5 mr-2" />
                  File GST Returns Rs 590/month
                </Button>
                <Link href="/expert-consultation?service=gst-returns">
                  <Button size="lg" variant="outline" className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50 px-8 shadow-sm font-semibold">
                    <Phone className="w-5 h-5 mr-2" />
                    Get Expert Consultation
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-slate-600">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Validation before filing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Timely filing support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Period-specific compliance checks</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </m.div>
      </div>
    </div>
  );
}
