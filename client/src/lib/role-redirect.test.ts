import { describe, expect, it } from "vitest";
import { getSafeRedirectPath, resolvePostLoginRedirect } from "./role-redirect";
import { getRoleHome, isRoleAllowedPath } from "@shared/app-roles";

describe("role redirect rules", () => {
  it("lands each stored role on its own workspace by default", () => {
    expect(getRoleHome("user")).toBe("/dashboard");
    expect(getRoleHome("admin")).toBe("/admin/dashboard");
    expect(getRoleHome("ca")).toBe("/ca/dashboard");
    expect(getRoleHome("team_member")).toBe("/team/dashboard");
  });

  it("keeps safe saved targets when the role may access them", () => {
    expect(resolvePostLoginRedirect("team_member", "/team/dashboard")).toBe("/team/dashboard");
    expect(resolvePostLoginRedirect("team_member", "/admin/blog-management")).toBe("/admin/blog-management");
    expect(resolvePostLoginRedirect("team_member", "/admin/blog-management?tab=drafts")).toBe("/admin/blog-management?tab=drafts");
    expect(resolvePostLoginRedirect("team_member", "/admin/users")).toBe("/team/dashboard");
    expect(resolvePostLoginRedirect("user", "/documents")).toBe("/documents");
    expect(resolvePostLoginRedirect("user", "/admin/dashboard")).toBe("/dashboard");
    expect(resolvePostLoginRedirect("ca", "/ca/dashboard?tab=cases#case-1")).toBe("/ca/dashboard?tab=cases#case-1");
    expect(resolvePostLoginRedirect("ca", "/admin/dashboard")).toBe("/ca/dashboard");
    expect(resolvePostLoginRedirect("admin", "/ca/dashboard")).toBe("/ca/dashboard");
  });

  it("rejects auth loops and external redirects", () => {
    expect(getSafeRedirectPath("https://evil.example/admin", "https://myeca.in")).toBeNull();
    expect(getSafeRedirectPath("/auth/login?next=%2Fdashboard", "https://myeca.in")).toBeNull();
    expect(getSafeRedirectPath("/dashboard/services?x=1#case", "https://myeca.in")).toBe("/dashboard/services?x=1#case");
  });

  it("constrains role-specific route families", () => {
    expect(isRoleAllowedPath("admin", "/admin/users")).toBe(true);
    expect(isRoleAllowedPath("admin", "/ca/dashboard")).toBe(true);
    expect(isRoleAllowedPath("admin", "/team/dashboard")).toBe(true);

    expect(isRoleAllowedPath("team_member", "/team/dashboard")).toBe(true);
    expect(isRoleAllowedPath("team_member", "/admin/blog-management/edit/post-1")).toBe(true);
    expect(isRoleAllowedPath("team_member", "/admin/media-management")).toBe(true);
    expect(isRoleAllowedPath("team_member", "/admin/users")).toBe(false);
    expect(isRoleAllowedPath("team_member", "/ca/dashboard")).toBe(false);

    expect(isRoleAllowedPath("ca", "/ca/dashboard")).toBe(true);
    expect(isRoleAllowedPath("ca", "/profiles")).toBe(true);
    expect(isRoleAllowedPath("ca", "/admin/blog-management")).toBe(false);
    expect(isRoleAllowedPath("ca", "/team/dashboard")).toBe(false);

    expect(isRoleAllowedPath("user", "/documents")).toBe(true);
    expect(isRoleAllowedPath("user", "/payments")).toBe(true);
    expect(isRoleAllowedPath("user", "/admin/dashboard")).toBe(false);
    expect(isRoleAllowedPath("user", "/ca/dashboard")).toBe(false);
    expect(isRoleAllowedPath("user", "team/dashboard")).toBe(false);
  });

  it("keeps business dashboard as an authenticated module, not a role", () => {
    expect(isRoleAllowedPath("user", "/business/dashboard")).toBe(true);
    expect(isRoleAllowedPath("ca", "/business/dashboard")).toBe(true);
    expect(isRoleAllowedPath("team_member", "/business/dashboard")).toBe(true);
  });
});
