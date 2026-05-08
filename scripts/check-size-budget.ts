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
const totalBytes = files.reduce((total, file) => total + file.size, 0);
const jsGzipBytes = jsFiles.reduce((total, file) => total + file.gzipSize, 0);
const cssGzipBytes = cssFiles.reduce((total, file) => total + file.gzipSize, 0);
const largestJs = [...jsFiles].sort((a, b) => b.size - a.size)[0];
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
console.log(`PDF files in dist/public: ${pdfFiles.length}`);
if (largestJs) {
  console.log(`Largest JS: ${largestJs.path} (${formatBytes(largestJs.size)}, gzip ${formatBytes(largestJs.gzipSize)})`);
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
