import { Link } from "wouter";
import { ArrowRight, CheckCircle, UserCheck, Shield, MessageSquare, FileSearch, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";

const reviewCovers = [
  { title: "Missed Deductions", desc: "80C, 80D, 80G, 80TTA — CAs flag deductions you may have overlooked during data entry." },
  { title: "Wrong ITR Form", desc: "Filing ITR-1 when you should file ITR-2 (or ITR-3) is a common error. Your CA confirms the correct form." },
  { title: "Capital Gains Reporting", desc: "STCG, LTCG, grandfathering for pre-2018 equity — CAs verify the correct computation and tax rate." },
  { title: "TDS Mismatch", desc: "If your Form 26AS and AIS show different TDS than Form 16, CAs identify the discrepancy before filing." },
  { title: "Notice Risk Flags", desc: "Certain income combinations and deduction patterns trigger scrutiny. CAs spot these before submission." },
  { title: "Compliance Checks", desc: "Advance tax, interest under 234A/B/C, and applicable rebates are verified before the return goes in." },
];

const caProcess = [
  {
    num: "01",
    title: "You file the details",
    desc: "Upload your documents and complete the guided income entry. Our system pre-fills what it can from Form 16 and AIS.",
  },
  {
    num: "02",
    title: "CA reviews your return",
    desc: "A licensed CA checks your form against source documents, verifies deductions, and flags any issues within 24 hours.",
  },
  {
    num: "03",
    title: "You approve, we file",
    desc: "You review the CA's final return, e-sign with Aadhaar OTP, and it's submitted to the Income Tax Department.",
  },
];

export default function ExpertTaxReviewPage() {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ name: "Features", href: "/" }, { name: "Expert Tax Review" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-blue-50 to-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <UserCheck className="w-4 h-4" />
            Licensed Chartered Accountant
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
            A CA Reviews Your Return <span className="text-[#315efb]">Before It's Filed</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Every ITR filed through MyeCA.in is reviewed by a licensed CA — not an algorithm. They check for errors, missed deductions, and notice risks before submission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/itr/form-selector">
              <Button size="lg" className="gap-2">
                Get CA-Reviewed Filing <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">View Pricing — from ₹499</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">How CA review works</h2>
            <p className="text-slate-500 mt-3 text-lg">You handle the inputs. The CA handles the accuracy.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {caProcess.map((step) => (
              <div key={step.num} className="p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-11 h-11 mb-5 rounded-xl bg-[#315efb] flex items-center justify-center text-white font-black text-base">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What CA reviews */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">What the CA checks</h2>
            <p className="text-slate-500 mt-3 text-lg">A structured review against source documents and tax law — not a rubber stamp.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviewCovers.map(({ title, desc }) => (
              <div key={title} className="p-5 bg-white rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <div className="font-bold text-slate-900 text-sm">{title}</div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed pl-6">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why human review */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
                Why this isn't just an algorithm
              </h2>
              <p className="text-slate-500 mb-6">
                Tax software can auto-fill fields from Form 16. It can't exercise judgment on ambiguous cases, catch an AIS discrepancy caused by a broker error, or decide whether a particular expense qualifies under a specific section.
              </p>
              <p className="text-slate-500 mb-8">
                A licensed CA can — and every return filed through MyeCA.in has one assigned to it before it's submitted.
              </p>
              <div className="space-y-3">
                {[
                  "ICAI-registered Chartered Accountants",
                  "Specialised in individual income tax",
                  "Available for queries post-filing",
                  "Handle notice responses on your behalf",
                ].map((point) => (
                  <div key={point} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    {point}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { icon: Shield, label: "No notice risk", desc: "CAs catch the patterns that commonly trigger income tax notices before submission." },
                { icon: FileSearch, label: "Document matching", desc: "Form 16, 26AS, AIS, and CAS are cross-checked against each other." },
                { icon: AlertCircle, label: "Error flagging", desc: "Any inconsistency is raised with you before the return is finalised." },
                { icon: MessageSquare, label: "Post-filing support", desc: "If ITDC sends a notice after filing, your CA helps you respond." },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-[#315efb]/8 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#315efb]" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{label}</div>
                    <div className="text-slate-500 text-sm mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#315efb] text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Star className="w-8 h-8 mx-auto mb-4 text-yellow-400 fill-yellow-400" />
          <h2 className="text-3xl font-extrabold mb-4">File with a CA reviewing your return.</h2>
          <p className="text-blue-100 mb-8">ITR-1 starts at ₹499. CA review is included in every plan — not an add-on.</p>
          <Link href="/itr/form-selector">
            <Button size="lg" className="bg-white text-[#315efb] hover:bg-blue-50 gap-2">
              Start CA-Reviewed Filing <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
