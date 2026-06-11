import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const briefPath = "docs/marketing/myeca-website-content-color-theme-brief.md";

function read(path: string) {
  return readFileSync(path, "utf8");
}

describe("MyeCA content brand brief", () => {
  it("ships the website content, color, and theme brief for the content team", () => {
    expect(existsSync(briefPath), briefPath).toBe(true);
  });

  it("locks the core positioning, journeys, and conversion language", () => {
    const brief = read(briefPath);
    const requiredPhrases = [
      "clear scope before payment",
      "secure document handling",
      "expert CA review",
      "Smart tax solutions with expert-backed filing, document clarity, and compliance confidence",
      "File ITR",
      "Use Calculator",
      "Compare Pricing",
      "Read Blogs",
      "Trust/Security",
      "Contact/Expert Consultation",
      "review-ready",
      "document-backed",
      "case-specific",
      "filing path",
      "reconciliation",
      "expert-assisted",
      "before submission",
    ];

    requiredPhrases.forEach((phrase) => {
      expect(brief, phrase).toContain(phrase);
    });
  });

  it("documents the approved color system and visual guardrails", () => {
    const brief = read(briefPath);

    [
      "#" + "315efb",
      "#" + "2040d8",
      "#" + "0646b2",
      "#047857",
      "#00a86b",
      "#F8FAFC",
      "#EEF4FF",
      "Inter",
      "SMART TAX SOLUTIONS",
    ].forEach((token) => {
      expect(brief, token).toContain(token);
    });

    expect(brief).toContain("mostly blue, white, slate, and light-blue surfaces");
    expect(brief).toContain("green for trust, completion, secure-document, and verified states");
    expect(brief).toContain("orange or amber only for notices, deadlines, urgency, and support categories");
    expect(brief).toContain("red only for errors, risk warnings, and destructive states");
  });

  it("keeps content rules tied to the existing blog, service, and tool interfaces", () => {
    const brief = read(briefPath);

    [
      "title",
      "description",
      "primaryKeyword",
      "sourceLinks",
      "faqs",
      "keyHighlights",
      "ctaLabel",
      "ctaHref",
      "audience",
      "reviewedBy",
      "category",
      "price/scope",
      "timeline",
      "features",
      "documents",
      "color category",
    ].forEach((field) => {
      expect(brief, field).toContain(field);
    });
  });

  it("rejects unsafe tax and marketing promises", () => {
    const brief = read(briefPath);
    const forbiddenClaims = /guaranteed refund|guaranteed savings|notice-free filing|fastest approval|guaranteed notice immunity/i;

    expect(brief).not.toMatch(forbiddenClaims);
    expect(brief).toContain("Do not promise refunds, tax savings, notice immunity, fastest processing, or guaranteed approval");
  });
});
