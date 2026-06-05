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
    label: "Review",
    value: "CA-assisted where suitable",
    detail: "Professional review begins after the checklist is complete and the service type supports it.",
    icon: Users2,
  },
  {
    label: "Public forms",
    value: "Summary first",
    detail: "Contact and consultation forms ask for the situation, not PAN, passwords, or complete financial records.",
    icon: Lock,
  },
  {
    label: "Claims",
    value: "Clear limits",
    detail: "MyeCA avoids refund guarantees, government timeline promises, and unsupported security superlatives.",
    icon: ShieldCheck,
  },
];

const businessSignals = [
  "Business income, GST, TDS, audit-linked, and notice matters start with facts and documents.",
  "The next step should name the owner, required records, payment status, and likely filing dependency.",
  "Credential details and sensitive records are handled inside the selected service process when applicable.",
];

export default function TrustedBySection() {
  return (
    <section id="trusted-by" className="border-b border-slate-200 bg-[#F8FAFC] py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Trust architecture</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              What you can check before sharing tax papers.
            </h2>
            <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
              Tax work should make the next step visible: what document is needed, why it is needed, who may review it, and where the user should avoid sharing sensitive details.
            </p>

            <div className="mt-6 flex flex-1 flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-950">Business and notice cases</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Document review before quote</p>
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
                className="mt-auto inline-flex items-center pt-5 text-sm font-bold text-blue-700 hover:text-blue-800"
              >
                Request business review <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:auto-rows-fr">
            {trustSignals.map((signal) => (
              <div key={signal.label} className="h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
