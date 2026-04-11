import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import BlogArticle from "@/components/blog/BlogArticle";

const basePost = {
  title: "Editorial article",
  slug: "editorial-article",
  excerpt: "A helpful summary.",
  category: { id: "tax", name: "Tax", slug: "tax", description: null },
  coverImage: null,
  authorName: "MyeCA Team",
  authorRole: "Chartered Accountant",
  authorBio: "Author bio",
  publishedAt: "2026-03-28T00:00:00.000Z",
  readingTimeMinutes: 6,
  content: "<h2>Overview</h2><p>Body copy</p>",
};

describe("BlogArticle", () => {
  it("hides optional sections when data is absent", () => {
    render(<BlogArticle post={{ ...basePost, keyHighlights: [], faqItems: [], relatedPosts: [] }} />);

    expect(screen.queryByText("Key highlights")).not.toBeInTheDocument();
    expect(screen.queryByText("Frequently asked questions")).not.toBeInTheDocument();
    expect(screen.queryByText("Related articles")).not.toBeInTheDocument();
  });

  it("renders highlights, faq, and related articles when present", () => {
    render(
      <BlogArticle
        post={{
          ...basePost,
          keyHighlights: ["First key point"],
          faqItems: [{ question: "What is this?", answer: "A test faq." }],
          relatedPosts: [
            {
              id: "2",
              title: "Related article",
              slug: "related-article",
              excerpt: "Related summary",
              category: { id: "tax", name: "Tax", slug: "tax", description: null },
              coverImage: null,
              authorName: "MyeCA Team",
              authorRole: null,
              readingTimeMinutes: 4,
              isFeatured: false,
              publishedAt: "2026-03-28T00:00:00.000Z",
              updatedAt: "2026-03-28T00:00:00.000Z",
              tags: [],
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Key highlights")).toBeInTheDocument();
    expect(screen.getByText("First key point")).toBeInTheDocument();
    expect(screen.getByText("Frequently asked questions")).toBeInTheDocument();
    expect(screen.getByText("What is this?")).toBeInTheDocument();
    expect(screen.getByText("Related articles")).toBeInTheDocument();
    expect(screen.getByText("Related article")).toBeInTheDocument();
  });
});
