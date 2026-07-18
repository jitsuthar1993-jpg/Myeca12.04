import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, relative, resolve, sep } from "node:path";

const DEFAULT_SOURCE_ROOT = "C:\\SAG Infotech\\Genius\\REPORTS";
const OUTPUT_PATH = resolve("client/src/data/genius-source-catalog.json");
const SUMMARY_PATH = resolve("client/src/data/genius-source-catalog-summary.json");

type SourceFormat = "encrypted" | "rtf" | "html";

interface SourceEntry {
  id: string;
  title: string;
  sourceCategory: string;
  sourceFormat: SourceFormat;
  sourceOriginalFormat: "doc" | "rtf" | "html";
  sourceRelativePath: string;
  sourceReadable: boolean;
  sourceByteLength: number;
  sourceSha256: string;
  policyKey: string;
}

function walkFiles(root: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = resolve(root, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function normalizeRelativePath(value: string): string {
  return value.split(sep).join("/");
}

function parseListLine(line: string): { title: string; fileName: string } | null {
  const match = line.match(/^\s*"([\s\S]*)","([^"]+)"\s*$/);
  return match ? { title: match[1].trim(), fileName: match[2].trim() } : null;
}

function buildTitleIndex(files: string[]): Map<string, string> {
  const index = new Map<string, string>();

  for (const file of files.filter((candidate) => basename(candidate).toLowerCase() === "list.txt")) {
    const rows = readFileSync(file, "utf8").split(/\r?\n/);
    for (const row of rows) {
      const parsed = parseListLine(row);
      if (!parsed) continue;
      const key = resolve(dirname(file), parsed.fileName).toLowerCase();
      index.set(key, parsed.title);
    }
  }

  return index;
}

function sourceFormatFor(file: string): SourceFormat | null {
  const lower = file.toLowerCase();
  if (lower.endsWith(".enc")) return "encrypted";
  if (lower.endsWith(".rtf")) return "rtf";
  if (lower.endsWith(".htm") || lower.endsWith(".html")) return "html";
  return null;
}

function sourceOriginalFormatFor(file: string): SourceEntry["sourceOriginalFormat"] {
  const lower = file.toLowerCase();
  if (lower.endsWith(".rtf") || lower.endsWith(".rtf.enc")) return "rtf";
  if (lower.endsWith(".htm") || lower.endsWith(".html")) return "html";
  return "doc";
}

function sourceCategoryFor(relativePath: string): string {
  const parts = relativePath.split("/");
  if (parts[0] === "Others_New") return parts[1] || "OTHER LEGAL FORMS";
  if (parts[0] === "ReportsN" || parts[0] === "REPORTS") return "TAX AND AUDIT REPORTS";
  if (parts[0] === "HTML") return "COMPANY AND AUDIT HTML";
  return parts[0] || "OTHER";
}

function policyKeyFor(category: string): string {
  return category;
}

function titleFor(file: string, titleIndex: Map<string, string>): string {
  const lookupPath = file.toLowerCase().endsWith(".enc") ? file.slice(0, -4) : file;
  const indexedTitle = titleIndex.get(lookupPath.toLowerCase());
  if (indexedTitle) return indexedTitle;

  return basename(lookupPath, extname(lookupPath))
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stableId(relativePath: string, title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64) || "form";
  const suffix = createHash("sha256").update(relativePath.toLowerCase()).digest("hex").slice(0, 10);
  return `genius-${slug}-${suffix}`;
}

function buildCatalog(sourceRoot: string): SourceEntry[] {
  const files = walkFiles(sourceRoot);
  const titleIndex = buildTitleIndex(files);

  return files
    .map((file): SourceEntry | null => {
      const sourceFormat = sourceFormatFor(file);
      if (!sourceFormat) return null;
      const sourceRelativePath = normalizeRelativePath(relative(sourceRoot, file));
      const title = titleFor(file, titleIndex);
      const sourceCategory = sourceCategoryFor(sourceRelativePath);
      const sourceBytes = readFileSync(file);

      return {
        id: stableId(sourceRelativePath, title),
        title,
        sourceCategory,
        sourceFormat,
        sourceOriginalFormat: sourceOriginalFormatFor(file),
        sourceRelativePath,
        sourceReadable: sourceFormat !== "encrypted",
        sourceByteLength: sourceBytes.byteLength,
        sourceSha256: createHash("sha256").update(sourceBytes).digest("hex"),
        policyKey: policyKeyFor(sourceCategory),
      };
    })
    .filter((entry): entry is SourceEntry => entry !== null)
    .sort((left, right) => left.sourceRelativePath.localeCompare(right.sourceRelativePath, "en-IN"));
}

const sourceRoot = resolve(process.argv[2] || DEFAULT_SOURCE_ROOT);
const catalog = buildCatalog(sourceRoot);
const counts = catalog.reduce(
  (summary, entry) => ({ ...summary, [entry.sourceFormat]: summary[entry.sourceFormat] + 1 }),
  { encrypted: 0, rtf: 0, html: 0 },
);
const summary = { total: catalog.length, ...counts };

writeFileSync(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
writeFileSync(SUMMARY_PATH, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

console.log(`Imported ${catalog.length} Genius source templates`, counts);
