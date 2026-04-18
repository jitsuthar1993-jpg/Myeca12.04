import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  FileText,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  ChevronRight,
} from "lucide-react";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import type { BlogCategory, PublicBlogSummary } from "@shared/blog";

type BlogSummary = PublicBlogSummary & {
  featuredImage?: string | null;
  image?: string | null;
  categoryName?: string | null;
  createdAt?: string | null;
  readTime?: string | null;
  author?: {
    firstName?: string | null;
    lastName?: string | null;
    name?: string | null;
    role?: string | null;
  } | null;
};

type BlogListResponse = {
  posts: BlogSummary[];
  total?: number;
  page?: number;
  hasMore?: boolean;
};

type CategoryResponse = {
  categories: Array<BlogCategory | { id?: string; name?: string; slug?: string; description?: string | null }>;
};

const DEFAULT_CATEGORIES = [
  { id: "income-tax", name: "Income Tax", slug: "income-tax" },
  { id: "gst", name: "GST", slug: "gst" },
  { id: "itr-filing", name: "ITR Filing", slug: "itr-filing" },
  { id: "business", name: "Business", slug: "business" },
];

const AUDIENCE_FILTERS = [
  { key: "all", label: "All readers", description: "Tax, GST, filing, and compliance guides" },
  { key: "individuals", label: "Individuals", description: "ITR, refunds, deductions, Form 16, AIS" },
  { key: "businesses", label: "Businesses", description: "GST, startup, MSME, notices, registrations" },
];

const HUB_FAQS = [
  {
    question: "What should I read first before filing ITR?",
    answer: "Start with Form 16, AIS/Form 26AS reconciliation, ITR form selection, and old vs new tax regime guides.",
  },
  {
    question: "Can businesses use these guides?",
    answer: "Yes. The hub includes GST, business registration, MSME, startup, notices, and recurring compliance explainers.",
  },
  {
    question: "When should I talk to a CA?",
    answer: "Use CA help for capital gains, business income, GST notices, AIS mismatches, foreign assets, large refunds, or missed filings.",
  },
];

function isImageUrl(value: string | null | undefined) {
  return Boolean(value && /^(https?:\/\/|\/)/.test(value));
}

function normalizeKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getCategory(post: BlogSummary): BlogCategory | null {
  if (post.category && typeof post.category === "object") return post.category;
  return post.categoryName
    ? { id: post.categoryName, name: post.categoryName, slug: post.categoryName.toLowerCase().replace(/\s+/g, "-"), description: null }
    : null;
}

function getCategoryName(post: BlogSummary) {
  return getCategory(post)?.name ?? "Tax Guide";
}

function getCategoryTokens(post: BlogSummary) {
  const category = getCategory(post);
  return [
    category?.id,
    category?.name,
    category?.slug,
    post.categoryName,
  ].map(normalizeKey).filter(Boolean);
}

function getAuthorName(post: BlogSummary) {
  if (post.authorName) return post.authorName;
  if (post.author?.name) return post.author.name;
  return [post.author?.firstName, post.author?.lastName].filter(Boolean).join(" ") || "MyeCA Editorial Team";
}

function getCoverImage(post: BlogSummary) {
  return post.coverImage ?? post.featuredImage ?? post.image ?? null;
}

