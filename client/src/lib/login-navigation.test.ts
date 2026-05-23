import { describe, expect, it, vi } from "vitest";
import { navigateAfterLogin } from "@/lib/login-navigation";
import { readLastReloadAttempt } from "@/utils/reload-diagnostics";

describe("login navigation", () => {
  it("uses SPA navigation for internal post-login targets and records the handoff", () => {
    const navigate = vi.fn();
    const replaceLocation = vi.fn();
    window.sessionStorage.clear();

    const mode = navigateAfterLogin("/dashboard", navigate, {
      now: 1000,
      replaceLocation,
      storage: window.sessionStorage,
    });

    expect(mode).toBe("spa");
    expect(navigate).toHaveBeenCalledWith("/dashboard");
    expect(replaceLocation).not.toHaveBeenCalled();
    expect(readLastReloadAttempt(window.sessionStorage)).toMatchObject({
      reason: "login_redirect",
      path: "/dashboard",
      timestamp: 1000,
      attempts: 1,
    });
  });

  it("falls back to document navigation for non-path targets", () => {
    const navigate = vi.fn();
    const replaceLocation = vi.fn();

    const mode = navigateAfterLogin("https://example.com/dashboard", navigate, {
      now: 1000,
      replaceLocation,
      storage: window.sessionStorage,
    });

    expect(mode).toBe("document");
    expect(navigate).not.toHaveBeenCalled();
    expect(replaceLocation).toHaveBeenCalledWith("https://example.com/dashboard");
  });
});
