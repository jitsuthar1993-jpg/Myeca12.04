import { useState } from "react";
import { m } from "framer-motion";
import { Link } from "wouter";
import { 
  Factory, 
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
import MetaSEO from "@/components/seo/MetaSEO";
import { ServiceCheckoutModal } from "@/components/services/ServiceCheckoutModal";

export default function MSMEUdyamRegistrationPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const msmeCategories = [
    {
      category: "Micro Enterprise",
      investment: "Up to ₹1 Crore",
      turnover: "Up to ₹5 Crore",
      color: "green",
      icon: Building2
    },
    {
      category: "Small Enterprise", 
      investment: "₹1-10 Crore",
      turnover: "₹5-50 Crore",
      color: "blue",
      icon: Factory
    },
    {
      category: "Medium Enterprise",
      investment: "₹10-50 Crore", 
      turnover: "₹50-250 Crore",
      color: "purple",
      icon: TrendingUp
    }
  ];

  const registrationBenefits = [
    {
      category: "Financial Benefits",
      icon: IndianRupee,
      color: "green",
      benefits: [
        "Collateral-free loans up to ₹1 crore under CGTMSE scheme",
        "Lower interest rates (1-1.5% reduction on bank loans)",
        "Priority sector lending from banks",
        "Credit guarantee schemes without third-party guarantees"
      ]
    },
    {
      category: "Government Support",
      icon: Shield,
      color: "blue",
      benefits: [
        "Priority in government tenders",
        "Public Procurement Policy benefits",
        "Protection against delayed payments",
        "Access to Industrial Promotion Subsidy (IPS)"
      ]
    },
    {
      category: "Regulatory Benefits",
      icon: Award,
      color: "purple",
      benefits: [
        "Tax exemptions for initial years",
        "GST composition schemes and quarterly returns",
        "MAT credit extension up to 15 years",
        "Stamp duty exemption on registrations"
      ]
    },
    {
      category: "Operational Advantages",
      icon: Target,
      color: "orange",
      benefits: [
        "50% discount on patent and trademark fees",
        "75% reimbursement on ISO certification costs",
        "Government tender priority and security deposit waivers",
        "Export promotion support and trade fair participation"
      ]
    }
  ];

  const registrationProcess = [
    {
      step: 1,
      title: "Visit Official Portal",
      description: "Go to udyamregistration.gov.in - the only official portal",
      duration: "2 minutes",
      icon: Globe
    },
    {
      step: 2,
      title: "Aadhaar Verification",
      description: "Enter Aadhaar number + name, validate with OTP",
      duration: "5 minutes",
      icon: User
    },
    {
      step: 3,
      title: "PAN Verification",
      description: "Enter organization type + PAN, validate automatically",
      duration: "3 minutes",
      icon: CreditCard
    },
    {
      step: 4,
      title: "Fill Enterprise Details",
      description: "Complete investment, turnover, and business information",
      duration: "15 minutes",
      icon: FileText
    },
    {
      step: 5,
      title: "Submit & OTP",
      description: "Submit form and verify with final OTP",
      duration: "2 minutes",
      icon: Shield
    },
    {
      step: 6,
      title: "Certificate Delivery",
      description: "Udyam Registration Certificate sent via email",
      duration: "3-5 days",
      icon: Award
    }
  ];

  const requiredInformation = [
    {
      category: "Essential Information",
      icon: FileText,
      color: "blue",
      items: [
        "Aadhaar Number (of owner/authorized signatory)",
        "PAN Number of business/proprietor",
        "GSTIN (if GST-registered or mandatory)",
        "Business details and enterprise information"
      ]
    },
    {
      category: "Business Classification",
      icon: Building2,
      color: "green",
      items: [
        "Type of organization (Proprietorship/Partnership/Company)",
        "Manufacturing or Service sector classification",
        "Investment in plant & machinery or equipment",
        "Annual turnover details for classification"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50">
      <MetaSEO
        title="MSME Udyam Registration Online India | Benefits for Small Businesses"
        description="Register your business as an MSME on the official Udyam portal. Unlock bank loans, government subsidies, and priority in tenders. 100% online and paperless."
        keywords={[
          "MSME registration India", "Udyam registration online", "SSI registration", 
          "MSME benefits", "Udyam portal registration", "startup benefits India",
          "Aadhaar based business registration", "MSME loan schemes"
        ]}
        type="service"
        serviceData={{
          price: "0",
          rating: "4.9",
          reviews: "45000",
          availability: "https://schema.org/InStock"
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: "MSME Udyam Registration", url: "/services/msme-udyam-registration" }
        ]}
        faqPageData={[
          {
            question: "Is MSME registration free?",
            answer: "Yes, MSME (Udyam) registration is a completely free process on the official government portal (udyamregistration.gov.in)."
          },
          {
            question: "What are the documents required for Udyam registration?",
            answer: "No physical documents are required. The process is based on self-declaration and verified automatically via Aadhaar and PAN."
          },
          {
            question: "How long is the Udyam certificate valid?",
            answer: "Udyam Registration certificate has lifetime validity. You don't need to renew it annually."
          }
        ]}
      />
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center soft-shadow">
                  <Factory className="w-8 h-8 text-green-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  MSME Udyam Registration
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Free government portal registration. Unlock loans, subsidies, and tender benefits.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 font-semibold">
                  <Factory className="w-4 h-4 mr-2" />
                  Register FREE
                </Button>
                <Link href="/expert-consultation?service=msme-udyam-registration">
                  <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 px-5 py-2.5 font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    Get Expert Help
                  </Button>
                </Link>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-green-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Fast, document-free process</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Use only udyamregistration.gov.in portal.
                  </li>
                  <li className="flex items-start">
                    <User className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Keep Aadhaar ready for OTP verification.
                  </li>
                  <li className="flex items-start">
                    <CreditCard className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    PAN auto-verifies; GSTIN needed if registered.
                  </li>
                  <li className="flex items-start">
                    <Award className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Certificate delivered via email within a few days.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* MSME Categories */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              MSME Classification Criteria 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Determine your enterprise category based on investment and annual turnover
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {msmeCategories.map((category, index) => (
              <Card key={index} className={`border-l-4 border-l-${category.color}-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-${category.color}-100 text-${category.color}-600`}>
                    <category.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl font-bold">{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-3">
                    <div>
                      <div className="font-semibold text-gray-900">Investment Limit</div>
                      <div className="text-sm text-gray-600">{category.investment}</div>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">Turnover Limit</div>
                      <div className="text-sm text-gray-600">{category.turnover}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Registration Process */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              6-Step Registration Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Paperless, document-free self-declaration based registration process
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrationProcess.map((step, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">{step.step}</span>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg font-bold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <div className="flex items-center text-xs text-green-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{step.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </m.div>

        {/* Required Information */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Information Required - No Documents!
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete self-declaration based process with automatic verification
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {requiredInformation.map((info, index) => (
              <Card key={index} className={`border-l-4 border-l-${info.color}-500 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-${info.color}-900`}>
                    <info.icon className="w-6 h-6" />
                    {info.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {info.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircle className={`w-4 h-4 mr-3 text-${info.color}-500 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-8 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-900">
                <AlertCircle className="w-6 h-6" />
                Important: Automatic Data Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                The portal automatically fetches and verifies information from Income Tax database (PAN), 
                GST database (GSTIN), and Aadhaar database. No manual document uploads required!
              </p>
            </CardContent>
          </Card>
        </m.div>

        {/* Registration Benefits */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              MSME Registration Benefits 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unlock extensive government support, financing, and growth opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {registrationBenefits.map((benefit, index) => (
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

        {/* Cost & Important Notes */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-r from-green-50 to-blue-50">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  💰 Registration Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-6xl font-bold text-green-600 mb-4">{"₹"}0</div>
                <div className="text-lg text-gray-600 mb-4">Completely FREE</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ No registration fee</li>
                  <li>✓ No processing fee</li>
                  <li>✓ No renewal fee</li>
                  <li>✓ No certificate fee</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-900">
                  <AlertCircle className="w-6 h-6" />
                  ⚠️ Beware of Fake Portals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Only use:</strong> udyamregistration.gov.in</span>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                    <span><strong>Avoid:</strong> Third-party websites charging fees</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span><strong>No consultancy needed:</strong> Process is simple</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </m.div>

        {/* Expert Assistance CTA */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Need Help with MSME Registration?
              </h3>
              <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                While registration is free and simple, our experts can guide you through the process 
                and help you understand all available benefits and schemes.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-green-600 hover:bg-green-50 px-8">
                  <Factory className="w-5 h-5 mr-2" />
                  Register Now - FREE
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-green-600 px-8"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Expert Guidance {"₹"}499
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-green-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>4.7+ Crore Businesses Registered</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Instant Online Process</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Lifetime Validity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </m.div>
        {/* SEO Depth Section: Expert Guide on MSME */}
        <div className="mt-24 space-y-16 border-t pt-16">
          <div className="max-w-4xl mx-auto text-left">
            <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">The 2025 Guide to MSME Power in India</h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Micro, Small, and Medium Enterprises (MSMEs) are the backbone of the Indian economy. An <span className="text-green-600 font-bold">Udyam Registration</span> is more than a certificate—it's your key to the <span className="font-bold">Priority Sector Lending</span> pool of Indian banks.
            </p>

            <div className="grid md:grid-cols-2 gap-12">
               <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">Protection Against Delayed Payments</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    One of the most powerful features of MSME registration is the <span className="font-bold">MSME Samadhaan</span> portal. Large buyers are legally required to pay MSMEs within 45 days. If they fail, they must pay interest at three times the bank rate.
                  </p>
               </div>
               <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900">Access to Global Tenders</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    The Government of India has reserved over <span className="font-bold">350+ items</span> exclusively for purchase from MSMEs. With an Udyam certificate, your startup can participate in government tenders without paying Earnest Money Deposits (EMD), significantly reducing your bidding costs.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
      {isCheckoutOpen && (
        <ServiceCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          serviceId="msme-udyam-registration"
          serviceTitle="Expert MSME Assistance"
          category="Business Services"
          priceAmount={499}
        />
      )}
    </div>
  );
}
