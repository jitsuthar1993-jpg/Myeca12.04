import fs from "node:fs/promises";
import path from "node:path";
import {
  buildCategoryTargetAudience,
  hasMalformedTargetAudience,
  repairTargetAudience,
} from "./lib/blog-audience-metadata";

type BlogFrontmatter = {
  slug?: string;
  audience?: string;
  targetAudience?: string | null;
  categoryId?: string;
  primaryKeyword?: string;
  serviceSlug?: string | null;
};

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;

function normalizeClause(value: string) {
  return value
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(?:check|checking)\s+/i, "check ")
    .replace(/^(?:review|reviewing)\s+/i, "review ")
    .replace(/^(?:prepare|preparing)\s+/i, "prepare ");
}

function isLegacyGeneratedAudience(meta: BlogFrontmatter, value: string) {
  const primaryKeyword = normalizeClause(meta.primaryKeyword || "the article topic");
  return (
    hasMalformedTargetAudience(value)
    || (value.includes(" who need to ") && value.endsWith(` for ${primaryKeyword}`))
    || value.includes(` working on ${primaryKeyword} who need to `)
    || /\bworking on\b[^.]{3,160}\bwho need to\b/i.test(value)
    || /^Applicants, families, farmers, students, workers, and small businesses\b/i.test(value)
    || /\bagainst the programme's current eligibility, document, and follow-up requirements\b/i.test(value)
    || /\bwho need to confirm obligations, records, and the next filing action\b/i.test(value)
    || /\bdeciding how .+ affects receipts, expenses, tax credits, and return selection\b/i.test(value)
    || /\bdeciding how .+ affects Indian disclosure and foreign-tax records\b/i.test(value)
    || /\bdeciding how to report .+ in AY 2026-27 and which records support the return\b/i.test(value)
    || /\bchoosing the correct AY 2026-27 return route for .+ and reconciling records before submission\b/i.test(value)
    || /\bresolving .+ from the filed return, portal communication, tax-credit records, and response deadline\b/i.test(value)
    || /\bcomparing how .+ changes the computation and the evidence needed for the selected position\b/i.test(value)
  );
}

function broadAudienceFor(meta: BlogFrontmatter) {
  if (meta.serviceSlug) return "businesses";
  if (["business-compliance", "business-freelancers"].includes(meta.categoryId || "")) return "businesses";
  if (["mye-ca-guides", "tax-planning"].includes(meta.categoryId || "")) return "both";
  return "individuals";
}

async function run() {
  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  let changed = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
    const filePath = path.join(blogDir, entry.name);
    const source = await fs.readFile(filePath, "utf8");
    const match = source.match(frontmatterPattern);
    if (!match) throw new Error(`Invalid MDX frontmatter: ${entry.name}`);

    const meta = JSON.parse(match[1]) as BlogFrontmatter;
    const broadAudience = broadAudienceFor(meta);
    const existingTargetAudience = meta.targetAudience?.trim() || "";
    const repairedTargetAudience = repairTargetAudience(meta, existingTargetAudience);
    const targetAudience =
      (repairedTargetAudience && !isLegacyGeneratedAudience(meta, repairedTargetAudience) ? repairedTargetAudience : "")
      || (!["both", "individuals", "businesses"].includes(meta.audience || "")
        ? repairTargetAudience(meta, meta.audience?.trim() || "")
        : "")
      || buildCategoryTargetAudience(meta);
    let nextFrontmatter = match[1];
    if (/"targetAudience"\s*:/.test(nextFrontmatter)) {
      nextFrontmatter = nextFrontmatter.replace(
        /"targetAudience"\s*:\s*(?:"[^"]*"|null)/,
        `"targetAudience": ${JSON.stringify(targetAudience)}`,
      );
    } else {
      nextFrontmatter = nextFrontmatter.replace(
        /("audience"\s*:\s*"[^"]+")/,
        `$1,\n  "targetAudience": ${JSON.stringify(targetAudience)}`,
      );
    }
    nextFrontmatter = nextFrontmatter.replace(
      /"audience"\s*:\s*"[^"]+"/,
      `"audience": ${JSON.stringify(broadAudience)}`,
    );
    if (nextFrontmatter === match[1]) continue;

    await fs.writeFile(filePath, `---\n${nextFrontmatter}\n---\n\n${match[2].trim()}\n`, "utf8");
    changed += 1;
  }

  console.log(`Rewrote ${changed} blog audience records with broad filter segments and specific editorial audiences.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
