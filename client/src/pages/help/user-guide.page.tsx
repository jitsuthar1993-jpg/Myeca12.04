import { useState } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import SEO from '@/components/SEO';
import { 
  BookOpen,
  CheckCircle,
  ChevronRight,
  FileText,
  Calculator,
  Users,
  Shield,
  Building,
  Rocket,
  Clock,
  Star
} from 'lucide-react';

const userGuides = [
  {
    id: 'getting-started',
    title: 'Getting Started Guide',
    description: 'Everything you need to know to begin your tax filing journey',
    icon: Rocket,
    readTime: '10 min',
    sections: [
      {
        title: 'Create Your Account',
        content: [
          'Visit MyeCA.in and click "Sign Up"',
          'Enter your email and create a strong password',
          'Verify your email address',
          'Complete your profile with basic information',
          'Enable two-factor authentication for security'
        ]
      },
      {
        title: 'Understand Our Services',
        content: [
          'DIY Plan: Free self-filing with basic features',
          'CA Assisted: Expert help at \u20B91,499',
          'Business Plan: Complete business tax solutions',
          'All plans include tax calculators and support'
        ]
      },
      {
        title: 'Gather Your Documents',
        content: [
          'Form 16 from your employer',
          'Form 26AS (tax credit statement)',
          'Bank statements and interest certificates',
          'Investment proofs (80C, 80D, etc.)',
          'Property documents if applicable'
        ]
      }
    ]
  },
  {
    id: 'itr-filing-guide',
    title: 'Complete ITR Filing Guide',
    description: 'Step-by-step process to file your income tax return',
    icon: FileText,
    readTime: '15 min',
    sections: [
      {
        title: 'Choose the Right ITR Form',
        content: [
          'ITR-1: Salary/pension income up to \u20B950 lakhs',
          'ITR-2: Capital gains, foreign income',
          'ITR-3: Business/professional income',
          'ITR-4: Presumptive taxation scheme',
          'Use our form selector tool for guidance'
        ]
      },
      {
        title: 'Fill Your Return',
        content: [
          'Login to your MyeCA.in account',
          'Select assessment year and ITR form',
          'Enter personal information',
          'Add all income sources',
          'Claim eligible deductions',
          'Review tax calculation'
        ]
      },
      {
        title: 'E-Verify Your Return',
        content: [
          'Generate and download ITR-V',
          'E-verify using Aadhaar OTP',
          'Alternative: Net banking, DSC',
          'Must verify within 120 days',
          'Track acknowledgment status'
        ]
      }
    ]
  },
  {
    id: 'tax-planning',
    title: 'Tax Planning Strategies',
    description: 'Maximize your tax savings with smart planning',
    icon: Calculator,
    readTime: '12 min',
    sections: [
      {
        title: 'Section 80C Deductions',
        content: [
          'Maximum limit: \u20B91.5 lakhs',
          'PPF, ELSS, Life Insurance',
          'NSC, 5-year FD, NPS',
          'Home loan principal repayment',
          'Children tuition fees'
        ]
      },
      {
        title: 'Other Key Deductions',
        content: [
          '80D: Health insurance premiums',
          '80E: Education loan interest',
          '80G: Charitable donations',
          '24(b): Home loan interest',
          'HRA: House rent allowance'
        ]
      },
      {
        title: 'Tax Regime Comparison',
        content: [
          'Old regime: Multiple deductions allowed',
          'New regime: Lower tax rates, no deductions',
          'Break-even at ~\u20B92.5 lakh deductions',
          'Use our calculator to compare',
          'Can switch regimes yearly'
        ]
      }
    ]
  },
  {
    id: 'business-guide',
    title: 'Business Tax Guide',
    description: 'Complete guide for business owners and freelancers',
    icon: Building,
    readTime: '20 min',
    sections: [
      {
        title: 'GST Compliance',
        content: [
          'Register if turnover > \u20B940 lakhs',
          'File GSTR-1 by 11th of next month',
          'File GSTR-3B by 20th',
          'Claim input tax credit',
          'Maintain proper invoices'
        ]
      },
      {
        title: 'Business Deductions',
        content: [
          'Office rent and utilities',
          'Employee salaries and benefits',
          'Professional fees',
          'Travel and conveyance',
          'Depreciation on assets'
        ]
      },
      {
        title: 'Advance Tax',
        content: [
          'Pay if tax liability > \u20B910,000',
          '15% by June 15',
          '45% by September 15',
          '75% by December 15',
          '100% by March 15'
        ]
      }
    ]
  }
];

