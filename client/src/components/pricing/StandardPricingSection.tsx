import { ArrowRight, CheckCircle2, Clock, FileText, Info, ShieldCheck, XCircle } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  formatINR,
  formatPricingLabel,
  getCheckoutAmount,
  getGstNote,
  type PricingPlan,
  type PricingSectionProps,
  type ServicePricing,
} from "@/data/pricing";

interface StandardPricingSectionExtraProps extends PricingSectionProps {
  className?: string;
  onCheckout?: (service: ServicePricing) => void;
}

export default function StandardPricingSection({
  mode = "plan-grid",
  title,
  description,
  plans = [],
  service,
  className,
  onCheckout,
}: StandardPricingSectionExtraProps) {
  if (mode === "service-package" && service) {
    return (
      <section id="pricing" className={cn("scroll-mt-24 py-14", className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {(title || description) && (
            <SectionHeader
              eyebrow="Transparent pricing"
              title={title || `${service.name} pricing`}
              description={description || service.audience}
            />
          )}
          <ServicePackageCard service={service} onCheckout={onCheckout} />
        </div>
      </section>
    );
  }

  if (mode === "fee-breakdown" && service) {
    return (
      <section id="pricing" className={cn("scroll-mt-24 py-14", className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Fee clarity"
            title={title || `${service.name} fee breakdown`}
            description={description || "Government, statutory, and professional fees are separated before checkout."}
          />
          <FeeBreakdownCard service={service} onCheckout={onCheckout} />
        </div>
      </section>
    );
  }

  return (
    <section id="pricing" className={cn("scroll-mt-24 py-14", className)}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Transparent pricing"
          title={title || "Plans mapped to real tax complexity"}
          description={description || "Every plan shows scope, CA touchpoints, GST visibility, timeline, and exclusions before checkout."}
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function StandardPricingCompactCard({ service }: { service: ServicePricing }) {
  return (
    <div className="rounded-lg border border-blue-100 bg-[#F8FAFC] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="type-meta font-black uppercase tracking-widest text-slate-400">Price</p>
          <p className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">{formatPricingLabel(service.pricing)}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">{getGstNote(service.pricing)}</p>
        </div>
        {service.badge && <Badge className="bg-blue-50 text-blue-700">{service.badge}</Badge>}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs font-bold text-slate-500">
        <Clock className="h-3.5 w-3.5 text-blue-600" />
        {service.timeline}
      </div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-9 max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-700">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h2>
      <p className="mt-4 text-sm leading-7 text-slate-600 md:text-base">{description}</p>
    </div>
  );
}

function PlanCard({ plan }: { plan: PricingPlan }) {
  const Icon = plan.icon;
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-lg border-slate-200 shadow-sm hover:border-blue-100",
        plan.featured && "border-blue-500 shadow-lg shadow-blue-100/70"
      )}
    >
      <CardContent className="flex h-full flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
            <Icon className="h-6 w-6" />
          </div>
          {plan.badge && (
            <Badge className={plan.featured ? "border-blue-100 bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-700"}>
              {plan.badge}
            </Badge>
          )}
        </div>
        <h3 className="mt-5 text-2xl font-extrabold text-slate-900">{plan.name}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{plan.audience}</p>
        <PriceBlock pricing={plan.pricing} />
        <FeatureList items={plan.included} />
        <ScopeBox caTouchpoints={plan.caTouchpoints} sla={plan.sla} />
        <ExclusionList items={plan.exclusions} />
        <PlanCta plan={plan} />
      </CardContent>
    </Card>
  );
}

function ServicePackageCard({
  service,
  onCheckout,
}: {
  service: ServicePricing;
  onCheckout?: (service: ServicePricing) => void;
}) {
  const checkoutAmount = getCheckoutAmount(service.pricing);
  const Icon = service.icon || ShieldCheck;

  return (
    <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm">
      <CardContent className="grid gap-8 p-6 lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
        <div>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-blue-50 p-4 text-blue-700">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400">{service.category}</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{service.name}</h3>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-600">{service.audience}</p>
          <PriceBlock pricing={service.pricing} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoPill icon={Clock} label="Timeline" value={service.timeline} />
            <InfoPill icon={ShieldCheck} label="CA touchpoint" value={service.caTouchpoints} />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {checkoutAmount ? (
              <Button variant="brand" className="rounded-lg" onClick={() => onCheckout?.(service)}>
                {service.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : service.primaryCta.href ? (
              <Link href={service.primaryCta.href}>
                <Button variant="brand" className="rounded-lg">
                  {service.primaryCta.label}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : null}
            <Link href={service.consultationCta.href || "/expert-consultation"}>
              <Button variant="outline">{service.consultationCta.label}</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <DetailPanel title="Included" items={service.included} />
          <DetailPanel title="Documents Needed" items={service.documents} icon="doc" />
          <DetailPanel title="Exclusions" items={service.exclusions} muted />
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
            <Info className="h-5 w-5 text-blue-700" />
            <h4 className="mt-3 font-extrabold text-slate-900">Scope note</h4>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Starting prices apply to standard cases. Any government fees, extra classes, hearings, audits, or out-of-scope work are confirmed before payment.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FeeBreakdownCard({
  service,
  onCheckout,
}: {
  service: ServicePricing;
  onCheckout?: (service: ServicePricing) => void;
}) {
  const government = service.feeBreakdown?.government || [];
  const professional = service.feeBreakdown?.professional || [];

  return (
    <Card className="rounded-lg border-slate-200 shadow-sm">
      <CardContent className="grid gap-6 p-6 md:grid-cols-3 lg:p-8">
        <FeeColumn title="Government / Statutory Fees" items={government} tone="red" />
        <FeeColumn title="MyeCA Professional Fees" items={professional} tone="blue" />
        <div className="rounded-lg border border-blue-100 bg-[#F8FAFC] p-5">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Checkout starts at</p>
          <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatPricingLabel(service.pricing)}</p>
          <p className="mt-2 text-sm font-bold text-slate-500">{getGstNote(service.pricing)}</p>
          <Button variant="brand" className="mt-6 w-full rounded-lg" onClick={() => onCheckout?.(service)}>
            {service.primaryCta.label}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PriceBlock({ pricing }: { pricing: PricingPlan["pricing"] | ServicePricing["pricing"] }) {
  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-baseline gap-2">
        <p className="break-words text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{formatPricingLabel(pricing)}</p>
        {pricing.originalAmount && (
          <span className="text-sm font-bold text-slate-400 line-through">{formatINR(pricing.originalAmount)}</span>
        )}
      </div>
      <p className="mt-2 text-xs font-black uppercase tracking-widest text-slate-400">{getGstNote(pricing)}</p>
      {pricing.unit && <p className="mt-1 text-xs font-semibold text-slate-500">{pricing.unit}</p>}
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <div className="mt-6 space-y-3">
      {items.map((item) => (
        <div key={item} className="flex gap-3 text-sm font-semibold text-slate-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          {item}
        </div>
      ))}
    </div>
  );
}

function ExclusionList({ items }: { items: string[] }) {
  return (
    <div className="mt-5 space-y-2">
      <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
        <Info className="h-4 w-4" />
        Exclusions
      </p>
      {items.map((item) => (
        <div key={item} className="flex gap-2 text-xs font-semibold text-slate-500">
          <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300" />
          {item}
        </div>
      ))}
    </div>
  );
}

function ScopeBox({ caTouchpoints, sla }: { caTouchpoints: string; sla: string }) {
  return (
    <div className="mt-6 rounded-lg border border-slate-100 bg-[#F8FAFC] p-4">
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">CA touchpoint</p>
      <p className="mt-2 text-sm font-bold text-slate-800">{caTouchpoints}</p>
      <p className="mt-3 text-xs font-black uppercase tracking-widest text-slate-400">SLA</p>
      <p className="mt-2 text-sm font-bold text-slate-800">{sla}</p>
    </div>
  );
}

function PlanCta({ plan }: { plan: PricingPlan }) {
  const content = (
    <div>
      <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
        {plan.cta.label}
        <ArrowRight className="h-4 w-4" />
      </Button>
      <p className="mt-2 text-center text-xs font-semibold leading-5 text-slate-500">
        Scope before payment. Refund outcomes are not guaranteed.
      </p>
    </div>
  );

  return plan.cta.href ? (
    <Link href={plan.cta.href} className="mt-auto pt-6">
      {content}
    </Link>
  ) : (
    <div className="mt-auto pt-6">{content}</div>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-[#F8FAFC] p-4">
      <Icon className="h-4 w-4 text-blue-700" />
      <p className="mt-2 type-meta font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function DetailPanel({
  title,
  items,
  muted = false,
  icon,
}: {
  title: string;
  items: string[];
  muted?: boolean;
  icon?: "doc";
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h4 className="font-extrabold text-slate-900">{title}</h4>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex gap-3 text-sm font-semibold text-slate-700">
            {muted ? (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
            ) : icon === "doc" ? (
              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            )}
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function FeeColumn({
  title,
  items,
  tone,
}: {
  title: string;
  items: Array<{ label: string; amount: number; note?: string }>;
  tone: "red" | "blue";
}) {
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h4 className="font-extrabold text-slate-900">{title}</h4>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm font-semibold text-slate-500">Confirmed during scope review.</p>
        ) : (
          items.map((item) => (
            <div key={item.label} className="rounded-lg bg-[#F8FAFC] p-3">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-bold text-slate-700">{item.label}</span>
                <span className={cn("font-black", tone === "red" ? "text-red-600" : "text-blue-700")}>
                  {formatINR(item.amount)}
                </span>
              </div>
              {item.note && <p className="mt-1 text-xs font-semibold text-slate-500">{item.note}</p>}
            </div>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-slate-900">Subtotal</span>
            <span className="text-lg font-extrabold text-slate-900">{formatINR(total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
