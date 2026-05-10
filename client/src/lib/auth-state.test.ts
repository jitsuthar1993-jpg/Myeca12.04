import { describe, expect, it } from "vitest";
import {
  TEMPORARY_TEST_AUTH_STORAGE_KEY,
  TEMPORARY_TEST_AUTH_TOKEN_KEY,
} from "@/lib/temporary-test-users";
import { clearTemporaryAuthState } from "@/lib/auth-session-state";
import { authUserToSyncPayload } from "@/lib/auth-user-sync";

describe("auth session state", () => {
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
});
