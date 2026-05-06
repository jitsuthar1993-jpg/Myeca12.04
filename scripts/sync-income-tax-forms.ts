import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

type IncomeTaxAct = "Income Tax Act 1961" | "Income Tax Act 2025" | "Unknown";
type IncomeTaxFormFileType = "pdf" | "zip" | "schema" | "utility" | "link";

type IncomeTaxFormDownload = {
  id: string;
  title: string;
  description: string;
  fileType: IncomeTaxFormFileType;
  act: IncomeTaxAct;
  version?: string;
  size?: string;
  latestReleaseDate?: string;
  localPath?: string;
  officialUrl: string;
  tags: string[];
};

const PORTAL_ORIGIN = "https://www.incometax.gov.in";
const FORMS_PATH = "/iec/foportal/downloads/income-tax-returns";
const SOURCE_URL = `${PORTAL_ORIGIN}${FORMS_PATH}`;
const ASSESSMENT_YEAR = "2025-26";
const ASSESSMENT_YEAR_TARGET_ID = "54";
const ASSET_DIR = path.join(process.cwd(), "client", "public", "assets", "income-tax-forms");
const DATA_FILE = path.join(process.cwd(), "client", "src", "data", "income-tax-forms.ts");

const ENTITY_MAP: Record<string, string> = {
  amp: "&",
  quot: "\"",
  apos: "'",
  nbsp: " ",
  ndash: "-",
  mdash: "-",
};

function decodeEntities(value: string) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&([a-z]+);/gi, (_, name) => ENTITY_MAP[name.toLowerCase()] ?? " ")
    .replace(/\u00a0/g, " ");
}

function stripTags(value: string) {
  return decodeEntities(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 110);
}

function getExtension(url: string) {
  const pathname = new URL(url).pathname;
  return path.extname(decodeURIComponent(pathname)).toLowerCase();
}

function getFileType(linkText: string, officialUrl: string): IncomeTaxFormFileType {
  const lowerText = linkText.toLowerCase();
  const extension = getExtension(officialUrl);

  if (extension === ".pdf") return "pdf";
  if (lowerText.includes("utility")) return "utility";
  if (lowerText.includes("schema")) return "schema";
  if (extension === ".zip") return "zip";
  return "link";
}

function getTags(title: string, linkText: string, fileType: IncomeTaxFormFileType, act: IncomeTaxAct) {
  const tags = new Set<string>([
    "income tax",
    "income tax return",
    `ay ${ASSESSMENT_YEAR}`,
    `fy ${ASSESSMENT_YEAR}`,
    act === "Income Tax Act 2025" ? "act 2025" : act === "Income Tax Act 1961" ? "act 1961" : "return",
    fileType,
  ]);

  const combined = `${title} ${linkText}`.toLowerCase();
  const formMatches = combined.match(/\b(?:form\s*)?\d+[a-z]*\b/g) ?? [];
  formMatches.forEach((match) => tags.add(match.replace(/\s+/g, " ").trim()));

  if (combined.includes("audit")) tags.add("audit");
  if (combined.includes("schema")) tags.add("schema");
  if (combined.includes("utility")) tags.add("utility");
  if (combined.includes("validation")) tags.add("validation");
  if (combined.includes("change")) tags.add("schema change");

  return Array.from(tags);
}

function extractMetadata(afterLinkHtml: string, linkText: string) {
  const metadataWindow = afterLinkHtml.slice(0, 1300);
  const version = metadataWindow.match(/\(Version\s*([^)]+)\)/i)?.[1]?.trim();
  const sizeMatches = [...metadataWindow.matchAll(/\(([\d.]+\s*(?:KB|MB|GB))\)/gi)];
  const size = sizeMatches[0]?.[1]?.trim();

  const utilityDate =
    metadataWindow.match(/Date of Latest release of Form Utility\s*<span[^>]*>([^<]+)<\/span>/i)?.[1] ??
    metadataWindow.match(/Date of release of latest version of utility\s*<span[^>]*>([^<]+)<\/span>/i)?.[1];
  const schemaDate = metadataWindow.match(/Date of latest release of Form Schema\s*<span[^>]*>([^<]+)<\/span>/i)?.[1];
  const validationDate = metadataWindow.match(/Date of latest release of validation\s*<span[^>]*>([^<]+)<\/span>/i)?.[1];
  const firstUtilityDate =
    metadataWindow.match(/Date of first release of Form Utility\s*<span[^>]*>([^<]+)<\/span>/i)?.[1] ??
    metadataWindow.match(/Date of release of first version of utility\s*<span[^>]*>([^<]+)<\/span>/i)?.[1];
  const firstSchemaDate =
    metadataWindow.match(/Date of first release of Form Schema\s*<span[^>]*>([^<]+)<\/span>/i)?.[1] ??
    metadataWindow.match(/Date of first release of JSON Schema\s*<span[^>]*>([^<]+)<\/span>/i)?.[1];
  const firstValidationDate = metadataWindow.match(/Date of first release of validation\s*<span[^>]*>([^<]+)<\/span>/i)?.[1];

  const lowerLinkText = linkText.toLowerCase();
  const latestReleaseDate = lowerLinkText.includes("validation")
    ? validationDate ?? firstValidationDate
    : lowerLinkText.includes("schema")
      ? schemaDate ?? firstSchemaDate
      : utilityDate ?? firstUtilityDate ?? schemaDate ?? firstSchemaDate;

  return {
    version: version ? decodeEntities(version) : undefined,
    size: size ? decodeEntities(size) : undefined,
    latestReleaseDate: latestReleaseDate ? stripTags(latestReleaseDate) : undefined,
  };
}

