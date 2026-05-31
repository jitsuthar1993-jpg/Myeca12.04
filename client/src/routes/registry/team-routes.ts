import { route, type ClientRouteDefinition } from "../route-types";

export const TEAM_ROUTES = [
  route("/team/dashboard", "team", "client/src/pages/team/dashboard.page.tsx"),
] as const satisfies readonly ClientRouteDefinition[];
