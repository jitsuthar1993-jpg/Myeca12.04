import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthProvider";

const authMocks = vi.hoisted(() => ({
  clearAuthToken: vi.fn(),
  clearTemporaryAuthState: vi.fn(),
}));

vi.mock("@/lib/authToken", () => ({
  clearAuthToken: authMocks.clearAuthToken,
  getAuthToken: vi.fn(async () => null),
  hasStoredSupabaseSession: vi.fn(() => false),
  setAuthToken: vi.fn(),
}));

vi.mock("@/lib/auth-session-state", () => ({
  clearTemporaryAuthState: authMocks.clearTemporaryAuthState,
}));

vi.mock("@/lib/supabase-config", () => ({
  isSupabaseEnabled: false,
}));

vi.mock("@/utils/runtime-env", () => ({
  allowLocalAuthFallbacks: () => false,
}));

function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button type="button" onClick={() => void logout("manual")}>
      Sign out
    </button>
  );
}

describe("AuthProvider logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/dashboard");
  });

  it("sends every manual logout path back to the homepage", async () => {
    render(
      <AuthProvider>
        <LogoutButton />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => expect(authMocks.clearAuthToken).toHaveBeenCalled());
    expect(authMocks.clearTemporaryAuthState).toHaveBeenCalled();
    expect(window.location.pathname).toBe("/");
  });
});
