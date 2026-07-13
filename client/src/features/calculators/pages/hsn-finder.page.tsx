import React, { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  Search, Info, Box, Briefcase,
  AlertCircle, ExternalLink,
  Zap, ShieldCheck, CheckCircle
} from "lucide-react";
import { getSEOConfig } from "@/config/seo.config";
import MetaSEO from "@/components/seo/MetaSEO";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { HSN_REFERENCE_DATASET } from "@/data/calculator-rule-datasets";
import { searchClassificationReferences } from "@/features/calculators/lib/classification-reference-search";

// Atomic Components
import CalcLayout from "@/features/calculators/components/CalcLayout";
import CalcHero from "@/features/calculators/components/CalcHero";
import CalcInputCard from "@/features/calculators/components/CalcInputCard";
import CalcGlassSidebar from "@/features/calculators/components/CalcGlassSidebar";
import { CalculatorMiniBlog } from "@/features/calculators/components/CalculatorMiniBlog";

export default function HSNFinderPage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"hsn" | "sac">("hsn");

  const filteredItems = searchClassificationReferences(HSN_REFERENCE_DATASET.entries, {
    type: activeTab,
    query,
  });

  const seo = getSEOConfig('/calculators/hsn-finder');

  return (
    <>
      <MetaSEO
        title={seo?.title || "GST HSN & SAC Code Finder | MyeCA.in"}
        description={seo?.description || "Search a limited HSN and SAC reference shortlist, then verify the complete classification and applicable GST notification before use."}
        keywords={seo?.keywords}
        type={seo?.type || "calculator"}
        calculatorData={seo?.calculatorData}
        breadcrumbs={seo?.breadcrumbs}
        noindex
      />

      <CalcHero
        title="HSN & SAC Reference Search"
        description="Search a limited reference shortlist. Confirm the complete code, conditions, and rate from current official schedules before billing or filing."
        category="GST Compliance"
        icon={<Search className="w-6 h-6" />}
        variant="blue"
        breadcrumbItems={[{ name: "HSN Finder" }]}
        compact
      />

      <CalcLayout
        variant="blue"
        complianceFacts={[
          { title: "Reference status", content: "This is a limited four-digit classification shortlist, not a complete tariff or rate schedule." },
          { title: "Source check", content: `The supporting official sources were last checked on ${HSN_REFERENCE_DATASET.checkedOn}.` },
          { title: "Classification", content: "An item description alone may not establish the correct code or rate; composition, use, value, recipient, and notification conditions can matter." }
        ]}
        sidebar={
          <CalcGlassSidebar title="Finder Summary">
            <div className="space-y-6 pt-2">
              <div className="p-5 rounded-2xl bg-white/40 border border-white/20 backdrop-blur-md">
                <p className="type-meta mb-1 font-normal uppercase tracking-widest text-blue-700">Results Found</p>
                <p className="text-3xl font-normal text-slate-900">{filteredItems.length}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-normal text-slate-800">Compliance Audit</p>
                    <p className="type-support font-normal text-slate-500">Verify your codes with a CA to avoid GST penalties and notices.</p>
                  </div>
                </div>
              </div>

              <Link href="/services/gst-registration">
                <button className="w-full py-4 rounded-2xl bg-blue-700 text-white font-normal text-sm hover:bg-blue-600 transition-all shadow-lg shadow-slate-200 mt-4 flex items-center justify-center gap-2">
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
                  type="button"
                  onClick={() => setActiveTab("hsn")}
                  aria-pressed={activeTab === "hsn"}
                  className={cn(
                    "py-4 rounded-2xl border-2 transition-all font-normal text-sm flex items-center justify-center gap-2",
                    activeTab === "hsn" ? "border-blue-600 bg-blue-600 text-white shadow-lg" : "border-slate-50 bg-slate-50 text-slate-500"
                  )}
                >
                  <Box className="w-4 h-4" /> HSN (Goods)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sac")}
                  aria-pressed={activeTab === "sac"}
                  className={cn(
                    "py-4 rounded-2xl border-2 transition-all font-normal text-sm flex items-center justify-center gap-2",
                    activeTab === "sac" ? "border-blue-600 bg-blue-600 text-white shadow-lg" : "border-slate-50 bg-slate-50 text-slate-500"
                  )}
                >
                  <Briefcase className="w-4 h-4" /> SAC (Services)
                </button>
             </div>

             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600" />
                <Input
                  aria-label={`Search ${activeTab.toUpperCase()} reference codes`}
                  placeholder={activeTab === "hsn" ? "Search goods by code or description" : "Search services by code or description"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-16 pl-12 rounded-2xl border-slate-100 bg-slate-50 font-normal text-lg focus:ring-4 focus:ring-blue-100"
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
                      <div className="w-16 h-14 bg-slate-50 rounded-2xl flex items-center justify-center font-normal text-slate-900 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                        {item.code}
                      </div>
                      <div>
                        <p className="font-normal text-slate-900 text-lg">{item.description}</p>
                        <p className="type-meta font-normal uppercase tracking-widest text-slate-400">Four-digit {item.kind.toUpperCase()} reference</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-600 text-white font-normal px-4 py-1.5 text-base rounded-xl">
                        Verify rate
                      </Badge>
                    </div>
                  </m.div>
                ))
              ) : (
                <m.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  role="status"
                  className="p-12 text-center bg-white rounded-3xl border border-slate-100 border-dashed"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-500 font-normal">No matching codes found for "{query}"</p>
                  <p className="text-xs text-slate-400 mt-1">Try searching by code or description instead.</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>

          <section className="rounded-3xl border border-slate-100 bg-white p-6" aria-labelledby="hsn-official-sources">
            <h2 id="hsn-official-sources" className="text-lg font-normal text-slate-900">Official verification sources</h2>
            <p className="mt-2 text-sm text-slate-600">
              Confirm the complete classification, current notification conditions, and applicable rate before using a code.
            </p>
            <ul className="mt-4 space-y-3">
              {HSN_REFERENCE_DATASET.officialSources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-700 hover:underline"
                  >
                    {source.title}
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <CalculatorMiniBlog
          features={[
            {
              icon: <CheckCircle className="w-5 h-5" />,
              iconBg: "bg-blue-50 text-blue-600",
              title: "Current-source check",
              desc: "Review GST Council updates and notifications before using a rate for billing or filing."
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
              desc: "A supportable HSN classification helps customers assess input-tax-credit eligibility and reduces invoice correction work."
            }
          ]}
          howItWorks={{
            title: "GST Classification",
            description: "Goods and services are classified using a harmonized system of nomenclature.",
            steps: [
              { title: "HSN (Goods)", desc: "Harmonized System of Nomenclature is used for classifying physical goods." },
              { title: "SAC (Services)", desc: "Services Accounting Code is used for classifying services and intangibles." },
              { title: "Required precision", desc: "Confirm the number of digits required for the invoice, return, import, or export context." }
            ]
          }}
          faqs={[
            { q: "Is 8-digit HSN mandatory?", a: "The required precision depends on the transaction and applicable GST or Customs rules. Verify the rule for your invoice, return, import, or export context." },
            { q: "Can I find GST rates here?", a: "No. This shortlist helps orient a classification search but does not determine a GST rate. Verify the current CBIC schedule and notifications." },
            { q: "What if my product isn't listed?", a: "If you can't find a specific code, consult a GST expert to avoid misclassification penalties." }
          ]}
        />
      </CalcLayout>
    </>
  );
}
