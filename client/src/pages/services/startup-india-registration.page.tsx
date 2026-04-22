import { useState } from "react";
import { m } from "framer-motion";
import { Link } from "wouter";
import { 
  Rocket, 
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
  Target
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

export default function StartupIndiaRegistrationPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedEntityType, setSelectedEntityType] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const requiredDocuments = [
    {
      category: "Core Documents",
      icon: FileText,
      color: "blue",
      documents: [
        "Certificate of Incorporation/Registration from MCA",
        "Company PAN Card (issued in entity's name)",
        "Personal PAN & Aadhaar cards of all directors/partners",
        "Memorandum of Association (MoA) and Articles of Association (AoA)"
      ]
    },
    {
      category: "Supporting Documents",
      icon: Upload,
      color: "green",
      documents: [
        "Business address proof (utility bill/rent agreement)",
        "Recent bank statement in company name",
        "Passport-sized photos of all directors/partners",
        "Proof of concept (pitch deck/website/patent details)"
      ]
    },
    {
      category: "Optional but Recommended",
      icon: Star,
      color: "orange",
      documents: [
        "MSME Registration Certificate",
        "Trademark registration details",
        "Intellectual property documents",
        "Product development timeline"
      ]
    }
  ];

  const registrationSteps = [
    {
      step: 1,
      title: "Business Incorporation",
      description: "Register as Private Limited Company, LLP, or Partnership Firm with ROC",
      duration: "10-15 days",
      icon: Building2
    },
    {
      step: 2,
      title: "Portal Registration",
      description: "Create account on official Startup India portal",
      duration: "30 minutes",
      icon: User
    },
    {
      step: 3,
      title: "DPIIT Application",
      description: "Apply for DPIIT Recognition under 'Startup Recognition' section",
      duration: "1-2 hours",
      icon: FileText
    },
    {
      step: 4,
      title: "Document Upload",
      description: "Submit all required documents in clear, legible format",
      duration: "2-3 hours",
      icon: Upload
    },
    {
      step: 5,
      title: "Self-Declaration",
      description: "Digitally sign self-certification form and submit",
      duration: "30 minutes",
      icon: Shield
    },
    {
      step: 6,
      title: "Certificate Issuance",
      description: "Receive DPIIT certificate and recognition number",
      duration: "2-7 days",
      icon: Award
    }
  ];

  const benefits2025 = [
    {
      category: "Tax Benefits",
      icon: IndianRupee,
      color: "green",
      benefits: [
        "Income tax exemption for any 3 consecutive years out of first 10 years",
        "Section 80-IAC tax exemptions for improved cash flow",
        "Investment exemptions under Section 56(2)(VIIB)",
        "Angel tax exemption for eligible investors"
      ]
    },
    {
      category: "Compliance Simplification",
      icon: Shield,
      color: "blue",
      benefits: [
        "Self-certification under 6 labor laws for 3-5 years",
        "Self-certification under 3 environment laws",
        "EMD exemption for government tenders",
        "Exemption from 'prior experience/turnover' criteria"
      ]
    },
    {
      category: "Funding & Support",
      icon: Target,
      color: "purple",
      benefits: [
        "Startup India Seed Fund Scheme access",
        "Fund of Funds with ₹10,000 crore corpus",
        "Up to ₹20 lakhs as grants",
        "Up to ₹50 lakhs as debt/convertible debentures"
      ]
    },
    {
      category: "IP Support",
      icon: Award,
      color: "orange",
      benefits: [
        "80% fee reduction for patent applications",
        "80% fee reduction for trademark applications",
        "Fast examination of patents",
        "Government bearing facilitator fees"
      ]
    }
  ];

  const eligibilityCriteria = [
    {
      title: "Entity Type",
      requirement: "Private Limited Company, LLP, or Partnership Firm",
      icon: Building2,
      status: "mandatory"
    },
    {
      title: "Age Limit",
      requirement: "Maximum 10 years from incorporation (15 years for biotech)",
      icon: Clock,
      status: "mandatory"
    },
    {
      title: "Turnover Limit",
      requirement: "Not exceeding ₹100 crore in any financial year",
      icon: TrendingUp,
      status: "mandatory"
    },
    {
      title: "Innovation Focus",
      requirement: "Must focus on innovation/development of new products/services",
      icon: Rocket,
      status: "mandatory"
    },
    {
      title: "Original Business",
      requirement: "Cannot be formed by splitting existing business",
      icon: AlertCircle,
      status: "restriction"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center soft-shadow">
                  <Rocket className="w-8 h-8 text-purple-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Startup India Registration
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Get DPIIT recognition and unlock tax exemptions, funding, and compliance simplifications.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="sm" 
                  className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 font-semibold"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Start Registration Now
                </Button>
                <Button size="sm" variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 px-5 py-2.5 font-semibold">
                  <Phone className="w-4 h-4 mr-2" />
                  Consult Expert
                </Button>
              </div>
              <div className="flex flex-wrap gap-6 mt-6 text-sm">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  100% Free DPIIT Registration
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Expert Startup CA Support
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  5,000+ Startups Registered
                </div>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-purple-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Get recognition fast</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Building2 className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Ensure entity type is Pvt Ltd, LLP, or Partnership.
                  </li>
                  <li className="flex items-start">
                    <User className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Prepare directors’ PAN/Aadhaar and company PAN.
                  </li>
                  <li className="flex items-start">
                    <Upload className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Upload clear MoA/AoA and proof of concept.
                  </li>
                  <li className="flex items-start">
                    <Award className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Certificate issue window is typically 2–7 days.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Eligibility Criteria */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Startup India Eligibility Criteria 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ensure your startup meets all requirements before applying for DPIIT recognition
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eligibilityCriteria.map((criteria, index) => (
              <Card 
                key={index}
                className={`hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${
                  criteria.status === 'restriction' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'
                }`}
              >
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 ${
                    criteria.status === 'restriction' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    <criteria.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold">{criteria.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-700">{criteria.requirement}</p>
                  <Badge 
                    variant={criteria.status === 'restriction' ? 'destructive' : 'default'} 
                    className="mt-2"
                  >
                    {criteria.status === 'restriction' ? 'Restriction' : 'Mandatory'}
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
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Documents Required for Registration
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete document checklist for smooth DPIIT startup registration process
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
        </m.div>

        {/* Registration Process */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              6-Step Registration Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete step-by-step guide to get your Startup India certificate
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrationSteps.map((step, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-600">{step.step}</span>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg font-bold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <div className="flex items-center text-xs text-purple-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{step.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Benefits 2025 */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Startup India Benefits 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive benefits package including tax exemptions, funding access, and regulatory support
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits2025.map((benefit, index) => (
              <Card key={index} className={`border-l-4 border-l-${benefit.color}-500 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-${benefit.color}-900`}>
                    <benefit.icon className="w-6 h-6" />
                    {benefit.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefit.benefits.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircle className={`w-4 h-4 mr-3 text-${benefit.color}-500 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Cost Structure */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                💰 Cost Structure - Completely FREE!
              </CardTitle>
              <CardDescription className="text-lg">
                Government initiative with zero registration fees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">{"₹"}0</div>
                  <div className="text-sm text-gray-600">DPIIT Registration Fee</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">{"₹"}0</div>
                  <div className="text-sm text-gray-600">Processing Fee</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-green-600 mb-2">{"₹"}0</div>
                  <div className="text-sm text-gray-600">Certificate Fee</div>
                </div>
              </div>
              <div className="text-center mt-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Note:</strong> Only company incorporation charges apply ({"₹"}2,000-{"₹"}30,000). 
                    DPIIT registration through official portal is completely free.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </m.div>

        {/* Expert Assistance CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Register Your Startup?
              </h3>
              <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
                Get expert assistance with complete documentation, incorporation, and DPIIT registration. 
                Our CA team ensures 100% compliance and maximum benefits.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-purple-50 px-8 shadow-lg"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Registration {"₹"}2,999
                </Button>
                <Link href="/expert-consultation?service=startup-india-registration">
                  <Button size="lg" className="bg-purple-700 hover:bg-purple-800 text-white border-0 px-8 shadow-lg font-semibold">
                    <Phone className="w-5 h-5 mr-2" />
                    Get Expert Consultation
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-purple-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Expert CA Support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>CA-Guided Process</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>2-3 Week Completion</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </m.div>
      </div>
      {isCheckoutOpen && (
        <ServiceCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          serviceId="startup-india"
          serviceTitle="Startup India DPIIT Recognition"
          category="Business Setup"
          priceAmount={2999}
        />
      )}
    </div>
  );
}
