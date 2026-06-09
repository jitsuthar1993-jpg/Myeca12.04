// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { describe, expect, it } from "vitest";
import MetaSEO from "./MetaSEO";

function renderJsonLd(expertAuthor?: string) {
  const { container } = render(
    <HelmetProvider>
      <MetaSEO
        title="Income Tax Calculator"
        description="Estimate income tax for AY 2026-27."
        canonicalUrl="/calculators/income-tax"
        type="calculator"
        expertAuthor={expertAuthor}
      />
    </HelmetProvider>,
  );

  return [...container.querySelectorAll<HTMLScriptElement>('script[type="application/ld+json"]')]
    .map((script) => JSON.parse(script.textContent || "{}"));
}

describe("MetaSEO author trust signals", () => {
  it("does not claim a named expert author unless the page supplies one", () => {
    expect(JSON.stringify(renderJsonLd())).not.toContain("CA Ankit S.");
  });

  it("includes an explicitly supplied author", () => {
    expect(JSON.stringify(renderJsonLd("CA Example Reviewer"))).toContain("CA Example Reviewer");
  });

  it("marks the editorial team as an organization rather than a named tax consultant", () => {
    const schema = JSON.stringify(renderJsonLd("MyeCA Editorial Team"));

    expect(schema).toContain('"@type":"Organization","name":"MyeCA Editorial Team"');
    expect(schema).not.toContain('"jobTitle":"Tax Consultant"');
  });

  it("does not add an unverified professional title to a named person", () => {
    expect(JSON.stringify(renderJsonLd("Example Author"))).not.toContain('"jobTitle":"Tax Consultant"');
  });
});
