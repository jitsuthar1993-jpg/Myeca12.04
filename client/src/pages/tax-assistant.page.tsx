import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  Bot,
  Sparkles,
  Calculator,
  FileText,
  HelpCircle,
  Calendar,
  PiggyBank,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Lightbulb,
  Target
} from "lucide-react";
import { TaxChatbot } from "@/components/chat/TaxChatbot";
import { SUGGESTED_QUESTIONS, TAX_TIPS } from "@/lib/chatbot-responses";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

// Quick help topics
const HELP_TOPICS = [
  {
    title: "Tax Calculation",
    description: "Calculate your income tax liability",
    icon: Calculator,
    href: "/calculators/income-tax",
    color: "bg-blue-500",
  },
  {
    title: "ITR Filing",
    description: "Step-by-step filing guidance",
    icon: FileText,
    href: "/itr/form-selector",
    color: "bg-green-500",
  },
  {
    title: "Tax Planning",
    description: "Optimize your tax savings",
    icon: Target,
    href: "/tax-optimizer",
    color: "bg-purple-500",
  },
  {
    title: "Regime Comparison",
    description: "Old vs New regime analysis",
    icon: TrendingUp,
    href: "/calculators/regime-comparator",
    color: "bg-orange-500",
  },
  {
    title: "Deadlines",
    description: "Important tax dates",
    icon: Calendar,
    href: "/compliance-calendar",
    color: "bg-red-500",
  },
  {
    title: "Refund Status",
    description: "Track your tax refund",
    icon: Clock,
    href: "/tds-refund-tracker",
    color: "bg-teal-500",
  },
];

// FAQs
const FAQS = [
  {
    question: "Which tax regime should I choose?",
    answer: "The new regime is beneficial if your total deductions (80C, 80D, HRA, etc.) are less than \u20B93.75 lakh. If you have substantial deductions, the old regime may save more tax. Use our regime comparator for a personalized analysis.",
  },
  {
    question: "What is the deadline for ITR filing?",
    answer: "For individuals without audit requirements, the deadline is July 31st of the assessment year. For FY 2024-25, file by July 31, 2025. Late filing attracts penalties and interest.",
  },
  {
    question: "How do I claim HRA exemption?",
    answer: "HRA exemption is the minimum of: (1) Actual HRA received, (2) 50% of salary for metro/40% for non-metro, (3) Rent paid minus 10% of salary. Keep rent receipts and landlord PAN if rent exceeds \u20B91 lakh/year.",
  },
  {
    question: "What is advance tax and when to pay?",
    answer: "Advance tax is paid quarterly if your tax liability exceeds \u20B910,000. Due dates: June 15 (15%), Sept 15 (45%), Dec 15 (75%), March 15 (100%). Missing deadlines attracts interest under sections 234B and 234C.",
  },
  {
    question: "How to e-verify my ITR?",
    answer: "You can e-verify using: (1) Aadhaar OTP - fastest, (2) Net banking, (3) Demat account, (4) Bank ATM. Complete within 30 days of filing. Without verification, your ITR is considered invalid.",
  },
];

export default function TaxAssistantPage() {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/" className="text-purple-200 hover:text-white">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-purple-300" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white">AI Tax Assistant</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Bot className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                AI Tax Assistant
                <Badge variant="secondary" className="bg-white/20 text-white">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Beta
                </Badge>
              </h1>
              <p className="text-purple-200 mt-1">
                Get instant answers to your tax questions with our intelligent assistant
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">24/7</div>
              <div className="text-sm text-purple-200">Available</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">100+</div>
              <div className="text-sm text-purple-200">Tax Topics</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">Instant</div>
              <div className="text-sm text-purple-200">Responses</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-2xl font-bold">Free</div>
              <div className="text-sm text-purple-200">To Use</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              Topics
            </TabsTrigger>
            <TabsTrigger value="faqs" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              FAQs
            </TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chatbot */}
              <div className="lg:col-span-2">
                <TaxChatbot embedded={true} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/calculators/income-tax">
                      <Button variant="outline" className="w-full justify-start">
                        <Calculator className="mr-2 h-4 w-4 text-blue-500" />
                        Calculate Tax
                      </Button>
                    </Link>
                    <Link href="/itr/form-selector">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4 text-green-500" />
                        File ITR
                      </Button>
                    </Link>
                    <Link href="/tax-optimizer">
                      <Button variant="outline" className="w-full justify-start">
                        <PiggyBank className="mr-2 h-4 w-4 text-purple-500" />
                        Tax Optimizer
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* Tax Tips */}
                <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
                      <Lightbulb className="h-5 w-5" />
                      Tax Tip of the Day
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-900">
                      {TAX_TIPS[Math.floor(Math.random() * TAX_TIPS.length)]}
                    </p>
                  </CardContent>
                </Card>

                {/* Suggested Questions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {SUGGESTED_QUESTIONS.map((question, index) => (
                      <button
                        key={index}
                        className="w-full text-left text-sm p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        onClick={() => {
                          setActiveTab("chat");
                          // Would trigger question in chatbot
                        }}
                      >
                        {question}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Topics Tab */}
          <TabsContent value="topics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {HELP_TOPICS.map((topic, index) => (
                <Link key={index} href={topic.href}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer group h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 ${topic.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <topic.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                        {topic.title}
                      </h3>
                      <p className="text-gray-600 text-sm">{topic.description}</p>
                      <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                        Learn more
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </TabsContent>

          {/* FAQs Tab */}
          <TabsContent value="faqs">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Quick answers to common tax queries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {FAQS.map((faq, index) => (
                  <div key={index} className="border-b last:border-0 pb-6 last:pb-0">
                    <h3 className="font-semibold text-lg flex items-start gap-2">
                      <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 mt-2 pl-7">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold">Still have questions?</h3>
                  <p className="text-purple-200">Chat with our AI assistant or speak to a tax expert</p>
                </div>
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setActiveTab("chat")}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat Now
                  </Button>
                  <Link href="/help">
                    <Button variant="outline" className="border-white text-white hover:bg-white/10">
                      Contact Expert
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

