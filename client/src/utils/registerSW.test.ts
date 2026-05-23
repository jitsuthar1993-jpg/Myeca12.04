import { beforeEach, describe, expect, it, vi } from "vitest";
import { readLastReloadAttempt } from "@/utils/reload-diagnostics";
import { registerServiceWorker } from "@/utils/registerSW";

function mockServiceWorker(registrationCount = 1) {
  const registrations = Array.from({ length: registrationCount }, () => ({
    unregister: vi.fn().mockResolvedValue(true),
  }));

  Object.defineProperty(window.navigator, "serviceWorker", {
    configurable: true,
    value: {
      controller: {},
      getRegistrations: vi.fn().mockResolvedValue(registrations),
    },
  });

  return registrations;
}

describe("service worker registration", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    mockServiceWorker();
  });

  it("records the one-time development unregister reload", async () => {
    const reloadPage = vi.fn();

    await (registerServiceWorker as any)(undefined, {
      now: () => 1000,
      pathname: "/auth/login",
      reloadPage,
      storage: window.sessionStorage,
    });

    expect(reloadPage).toHaveBeenCalledTimes(1);
    expect(readLastReloadAttempt(window.sessionStorage)).toMatchObject({
      reason: "service_worker_dev_unregistered",
      path: "/auth/login",
      timestamp: 1000,
      attempts: 1,
    });
  });

  it("does not repeat the development unregister reload in the same tab session", async () => {
    const reloadPage = vi.fn();
    window.sessionStorage.setItem("sw_dev_unregistered", "1");

    await (registerServiceWorker as any)(undefined, {
      now: () => 1000,
      pathname: "/auth/login",
      reloadPage,
      storage: window.sessionStorage,
    });

    expect(reloadPage).not.toHaveBeenCalled();
    expect(readLastReloadAttempt(window.sessionStorage)).toBeNull();
  });
});
