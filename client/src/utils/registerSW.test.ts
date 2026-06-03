// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readLastReloadAttempt } from "./reload-diagnostics";
import { registerServiceWorker } from "./registerSW";

beforeEach(() => {
  window.sessionStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  document.body.innerHTML = "";
  window.history.replaceState({}, "", "/");
  Object.defineProperty(navigator, "serviceWorker", {
    configurable: true,
    value: undefined,
  });
});

describe("service worker dev unregister reload", () => {
  it("records the one-time development unregister reload", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const reloadPage = vi.fn();
    const registrations = [{ unregister: vi.fn().mockResolvedValue(true) }];

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        controller: {},
        getRegistrations: vi.fn().mockResolvedValue(registrations),
      },
    });

    await registerServiceWorker(undefined, {
      now: () => 1000,
      pathname: "/auth/login",
      reloadPage,
      storage: window.sessionStorage,
    });

    expect(reloadPage).toHaveBeenCalledTimes(1);
    expect(readLastReloadAttempt(window.sessionStorage)).toMatchObject({
      attempts: 1,
      path: "/auth/login",
      reason: "service_worker_dev_unregistered",
      timestamp: 1000,
    });
  });

  it("does not repeat the development unregister reload in the same tab session", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const reloadPage = vi.fn();
    window.sessionStorage.setItem("sw_dev_unregistered", "1");

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        controller: {},
        getRegistrations: vi.fn().mockResolvedValue([{ unregister: vi.fn().mockResolvedValue(true) }]),
      },
    });

    await registerServiceWorker(undefined, {
      now: () => 1000,
      pathname: "/auth/login",
      reloadPage,
      storage: window.sessionStorage,
    });

    expect(reloadPage).not.toHaveBeenCalled();
    expect(readLastReloadAttempt(window.sessionStorage)).toBeNull();
  });
});

describe("service worker update notification", () => {
  it("surfaces waiting updates quickly on public conversion routes", async () => {
    vi.useFakeTimers();
    vi.stubEnv("NODE_ENV", "production");
    window.history.replaceState({}, "", "/itr/start?source=public_mobile_sticky_bar");

    const registration = {
      active: {},
      scope: "/",
      waiting: { postMessage: vi.fn() },
      addEventListener: vi.fn(),
      update: vi.fn().mockResolvedValue(undefined),
    };

    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        addEventListener: vi.fn(),
        controller: {},
        register: vi.fn().mockResolvedValue(registration),
      },
    });

    await registerServiceWorker();
    expect(document.getElementById("sw-update-notification")).toBeNull();

    await vi.advanceTimersByTimeAsync(5_000);

    expect(document.getElementById("sw-update-notification")).not.toBeNull();
  });
});
