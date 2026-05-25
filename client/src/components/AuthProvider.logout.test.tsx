import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
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
    signInWithPassword: vi.fn(),
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

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

function DirectLogoutButton() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  return (
    <button type="button" onClick={() => void logout("manual")}>
      {isLoading ? "Loading" : isAuthenticated ? "Sign out" : "Signed out"}
    </button>
  );
}

function EmailLoginProbe() {
  const { login } = useAuth();
  const [result, setResult] = useState("idle");

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setResult("pending");
          void login("fast.user@example.com", "password").then((signedInUser) => {
            setResult(signedInUser.email || "signed in");
          });
        }}
      >
        Email sign in
      </button>
      <output data-testid="login-result">{result}</output>
    </>
  );
}

describe("logout navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseAuthMocks.getSession.mockResolvedValue({ data: { session: null } });
    supabaseAuthMocks.getUser.mockResolvedValue({ data: { user: null } });
    supabaseAuthMocks.signInWithPassword.mockResolvedValue({
      data: { session: null, user: null },
      error: null,
    });
    supabaseAuthMocks.signOut.mockResolvedValue({ error: null });
    window.sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    window.sessionStorage.clear();
    window.history.pushState(null, "", "/");
  });

  it("resolves email sign-in before profile sync finishes", async () => {
    const user = userEvent.setup();
    const slowProfileSync = createDeferred<void>();
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        slowProfileSync.promise.then(
          () =>
            new Response(
              JSON.stringify({
                user: {
                  id: "profile-user-1",
                  email: "fast.user@example.com",
                  firstName: "Fast",
                  lastName: "User",
                  role: "user",
                  status: "active",
                  isVerified: true,
                },
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              },
            ),
        ),
      ),
    );
    supabaseAuthMocks.signInWithPassword.mockResolvedValue({
      data: {
        session: { access_token: "session-token" },
        user: {
          id: "supabase-user-1",
          email: "fast.user@example.com",
          app_metadata: { role: "user" },
          user_metadata: { firstName: "Fast", lastName: "User" },
          email_confirmed_at: "2026-05-25T00:00:00.000Z",
          created_at: "2026-05-25T00:00:00.000Z",
        },
      },
      error: null,
    });

    render(
      <AuthProvider>
        <EmailLoginProbe />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Email sign in" }));

    await vi.waitFor(() => expect(supabaseAuthMocks.signInWithPassword).toHaveBeenCalled());
    const resolvedQuickly = await waitFor(
      () => expect(screen.getByTestId("login-result").textContent).toBe("fast.user@example.com"),
      { timeout: 50 },
    ).then(
      () => true,
      () => false,
    );

    slowProfileSync.resolve();
    await Promise.resolve();

    expect(resolvedQuickly).toBe(true);
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

  it("moves direct sign-out actions home before remote sign-out finishes", async () => {
    const user = userEvent.setup();
    const slowRemoteSignOut = createDeferred<{ error: null }>();
    supabaseAuthMocks.signOut.mockImplementation(() => slowRemoteSignOut.promise);
    seedSignedInUser("/dashboard");

    render(
      <AuthProvider>
        <DirectLogoutButton />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByRole("button").textContent).toBe("Sign out"));
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    const movedHomeQuickly = await waitFor(() => expect(window.location.pathname).toBe("/"), {
      timeout: 50,
    }).then(
      () => true,
      () => false,
    );

    slowRemoteSignOut.resolve({ error: null });
    await Promise.resolve();

    expect(movedHomeQuickly).toBe(true);
    expect(supabaseAuthMocks.signOut).toHaveBeenCalled();
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
