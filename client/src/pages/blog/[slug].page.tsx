import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";
import ShareButtons from "@/components/ShareButtons";
import MetaSEO from "@/components/seo/MetaSEO";
import BlogFeedback from "@/components/blog/BlogFeedback";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import {
  formatDate,
  getAuthorName,
  getAuthorRole,
  getCategoryId,
  getCategoryName,
  getCoverImage,
  getInitials,
  getPublishedDate,
  getReadTime,
  isImageUrl,
  writeBlogLastRead,
} from "@/components/blog/blog-post-helpers";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import ScrollToTop from "@/components/ui/scroll-to-top";
import {
  DEFAULT_PUBLIC_BLOG_CATEGORIES,
  fetchPublicBlogDetail,
  fetchPublicBlogs,
  publicBlogQueryKeys,
  type PublicBlogDetailCompat as BlogDetail,
} from "@/lib/public-blog-data";
import { getBlogConversionLinks } from "@/lib/blog-conversion-links";
import { cn } from "@/lib/utils";
import { sanitizeHTML } from "@/lib/sanitize";
import {
  normalizeBlogContent,
  normalizeBlogToc,
  type BlogFaqItem,
  type BlogTocItem,
} from "@shared/blog";

const CTA_DISMISS_STORAGE_KEY = "myeca:blog:cta-dismissed";

