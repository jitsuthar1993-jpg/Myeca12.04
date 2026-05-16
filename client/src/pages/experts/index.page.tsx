import React from "react";
import { m } from "framer-motion";
import { Link } from "wouter";
import { 
  Award, 
  CheckCircle2, 
  Linkedin, 
  MessageSquare, 
  ShieldCheck,
  Briefcase,
  GraduationCap,
  ArrowRight
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/ui/lazy-image";

const specialists = [
  {
    id: "ca-rahul-sharma",
    name: "Tax Review Team",
    role: "Senior tax consultants",
    specialty: "International Taxation & GST",
    exp: "12+ Years",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop",
    bio: "Credential-checked professionals support complex GST and cross-border tax compliance cases.",
    tags: ["GST Expert", "NRI Taxation", "Corporate Advisory"]
  },
  {
    id: "ca-priya-nair",
    name: "Startup Compliance Team",
    role: "Company law advisors",
    specialty: "Company Law & Startup Funding",
    exp: "8 Years",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    bio: "Advisors help founders understand incorporation, funding compliance, and ESOP documentation.",
    tags: ["Startup Registration", "Funding", "Compliance"]
  },
  {
    id: "ca-amit-verma",
    name: "Direct Tax Team",
    role: "ITR and notice specialists",
    specialty: "ITR Filing & Notice Handling",
    exp: "15+ Years",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
    bio: "Specialists help taxpayers respond accurately to notices and claim eligible refunds with documentation.",
    tags: ["ITR Expert", "Tax Scrutiny", "Tax Advisory"]
  }
];

export default function ExpertsIndexPage() {
  return (
    <>
      <div className="min-h-screen bg-slate-50">
      <MetaSEO
        title="Expert CA Review And Tax Advisory | MyeCA.in"
        description="Understand the review scope available from credential-checked tax, GST, and compliance professionals through MyeCA.in."
        keywords={["CA profiles", "tax experts India", "startup consultants", "certified chartered accountants"]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Experts", url: "/experts" }
        ]}
      />

      {/* Hero */}
      <section className="py-20 bg-white border-b">
        <div className="container mx-auto px-4 text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Badge className="bg-blue-100 text-blue-600 mb-6 px-4 py-1 text-sm font-bold border-blue-200">
              Verified Professionals
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Guidance from India's <br />
              <span className="text-blue-600">Top-Tier Financial Minds</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Every filing is supervised by a licensed professional. Professionalism, 
              Transparency, and Expertise at your service.
            </p>
          </m.div>
        </div>
      </section>

      {/* Specialists Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {specialists.map((expert, i) => (
              <m.div
                key={expert.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="group border-slate-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white">
                  <div className="relative h-64 overflow-hidden">
                    <LazyImage 
                      src={expert.image} 
                      alt={expert.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-0">{expert.name}</h3>
                        <p className="text-blue-300 text-xs font-bold uppercase tracking-widest">{expert.role}</p>
                      </div>
                    </div>
                  </div>

                  <CardContent className="pt-6 pb-8">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                      {expert.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 whitespace-nowrap">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed italic">
                      "{expert.bio}"
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">{expert.exp}</span>
                      </div>
                      
                      <Link href={`/experts/${expert.id}`}>
                        <Button variant="ghost" className="text-blue-600 font-bold hover:bg-blue-50 flex items-center gap-2">
                          View profile
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </m.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white border-2 border-slate-100 rounded-3xl p-10 md:p-16 text-center text-slate-900 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h2 className="text-3xl font-black mb-6 text-slate-900">Our Experts are Your Advantage</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: ShieldCheck, title: "Credential Checked", desc: "Qualification details reviewed" },
                { icon: Award, title: "Scope-Led Review", desc: "Matched to the service need" },
                { icon: MessageSquare, title: "Direct Contact", desc: "Consult directly with the pro" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="font-bold text-lg mb-1 text-slate-900">{item.title}</div>
                  <div className="text-sm text-slate-500 font-medium">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
