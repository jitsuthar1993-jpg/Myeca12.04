import { useEffect, useMemo, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  FileText,
  Loader2,
  Search,
  TrendingUp,
  Users,
  Building2,
  ChevronRight,
} from 'lucide-react';
import MetaSEO from '@/components/seo/MetaSEO';
import {
  DEFAULT_PUBLIC_BLOG_CATEGORIES,
  fetchPublicBlogCategories,
  fetchPublicBlogs,
  prefetchPublicBlogDetail,
  publicBlogQueryKeys,
  type PublicBlogCategoryResponse,
  type PublicBlogSummaryCompat as BlogSummary,
} from '@/lib/public-blog-data';
import { getBlogCoverImageSrc, isGeneratedBlogCover } from '@/lib/blog-cover-assets';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import type { BlogCategory } from '@shared/blog';

const AUDIENCE_FILTERS = [
  { key: 'all', label: 'All readers', description: 'Tax, GST, filing, and compliance guides' },
  {
    key: 'individuals',
    label: 'Individuals',
    description: 'ITR, refunds, deductions, Form 16, AIS',
  },
  {
    key: 'businesses',
    label: 'Businesses',
    description: 'GST, startup, MSME, notices, registrations',
  },
];

const HUB_FAQS = [
  {
    question: 'What should I read first before filing ITR?',
    answer:
      'Start with the AY 2026-27 due date, ITR form selector, Form 16 guide, AIS/Form 26AS reconciliation, and old vs new tax regime comparison.',
  },
  {
    question: 'Are these guides updated for AY 2026-27?',
    answer:
      'Yes. The ITR-season guides focus on FY 2025-26 income filed in AY 2026-27, including the transition from the 1961 Act framework to the 2025 Act context.',
  },
  {
    question: 'When should I talk to a CA?',
    answer:
      'Use CA help for capital gains, business income, GST notices, AIS mismatches, foreign assets, large refunds, or missed filings.',
  },
];

function isImageUrl(value: string | null | undefined) {
  return Boolean(value && /^(https?:\/\/|\/)/.test(value));
}

function normalizeKey(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

function getCategory(post: BlogSummary): BlogCategory | null {
  if (post.category && typeof post.category === 'object') return post.category;
  return post.categoryName
    ? {
        id: post.categoryName,
        name: post.categoryName,
        slug: post.categoryName.toLowerCase().replace(/\s+/g, '-'),
        description: null,
      }
    : null;
}

function getCategoryName(post: BlogSummary) {
  return getCategory(post)?.name ?? 'Tax Guide';
}

function getCategoryTokens(post: BlogSummary) {
  const category = getCategory(post);
  return [category?.id, category?.name, category?.slug, post.categoryName]
    .map(normalizeKey)
    .filter(Boolean);
}

function getAuthorName(post: BlogSummary) {
  if (post.authorName) return post.authorName;
  if (post.author?.name) return post.author.name;
  return (
    [post.author?.firstName, post.author?.lastName].filter(Boolean).join(' ') ||
    'MyeCA Editorial Team'
  );
}

function getCoverImage(post: BlogSummary) {
  return post.coverImage ?? post.featuredImage ?? post.image ?? null;
}

function getPublishedDate(post: BlogSummary) {
  return post.publishedAt ?? post.createdAt ?? post.updatedAt ?? null;
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Recently updated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently updated';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getReadTime(post: BlogSummary) {
  return post.readingTimeMinutes
    ? `${post.readingTimeMinutes} min read`
    : (post.readTime ?? '5 min read');
}

function getInitials(name: string) {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ME'
  );
}

function normalizeCategories(
  posts: BlogSummary[],
  apiCategories: PublicBlogCategoryResponse['categories'] | undefined
) {
  const seen = new Set<string>();
  const categories: Array<Pick<BlogCategory, 'id' | 'name' | 'slug'>> = [];

  const addCategory = (category: Partial<BlogCategory> | null | undefined) => {
    const name = category?.name?.trim();
    if (!name) return;
    const slug = category?.slug?.trim() || name.toLowerCase().replace(/\s+/g, '-');
    const id = category?.id?.trim() || slug;
    const key = normalizeKey(id || slug || name);
    if (seen.has(key)) return;
    seen.add(key);
    categories.push({ id, name, slug });
  };

  apiCategories?.forEach(addCategory);
  posts.forEach((post) => addCategory(getCategory(post)));
  DEFAULT_PUBLIC_BLOG_CATEGORIES.forEach(addCategory);

  return categories;
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs, value]);

  return debouncedValue;
}

let blogArticleRoutePreloaded = false;

