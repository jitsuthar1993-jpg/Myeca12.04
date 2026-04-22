import React from "react";
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
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            We're on a mission to <br />
            <span className="text-blue-600">Humanize Tax Filing</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            MyeCA.in was built to bridge the gap between complex government portals 
            and the personalized expertise of a Chartered Accountant.
          </p>
        </div>
      </section>

      {/* Founder Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">The Founder's Story</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed font-medium">
                <p>
                  MyeCA.in was founded in 2018 by <strong>CA Ankit S.</strong>, a practicing Chartered Accountant (ICAI Member) 
                  who saw thousands of taxpayers struggling with confusing notices and missed refunds.
                </p>
                <p>
                  While automated platforms became popular, they lacked the "human touch" and professional liability 
                  that only a qualified CA can provide. We set out to build a platform that combines the speed of AI 
                  with the accountability of a real expert.
                </p>
                <p>
                  Today, MyeCA.in handles over 950+ active clients and has helped save over ₹15 Lakhs in legal penalties 
                  and optimized refunds for freelancers, NRIs, and small businesses across India.
                </p>
              </div>
            </div>
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <Shield className="w-12 h-12 mb-6 opacity-80" />
                <h3 className="text-2xl font-bold mb-4">Our Credentials</h3>
                <ul className="space-y-3 opacity-90">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    <span>ERI Registered Intermediary</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    <span>ICAI Certified Professionals</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    <span>ISO 27001 Data Security</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-200" />
                    <span>CA-Reviewed Before Filing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white border-2 border-slate-100 rounded-[3rem] mx-4 mb-20 overflow-hidden relative shadow-sm">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 italic text-slate-900">The MyeCA Way</h2>
            <p className="text-slate-500 font-medium">Our four pillars of service excellence</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Expertise", desc: "No bots. Every return is signed off by a real CA with years of experience." },
              { icon: FileCheck, title: "Transparency", desc: "Know exactly what you're paying for. No hidden convenience fees." },
              { icon: Users, title: "Human-First", desc: "Your personal CA is available via WhatsApp, phone, or email whenever you need." },
              { icon: Shield, title: "Security", desc: "Bank-grade encryption for your documents. We never sell your financial data." },
            ].map((value, i) => (
              <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
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
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Want to speak with the Founder?</h2>
        <p className="text-slate-600 mb-8 max-w-xl mx-auto font-medium">
          Have a complex case or a business inquiry? Ankit is happy to jump on a quick discovery call.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="mailto:support@myeca.in?subject=Business Inquiry"
            className="px-8 py-4 bg-[#315efb] text-white font-bold rounded-2xl shadow-lg hover:-translate-y-1 transition-all"
          >
            Email Us
          </a>
        </div>
      </section>
    </div>
  );
}
