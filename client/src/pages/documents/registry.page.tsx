import { useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  Building2,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  Home,
  Scale,
  Search,
  User,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { Layout } from "@/components/admin/Layout";
import { useAuth } from "@/components/AuthProvider";
import { GENERATOR_CATALOGUE } from "@/data/generator-catalog";
import {
  incomeTaxFormDownloads,
  incomeTaxFormsAssessmentYear,
  incomeTaxFormsFinancialYearLabel,
  incomeTaxFormsLastSynced,
  incomeTaxFormsSourceUrl,
} from "@/data/income-tax-forms";

const CATEGORIES = [
  { id: "all", name: "All Documents", icon: FileText, style: "bg-slate-100 text-slate-700" },
  { id: "legal", name: "Legal & Personal", icon: Scale, style: "bg-red-50 text-red-700" },
  { id: "corporate", name: "Business & Corporate", icon: Building2, style: "bg-blue-50 text-blue-700" },
  { id: "tax", name: "Compliance & Tax", icon: FileText, style: "bg-emerald-50 text-emerald-700" },
  { id: "real-estate", name: "Real Estate", icon: Home, style: "bg-orange-50 text-orange-700" },
  { id: "career", name: "Career & HR", icon: User, style: "bg-purple-50 text-purple-700" },
  { id: "applications", name: "Applications & Certificates", icon: FileText, style: "bg-teal-50 text-teal-700" },
] as const;

const complianceLabels = {
  "statutory-gst": "GST draft",
  "commercial-non-tax": "Non-tax document",
  "legal-draft": "Legal draft",
  "internal-record": "Internal record",
  "uncertified-financial-statement": "Uncertified draft",
  "general-document": "Ready template",
} as const;

function GeneratorRegistryShell({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated
    ? <Layout title="Document Generator">{children}</Layout>
    : <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>;
}

function formatSyncDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DocumentGeneratorRegistry() {
  const [activeView, setActiveView] = useState<"templates" | "official">("templates");
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [incomeTaxSearchQuery, setIncomeTaxSearchQuery] = useState("");

  const filteredDocs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return GENERATOR_CATALOGUE.filter((doc) => {
      const matchesCategory = activeCategory === "all" || doc.category === activeCategory;
      const searchable = [
        doc.title,
        doc.description,
        doc.validity,
        complianceLabels[doc.complianceClass],
        ...doc.features,
        ...(doc.seo?.keywords || []),
      ].join(" ").toLowerCase();
      return matchesCategory && (!query || searchable.includes(query));
    });
  }, [activeCategory, searchQuery]);

  const filteredIncomeTaxForms = useMemo(() => {
    const query = incomeTaxSearchQuery.trim().toLowerCase();
    if (!query) return incomeTaxFormDownloads;
    return incomeTaxFormDownloads.filter((form) =>
      [form.title, form.fileType, form.act, ...form.tags].filter(Boolean).join(" ").toLowerCase().includes(query),
    );
  }, [incomeTaxSearchQuery]);

  return (
    <GeneratorRegistryShell>
      <MetaSEO
        title="Financial, Legal and Business Document Generators India | MyeCA.in"
        description="Create and preview Indian financial, GST, legal, business, tax, employment, and application documents. Sign in only when you save or export."
        keywords={[
          "document generator India",
          "GST quotation generator",
          "delivery challan generator",
          "financial statement builder",
          "legal document templates India",
        ]}
        breadcrumbs={[{ name: "Home", url: "/" }, { name: "Document Generator", url: "/documents/generator" }]}
      />

      <div className="space-y-6 pb-16">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <p className="type-meta font-black uppercase tracking-[0.16em] text-blue-700">Document Generator</p>
          <h1 className="mt-2 type-page-title font-black text-slate-950">Create Indian-market documents from guided templates</h1>
          <p className="mt-2 max-w-4xl type-body text-slate-600">
            Fill and preview publicly. Sign in only when you export, save a draft, or convert a connected financial document.
          </p>
          <div className="mt-5 inline-flex rounded-lg bg-slate-100 p-1">
            <button type="button" onClick={() => setActiveView("templates")} className={`rounded-md px-4 py-2 text-sm font-black ${activeView === "templates" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>Document templates</button>
            <button type="button" onClick={() => setActiveView("official")} className={`rounded-md px-4 py-2 text-sm font-black ${activeView === "official" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>Official Forms</button>
          </div>
        </section>

        {activeView === "templates" ? (
          <>
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <label className="relative block">
                <span className="sr-only">Search document templates</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search quotations, GST documents, agreements, statements..."
                  className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </label>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setActiveCategory(category.id)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-black ${activeCategory === category.id ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}
                    >
                      <Icon className="h-4 w-4" /> {category.name}
                    </button>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="type-card-title font-black text-slate-950">Document templates</h2>
                  <p className="mt-1 type-support text-slate-500">{filteredDocs.length} templates available</p>
                </div>
              </div>
              <div data-testid="document-template-gallery" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredDocs.map((doc) => {
                  const category = CATEGORIES.find((item) => item.id === doc.category) || CATEGORIES[0];
                  const Icon = category.icon;
                  return (
                    <article key={doc.id} className="flex min-h-[290px] flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-200 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${category.style}`}><Icon className="h-5 w-5" /></div>
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">{complianceLabels[doc.complianceClass]}</span>
                      </div>
                      <h3 className="mt-4 type-card-title font-black text-slate-950">{doc.title}</h3>
                      <p className="mt-2 line-clamp-3 type-support leading-5 text-slate-600">{doc.description}</p>
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {doc.features.slice(0, 3).map((feature) => <span key={feature} className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-bold text-slate-600">{feature}</span>)}
                      </div>
                      <div className="mt-auto border-t border-slate-100 pt-4">
                        <Link href={`/documents/generator/${doc.id}`} className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-black text-white hover:bg-blue-800">Create document</Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </>
        ) : (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="type-card-title font-black text-slate-950">Official Income Tax Forms</h2>
              <p className="mt-1 text-sm text-slate-600">{incomeTaxFormsAssessmentYear} · {incomeTaxFormsFinancialYearLabel} · Last synced {formatSyncDate(incomeTaxFormsLastSynced)}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input type="search" value={incomeTaxSearchQuery} onChange={(event) => setIncomeTaxSearchQuery(event.target.value)} placeholder="Search official forms..." className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm" />
                <a href={incomeTaxFormsSourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-blue-700">Official source <ExternalLink className="h-4 w-4" /></a>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredIncomeTaxForms.map((form) => (
                <div key={form.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3"><FileArchive className="mt-1 h-5 w-5 text-blue-700" /><div><p className="font-black text-slate-950">{form.title}</p><p className="text-sm text-slate-600">{form.act}</p></div></div>
                  <a href={form.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-black text-white"><Download className="h-4 w-4" /> Open</a>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </GeneratorRegistryShell>
  );
}
