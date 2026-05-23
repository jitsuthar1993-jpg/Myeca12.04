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
});
