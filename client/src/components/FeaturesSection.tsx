import { m } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import { ComparisonTable } from "./ComparisonTable";

const fitNotes = [
  "Use guided filing when Form 16, AIS, 26AS, deductions, or capital gains need to line up.",
  "Use CA-assisted review when the return depends on judgment, notice facts, NRI status, or business records.",
  "Use calculators when you only need an estimate before deciding whether a full service is needed.",
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative scroll-mt-20 border-y border-gray-100 bg-white py-9 md:py-16">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <m.div
          className="mb-6 text-left md:mb-12 md:text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 md:inline-flex">
            <Sparkles className="h-4 w-4" />
            Guided filing with review options
          </div>
          <h2 className="mb-2 mt-0 text-2xl font-bold tracking-tight text-gray-900 md:mb-4 md:mt-4 md:text-4xl">
            When MyeCA is useful
          </h2>
          <p className="max-w-2xl text-sm text-gray-600 md:mx-auto md:text-lg">
            MyeCA helps when a return needs document checks, a clear service path, or professional review before filing.
          </p>
        </m.div>

        <div className="mx-auto mb-6 grid max-w-5xl gap-3 md:mb-8 md:grid-cols-3">
          {fitNotes.map((note) => (
            <div key={note} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
              <span>{note}</span>
            </div>
          ))}
        </div>

        <div className="mx-auto max-w-5xl">
          <ComparisonTable />
        </div>
      </div>
    </section>
  );
}
