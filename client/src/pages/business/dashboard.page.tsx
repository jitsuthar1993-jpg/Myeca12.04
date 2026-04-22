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
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ComplianceShell,
  MetricCard,
  MyeCard,
  SectionHeading,
  StatusBadge,
} from "@/components/platform/compliance-ui";

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

export default function BusinessDashboardPage() {
  return (
    <ComplianceShell
      active="/business/dashboard"
      title="Enterprise compliance dashboard"
      subtitle="A multi-tenant command center for GSTINs, TDS, ROC, payroll compliance, document workflows, and CA-led service tracking."
      actions={
        <Select defaultValue={companies[0]}>
          <SelectTrigger className="w-full border-white/25 bg-white/10 text-white sm:w-[360px]">
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
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Compliance score" value="86%" helper="Up 8 points after GST cleanup" icon={ShieldCheck} tone="green" />
        <MetricCard label="Pending filings" value="5" helper="2 due this week" icon={AlertTriangle} tone="amber" />
        <MetricCard label="Linked GSTINs" value="3" helper="Across two entities" icon={Building2} tone="blue" />
        <MetricCard label="Team members" value="14" helper="Role-aware collaboration" icon={Users} tone="slate" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <MyeCard>
          <SectionHeading
            eyebrow="Bulk tracker"
            title="Monthly statutory compliance"
            description="Dense, sortable table pattern for GST, TDS, ROC, payroll, and employee compliance."
            action={
              <Link href="/business/virtual-cfo">
                <Button className="bg-[#315efb] text-white hover:bg-[#082a5c]">
                  Open vCFO
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            }
          />
          <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
            <div className="grid grid-cols-5 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500">
              <span>Task</span>
              <span>Entity</span>
              <span>Due</span>
              <span>Owner</span>
              <span>Status</span>
            </div>
            {complianceItems.map((item) => (
              <div key={`${item.task}-${item.entity}`} className="grid grid-cols-1 gap-3 border-t border-slate-200 px-4 py-4 text-sm md:grid-cols-5 md:items-center">
                <span className="font-black text-slate-950">{item.task}</span>
                <span className="font-mono text-xs text-slate-600">{item.entity}</span>
                <span className="text-slate-700">{item.due}</span>
                <span className="text-slate-700">{item.owner}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </MyeCard>

        <MyeCard>
          <SectionHeading eyebrow="Kanban" title="Service workflow stages" />
          <div className="mt-5 space-y-4">
            {serviceKanban.map((stage) => (
              <div key={stage.stage} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-950">{stage.stage}</p>
                    <p className="text-sm text-slate-500">{stage.count} active work items</p>
                  </div>
                  <StatusBadge status={stage.status} />
                </div>
                <Progress value={Math.min(stage.count * 12, 100)} className="mt-4 h-2" />
              </div>
            ))}
          </div>
        </MyeCard>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          ["Company records", Landmark, "CIN, PAN, TAN, GSTIN, directors, and addresses.", "/profile"],
          ["Upload evidence", FileText, "Board resolutions, invoices, challans, and notices.", "/documents"],
          ["GST returns", ReceiptText, "GSTR-1, GSTR-3B, reconciliation and notices.", "/services/gst-returns"],
        ].map(([title, Icon, description, href]) => {
          const TypedIcon = Icon as typeof CalendarDays;
          return (
            <Link key={String(title)} href={String(href)} className="rounded-[28px] border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-[#315efb]">
              <TypedIcon className="h-8 w-8 text-[#315efb]" />
              <h3 className="mt-4 text-xl font-black text-slate-950">{String(title)}</h3>
              <p className="mt-2 text-slate-600">{String(description)}</p>
              <div className="mt-5 flex items-center gap-2 font-black text-[#315efb]">
                Open module
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          );
        })}
      </div>

      <MyeCard className="mt-6 bg-gradient-to-br from-emerald-50 to-blue-50">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <CheckCircle2 className="h-10 w-10 text-emerald-800" />
            <h2 className="mt-4 text-3xl font-black text-slate-950">Enterprise setup checklist</h2>
            <p className="mt-3 text-slate-600">
              Multi-tenant compliance should feel boring in the best possible way: predictable states,
              named owners, source documents, and clear escalation paths.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["GSTIN switcher", "Bulk filing tracker", "CA chat per service", "Audit-ready activity trail"].map((item) => (
              <div key={item} className="rounded-2xl bg-white p-4 font-black text-slate-800 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </MyeCard>
    </ComplianceShell>
  );
}
