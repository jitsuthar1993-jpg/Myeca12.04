import { m } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, FileText, Phone, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const noticeTypes = [
  {
    title: "Scrutiny Assessment",
    description: "Review notice details, records, and response requirements before drafting.",
    icon: FileText,
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Mismatch Notices",
    description: "Compare AIS, Form 26AS, TDS, and return data before response.",
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-600",
  },
  {
    title: "Default Assessment",
    description: "Assess the order, supporting papers, and correction options.",
    icon: Shield,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Penalty Notices",
    description: "Prepare penalty or interest responses based on facts and deadlines.",
    icon: Clock,
    color: "bg-red-100 text-red-600",
  },
];

const complianceProcess = [
  {
    step: "1",
    title: "Notice review",
    description: "Identify notice type, deadline, and risk level.",
  },
  {
    step: "2",
    title: "Document check",
    description: "Map required records, filings, and proof gaps.",
  },
  {
    step: "3",
    title: "Response draft",
    description: "Prepare the response with supporting documents.",
  },
  {
    step: "4",
    title: "Follow-up scope",
    description: "Continue support based on the agreed engagement.",
  },
];

export default function NoticeComplianceSection() {
  return (
    <section id="notices" className="scroll-mt-20 bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="container mx-auto px-6">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Notice compliance support
          </div>
          <h2 className="mb-4 text-3xl font-bold text-slate-950 md:text-4xl">
            Income Tax Notice? <span className="text-red-700">Start with the facts.</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xl text-slate-600">
            Get notice support based on the notice type, facts, filings, and records available before response drafting begins.
          </p>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-slate-950">
            Notice types MyeCA can scope
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {noticeTypes.map((notice) => (
              <div
                key={notice.title}
                className="rounded-lg bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${notice.color}`}>
                  <notice.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-950">{notice.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{notice.description}</p>
              </div>
            ))}
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <h3 className="mb-8 text-center text-2xl font-bold text-slate-950">
            Four-step notice response path
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {complianceProcess.map((process) => (
              <div key={process.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-lg font-bold text-white">
                  {process.step}
                </div>
                <h4 className="mb-2 font-semibold text-slate-950">{process.title}</h4>
                <p className="text-sm leading-6 text-slate-600">{process.description}</p>
              </div>
            ))}
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-white p-8 text-center shadow-lg"
        >
          <div className="mb-4 flex items-center justify-center">
            <div className="mr-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <Phone className="h-8 w-8 text-red-600" />
            </div>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-slate-950">Received a tax notice?</h3>
              <p className="text-slate-600">Share the notice and get a scoped review path before the response is prepared.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/services/notice-compliance">
              <Button size="lg" className="bg-red-600 px-8 py-4 text-white hover:bg-red-700">
                Get notice review
                <AlertTriangle className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/expert-consultation?service=notice-compliance">
              <Button
                variant="outline"
                size="lg"
                className="border-red-600 px-8 py-4 text-red-600 hover:bg-red-50"
              >
                Request Callback
                <Phone className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-sm text-slate-500">
            <div className="flex flex-wrap items-center justify-center gap-4">
              {["Notice review", "Document check", "Response drafting"].map((item) => (
                <div key={item} className="flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4 text-green-600" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
}
