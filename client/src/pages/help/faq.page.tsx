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
        answer: 'We offer starter ITR intake, CA Assisted plans with document-based review, and Business plans covering defined tax and compliance tasks. Each plan shows its scope before payment and includes access to relevant calculators and support.'
      },
      {
        question: 'What documents do I need to file my ITR?',
        answer: 'Common documents include Form 16, Form 26AS, bank statements, deduction proofs, home-loan certificates, capital-gains statements, business records, PAN, and Aadhaar. The platform builds a preparation checklist from the income sources and filing facts you select.'
      },
      {
        question: 'Can I file returns for previous years?',
        answer: 'The available route depends on the assessment year, the original filing position, and the applicable belated, revised, or updated-return rules. Check the assessment-year option and deadline shown on the Income Tax e-Filing portal before preparing the return; late filing can involve additional tax, fees, or restrictions.'
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
        answer: 'The due date depends on the assessment year, taxpayer type, audit requirement, and any official extension. Confirm the deadline shown for your filing category on the Income Tax e-Filing portal before relying on a calendar date.'
      },
      {
        question: 'How long does it take to file ITR through MyeCA.in?',
        answer: 'Filing time depends on case complexity and document readiness. CA-assisted service includes document review, filing support, and e-verification guidance before submission.'
      },
      {
        question: 'What happens after I file my ITR?',
        answer: 'Complete e-verification within the applicable time limit, currently 30 days from filing for returns filed on or after 1 August 2022. Save the acknowledgment, monitor the e-Filing portal for an intimation or action item, and validate the nominated bank account if a refund is expected. Department processing time varies by return and cannot be promised in advance.'
      },
      {
        question: 'Can I revise my ITR after filing?',
        answer: 'A revised return may be available when an eligible original or belated return contains an omission or error. The deadline and any additional fee depend on the assessment year and applicable law, so first confirm the revision option on the Income Tax e-Filing portal and reconcile the changed figures against the original acknowledgment.'
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
        answer: 'Capital-gains treatment depends on the asset, acquisition and transfer dates, holding period, residency, cost evidence, exemptions, and special-rate rules. Recent law changes also affect long-term gains and indexation for some assets. Use the calculator as an estimate, then verify the result against the applicable assessment-year rules and transaction records before filing.'
      }
    ]
  },
  payment: {
    title: 'Payments & Refunds',
    icon: CreditCard,
    questions: [
      {
        question: 'What payment methods do you accept?',
        answer: 'The checkout page shows the payment methods currently available for the selected service and amount. Availability can differ by payment provider, card issuer, and transaction value.'
      },
      {
        question: 'Is there a refund policy?',
        answer: 'Refund eligibility depends on the purchased service, work already started, and third-party or government fees. Review the published refund policy and the scope shown at checkout before payment, then contact support with the order details if you need a case-specific review.'
      },
      {
        question: 'When will I receive my income tax refund?',
        answer: 'The Income Tax Department controls refund processing time. After e-verification, monitor the return status and any action item on the official e-Filing portal, and confirm that the nominated bank account is validated. A mismatch, notice, adjustment, or bank-validation issue can delay payment.'
      },
      {
        question: 'Do you provide invoices for your services?',
        answer: 'The payment receipt or invoice available for a completed purchase will show the billed service, amount, and applicable tax details. Whether an expense is deductible or reimbursable depends on your records and the relevant tax or employer policy.'
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
        answer: 'Business services include GST registration and returns, company incorporation, trademark registration, FSSAI licensing, import/export code support, labour-law compliance, ISO readiness, Startup India recognition, MSME/Udyam registration, and recurring compliance work.'
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

      <div className="min-h-screen bg-slate-50">
        {/* Hero Section */}
        <section className="border-b border-slate-200 bg-white py-12 text-slate-950 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-blue-600" />
              <h1 className="type-page-title mb-4 font-bold">Frequently Asked Questions</h1>
              <p className="text-xl text-slate-600 mb-8">
                Get answers to common questions about our tax filing services
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
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
                  className="pl-12 pr-4 py-4 text-lg bg-white text-slate-900 placeholder-gray-500 rounded-lg border-slate-200 shadow-sm"
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
              <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-1 bg-slate-100">
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
                        <div className="text-center py-8 text-slate-500">
                          <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
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
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
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
