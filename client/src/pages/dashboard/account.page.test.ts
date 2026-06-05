import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("workspace account settings page", () => {
  it("presents settings as a professional My Account workspace", () => {
    const source = readFileSync(resolve(__dirname, "account.page.tsx"), "utf8");

    expect(source).toContain('Layout title="My Account"');
    expect(source).toContain("My Account");
    expect(source).toContain("Profile Details");
    expect(source).toContain("Security");
    expect(source).not.toContain("Account Control");
    expect(source).not.toContain("User Preferences");
    expect(source).not.toContain("rounded-[40px]");
    expect(source).not.toContain("rounded-[48px]");
  });

  it("allows account profile edits when the last name is blank", () => {
    const source = readFileSync(resolve(__dirname, "account.page.tsx"), "utf8");

    expect(source).toContain('lastName: z.string().trim().max(100).optional().or(z.literal(""))');
    expect(source).not.toContain('lastName: z.string().min(2, "Last name must be at least 2 characters")');
  });
});
