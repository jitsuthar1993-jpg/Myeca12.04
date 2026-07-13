import React from "react";
import { useParams, Link } from "wouter";
import { m } from "framer-motion";
import {
  Building2,
  MapPin,
  CheckCircle,
  Phone,
  TrendingUp
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildConsultationHref } from "@/lib/consultation-handoff";

const cityData: Record<string, { name: string }> = {
  bangalore: { name: "Bangalore" },
  mumbai: { name: "Mumbai" },
  delhi: { name: "Delhi" },
  hyderabad: { name: "Hyderabad" },
  chennai: { name: "Chennai" }
};

const serviceData: Record<string, { title: string; desc: string; icon: any }> = {
  "company-registration": {
    title: "Company Registration",
    desc: "Private Limited and LLP incorporation support with document, fee, and authority checks.",
    icon: Building2
  },
  "gst-registration": {
    title: "GST Registration",
    desc: "Prepare a GST registration application with document and filing-scope support.",
    icon: TrendingUp
  }
};

export default function CityLandingPage() {
  const params = useParams<{ service: string; city: string }>();
  const cityKey = params.city?.toLowerCase() || "";
  const serviceKey = params.service?.toLowerCase() || "";

  const city = cityData[cityKey];
  const service = serviceData[serviceKey];
  const consultationHref = buildConsultationHref("business-tax-review", {
    source: "city-landing",
    serviceArea: serviceKey,
    city: cityKey,
  });

  if (!city || !service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Service or City not found</h1>
          <Link href="/services"><Button>Back to Services</Button></Link>
        </div>
      </div>
    );
  }

  const pageTitle = `${service.title} in ${city.name} | Filing and Compliance Support`;
  const pageDesc = `Prepare ${service.title} for a ${city.name}-based business with document checks, filing scope, and submission follow-up.`;

  return (
    <div className="min-h-screen bg-white">
      <MetaSEO
        title={pageTitle}
        description={pageDesc}
        keywords={[
          `${service.title} in ${city.name}`,
          `business registration ${city.name}`,
          `company incorporation ${city.name}`
        ]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Services", url: "/services" },
          { name: service.title, url: `/services/${serviceKey}` },
          { name: city.name, url: `/services/${serviceKey}/${cityKey}` }
        ]}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-blue-100 bg-gradient-to-br from-white via-blue-50/70 to-slate-50 py-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-100/60 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <m.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-white text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-6 border border-blue-100 shadow-sm"
            >
              <MapPin className="w-4 h-4" />
              Online filing support for {city.name}
            </m.div>

            <h1 className="type-page-title mb-6 text-slate-950">
              <span className="text-blue-600">{service.title}</span>
              <br />Support for <span className="underline decoration-blue-300 underline-offset-8">{city.name}</span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
              Prepare the application, confirm the responsible authority, and agree the filing and follow-up scope for a business based in {city.name}.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={consultationHref}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-14 rounded-xl text-lg font-bold shadow-xl shadow-blue-500/20">
                  Discuss Filing Scope
                  <Phone className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50 px-8 h-14 rounded-xl text-lg font-bold">
                  Review Service Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Filing Scope Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-6 tracking-tight">
                What to confirm before filing
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                The correct route can depend on the business activity, premises, entity type, and responsible authority.
                Confirm the current portal, documents, fees, and follow-up responsibility before filing.
              </p>

              <div className="space-y-4">
                {[
                  "Responsible authority and online filing portal",
                  "Entity, promoter, and premises documents",
                  "Current government fees and state stamp duty, where applicable",
                  "Submission and query follow-up included in the agreed scope"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-blue-50 border-blue-100">
                <CardContent className="pt-8">
                  <div className="text-4xl font-black text-blue-600 mb-2">Online</div>
                  <div className="text-sm font-bold text-slate-600">Support Channel</div>
                </CardContent>
              </Card>
              <Card className="bg-purple-50 border-purple-100">
                <CardContent className="pt-8">
                  <div className="text-4xl font-black text-purple-600 mb-2">Scope</div>
                  <div className="text-sm font-bold text-slate-600">Agreed Before Payment</div>
                </CardContent>
              </Card>
              <Card className="bg-orange-50 border-orange-100">
                <CardContent className="pt-8">
                  <div className="text-4xl font-black text-orange-600 mb-2">Docs</div>
                  <div className="text-sm font-bold text-slate-600">Document-Based Review</div>
                </CardContent>
              </Card>
              <Card className="bg-emerald-50 border-emerald-100">
                <CardContent className="pt-8">
                  <div className="text-4xl font-black text-emerald-600 mb-2">Status</div>
                  <div className="text-sm font-bold text-slate-600">Follow-up Records</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Case Details */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
              Details that shape the filing route
            </h2>
            <p className="text-lg text-slate-600">
              City alone does not determine the correct application or supporting records.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {["Business activity", "Entity and promoters", "Registered premises", "Responsible authority"].map((area) => (
              <div key={area} className="bg-white p-6 rounded-2xl border border-slate-200 text-center hover:shadow-md transition-shadow">
                <div className="font-bold text-slate-900 mb-1">{area}</div>
                <div className="text-xs text-blue-500 font-bold uppercase tracking-widest">Confirm for your case</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Card className="border-blue-100 bg-gradient-to-br from-white to-blue-50 overflow-hidden relative shadow-lg shadow-blue-900/5">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/60 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <CardContent className="p-12 text-center relative z-10">
              <h2 className="type-section-title mb-6 text-slate-950">
                Ready to Start your Business in {city.name}?
              </h2>
              <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
                Start the {service.title} workflow for a {city.name}-based business with a document and authority-requirement check.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={consultationHref}>
                  <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700 font-black h-14 px-10 rounded-xl transition-all hover:scale-105">
                    Request Consultation
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50 font-black h-14 px-10 rounded-xl">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
