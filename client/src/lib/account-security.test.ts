import { describe, expect, it, vi } from "vitest";
import { changeSupabasePassword } from "./account-security";

describe("account security helpers", () => {
  it("reauthenticates before updating the Supabase password", async () => {
    const supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        updateUser: vi.fn().mockResolvedValue({ error: null }),
      },
    } as any;

    await expect(changeSupabasePassword(supabase, " user@example.com ", "old-pass", "new-pass")).resolves.toBe(true);

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "old-pass",
    });
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: "new-pass" });
  });

  it("does not update the password when current password verification fails", async () => {
    const supabase = {
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: { message: "Invalid login credentials" } }),
        updateUser: vi.fn(),
      },
    } as any;

    await expect(changeSupabasePassword(supabase, "user@example.com", "bad-pass", "new-pass")).rejects.toThrow(
      "Invalid login credentials",
    );
    expect(supabase.auth.updateUser).not.toHaveBeenCalled();
  });
});
