import React from "react";
import { m } from "framer-motion";
import { Link } from "wouter";
import {
  Award,
  MessageSquare,
  Briefcase,
  ArrowRight
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const specialists = [
  {
    id: "tax-gst-review",
    name: "Tax Review Team",
    role: "International tax and GST review",
    bio: "Discuss GST and cross-border tax compliance questions against a defined document set.",
    tags: ["GST Expert", "NRI Taxation", "Corporate Advisory"]
  },
  {
    id: "startup-compliance-review",
    name: "Startup Compliance Team",
    role: "Company law and startup review",
    bio: "Discuss incorporation, funding compliance, and ESOP documentation for a specific business case.",
    tags: ["Startup Registration", "Funding", "Compliance"]
  },
  {
    id: "direct-tax-review",
    name: "Direct Tax Team",
    role: "ITR and notice review",
    bio: "Discuss ITR positions, notice deadlines, and supporting records before deciding the next step.",
    tags: ["ITR Expert", "Tax Scrutiny", "Tax Advisory"]
  }
];

export default function ExpertsIndexPage() {
  return (
    <>
      <div className="min-h-screen bg-slate-50">
      <MetaSEO
        title="Expert Review And Tax Advisory | MyeCA.in"
        description="Compare available tax, GST, and compliance review areas and request support for a defined question."
        keywords={["tax review India", "startup compliance consultation", "income tax consultation"]}
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
              Scope-Based Consultation
            </Badge>
            <h1 className="type-page-title text-slate-900 mb-6">
              Service Teams by <br />
              <span className="text-blue-600">Tax And Compliance Review Area</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              The question, document list, deliverable, and fee are confirmed before paid work begins.
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
                  <div className="border-b border-slate-800 bg-slate-900 p-8">
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
                      <Briefcase className="h-6 w-6 text-blue-300" />
                    </div>
                    <h3 className="mb-1 text-xl font-bold text-white">{expert.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-blue-300">{expert.role}</p>
                  </div>

                  <CardContent className="pt-6 pb-8">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                      {expert.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 whitespace-nowrap">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                      {expert.bio}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Scope discussed first</span>
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
            <h2 className="text-3xl font-black mb-6 text-slate-900">Choose Support for the Question You Need Reviewed</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Briefcase, title: "Review Area", desc: "Choose the question you need reviewed" },
                { icon: Award, title: "Scope Before Payment", desc: "Confirm the deliverable and document list" },
                { icon: MessageSquare, title: "Consultation Route", desc: "Send case details through the support form" }
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