function getVerifiedReviewer(post: BlogDetail) {
  if (!post.reviewerName || !post.reviewerCredentialName || !post.reviewerCredentialId) return null;
  return {
    name: post.reviewerName,
    credentialName: post.reviewerCredentialName,
    credentialId: post.reviewerCredentialId,
    credentialAuthority: post.reviewerCredentialAuthority || undefined,
  };
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

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollToHeading(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - 108,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let frame = 0;
    const update = () => {
      const doc = document.documentElement;
      const maxScroll = doc.scrollHeight - window.innerHeight;
      setProgress(maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5">
      <div className="h-full origin-left bg-blue-600" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
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
      <div className="mb-4 flex flex-nowrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <BookOpen className="h-4 w-4 shrink-0 text-blue-600" />
          <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Index</p>
        </div>
        <span className="type-meta shrink-0 whitespace-nowrap rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700">
          {toc.length} sections
        </span>
      </div>
      <div className="space-y-0.5">
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? "location" : undefined}
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                "type-support block min-h-9 w-full rounded-lg border-l-[3px] px-3 py-2 text-left leading-snug transition-all",
                item.level === 3 && "type-meta pl-6",
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
  const [isOpen, setIsOpen] = useState(false);

  if (toc.length === 0) return null;

  return (
    <div className="my-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-100/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <BookOpen className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
          <span className="truncate text-sm font-bold text-slate-950">On this page</span>
          <span className="type-meta shrink-0 rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-700">
            {toc.length} sections
          </span>
        </span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform duration-300", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <nav aria-label="Article index" className="border-t border-slate-200 p-4">
          <div className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => scrollToHeading(item.id)}
                  className={cn(
                    "type-support block py-1.5 text-left leading-snug transition",
                    item.level === 3 && "type-meta pl-6",
                    isActive ? "font-bold text-blue-700" : "text-slate-600 hover:text-blue-700"
                  )}
                >
                  {item.text}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}

function MobileTocDrawer({
  toc,
  activeId,
  open,
  onOpenChange,
  onNavigate,
}: {
  toc: BlogTocItem[];
  activeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[75vh]">
        <DrawerHeader className="border-b border-slate-100 pb-3 text-left">
          <DrawerTitle className="flex items-center gap-2 text-slate-950">
            <BookOpen className="h-5 w-5 text-blue-600" aria-hidden="true" />
            On this page
          </DrawerTitle>
        </DrawerHeader>
        <nav
          aria-label="Article index"
          className="overflow-y-auto p-4 pb-[calc(env(safe-area-inset-bottom)+20px)]"
        >
          <div className="space-y-0.5">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => onNavigate(item.id)}
                  className={cn(
                    "type-support block min-h-11 w-full rounded-lg border-l-[3px] px-3 py-2.5 text-left leading-snug transition",
                    item.level === 3 && "type-meta pl-6",
                    isActive
                      ? "border-blue-600 bg-blue-50 font-bold text-blue-700"
                      : "border-transparent text-slate-600",
                  )}
                >
                  {item.text}
                </button>
              );
            })}
          </div>
        </nav>
      </DrawerContent>
    </Drawer>
  );
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-[72ch] px-4 py-10 sm:px-6">
        <Skeleton className="h-4 w-52" />
        <div className="mt-7 flex gap-2">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-7 w-36 rounded-full" />
        </div>
        <Skeleton className="mt-6 h-10 w-full" />
        <Skeleton className="mt-3 h-10 w-3/4" />
        <Skeleton className="mt-7 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-11/12" />
        <div className="mt-8 flex items-center gap-3 border-y border-slate-100 py-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="mt-10 space-y-4">
          {[100, 92, 97, 88, 100, 95, 90, 84].map((width, index) => (
            <Skeleton key={index} className="h-4" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams() as { slug?: string };
  const [activeTocId, setActiveTocId] = useState("");
  const [isTocDrawerOpen, setIsTocDrawerOpen] = useState(false);
  const [showTocChip, setShowTocChip] = useState(false);
  const inlineTocRef = useRef<HTMLDivElement | null>(null);
  const [isCtaVisible, setIsCtaVisible] = useState(() => {
    try {
      return sessionStorage.getItem(CTA_DISMISS_STORAGE_KEY) !== "1";
    } catch {
      return true;
    }
  });

  const { data: postData, isLoading } = useQuery({
    queryKey: publicBlogQueryKeys.detail(slug),
    queryFn: () => fetchPublicBlogDetail(slug ?? ""),
    enabled: Boolean(slug),
  });

  const shouldFetchFallbackPosts = Boolean(postData && postData.relatedPosts.length === 0);
  const { data: allPostsData } = useQuery({
    queryKey: publicBlogQueryKeys.list({ page: 1, limit: 24 }),
    queryFn: () => fetchPublicBlogs({ page: 1, limit: 24 }),
    enabled: shouldFetchFallbackPosts,
  });

  const post = postData;
  const normalizedContent = useMemo(() => normalizeBlogContent(post?.content ?? ""), [post?.content]);
  // DOMPurify allowlist sanitize at the render sink — the shared regex pass is not sufficient.
  const safeContentHtml = useMemo(() => sanitizeHTML(normalizedContent.html), [normalizedContent.html]);
  const toc = post?.toc && post.toc.length > 0 ? normalizeBlogToc(post.toc) : normalizedContent.toc;
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
    const allPosts = post?.relatedPosts.length ? post.relatedPosts : (allPostsData?.posts ?? []);
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

  // Show the floating "Contents" chip once the reader scrolls past the inline TOC.
  useEffect(() => {
    const el = inlineTocRef.current;
    if (!el || toc.length === 0) {
      setShowTocChip(false);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setShowTocChip(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [toc]);

  useEffect(() => {
    if (!post?.slug || !post.title) return;
    writeBlogLastRead({ slug: post.slug, title: post.title, at: new Date().toISOString() });
  }, [post?.slug, post?.title]);

  if (isLoading) {
    return <ArticleSkeleton />;
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <BookOpen className="mx-auto mb-5 h-12 w-12 text-blue-200" />
          <h1 className="text-2xl font-bold text-slate-950">Article not found</h1>
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
  const conversionLinks = getBlogConversionLinks(post);
  const verifiedReviewer = getVerifiedReviewer(post);

  const dismissCta = () => {
    setIsCtaVisible(false);
    try {
      sessionStorage.setItem(CTA_DISMISS_STORAGE_KEY, "1");
    } catch {
      // Session storage unavailable — dismissal lasts for this view only.
    }
  };

  const navigateFromDrawer = (id: string) => {
    setIsTocDrawerOpen(false);
    // Wait for the drawer close animation + scroll unlock before jumping.
    window.setTimeout(() => scrollToHeading(id), 350);
  };

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
          reviewedBy: verifiedReviewer
            ? {
                "@type": "Person",
                name: verifiedReviewer.name,
                hasCredential: {
                  "@type": "EducationalOccupationalCredential",
                  name: verifiedReviewer.credentialName,
                  credentialCategory: verifiedReviewer.credentialId,
                  recognizedBy: verifiedReviewer.credentialAuthority
                    ? { "@type": "Organization", name: verifiedReviewer.credentialAuthority }
                    : undefined,
                },
              }
            : undefined,
          about: [getCategoryName(post), ...tags].filter(Boolean),
        }}
      />

      <ReadingProgressBar />

      {/* Hero CTA Banner */}
      {isCtaVisible && (
        <div className="relative overflow-hidden border-y border-blue-100 bg-blue-50/80 text-slate-700 shadow-sm">
          <div className="mx-auto flex min-h-12 max-w-7xl flex-nowrap items-center justify-center gap-5 px-4 sm:px-6 lg:px-8">
            <div className="hidden min-h-10 min-w-0 translate-y-2 items-center gap-3 sm:flex">
              <Sparkles className="-translate-y-2 h-4 w-4 shrink-0 text-blue-600" />
              <p className="flex min-h-10 items-center gap-1 truncate text-sm font-semibold leading-none sm:text-base">
                Need a document-based filing review? <span className="opacity-90">Check the scope before you start.</span>
              </p>
            </div>
            <div className="flex min-h-10 shrink-0 items-center gap-4">
              <Link href={ctaHref}>
                <span className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full bg-blue-600 px-5 text-xs font-semibold leading-none text-white transition hover:bg-blue-700 active:scale-95 sm:text-sm">
                  Review filing options <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
              <button
                onClick={dismissCta}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="mx-auto grid max-w-[1680px] gap-8 px-4 py-8 sm:px-6 lg:px-8 xl:grid-cols-[240px_minmax(0,1fr)_320px] 2xl:grid-cols-[260px_minmax(0,1fr)_340px]">
        {/* LEFT SIDEBAR — Sticky TOC (desktop only) */}
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <TocPanel toc={toc} activeId={activeTocId} />
          </div>
        </aside>

        <article className="min-w-0">
          <div className="mx-auto w-full max-w-[72ch]">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold text-slate-500">
                <li>
                  <Link href="/">
                    <span className="transition hover:text-blue-700">Home</span>
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                </li>
                <li>
                  <Link href="/blog">
                    <span className="transition hover:text-blue-700">Tax Guides</span>
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                </li>
                <li aria-current="page" className="min-w-0 truncate text-slate-900">
                  {getCategoryName(post)}
                </li>
              </ol>
            </nav>

            <header className="mb-8">
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <span className="type-meta rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 font-semibold uppercase text-blue-700">
                  {getCategoryName(post)}
                </span>
                <span className="type-meta rounded-full border border-emerald-100 bg-emerald-50 px-4 py-1.5 font-semibold uppercase text-emerald-700">
                  {getAudienceLabel(post.audience)}
                </span>
                {verifiedReviewer && (
                  <span className="type-meta inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-4 py-1.5 font-semibold uppercase text-blue-700 shadow-sm">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    Reviewed by {verifiedReviewer.name}
                  </span>
                )}
              </div>

              <h1 className="type-hero-title font-bold text-slate-950">
                {post.title}
              </h1>

              {post.excerpt && (
                <p className="mt-6 text-xl font-normal leading-[1.6] text-slate-600">
                  {post.excerpt}
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-slate-100 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                    {getInitials(authorName)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-slate-950">{authorName}</span>
                    <span className="block truncate text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {getAuthorRole(post)}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-semibold text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-blue-400" aria-hidden="true" />
                    Updated {formatDate(post.updatedAt ?? getPublishedDate(post), "long")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-4 w-4 text-blue-400" aria-hidden="true" />
                    {getReadTime(post)}
                  </span>
                </div>
                <div className="ml-auto xl:hidden">
                  <ShareButtons title={post.title} description={post.excerpt ?? post.title} showCopy={false} />
                </div>
              </div>
            </header>

            {/* Inline TOC — mobile/tablet only */}
            <div ref={inlineTocRef} className="xl:hidden">
              <InlineToc toc={toc} activeId={activeTocId} />
            </div>

            {highlights.length > 0 && (
              <section className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/50 p-4 text-slate-700 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-100 bg-white">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-950">Key takeaways</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {highlights.map((highlight) => (
                    <div key={highlight} className="type-support flex min-h-16 items-start gap-3 rounded-xl border border-blue-100/70 bg-white px-4 py-3 text-slate-700 shadow-sm transition hover:border-blue-200">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                      <p>{highlight}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section
              className="type-article-prose"
              dangerouslySetInnerHTML={{ __html: safeContentHtml }}
            />

            <BlogFeedback slug={post.slug} hasRelated={relatedPosts.length > 0} />
          </div>

          <div className="mt-14 space-y-12">
            <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-white text-blue-600">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-950">Continue from this article</h2>
                  <p className="mt-1 text-sm text-slate-600">Move from reading into calculation, service scope, pricing, or filing.</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {conversionLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span className="group flex min-h-24 items-start justify-between gap-4 rounded-xl border border-blue-100 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-950 group-hover:text-blue-700">{link.label}</span>
                        <span className="mt-1 block text-sm leading-6 text-slate-600">{link.description}</span>
                      </span>
                      <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <div className="mx-auto w-full max-w-[72ch] space-y-12">
              <section className="type-support rounded-3xl border border-amber-200 bg-amber-50/50 p-6 text-slate-700 sm:p-8">
                <div className="mb-4 flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-amber-600" />
                  <h2 className="text-xl font-bold text-slate-950">Professional Disclaimer</h2>
                </div>
                <p>
                  This guide is for general awareness and educational purposes only. Tax laws, compliance deadlines, and regulatory notifications are subject to change. This content may not cover every unique fact pattern or exception applicable to your case. Always seek professional CA advice before acting on tax, GST, investment, or business compliance decisions.
                </p>
                {post.sourceLinks?.length > 0 && (
                  <div className="mt-8 border-t border-amber-200 pt-6">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Official Sources & References</p>
                    <div className="flex flex-wrap gap-3">
                      {post.sourceLinks.map((source) => (
                        <a
                          key={`${source.label}-${source.url}`}
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-4 py-2 text-sm font-medium text-amber-800 transition hover:border-amber-400"
                        >
                          {source.label}
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              {(post.authorBio || authorName) && (
                <section className="rounded-3xl border border-slate-200 bg-slate-50/30 p-6 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-xl font-bold text-blue-700">
                      {getInitials(authorName)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-950">{authorName}</h3>
                      <p className="mt-1 text-sm font-medium text-blue-700 uppercase tracking-widest">{getAuthorRole(post)}</p>
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
                      <h2 className="type-section-title font-bold tracking-tight text-slate-950">Common Questions</h2>
                      <p className="mt-1 text-sm font-medium text-slate-500 uppercase tracking-widest">Quick insights & answers</p>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100 overflow-hidden rounded-[2rem] border border-slate-200 bg-white">
                    {faqItems.map((faq, index) => (
                      <details key={`${faq.question}-${index}`} className="group p-6 transition-colors open:bg-blue-50/30 hover:bg-slate-50/50">
                        <summary className="type-body flex cursor-pointer list-none items-center justify-between font-semibold text-slate-950 marker:hidden">
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
            </div>

            {relatedPosts.length > 0 && (
              <section
                id="related-reading"
                style={{ contentVisibility: 'auto', contain: 'content', containIntrinsicSize: '0 420px' }}
              >
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="type-section-title font-bold tracking-tight text-slate-950">Related Reading</h2>
                    <p className="mt-1 text-sm font-medium text-slate-500 uppercase tracking-widest">Expand your knowledge</p>
                  </div>
                  <Link href="/blog">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition-all hover:gap-3">
                      View Hub <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
                <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0">
                  {relatedPosts.slice(0, 3).map((related) => (
                    <BlogPostCard
                      key={related.id}
                      post={related}
                      variant="compact"
                      className="w-[240px] shrink-0 snap-start sm:w-auto"
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-950">Explore More Topics</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {topicLinks.map((topic) => (
                  <Link key={topic.href + topic.label} href={topic.href}>
                    <span className="inline-flex items-center rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-blue-600 hover:text-white">
                      {topic.label}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            <div className="flex items-center justify-center pt-6">
              <Link href="/blog">
                <span className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-950 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-xl hover:shadow-blue-100/50">
                  <ArrowLeft className="h-5 w-5" />
                  Return to Knowledge Hub
                </span>
              </Link>
            </div>
          </div>
        </article>

        {/* RIGHT SIDEBAR (desktop only) */}
        <aside className="hidden xl:block">
          <div className="sticky top-24 max-h-[calc(100vh-7rem)] space-y-5 overflow-y-auto pb-4 pr-1">
            {/* Article Info */}
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
              <div className="mb-3 flex h-5 items-center gap-2">
                <UserRound className="h-4 w-4 shrink-0 text-blue-600" />
                <p className="m-0 text-xs font-semibold uppercase leading-none tracking-[0.18em] text-blue-600">Article info</p>
              </div>
              <div className="space-y-2.5 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">Author:</span> {authorName}</p>
                <p><span className="font-semibold text-slate-900">Updated:</span> {formatDate(getPublishedDate(post), "long")}</p>
                <p><span className="font-semibold text-slate-900">Read time:</span> {getReadTime(post)}</p>
                {verifiedReviewer && (
                  <p className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /><span className="font-semibold text-slate-900">Reviewed by -</span> {verifiedReviewer.name} ({verifiedReviewer.credentialName})</p>
                )}
              </div>
              <div className="mt-5 border-t border-blue-100 pt-4">
                <p className="type-meta mb-3 font-semibold uppercase text-blue-600">Share article</p>
                <div className="flex items-center gap-3">
                  <ShareButtons title={post.title} description={post.excerpt ?? post.title} showCopy={false} />
                </div>
              </div>
            </div>

            {/* Useful Next Steps */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 text-base font-bold text-slate-950">Useful next steps</h2>
              <div className="flex flex-col gap-3">
                <Link href={serviceHref(post.serviceSlug)}>
                  <span className="group flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md">
                    <span className="inline-flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-white">
                        <FileText className="h-4 w-4" />
                      </span>
                      <span className="truncate">Related service</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </span>
                </Link>
                <Link href={calculatorHref(post.calculatorSlug)}>
                  <span className="group flex min-h-14 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md">
                    <span className="inline-flex min-w-0 items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition group-hover:bg-white">
                        <Calculator className="h-4 w-4" />
                      </span>
                      <span className="truncate">Related calculator</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                  </span>
                </Link>
                <ActionLink
                  href={ctaHref}
                  className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black text-white shadow-lg shadow-blue-200/70 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200"
                >
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </ActionLink>
              </div>
            </div>

            {/* Browse Topics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="border-b border-blue-100 pb-3 text-base font-bold text-slate-950">Browse topics</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {DEFAULT_PUBLIC_BLOG_CATEGORIES.slice(0, 8).map((category) => (
                  <Link key={category.id} href="/blog">
                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                      {category.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Related Articles in sidebar */}
            {relatedPosts.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-bold text-slate-950">Related articles</h2>
                <div className="space-y-3">
                  {relatedPosts.slice(0, 3).map((related) => (
                    <BlogPostCard key={related.id} post={related} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </main>

      {/* Floating mobile TOC chip + drawer */}
      {toc.length > 0 && showTocChip && (
        <button
          type="button"
          onClick={() => setIsTocDrawerOpen(true)}
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+84px)] left-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-300/50 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 xl:hidden"
        >
          <BookOpen className="h-4 w-4" aria-hidden="true" />
          Contents
        </button>
      )}
      <MobileTocDrawer
        toc={toc}
        activeId={activeTocId}
        open={isTocDrawerOpen}
        onOpenChange={setIsTocDrawerOpen}
        onNavigate={navigateFromDrawer}
      />

      <ScrollToTop
        threshold={600}
        className="bottom-[calc(env(safe-area-inset-bottom)+84px)] right-4 z-40 lg:bottom-8 lg:right-8"
      />
    </div>
  );
}
