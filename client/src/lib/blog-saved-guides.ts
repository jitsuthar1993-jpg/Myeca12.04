import {
  getCategoryName,
  getPublishedDate,
} from "@/components/blog/blog-post-helpers";
import type { PublicBlogSummaryCompat } from "./public-blog-data";

export const BLOG_SAVED_GUIDES_STORAGE_KEY = "myeca:blog:saved-guides:v1";

export type SavedBlogGuide = {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  updatedAt: string;
  savedAt: string;
};

type StorageAdapter = Pick<Storage, "getItem" | "setItem">;

type SavedGuideOptions = {
  now?: () => string;
  storage?: StorageAdapter;
};

function getStorage(storage?: StorageAdapter) {
  if (storage) return storage;
  if (typeof localStorage === "undefined") return null;
  return localStorage;
}

function isSavedBlogGuide(value: unknown): value is SavedBlogGuide {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SavedBlogGuide>;
  return Boolean(
    candidate.slug &&
      candidate.title &&
      typeof candidate.slug === "string" &&
      typeof candidate.title === "string"
  );
}

function writeSavedBlogGuides(guides: SavedBlogGuide[], storage?: StorageAdapter) {
  try {
    getStorage(storage)?.setItem(BLOG_SAVED_GUIDES_STORAGE_KEY, JSON.stringify(guides));
  } catch {
    // Storage can be unavailable in private browsing; saving should never block reading.
  }
}

export function readSavedBlogGuides(storage?: StorageAdapter): SavedBlogGuide[] {
  try {
    const raw = getStorage(storage)?.getItem(BLOG_SAVED_GUIDES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedBlogGuide).map((guide) => ({
      slug: guide.slug,
      title: guide.title,
      category: guide.category || "Tax Guide",
      excerpt: guide.excerpt || "",
      updatedAt: guide.updatedAt || "",
      savedAt: guide.savedAt || "",
    }));
  } catch {
    return [];
  }
}

export function toSavedBlogGuide(
  post: PublicBlogSummaryCompat,
  savedAt = new Date().toISOString()
): SavedBlogGuide {
  return {
    slug: post.slug,
    title: post.title,
    category: getCategoryName(post),
    excerpt: post.excerpt ?? "",
    updatedAt: post.updatedAt ?? getPublishedDate(post) ?? "",
    savedAt,
  };
}

export function isBlogGuideSaved(slug: string, guides = readSavedBlogGuides()) {
  return guides.some((guide) => guide.slug === slug);
}

export function toggleSavedBlogGuide(post: PublicBlogSummaryCompat, options: SavedGuideOptions = {}) {
  const savedAt = options.now?.() ?? new Date().toISOString();
  const current = readSavedBlogGuides(options.storage);
  const guide = toSavedBlogGuide(post, savedAt);
  const next = [guide, ...current.filter((item) => item.slug !== guide.slug)].slice(0, 24);
  writeSavedBlogGuides(next, options.storage);
  return { saved: true, guides: next };
}

export function removeSavedBlogGuide(slug: string, storage?: StorageAdapter) {
  const next = readSavedBlogGuides(storage).filter((guide) => guide.slug !== slug);
  writeSavedBlogGuides(next, storage);
  return next;
}
