import { Link } from "wouter";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Download,
  IndianRupee,
  PiggyBank,
  ReceiptText,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ComplianceShell,
  MetricCard,
  MyeCard,
  SectionHeading,
  StatusBadge,
  formatInr,
} from "@/components/platform/compliance-ui";

const monthlyRevenueData = [
  { month: "Apr", revenue: 850000, expenses: 620000, profit: 230000 },
  { month: "May", revenue: 920000, expenses: 680000, profit: 240000 },
  { month: "Jun", revenue: 780000, expenses: 590000, profit: 190000 },
  { month: "Jul", revenue: 1050000, expenses: 720000, profit: 330000 },
  { month: "Aug", revenue: 980000, expenses: 710000, profit: 270000 },
  { month: "Sep", revenue: 1120000, expenses: 780000, profit: 340000 },
  { month: "Oct", revenue: 1200000, expenses: 820000, profit: 380000 },
  { month: "Nov", revenue: 1350000, expenses: 890000, profit: 460000 },
];

const expenseBreakdown = [
  { name: "Salaries", value: 450000, color: "#003087" },
  { name: "Rent & utilities", value: 120000, color: "#047857" },
  { name: "Marketing", value: 80000, color: "#d97706" },
  { name: "Technology", value: 95000, color: "#2563eb" },
  { name: "Operations", value: 145000, color: "#dc2626" },
];

const anomalies = [
  { item: "Cloud spend rose 18%", impact: "₹45,000", status: "action_required" as const },
  { item: "Receivable ageing above 45 days", impact: "₹4.2L", status: "in_progress" as const },
  { item: "GST input mismatch", impact: "₹18,400", status: "ca_review" as const },
];

export default function VirtualCFOPage() {
  const totalRevenue = monthlyRevenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalExpenses = monthlyRevenueData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProfit = totalRevenue - totalExpenses;
  const margin = Math.round((totalProfit / totalRevenue) * 100);

  return (
    <ComplianceShell
      active="/business/virtual-cfo"
      title="Virtual CFO"
      subtitle="Live finance telemetry for P&L, cash flow, expense anomalies, receivables, GST risk, and management reporting."
      actions={
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select defaultValue="month">
            <SelectTrigger className="border-white/25 bg-white/10 text-white sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-white text-[#003087] hover:bg-blue-50">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      }
    >
      <Link href="/business/dashboard" className="mb-4 inline-flex items-center gap-2 font-bold text-[#003087]">
        <ArrowLeft className="h-4 w-4" />
        Back to business dashboard
      </Link>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Revenue YTD" value={formatInr(totalRevenue)} helper="+12.5% vs last year" icon={TrendingUp} tone="green" />
        <MetricCard label="Expenses YTD" value={formatInr(totalExpenses)} helper="+8.2% vs last year" icon={Wallet} tone="amber" />
        <MetricCard label="Net profit" value={formatInr(totalProfit)} helper={`${margin}% EBITDA-style margin`} icon={PiggyBank} tone="blue" />
        <MetricCard label="Cash conversion" value="42 days" helper="7 days slower than target" icon={IndianRupee} tone="slate" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <MyeCard>
          <SectionHeading
            eyebrow="P&L trend"
            title="Revenue, expenses, and profit velocity"
            description="Click-through drill-down patterns should trace anomalies back to invoice, department, or vendor."
          />
          <div className="mt-6 h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#003087" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#003087" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="profit" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${Number(value) / 100000}L`} />
                <Tooltip formatter={(value) => formatInr(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#003087" strokeWidth={3} fill="url(#revenue)" />
                <Area type="monotone" dataKey="profit" stroke="#047857" strokeWidth={3} fill="url(#profit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </MyeCard>

        <MyeCard>
          <SectionHeading eyebrow="Expense mix" title="Where money moves" />
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96}>
                  {expenseBreakdown.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatInr(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {expenseBreakdown.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span className="font-bold text-slate-700">{item.name}</span>
                <span>{formatInr(item.value)}</span>
              </div>
            ))}
          </div>
        </MyeCard>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <MyeCard>
          <SectionHeading eyebrow="Anomaly watch" title="AI + CA review queue" />
          <div className="mt-5 space-y-3">
            {anomalies.map((item) => (
              <div key={item.item} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-slate-950">{item.item}</p>
                    <p className="mt-1 text-sm text-slate-600">Estimated impact: {item.impact}</p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-amber-700" />
                </div>
                <StatusBadge status={item.status} className="mt-4" />
              </div>
            ))}
          </div>
        </MyeCard>

        <MyeCard>
          <SectionHeading eyebrow="Budget variance" title="Budget vs actual" />
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { category: "Revenue", budget: 1300000, actual: 1350000 },
                { category: "Salaries", budget: 460000, actual: 450000 },
                { category: "Marketing", budget: 100000, actual: 80000 },
                { category: "Ops", budget: 140000, actual: 145000 },
                { category: "Tech", budget: 90000, actual: 95000 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => `₹${Number(value) / 100000}L`} />
                <Tooltip formatter={(value) => formatInr(Number(value))} />
                <Bar dataKey="budget" fill="#bfdbfe" radius={[8, 8, 0, 0]} />
                <Bar dataKey="actual" fill="#003087" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MyeCard>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          ["Revenue growth rate", "+12.5%", ArrowUpRight, "text-emerald-800"],
          ["Gross profit margin", "42%", ArrowUpRight, "text-emerald-800"],
          ["Expense creep", "+8.2%", ArrowDownRight, "text-amber-800"],
        ].map(([label, value, Icon, tone]) => {
          const TypedIcon = Icon as typeof ReceiptText;
          return (
            <div key={String(label)} className="rounded-[24px] border border-slate-200 bg-white p-5">
              <TypedIcon className={`h-6 w-6 ${String(tone)}`} />
              <p className="mt-3 text-sm font-semibold text-slate-500">{String(label)}</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{String(value)}</p>
            </div>
          );
        })}
      </div>
    </ComplianceShell>
  );
}
