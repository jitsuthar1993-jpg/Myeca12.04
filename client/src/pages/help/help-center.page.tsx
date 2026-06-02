import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SEO from '@/components/SEO';
import { 
  Search, 
  FileText, 
  Calculator, 
  Users, 
  Shield, 
  CreditCard,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Phone,
  Mail,
  ChevronRight,
  Clock
} from 'lucide-react';

const helpCategories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: BookOpen,
    description: 'New to MyeCA.in? Start here',
    articles: [
      { title: 'How to create an account', href: '/help/user-guide' },
      { title: 'Understanding ITR forms', href: '/itr/form-selector' },
      { title: 'Document requirements checklist', href: '/itr/step-by-step-guide' },
      { title: 'First-time tax filing guide', href: '/help/user-guide' }
    ]
  },
  {
    id: 'itr-filing',
    title: 'ITR Filing',
    icon: FileText,
    description: 'Everything about filing your returns',
    articles: [
      { title: 'Step-by-step ITR filing process', href: '/itr/step-by-step-guide' },
      { title: 'Which ITR form should I use?', href: '/itr/form-selector' },
      { title: 'Common ITR filing mistakes', href: '/learn/guides' },
      { title: 'How to claim deductions', href: '/calculators/tax-regime' }
    ]
  },
  {
    id: 'calculators',
    title: 'Tax Calculators',
    icon: Calculator,
    description: 'Learn to use our calculators',
    articles: [
      { title: 'Income tax calculator guide', href: '/calculators/income-tax' },
      { title: 'HRA calculator explained', href: '/calculators/hra' },
      { title: 'Capital gains calculation', href: '/calculators/capital-gains' },
      { title: 'TDS calculator tutorial', href: '/calculators/tds' }
    ]
  },
  {
    id: 'account',
    title: 'Account & Security',
    icon: Shield,
    description: 'Manage your account safely',
    articles: [
      { title: 'Reset your password', href: '/forgot-password' },
      { title: 'Two-factor authentication setup', href: '/settings/account' },
      { title: 'Update profile information', href: '/settings/account' },
      { title: 'Data security measures', href: '/trust' }
    ]
  },
  {
    id: 'payment',
    title: 'Payments & Refunds',
    icon: CreditCard,
    description: 'Billing and refund information',
    articles: [
      { title: 'Payment methods accepted', href: '/pricing' },
      { title: 'Refund policy explained', href: '/legal/refund-policy' },
      { title: 'Invoice download guide', href: '/payments' },
      { title: 'Subscription management', href: '/settings/account' }
    ]
  },
  {
    id: 'troubleshooting',
    title: 'Troubleshooting',
    icon: HelpCircle,
    description: 'Fix common issues',
    articles: [
      { title: 'Login issues resolution', href: '/help/faq' },
      { title: 'Form submission errors', href: '/help' },
      { title: 'Document upload problems', href: '/help' },
      { title: 'Browser compatibility', href: '/help' }
    ]
  }
];

const popularArticles = [
  { 
    title: 'Complete ITR Filing Guide 2025-26',
    category: 'ITR Filing',
    readTime: '8 min',
  },
  {
    title: 'Tax Saving Investments Under Section 80C',
    category: 'Tax Planning',
    readTime: '6 min',
  },
  {
    title: 'New vs Old Tax Regime Comparison',
    category: 'Tax Planning',
    readTime: '5 min',
  },
  {
    title: 'GST Return Filing Step-by-Step',
    category: 'Business Services',
    readTime: '10 min',
  },
  {
    title: 'Capital Gains Tax Calculation Guide',
    category: 'Tax Calculators',
    readTime: '7 min',
  }
];

