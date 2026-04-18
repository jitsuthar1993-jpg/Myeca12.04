import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  ExternalLink,
  Loader2,
  MessageSquare,
  Printer,
  Sparkles,
  ShieldCheck,
  Calculator,
  UserRound,
  X,
  ChevronDown,
  TrendingUp,
} from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import MetaSEO from "@/components/seo/MetaSEO";
import { cn } from "@/lib/utils";
import {
  normalizeBlogContent,
  type BlogFaqItem,
  type BlogTocItem,
  type PublicBlogDetail,
  type PublicBlogSummary,
} from "@shared/blog";

type LegacyAuthor = {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  role?: string | null;
};

type BlogDetail = PublicBlogDetail & {
  featuredImage?: string | null;
  image?: string | null;
  categoryName?: string | null;
  createdAt?: string | null;
  readTime?: string | null;
  author?: LegacyAuthor | null;
};

type BlogSummary = PublicBlogSummary & {
  categoryName?: string | null;
  createdAt?: string | null;
  readTime?: string | null;
  author?: LegacyAuthor | null;
};

type BlogDetailResponse = {
  post: BlogDetail | null;
};

type BlogListResponse = {
  posts: BlogSummary[];
};

function isImageUrl(value: string | null | undefined) {
  return Boolean(value && /^(https?:\/\/|\/)/.test(value));
}

function normalizeKey(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getCategoryName(post: Pick<BlogSummary, "category"> & { categoryName?: string | null }) {
  return post.category?.name ?? post.categoryName ?? "Tax Guide";
}

function getCategoryId(post: Pick<BlogSummary, "category"> & { categoryName?: string | null }) {
  return normalizeKey(post.category?.id ?? post.category?.slug ?? post.category?.name ?? post.categoryName);
}

function getAuthorName(post: BlogDetail | BlogSummary) {
  if ("authorName" in post && post.authorName) return post.authorName;
  if (post.author?.name) return post.author.name;
  return [post.author?.firstName, post.author?.lastName].filter(Boolean).join(" ") || "MyeCA Editorial Team";
}

function getAuthorRole(post: BlogDetail | BlogSummary) {
  if ("authorRole" in post && post.authorRole) return post.authorRole;
  return post.author?.role ?? "MyeCA Editorial";
}

function getCoverImage(post: BlogDetail) {
  return post.coverImage ?? post.featuredImage ?? post.image ?? null;
}

function getPublishedDate(post: BlogDetail | BlogSummary) {
  return post.publishedAt ?? post.createdAt ?? post.updatedAt ?? null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function getReadTime(post: BlogDetail | BlogSummary) {
  return post.readingTimeMinutes ? `${post.readingTimeMinutes} min read` : post.readTime ?? "5 min read";
}

function getAudienceLabel(value: string | null | undefined) {
  if (value === "individuals") return "For taxpayers";
  if (value === "businesses") return "For businesses";
  return "For taxpayers and businesses";
}

function serviceHref(slug: string | null | undefined) {
  return slug ? `/services/${slug.replace(/^\//, "")}` : "/expert-consultation";
}

function calculatorHref(slug: string | null | undefined) {
  return slug ? `/calculators/${slug.replace(/^\//, "")}` : "/calculators";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "ME";
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === "string" && tag.trim().length > 0);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return normalizeTags(parsed);
    } catch {
      return value.split(",").map((tag) => tag.trim()).filter(Boolean);
    }
  }
  return [];
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 108, behavior: "smooth" });
}

function ActionLink({ href, children, className }: { href: string; children: React.ReactNode; className: string }) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href}>
      <span className={className}>{children}</span>
    </Link>
  );
}

