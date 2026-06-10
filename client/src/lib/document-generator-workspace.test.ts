import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import generatorRegistry from "@/data/generator-registry.json";
import {
  getDocumentGeneratorPreviewData,
  loadDocumentGenerator,
} from "@/pages/documents/generators";

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

  it(
    "keeps every advertised generator preview renderable before the form reset completes",
    async () => {
      for (const generator of generatorRegistry.generators.filter(
        (entry) => entry.status === "available",
      )) {
        const config = await loadDocumentGenerator(generator.id);

        expect(config, generator.id).not.toBeNull();
        expect(
          () =>
            config?.generateHTML(
              getDocumentGeneratorPreviewData(config.defaultValues, {}),
            ),
          generator.id,
        ).not.toThrow();
      }
    },
    15_000,
  );

  it("keeps entered preview values while filling fields that are still undefined", () => {
    expect(
      getDocumentGeneratorPreviewData(
        {
          name: "Default name",
          executionPlace: "Mumbai",
          from: { name: "Default business", gstin: "27DEFAULT" },
          items: [{ description: "Default item" }],
        },
        {
          name: "Entered name",
          executionPlace: undefined,
          from: { name: "Entered business" },
          items: [],
        },
      ),
    ).toEqual({
      name: "Entered name",
      executionPlace: "Mumbai",
      from: {
        name: "Entered business",
        gstin: "27DEFAULT",
      },
      items: [],
    });
  });

  it("keeps generator registry priorities unique", () => {
    const priorities = generatorRegistry.generators.map((entry) => entry.priority);

    expect(new Set(priorities).size).toBe(priorities.length);
  });

  it("advertises and renders the HUF affidavit format", async () => {
    expect(
      generatorRegistry.generators.find((entry) => entry.id === "huf-affidavit"),
    ).toMatchObject({
      name: "HUF Affidavit",
      category: "legal",
      status: "available",
    });
    const config = await loadDocumentGenerator("huf-affidavit");

    expect(config).not.toBeNull();
    expect(config?.defaultValues).toMatchObject({
      giftDate: "",
      existenceDate: "",
    });

    const html = config?.generateHTML({
      ...config.defaultValues,
      kartaName: "SUNIL SUTHAR",
      hufName: "SUNIL SUTHAR HUF",
      donorName: "BHIYARAM SUTHAR",
      members: [
        {
          name: "PUNAM SUTHAR",
          fatherName: "JETHMAL SUTHAR",
          address: "Nokha, Bikaner, Rajasthan",
          status: "Member (Wife)",
        },
      ],
    });

    expect(html).toContain("AFFIDAVIT");
    expect(html).toContain("SUNIL SUTHAR HUF");
    expect(html).toContain("formed the corpus of the HUF");
    expect(html).toContain("FATHER'S NAME");
    expect(html).toContain("Member (Wife)");
    expect(html).toContain("Signature");

    expect(
      config?.generateHTML({
        ...config.defaultValues,
        kartaAge: Number.NaN,
        coparcenerCount: Number.NaN,
      }),
    ).not.toContain("NaN");
  });

  it("supports an item-count-aware six-column mobile navigation", () => {
    expect(mobileSource).toContain("items.length === 6");
    expect(mobileSource).toContain("grid-cols-6");
  });
});
