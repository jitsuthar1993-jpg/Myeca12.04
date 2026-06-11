import { Link } from 'wouter';
import { ArrowRight, CalendarDays, Clock3, FileText } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { Skeleton } from '@/components/ui/skeleton';
import { getBlogCoverImageSrc, isGeneratedBlogCover } from '@/lib/blog-cover-assets';
import { cn } from '@/lib/utils';
import type { PublicBlogSummaryCompat } from '@/lib/public-blog-data';
import {
  formatDate,
  getAuthorName,
  getCategoryName,
  getCoverImage,
  getInitials,
  getPublishedDate,
  getReadTime,
  isImageUrl,
} from './blog-post-helpers';

export type BlogPostCardVariant = 'hero' | 'default' | 'compact';

interface BlogPostCardProps {
  post: PublicBlogSummaryCompat;
  variant?: BlogPostCardVariant;
  priority?: boolean;
  onPrefetch?: (slug: string) => void;
  className?: string;
}

function CardCover({
  post,
  variant,
  priority,
}: {
  post: PublicBlogSummaryCompat;
  variant: BlogPostCardVariant;
  priority: boolean;
}) {
  const coverImage = getCoverImage(post);
  const generatedCover = isGeneratedBlogCover(coverImage);

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50',
        variant === 'hero' ? 'aspect-[16/9] md:aspect-auto md:h-full md:min-h-[230px]' : 'aspect-[16/9]'
      )}
    >
      {isImageUrl(coverImage) ? (
        <OptimizedImage
          src={getBlogCoverImageSrc(coverImage)}
          alt={post.title}
          priority={priority}
          width={variant === 'hero' ? 640 : 480}
          height={variant === 'hero' ? 360 : 270}
          containerClassName="absolute inset-0"
          className={cn(
            'h-full w-full',
            generatedCover
              ? 'bg-white object-contain p-1.5'
              : 'object-cover transition-transform duration-500 group-hover:scale-105'
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <FileText className="h-12 w-12 text-blue-200" aria-hidden="true" />
        </div>
      )}
      {!generatedCover && (
        <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-bold text-blue-700 shadow-sm backdrop-blur">
          {getCategoryName(post)}
        </span>
      )}
    </div>
  );
}

function CardMetaRow({ post }: { post: PublicBlogSummaryCompat }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
        {formatDate(getPublishedDate(post))}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
        {getReadTime(post)}
      </span>
    </div>
  );
}

export function BlogPostCard({
  post,
  variant = 'default',
  priority = false,
  onPrefetch,
  className,
}: BlogPostCardProps) {
  const authorName = getAuthorName(post);
  const prefetch = onPrefetch ? () => onPrefetch(post.slug) : undefined;

  if (variant === 'compact') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className={cn('block h-full', className)}
        onMouseEnter={prefetch}
        onFocus={prefetch}
      >
        <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:border-blue-200 hover:shadow-md">
          <p className="type-meta mb-2 font-bold uppercase tracking-widest text-blue-700">
            {getCategoryName(post)}
          </p>
          <h3 className="type-card-title mb-4 line-clamp-3 flex-1 font-semibold text-slate-900 transition group-hover:text-blue-700">
            {post.title}
          </h3>
          <div className="flex items-center justify-between border-t border-slate-100 pt-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Clock3 className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
              {getReadTime(post)}
            </p>
            <ArrowRight
              className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-blue-500"
              aria-hidden="true"
            />
          </div>
        </article>
      </Link>
    );
  }

  if (variant === 'hero') {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className={cn('block', className)}
        onMouseEnter={prefetch}
        onFocus={prefetch}
      >
        <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md md:grid md:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]">
          <CardCover post={post} variant="hero" priority={priority} />
          <div className="flex flex-1 flex-col p-5 sm:p-6">
            <CardMetaRow post={post} />
            <h3 className="type-section-title mt-3 font-black text-slate-950 transition group-hover:text-blue-700">
              {post.title}
            </h3>
            {post.excerpt && (
              <p className="type-support mt-3 line-clamp-3 text-slate-600">{post.excerpt}</p>
            )}
            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
              <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {getInitials(authorName)}
                </span>
                <span className="truncate">By {authorName}</span>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
                Read guide <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn('block h-full', className)}
      onMouseEnter={prefetch}
      onFocus={prefetch}
    >
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
        <CardCover post={post} variant="default" priority={priority} />
        <div className="flex flex-1 flex-col p-5">
          <CardMetaRow post={post} />
          <h3 className="type-card-title mt-2 line-clamp-2 font-black text-slate-950 transition group-hover:text-blue-700">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="type-support mt-2 line-clamp-2 text-slate-600">{post.excerpt}</p>
          )}
          <div className="mt-auto flex items-center justify-between gap-3 pt-4">
            <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {getInitials(authorName)}
              </span>
              <span className="truncate">{authorName}</span>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-black text-blue-700">
              Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function BlogCardSkeleton({
  variant = 'default',
  className,
}: {
  variant?: BlogPostCardVariant;
  className?: string;
}) {
  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm',
          className
        )}
      >
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-3/4" />
        <div className="mt-auto border-t border-slate-100 pt-3">
          <Skeleton className="h-3.5 w-24" />
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid md:grid-cols-[minmax(0,0.46fr)_minmax(0,0.54fr)]',
          className
        )}
      >
        <Skeleton className="aspect-[16/9] w-full rounded-none md:aspect-auto md:h-full md:min-h-[230px]" />
        <div className="p-5 sm:p-6">
          <Skeleton className="h-3.5 w-44" />
          <Skeleton className="mt-4 h-7 w-full" />
          <Skeleton className="mt-2 h-7 w-2/3" />
          <Skeleton className="mt-4 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <div className="mt-6 flex items-center justify-between">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      <Skeleton className="aspect-[16/9] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-5">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-3/4" />
        <Skeleton className="mt-3 h-4 w-full" />
        <div className="mt-auto flex items-center justify-between pt-4">
          <Skeleton className="h-7 w-28 rounded-full" />
          <Skeleton className="h-4 w-12" />
        </div>
      </div>
    </div>
  );
}
