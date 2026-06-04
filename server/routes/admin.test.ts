// @vitest-environment node
import { describe, expect, it } from "vitest";
import { parseRequestLimit } from "./admin";

describe("parseRequestLimit", () => {
  it("returns 50 (the default) when the input is genuinely unparseable", () => {
    // `Number(undefined)` is NaN -> hits the default branch.
    expect(parseRequestLimit(undefined)).toBe(50);
    // `Number("not-a-number")` is NaN -> default.
    expect(parseRequestLimit("not-a-number")).toBe(50);
    // `Number({})` is NaN -> default.
    expect(parseRequestLimit({})).toBe(50);
  });

  it("treats null and empty string as 0 (which then clamps to 1)", () => {
    // `Number(null)` and `Number("")` are both 0, which is finite, so they hit the
    // clamp instead of the default. Documenting this behaviour explicitly because the
    // route layer is expected to send `undefined` when callers omit the query param —
    // a `?limit=` (empty) silently demoting to 1 would otherwise be a surprise.
    expect(parseRequestLimit(null)).toBe(1);
    expect(parseRequestLimit("")).toBe(1);
  });

  it("clamps numeric inputs into [1, 100]", () => {
    expect(parseRequestLimit("0")).toBe(1);
    expect(parseRequestLimit("-10")).toBe(1);
    expect(parseRequestLimit("1")).toBe(1);
    expect(parseRequestLimit("50")).toBe(50);
    expect(parseRequestLimit("100")).toBe(100);
    expect(parseRequestLimit("100000")).toBe(100);
  });

  it("accepts both string and number inputs", () => {
    expect(parseRequestLimit(25)).toBe(25);
    expect(parseRequestLimit("25")).toBe(25);
  });

  it("floors fractional inputs before clamping", () => {
    expect(parseRequestLimit("50.9")).toBe(50);
    expect(parseRequestLimit("99.99")).toBe(99);
    expect(parseRequestLimit("100.01")).toBe(100);
  });
});
