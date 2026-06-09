import { useState } from "react";
import { m } from "framer-motion";
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
  Box,
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
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { ServiceCheckoutModal } from "@/components/services/ServiceCheckoutModal";
import StandardPricingSection from "@/components/pricing/StandardPricingSection";
import { getCheckoutAmount, getPricingByServiceId, getServicePriceForSchema } from "@/data/pricing";

export default function GstRegistrationPage() {
  const seo = getSEOConfig('/services/gst-registration');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(2999);
  const [checkoutTitle, setCheckoutTitle] = useState("GST Registration");
  const [businessType, setBusinessType] = useState<string>("");
  const [annualTurnover, setAnnualTurnover] = useState<string>("");
  const standardPricing = getPricingByServiceId("gst-registration");

  const gstThresholds = [
    {
      state: "Goods turnover reference",
      threshold: "Often ₹40 lakhs",
      description: "Confirm the state, supply mix, exclusions, and current notification.",
      mandatory: "Verify applicability"
    },
    {
      state: "Services turnover reference",
      threshold: "Often ₹20 lakhs",
      description: "Check aggregate turnover, state rules, and the nature of services.",
      mandatory: "Verify applicability"
    },
    {
      state: "Lower-threshold states",
      threshold: "May be lower",
      description: "Do not rely on a regular-state threshold without checking the registration state.",
      mandatory: "Verify state rule"
    },
    {
      state: "Activity-based triggers",
      threshold: "No single threshold",
      description: "Check e-commerce, inter-state, reverse-charge, and notified activities separately.",
      mandatory: "Verify transaction facts"
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
      timeline: "Portal-dependent",
      color: "blue"
    },
    {
      id: "composition",
      title: "Composition Scheme",
      description: "Simplified GST scheme for small businesses",
      suitableFor: "Small retailers, restaurants, manufacturers",
      features: [
        "Lower-rate option where eligible",
        "CMP-08 and annual-return obligations",
        "No input tax credit",
        "Supply restrictions apply"
      ],
      documents: 6,
      timeline: "Eligibility-dependent",
      color: "green"
    },
    {
      id: "casual",
      title: "Casual Taxable Person",
      description: "For occasional business activities",
      suitableFor: "Exhibition participants, event organizers",
      features: [
        "Time-bound registration",
        "Validity tied to the stated activity period",
        "Advance estimated-tax deposit",
        "Extension requires portal action"
      ],
      documents: 5,
      timeline: "Before taxable activity",
      color: "orange"
    },
    {
      id: "voluntary",
      title: "Voluntary Registration",
      description: "Optional registration below threshold",
      suitableFor: "Businesses below turnover threshold",
      features: [
        "Recurring GST returns after registration",
        "Tax-invoice readiness",
        "Input-credit eligibility subject to conditions",
        "Cancellation requires a separate process"
      ],
      documents: 8,
      timeline: "Portal-dependent",
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
      title: "Input tax credit eligibility",
      description: "Assess whether eligible purchase credits can be claimed and supported by invoices and supplier data",
      icon: Calculator
    },
    {
      title: "Tax-invoice readiness",
      description: "Prepare the records needed to issue compliant tax invoices after registration",
      icon: Award
    },
    {
      title: "Supply-model review",
      description: "Check how registration affects inter-state, e-commerce, and place-of-supply obligations",
      icon: Globe
    },
    {
      title: "Customer and tender requirements",
      description: "Confirm whether a customer, marketplace, or tender genuinely requires a GSTIN",
      icon: Building2
    },
    {
      title: "Recurring return obligations",
      description: "Understand the return, invoice, payment, and reconciliation work that starts after registration",
      icon: FileText
    },
    {
      title: "Defensible registration record",
      description: "Keep the application, supporting documents, queries, and certificate in one traceable file",
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
      description: "Submit GST REG-01 on the GST portal, record the ARN, and retain the filed application",
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
      price: "₹2,999",
      originalPrice: "₹4,999",
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
      price: "₹4,999", 
      originalPrice: "₹7,999",
      features: [
        "Everything in Basic",
        "First 3 months returns filing",
        "HSN/SAC code mapping",
        "Assigned expert support"
      ],
      popular: true
    },
    {
      type: "Complete Business Setup",
      price: "₹8,999",
      originalPrice: "₹12,999",
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
      <MetaSEO
        title={seo?.title || "GST Registration Online India | MyeCA.in"}
        description={seo?.description || "Get GST registration support with document preparation and portal filing guidance."}
        keywords={seo?.keywords}
        type={seo?.type || "service"}
        serviceData={{
          price: getServicePriceForSchema("gst-registration", seo?.serviceData?.price || "2999"),
          rating: seo?.serviceData?.rating || "Unrated",
          reviews: seo?.serviceData?.reviews || "0",
          availability: "https://schema.org/InStock"
        }}
        breadcrumbs={seo?.breadcrumbs}
        faqPageData={[
          {
            question: "What is the threshold for mandatory GST registration?",
            answer: "There is no single threshold that fits every business. Check aggregate turnover, state, goods and services mix, e-commerce or inter-state activity, reverse-charge exposure, and current GST notifications before deciding."
          },
          {
            question: "How long does it take to get a GST certificate?",
            answer: "The timeline depends on document completeness, Aadhaar authentication, portal processing, and whether the officer raises a query. Treat any estimate as indicative, not guaranteed."
          },
          {
            question: "What documents are required for GST registration?",
            answer: "Key documents include PAN card, Aadhaar card, business address proof (like electricity bill/rent agreement), and bank account details."
          }
        ]}
      />
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                  <Receipt className="w-6 h-6 text-green-600" />
                </div>
                <h1 className="type-page-title font-bold text-gray-900">
                  GST Registration Services
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Registration support with document checks, application preparation, and portal filing support. Timelines depend on document readiness and department processing.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 font-semibold"
                  onClick={() => {
                    setCheckoutTitle("GST Registration - Standard");
                    setCheckoutPrice(2999);
                    setIsCheckoutOpen(true);
                  }}
                >
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
                    Check the applicable turnover reference and activity-based triggers.
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-emerald-600 mt-0.5" />
                    Prepare PAN, Aadhaar, address proof, bank proof.
                  </li>
                  <li className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Verify how inter-state supply affects your specific goods or services.
                  </li>
                  <li className="flex items-start">
                    <CreditCard className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Check current e-commerce registration exceptions and marketplace conditions.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* GST Threshold & Mandatory Registration */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <AlertCircle className="w-6 h-6" />
                GST registration trigger checklist
              </CardTitle>
              <CardDescription>
                Use turnover references only after checking state, supply, and activity-specific rules
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
        </m.div>

        {/* GST Registration Types */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-gray-900 mb-4">
              Types of GST Registration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
               Compare eligibility, tax collection, input-credit, supply, and return obligations before choosing
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
        </m.div>

        {/* Required Documents */}
        <m.div
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
                Complete checklist of documents required for GST registration
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
        </m.div>

        {/* Registration Process */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-gray-900 mb-4">
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
        </m.div>

        {/* Benefits of GST Registration */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-gray-900 mb-4">
              Benefits of GST Registration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Know when GST registration applies and what to prepare before filing
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
        </m.div>

        {/* Registration Form */}
        <m.div
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
                  Your business information should be shared only through the secure workflow and handled by assigned experts.
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
                      <SelectItem value="below-20">Below ₹20 Lakhs</SelectItem>
                      <SelectItem value="20-40">₹20-40 Lakhs</SelectItem>
                      <SelectItem value="40-100">₹40 Lakhs - 1 Crore</SelectItem>
                      <SelectItem value="above-100">Above ₹1 Crore</SelectItem>
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
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={(e) => {
                    e.preventDefault();
                    setCheckoutTitle("GST Registration");
                    setCheckoutPrice(2999);
                    setIsCheckoutOpen(true);
                  }}
                >
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
        </m.div>

        {standardPricing && (
          <StandardPricingSection
            mode="service-package"
            title="GST registration pricing"
            description="See the MyeCA professional fee, GST treatment, inclusions, exclusions, required documents, and expected timeline before checkout."
            service={standardPricing}
            className="mb-4 py-0"
            onCheckout={(service) => {
              setCheckoutTitle(service.name);
              setCheckoutPrice(getCheckoutAmount(service.pricing) || 2999);
              setIsCheckoutOpen(true);
            }}
          />
        )}

        {/* Pricing Plans */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <div className="text-center mb-12">
            <h2 className="type-section-title font-bold text-gray-900 mb-4">
              GST Registration Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose a package after reviewing scope, exclusions, and document needs.
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
                    onClick={() => {
                      setCheckoutTitle(plan.type);
                      setCheckoutPrice(parseInt(plan.price.replace(/[^0-9]/g, '')));
                      setIsCheckoutOpen(true);
                    }}
                  >
                    Select Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-8">
            Document review · Portal-aligned workflow · Query-response support
          </p>
        </m.div>

        {/* SEO Depth Section: Expert Guide on GST */}
        <div className="mt-24 space-y-16 border-t pt-16">
          <div className="max-w-4xl mx-auto text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">GST registration decisions to resolve before applying</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              GST registration can affect invoicing, input tax credit, and where a business may supply. Before applying, confirm the registration trigger, business constitution, principal place of business, and bank and authorised-signatory records.
            </p>

            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">Mandatory vs Voluntary Registration</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Mandatory registration can arise from turnover or a transaction-specific trigger. Voluntary registration may help in some supplier or customer workflows, but it also creates recurring return and record obligations. Confirm whether eligible input tax credit and commercial needs justify that ongoing work.
                  </p>
               </div>
               <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">Composition Scheme Benefits</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Composition eligibility depends on turnover, activity, state, supply model, and current rules. Before choosing it, confirm the applicable rate and return cycle, restrictions on supply, inability to claim input tax credit, and how invoices must be issued.
                  </p>
               </div>
            </div>
          </div>

          {/* Comparison Table */}
          <Card className="rounded-[2rem] border-emerald-100 overflow-hidden shadow-sm">
             <CardHeader className="bg-emerald-900 text-white p-8">
                <CardTitle className="text-2xl font-black italic">GST Registration Comparison</CardTitle>
             </CardHeader>
             <CardContent className="max-w-full overflow-x-auto p-0">
                <table className="min-w-[640px] w-full text-left border-collapse">
                   <thead>
                      <tr className="bg-emerald-50 border-b border-emerald-100">
                         <th className="p-6 text-xs font-black text-emerald-900 uppercase tracking-widest">Feature</th>
                         <th className="p-6 text-xs font-black text-emerald-900 uppercase tracking-widest">Regular Registration</th>
                         <th className="p-6 text-xs font-black text-emerald-900 uppercase tracking-widest">Composition Scheme</th>
                      </tr>
                   </thead>
                   <tbody className="text-sm font-medium text-slate-600">
                      <tr className="border-b border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                         <td className="p-6 font-bold">Tax Collection</td>
                         <td className="p-6">Can collect GST from customers</td>
                         <td className="p-6">Cannot collect GST</td>
                      </tr>
                      <tr className="border-b border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                         <td className="p-6 font-bold">Input Tax Credit</td>
                          <td className="p-6 text-green-600">Available only on eligible, supported purchases</td>
                         <td className="p-6 text-red-500">Not Available</td>
                      </tr>
                      <tr className="border-b border-emerald-50 hover:bg-emerald-50/30 transition-colors">
                         <td className="p-6 font-bold">Returns Filing</td>
                         <td className="p-6">Monthly / Quarterly (IFF)</td>
                         <td className="p-6">Quarterly (CMP-08)</td>
                      </tr>
                      <tr className="hover:bg-emerald-50/30 transition-colors">
                         <td className="p-6 font-bold">Inter-state Supply</td>
                         <td className="p-6">Allowed across India</td>
                         <td className="p-6">Restricted to within State</td>
                      </tr>
                   </tbody>
                </table>
             </CardContent>
          </Card>

          {/* Penalty & Compliance Section */}
          <div className="bg-red-50 rounded-[2.5rem] border border-red-100 p-6 sm:p-10">
             <div className="flex flex-col items-start gap-6 sm:flex-row">
                <div className="w-16 h-16 rounded-3xl bg-red-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-red-200">
                   <AlertCircle className="w-8 h-8" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Resolve GST registration and return defaults early</h3>
                   <p className="text-slate-600 leading-relaxed mb-6 font-medium">
                      If registration was mandatory, tax, interest, penalty, invoice, and input-credit consequences depend on the facts and the notice or proceeding involved. Late-return fees also vary by return type and period. Review the applicable provision, portal record, and response deadline before acting.
                   </p>
                   <div className="flex flex-wrap gap-4">
                      <Button className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold px-6 h-12 shadow-md">Review a GST notice</Button>
                      <Link href="/services/notice-compliance">
                        <Button variant="ghost" className="text-red-700 font-bold">Learn about Notice Management →</Button>
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {isCheckoutOpen && (
        <ServiceCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          serviceId="gst-registration"
          serviceTitle={checkoutTitle}
          category="Business Setup"
          priceAmount={checkoutPrice}
        />
      )}
    </div>
  );
}
