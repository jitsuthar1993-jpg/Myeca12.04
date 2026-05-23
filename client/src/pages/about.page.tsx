import { Shield, Award, Users, FileCheck, CheckCircle2 } from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";

export default function AboutPage() {
  const seo = getSEOConfig('/about');
  return (
    <div className="bg-white min-h-screen">
      <MetaSEO 
        title={seo?.title}
        description={seo?.description}
        keywords={seo?.keywords}
        type={seo?.type}
        breadcrumbs={seo?.breadcrumbs}
      />

      {/* Hero Section */}
      <section className="py-20 bg-slate-50 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="type-hero-title mb-6 font-black text-slate-900">
            We're on a mission to <br />
            <span className="text-blue-600">Humanize Tax Filing</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            MyeCA.in was built to bridge the gap between complex government portals 
            and the personalized expertise of a Chartered Accountant.
          </p>
        </div>
      </section>

      {/* Trust Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Why MyeCA Exists</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                <p>
                  MyeCA.in was built around a simple idea: Indian taxpayers should be able to understand what is needed,
                  what is missing, and when expert review is useful before they share sensitive documents or pay for filing.
                </p>
                <p>
                  Automated tools are useful for speed, but tax filing still needs careful document checks, scope clarity,
                  and professional judgment for capital gains, NRI matters, business income, notices, and high-value cases.
                </p>
                <p>
                  Today, MyeCA.in focuses on guided filing workflows, secure document handling, and expert review paths
                  for freelancers, NRIs, and small businesses across India.
                </p>
              </div>
            </div>
            <div className="bg-blue-600 rounded-lg p-8 text-white shadow-xl relative overflow-hidden group">
              <div className="relative z-10">
                <Shield className="w-12 h-12 mb-6 opacity-80" />
                <h3 className="text-2xl font-bold mb-4">Trust Markers</h3>
                <ul className="space-y-3 opacity-90">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    <span>ERI-registered filing workflow</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    <span>CA-assisted review on eligible plans</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    <span>Secure Document Workflow</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    <span>Scope, pricing, and timelines shown upfront</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white border-y border-slate-100 mb-20 overflow-hidden relative">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 italic text-slate-900">The MyeCA Way</h2>
            <p className="text-slate-500 font-medium">Our four pillars of service excellence</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Expertise", desc: "Complex returns can add CA-assisted review with the scope shown before work starts." },
              { icon: FileCheck, title: "Transparency", desc: "Plan inclusions, exclusions, GST treatment, and timelines stay visible before checkout." },
              { icon: Users, title: "Human-First", desc: "Support requests are reviewed during business hours with a clear callback path." },
              { icon: Shield, title: "Security", desc: "Documents are handled through a secure workflow and used for the requested service." },
            ].map((value, i) => (
              <div key={i} className="p-6 rounded-lg bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                <value.icon className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-lg mb-2 text-slate-900">{value.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none"></div>
      </section>

      {/* Contact Section */}
      <section className="py-20 text-center container mx-auto px-4">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Have a complex filing question?</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto font-medium">
          Share the facts first. The team can review the case type, document readiness, and next step during business hours.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="mailto:support@myeca.in?subject=Business Inquiry"
            className="px-8 py-4 bg-[#315efb] text-white font-bold rounded-lg shadow-lg hover:-translate-y-1 transition-all"
          >
            Email Us
          </a>
        </div>
      </section>
    </div>
  );
}