function getPublishedDate(post: BlogSummary) {
  return post.publishedAt ?? post.createdAt ?? post.updatedAt ?? null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getReadTime(post: BlogSummary) {
  return post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : post.readTime ?? "5 min read";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "ME";
}

function normalizeCategories(posts: BlogSummary[], apiCategories: CategoryResponse["categories"] | undefined) {
  const seen = new Set<string>();
  const categories: Array<Pick<BlogCategory, "id" | "name" | "slug">> = [];

  const addCategory = (category: Partial<BlogCategory> | null | undefined) => {
    const name = category?.name?.trim();
    if (!name) return;
    const slug = category?.slug?.trim() || name.toLowerCase().replace(/\s+/g, "-");
    const id = category?.id?.trim() || slug;
    const key = normalizeKey(id || slug || name);
    if (seen.has(key)) return;
    seen.add(key);
    categories.push({ id, name, slug });
  };

  apiCategories?.forEach(addCategory);
  posts.forEach((post) => addCategory(getCategory(post)));
  DEFAULT_CATEGORIES.forEach(addCategory);

  return categories;
}

function ArticleCard({ post, compact = false }: { post: BlogSummary; compact?: boolean }) {
  const coverImage = getCoverImage(post);
  const authorName = getAuthorName(post);

  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
        <div className={cn("relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50", compact ? "h-40" : "h-52")}>
          {isImageUrl(coverImage) ? (
            <img
              src={coverImage ?? ""}
              alt={post.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileText className="h-14 w-14 text-blue-200" />
            </div>
          )}
          <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
            {getCategoryName(post)}
          </div>
        </div>

        <div className={cn("flex flex-1 flex-col", compact ? "p-4" : "p-5")}>
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
              {formatDate(getPublishedDate(post))}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-blue-400" />
              {getReadTime(post)}
            </span>
          </div>

          <h3 className={cn("font-bold leading-snug tracking-tight text-slate-950 transition group-hover:text-blue-700", compact ? "text-lg" : "text-xl")}>
            {post.title}
          </h3>

          {post.excerpt && !compact && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {getInitials(authorName)}
              </div>
              <p className="truncate text-xs font-semibold text-slate-700">{authorName}</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 transition-all group-hover:gap-2">
              Read <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedAudience, setSelectedAudience] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedCategory, selectedAudience]);

  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["public-blogs", searchQuery, selectedCategory, selectedAudience, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "13" });
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedAudience !== "all") params.set("audience", selectedAudience);
      const res = await fetch(`/api/public/blogs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch blogs");
      return await res.json() as BlogListResponse;
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["public-categories"],
    queryFn: async () => {
      const res = await fetch("/api/public/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json() as CategoryResponse;
    },
  });

  const posts = postsData?.posts ?? [];
  const totalPosts = postsData?.total ?? posts.length;
  const categories = useMemo(() => normalizeCategories(posts, categoriesData?.categories), [posts, categoriesData?.categories]);
  const featuredPost = posts.find((post) => post.isFeatured) ?? posts[0];
  const regularPosts = featuredPost ? posts.filter((post) => post.id !== featuredPost.id) : posts;
  const popularTopics = categories.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#f7fbff] pb-20">
      <MetaSEO
        title="Knowledge Hub | Expert Tax Guides & Finance Insights | MyeCA.in"
        description="Read practical income tax, GST, ITR filing, and compliance guides written for Indian taxpayers and businesses by the MyeCA editorial team."
        keywords={["tax blog India", "income tax updates", "ITR filing guide", "GST guides", "tax planning tips"]}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Knowledge Hub", url: "/blog" },
        ]}
      />

      <section className="relative overflow-hidden border-b border-blue-50 bg-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.08),transparent_25%),radial-gradient(circle_at_80%_10%,rgba(79,70,229,0.08),transparent_25%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">

          <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-blue-200">
                <Sparkles className="h-3.5 w-3.5" />
                Expert Tax Repository
              </div>
              <h1 className="max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
                Master your taxes with CA-backed guides.
              </h1>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                Clear, practical, and expert-reviewed explainers on ITR filing, GST compliance, startup registrations, and financial strategy for Indian taxpayers.
              </p>
            </div>

            <div className="rounded-[2.5rem] border border-slate-200 bg-white/80 p-6 shadow-2xl shadow-blue-100/50 backdrop-blur-xl">
              <div className="mb-6">
                <label htmlFor="blog-search" className="mb-2.5 block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Search the hub
                </label>
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-4 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-50">
                  <Search className="h-5 w-5 shrink-0 text-blue-500" />
                  <input
                    id="blog-search"
                    className="w-full bg-transparent text-[15px] font-bold text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="Search tax, GST, ITR, deductions..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Guides", value: totalPosts, color: "blue" },
                  { label: "Topics", value: categories.length, color: "indigo" },
                  { label: "Reviewed", value: "CA", color: "emerald" }
                ].map((stat) => (
                  <div key={stat.label} className={cn(
                    "rounded-2xl p-4 text-center transition-transform hover:scale-105",
                    stat.color === "blue" ? "bg-blue-50 text-blue-700" :
                    stat.color === "indigo" ? "bg-indigo-50 text-indigo-700" :
                    "bg-emerald-50 text-emerald-700"
                  )}>
                    <p className="text-2xl font-black leading-none">{stat.value}</p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-wider opacity-70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          {AUDIENCE_FILTERS.map((audience) => {
            const active = selectedAudience === audience.key;
            return (
              <button
                key={audience.key}
                type="button"
                onClick={() => setSelectedAudience(audience.key)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-blue-600 bg-white shadow-lg shadow-blue-100"
                    : "border-slate-200 bg-white/80 hover:border-blue-200 hover:bg-white",
                )}
              >
                <div className="mb-2 flex items-center gap-2">
                  {audience.key === "businesses" ? <Building2 className="h-4 w-4 text-blue-600" /> : <Users className="h-4 w-4 text-blue-600" />}
                  <span className="text-sm font-black text-slate-950">{audience.label}</span>
                </div>
                <p className="text-xs leading-5 text-slate-500">{audience.description}</p>
              </button>
            );
          })}
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
              selectedCategory === "all"
                ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700",
            )}
          >
            All guides
          </button>
          {categories.map((category) => {
            const key = normalizeKey(category.id || category.slug || category.name);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCategory(key)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition",
                  selectedCategory === key
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {isLoadingPosts ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-3xl border border-blue-100 bg-white">
            <Loader2 className="mb-4 h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold text-slate-500">Loading expert guides...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-blue-200 bg-white p-10 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-blue-300" />
            <h2 className="text-2xl font-bold text-slate-950">No guides found</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Try a broader search term or reset the selected topic to browse all MyeCA articles.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedAudience("all");
              }}
              className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="min-w-0 space-y-8">
              {featuredPost && (
                <Link href={`/blog/${featuredPost.slug}`}>
                  <article className="group grid overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-100/70 transition duration-300 hover:-translate-y-1 hover:border-blue-200 lg:grid-cols-[0.95fr_1.05fr]">
                    <div className="relative min-h-[280px] overflow-hidden bg-gradient-to-br from-blue-100 via-white to-cyan-100">
                      {isImageUrl(getCoverImage(featuredPost)) ? (
                        <img
                          src={getCoverImage(featuredPost) ?? ""}
                          alt={featuredPost.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full min-h-[280px] items-center justify-center">
                          <BookOpen className="h-20 w-20 text-blue-200" />
                        </div>
                      )}
                      <div className="absolute left-5 top-5 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-lg">
                        Featured guide
                      </div>
                    </div>
                    <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                      <p className="mb-4 text-sm font-bold text-blue-700">{getCategoryName(featuredPost)}</p>
                      <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-950 transition group-hover:text-blue-700 lg:text-4xl">
                        {featuredPost.title}
                      </h2>
                      {featuredPost.excerpt && (
                        <p className="mt-4 text-base leading-8 text-slate-600">
                          {featuredPost.excerpt}
                        </p>
                      )}
                      <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-400" />
                          {getAuthorName(featuredPost)}
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <Clock3 className="h-4 w-4 text-blue-400" />
                          {getReadTime(featuredPost)}
                        </span>
                        <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                          Read full guide <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {regularPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-500">
                  Page {page} · {totalPosts} matching guides
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    className="rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={!postsData?.hasMore}
                    onClick={() => setPage((current) => current + 1)}
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <h2 className="text-base font-black text-slate-950">Browse by topics</h2>
                </div>
                <div className="space-y-2">
                  {popularTopics.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setSelectedCategory(normalizeKey(topic.id || topic.slug || topic.name))}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {topic.name}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 to-cyan-600 p-6 text-white shadow-xl shadow-blue-200">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">Need certainty?</p>
                <h2 className="mt-3 text-2xl font-black leading-tight">Talk to a CA before you file.</h2>
                <p className="mt-3 text-sm leading-6 text-blue-100">
                  Get MyeCA experts to review your tax position, deductions, GST compliance, or business filing path.
                </p>
                <Link href="/expert-consultation">
                  <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50">
                    Book consultation <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>

              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">Reading tip</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Start with a guide, then use the article CTAs when you want a CA to apply it to your exact filing or compliance case.
                </p>
              </div>
            </aside>
          </div>
        )}

        <section className="mt-14 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Quick answers</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Frequently asked questions</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use the hub for general education. Use a MyeCA expert when the facts, numbers, or notices are specific to your case.
            </p>
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {HUB_FAQS.map((faq) => (
              <details key={faq.question} className="group p-5 open:bg-blue-50/40">
                <summary className="cursor-pointer list-none text-base font-bold text-slate-950 marker:hidden">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
