import { useState } from "react";
import { m } from "framer-motion";
import { Link } from "wouter";
import { 
  PiggyBank, 
  FileText, 
  Clock, 
  Shield, 
  CheckCircle, 
  Phone, 
  Mail, 
  Download,
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  Calendar,
  Calculator,
  AlertCircle,
  BookOpen,
  Receipt,
  CreditCard,
  Building2,
  User,
  Upload,
  Globe
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceCheckoutModal } from "@/components/services/ServiceCheckoutModal";

export default function TdsFilingPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(799);
  const [checkoutTitle, setCheckoutTitle] = useState("TDS Return Filing");
  const [selectedForm, setSelectedForm] = useState<string>("");
  const [deductorType, setDeductorType] = useState<string>("");

  const tdsFormsData = [
    {
      id: "24q",
      title: "Form 24Q",
      subtitle: "TDS on Salary",
      description: "Quarterly TDS return for salary payments to employees",
      dueDate: "31st of the month following quarter end",
      penalty: "₹200/day",
      color: "blue",
      features: [
        "Salary TDS deduction details",
        "Employee-wise TDS statements",
        "Form 16 generation support",
        "PF & ESI compliance"
      ]
    },
    {
      id: "26q",
      title: "Form 26Q", 
      subtitle: "TDS on Non-Salary (Domestic)",
      description: "Quarterly TDS return for payments other than salary to residents",
      dueDate: "15th of the month following quarter end",
      penalty: "₹200/day",
      color: "green",
      features: [
        "Professional fees TDS (194J)",
        "Contract payments TDS (194C)",
        "Rent TDS (194I)",
        "Commission/Brokerage TDS (194H)"
      ]
    },
    {
      id: "27q",
      title: "Form 27Q",
      subtitle: "TDS on Non-Salary (NRI/Foreign)",
      description: "Quarterly TDS return for payments to non-residents",
      dueDate: "15th of the month following quarter end", 
      penalty: "₹200/day",
      color: "purple",
      features: [
        "NRI payments",
        "Foreign remittances",
        "Technical services to NRI",
        "DTAA benefit claims"
      ]
    },
    {
      id: "27eq",
      title: "Form 27EQ",
      subtitle: "TCS Returns",
      description: "Quarterly TCS (Tax Collected at Source) returns",
      dueDate: "15th of the month following quarter end",
      penalty: "₹200/day", 
      color: "orange",
      features: [
        "E-commerce TCS (194O)",
        "Sale of goods TCS (206C)",
        "Foreign remittances TCS (206CC)",
        "Overseas travel TCS (206CCA)"
      ]
    }
  ];

  const tdsRatesData = [
    {
      section: "194A",
      type: "Interest",
      rate: "10%",
      threshold: "₹40,000 - ₹1,00,000",
      description: "Interest on bank deposits, bonds, debentures"
    },
    {
      section: "194C", 
      type: "Contractor Payments",
      rate: "1% (Individual/HUF), 2% (Others)",
      threshold: "₹30,000 per transaction / ₹1,00,000 per year",
      description: "Payments to contractors and sub-contractors"
    },
    {
      section: "194H",
      type: "Commission/Brokerage", 
      rate: "5%",
      threshold: "₹15,000 per year",
      description: "Commission, brokerage, discount payments"
    },
    {
      section: "194I",
      type: "Rent",
      rate: "2% (Plant/Machinery), 10% (Land/Building)",
      threshold: "₹2,40,000 per year",
      description: "Rent payments for property, plant, machinery"
    },
    {
      section: "194J",
      type: "Professional Fees",
      rate: "10% (Professional), 2% (Technical)",
      threshold: "₹30,000 per year", 
      description: "Fees to professionals, technical consultants"
    },
    {
      section: "192",
      type: "Salary",
      rate: "As per tax slab",
      threshold: "Above basic exemption limit",
      description: "Salary payments to employees"
    }
  ];

  const quarterlyDueDates = [
    {
      quarter: "Q1 (Apr-Jun 2024)",
      form24Q: "31st July 2024",
      otherForms: "15th July 2024",
      status: "completed"
    },
    {
      quarter: "Q2 (Jul-Sep 2024)", 
      form24Q: "31st October 2024",
      otherForms: "31st October 2024",
      status: "completed"
    },
    {
      quarter: "Q3 (Oct-Dec 2024)",
      form24Q: "31st January 2025",
      otherForms: "31st January 2025",
      status: "upcoming"
    },
    {
      quarter: "Q4 (Jan-Mar 2025)",
      form24Q: "31st May 2025", 
      otherForms: "31st May 2025",
      status: "upcoming"
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Data Collection & Validation",
      description: "Gather and verify all TDS deduction records, challan details, and deductee information",
      icon: FileText,
      color: "blue"
    },
    {
      step: 2,
      title: "Return Preparation",
      description: "Prepare accurate TDS returns using latest RPU/FVU utilities with error-free filing",
      icon: Calculator,
      color: "green"
    },
    {
      step: 3,
      title: "Filing & Submission", 
      description: "File returns on TRACES portal within due dates and obtain acknowledgment",
      icon: Upload,
      color: "purple"
    },
    {
      step: 4,
      title: "Certificate Generation",
      description: "Generate and issue TDS certificates (Form 16/16A) to deductees within 15 days",
      icon: Award,
      color: "orange"
    }
  ];

  const complianceFeatures = [
    {
      title: "Expert CA Assistance",
      description: "Qualified chartered accountants handle your TDS compliance",
      icon: Users
    },
    {
      title: "TRACES Portal Filing",
      description: "Direct filing on government TRACES portal with acknowledgment",
      icon: FileText
    },
    {
      title: "Error-Free Returns",
      description: "99.9% accuracy rate with thorough validation checks",
      icon: CheckCircle
    },
    {
      title: "Certificate Issuance",
      description: "Timely Form 16/16A certificate generation and distribution",
      icon: Award
    },
    {
      title: "Penalty Avoidance",
      description: "Timely filing to avoid late filing penalties and interest",
      icon: Shield
    },
    {
      title: "Revision Support",
      description: "Free revision filing for any corrections required",
      icon: ArrowRight
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center soft-shadow">
                  <PiggyBank className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  TDS & TCS Return Filing
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Complete compliance solution with quarterly return filing, certificate generation, and expert CA assistance.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="sm" 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 font-semibold"
                  onClick={() => {
                    setCheckoutPrice(799);
                    setCheckoutTitle("TDS Return Filing");
                    setIsCheckoutOpen(true);
                  }}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  File TDS Now
                </Button>
                <Link href="/expert-consultation?service=tds-filing">
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    Consult Expert
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
                <CardDescription>Helpful notes for faster filing</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Deposit TDS by the 7th of next month (30th Apr for March).
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    File 24Q/26Q/27Q/27EQ within one month after quarter end.
                  </li>
                  <li className="flex items-start">
                    <Award className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Issue Form 16/16A within 15 days of return filing.
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Late filing fee is {"₹"}200/day; avoid penalties by timely filing.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Who Must File TDS/TCS Returns */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Who Must File TDS & TCS Returns?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding mandatory deductor obligations and filing requirements under Income Tax Act
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Mandatory Deductors */}
            <Card className="border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertCircle className="w-6 h-6" />
                  Mandatory TDS Deductors
                </CardTitle>
                <CardDescription>
                  Entities legally required to deduct and file TDS returns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">All Employers</div>
                      <div className="text-sm text-gray-600">Must deduct TDS on salary payments (Section 192)</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Companies & Businesses</div>
                      <div className="text-sm text-gray-600">On professional fees, rent, commission above thresholds</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Banks & Financial Institutions</div>
                      <div className="text-sm text-gray-600">On interest payments exceeding {"₹"}40,000 annually</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Property Buyers</div>
                      <div className="text-sm text-gray-600">1% TDS on property purchases above {"₹"}50 lakhs</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">E-commerce Operators</div>
                      <div className="text-sm text-gray-600">0.1% TDS on seller payments (Section 194O)</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-red-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">High-Value Individual/HUF</div>
                      <div className="text-sm text-gray-600">Business turnover &gt;{"₹"}1 crore or profession &gt;{"₹"}50 lakhs</div>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* TCS Deductors */}
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <Receipt className="w-6 h-6" />
                  TCS Collection Requirements
                </CardTitle>
                <CardDescription>
                  Who must collect and file TCS returns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Overseas Remittance Services</div>
                      <div className="text-sm text-gray-600">5% TCS on foreign remittances via LRS above ₹7 lakhs</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Motor Vehicle Dealers</div>
                      <div className="text-sm text-gray-600">1% TCS on vehicle sales above ₹10 lakhs</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Goods/Services Sellers</div>
                      <div className="text-sm text-gray-600">0.1% TCS on receipts above ₹50 lakhs (Section 206C(1H))</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Overseas Tour Packages</div>
                      <div className="text-sm text-gray-600">5% TCS on tour packages above ₹2 lakhs</div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-3 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <div className="font-medium">Luxury/High-Value Items</div>
                      <div className="text-sm text-gray-600">Various rates on jewelry, cash transactions</div>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Key Requirements */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <FileText className="w-6 h-6" />
                Essential Requirements for TDS/TCS Deductors
              </CardTitle>
              <CardDescription>
                Mandatory compliance steps before you can deduct TDS/TCS
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Obtain TAN</h4>
                  <p className="text-sm text-gray-600">Tax Deduction Account Number mandatory for most deductors</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">TRACES Registration</h4>
                  <p className="text-sm text-gray-600">Register on official TDS portal (www.tdscpc.gov.in)</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Maintain Records</h4>
                  <p className="text-sm text-gray-600">Keep detailed books of accounts and deduction records</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment & Filing Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Calendar className="w-6 h-6" />
                Deductor Compliance Timeline
              </CardTitle>
              <CardDescription>
                Monthly and quarterly obligations for TDS/TCS deductors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-600" />
                    Monthly Obligations
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">1</span>
                      </div>
                      <div>
                        <div className="font-medium">Deduct TDS/TCS</div>
                        <div className="text-sm text-gray-600">At prescribed rates during payments</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-blue-600">7</span>
                      </div>
                      <div>
                        <div className="font-medium">Deposit to Government</div>
                        <div className="text-sm text-gray-600">By 7th of following month (30th April for March)</div>
                      </div>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-green-600" />
                    Quarterly Obligations
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="w-8 h-6 bg-green-100 rounded flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-green-600">Q</span>
                      </div>
                      <div>
                        <div className="font-medium">File TDS/TCS Returns</div>
                        <div className="text-sm text-gray-600">24Q/26Q/27Q/27EQ by quarter end + 1 month</div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="w-8 h-6 bg-green-100 rounded flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-green-600">15</span>
                      </div>
                      <div>
                        <div className="font-medium">Issue TDS Certificates</div>
                        <div className="text-sm text-gray-600">Form 16/16A within 15 days of filing</div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </m.div>

        {/* TDS Forms Overview */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              TDS/TCS Forms We Handle
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert filing services for all quarterly TDS and TCS returns with 100% accuracy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tdsFormsData.map((form) => (
              <Card 
                key={form.id} 
                className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 ${
                  form.color === 'blue' ? 'border-l-blue-500' :
                  form.color === 'green' ? 'border-l-green-500' :
                  form.color === 'purple' ? 'border-l-purple-500' :
                  'border-l-orange-500'
                }`}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    form.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    form.color === 'green' ? 'bg-green-100 text-green-600' :
                    form.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <FileText className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl font-bold">{form.title}</CardTitle>
                  <CardDescription className="text-sm font-medium text-gray-700">
                    {form.subtitle}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{form.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2 text-red-500" />
                      <span className="font-medium">Due: {form.dueDate}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <AlertCircle className="w-4 h-4 mr-2 text-orange-500" />
                      <span>Penalty: {form.penalty}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-2">Coverage:</h4>
                    <ul className="space-y-1">
                      {form.features.slice(0, 2).map((feature, index) => (
                        <li key={index} className="flex items-center text-xs">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* TDS Rates Section */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <Calculator className="w-6 h-6" />
                TDS Rates FY 2024-25 - Key Sections
              </CardTitle>
              <CardDescription>
                Latest TDS rates and threshold limits effective for current financial year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-semibold">Section</th>
                      <th className="text-left py-3 font-semibold">Payment Type</th>
                      <th className="text-left py-3 font-semibold">TDS Rate</th>
                      <th className="text-left py-3 font-semibold">Threshold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tdsRatesData.map((rate, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">
                          <Badge variant="outline" className="font-mono font-bold">
                            {rate.section}
                          </Badge>
                        </td>
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{rate.type}</div>
                            <div className="text-sm text-gray-600">{rate.description}</div>
                          </div>
                        </td>
                        <td className="py-3 font-semibold text-blue-600">{rate.rate}</td>
                        <td className="py-3 text-sm">{rate.threshold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </m.div>

        {/* Quarterly Due Dates */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Calendar className="w-6 h-6" />
                Quarterly Filing Due Dates - FY 2024-25
              </CardTitle>
              <CardDescription>
                Important due dates for TDS/TCS return filing to avoid penalties
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {quarterlyDueDates.map((quarter, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${
                      quarter.status === 'completed' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-yellow-50 border-yellow-200'
                    }`}
                  >
                    <h4 className="font-semibold mb-3">{quarter.quarter}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Form 24Q:</span>
                        <span className="font-medium">{quarter.form24Q}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Others:</span>
                        <span className="font-medium">{quarter.otherForms}</span>
                      </div>
                      <Badge 
                        className={`w-full justify-center mt-2 ${
                          quarter.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {quarter.status === 'completed' ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </m.div>

        {/* Filing Process */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our 4-Step TDS Filing Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamlined process ensuring 100% compliance and timely filing
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {processSteps.map((step, index) => (
              <Card key={step.step} className="text-center p-6 relative">
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    step.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    step.color === 'green' ? 'bg-green-100 text-green-600' :
                    step.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Features & Benefits */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our TDS Filing Services?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive TDS compliance with expert support and guaranteed accuracy
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {complianceFeatures.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <FileText className="w-6 h-6" />
                Get Started with TDS Filing
              </CardTitle>
              <CardDescription>
                Share your requirements and get expert assistance within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your data is completely secure and handled by qualified CAs only
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company/Business Name</Label>
                  <Input id="company-name" placeholder="Enter business name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tan-number">TAN Number</Label>
                  <Input id="tan-number" placeholder="Enter TAN number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="form-type">TDS Form Type</Label>
                <Select value={selectedForm} onValueChange={setSelectedForm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select TDS form" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24q">Form 24Q - Salary TDS</SelectItem>
                    <SelectItem value="26q">Form 26Q - Non-Salary TDS (Domestic)</SelectItem>
                    <SelectItem value="27q">Form 27Q - Non-Salary TDS (NRI/Foreign)</SelectItem>
                    <SelectItem value="27eq">Form 27EQ - TCS Returns</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deductor-type">Deductor Type</Label>
                <Select value={deductorType} onValueChange={setDeductorType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select deductor type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="partnership">Partnership Firm</SelectItem>
                    <SelectItem value="proprietorship">Proprietorship</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Contact Person</Label>
                  <Input id="contact-name" placeholder="Enter contact name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Enter phone number" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter email address" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Additional Requirements</Label>
                <Textarea 
                  id="requirements" 
                  placeholder="Describe your TDS filing requirements, number of deductees, quarterly data, etc."
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Start TDS Filing
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Expert
                </Button>
              </div>
            </CardContent>
          </Card>
        </m.div>

        {/* Pricing & CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">TDS Filing Service Pricing</h3>
              <div className="flex justify-center items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-indigo-600">₹799</span>
                <span className="text-lg text-gray-600">per quarter</span>
                <Badge className="bg-green-100 text-green-800">Starting Price</Badge>
              </div>
              <p className="text-gray-600">Comprehensive TDS filing with expert CA support</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                All TDS forms support
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Certificate generation
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Expert CA assistance
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                99.9% accuracy guaranteed
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700 px-8"
                onClick={() => setIsCheckoutOpen(true)}
              >
                <FileText className="w-5 h-5 mr-2" />
                File TDS Return Now
              </Button>
              <Button size="lg" variant="outline" className="border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white px-8">
                <Phone className="w-5 h-5 mr-2" />
                Consult Expert CA
              </Button>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Trusted by 10,000+ businesses • 99.9% filing accuracy • Expert CA team
            </p>
          </Card>
        </m.div>

      </div>
      {isCheckoutOpen && (
        <ServiceCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          serviceId="tds-filing"
          serviceTitle={checkoutTitle}
          category="Tax & Filing Services"
          priceAmount={checkoutPrice}
        />
      )}
    </div>
  );
}
