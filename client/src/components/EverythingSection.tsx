import { m } from "framer-motion";
import { ArrowRight, Building2, CheckCircle, FileText, ShieldCheck, UserRound } from "lucide-react";
import { Link } from "wouter";

const audiencePaths = [
  {
    title: "For Salaried Professionals",
    description: "Move from Form 16 and AIS review to the right ITR form with fewer surprises.",
    icon: UserRound,
    href: "/itr/start?source=everything_section_salary_path",
    cta: "Start ITR Filing",
    tone: "bg-blue-50 text-blue-700",
    steps: ["Check salary and Form 16", "Review deductions and AIS", "File with expert help if needed"],
  },
  {
    title: "For Business / GST",
    description: "Scope GST, TDS, registration, notices, and business documents before work begins.",
    icon: Building2,
    href: "/services",
    cta: "View Business Services",
    tone: "bg-emerald-50 text-emerald-700",
    steps: ["Share business or GST need", "Map documents and portal status", "Request scoped expert support"],
  },
];

const supportLinks = [
  { label: "Need a calculator first?", href: "/calculators", icon: FileText },
  { label: "Have a notice?", href: "/services/notice-compliance", icon: ShieldCheck },
];

export default function EverythingSection() {
  return (
    <section id="services" className="scroll-mt-20 border-b border-slate-200 bg-white py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <m.div
          className="mb-8 grid gap-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-end"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Salary and business paths</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
              Choose the right path before you enter the workflow.
            </h2>
          </div>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            The lower homepage now separates simple salary filing from business and GST work, so each visitor sees the next best action without scanning every service.
          </p>
        </m.div>

        <div className="grid gap-4 lg:grid-cols-2">
          {audiencePaths.map((path, index) => (
            <m.div
              key={path.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-5 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${path.tone}`}>
                  <path.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight text-slate-950">{path.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{path.description}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {path.steps.map((step, stepIndex) => (
                  <div key={step} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                      {stepIndex + 1}
                    </div>
                    <p className="text-sm font-semibold text-slate-700">{step}</p>
                  </div>
                ))}
              </div>

              <Link href={path.href} className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-blue-700">
                {path.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </m.div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {supportLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-sm font-bold text-slate-800 transition-colors hover:border-blue-200 hover:text-blue-700">
                <span className="inline-flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  {link.label}
                </span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
