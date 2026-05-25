import { beforeEach, describe, expect, it, vi } from "vitest";

const updateUserById = vi.hoisted(() => vi.fn());

vi.mock("../../../server/lib/supabase.js", () => ({
  getSupabaseAdminClient: () => ({
    auth: {
      admin: {
        updateUserById,
      },
    },
  }),
}));

const { syncRoleClaims } = await import("../../../server/services/user-accounts.js");

describe("user account role claim sync", () => {
  beforeEach(() => {
    updateUserById.mockReset();
  });

  it("skips Supabase metadata sync for local temporary test user ids", async () => {
    await syncRoleClaims("temporary_test_ca", "ca");

    expect(updateUserById).not.toHaveBeenCalled();
  });

  it("syncs Supabase metadata for UUID user ids", async () => {
    updateUserById.mockResolvedValue({ data: { user: null }, error: null });

    await syncRoleClaims("00000000-0000-4000-8000-000000000000", "ca");

    expect(updateUserById).toHaveBeenCalledWith("00000000-0000-4000-8000-000000000000", {
      app_metadata: { role: "ca" },
    });
  });
});
