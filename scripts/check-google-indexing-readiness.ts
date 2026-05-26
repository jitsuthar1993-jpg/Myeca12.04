import { resolveTxt } from "node:dns/promises";
import {
  isValidGoogleSiteVerificationToken,
  parseGoogleSiteVerificationTxtRecord,
} from "../shared/search-console-verification.js";

const defaultBaseUrl = "https://myeca.in";
const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.MYECA_INDEXING_BASE_URL || defaultBaseUrl);

const requiredPublicRoutes = [
  "/",
  "/blog",
  "/itr/form-selector",
  "/form16-parser",
  "/capital-gains-import",
  "/expert-consultation",
  "/services/itr-for-salaried",
  "/services/pan-card",
  "/calculators/income-tax",
  "/calculators/regime-comparator",
  "/calculators/vda-tax",
  "/startup/planning",
  "/learn/guide/salary-tax-calculator-guide-ay-2026-27",
  "/itr-season-2026",
  "/itr-season-2026/ais-form-26as-mismatch-checklist",
  "/itr-season-2026/form-16-parser-guide",
  "/itr-season-2026/capital-gains-broker-statement-checklist",
  "/itr-season-2026/itr-deadline-refund-status-tracker",
] as const;

const forbiddenSitemapRoutes = [
  "/itr/filing",
  "/dashboard",
  "/documents",
  "/reports",
  "/admin",
] as const;

type Check = {
  detail: string;
  label: string;
  ok: boolean;
  required?: boolean;
};

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function routeUrl(route: string) {
  if (route === "/") return baseUrl;
  return `${baseUrl}${route}`;
}

async function fetchText(pathName: string) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    headers: {
      "user-agent": "MyeCA indexing readiness check",
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

function expectedStaticShellMarker(route: string) {
  return route === "/" ? 'data-seo-static-shell="home"' : 'data-seo-static-shell="route"';
}

function hasGlobalRobotsBlock(robots: string) {
  return robots
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase())
    .some((line) => line === "disallow: /");
}

async function getDnsVerificationTokens(hostname: string) {
  try {
    const records = await resolveTxt(hostname);
    return records
      .map((record) => record.join(""))
      .map((record) => parseGoogleSiteVerificationTxtRecord(record))
      .filter((record): record is string => Boolean(record));
  } catch {
    return [];
  }
}

function printCheck(check: Check) {
  const status = check.ok ? "PASS" : check.required === false ? "WARN" : "FAIL";
  console.log(`${status} ${check.label}: ${check.detail}`);
}

