import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("public tool claims", () => {
  it("describes browser-local calculators without unsupported encryption claims", () => {
    const sources = [
      "client/src/features/calculators/pages/tds.page.tsx",
      "client/src/features/calculators/pages/hra.page.tsx",
      "client/src/features/calculators/pages/capital-gains.page.tsx",
      "client/src/features/calculators/pages/income-tax.page.tsx",
    ].map(read).join("\n");

    expect(sources).not.toContain("Your data is fully encrypted");
    expect(sources).not.toContain("Save scenarios and compare later");
    expect(sources.match(/Calculates in your browser/g)).toHaveLength(4);
    expect(sources.match(/Updates with your inputs/g)).toHaveLength(4);
  });
});
