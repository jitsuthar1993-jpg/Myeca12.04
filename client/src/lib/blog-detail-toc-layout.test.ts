import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function readSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("blog detail table of contents layout", () => {
  it("keeps the index label and section count on one compact row", () => {
    const source = readSource("client/src/pages/blog/[slug].page.tsx");
    const tocStart = source.indexOf("function TocPanel");
    const tocEnd = source.indexOf("function InlineToc");
    const tocSource = source.slice(tocStart, tocEnd);

    expect(tocSource).toContain("flex flex-nowrap items-center justify-between");
    expect(tocSource).toContain("flex min-w-0 items-center gap-2.5");
    expect(tocSource).toContain("shrink-0 whitespace-nowrap");
  });
});
