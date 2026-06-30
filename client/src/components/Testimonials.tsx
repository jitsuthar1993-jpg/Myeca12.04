import { ArrowRight, CheckCircle2, ClipboardCheck, FileText, FolderSearch, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { filingSituations } from "@/data/testimonials";
import { cn } from "@/lib/utils";

const intakeSteps = [
  {
    title: "Collect source files",
    detail: "Form 16, AIS, 26AS, broker reports, notice PDFs, and proof records.",
    icon: FileText,
    tone: "border-sky-100 bg-sky-50 text-sky-700",
  },
  {
    title: "Match records before filing",
    detail: "Compare income, TDS, deductions, gains, and portal facts before advice starts.",
    icon: FolderSearch,
    tone: "border-emerald-100 bg-emerald-50 text-emerald-700",
  },
  {
    title: "Scope the next action",
    detail: "Route simple filings, complex reviews, notices, and GST cleanup with less guesswork.",
    icon: ClipboardCheck,
    tone: "border-amber-100 bg-amber-50 text-amber-700",
  },
];

const evidenceTracks = [
  "Income trail",
  "TDS and tax credit trail",
  "Deduction proof trail",
  "Notice or portal trail",
];

const situationTones = [
  "border-sky-200 hover:border-sky-300",
  "border-emerald-200 hover:border-emerald-300",
  "border-violet-200 hover:border-violet-300",
  "border-red-200 hover:border-red-300",
  "border-amber-200 hover:border-amber-300",
];

const situationSpans = [
  "lg:col-span-3",
  "lg:col-span-3",
  "lg:col-span-2",
  "lg:col-span-2",
  "lg:col-span-2",
];

export default function Testimonials() {
  return (
    <section id="filing-situations" className="relative scroll-mt-20 border-y border-slate-200 bg-[#F8FAFC] py-12 md:py-16">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
          <div className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Common filing situations</p>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                Real tax work starts with the documents.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 md:text-base">
                Every useful tax answer has a paper trail. MyeCA starts by mapping what each record proves, what needs a cross-check, and which case path needs expert review before sensitive files are requested.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
              {evidenceTracks.map((track) => (
                <div key={track} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-700">
                  {track}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Document intake</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950 md:text-2xl">From files to filing scope.</h3>
              </div>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <LockKeyhole className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {intakeSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", step.tone)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">Step {index + 1}</p>
                    <h4 className="mt-1 text-sm font-extrabold leading-snug text-slate-950">{step.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{step.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-6">
          {filingSituations.map((situation, index) => (
            <Link
              key={situation.id}
              href={situation.href}
              className={cn(
                "group flex h-full flex-col rounded-lg border bg-white p-5 shadow-sm transition-colors hover:bg-white",
                situationTones[index],
                situationSpans[index]
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-800 transition-colors group-hover:bg-blue-50 group-hover:text-blue-700">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{situation.profile}</p>
                    <h3 className="mt-2 text-lg font-extrabold leading-snug text-slate-950">{situation.title}</h3>
                  </div>
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-700" />
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Documents to line up</p>
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
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Review lens</p>
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

              <span className="mt-auto inline-flex items-center pt-5 text-sm font-bold text-blue-700">
                {situation.nextStep}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:mt-8 md:flex md:items-center md:justify-between md:p-5">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <p className="text-sm font-bold text-slate-950">Proof policy</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Named client stories stay private unless approved. Public examples should describe document patterns, not personal files.
              </p>
            </div>
          </div>
          <Link href="/trust" className="mt-4 inline-flex items-center text-sm font-bold text-blue-700 hover:text-blue-800 md:mt-0">
            Review document handling <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
