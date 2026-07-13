import { useEffect, useMemo, useRef, useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  History,
  Loader2,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import MetaSEO from '@/components/seo/MetaSEO';
import { BlogCardSkeleton, BlogPostCard } from '@/components/blog/BlogPostCard';
import {
  clearBlogLastRead,
  getCategory,
  getCoverImage,
  isImageUrl,
  normalizeKey,
  readBlogLastRead,
  type BlogLastRead,
} from '@/components/blog/blog-post-helpers';
import OptimizedImage from '@/components/ui/optimized-image';
import { Skeleton } from '@/components/ui/skeleton';
import { buttonVariants } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from '@/components/ui/pagination';
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
import {
  BLOG_SAVED_GUIDES_STORAGE_KEY,
  isBlogGuideSaved,
  readSavedBlogGuides,
  removeSavedBlogGuide,
  toggleSavedBlogGuide,
  type SavedBlogGuide,
} from '@/lib/blog-saved-guides';
import { queryClient } from '@/lib/queryClient';
import { cn } from '@/lib/utils';
import type { BlogCategory } from '@shared/blog';

const PAGE_SIZE = 13;

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

const SEASON_SHORTCUTS = [
  { label: 'Check my ITR form in 60 sec', href: '/itr/form-recommender' },
  { label: 'When does ITR filing start?', href: '/blog/when-will-itr-filing-start-ay-2026-27' },
  { label: 'Complete AY 2026-27 filing guide', href: '/blog/complete-ay-2026-27-itr-filing-guide' },
  {
    label: 'Pick the right ITR form',
    href: '/blog/itr-form-selection-master-guide-ay-2026-27',
  },
];

const MOBILE_ITR_JOURNEYS = [
  { label: 'Form finder', href: '/itr/form-recommender', search: 'which itr form' },
  { label: 'Form 16 + AIS', href: '/blog?search=form+16+ais', search: 'form 16 ais' },
  { label: 'Capital gains', href: '/blog?category=capital-gains', category: 'capital-gains' },
  { label: 'Refund status', href: '/blog?category=refunds-notices', category: 'refunds-notices' },
  { label: 'NRI filing', href: '/blog?category=foreign-assets-nri-tax', category: 'foreign-assets-nri-tax' },
];

type BlogFilterState = {
  search: string;
  category: string;
  audience: string;
  page: number;
};

function readBlogFiltersFromUrl(): BlogFilterState {
  if (typeof window === 'undefined') {
    return { search: '', category: 'all', audience: 'all', page: 1 };
  }

  const params = new URLSearchParams(window.location.search);
  const pageParam = Number(params.get('page'));
  return {
    search: params.get('search') ?? '',
    category: params.get('category') ?? 'all',
    audience: params.get('audience') ?? 'all',
    page: Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1,
  };
}

function syncBlogFiltersToUrl(filters: BlogFilterState) {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.category !== 'all') params.set('category', filters.category);
  if (filters.audience !== 'all') params.set('audience', filters.audience);
  if (filters.page > 1) params.set('page', String(filters.page));

  const query = params.toString();
  const nextUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl !== currentUrl) window.history.replaceState(window.history.state, '', nextUrl);
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

function getPaginationItems(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);

  const pages = new Set<number>([1, total]);
  for (let candidate = current - 1; candidate <= current + 1; candidate += 1) {
    if (candidate >= 1 && candidate <= total) pages.add(candidate);
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | 'ellipsis'> = [];
  let previous = 0;
  for (const pageNumber of sorted) {
    if (previous && pageNumber - previous > 1) items.push('ellipsis');
    items.push(pageNumber);
    previous = pageNumber;
  }
  return items;
}

