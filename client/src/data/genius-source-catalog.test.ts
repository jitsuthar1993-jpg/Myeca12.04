import { describe, expect, it } from "vitest";
import sourceCatalog from "./genius-source-catalog.json";
import sourceSummary from "./genius-source-catalog-summary.json";
import {
  enrichGeniusSourceCatalog,
  GENIUS_SOURCE_INVENTORY,
  GENIUS_SOURCE_POLICIES,
  parseImportedSourceCatalog,
} from "./genius-source-catalog";

const enrichedCatalog = enrichGeniusSourceCatalog(sourceCatalog);

describe("Genius REPORTS source catalog", () => {
  it("accounts for every template artifact in the approved source folder", () => {
    expect(GENIUS_SOURCE_INVENTORY).toEqual({
      total: 1014,
      encrypted: 881,
      rtf: 124,
      html: 9,
    });
    expect(sourceSummary).toEqual(GENIUS_SOURCE_INVENTORY);
    expect(enrichedCatalog).toHaveLength(GENIUS_SOURCE_INVENTORY.total);
  });


  it("uses stable unique ids and preserves source evidence", () => {
    const ids = new Set(enrichedCatalog.map((form) => form.id));
    const sourcePaths = new Set(enrichedCatalog.map((form) => form.sourceRelativePath));

    expect(ids.size).toBe(enrichedCatalog.length);
    expect(sourcePaths.size).toBe(enrichedCatalog.length);
    expect(
      enrichedCatalog.every(
        (form) =>
          form.title.trim() &&
          form.sourceRelativePath &&
          form.sourceFormat &&
          form.sourceByteLength > 0 &&
          /^[a-f0-9]{64}$/.test(form.sourceSha256),
      ),
    ).toBe(true);
  });

  it("keeps imported templates out of public use until law and version review is complete", () => {
    expect(
      enrichedCatalog.every(
        (form) =>
          form.sourceApproval === "approved-for-migration" &&
          form.publicationStatus === "review_required" &&
          form.lawReviewStatus !== "verified-current",
      ),
    ).toBe(true);
  });

  it("blocks superseded statutory collections explicitly", () => {
    for (const category of ["COMPANY LAW", "SERVICETAX", "WEALTHTAX"]) {
      expect(GENIUS_SOURCE_POLICIES[category]?.lawReviewStatus).toBe("blocked-superseded");
      expect(GENIUS_SOURCE_POLICIES[category]?.officialSources.length).toBeGreaterThan(0);
    }
  });

  it("accepts a valid server catalogue when its count differs from the build-time summary", () => {
    const [{ sourceRelativePath: _path, sourceByteLength: _bytes, sourceSha256: _hash, ...publicEntry }] = sourceCatalog;

    expect(parseImportedSourceCatalog([publicEntry])).toEqual([publicEntry]);
  });
});
