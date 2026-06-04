// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { sanitizeHTML } from "./sanitize";

describe("sanitizeHTML", () => {
  it("removes executable markup before document preview rendering", () => {
    const result = sanitizeHTML(`
      <section class="document" onclick="alert(1)">
        <h1>Rent Receipt</h1>
        <img src="x" onerror="alert(2)" />
        <a href="javascript:alert(3)" target="_blank">unsafe</a>
        <script>alert(4)</script>
        <p style="font-weight: bold">Allowed formatting</p>
      </section>
    `);

    expect(result).toContain("Rent Receipt");
    expect(result).toContain("Allowed formatting");
    expect(result).not.toMatch(/<script|onclick|onerror|javascript:/i);
  });

  it("neutralizes handler payloads that bypass the shared regex sanitizer", () => {
    // The shared regex sanitizer (shared/blog.ts) only strips ` on...=` when preceded by
    // whitespace, so slash-separated handlers and <svg> slip through. DOMPurify must catch them.
    const slashSeparatedImg = sanitizeHTML('<img/onerror="alert(1)" src=x>');
    expect(slashSeparatedImg).not.toMatch(/onerror/i);

    const svgOnload = sanitizeHTML('<svg/onload=alert(1)></svg>');
    expect(svgOnload).not.toMatch(/onload|<svg/i);

    const dataUriIframe = sanitizeHTML('<iframe src="data:text/html,<script>alert(1)</script>"></iframe>');
    expect(dataUriIframe).not.toMatch(/<iframe|<script/i);
  });

  it("preserves heading ids used for blog table-of-contents anchors", () => {
    const result = sanitizeHTML('<h2 id="section-one">Heading</h2><p>Body</p>');
    expect(result).toContain('id="section-one"');
    expect(result).toContain("Heading");
  });
});
