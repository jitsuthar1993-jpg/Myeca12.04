import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  Database,
  FileCheck2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Link } from "wouter";
import MetaSEO from "@/components/seo/MetaSEO";
import { getSEOConfig } from "@/config/seo.config";

const proofPoints = [
  {
    title: "Review before payment",
    desc: "Pricing, inclusions, exclusions, GST treatment, and review eligibility are shown before checkout or quote confirmation.",
    icon: ClipboardCheck,
  },
  {
    title: "Required documents only",
    desc: "The filing workflow focuses on documents needed for the selected return, notice, GST, or business service.",
    icon: FileCheck2,
  },
  {
    title: "Optional CA review",
    desc: "Assisted plans explain when expert review is available and what an expert is expected to review.",
    icon: UserCheck,
  },
  {
    title: "Payment separation",
    desc: "Payment details are handled through payment infrastructure, while filing documents stay tied to the requested service.",
    icon: CreditCard,
  },
];

const documentFlow = [
  "You choose the service and see what is needed before sharing sensitive financial documents.",
  "The service asks for documents needed for preparation, review, or filing support.",
  "Assigned service workflows use the documents for the requested tax or compliance purpose.",
  "Privacy and retention requests are routed through the published privacy/support contact path.",
];

const securityPractices = [
  {
    title: "Secure transport",
    desc: "Sensitive pages and uploads are expected to use secure HTTPS transport in production.",
    icon: LockKeyhole,
  },
  {
    title: "Access controls",
    desc: "Account and role-based areas separate ordinary users, service teams, CAs, and admin workflows.",
    icon: ShieldCheck,
  },
  {
    title: "Document handling",
    desc: "Documents are used for the service requested and are not positioned as public or marketing assets.",
    icon: Database,
  },
];

const boundaries = [
  "MyeCA does not promise a refund, assessment result, or government processing timeline.",
  "MyeCA avoids unsupported security superlatives, immediate approval claims, and assured filing outcomes.",
  "MyeCA does not sell personal information for third-party commercial use, as described in the privacy policy.",
];

export default function TrustPage() {
  const seo = getSEOConfig("/trust");

  return (
    <>
      <MetaSEO
        title={seo?.title || "Trust & Security | MyeCA.in"}
        description={seo?.description || "Review how MyeCA.in handles tax documents, pricing scope, CA review, privacy, and security expectations before you start filing."}
        keywords={seo?.keywords}
        breadcrumbs={seo?.breadcrumbs}
      />

      <main className="min-h-screen bg-white">
        <section className="border-b border-slate-200 bg-[#F8FAFC] py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-left md:text-center">
              <div className="inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm md:rounded-full">
                <ShieldCheck className="h-4 w-4" />
                Trust center
              </div>
              <h1 className="type-hero-title mt-6 font-extrabold text-slate-950">
                Trust, security, and document handling.
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600 md:mx-auto md:text-lg">
                Tax filing asks users to share PAN, income, deductions, bank details, and business records. This page explains what MyeCA shows before payment, how document workflows are framed, and where privacy questions are handled.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row md:justify-center">
                <Link href="/itr/form-selector" className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-6 text-sm font-bold text-white shadow-sm shadow-blue-200 transition-colors hover:bg-blue-700">
                  Start filing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/legal/privacy-policy" className="inline-flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:bg-slate-50">
                  Read privacy policy
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Before checkout</p>
              <h2 className="type-section-title mt-3 font-extrabold text-slate-950">What users should be able to verify first</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {proofPoints.map((item) => (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-[#F8FAFC] py-12 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Document workflow</p>
              <h2 className="type-section-title mt-3 font-extrabold text-slate-950">How sensitive tax documents move through the service</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
                The goal is to keep the process understandable: what is needed, why it is needed, who may review it, and which support route handles privacy questions.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
              <div className="space-y-4">
                {documentFlow.map((step, index) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">{index + 1}</div>
                    <p className="pt-1 text-sm leading-6 text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Security practices</p>
                <h2 className="type-section-title mt-3 font-extrabold text-slate-950">Practical controls, stated plainly</h2>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {securityPractices.map((item) => (
                    <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                      <item.icon className="h-6 w-6 text-blue-700" />
                      <h3 className="mt-4 text-base font-bold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 md:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Trust boundaries</p>
                <h3 className="mt-3 text-xl font-extrabold text-slate-950">Clear claims beat bigger claims.</h3>
                <div className="mt-5 space-y-3">
                  {boundaries.map((item) => (
                    <div key={item} className="flex gap-3 text-sm leading-6 text-slate-700">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-blue-100 bg-[#F8FAFC] py-12 md:py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Business cases</p>
              <h2 className="type-section-title mt-3 font-extrabold text-slate-950">High-value cases should start with document review.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
                For business income, GST, TDS, notices, capital gains, NRI facts, or higher-turnover cases, the first review should clarify documents, timelines, exclusions, and professional review needs before checkout.
              </p>
            </div>
            <div className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-1 h-5 w-5 text-blue-700" />
                <div>
                  <h3 className="font-bold text-slate-950">Need privacy or scope clarity?</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Send the case type, filing year, and question. Do not email full PAN or complete financial documents unless support asks for them through the right workflow.
                  </p>
                  <Link href="/contact" className="mt-5 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800">
                    Contact support <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
