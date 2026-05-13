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
});
