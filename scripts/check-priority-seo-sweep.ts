import fs from "node:fs";
import path from "node:path";
import { SEO_CONFIG } from "../client/src/config/seo.config.js";
import {
  PRIORITY_ITR_CONTENT_MIN_WORDS,
  PRIORITY_ITR_ROUTE_CONTENT,
} from "../shared/priority-itr-seo-content.js";
import {
  PRIORITY_ITR_SEARCH_ROUTES,
  expectedStaticShellMarker,
} from "../shared/search-engine-readiness.js";
import { toAbsoluteUrl } from "../shared/seo-public.js";
import {
  bodyAnchors,
  findCanonical,
  findMeta,
  findTitle,
  parseJsonLd,
  relativeSchemaUrlIssues,
  visibleText,
  type JsonThing,
} from "./seo-html-audit-helpers.js";

type Check = {
  detail: string;
  label: string;
  ok: boolean;
};

type TypedSchemaNode = JsonThing & { "@type": string };

const distDir = path.resolve(process.cwd(), "dist", "public");
const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.MYECA_PRIORITY_SEO_SWEEP_BASE_URL || "");
const priorityRoutes = [...new Set([...PRIORITY_ITR_SEARCH_ROUTES, ...Object.keys(PRIORITY_ITR_ROUTE_CONTENT)])].sort(
  (left, right) => {
    if (left === "/") return -1;
    if (right === "/") return 1;
    return left.localeCompare(right);
  },
);
const collectionHubRoutes = new Set(["/blog", "/itr-season-2026"]);
const fallbackRequiredTerms: Record<string, string[]> = {
  "/blog/when-will-itr-filing-start-ay-2026-27": ["AY 2026-27", "Form 16", "AIS"],
  "/learn/guide/salary-tax-calculator-guide-ay-2026-27": ["AY 2026-27", "Form 16", "tax regime"],
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
        "user-agent": "MyeCA priority SEO sweep",
      },
    });
    return {
      detail: `${response.status} ${response.statusText} ${routeUrl(route)}`,
      html: await response.text(),
      ok: response.status === 200,
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

function addCheck(checks: Check[], label: string, ok: boolean, detail: string) {
  checks.push({ label, ok, detail });
}

function printCheck(check: Check) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`);
}

function collectTypedSchemaNodes(blocks: JsonThing[]) {
  const nodes: TypedSchemaNode[] = [];
  blocks.forEach((block) => {
    collectTypedSchemaNode(block, nodes);
  });
  return nodes;
}

function collectTypedSchemaNode(value: unknown, nodes: TypedSchemaNode[]) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectTypedSchemaNode(item, nodes));
    return;
  }

  if (!value || typeof value !== "object") return;
  const record = value as JsonThing;
  if (typeof record["@type"] === "string" && record["@type"].trim()) {
    nodes.push(record as TypedSchemaNode);
  }
  Object.values(record).forEach((child) => collectTypedSchemaNode(child, nodes));
}

function schemaTypes(nodes: TypedSchemaNode[]) {
  return nodes.map((node) => node["@type"]);
}

function duplicateSchemaIds(nodes: TypedSchemaNode[]) {
  const counts = new Map<string, number>();
  nodes.forEach((node) => {
    if (typeof node["@id"] === "string" && node["@id"].trim()) {
      counts.set(node["@id"], (counts.get(node["@id"]) ?? 0) + 1);
    }
  });

  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([id, count]) => `${id} (${count}x)`);
}

function expectedSchemaTypes(route: string) {
  const config = SEO_CONFIG[route];
  const types = new Set(["Organization", "BreadcrumbList"]);

  if (route === "/") {
    types.add("WebSite");
    types.add("AccountingService");
    return [...types];
  }

  if (collectionHubRoutes.has(route)) {
    types.add("CollectionPage");
    types.add("ItemList");
  }

  if (config?.type === "service" || route.startsWith("/services/")) {
    types.add("Service");
  } else if (config?.type === "calculator") {
    types.add("SoftwareApplication");
  } else if (config?.type === "article" || route.startsWith("/blog/") || route.startsWith("/learn/guide/")) {
    types.add("Article");
  } else {
    types.add("WebPage");
  }

  return [...types];
}

function requiredTerms(route: string) {
  return PRIORITY_ITR_ROUTE_CONTENT[route as keyof typeof PRIORITY_ITR_ROUTE_CONTENT]?.requiredTerms
    ?? fallbackRequiredTerms[route]
    ?? [];
}

function internalLinks(html: string, route: string) {
  return [
    ...new Set(
      bodyAnchors(html)
        .map((anchor) => anchor.href.split(/[?#]/)[0])
        .filter((href) => href.startsWith("/") && href !== route),
    ),
  ];
}

function includesTerm(text: string, term: string) {
  return text.toLowerCase().includes(term.toLowerCase());
}

function hasVisibleFaq(html: string) {
  return /frequently asked questions/i.test(visibleText(html));
}

async function validateRoute(route: string) {
  const checks: Check[] = [];
  const loaded = await loadRouteHtml(route);
  addCheck(checks, `${route} raw HTML reachable`, loaded.ok, loaded.detail);
  if (!loaded.ok) return checks;

  const html = loaded.html;
  const text = visibleText(html);
  const title = findTitle(html);
  const description = findMeta(html, "description");
  const viewport = findMeta(html, "viewport");
  const canonical = findCanonical(html);
  const ogTitle = findMeta(html, "og:title");
  const ogDescription = findMeta(html, "og:description");
  const links = internalLinks(html, route);
  const terms = requiredTerms(route);
  const missingTerms = terms.filter((term) => !includesTerm(`${title} ${description} ${text}`, term));

  let jsonLd: JsonThing[] = [];
  let jsonLdError = "";
  try {
    jsonLd = parseJsonLd(html);
  } catch (error) {
    jsonLdError = error instanceof Error ? error.message : String(error);
  }
  const nodes = collectTypedSchemaNodes(jsonLd);
  const types = schemaTypes(nodes);
  const duplicateIds = duplicateSchemaIds(nodes);
  const relativeUrls = relativeSchemaUrlIssues(jsonLd);
  const expectedTypes = expectedSchemaTypes(route);
  const visibleFaq = hasVisibleFaq(html);
  const hasFaqSchema = types.includes("FAQPage");

  addCheck(checks, `${route} title`, title.length >= 30 && title.length <= 80, `${title.length} chars`);
  addCheck(checks, `${route} meta description`, description.length >= 100 && description.length <= 180, `${description.length} chars`);
  addCheck(checks, `${route} viewport`, Boolean(viewport), viewport || "missing viewport");
  addCheck(checks, `${route} canonical`, canonical === toAbsoluteUrl(route), canonical || "missing canonical");
  addCheck(checks, `${route} Open Graph title`, Boolean(ogTitle), ogTitle || "missing og:title");
  addCheck(checks, `${route} Open Graph description`, Boolean(ogDescription), ogDescription || "missing og:description");
  addCheck(checks, `${route} JSON-LD parses`, jsonLd.length > 0 && !jsonLdError, jsonLdError || `${jsonLd.length} block(s), ${nodes.length} typed node(s)`);
  addCheck(
    checks,
    `${route} expected schema types`,
    expectedTypes.every((type) => types.includes(type)),
    expectedTypes.filter((type) => !types.includes(type)).join(", ") || expectedTypes.join(", "),
  );
  addCheck(
    checks,
    `${route} FAQ schema backed by visible FAQ`,
    !hasFaqSchema || visibleFaq,
    hasFaqSchema ? (visibleFaq ? "FAQPage and visible FAQ content" : "FAQPage without visible FAQ heading") : "no FAQPage schema",
  );
  addCheck(checks, `${route} schema @id uniqueness`, duplicateIds.length === 0, duplicateIds.length ? duplicateIds.join("; ") : "all @id values unique");
  addCheck(checks, `${route} schema URL fields absolute`, relativeUrls.length === 0, relativeUrls.length ? relativeUrls.slice(0, 5).join("; ") : "no relative URL fields");
  addCheck(checks, `${route} static shell marker`, html.includes(expectedStaticShellMarker(route)), expectedStaticShellMarker(route));
  addCheck(checks, `${route} visible content depth`, text.split(/\s+/).filter(Boolean).length >= PRIORITY_ITR_CONTENT_MIN_WORDS, `${text.split(/\s+/).filter(Boolean).length} words`);
  addCheck(checks, `${route} internal links`, links.length >= 3, `${links.length} unique internal links`);
  addCheck(checks, `${route} required topical terms`, missingTerms.length === 0, missingTerms.length ? `missing ${missingTerms.join(", ")}` : terms.join(", ") || "no route-specific terms");

  return checks;
}

async function main() {
  const checks = (await Promise.all(priorityRoutes.map((route) => validateRoute(route)))).flat();
  checks.forEach(printCheck);

  if (checks.some((check) => !check.ok)) {
    console.error(`\nPriority SEO sweep failed for ${priorityRoutes.length} route(s).`);
    process.exit(1);
  }

  console.log(`\nPriority SEO sweep passed for ${priorityRoutes.length} route(s).`);
}

main().catch((error) => {
  console.error("\nPriority SEO sweep failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
