import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { SEO_CONFIG } from "@/config/seo.config";
import {
  CALCULATOR_MANIFEST,
  getCalculatorByPath,
  getCanonicalCalculatorPath,
  getCalculatorRouteEntries,
} from "@/data/calculator-manifest";
import { CALCULATOR_ROUTES } from "@/routes/registry/calculator-routes";
import { HSN_REFERENCE_DATASET, PENALTY_RULE_DATASET } from "@/data/calculator-rule-datasets";

describe("calculator manifest", () => {
  it("uses unique canonical paths and slugs", () => {
    const slugs = CALCULATOR_MANIFEST.map((calculator) => calculator.slug);
    const canonicalPaths = CALCULATOR_MANIFEST.map((calculator) => calculator.canonicalPath);

    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(canonicalPaths).size).toBe(canonicalPaths.length);
  });

  it("maps every canonical path and alias to one calculator", () => {
    const paths = getCalculatorRouteEntries().map((entry) => entry.path);

    expect(new Set(paths).size).toBe(paths.length);
    for (const path of paths) {
      expect(getCalculatorByPath(path), path).toBeDefined();
    }
  });

  it("resolves aliases to their canonical calculator paths", () => {
    expect(getCanonicalCalculatorPath("/calculators/regime-comparator")).toBe("/calculators/tax-regime");
    expect(getCanonicalCalculatorPath("/calculators/sip-enhanced")).toBe("/calculators/sip");
    expect(getCanonicalCalculatorPath("/calculators/fd-enhanced")).toBe("/calculators/fd");
    expect(getCanonicalCalculatorPath("/calculators/car-loan")).toBe("/calculators/home-loan");
  });

  it("records calculation ownership, versioning and sources for every calculator", () => {
    for (const calculator of CALCULATOR_MANIFEST) {
      expect(calculator.engine.length, calculator.slug).toBeGreaterThan(0);
      expect(calculator.ruleVersion.length, calculator.slug).toBeGreaterThan(0);
      expect(calculator.sourceNotes.length, calculator.slug).toBeGreaterThan(0);
      expect(existsSync(resolve(process.cwd(), calculator.source)), calculator.source).toBe(true);
    }
  });

  it("records auditable official references for statutory calculators", () => {
    const statutoryCalculators = CALCULATOR_MANIFEST.filter((calculator) =>
      ["tax", "business"].includes(calculator.category) || ["salary", "gratuity", "epf"].includes(calculator.slug),
    );

    for (const calculator of statutoryCalculators) {
      expect(calculator.officialSources.length, calculator.slug).toBeGreaterThan(0);
      for (const source of calculator.officialSources) {
        expect(source.url, calculator.slug).toMatch(/^https:\/\//);
        expect(source.checkedOn, calculator.slug).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("keeps reference-route manifest sources in parity with their page datasets", () => {
    expect(getCalculatorByPath("/calculators/hsn-finder")?.officialSources.map(({ url }) => url))
      .toEqual(HSN_REFERENCE_DATASET.officialSources.map(({ url }) => url));
    expect(getCalculatorByPath("/calculators/penalty")?.officialSources.map(({ url }) => url))
      .toEqual(PENALTY_RULE_DATASET.officialSources.map(({ url }) => url));
  });

  it("stays in parity with the literal route registry used by quality checks", () => {
    const byPath = (left: { path: string }, right: { path: string }) => left.path.localeCompare(right.path);
    const registeredRoutes = CALCULATOR_ROUTES
      .filter((entry) => entry.path !== "/calculators" && !entry.path.includes(":"))
      .map(({ path, source }) => ({ path, source }))
      .sort(byPath);

    expect(getCalculatorRouteEntries().sort(byPath)).toEqual(registeredRoutes);
  });

  it("keeps SEO metadata on every indexable calculator route", () => {
    for (const entry of getCalculatorRouteEntries()) {
      expect(SEO_CONFIG[entry.path], entry.path).toBeDefined();
    }
  });
});
