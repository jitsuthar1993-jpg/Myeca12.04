import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveApiUrl } from "./api-base-url";

describe("API base URL resolver", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("leaves API paths unchanged when no API base URL is configured", () => {
    vi.stubEnv("VITE_API_BASE_URL", "");

    expect(resolveApiUrl("/api/public/blogs")).toBe("/api/public/blogs");
  });

  it("rewrites root API paths to the configured base URL", () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://myeca.in/");

    expect(resolveApiUrl("/api/public/blogs?page=1#top")).toBe(
      "https://myeca.in/api/public/blogs?page=1#top",
    );
  });

  it("does not rewrite non-API paths", () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://myeca.in");

    expect(resolveApiUrl("/apiary")).toBe("/apiary");
    expect(resolveApiUrl("/dashboard")).toBe("/dashboard");
  });

  it("rewrites current-origin API URLs but leaves remote URLs alone", () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://myeca.in");

    expect(resolveApiUrl(new URL("/api/profile", window.location.origin))).toBe(
      "https://myeca.in/api/profile",
    );
    expect(resolveApiUrl("https://example.com/api/profile")).toBe("https://example.com/api/profile");
  });
});
