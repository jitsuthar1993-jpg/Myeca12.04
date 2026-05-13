import { describe, expect, it } from "vitest";
import { estimateReadingTimeMinutes, normalizeBlogContent } from "@shared/blog";

describe("blog content utilities", () => {
  it("derives stable heading ids and toc entries from markdown", () => {
    const result = normalizeBlogContent(`
# Title

## First Section
Some intro text.

### Child Section
More content.

## First Section
Repeated heading.
`);

    expect(result.toc).toEqual([
      { id: "first-section", text: "First Section", level: 2 },
      { id: "child-section", text: "Child Section", level: 3 },
      { id: "first-section-2", text: "First Section", level: 2 },
    ]);
    expect(result.html).toContain('id="first-section"');
    expect(result.html).toContain('id="child-section"');
    expect(result.html).toContain('id="first-section-2"');
  });

  it("sanitizes script tags and estimates reading time from html", () => {
    const result = normalizeBlogContent("<h2>Safe</h2><p>Hello world</p><script>alert('x')</script>");

    expect(result.html).not.toContain("<script>");
    expect(estimateReadingTimeMinutes(result.html)).toBe(1);
  });

  it("strips scriptable attributes and javascript urls from rendered html", () => {
    const result = normalizeBlogContent(`
      <style>body { display: none; }</style>
      <h2 onclick=alert(1)>Safe Heading</h2>
      <img src=x onerror="alert(2)" />
      <a href="javascript:alert(3)">Unsafe link</a>
      <a href=' javascript:alert(4)'>Unsafe link 2</a>
    `);

    expect(result.html).not.toMatch(/<style|onclick|onerror|javascript:/i);
    expect(result.html).toContain('href="#"');
    expect(result.toc).toEqual([{ id: "safe-heading", text: "Safe Heading", level: 2 }]);
  });
});
