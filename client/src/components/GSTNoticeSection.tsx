import { m } from "framer-motion";
import { AlertCircle, ArrowRight, Building, CheckCircle, FileText, Phone, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const gstNoticeTypes = [
  {
    title: "GST registration",
    description: "Check applicability, documents, and portal readiness before registration work starts.",
    icon: Building,
    tone: "bg-blue-50 text-blue-700",
  },
  {
    title: "GST return filing",
    description: "Prepare GSTR-1 and GSTR-3B using sales, ITC, challan, and invoice data.",
    icon: FileText,
    tone: "bg-teal-50 text-teal-700",
  },
  {
    title: "GST scrutiny notice",
    description: "Review notice points, GST portal data, and records before response drafting.",
    icon: AlertCircle,
    tone: "bg-amber-50 text-amber-700",
  },
  {
    title: "GST refunds",
    description: "Build the refund document pack and eligibility view based on available records.",
    icon: TrendingUp,
    tone: "bg-emerald-50 text-emerald-700",
  },
];

const gstServices = [
  "Understand registration, return, ITC, refund, or notice needs",
  "List invoices, portal reports, challans, and missing records",
  "Prepare return, response, or registration details for review",
  "Continue support based on filing status or portal response",
];

export default function GSTNoticeSection() {
  return (
    <section id="gst-notices" className="scroll-mt-20 border-b border-slate-200 bg-[#F8FAFC] py-14">
      <div className="container mx-auto px-4">
        <m.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mx-auto mb-8 grid max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-end"
        >
          <div>
            <div className="inline-flex items-center rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              <FileText className="mr-2 h-3.5 w-3.5" />
              GST support without guesswork
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 lg:text-4xl">
              Keep GST work scoped before filing, notices, or refunds move ahead.
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              GST visitors need confidence that portal data, invoices, ITC, and deadlines are understood before work begins.
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

        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-2 lg:grid-cols-4">
          {gstNoticeTypes.map((service, index) => (
            <m.div
              key={service.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              viewport={{ once: true }}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-blue-200"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${service.tone}`}>
                <service.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-950">{service.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
            </m.div>
          ))}
        </div>

        <div className="mx-auto mt-4 grid max-w-7xl gap-3 md:grid-cols-4">
          {gstServices.map((service, index) => (
            <div key={service} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
                {index + 1}
              </div>
              <p className="mt-3 text-sm font-bold leading-6 text-slate-800">{service}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-4 max-w-7xl rounded-lg border border-blue-100 bg-blue-50 p-5 shadow-sm md:grid md:grid-cols-[1fr_auto] md:items-center md:gap-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-950 md:text-xl">Need GST assistance?</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Share the GST task and get the document path, scope, and next step before work begins.
              </p>
            </div>
          </div>

          <Link href="/services/gst-registration">
            <Button size="lg" variant="brand" className="mt-5 h-11 w-full rounded-lg px-5 md:mt-0 md:w-auto">
              Get GST help
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
