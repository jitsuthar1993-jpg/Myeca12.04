import { isPrivateRoute, normalizePublicPath } from "@shared/seo-public";
import { ADMIN_ROUTES } from "./registry/admin-routes";
import { AUTH_ROUTES } from "./registry/auth-routes";
import { CA_ROUTES } from "./registry/ca-routes";
import { CALCULATOR_ROUTES } from "./registry/calculator-routes";
import { CONTENT_ROUTES } from "./registry/content-routes";
import { PUBLIC_ROUTES } from "./registry/public-routes";
import { SERVICE_ROUTES } from "./registry/service-routes";
import { TEAM_ROUTES } from "./registry/team-routes";
import { WORKSPACE_ROUTES } from "./registry/workspace-routes";
import {
  CLIENT_ROUTE_GROUPS,
  type ClientRouteDefinition,
  type ClientRouteGroup,
} from "./route-types";

export { CLIENT_ROUTE_GROUPS };
export type { ClientRouteDefinition, ClientRouteGroup };

export const CLIENT_ROUTE_REGISTRY = [
  ...PUBLIC_ROUTES,
  ...CALCULATOR_ROUTES,
  ...CONTENT_ROUTES,
  ...SERVICE_ROUTES,
  ...AUTH_ROUTES,
  ...WORKSPACE_ROUTES,
  ...TEAM_ROUTES,
  ...ADMIN_ROUTES,
  ...CA_ROUTES,
] as const satisfies readonly ClientRouteDefinition[];

function uniqueNormalizedPaths(routes: readonly ClientRouteDefinition[]) {
  return [...new Set(routes.map((entry) => normalizePublicPath(entry.path)))];
}

export function getClientRoutePaths() {
  return uniqueNormalizedPaths(CLIENT_ROUTE_REGISTRY);
}

export function getClientRoutesByGroup(group: ClientRouteGroup) {
  return CLIENT_ROUTE_REGISTRY.filter((entry) => entry.group === group);
}

export const CALCULATOR_ROUTE_PATHS = getClientRoutesByGroup("calculator")
  .map((entry) => entry.path)
  .filter((path) => !path.includes(":"));

export const PUBLIC_EXACT_ROUTE_PATHS = CLIENT_ROUTE_REGISTRY
  .map((entry) => entry.path)
  .filter((path) => !path.includes(":") && !isPrivateRoute(path));

export function getTypographyRouteSourcePaths() {
  return CLIENT_ROUTE_REGISTRY
    .filter((entry): entry is ClientRouteDefinition & { source: string } => Boolean(entry.source))
    .map((entry) => ({
      path: entry.path,
      source: entry.source,
    }));
}
