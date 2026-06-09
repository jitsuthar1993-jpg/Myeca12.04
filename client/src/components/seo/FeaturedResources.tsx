import { Link } from "wouter";
import { ArrowRight, BookOpen, GraduationCap, Lightbulb, Star } from "lucide-react";
import { m } from "framer-motion";

const resources = [
  {
    title: "How do I choose between self-filing and CA-assisted ITR filing?",
    description: "A practical path for salary, deductions, AIS checks, refunds, and when expert review matters.",
    link: "/itr-filing",
    icon: GraduationCap,
    tone: "bg-blue-50 text-blue-700",
    tag: "ITR",
  },
  {
    title: "What should a business check before GST filing?",
    description: "Invoice data, ITC, GSTIN status, challans, portal reports, and due-date readiness.",
    link: "/gst-filing",
    icon: BookOpen,
    tone: "bg-emerald-50 text-emerald-700",
    tag: "GST",
  },
  {
    title: "What documents are needed before a tax notice response?",
    description: "Notice type, deadline, AIS/Form 26AS mismatch, filings, proof gaps, and response scope.",
    link: "/services/notice-compliance",
    icon: Star,
    tone: "bg-amber-50 text-amber-700",
    tag: "Notice",
  },
  {
    title: "Which business services need scope-first pricing?",
    description: "Registration, MSME, startup, trademark, TDS, and compliance work with document-heavy steps.",
    link: "/services",
    icon: Lightbulb,
    tone: "bg-slate-100 text-slate-700",
    tag: "Business",
  },
];

export default function FeaturedResources() {
  return (
    <section className="border-b border-slate-200 bg-white py-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-8 grid max-w-7xl gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Tax decision resources</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
              Questions people ask before choosing a tax service.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Start with the question closest to your situation, then follow the linked records, calculator, or service path needed to resolve it.
          </p>
        </div>

        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource, index) => (
            <m.div
              key={resource.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              viewport={{ once: true }}
            >
              <Link href={resource.link}>
                <div className="group h-full cursor-pointer rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200">
                  <div className={`mb-5 flex h-11 w-11 items-center justify-center rounded-lg ${resource.tone}`}>
                    <resource.icon className="h-5 w-5" />
                  </div>

                  <span className="type-meta mb-2 block font-bold uppercase tracking-wide text-slate-500">
                    {resource.tag}
                  </span>

                  <h3 className="text-lg font-extrabold leading-tight text-slate-950 transition-colors group-hover:text-blue-700">
                    {resource.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">{resource.description}</p>

                  <div className="mt-5 flex items-center text-sm font-bold text-blue-700">
                    Read answer
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
