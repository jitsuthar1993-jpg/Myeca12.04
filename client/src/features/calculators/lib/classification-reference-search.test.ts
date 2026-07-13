import { describe, expect, it } from "vitest";
import { HSN_REFERENCE_DATASET } from "@/data/calculator-rule-datasets";
import { searchClassificationReferences } from "./classification-reference-search";

describe("searchClassificationReferences", () => {
  it("returns the selected classification type in source order for a blank query", () => {
    const results = searchClassificationReferences(HSN_REFERENCE_DATASET.entries, {
      type: "hsn",
      query: "   ",
    });

    expect(results.map((entry) => entry.code)).toEqual(["1001", "6109", "8471", "8517", "3304"]);
    expect(results.every((entry) => entry.kind === "hsn")).toBe(true);
  });

  it("matches descriptions without regard to case or surrounding whitespace", () => {
    const results = searchClassificationReferences(HSN_REFERENCE_DATASET.entries, {
      type: "sac",
      query: "  TELECOMMUNICATIONS  ",
    });

    expect(results.map((entry) => entry.code)).toEqual(["9984"]);
  });

  it("matches a code only within the selected classification type", () => {
    expect(searchClassificationReferences(HSN_REFERENCE_DATASET.entries, {
      type: "sac",
      query: "996",
    }).map((entry) => entry.code)).toEqual(["9963", "9965"]);

    expect(searchClassificationReferences(HSN_REFERENCE_DATASET.entries, {
      type: "hsn",
      query: "996",
    })).toEqual([]);
  });

  it("does not mutate the central reference dataset", () => {
    const before = HSN_REFERENCE_DATASET.entries.map((entry) => ({ ...entry }));

    searchClassificationReferences(HSN_REFERENCE_DATASET.entries, { type: "hsn", query: "wheat" });

    expect(HSN_REFERENCE_DATASET.entries).toEqual(before);
  });
});
