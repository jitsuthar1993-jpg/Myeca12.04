import { afterEach, describe, expect, it, vi } from "vitest";
import { apiRequest, normalizeApiPath } from "./queryClient";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("normalizeApiPath", () => {
  it("returns the bare pathname for a plain URL", () => {
    expect(normalizeApiPath("/api/user-services")).toBe("/api/user-services");
    expect(normalizeApiPath("/api/admin/stats")).toBe("/api/admin/stats");
  });

  it("strips query strings", () => {
    expect(normalizeApiPath("/api/admin/requests/consultations?limit=100&status=new"))
      .toBe("/api/admin/requests/consultations");
  });

  it("replaces hex-style document ids with :id", () => {
    expect(normalizeApiPath("/api/user-services/abc123def456")).toBe("/api/user-services/:id");
    expect(normalizeApiPath("/api/admin/user-services/a1b2c3d4e5f6/notes"))
      .toBe("/api/admin/user-services/:id/notes");
  });

  it("replaces numeric path segments with :id", () => {
    expect(normalizeApiPath("/api/posts/42")).toBe("/api/posts/:id");
    expect(normalizeApiPath("/api/posts/42/comments/108")).toBe("/api/posts/:id/comments/:id");
  });

  it("works on absolute URLs", () => {
    expect(normalizeApiPath("https://myeca.in/api/user/dashboard?refresh=1"))
      .toBe("/api/user/dashboard");
  });

  it("safely handles odd input that the URL parser would percent-encode", () => {
    // The URL constructor never throws when given a base URL, so the function returns
    // the URL-encoded pathname rather than the raw string. The key property the
    // telemetry sink cares about is that the result has no query string.
    expect(normalizeApiPath("not a url?with=params")).not.toContain("?");
  });

  it("passes keepalive through for lifecycle draft flushes", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/api/tax-returns/return_1", {
      method: "PATCH",
      body: JSON.stringify({ draft: {} }),
      keepalive: true,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tax-returns/return_1",
      expect.objectContaining({ keepalive: true }),
    );
  });
});
