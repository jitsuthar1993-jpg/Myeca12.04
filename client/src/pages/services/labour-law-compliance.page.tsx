import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Users, 
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
  HardHat,
  Briefcase,
  Scale,
  UserCheck
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

export default function LabourLawCompliancePage() {
  const [selectedCompliance, setSelectedCompliance] = useState<string>("");
  const [isFormVisible, setIsFormVisible] = useState(false);

  const complianceAreas = [
    {
      area: "PF (Provident Fund)",
      coverage: "20+ employees",
      contribution: "12% employer + 12% employee",
      ceiling: "\u20B915,000 per month (max \u20B91,800)",
      dueDate: "15th of following month",
      color: "blue",
      icon: IndianRupee,
      forms: ["Form 19", "Form 31", "Monthly ECR", "Annual Return"],
      changes2025: "Universal Account Number (UAN) 2.0 with biometric verification"
    },
    {
      area: "ESI (Employee State Insurance)",
      coverage: "10+ employees",
      contribution: "4.75% employer + 1.75% employee",
      ceiling: "\u20B925,000 per month (increased from \u20B921,000)",
      dueDate: "21st of following month",
      color: "green",
      icon: Shield,
      forms: ["Form 01", "Form 02", "Form 34", "Half-yearly Returns"],
      changes2025: "One-Nation-One-ESI Card with portable benefits for gig workers"
    },
    {
      area: "Contract Labour Act",
      coverage: "20+ contract workers",
      requirement: "Registration + License for contractors",
      forms: "Forms A, B, C, D (simplified)",
      dueDate: "Monthly compliance reporting",
      color: "purple",
      icon: Users,
      documents: ["Form I (Registration)", "Form V (License)", "Muster Rolls", "Wage Registers"],
      changes2025: "Simplified compliance forms under Ease of Compliance initiative"
    },
    {
      area: "Factory Act & Shop Act",
      coverage: "All establishments",
      requirement: "Factory license + State registrations",
      forms: "State-specific compliance",
      dueDate: "7th, 15th, 21st monthly cycles",
      color: "orange",
      icon: Factory,
      documents: ["Factory License", "Shop & Establishment License", "Return Forms"],
      changes2025: "Unified Shram Suvidha Portal for single-window approvals"
    }
  ];

  const complianceCalendar = [
    {
      date: "7th of Month",
      compliance: "TDS Deposit + Form ITNS281",
      applicability: "All employers with TDS obligations",
      penalty: "1% per month interest",
      icon: CreditCard
    },
    {
      date: "15th of Month",
      compliance: "PF Deposits + ECR Filing",
      applicability: "Establishments with 20+ employees",
      penalty: "12% + 25% damages",
      icon: IndianRupee
    },
    {
      date: "21st of Month",
      compliance: "ESI Contributions + Returns",
      applicability: "Establishments with 10+ employees",
      penalty: "12% interest + damages",
      icon: Shield
    },
    {
      date: "End of Month",
      compliance: "Factory Act Returns + Professional Tax",
      applicability: "Manufacturing establishments + All employees",
      penalty: "State-specific penalties",
      icon: Factory
    }
  ];

  const essentialDocuments = [
    {
      category: "Employment Contracts",
      icon: FileText,
      color: "blue",
      documents: [
        "Written employment agreements (mandatory for all employees)",
        "Service agreements for consultants and freelancers",
        "Standing orders (for establishments with 100+ employees)",
        "Appointment letters with clear terms and conditions",
        "Job descriptions and role specifications",
        "Probation and confirmation letters with performance criteria"
      ]
    },
    {
      category: "Statutory Registrations",
      icon: BookOpen,
      color: "green",
      documents: [
        "Shop & Establishment Act license (state-wise registration)",
        "Factory license under Factories Act (if applicable)",
        "Professional Tax registration (state-wise requirement)",
        "Labour license under various state labor laws",
        "Contract Labour Act registration (principal employer)",
        "PF and ESI registration certificates with updated details"
      ]
    },
    {
      category: "Record Maintenance (Digital)",
      icon: Upload,
      color: "purple",
      documents: [
        "Forms A, B, C, D (simplified compliance registers)",
        "Attendance and wage registers (digitally maintained)",
        "Overtime registers with proper authorization",
        "Leave records and statutory benefit calculations",
        "Employee database with PF/ESI numbers",
        "Training and safety records with compliance certificates"
      ]
    }
  ];

  const newSimplifiedForms = [
    {
      form: "Form A",
      description: "Combined Employee Register",
      replaces: "Multiple employee data registers",
      benefits: ["Single source of truth", "Reduced paperwork", "Digital integration"]
    },
    {
      form: "Form B", 
      description: "Attendance and Wage Register",
      replaces: "Separate attendance and wage books",
      benefits: ["Automated calculations", "Real-time updates", "Compliance tracking"]
    },
    {
      form: "Form C",
      description: "Overtime Register",
      replaces: "Manual overtime tracking",
      benefits: ["Statutory limit monitoring", "Cost calculations", "Approval workflow"]
    },
    {
      form: "Form D",
      description: "Statutory Deductions Register", 
      replaces: "Multiple deduction registers",
      benefits: ["PF/ESI integration", "Tax calculations", "Compliance reporting"]
    }
  ];

  const digitalPlatforms = [
    {
      platform: "Shram Suvidha Portal",
      services: ["Unified registration", "Single window licensing", "Online returns"],
      benefits: "One-stop compliance solution",
      url: "shramsuvidha.gov.in"
    },
    {
      platform: "EPFO Portal", 
      services: ["ECR filing", "Contribution deposits", "UAN services"],
      benefits: "Complete PF management",
      url: "epfindia.gov.in"
    },
    {
      platform: "ESIC Portal",
      services: ["Contribution payments", "Employee registration", "Medical benefits"],
      benefits: "Comprehensive ESI services",
      url: "esic.in"
    }
  ];

  const penaltiesStructure = [
    {
      violation: "PF Non-Compliance",
      penalty: "12% interest + 25% damages",
      criminalLiability: "1-3 years imprisonment",
      additionalConsequences: "Establishment closure, blacklisting from government contracts"
    },
    {
      violation: "ESI Non-Compliance", 
      penalty: "12% interest + damages",
      criminalLiability: "6 months - 2 years",
      additionalConsequences: "Medical benefit suspension, legal prosecution"
    },
    {
      violation: "Contract Labour Violations",
      penalty: "\u20B910,000 - \u20B91,00,000 fine",
      criminalLiability: "3-12 months imprisonment",
      additionalConsequences: "License cancellation, contractor debarment"
    },
    {
      violation: "Factory Act Violations",
      penalty: "\u20B925,000 - \u20B91,00,000 fine",
      criminalLiability: "6 months - 2 years",
      additionalConsequences: "Factory closure, safety certificate suspension"
    }
  ];

  const bestPractices2025 = [
    {
      category: "Digital Compliance",
      icon: Globe,
      color: "blue",
      practices: [
        "Use integrated payroll software for automated calculations",
        "Implement digital attendance systems with biometric verification",
        "Maintain cloud-based records with daily backup protocols",
        "Enable real-time compliance monitoring and alert systems"
      ]
    },
    {
      category: "Proactive Management",
      icon: Target,
      color: "green",
      practices: [
        "Conduct monthly compliance audits and reviews",
        "Stay updated with quarterly labor law amendments",
        "Maintain direct communication channels with labor offices",
        "Implement employee self-service portals for transparency"
      ]
    },
    {
      category: "Professional Support",
      icon: Users,
      color: "purple",
      practices: [
        "Engage certified labor law consultants for complex compliance",
        "Regular training programs for HR and payroll teams",
        "Establish compliance committees with clear responsibilities",
        "Annual compliance certification from authorized professionals"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-red-50 service-page">
      {/* Header */}
      <section className="bg-white border-b soft-border py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center soft-shadow">
                  <Users className="w-8 h-8 text-orange-600" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Labour Law Compliance Services
                </h1>
              </div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl leading-relaxed mb-6">
                Complete PF, ESI, Contract Labour and Factory Act compliance with expert guidance.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 font-semibold">
                  <Users className="w-4 h-4 mr-2" />
                  Start Compliance
                </Button>
                <Link href="/expert-consultation?service=labour-law-compliance">
                  <Button size="sm" variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-5 py-2.5 font-semibold">
                    <Phone className="w-4 h-4 mr-2" />
                    Labour Law Expert
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-6 mt-6 text-sm">
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  25+ Years Expertise
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  10,000+ Companies Compliant
                </div>
                <div className="flex items-center text-gray-700">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                  Zero Penalty Track Record
                </div>
              </div>
            </div>
            <Card className="soft-shadow">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-600" />
                  Quick Tips
                </CardTitle>
                <CardDescription>Stay compliant every month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CreditCard className="w-4 h-4 mr-2 text-blue-600 mt-0.5" />
                    Deposit TDS by 7th; PF by 15th; ESI by 21st monthly.
                  </li>
                  <li className="flex items-start">
                    <BookOpen className="w-4 h-4 mr-2 text-indigo-600 mt-0.5" />
                    Maintain digital registers (Forms A–D) for audits.
                  </li>
                  <li className="flex items-start">
                    <Factory className="w-4 h-4 mr-2 text-orange-600 mt-0.5" />
                    Ensure factory/shop licenses are up-to-date.
                  </li>
                  <li className="flex items-start">
                    <UserCheck className="w-4 h-4 mr-2 text-green-600 mt-0.5" />
                    Keep UAN/ESI records current for all employees.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Key Compliance Areas 2025 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Key Labour Law Compliance Areas 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Updated requirements and contribution rates for major labor law compliances
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {complianceAreas.map((compliance, index) => (
              <Card key={index} className={`border-l-4 border-l-${compliance.color}-500 hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-${compliance.color}-100 text-${compliance.color}-600`}>
                      <compliance.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">{compliance.area}</CardTitle>
                      <Badge className={`mt-1 bg-${compliance.color}-100 text-${compliance.color}-700`}>
                        {compliance.coverage}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Contribution/Requirement:</span>
                      <span className="text-gray-600 text-xs">{compliance.contribution || compliance.requirement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ceiling/Forms:</span>
                      <span className="text-gray-600 text-xs">{compliance.ceiling || compliance.forms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Due Date:</span>
                      <Badge variant="outline" className="text-xs">{compliance.dueDate}</Badge>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2">2025 Updates:</h4>
                    <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                      {compliance.changes2025}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm mb-2">Key Forms:</h4>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(compliance.forms) ? compliance.forms.slice(0, 2).map((form, formIndex) => (
                        <Badge key={formIndex} variant="outline" className="text-xs">
                          {form}
                        </Badge>
                      )) : (
                        <Badge variant="outline" className="text-xs">
                          {compliance.forms}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Monthly Compliance Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Monthly Compliance Calendar
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key compliance dates and deadlines for labour law obligations
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complianceCalendar.map((calendar, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3 bg-orange-100 text-orange-600">
                    <calendar.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-lg font-bold text-orange-900">{calendar.date}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <h4 className="font-semibold text-sm mb-2">{calendar.compliance}</h4>
                  <p className="text-xs text-gray-600 mb-2">{calendar.applicability}</p>
                  <Badge variant="outline" className="text-xs text-red-600 border-red-300">
                    {calendar.penalty}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Essential Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Essential Documents & Records
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete documentation checklist for labour law compliance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {essentialDocuments.map((docCategory, index) => (
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
        </motion.div>

        {/* New Simplified Forms 2025 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              New Simplified Forms Under "Ease of Compliance"
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ministry of Labour's simplified forms replacing multiple existing registers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newSimplifiedForms.map((form, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <CardTitle className="text-lg font-bold text-purple-900">{form.form}</CardTitle>
                  <CardDescription className="text-sm">{form.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <h4 className="font-semibold text-xs mb-1">Replaces:</h4>
                    <p className="text-xs text-gray-600">{form.replaces}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-xs mb-1">Benefits:</h4>
                    <ul className="space-y-1">
                      {form.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="text-xs text-gray-600">
                          • {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Digital Compliance Platforms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Digital Compliance Platforms
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Government digital platforms for streamlined labour law compliance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {digitalPlatforms.map((platform, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-blue-900">{platform.platform}</CardTitle>
                  <CardDescription className="text-green-600 font-semibold">
                    {platform.benefits}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-3">
                    <h4 className="font-semibold text-sm mb-2">Available Services:</h4>
                    <ul className="space-y-1">
                      {platform.services.map((service, serviceIndex) => (
                        <li key={serviceIndex} className="flex items-start text-sm">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                          {service}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    {platform.url}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Penalties Structure */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Penalties & Consequences for Non-Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Detailed penalty structure and legal consequences for labour law violations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Violation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Financial Penalty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criminal Liability</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Additional Consequences</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {penaltiesStructure.map((penalty, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-orange-600">{penalty.violation}</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-bold">{penalty.penalty}</td>
                    <td className="px-6 py-4 text-sm text-purple-600 font-semibold">{penalty.criminalLiability}</td>
                    <td className="px-6 py-4 text-xs text-gray-600">{penalty.additionalConsequences}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Best Practices 2025 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Best Practices for Labour Law Compliance 2025
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern approaches to ensure seamless compliance and risk mitigation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {bestPractices2025.map((practice, index) => (
              <Card key={index} className={`border-l-4 border-l-${practice.color}-500 hover:shadow-lg transition-shadow`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 text-${practice.color}-900`}>
                    <practice.icon className="w-6 h-6" />
                    {practice.category}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {practice.practices.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start">
                        <CheckCircle className={`w-4 h-4 mr-3 text-${practice.color}-500 flex-shrink-0 mt-0.5`} />
                        <span className="text-sm text-gray-700">{item}</span>
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
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">
                Need Expert Labour Law Compliance?
              </h3>
              <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                Our labour law experts ensure complete PF, ESI, Contract Labour Act, and Factory Act 
                compliance with latest 2025 updates. Zero penalty guarantee with proactive management.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 px-8 shadow-lg">
                  <Users className="w-5 h-5 mr-2" />
                  Complete Compliance {"\u20B9"}2,999/month
                </Button>
                <Link href="/expert-consultation?service=labour-law-compliance">
                  <Button size="lg" className="bg-orange-700 hover:bg-orange-800 text-white border-0 px-8 shadow-lg font-semibold">
                    <Phone className="w-5 h-5 mr-2" />
                    Get Expert Consultation
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 text-sm text-orange-100">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Zero Penalty Guarantee</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Latest 2025 Updates</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span>Digital Platform Integration</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
