// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./registerSW";

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
