import { describe, expect, it } from "vitest";
import { getBlogCoverImageSrc, isGeneratedBlogCover } from "./blog-cover-assets";

describe("blog cover asset URLs", () => {
  it("version-busts generated text covers with stable filenames", () => {
    const src = "/assets/blog/text-covers/complete-ay-2026-27-itr-filing-guide.svg";

    expect(isGeneratedBlogCover(src)).toBe(true);
    expect(getBlogCoverImageSrc(src)).toBe(`${src}?v=ay202627-cover-v2`);
  });

  it("leaves non-generated covers unchanged", () => {
    const src = "/uploads/blog/custom-cover.webp";

    expect(isGeneratedBlogCover(src)).toBe(false);
    expect(getBlogCoverImageSrc(src)).toBe(src);
  });
});
