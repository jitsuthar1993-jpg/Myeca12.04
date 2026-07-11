import { describe, expect, it } from "vitest";
import { containsPlaceholderCopy } from "../../../scripts/audit-public-links";

describe("public link audit placeholder detection", () => {
  it("detects explicit unfinished-page copy", () => {
    expect(containsPlaceholderCopy("<main><h1>Page under construction</h1></main>")).toBe(true);
  });

  it("does not flag legitimate tax guidance about construction", () => {
    expect(containsPlaceholderCopy("<p>Interest paid while the property was under construction may require separate review.</p>")).toBe(false);
  });
});
