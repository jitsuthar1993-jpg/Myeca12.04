import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/documents/generator.page.tsx", "utf8");

describe("generator preview pagination contract", () => {
  it("splits long tables by body rows while retaining page measurement", () => {
    expect(source).toContain("const splitNestedTable = (child: Node): Node[]");
    expect(source).toContain("querySelectorAll('tbody > tr')");
    expect(source).toContain("const pageIsOverfull = () =>");
  });
});
