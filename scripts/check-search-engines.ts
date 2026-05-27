import {
  FORBIDDEN_SEARCH_ROUTES,
  PRIORITY_ITR_SEARCH_ROUTES,
  SEARCH_ENGINE_USER_AGENTS,
  expectedStaticShellMarker,
  hasGlobalRobotsBlock,
  robotsTxtAllowsSearchAgent,
} from "../shared/search-engine-readiness.js";
import { toAbsoluteUrl } from "../shared/seo-public.js";

const defaultBaseUrl = "https://myeca.in";
const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.MYECA_SEARCH_ENGINE_BASE_URL || defaultBaseUrl);

type Check = {
  detail: string;
  label: string;
  ok: boolean;
};

type FetchedText = {
  response: Response;
  text: string;
};

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function fetchUrl(route: string) {
  return route === "/" ? baseUrl : `${baseUrl}${route}`;
}

async function fetchText(route: string, userAgent = "MyeCA all-engine readiness check"): Promise<FetchedText> {
  const response = await fetch(fetchUrl(route), {
    headers: {
      "user-agent": userAgent,
    },
  });
  const text = await response.text();
  return { response, text };
}

function findMetaContent(html: string, name: string) {
  const tag = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, "i"))?.[0] ?? "";
  const content = tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "";
  return { content, tag };
}

function findCanonicalHref(html: string) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] ?? "";
  const href = tag.match(/href=["']([^"']*)["']/i)?.[1] ?? "";
  return { href, tag };
}

function findTitle(html: string) {
  return html.match(/<title>(.*?)<\/title>/i)?.[1]?.trim() ?? "";
}

function xRobotsTag(response: Response) {
  return response.headers.get("x-robots-tag") ?? "";
}

function isNoindex(value: string) {
  return value.toLowerCase().includes("noindex");
}

function printCheck(check: Check) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`);
}

async function main() {
  const checks: Check[] = [];
  const [robots, sitemap] = await Promise.all([
    fetchText("/robots.txt"),
    fetchText("/sitemap.xml"),
  ]);

  checks.push({
    label: "robots.txt reachable",
    ok: robots.response.ok,
    detail: `${robots.response.status} ${robots.response.statusText}`,
  });
  checks.push({
    label: "robots.txt has no global block",
    ok: !hasGlobalRobotsBlock(robots.text),
    detail: hasGlobalRobotsBlock(robots.text) ? "found Disallow: /" : "no exact Disallow: /",
  });

  for (const agent of SEARCH_ENGINE_USER_AGENTS) {
    checks.push({
      label: `robots.txt allows ${agent.name}`,
      ok: robotsTxtAllowsSearchAgent(robots.text, agent.name),
      detail: robotsTxtAllowsSearchAgent(robots.text, agent.name)
        ? `${agent.name} can crawl public routes`
        : `${agent.name} is globally disallowed`,
    });
  }

  checks.push({
    label: "sitemap reachable",
    ok: sitemap.response.ok,
    detail: `${sitemap.response.status} ${sitemap.response.statusText}`,
  });
  const sitemapUrlCount = (sitemap.text.match(/<url>/g) ?? []).length;
  checks.push({
    label: "sitemap has substantial coverage",
    ok: sitemapUrlCount >= 100,
    detail: `${sitemapUrlCount} URL entries`,
  });

  for (const route of PRIORITY_ITR_SEARCH_ROUTES) {
    const loc = toAbsoluteUrl(route);
    checks.push({
      label: `sitemap includes ${route}`,
      ok: sitemap.text.includes(`<loc>${loc}</loc>`),
      detail: sitemap.text.includes(`<loc>${loc}</loc>`) ? loc : `missing ${loc}`,
    });
  }

  for (const route of FORBIDDEN_SEARCH_ROUTES) {
    const loc = toAbsoluteUrl(route);
    checks.push({
      label: `sitemap excludes ${route}`,
      ok: !sitemap.text.includes(`<loc>${loc}</loc>`),
      detail: sitemap.text.includes(`<loc>${loc}</loc>`) ? `still includes ${loc}` : `excluded ${loc}`,
    });
  }

  const publicResponses = await Promise.all(
    SEARCH_ENGINE_USER_AGENTS.flatMap((agent) =>
      PRIORITY_ITR_SEARCH_ROUTES.map(async (route) => ({
        agent,
        route,
        result: await fetchText(route, agent.value),
      })),
    ),
  );

  const googleTitles = new Map<string, number>();
  publicResponses
    .filter(({ agent }) => agent.name === "Googlebot")
    .forEach(({ result }) => {
      const title = findTitle(result.text);
      if (title) googleTitles.set(title, (googleTitles.get(title) ?? 0) + 1);
    });

  for (const { agent, route, result } of publicResponses) {
    const robotsMeta = findMetaContent(result.text, "robots");
    const canonical = findCanonicalHref(result.text);
    const title = findTitle(result.text);
    const xRobots = xRobotsTag(result.response);
    const expectedCanonical = toAbsoluteUrl(route);
    const titleIsUnique = agent.name !== "Googlebot" || (title.length > 0 && googleTitles.get(title) === 1);

    checks.push({
      label: `${agent.name} ${route} returns 200`,
      ok: result.response.ok,
      detail: `${result.response.status} ${result.response.statusText}`,
    });
    checks.push({
      label: `${agent.name} ${route} is indexable`,
      ok: !isNoindex(robotsMeta.content) && !isNoindex(xRobots),
      detail: robotsMeta.tag || xRobots || "robots metadata missing",
    });
    checks.push({
      label: `${agent.name} ${route} canonical`,
      ok: canonical.href === expectedCanonical,
      detail: canonical.href || "canonical missing",
    });
    checks.push({
      label: `${agent.name} ${route} title present${agent.name === "Googlebot" ? " and unique" : ""}`,
      ok: titleIsUnique,
      detail: title || "title missing",
    });
    checks.push({
      label: `${agent.name} ${route} static shell`,
      ok: result.text.includes(expectedStaticShellMarker(route)),
      detail: result.text.includes(expectedStaticShellMarker(route))
        ? expectedStaticShellMarker(route)
        : `missing ${expectedStaticShellMarker(route)}`,
    });
  }

  const privateResponses = await Promise.all(
    FORBIDDEN_SEARCH_ROUTES.map(async (route) => ({
      route,
      result: await fetchText(route, SEARCH_ENGINE_USER_AGENTS[1].value),
    })),
  );

  for (const { route, result } of privateResponses) {
    const robotsMeta = findMetaContent(result.text, "robots");
    const xRobots = xRobotsTag(result.response);
    checks.push({
      label: `Bingbot ${route} stays noindex`,
      ok: isNoindex(robotsMeta.content) || isNoindex(xRobots),
      detail: robotsMeta.tag || xRobots || "no noindex signal found",
    });
  }

  checks.forEach(printCheck);

  if (checks.some((check) => !check.ok)) {
    console.error("\nAll-engine search readiness failed.");
    process.exit(1);
  }

  console.log("\nAll-engine search readiness passed.");
}

main().catch((error) => {
  console.error("\nAll-engine search readiness failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
