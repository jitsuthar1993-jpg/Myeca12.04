import fs from "node:fs";
import path from "node:path";
import {
  PRIORITY_ITR_CONTENT_MIN_INTERNAL_LINKS,
  PRIORITY_ITR_CONTENT_MIN_WORDS,
  PRIORITY_ITR_ROUTE_CONTENT,
} from "../shared/priority-itr-seo-content.js";
import {
  PRIORITY_ITR_SEARCH_ROUTES,
  expectedStaticShellMarker,
} from "../shared/search-engine-readiness.js";
import { toAbsoluteUrl } from "../shared/seo-public.js";

const distDir = path.resolve(process.cwd(), "dist", "public");
const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.MYECA_ITR_SEO_CONTENT_BASE_URL || "");
const conversionRoutes = ["/itr/form-selector", "/services/itr-for-salaried", "/calculators/income-tax", "/form16-parser"];
const fallbackRequiredTerms = {
  "/blog/when-will-itr-filing-start-ay-2026-27": ["AY 2026-27", "Form 16", "AIS"],
  "/learn/guide/salary-tax-calculator-guide-ay-2026-27": ["AY 2026-27", "Form 16", "tax regime"],
} satisfies Partial<Record<(typeof PRIORITY_ITR_SEARCH_ROUTES)[number], string[]>>;

type Check = {
  label: string;
  detail: string;
  ok: boolean;
};

function normalizeBaseUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value.replace(/\/+$/, "") : "";
}

function htmlPath(route: string) {
  if (route === "/") return path.join(distDir, "index.html");
  return path.join(distDir, ...route.split("/").filter(Boolean), "index.html");
}

function routeUrl(route: string) {
  return route === "/" ? baseUrl : `${baseUrl}${route}`;
}

async function loadRouteHtml(route: string) {
  if (baseUrl) {
    const response = await fetch(routeUrl(route), {
      headers: {
        "user-agent": "MyeCA ITR season SEO content check",
      },
    });
    return {
      detail: `${response.status} ${response.statusText} ${routeUrl(route)}`,
      html: await response.text(),
      ok: response.ok,
    };
  }

  const filePath = htmlPath(route);
  const ok = fs.existsSync(filePath);
  return {
    detail: ok ? filePath : `missing ${filePath}`,
    html: ok ? fs.readFileSync(filePath, "utf8") : "",
    ok,
  };
}

function findTitle(html: string) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() ?? "";
}

function findMetaContent(html: string, name: string) {
  const tag = html.match(new RegExp(`<meta[^>]+name=["']${name}["'][^>]*>`, "i"))?.[0] ?? "";
  return tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "";
}

function findCanonicalHref(html: string) {
  const tag = html.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] ?? "";
  return tag.match(/href=["']([^"']*)["']/i)?.[1] ?? "";
}

function visibleText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function internalLinks(html: string, route: string) {
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)]
    .map((match) => match[1].split(/[?#]/)[0])
    .filter((href) => href.startsWith("/") && href !== route);
  return [...new Set(links)];
}

function jsonLdCount(html: string) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .filter((match) => {
      try {
        JSON.parse(match[1]);
        return true;
      } catch {
        return false;
      }
    }).length;
}

function requiredTerms(route: (typeof PRIORITY_ITR_SEARCH_ROUTES)[number]) {
  return PRIORITY_ITR_ROUTE_CONTENT[route as keyof typeof PRIORITY_ITR_ROUTE_CONTENT]?.requiredTerms
    ?? fallbackRequiredTerms[route]
    ?? ["ITR"];
}

function includesTerm(text: string, term: string) {
  return text.toLowerCase().includes(term.toLowerCase());
}

function addCheck(checks: Check[], label: string, ok: boolean, detail: string) {
  checks.push({ label, ok, detail });
}

function printCheck(check: Check) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`);
}

async function validateRoute(route: (typeof PRIORITY_ITR_SEARCH_ROUTES)[number]) {
  const checks: Check[] = [];
  const loaded = await loadRouteHtml(route);
  addCheck(checks, `${route} shell reachable`, loaded.ok, loaded.detail);
  if (!loaded.ok) return checks;

  const html = loaded.html;
  const text = visibleText(html);
  const words = wordCount(text);
  const links = internalLinks(html, route);
  const title = findTitle(html);
  const description = findMetaContent(html, "description");
  const canonical = findCanonicalHref(html);
  const terms = requiredTerms(route);
  const missingTerms = terms.filter((term) => !includesTerm(text, term) && !includesTerm(title, term) && !includesTerm(description, term));
  const linksToConversion = links.some((href) => conversionRoutes.includes(href));

  addCheck(checks, `${route} title length`, title.length >= 30 && title.length <= 80, `${title.length} chars`);
  addCheck(checks, `${route} description length`, description.length >= 100 && description.length <= 170, `${description.length} chars`);
  addCheck(checks, `${route} canonical`, canonical === toAbsoluteUrl(route), canonical || "missing canonical");
  addCheck(checks, `${route} static shell marker`, html.includes(expectedStaticShellMarker(route)), expectedStaticShellMarker(route));
  addCheck(checks, `${route} visible content depth`, words >= PRIORITY_ITR_CONTENT_MIN_WORDS, `${words} words`);
  addCheck(checks, `${route} JSON-LD`, jsonLdCount(html) > 0, `${jsonLdCount(html)} valid blocks`);
  addCheck(
    checks,
    `${route} internal links`,
    links.length >= PRIORITY_ITR_CONTENT_MIN_INTERNAL_LINKS,
    `${links.length} unique internal links`,
  );
  addCheck(checks, `${route} filing conversion path`, linksToConversion, links.filter((href) => conversionRoutes.includes(href)).join(", ") || "missing");
  addCheck(checks, `${route} required ITR terms`, missingTerms.length === 0, missingTerms.length ? `missing ${missingTerms.join(", ")}` : terms.join(", "));

  return checks;
}

async function main() {
  const checks = (await Promise.all(PRIORITY_ITR_SEARCH_ROUTES.map((route) => validateRoute(route)))).flat();
  checks.forEach(printCheck);

  if (checks.some((check) => !check.ok)) {
    console.error("\nITR season SEO content check failed.");
    process.exit(1);
  }

  console.log("\nITR season SEO content check passed.");
}

main().catch((error) => {
  console.error("\nITR season SEO content check failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
