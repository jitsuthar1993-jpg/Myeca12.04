import { route, type ClientRouteDefinition } from "../route-types";

export const AUTH_ROUTES = [
  route("/auth/callback", "auth", "client/src/pages/auth/callback.page.tsx"),
  route("/auth/login", "auth", "client/src/pages/auth/login.page.tsx"),
  route("/login", "auth", "client/src/pages/auth/login.page.tsx"),
  route("/auth/admin-login", "auth", "client/src/pages/auth/admin-login.page.tsx"),
  route("/auth/register", "auth", "client/src/pages/auth/register.page.tsx"),
  route("/register", "auth", "client/src/pages/auth/register.page.tsx"),
  route("/forgot-password", "auth", "client/src/pages/auth/forgot-password.page.tsx"),
  route("/logout", "auth", "client/src/pages/logout.page.tsx"),
] as const satisfies readonly ClientRouteDefinition[];
