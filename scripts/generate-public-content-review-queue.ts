import fs from "node:fs";
import path from "node:path";
import type { PublicContentContext } from "../shared/public-content-quality.js";

const rootDir = process.cwd();
const contextPath = path.join(rootDir, "dist", "public", "content-context.json");
const outputPath = path.join(rootDir, "docs", "marketing", "public-content-editorial-review-queue.csv");
const checkOnly = process.argv.includes("--check");

function csvCell(value: string | number) {
  const text = String(value).replace(/\r?\n/g, " ").trim();
  return `"${text.replace(/"/g, '""')}"`;
}

function reviewPriority(context: PublicContentContext) {
  if (context.qualityStatus === "hold") return "P0";
  if (["home", "trust", "legal", "comparison"].includes(context.pageType)) return "P1";
  if (["service", "calculator", "hub", "help", "page"].includes(context.pageType)) return "P2";
  return "P3";
}

function requiredAction(context: PublicContentContext) {
  if (context.qualityStatus === "hold") {
    return "Resolve the documented hold reason before restoring indexability or internal promotion.";
  }
  if (context.qualityStatus === "approved" && context.editorialApproval) {
    return "Recheck when a material claim, source, service scope, or visible route body changes.";
  }
  return "Human review required: verify claims, source fit, examples, links, CTA, authorship, and visible body; then record approval in the CMS or source context.";
}

function buildCsv(contexts: PublicContentContext[]) {
  const headers = [
    "priority",
    "route",
    "page_type",
    "quality_status",
    "approval_recorded",
    "user_intent",
    "audience",
    "primary_keyword",
    "key_topics",
    "source_count",
    "official_sources",
    "source_last_checked",
    "author",
    "reviewer",
    "approved_by",
    "approved_at",
    "required_action",
  ];
  const sorted = [...contexts].sort((left, right) =>
    reviewPriority(left).localeCompare(reviewPriority(right)) || left.route.localeCompare(right.route));
  const rows = sorted.map((context) => {
    const sources = context.officialSources
      .map((source) => `${source.label}: ${source.url}`)
      .join(" | ");
    const sourceDates = [...new Set(context.officialSources.map((source) => source.checkedAt).filter(Boolean))]
      .sort()
      .join(" | ");

    return [
      reviewPriority(context),
      context.route,
      context.pageType,
      context.qualityStatus,
      context.editorialApproval ? "yes" : "no",
      context.userIntent,
      context.audience.join(" | "),
      context.primaryKeyword,
      context.keyTopics.join(" | "),
      context.officialSources.length,
      sources,
      sourceDates,
      [context.author.name, context.author.role].filter(Boolean).join(" - "),
      context.reviewer
        ? `${context.reviewer.name} - ${context.reviewer.credentialName} ${context.reviewer.credentialId}`
        : "",
      context.editorialApproval?.approvedBy ?? "",
      context.editorialApproval?.approvedAt ?? "",
      requiredAction(context),
    ].map(csvCell).join(",");
  });

  return `${headers.map(csvCell).join(",")}\n${rows.join("\n")}\n`;
}

if (!fs.existsSync(contextPath)) {
  console.error(`Missing ${path.relative(rootDir, contextPath)}. Run npm.cmd run build first.`);
  process.exit(1);
}

const contexts = JSON.parse(fs.readFileSync(contextPath, "utf8")) as PublicContentContext[];
const duplicateRoutes = contexts
  .map((context) => context.route)
  .filter((route, index, routes) => routes.indexOf(route) !== index);
if (duplicateRoutes.length) {
  console.error(`Duplicate routes in content context manifest: ${[...new Set(duplicateRoutes)].join(", ")}`);
  process.exit(1);
}

const csv = buildCsv(contexts);
if (checkOnly) {
  if (!fs.existsSync(outputPath) || fs.readFileSync(outputPath, "utf8") !== csv) {
    console.error("Public content editorial review queue is stale. Run npm.cmd run report:content-review.");
    process.exit(1);
  }
  console.log(`Editorial review queue is current for ${contexts.length} indexable routes.`);
  process.exit(0);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, csv, "utf8");
const counts = contexts.reduce<Record<string, number>>((result, context) => {
  result[context.qualityStatus] = (result[context.qualityStatus] ?? 0) + 1;
  return result;
}, {});
console.log(
  `Wrote editorial review queue for ${contexts.length} indexable routes `
  + `(${Object.entries(counts).map(([status, count]) => `${status}=${count}`).join(", ")}).`,
);
