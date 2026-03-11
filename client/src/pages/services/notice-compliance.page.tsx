import { useState } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  FileText, 
  Clock, 
  Shield, 
  CheckCircle, 
  Phone, 
  Mail, 
  Users,
  Award,
  TrendingUp,
  ArrowRight,
  MessageSquare,
  AlertCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function NoticeCompliancePage() {
  const [selectedNoticeType, setSelectedNoticeType] = useState<string>("");
  const [urgencyLevel, setUrgencyLevel] = useState<string>("");

  const noticeTypes = [
    {
      id: "scrutiny",
      title: "Scrutiny Assessment (Section 143(2))",
      description: "Detailed examination of your ITR by the tax department.",
      urgency: "High",
      timeLimit: "30 days",
      color: "red"
    },
    {
      id: "mismatch",
      title: "Mismatch Notice (Section 139(9))",
      description: "Discrepancy found between ITR and TDS/TCS data.",
      urgency: "Medium",
      timeLimit: "15 days",
      color: "orange"
    },
    {
      id: "default_assessment",
      title: "Best Judgment (Section 144)",
      description: "Issued for non-filing or incomplete ITR submission.",
      urgency: "High",
      timeLimit: "30 days",
      color: "red"
    },
    {
      id: "penalty",
      title: "Penalty Notice (Section 271)",
      description: "For concealment of income or inaccurate particulars.",
      urgency: "High",
      timeLimit: "21 days",
      color: "red"
    },
    {
      id: "rectification",
      title: "Rectification (Section 154)",
      description: "For correction of arithmetic or clerical mistakes.",
      urgency: "Low",
      timeLimit: "60 days",
      color: "green"
    },
    {
      id: "intimation",
      title: "Intimation u/s 143(1)",
      description: "Processing intimation with tax demand or refund.",
      urgency: "Medium",
      timeLimit: "30 days",
      color: "blue"
    }
  ];

  const processSteps = [
    {
      step: 1,
      title: "Analysis",
      description: "Expert review of notice within 24 hours.",
      icon: SearchIcon,
      color: "blue"
    },
    {
      step: 2,
      title: "Strategy",
      description: "Document review and response planning.",
      icon: FileText,
      color: "green"
    },
    {
      step: 3,
      title: "Drafting",
      description: "Professional response preparation with evidence.",
      icon: MessageSquare,
      color: "purple"
    },
    {
      step: 4,
      title: "Resolution",
      description: "Filing and follow-up until closure.",
      icon: CheckCircle,
      color: "teal"
    }
  ];

  const successStats = [
    { label: "Notices Resolved", value: "5,000+", icon: FileText },
    { label: "Success Rate", value: "95%", icon: TrendingUp },
    { label: "Response Time", value: "24 Hrs", icon: Clock },
    { label: "Expert CAs", value: "50+", icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Notice Compliance
                </h1>
              </div>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Expert handling of Income Tax notices with 24-hour analysis and guaranteed professional response.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold">
                  <Phone className="w-4 h-4 mr-2" />
                  Talk to Expert
                </Button>
                <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 font-semibold">
                  <Mail className="w-4 h-4 mr-2" />
                  Upload Notice
                </Button>
              </div>
            </div>
            
            {/* Quick Tips Panel */}
            <Card className="bg-white border-l-4 border-l-red-500 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-900">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Quick Action Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>Check the <strong>DIN Number</strong> on the notice instantly.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FileText className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                    <span>Do not ignore; response time is usually <strong>15-30 days</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Always reply via the <strong>official e-filing portal</strong>.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {successStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div className="p-3 bg-red-50 rounded-lg">
                <stat.icon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Notice Types Grid */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <FileText className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Notices We Handle</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {noticeTypes.map((notice) => (
                  <Card key={notice.id} className="hover:shadow-md transition-shadow duration-200 border-gray-200">
                    <CardHeader className="pb-2 space-y-0">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className={`
                          ${notice.urgency === 'High' ? 'text-red-600 border-red-200 bg-red-50' : 
                            notice.urgency === 'Medium' ? 'text-orange-600 border-orange-200 bg-orange-50' : 
                            'text-green-600 border-green-200 bg-green-50'}
                        `}>
                          {notice.urgency} Urgency
                        </Badge>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {notice.timeLimit}
                        </span>
                      </div>
                      <CardTitle className="text-base font-semibold text-gray-900 leading-snug">
                        {notice.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{notice.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Process Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-gray-700" />
                <h2 className="text-xl font-bold text-gray-900">Resolution Process</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="grid md:grid-cols-4 gap-6">
                  {processSteps.map((step, index) => (
                    <div key={index} className="relative text-center">
                      {index < processSteps.length - 1 && (
                        <div className="hidden md:block absolute top-6 left-1/2 w-full h-0.5 bg-gray-100 -z-10" />
                      )}
                      <div className="w-12 h-12 mx-auto bg-white border-2 border-red-100 rounded-full flex items-center justify-center mb-3 shadow-sm z-10 relative">
                        <span className="text-red-600 font-bold">{step.step}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-xs text-gray-500">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Guarantees */}
            <section className="grid sm:grid-cols-2 gap-4">
               <Card className="bg-blue-50/50 border-blue-100">
                 <CardContent className="p-4 flex items-start gap-3">
                   <Shield className="w-5 h-5 text-blue-600 mt-1" />
                   <div>
                     <h4 className="font-semibold text-blue-900 text-sm">100% Confidential</h4>
                     <p className="text-xs text-blue-700 mt-1">Your data is encrypted and handled only by assigned experts.</p>
                   </div>
                 </CardContent>
               </Card>
               <Card className="bg-green-50/50 border-green-100">
                 <CardContent className="p-4 flex items-start gap-3">
                   <Award className="w-5 h-5 text-green-600 mt-1" />
                   <div>
                     <h4 className="font-semibold text-green-900 text-sm">CA Certified</h4>
                     <p className="text-xs text-green-700 mt-1">All responses drafted and reviewed by qualified Chartered Accountants.</p>
                   </div>
                 </CardContent>
               </Card>
            </section>
          </div>

          {/* Sidebar - Quick Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="shadow-lg border-red-100 overflow-hidden">
                <div className="bg-red-600 p-4 text-white">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Get Expert Help
                  </h3>
                  <p className="text-red-100 text-sm mt-1">Upload notice for instant analysis</p>
                </div>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-gray-500 font-semibold">Notice Type</Label>
                    <Select value={selectedNoticeType} onValueChange={setSelectedNoticeType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Notice Type" />
                      </SelectTrigger>
                      <SelectContent>
                        {noticeTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-gray-500 font-semibold">Contact Details</Label>
                    <Input placeholder="Full Name" className="h-9" />
                    <Input placeholder="Phone Number" className="h-9 mt-2" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase text-gray-500 font-semibold">Upload Notice (Optional)</Label>
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <Users className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                      <p className="text-xs text-gray-500">Click to upload PDF/JPG</p>
                    </div>
                  </div>

                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Request Call Back
                  </Button>
                  
                  <p className="text-[10px] text-center text-gray-400">
                    By submitting, you agree to our privacy policy.
                  </p>
                </CardContent>
              </Card>

              <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200 text-center">
                <p className="text-sm text-gray-600 mb-2">Need immediate assistance?</p>
                <a href="tel:+919876543210" className="text-lg font-bold text-gray-900 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4 text-red-600" />
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
