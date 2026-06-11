import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { rootDir } from "./lib/build-artifact-paths.js";

const imagePath = path.join(rootDir, "client", "public", "og-default.png");
const temporaryPath = path.join(
  path.dirname(imagePath),
  `.${path.basename(imagePath)}.${process.pid}.tmp.png`,
);
const expectedWidth = 1200;
const expectedHeight = 630;
const maxBytes = 100 * 1024;

async function validateOptimizedPng(filePath: string) {
  const metadata = await sharp(filePath).metadata();
  const size = fs.statSync(filePath).size;

  if (metadata.format !== "png") {
    throw new Error(`Optimized OG image must remain PNG, received ${metadata.format ?? "unknown"}.`);
  }
  if (metadata.width !== expectedWidth || metadata.height !== expectedHeight) {
    throw new Error(
      `Optimized OG image must remain ${expectedWidth}x${expectedHeight}, received `
      + `${metadata.width ?? "unknown"}x${metadata.height ?? "unknown"}.`,
    );
  }
  if (size >= maxBytes) {
    throw new Error(`Optimized OG image is ${size} bytes; it must remain under ${maxBytes} bytes.`);
  }

  return size;
}

async function main() {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`OG image not found: ${imagePath}`);
  }

  const originalSize = fs.statSync(imagePath).size;

  try {
    await sharp(imagePath)
      .png({
        palette: true,
        colours: 128,
        compressionLevel: 9,
        effort: 10,
        dither: 0.5,
      })
      .toFile(temporaryPath);

    const optimizedSize = await validateOptimizedPng(temporaryPath);
    fs.renameSync(temporaryPath, imagePath);
    console.log(`Optimized og-default.png from ${originalSize} to ${optimizedSize} bytes.`);
  } finally {
    fs.rmSync(temporaryPath, { force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
