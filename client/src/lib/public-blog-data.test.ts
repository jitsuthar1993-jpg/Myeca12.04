import { describe, expect, it } from "vitest";
import {
  buildPublicBlogDetailUrl,
  buildPublicBlogListUrl,
  normalizePublicBlogListParams,
  publicBlogQueryKeys,
} from "./public-blog-data";

describe("public blog data helpers", () => {
  it("normalizes empty and all filters out of list query keys", () => {
    expect(
      publicBlogQueryKeys.list({
        page: 1,
        limit: 13,
        search: "  ",
        category: "all",
        audience: "all",
      }),
    ).toEqual(publicBlogQueryKeys.list({ page: 1, limit: 13 }));
  });

  it("builds stable list URLs with trimmed filters", () => {
    expect(
      buildPublicBlogListUrl({
        page: 2,
        limit: 13,
        search: " GST Notice ",
        category: "income-tax",
        audience: "individuals",
      }),
    ).toBe("/api/public/blogs?page=2&limit=13&category=income-tax&audience=individuals&search=gst+notice");
  });

  it("clamps list params to the public API range", () => {
    expect(normalizePublicBlogListParams({ page: -2, limit: 99 })).toEqual({
      page: 1,
      limit: 50,
    });
  });

  it("builds encoded detail URLs", () => {
    expect(buildPublicBlogDetailUrl("zero tax/section 87a")).toBe(
      "/api/public/blogs/zero%20tax%2Fsection%2087a",
    );
  });
});
