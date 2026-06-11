import React from "react";
import { useParams, Link } from "wouter";
import { m } from "framer-motion";
import {
  Building2,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Phone,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Globe,
  Mail,
  Linkedin
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";

const specialists: Record<string, any> = {
  "ca-rahul-sharma": {
    name: "Tax Review Team",
    role: "Senior tax consultants",
    fullRole: "Taxation And GST Review",
    exp: "12+ Years",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    bio: "Credential-checked professionals support taxation, audit, GST, and cross-border tax compliance matters where specialist review is requested.",
    education: ["Credential details shared during scoped engagement where applicable"],
    expertise: ["GST Litigation", "Corporate Tax Planning", "International Tax Treaties", "FEMA Compliance"],
    statistics: [
      { label: "Review Type", value: "GST" },
      { label: "Support Mode", value: "Assisted" },
      { label: "Documents", value: "Required" }
    ]
  },
  "ca-priya-nair": {
    name: "Startup Compliance Team",
    role: "Company law advisors",
    fullRole: "Startup Compliance And Company Law",
    exp: "8 Years",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bio: "Advisors help founders understand incorporation, funding compliance, ROC filings, shareholder documentation, and ESOP workflows.",
    education: ["Credential details shared during scoped engagement where applicable"],
    expertise: ["Startup Funding", "ROC Filings", "Shareholder Agreements", "Intellectual Property"],
    statistics: [
      { label: "Review Type", value: "ROC" },
      { label: "Support Mode", value: "Advisory" },
      { label: "Documents", value: "Required" }
    ]
  },
  "ca-amit-verma": {
    name: "Direct Tax Team",
    role: "ITR and notice specialists",
    fullRole: "Direct Tax And Notice Review",
    exp: "15+ Years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Specialists help taxpayers respond accurately to notices, prepare filing positions, and claim eligible refunds with supporting documentation.",
    education: ["Credential details shared during scoped engagement where applicable"],
    expertise: ["ITR Filing", "Tax Scrutiny", "Notice Handling", "Tax Advisory"],
    statistics: [
      { label: "Review Type", value: "ITR" },
      { label: "Support Mode", value: "Review" },
      { label: "Documents", value: "Required" }
    ]
  }
};

export default function ExpertProfilePage() {
  const params = useParams<{ id: string }>();
  const expert = specialists[params.id?.toLowerCase() || ""];

  if (!expert) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Expert Profile Not Found</h1>
          <Link href="/experts"><Button>Back to All Experts</Button></Link>
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
        type="article"
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Experts", url: "/experts" },
          { name: expert.name, url: `/experts/${params.id}` }
        ]}
      />

      {/* Profile Header */}
      <section className="bg-slate-50 border-b pt-12 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="container mx-auto px-4">
          <Link href="/experts">
            <Button variant="ghost" className="mb-8 hover:bg-slate-200">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to experts
            </Button>
          </Link>

          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <LazyImage
                  src={expert.image}
                  alt={expert.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 font-bold border-emerald-200">
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Verified Professional
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
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 px-8 rounded-xl shadow-lg">
                  Request a Consultation
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl">
                    <Linkedin className="w-5 h-5 text-blue-600" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl">
                    <Mail className="w-5 h-5 text-slate-600" />
                  </Button>
                </div>
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
                    Professional Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {expert.statistics.map((stat: any) => (
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
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    Education & Credentials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {expert.education.map((edu: string) => (
                    <div key={edu} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700 text-sm font-medium">{edu}</span>
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
                  Core Areas of Expertise
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
                <h2 className="text-2xl font-black mb-6">Latest Articles by {expert.name.split(' ')[1]}</h2>
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
