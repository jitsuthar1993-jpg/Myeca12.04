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
  Loader2,
  MessageSquare,
  Printer,
  Sparkles,
  UserRound,
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

function TocPanel({ toc, activeId, mobile = false }: { toc: BlogTocItem[]; activeId: string; mobile?: boolean }) {
  if (toc.length === 0) return null;

  return (
    <nav
      aria-label="Article index"
      className={cn(
        "rounded-2xl border border-blue-100 bg-white shadow-sm",
        mobile ? "mb-8 p-4" : "p-4",
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-blue-600" />
        <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Index</p>
      </div>
      <div className={cn("space-y-1", !mobile && "max-h-[calc(100vh-180px)] overflow-y-auto pr-1 [scrollbar-width:thin]")}>
        {toc.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToHeading(item.id)}
              className={cn(
                "block w-full rounded-xl border-l-2 px-3 py-2 text-left text-sm leading-snug transition",
                item.level === 3 && "pl-6 text-[13px]",
                isActive
                  ? "border-blue-600 bg-blue-50 font-bold text-blue-700"
                  : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-blue-700",
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

function RelatedCard({ post }: { post: BlogSummary | PublicBlogSummary }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <article className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-blue-200 hover:bg-blue-50/40">
        <p className="mb-2 text-xs font-bold text-blue-700">{getCategoryName(post)}</p>
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition group-hover:text-blue-700">
          {post.title}
        </h3>
        <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Clock3 className="h-3.5 w-3.5" />
          {getReadTime(post)}
        </p>
      </article>
    </Link>
  );
}

export default function BlogPostPage() {
  const { slug } = useParams() as { slug?: string };
  const [activeTocId, setActiveTocId] = useState("");

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
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Knowledge Hub", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ]}
      />

      <div className="border-b border-blue-100 bg-[#f7fbff]">
        <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <Link href="/" className="font-medium text-blue-700 hover:text-blue-800">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/blog" className="font-medium text-blue-700 hover:text-blue-800">Blog</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-medium text-slate-700">{getCategoryName(post)}</span>
          </nav>
        </div>
      </div>

      <main className="mx-auto grid max-w-[1440px] gap-8 px-4 py-8 sm:px-6 lg:px-8 xl:grid-cols-[230px_minmax(0,820px)_300px] xl:items-start">
        <aside className="hidden xl:block">
          <div className="sticky top-24">
            <TocPanel toc={toc} activeId={activeTocId} />
          </div>
        </aside>

        <article className="min-w-0">
          <header className="border-b border-slate-200 pb-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                {getCategoryName(post)}
              </span>
              {tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {post.excerpt}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                  {getInitials(authorName)}
                </div>
                <div>
                  <p className="font-bold leading-none text-slate-900">{authorName}</p>
                  <p className="mt-1 text-xs text-slate-500">{getAuthorRole(post)}</p>
                </div>
              </div>
              <span className="hidden h-5 w-px bg-slate-200 sm:block" />
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                {formatDate(getPublishedDate(post))}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4 text-blue-500" />
                {getReadTime(post)}
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
            </div>

            <div className="mt-5">
              <ShareButtons title={post.title} description={post.excerpt ?? post.title} />
            </div>
          </header>

          {isImageUrl(coverImage) && (
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
              <img src={coverImage ?? ""} alt={post.title} className="max-h-[460px] w-full object-cover" />
            </div>
          )}

          <div className="xl:hidden">
            <TocPanel toc={toc} activeId={activeTocId} mobile />
          </div>

          {highlights.length > 0 && (
            <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-200/70">
                  <Sparkles className="h-5 w-5 text-amber-700" />
                </div>
                <h2 className="text-lg font-black text-slate-950">Key highlights</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <div key={highlight} className="flex gap-3 rounded-2xl bg-white/80 p-4 text-sm leading-6 text-slate-700 shadow-sm">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-amber-600" />
                    <p>{highlight}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section
            className={cn(
              "mt-8 prose prose-slate max-w-none",
              "prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-950",
              "prose-h2:mt-12 prose-h2:border-b prose-h2:border-slate-100 prose-h2:pb-3 prose-h2:text-3xl",
              "prose-h3:mt-8 prose-h3:text-2xl",
              "prose-p:text-[17px] prose-p:leading-8 prose-p:text-slate-700",
              "prose-li:text-[17px] prose-li:leading-8 prose-li:text-slate-700",
              "prose-a:font-semibold prose-a:text-blue-700 prose-a:no-underline hover:prose-a:underline",
              "prose-strong:font-bold prose-strong:text-slate-950",
              "prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:not-italic prose-blockquote:text-slate-700",
              "prose-table:overflow-hidden prose-table:rounded-2xl prose-table:border prose-table:border-slate-200",
              "prose-th:bg-blue-700 prose-th:px-4 prose-th:py-3 prose-th:text-left prose-th:text-white",
              "prose-td:px-4 prose-td:py-3 prose-td:text-sm prose-td:text-slate-700",
              "prose-img:rounded-2xl prose-img:border prose-img:border-slate-200",
            )}
            dangerouslySetInnerHTML={{ __html: normalizedContent.html }}
          />

          <section className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-600 p-6 text-white shadow-xl shadow-blue-200 sm:p-8">
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-100">Need help applying this?</p>
                <h2 className="mt-2 text-2xl font-black">Get a CA to review your exact case.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                  MyeCA experts can help with tax filing, deductions, GST compliance, notices, and business advisory.
                </p>
              </div>
              <ActionLink
                href={ctaHref}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-blue-700 transition hover:bg-blue-50"
              >
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </ActionLink>
            </div>
          </section>

          {(post.authorBio || authorName) && (
            <section className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
                  {getInitials(authorName)}
                </div>
                <div>
                  <p className="text-lg font-black text-slate-950">{authorName}</p>
                  <p className="mt-1 text-sm font-semibold text-blue-700">{getAuthorRole(post)}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {post.authorBio || "MyeCA editorial guides are written to make Indian tax and compliance decisions easier to understand and act on."}
                  </p>
                </div>
              </div>
            </section>
          )}

          {faqItems.length > 0 && (
            <section className="mt-12">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Frequently asked questions</h2>
                  <p className="mt-1 text-sm text-slate-500">Quick answers before you take the next step.</p>
                </div>
              </div>
              <div className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                {faqItems.map((faq, index) => (
                  <details key={`${faq.question}-${index}`} className="group p-5 open:bg-blue-50/40">
                    <summary className="cursor-pointer list-none text-base font-bold text-slate-950 marker:hidden">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {relatedPosts.length > 0 && (
            <section className="mt-12">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">Related reading</h2>
                  <p className="mt-1 text-sm text-slate-500">More practical guides from MyeCA.</p>
                </div>
                <Link href="/blog">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-700 hover:text-blue-800">
                    View all <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedPosts.slice(0, 3).map((related) => (
                  <RelatedCard key={related.id} post={related} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-12 border-t border-slate-200 pt-8">
            <Link href="/blog">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                <ArrowLeft className="h-4 w-4" />
                Back to Knowledge Hub
              </span>
            </Link>
          </div>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-5">
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

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <UserRound className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Article info</p>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p><span className="font-bold text-slate-900">Author:</span> {authorName}</p>
                <p><span className="font-bold text-slate-900">Updated:</span> {formatDate(getPublishedDate(post))}</p>
                <p><span className="font-bold text-slate-900">Read time:</span> {getReadTime(post)}</p>
              </div>
            </div>

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
