import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const pageSource = readFileSync(
  resolve(__dirname, "penalty-calculator.page.tsx"),
  "utf8",
);

describe("Penalty reference page contract", () => {
  it("uses the official-source dataset and remains excluded from indexing", () => {
    expect(pageSource).toContain("PENALTY_RULE_DATASET");
    expect(pageSource).toMatch(/<MetaSEO[\s\S]*?noindex/);
    expect(pageSource).toContain("officialSources.map");
  });

  it("does not retain calculation constants, result logic, or amount controls", () => {
    expect(pageSource).not.toMatch(/const penalties\s*=/);
    expect(pageSource).not.toContain("useMemo");
    expect(pageSource).not.toContain("useState");
    expect(pageSource).not.toContain("<Input");
    expect(pageSource).not.toContain("<Slider");
    expect(pageSource).not.toContain("CalcResultRow");
  });

  it("states that no estimate is available and sends users to the authorities", () => {
    expect(pageSource).toContain("No estimate is available");
    expect(pageSource).toContain("Check the applicable authority");
    expect(pageSource).toContain("target=\"_blank\"");
    expect(pageSource).toContain("rel=\"noreferrer\"");
  });
});
