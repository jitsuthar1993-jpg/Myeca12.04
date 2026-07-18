import { describe, expect, it } from "vitest";
import {
  buildReadableReviewArtifact,
  parserFileTypeForSource,
  sanitizeReadableReviewHtml,
} from "../../scripts/genius-readable-review";

describe("Genius readable-source review artifacts", () => {
  it("normalizes legacy HTM catalogue entries to the supported HTML parser type", () => {
    expect(parserFileTypeForSource("html")).toBe("html");
    expect(parserFileTypeForSource("rtf")).toBe("rtf");
  });

  it("removes executable markup while preserving form structure", () => {
    const sanitized = sanitizeReadableReviewHtml(`
      <script>alert(1)</script>
      <table onclick="alert(2)"><tr><td colspan="2">Form $#$Name$#$</td></tr></table>
      <a href="javascript:alert(3)">unsafe</a>
      <iframe src="https://example.com"></iframe>
    `);

    expect(sanitized).toContain("<table>");
    expect(sanitized).toContain('colspan="2"');
    expect(sanitized).toContain("$#$Name$#$");
    expect(sanitized).not.toMatch(/script|iframe|onclick|javascript:/i);
  });

  it("records immutable source and output integrity evidence", () => {
    const artifact = buildReadableReviewArtifact({
      id: "genius-form-3ca",
      title: "Form 3CA",
      sourceRelativePath: "ReportsN/3CA_2024.rtf",
      sourceFormat: "rtf",
      sourceBytes: Buffer.from("source"),
      convertedHtml: "<table><tr><td>$#$Name$#$</td></tr></table>",
      parserMessages: [],
    });

    expect(artifact.reviewStatus).toBe("legal_review_required");
    expect(artifact.conversionStatus).toBe("converted");
    expect(artifact.publicationAllowed).toBe(false);
    expect(artifact.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(artifact.outputSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(artifact.structure).toMatchObject({ tables: 1, rows: 1, placeholders: 2 });
  });

  it("flags structurally empty parser output for source recovery", () => {
    const artifact = buildReadableReviewArtifact({
      id: "genius-empty-legacy-form",
      title: "Legacy form",
      sourceRelativePath: "ReportsN/legacy.rtf",
      sourceFormat: "rtf",
      sourceBytes: Buffer.from("{\\rtf1 legacy}"),
      convertedHtml: '<div class="container"></div>',
      parserMessages: [],
    });

    expect(artifact.conversionStatus).toBe("source_content_missing");
    expect(artifact.reviewStatus).toBe("source_recovery_required");
    expect(artifact.publicationAllowed).toBe(false);
    expect(artifact.structure.textCharacters).toBe(0);
  });
});
