import { useMemo, useState } from "react";
import {
  BarChart3,
  Calendar,
  Check,
  Cloud,
  CreditCard,
  Database,
  FileText,
  Globe,
  Mail,
  Phone,
  Plug,
  Search,
  Shield,
  Smartphone,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SEO from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { Layout } from "@/components/admin/Layout";

type IntegrationStatus = "connected" | "available" | "planned";

interface Integration {
  id: string;
  name: string;
  description: string;
  features: string[];
  status: IntegrationStatus;
  priority?: string;
}

const integrationCategories = [
  {
    key: "tax-data",
    name: "Tax data",
    icon: FileText,
    integrations: [
      {
        id: "income-tax-portal",
        name: "Income Tax Portal",
        description: "Prefill, acknowledgment, refund and filing-status workflow bridge.",
        features: ["ITR status", "Acknowledgment sync", "Refund tracker"],
        status: "planned" as const,
        priority: "Moat",
      },
      {
        id: "ais-26as",
        name: "AIS / 26AS Import",
        description: "Mismatch detection between uploaded statements and return computation.",
        features: ["Mismatch queue", "CA notes", "User approval"],
        status: "available" as const,
      },
      {
        id: "form16-ocr",
        name: "Form 16 OCR",
        description: "Extract employer TAN, salary, deductions and TDS from uploaded files.",
        features: ["OCR extraction", "Confidence checks", "Vault sync"],
        status: "connected" as const,
      },
    ],
  },
  {
    key: "investor",
    name: "Investor imports",
    icon: TrendingUp,
    integrations: [
      {
        id: "broker-pl",
        name: "Broker P&L Upload",
        description: "CSV/PDF upload workflow for capital gains and F&O review.",
        features: ["Stocks and MF", "F&O audit flag", "Tax-loss harvesting"],
        status: "available" as const,
        priority: "Quicko capture",
      },
      {
        id: "zerodha",
        name: "Zerodha Console",
        description: "Roadmap connector for contract notes and capital-gains statements.",
        features: ["Holding period", "STCG/LTCG", "Schedule CG"],
        status: "planned" as const,
      },
      {
        id: "groww-upstox",
        name: "Groww / Upstox",
        description: "Roadmap connector for retail investor filing workflows.",
        features: ["Broker import", "VDA notes", "CA review"],
        status: "planned" as const,
      },
    ],
  },
  {
    key: "business",
    name: "Business operations",
    icon: Database,
    integrations: [
      {
        id: "gst-portal",
        name: "GST Portal",
        description: "Registration, return filing and compliance calendar status tracking.",
        features: ["GSTR reminders", "Query tracking", "Certificate vault"],
        status: "available" as const,
      },
      {
        id: "razorpay",
        name: "Razorpay",
        description: "Payments, invoices and service activation receipts.",
        features: ["Payment capture", "Refund notes", "Service activation"],
        status: "planned" as const,
      },
      {
        id: "accounting",
        name: "Accounting Stack",
        description: "Books, invoices and monthly compliance handoff for vCFO clients.",
        features: ["Bookkeeping", "MIS reports", "GST/TDS source data"],
        status: "planned" as const,
      },
    ],
  },
  {
    key: "communication",
    name: "Communication",
    icon: Phone,
    integrations: [
      {
        id: "whatsapp",
        name: "Communication Updates",
        description: "Roadmap channel for case-stage updates, pending documents, CA review and filing completion.",
        features: ["Status updates", "Document reminders", "Callback capture"],
        status: "planned" as const,
        priority: "Conversion",
      },
      {
        id: "email",
        name: "Transactional Email",
        description: "Receipts, acknowledgments, document requests and compliance reminders.",
        features: ["SES/SendGrid", "Templates", "Audit trail"],
        status: "connected" as const,
      },
      {
        id: "calendar",
        name: "Compliance Calendar",
        description: "Advance tax, GST, TDS, ROC and renewal reminders.",
        features: ["Due dates", "Team tasks", "Customer nudges"],
        status: "connected" as const,
      },
    ],
  },
];

const statusStyle: Record<IntegrationStatus, string> = {
  connected: "bg-emerald-50 text-emerald-700 border-emerald-100",
  available: "bg-blue-50 text-blue-700 border-blue-100",
  planned: "bg-slate-50 text-slate-600 border-slate-100",
};

const metricCards = [
  { label: "Connected", value: "03", icon: Check },
  { label: "Ready next", value: "04", icon: Zap },
  { label: "Roadmap", value: "05", icon: Cloud },
  { label: "Guardrails", value: "100%", icon: Shield },
];

const typedIntegrationCategories: Array<{
  key: string;
  name: string;
  icon: typeof FileText;
  integrations: Integration[];
}> = integrationCategories;

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return typedIntegrationCategories;

    return typedIntegrationCategories
      .map((category) => ({
        ...category,
        integrations: category.integrations.filter(
          (integration) =>
            integration.name.toLowerCase().includes(query) ||
            integration.description.toLowerCase().includes(query) ||
            integration.features.some((feature) => feature.toLowerCase().includes(query)),
        ),
      }))
      .filter((category) => category.integrations.length > 0);
  }, [searchQuery]);

  return (
    <Layout>
      <SEO
        title="Integration Roadmap | MyeCA.in"
        description="MyeCA integration roadmap for tax data, capital gains imports, GST workflows, payments and customer notifications."
        keywords="MyeCA integrations, AIS import, capital gains import, GST workflow, tax case updates"
      />

      <div className="space-y-8 pb-12">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="mb-4 border-blue-100 bg-blue-50 text-blue-700">Workflow moat</Badge>
              <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                Integrations that turn documents into trackable tax cases.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                The roadmap prioritizes high-intent competitor gaps: AIS/26AS mismatch detection,
                broker P&L uploads, GST status tracking, payments and case communication updates.
              </p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search integrations"
                className="h-12 rounded-2xl border-slate-200 pl-11"
              />
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map((metric) => (
              <div key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <metric.icon className="h-5 w-5 text-blue-600" />
                <p className="mt-3 text-2xl font-black text-slate-950">{metric.value}</p>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">{metric.label}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6">
          {filteredCategories.map((category) => {
            const CategoryIcon = category.icon;
            return (
              <Card key={category.key} className="rounded-[28px] border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
                      <CategoryIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>{category.name}</CardTitle>
                      <CardDescription>Built for filing, compliance and CA fulfillment.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {category.integrations.map((integration) => (
                    <div key={integration.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-black text-slate-950">{integration.name}</h2>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{integration.description}</p>
                        </div>
                        <Badge className={statusStyle[integration.status]}>
                          {integration.status === "planned" ? "Roadmap" : integration.status}
                        </Badge>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {integration.features.map((feature) => (
                          <span key={feature} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                            {feature}
                          </span>
                        ))}
                      </div>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                          {integration.priority || "Platform"}
                        </span>
                        <Button
                          variant={integration.status === "connected" ? "outline" : "default"}
                          size="sm"
                          onClick={() =>
                            toast({
                              title: `${integration.name} noted`,
                              description: "This integration is now part of the implementation roadmap.",
                            })
                          }
                        >
                          {integration.status === "connected" ? "Manage" : "Prioritize"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <section className="grid gap-4 rounded-[32px] bg-slate-950 p-6 text-white md:grid-cols-4 md:p-8">
          {[
            ["Tax source", Globe],
            ["Document vault", FileText],
            ["Payments", CreditCard],
            ["Mobile updates", Smartphone],
            ["Email", Mail],
            ["Calendar", Calendar],
            ["Analytics", BarChart3],
            ["API", Plug],
          ].map(([label, Icon]) => {
            const TypedIcon = Icon as typeof Plug;
            return (
              <div key={String(label)} className="flex items-center gap-3 rounded-2xl bg-white/5 p-4">
                <TypedIcon className="h-5 w-5 text-blue-300" />
                <span className="text-sm font-bold">{String(label)}</span>
              </div>
            );
          })}
        </section>
      </div>
    </Layout>
  );
}
