import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { 
  Search, Info, Tag, Box, Briefcase, 
  ChevronRight, Sparkles, AlertCircle, FileText,
  Zap, IndianRupee, ShieldCheck, CheckCircle
} from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

const HSN_DATA = [
  { code: "1001", name: "Wheat and meslin", rate: "0%", category: "Grains" },
  { code: "6109", name: "T-shirts, singlets and other vests", rate: "5%", category: "Apparel" },
  { code: "8471", name: "Laptops, PCs and data machines", rate: "18%", category: "Electronics" },
  { code: "8517", name: "Smartphones and telephone sets", rate: "18%", category: "Electronics" },
  { code: "3304", name: "Beauty and skin care preparations", rate: "28%", category: "Cosmetics" }
];

const SAC_DATA = [
  { code: "9983", name: "Professional & Business Services (CA/Legal)", rate: "18%", category: "Professional" },
  { code: "9984", name: "Telecom & Information Supply Services", rate: "18%", category: "IT" },
  { code: "9963", name: "Accommodation & Food Services (Hotels)", rate: "18%", category: "Hospitality" },
  { code: "9965", name: "Goods Transport Services (GTA)", rate: "12%", category: "Logistics" }
];

export default function HSNFinderPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"hsn" | "sac">("hsn");

  const filteredItems = (activeTab === "hsn" ? HSN_DATA : SAC_DATA).filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.code.includes(query)
  );

  const seo = getSEOConfig('/calculators/hsn-finder');

  return (
    <>
      <MetaSEO
        title={seo?.title || "GST HSN & SAC Code Finder | MyeCA.in"}
        description={seo?.description || "Find the latest HSN codes for goods and SAC codes for services with applicable GST rates for FY 2024-25."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
      />

      <CalcHero 
        title="HSN & SAC Finder"
        description="Search for product and service codes to ensure correct GST billing and tax compliance."
        category="GST Compliance"
        icon={<Search className="w-6 h-6" />}
        variant="blue"
        breadcrumbItems={[{ name: "HSN Finder" }]}
      />

      <CalcLayout
        variant="blue"
        complianceFacts={[
          { title: "Invoice Rule", content: "Businesses with turnover > ₹5 Cr must use 6-digit HSN codes on all B2B invoices." },
          { title: "Service Class", content: "All service codes (SAC) start with '99' and represent professional, technical, or trade services." },
          { title: "ITC Eligibility", content: "Incorrect HSN/SAC codes on purchase invoices can lead to rejection of Input Tax Credit (ITC) claims." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Finder Summary">
            <div className="space-y-6 pt-2">
              <div className="p-5 rounded-2xl bg-white/40 border border-white/20 backdrop-blur-md">
                <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Results Found</p>
                <p className="text-3xl font-black text-slate-900">{filteredItems.length}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Compliance Audit</p>
                    <p className="text-[11px] text-slate-500 font-medium">Verify your codes with a CA to avoid GST penalties and notices.</p>
                  </div>
                </div>
              </div>

              <Link href="/services/gst-registration">
                <button className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 mt-4 flex items-center justify-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  GST Compliance Package
                </button>
              </Link>
            </div>
          </CalcGlassSidebar>
        }
      >
        <div className="space-y-8">
          <CalcInputCard title="Search & Filter" icon={<Search className="w-5 h-5" />}>
             <div className="grid grid-cols-2 gap-3 mb-8">
                <button
                  onClick={() => setActiveTab("hsn")}
                  className={cn(
                    "py-4 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2",
                    activeTab === "hsn" ? "border-blue-600 bg-blue-600 text-white shadow-lg" : "border-slate-50 bg-slate-50 text-slate-500"
                  )}
                >
                  <Box className="w-4 h-4" /> HSN (Goods)
                </button>
                <button
                  onClick={() => setActiveTab("sac")}
                  className={cn(
                    "py-4 rounded-2xl border-2 transition-all font-bold text-sm flex items-center justify-center gap-2",
                    activeTab === "sac" ? "border-blue-600 bg-blue-600 text-white shadow-lg" : "border-slate-50 bg-slate-50 text-slate-500"
                  )}
                >
                  <Briefcase className="w-4 h-4" /> SAC (Services)
                </button>
             </div>

             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                <Input 
                  placeholder={activeTab === 'hsn' ? "Search Product (e.g. Laptop)" : "Search Service (e.g. Audit)"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-16 pl-12 rounded-2xl border-slate-100 bg-slate-50 font-bold text-lg focus:ring-4 focus:ring-blue-100"
                />
             </div>
          </CalcInputCard>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, i) => (
                  <m.div
                    key={item.code}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center justify-between hover:shadow-lg hover:border-blue-200 transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-slate-900 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {item.code}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{item.name}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 text-white font-black px-4 py-1.5 text-base rounded-xl">
                        {item.rate} GST
                      </Badge>
                    </div>
                  </m.div>
                ))
              ) : (
                <m.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="p-12 text-center bg-white rounded-3xl border border-slate-100 border-dashed"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-bold">No matching codes found for "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try searching by code or category instead.</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <CalculatorMiniBlog 
          features={[
            {
              icon: <CheckCircle className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Updated Rates",
              desc: "Our database is updated with the latest GST Council recommendations to ensure you use correct tax rates."
            },
            {
              icon: <Info className="w-5 h-5" />,
              iconBg: "bg-amber-50 text-amber-600",
              title: "Code Accuracy",
              desc: "Using the wrong HSN code can lead to GST audits and potential penalties. Always verify your classification."
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              iconBg: "bg-emerald-50 text-emerald-600",
              title: "ITC Protection",
              desc: "Correct HSN codes are mandatory for your customers to claim Input Tax Credit seamlessly."
            }
          ]}
          howItWorks={{
            title: "GST Classification",
            description: "Goods and services are classified using a harmonized system of nomenclature.",
            steps: [
              { title: "HSN (Goods)", desc: "Harmonized System of Nomenclature is used for classifying physical goods." },
              { title: "SAC (Services)", desc: "Services Accounting Code is used for classifying services and intangibles." },
              { title: "Digit Requirement", desc: "4 digits for turnover < ₹5 Cr, 6 digits for turnover > ₹5 Cr on B2B invoices." }
            ]
          }}
          faqs={[
            { q: "Is 8-digit HSN mandatory?", a: "8-digit HSN codes are mandatory only for export and import businesses." },
            { q: "Can I find GST rates here?", a: "Yes, our finder provides the most common GST rates (0%, 5%, 12%, 18%, 28%) for each code." },
            { q: "What if my product isn't listed?", a: "If you can't find a specific code, consult a GST expert to avoid misclassification penalties." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
