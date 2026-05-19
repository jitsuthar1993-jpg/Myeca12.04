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

  it("keeps safe explicit paths only when the role may open them", () => {
    expect(resolvePostLoginRedirect("team_member", "/team/dashboard")).toBe("/team/dashboard");
    expect(resolvePostLoginRedirect("team_member", "/admin/blog-management")).toBe("/admin/blog-management");
    expect(resolvePostLoginRedirect("team_member", "/admin/users")).toBe("/team/dashboard");
    expect(resolvePostLoginRedirect("user", "/admin/dashboard")).toBe("/dashboard");
    expect(resolvePostLoginRedirect("ca", "/admin/dashboard")).toBe("/ca/dashboard");
    expect(resolvePostLoginRedirect("admin", "/ca/dashboard")).toBe("/ca/dashboard");
  });

  it("rejects auth loops and external redirects", () => {
    expect(getSafeRedirectPath("https://evil.example/admin", "https://myeca.in")).toBeNull();
    expect(getSafeRedirectPath("/auth/login?next=%2Fdashboard", "https://myeca.in")).toBeNull();
    expect(getSafeRedirectPath("/dashboard/services?x=1#case", "https://myeca.in")).toBe("/dashboard/services?x=1#case");
  });

  it("keeps business dashboard as an authenticated module, not a role", () => {
    expect(isRoleAllowedPath("user", "/business/dashboard")).toBe(true);
    expect(isRoleAllowedPath("ca", "/business/dashboard")).toBe(true);
    expect(isRoleAllowedPath("team_member", "/business/dashboard")).toBe(true);
  });
});
