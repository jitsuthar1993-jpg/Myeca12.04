import { describe, expect, it } from "vitest";
import { getNotificationActionHref } from "./notification-navigation";

describe("getNotificationActionHref", () => {
  it("prefers an explicit internal action URL", () => {
    expect(
      getNotificationActionHref({
        actionUrl: "/itr/filing?returnId=return-1",
        metadata: { actionUrl: "/dashboard" },
      }),
    ).toBe("/itr/filing?returnId=return-1");
  });

  it("reads safe action URLs from notification metadata", () => {
    expect(
      getNotificationActionHref({
        metadata: { actionUrl: "/dashboard/services/service-1" },
      }),
    ).toBe("/dashboard/services/service-1");
  });

  it("rejects external, protocol-relative, and auth redirect paths", () => {
    expect(getNotificationActionHref({ actionUrl: "https://example.com" })).toBeNull();
    expect(getNotificationActionHref({ actionUrl: "//example.com" })).toBeNull();
    expect(getNotificationActionHref({ actionUrl: "/auth/login?next=/dashboard" })).toBeNull();
  });
});
