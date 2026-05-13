import { Link } from "wouter";
import {
  BarChart,
  Bell,
  Brain,
  CheckCircle2,
  Globe,
  Lock,
  Mail,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const features = [
  {
    title: "Two-Factor Authentication",
    description: "Account-level MFA controls for stronger sign-in protection.",
    status: "Available",
    icon: Shield,
    href: "/settings/account",
  },
  {
    title: "Multi-Language Support",
    description: "Language preferences for supported account and help surfaces.",
    status: "Available",
    icon: Globe,
    href: "/settings",
  },
  {
    title: "Notifications",
    description: "In-app notifications are connected to the authenticated notification API.",
    status: "Available",
    icon: Bell,
    href: "/dashboard",
  },
  {
    title: "Email Automation",
    description: "Transactional email depends on the configured production email provider.",
    status: "Provider required",
    icon: Mail,
    href: "/admin/settings",
  },
  {
    title: "Analytics",
    description: "Production dashboards require connected telemetry and admin authorization.",
    status: "Data source required",
    icon: BarChart,
    href: "/analytics-dashboard",
  },
  {
    title: "AI Tax Assistance",
    description: "AI-assisted recommendations should be shown only when backed by a live service.",
    status: "Integration required",
    icon: Brain,
    href: "/tax-assistant",
  },
];

const operationalChecks = [
  "Private dashboards stay behind authentication and role checks.",
  "Unverified metrics are disabled in production views.",
  "Email and analytics surfaces fail visibly when providers are not configured.",
  "User-facing notification data comes from authenticated APIs.",
];

export default function AdvancedFeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Badge className="mb-4 rounded-full bg-blue-50 px-3 py-1 text-blue-700 hover:bg-blue-50">
            Production readiness
          </Badge>
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
                Advanced Features
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                A clear status view for security, notifications, analytics, automation, and AI-assisted tools.
              </p>
            </div>
            <Card className="rounded-lg border-slate-200 shadow-sm">
              <CardContent className="flex items-start gap-3 p-4">
                <Lock className="mt-0.5 h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">No unverified claims in production</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Feature cards point to real account, admin, or integration surfaces.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="rounded-lg border-slate-200 bg-white shadow-sm">
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                  <Badge variant="secondary" className="rounded-full">
                    {feature.status}
                  </Badge>
                </div>
                <div>
                  <CardTitle className="text-lg text-slate-950">{feature.title}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full justify-center rounded-lg">
                  <Link href={feature.href}>Open</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="my-8" />

        <Card className="rounded-lg border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-950">Operational Checks</CardTitle>
            <CardDescription>
              These are the production behavior guardrails currently reflected in the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {operationalChecks.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-100 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <p className="text-sm leading-6 text-slate-700">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
