import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { FileLock2, FileText, Search, ShieldCheck } from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { PUBLIC_FORM_CATALOGUE, type FormCatalogueEntry } from "@/data/form-catalog";
import {
  GENIUS_SOURCE_INVENTORY,
  loadGeniusSourceCatalog,
  type GeniusSourceForm,
} from "@/data/genius-source-catalog";

const PAGE_SIZE = 24;

const categories = [
  { id: "all", label: "All forms" },
  { id: "business", label: "Business" },
  { id: "legal", label: "Legal and personal" },
  { id: "tax", label: "Tax" },
] as const;

const legalStatusLabels: Record<FormCatalogueEntry["legalStatus"], string> = {
  "draft-template": "Draft template",
  "statutory-review": "Statutory review",
  "not-statutory": "Non-statutory record",
};

function sourceStatusLabel(form: GeniusSourceForm) {
  return form.lawReviewStatus === "blocked-superseded"
    ? "Superseded - blocked"
    : "Law review required";
}

function SourceReviewCard({ form }: { form: GeniusSourceForm }) {
  const isBlocked = form.lawReviewStatus === "blocked-superseded";
  return (
    <article className="flex min-h-[300px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <FileLock2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <span className={`rounded-md px-2 py-1 type-meta font-black uppercase tracking-wide ${isBlocked ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
          {sourceStatusLabel(form)}
        </span>
      </div>
      <p className="mt-4 type-meta font-black uppercase tracking-wide text-slate-500">{form.sourceCategory}</p>
      <h3 className="mt-2 type-card-title font-black text-slate-950">{form.title}</h3>
      <p className="mt-3 text-xs leading-5 text-slate-600">{form.reviewReason}</p>
      <div className="mt-auto border-t border-slate-100 pt-4 text-xs text-slate-500">
        <p><span className="font-bold text-slate-700">Format:</span> {form.sourceFormat === "encrypted" ? "Encrypted source - readable export required" : form.sourceOriginalFormat.toUpperCase()}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {form.officialSources.slice(0, 2).map((source) => (
            <a key={source.url} href={source.url} target="_blank" rel="noreferrer" className="font-bold text-blue-700 underline-offset-2 hover:underline">
              {source.label}
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}

export default function FormsPage() {
  const [view, setView] = useState<"public" | "source">("public");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]["id"]>("all");
  const [sourceQuery, setSourceQuery] = useState("");
  const [sourceCategory, setSourceCategory] = useState("all");
  const [visibleSourceCount, setVisibleSourceCount] = useState(PAGE_SIZE);
  const [sourceForms, setSourceForms] = useState<GeniusSourceForm[]>([]);
  const [sourceLoadState, setSourceLoadState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [sourceLoadError, setSourceLoadError] = useState("");
  const [sourceLoadAttempt, setSourceLoadAttempt] = useState(0);

  const filteredForms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return PUBLIC_FORM_CATALOGUE.filter((form) => {
      const matchesCategory = category === "all" || form.category === category || (category === "legal" && form.category === "personal");
      const searchable = [form.title, form.description, ...form.tags].join(" ").toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [category, query]);
  useEffect(() => {
    if (view !== "source" || sourceForms.length > 0) return;

    let cancelled = false;
    setSourceLoadState("loading");
    setSourceLoadError("");
    loadGeniusSourceCatalog()
      .then((forms) => {
        if (cancelled) return;
        setSourceForms(forms);
        setSourceLoadState("loaded");
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setSourceLoadError(error instanceof Error ? error.message : "The source review catalogue could not be loaded.");
        setSourceLoadState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [sourceForms.length, sourceLoadAttempt, view]);

  const sourceCategories = useMemo(
    () => [...new Set(sourceForms.map((form) => form.sourceCategory))].sort(),
    [sourceForms],
  );

  const filteredSourceForms = useMemo(() => {
    const normalizedQuery = sourceQuery.trim().toLowerCase();
    return sourceForms.filter((form) => {
      const matchesCategory = sourceCategory === "all" || form.sourceCategory === sourceCategory;
      const searchable = [form.title, form.sourceCategory].join(" ").toLowerCase();
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery));
    });
  }, [sourceCategory, sourceForms, sourceQuery]);

  const visibleSourceForms = filteredSourceForms.slice(0, visibleSourceCount);

  const selectView = (nextView: "public" | "source") => {
    setView(nextView);
    setVisibleSourceCount(PAGE_SIZE);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <MetaSEO title="Indian Business, Legal and Tax Forms | MyeCA.in" description="Browse public MyeCA form templates, preview drafts, and review approved source forms awaiting current-law confirmation." keywords={["Indian forms", "business forms", "legal form templates", "tax forms"]} breadcrumbs={[{ name: "Home", url: "/" }, { name: "Forms", url: "/forms" }]} />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="type-meta font-black uppercase tracking-[0.16em] text-blue-700">Public forms library</p>
          <h1 className="mt-2 type-page-title font-black text-slate-950">Forms for Indian business and compliance work</h1>
          <p className="mt-3 max-w-3xl type-body text-slate-600">Fill and preview public templates. Sign in only when you want to save a copy in your MyeCA workspace.</p>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" /><p>Templates are clearly labelled. Statutory forms are published only after applicable law and version confirmation.</p></div>
          <p className="mt-4 text-sm font-bold text-slate-600">{GENIUS_SOURCE_INVENTORY.total.toLocaleString("en-IN")} imported source templates under review</p>
        </section>

        <section className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" aria-label="Catalogue view">
          <button type="button" onClick={() => selectView("public")} className={`rounded-lg px-4 py-2 text-sm font-black ${view === "public" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>Available templates</button>
          <button type="button" onClick={() => selectView("source")} className={`rounded-lg px-4 py-2 text-sm font-black ${view === "source" ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-50"}`}>Source review queue</button>
        </section>

        {view === "public" ? (
          <>
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-label="Form filters">
              <label className="relative block"><span className="sr-only">Search forms</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search quotations, agreements, invoices..." className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-black ${category === item.id ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600"}`}>{item.label}</button>)}</div>
            </section>
            <section className="mt-8" aria-live="polite">
              <div className="mb-4"><h2 className="type-card-title font-black text-slate-950">Available templates</h2><p className="mt-1 type-support text-slate-500">{filteredForms.length} public templates</p></div>
              {filteredForms.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm font-semibold text-slate-600">No public forms match your search.</div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filteredForms.map((form) => <article key={form.id} data-testid={`form-template-card-${form.id}`} className="flex min-h-[280px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileText className="h-5 w-5" aria-hidden="true" /></div><span className="rounded-md bg-slate-100 px-2 py-1 type-meta font-black uppercase tracking-wide text-slate-600">{legalStatusLabels[form.legalStatus]}</span></div><h3 className="mt-4 type-card-title font-black text-slate-950">{form.title}</h3><p className="mt-2 type-support leading-5 text-slate-600">{form.description}</p><p className="mt-3 text-xs leading-5 text-slate-500">{form.verificationNote}</p><div className="mt-auto border-t border-slate-100 pt-4"><Link href={`/documents/generator/${form.generatorId}`} className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-black text-white hover:bg-blue-800">Open template</Link></div></article>)}</div>}
            </section>
          </>
        ) : sourceLoadState !== "loaded" ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm" aria-live="polite">
            {sourceLoadState === "error" ? (
              <div role="alert">
                <p className="text-sm font-bold text-red-700">{sourceLoadError}</p>
                <button type="button" onClick={() => setSourceLoadAttempt((attempt) => attempt + 1)} className="mt-4 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">Try again</button>
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-600">Loading the source review queue...</p>
            )}
          </section>
        ) : (
          <>
            <section className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_280px]" aria-label="Source review filters">
              <label className="relative block"><span className="sr-only">Search source templates</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" /><input type="search" value={sourceQuery} onChange={(event) => { setSourceQuery(event.target.value); setVisibleSourceCount(PAGE_SIZE); }} placeholder="Search all imported source forms..." className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></label>
              <label><span className="sr-only">Filter source category</span><select value={sourceCategory} onChange={(event) => { setSourceCategory(event.target.value); setVisibleSourceCount(PAGE_SIZE); }} className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700"><option value="all">All source categories</option>{sourceCategories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            </section>
            <section className="mt-8" aria-live="polite">
              <div className="mb-4"><h2 className="type-card-title font-black text-slate-950">Approved source migration queue</h2><p className="mt-1 type-support text-slate-500">Showing {visibleSourceForms.length.toLocaleString("en-IN")} of {filteredSourceForms.length.toLocaleString("en-IN")} source templates</p></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visibleSourceForms.map((form) => <SourceReviewCard key={form.id} form={form} />)}</div>
              {visibleSourceForms.length < filteredSourceForms.length && <div className="mt-6 text-center"><button type="button" onClick={() => setVisibleSourceCount((count) => count + PAGE_SIZE)} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">Load more source templates</button></div>}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
