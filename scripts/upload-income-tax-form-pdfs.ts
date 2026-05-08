import { put } from "@vercel/blob";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourceDir = path.join(root, "assets", "income-tax-forms");
const dryRun = process.argv.includes("--dry-run");

if (!existsSync(sourceDir)) {
  console.error(`Missing PDF source directory: ${path.relative(root, sourceDir)}`);
  process.exit(1);
}

if (!dryRun && !process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN is required. Use --dry-run to preview without uploading.");
  process.exit(1);
}

const files = (await readdir(sourceDir))
  .filter((fileName) => fileName.toLowerCase().endsWith(".pdf"))
  .sort();

if (files.length === 0) {
  console.log("No income-tax form PDFs found to upload.");
  process.exit(0);
}

console.log(`${dryRun ? "Would upload" : "Uploading"} ${files.length} income-tax form PDF(s).`);

let inferredBaseUrl = "";

for (const fileName of files) {
  const localPath = path.join(sourceDir, fileName);
  const blobPath = `income-tax-forms/${fileName}`;

  if (dryRun) {
    console.log(`- ${path.relative(root, localPath)} -> ${blobPath}`);
    continue;
  }

  const body = await readFile(localPath);
  const blob = await put(blobPath, body, {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/pdf",
  });

  if (!inferredBaseUrl && blob.url.endsWith(blobPath)) {
    inferredBaseUrl = blob.url.slice(0, -blobPath.length).replace(/\/$/, "");
  }

  console.log(`- ${fileName} -> ${blob.url}`);
}

if (inferredBaseUrl) {
  console.log("");
  console.log("Set this in Vercel for stable app download redirects:");
  console.log(`INCOME_TAX_FORMS_BLOB_BASE_URL=${inferredBaseUrl}`);
}
