import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Archive,
  ArrowRight,
  Award,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  FileText,
  Globe2,
  Hash,
  Home,
  IdCard,
  KeyRound,
  Landmark,
  Lightbulb,
  LineChart,
  MessagesSquare,
  Receipt,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { m } from "framer-motion";
import MetaSEO from "@/components/seo/MetaSEO";
import StandardPricingSection from "@/components/pricing/StandardPricingSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ServiceCheckoutModal } from "@/components/services/ServiceCheckoutModal";
import { findGeneratedServicePage } from "@/data/missing-pages";
import { getCheckoutAmount, getPricingByServiceId, getServicePriceForSchema, type ServicePricing } from "@/data/pricing";

const icons = {
  Archive,
  Award,
  BadgeCheck,
  Briefcase,
  FileText,
  Globe2,
  Hash,
  Home,
  IdCard,
  KeyRound,
  Landmark,
  Lightbulb,
  LineChart,
  MessagesSquare,
  Receipt,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Users,
};

export default function GeneratedServicePage() {
  const [location] = useLocation();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const slug = location.split("?")[0].split("/").filter(Boolean).pop() || "";
  const page = findGeneratedServicePage(slug);

  if (!page) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge className="mb-4 bg-blue-50 text-blue-700">Service directory</Badge>
          <h1 className="text-4xl font-black text-slate-950">Service page is being prepared</h1>
          <p className="mt-4 text-slate-600">
            This service is not available as a dedicated page yet. You can still explore the full service marketplace or talk to an expert.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/services/marketplace">
              <Button>Explore marketplace</Button>
            </Link>
            <Link href="/expert-consultation">
              <Button variant="outline">Talk to an expert</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const Icon = icons[page.icon as keyof typeof icons] || FileText;
  const servicePricing: ServicePricing = getPricingByServiceId(page.slug) || {
    id: page.slug,
    name: page.title,
    category: page.category,
    audience: page.description,
    pricing: { qualifier: "starting", amount: page.priceAmount, gstTreatment: "excluding" },
    icon: Icon,
    included: page.highlights,
    exclusions: ["Government fees unless stated", "Out-of-scope advisory or filing work", "Representation or hearing attendance unless scoped"],
    documents: page.documents,
    timeline: page.timeline,
    caTouchpoints: "MyeCA expert confirms scope, documents, and next steps before execution.",
    primaryCta: { label: "Start service", checkout: true },
    consultationCta: { label: "Consult expert", href: `/expert-consultation?service=${page.slug}` },
  };
  const checkoutAmount = getCheckoutAmount(servicePricing.pricing) || page.priceAmount;

  return (
    <main className="min-h-screen bg-white">
      <MetaSEO
        title={`${page.title} | MyeCA.in`}
        description={page.description}
        keywords={[page.title, page.category, "MyeCA services", "CA assisted services"]}
        type="service"
        serviceData={{
          price: getServicePriceForSchema(page.slug, page.priceAmount),
          rating: "4.8",
          reviews: "500",
          availability: "https://schema.org/InStock",
        }}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: page.title, url: `/services/${page.slug}` },
        ]}
        faqPageData={page.faqs}
      />

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.1fr_0.9fr] md:px-6 lg:px-8">
          <div>
            <Badge className="mb-5 border-blue-100 bg-blue-50 text-blue-700">{page.subtitle}</Badge>
            <h1 className="text-4xl font-black tracking-tight text-slate-950 md:text-6xl">{page.title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{page.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setIsCheckoutOpen(true)}>
                Start service
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Link href={`/expert-consultation?service=${page.slug}`}>
                <Button size="lg" variant="outline">
                  Consult expert
                </Button>
              </Link>
            </div>
          </div>

          <Card className="rounded-[28px] border-slate-200 bg-white shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-blue-50 p-4 text-blue-700">
                  <Icon className="h-8 w-8" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Service package</p>
                  <h2 className="text-2xl font-black text-slate-950">{page.priceLabel}</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">{page.timeline}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {page.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <StandardPricingSection
        mode="service-package"
        title={`${servicePricing.name} pricing`}
        description="Review inclusions, exclusions, documents, GST treatment, timeline, and expert touchpoints before checkout."
        service={servicePricing}
        onCheckout={() => setIsCheckoutOpen(true)}
      />

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 md:grid-cols-3 md:px-6 lg:px-8">
        <InfoPanel title="Documents We Check" items={page.documents} />
        <InfoPanel title="How It Works" items={page.process} ordered />
        <InfoPanel title="Related Services" items={page.relatedLinks.map((link) => link.label)} links={page.relatedLinks} />
      </section>

      <section className="border-t border-slate-100 bg-slate-50 py-14">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-black text-slate-950">Get the paperwork right before deadlines get noisy</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            MyeCA keeps the workflow simple: expert review, clear document requests, and status updates from intake to completion.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsCheckoutOpen(true)}>
              Start now
            </Button>
            <Link href="/services">
              <Button size="lg" variant="outline">
                Browse all services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <ServiceCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        serviceId={page.slug}
        serviceTitle={page.title}
        category={page.category}
        priceAmount={checkoutAmount}
      />
    </main>
  );
}

function InfoPanel({
  title,
  items,
  ordered = false,
  links,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
  links?: Array<{ label: string; href: string }>;
}) {
  return (
    <m.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
      <Card className="h-full rounded-[24px] border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <div className="mt-5 space-y-3">
            {items.map((item, index) => {
              const maybeLink = links?.find((link) => link.label === item);
              const content = maybeLink ? (
                <Link href={maybeLink.href} className="font-bold text-blue-700 hover:text-blue-800">
                  {item}
                </Link>
              ) : (
                <span>{item}</span>
              );
              return (
                <div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-blue-700">
                    {ordered ? index + 1 : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  </span>
                  {content}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}
