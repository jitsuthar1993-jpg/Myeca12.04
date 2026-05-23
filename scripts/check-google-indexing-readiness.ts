import { resolveTxt } from "node:dns/promises";

const defaultBaseUrl = "https://myeca.in";
const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.MYECA_INDEXING_BASE_URL || defaultBaseUrl);

const requiredSitemapRoutes = [
  "/",
  "/blog",
  "/itr/form-selector",
  "/services/itr-for-salaried",
  "/services/pan-card",
  "/calculators/income-tax",
  "/calculators/vda-tax",
  "/startup/planning",
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
      .filter((record) => record.startsWith("google-site-verification="));
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

  const [robots, sitemap, home, itrFiling, dashboard] = await Promise.all([
    fetchText("/robots.txt"),
    fetchText("/sitemap.xml"),
    fetchText("/"),
    fetchText("/itr/filing"),
    fetchText("/dashboard"),
  ]);

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

  for (const route of requiredSitemapRoutes) {
    const url = routeUrl(route);
    checks.push({
      label: `sitemap includes ${route}`,
      ok: sitemap.text.includes(`<loc>${url}</loc>`),
      detail: sitemap.text.includes(`<loc>${url}</loc>`) ? url : `missing ${url}`,
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
  const dnsVerificationTokens = await getDnsVerificationTokens(hostname);
  checks.push({
    label: "Search Console verification token present",
    ok: homeVerification.content.length > 0 || dnsVerificationTokens.length > 0,
    detail:
      dnsVerificationTokens.length > 0
        ? `DNS TXT token found for ${hostname}`
        : homeVerification.content.length > 0
          ? "HTML verification meta has a value"
          : "missing DNS TXT token and HTML verification meta value",
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
