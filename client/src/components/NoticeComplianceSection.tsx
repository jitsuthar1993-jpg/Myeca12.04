import { m } from "framer-motion";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, FileText, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const noticeTypes = [
  {
    title: "Scrutiny assessment",
    description: "Review notice details, records, and response requirements before drafting.",
    icon: FileText,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "AIS or TDS mismatch",
    description: "Compare AIS, Form 26AS, TDS, and return data before choosing a response.",
    icon: AlertTriangle,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    title: "Default assessment",
    description: "Assess the order, supporting papers, correction options, and next deadline.",
    icon: Shield,
    tone: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "Penalty notices",
    description: "Prepare penalty or interest responses based on facts, filings, and deadlines.",
    icon: Clock,
    tone: "bg-rose-50 text-rose-700",
  },
];

const processSteps = [
  "Identify notice type and deadline",
  "Map missing documents and risk level",
  "Prepare response draft with support",
  "Agree follow-up scope if needed",
];

export default function NoticeComplianceSection() {
  return (
    <section id="notices" className="scroll-mt-20 border-y border-red-100 bg-gradient-to-br from-red-50 to-orange-50 py-14">
      <div className="container mx-auto px-4">
        <m.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end"
        >
          <div>
            <div className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-red-700">
              <AlertTriangle className="mr-2 h-3.5 w-3.5" />
              Income tax notice support
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
              Handle notices with a calm, documented response path.
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Notice work is highest-trust by nature. MyeCA keeps the experience grounded in deadline clarity, document checks, response drafting, and scoped follow-up.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-950">Before drafting, we clarify</p>
            <div className="mt-3 space-y-2">
              {["Notice section and deadline", "AIS, TDS, return, and document gaps", "Response scope before payment"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="h-4 w-4 text-emerald-700" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </m.div>

        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-2 lg:grid-cols-4">
          {noticeTypes.map((notice, index) => (
            <m.div
              key={notice.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              viewport={{ once: true }}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${notice.tone}`}>
                <notice.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-950">{notice.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{notice.description}</p>
            </m.div>
          ))}
        </div>

        <m.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          viewport={{ once: true }}
          className="mx-auto mt-4 max-w-7xl rounded-lg border border-slate-200 bg-[#F8FAFC] p-5 shadow-sm md:p-6"
        >
          <div className="grid gap-3 md:grid-cols-4">
            {processSteps.map((step, index) => (
              <div key={step} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-sm font-bold text-red-700">
                  {index + 1}
                </div>
                <p className="mt-3 text-sm font-bold leading-6 text-slate-800">{step}</p>
              </div>
            ))}
          </div>
        </m.div>

        <div className="mx-auto mt-4 max-w-7xl rounded-lg border border-red-100 bg-white/70 p-5 shadow-sm md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-700">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-950 md:text-xl">Received a notice?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Share the notice and get a scoped review path before the response is prepared.
              </p>
            </div>
          </div>

          <Link href="/services/notice-compliance">
            <Button size="lg" variant="brand" className="mt-5 h-11 w-full rounded-lg px-5 md:mt-0 md:w-auto">
              Get notice review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
