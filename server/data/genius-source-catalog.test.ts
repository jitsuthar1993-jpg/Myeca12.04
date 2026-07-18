import { describe, expect, it } from "vitest";
import { getGeniusSourceCatalogPayload } from "./genius-source-catalog";

describe("public Genius source catalogue payload", () => {
  it("returns the complete audited inventory without publishing any source as current", () => {
    const payload = getGeniusSourceCatalogPayload();

    expect(payload.inventory).toEqual({ total: 1014, encrypted: 881, rtf: 124, html: 9 });
    expect(payload.forms).toHaveLength(payload.inventory.total);
    expect(payload.forms.every((form) => form.id && form.title && form.sourceCategory)).toBe(true);
    expect(
      payload.forms.every(
        (form) =>
          !("sourceRelativePath" in form) &&
          !("sourceByteLength" in form) &&
          !("sourceSha256" in form),
      ),
    ).toBe(true);
  });
});
