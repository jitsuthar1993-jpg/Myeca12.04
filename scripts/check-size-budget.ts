import { gzipSync } from "node:zlib";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

type FileInfo = {
  path: string;
  size: number;
  gzipSize: number;
};

const root = process.cwd();
const distPublic = path.join(root, "dist", "public");
const vercelOutput = path.join(root, ".vercel", "output");

const mb = 1024 * 1024;
const kb = 1024;

const budgets = {
  distPublicBytes: 10 * mb,
  jsGzipTargetBytes: 1.1 * mb,
  jsGzipHardBytes: 1.5 * mb,
  largestJsRawBytes: 350 * kb,
  cssRawTargetBytes: 250 * kb,
  cssRawHardBytes: 275 * kb,
  ogDefaultBytes: 100 * kb,
  itrFilingChunkGzipBytes: 90 * kb,
  apiIndexFunctionBytes: 4 * mb,
};

function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];

  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? walkFiles(fullPath) : [fullPath];
  });
}

function formatBytes(bytes: number) {
  if (bytes >= mb) return `${(bytes / mb).toFixed(2)} MB`;
  if (bytes >= kb) return `${(bytes / kb).toFixed(2)} KB`;
  return `${bytes} B`;
}

function fileInfo(filePath: string): FileInfo {
  const buffer = readFileSync(filePath);
  return {
    path: path.relative(root, filePath).replace(/\\/g, "/"),
    size: buffer.length,
    gzipSize: gzipSync(buffer, { level: 9 }).length,
  };
}

function findApiIndexFunctionSize() {
  if (!existsSync(vercelOutput)) return null;

  const functionDirs = walkFiles(vercelOutput)
    .map((filePath) => path.dirname(filePath))
    .filter((dir, index, dirs) => dirs.indexOf(dir) === index)
    .filter((dir) => dir.replace(/\\/g, "/").endsWith("/api/index.func"));

  if (functionDirs.length === 0) return null;

  return functionDirs
    .flatMap((dir) => walkFiles(dir))
    .reduce((total, filePath) => total + statSync(filePath).size, 0);
}

if (!existsSync(distPublic)) {
  console.error("dist/public was not found. Run npm run build before npm run check:size.");
  process.exit(1);
}

const files = walkFiles(distPublic).map(fileInfo);
const jsFiles = files.filter((file) => file.path.endsWith(".js"));
const cssFiles = files.filter((file) => file.path.endsWith(".css"));
const pdfFiles = files.filter((file) => file.path.endsWith(".pdf"));
const htmlFiles = files.filter((file) => file.path.endsWith(".html"));
const totalBytes = files.reduce((total, file) => total + file.size, 0);
const jsGzipBytes = jsFiles.reduce((total, file) => total + file.gzipSize, 0);
const cssGzipBytes = cssFiles.reduce((total, file) => total + file.gzipSize, 0);
const cssRawBytes = cssFiles.reduce((total, file) => total + file.size, 0);
const htmlRawBytes = htmlFiles.reduce((total, file) => total + file.size, 0);
const largestJs = [...jsFiles].sort((a, b) => b.size - a.size)[0];
const largestCss = [...cssFiles].sort((a, b) => b.size - a.size)[0];
const largestArtifacts = [...files].sort((a, b) => b.size - a.size).slice(0, 5);
const itrFilingChunk = jsFiles.find((file) => /\/filing\.page-[^/]+\.js$/.test(file.path));
const contentContext = files.find((file) => file.path.endsWith("/content-context.json"));
const ogDefault = files.find((file) => file.path.endsWith("/og-default.png"));
const apiIndexFunctionBytes = findApiIndexFunctionSize();

const failures: string[] = [];
const warnings: string[] = [];

if (totalBytes > budgets.distPublicBytes) {
  failures.push(`dist/public is ${formatBytes(totalBytes)} over ${formatBytes(budgets.distPublicBytes)}.`);
}