function preloadBlogArticle(slug: string) {
  void prefetchPublicBlogDetail(queryClient, slug).catch(() => undefined);
  if (!blogArticleRoutePreloaded) {
    blogArticleRoutePreloaded = true;
    void import('@/pages/blog/[slug].page').catch(() => {
      blogArticleRoutePreloaded = false;
    });
  }
}

function ArticleCard({
  post,
  compact = false,
  priority = false,
}: {
  post: BlogSummary;
  compact?: boolean;
  priority?: boolean;
}) {
  const coverImage = getCoverImage(post);
  const generatedCover = isGeneratedBlogCover(coverImage);
  const authorName = getAuthorName(post);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="block"
      onMouseEnter={() => preloadBlogArticle(post.slug)}
      onFocus={() => preloadBlogArticle(post.slug)}
    >
      <article
        className={cn(
          'group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md',
          compact ? 'flex h-full flex-col' : 'md:grid md:grid-cols-[240px_minmax(0,1fr)]'
        )}
      >
        <div
          className={cn(
            'relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50',
            compact ? 'h-36' : 'h-32 sm:h-40 md:h-full md:min-h-[210px]'
          )}
        >
          {isImageUrl(coverImage) ? (
            <img
              src={getBlogCoverImageSrc(coverImage)}
              alt={post.title}
              width={compact ? 480 : 640}
              height={compact ? 240 : 420}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'auto'}
              decoding="async"
              className={cn(
                'h-full w-full transition duration-500',
                generatedCover
                  ? 'bg-white object-contain p-0'
                  : 'object-cover group-hover:scale-105'
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileText className="h-14 w-14 text-blue-200" />
            </div>
          )}
          {!generatedCover && (
            <div className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm backdrop-blur">
              {getCategoryName(post)}
            </div>
          )}
        </div>

        <div className={cn('flex flex-1 flex-col', compact ? 'p-4' : 'p-5 sm:p-6')}>
          <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-500">
            <span>By {authorName}</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
              {formatDate(getPublishedDate(post))}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-blue-400" />
              {getReadTime(post)}
            </span>
          </div>

          <h3
            className={cn(
              'font-black leading-snug tracking-tight text-slate-950 transition group-hover:text-blue-700',
              compact ? 'text-lg' : 'text-xl sm:text-2xl'
            )}
          >
            {post.title}
          </h3>

          {post.excerpt && !compact && (
            <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-7 text-slate-600">
              {post.excerpt}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-3 pt-5">
            <div className="flex h-8 w-[124px] shrink-0 items-center gap-2 text-xs font-semibold text-slate-500">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {getInitials(authorName)}
              </div>
              <p className="m-0 whitespace-nowrap leading-none">MyeCA insights</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 transition-all group-hover:bg-blue-600 group-hover:text-white">
              Read article <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [isTopicFilterOpen, setIsTopicFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const blogListParams = useMemo(
    () => ({
      page,
      limit: 13,
      search: debouncedSearchQuery,
      category: selectedCategory,
      audience: selectedAudience,
    }),
    [debouncedSearchQuery, page, selectedAudience, selectedCategory]
  );

  const {
    data: postsData,
    isFetching: isFetchingPosts,
    isLoading: isLoadingPosts,
  } = useQuery({
    queryKey: publicBlogQueryKeys.list(blogListParams),
    queryFn: () => fetchPublicBlogs(blogListParams),
    placeholderData: keepPreviousData,
  });

  const { data: categoriesData } = useQuery({
    queryKey: publicBlogQueryKeys.categories,
    queryFn: fetchPublicBlogCategories,
  });

  const posts = postsData?.posts ?? [];
  const totalPosts = postsData?.total ?? posts.length;
  const showPostsLoader = isLoadingPosts && posts.length === 0;
  const isRefreshingPosts = isFetchingPosts && !showPostsLoader;
  const categories = useMemo(
    () => normalizeCategories(posts, categoriesData?.categories),
    [posts, categoriesData?.categories]
  );
  const featuredPost = posts.find((post) => post.isFeatured) ?? posts[0];
  const regularPosts = featuredPost ? posts.filter((post) => post.id !== featuredPost.id) : posts;
  const popularTopics = categories.slice(0, 8);
  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'All guides';

    return (
      categories.find((category) => normalizeKey(category.id || category.slug || category.name) === selectedCategory)
        ?.name ?? 'Selected topic'
    );
  }, [categories, selectedCategory]);

  const selectCategory = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setPage(1);
    setIsTopicFilterOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <MetaSEO
        title="AY 2026-27 ITR Filing Guides | MyeCA.in Knowledge Hub"
        description="Read CA-reviewed AY 2026-27 ITR filing guides on due dates, ITR forms, Form 16, AIS, refunds, tax regime, capital gains, NRI filing, and notices."
        keywords={[
          'AY 2026-27 ITR filing',
          'ITR filing guide',
          'income tax return India',
          'Form 16',
          'AIS Form 26AS',
          'tax regime',
        ]}
        breadcrumbs={[
          { name: 'Home', url: '/' },
          { name: 'AY 2026-27 ITR Guides', url: '/blog' },
        ]}
      />

      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.78fr)_minmax(320px,0.42fr)] lg:items-center">
            <div>
              <div className="relative mb-3">
                <span className="type-hero-title absolute -left-1 -top-4 select-none font-black text-slate-100">
                  Guides
                </span>
                <h1 className="type-page-title relative font-black text-blue-700">
                  ITR Filing & Tax Guides AY 2026-27
                </h1>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Fresh CA-reviewed explainers for ITR filing, tax planning, refunds, notices, GST,
                capital gains, and business compliance, with filing paths when you need expert help.
              </p>
              <div className="mt-5 flex items-center gap-2 text-sm font-black">
                <Link href="/">
                  <span className="text-blue-600 transition hover:text-blue-700">Home</span>
                </Link>
                <ChevronRight className="h-4 w-4 text-slate-400" />
                <span className="text-slate-950">Blogs</span>
              </div>
            </div>

            <div className="hidden rounded-2xl border border-blue-100 bg-blue-50/60 p-3 shadow-sm md:block">
              <div className="overflow-hidden rounded-xl bg-white">
                {featuredPost && isImageUrl(getCoverImage(featuredPost)) ? (
                  <img
                    src={getBlogCoverImageSrc(getCoverImage(featuredPost))}
                    alt={featuredPost.title}
                    width={640}
                    height={360}
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                    className={cn(
                      'h-28 w-full',
                      isGeneratedBlogCover(getCoverImage(featuredPost))
                        ? 'bg-white object-contain p-1.5'
                        : 'object-cover'
                    )}
                  />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
                    <BookOpen className="h-10 w-10 text-blue-200" />
                  </div>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: 'Guides', value: totalPosts, color: 'blue' },
                  { label: 'Topics', value: categories.length, color: 'indigo' },
                  { label: 'Reviewed', value: 'CA', color: 'emerald' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={cn(
                      'rounded-xl px-3 py-2 text-center',
                      stat.color === 'blue'
                        ? 'bg-white text-blue-700'
                        : stat.color === 'indigo'
                          ? 'bg-indigo-50 text-indigo-700'
                          : 'bg-emerald-50 text-emerald-700'
                    )}
                  >
                    <p className="text-lg font-black leading-none">{stat.value}</p>
                    <p className="type-meta mt-1 font-black uppercase opacity-70">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:mb-6">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_430px]">
            <div className="flex self-start items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-50">
              <Search className="h-5 w-5 shrink-0 text-blue-500" />
              <input
                id="blog-search"
                className="type-body w-full bg-transparent font-bold text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="Search tax, GST, ITR, deductions..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-1.5">
              {AUDIENCE_FILTERS.map((audience) => {
                const active = selectedAudience === audience.key;
                return (
                  <button
                    key={audience.key}
                    type="button"
                    onClick={() => {
                      setSelectedAudience(audience.key);
                      setPage(1);
                    }}
                    className={cn(
                      'rounded-lg px-2 py-3 text-left transition sm:px-3',
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {audience.key === 'businesses' ? (
                        <Building2 className="h-4 w-4 shrink-0" />
                      ) : (
                        <Users className="h-4 w-4 shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-black sm:text-sm',
                          active ? 'text-blue-700' : 'text-slate-950'
                        )}
                      >
                        {audience.label}
                      </span>
                    </div>
                    <p className="sr-only">{audience.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-5 md:hidden">
          <button
            type="button"
            aria-expanded={isTopicFilterOpen}
            onClick={() => setIsTopicFilterOpen((isOpen) => !isOpen)}
            className="flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 text-left text-sm font-black text-slate-950 shadow-sm"
          >
            <span className="inline-flex items-center gap-2 text-blue-700">
              <BookOpen className="h-4 w-4" />
              Topic
            </span>
            <span className="min-w-0 truncate text-right text-slate-700">{selectedCategoryLabel}</span>
          </button>
          {isTopicFilterOpen ? (
            <div className="mt-2 grid gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm">
              <button
                type="button"
                onClick={() => selectCategory('all')}
                className={cn(
                  'rounded-lg border px-3 py-2 text-left text-sm font-bold transition',
                  selectedCategory === 'all'
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:text-blue-700'
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
                    onClick={() => selectCategory(key)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-sm font-bold transition',
                      selectedCategory === key
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-200 hover:text-blue-700'
                    )}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="mb-7 hidden md:flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => selectCategory('all')}
            className={cn(
              'shrink-0 rounded-lg border px-4 py-2 text-sm font-bold transition',
              selectedCategory === 'all'
                ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'
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
                onClick={() => selectCategory(key)}
                className={cn(
                  'shrink-0 rounded-lg border px-4 py-2 text-sm font-bold transition',
                  selectedCategory === key
                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        <section className="mb-7 hidden rounded-lg border border-blue-100 bg-white p-4 shadow-sm md:block md:p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                ITR readiness check
              </p>
              <h2 className="mt-2 text-xl font-black text-slate-950">
                Turn a guide into the right filing path.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Check your ITR form, AIS mismatch risk, documents and expert-review need before you start.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 md:w-[360px]">
              <Link href="/itr/form-recommender">
                <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700">
                  Check my ITR form in 60 sec <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
              <Link href="/expert-consultation?service=blog-reader">
                <span className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-4 text-sm font-black text-blue-700 transition hover:bg-blue-100">
                  Talk to Expert
                </span>
              </Link>
            </div>
          </div>
        </section>

        {showPostsLoader ? (
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
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedAudience('all');
                setPage(1);
              }}
              className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-7 flex items-end justify-between border-b border-slate-200">
              <h2 className="type-section-title border-b-2 border-blue-600 pb-2 font-black text-slate-950">
                Latest Posts
              </h2>
              <div className="flex items-center gap-3 pb-3">
                {isRefreshingPosts && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    Updating
                  </span>
                )}
                <span className="text-sm font-black text-blue-700">{totalPosts} guides</span>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-8">
                {featuredPost && <ArticleCard post={featuredPost} priority />}
                <section className="mobile-first-content-cta rounded-lg border border-blue-100 bg-white p-4 shadow-sm md:hidden">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                    ITR readiness check
                  </p>
                  <h2 className="mt-2 text-lg font-black text-slate-950">
                    Turn this guide into the right filing path.
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Check your ITR form, mismatch risk, documents and expert-review need before you start.
                  </p>
                  <div className="mt-4 grid gap-2">
                    <Link href="/itr/form-recommender">
                      <span className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black text-white transition hover:bg-blue-700">
                        Check my ITR form in 60 sec <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                    <Link href="/expert-consultation?service=blog-reader">
                      <span className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-4 text-sm font-black text-blue-700 transition hover:bg-blue-100">
                        Talk to Expert
                      </span>
                    </Link>
                  </div>
                </section>
                {regularPosts.map((post) => (
                  <ArticleCard key={post.id} post={post} />
                ))}

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-500">
                    Page {page} - {totalPosts} matching guides
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
                <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm">
                  <div className="bg-emerald-50 p-3">
                    <img
                      src={getBlogCoverImageSrc("/assets/blog/text-covers/when-will-itr-filing-start-ay-2026-27.svg")}
                      alt="AY 2026-27 ITR season hub"
                      width={640}
                      height={360}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[16/9] w-full rounded-xl bg-white object-contain p-1.5"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                      AY 2026-27 hub
                    </p>
                    <h2 className="mt-2 text-xl font-black leading-tight text-slate-950">
                      ITR season checklists, tools, and filing paths
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      Start with Form 16, AIS/Form 26AS, capital gains, refund status, and expert-review routes.
                    </p>
                    <Link href="/itr-season-2026">
                      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700">
                        Open hub <ArrowRight className="h-4 w-4" />
                      </span>
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h2 className="text-base font-black text-slate-950">Browse by topics</h2>
                  </div>
                  <div className="space-y-2">
                    {popularTopics.map((topic) => (
                      <button
                        key={topic.id}
                        type="button"
                        onClick={() => selectCategory(normalizeKey(topic.id || topic.slug || topic.name))}
                        className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {topic.name}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/60 p-6 text-slate-700 shadow-sm">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
                    <Users className="h-9 w-9" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-700">
                    Need certainty?
                  </p>
                  <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">
                    Get free advice from a tax expert.
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Ask MyeCA reviewers to review your tax position, deductions, GST compliance, or
                    business filing path.
                  </p>
                  <Link href="/expert-consultation">
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700">
                      Talk to a CA <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-500">
                    Reading tip
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Start with a guide, then use the article CTAs when you want a CA to apply it to
                    your exact filing or compliance case.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        )}

        <section
          className="mt-12 grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start"
          style={{ contentVisibility: 'auto', contain: 'content', containIntrinsicSize: '0 480px' }}
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">
              Quick answers
            </p>
            <h2 className="type-section-title mt-3 font-black text-slate-950">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Use the hub for general education. Use a MyeCA expert when the facts, numbers, or
              notices are specific to your case.
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
