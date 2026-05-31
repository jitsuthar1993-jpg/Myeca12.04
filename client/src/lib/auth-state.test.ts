import { afterEach, describe, expect, it, vi } from "vitest";
import {
  TEMPORARY_TEST_AUTH_STORAGE_KEY,
  TEMPORARY_TEST_AUTH_TOKEN_KEY,
} from "@/lib/temporary-test-users";
import { clearTemporaryAuthState } from "@/lib/auth-session-state";
import { authUserToSyncPayload } from "@/lib/auth-user-sync";
import { getAuthToken, hasStoredSupabaseSession } from "@/lib/authToken";

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: async () => ({
        data: {
          session: {
            access_token: "supabase-token",
          },
        },
      }),
    },
  },
}));

describe("auth session state", () => {
  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  it("clears stale temporary test auth before real auth flows", () => {
    sessionStorage.setItem(TEMPORARY_TEST_AUTH_TOKEN_KEY, "myeca-temp-test:user");
    sessionStorage.setItem(
      TEMPORARY_TEST_AUTH_STORAGE_KEY,
      JSON.stringify({
        id: "temporary_test_user",
        email: "test.user@myeca.in",
        firstName: "Test",
        lastName: "Tester",
        role: "user",
      }),
    );

    clearTemporaryAuthState();

    expect(sessionStorage.getItem(TEMPORARY_TEST_AUTH_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(TEMPORARY_TEST_AUTH_STORAGE_KEY)).toBeNull();
  });

  it("builds sync payloads from Supabase metadata without defaulting names to User", () => {
    expect(
      authUserToSyncPayload({
        email: "new.user@example.com",
        phone: "",
        user_metadata: {
          full_name: "New Filing User",
          phone_number: "9876543210",
        },
      } as any),
    ).toEqual({
      email: "new.user@example.com",
      firstName: "New",
      lastName: "Filing User",
      phoneNumber: "9876543210",
    });
  });

  it("ignores stale generic tokens when a Supabase session exists", async () => {
    sessionStorage.setItem(TEMPORARY_TEST_AUTH_TOKEN_KEY, "stale-token");
    localStorage.setItem("sb-test-auth-token", JSON.stringify({ currentSession: true }));

    await expect(getAuthToken()).resolves.toBe("supabase-token");
    expect(sessionStorage.getItem(TEMPORARY_TEST_AUTH_TOKEN_KEY)).toBeNull();
  });

  it("skips Supabase session recovery when anonymous storage is empty", async () => {
    expect(hasStoredSupabaseSession()).toBe(false);
    await expect(getAuthToken()).resolves.toBeNull();
  });
});
