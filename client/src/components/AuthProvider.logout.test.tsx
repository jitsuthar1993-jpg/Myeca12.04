import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { TEMPORARY_TEST_AUTH_STORAGE_KEY } from "@/lib/temporary-test-users";
import LogoutPage from "@/pages/logout.page";

const supabaseAuthMocks = vi.hoisted(() => {
  const unsubscribe = vi.fn();

  return {
    getSession: vi.fn(async () => ({ data: { session: null } })),
    getUser: vi.fn(async () => ({ data: { user: null } })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe } } })),
    signOut: vi.fn(async () => ({ error: null })),
    unsubscribe,
  };
});

vi.mock("@/lib/supabase", () => ({
  isSupabaseEnabled: true,
  supabase: {
    auth: supabaseAuthMocks,
  },
}));

function seedSignedInUser(pathname: string) {
  window.history.pushState(null, "", pathname);
  window.sessionStorage.setItem(
    TEMPORARY_TEST_AUTH_STORAGE_KEY,
    JSON.stringify({
      id: "local_test_user",
      email: "user@example.com",
      firstName: "Test",
      lastName: "User",
      role: "user",
      status: "active",
      isVerified: true,
    }),
  );
}

function DirectLogoutButton() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  return (
    <button type="button" onClick={() => void logout("manual")}>
      {isLoading ? "Loading" : isAuthenticated ? "Sign out" : "Signed out"}
    </button>
  );
}

describe("logout navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    window.sessionStorage.clear();
    window.history.pushState(null, "", "/");
  });

  it("moves direct sign-out actions to the public homepage", async () => {
    seedSignedInUser("/dashboard");
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <DirectLogoutButton />
      </AuthProvider>,
    );

    await user.click(await screen.findByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(window.location.pathname).toBe("/"));
    expect(window.sessionStorage.getItem(TEMPORARY_TEST_AUTH_STORAGE_KEY)).toBeNull();
  });

  it("moves the dedicated logout route to the public homepage", async () => {
    seedSignedInUser("/logout");

    render(
      <AuthProvider>
        <LogoutPage />
      </AuthProvider>,
    );

    await waitFor(() => expect(supabaseAuthMocks.signOut).toHaveBeenCalled());
    await waitFor(() => expect(window.location.pathname).toBe("/"));
  });
});