function SavedGuideButton({
  post,
  savedGuides,
  onSave,
  onRemove,
  className,
}: {
  post: BlogSummary;
  savedGuides: SavedBlogGuide[];
  onSave: (post: BlogSummary) => void;
  onRemove: (slug: string) => void;
  className?: string;
}) {
  const isSaved = isBlogGuideSaved(post.slug, savedGuides);

  return (
    <button
      type="button"
      aria-label="Save guide"
      aria-pressed={isSaved}
      onClick={() => {
        if (isSaved) {
          onRemove(post.slug);
          return;
        }
        onSave(post);
      }}
      className={cn(
        'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-xs font-black shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        isSaved
          ? 'border-blue-600 bg-blue-600 text-white'
          : 'border-blue-100 bg-white/95 text-blue-700 hover:border-blue-300 hover:bg-blue-50',
        className
      )}
    >
      {isSaved ? (
        <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {isSaved ? 'Saved' : 'Save'}
    </button>
  );
}

export default function BlogPage() {
  const [initialFilters] = useState(() => readBlogFiltersFromUrl());
  const [searchQuery, setSearchQuery] = useState(initialFilters.search);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category);
  const [selectedAudience, setSelectedAudience] = useState(initialFilters.audience);
  const [page, setPage] = useState(initialFilters.page);
  const [lastRead, setLastRead] = useState<BlogLastRead | null>(() => readBlogLastRead());
  const [savedGuides, setSavedGuides] = useState<SavedBlogGuide[]>(() => readSavedBlogGuides());
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);

  const blogListParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
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

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedAudience !== 'all' ||
    debouncedSearchQuery.trim().length > 0;
  const showDiscovery = !hasActiveFilters && page === 1;

  const heroShowcasePost = posts.find((post) => post.isFeatured) ?? posts[0];
  const featuredPost = showDiscovery ? heroShowcasePost : undefined;
  const editorsPicks = useMemo(() => {
    if (!showDiscovery || !featuredPost) return [];
    return posts.filter((post) => post.isFeatured && post.id !== featuredPost.id).slice(0, 6);
  }, [featuredPost, posts, showDiscovery]);
  const gridPosts = useMemo(() => {
    if (!featuredPost) return posts;
    const excluded = new Set([featuredPost.id, ...editorsPicks.map((pick) => pick.id)]);
    return posts.filter((post) => !excluded.has(post.id));
  }, [editorsPicks, featuredPost, posts]);

  const popularTopics = categories.slice(0, 8);
  const selectedCategoryLabel = useMemo(() => {
    if (selectedCategory === 'all') return 'All guides';

    return (
      categories.find((category) => normalizeKey(category.id || category.slug || category.name) === selectedCategory)
        ?.name ?? 'Selected topic'
    );
  }, [categories, selectedCategory]);

  const startIndex = posts.length > 0 ? (page - 1) * PAGE_SIZE + 1 : 0;
  const endIndex = posts.length > 0 ? startIndex + posts.length - 1 : 0;
  const totalPages =
    typeof postsData?.total === 'number' && postsData.total > 0
      ? Math.max(1, Math.ceil(postsData.total / PAGE_SIZE))
      : null;
  const paginationItems = totalPages ? getPaginationItems(page, totalPages) : [];

  const selectCategory = (categoryKey: string) => {
    setSelectedCategory(categoryKey);
    setPage(1);
  };

  const applyJourney = (journey: (typeof MOBILE_ITR_JOURNEYS)[number]) => {
    setSearchQuery(journey.search ?? '');
    setSelectedCategory(journey.category ?? 'all');
    setSelectedAudience('individuals');
    setPage(1);
  };

  const goToPage = (nextPage: number) => {
    if (nextPage === page || nextPage < 1) return;
    if (totalPages && nextPage > totalPages) return;
    setPage(nextPage);
    requestAnimationFrame(() => {
      const target = resultsRef.current;
      if (!target) return;
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - 96,
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    });
  };

  const dismissLastRead = () => {
    clearBlogLastRead();
    setLastRead(null);
  };

  const saveGuide = (post: BlogSummary) => {
    const next = toggleSavedBlogGuide(post).guides;
    setSavedGuides(next);
  };

  const removeSavedGuide = (slug: string) => {
    setSavedGuides(removeSavedBlogGuide(slug));
  };

  useEffect(() => {
    syncBlogFiltersToUrl({
      search: searchQuery,
      category: selectedCategory,
      audience: selectedAudience,
      page,
    });
  }, [page, searchQuery, selectedAudience, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      <MetaSEO
        title="AY 2026-27 ITR Filing Guides | MyeCA.in Knowledge Hub"
        description="Read evidence-led AY 2026-27 ITR filing guides on due dates, ITR forms, Form 16, AIS, refunds, tax regime, capital gains, NRI filing, and notices."
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
                  <span className="md:hidden">Find your ITR answer</span>
                  <span className="hidden md:inline">ITR Filing & Tax Guides AY 2026-27</span>
                </h1>
              </div>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Fresh evidence-led explainers for ITR filing, tax planning, refunds, notices, GST,
                capital gains, and business compliance, with filing paths when you need expert help.
              </p>
              <div className="mt-5 space-y-3 md:hidden">
                <div className="flex self-start items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-50">
                  <Search className="h-5 w-5 shrink-0 text-blue-500" />
                  <input
                    id="mobile-blog-search"
                    aria-label="Search ITR guides"
                    className="type-body w-full bg-transparent font-bold text-slate-950 outline-none placeholder:text-slate-400"
                    placeholder="Search Form 16, AIS, refund..."
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                      setPage(1);
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      aria-label="Clear mobile search"
                      onClick={() => {
                        setSearchQuery('');
                        setPage(1);
                      }}
                      className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div
                  aria-label="ITR season shortcuts"
                  className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                >
                  {MOBILE_ITR_JOURNEYS.map((journey) => (
                    <button
                      key={journey.label}
                      type="button"
                      onClick={() => applyJourney(journey)}
                      className="min-h-10 shrink-0 snap-start rounded-full border border-blue-100 bg-blue-50 px-4 text-sm font-black text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      {journey.label}
                    </button>
                  ))}
                </div>
              </div>
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
                {heroShowcasePost && isImageUrl(getCoverImage(heroShowcasePost)) ? (
                  <OptimizedImage
                    src={getBlogCoverImageSrc(getCoverImage(heroShowcasePost))}
                    alt={heroShowcasePost.title}
                    width={640}
                    height={360}
                    priority
                    containerClassName="h-28 w-full"
                    className={cn(
                      'h-full w-full',
                      isGeneratedBlogCover(getCoverImage(heroShowcasePost))
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
                  { label: 'Reviewed', value: 'Editorial', color: 'emerald' },
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
            <div className="hidden self-start items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-blue-50 md:flex">
              <Search className="h-5 w-5 shrink-0 text-blue-500" />
              <input
                id="blog-search"
                aria-label="Search guides"
                className="type-body w-full bg-transparent font-bold text-slate-950 outline-none placeholder:text-slate-400"
                placeholder="Search tax, GST, ITR, deductions..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setPage(1);
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setSearchQuery('');
                    setPage(1);
                  }}
                  className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div
              role="group"
              aria-label="Filter guides by reader type"
              className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-1.5"
            >
              {AUDIENCE_FILTERS.map((audience) => {
                const active = selectedAudience === audience.key;
                return (
                  <button
                    key={audience.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setSelectedAudience(audience.key);
                      setPage(1);
                    }}
                    className={cn(
                      'rounded-lg px-2 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:px-3',
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

        <nav aria-label="Topic filters" className="mb-7">
          <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 md:flex-wrap md:overflow-visible">
            <button
              type="button"
              aria-pressed={selectedCategory === 'all'}
              onClick={() => selectCategory('all')}
              className={cn(
                'min-h-11 shrink-0 snap-start rounded-full border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                selectedCategory === 'all'
                  ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'
              )}
            >
              All guides
            </button>
            {categories.map((category) => {
              const key = normalizeKey(category.id || category.slug || category.name);
              const active = selectedCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectCategory(key)}
                  className={cn(
                    'min-h-11 shrink-0 snap-start rounded-full border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
                    active
                      ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700'
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </nav>

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
          <div aria-busy="true" aria-label="Loading guides">
            <div className="mb-7 flex items-end justify-between gap-3 border-b border-slate-200 pb-3">
              <Skeleton className="h-8 w-44" />
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-8">
                <BlogCardSkeleton variant="hero" />
                <div className="grid gap-5 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <BlogCardSkeleton key={index} />
                  ))}
                </div>
              </div>
              <div className="hidden space-y-5 lg:block">
                <Skeleton className="h-72 w-full rounded-2xl" />
                <Skeleton className="h-60 w-full rounded-2xl" />
              </div>
            </div>
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
            <div
              ref={resultsRef}
              className="mb-7 flex flex-wrap items-end justify-between gap-3 border-b border-slate-200"
            >
              <h2 className="type-section-title border-b-2 border-blue-600 pb-2 font-black text-slate-950">
                {hasActiveFilters ? 'Matching guides' : 'Latest guides'}
              </h2>
              <div className="flex items-center gap-3 pb-3">
                {isRefreshingPosts && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                    Updating
                  </span>
                )}
                <p className="text-sm font-black text-blue-700">
                  Showing {startIndex}&ndash;{endIndex} of {totalPosts} guides
                  {selectedCategory !== 'all' && (
                    <span className="font-bold text-slate-500"> &middot; {selectedCategoryLabel}</span>
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-8">
                {lastRead && showDiscovery && lastRead.slug && (
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                    <Link
                      href={`/blog/${lastRead.slug}`}
                      className="flex min-w-0 items-center gap-3"
                      onMouseEnter={() => preloadBlogArticle(lastRead.slug)}
                      onFocus={() => preloadBlogArticle(lastRead.slug)}
                    >
                      <History className="h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                      <span className="min-w-0 truncate text-sm font-bold text-blue-800">
                        Continue reading: <span className="font-black">{lastRead.title}</span>
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label="Dismiss continue reading"
                      onClick={dismissLastRead}
                      className="rounded-full p-1.5 text-blue-400 transition hover:bg-white hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {savedGuides.length > 0 && showDiscovery && (
                  <section
                    aria-label="Saved guides"
                    data-storage-key={BLOG_SAVED_GUIDES_STORAGE_KEY}
                    className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm md:hidden"
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                          Saved guides
                        </p>
                        <h2 className="mt-1 text-base font-black text-slate-950">
                          Continue your ITR reading list
                        </h2>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                        {savedGuides.length}
                      </span>
                    </div>
                    <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {savedGuides.slice(0, 6).map((guide) => (
                        <div
                          key={guide.slug}
                          className="w-[240px] shrink-0 snap-start rounded-xl border border-slate-100 bg-slate-50 p-3"
                        >
                          <Link href={`/blog/${guide.slug}`}>
                            <span className="block text-sm font-black leading-snug text-slate-950">
                              {guide.title}
                            </span>
                          </Link>
                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">
                            {guide.excerpt || guide.category}
                          </p>
                          <button
                            type="button"
                            onClick={() => removeSavedGuide(guide.slug)}
                            className="mt-3 text-xs font-black text-emerald-700 transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {featuredPost && (
                  <div className="relative">
                    <SavedGuideButton
                      post={featuredPost}
                      savedGuides={savedGuides}
                      onSave={saveGuide}
                      onRemove={removeSavedGuide}
                      className="absolute right-3 top-3 z-20 md:right-4 md:top-4"
                    />
                    <BlogPostCard
                      post={featuredPost}
                      variant="hero"
                      priority
                      onPrefetch={preloadBlogArticle}
                    />
                  </div>
                )}

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
                    <Link href="/which-itr-form-to-file?source=mobile_blog_start_here">
                      <span className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-4 text-sm font-black text-blue-700 transition hover:bg-blue-100">
                        Read the form selection guide
                      </span>
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {MOBILE_ITR_JOURNEYS.slice(1).map((journey) => (
                      <Link key={journey.href} href={journey.href}>
                        <span className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700">
                          {journey.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>

                {editorsPicks.length > 0 && (
                  <section aria-label="Editor's picks">
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      <h3 className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
                        Editor's picks
                      </h3>
                    </div>
                    <div className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
                      {editorsPicks.map((pick) => (
                        <BlogPostCard
                          key={pick.id}
                          post={pick}
                          variant="compact"
                          onPrefetch={preloadBlogArticle}
                          className="w-[240px] shrink-0 snap-start sm:w-[260px]"
                        />
                      ))}
                    </div>
                  </section>
                )}

                <div className="grid gap-5 sm:grid-cols-2">
                  {gridPosts.map((post) => (
                    <div key={post.id} className="relative">
                      <SavedGuideButton
                        post={post}
                        savedGuides={savedGuides}
                        onSave={saveGuide}
                        onRemove={removeSavedGuide}
                        className="absolute right-3 top-3 z-20"
                      />
                      <BlogPostCard post={post} onPrefetch={preloadBlogArticle} />
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  {totalPages && totalPages > 1 ? (
                    <Pagination>
                      <PaginationContent className="flex-wrap">
                        <PaginationItem>
                          <button
                            type="button"
                            aria-label="Go to previous page"
                            disabled={page === 1}
                            onClick={() => goToPage(page - 1)}
                            className={cn(
                              buttonVariants({ variant: 'ghost', size: 'default' }),
                              'gap-1 pl-2.5 font-bold',
                              page === 1 && 'pointer-events-none opacity-40'
                            )}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Previous</span>
                          </button>
                        </PaginationItem>
                        {paginationItems.map((item, index) =>
                          item === 'ellipsis' ? (
                            <PaginationItem key={`ellipsis-${index}`}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          ) : (
                            <PaginationItem key={item}>
                              <button
                                type="button"
                                aria-label={`Go to page ${item}`}
                                aria-current={item === page ? 'page' : undefined}
                                onClick={() => goToPage(item)}
                                className={cn(
                                  buttonVariants({
                                    variant: item === page ? 'outline' : 'ghost',
                                    size: 'icon',
                                  }),
                                  'min-w-10 font-bold',
                                  item === page && 'border-blue-600 text-blue-700'
                                )}
                              >
                                {item}
                              </button>
                            </PaginationItem>
                          )
                        )}
                        <PaginationItem>
                          <button
                            type="button"
                            aria-label="Go to next page"
                            disabled={page === totalPages}
                            onClick={() => goToPage(page + 1)}
                            className={cn(
                              buttonVariants({ variant: 'ghost', size: 'default' }),
                              'gap-1 pr-2.5 font-bold',
                              page === totalPages && 'pointer-events-none opacity-40'
                            )}
                          >
                            <span className="hidden sm:inline">Next</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  ) : (
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-slate-500">
                        Page {page} &middot; {totalPosts} matching guides
                      </p>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          disabled={page === 1}
                          onClick={() => goToPage(page - 1)}
                          className="rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Previous
                        </button>
                        <button
                          type="button"
                          disabled={!postsData?.hasMore}
                          onClick={() => goToPage(page + 1)}
                          className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
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
                    Bring your tax position, deductions, GST compliance, or business filing question
                    and confirm the records and review scope before proceeding.
                  </p>
                  <Link href="/expert-consultation">
                    <span className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700">
                      Talk to a CA <ArrowRight className="h-4 w-4" />
                    </span>
                  </Link>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    Most useful this season
                  </p>
                  <div className="mt-3 space-y-2">
                    {SEASON_SHORTCUTS.map((shortcut) => (
                      <Link key={shortcut.href} href={shortcut.href}>
                        <span className="group flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">
                          <span className="min-w-0 truncate">{shortcut.label}</span>
                          <ArrowRight className="h-4 w-4 shrink-0 text-blue-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
                        </span>
                      </Link>
                    ))}
                  </div>
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