function extractRows(html: string) {
  const titleRegex =
    /<div class="views-field views-field-title views-accordion-header[\s\S]*?<span class="field-content"><a[^>]*>([\s\S]*?)<\/a><\/span><\/div>/gi;

  const matches = [...html.matchAll(titleRegex)];
  return matches.map((match, index) => {
    const next = matches[index + 1]?.index ?? html.indexOf("Search description", match.index ?? 0);
    const start = match.index ?? 0;
    return {
      title: stripTags(match[1]),
      html: html.slice(start, next > start ? next : undefined),
    };
  });
}

function extractDescription(rowHtml: string) {
  const descriptionHtml = rowHtml.match(
    /views-field-field-income-tax-(?:forms|returns)-descrip[\s\S]*?<div class="field-content">([\s\S]*?)<\/div><\/div><div class="views-field views-field-nothing">/i,
  )?.[1];

  return stripTags(descriptionHtml ?? "");
}

async function downloadPdf(record: IncomeTaxFormDownload) {
  if (record.fileType !== "pdf") return record;

  const extension = getExtension(record.officialUrl) || ".pdf";
  const filename = `${record.id}`.endsWith(extension) ? record.id : `${record.id}${extension}`;
  const assetPath = path.join(ASSET_DIR, filename);
  const response = await fetch(record.officialUrl);

  if (!response.ok) {
    throw new Error(`Failed to download ${record.officialUrl}: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(assetPath, buffer);

  return {
    ...record,
    localPath: `/assets/income-tax-forms/${filename}`,
    size: record.size ?? `${Math.max(1, Math.round(buffer.length / 1024))} KB`,
  };
}

async function scrapeSource() {
  const sourceUrl = `${SOURCE_URL}?field_assessment_year_taxonomy_t_target_id=${ASSESSMENT_YEAR_TARGET_ID}`;
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${sourceUrl}: ${response.status}`);
  }

  const html = await response.text();
  const rows = extractRows(html);
  const records: IncomeTaxFormDownload[] = [];

  for (const row of rows) {
    const description = extractDescription(row.html);
    const linkRegex = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const links = [...row.html.matchAll(linkRegex)].filter((match) =>
      match[1].includes("/sites/default/files/"),
    );

    for (const link of links) {
      const linkText = stripTags(link[2]);
      const officialUrl = new URL(decodeEntities(link[1]), PORTAL_ORIGIN).href;
      const fileType = getFileType(linkText, officialUrl);
      const title = linkText ? `${row.title} - ${linkText}` : row.title;
      const act: IncomeTaxAct = "Unknown";
      const id = slugify(`ay ${ASSESSMENT_YEAR} ${title} ${path.basename(new URL(officialUrl).pathname)}`);
      const metadata = extractMetadata(row.html.slice(link.index ?? 0), linkText);

      records.push({
        id,
        title,
        description,
        fileType,
        act,
        ...metadata,
        officialUrl,
        tags: getTags(row.title, linkText, fileType, act),
      });
    }
  }

  return records;
}

function renderDataFile(records: IncomeTaxFormDownload[]) {
  const syncedAt = new Date().toISOString();
  return `export type IncomeTaxFormDownload = {
  id: string;
  title: string;
  description: string;
  fileType: 'pdf' | 'zip' | 'schema' | 'utility' | 'link';
  act: 'Income Tax Act 1961' | 'Income Tax Act 2025' | 'Unknown';
  version?: string;
  size?: string;
  latestReleaseDate?: string;
  localPath?: string;
  officialUrl: string;
  tags: string[];
};

export const incomeTaxFormsSourceUrl = ${JSON.stringify(SOURCE_URL)};
export const incomeTaxFormsLastSynced = ${JSON.stringify(syncedAt)};
export const incomeTaxFormsAssessmentYear = ${JSON.stringify(ASSESSMENT_YEAR)};
export const incomeTaxFormsFinancialYearLabel = ${JSON.stringify("2025-26")};

export const incomeTaxFormDownloads: IncomeTaxFormDownload[] = ${JSON.stringify(records, null, 2)};
`;
}

async function main() {
  await mkdir(ASSET_DIR, { recursive: true });
  const { rm, readdir } = await import("node:fs/promises");
  const existingAssets = await readdir(ASSET_DIR).catch(() => []);
  await Promise.all(
    existingAssets
      .filter((filename) => filename.toLowerCase().endsWith(".pdf"))
      .map((filename) => rm(path.join(ASSET_DIR, filename), { force: true })),
  );

  const scrapedRecords = await scrapeSource();

  const records = [];
  for (const record of scrapedRecords) {
    records.push(await downloadPdf(record));
  }

  await writeFile(DATA_FILE, renderDataFile(records));

  const pdfCount = records.filter((record) => record.fileType === "pdf").length;
  console.log(
    `Synced ${records.length} Income Tax return downloads for AY ${ASSESSMENT_YEAR} (${pdfCount} PDFs mirrored locally).`,
  );
  console.log(`Wrote ${path.relative(process.cwd(), DATA_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
