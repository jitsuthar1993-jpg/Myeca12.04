export const PRIORITY_ITR_SEARCH_ROUTES = [
  "/",
  "/blog",
  "/blog/when-will-itr-filing-start-ay-2026-27",
  "/services/itr-for-salaried",
  "/calculators/income-tax",
  "/itr/form-selector",
  "/form16-parser",
  "/itr-season-2026",
  "/learn/guide/salary-tax-calculator-guide-ay-2026-27",
] as const;

export const FORBIDDEN_SEARCH_ROUTES = [
  "/itr/filing",
  "/dashboard",
  "/documents",
  "/reports",
  "/admin",
] as const;

export const SEARCH_ENGINE_USER_AGENTS = [
  {
    name: "Googlebot",
    value: "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  {
    name: "Bingbot",
    value: "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
  },
] as const;

type RobotsGroup = {
  agents: string[];
  rules: string[];
};

function parseRobotsGroups(robots: string) {
  const groups: RobotsGroup[] = [];
  let current: RobotsGroup | null = null;

  for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.split("#")[0].trim();
    if (!line) continue;
    const [rawDirective, ...rawValueParts] = line.split(":");
    const directive = rawDirective?.trim().toLowerCase();
    const value = rawValueParts.join(":").trim();
    if (!directive) continue;

    if (directive === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      continue;
    }

    if (current && (directive === "allow" || directive === "disallow")) {
      current.rules.push(`${directive}: ${value}`);
    }
  }

  return groups;
}

export function hasGlobalRobotsBlock(robots: string) {
  return robots
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .some((line) => line === "disallow: /");
}

export function robotsTxtAllowsSearchAgent(robots: string, agentName: string) {
  if (hasGlobalRobotsBlock(robots)) return false;

  const normalizedAgent = agentName.toLowerCase();
  const groups = parseRobotsGroups(robots);
  const exactGroups = groups.filter((group) => group.agents.includes(normalizedAgent));
  const candidateGroups = exactGroups.length
    ? exactGroups
    : groups.filter((group) => group.agents.includes("*"));

  if (!candidateGroups.length) return true;

  return candidateGroups.every((group) =>
    group.rules.every((rule) => rule.toLowerCase() !== "disallow: /"),
  );
}

export function expectedStaticShellMarker(route: string) {
  return route === "/" ? 'data-seo-static-shell="home"' : 'data-seo-static-shell="route"';
}