function TocPanel({ toc, activeId }: { toc: BlogTocItem[]; activeId: string }) {
  if (toc.length === 0) return null;

  return (
    <nav
      aria-label="Article index"
      className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-4 w-4 text-blue-600" />
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Index</p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black text-blue-700">
          {toc.length} sections
        </span>
      </div>
      <div className="max-h-[calc(100vh-200px)] space-y-0.5 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? "location" : undefined}
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                "block min-h-9 w-full rounded-lg border-l-[3px] px-3 py-2 text-left text-[13px] leading-snug transition-all",
                item.level === 3 && "pl-6 text-[12px]",
                isActive
                  ? "border-blue-600 bg-blue-50 font-bold text-blue-700"
                  : "border-transparent text-slate-600 hover:border-blue-200 hover:bg-slate-50 hover:text-blue-700",
              )}
            >
              {item.text}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function InlineToc({ toc, activeId }: { toc: BlogTocItem[]; activeId: string }) {
  const [isOpen, setIsOpen] = useState(true);

  if (toc.length === 0) return null;

  return (
    <div className="my-8 rounded-2xl border border-slate-200 bg-slate-50/50 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-slate-100/50"
      >
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-black tracking-tight text-slate-950">Table of Contents</h2>
        </div>
        <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <div className={cn("overflow-hidden transition-all duration-300", isOpen ? "max-h-[2000px] border-t border-slate-200" : "max-h-0")}>
        <nav aria-label="Article index" className="p-5">
          <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => scrollToHeading(item.id)}
                  className={cn(
                    "block py-1 text-left text-[15px] leading-snug transition group",
                    item.level === 3 && "pl-6 text-[14px]",
                    isActive
                      ? "font-bold text-blue-700"
                      : "text-slate-600 hover:text-blue-700"
                  )}
                >
                  {item.text}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}

