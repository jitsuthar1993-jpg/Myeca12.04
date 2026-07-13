import { describe, expect, it } from "vitest";
import { calcNPS } from "./nps.page";

describe("calcNPS", () => {
  it("supports a zero-return accumulation scenario", () => {
    expect(calcNPS(1000, 10, 0, 20)).toMatchObject({
      corpus: 120000,
      lumpSum: 96000,
      annuityCorpus: 24000,
    });
  });

  it("uses the selected annuity share", () => {
    const result = calcNPS(1000, 1, 0, 35);
    expect(result.lumpSum + result.annuityCorpus).toBe(result.corpus);
    expect(result.annuityCorpus).toBe(result.corpus * 0.35);
  });

  it("rejects invalid inputs and annuity shares below the modeled minimum", () => {
    expect(() => calcNPS(1000, 10, Number.NaN, 20)).toThrow();
    expect(() => calcNPS(1000, 10, 8, 19)).toThrow();
    expect(() => calcNPS(1000, 10.5, 8, 20)).toThrow();
  });
});
