import { route, type ClientRouteDefinition } from "../route-types";

export const PUBLIC_ROUTES = [
  route("/", "public", "client/src/pages/home.page.tsx"),
  route("/mobile-app", "public", "client/src/pages/mobile-app-screens.page.tsx"),
  route("/mobile-app-screens", "public", "client/src/pages/mobile-app-screens.page.tsx"),
  route("/tax-optimizer", "public", "client/src/pages/tax-optimizer.page.tsx"),
  route("/itr/status-tracker", "public", "client/src/features/itr/pages/status-tracker.page.tsx"),
  route("/tds-refund-tracker", "public", "client/src/pages/tds-refund-tracker.page.tsx"),
  route("/tax-loss-harvesting", "public", "client/src/pages/tax-loss-harvesting.page.tsx"),
  route("/tax-assistant", "public", "client/src/pages/tax-assistant.page.tsx"),
  route("/form16-parser", "public", "client/src/pages/form16-parser.page.tsx"),
  route("/bank-analyzer", "public", "client/src/pages/bank-analyzer.page.tsx"),
  route("/ais-viewer", "public", "client/src/pages/ais-viewer.page.tsx"),
  route("/capital-gains-import", "public", "client/src/pages/capital-gains-import.page.tsx"),
  route("/elss-comparator", "public", "client/src/pages/elss-comparator.page.tsx"),
  route("/pricing", "public", "client/src/pages/pricing.page.tsx"),
  route("/contact", "public", "client/src/pages/contact.page.tsx"),
  route("/about", "public", "client/src/pages/about.page.tsx"),
  route("/trust", "public", "client/src/pages/trust.page.tsx"),
  route("/403", "public", "client/src/pages/forbidden.page.tsx"),
  route("/500", "public", "client/src/pages/server-error.page.tsx"),
] as const satisfies readonly ClientRouteDefinition[];