function RelatedCard({ post }: { post: BlogSummary | PublicBlogSummary }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/50">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-700">{getCategoryName(post)}</p>
        <h3 className="mb-4 line-clamp-2 flex-1 text-base font-black leading-tight text-slate-900 transition group-hover:text-blue-700">
          {post.title}
        </h3>
        <div className="flex items-center justify-between border-t border-slate-50 pt-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Clock3 className="h-3.5 w-3.5 text-blue-400" />
            {getReadTime(post)}
          </p>
          <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
        </div>
      </article>
    </Link>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams() as { slug?: string };
  const [activeTocId, setActiveTocId] = useState("");
  const [isCtaVisible, setIsCtaVisible] = useState(true);

  const { data: postData, isLoading } = useQuery({
    queryKey: ["public-blog", slug],
    queryFn: async () => {
      const res = await fetch(`/api/public/blogs/${slug}`);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch blog post");
      const data = await res.json() as BlogDetailResponse;
      return data.post;
    },
    enabled: Boolean(slug),
  });

  const { data: allPostsData } = useQuery({
    queryKey: ["public-blogs-for-sidebar"],
    queryFn: async () => {
      const res = await fetch("/api/public/blogs?limit=24");
      if (!res.ok) return { posts: [] };
      return await res.json() as BlogListResponse;
    },
    enabled: Boolean(postData),
  });

  const post = postData;
  const normalizedContent = useMemo(() => normalizeBlogContent(post?.content ?? ""), [post?.content]);
  const toc = post?.toc && post.toc.length > 0 ? post.toc : normalizedContent.toc;
  const tags = useMemo(() => normalizeTags(post?.tags), [post?.tags]);
  const authorName = post ? getAuthorName(post) : "MyeCA Editorial Team";
  
  const relatedPosts = useMemo(() => {
    if (!post) return [];
    if (post.relatedPosts?.length) return post.relatedPosts;

    const currentCategory = getCategoryId(post);
    return (allPostsData?.posts ?? [])
      .filter((candidate) => candidate.slug !== post.slug)
      .filter((candidate) => !currentCategory || getCategoryId(candidate) === currentCategory)
      .slice(0, 3);
  }, [allPostsData?.posts, post]);

  const topicLinks = useMemo(() => {
    const allPosts = allPostsData?.posts ?? [];
    const fromPosts = allPosts
      .filter((candidate) => candidate.slug !== slug)
      .slice(0, 10)
      .map((candidate) => ({ label: candidate.title, href: `/blog/${candidate.slug}` }));

    return fromPosts.length > 0
      ? fromPosts
      : [
          { label: "Income Tax e-Filing", href: "/blog" },
          { label: "Old vs New Tax Regime", href: "/blog" },
          { label: "Section 80C Deductions", href: "/blog" },
          { label: "GST Registration", href: "/blog" },
          { label: "Capital Gains Tax", href: "/blog" },
        ];
  }, [allPostsData?.posts, slug]);

  useEffect(() => {
    if (toc.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible[0]) setActiveTocId(visible[0].target.id);
      },
      { rootMargin: "-110px 0px -62% 0px", threshold: 0 },
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-medium text-slate-500">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <BookOpen className="mx-auto mb-5 h-12 w-12 text-blue-200" />
          <h1 className="text-2xl font-black text-slate-950">Article not found</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">This guide may have been moved, unpublished, or removed.</p>
          <Link href="/blog">
            <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Knowledge Hub
            </span>
          </Link>
        </div>
      </div>
    );
  }

  const coverImage = getCoverImage(post);
  const faqItems: BlogFaqItem[] = post.faqItems ?? [];
  const seoFaqItems = faqItems.filter((faq): faq is { question: string; answer: string } => Boolean(faq.question && faq.answer));
  const highlights = post.keyHighlights ?? [];
  const ctaLabel = post.ctaLabel || "Talk to a CA";
  const ctaHref = post.ctaHref || "/expert-consultation";

  return (
    <div className="min-h-screen bg-white">
      <MetaSEO
        title={post.seoTitle || `${post.title} | MyeCA.in Knowledge Hub`}
        description={post.seoDescription || post.excerpt || `Read ${post.title} on MyeCA.in.`}
        keywords={tags}
        type="article"
        canonicalUrl={post.canonicalUrl || undefined}
        ogImage={isImageUrl(coverImage) ? coverImage ?? undefined : undefined}
        faqPageData={seoFaqItems}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Knowledge Hub", url: "/blog" },
        ]}
        jsonLd={{
          datePublished: getPublishedDate(post) ?? undefined,
          dateModified: post.updatedAt ?? getPublishedDate(post) ?? undefined,
          author: {
            "@type": "Person",
            name: authorName,
            jobTitle: getAuthorRole(post),
          },
          reviewedBy: post.reviewedBy
            ? {
                "@type": "Person",
                name: post.reviewedBy,
              }
            : undefined,
          about: [getCategoryName(post), ...tags].filter(Boolean),
        }}
      />
      

      {/* Hero CTA Banner */}
      {isCtaVisible && (
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 py-3 text-white shadow-lg">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <p className="text-center text-sm font-black sm:text-base">
                Stop Overpaying Taxes. <span className="opacity-90">Hire India’s Top Tax Experts to review your filing.</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href={ctaHref}>
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-black text-blue-600 transition hover:bg-blue-50 hover:scale-105 active:scale-95 sm:text-sm">
                  Book a CA Now <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
              <button 
                onClick={() => setIsCtaVisible(false)}
                className="rounded-full p-1.5 transition hover:bg-white/10"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-white/5 blur-3xl" />
        </div>
      )}

      <main className="mx-auto grid max-w-[1680px] gap-8 px-4 py-8 sm:px-6 lg:px-8 xl:grid-cols-[240px_minmax(0,1fr)_320px] 2xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        {/* LEFT SIDEBAR — Sticky TOC (desktop only) */}
        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 [scrollbar-width:thin]">
            <TocPanel toc={toc} activeId={activeTocId} />
          </div>
        </aside>

        <article className="min-w-0">
          <header className="mb-10">
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-blue-600 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-lg shadow-blue-200">
                {getCategoryName(post)}
              </span>
              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-emerald-700">
                {getAudienceLabel(post.audience)}
              </span>
              {(post.reviewedBy || post.reviewedAt) && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-blue-700 shadow-sm">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  Expert reviewed
                </span>
              )}
            </div>

            <h1 className="text-4xl font-black leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-8 text-xl font-medium leading-[1.6] text-slate-600">
                {post.excerpt}
              </p>
            )}

            <div className="mt-10 flex flex-wrap items-center justify-between gap-6 border-y border-slate-100 py-6">
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-lg font-black text-white shadow-lg ring-4 ring-blue-50">
                    {getInitials(authorName)}
                  </div>
                  <div>
                    <p className="text-[15px] font-black leading-none text-slate-950">{authorName}</p>
                    <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-blue-600">{getAuthorRole(post)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Published On</span>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                      <CalendarDays className="h-4 w-4 text-blue-500" />
                      {formatDate(getPublishedDate(post))}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Read Time</span>
                    <span className="inline-flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Clock3 className="h-4 w-4 text-blue-500" />
                      {getReadTime(post)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <ShareButtons title={post.title} description={post.excerpt ?? post.title} />
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  aria-label="Print article"
                >
                  <Printer className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Inline TOC — mobile/tablet only */}
          <div className="xl:hidden">
            <InlineToc toc={toc} activeId={activeTocId} />
          </div>

          {isImageUrl(coverImage) && (
            <div className="mb-10 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-slate-50 shadow-2xl shadow-blue-100/30">
              <img src={coverImage ?? ""} alt={post.title} className="max-h-[500px] w-full object-cover" />
            </div>
          )}

          {highlights.length > 0 && (
            <section className="mb-12 rounded-[2.5rem] bg-slate-950 p-8 text-white sm:p-10">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Key takeaways</h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <div key={highlight} className="flex gap-4 rounded-3xl bg-white/5 p-5 text-[15px] leading-relaxed transition hover:bg-white/10">
                    <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                    <p>{highlight}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section
            className={cn(
              "prose prose-slate max-w-none prose-p:text-[18px] prose-p:leading-[1.8] prose-p:text-slate-700",
              "prose-headings:scroll-mt-32 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-950",
              "prose-h2:mt-16 prose-h2:mb-8 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-4 prose-h2:text-4xl",
              "prose-h3:mt-10 prose-h3:text-2xl",
              "prose-li:text-[18px] prose-li:leading-[1.8] prose-li:text-slate-700",
              "prose-a:font-bold prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline",
              "prose-strong:font-black prose-strong:text-slate-950",
              "prose-blockquote:rounded-r-3xl prose-blockquote:border-l-[6px] prose-blockquote:border-blue-600 prose-blockquote:bg-blue-50/50 prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:not-italic prose-blockquote:text-slate-800 prose-blockquote:font-medium prose-blockquote:text-lg",
              "prose-table:overflow-hidden prose-table:rounded-[2rem] prose-table:border prose-table:border-slate-200",
              "prose-th:bg-blue-600 prose-th:px-6 prose-th:py-4 prose-th:text-left prose-th:text-sm prose-th:font-black prose-th:uppercase prose-th:tracking-wider prose-th:text-white",
              "prose-td:px-6 prose-td:py-4 prose-td:text-[15px] prose-td:text-slate-700",
              "prose-img:rounded-[2rem] prose-img:border prose-img:border-slate-100",
            )}
            dangerouslySetInnerHTML={{ __html: normalizedContent.html }}
          />

          <div className="mt-16 space-y-12">
            <section className="rounded-3xl border border-amber-200 bg-amber-50/50 p-8 text-[15px] leading-relaxed text-slate-700 sm:p-10">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-amber-600" />
                <h2 className="text-xl font-black text-slate-950">Professional Disclaimer</h2>
              </div>
              <p>
                This guide is for general awareness and educational purposes only. Tax laws, compliance deadlines, and regulatory notifications are subject to change. This content may not cover every unique fact pattern or exception applicable to your case. Always seek professional CA advice before acting on tax, GST, investment, or business compliance decisions.
              </p>
              {post.sourceLinks?.length > 0 && (
                <div className="mt-8 border-t border-amber-200 pt-6">
                  <p className="mb-4 text-xs font-black uppercase tracking-[0.18em] text-amber-700">Official Sources & References</p>
                  <div className="flex flex-wrap gap-3">
                    {post.sourceLinks.map((source) => (
                      <a
                        key={`${source.label}-${source.url}`}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-bold text-amber-800 transition hover:border-amber-400"
                      >
                        {source.label}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <section className="relative overflow-hidden rounded-[3rem] bg-slate-950 p-8 text-white sm:p-12 shadow-2xl shadow-blue-900/20">
              <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-600/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-blue-400">
                    Expert Assistance
                  </div>
                  <h2 className="text-3xl font-black leading-tight sm:text-4xl">Get a MyeCA Expert to review your case.</h2>
                  <p className="mt-4 text-lg text-slate-400 leading-relaxed">
                    Don't leave your taxes to chance. Connect with our experienced CAs for expert filing, notice management, and business advisory tailored to your exact needs.
                  </p>
                </div>
                <ActionLink
                  href={ctaHref}
                  className="inline-flex shrink-0 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-8 py-4 text-base font-black text-white transition-all hover:bg-blue-700 hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/30"
                >
                  {ctaLabel}
                  <ArrowRight className="h-5 w-5" />
                </ActionLink>
              </div>
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-[100px]" />
              <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-indigo-600/10 blur-[100px]" />
            </section>

            {(post.authorBio || authorName) && (
              <section className="rounded-3xl border border-slate-200 bg-slate-50/30 p-8 sm:p-10">
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-black text-white shadow-lg">
                    {getInitials(authorName)}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-950">{authorName}</h3>
                    <p className="mt-1 text-sm font-bold text-blue-700 uppercase tracking-widest">{getAuthorRole(post)}</p>
                    <p className="mt-4 text-base leading-relaxed text-slate-600">
                      {post.authorBio || "MyeCA editorial guides are written to make Indian tax and compliance decisions easier to understand and act on."}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {faqItems.length > 0 && (
              <section>
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <MessageSquare className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-950">Common Questions</h2>
                    <p className="mt-1 text-sm font-bold text-slate-500 uppercase tracking-widest">Quick insights & answers</p>
                  </div>
                </div>
                <div className="divide-y divide-slate-100 overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
                  {faqItems.map((faq, index) => (
                    <details key={`${faq.question}-${index}`} className="group p-6 transition-colors open:bg-blue-50/30 hover:bg-slate-50/50">
                      <summary className="flex cursor-pointer list-none items-center justify-between text-[17px] font-black leading-snug text-slate-950 marker:hidden">
                        {faq.question}
                        <ChevronDown className="h-5 w-5 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
                      </summary>
                      <div className="mt-4 text-base leading-relaxed text-slate-600">
                        {faq.answer}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {relatedPosts.length > 0 && (
              <section>
                <div className="mb-8 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-950">Related Reading</h2>
                    <p className="mt-1 text-sm font-bold text-slate-500 uppercase tracking-widest">Expand your knowledge</p>
                  </div>
                  <Link href="/blog">
                    <span className="inline-flex items-center gap-2 text-sm font-black text-blue-700 transition-all hover:gap-3">
                      View Hub <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                  {relatedPosts.slice(0, 3).map((related) => (
                    <RelatedCard key={related.id} post={related} />
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
              <div className="mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-black text-slate-950">Explore More Topics</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {topicLinks.map((topic) => (
                  <Link key={topic.href + topic.label} href={topic.href}>
                    <span className="inline-flex items-center rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition-all hover:bg-blue-600 hover:text-white">
                      {topic.label}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <div className="flex items-center justify-center pt-8">
              <Link href="/blog">
                <span className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-black text-slate-950 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl hover:shadow-blue-100/50">
                  <ArrowLeft className="h-5 w-5" />
                  Return to Knowledge Hub
                </span>
              </Link>
            </div>
          </div>
        </article>

        {/* RIGHT SIDEBAR (desktop only) */}
        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-5">
            {/* Article Info */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Article info</p>
              </div>
              <div className="space-y-2.5 text-sm text-slate-600">
                <p><span className="font-bold text-slate-900">Author:</span> {authorName}</p>
                <p><span className="font-bold text-slate-900">Updated:</span> {formatDate(getPublishedDate(post))}</p>
                <p><span className="font-bold text-slate-900">Read time:</span> {getReadTime(post)}</p>
                {post.reviewedBy && (
                  <p className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /><span className="font-bold text-slate-900">Reviewed by</span> {post.reviewedBy}</p>
                )}
              </div>
            </div>

            {/* Useful Next Steps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-black text-slate-950">Useful next steps</h2>
              <div className="space-y-3">
                <Link href={serviceHref(post.serviceSlug)}>
                  <span className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Related service
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link href={calculatorHref(post.calculatorSlug)}>
                  <span className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                    <span className="inline-flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-blue-600" />
                      Related calculator
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <ActionLink
                  href={ctaHref}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white transition hover:bg-blue-700"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </ActionLink>
              </div>
            </div>

            {/* Browse by Topics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="border-b border-blue-100 pb-3 text-base font-black text-slate-950">Browse by topics</h2>
              <div className="mt-3 max-h-[360px] space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
                {topicLinks.map((topic) => (
                  <Link key={topic.href + topic.label} href={topic.href}>
                    <span className="block rounded-xl px-3 py-2 text-sm font-medium leading-snug text-slate-600 transition hover:bg-blue-50 hover:text-blue-700">
                      {topic.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Articles in sidebar */}
            {relatedPosts.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-black text-slate-950">Related articles</h2>
                <div className="space-y-3">
                  {relatedPosts.slice(0, 3).map((related) => (
                    <RelatedCard key={related.id} post={related} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
