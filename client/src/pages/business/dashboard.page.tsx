import { Link } from "wouter";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileText,
  Landmark,
  ReceiptText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout } from "@/components/admin/Layout";
import { StatusBadge } from "@/components/platform/compliance-ui";

const companies = [
  "TechStart Solutions Pvt Ltd - 29AABCT1234A1ZA",
  "TechStart Services LLP - 27AABFT4567B1Z2",
  "MyeCA Demo India Pvt Ltd - 07AACCM9876C1Z5",
];

const complianceItems = [
  { task: "GSTR-3B", entity: "29AABCT1234A1ZA", due: "20 Apr 2026", status: "action_required" as const, owner: "GST Team" },
  { task: "GSTR-1", entity: "29AABCT1234A1ZA", due: "11 May 2026", status: "in_progress" as const, owner: "GST Team" },
  { task: "TDS Q4", entity: "BLRT12345A", due: "31 May 2026", status: "ca_review" as const, owner: "Payroll CA" },
  { task: "ROC annual filing", entity: "U72200KA2020PTC123456", due: "30 Sep 2026", status: "not_started" as const, owner: "Corporate Law" },
  { task: "PF/ESI payment", entity: "Payroll", due: "15 Apr 2026", status: "submitted" as const, owner: "HR Ops" },
];

const serviceKanban = [
  { stage: "Document Preparation", count: 4, status: "action_required" as const },
  { stage: "CA Validation", count: 3, status: "ca_review" as const },
  { stage: "Submitted to Government", count: 6, status: "submitted" as const },
  { stage: "Registered / Filed", count: 18, status: "registered" as const },
];

const metrics = [
  { label: "Compliance score", value: "86%", helper: "Up 8 points after GST cleanup", icon: ShieldCheck, tone: "text-emerald-700 bg-emerald-50" },
  { label: "Pending filings", value: "5", helper: "2 due this week", icon: AlertTriangle, tone: "text-amber-700 bg-amber-50" },
  { label: "Linked GSTINs", value: "3", helper: "Across two entities", icon: Building2, tone: "text-blue-700 bg-blue-50" },
  { label: "Team members", value: "14", helper: "Role-aware collaboration", icon: Users, tone: "text-slate-700 bg-slate-100" },
];

export default function BusinessDashboardPage() {
  return (
    <Layout title="Business Dashboard">
      <div className="space-y-6 pb-10">
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-700">Business module</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Enterprise compliance dashboard</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              GSTINs, TDS, ROC, payroll compliance, document workflows, and CA-led service tracking in one authenticated workspace.
            </p>
          </div>
          <Select defaultValue={companies[0]}>
            <SelectTrigger className="h-10 w-full rounded-lg border-slate-200 bg-white text-sm sm:w-[360px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <Card key={metric.label} className="rounded-lg border-slate-200 shadow-none">
                <CardContent className="flex items-start justify-between gap-4 p-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-950">{metric.value}</p>
                    <p className="mt-1 text-sm text-slate-500">{metric.helper}</p>
                  </div>
                  <div className={`rounded-lg p-2.5 ${metric.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardContent className="p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-950">Monthly statutory compliance</h2>
                  <p className="mt-1 text-sm text-slate-600">GST, TDS, ROC, payroll, and employee compliance by owner and status.</p>
                </div>
                <Link href="/business/virtual-cfo">
                  <Button className="h-10 rounded-lg bg-blue-700 text-sm font-bold text-white hover:bg-blue-800">
                    Open vCFO
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
                <div className="hidden grid-cols-5 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-500 md:grid">
                  <span>Task</span>
                  <span>Entity</span>
                  <span>Due</span>
                  <span>Owner</span>
                  <span>Status</span>
                </div>
                {complianceItems.map((item) => (
                  <div key={`${item.task}-${item.entity}`} className="grid grid-cols-1 gap-2 border-t border-slate-200 px-4 py-4 text-sm md:grid-cols-5 md:items-center">
                    <span className="font-bold text-slate-950">{item.task}</span>
                    <span className="font-mono text-xs text-slate-600">{item.entity}</span>
                    <span className="text-slate-700">{item.due}</span>
                    <span className="text-slate-700">{item.owner}</span>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-lg border-slate-200 shadow-none">
            <CardContent className="p-5">
              <h2 className="text-lg font-bold text-slate-950">Service workflow stages</h2>
              <div className="mt-4 space-y-3">
                {serviceKanban.map((stage) => (
                  <div key={stage.stage} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-950">{stage.stage}</p>
                        <p className="text-sm text-slate-500">{stage.count} active work items</p>
                      </div>
                      <StatusBadge status={stage.status} />
                    </div>
                    <Progress value={Math.min(stage.count * 12, 100)} className="mt-4 h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            ["Company records", Landmark, "CIN, PAN, TAN, GSTIN, directors, and addresses.", "/profile"],
            ["Upload evidence", FileText, "Board resolutions, invoices, challans, and notices.", "/documents"],
            ["GST returns", ReceiptText, "GSTR-1, GSTR-3B, reconciliation and notices.", "/services/gst-returns"],
          ].map(([title, Icon, description, href]) => {
            const TypedIcon = Icon as typeof CalendarDays;
            return (
              <Link key={String(title)} href={String(href)} className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-blue-300">
                <TypedIcon className="h-6 w-6 text-blue-700" />
                <h3 className="mt-3 text-base font-bold text-slate-950">{String(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{String(description)}</p>
              </Link>
            );
          })}
        </div>

        <Card className="rounded-lg border-slate-200 shadow-none">
          <CardContent className="grid gap-5 p-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <CheckCircle2 className="h-8 w-8 text-emerald-700" />
              <h2 className="mt-3 text-xl font-bold text-slate-950">Enterprise setup checklist</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep compliance predictable with named owners, source documents, and clear escalation paths.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {["GSTIN switcher", "Bulk filing tracker", "CA chat per service", "Audit-ready activity trail"].map((item) => (
                <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-800">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
