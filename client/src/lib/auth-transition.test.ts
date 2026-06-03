import { describe, expect, it } from "vitest";
import { shouldUseBlockingAuthLoading } from "@/lib/auth-transition";

describe("auth transition loading", () => {
  it("keeps token refresh in the background when a user is already loaded", () => {
    expect(shouldUseBlockingAuthLoading("TOKEN_REFRESHED", true, true)).toBe(false);
  });

  it("keeps user metadata updates in the background when a user is already loaded", () => {
    expect(shouldUseBlockingAuthLoading("USER_UPDATED", true, true)).toBe(false);
  });

  it("keeps repeated signed-in events in the background when a user is already loaded", () => {
    expect(shouldUseBlockingAuthLoading("SIGNED_IN", true, true)).toBe(false);
  });

  it("uses blocking loading when the session is missing or no user is loaded yet", () => {
    expect(shouldUseBlockingAuthLoading("SIGNED_OUT", true, false)).toBe(true);
    expect(shouldUseBlockingAuthLoading("SIGNED_IN", false, true)).toBe(true);
  });
});
