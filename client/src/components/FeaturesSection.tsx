import { m } from "framer-motion";
import { ArrowRight, CheckCircle, FileCheck2, ShieldCheck, UserCheck } from "lucide-react";
import { Link } from "wouter";

const trustCards = [
  {
    title: "Guided filing with guardrails",
    description: "The flow keeps income, deductions, documents, and review steps visible before submission.",
    icon: FileCheck2,
  },
  {
    title: "Optional CA review",
    description: "Complex salary, capital gains, business income, and notice cases can move to expert review.",
    icon: UserCheck,
  },
  {
    title: "Scope before payment",
    description: "Users see the document path, support level, and exclusions before choosing a paid service.",
    icon: ShieldCheck,
  },
];

const proofItems = [
  "Form 16, AIS, deductions, and refund checks stay in one path.",
  "Business and GST visitors can branch into scoped expert help.",
  "The primary action remains Start ITR Filing, not a crowded service menu.",
];

export default function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 border-y border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <m.div
          className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Why MyeCA
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
              How guided filing differs from self-filing
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Self-filing can fit straightforward cases with complete records. MyeCA adds a documented workflow, scope clarity, and optional CA-assisted review when the return needs more checks.
            </p>

            <div className="mt-6 space-y-3">
              {proofItems.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-[#F8FAFC] p-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </div>

            <Link href="/itr/start?source=features_section" className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
              Start ITR Filing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3">
            {trustCards.map((card) => (
              <div key={card.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight text-slate-950">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </m.div>
      </div>
    </section>
  );
}
