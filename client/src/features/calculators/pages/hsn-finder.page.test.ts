import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(
  "client/src/features/calculators/pages/hsn-finder.page.tsx",
  "utf8",
);

describe("HSN/SAC reference page contract", () => {
  it("uses the central reference dataset and keeps the route noindex", () => {
    expect(pageSource).toContain("HSN_REFERENCE_DATASET.entries");
    expect(pageSource).toMatch(/<MetaSEO[\s\S]*?noindex/);
    expect(pageSource).not.toMatch(/const (HSN|SAC)_DATA/);
  });

  it("does not present GST rate values from the local shortlist", () => {
    expect(pageSource).not.toMatch(/rate:\s*["']\d+%/);
    expect(pageSource).not.toContain("{item.rate}");
    expect(pageSource).toContain("Verify rate");
  });

  it("links the displayed reference to its official verification sources", () => {
    expect(pageSource).toContain("HSN_REFERENCE_DATASET.officialSources.map");
    expect(pageSource).toContain("Official verification sources");
  });
});
