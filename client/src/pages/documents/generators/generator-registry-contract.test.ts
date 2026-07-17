import { describe, expect, it } from "vitest";
import generatorRegistry from "@/data/generator-registry.json";
import { loadDocumentGenerator } from "./index";

const generatorIds = generatorRegistry.generators.map(({ id }) => id);

describe("document generator registry contract", () => {
  it("loads every registered generator with a usable default preview", async () => {
    const failures: string[] = [];

    for (const id of generatorIds) {
      const config = await loadDocumentGenerator(id);
      if (!config) {
        failures.push(`${id}: loader returned no config`);
        continue;
      }

      expect(config.schema, `${id} schema`).toBeDefined();
      expect(config.defaultValues, `${id} default values`).toBeDefined();
      const html = config.generateHTML(config.defaultValues);
      expect(html, `${id} HTML`).toMatch(/<[^>]+>/);
      expect(html, `${id} HTML`).not.toMatch(/<script\b/i);
    }

    expect(failures).toEqual([]);
  });
});