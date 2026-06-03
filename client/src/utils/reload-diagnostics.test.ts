import { beforeEach, describe, expect, it } from "vitest";
import { readLastReloadAttempt, recordReloadAttempt } from "./reload-diagnostics";

describe("reload diagnostics", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("records the latest reload reason and increments attempts", () => {
    recordReloadAttempt("stale_chunk", {
      path: "/dashboard",
      now: 1000,
      storage: window.sessionStorage,
    });
    recordReloadAttempt("stale_chunk", {
      path: "/dashboard",
      now: 1500,
      storage: window.sessionStorage,
    });

    expect(readLastReloadAttempt(window.sessionStorage)).toEqual({
      attempts: 2,
      path: "/dashboard",
      reason: "stale_chunk",
      timestamp: 1500,
    });
  });
});
