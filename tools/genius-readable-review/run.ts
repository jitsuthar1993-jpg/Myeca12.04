import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { OfficeConverter } from "officeparser";
import sourceCatalog from "../../client/src/data/genius-source-catalog.json";
import {
  generateReadableReviewBundle,
  parserFileTypeForSource,
  type ReadableCatalogEntry,
  type ReadableSourceFormat,
} from "../../scripts/genius-readable-review";

const DEFAULT_SOURCE_ROOT = "C:\\SAG Infotech\\Genius\\REPORTS";
const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));

function argumentValue(name: string): string | undefined {
  return process.argv.slice(2).find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
}

async function convertReadableSource(sourceBytes: Buffer, sourceFormat: ReadableSourceFormat) {
  return OfficeConverter.convert(sourceBytes, "html", {
    parseConfig: {
      fileType: parserFileTypeForSource(sourceFormat),
      extractAttachments: false,
      includeRawContent: false,
    },
    generatorConfig: {
      includeImages: false,
      includeCharts: false,
      renderMetadata: false,
      htmlConfig: { standalone: false },
    },
  });
}

generateReadableReviewBundle({
  repositoryRoot,
  sourceRoot: resolve(argumentValue("--source") || DEFAULT_SOURCE_ROOT),
  outputRoot: resolve(repositoryRoot, argumentValue("--output") || ".local/genius-form-review"),
  sourceCatalog: sourceCatalog as ReadableCatalogEntry[],
  convertReadableSource,
})
  .then(({ runRoot, manifest }) => {
    console.log(`Prepared ${manifest.readableSourceCount} review-only templates in ${runRoot}`);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
