import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { track } from "@vercel/analytics";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  FileText,
  IndianRupee,
  PiggyBank,
  ReceiptText,
  Upload,
  Users,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  ComplianceShell,
  MetricCard,
  MyeCard,
  ProgressTimeline,
  SectionHeading,
  StatusBadge,
  complianceDeadlines,
  dashboardInsights,
  formatInr,
  serviceStatuses,
} from "@/components/platform/compliance-ui";

interface DashboardData {
  stats?: {
    totalReturns?: number;
    documentsUploaded?: number;
    pendingTasks?: number;
    savedAmount?: number;
  };
  recentActivity?: Array<{ id: string; description: string; date: string; type?: string }>;
  activeServices?: Array<{ id: string; name: string; status: string }>;
}

const recommendedActions = [
  {
    title: "File AY 2026-27 ITR",
    description: "Start with Form 16, then reconcile AIS before CA review.",
    href: "/itr/filing?ay=2026-27&form=ITR-1",
    icon: FileText,
  },
  {
    title: "Upload Form 16 + AIS",
    description: "Use OCR verification to avoid manual data entry errors.",
    href: "/documents",
    icon: Upload,
  },
  {
    title: "Ask AI for deductions",
    description: "Get source-backed guidance and open the right module instantly.",
    href: "/tax-assistant",
    icon: Bot,
  },
];

const activeServiceCards = [
  {
    title: "Salary ITR + CA Review",
    status: "ca_review" as const,
    owner: "Assigned CA: Priya Sharma",
    cta: "Open filing",
    href: "/itr/filing",
  },
  {
    title: "GST Registration",
    status: "action_required" as const,
    owner: "Missing address proof",
    cta: "Upload document",
    href: "/documents",
  },
  {
    title: "Refund Tracking",
    status: "refund_processed" as const,
    owner: "Expected credit: 7-10 working days",
    cta: "Track refund",
    href: "/tds-refund-tracker",
  },
];

export default function UserDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.role === "admin") {
      window.location.href = "/admin/dashboard";
    }
  }, [user, authLoading, isAuthenticated]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/";
    }
  }, [isAuthenticated, authLoading]);

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["/api/user/dashboard"],
    enabled: isAuthenticated,
    retry: 0,
  });

  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity?.length
    ? data.recentActivity
    : [
        { id: "1", description: "Form 16 upload queue is ready for OCR verification", date: "Today" },
        { id: "2", description: "Old vs New Regime analyzer prepared for FY 2025-26", date: "Yesterday" },
        { id: "3", description: "CA review SLA available once draft is submitted", date: "2 days ago" },
      ];

  return (
    <ComplianceShell
      active="/dashboard"
      title={`Welcome back${user?.firstName ? `, ${user.firstName}` : ""}`}
      subtitle="Your compliance command center brings ITR filing, document vault, deadlines, AI insights, and CA support into one calm workspace."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/itr/filing">
            <Button
              className="bg-white text-[#003087] hover:bg-blue-50"
              onClick={() => track("dashboard_start_itr")}
            >
              <FileText className="h-4 w-4" />
              Start Filing
            </Button>
          </Link>
          <Link href="/documents">
            <Button
              variant="outline"
              className="border-white/30 bg-white/10 text-white hover:bg-white/20"
              onClick={() => track("dashboard_upload_document")}
            >
              <Upload className="h-4 w-4" />
              Upload Documents
            </Button>
          </Link>
        </div>
      }
    >
      {isError && (
        <MyeCard className="mb-6 border-amber-200 bg-amber-50">
          <div className="flex gap-3 text-amber-950">
            <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
            <div>
              <p className="font-black">Live dashboard data is temporarily unavailable.</p>
              <p className="mt-1 text-sm">
                The cockpit is still usable with safe fallback states. Protected API data will sync
                automatically once the session or database is available.
              </p>
            </div>
          </div>
        </MyeCard>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tax saved this year"
          value={formatInr(stats.savedAmount || 12400)}
          helper="Estimated from declared deductions"
          icon={PiggyBank}
          tone="green"
        />
        <MetricCard
          label="Pending actions"
          value={String(stats.pendingTasks || 3)}
          helper="Documents, confirmations, CA questions"
          icon={AlertTriangle}
          tone="amber"
        />
        <MetricCard
          label="Documents uploaded"
          value={String(stats.documentsUploaded || 8)}
          helper="Stored in your private vault"
          icon={ReceiptText}
          tone="blue"
        />
        <MetricCard
          label="Returns filed"
          value={String(stats.totalReturns || 2)}
          helper="Across linked family profiles"
          icon={CheckCircle2}
          tone="slate"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <MyeCard>
          <SectionHeading
            eyebrow="Active services"
            title="Track every filing like a workflow"
            description="Statuses use one shared compliance vocabulary across ITR, GST, notices, incorporation, and document flows."
            action={
              <Link href="/services">
                <Button variant="outline">Browse Services</Button>
              </Link>
            }
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {activeServiceCards.map((service) => (
              <div key={service.title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <StatusBadge status={service.status} />
                <h3 className="mt-4 text-lg font-black text-slate-950">{service.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{service.owner}</p>
                <ProgressTimeline items={serviceStatuses} />
                <Link href={service.href}>
                  <Button
                    className="mt-5 w-full bg-[#003087] text-white hover:bg-[#082a5c]"
                    onClick={() => track("dashboard_active_service_open", { service: service.title })}
                  >
                    {service.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </MyeCard>

        <div className="space-y-6">
          <MyeCard>
            <SectionHeading eyebrow="AI insights" title="Proactive savings nudges" />
            <div className="mt-5 space-y-3">
              {dashboardInsights.map((insight, index) => (
                <div key={insight} className="rounded-2xl bg-blue-50 p-4">
                  <div className="flex items-start gap-3">
                    <Bot className="mt-1 h-5 w-5 text-[#003087]" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-700">
                        {85 + index * 3}% confidence
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">{insight}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </MyeCard>

          <MyeCard>
            <SectionHeading eyebrow="Deadlines" title="Compliance calendar" />
            <div className="mt-5 space-y-3">
              {complianceDeadlines.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-[#003087]" />
                    <div>
                      <p className="font-bold text-slate-950">{item.label}</p>
                      <p className="text-sm text-slate-500">Due {item.date}</p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </MyeCard>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <MyeCard>
          <SectionHeading eyebrow="Quick actions" title="Continue without hunting around" />
          <div className="mt-5 grid gap-3">
            {recommendedActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-[#003087] hover:bg-blue-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-[#003087] p-3 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-slate-950">{action.title}</p>
                      <p className="text-sm text-slate-600">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#003087]" />
                </Link>
              );
            })}
          </div>
        </MyeCard>

        <MyeCard>
          <SectionHeading
            eyebrow="Recent activity"
            title="A clean audit trail for every action"
            description="Every upload, AI extraction, CA note, and filing step should be traceable."
          />
          <div className="mt-5 space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#003087] ring-1 ring-slate-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{activity.description}</p>
                  <p className="mt-1 text-sm text-slate-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>
        </MyeCard>
      </div>
    </ComplianceShell>
  );
}
