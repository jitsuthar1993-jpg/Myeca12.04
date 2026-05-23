import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  recoverFromStaleChunk,
  isRecoverableChunkError,
} from "@/utils/chunk-recovery";
import { readLastReloadAttempt } from "@/utils/reload-diagnostics";

describe("chunk recovery", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("detects stale deployment chunk loading errors", () => {
    expect(isRecoverableChunkError(new Error("Failed to fetch dynamically imported module: /assets/page-old.js"))).toBe(true);
    expect(isRecoverableChunkError(new Error("Loading chunk 42 failed"))).toBe(true);
  });

  it("ignores ordinary application errors", () => {
    expect(isRecoverableChunkError(new Error("Cannot read properties of undefined"))).toBe(false);
    expect(isRecoverableChunkError("Unable to load your profile")).toBe(false);
  });

  it("reloads once and records diagnostics for the first stale chunk error", async () => {
    const reloadPage = vi.fn();

    await expect(
      recoverFromStaleChunk(new Error("Failed to fetch dynamically imported module: /assets/page-old.js"), {
        now: () => 1000,
        pathname: "/dashboard",
        reloadPage,
        storage: window.sessionStorage,
      }),
    ).resolves.toBe(true);

    expect(reloadPage).toHaveBeenCalledTimes(1);
    expect(readLastReloadAttempt(window.sessionStorage)).toMatchObject({
      reason: "stale_chunk",
      path: "/dashboard",
      timestamp: 1000,
      attempts: 1,
    });
  });

  it("does not reload again for the same path or during the cooldown window", async () => {
    const reloadPage = vi.fn();

    await recoverFromStaleChunk(new Error("Loading chunk 42 failed"), {
      now: () => 1000,
      pathname: "/dashboard",
      reloadPage,
      storage: window.sessionStorage,
    });
    await expect(
      recoverFromStaleChunk(new Error("Loading chunk 42 failed"), {
        now: () => 1500,
        pathname: "/dashboard",
        reloadPage,
        storage: window.sessionStorage,
      }),
    ).resolves.toBe(false);
    await expect(
      recoverFromStaleChunk(new Error("Loading chunk 42 failed"), {
        now: () => 2000,
        pathname: "/documents",
        reloadPage,
        storage: window.sessionStorage,
      }),
    ).resolves.toBe(false);

    expect(reloadPage).toHaveBeenCalledTimes(1);
  });
});
