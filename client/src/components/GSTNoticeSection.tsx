import { m } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Building,
  CheckCircle,
  FileText,
  Phone,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function GSTNoticeSection() {
  const gstNoticeTypes = [
    {
      title: "GST Registration",
      description: "Check applicability, documents, and portal readiness before registration work starts.",
      icon: Building,
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "GST Returns Filing",
      description: "Prepare GSTR-1 and GSTR-3B using sales, ITC, challan, and invoice data.",
      icon: FileText,
      color: "bg-teal-50 text-teal-700",
    },
    {
      title: "GST Scrutiny Notice",
      description: "Review notice points, GST portal data, and supporting records before response drafting.",
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-700",
    },
    {
      title: "GST Refunds",
      description: "Build the refund document pack and eligibility view based on available records.",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  const gstServices = [
    {
      step: "1",
      title: "GST review",
      description: "Understand registration, return, ITC, refund, or notice needs.",
    },
    {
      step: "2",
      title: "Data checklist",
      description: "List invoices, portal reports, challans, and missing records.",
    },
    {
      step: "3",
      title: "Filing prep",
      description: "Prepare return, response, or registration details for review.",
    },
    {
      step: "4",
      title: "Follow-up scope",
      description: "Continue support based on filing status or portal response.",
    },
  ];

  return (
    <section id="gst-notices" className="scroll-mt-20 border-b border-slate-200 bg-[#F8FAFC] py-8 md:py-14">
      <div className="container mx-auto px-4">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 grid max-w-6xl gap-5 lg:grid-cols-[1fr_0.8fr] lg:items-end"
        >
          <div>
            <div className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              <FileText className="mr-2 h-3.5 w-3.5" />
              GST compliance
            </div>
            <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Keep GST work scoped before filings, notices, or refunds move ahead.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-base">
              MyeCA helps organize GST registration, return filing, ITC review, refund, and notice workflows around the documents and portal data available.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-bold text-slate-950">GST work starts with clarity</p>
            <div className="mt-3 space-y-2">
              {["GSTIN and return status are checked", "Invoices and portal reports are mapped", "Review scope is confirmed before work"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle className="h-4 w-4 text-emerald-700" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 max-w-6xl"
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {gstNoticeTypes.map((service, index) => (
              <div key={index} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${service.color}`}>
                  <service.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-950">{service.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
              </div>
            ))}
          </div>
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 max-w-6xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-700 text-white">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-950">4-step GST support process</p>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Review, checklist, preparation, follow-up</p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {gstServices.map((service) => (
              <div key={service.step} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                  {service.step}
                </div>
                <h4 className="mt-3 font-bold text-slate-950">{service.title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">{service.description}</p>
              </div>
            ))}
          </div>
        </m.div>

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
              <h3 className="text-lg font-extrabold text-slate-950 md:text-xl">Need GST assistance?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">Share the GST task and get the document path, scope, and next step before work begins.</p>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row md:mt-0">
            <Link href="/services/gst-registration">
              <Button size="lg" variant="brand" className="h-11 w-full rounded-lg px-5 sm:w-auto">
                Get GST help
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/expert-consultation?service=gst-registration">
              <Button
                variant="outline"
                size="lg"
                className="h-11 w-full rounded-lg border-blue-200 bg-white px-5 text-blue-700 hover:bg-blue-50 sm:w-auto"
              >
                Request callback
                <Phone className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </m.div>
      </div>
    </section>
  );
}
