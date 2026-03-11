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
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  Calendar,
  Calculator,
  AlertCircle,
  BookOpen,
  Building2,
  User,
  CreditCard,
  Globe,
  Package,
  Truck,
  Store,
  Factory,
  Upload
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

export default function GstRegistrationPage() {
  const [businessType, setBusinessType] = useState<string>("");
  const [annualTurnover, setAnnualTurnover] = useState<string>("");

  const gstThresholds = [
    {
      state: "Regular States",
      threshold: "\u20B940 lakhs",
      description: "For supply of goods in most states",
      mandatory: "Above threshold"
    },
    {
      state: "Special Category States",
      threshold: "\u20B920 lakhs", 
      description: "NE states, Himachal Pradesh, Uttarakhand, J&K",
      mandatory: "Above threshold"
    },
    {
      state: "Services",
      threshold: "\u20B920 lakhs",
      description: "For service providers across India",
      mandatory: "Above threshold"
    },
    {
      state: "E-commerce",
      threshold: "\u20B90",
      description: "Mandatory for all e-commerce operators",
      mandatory: "Compulsory"
    }
  ];

  const gstRegistrationTypes = [
    {
      id: "regular",
      title: "Regular GST Registration",
      description: "Standard GST registration for most businesses",
      suitableFor: "Manufacturers, traders, service providers",
      features: [
        "Input tax credit available",
        "Can issue tax invoices", 
        "Monthly/quarterly returns",
        "Inter-state supply allowed"
      ],
      documents: 8,
      timeline: "7-10 days",
      color: "blue"
    },
    {
      id: "composition",
      title: "Composition Scheme",
      description: "Simplified GST scheme for small businesses",
      suitableFor: "Small retailers, restaurants, manufacturers",
      features: [
        "Lower tax rates (1%, 2%, 5%)",
        "Quarterly returns only",
        "No input tax credit",
        "Only intra-state supply"
      ],
      documents: 6,
      timeline: "5-7 days", 
      color: "green"
    },
    {
      id: "casual",
      title: "Casual Taxable Person",
      description: "For occasional business activities",
      suitableFor: "Exhibition participants, event organizers",
      features: [
        "Temporary registration",
        "Maximum 90 days validity",
        "Advance tax deposit required",
        "Can be extended"
      ],
      documents: 5,
      timeline: "3-5 days",
      color: "orange"
    },
    {
      id: "voluntary",
      title: "Voluntary Registration",
      description: "Optional registration below threshold",
      suitableFor: "Businesses below turnover threshold",
      features: [
        "Input tax credit benefits",
        "Professional credibility",
        "Wider market access",
        "Government tenders eligibility"
      ],
      documents: 8,
      timeline: "7-10 days",
      color: "purple"
    }
  ];

  const requiredDocuments = [
    {
      category: "Identity Proof",
      documents: [
        "PAN Card of Business/Proprietor",
        "Aadhaar Card of Authorized Signatory",
        "Passport Size Photographs"
      ]
    },
    {
      category: "Business Proof",
      documents: [
        "Business Registration Certificate",
        "Partnership Deed/MOA & AOA",
        "Udyog Aadhaar/MSME Certificate"
      ]
    },
    {
      category: "Address Proof",
      documents: [
        "Electricity Bill/Rent Agreement",
        "Property Tax Receipt",
        "NOC from Property Owner"
      ]
    },
    {
      category: "Banking",
      documents: [
        "Bank Account Statement (3 months)",
        "Cancelled Cheque Copy",
        "Bank Account Opening Letter"
      ]
    }
  ];

  const gstBenefits = [
    {
      title: "Input Tax Credit",
      description: "Claim credit on taxes paid on purchases and reduce overall tax liability",
      icon: Calculator
    },
    {
      title: "Legal Recognition", 
      description: "Government-recognized business status enhancing credibility",
      icon: Award
    },
    {
      title: "Nationwide Sales",
      description: "Sell products/services across India with inter-state supply capability",
      icon: Globe
    },
    {
      title: "Government Contracts",
      description: "Participate in government tenders and get large business contracts", 
      icon: Building2
    },
    {
      title: "Easy Compliance",
      description: "Simplified tax filing with online returns and automated processes",
      icon: FileText
    },
    {
      title: "Business Growth",
      description: "Scale operations, attract investors, and expand market reach",
      icon: TrendingUp
    }
  ];

  const registrationProcess = [
    {
      step: 1,
      title: "Document Collection",
      description: "Gather all required documents including PAN, Aadhaar, business proof, and address proof",
      icon: FileText,
      color: "blue"
    },
    {
      step: 2, 
      title: "Application Preparation",
      description: "Prepare GST REG-01 application with accurate business details and document upload",
      icon: Calculator,
      color: "green"
    },
    {
      step: 3,
      title: "Online Submission",
      description: "Submit application on GST portal with required fees and await acknowledgment",
      icon: Upload,
      color: "purple"
    },
    {
      step: 4,
      title: "Verification & Approval", 
      description: "Department verification, possible queries resolution, and GST certificate issuance",
      icon: CheckCircle,
      color: "orange"
    }
  ];

  const pricingPlans = [
    {
      type: "Basic GST Registration",
      price: "\u20B92,999",
      originalPrice: "\u20B94,999",
      features: [
        "Complete documentation",
        "Online application filing",
        "GST certificate",
        "Basic compliance guidance"
      ],
      popular: false
    },
    {
      type: "Premium GST Package",
      price: "\u20B94,999", 
      originalPrice: "\u20B97,999",
      features: [
        "Everything in Basic",
        "First 3 months returns filing",
        "HSN/SAC code mapping",
        "Dedicated CA support"
      ],
      popular: true
    },
    {
      type: "Complete Business Setup",
      price: "\u20B98,999",
      originalPrice: "\u20B912,999",
      features: [
        "Company registration + GST",
        "Bank account opening",
        "6 months compliance",
        "Business advisory"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-emerald-50 service-page">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                  <Receipt className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  GST Registration Services
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Complete registration with expert guidance and documentation support in 7–10 days.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 font-semibold">
                  <Receipt className="w-4 h-4 mr-2" />
                  Register Now
                </Button>
                <Link href="/expert-consultation?service=gst-registration">
                  <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-5 py-2.5 font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    Expert Consultation
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Before you start</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Check turnover threshold: \u20B940L goods, \u20B920L services.
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" />
                    Prepare PAN, Aadhaar, address proof, bank proof.
                  </li>
                  <li className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Inter-state supply requires regular registration.
                  </li>
                  <li className="flex items-start">
                    <CreditCard className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    E-commerce sellers must register regardless of turnover.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* GST Threshold & Mandatory Registration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <AlertCircle className="w-6 h-6" />
                GST Registration Thresholds - FY 2024-25
              </CardTitle>
              <CardDescription>
                Know when GST registration becomes mandatory for your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {gstThresholds.map((threshold, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border border-green-200 bg-green-50"
                  >
                    <h4 className="font-semibold text-green-900 mb-2">{threshold.state}</h4>
                    <div className="text-2xl font-bold text-green-600 mb-2">{threshold.threshold}</div>
                    <p className="text-sm text-gray-600 mb-3">{threshold.description}</p>
                    <Badge 
                      className={`w-full justify-center ${
                        threshold.mandatory === 'Compulsory' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {threshold.mandatory}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* GST Registration Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Types of GST Registration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the right GST registration type based on your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {gstRegistrationTypes.map((type) => (
              <Card 
                key={type.id}
                className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-l-4 ${
                  type.color === 'blue' ? 'border-l-blue-500' :
                  type.color === 'green' ? 'border-l-green-500' :
                  type.color === 'orange' ? 'border-l-orange-500' :
                  'border-l-purple-500'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      type.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                      type.color === 'green' ? 'bg-green-100 text-green-600' :
                      type.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                      'bg-purple-100 text-purple-600'
                    }`}>
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div className="text-right text-sm">
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {type.timeline}
                      </div>
                      <div className="flex items-center text-gray-600 mt-1">
                        <FileText className="w-4 h-4 mr-1" />
                        {type.documents} documents
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">{type.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Suitable For:</div>
                    <div className="text-sm text-gray-600">{type.suitableFor}</div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-3">Key Features:</div>
                    <ul className="space-y-2">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Choose This Option
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
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
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <FileText className="w-6 h-6" />
                Required Documents for GST Registration
              </CardTitle>
              <CardDescription>
                Complete checklist of documents needed for hassle-free GST registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {requiredDocuments.map((category, index) => (
                  <div key={index} className="space-y-3">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-2">
                        <FileText className="w-4 h-4 text-emerald-600" />
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

        {/* Registration Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              4-Step GST Registration Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple and streamlined process to get your GST registration completed
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
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Benefits of GST Registration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Benefits of GST Registration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock business growth opportunities with GST registration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gstBenefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-green-600" />
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

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <Receipt className="w-6 h-6" />
                Start Your GST Registration
              </CardTitle>
              <CardDescription>
                Fill in your business details and get started with GST registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Your business information is secure and handled by our expert CA team
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="business-name">Business/Company Name</Label>
                <Input id="business-name" placeholder="Enter your business name" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="business-type">Business Type</Label>
                  <Select value={businessType} onValueChange={setBusinessType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="proprietorship">Proprietorship</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="pvt-ltd">Private Limited</SelectItem>
                      <SelectItem value="public-ltd">Public Limited</SelectItem>
                      <SelectItem value="llp">LLP</SelectItem>
                      <SelectItem value="trust">Trust</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="annual-turnover">Expected Annual Turnover</Label>
                  <Select value={annualTurnover} onValueChange={setAnnualTurnover}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select turnover" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="below-20">Below \u20B920 Lakhs</SelectItem>
                      <SelectItem value="20-40">\u20B920-40 Lakhs</SelectItem>
                      <SelectItem value="40-100">\u20B940 Lakhs - 1 Crore</SelectItem>
                      <SelectItem value="above-100">Above \u20B91 Crore</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner-name">Owner/Director Name</Label>
                  <Input id="owner-name" placeholder="Enter name" />
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
                <Label htmlFor="business-address">Business Address</Label>
                <Textarea 
                  id="business-address" 
                  placeholder="Enter complete business address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-activity">Nature of Business Activity</Label>
                <Textarea 
                  id="business-activity" 
                  placeholder="Describe your business activities, products/services offered"
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 bg-green-600 hover:bg-green-700">
                  <Receipt className="w-4 h-4 mr-2" />
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

        {/* Pricing Plans */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              GST Registration Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the package that best suits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index}
                className={`relative ${plan.popular ? 'border-2 border-green-500 shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-500 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-xl font-bold">{plan.type}</CardTitle>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-3xl font-bold text-green-600">{plan.price}</span>
                    <span className="text-lg text-gray-500 line-through">{plan.originalPrice}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-gray-600 hover:bg-gray-700'
                    }`}
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-8">
            Trusted by 50,000+ businesses • 99.9% success rate • Expert CA team
          </p>
        </motion.div>
      </div>
    </div>
  );
}
