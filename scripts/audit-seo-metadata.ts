import fs from "node:fs";
import path from "node:path";
import {
  bodyAnchors,
  countCanonicals,
  countTitleTags,
  findCanonical,
  findMeta,
  findTitle,
  parseJsonLd,
  relativeSchemaUrlIssues,
  visibleText,
} from "./seo-html-audit-helpers.js";
import {
  PRIVATE_NOINDEX_ROUTES,
  SITE_URL,
  normalizePublicPath,
  toAbsoluteUrl,
} from "../shared/seo-public.js";

const distDir = path.resolve(process.cwd(), "dist", "public");
const privateRoutes = new Set(PRIVATE_NOINDEX_ROUTES.map(normalizePublicPath));

type RouteAudit = {
  route: string;
  title: string;
  description: string;
  issues: string[];
  internalLinks: string[];
};

function walkIndexHtml(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkIndexHtml(entryPath);
    return entry.name === "index.html" ? [entryPath] : [];
  });
}

function routeFromFile(filePath: string) {
  const relative = path.relative(distDir, filePath).replace(/\\/g, "/");
  if (relative === "index.html") return "/";
  return normalizePublicPath(relative.replace(/\/index\.html$/, ""));
}

function groupDuplicates(items: Array<{ route: string; value: string }>) {
  const groups = new Map<string, string[]>();
  items.forEach((item) => {
    if (!item.value) return;
    groups.set(item.value, [...(groups.get(item.value) ?? []), item.route]);
  });
  return [...groups.entries()].filter(([, routes]) => routes.length > 1);
}

function internalHrefToRoute(href: string) {
  if (!href || href === "#") return "";
  if (href.startsWith(SITE_URL)) return normalizePublicPath(href.slice(SITE_URL.length) || "/");
  if (href.startsWith("/")) return normalizePublicPath(href);
  return "";
}

function auditRoute(filePath: string): RouteAudit {
  const route = routeFromFile(filePath);
  const html = fs.readFileSync(filePath, "utf8");
  const title = findTitle(html);
  const description = findMeta(html, "description");
  const canonical = findCanonical(html);
  const robots = findMeta(html, "robots");
  const text = visibleText(html);
  const anchors = bodyAnchors(html);
  const internalLinks = anchors
    .map((anchor) => internalHrefToRoute(anchor.href))
    .filter(Boolean)
    .filter((href) => href !== route);
  const isPrivate = privateRoutes.has(route);
  const issues: string[] = [];

  if (countTitleTags(html) !== 1) issues.push(`expected exactly one title tag, found ${countTitleTags(html)}`);
  if (countCanonicals(html) !== 1) issues.push(`expected exactly one canonical, found ${countCanonicals(html)}`);
  if (canonical !== toAbsoluteUrl(route)) issues.push(`canonical mismatch: ${canonical || "(missing)"}`);

  if (isPrivate) {
    if (!/^noindex/i.test(robots)) issues.push(`private route robots must be noindex: ${robots}`);
  } else {
    if (!title || title.length < 12 || title.length > 90) issues.push(`title length ${title.length} is empty, misleadingly short, or severely truncated`);
    if (!description || description.length < 40 || description.length > 220) issues.push(`description length ${description.length} is empty, misleadingly short, or severely truncated`);
    if (!/^index,\s*follow/i.test(robots)) issues.push(`public route robots must be index, follow: ${robots}`);
    if (text.length < 250) issues.push(`visible text too thin: ${text.length}`);
    if (internalLinks.length < 3) issues.push(`fewer than 3 internal links: ${internalLinks.length}`);
  }

  let jsonLd: Record<string, any>[] = [];
  try {
    jsonLd = parseJsonLd(html);
  } catch (error) {
    issues.push(`invalid JSON-LD: ${error instanceof Error ? error.message : String(error)}`);
  }

  if (!isPrivate) {
    if (!jsonLd.length) issues.push("missing JSON-LD");
    relativeSchemaUrlIssues(jsonLd).forEach((issue) => issues.push(`relative schema URL ${issue}`));
  }

  ["og:title", "og:description", "og:image", "twitter:card"].forEach((tag) => {
    if (!findMeta(html, tag)) issues.push(`missing ${tag}`);
  });

  anchors.forEach((anchor) => {
    if (!anchor.href || anchor.href === "#") issues.push("body anchor has empty/# href");
    if (!anchor.text) issues.push(`body anchor ${anchor.href} has no visible text`);
  });

  return { route, title, description, issues, internalLinks };
}

function printDuplicateSummary(label: string, groups: Array<[string, string[]]>) {
  if (!groups.length) return;
  console.error(`\nDuplicate ${label}:`);
  groups.slice(0, 20).forEach(([value, routes]) => {
    console.error(`- ${value}: ${routes.join(", ")}`);
  });
}

function main() {
  const files = walkIndexHtml(distDir);
  if (!files.length) {
    throw new Error(`No generated route HTML found under ${distDir}`);
  }

  const audits = files.map(auditRoute).sort((left, right) => left.route.localeCompare(right.route));
  const publicAudits = audits.filter((audit) => !privateRoutes.has(audit.route));
  const duplicateTitles = groupDuplicates(publicAudits.map((audit) => ({ route: audit.route, value: audit.title })));
  const duplicateDescriptions = groupDuplicates(publicAudits.map((audit) => ({ route: audit.route, value: audit.description })));
  duplicateTitles.forEach(([, routes]) => routes.forEach((route) => audits.find((audit) => audit.route === route)?.issues.push("duplicate title")));
  duplicateDescriptions.forEach(([, routes]) => routes.forEach((route) => audits.find((audit) => audit.route === route)?.issues.push("duplicate description")));

  const inbound = new Map<string, number>();
  audits.forEach((audit) => inbound.set(audit.route, 0));
  audits.forEach((audit) => {
    audit.internalLinks.forEach((href) => {
      if (inbound.has(href)) inbound.set(href, (inbound.get(href) ?? 0) + 1);
    });
  });
  audits.forEach((audit) => {
    if (!privateRoutes.has(audit.route) && audit.route !== "/" && (inbound.get(audit.route) ?? 0) === 0) {
      audit.issues.push("no inbound internal links from generated routes");
    }
  });

  const sitemapPath = path.join(distDir, "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    const sitemap = fs.readFileSync(sitemapPath, "utf8");
    PRIVATE_NOINDEX_ROUTES.forEach((route) => {
      if (sitemap.includes(`<loc>${toAbsoluteUrl(route)}</loc>`)) {
        audits.find((audit) => audit.route === normalizePublicPath(route))?.issues.push("noindex route appears in sitemap");
      }
    });
  }

  const failures = audits.filter((audit) => audit.issues.length);
  if (failures.length) {
    console.error("SEO metadata audit failed:\n");
    failures.forEach((audit) => {
      console.error(`${audit.route}: ${audit.issues.join("; ")}`);
    });
    printDuplicateSummary("titles", duplicateTitles);
    printDuplicateSummary("descriptions", duplicateDescriptions);
    process.exit(1);
  }

  const sortedTitles = [...audits].sort((left, right) => left.title.length - right.title.length);
  console.log(`SEO metadata audit passed for ${audits.length} generated routes.`);
  console.log(`Shortest title: ${sortedTitles[0].route} (${sortedTitles[0].title.length})`);
  console.log(`Longest title: ${sortedTitles[sortedTitles.length - 1].route} (${sortedTitles[sortedTitles.length - 1].title.length})`);
}

main();
