import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "client/src/components/Testimonials.tsx"),
  "utf8",
);

describe("homepage filing situation cards", () => {
  it("uses a consistent card hierarchy with a visible scenario label", () => {
    expect(source).toContain("Situation {index + 1}");
    expect(source).toContain("border-t-4");
    expect(source).toContain("hover:-translate-y-0.5");
    expect(source).toContain("index % situationAccents.length");
  });

  it("keeps document and review lists visually separated and responsive", () => {
    expect(source).toContain("divide-y divide-slate-100");
    expect(source).toContain("sm:divide-x sm:divide-y-0");
    expect(source).toContain("sm:min-h-[3.5rem]");
  });
});
