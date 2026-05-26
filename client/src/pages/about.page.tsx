import { Award, CheckCircle2, FileCheck, Shield, Users } from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";

export default function AboutPage() {
  const seo = getSEOConfig("/about");

  return (
    <div className="min-h-screen bg-white">
      <MetaSEO
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        breadcrumbs={seo?.breadcrumbs}
      />

      <section className="border-b bg-slate-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="type-hero-title mb-6 font-black text-slate-900">
            Built around clearer tax filing decisions.
          </h1>
          <p className="mx-auto max-w-2xl text-xl font-medium leading-relaxed text-slate-600">
            MyeCA.in helps taxpayers understand which documents are needed, when CA-assisted review is useful, and what should happen before payment or filing.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-slate-900">Why this service exists</h2>
              <div className="space-y-4 font-medium leading-relaxed text-slate-600">
                <p>
                  Indian tax filing often becomes stressful because users do not know which ITR form fits, whether AIS matches Form 16, or when capital gains, NRI facts, GST, or notices need a professional look.
                </p>
                <p>
                  MyeCA.in is designed around that decision point. A user should be able to start with a short summary, see the document checklist, and understand the next step before sharing sensitive records.
                </p>
                <p>
                  The service focuses on guided ITR flows, document readiness, business compliance support, and CA-assisted review for cases where professional judgment is part of the selected plan.
                </p>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg bg-blue-600 p-8 text-white shadow-xl">
              <div className="relative z-10">
                <Shield className="mb-6 h-12 w-12 opacity-80" />
                <h3 className="mb-4 text-2xl font-bold">What stays visible</h3>
                <ul className="space-y-3 opacity-90">
                  {[
                    "Required documents before review starts",
                    "Plan inclusions, exclusions, and GST treatment",
                    "Where CA-assisted review applies",
                    "No PAN or portal passwords in public contact forms",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-blue-200" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mb-20 overflow-hidden border-y border-slate-100 bg-white py-20">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900">How the service should feel</h2>
            <p className="font-medium text-slate-500">Specific enough for tax work, simple enough to start without a call.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { icon: Award, title: "Expertise", desc: "Complex returns can add CA-assisted review when the selected plan supports it." },
              { icon: FileCheck, title: "Clarity", desc: "Form 16, AIS, broker reports, notices, GST data, and books are requested only when relevant." },
              { icon: Users, title: "Support", desc: "Requests are reviewed during business hours and routed to the right filing or consultation path." },
              { icon: Shield, title: "Care", desc: "Sensitive records belong in the service process, not in public inquiry forms." },
            ].map((value) => (
              <div key={value.title} className="rounded-lg border border-slate-100 bg-slate-50 p-6 transition-colors hover:border-blue-200 hover:bg-blue-50">
                <value.icon className="mb-4 h-8 w-8 text-blue-600" />
                <h4 className="mb-2 text-lg font-bold text-slate-900">{value.title}</h4>
                <p className="text-sm font-medium leading-relaxed text-slate-500">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-full -translate-x-1/2 bg-gradient-to-b from-blue-600/5 to-transparent" />
      </section>

      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-6 text-3xl font-bold text-slate-900">Have a complex filing question?</h2>
        <p className="mx-auto mb-8 max-w-xl font-medium text-slate-600">
          Share the facts first. The team can review the case type, document readiness, and next step during business hours.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="mailto:support@myeca.in?subject=Business Inquiry"
            className="rounded-lg bg-[#315efb] px-8 py-4 font-bold text-white shadow-lg transition-all hover:-translate-y-1"
          >
            Email Us
          </a>
        </div>
      </section>
    </div>
  );
}
