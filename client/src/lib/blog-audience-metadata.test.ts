import { describe, expect, it } from "vitest";
import { loadStaticMdxBlogPosts } from "../../../server/data/static-blog-content";
import {
  BLOG_AUDIENCE_OVERRIDES,
  buildCategoryTargetAudience,
  buildSchemeTargetAudience,
  indefiniteArticleFor,
  isGeneratedKeywordAudience,
  repairAudienceArticle,
  repairTargetAudience,
} from "../../../scripts/lib/blog-audience-metadata";

describe("generated blog audience metadata", () => {
  it("keeps an explicit natural-language audience for every repaired route", () => {
    expect(Object.keys(BLOG_AUDIENCE_OVERRIDES)).toHaveLength(39);

    const audience = buildCategoryTargetAudience({
      slug: "annual-roc-compliance-calendar-companies-llps",
      categoryId: "business-compliance",
      primaryKeyword: "ROC compliance",
    });

    expect(audience).toBe(
      "Company and LLP founders, finance teams, and compliance owners planning annual ROC filings and record retention.",
    );
    expect(audience).not.toMatch(/who need to/i);
  });

  it.each([
    [
      "itr-filing-mistakes-to-avoid",
      "ITR mistakes",
      "Individuals reviewing income, tax credits, bank details, and verification steps before filing an ITR.",
    ],
    [
      "when-will-itr-filing-start-ay-2026-27",
      "ITR filing start",
      "Individuals waiting to file an AY 2026-27 return and checking whether utilities, TDS data, and source records are ready.",
    ],
    [
      "gst-turnover-vs-income-tax-turnover-ay-2026-27",
      "GST turnover income tax turnover",
      "Business owners and accountants reconciling GST turnover with books and income-tax reporting.",
    ],
    [
      "representative-filing-deceased-taxpayer-itr-ay-2026-27",
      "representative filing deceased taxpayer ITR",
      "Legal heirs and representatives preparing an AY 2026-27 return for a deceased taxpayer.",
    ],
  ])("replaces raw keyword audience copy for %s", (slug, primaryKeyword, expected) => {
    const meta = { slug, categoryId: slug.includes("gst-") ? "business-compliance" : "itr-filing", primaryKeyword };
    const rawAudience = buildCategoryTargetAudience({ ...meta, slug: undefined });

    expect(isGeneratedKeywordAudience(meta, rawAudience)).toBe(true);
    expect(repairTargetAudience(meta, rawAudience)).toBe(expected);
  });

  it("repairs malformed generated prose while preserving an already-specific audience", () => {
    expect(
      repairTargetAudience(
        { categoryId: "itr-filing", primaryKeyword: "ITR-1 AY 2026-27" },
        "Taxpayers preparing ITR-1 AY 2026-27 who need to ITR-1 utility was released for AY 2026-27 using eligibility details.",
      ),
    ).toBe("Taxpayers preparing ITR-1 AY 2026-27.");
    expect(
      repairTargetAudience(
        { categoryId: "government-schemes", primaryKeyword: "PM-KISAN" },
        "Small and marginal farmers checking a PM-KISAN beneficiary record before the next instalment.",
      ),
    ).toBe("Small and marginal farmers checking a PM-KISAN beneficiary record before the next instalment.");
  });

  it.each([
    ["ABHA Health ID", "an"],
    ["AICTE Pragati and Saksham Scholarship", "an"],
    ["Aadhaar Update", "an"],
    ["Udyam", "an"],
    ["UMANG App Services", "an"],
    ["MUDRA Loan", "a"],
    ["MSME Samadhaan", "an"],
    ["NPS Account Opening", "an"],
    ["One Nation One Ration Card", "a"],
    ["PM-KISAN", "a"],
  ])("selects %s with the article %s", (label, article) => {
    expect(indefiniteArticleFor(label)).toBe(article);
  });

  it("builds and repairs scheme audience articles without changing the surrounding metadata", () => {
    expect(
      buildSchemeTargetAudience(
        "patients managing medical records",
        "ABHA Health ID",
        ["Aadhaar or mobile", "health records", "prescriptions"],
      ),
    ).toBe(
      "Patients managing medical records preparing an ABHA Health ID application and verifying Aadhaar or mobile, health records, prescriptions before submission or follow-up.",
    );
    expect(
      repairAudienceArticle(
        "Families checking food-security benefits preparing a One Nation One Ration Card application and verifying ration card before submission.",
      ),
    ).toContain("preparing a One Nation One Ration Card application");
    expect(
      repairAudienceArticle(
        "Technical education students preparing a AICTE Pragati and Saksham Scholarship application before submission.",
      ),
    ).toContain("preparing an AICTE Pragati and Saksham Scholarship application");
  });

  it("keeps every published audience free of malformed generator prose", () => {
    const posts = loadStaticMdxBlogPosts();
    expect(posts).toHaveLength(230);

    for (const post of posts) {
      expect(post.targetAudience, post.slug).not.toMatch(/\bwho need to\s+[A-Z]/);
      expect(isGeneratedKeywordAudience(post, post.targetAudience), post.slug).toBe(false);

      const schemeAudience = post.targetAudience.match(
        /\bpreparing\s+(a|an)\s+(.+?)\s+application\b/i,
      );
      if (!schemeAudience) continue;

      expect(schemeAudience[1].toLowerCase(), post.slug).toBe(
        indefiniteArticleFor(schemeAudience[2]),
      );
    }
  });
});
