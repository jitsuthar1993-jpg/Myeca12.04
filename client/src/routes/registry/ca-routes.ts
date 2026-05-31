import { route, type ClientRouteDefinition } from "../route-types";

export const CA_ROUTES = [
  route("/ca/dashboard", "ca", "client/src/pages/ca/dashboard.page.tsx"),
  route("/ca", "ca", "client/src/pages/ca/dashboard.page.tsx"),
] as const satisfies readonly ClientRouteDefinition[];
