import type { BlogCategory } from '@shared/blog';
import type { PublicBlogSummaryCompat } from '@/lib/public-blog-data';

export function isImageUrl(value: string | null | undefined) {
  return Boolean(value && /^(https?:\/\/|\/)/.test(value));
}

export function normalizeKey(value: string | null | undefined) {
  return (value ?? '').trim().toLowerCase();
}

export function getCategory(post: PublicBlogSummaryCompat): BlogCategory | null {
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

export function getCategoryName(post: PublicBlogSummaryCompat) {
  return getCategory(post)?.name ?? 'Tax Guide';
}

export function getCategoryId(post: PublicBlogSummaryCompat) {
  const category = getCategory(post);
  return normalizeKey(category?.id ?? category?.slug ?? category?.name ?? post.categoryName);
}

export function getAuthorName(post: PublicBlogSummaryCompat) {
  if (post.authorName) return post.authorName;
  if (post.author?.name) return post.author.name;
  return (
    [post.author?.firstName, post.author?.lastName].filter(Boolean).join(' ') ||
    'MyeCA Editorial Team'
  );
}

export function getAuthorRole(post: PublicBlogSummaryCompat) {
  return post.authorRole ?? post.author?.role ?? 'MyeCA Editorial';
}

export function getCoverImage(post: PublicBlogSummaryCompat) {
  return post.coverImage ?? post.featuredImage ?? post.image ?? null;
}

export function getPublishedDate(post: PublicBlogSummaryCompat) {
  return post.publishedAt ?? post.createdAt ?? post.updatedAt ?? null;
}

export function formatDate(
  value: string | null | undefined,
  monthStyle: 'short' | 'long' = 'short'
) {
  if (!value) return 'Recently updated';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently updated';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: monthStyle, year: 'numeric' });
}

export function getReadTime(post: PublicBlogSummaryCompat) {
  return post.readingTimeMinutes
    ? `${post.readingTimeMinutes} min read`
    : (post.readTime ?? '5 min read');
}

export function getInitials(name: string) {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'ME'
  );
}

export type BlogLastRead = {
  slug: string;
  title: string;
  at: string;
};

const LAST_READ_STORAGE_KEY = 'myeca:blog:last-read';

export function readBlogLastRead(): BlogLastRead | null {
  try {
    const raw = localStorage.getItem(LAST_READ_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BlogLastRead>;
    if (!parsed || typeof parsed.slug !== 'string' || typeof parsed.title !== 'string') return null;
    return { slug: parsed.slug, title: parsed.title, at: parsed.at ?? '' };
  } catch {
    return null;
  }
}

export function writeBlogLastRead(entry: BlogLastRead) {
  try {
    localStorage.setItem(LAST_READ_STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // Storage unavailable (private mode) — reading continuity silently no-ops.
  }
}

export function clearBlogLastRead() {
  try {
    localStorage.removeItem(LAST_READ_STORAGE_KEY);
  } catch {
    // Storage unavailable — nothing to clear.
  }
}
