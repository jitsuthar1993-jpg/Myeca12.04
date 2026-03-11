import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Building2, 
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
  Globe,
  User,
  Upload,
  BadgeCheck,
  Briefcase,
  Scale,
  Home
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

export default function CompanyRegistrationPage() {
  const [companyType, setCompanyType] = useState<string>("");
  const [authorizedCapital, setAuthorizedCapital] = useState<string>("");

  const companyTypes = [
    {
      id: "private-limited",
      title: "Private Limited Company",
      description: "Most popular choice for startups and growing businesses",
      minMembers: "2-200",
      liability: "Limited",
      compliance: "Moderate",
      features: [
        "Limited liability protection",
        "Separate legal entity",
        "Easy to raise funding",
        "Transferable shares"
      ],
      suitableFor: "Startups, SMEs, businesses seeking investment",
      registrationFee: "\u20B96,999",
      color: "blue"
    },
    {
      id: "one-person-company",
      title: "One Person Company (OPC)",
      description: "Perfect for solo entrepreneurs with limited liability",
      minMembers: "1",
      liability: "Limited",
      compliance: "Low",
      features: [
        "Single person ownership",
        "Limited liability",
        "No minimum paid-up capital",
        "Easier compliance"
      ],
      suitableFor: "Individual entrepreneurs, consultants",
      registrationFee: "\u20B94,999",
      color: "green"
    },
    {
      id: "public-limited",
      title: "Public Limited Company",
      description: "For large businesses planning to go public",
      minMembers: "7-Unlimited",
      liability: "Limited",
      compliance: "High",
      features: [
        "Can raise funds from public",
        "Shares traded on stock exchange",
        "Professional management",
        "High credibility"
      ],
      suitableFor: "Large businesses, IPO planning",
      registrationFee: "\u20B912,999",
      color: "purple"
    },
    {
      id: "llp",
      title: "Limited Liability Partnership",
      description: "Flexible structure combining partnership benefits with limited liability",
      minMembers: "2-Unlimited",
      liability: "Limited",
      compliance: "Low",
      features: [
        "Flexible management",
        "Limited liability",
        "No minimum capital",
        "Tax benefits"
      ],
      suitableFor: "Professional services, partnerships",
      registrationFee: "\u20B93,999",
      color: "orange"
    }
  ];

  const registrationProcess = [
    {
      step: 1,
      title: "Name Reservation",
      description: "Apply for company name availability on MCA portal (RUN service)",
      timeline: "1-2 days",
      icon: FileText,
      color: "blue"
    },
    {
      step: 2,
      title: "Document Preparation",
      description: "Prepare MOA, AOA, and other incorporation documents",
      timeline: "2-3 days",
      icon: BookOpen,
      color: "green"
    },
    {
      step: 3,
      title: "MCA Filing",
      description: "File SPICe+ form with ROC along with required documents",
      timeline: "7-10 days",
      icon: Upload,
      color: "purple"
    },
    {
      step: 4,
      title: "Certificate Issuance",
      description: "Receive Certificate of Incorporation and complete registration",
      timeline: "1-2 days",
      icon: Award,
      color: "orange"
    }
  ];

  const requiredDocuments = [
    {
      category: "Directors/Shareholders",
      documents: [
        "PAN Card of all Directors/Shareholders",
        "Aadhaar Card of all Directors",
        "Passport size photographs",
        "Director's residential address proof"
      ]
    },
    {
      category: "Registered Office",
      documents: [
        "Rent Agreement/Sale Deed",
        "Electricity Bill/Property Tax Receipt",
        "NOC from Property Owner",
        "Utility Bill (not older than 2 months)"
      ]
    },
    {
      category: "Compliance Documents",
      documents: [
        "Digital Signature Certificate (DSC)",
        "Director Identification Number (DIN)",
        "Bank Account Opening Documents",
        "Memorandum & Articles of Association"
      ]
    }
  ];

  const complianceRequirements = [
    {
      frequency: "Annual",
      requirement: "Annual Filing (AOC-4 & MGT-7)",
      dueDate: "Within 30 days of AGM",
      penalty: "\u20B9100/day",
      description: "File annual financial statements and annual return"
    },
    {
      frequency: "Annual",
      requirement: "Income Tax Return",
      dueDate: "30th September",
      penalty: "\u20B95,000 - \u20B920,000",
      description: "File corporate income tax return"
    },
    {
      frequency: "Annual", 
      requirement: "Director KYC (DIR-3 KYC)",
      dueDate: "30th September",
      penalty: "\u20B95,000 per director",
      description: "Annual KYC filing for all directors"
    },
    {
      frequency: "Event-based",
      requirement: "Board Meetings",
      dueDate: "Quarterly",
      penalty: "\u20B925,000",
      description: "Minimum 4 board meetings per year"
    }
  ];

  const benefitsOfIncorporation = [
    {
      title: "Limited Liability Protection",
      description: "Personal assets are protected from business liabilities and debts",
      icon: Shield
    },
    {
      title: "Separate Legal Entity",
      description: "Company exists independently of its owners with perpetual succession",
      icon: Building2
    },
    {
      title: "Easy Fund Raising",
      description: "Attract investors, VCs, and access various funding opportunities",
      icon: TrendingUp
    },
    {
      title: "Tax Benefits",
      description: "Lower corporate tax rates and various business expense deductions",
      icon: Calculator
    },
    {
      title: "Business Credibility",
      description: "Enhanced trust with customers, suppliers, and financial institutions",
      icon: BadgeCheck
    },
    {
      title: "Transferable Ownership",
      description: "Easy transfer of ownership through share transfers",
      icon: ArrowRight
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50">
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center soft-shadow">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Company Registration Services
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Incorporate as Pvt Ltd, OPC, Public Ltd or LLP in 10–15 days with expert guidance.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold">
                  <Building2 className="w-4 h-4 mr-2" />
                  Register Company
                </Button>
                <Link href="/expert-consultation?service=company-registration">
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    Expert Consultation
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
                <CardDescription>Plan incorporation efficiently</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Reserve unique company name via RUN (MCA).
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Arrange DSC and DIN for directors in advance.
                  </li>
                  <li className="flex items-start">
                    <Home className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Keep registered office proofs and NOC ready.
                  </li>
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Expect 10–15 days for full approval.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Company Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Company Structure
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the right business structure based on your needs and goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {companyTypes.map((company) => (
              <Card 
                key={company.id}
                className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 ${
                  company.color === 'blue' ? 'border-l-blue-500' :
                  company.color === 'green' ? 'border-l-green-500' :
                  company.color === 'purple' ? 'border-l-purple-500' :
                  'border-l-orange-500'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      company.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      company.color === 'green' ? 'bg-green-100 text-green-600' :
                      company.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                      'bg-orange-100 text-orange-600'
                    }`}>
                      <Building2 className="w-6 h-6" />
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {company.registrationFee}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold">{company.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {company.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <div className="font-medium text-gray-700">Members</div>
                      <div className="text-gray-600">{company.minMembers}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Liability</div>
                      <div className="text-gray-600">{company.liability}</div>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">Compliance</div>
                      <div className="text-gray-600">{company.compliance}</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Suitable For:</div>
                    <div className="text-sm text-gray-600">{company.suitableFor}</div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-3">Key Features:</div>
                    <ul className="space-y-2">
                      {company.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Select This Structure
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Registration Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Company Registration Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple 4-step process to get your company registered and operational
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {registrationProcess.map((step, index) => (
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
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600 mb-3">{step.description}</p>
                <Badge className="bg-blue-100 text-blue-800">
                  {step.timeline}
                </Badge>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Required Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-900">
                <FileText className="w-6 h-6" />
                Required Documents for Company Registration
              </CardTitle>
              <CardDescription>
                Complete checklist of documents needed for company incorporation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {requiredDocuments.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-2">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      {category.category}
                    </h4>
                    <ul className="space-y-2">
                      {category.documents.map((doc, docIndex) => (
                        <li key={docIndex} className="flex items-start text-sm">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500 flex-shrink-0 mt-1" />
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits of Incorporation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits of Company Registration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Why incorporate your business and enjoy legal and financial advantages
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefitsOfIncorporation.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Compliance Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <Scale className="w-6 h-6" />
                Annual Compliance Requirements
              </CardTitle>
              <CardDescription>
                Important compliance deadlines and requirements for registered companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 font-semibold">Requirement</th>
                      <th className="text-left py-3 font-semibold">Frequency</th>
                      <th className="text-left py-3 font-semibold">Due Date</th>
                      <th className="text-left py-3 font-semibold">Penalty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceRequirements.map((req, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3">
                          <div>
                            <div className="font-medium">{req.requirement}</div>
                            <div className="text-sm text-gray-600">{req.description}</div>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline">{req.frequency}</Badge>
                        </td>
                        <td className="py-3 text-sm">{req.dueDate}</td>
                        <td className="py-3 text-sm font-semibold text-red-600">{req.penalty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Building2 className="w-6 h-6" />
                Start Your Company Registration
              </CardTitle>
              <CardDescription>
                Provide your details and get started with company incorporation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your information is secure and handled by qualified professionals
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="company-name">Proposed Company Name</Label>
                <Input id="company-name" placeholder="Enter desired company name" />
                <p className="text-sm text-gray-600">We'll check availability and suggest alternatives</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company-type">Company Type</Label>
                <Select value={companyType} onValueChange={setCompanyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select company structure" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private-limited">Private Limited Company</SelectItem>
                    <SelectItem value="one-person-company">One Person Company (OPC)</SelectItem>
                    <SelectItem value="public-limited">Public Limited Company</SelectItem>
                    <SelectItem value="llp">Limited Liability Partnership</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="authorized-capital">Authorized Capital</Label>
                <Select value={authorizedCapital} onValueChange={setAuthorizedCapital}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select authorized capital" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-lakh">\u20B91 Lakh</SelectItem>
                    <SelectItem value="5-lakh">\u20B95 Lakhs</SelectItem>
                    <SelectItem value="10-lakh">\u20B910 Lakhs</SelectItem>
                    <SelectItem value="25-lakh">\u20B925 Lakhs</SelectItem>
                    <SelectItem value="50-lakh">\u20B950 Lakhs</SelectItem>
                    <SelectItem value="1-crore">\u20B91 Crore</SelectItem>
                    <SelectItem value="custom">Custom Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="director-name">Director/Partner Name</Label>
                  <Input id="director-name" placeholder="Enter name" />
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
                <Label htmlFor="business-activity">Nature of Business</Label>
                <Textarea 
                  id="business-activity" 
                  placeholder="Describe your business activities and industry"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="registered-office">Proposed Registered Office</Label>
                <Textarea 
                  id="registered-office" 
                  placeholder="Enter complete address for registered office"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Building2 className="w-4 h-4 mr-2" />
                  Start Registration
                </Button>
                <Button variant="outline" className="flex-1">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Expert
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing & CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Company Registration Pricing</h3>
              <div className="flex justify-center items-baseline gap-2 mb-2">
                <span className="text-4xl font-bold text-blue-600">\u20B96,999</span>
                <span className="text-lg text-gray-600">all inclusive</span>
                <Badge className="bg-green-100 text-green-800">Best Value</Badge>
              </div>
              <p className="text-gray-600">Complete Private Limited Company registration</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Name reservation
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Document preparation
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                MCA filing & approval
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Certificate issuance
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                PAN & TAN application
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                Expert CA support
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8">
                <Building2 className="w-5 h-5 mr-2" />
                Register Now
              </Button>
              <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8">
                <Phone className="w-5 h-5 mr-2" />
                Consult Expert
              </Button>
            </div>

            <p className="text-sm text-gray-600 mt-4">
              Trusted by 25,000+ entrepreneurs • 10-15 days completion • Expert guidance
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
