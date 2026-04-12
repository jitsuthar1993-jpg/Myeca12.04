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
        answer: 'MyeCA.in is India\'s premier digital platform for professional tax filing services. We provide expert Chartered Accountant assistance, smart calculators, and comprehensive tax-related tools to help individuals and businesses file their taxes efficiently and maximize their refunds.'
      },
      {
        question: 'Is MyeCA.in safe and secure?',
        answer: 'Yes, MyeCA.in is completely safe and secure. We use bank-level 256-bit SSL encryption, are ISO 27001 certified, and follow strict data protection protocols. Your personal and financial information is encrypted and stored securely. We never share your data with third parties without your consent.'
      },
      {
        question: 'How much does it cost to use MyeCA.in?',
        answer: 'We offer multiple pricing plans: FREE DIY plan for self-filers with basic features, CA Assisted plan at ₹1,499 (including taxes) for expert guidance, and Business plan at ₹2,999 for comprehensive business tax solutions. All plans include access to our tax calculators and basic support.'
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
        answer: 'ITR form selection depends on your income sources: ITR-1 (Sahaj) for salary/pension up to ₹50 lakhs, ITR-2 for capital gains and foreign income, ITR-3 for business income, ITR-4 for presumptive taxation. Our form selector tool automatically recommends the right form based on your profile.'
      },
      {
        question: 'What is the deadline for filing ITR?',
        answer: 'For individuals and HUFs (non-audit cases): July 31st. For businesses requiring audit: October 31st. For transfer pricing cases: November 30th. Late filing is allowed until December 31st with penalties. These dates may be extended by the government.'
      },
      {
        question: 'How long does it take to file ITR through MyeCA.in?',
        answer: 'With all documents ready, filing takes 15-30 minutes for simple returns and 30-60 minutes for complex cases. Our CA-assisted service includes document review, filing, and e-verification, typically completed within 24-48 hours of document submission.'
      },
      {
        question: 'What happens after I file my ITR?',
        answer: 'After filing: 1) E-verify within 120 days (we help with this), 2) Receive acknowledgment (ITR-V), 3) Processing by Income Tax Department (2-6 weeks), 4) Intimation u/s 143(1) sent, 5) Refund processed if applicable. We track your return status throughout.'
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
        answer: 'Our calculators are 99.8% accurate and updated with the latest tax laws for FY 2024-25. They incorporate current tax slabs, deductions, exemptions, and cess rates. All calculations are verified by our CA team and tested against official tax computation.'
      },
      {
        question: 'Which tax regime should I choose - Old or New?',
        answer: 'It depends on your deductions. New regime offers lower tax rates but no deductions except NPS. Old regime allows deductions under 80C, 80D, HRA, etc. Our Tax Regime Calculator compares both and shows exact savings. Generally, if your deductions exceed ₹2.5 lakhs, old regime is beneficial.'
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
        answer: '100% refund if service not used within 7 days of purchase. For CA-assisted plans, refund available before document upload. After filing initiation, refunds are case-specific. Technical issues from our end guarantee full refund. No refund on government fees.'
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
        answer: 'No hidden charges. Prices shown include GST and all service fees. Government fees (if any) are clearly mentioned separately. Additional services like revised returns or extra consultations are priced transparently. One-time payment covers complete filing process.'
      }
    ]
  },
  security: {
    title: 'Security & Privacy',
    icon: Shield,
    questions: [
      {
        question: 'How is my data protected on MyeCA.in?',
        answer: 'We use multiple layers of security: 256-bit SSL encryption for data transmission, encrypted storage with AWS, two-factor authentication option, regular security audits, PCI DSS compliance for payments, and automatic logout on inactivity. Data is stored in secure Indian servers.'
      },
      {
        question: 'Who can access my tax information?',
        answer: 'Only you and assigned CA professionals (for assisted plans) can access your data. Our staff signs strict NDAs. We use role-based access control. No third-party access without explicit consent. You can download and delete your data anytime from the dashboard.'
      },
      {
        question: 'Is my Aadhaar information safe?',
        answer: 'Yes, Aadhaar data is masked and encrypted. We only store last 4 digits for verification. Full Aadhaar is never stored. We\'re compliant with UIDAI guidelines and use secure APIs for e-verification. Aadhaar is used only for ITR e-filing as mandated by law.'
      },
      {
        question: 'How long do you retain my data?',
        answer: 'Active user data retained for 7 years as per tax law requirements. Inactive accounts anonymized after 3 years. Payment information retained as per RBI guidelines. You can request data deletion anytime, except for legally required records. Automatic cleanup of temporary files.'
      },
      {
        question: 'What happens to my documents after filing?',
        answer: 'Documents are encrypted and archived after successful filing. Available for download for 7 years. Used only for your tax purposes and never shared. You can delete documents manually. We maintain audit trail of all document access for security.'
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
        answer: 'Private Limited: 7-10 days, LLP: 7-8 days, OPC: 7-10 days, Partnership: 3-5 days. Timeline includes name approval, document preparation, and ROC filing. Our experts handle entire process including DIN, DSC, and post-incorporation compliances.'
      },
      {
        question: 'What is GST registration and who needs it?',
        answer: 'GST registration is mandatory if annual turnover exceeds ₹40 lakhs (₹20 lakhs for special states) or ₹20 lakhs for services (₹10 lakhs special states). Also required for inter-state supply, e-commerce sellers, and certain specified businesses. We handle complete registration in 3-7 days.'
      },
      {
        question: 'Do you provide ongoing compliance support?',
        answer: 'Yes, we offer annual compliance packages covering: Monthly GST returns, TDS returns, Annual ROC filings, Labour law compliance, Income tax returns, Audit support, and compliance calendar with reminders. Packages start from ₹9,999/year with dedicated CA support.'
      },
      {
        question: 'How much does trademark registration cost?',
        answer: 'Government fees: ₹4,500 (online) per class for startups/individuals, ₹9,000 for others. Our professional fees: ₹5,999 including trademark search, application filing, and response to objections. Total process takes 8-12 months with regular status updates.'
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
              <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
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
