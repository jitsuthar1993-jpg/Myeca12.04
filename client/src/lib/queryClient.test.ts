import { describe, expect, it } from "vitest";
import { queryClient } from "./queryClient";

describe("query client freshness defaults", () => {
  it("refetches authenticated workspace data when the window regains focus", () => {
    [
      ["/api/user/dashboard"],
      ["/api/profiles"],
      ["/api/user-services"],
      ["/api/admin/stats"],
      ["/api/ca/stats"],
    ].forEach((queryKey) => {
      expect(queryClient.getQueryDefaults(queryKey)?.refetchOnWindowFocus).toBe(true);
    });
  });

  it("keeps public content queries from refetching on every focus return", () => {
    expect(queryClient.getDefaultOptions().queries?.refetchOnWindowFocus).toBe(false);
    expect(queryClient.getQueryDefaults(["/api/public/blogs"])?.refetchOnWindowFocus).not.toBe(true);
    expect(queryClient.getQueryDefaults(["/api/public/categories"])?.refetchOnWindowFocus).not.toBe(true);
  });
});
