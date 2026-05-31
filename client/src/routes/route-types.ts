import { normalizePublicPath } from "@shared/seo-public";

export const CLIENT_ROUTE_GROUPS = [
  "public",
  "calculator",
  "service",
  "workspace",
  "admin",
  "ca",
  "team",
  "content",
  "auth",
] as const;

export type ClientRouteGroup = (typeof CLIENT_ROUTE_GROUPS)[number];

export type ClientRouteDefinition = {
  path: string;
  group: ClientRouteGroup;
  source?: string;
};

export const route = (path: string, group: ClientRouteGroup, source?: string): ClientRouteDefinition => ({
  path: normalizePublicPath(path),
  group,
  source,
});
