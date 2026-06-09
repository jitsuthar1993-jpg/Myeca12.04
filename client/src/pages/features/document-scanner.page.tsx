import { Link } from "wouter";
import { ArrowRight, CheckCircle, ScanLine, FileText, Zap, Lock, ChevronRight, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";

const supportedDocs = [
  { name: "Form 16 / 16A", desc: "Employer-issued TDS certificate — supported fields can be extracted for review." },
  { name: "AIS / TIS", desc: "Annual Information Statement from the Income Tax portal organized for review." },
  { name: "Bank Statements", desc: "Interest income and tax-relevant transactions can be highlighted for review." },
  { name: "Mutual Fund CAS", desc: "CAMS / KFintech statements can support capital gains organization." },
  { name: "Property Documents", desc: "Sale deed and registry data for capital gains on immovable property." },
  { name: "Investment Proofs", desc: "LIC, ELSS, PPF, NPS receipts mapped to the correct 80C/80D sections." },
];

const howItWorks = [
  {
    num: "01",
    title: "Upload Once",
    desc: "Drop your PDFs or images — Form 16, bank statements, investment proofs. Supported formats: PDF, JPG, PNG.",
  },
  {
    num: "02",
    title: "Assisted Extraction",
    desc: "The workflow can read supported documents and suggest income figures, TDS amounts, deductions, and interest for review.",
  },
  {
    num: "03",
    title: "Pre-filled ITR Form",
    desc: "Extracted data is organized against ITR schedule fields. You review, confirm, and choose CA assistance where eligible.",
  },
];

const trustPoints = [
  "Authenticated access for uploaded documents",
  "Private document workflow tied to your account and filing case",
  "Secure transport for document uploads",
  "Download and delete controls where available in the workspace",
];

export default function DocumentScannerPage() {
  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ name: "Features", href: "/" }, { name: "Smart Document Scanner" }]} />

      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-emerald-50 to-white border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
            <ScanLine className="w-4 h-4" />
            Assisted document extraction
          </div>
          <h1 className="type-hero-title mb-6 font-extrabold text-slate-900">
            Upload Your Documents. <span className="text-[#315efb]">We Read Them.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            Form 16, AIS, bank statements, CAS — supported extraction helps organize details before you review and confirm them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/which-itr-form-to-file?source=document_scanner_feature_hero">
              <Button size="lg" className="gap-2">
                Upload & Start Filing <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button size="lg" variant="outline">View Pricing</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="type-section-title font-extrabold text-slate-900">From upload to pre-filled form</h2>
            <p className="text-slate-500 mt-3 text-lg">Three steps with review before filing.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.num} className="text-center p-8 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-5 rounded-xl bg-[#315efb] flex items-center justify-center text-white font-black text-lg">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Documents */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="type-section-title font-extrabold text-slate-900">Supported document types</h2>
            <p className="text-slate-500 mt-3 text-lg">Every document Indian taxpayers need to file.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {supportedDocs.map((doc) => (
              <div key={doc.name} className="flex gap-4 p-5 bg-white rounded-xl border border-slate-100">
                <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm mb-1">{doc.name}</div>
                  <div className="text-slate-500 text-sm leading-relaxed">{doc.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-semibold mb-5">
                <Lock className="w-4 h-4" />
                Document Security
              </div>
              <h2 className="type-section-title mb-4 font-extrabold text-slate-900">
                Your documents stay private
              </h2>
              <p className="text-slate-500 mb-8">
                Tax documents contain your PAN, Aadhaar, income details, and bank account information. We handle them with strict access controls and minimal retention.
              </p>
              <ul className="space-y-3">
                {trustPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              {[
                { icon: Upload, label: "Supported Formats", desc: "PDF, JPG, PNG — up to 10 MB per file. No special export needed." },
                { icon: Zap, label: "Assisted Extraction", desc: "Supported documents are processed to suggest fields for review." },
                { icon: ScanLine, label: "Accuracy Check", desc: "Extracted values are flagged if they appear inconsistent with other documents." },
                { icon: FileText, label: "Review Output", desc: "Check extracted data before your return is filed, with CA assistance available on eligible plans." },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-white border border-slate-100 flex items-center justify-center">
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
          <ScanLine className="w-8 h-8 mx-auto mb-4 text-blue-300" />
          <h2 className="text-3xl font-extrabold mb-4">Stop entering numbers manually.</h2>
          <p className="text-blue-100 mb-8">Upload supported documents, review the extracted values, and choose CA assistance where the selected plan includes it.</p>
          <Link href="/which-itr-form-to-file?source=document_scanner_feature_cta">
            <Button size="lg" className="bg-white text-[#315efb] hover:bg-blue-50 gap-2">
              Start with Document Upload <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
