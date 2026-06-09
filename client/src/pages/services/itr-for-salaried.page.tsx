import { useState, useEffect } from "react";
import { m } from "framer-motion";
import { Link } from "wouter";
import { RouteSeo } from "@/components/seo/RouteSeo";
import { 
  FileText, 
  Clock, 
  Shield, 
  CheckCircle, 
  Phone, 
  Briefcase,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Calendar,
  AlertCircle,
  Building2,
  Upload,
  Receipt,
  Calculator,
  Wallet,
  HelpCircle,
  PieChart,
  Scale,
  Users,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ServiceCheckoutModal } from "@/components/services/ServiceCheckoutModal";
import { SectionReferenceBadge } from "@/components/tax/SectionReferenceBadge";
import { CONTACT } from "@/config/contact";
import { apiRequest } from "@/lib/queryClient";
import {
  AY_2026_27_NEW_REGIME_SLABS,
  DEFAULT_ASSESSMENT_YEAR,
  DEFAULT_FINANCIAL_YEAR,
  REBATE_87A_BY_REGIME,
  STANDARD_DEDUCTION_BY_REGIME,
  TAX_TRANSITION_NOTE,
  formatCurrency,
  formatSlabRange,
} from "@/lib/tax-law-reference";

export default function ITRForSalariedPage() {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutPrice, setCheckoutPrice] = useState(799);
  const [checkoutTitle, setCheckoutTitle] = useState("ITR Filing for Salaried");

  const [form16, setForm16] = useState({
    basic: "",
    hra: "",
    special: "",
    lta: "",
    sec80c: "",
    sec80d: ""
  });

  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (leadForm.name && leadForm.email && leadForm.phone) {
      setLeadSubmitting(true);
      setLeadError(null);
      try {
        await apiRequest("/api/consultation-requests", {
          method: "POST",
          body: JSON.stringify({
            name: leadForm.name,
            email: leadForm.email,
            phone: leadForm.phone,
            service: "ITR Filing for Salaried",
            preferredTime: "Call now",
            source: "itr_salaried_free_draft",
            formId: "itr-salaried-free-draft-form",
            serviceIntent: "itr-salaried",
            message: "Requested a free preliminary tax draft from the ITR for salaried service page.",
          }),
        });
        setLeadSubmitted(true);
      } catch (error) {
        setLeadError(error instanceof Error ? error.message : "Could not submit your request. Please try again.");
      } finally {
        setLeadSubmitting(false);
      }
    }
  };

  const [arrowPosition, setArrowPosition] = useState(-5);
  const [highlightedStep, setHighlightedStep] = useState(-1);

  useEffect(() => {
    const runSequence = async () => {
      // Positions pulled back significantly to ensure the arrow tip stops before the box edge
      const positions = [-19, 14, 47, 80];
      
      for (let i = 0; i < 4; i++) {
        // Move arrow to "behind" the box
        setArrowPosition(positions[i]);
        // Wait for arrow to arrive (0.8s transition)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Continuous highlight once arrow is in position
        setHighlightedStep(i);
        // Pause to show the highlight before moving to next
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    };
    runSequence();
  }, []);
  
  const grossSalary = (Number(form16.basic) || 0) + (Number(form16.hra) || 0) + (Number(form16.special) || 0) + (Number(form16.lta) || 0);
  const totalDeductions = STANDARD_DEDUCTION_BY_REGIME.old + (Number(form16.sec80c) || 0) + (Number(form16.sec80d) || 0);
  const taxableIncome = Math.max(0, grossSalary - totalDeductions);

  const taxSlabsNew = [
    { income: "Up to ₹3,00,000", rate: "Nil", tax: "₹0" },
    { income: "₹3,00,001 to ₹6,00,000", rate: "5%", tax: "5% on income > ₹3L" },
    { income: "₹6,00,001 to ₹9,00,000", rate: "10%", tax: "₹15,000 + 10% on > ₹6L" },
    { income: "₹9,00,001 to ₹12,00,000", rate: "15%", tax: "₹45,000 + 15% on > ₹9L" },
    { income: "₹12,00,001 to ₹15,00,000", rate: "20%", tax: "₹90,000 + 20% on > ₹12L" },
    { income: "Above ₹15,00,000", rate: "30%", tax: "₹1,50,000 + 30% on > ₹15L" }
  ];

  const taxSlabsOld = [
    { income: "Up to ₹2,50,000", rate: "Nil", tax: "₹0" },
    { income: "₹2,50,001 to ₹5,00,000", rate: "5%", tax: "5% on income > ₹2.5L" },
    { income: "₹5,00,001 to ₹10,00,000", rate: "20%", tax: "₹12,500 + 20% on > ₹5L" },
    { income: "Above ₹10,00,000", rate: "30%", tax: "₹1,12,500 + 30% on > ₹10L" }
  ];

  const ay2026NewTaxSlabs = AY_2026_27_NEW_REGIME_SLABS.map((slab) => ({
    income: formatSlabRange(slab),
    rate: slab.rate === 0 ? "Nil" : `${slab.rate * 100}%`,
    tax: slab.rate === 0 ? "₹0" : `${slab.rate * 100}% on this slab`
  }));

  const deductions = [
    {
      section: "Sec 80C",
      sectionKey: "80C",
      limit: "₹1,50,000",
      description: "EPF, PPF, ELSS Mutual Funds, LIC Premiums, Home Loan Principal, Tuition Fees."
    },
    {
      section: "Sec 80D",
      sectionKey: "80D",
      limit: "₹25,000 to ₹1,00,000",
      description: "Medical Insurance Premium for self, family, and dependent parents."
    },
    {
      section: "Sec 80CCD(1B)",
      sectionKey: "80CCD(2)",
      limit: "₹50,000",
      description: "Additional deduction for National Pension System (NPS) contributions."
    },
    {
      section: "Sec 24(b)",
      sectionKey: "24(b)",
      limit: "Up to ₹2,00,000",
      description: "Interest paid on Home Loan for a self-occupied property."
    },
    {
      section: "Standard Deduction",
      sectionKey: "16",
      limit: "₹50,000",
      description: "Flat deduction available to all salaried employees across both tax regimes."
    }
  ];

  const faqs = [
    {
      q: "Which ITR form should I file as a salaried employee?",
      a: "If your income is purely from salary, one house property, and other sources (interest) up to ₹50 Lakhs, you should file ITR-1. If you have capital gains from shares/mutual funds or multiple house properties, you must file ITR-2."
    },
    {
      q: "Can I file my ITR if I have worked in multiple companies during the year?",
      a: "Yes. You just need to aggregate the income from all your Form 16s (from previous and current employers). Make sure that deductions (like Standard Deduction and 80C) are not claimed multiple times."
    },
    {
      q: "Is it mandatory to file ITR if my income is below the taxable limit?",
      a: "If your gross total income exceeds the basic exemption limit (₹2.5L in old regime, ₹3L in new regime) before claiming deductions like 80C, it is mandatory to file. Also, if you want to claim a refund of TDS deducted, filing ITR is mandatory."
    },
    {
      q: "Which tax regime is better for me?",
      a: "The result depends on income, eligible deductions, exemptions, special-rate income, and the applicable year. Compare both regimes using the same facts, then review the calculation and evidence before selecting the filing position."
    },
    {
      q: "What if there is a mismatch between my Form 16 and Form 26AS/AIS?",
      a: "You should ideally ask your employer to correct the TDS return. If the deadline has passed, you must file your return based on the actual income and claim the TDS reflecting in 26AS to avoid a tax demand notice."
    },
    {
      q: "What if I missed the July 31st deadline?",
      a: "You can still file a 'Belated Return' until December 31st of the assessment year. However, a late filing fee up to ₹5,000 may apply, and you might lose the ability to carry forward certain losses."
    },
    {
      q: "Can I claim deductions if I don't have a Form 16?",
      a: "Yes. Use monthly payslips and bank credits to reconstruct salary when Form 16 is unavailable, then compare employer-reported TDS with Form 26AS before claiming the credit."
    },
    {
      q: "How long does it take to get my tax refund?",
      a: "The processing time usually ranges from 15 to 45 days after e-verification of your return. You can track the status on the e-filing portal using your PAN and the assessment year."
    },
    {
      q: "Is it safe to share my documents with MyeCA?",
      a: "We use secure transport, access controls, and privacy workflows to protect your documents. Filing documents are accessed only by the assigned tax expert or authorized support team for the service."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50">
      <RouteSeo path="/services/itr-for-salaried" />
      {/* Hero Section */}
      <section className="bg-white border-b soft-border py-10 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center soft-shadow">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="type-page-title font-bold text-gray-900">
                  Income Tax Filing for <span className="text-blue-600">Salaried Employees</span>
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl leading-relaxed mb-8">
                Prepare a salaried return from reconciled records. Review deductions, compare Form 16 with AIS and Form 26AS, and confirm the filing scope before submission.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  File ITR Now
                </Button>
                <Link href="/expert-consultation?service=itr-salaried">
                  <Button size="lg" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 px-8">
                    <Phone className="w-5 h-5 mr-2" />
                    Talk to an Expert
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm font-medium text-gray-600">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500"/> Review-Based Filing</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500"/> Data Privacy</span>
                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500"/> Notice Support</span>
              </div>
            </div>
            
            <Card className="soft-shadow border-blue-100 bg-gradient-to-b from-blue-50/80 to-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <AlertCircle className="w-5 h-5" />
                  Important Highlights (AY {DEFAULT_ASSESSMENT_YEAR})
                </CardTitle>
                <CardDescription>Stay informed about your tax compliance</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start bg-white p-3 rounded-lg border border-blue-100">
                    <Clock className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Due date for filing ITR for FY {DEFAULT_FINANCIAL_YEAR} without penalty is <strong>31st July 2026</strong>.</span>
                  </li>
                  <li className="flex items-start bg-white p-3 rounded-lg border border-blue-100">
                    <Scale className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700"><strong>New Tax Regime</strong> is the default regime under <strong>Section 115BAC</strong><SectionReferenceBadge section="115BAC" />. The standard deduction under New Regime is <strong>₹75,000</strong>.</span>
                  </li>
                  <li className="flex items-start bg-white p-3 rounded-lg border border-blue-100">
                    <TrendingUp className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700"><strong>Rebate under Section 87A</strong><SectionReferenceBadge section="87A" /> is up to {formatCurrency(REBATE_87A_BY_REGIME.new.maxRebate)} where taxable income does not exceed ₹12,00,000 under the New Tax Regime.</span>
                  </li>
                  <li className="flex items-start bg-white p-3 rounded-lg border border-blue-100">
                    <FileText className="w-5 h-5 mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{TAX_TRANSITION_NOTE}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        
        {/* Core Services Section */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Salaried ITR Filing Scope
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our service covers common salaried return complexities, with document-based review where deductions, house property, or capital gains need closer checks.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Form 16 & Form 16A Parsing", icon: FileText, desc: "Use TDS certificate details as a starting point and review the extracted data before filing." },
              { title: "Multiple Employers", icon: Users, desc: "Reconcile salary, deductions, and TDS across every employer before selecting the return treatment." },
              { title: "Capital Gains Sync", icon: PieChart, desc: "Include your stock market and mutual fund gains directly using broker statements." },
              { title: "HRA & Rent Optimization", icon: Building2, desc: "Forgot to declare rent to employer? Claim HRA directly in your ITR." },
              { title: "Regime Optimization", icon: Scale, desc: "We calculate your tax liability under both regimes and pick the one with lower tax." },
              { title: "Notice Assistance", icon: Shield, desc: "Review the intimation or notice, response deadline, and records needed for the appropriate reply." }
            ].map((feature, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Tax Regimes Comparison */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Understanding Tax Regimes (FY {DEFAULT_FINANCIAL_YEAR})
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Compare the tax slabs to understand how your income is taxed.
            </p>
          </div>

          <Tabs defaultValue="new" className="max-w-4xl mx-auto">
            <TabsList className="grid h-auto w-full grid-cols-2 mb-8">
              <TabsTrigger value="new" className="min-h-12 whitespace-normal px-2 py-3 text-sm leading-tight sm:text-base">
                <span className="sm:hidden">New Regime</span>
                <span className="hidden sm:inline">New Tax Regime (Default)</span>
              </TabsTrigger>
              <TabsTrigger value="old" className="min-h-12 whitespace-normal px-2 py-3 text-sm leading-tight sm:text-base">
                <span className="sm:hidden">Old Regime</span>
                <span className="hidden sm:inline">Old Tax Regime</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="new">
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700">New Tax Regime Highlights</CardTitle>
                  <CardDescription>Default regime under Section 115BAC. Standard deduction of ₹75,000 is allowed. Most old-regime deductions such as 80C, 80D, and HRA are not available. Rebate under Section 87A can make tax zero up to ₹12 lakh taxable income.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-blue-50 text-blue-900">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Income Slab</th>
                          <th className="px-4 py-3">Tax Rate</th>
                          <th className="px-4 py-3 rounded-tr-lg">Computation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {ay2026NewTaxSlabs.map((slab, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">{slab.income}</td>
                            <td className="px-4 py-3">{slab.rate}</td>
                            <td className="px-4 py-3 text-gray-600">{slab.tax}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="old">
              <Card>
                <CardHeader>
                  <CardTitle className="text-indigo-700">Old Tax Regime Highlights</CardTitle>
                  <CardDescription>Allows various exemptions (HRA, LTA) and deductions (80C, 80D, Home Loan Interest). Zero tax for income up to ₹5 Lakhs (after deductions).</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-indigo-50 text-indigo-900">
                        <tr>
                          <th className="px-4 py-3 rounded-tl-lg">Income Slab</th>
                          <th className="px-4 py-3">Tax Rate</th>
                          <th className="px-4 py-3 rounded-tr-lg">Computation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {taxSlabsOld.map((slab, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium">{slab.income}</td>
                            <td className="px-4 py-3">{slab.rate}</td>
                            <td className="px-4 py-3 text-gray-600">{slab.tax}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        {/* Important Deductions */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">
              Deductions to Verify Before Filing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Common deduction categories to verify against your records and old-regime eligibility.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {deductions.map((deduction, i) => (
              <Card key={i} className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <Badge className="w-fit bg-green-100 text-green-800 hover:bg-green-100 mb-2">Limit: {deduction.limit}</Badge>
                  <CardTitle className="text-lg">{deduction.section}<SectionReferenceBadge section={deduction.sectionKey} /></CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{deduction.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Redesigned Process Steps */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">How We File Your ITR</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">A four-step process that keeps document checks, open questions, and filing decisions visible.</p>
          </div>

          <div className="relative max-w-5xl mx-auto px-4">
            {/* Animated moving large arrow line for desktop */}
            <div className="hidden md:block absolute top-[40px] left-[12.5%] w-[75%] h-0.5 bg-slate-100 z-0 overflow-visible">
              <m.div 
                className="absolute top-1/2 -translate-y-1/2"
                animate={{ 
                  left: `${arrowPosition}%` 
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: "easeInOut" 
                }}
              >
                <div className="flex items-center">
                  <div className="w-20 h-1 bg-gradient-to-r from-transparent via-blue-400 to-blue-600 rounded-full blur-[1px]" />
                  <ChevronRight className="w-8 h-8 text-blue-600 -ml-3 stroke-[3px]" />
                </div>
              </m.div>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8 relative z-10">
              {[
                { no: "01", title: "Share Documents", desc: "Upload Form 16, bank statements & investment proofs securely.", icon: Upload, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
                { no: "02", title: "Expert Review", desc: "An assigned tax expert reviews your file to identify eligible deductions and issues to check.", icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
                { no: "03", title: "Review Draft", desc: "We prepare the computation and share it with you for approval.", icon: FileText, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
                { no: "04", title: "E-Filing", desc: "We e-file the return and share the ITR-V acknowledgment with you.", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" }
              ].map((step, i) => (
                <m.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.2 }}
                  animate={{ 
                    scale: highlightedStep === i ? 1.05 : 1,
                  }}
                  className="flex flex-col items-center text-center group z-10"
                >
                  <m.div 
                    animate={{ 
                      borderColor: highlightedStep === i ? "#2563eb" : "#e2e8f0",
                      backgroundColor: highlightedStep === i ? "#f8faff" : "#ffffff",
                      boxShadow: highlightedStep === i ? "0 10px 25px -5px rgba(37, 99, 235, 0.2)" : "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                    }}
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 mb-6 relative transition-all duration-500`}
                  >
                    <div className={`absolute -top-3 -right-3 w-8 h-8 rounded-full font-bold flex items-center justify-center text-sm shadow-md z-20 transition-colors ${highlightedStep === i ? "bg-blue-600 text-white" : "bg-blue-700 text-white"}`}>
                      {step.no}
                    </div>
                    <step.icon className={`w-8 h-8 transition-transform ${highlightedStep === i ? "text-blue-600 scale-110" : step.color}`} />
                  </m.div>
                  <h3 className={`text-xl font-semibold mb-3 transition-colors ${highlightedStep === i ? "text-blue-600" : "text-gray-900"}`}>{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed px-2">{step.desc}</p>
                </m.div>
              ))}
            </div>
            
            <div className="mt-16 text-center relative z-10">
              <Button 
                size="lg" 
                className="bg-blue-700 hover:bg-blue-800 text-white rounded-full px-8 py-6 text-lg shadow-xl shadow-slate-200 transition-transform hover:scale-105"
                onClick={() => setIsCheckoutOpen(true)}
              >
                Start Filing Now <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Form 16 Calculator */}
        <section className="scroll-mt-24" id="calculator">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">Quick Form 16 Calculator</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Estimate your taxable salary by entering the key components from your Form 16 (Part B).
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="border border-blue-100 shadow-xl shadow-blue-900/5 bg-white overflow-hidden rounded-3xl">
              <div className="grid md:grid-cols-5 h-full">
                <div className="md:col-span-3 p-8 lg:p-10">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-600" />
                    Enter Salary Components
                  </h3>
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basic">Basic Salary (Yearly)</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                          <Input 
                            id="basic" 
                            type="number" 
                            placeholder="0" 
                            className="pl-8"
                            value={form16.basic}
                            onChange={(e) => setForm16({...form16, basic: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hra">HRA Received</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                          <Input 
                            id="hra" 
                            type="number" 
                            placeholder="0" 
                            className="pl-8"
                            value={form16.hra}
                            onChange={(e) => setForm16({...form16, hra: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="special">Special Allowances</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                          <Input 
                            id="special" 
                            type="number" 
                            placeholder="0" 
                            className="pl-8"
                            value={form16.special}
                            onChange={(e) => setForm16({...form16, special: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lta">LTA / Other Allowances</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                          <Input 
                            id="lta" 
                            type="number" 
                            placeholder="0" 
                            className="pl-8"
                            value={form16.lta}
                            onChange={(e) => setForm16({...form16, lta: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-4">Major Deductions (Old Regime)</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sec80c">80C Investments</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <Input 
                              id="sec80c" 
                              type="number" 
                              placeholder="Max 1.5L" 
                              className="pl-8"
                              value={form16.sec80c}
                              onChange={(e) => setForm16({...form16, sec80c: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sec80d">80D (Health Insurance)</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                            <Input 
                              id="sec80d" 
                              type="number" 
                              placeholder="0" 
                              className="pl-8"
                              value={form16.sec80d}
                              onChange={(e) => setForm16({...form16, sec80d: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-8 lg:p-10 text-slate-900 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/60 rounded-full blur-2xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-100/60 rounded-full blur-2xl" />
                  
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold mb-8 text-slate-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-blue-600" />
                      Computation
                    </h3>
                    
                    <div className="space-y-6 flex-1">
                      <div>
                        <p className="text-slate-500 text-sm mb-1">Gross Salary</p>
                        <p className="text-2xl font-semibold text-slate-900">₹{grossSalary.toLocaleString('en-IN')}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Standard Deduction</span>
                          <span className="text-red-600">- ₹50,000</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-500">Other Deductions</span>
                          <span className="text-red-600">- ₹{(totalDeductions - STANDARD_DEDUCTION_BY_REGIME.old).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-blue-100">
                        <p className="text-slate-600 font-medium mb-1">Estimated Taxable Income</p>
                        <p className="text-4xl font-bold text-green-700">₹{taxableIncome.toLocaleString('en-IN')}</p>
                        <p className="text-xs text-slate-500 mt-2">*Calculation based on Old Tax Regime for AY {DEFAULT_ASSESSMENT_YEAR} estimation.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Related Calculators */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-semibold text-gray-900 mb-4">Financial Calculators</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Plan your taxes and investments better with our free, easy-to-use calculators.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Income Tax", desc: "Calculate your tax liability under new & old regimes.", icon: Wallet, link: "/calculators/income-tax", color: "text-blue-600", bg: "bg-blue-50" },
              { title: "HRA Calculator", desc: "Find out your exact House Rent Allowance exemption.", icon: Building2, link: "/calculators/hra", color: "text-indigo-600", bg: "bg-indigo-50" },
              { title: "TDS Calculator", desc: "Determine TDS on salary, professional fees & rent.", icon: Receipt, link: "/calculators/tds", color: "text-emerald-600", bg: "bg-emerald-50" },
              { title: "Regime Comparator", desc: "Compare old vs new tax regimes using your eligible deductions.", icon: Scale, link: "/calculators/tax-regime", color: "text-purple-600", bg: "bg-purple-50" }
            ].map((calc, i) => (
              <Link key={i} href={calc.link}>
                <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer border-gray-100 group">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${calc.bg} ${calc.color} group-hover:scale-110 transition-transform`}>
                      <calc.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{calc.title}</h3>
                    <p className="text-sm text-gray-600">{calc.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/calculators">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                View All Calculators <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Client Lead Funnel */}
        <section className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 rounded-3xl p-8 lg:p-12 relative overflow-hidden border border-blue-100 shadow-lg shadow-blue-900/5 max-w-5xl mx-auto">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/70 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/60 rounded-full blur-3xl" />
          
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-slate-900">Get a Free Tax Draft</h2>
              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                Not sure about your eligible deductions? Share your details and our tax experts can review the inputs for a preliminary estimate before you choose a paid filing scope.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600" /> Eligible Deduction Review
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600" /> Authenticated Document Handling
                </li>
                <li className="flex items-center gap-3 text-slate-700">
                  <CheckCircle className="w-5 h-5 text-green-600" /> Free Preliminary Draft
                </li>
              </ul>
            </div>
            
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
              <CardContent className="p-8">
                {leadSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Request Received!</h3>
                    <p className="text-gray-600">
                      Thank you, {leadForm.name}. One of our tax experts will call you shortly on {leadForm.phone}.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">Request a Preliminary Review</h3>
                    {leadError && (
                      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {leadError}
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="lead-name">Full Name</Label>
                      <Input 
                        id="lead-name" 
                        placeholder="e.g. John Doe" 
                        required
                        value={leadForm.name}
                        onChange={(e) => setLeadForm({...leadForm, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-email">Email Address</Label>
                      <Input 
                        id="lead-email" 
                        type="email" 
                        placeholder="john@example.com" 
                        required
                        value={leadForm.email}
                        onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead-phone">Phone Number</Label>
                      <Input 
                        id="lead-phone" 
                        type="tel" 
                        placeholder={CONTACT.phonePlaceholder}
                        required
                        value={leadForm.phone}
                        onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                      />
                    </div>
                    <Button type="submit" disabled={leadSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg mt-2 shadow-lg shadow-blue-200">
                      {leadSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sending Request...
                        </>
                      ) : (
                        "Get Free Tax Draft"
                      )}
                    </Button>
                    <p className="text-xs text-center text-gray-500 mt-4">
                      By submitting this form, you agree to our terms and privacy policy.
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* FAQs */}
        <section className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3">
              <div className="sticky top-24">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4 px-4 py-1 text-sm rounded-full">Support Center</Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  Have any <span className="text-blue-600">questions?</span>
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Everything you need to know about salary tax filing and optimization. Can't find what you're looking for? 
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Expert Support</p>
                      <p className="text-base font-semibold text-gray-900">Request a callback</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Quick Chat</p>
                      <p className="text-base font-semibold text-gray-900">Expert WhatsApp</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3">
              <Accordion type="single" collapsible className="space-y-4 w-full">
                {faqs.map((faq, i) => (
                  <AccordionItem 
                    key={i} 
                    value={`item-${i}`} 
                    className="border-none bg-white rounded-2xl px-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-50 overflow-hidden"
                  >
                    <AccordionTrigger className="text-left font-semibold text-gray-900 hover:text-blue-600 py-6 hover:no-underline text-lg group">
                      <span className="flex items-center gap-4">
                        <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs text-slate-400 font-bold group-data-[state=open]:bg-blue-600 group-data-[state=open]:text-white transition-colors">
                          {i + 1}
                        </span>
                        {faq.q}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 pb-6 leading-relaxed pl-12 pr-4 text-base border-t border-gray-50 pt-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

      </div>

      <ServiceCheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        serviceId="itr-for-salaried"
        serviceTitle={checkoutTitle}
        category="individual"
        priceAmount={checkoutPrice}
      />
    </div>
  );
}
