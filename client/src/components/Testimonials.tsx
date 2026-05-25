import { Card } from "@/components/ui/card";
import { CheckCircle2, FileText } from "lucide-react";
import { testimonials } from "@/data/testimonials";

export default function Testimonials() {
  const featured = testimonials.slice(0, 3);

  return (
    <section id="testimonials" className="relative scroll-mt-20 border-y border-slate-200 bg-white py-12 md:py-16">
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Customer evidence</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Filing situations MyeCA is built to handle
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">
            Anonymized feedback is shown as workflow evidence, not as public client endorsement. Identified case studies can be added once approvals exist.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200 md:p-6"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-extrabold text-blue-700">
                  {testimonial.avatar}
                </div>
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700" aria-label="Anonymized workflow feedback">
                  Workflow example
                </div>
              </div>
              <p className="text-sm font-medium leading-6 text-slate-700">"{testimonial.content}"</p>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-950">{testimonial.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">{testimonial.role}</p>
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Anonymized workflow feedback
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 md:mt-8 md:flex md:items-center md:justify-between md:p-5">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
            <div>
              <p className="text-sm font-bold text-slate-950">Evidence policy</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Feedback is anonymized unless a client gives explicit approval for a public case study or named reference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
