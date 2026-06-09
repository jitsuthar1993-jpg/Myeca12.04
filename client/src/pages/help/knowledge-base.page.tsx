import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import { 
  Search,
  BookOpen,
  FileText,
  Calculator,
  Shield,
  Building,
  AlertCircle,
  TrendingUp,
  Users,
  ChevronRight,
  Calendar,
  DollarSign,
  Briefcase
} from 'lucide-react';

const knowledgeCategories = [
  {
    id: 'tax-basics',
    title: 'Tax Basics',
    icon: FileText,
    color: 'blue',
    articles: [
      { 
        title: 'Understanding Income Tax in India',
        description: 'Guide to income-tax concepts, slab calculations, and records used for filing',
        readTime: '15 min',
        level: 'Beginner',
        href: '/calculators/income-tax'
      },
      {
        title: 'Types of Income Sources',
        description: 'Learn about salary, business, capital gains, and other income types',
        readTime: '12 min',
        level: 'Beginner',
        href: '/learn/guides'
      },
      {
        title: 'Tax Deductions Under Section 80',
        description: 'Section 80 deduction list with eligibility and record checks',
        readTime: '20 min',
        level: 'Intermediate',
        href: '/calculators/tax-regime'
      },
      {
        title: 'Form 16 Explained',
        description: 'Understanding your salary certificate and tax details',
        readTime: '10 min',
        level: 'Beginner',
        href: '/form16-parser'
      }
    ]
  },
  {
    id: 'advanced-tax',
    title: 'Advanced Tax Topics',
    icon: TrendingUp,
    color: 'purple',
    articles: [
      {
        title: 'Capital Gains Tax Guide',
        description: 'STCG, LTCG, indexation benefits, and exemptions explained',
        readTime: '25 min',
        level: 'Advanced',
        href: '/calculators/capital-gains'
      },
      {
        title: 'International Taxation',
        description: 'DTAA, foreign income, and NRI taxation rules',
        readTime: '30 min',
        level: 'Advanced',
        href: '/expert-consultation'
      },
      {
        title: 'Tax Planning for HNIs',
        description: 'Strategies for high net worth individuals',
        readTime: '22 min',
        level: 'Advanced',
        href: '/expert-consultation'
      },
      {
        title: 'Cryptocurrency Taxation',
        description: 'How crypto gains are taxed in India',
        readTime: '15 min',
        level: 'Intermediate',
        href: '/capital-gains-import'
      }
    ]
  },
  {
    id: 'business-tax',
    title: 'Business Taxation',
    icon: Building,
    color: 'green',
    articles: [
      {
        title: 'GST Registration and Return Guide',
        description: 'Registration, returns, ITC, and compliance',
        readTime: '35 min',
        level: 'Intermediate',
        href: '/services/gst-returns'
      },
      {
        title: 'Presumptive Taxation',
        description: 'Section 44AD, 44ADA benefits for small businesses',
        readTime: '18 min',
        level: 'Intermediate',
        href: '/itr/form-selector'
      },
      {
        title: 'TDS Compliance for Businesses',
        description: 'When and how to deduct TDS',
        readTime: '20 min',
        level: 'Intermediate',
        href: '/services/tds-filing'
      },
      {
        title: 'Startup Tax Benefits',
        description: 'Tax holidays and incentives for startups',
        readTime: '16 min',
        level: 'Beginner',
        href: '/startup-services'
      }
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance & Deadlines',
    icon: Calendar,
    color: 'orange',
    articles: [
      {
        title: 'Tax Calendar 2025-26',
        description: 'All important tax dates and deadlines',
        readTime: '8 min',
        level: 'Beginner',
        href: '/compliance-calendar'
      },
      {
        title: 'Penalty and Interest Calculation',
        description: 'Late filing penalties and interest rates',
        readTime: '12 min',
        level: 'Intermediate',
        href: '/calculators/penalty'
      },
      {
        title: 'Notice Handling Guide',
        description: 'How to respond to income tax notices',
        readTime: '15 min',
        level: 'Intermediate',
        href: '/services/notice-compliance'
      },
      {
        title: 'Audit and Assessment',
        description: 'Types of assessments and preparation',
        readTime: '20 min',
        level: 'Advanced',
        href: '/services/audit-services'
      }
    ]
  },
  {
    id: 'investments',
    title: 'Investment & Tax Saving',
    icon: DollarSign,
    color: 'emerald',
    articles: [
      {
        title: 'Tax Saving Investments',
        description: 'ELSS, PPF, NPS, and other 80C options compared',
        readTime: '18 min',
        level: 'Beginner',
        href: '/elss-comparator'
      },
      {
        title: 'NPS Tax Benefits',
        description: 'Additional 50K deduction and retirement planning',
        readTime: '14 min',
        level: 'Intermediate',
        href: '/calculators/nps'
      },
      {
        title: 'Life Insurance and Tax',
        description: 'Premium deductions and maturity taxation',
        readTime: '16 min',
        level: 'Intermediate',
        href: '/tax-optimizer'
      },
      {
        title: 'Real Estate Tax Planning',
        description: 'Home loan benefits and property taxation',
        readTime: '22 min',
        level: 'Advanced',
        href: '/calculators/home-loan'
      }
    ]
  },
  {
    id: 'special-cases',
    title: 'Special Cases',
    icon: AlertCircle,
    color: 'red',
    articles: [
      {
        title: 'NRI Taxation Guide',
        description: 'Guide to residency, India-source income, reporting, and filing records for non-residents',
        readTime: '28 min',
        level: 'Advanced',
        href: '/expert-consultation'
      },
      {
        title: 'Senior Citizen Benefits',
        description: 'Special provisions and higher exemptions',
        readTime: '15 min',
        level: 'Beginner',
        href: '/itr/form-selector'
      },
      {
        title: 'Freelancer Tax Guide',
        description: 'Tax planning for gig economy workers',
        readTime: '20 min',
        level: 'Intermediate',
        href: '/itr/form-selector'
      },
      {
        title: 'Women Tax Benefits',
        description: 'Special deductions and schemes',
        readTime: '12 min',
        level: 'Beginner',
        href: '/learn/guides'
      }
    ]
  }
];

const featuredArticles = [
  {
    title: 'New vs Old Tax Regime - Complete Analysis',
    description: 'Detailed comparison with calculator and recommendations for different income levels',
    category: 'Tax Basics',
    readTime: '25 min',
    icon: Calculator,
    trending: true
  },
  {
    title: 'Budget 2025 Tax Changes',
    description: 'All tax changes announced in Union Budget 2025 explained',
    category: 'Updates',
    readTime: '15 min',
    icon: FileText,
    trending: true
  },
  {
    title: 'Complete ITR Filing Checklist',
    description: 'Step-by-step checklist to reduce filing mistakes',
    category: 'Filing Guide',
    readTime: '12 min',
    icon: Shield,
    trending: false
  }
];

export default function KnowledgeBasePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredCategories = selectedCategory
    ? knowledgeCategories.filter(cat => cat.id === selectedCategory)
    : knowledgeCategories;

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; text: string; border: string } } = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200' },
      green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-200' },
      emerald: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-200' },
      red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-200' }
    };
    return colorMap[color] || colorMap.blue;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <>
      <SEO 
        title="Knowledge Base - Tax Guides & Articles | MyeCA.in"
        description="Tax knowledge base with guides on income tax, GST, investments, and business taxation."
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-indigo-200" />
              <h1 className="type-page-title mb-6 font-bold">
                Tax Knowledge Base
              </h1>
              <p className="text-xl mb-8 text-indigo-100">
                Expert-written guides and articles on all aspects of taxation
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search articles, guides, tax topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-6 text-lg bg-white text-gray-900 placeholder-gray-500 rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">Featured Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {featuredArticles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <article.icon className="w-8 h-8 text-indigo-600" />
                    {article.trending && (
                      <Badge className="bg-red-100 text-red-700">Trending</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{article.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{article.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{article.category}</span>
                      <span>•</span>
                      <span>{article.readTime}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              size="sm"
            >
              All Categories
            </Button>
            {knowledgeCategories.map((category) => {
              const colors = getColorClasses(category.color);
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                  className={selectedCategory === category.id ? '' : `hover:${colors.bg}`}
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.title}
                </Button>
              );
            })}
          </div>

          {/* Knowledge Articles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredCategories.map((category) => {
              const colors = getColorClasses(category.color);
              return (
                <Card key={category.id} className={`border-2 ${colors.border}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                        <category.icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <span>{category.title}</span>
                      <Badge variant="secondary" className="ml-auto">
                        {category.articles.length} Articles
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {category.articles.map((article, index) => (
                        <Link
                          key={index}
                          href={article.href}
                        >
                          <div className="p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 flex-1">
                                {article.title}
                              </h3>
                              <Badge className={getLevelColor(article.level)} variant="secondary">
                                {article.level}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {article.description}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>{article.readTime}</span>
                              <ChevronRight className="w-4 h-4 ml-auto" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <Card className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-2xl font-semibold mb-3">Need Help Choosing the Next Step?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                MyeCA tax experts are available to help you with personalized tax planning and filing questions
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/expert-consultation">
                  <Button size="lg">
                    Schedule Consultation
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="outline">
                    View Expert Plans
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </>
  );
}