const quickTips = [
  {
    title: 'File Early',
    description: 'Avoid last-minute rush and server issues',
    icon: Clock
  },
  {
    title: 'Keep Records',
    description: 'Maintain documents for 7 years',
    icon: FileText
  },
  {
    title: 'Verify Bank Details',
    description: 'Ensure correct account for refunds',
    icon: Shield
  },
  {
    title: 'Update PAN-Aadhaar',
    description: 'Link before filing to avoid issues',
    icon: Users
  }
];

export default function UserGuidePage() {
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [completedSections, setCompletedSections] = useState<string[]>([]);

  const toggleSection = (sectionId: string) => {
    setCompletedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const guide = selectedGuide ? userGuides.find(g => g.id === selectedGuide) : null;
  const progressPercentage = guide 
    ? (completedSections.filter(id => id.startsWith(selectedGuide!)).length / guide.sections.length) * 100
    : 0;

  return (
    <>
      <SEO 
        title="User Guide - MyeCA.in"
        description="Comprehensive user guides for tax filing, ITR forms, tax planning, and business compliance"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-200" />
              <h1 className="text-4xl font-bold mb-4">User Guides</h1>
              <p className="text-xl text-blue-100">
                Step-by-step guides to help you navigate tax filing with confidence
              </p>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          {!selectedGuide ? (
            <>
              {/* Guide Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                {userGuides.map((guide) => (
                  <Card 
                    key={guide.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => setSelectedGuide(guide.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <guide.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{guide.title}</h3>
                          <p className="text-sm text-gray-600">{guide.description}</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {guide.readTime}
                          </span>
                          <span>{guide.sections.length} sections</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Tips */}
              <div className="mt-12 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 text-center">Quick Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickTips.map((tip, index) => (
                    <Card key={index} className="text-center">
                      <CardContent className="pt-6">
                        <tip.icon className="w-10 h-10 mx-auto mb-3 text-blue-600" />
                        <h3 className="font-semibold mb-1">{tip.title}</h3>
                        <p className="text-sm text-gray-600">{tip.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          ) : guide ? (
            <div className="max-w-4xl mx-auto">
              {/* Guide Header */}
              <div className="mb-8">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedGuide(null)}
                  className="mb-4"
                >
                  ← Back to Guides
                </Button>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <guide.icon className="w-8 h-8 text-blue-600" />
                      <div className="flex-1">
                        <h1 className="text-2xl font-bold">{guide.title}</h1>
                        <p className="text-gray-600 mt-1">{guide.description}</p>
                      </div>
                      <Badge variant="secondary">
                        <Clock className="w-4 h-4 mr-1" />
                        {guide.readTime}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}% Complete</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Guide Sections */}
              <div className="space-y-6">
                {guide.sections.map((section, index) => {
                  const sectionId = `${guide.id}-${index}`;
                  const isCompleted = completedSections.includes(sectionId);
                  
                  return (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <span className="text-gray-600 font-semibold">{index + 1}</span>
                              )}
                            </div>
                            <h3 className="text-lg font-semibold">{section.title}</h3>
                          </div>
                          <Button
                            size="sm"
                            variant={isCompleted ? "secondary" : "default"}
                            onClick={() => toggleSection(sectionId)}
                          >
                            {isCompleted ? 'Completed' : 'Mark Complete'}
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3">
                          {section.content.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-3">
                              <span className="text-blue-600 mt-0.5">•</span>
                              <span className={isCompleted ? 'text-gray-600' : ''}>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Next Steps */}
              {progressPercentage === 100 && (
                <Card className="mt-8 bg-green-50 border-green-200">
                  <CardContent className="text-center py-8">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <h3 className="text-2xl font-semibold mb-3">Guide Completed!</h3>
                    <p className="text-gray-600 mb-6">
                      Great job! You've completed all sections of this guide.
                    </p>
                    <div className="flex gap-4 justify-center">
                      <Button size="lg" onClick={() => setSelectedGuide(null)}>
                        View Other Guides
                      </Button>
                      <Link href="/itr/form-selector">
                        <Button size="lg" variant="outline">
                          Start Filing
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}