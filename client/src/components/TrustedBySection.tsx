import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileCheck,
  Lock,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { Link } from "wouter";

const trustSignals = [
  {
    label: "Portal workflow",
    value: "Portal-aligned",
    detail: "Filing steps are structured around the official Income Tax Portal flow.",
    icon: ShieldCheck,
  },
  {
    label: "Review model",
    value: "Optional CA help",
    detail: "Assisted plans show the review scope and document needs before paid work.",
    icon: Users2,
  },
  {
    label: "Data handling",
    value: "Required docs only",
    detail: "The workflow asks for documents needed to prepare or review the case.",
    icon: Lock,
  },
  {
    label: "Price visibility",
    value: "Scope first",
    detail: "Simple pricing is visible, while complex returns are scoped before quoting.",
    icon: FileCheck,
  },
];

const businessSignals = [
  "Scope review before quoting for business income, GST, TDS, audit-linked, or notice cases.",
  "Document checklist, owner, expected next step, and timeline are clarified before paid work.",
  "Credential details are made available during scoped engagements where applicable.",
];

export default function TrustedBySection() {
  return (
    <section id="trusted-by" className="border-b border-slate-200 bg-[#F8FAFC] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Trust architecture</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Built for filing confidence, not blind checkout.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
              MyeCA earns trust by showing the filing process, review scope, data handling, and pricing rules before a taxpayer shares sensitive financial documents.
            </p>

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950">₹1Cr+ business readiness</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Scope first for high-value cases</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {businessSignals.map((signal) => (
                  <div key={signal} className="flex gap-3 text-sm leading-6 text-slate-700">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                    <span>{signal}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/expert-consultation?service=business-tax-review"
                className="mt-5 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                Request business scope review <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {trustSignals.map((signal) => (
              <div key={signal.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <signal.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{signal.label}</p>
                    <p className="mt-2 text-lg font-extrabold text-slate-950">{signal.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{signal.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
