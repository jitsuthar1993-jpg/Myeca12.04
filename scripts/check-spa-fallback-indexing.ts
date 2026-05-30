import { writeFileSync } from "node:fs";
import { allServices } from "../client/src/data/all-services.js";
import { SEO_CONFIG } from "../client/src/config/seo.config.js";
import { getGeneratedPublicRoutes } from "../client/src/data/missing-pages.js";
import { loadStaticBlogPosts } from "../server/data/static-blog-content.js";
import {
  buildHostileSpaFallbackAuditRoutes,
  parseSpaFallbackProbeSlugs,
} from "../shared/spa-fallback-audit-routes.js";
import {
  buildSpaFallbackAuditReport,
  formatSpaFallbackAuditScope,
  formatSpaFallbackAuditSummary,
  summarizeSpaFallbackAuditChecks,
  type SpaFallbackAuditCheck,
} from "../shared/spa-fallback-audit-summary.js";
import { fetchTextWithRetry } from "../shared/spa-fallback-audit-fetch.js";
import { classifySpaFallbackPath } from "../shared/spa-fallback-policy.js";
import { getIndexablePublicRoutes, toAbsoluteUrl } from "../shared/seo-public.js";

const defaultBaseUrl = "https://myeca.in";
const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.MYECA_FALLBACK_BASE_URL || defaultBaseUrl);
const activationServiceIds = allServices.map((service) => service.id);
const requestDelayMs = parsePositiveInteger(process.env.MYECA_FALLBACK_REQUEST_DELAY_MS, 150);
const requestRetryDelayMs = parsePositiveInteger(process.env.MYECA_FALLBACK_RETRY_DELAY_MS, 300);
const requestTimeoutMs = parsePositiveInteger(process.env.MYECA_FALLBACK_REQUEST_TIMEOUT_MS, 20_000);
const requestAttempts = parsePositiveInteger(process.env.MYECA_FALLBACK_FETCH_ATTEMPTS, 3);
const summaryOnly = process.env.MYECA_FALLBACK_SUMMARY_ONLY === "1";
const summaryFailureLimit = parsePositiveInteger(process.env.MYECA_FALLBACK_SUMMARY_FAILURE_LIMIT, 40);
const reportPath = process.env.MYECA_FALLBACK_REPORT_PATH;
const probeSlugs = parseSpaFallbackProbeSlugs(process.env.MYECA_FALLBACK_PROBE_SLUGS);
const blogRoutes = loadStaticBlogPosts().map((post) => `/blog/${post.slug || post.id}`);
const publicRoutes = getIndexablePublicRoutes(
  [
    ...Object.entries(SEO_CONFIG)
      .filter(([, config]) => !config.noindex)
      .map(([route]) => route),
    ...getGeneratedPublicRoutes(),
  ],
  blogRoutes,
);
const hostileFallbackRoutes = buildHostileSpaFallbackAuditRoutes(publicRoutes, { probeSlugs });

const indexableControlRoutes = [
  "/",
  "/itr-filing",
  "/services/pan-card",
  "/blog/finance-act-2025-new-regime-slabs-ay-2026-27",
] as const;

const appOnlyNoindexControls = [
  "/dashboard/services/example-id",
  "/dashboard/face-serum-gxrcld",
  "/admin/face-serum-gxrcld",
  "/ca/face-serum-gxrcld",
  "/services/activate/partnership-deed",
  "/services/company-registration/mumbai",
  "/experts/ca-amit-verma",
] as const;

type FetchedText = {
  response: Response;
  text: string;
};

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizePolicyRoute(route: string) {
  if (route === "/") return "/";
  return `/${route.replace(/^\/+/, "").replace(/\/+$/, "")}`;
}

function normalizeRequestRoute(route: string) {
  if (route === "/") return "/";
  return `/${route.replace(/^\/+/, "")}`;
}

function fetchUrl(route: string) {
  return route === "/" ? baseUrl : `${baseUrl}${route}`;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(route: string): Promise<FetchedText> {
  if (requestDelayMs > 0) await delay(requestDelayMs);

  const result = await fetchTextWithRetry(fetchUrl(route), {
    attempts: requestAttempts,
    init: {
      headers: {
        "user-agent": "MyeCA SPA fallback indexing check",
      },
    },
    retryDelayMs: requestRetryDelayMs,
    timeoutMs: requestTimeoutMs,
  });

  return { response: result.response, text: result.text };
}

function findMetaContent(html: string, name: string) {
  const tag = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, "i"))?.[0] ?? "";
  const content = tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "";
  return { content, tag };
}

function xRobotsTag(response: Response) {
  return response.headers.get("x-robots-tag") ?? "";
}

function statusDetail(response: Response) {
  const mitigated = response.headers.get("x-vercel-mitigated");
  return mitigated
    ? `${response.status} ${response.statusText}; x-vercel-mitigated=${mitigated}`
    : `${response.status} ${response.statusText}`;
}

function hasNoindexSignal(result: FetchedText) {
  return [findMetaContent(result.text, "robots").content, xRobotsTag(result.response)].some((value) =>
    value.toLowerCase().includes("noindex")
  );
}

