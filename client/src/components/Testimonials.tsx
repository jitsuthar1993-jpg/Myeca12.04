import { ArrowRight, CheckCircle2, FileText, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { filingSituations } from "@/data/testimonials";

export default function Testimonials() {
  return (
    <section id="filing-situations" className="relative scroll-mt-20 border-y border-slate-200 bg-white py-12 md:py-16">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Common filing situations</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Real tax work starts with the documents.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">
            These examples show how MyeCA routes common ITR, notice, NRI, capital gains, and GST cases before sensitive papers are requested.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {filingSituations.map((situation) => (
            <Card
              key={situation.id}
              className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold leading-snug text-slate-950">{situation.title}</h3>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{situation.profile}</p>

              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">Documents</p>
                  <ul className="mt-2 space-y-2">
                    {situation.documents.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-5 text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-700">MyeCA checks</p>
                  <ul className="mt-2 space-y-2">
                    {situation.checks.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2 text-sm leading-5 text-slate-600">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link href={situation.href} className="mt-auto inline-flex items-center pt-5 text-sm font-bold text-blue-700 hover:text-blue-800">
                {situation.nextStep}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Card>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 md:mt-8 md:flex md:items-center md:justify-between md:p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <p className="text-sm font-bold text-slate-950">Proof policy</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Named testimonials and case studies should appear only after a client gives written approval for public use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
