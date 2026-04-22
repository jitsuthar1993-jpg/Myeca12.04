import { Link } from "wouter";
import { ArrowRight, CheckCircle, Clock, FileText, Upload, UserCheck, Shield, Star, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";

const steps = [
  {
    num: "01",
    title: "Upload Your Documents",
    desc: "Upload Form 16, bank statements, and investment proofs. Our system reads them automatically — no manual data entry.",
    icon: Upload,
    color: "bg-blue-600",
  },
  {
    num: "02",
    title: "Auto-Filled ITR Form",
    desc: "Your ITR form is pre-populated from the uploaded documents. Review the details in a clean, guided interface.",
    icon: FileText,
    color: "bg-indigo-600",
  },
  {
    num: "03",
    title: "CA Review",
    desc: "A licensed Chartered Accountant checks your return for errors, missed deductions, and compliance issues.",
    icon: UserCheck,
    color: "bg-emerald-600",
  },
  {
    num: "04",
    title: "File & E-Verify",
    desc: "Approve the return, e-sign via Aadhaar OTP, and it's submitted directly to the Income Tax Department.",
    icon: CheckCircle,
    color: "bg-[#315efb]",
  },
];

const whyPoints = [
  "All ITR forms supported: ITR-1 through ITR-4",
  "Auto-import from Form 16 and AIS",
  "CA reviews every return — not just an algorithm",
  "Average turnaround: 24 hours",
  "E-verification included",
  "Post-filing support for notices & refund tracking",
];

export default function FastestITRFilingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ name: "Features", href: "/" }, { name: "Fastest ITR Filing" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <Clock className="w-4 h-4" />
            24-Hour Turnaround
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            File Your ITR in <span className="text-[#315efb]">4 Simple Steps</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Upload your documents, let our system pre-fill the form, get a CA review, and file — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/itr/form-selector">
              <Button size="lg" className="gap-2">
                Start Filing Now <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4-Step Process */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How It Works</h2>
            <p className="text-slate-500 mt-3 text-lg">Four steps, handled mostly by us.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="flex gap-5 p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white shadow-md ${step.color}`}>
                  <step.icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Step {step.num}</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why MyeCA */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                What's included in every filing
              </h2>
              <p className="text-slate-500 mb-8">
                Whether you have a single salary or multiple income sources, capital gains, or business income — we handle it.
              </p>
              <ul className="space-y-3">
                {whyPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#315efb] rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">CA-Reviewed Filing</div>
                  <div className="text-sm text-slate-500">Every return, no exceptions</div>
                </div>
              </div>
              <div className="space-y-4 mb-6">
                {[
                  { label: "ITR-1 (Salary)", price: "₹499" },
                  { label: "ITR-2 (Capital Gains)", price: "₹999" },
                  { label: "ITR-3 / ITR-4 (Business)", price: "₹1,499" },
                ].map((plan) => (
                  <div key={plan.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                    <span className="text-slate-700 font-medium">{plan.label}</span>
                    <span className="font-bold text-[#315efb]">{plan.price}</span>
                  </div>
                ))}
              </div>
              <Link href="/pricing">
                <Button className="w-full gap-2">
                  See Full Pricing <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#315efb] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Star className="w-8 h-8 mx-auto mb-4 text-yellow-400 fill-yellow-400" />
          <h2 className="text-3xl font-extrabold mb-4">Ready to file your ITR?</h2>
          <p className="text-blue-100 mb-8">A CA will review your return before it's submitted. Starts at ₹499.</p>
          <Link href="/itr/form-selector">
            <Button size="lg" className="bg-white text-[#315efb] hover:bg-blue-50 gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
