import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Utensils, 
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
  Factory
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

export default function FSSAIRegistrationPage() {
  const [selectedLicenseType, setSelectedLicenseType] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const licenseTypes = [
    {
      type: "Basic Registration",
      turnover: "Less than \u20B912 lakh",
      form: "Form A",
      authority: "Local/State Authority",
      processingTime: "7 days",
      fees: "\u20B9100",
      color: "green",
      icon: Building2,
      suitable: ["Small restaurants", "Home-based food businesses", "Street food vendors", "Catering services"]
    },
    {
      type: "State License",
      turnover: "\u20B912 lakh - \u20B920 crore",
      form: "Form B",
      authority: "State Government",
      processingTime: "30 days",
      fees: "\u20B92,000-5,000",
      color: "blue",
      icon: Factory,
      suitable: ["Manufacturing units", "Large restaurants", "Food distributors", "Multi-city operations"]
    },
    {
      type: "Central License",
      turnover: "Above \u20B920 crore",
      form: "Form B",
      authority: "Central Government",
      processingTime: "45-90 days",
      fees: "Varies",
      color: "purple",
      icon: TrendingUp,
      suitable: ["Multi-state businesses", "Importers/Exporters", "Large manufacturing", "E-commerce food"]
    }
  ];

  const basicRegistrationDocs = [
    "Completed & signed Form A",
    "3 passport-size photographs",
    "Photo identity proof (Aadhaar/PAN/Voter ID)",
    "Business address proof (electricity/phone bill)",
    "Proof of possession of premises",
    "Business constitution certificate",
    "List of food products to be handled",
    "NOC from municipality/health department"
  ];

  const stateLicenseDocs = [
    "Completed & signed Form B",
    "2 passport-size photographs", 
    "Photo ID & address proof of applicant",
    "Business constitution documents",
    "Shop & establishment certificate",
    "PAN card of business",
    "Layout plan of food processing unit",
    "List of directors/partners with details",
    "Equipment & machinery list",
    "Property tax bill for premises"
  ];

  const centralLicenseDocs = [
    "All State License documents",
    "Water analysis report from recognized lab",
    "Authorization letter with responsible person details",
    "Multi-state operation compliance documents",
    "Import/export documentation (if applicable)",
    "NOC/Prior Approval from FSSAI for specific categories"
  ];

  const registrationProcess = [
    {
      step: 1,
      title: "Determine License Type",
      description: "Choose Basic/State/Central based on turnover and business type",
      duration: "15 minutes",
      icon: Calculator
    },
    {
      step: 2,
      title: "Gather Documents",
      description: "Prepare all required documents based on license category",
      duration: "2-5 days",
      icon: FileText
    },
    {
      step: 3,
      title: "Online Application",
      description: "Fill application on FoSCoS portal (foscos.fssai.gov.in)",
      duration: "1-2 hours",
      icon: Globe
    },
    {
      step: 4,
      title: "Upload Documents",
      description: "Submit all documents in specified format and size",
      duration: "30 minutes",
      icon: Upload
    },
    {
      step: 5,
      title: "Pay Fees",
      description: "Pay applicable fees through online payment gateway",
      duration: "10 minutes",
      icon: CreditCard
    },
    {
      step: 6,
      title: "Track & Receive",
      description: "Track application status and receive license certificate",
      duration: "7-90 days",
      icon: Award
    }
  ];

  const specialCategories = [
    "Food businesses operating in 2+ states",
    "Food importers & exporters", 
    "Proprietary food & non-specified food",
    "Food/health supplements & nutraceuticals",
    "Radiation processing of foods",
    "Central Government premises food businesses",
    "E-commerce food businesses",
    "Railway station caterers/retailers"
  ];

  const complianceRequirements = [
    {
      category: "Food Safety Standards",
      icon: Shield,
      color: "green",
      requirements: [
        "Display FSSAI license at business premises",
        "Maintain food safety and hygiene standards",
        "Regular testing of food products",
        "Proper labeling as per FSSAI guidelines"
      ]
    },
    {
      category: "Record Maintenance",
      icon: BookOpen,
      color: "blue",
      requirements: [
        "Maintain purchase and sales records",
        "Document cleaning and sanitization activities",
        "Keep training records of food handlers",
        "Maintain temperature logs for storage"
      ]
    },
    {
      category: "Renewal & Updates",
      icon: Calendar,
      color: "orange",
      requirements: [
        "Renew license before expiry (1-5 years validity)",
        "Update license for any business changes",
        "Annual returns filing (for certain categories)",
        "Notification of address/ownership changes"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50">
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center soft-shadow">
                  <Utensils className="w-8 h-8 text-orange-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  FSSAI Food License Registration
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Mandatory food license with expert assistance for Basic, State, and Central categories.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 font-semibold">
                  <Utensils className="w-4 h-4 mr-2" />
                  Apply Now
                </Button>
                <Button size="sm" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-5 py-2.5 font-semibold">
                  <Phone className="w-4 h-4 mr-2" />
                  Expert Consultation
                </Button>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Speed up your licensing</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Calculator className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Check turnover to pick Basic/State/Central license.
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-red-600 mt-0.5" />
                    Prepare Form A/B, IDs, address proof, and product list.
                  </li>
                  <li className="flex items-start">
                    <Globe className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Apply on FoSCoS portal and track status.
                  </li>
                  <li className="flex items-start">
                    <Award className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Display license and follow hygiene standards post-approval.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* License Types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your FSSAI License Type
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select the appropriate license based on your business turnover and operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {licenseTypes.map((license, index) => (
              <Card key={index} className={`border-l-4 border-l-${license.color}-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-${license.color}-100 text-${license.color}-600`}>
                    <license.icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl font-bold">{license.type}</CardTitle>
                  <CardDescription className="font-semibold text-gray-700">
                    {license.turnover}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Form:</span>
                      <Badge variant="outline">{license.form}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Authority:</span>
                      <span className="text-gray-600 text-xs">{license.authority}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Processing:</span>
                      <span className="text-gray-600">{license.processingTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Fees:</span>
                      <span className={`font-bold text-${license.color}-600`}>{license.fees}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Suitable for:</h4>
                    <ul className="space-y-1">
                      {license.suitable.slice(0, 2).map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-center text-xs">
                          <CheckCircle className={`w-3 h-3 mr-2 text-${license.color}-500`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
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
              FSSAI Registration Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Step-by-step process for obtaining your FSSAI food license
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrationProcess.map((step, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-orange-600">{step.step}</span>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg font-bold">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  <div className="flex items-center text-xs text-orange-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{step.duration}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Required Documents by Type */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Required Documents by License Type
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete document checklist for each FSSAI license category
            </p>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Registration</TabsTrigger>
              <TabsTrigger value="state">State License</TabsTrigger>
              <TabsTrigger value="central">Central License</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Building2 className="w-6 h-6" />
                    Basic Registration Documents (Form A)
                  </CardTitle>
                  <CardDescription>
                    For small food businesses with turnover less than \u20B912 lakh
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {basicRegistrationDocs.map((doc, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="state">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Factory className="w-6 h-6" />
                    State License Documents (Form B)
                  </CardTitle>
                  <CardDescription>
                    For medium businesses with turnover \u20B912 lakh - \u20B920 crore
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {stateLicenseDocs.map((doc, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="central">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-900">
                    <TrendingUp className="w-6 h-6" />
                    Central License Documents (Form B)
                  </CardTitle>
                  <CardDescription>
                    For large businesses with turnover above \u20B920 crore
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {centralLicenseDocs.map((doc, index) => (
                      <div key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Special Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Star className="w-6 h-6" />
                Special Categories Requiring Central License
              </CardTitle>
              <CardDescription>
                These business types must obtain Central License regardless of turnover
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {specialCategories.map((category, index) => (
                  <div key={index} className="flex items-start">
                    <AlertCircle className="w-4 h-4 mr-3 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">{category}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compliance Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Post-License Compliance Requirements
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Maintain compliance to avoid penalties and ensure smooth operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {complianceRequirements.map((compliance, index) => (
              <Card key={index} className={`border-l-4 border-l-${compliance.color}-500 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-${compliance.color}-900`}>
                    <compliance.icon className="w-6 h-6" />
                    {compliance.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {compliance.requirements.map((req, reqIndex) => (
                      <li key={reqIndex} className="flex items-start">
                        <CheckCircle className={`w-4 h-4 mr-3 text-${compliance.color}-500 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Expert Assistance CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Get Your FSSAI License?
              </h3>
              <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                Our FSSAI experts handle complete documentation, application filing, and compliance guidance. 
                Get your food license with 99% success rate and ongoing support.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8">
                  <Utensils className="w-5 h-5 mr-2" />
                  Apply Now from {"\u20B9"}2,999
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 px-8">
                  <Phone className="w-5 h-5 mr-2" />
                  Free FSSAI Consultation
                </Button>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-orange-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Expert Documentation Support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>99% Approval Success Rate</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Complete Compliance Guidance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