async function main() {
  const checks: Check[] = [];
  const { hostname } = new URL(baseUrl);

  const [robots, sitemap, home, itrFiling, dashboard, publicRouteResponses] = await Promise.all([
    fetchText("/robots.txt"),
    fetchText("/sitemap.xml"),
    fetchText("/"),
    fetchText("/itr/filing"),
    fetchText("/dashboard"),
    Promise.all(requiredPublicRoutes.map(async (route) => [route, await fetchText(route)] as const)),
  ]);
  const publicRouteMap = new Map(publicRouteResponses);

  checks.push({
    label: "robots.txt reachable",
    ok: robots.response.ok,
    detail: `${robots.response.status} ${robots.response.statusText}`,
  });
  checks.push({
    label: "robots.txt does not globally block crawlers",
    ok: !hasGlobalRobotsBlock(robots.text),
    detail: hasGlobalRobotsBlock(robots.text) ? "found Disallow: /" : "no exact Disallow: / line",
  });
  checks.push({
    label: "robots.txt blocks authenticated filing URL",
    ok: robots.text.includes("Disallow: /itr/filing/"),
    detail: robots.text.includes("Disallow: /itr/filing/")
      ? "found Disallow: /itr/filing/"
      : "missing Disallow: /itr/filing/",
  });

  checks.push({
    label: "sitemap reachable",
    ok: sitemap.response.ok,
    detail: `${sitemap.response.status} ${sitemap.response.statusText}`,
  });

  const sitemapUrlCount = (sitemap.text.match(/<url>/g) ?? []).length;
  checks.push({
    label: "sitemap has substantial public coverage",
    ok: sitemapUrlCount >= 100,
    detail: `${sitemapUrlCount} URL entries`,
  });

  for (const route of requiredPublicRoutes) {
    const url = routeUrl(route);
    checks.push({
      label: `sitemap includes ${route}`,
      ok: sitemap.text.includes(`<loc>${url}</loc>`),
      detail: sitemap.text.includes(`<loc>${url}</loc>`) ? url : `missing ${url}`,
    });
  }

  const titleCounts = new Map<string, number>();
  for (const route of requiredPublicRoutes) {
    const html = publicRouteMap.get(route)?.text ?? "";
    const title = findTitle(html);
    if (title) titleCounts.set(title, (titleCounts.get(title) ?? 0) + 1);
  }

  for (const route of requiredPublicRoutes) {
    const result = publicRouteMap.get(route);
    const html = result?.text ?? "";
    const robotsMeta = findMetaContent(html, "robots");
    const canonical = findCanonicalHref(html);
    const title = findTitle(html);
    const expectedUrl = routeUrl(route);

    checks.push({
      label: `${route} returns 200`,
      ok: result?.response.ok ?? false,
      detail: result ? `${result.response.status} ${result.response.statusText}` : "not fetched",
    });
    checks.push({
      label: `${route} is indexable`,
      ok: result?.response.ok === true && !robotsMeta.content.toLowerCase().includes("noindex"),
      detail: robotsMeta.tag || "robots meta missing",
    });
    checks.push({
      label: `${route} canonical`,
      ok: canonical.href === expectedUrl,
      detail: canonical.href ? `${canonical.href}` : "canonical link missing",
    });
    checks.push({
      label: `${route} title is present and unique`,
      ok: title.length > 0 && titleCounts.get(title) === 1,
      detail: title || "title missing",
    });
    checks.push({
      label: `${route} has pre-hydration SEO body`,
      ok: html.includes(expectedStaticShellMarker(route)),
      detail: html.includes(expectedStaticShellMarker(route))
        ? expectedStaticShellMarker(route)
        : `missing ${expectedStaticShellMarker(route)}`,
    });
  }

  for (const route of forbiddenSitemapRoutes) {
    const url = routeUrl(route);
    checks.push({
      label: `sitemap excludes ${route}`,
      ok: !sitemap.text.includes(`<loc>${url}</loc>`),
      detail: sitemap.text.includes(`<loc>${url}</loc>`) ? `still includes ${url}` : `excluded ${url}`,
    });
  }

  const homeRobots = findMetaContent(home.text, "robots");
  checks.push({
    label: "homepage is indexable",
    ok: home.response.ok && homeRobots.content.toLowerCase().includes("index, follow"),
    detail: homeRobots.tag || "robots meta missing",
  });

  const filingRobots = findMetaContent(itrFiling.text, "robots");
  checks.push({
    label: "/itr/filing is noindex",
    ok: itrFiling.response.ok && filingRobots.content.toLowerCase().includes("noindex"),
    detail: filingRobots.tag || "robots meta missing",
  });

  const dashboardRobots = findMetaContent(dashboard.text, "robots");
  checks.push({
    label: "/dashboard is noindex",
    ok: dashboard.response.ok && dashboardRobots.content.toLowerCase().includes("noindex"),
    detail: dashboardRobots.tag || "robots meta missing",
  });

  const homeVerification = findMetaContent(home.text, "google-site-verification");
  const hasValidHtmlVerification = isValidGoogleSiteVerificationToken(homeVerification.content);
  const dnsVerificationTokens = await getDnsVerificationTokens(hostname);
  checks.push({
    label: "Search Console verification token present",
    ok: hasValidHtmlVerification || dnsVerificationTokens.length > 0,
    detail:
      dnsVerificationTokens.length > 0
        ? `DNS TXT token found for ${hostname}`
        : hasValidHtmlVerification
          ? "HTML verification meta has a valid value"
          : homeVerification.content.length > 0
            ? "HTML verification meta is present but not a valid Google token"
            : "missing valid DNS TXT token and HTML verification meta value",
  });

  checks.forEach(printCheck);

  const failed = checks.filter((check) => check.required !== false && !check.ok);
  if (failed.length > 0) {
    console.error(`\nGoogle indexing readiness failed: ${failed.length} required check(s) need attention.`);
    process.exit(1);
  }

  console.log("\nGoogle indexing readiness passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
