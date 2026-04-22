import React from "react";
import { cn } from "@/lib/utils";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";
import { ShieldCheck, Info, FileQuestion } from "lucide-react";

interface CalcLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  variant?: "blue" | "emerald" | "indigo";
  // SEO Content Props
  blogTitle?: string;
  complianceFacts?: { title: string; content: string }[];
  faqs?: { q: string; a: string }[];
}

export default function CalcLayout({ 
  children, 
  sidebar,
  variant = "blue",
  blogTitle,
  complianceFacts = [],
  faqs = []
}: CalcLayoutProps) {
  return (
    <>
      <div className="min-h-screen bg-[#FDFDFF]">
        <div className="max-w-7xl mx-auto px-4 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content Area */}
            <div className={cn("space-y-12", sidebar ? "lg:col-span-7" : "lg:col-span-12")}>
              {children}
            </div>

            {/* Sidebar Area */}
            {sidebar && (
              <div className="lg:col-span-5">
                {sidebar}
              </div>
            )}
          </div>

          <div className="mt-32 space-y-32">
            {/* 1. Compliance Authority */}
            {complianceFacts.length > 0 && (
              <section className="space-y-12">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100/50">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Compliance Authority</span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Tax & Legal Compliance Hub</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {complianceFacts.map((fact, i) => (
                    <div key={i} className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                        <Info className="w-5 h-5" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 mb-3">{fact.title}</h4>
                      <p className="text-slate-500 font-medium text-sm leading-relaxed">{fact.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3. The How-To Vault (FAQ) */}
            {faqs.length > 0 && (
              <section className="space-y-12 pb-20">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100/50">
                    <FileQuestion className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">The How-To Vault</span>
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
                </div>
                <div className="max-w-3xl mx-auto space-y-4">
                  {faqs.map((faq, i) => (
                    <div key={i} className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                      <h4 className="text-lg font-bold text-slate-900 mb-4 flex gap-3">
                        <span className="text-primary/40 font-black">Q.</span> {faq.q}
                      </h4>
                      <div className="flex gap-3">
                        <span className="text-emerald-500/40 font-black">A.</span>
                        <p className="text-slate-500 font-medium text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>

  );
}
