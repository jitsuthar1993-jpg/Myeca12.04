import fs from "node:fs/promises";
import path from "node:path";

type BlogFrontmatter = {
  audience?: string;
  targetAudience?: string | null;
  categoryId?: string;
  primaryKeyword?: string;
  keyTopics?: string[];
  serviceSlug?: string | null;
};

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;

const categoryAudience: Record<string, { people: string; task: string }> = {
  "business-compliance": {
    people: "Founders, employers, finance teams, and small-business operators",
    task: "complete the relevant registration, filing, or recurring compliance work",
  },
  "business-freelancers": {
    people: "Freelancers, professionals, traders, and owner-managed businesses",
    task: "reconcile business income, expenses, tax credits, and the correct return",
  },
  "capital-gains": {
    people: "Investors and traders with securities, funds, property, crypto, or other disposal records",
    task: "calculate gains, classify transactions, and prepare the correct tax disclosure",
  },
  "foreign-assets-nri-tax": {
    people: "Residents, NRIs, RNOR taxpayers, and people with foreign income or assets",
    task: "settle residence, disclosure, remittance, and foreign-tax-credit questions",
  },
  "government-schemes": {
    people: "Applicants, families, farmers, students, workers, and small businesses checking a government programme",
    task: "confirm eligibility, prepare accepted records, and preserve the application trail",
  },
  "income-tax": {
    people: "Individual taxpayers with income, deduction, property, or disclosure questions",
    task: "prepare a supportable AY 2026-27 return position",
  },
  "itr-filing": {
    people: "Individual taxpayers preparing or correcting an AY 2026-27 income-tax return",
    task: "choose the form, reconcile source records, and finish the filing process",
  },
  "refunds-notices": {
    people: "Taxpayers reconciling tax credits, refunds, AIS entries, or an income-tax communication",
    task: "explain the records, choose the response route, and retain proof",
  },
  "tax-planning": {
    people: "Salaried taxpayers, families, founders, and investors reviewing a tax-planning decision",
    task: "compare the available treatment and preserve evidence for the chosen position",
  },
};

function normalizeClause(value: string) {
  return value
    .replace(/[.?!]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(?:check|checking)\s+/i, "check ")
    .replace(/^(?:review|reviewing)\s+/i, "review ")
    .replace(/^(?:prepare|preparing)\s+/i, "prepare ");
}

function joinNatural(values: string[]) {
  const unique = [...new Set(values.map(normalizeClause).filter(Boolean))];
  if (unique.length < 2) return unique[0] || "the relevant source records";
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
  return `${unique.slice(0, -1).join(", ")}, and ${unique.at(-1)}`;
}

function decisionFor(meta: BlogFrontmatter) {
  return normalizeClause(meta.keyTopics?.[0] || `resolve ${meta.primaryKeyword || "the filing question"}`);
}

function recordsFor(meta: BlogFrontmatter) {
  return joinNatural((meta.keyTopics ?? []).slice(1, 4));
}

function audienceFor(meta: BlogFrontmatter) {
  const primaryKeyword = normalizeClause(meta.primaryKeyword || "the article topic");
  const decision = decisionFor(meta);
  const records = recordsFor(meta);
  switch (meta.categoryId) {
    case "business-compliance":
      return `Founders and finance teams handling ${primaryKeyword} who need to ${decision} using ${records}.`;
    case "business-freelancers":
      return `Freelancers and owner-managed businesses using ${records} to ${decision} before finalising the return.`;
    case "capital-gains":
      return `Investors and traders using ${records} to ${decision} before reporting ${primaryKeyword}.`;
    case "foreign-assets-nri-tax":
      return `Residents, NRIs, and RNOR taxpayers using ${records} to ${decision} for ${primaryKeyword}.`;
    case "government-schemes":
      return `Applicants preparing for ${primaryKeyword} who need to ${decision} using ${records}.`;
    case "income-tax":
      return `Individual taxpayers using ${records} to ${decision} before reporting ${primaryKeyword}.`;
    case "itr-filing":
      return `Taxpayers preparing ${primaryKeyword} who need to ${decision} using ${records}.`;
    case "refunds-notices":
      return `Taxpayers using ${records} to ${decision} before filing or responding for ${primaryKeyword}.`;
    case "tax-planning":
      return `Taxpayers using ${records} to ${decision} before choosing the treatment for ${primaryKeyword}.`;
    default:
      return `Indian taxpayers or business owners using ${records} to ${decision} for ${primaryKeyword}.`;
  }
}

function isLegacyGeneratedAudience(meta: BlogFrontmatter, value: string) {
  const primaryKeyword = normalizeClause(meta.primaryKeyword || "the article topic");
  const category = categoryAudience[meta.categoryId || ""] ?? {
    people: "Indian taxpayers and business owners with a specific filing or compliance question",
    task: "resolve the question from current rules and source records",
  };
  return (
    (value.startsWith(`${category.people} who need to `) && value.endsWith(` for ${primaryKeyword}`))
    || value.startsWith(`${category.people} working on ${primaryKeyword} who need to `)
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
    const targetAudience =
      (existingTargetAudience && !isLegacyGeneratedAudience(meta, existingTargetAudience) ? existingTargetAudience : "")
      || (!["both", "individuals", "businesses"].includes(meta.audience || "") ? meta.audience?.trim() : "")
      || audienceFor(meta);
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