const videoTutorials = [
  {
    title: 'ITR Filing in 3 Minutes',
    duration: '3:24',
    status: 'Lesson outline ready'
  },
  {
    title: 'Understanding Form 16',
    duration: '5:18',
    status: 'Lesson outline ready'
  },
  {
    title: 'Tax Deductions Explained',
    duration: '7:45',
    status: 'In production'
  },
  {
    title: 'Using MyeCA Dashboard',
    duration: '4:32',
    status: 'In production'
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  return (
    <>
      <SEO 
        title="Help Center - MyeCA.in"
        description="Find answers to your questions about tax filing, ITR forms, calculators, and more in our comprehensive help center"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-100 py-16 relative overflow-hidden">
          {/* Abstract background decorative element */}
          <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-50/50 rounded-full blur-3xl -mr-64 -mt-64"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="type-page-title mb-6 font-black text-slate-900">
                How can we <span className="text-blue-600 italic">help you?</span>
              </h1>
              <p className="text-xl mb-10 text-slate-500 font-medium leading-relaxed">
                Search our knowledge base or browse categories below
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Explain your tax problem here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 pr-4 py-8 text-lg bg-white text-slate-900 placeholder-slate-400 rounded-2xl border-2 border-slate-100 shadow-xl shadow-slate-200/20 focus:ring-4 focus:ring-blue-500/10 transition-all"
                />
                <Button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 h-12 font-bold shadow-lg shadow-blue-500/25"
                  size="lg"
                >
                  Search
                </Button>
              </div>
              
              {/* Quick Links */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                  ITR Filing Guide
                </Badge>
                <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                  Tax Calculator
                </Badge>
                <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                  Document Checklist
                </Badge>
                <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-blue-600 cursor-pointer px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm">
                  Refund Status
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Categories and Articles */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="categories">Categories</TabsTrigger>
                  <TabsTrigger value="popular">Recommended</TabsTrigger>
                  <TabsTrigger value="videos">Lessons</TabsTrigger>
                </TabsList>
                
                <TabsContent value="categories" className="space-y-6 mt-6">
                  {helpCategories.map((category, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <category.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-xl">{category.title}</CardTitle>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {category.articles.map((article, index) => (
                            <li key={index}>
                              <Link href={article.href}>
                                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer group">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                                      {article.title}
                                    </h4>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                      <span>Help article</span>
                                      <span>Updated for current workflows</span>
                                    </div>
                                  </div>
                                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Button variant="link" className="mt-4 p-0">
                          View {category.title} articles
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="popular" className="space-y-4 mt-6">
                  <h3 className="text-2xl font-semibold mb-4">Recommended Articles</h3>
                  {popularArticles.map((article, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Badge variant="secondary" className="mb-2">
                              {article.category}
                            </Badge>
                            <h4 className="text-lg font-semibold mb-2">
                              {article.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {article.readTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                Help guide
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Read
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>
                
                <TabsContent value="videos" className="mt-6">
                  <h3 className="text-2xl font-semibold mb-4">Help Lessons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {videoTutorials.map((video, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                        <div className="aspect-video bg-gray-200 relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <Badge className="absolute top-2 right-2 bg-blue-900/70">
                            {video.duration}
                          </Badge>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold mb-1">{video.title}</h4>
                          <p className="text-sm text-gray-600">{video.status}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Contact Support */}
            <div className="space-y-6">
              {/* Contact Support Card */}
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-900">Need More Help?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-blue-800">
                    Can't find what you're looking for? Our support team is here to help.
                  </p>
                  
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Live Chat
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Phone className="w-4 h-4 mr-2" />
                      Request a Callback
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <p className="text-sm text-blue-700 mb-2">Support Hours:</p>
                    <p className="text-sm text-blue-600">
                      Monday - Saturday: 9 AM - 8 PM IST<br />
                      Sunday: 10 AM - 6 PM IST
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link href="/itr/start?source=help_center_quick_link">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          Start ITR Filing
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/dashboard">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          My Dashboard
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/documents">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          Document Center
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link href="/pricing">
                        <span className="text-blue-600 hover:underline cursor-pointer">
                          View Pricing
                        </span>
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* FAQ Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Help Coverage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Help Categories</span>
                    <span className="font-semibold">{helpCategories.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Featured Articles</span>
                    <span className="font-semibold">{popularArticles.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Help Lessons</span>
                    <span className="font-semibold">{videoTutorials.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Support Channels</span>
                    <span className="font-semibold">3</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
