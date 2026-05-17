import { describe, expect, it } from "vitest";
import { isRecoverableChunkError } from "@/utils/chunk-recovery";

describe("chunk recovery", () => {
  it("detects stale deployment chunk loading errors", () => {
    expect(isRecoverableChunkError(new Error("Failed to fetch dynamically imported module: /assets/page-old.js"))).toBe(true);
    expect(isRecoverableChunkError(new Error("Loading chunk 42 failed"))).toBe(true);
  });

  it("ignores ordinary application errors", () => {
    expect(isRecoverableChunkError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isRecoverableChunkError("Unable to load your profile")).toBe(false);
  });
});
