import { describe, expect, it } from "vitest";
import {
  recordReloadAttempt,
  readLastReloadAttempt,
} from "@/utils/reload-diagnostics";

describe("reload diagnostics", () => {
  it("records reload reason, path, timestamp, and incrementing attempts", () => {
    const storage = window.sessionStorage;
    storage.clear();

    const first = recordReloadAttempt("stale_chunk", {
      path: "/dashboard",
      now: 1000,
      storage,
    });
    const second = recordReloadAttempt("stale_chunk", {
      path: "/dashboard",
      now: 1500,
      storage,
    });

    expect(first).toMatchObject({
      reason: "stale_chunk",
      path: "/dashboard",
      timestamp: 1000,
      attempts: 1,
    });
    expect(second).toMatchObject({
      reason: "stale_chunk",
      path: "/dashboard",
      timestamp: 1500,
      attempts: 2,
    });
    expect(readLastReloadAttempt(storage)).toEqual(second);
  });

  it("does not throw when sessionStorage is unavailable", () => {
    const unavailableStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    } as unknown as Storage;

    expect(() =>
      recordReloadAttempt("login_redirect", {
        path: "/auth/login",
        now: 1000,
        storage: unavailableStorage,
      }),
    ).not.toThrow();
    expect(readLastReloadAttempt(unavailableStorage)).toBeNull();
  });
});
