import { useState } from "react";
import { m } from "framer-motion";
import { Link } from "wouter";
import { 
  ShoppingBag, 
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
  Star,
  IndianRupee,
  Target,
  Globe,
  Factory,
  Home,
  MapPin
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

export default function TradeLicensePage() {
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const licenseCategories = [
    {
      category: "Shop License",
      icon: ShoppingBag,
      color: "blue",
      businesses: ["Retail stores and shops", "Barber shops, laundry services", "Medical stores, clinics", "Computer shops", "Dangerous trades (fireworks, chemicals)"],
      processingTime: "7-10 days",
      fees: "₹500-2,000"
    },
    {
      category: "Industries License",
      icon: Factory,
      color: "green", 
      businesses: ["Small, medium, large-scale manufacturing", "Cyber cafes", "Industrial establishments", "Production units"],
      processingTime: "10-15 days",
      fees: "₹1,000-5,000"
    },
    {
      category: "Food Establishment",
      icon: Award,
      color: "orange",
      businesses: ["Restaurants, hotels, canteens", "Food stalls, bakeries", "Meat and vegetable sales", "Shopping malls, movie theaters"],
      processingTime: "7-12 days",
      fees: "₹750-3,000"
    }
  ];

  const requiredDocuments = [
    {
      category: "Individual Applicant Documents",
      icon: User,
      color: "blue",
      documents: [
        "PAN Card (Mandatory for all applicants)",
        "Aadhaar Card (Required as identity proof)",
        "Address Proof (Driving License/Passport/Voter ID)",
        "Passport-size photograph"
      ]
    },
    {
      category: "Business Entity Documents",
      icon: Building2,
      color: "green",
      documents: [
        "PAN Card of company/partners",
        "Certificate of Incorporation",
        "Memorandum & Articles of Association (MOA/AOA)",
        "Partnership deed (for partnerships)",
        "LLP registration certificate (for LLPs)"
      ]
    },
    {
      category: "Property Documents",
      icon: Home,
      color: "purple",
      documents: [
        "Latest Municipal Property Tax Receipt",
        "Lease/Rent Agreement (if rented)",
        "No Objection Certificate from property owner",
        "Building Permit/Occupancy Certificate",
        "Jamabandi copy (land ownership document)"
      ]
    },
    {
      category: "Business-Specific Documents",
      icon: FileText,
      color: "orange",
      documents: [
        "Layout Plan (certified building plan)",
        "Bank Statement and Cancelled Cheque",
        "NOC from Pollution Control Board",
        "Fire Department NOC (if required)"
      ]
    }
  ];

  const registrationProcess = [
    {
      step: 1,
      title: "Determine License Type",
      description: "Identify which category your business falls under",
      duration: "30 minutes",
      icon: Calculator
    },
    {
      step: 2,
      title: "Gather Documents",
      description: "Collect all required documents as per checklist",
      duration: "2-3 days",
      icon: FileText
    },
    {
      step: 3,
      title: "Online Application",
      description: "Visit municipal corporation website and fill form",
      duration: "1-2 hours",
      icon: Globe
    },
    {
      step: 4,
      title: "Upload Documents",
      description: "Submit all documents in PDF format online",
      duration: "45 minutes",
      icon: Upload
    },
    {
      step: 5,
      title: "Pay Fees",
      description: "Pay application fees through online gateway",
      duration: "15 minutes",
      icon: CreditCard
    },
    {
      step: 6,
      title: "Track & Inspection",
      description: "Track application and attend inspection if required",
      duration: "7-15 days",
      icon: MapPin
    },
    {
      step: 7,
      title: "License Issuance",
      description: "Download digital trade license certificate",
      duration: "Same day after approval",
      icon: Award
    }
  ];

  const eligibilityCriteria = [
    {
      title: "Age Requirement",
      requirement: "Applicant must be 18+ years old",
      icon: User,
      status: "mandatory"
    },
    {
      title: "Criminal Record",
      requirement: "No criminal record or pending cases",
      icon: Shield,
      status: "mandatory"
    },
    {
      title: "Legal Business",
      requirement: "Business must be legally permissible",
      icon: CheckCircle,
      status: "mandatory"
    },
    {
      title: "Safety Standards",
      requirement: "Must comply with municipal safety standards",
      icon: AlertCircle,
      status: "mandatory"
    }
  ];

  const majorPortals = [
    {
      city: "Mumbai",
      portal: "mcgm.gov.in",
      processingTime: "7-10 days",
      specialFeatures: "Digital certificate, online tracking"
    },
    {
      city: "Hyderabad", 
      portal: "ghmc.gov.in",
      processingTime: "5-7 days",
      specialFeatures: "Real-time status, SMS updates"
    },
    {
      city: "Kolkata",
      portal: "kmcgov.in",
      processingTime: "10-12 days", 
      specialFeatures: "Online renewal, digital payments"
    },
    {
      city: "Guwahati",
      portal: "gmc.assam.gov.in",
      processingTime: "7-10 days",
      specialFeatures: "Multilingual support, mobile app"
    },
    {
      city: "West Bengal",
      portal: "edistrict.wb.gov.in",
      processingTime: "10-15 days",
      specialFeatures: "State-wide portal, unified services"
    }
  ];

  const additionalRequirements = [
    {
      category: "Food Businesses",
      icon: Award,
      color: "orange",
      requirements: [
        "Health department clearance certificate",
        "FSSAI registration/license",
        "Water quality test report",
        "Staff medical fitness certificates"
      ]
    },
    {
      category: "Manufacturing Units",
      icon: Factory,
      color: "green",
      requirements: [
        "Environmental clearance certificate",
        "Pollution Control Board NOC",
        "Factory license from Labor Department",
        "Power connection approval"
      ]
    },
    {
      category: "Hazardous Trades",
      icon: AlertCircle,
      color: "red",
      requirements: [
        "Special safety compliance certificates",
        "Fire department detailed inspection",
        "Insurance coverage documents",
        "Emergency response plan"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-green-50">
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center soft-shadow">
                  <ShoppingBag className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Trade License Registration
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Mandatory municipal license for commercial establishments. Expert documentation and filing support.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
                <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 font-semibold">
                  <Phone className="w-4 h-4 mr-2" />
                  Expert Guidance
                </Button>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Before you apply</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Keep PAN, Aadhaar, and address proof ready.
                  </li>
                  <li className="flex items-start">
                    <Home className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Arrange NOC or rent agreement for premises.
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 text-purple-600 mt-0.5" />
                    Comply with safety and pollution norms if applicable.
                  </li>
                  <li className="flex items-start">
                    <Clock className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Processing takes 7–15 days depending on city.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* License Categories */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trade License Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the appropriate license category based on your business type
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {licenseCategories.map((category, index) => (
              <Card key={index} className={`border-l-4 border-l-${category.color}-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-${category.color}-100 text-${category.color}-600`}>
                    <category.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl font-bold">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Processing:</span>
                      <span className="text-gray-600">{category.processingTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Fees:</span>
                      <span className={`font-bold text-${category.color}-600`}>{category.fees}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Covers:</h4>
                    <ul className="space-y-1">
                      {category.businesses.slice(0, 3).map((business, businessIndex) => (
                        <li key={businessIndex} className="flex items-start text-xs">
                          <CheckCircle className={`w-3 h-3 mr-2 text-${category.color}-500 flex-shrink-0 mt-0.5`} />
                          {business}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Eligibility Criteria */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Eligibility Criteria
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Basic requirements for trade license application
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {eligibilityCriteria.map((criteria, index) => (
              <Card key={index} className="border-green-200 bg-green-50 hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-green-100 text-green-600">
                    <criteria.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold">{criteria.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-700">{criteria.requirement}</p>
                  <Badge className="mt-2 bg-green-100 text-green-700">
                    Mandatory
                  </Badge>
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Required Documents Checklist
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete document requirements for trade license application
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
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
        </m.div>

        {/* Registration Process */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              7-Step Registration Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete online process for trade license registration
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {registrationProcess.slice(0, 4).map((step, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{step.step}</span>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-bold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <div className="flex items-center text-xs text-blue-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{step.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mt-6">
            {registrationProcess.slice(4).map((step, index) => (
              <Card key={index + 4} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{step.step}</span>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-bold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <div className="flex items-center text-xs text-blue-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{step.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Major City Portals */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Major City Application Portals
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Official municipal corporation portals for trade license applications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {majorPortals.map((portal, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <MapPin className="w-5 h-5" />
                    {portal.city}
                  </CardTitle>
                  <CardDescription className="font-mono text-sm">
                    {portal.portal}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Processing Time:</span>
                      <Badge variant="outline">{portal.processingTime}</Badge>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    <strong>Features:</strong> {portal.specialFeatures}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Additional Requirements */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Additional Requirements by Business Type
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Specific additional documents required for certain business categories
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalRequirements.map((req, index) => (
              <Card key={index} className={`border-l-4 border-l-${req.color}-500 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-${req.color}-900`}>
                    <req.icon className="w-6 h-6" />
                    {req.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {req.requirements.map((requirement, reqIndex) => (
                      <li key={reqIndex} className="flex items-start">
                        <CheckCircle className={`w-4 h-4 mr-3 text-${req.color}-500 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Expert Assistance CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Apply for Trade License?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Our municipal compliance experts handle complete documentation, application filing, 
                and follow-up across all major cities. We handle the paperwork so you can focus on your business.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 shadow-lg">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Apply Now from {"₹"}1,999
                </Button>
                <Link href="/expert-consultation?service=trade-license">
                  <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white border-0 px-8 shadow-lg font-semibold">
                    <Phone className="w-5 h-5 mr-2" />
                    Get Expert Consultation
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-blue-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>All Municipal Corporations Covered</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>98% First-Time Approval</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Expert Document Support</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </m.div>
      </div>
    </div>
  );
}