if (jsGzipBytes > budgets.jsGzipHardBytes) {
  failures.push(`total JS gzip is ${formatBytes(jsGzipBytes)} over hard limit ${formatBytes(budgets.jsGzipHardBytes)}.`);
} else if (jsGzipBytes > budgets.jsGzipTargetBytes) {
  warnings.push(`total JS gzip is ${formatBytes(jsGzipBytes)}; target is ${formatBytes(budgets.jsGzipTargetBytes)}.`);
}

if (largestJs && largestJs.size > budgets.largestJsRawBytes) {
  warnings.push(`largest JS chunk is ${largestJs.path} at ${formatBytes(largestJs.size)}; target is ${formatBytes(budgets.largestJsRawBytes)}.`);
}

if (cssRawBytes > budgets.cssRawHardBytes) {
  failures.push(`total CSS raw is ${formatBytes(cssRawBytes)} over hard limit ${formatBytes(budgets.cssRawHardBytes)}.`);
} else if (cssRawBytes > budgets.cssRawTargetBytes) {
  warnings.push(`total CSS raw is ${formatBytes(cssRawBytes)}; target is ${formatBytes(budgets.cssRawTargetBytes)}.`);
}

if (contentContext) {
  failures.push("content-context.json must be emitted to dist/meta, not dist/public.");
}

if (!ogDefault) {
  failures.push("og-default.png was not found in dist/public.");
} else if (ogDefault.size > budgets.ogDefaultBytes) {
  failures.push(`og-default.png is ${formatBytes(ogDefault.size)} over ${formatBytes(budgets.ogDefaultBytes)}.`);
}

if (!itrFilingChunk) {
  failures.push("ITR filing route chunk was not found in dist/public/assets.");
} else if (itrFilingChunk.gzipSize > budgets.itrFilingChunkGzipBytes) {
  failures.push(`ITR filing route chunk is ${formatBytes(itrFilingChunk.gzipSize)} over ${formatBytes(budgets.itrFilingChunkGzipBytes)}.`);
}

if (pdfFiles.length > 0) {
  failures.push(`dist/public still contains ${pdfFiles.length} PDF file(s). Move tax PDFs to Blob before deploying.`);
}

if (apiIndexFunctionBytes != null && apiIndexFunctionBytes > budgets.apiIndexFunctionBytes) {
  failures.push(`api/index function is ${formatBytes(apiIndexFunctionBytes)} over ${formatBytes(budgets.apiIndexFunctionBytes)}.`);
}

console.log("Size budget report");
console.log(`dist/public: ${formatBytes(totalBytes)} across ${files.length} files`);
console.log(`JS gzip: ${formatBytes(jsGzipBytes)} across ${jsFiles.length} files`);
console.log(`CSS gzip: ${formatBytes(cssGzipBytes)} across ${cssFiles.length} files`);
console.log(`CSS raw: ${formatBytes(cssRawBytes)} across ${cssFiles.length} files`);
console.log(`HTML raw: ${formatBytes(htmlRawBytes)} across ${htmlFiles.length} files`);
console.log(`PDF files in dist/public: ${pdfFiles.length}`);
if (largestJs) {
  console.log(`Largest JS: ${largestJs.path} (${formatBytes(largestJs.size)}, gzip ${formatBytes(largestJs.gzipSize)})`);
}
if (largestCss) {
  console.log(`Largest CSS: ${largestCss.path} (${formatBytes(largestCss.size)})`);
}
console.log("Top public artifacts:");
for (const artifact of largestArtifacts) {
  console.log(`- ${artifact.path}: ${formatBytes(artifact.size)}`);
}
if (itrFilingChunk) {
  console.log(`ITR filing route chunk: ${formatBytes(itrFilingChunk.gzipSize)} gzip (budget ${formatBytes(budgets.itrFilingChunkGzipBytes)})`);
}
if (apiIndexFunctionBytes != null) {
  console.log(`api/index function: ${formatBytes(apiIndexFunctionBytes)}`);
}

for (const warning of warnings) {
  console.warn(`Warning: ${warning}`);
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`Failed: ${failure}`);
  }
  process.exit(1);
}