function hasIndexFollowHeader(result: FetchedText) {
  return xRobotsTag(result.response).toLowerCase().includes("index, follow");
}

function robotsDetail(result: FetchedText) {
  const robotsMeta = findMetaContent(result.text, "robots").content || "<missing>";
  const xRobots = xRobotsTag(result.response) || "<missing>";
  return `meta=${robotsMeta}; x-robots=${xRobots}`;
}

function printCheck(check: SpaFallbackAuditCheck) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`);
}

async function main() {
  const checks: SpaFallbackAuditCheck[] = [];
  const sitemap = await fetchText("/sitemap.xml");

  checks.push({
    label: "sitemap reachable",
    ok: sitemap.response.ok,
    detail: statusDetail(sitemap.response),
  });

  for (const route of hostileFallbackRoutes) {
    const policyRoute = normalizePolicyRoute(route);
    const requestRoute = normalizeRequestRoute(route);
    const localPolicy = classifySpaFallbackPath(policyRoute, { activationServiceIds });
    checks.push({
      label: `local fallback policy rejects ${requestRoute}`,
      ok: !localPolicy.known && localPolicy.status === 404 && localPolicy.robots === "noindex, nofollow",
      detail: `${localPolicy.status} ${localPolicy.reason} ${localPolicy.robots}`,
    });

    const loc = toAbsoluteUrl(policyRoute);
    checks.push({
      label: `sitemap excludes ${requestRoute}`,
      ok: !sitemap.text.includes(`<loc>${loc}</loc>`),
      detail: sitemap.text.includes(`<loc>${loc}</loc>`) ? `still includes ${loc}` : `excluded ${loc}`,
    });
  }

  const hostileResponses: Array<{ route: string; result: FetchedText }> = [];
  for (const route of hostileFallbackRoutes) {
    const requestRoute = normalizeRequestRoute(route);
    hostileResponses.push({
      route: requestRoute,
      result: await fetchText(requestRoute),
    });
  }

  for (const { route, result } of hostileResponses) {
    checks.push({
      label: `${route} returns 404`,
      ok: result.response.status === 404,
      detail: statusDetail(result.response),
    });
    checks.push({
      label: `${route} has noindex signal`,
      ok: hasNoindexSignal(result),
      detail: robotsDetail(result),
    });
    checks.push({
      label: `${route} is not marked indexable by header`,
      ok: !hasIndexFollowHeader(result),
      detail: xRobotsTag(result.response) || "no X-Robots-Tag header",
    });
  }

  const publicResponses: Array<{ route: string; result: FetchedText }> = [];
  for (const route of indexableControlRoutes) {
    publicResponses.push({
      route,
      result: await fetchText(route),
    });
  }

  for (const { route, result } of publicResponses) {
    checks.push({
      label: `${route} public control returns 200`,
      ok: result.response.ok,
      detail: statusDetail(result.response),
    });
    checks.push({
      label: `${route} public control stays indexable`,
      ok: result.response.ok && !hasNoindexSignal(result),
      detail: robotsDetail(result),
    });
  }

  const appOnlyResponses: Array<{ route: string; result: FetchedText }> = [];
  for (const route of appOnlyNoindexControls) {
    appOnlyResponses.push({
      route,
      result: await fetchText(route),
    });
  }

  for (const { route, result } of appOnlyResponses) {
    checks.push({
      label: `${route} app-only control returns 200`,
      ok: result.response.ok,
      detail: statusDetail(result.response),
    });
    checks.push({
      label: `${route} app-only control stays noindex`,
      ok: result.response.ok && hasNoindexSignal(result),
      detail: robotsDetail(result),
    });
  }

  const failures = checks.filter((check) => !check.ok);
  const summary = summarizeSpaFallbackAuditChecks(checks);
  const scope = {
    hostileRoutes: hostileFallbackRoutes.length,
    probeSlugs,
    publicRoutes: publicRoutes.length,
  };
  const report = buildSpaFallbackAuditReport({
    baseUrl,
    checks,
    sampleLimit: summaryFailureLimit,
    scope,
  });

  if (summaryOnly) {
    console.log(formatSpaFallbackAuditSummary(baseUrl, summary));
    console.log(formatSpaFallbackAuditScope(scope));
    for (const sample of report.failureSamples) {
      console.log(`[${sample.category}]`);
      printCheck(sample.check);
    }
    if (report.omittedFailures > 0) {
      console.log(`... ${report.omittedFailures} more failing checks omitted`);
    }
  } else {
    checks.forEach(printCheck);
    console.log(`\n${formatSpaFallbackAuditSummary(baseUrl, summary)}`);
    console.log(formatSpaFallbackAuditScope(scope));
  }

  if (reportPath) {
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`SPA fallback audit report written to ${reportPath}`);
  }

  if (failures.length > 0) {
    console.error(`\nSPA fallback indexing check failed for ${baseUrl}: ${failures.length} failing checks.`);
    process.exit(1);
  }

  console.log(`\nSPA fallback indexing check passed for ${baseUrl}.`);
}

main().catch((error) => {
  console.error(`\nSPA fallback indexing check failed for ${baseUrl}.`);
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
