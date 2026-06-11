import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, ArrowUp, BookOpen, BriefcaseBusiness, CalendarDays,
  ChevronRight, Clock3, Sparkles, UserRound, Share2, CheckCircle2,
  FileText, MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import ShareButtons from "@/components/ShareButtons";
import BlogCard from "@/components/blog/BlogCard";
import { getBlogCoverImageSrc, isGeneratedBlogCover } from "@/lib/blog-cover-assets";
import { cn } from "@/lib/utils";
import { sanitizeHTML } from "@/lib/sanitize";
import { type BlogSourceLink, type BlogTocItem, type PublicBlogDetail, type PublicBlogSummary, normalizeBlogContent, normalizeBlogToc } from "@shared/blog";

export interface EditorialArticleData {
  id?: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  category?: PublicBlogSummary["category"] | null;
  tags?: string[];
  coverImage?: string | null;
  authorName: string;
  authorRole?: string | null;
  authorBio?: string | null;
  publishedAt?: string | null;
  readingTimeMinutes: number;
  content: string;
  keyHighlights?: string[];
  toc?: BlogTocItem[];
  faqItems?: PublicBlogDetail["faqItems"];
  relatedPosts?: PublicBlogSummary[];
  ctaLabel?: string;
  ctaHref?: string;
  audience?: "individuals" | "businesses" | "both" | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewerName?: string | null;
  reviewerRole?: string | null;
  reviewerCredentialName?: string | null;
  reviewerCredentialId?: string | null;
  reviewerCredentialAuthority?: string | null;
  sourceLinks?: BlogSourceLink[];
  serviceSlug?: string | null;
  calculatorSlug?: string | null;
  canonicalUrl?: string | null;
}

interface BlogArticleProps {
  post: EditorialArticleData;
  isPreview?: boolean;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Draft";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Draft";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

function isImageUrl(value: string | null | undefined) {
  return Boolean(value && /^(https?:\/\/|\/)/.test(value));
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function getVerifiedReviewer(post: EditorialArticleData) {
  if (!post.reviewerName || !post.reviewerCredentialName || !post.reviewerCredentialId) return null;
  return {
    name: post.reviewerName,
    credentialName: post.reviewerCredentialName,
    credentialId: post.reviewerCredentialId,
  };
}

function ActionLink({ href, label, variant = "solid", size = "md", className, children }: {
  href: string;
  label?: string;
  variant?: "solid" | "ghost" | "outline";
  size?: "sm" | "md";
  className?: string;
  children?: React.ReactNode;
}) {
  const base = "inline-flex items-center justify-center font-semibold transition rounded-xl gap-2 whitespace-nowrap";
  const sizes = size === "sm" ? "h-9 px-4 text-sm" : "h-11 px-5 text-sm";
  const styles = {
    solid: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
    ghost: "text-blue-700 hover:bg-blue-50",
    outline: "border border-blue-200 text-blue-700 hover:bg-blue-50",
  }[variant];

  const cls = className ?? cn(base, sizes, styles);
  const content = children ?? label;

  if (href.startsWith("/")) {
    return <Link href={href}><span className={cls}>{content}</span></Link>;
  }
  return <a href={href} className={cls} rel="noreferrer" target="_blank">{content}</a>;
}

function scrollToTocTarget(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 120, behavior: "smooth" });
}

