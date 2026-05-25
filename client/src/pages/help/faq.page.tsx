import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import SEO from '@/components/SEO';
import { useContentTracking } from '@/hooks/useAnalytics';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, HelpCircle, FileText, Calculator, CreditCard, Shield, Building } from 'lucide-react';

const faqCategories = {
  general: {
    title: 'General Questions',
    icon: HelpCircle,
    questions: [
      {
        question: 'What is MyeCA.in?',
        answer: 'MyeCA.in is a digital platform for tax filing, calculators, and business compliance workflows. We provide guided filing, expert-assisted review where applicable, and tax-related tools to help individuals and businesses organize filings and documents.'
      },
      {
        question: 'Is MyeCA.in safe and secure?',
        answer: 'MyeCA.in uses authenticated workflows, private document access, and secure transport controls for tax documents. Your personal and financial information should be shared only through the secure workflow, and we do not sell your data.'
      },
      {
        question: 'How much does it cost to use MyeCA.in?',
        answer: 'We offer multiple pricing plans: starter ITR intake, CA Assisted plans for expert guidance, and Business plans for comprehensive business tax solutions. All plans show scope before payment and include access to our tax calculators and support.'
      },
      {
        question: 'What documents do I need to file my ITR?',
        answer: 'Common documents include: Form 16 (from employer), Form 26AS (tax credit statement), bank statements, investment proofs (80C, 80D), home loan certificates, capital gains statements, business income/expense records, and PAN & Aadhaar cards. Our platform provides a personalized checklist based on your income sources.'
      },
      {
        question: 'Can I file returns for previous years?',
        answer: 'Yes, you can file belated returns for up to 2 years from the end of the relevant assessment year. We support filing for AY 2023-24 and AY 2024-25. Note that late filing may attract penalties and you cannot carry forward certain losses.'
      }
    ]
  },
  itrFiling: {
    title: 'ITR Filing',
    icon: FileText,
    questions: [
      {
        question: 'Which ITR form should I use?',
        answer: 'ITR form selection depends on your income sources: ITR-1 (Sahaj) for salary/pension up to ₹50 lakhs, ITR-2 for capital gains and foreign income, ITR-3 for business income, ITR-4 for presumptive taxation. Our form selector suggests a likely form based on your profile, and complex cases should be reviewed before filing.'
      },
      {
        question: 'What is the deadline for filing ITR?',
        answer: 'For individuals and HUFs (non-audit cases): July 31st. For businesses requiring audit: October 31st. For transfer pricing cases: November 30th. Late filing is allowed until December 31st with penalties. These dates may be extended by the government.'
      },
      {
        question: 'How long does it take to file ITR through MyeCA.in?',
        answer: 'Filing time depends on case complexity and document readiness. CA-assisted service includes document review, filing support, and e-verification guidance before submission.'
      },
      {
        question: 'What happens after I file my ITR?',
        answer: 'After filing: 1) E-verify within 120 days (we help with this), 2) Receive acknowledgment (ITR-V), 3) Processing by Income Tax Department (2-6 weeks), 4) Intimation u/s 143(1) sent, 5) Refund processed if applicable. We help you monitor the filing case and explain what to verify on the official portal.'
      },
      {
        question: 'Can I revise my ITR after filing?',
        answer: 'Yes, you can file a revised return if you discover any mistakes or omissions. Revised returns can be filed before December 31st of the assessment year or before assessment completion, whichever is earlier. Our platform supports easy revision with change tracking.'
      }
    ]
  },
  calculators: {
    title: 'Tax Calculators',
    icon: Calculator,
    questions: [
      {
        question: 'How accurate are your tax calculators?',
        answer: 'Our calculators are estimates for common cases and are being updated for AY 2026-27 / FY 2025-26. Results can vary for salary versus non-salary income, house property, capital gains, special-rate income, residency, and surcharge cases.'
      },
      {
        question: 'Which tax regime should I choose - Old or New?',
        answer: 'It depends on your deductions. New regime offers lower tax rates but fewer deductions. Old regime allows deductions under 80C, 80D, HRA, and other sections. Our Tax Regime Calculator estimates both regimes based on your inputs, and the final choice should consider your actual documents.'
      },
      {
        question: 'How is HRA exemption calculated?',
        answer: 'HRA exemption is minimum of: 1) Actual HRA received, 2) 50% of salary (metro) or 40% (non-metro), 3) Rent paid minus 10% of salary. Salary includes basic + DA. Our HRA calculator considers your city type and provides month-wise calculations.'
      },
      {
        question: 'What is advance tax and who needs to pay?',
        answer: 'Advance tax is paying income tax in installments during the financial year instead of lump sum after year-end. Required if tax liability exceeds ₹10,000. Due dates: 15% by June 15, 45% by Sept 15, 75% by Dec 15, 100% by March 15. Our calculator helps plan installments.'
      },
      {
        question: 'How do I calculate capital gains tax?',
        answer: 'Capital gains tax depends on asset type and holding period. Equity: STCG (< 1 year) at 20%, LTCG (> 1 year) at 12.5% above ₹1.25 lakh. Property/Gold: STCG at slab rate, LTCG at 20% with indexation. Our calculator handles all asset types with current rates.'
      }
    ]
  },
  payment: {
    title: 'Payments & Refunds',
    icon: CreditCard,
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major payment methods: Credit/Debit cards (Visa, Mastercard, Rupay), Net Banking (all major banks), UPI (Google Pay, PhonePe, Paytm), Wallets (Paytm, Amazon Pay), and EMI options on credit cards for amounts above ₹3,000.'
      },
      {
        question: 'Is there a refund policy?',
        answer: 'Refunds are available if the service has not been used within 7 days of purchase. For CA-assisted plans, refund eligibility applies before document upload. After filing initiation, refunds are case-specific. No refund applies to government fees.'
      },
      {
        question: 'When will I receive my income tax refund?',
        answer: 'Income tax refunds are typically processed within 4-8 weeks after ITR verification. Factors affecting timeline: return complexity, verification method, bank account validation. Status can be tracked on income tax website. We help expedite by ensuring accurate filing.'
      },
      {
        question: 'Do you provide invoices for your services?',
        answer: 'Yes, GST invoices are automatically generated and emailed after payment. You can also download invoices from your dashboard anytime. Invoices include our GSTIN and are valid for claiming business expenses or reimbursements from your employer.'
      },
      {
        question: 'Are there any hidden charges?',
        answer: 'Plan pages show GST treatment, inclusions, exclusions, and government fees where relevant before checkout. Additional services such as revised returns, objections, or extra consultations are scoped and priced separately.'
      }
    ]
  },
  security: {
    title: 'Security & Privacy',
    icon: Shield,
    questions: [
      {
        question: 'How is my data protected on MyeCA.in?',
        answer: 'MyeCA.in uses authenticated access, scoped user workflows, private document storage, and inactivity protection to reduce exposure of sensitive tax records. Share personal and financial information only through the secure dashboard workflow.'
      },
      {
        question: 'Who can access my tax information?',
        answer: 'Access is scoped to you and assigned professionals for the selected workflow. Use the dashboard for supported download and delete controls, and do not share sensitive tax information outside the secure workflow.'
      },
      {
        question: 'Is my Aadhaar information safe?',
        answer: 'Aadhaar details should be shared only where required for the selected tax or compliance workflow. Use the secure dashboard workflow and review the request before uploading or submitting sensitive identity details.'
      },
      {
        question: 'How long do you retain my data?',
        answer: 'Retention depends on account status, service requirements, and legal recordkeeping obligations. You can request deletion or use available dashboard controls where supported, except for records that must be retained for legal, tax, accounting, or dispute purposes.'
      },
      {
        question: 'What happens to my documents after filing?',
        answer: 'Documents remain available in your workspace subject to account, service, and legal retention requirements. Download and delete controls are available where implemented, and access is handled through authenticated workflows.'
      }
    ]
  },
  business: {
    title: 'Business Services',
    icon: Building,
    questions: [
      {
        question: 'What business services does MyeCA.in offer?',
        answer: 'Comprehensive business services including: GST registration and returns, Company incorporation (Pvt Ltd, LLP, OPC), Trademark registration, FSSAI license, Import/Export code, Labour law compliance, ISO certifications, Startup India registration, MSME/Udyam registration, and ongoing compliance management.'
      },
      {
        question: 'How long does company registration take?',
        answer: 'Company and LLP registration timelines depend on document readiness, name approval, MCA processing, and state-specific requirements. MyeCA provides scope-first support for DIN/DSC, document preparation, filing, and post-incorporation checklist items.'
      },
      {
        question: 'What is GST registration and who needs it?',
        answer: 'GST registration is mandatory if turnover or activity crosses applicable thresholds, and can also apply for inter-state supply, e-commerce sellers, and specified businesses. Registration timelines depend on document readiness and department verification.'
      },
      {
        question: 'Do you provide ongoing compliance support?',
        answer: 'Yes, annual compliance packages can cover GST returns, TDS returns, ROC filings, labour-law compliance, income-tax returns, audit support, and compliance calendars. Pricing and assigned expert support are confirmed after scope review.'
      },
      {
        question: 'How much does trademark registration cost?',
        answer: 'Trademark government fees vary by applicant type and class. MyeCA professional fees start after scope review and can include search, application filing, and objection-response support where selected. Registry timelines depend on examination, publication, objections, and opposition.'
      }
    ]
  }
};

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<keyof typeof faqCategories>('general');
  const { trackContentSearch, trackContentEngagement } = useContentTracking();

  const filteredQuestions = faqCategories[selectedCategory].questions.filter(
    (q: { question: string; answer: string }) => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <SEO 
        title="Frequently Asked Questions - MyeCA.in"
        description="Find answers to common questions about tax filing, ITR forms, calculators, payments, security, and business services at MyeCA.in"
      />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-blue-200" />
              <h1 className="type-page-title mb-4 font-bold">Frequently Asked Questions</h1>
              <p className="text-xl text-blue-100 mb-8">
                Get answers to common questions about our tax filing services
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value.length > 2) {
                      trackContentSearch({ query: e.target.value });
                    }
                  }}
                  className="pl-12 pr-4 py-4 text-lg bg-white text-gray-900 placeholder-gray-500 rounded-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto">
            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={(value) => {
              const categoryKey = value as keyof typeof faqCategories;
              setSelectedCategory(categoryKey);
              trackContentEngagement({ 
                content_type: 'faq_category',
                content_id: categoryKey,
                content_title: faqCategories[categoryKey].title
              });
            }} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-1 bg-gray-100">
                {Object.entries(faqCategories).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <TabsTrigger 
                      key={key} 
                      value={key}
                      className="flex items-center gap-2 px-3 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden sm:inline">{category.title}</span>
                      <span className="sm:hidden">{category.title.split(' ')[0]}</span>
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {/* FAQ Content for each category */}
              {Object.entries(faqCategories).map(([key, category]) => (
                <TabsContent key={key} value={key} className="mt-8">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <category.icon className="w-6 h-6 text-blue-600" />
                        {category.title}
                        <Badge variant="secondary" className="ml-auto">
                          {filteredQuestions.length} Questions
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {searchQuery && filteredQuestions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <HelpCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p className="text-lg">No questions found matching "{searchQuery}"</p>
                          <p className="text-sm mt-2">Try searching with different keywords</p>
                        </div>
                      ) : (
                        <Accordion type="multiple" className="space-y-3">
                          {filteredQuestions.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                              <AccordionTrigger className="text-left">
                                {faq.question}
                              </AccordionTrigger>
                              <AccordionContent>
                                {faq.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>

            {/* Still Need Help Section */}
            <Card className="mt-12 bg-blue-50 border-blue-200">
              <CardContent className="text-center py-8">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 text-blue-600" />
                <h3 className="text-2xl font-semibold mb-3">Still have questions?</h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Can't find the answer you're looking for? Our support team is here to help you.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg">
                    Contact Support
                  </Button>
                  <Button size="lg" variant="outline">
                    Schedule CA Consultation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
