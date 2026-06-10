import { describe, expect, it } from "vitest";
import { ROLE_NAV_GROUPS } from "./role-workspace";

describe("role workspace navigation", () => {
  it("shows MY ITR directly below Home for signed-in users", () => {
    const workspaceItems = ROLE_NAV_GROUPS.user.find((group) => group.label === "Workspace")?.items;

    expect(workspaceItems?.map((item) => item.label).slice(0, 2)).toEqual(["Home", "MY ITR"]);
    expect(workspaceItems?.[1]).toMatchObject({
      href: "/itr/filing",
      label: "MY ITR",
    });
  });

  it("does not show payments in the user workspace navigation", () => {
    const workspaceItems = ROLE_NAV_GROUPS.user.find((group) => group.label === "Workspace")?.items;

    expect(workspaceItems?.map((item) => item.label)).not.toContain("Payments");
    expect(workspaceItems?.map((item) => item.href)).not.toContain("/payments");
  });

  it("keeps Documents and Document Generator as separate workspace destinations", () => {
    const workspaceItems = ROLE_NAV_GROUPS.user.find((group) => group.label === "Workspace")?.items;

    expect(workspaceItems?.map((item) => item.label)).toEqual([
      "Home",
      "MY ITR",
      "Services",
      "Documents",
      "Document Generator",
    ]);
    expect(workspaceItems?.find((item) => item.label === "Documents")?.href).toBe("/documents");
    expect(workspaceItems?.find((item) => item.label === "Document Generator")?.href).toBe("/documents/generator");
  });
});