/* Reading Progress Bar */
function ReadingProgressBar({ articleRef }: { articleRef: React.RefObject<HTMLElement | null> }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = articleRef.current;
      if (!el) return;
      const { top, height } = el.getBoundingClientRect();
      const windowH = window.innerHeight;
      const scrolled = Math.max(0, -top);
      const total = height - windowH;
      setProgress(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [articleRef]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] h-[3px] bg-slate-100">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function FixedMobileIndex({ toc, activeId }: { toc: BlogTocItem[]; activeId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeItem = toc.find((item) => item.id === activeId) ?? toc[0];

  if (toc.length === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 shadow-[0_-10px_30px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden">
      <div className="mx-auto max-w-7xl px-4 py-3 pr-24 sm:px-6">
        <button
          type="button"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="flex min-h-11 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left"
        >
          <span className="flex min-w-0 items-center gap-2">
            <BookOpen className="h-4 w-4 shrink-0 text-blue-600" />
            <span className="min-w-0">
              <span className="block type-meta font-black uppercase tracking-[2px] text-slate-400">Index</span>
              <span className="block truncate text-sm font-semibold text-slate-900">{activeItem?.text ?? "Sections"}</span>
            </span>
          </span>
          <ChevronRight className={cn("h-4 w-4 shrink-0 text-slate-400 transition", isOpen ? "-rotate-90" : "rotate-90")} />
        </button>

        {isOpen && (
          <nav aria-label="Article sections" className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
            <ul className="space-y-1">
              {toc.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      aria-current={isActive ? "location" : undefined}
                      onClick={() => {
                        scrollToTocTarget(item.id);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "min-h-10 w-full rounded-lg px-3 py-2 text-left text-sm leading-snug transition",
                        item.level === 3 ? "pl-6" : "",
                        isActive
                          ? "bg-blue-50 font-semibold text-blue-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      {item.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}

/* Right Sidebar */
function RightSidebar({
  post,
  toc,
  activeId,
  relatedPosts,
  activeTab,
  onTabChange,
}: {
  post: EditorialArticleData;
  toc: BlogTocItem[];
  activeId: string;
  relatedPosts: PublicBlogSummary[];
  activeTab: "related" | "info";
  onTabChange: (tab: "related" | "info") => void;
}) {
  const verifiedReviewer = getVerifiedReviewer(post);

  return (
    <div className="space-y-5">
      {/* "In this article" TOC, always visible */}
      {toc.length > 0 && (
        <nav aria-label="Table of contents" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-blue-500" />
              <p className="type-meta font-black uppercase tracking-[2px] text-slate-400">Index</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 type-meta font-semibold text-slate-500">
              {toc.length} sections
            </span>
          </div>
          <ul className="space-y-1">
            {toc.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={isActive ? "location" : undefined}
                    onClick={() => scrollToTocTarget(item.id)}
                    className={cn(
                      "min-h-9 w-full rounded-lg border-l-2 px-3 py-2 text-left type-support leading-snug transition-all duration-200",
                      item.level === 3 ? "pl-5" : "",
                      isActive
                        ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
                        : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-200 hover:bg-slate-50",
                    )}
                  >
                    {item.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Tabbed section: Related / Info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Pill tab switcher */}
        <div className="flex items-center gap-1 mb-4 p-1 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => onTabChange("related")}
            className={cn(
              "flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all duration-200",
              activeTab === "related"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Related
          </button>
          <button
            type="button"
            onClick={() => onTabChange("info")}
            className={cn(
              "flex-1 text-xs font-semibold py-1.5 px-3 rounded-lg transition-all duration-200",
              activeTab === "info"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700",
            )}
          >
            Info
          </button>
        </div>

        {/* Related tab */}
        {activeTab === "related" && (
          <div className="space-y-3">
            {relatedPosts.length > 0 ? (
              relatedPosts.slice(0, 5).map((rel) => (
                <Link key={rel.id} href={`/blog/${rel.slug}`}>
                  <div className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-2.5 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer">
                    <div className="w-14 h-11 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-blue-50 to-slate-100">
                      {isImageUrl(rel.coverImage) ? (
                        <img
                          src={getBlogCoverImageSrc(rel.coverImage)}
                          alt={rel.title}
                          className={cn(
                            "h-full w-full",
                            isGeneratedBlogCover(rel.coverImage)
                              ? "bg-white object-contain"
                              : "object-cover",
                          )}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg opacity-40">
                          {rel.coverImage || <FileText className="h-5 w-5" aria-hidden="true" />}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="type-meta font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">
                        {rel.title}
                      </p>
                      <span className="type-meta text-slate-400 mt-1 flex items-center gap-1">
                        <Clock3 className="w-2.5 h-2.5" /> {rel.readingTimeMinutes} min
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-3">No related articles yet.</p>
            )}
            <Link href="/blog">
              <span className="flex items-center justify-center gap-1 type-meta font-semibold text-blue-600 hover:text-blue-700 transition pt-1 cursor-pointer">
                Browse all <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
        )}

        {/* Info tab */}
        {activeTab === "info" && (
          <div className="space-y-4">
            {/* Expert CTA */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-slate-700 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg border border-blue-100 bg-white flex items-center justify-center">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="type-meta font-black uppercase tracking-widest text-blue-700">Consultation Request</p>
              </div>
              <h3 className="text-sm font-bold leading-snug mb-1.5 text-slate-950">Need expert help?</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                Request a scope review for your filing or compliance case.
              </p>
              <ActionLink href={post.ctaHref ?? "/expert-consultation"} label={post.ctaLabel ?? "Request consultation"} variant="solid" size="sm" />
            </div>

            {/* Article info */}
            <div className="rounded-xl bg-slate-50 p-3.5 space-y-2">
              <p className="type-meta font-black text-slate-400 uppercase tracking-[2px]">Article info</p>
              <div className="space-y-1.5 type-support text-slate-600">
                <div className="flex items-center gap-2">
                  <UserRound className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{post.authorName}</span>
                </div>
                {post.authorRole && (
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{post.authorRole}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                {verifiedReviewer && (
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Reviewed by {verifiedReviewer.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock3 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  <span>{post.readingTimeMinutes} min read</span>
                </div>
              </div>
            </div>

            {/* Share */}
            <div>
              <p className="mb-2 type-meta font-black text-slate-400 uppercase tracking-[2px]">Share this guide</p>
              <ShareButtons title={post.title} description={post.excerpt ?? post.title} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Main Component */
export default function BlogArticle({ post, isPreview = false }: BlogArticleProps) {
  const articleRef = useRef<HTMLElement>(null);
  const [activeId, setActiveId] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const normalized = useMemo(() => normalizeBlogContent(post.content), [post.content]);
  // DOMPurify allowlist sanitize at the render sink — the shared regex pass is not sufficient.
  const safeArticleHtml = useMemo(() => sanitizeHTML(normalized.html), [normalized.html]);
  const toc = post.toc && post.toc.length > 0 ? normalizeBlogToc(post.toc) : normalized.toc;
  const highlights = post.keyHighlights ?? [];
  const faqs = post.faqItems ?? [];
  const relatedPosts = post.relatedPosts ?? [];
  const tags = post.tags ?? [];
  const verifiedReviewer = getVerifiedReviewer(post);

  const [activeRightTab, setActiveRightTab] = useState<"related" | "info">(
    relatedPosts.length > 0 ? "related" : "info",
  );

  // Scroll-spy for TOC
  useEffect(() => {
    if (toc.length === 0) return;
    const ids = toc.map((t) => t.id);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [toc]);

  // Back-to-top visibility
  useEffect(() => {
    const handle = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", handle, { passive: true });
    return () => window.removeEventListener("scroll", handle);
  }, []);

  return (
    <div className="bg-white min-h-screen pb-24 lg:pb-0">
      <ReadingProgressBar articleRef={articleRef} />
      <FixedMobileIndex toc={toc} activeId={activeId} />

      {/* Hero / Banner */}
      <div className="border-y border-blue-100 bg-blue-50/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-600 font-medium hidden sm:block [&_span]:text-slate-950">
            CA-assisted plans include documented review scope - <span className="font-semibold text-blue-700">starting Rs 999 excluding GST</span>
          </p>
          <Link href="/which-itr-form-to-file?source=blog_article_banner">
            <span className="inline-flex items-center gap-1.5 text-xs font-black bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 transition shrink-0">
              File Now <ArrowRight className="w-3 h-3" />
            </span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-slate-400 flex-wrap">
          <Link href="/"><span className="hover:text-blue-600 transition">Home</span></Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/blog"><span className="hover:text-blue-600 transition">Blog</span></Link>
          {post.category && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="hover:text-blue-600 transition cursor-pointer">{post.category.name}</span>
            </>
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="line-clamp-1 text-slate-600">{post.title}</span>
        </nav>

        {/* Article header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {post.category && (
              <Badge className="rounded-full bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 hover:bg-blue-200 transition cursor-pointer">
                {post.category.name}
              </Badge>
            )}
            {isPreview && (
              <Badge variant="outline" className="rounded-full border-amber-300 text-amber-700 bg-amber-50 text-xs px-3 py-1">
                Preview
              </Badge>
            )}
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="rounded-full border-slate-200 text-slate-500 text-xs px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="type-hero-title text-slate-900 max-w-4xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-3xl">
              {post.excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-blue-100 bg-blue-50 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                {getInitials(post.authorName)}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 leading-none">{post.authorName}</p>
                {post.authorRole && <p className="type-meta text-slate-400 mt-0.5">{post.authorRole}</p>}
              </div>
            </div>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4 text-blue-400" />
              {formatDate(post.publishedAt)}
            </span>
            {verifiedReviewer && (
              <span className="flex items-center gap-1.5">
                <BriefcaseBusiness className="h-4 w-4 text-blue-400" />
                Reviewed by {verifiedReviewer.name}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-blue-400" />
              {post.readingTimeMinutes} min read
            </span>
            <div className="ml-auto">
              <button
                type="button"
                onClick={() => setShareOpen(!shareOpen)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition border border-slate-200 rounded-full px-3 py-1.5 hover:border-blue-200 hover:bg-blue-50"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>

          {shareOpen && (
            <div className="mt-3 p-4 rounded-2xl border border-slate-200 bg-slate-50">
              <ShareButtons title={post.title} description={post.excerpt ?? post.title} />
            </div>
          )}
        </div>

        {/* Key highlights */}
        {highlights.length > 0 && (
          <section className="mb-10 rounded-2xl border border-blue-100 bg-blue-50/50 p-6 shadow-sm lg:p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-lg border border-blue-100 bg-white flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Key highlights</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {highlights.map((hl) => (
                <div key={hl} className="flex items-start gap-3 rounded-xl border border-blue-100/70 bg-white p-4 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <p className="text-sm leading-6 text-slate-700">{hl}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 2-column layout: full article and right sidebar */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px] lg:items-start">

          {/* Article */}
          <article ref={articleRef} className="min-w-0">

            {/* Prose content */}
            <div
              className="type-article-prose"
              dangerouslySetInnerHTML={{ __html: safeArticleHtml }}
            />

            {/* Mobile info panel, shown lg:hidden */}
            <div className="mt-10 lg:hidden space-y-4">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 text-slate-700 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg border border-blue-100 bg-white flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="type-meta font-black uppercase tracking-widest text-blue-700">Consultation Request</p>
                </div>
                <h3 className="text-base font-bold leading-snug mb-2 text-slate-950">Need expert help?</h3>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Request a scope review to apply these insights to your filing or compliance case.
                </p>
                <ActionLink href={post.ctaHref ?? "/expert-consultation"} label={post.ctaLabel ?? "Request consultation"} variant="solid" size="sm" />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-3 type-meta font-black text-slate-400 uppercase tracking-[2px]">Share this guide</p>
                <ShareButtons title={post.title} description={post.excerpt ?? post.title} />
              </div>
            </div>

            {/* Author bio */}
            {post.authorBio && (
              <section id="authorBio" className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6 lg:p-8">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl border border-blue-100 bg-blue-50 flex items-center justify-center text-blue-700 text-lg font-bold shrink-0">
                    {getInitials(post.authorName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900">{post.authorName}</p>
                      {post.authorRole && (
                        <Badge className="rounded-full bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                          {post.authorRole}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{post.authorBio}</p>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Editorial author</span>
                      </div>
                      {verifiedReviewer && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Reviewed by {verifiedReviewer.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ */}
            {faqs.length > 0 && (
              <section className="mt-12">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Frequently asked questions</h2>
                  </div>
                  <p className="text-sm text-slate-500 ml-11">Quick answers to common questions on this topic.</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <Accordion type="single" collapsible className="w-full divide-y divide-slate-100">
                    {faqs.map((faq, i) => (
                      <AccordionItem key={`${faq.question}-${i}`} value={`faq-${i}`} className="border-none px-6">
                        <AccordionTrigger className="text-left text-base font-semibold text-slate-900 hover:no-underline py-5 hover:text-blue-700 transition-colors">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="pb-5 text-sm leading-7 text-slate-600">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </section>
            )}

            {/* Related articles, mobile fallback */}
            {relatedPosts.length > 0 && (
              <section className="mt-12 lg:hidden">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Related articles</h2>
                    <p className="mt-1 text-sm text-slate-500">More guides from the MyeCA editorial team.</p>
                  </div>
                  <Link href="/blog">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition whitespace-nowrap">
                      Browse all <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {relatedPosts.slice(0, 4).map((rel) => (
                    <BlogCard key={rel.id} post={rel} variant="compact" />
                  ))}
                </div>
              </section>
            )}

            {/* Bottom CTA banner */}
            <section className="mt-12 rounded-2xl border border-blue-100 bg-blue-50/60 p-6 lg:p-8 text-slate-700 shadow-sm overflow-hidden relative">
              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700 mb-2">Next step</p>
                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-950">
                    Ready to put this into action?
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Get hands-on help with ITR filing, GST, tax planning, and business compliance after confirming the scope and records required.
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <ActionLink
                    href={post.ctaHref ?? "/expert-consultation"}
                    className="group inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-200/70 transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 sm:w-auto"
                  >
                    {post.ctaLabel ?? "Talk to a CA"}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </ActionLink>
                  <Link href="/blog">
                    <span className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:w-auto">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                      More articles
                    </span>
                  </Link>
                </div>
              </div>
            </section>
          </article>

          {/* Right sidebar, fixed/sticky on large screens */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <RightSidebar
                post={post}
                toc={toc}
                activeId={activeId}
                relatedPosts={relatedPosts}
                activeTab={activeRightTab}
                onTabChange={setActiveRightTab}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Back to top */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-24 right-6 z-50 w-11 h-11 rounded-full bg-white border border-slate-200 shadow-lg flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:shadow-blue-100 transition-all lg:bottom-6"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
