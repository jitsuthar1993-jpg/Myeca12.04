import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("documents workspace", () => {
  it("keeps the page focused on my documents, upload documents, and pending upload", () => {
    const pageSource = readFileSync(resolve(__dirname, "documents.page.tsx"), "utf8");

    expect(pageSource).toContain("My Documents");
    expect(pageSource).toContain("Generated Drafts");
    expect(pageSource).toContain("Open editor");
    expect(pageSource).toContain("isGeneratedDocument");
    expect(pageSource).toContain("Upload Documents");
    expect(pageSource).toContain("Pending Upload");
    expect(pageSource).not.toContain("Security Vault");
    expect(pageSource).not.toContain("AI Verification");
    expect(pageSource).not.toContain("Internal Generators");
    expect(pageSource).not.toContain("Case workflow preview");
  });
});
