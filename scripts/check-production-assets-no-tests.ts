import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve(process.cwd(), "dist", "public");
const assetsDir = path.join(distDir, "assets");
const serviceWorkerPath = path.join(distDir, "service-worker.js");
const testAssetPattern = /(?:^|[\\/])[^\\/]*(?:\.test-|\.spec-|test\.)[^\\/]*\.js$/i;
const serviceWorkerTestPattern = /assets\/[^"'`]*(?:\.test-|\.spec-|test\.)[^"'`]*\.js/i;

function listJavaScriptAssets(dir: string) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listJavaScriptAssets(entryPath);
      return entryPath.endsWith(".js") ? [entryPath] : [];
    });
}

const leakedAssetFiles = listJavaScriptAssets(assetsDir).filter((filePath) =>
  testAssetPattern.test(filePath.replace(/\\/g, "/")),
);

if (leakedAssetFiles.length > 0) {
  throw new Error(
    `Production build emitted test chunks:\n${leakedAssetFiles
      .map((filePath) => `- ${path.relative(distDir, filePath)}`)
      .join("\n")}`,
  );
}

if (fs.existsSync(serviceWorkerPath)) {
  const serviceWorker = fs.readFileSync(serviceWorkerPath, "utf8");
  if (serviceWorkerTestPattern.test(serviceWorker)) {
    throw new Error("Production service worker precache includes test chunks.");
  }
}

console.log("Production asset test-chunk audit passed.");
