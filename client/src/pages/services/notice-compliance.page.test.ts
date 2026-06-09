import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { SEO_CONFIG } from "@/config/seo.config";
import { noticeLawTransitionRows } from "./notice-compliance.page";

describe("notice compliance legal transition content", () => {
  it("keeps old and new income-tax notice sections together", () => {
    expect(noticeLawTransitionRows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          oldSection: "143(1)",
          newSection: "270(1)",
          title: "Processing intimation",
        }),
        expect.objectContaining({
          oldSection: "143(2)",
          newSection: "270(8)",
          title: "Scrutiny notice",
        }),
        expect.objectContaining({
          oldSection: "139(9)",
          newSection: "263(7)",
          title: "Defective return",
        }),
        expect.objectContaining({
          oldSection: "154",
          newSection: "287",
          title: "Rectification",
        }),
      ]),
    );

    expect(noticeLawTransitionRows.every((row) => row.responseFocus.length > 24)).toBe(true);
  });

  it("keeps hydrated metadata aligned with the static notice route", () => {
    const source = readFileSync("client/src/pages/services/notice-compliance.page.tsx", "utf8");
    const seo = SEO_CONFIG["/services/notice-compliance"];

    expect(source).toContain(`title="${seo.title}"`);
    expect(source).toContain(`description="${seo.description}"`);
  });
});
