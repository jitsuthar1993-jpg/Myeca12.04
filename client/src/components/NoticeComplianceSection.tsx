import { m } from "framer-motion";
import { AlertTriangle, ArrowRight, Shield, Clock, CheckCircle, Phone, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NoticeComplianceSection() {
  const noticeTypes = [
    {
      title: "Scrutiny Assessment",
      description: "Review notice details, records, and response requirements before drafting.",
      icon: FileText,
      color: "bg-blue-50 text-blue-700"
    },
    {
      title: "Mismatch Notices",
      description: "Compare AIS, Form 26AS, TDS, and return data before response.",
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-700"
    },
    {
      title: "Default Assessment",
      description: "Assess the order, supporting papers, and correction options.",
      icon: Shield,
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      title: "Penalty Notices",
      description: "Prepare penalty or interest responses based on facts and deadlines.",
      icon: Clock,
      color: "bg-rose-50 text-rose-700"
    }
  ];

  const complianceProcess = [
    {
      step: "1",
      title: "Notice review",
      description: "Identify notice type, deadline, and risk level."
    },
    {
      step: "2", 
      title: "Document check",
      description: "Map required records, filings, and proof gaps."
    },
    {
      step: "3",
      title: "Response draft",
      description: "Prepare the response with supporting documents."
    },
    {
      step: "4",
      title: "Follow-up scope",
      description: "Continue support based on the agreed engagement."
    }
  ];

  return (
    <section id="notices" className="scroll-mt-20 border-y border-slate-200 bg-white py-8 md:py-14">
      <div className="container mx-auto px-4">
        {/* Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 grid max-w-6xl gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-end"
        >
          <div>
            <div className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-700">
              <AlertTriangle className="mr-2 h-3.5 w-3.5" />
              Notice response
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Respond to income tax notices with a documented workflow.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              Get notice support based on the notice type, facts, filings, and records available before response drafting begins.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-5">
            <p className="text-sm font-bold text-slate-950">Before paid work starts</p>
            <div className="mt-3 space-y-2">
              {["Notice type and deadline are checked", "Documents and proof gaps are listed", "Response scope is confirmed"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="h-4 w-4 text-emerald-700" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </m.div>

        {/* Notice Types */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 max-w-6xl"
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {noticeTypes.map((notice, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${notice.color}`}>
                  <notice.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-950">{notice.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{notice.description}</p>
              </div>
            ))}
          </div>
        </m.div>

        {/* Process */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 max-w-6xl rounded-lg border border-slate-200 bg-[#F8FAFC] p-5 md:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">4-step notice support process</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Scope, documents, response, follow-up</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {complianceProcess.map((process, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                  {process.step}
                </div>
                <h4 className="mt-3 font-bold text-slate-950">{process.title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">{process.description}</p>
              </div>
            ))}
          </div>
        </m.div>

        {/* CTA Section */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mx-auto max-w-6xl rounded-lg border border-blue-100 bg-blue-50 p-5 shadow-sm md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-6 md:p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-950 md:text-xl">Got an income tax notice?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Share the notice and get a scoped review path before the response is prepared.</p>
            </div>
          </div>
          
          <div className="mt-5 flex flex-col gap-2 sm:flex-row md:mt-0">
            <Link href="/services/notice-compliance">
              <Button 
                size="lg" 
                variant="brand"
                className="h-11 w-full rounded-lg px-5 sm:w-auto"
              >
                Get notice help
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/expert-consultation?service=notice-compliance">
              <Button 
                variant="outline" 
                size="lg"
                className="h-11 w-full rounded-lg border-blue-200 bg-white px-5 text-blue-700 hover:bg-blue-50 sm:w-auto"
              >
                Request Callback
                <Phone className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  );
}
