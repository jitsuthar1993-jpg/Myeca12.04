import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("mobile blog growth implementation contract", () => {
  it("keeps ITR-season mobile shortcuts and saved-guide affordances on the blog hub", () => {
    const source = readSource("client/src/pages/blog.page.tsx");

    expect(source).toContain("Find your ITR answer");
    expect(source).toContain("MOBILE_ITR_JOURNEYS");
    expect(source).toContain("Saved guides");
    expect(source).toContain("BLOG_SAVED_GUIDES_STORAGE_KEY");
    expect(source).toContain("aria-label=\"Save guide\"");
    expect(source).toContain("syncBlogFiltersToUrl");
    expect(source).toContain("readBlogFiltersFromUrl");
  });

  it("keeps the article mobile action rail separate from existing floating controls", () => {
    const source = readSource("client/src/pages/blog/[slug].page.tsx");

    expect(source).toContain("MobileArticleActionRail");
    expect(source).toContain("aria-label=\"Mobile article actions\"");
    expect(source).toContain("Save guide");
    expect(source).toContain("Next guide");
    expect(source).toContain("bottom-[calc(env(safe-area-inset-bottom)+148px)]");
    expect(source).toContain("pb-[calc(env(safe-area-inset-bottom)+104px)]");
  });
});
