import { describe, expect, it } from "vitest";
import { escapeDocumentText, wrapPrintableDocument } from "./document-print";

describe("document print wrapper", () => {
  it("escapes document metadata and notices", () => {
    const output = wrapPrintableDocument('<p>Body</p>', 'A < B', 'Use <review> & sign');

    expect(output).toContain('<title>A &lt; B</title>');
    expect(output).toContain('data-document-title="A &lt; B"');
    expect(output).toContain("Use &lt;review&gt; &amp; sign");
    expect(output).not.toContain("<review>");
  });

  it("includes shared print rules and preserves generated document HTML", () => {
    const output = wrapPrintableDocument('<table><thead><tr><th>Item</th></tr></thead></table>', 'Invoice');

    expect(output).toContain("@page { size: A4; margin: 16mm; }");
    expect(output).toContain("display: table-header-group");
    expect(output).toContain('class="mye-ca-document"');
    expect(output).toContain("<table><thead>");
  });

  it("normalizes nullish text safely", () => {
    expect(escapeDocumentText(null)).toBe("");
    expect(escapeDocumentText(undefined)).toBe("");
    expect(escapeDocumentText(42)).toBe("42");
  });
});
