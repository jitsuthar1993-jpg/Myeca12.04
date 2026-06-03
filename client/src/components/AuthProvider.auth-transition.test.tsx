import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type AuthProviderModule = typeof import("./AuthProvider");

let AuthProvider: AuthProviderModule["AuthProvider"];
let useAuth: AuthProviderModule["useAuth"];

const authState = vi.hoisted(() => ({
  callback: null as null | ((event: string, session: any) => void),
  getAuthToken: vi.fn(async () => "initial-token"),
  hasStoredSupabaseSession: vi.fn(() => true),
  setAuthToken: vi.fn(),
}));

vi.mock("@/lib/authToken", () => ({
  clearAuthToken: vi.fn(),
  getAuthToken: authState.getAuthToken,
  hasStoredSupabaseSession: authState.hasStoredSupabaseSession,
  setAuthToken: authState.setAuthToken,
}));

vi.mock("@/lib/auth-session-state", () => ({
  clearTemporaryAuthState: vi.fn(),
}));

vi.mock("@/lib/supabase-config", () => ({
  isSupabaseEnabled: true,
  supabaseAnonKey: "test-anon-key",
  supabaseUrl: "https://example.supabase.co",
}));

vi.mock("@/utils/runtime-env", () => ({
  allowLocalAuthFallbacks: () => false,
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(async () => ({ data: { user: makeAuthUser("initial-user") } })),
      onAuthStateChange: vi.fn((callback) => {
        authState.callback = callback;
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      signOut: vi.fn(),
    },
  },
}));

function makeAuthUser(id: string) {
  return {
    id,
    email: `${id}@myeca.in`,
    app_metadata: {},
    user_metadata: { firstName: "Loaded", lastName: "User" },
    created_at: "2026-01-01T00:00:00.000Z",
    email_confirmed_at: "2026-01-01T00:00:00.000Z",
  };
}

function makeAppUser(id: string) {
  return {
    id,
    email: `${id}@myeca.in`,
    firstName: "Loaded",
    lastName: "User",
    role: "user",
    status: "active",
    isVerified: true,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

function AuthStateProbe() {
  const { isLoading, user } = useAuth();

  return (
    <div>
      <p data-testid="auth-loading-state">{isLoading ? "loading" : "ready"}</p>
      <p data-testid="auth-user-id">{user?.id ?? "anonymous"}</p>
    </div>
  );
}

describe("AuthProvider auth transitions", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    authState.callback = null;
    window.sessionStorage.clear();

    global.fetch = vi.fn(async (input) => {
      const url = String(input);
      if (url.includes("/api/v1/auth/me")) {
        return Response.json({ user: makeAppUser("loaded-user") });
      }

      return new Response(null, { status: 204 });
    });

    const authProviderModule = await import("./AuthProvider");
    AuthProvider = authProviderModule.AuthProvider;
    useAuth = authProviderModule.useAuth;
  });

  it("does not show blocking loading during a background token refresh with an existing user", async () => {
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId("auth-loading-state")).toHaveTextContent("ready"));
    expect(screen.getByTestId("auth-user-id")).toHaveTextContent("loaded-user");

    authState.callback?.("TOKEN_REFRESHED", {
      access_token: "refreshed-token",
      user: makeAuthUser("refreshed-user"),
    });

    expect(screen.getByTestId("auth-loading-state")).toHaveTextContent("ready");
  });

  it("uses blocking loading during first auth initialization", () => {
    render(
      <AuthProvider>
        <AuthStateProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("auth-loading-state")).toHaveTextContent("loading");
  });
});
