import { describe, expect, it, vi } from "vitest";
import {
  BLOG_SAVED_GUIDES_STORAGE_KEY,
  readSavedBlogGuides,
  removeSavedBlogGuide,
  toggleSavedBlogGuide,
  toSavedBlogGuide,
} from "./blog-saved-guides";
import type { PublicBlogSummaryCompat } from "./public-blog-data";

const basePost: PublicBlogSummaryCompat = {
  id: "post-1",
  slug: "complete-ay-2026-27-itr-filing-guide",
  title: "Complete AY 2026-27 ITR filing guide",
  excerpt: "A practical filing checklist for salaried taxpayers.",
  content: "",
  status: "published",
  audience: "individuals",
  category: { id: "itr-filing", name: "ITR Filing", slug: "itr-filing", description: null },
  authorName: "MyeCA Editorial Team",
  authorRole: "MyeCA Editorial",
  coverImage: null,
  publishedAt: "2026-06-01T00:00:00.000Z",
  updatedAt: "2026-06-15T00:00:00.000Z",
  readingTimeMinutes: 7,
  isFeatured: true,
};

describe("blog saved guides storage", () => {
  it("maps a public blog post to compact saved-guide metadata", () => {
    expect(toSavedBlogGuide(basePost, "2026-06-30T10:00:00.000Z")).toEqual({
      slug: "complete-ay-2026-27-itr-filing-guide",
      title: "Complete AY 2026-27 ITR filing guide",
      category: "ITR Filing",
      excerpt: "A practical filing checklist for salaried taxpayers.",
      updatedAt: "2026-06-15T00:00:00.000Z",
      savedAt: "2026-06-30T10:00:00.000Z",
    });
  });

  it("adds newest saved guide first and avoids duplicate slugs", () => {
    const now = vi.fn()
      .mockReturnValueOnce("2026-06-30T10:00:00.000Z")
      .mockReturnValueOnce("2026-06-30T11:00:00.000Z");

    const first = toggleSavedBlogGuide(basePost, { now });
    const second = toggleSavedBlogGuide(
      { ...basePost, title: "Updated title" },
      { now },
    );

    expect(first.saved).toBe(true);
    expect(second.saved).toBe(true);
    expect(readSavedBlogGuides()).toHaveLength(1);
    expect(readSavedBlogGuides()[0]).toMatchObject({
      slug: basePost.slug,
      title: "Updated title",
      savedAt: "2026-06-30T11:00:00.000Z",
    });
  });

  it("removes a saved guide by slug", () => {
    toggleSavedBlogGuide(basePost, { now: () => "2026-06-30T10:00:00.000Z" });

    expect(removeSavedBlogGuide(basePost.slug)).toEqual([]);
    expect(localStorage.getItem(BLOG_SAVED_GUIDES_STORAGE_KEY)).toBe("[]");
  });
});
