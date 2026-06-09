import fs from "node:fs";
import path from "node:path";
import { PRIORITY_ITR_SEARCH_ROUTES } from "../shared/search-engine-readiness.js";

type JsonThing = Record<string, any>;
type Check = {
  detail: string;
  label: string;
  ok: boolean;
};

const distDir = path.resolve(process.cwd(), "dist", "public");
const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.MYECA_STRUCTURED_DATA_BASE_URL || "");
const requiredTypesByRoute = {
  "/": ["Organization", "WebSite", "AccountingService", "BreadcrumbList"],
  "/blog": ["Organization", "BreadcrumbList", "WebPage"],
  "/blog/when-will-itr-filing-start-ay-2026-27": ["Organization", "BreadcrumbList", "Article", "HowTo"],
  "/services/itr-for-salaried": ["Organization", "BreadcrumbList", "Service"],
  "/calculators/income-tax": ["Organization", "BreadcrumbList", "SoftwareApplication"],
  "/itr/form-selector": ["Organization", "BreadcrumbList", "WebPage"],
  "/form16-parser": ["Organization", "BreadcrumbList", "SoftwareApplication"],
  "/itr-season-2026": ["Organization", "BreadcrumbList", "WebPage"],
  "/learn/guide/salary-tax-calculator-guide-ay-2026-27": ["Organization", "BreadcrumbList", "Article"],
} satisfies Record<(typeof PRIORITY_ITR_SEARCH_ROUTES)[number], string[]>;

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
        "user-agent": "MyeCA priority structured-data check",
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

function parseJsonLd(html: string) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((match) => JSON.parse(match[1]) as JsonThing);
}

function schemaNodes(blocks: JsonThing[]) {
  return blocks.flatMap((block) => {
    const graph = Array.isArray(block["@graph"]) ? block["@graph"] : [];
    return [block, ...graph].filter((node) => node?.["@type"]);
  });
}

function schemaTypes(nodes: JsonThing[]) {
  return nodes.map((node) => node["@type"]).filter(Boolean);
}

function duplicateSchemaIds(nodes: JsonThing[]) {
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

function walkStrings(value: unknown, visitor: (value: string, key: string) => void, key = "") {
  if (typeof value === "string") {
    visitor(value, key);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkStrings(item, visitor, `${key}[${index}]`));
    return;
  }
  if (value && typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => walkStrings(childValue, visitor, childKey));
  }
}

function relativeSchemaUrls(blocks: JsonThing[]) {
  const relativeValues: string[] = [];
  blocks.forEach((block) => {
    walkStrings(block, (value, key) => {
      if (!/url|@id|item|target|image|logo/i.test(key)) return;
      if (value.startsWith("/")) relativeValues.push(`${key}: ${value}`);
    });
  });
  return relativeValues;
}

function printCheck(check: Check) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`);
}

async function validateRoute(route: (typeof PRIORITY_ITR_SEARCH_ROUTES)[number]) {
  const checks: Check[] = [];
  const loaded = await loadRouteHtml(route);
  checks.push({
    label: `${route} shell reachable`,
    ok: loaded.ok,
    detail: loaded.detail,
  });
  if (!loaded.ok) return checks;

  const blocks = parseJsonLd(loaded.html);
  const nodes = schemaNodes(blocks);
  const types = schemaTypes(nodes);
  const duplicateIds = duplicateSchemaIds(nodes);
  const relativeUrls = relativeSchemaUrls(blocks);

  checks.push({
    label: `${route} JSON-LD parses`,
    ok: blocks.length > 0,
    detail: `${blocks.length} block(s), ${nodes.length} typed node(s)`,
  });
  checks.push({
    label: `${route} expected schema types`,
    ok: requiredTypesByRoute[route].every((type) => types.includes(type)),
    detail: requiredTypesByRoute[route].filter((type) => !types.includes(type)).join(", ") || requiredTypesByRoute[route].join(", "),
  });
  checks.push({
    label: `${route} schema @id uniqueness`,
    ok: duplicateIds.length === 0,
    detail: duplicateIds.length ? duplicateIds.join("; ") : "all @id values unique",
  });
  checks.push({
    label: `${route} schema URL fields absolute`,
    ok: relativeUrls.length === 0,
    detail: relativeUrls.length ? relativeUrls.slice(0, 5).join("; ") : "no relative URL fields",
  });

  const articleNodes = nodes.filter((node) => node["@type"] === "Article");
  articleNodes.forEach((article, index) => {
    checks.push({
      label: `${route} Article ${index + 1} language`,
      ok: article.inLanguage === "en-IN",
      detail: article.inLanguage || "missing",
    });
  });

  return checks;
}

async function main() {
  const checks = (await Promise.all(PRIORITY_ITR_SEARCH_ROUTES.map((route) => validateRoute(route)))).flat();
  checks.forEach(printCheck);

  if (checks.some((check) => !check.ok)) {
    console.error("\nPriority structured-data check failed.");
    process.exit(1);
  }

  console.log("\nPriority structured-data check passed.");
}

main().catch((error) => {
  console.error("\nPriority structured-data check failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
