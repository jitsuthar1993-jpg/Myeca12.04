import { describe, expect, it } from "vitest";
import {
  analyzeTypographySource,
  filterTypographyIssues,
  type TypographyAllowlistEntry,
} from "./typography-audit";

describe("typography audit", () => {
  it("reports raw pixel text, undersized text, and oversized title classes", () => {
    const issues = analyzeTypographySource(
      "client/src/pages/example.page.tsx",
      [
        '<p className="text-[15px]">Body</p>',
        '<span className="text-[10px]">Tiny helper</span>',
        '<h1 className="text-4xl md:text-6xl">Oversized page title</h1>',
      ].join("\n"),
    );

    expect(issues.map((issue) => issue.rule)).toEqual([
      "arbitrary-pixel",
      "arbitrary-pixel",
      "sub-12px",
      "oversized-title",
    ]);
  });

  it("reports inline pixel font sizes used by chart and SVG text", () => {
    const issues = analyzeTypographySource(
      "client/src/pages/chart.page.tsx",
      [
        '<XAxis fontSize={10} />',
        '<text fontSize="11">Axis label</text>',
        '<Legend wrapperStyle={{ fontSize: "13px" }} />',
      ].join("\n"),
    );

    expect(issues.map((issue) => issue.rule)).toEqual([
      "arbitrary-pixel",
      "sub-12px",
      "arbitrary-pixel",
      "sub-12px",
      "arbitrary-pixel",
    ]);
  });

  it("accepts semantic hero roles and role-based user-page text", () => {
    const issues = analyzeTypographySource(
      "client/src/pages/example.page.tsx",
      [
        '<h1 className="type-hero-title">Approved hero</h1>',
        '<h2 className="type-section-title">Section</h2>',
        '<p className="type-body">Balanced body</p>',
        '<span className="type-meta">Meta</span>',
      ].join("\n"),
    );

    expect(issues).toEqual([]);
  });

  it("does not treat large display values as oversized titles", () => {
    const issues = analyzeTypographySource(
      "client/src/pages/example.page.tsx",
      '<span className="text-5xl font-black">72%</span>',
    );

    expect(issues).toEqual([]);
  });

  it("reports oversized animated heading tags", () => {
    const issues = analyzeTypographySource(
      "client/src/pages/example.page.tsx",
      '<m.h1 className="text-4xl md:text-6xl">Animated title</m.h1>',
    );

    expect(issues.map((issue) => issue.rule)).toEqual(["oversized-title"]);
  });

  it("reports oversized title classes split across tag lines", () => {
    const issues = analyzeTypographySource(
      "client/src/pages/example.page.tsx",
      [
        "<m.h1",
        '  className="text-4xl lg:text-5xl"',
        ">Split animated title</m.h1>",
      ].join("\n"),
    );

    expect(issues.map((issue) => issue.rule)).toEqual(["oversized-title"]);
  });

  it("filters retained exceptions only when rule, path, and class match", () => {
    const source = '<span className="text-[10px] font-bold">Retained badge</span>';
    const issues = analyzeTypographySource("client/src/pages/legacy.page.tsx", source);
    const allowlist: TypographyAllowlistEntry[] = [
      {
        path: "client/src/pages/legacy.page.tsx",
        rule: "sub-12px",
        classFragment: "text-[10px]",
        reason: "Existing compact badge retained for this pass.",
      },
    ];

    expect(filterTypographyIssues(issues, allowlist).map((issue) => issue.rule)).toEqual([
      "arbitrary-pixel",
    ]);
  });
});
