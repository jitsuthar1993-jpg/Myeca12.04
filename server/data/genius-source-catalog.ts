import sourceCatalog from "../../client/src/data/genius-source-catalog.json";
import sourceSummary from "../../client/src/data/genius-source-catalog-summary.json";

const forms = Object.freeze(sourceCatalog.map((entry) => Object.freeze({
  id: entry.id,
  title: entry.title,
  sourceCategory: entry.sourceCategory,
  sourceFormat: entry.sourceFormat,
  sourceOriginalFormat: entry.sourceOriginalFormat,
  sourceReadable: entry.sourceReadable,
  policyKey: entry.policyKey,
})));
const inventory = Object.freeze({ ...sourceSummary });
const payload = Object.freeze({ inventory, forms });

export function getGeniusSourceCatalogPayload() {
  return payload;
}
