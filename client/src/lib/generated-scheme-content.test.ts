import { describe, expect, it } from "vitest";
import { loadStaticMdxBlogPosts } from "../../../server/data/static-blog-content";

function normalizedWords(value: string, ignored: Set<string>) {
  return value
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !ignored.has(word));
}

function eightWordGrams(words: string[]) {
  const grams = new Set<string>();
  for (let index = 0; index + 7 < words.length; index += 1) {
    grams.add(words.slice(index, index + 8).join(" "));
  }
  return grams;
}

describe("generated government-scheme editorial cluster", () => {
  const posts = loadStaticMdxBlogPosts().filter(
    (post) => post.categoryId === "government-schemes" && post.slug.startsWith("government-scheme-2026-"),
  );

  it("keeps all 50 scheme guides free of unrelated tax-record language", () => {
    expect(posts).toHaveLength(50);

    for (const post of posts) {
      expect(post.content, post.slug).not.toMatch(
        /\bresulting gain, loss, or holding-period treatment\b/i,
      );
    }
  });

  it("keeps generated descriptions complete after length limiting", () => {
    for (const post of posts) {
      expect(post.seoDescription, post.slug).not.toMatch(
        /\b(?:a|an|and|as|at|before|by|check|compare|confirm|for|from|in|into|of|on|or|prepare|retain|review|the|through|to|use|verify|with|within|without)\.$/i,
      );
      expect(post.seoDescription, post.slug).not.toMatch(/[,;:]\.$/);
    }
  });

  it("does not publish a noun-swapped scheme article batch", () => {
    const records = posts.map((post) => {
      const ignored = new Set(
        normalizedWords(
          [post.slug, post.primaryKeyword, ...post.secondaryKeywords, ...post.keyTopics].join(" "),
          new Set(),
        ),
      );
      return {
        slug: post.slug,
        grams: eightWordGrams(normalizedWords(post.content, ignored)),
      };
    });

    let closestPair = { overlap: 0, routes: "" };
    for (let left = 0; left < records.length; left += 1) {
      for (let right = left + 1; right < records.length; right += 1) {
        let shared = 0;
        for (const gram of records[left].grams) {
          if (records[right].grams.has(gram)) shared += 1;
        }
        const overlap = shared / Math.min(records[left].grams.size, records[right].grams.size);
        if (overlap > closestPair.overlap) {
          closestPair = {
            overlap,
            routes: `${records[left].slug} and ${records[right].slug}`,
          };
        }
      }
    }

    expect(
      closestPair.overlap,
      `Closest noun-swapped pair: ${closestPair.routes}`,
    ).toBeLessThan(0.35);
  });
});
