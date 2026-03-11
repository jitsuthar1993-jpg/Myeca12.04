import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Award, 
  FileText, 
  Clock, 
  Shield, 
  CheckCircle, 
  Phone, 
  Mail, 
  Download,
  Users,
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
  Leaf,
  Lock,
  HardHat,
  Settings
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
import { getColorClasses } from "@/utils/colorClasses";

export default function ISOCertificationPage() {
  const [selectedISO, setSelectedISO] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const isoStandards = [
    {
      standard: "ISO 9001:2015",
      name: "Quality Management System",
      smallBusinessCost: "\u20B92,00,000 - \u20B96,00,000",
      mediumBusinessCost: "\u20B96,00,000 - \u20B915,00,000", 
      timeline: "3-6 months",
      color: "blue",
      icon: Award,
      primaryUse: "Quality Management - Universal acceptance",
      benefits: ["Enhanced customer satisfaction", "Improved process efficiency", "Better risk management", "International recognition"]
    },
    {
      standard: "ISO 14001:2015",
      name: "Environmental Management System",
      smallBusinessCost: "\u20B93,00,000 - \u20B98,00,000",
      mediumBusinessCost: "\u20B98,00,000 - \u20B920,00,000",
      timeline: "4-8 months",
      color: "green",
      icon: Leaf,
      primaryUse: "Environmental compliance and sustainability",
      benefits: ["Reduced environmental impact", "Cost savings through efficiency", "Regulatory compliance", "Green business credentials"]
    },
    {
      standard: "ISO 27001:2022",
      name: "Information Security Management",
      smallBusinessCost: "\u20B95,00,000 - \u20B98,00,000",
      mediumBusinessCost: "\u20B93,00,000 - \u20B915,00,000",
      timeline: "6-12 months",
      color: "purple",
      icon: Lock,
      primaryUse: "Cybersecurity and data protection",
      benefits: ["Enhanced data security", "Customer trust improvement", "Compliance with regulations", "Risk reduction"]
    },
    {
      standard: "ISO 45001:2018",
      name: "Occupational Health & Safety",
      smallBusinessCost: "\u20B93,00,000 - \u20B97,00,000",
      mediumBusinessCost: "\u20B97,00,000 - \u20B918,00,000",
      timeline: "4-8 months",
      color: "orange",
      icon: HardHat,
      primaryUse: "Workplace safety and health management",
      benefits: ["Reduced workplace accidents", "Lower insurance costs", "Employee wellbeing", "Legal compliance"]
    }
  ];

  const certificationProcess = [
    {
      phase: "Gap Analysis",
      duration: "2-4 weeks",
      activities: "Current state assessment and requirement mapping",
      costComponent: "\u20B950,000 - \u20B91,50,000",
      icon: Calculator
    },
    {
      phase: "Documentation",
      duration: "4-8 weeks", 
      activities: "Policy creation, procedure development, manual preparation",
      costComponent: "\u20B91,00,000 - \u20B94,00,000",
      icon: FileText
    },
    {
      phase: "Implementation",
      duration: "8-16 weeks",
      activities: "System deployment, training, process integration",
      costComponent: "\u20B91,00,000 - \u20B93,00,000",
      icon: Settings
    },
    {
      phase: "Internal Audit",
      duration: "2-3 weeks",
      activities: "Pre-certification review and compliance check",
      costComponent: "\u20B925,000 - \u20B975,000",
      icon: CheckCircle
    },
    {
      phase: "External Audit",
      duration: "3-5 days",
      activities: "Certification body assessment and evaluation",
      costComponent: "\u20B975,000 - \u20B92,50,000",
      icon: Shield
    },
    {
      phase: "Certificate Issue",
      duration: "2-4 weeks",
      activities: "Final review, certificate preparation and issuance",
      costComponent: "Included in audit cost",
      icon: Award
    }
  ];

  const requiredDocuments = [
    {
      category: "Management System Documents",
      icon: BookOpen,
      color: "blue",
      documents: [
        "Quality Manual (system overview and scope)",
        "Quality Policy & Objectives (management commitment)",
        "Organizational Chart (roles and responsibilities)", 
        "Process Maps & Procedures (detailed workflows)",
        "Risk Assessment (hazard identification and mitigation)",
        "Document Control Register (version control tracking)"
      ]
    },
    {
      category: "Operational Records",
      icon: FileText,
      color: "green",
      documents: [
        "Internal Audit Plan (regular compliance monitoring)",
        "Management Review Records (leadership oversight)",
        "Training Records (employee competency evidence)",
        "Corrective Action Logs (non-conformance handling)",
        "Customer/Stakeholder Feedback (satisfaction surveys)",
        "Performance Monitoring Reports (KPI tracking)"
      ]
    },
    {
      category: "Standard-Specific Documents",
      icon: Settings,
      color: "purple",
      documents: [
        "ISO 9001: Customer satisfaction surveys, supplier evaluation",
        "ISO 14001: Environmental aspects register, legal compliance matrix",
        "ISO 27001: Information security policy, risk treatment plan",
        "ISO 45001: Hazard identification, safety objectives, emergency plans",
        "Compliance Certificates: Environmental clearances, licenses",
        "Audit Trail Records: Evidence of continuous improvement"
      ]
    }
  ];

  const costFactors = [
    {
      factor: "Organization Size",
      impact: "Major cost driver",
      details: [
        "1-25 employees: Base cost range",
        "26-100 employees: 1.5x base cost",
        "101-500 employees: 2-3x base cost",
        "500+ employees: 3-5x base cost"
      ]
    },
    {
      factor: "Industry Complexity",
      impact: "Premium charges",
      details: [
        "High-risk sectors (pharma, medical): +25-40%",
        "Multi-site operations: +\u20B950,000-\u20B92,00,000 per site",
        "Complex processes: +15-30% for design/development",
        "International certification bodies: +20-30%"
      ]
    },
    {
      factor: "Additional Services",
      impact: "Variable costs",
      details: [
        "Consultant fees: \u20B91,500-\u20B95,000 per day",
        "Employee training: \u20B910,000-\u20B925,000 per person",
        "Annual surveillance: 30-50% of certification cost",
        "3-year recertification: 60-80% of initial cost"
      ]
    }
  ];

  const businessBenefits = [
    {
      category: "Operational Benefits",
      icon: TrendingUp,
      color: "blue",
      benefits: [
        "Process optimization and cost reduction",
        "Improved operational efficiency and productivity",
        "Better risk management framework",
        "Standardized procedures and quality consistency"
      ]
    },
    {
      category: "Market Advantages",
      icon: Target,
      color: "green",
      benefits: [
        "Enhanced credibility with customers and partners",
        "Improved tender qualification and B2B contracts",
        "International market access and recognition",
        "Competitive advantage in business proposals"
      ]
    },
    {
      category: "Compliance & Risk",
      icon: Shield,
      color: "purple",
      benefits: [
        "Regulatory compliance and legal protection",
        "Reduced liability and insurance costs",
        "Better stakeholder confidence and trust",
        "Systematic approach to continuous improvement"
      ]
    }
  ];

  const certificationBodies = [
    {
      type: "NABCB-Accredited (Indian)",
      advantages: ["20-30% lower cost", "Local market understanding", "Faster turnaround"],
      suitability: "Domestic businesses, cost-conscious organizations"
    },
    {
      type: "International (UKAS, ANSI-ASQ)",
      advantages: ["Global recognition", "International credibility", "Premium brand value"],
      suitability: "Export businesses, multinational operations"
    }
  ];

  const maintenanceCosts = [
    {
      activity: "Annual Surveillance Audit",
      frequency: "Yearly",
      cost: "\u20B91,00,000 - \u20B93,00,000",
      description: "Mandatory annual compliance review"
    },
    {
      activity: "3-Year Recertification",
      frequency: "Every 3 years",
      cost: "60-80% of initial cost",
      description: "Complete re-assessment for certificate renewal"
    },
    {
      activity: "Consultant Support",
      frequency: "As needed",
      cost: "\u20B950,000 - \u20B92,00,000",
      description: "Ongoing compliance support and updates"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 service-page">
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center soft-shadow">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  ISO Certification Services
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Get ISO 9001, 14001, 27001, 45001 with expert guidance and international recognition.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 font-semibold">
                  <Award className="w-4 h-4 mr-2" />
                  Start ISO Certification
                </Button>
                <Link href="/expert-consultation?service=iso-certification">
                  <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-2.5 font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    Free ISO Consultation
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-6 text-sm">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  20+ Years ISO Expertise
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  1,000+ Companies Certified
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  98% Success Rate
                </div>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Plan certification effectively</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <Calculator className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Budget for documentation, audit, and surveillance costs.
                  </li>
                  <li className="flex items-start">
                    <FileText className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Prepare policies, procedures, and manuals early.
                  </li>
                    <li className="flex items-start">
                    <Shield className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Conduct internal audits before external assessment.
                  </li>
                  <li className="flex items-start">
                    <Award className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Choose accredited certification bodies (NABCB/UKAS).
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ISO Standards & Costs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ISO Certification Cost & Timeline 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive cost breakdown by business size and ISO standard
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {isoStandards.map((iso, index) => (
              <Card key={index} className={`border-l-4 border-l-${iso.color}-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-${iso.color}-100 text-${iso.color}-600`}>
                      <iso.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">{iso.standard}</CardTitle>
                      <CardDescription className="text-sm font-medium">{iso.name}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Small Business:</span>
                      <Badge className={`bg-${iso.color}-100 text-${iso.color}-700`}>
                        {iso.smallBusinessCost}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Medium Business:</span>
                      <Badge variant="outline">{iso.mediumBusinessCost}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Timeline:</span>
                      <span className="text-gray-600">{iso.timeline}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Primary Use:</span>
                      <span className="text-xs text-gray-600">{iso.primaryUse}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Benefits:</h4>
                    <ul className="space-y-1">
                      {iso.benefits.slice(0, 3).map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start text-xs">
                          <CheckCircle className={`w-3 h-3 mr-2 text-${iso.color}-500 flex-shrink-0 mt-0.5`} />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Certification Process */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              6-Phase ISO Certification Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Systematic approach to achieve ISO certification with expert guidance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificationProcess.map((phase, index) => (
              <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                </div>
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <phase.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-bold">{phase.phase}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{phase.activities}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-xs text-blue-600">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{phase.duration}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">{phase.costComponent}</Badge>
                  </div>
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Required Documentation for ISO Certification
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete documentation framework for management system implementation
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
                        <CheckCircle className={`w-4 h-4 mr-3 ${getColorClasses(docCategory.color).text} flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{doc}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Cost Factors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cost Factors & Variables
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key factors affecting ISO certification costs and timeline
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {costFactors.map((factor, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-blue-900">{factor.factor}</CardTitle>
                  <CardDescription className="font-semibold text-orange-600">
                    {factor.impact}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {factor.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="text-sm text-gray-600">
                        • {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Business Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Business Benefits & ROI
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive advantages of ISO certification for business growth
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {businessBenefits.map((benefit, index) => (
              <Card key={index} className={`border-l-4 ${getColorClasses(benefit.color).border} hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${getColorClasses(benefit.color).textDark}`}>
                    <benefit.icon className="w-6 h-6" />
                    {benefit.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefit.benefits.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircle className={`w-4 h-4 mr-3 ${getColorClasses(benefit.color).text} flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Certification Body Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Certification Body Selection
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose between Indian and international certification bodies
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {certificationBodies.map((body, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-purple-900">{body.type}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">Advantages:</h4>
                    <ul className="space-y-1">
                      {body.advantages.map((advantage, advIndex) => (
                        <li key={advIndex} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                          {advantage}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Best For:</h4>
                    <p className="text-sm text-gray-600">{body.suitability}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Maintenance Costs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ongoing Maintenance Costs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Annual and recurring costs for maintaining ISO certification
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {maintenanceCosts.map((cost, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-blue-600">{cost.activity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cost.frequency}</td>
                    <td className="px-6 py-4 text-sm font-bold text-purple-600">{cost.cost}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{cost.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Expert Assistance CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Ready to Get ISO Certified?
              </h3>
              <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                Our ISO experts provide complete certification support from gap analysis to certificate 
                issuance. Get internationally recognized standards compliance with 98% success rate.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 shadow-lg">
                  <Award className="w-5 h-5 mr-2" />
                  Start from {"\u20B9"}2,00,000
                </Button>
                <Link href="/expert-consultation?service=iso-certification">
                  <Button size="lg" className="bg-blue-700 hover:bg-blue-800 text-white border-0 px-8 shadow-lg font-semibold">
                    <Phone className="w-5 h-5 mr-2" />
                    Get Expert Consultation
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-blue-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Complete Documentation Support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>98% Certification Success</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>NABCB & International Bodies</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
