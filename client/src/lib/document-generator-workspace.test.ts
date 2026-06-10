import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const registrySource = readFileSync("client/src/pages/documents/registry.page.tsx", "utf8");
const editorSource = readFileSync("client/src/pages/documents/generator.page.tsx", "utf8");
const mobileSource = readFileSync("client/src/components/mobile/index.tsx", "utf8");

describe("document generator workspace contract", () => {
  it("renders the template catalog as a shared workspace gallery", () => {
    expect(registrySource).toContain("@/components/admin/Layout");
    expect(registrySource).toContain('<Layout title="Document Generator">');
    expect(registrySource).toContain('data-testid="document-template-gallery"');
    expect(registrySource).toContain("Document templates");
    expect(registrySource).toContain("Official Forms");
    expect(registrySource).not.toContain("MyeCA Forms");
  });

  it("keeps the editor focused while providing a mobile preview overlay", () => {
    expect(editorSource).toContain('data-testid="focused-document-editor"');
    expect(editorSource).toContain('data-testid="mobile-document-preview"');
    expect(editorSource).toContain("Back to Document Generator");
    expect(editorSource).toContain("lg:hidden");
  });

  it("supports an item-count-aware six-column mobile navigation", () => {
    expect(mobileSource).toContain("items.length === 6");
    expect(mobileSource).toContain("grid-cols-6");
  });
});
