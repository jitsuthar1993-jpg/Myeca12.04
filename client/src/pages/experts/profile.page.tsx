import React from "react";
import { useParams, Link } from "wouter";
import { m } from "framer-motion";
import {
  Building2,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  ClipboardCheck
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buildConsultationHref } from "@/lib/consultation-handoff";

const specialists: Record<string, any> = {
  "ca-rahul-sharma": {
    name: "Tax Review Team",
    consultationTeam: "tax-gst-review",
    consultationService: "tax-consultation",
    role: "Tax consultation service",
    fullRole: "Taxation And GST Review",
    bio: "Use this service to discuss taxation, GST, and cross-border compliance questions against a defined document set.",
    engagementNotes: ["The question, deliverable, document list, and fee are confirmed before paid work begins"],
    expertise: ["GST Litigation", "Corporate Tax Planning", "International Tax Treaties", "FEMA Compliance"],
    details: [
      { label: "Review Type", value: "GST" },
      { label: "Support Mode", value: "Assisted" },
      { label: "Documents", value: "Required" }
    ]
  },
  "ca-priya-nair": {
    name: "Startup Compliance Team",
    consultationTeam: "startup-compliance-review",
    consultationService: "business-tax-review",
    role: "Startup compliance service",
    fullRole: "Startup Compliance And Company Law",
    bio: "Use this service to discuss incorporation, funding compliance, ROC filings, shareholder documents, and ESOP workflows.",
    engagementNotes: ["The question, deliverable, document list, and fee are confirmed before paid work begins"],
    expertise: ["Startup Funding", "ROC Filings", "Shareholder Agreements", "Intellectual Property"],
    details: [
      { label: "Review Type", value: "ROC" },
      { label: "Support Mode", value: "Advisory" },
      { label: "Documents", value: "Required" }
    ]
  },
  "ca-amit-verma": {
    name: "Direct Tax Team",
    consultationTeam: "direct-tax-review",
    consultationService: "tax-consultation",
    role: "Direct tax consultation service",
    fullRole: "Direct Tax And Notice Review",
    bio: "Use this service to discuss an ITR position, notice deadline, supporting records, and the next filing step.",
    engagementNotes: ["The question, deliverable, document list, and fee are confirmed before paid work begins"],
    expertise: ["ITR Filing", "Tax Scrutiny", "Notice Handling", "Tax Advisory"],
    details: [
      { label: "Review Type", value: "ITR" },
      { label: "Support Mode", value: "Review" },
      { label: "Documents", value: "Required" }
    ]
  }
};

const specialistRoutes: Record<string, any> = {
  "tax-gst-review": specialists["ca-rahul-sharma"],
  "startup-compliance-review": specialists["ca-priya-nair"],
  "direct-tax-review": specialists["ca-amit-verma"],
  ...specialists
};

export default function ExpertProfilePage() {
  const params = useParams<{ id: string }>();
  const expert = specialistRoutes[params.id?.toLowerCase() || ""];

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Review Service Not Found</h1>
          <Link href="/experts"><Button>Back to Review Services</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white">
      <MetaSEO
        title={`${expert.name} - ${expert.role} | MyeCA.in`}
        description={expert.bio.substring(0, 160)}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Experts", url: "/experts" },
          { name: expert.name, url: `/experts/${params.id}` }
        ]}
      />

      {/* Service Header */}
      <section className="bg-slate-50 border-b pt-12 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="container mx-auto px-4">
          <Link href="/experts">
            <Button variant="ghost" className="mb-8 hover:bg-slate-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to review services
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="flex aspect-square items-center justify-center rounded-3xl border-8 border-white bg-slate-900 shadow-2xl">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-blue-500/15">
                  <Building2 className="h-14 w-14 text-blue-300" />
                </div>
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 font-bold border-emerald-200">
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Scope-Based Service
                </Badge>
              </div>

              <h1 className="type-page-title text-slate-900 mb-2">
                {expert.name}
              </h1>
              <p className="text-xl font-bold text-blue-600 mb-6">{expert.fullRole}</p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                {expert.bio}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href={buildConsultationHref(expert.consultationService, {
                  source: "expert-profile",
                  team: expert.consultationTeam,
                })}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-xl shadow-lg">
                    Request a Consultation
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Details Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">

            {/* Left Column: Stats & Education */}
            <div className="lg:col-span-1 space-y-8">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Engagement Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {expert.details.map((stat: any) => (
                    <div key={stat.label}>
                      <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                      <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-black flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-blue-600" />
                    Before You Book
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {expert.engagementNotes.map((note: string) => (
                    <div key={note} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm font-medium">{note}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Expertise */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                  <Briefcase className="w-6 h-6 text-blue-600" />
                  Review Areas
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {expert.expertise.map((exp: string) => (
                    <div key={exp} className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="font-bold text-slate-800">{exp}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-black mb-6">Related Tax Guides</h2>
                <div className="space-y-4">
                  {[
                    "New GST Compliance Changes for April 2025",
                    "A Founder's Guide to Equity Structuring in India"
                  ].map((article) => (
                    <Link key={article} href="/blog">
                      <div className="p-6 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all flex justify-between items-center group cursor-pointer bg-white">
                        <span className="font-bold text-slate-700">{article}</span>
                        <ArrowRight className="w-5 h-5 text-blue-500 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
      </div>
    </>
  );
}

function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
