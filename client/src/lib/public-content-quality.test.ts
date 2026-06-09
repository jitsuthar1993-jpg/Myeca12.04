import { describe, expect, it } from "vitest";
import * as publicContentQuality from "@shared/public-content-quality";
import {
  blogEditorInputToContentContext,
  evaluateDuplicateParagraphs,
  evaluateNearDuplicateContent,
  evaluateRepeatedHeadingSequences,
  evaluateRepeatedHeadingLabels,
  evaluateRepeatedHeadingPrefixes,
  evaluateRepeatedBoilerplate,
  evaluateRepeatedListOpenings,
  evaluateRepeatedLongBlocks,
  evaluateRepeatedProseOpenings,
  evaluateRepeatedSentences,
  evaluateRepeatedStructuredFragments,
  evaluateRepeatedTableRows,
  evaluatePublicContent,
  shouldIndexPublicContent,
  type ContentQualityIssue,
  type PublicContentContext,
} from "@shared/public-content-quality";
import { blogPostEditorSchema } from "@shared/blog";

const context: PublicContentContext = {
  route: "/blog/advance-tax-due-dates",
  pageType: "blog",
  audience: ["Indian taxpayers with advance-tax obligations"],
  primaryKeyword: "advance tax due dates",
  secondaryKeywords: ["advance tax interest", "advance tax instalments"],
  userIntent: "informational",
  keyTopics: ["due dates", "interest exposure", "payment records"],
  officialSources: [
    {
      label: "Income Tax Department",
      url: "https://www.incometax.gov.in/",
      checkedAt: "2026-06-06",
    },
  ],
  author: {
    name: "MyeCA Editorial Team",
    role: "Tax content editors",
  },
  reviewer: null,
  editorialApproval: {
    approvedBy: "MyeCA Editorial Team",
    approvedAt: "2026-06-06",
  },
  qualityStatus: "approved",
};

describe("public content quality evaluator", () => {
  it("keeps the editorial target audience separate from the broad blog filter segment", () => {
    const input = blogPostEditorSchema.parse({
      title: "Advance tax due dates",
      slug: "advance-tax-due-dates",
      content: "Detailed article body",
      audience: "both",
      targetAudience: "Freelancers with non-salary income estimating quarterly advance-tax instalments",
      primaryKeyword: "advance tax due dates",
      secondaryKeywords: ["advance tax instalments"],
      keyTopics: ["estimate liability", "reconcile challans"],
      sourceLinks: [{
        label: "Income Tax Department",
        url: "https://www.incometax.gov.in/",
        checkedAt: "2026-06-07",
      }],
    });

    expect(blogEditorInputToContentContext(input).audience).toEqual([
      "Freelancers with non-salary income estimating quarterly advance-tax instalments",
    ]);
  });

  it("reports an unchanged long paragraph used across three indexable routes", () => {
    const repeated =
      "This unchanged paragraph is deliberately long enough to represent boilerplate that should not appear verbatim across several indexable public routes without a legal reason.";

    const issues = evaluateDuplicateParagraphs([
      { route: "/one", content: `<p>${repeated}</p>` },
      { route: "/two", content: `<p>${repeated}</p>` },
      { route: "/three", content: `<p>${repeated}</p>` },
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: "duplicate_long_paragraph",
        severity: "error",
        routes: ["/one", "/three", "/two"],
      }),
    ]);
  });

  it("allows a specifically approved legal disclaimer to repeat", () => {
    const disclaimer =
      "This estimate is for general information only and does not replace a filing-position review using your complete records and the applicable law.";

    const issues = evaluateDuplicateParagraphs(
      [
        { route: "/one", content: `<p>${disclaimer}</p>` },
        { route: "/two", content: `<p>${disclaimer}</p>` },
        { route: "/three", content: `<p>${disclaimer}</p>` },
      ],
      [disclaimer],
    );

    expect(issues).toEqual([]);
  });

  it("reports noun-swapped pages that remain near duplicates", () => {
    const sharedTemplate = [
      "Start by identifying the material decision, collecting the source records, and checking the current official instruction before selecting a filing route.",
      "Compare the first record with the second record, document every material mismatch, and retain the working used to support the final answer.",
      "Pause before submission when the available evidence cannot support the amount, classification, eligibility condition, or requested outcome.",
      "Keep the source instruction, calculation, submitted values, acknowledgement, and any later correction together in the final evidence file.",
    ].join(" ");

    const issues = evaluateNearDuplicateContent([
      { route: "/one", content: sharedTemplate.replaceAll("record", "broker statement") },
      { route: "/two", content: sharedTemplate.replaceAll("record", "bank statement") },
    ]);

    expect(issues).toContainEqual(expect.objectContaining({
      code: "near_duplicate_content",
      severity: "error",
      routes: ["/one", "/two"],
    }));
  });

  it("reports draft quality errors as warnings without weakening publishing checks", () => {
    const issue: ContentQualityIssue = {
      code: "near_duplicate_content",
      severity: "error",
      routes: ["/one", "/two"],
      message: "Drafts remain too similar.",
    };
    const markDraftQualityIssuesAsWarnings = (
      publicContentQuality as unknown as {
        markDraftQualityIssuesAsWarnings?: (issues: ContentQualityIssue[]) => ContentQualityIssue[];
      }
    ).markDraftQualityIssuesAsWarnings;

    expect(markDraftQualityIssuesAsWarnings).toBeTypeOf("function");
    expect(markDraftQualityIssuesAsWarnings?.([issue])).toEqual([
      expect.objectContaining({
        code: "near_duplicate_content",
        severity: "warning",
      }),
    ]);
    expect(issue.severity).toBe("error");
  });

  it("warns when a shorter exact content block is reused across two routes", () => {
    const repeated =
      "Keep the route-specific source record, calculation note, final acknowledgement, and correction evidence together.";

    const issues = evaluateRepeatedLongBlocks([
      { route: "/one", content: `- ${repeated}` },
      { route: "/two", content: `- ${repeated}` },
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: "repeated_long_block",
        severity: "warning",
        routes: ["/one", "/two"],
      }),
    ]);
  });

  it("allows a specifically approved shorter shared block", () => {
    const disclaimer =
      "This estimate is for general information only and does not replace a filing-position review using your complete records and the applicable law.";

    expect(evaluateRepeatedLongBlocks(
      [
        { route: "/one", content: `<p>${disclaimer}</p>` },
        { route: "/two", content: `<p>${disclaimer}</p>` },
      ],
      [disclaimer],
    )).toEqual([]);
  });

  it("reports sentence-length boilerplate repeated across many routes", () => {
    const repeated =
      "Keep the latest copy, match names, dates, and amounts against the official record, and document every unresolved difference before relying on the result.";

    const issues = evaluateRepeatedBoilerplate(
      Array.from({ length: 8 }, (_, index) => ({
        route: `/route-${index + 1}`,
        content: `## Documents\n\n| Record | Why it matters |\n| --- | --- |\n| Bank statement | ${repeated} |`,
      })),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "repeated_boilerplate",
        severity: "error",
      }),
    ]);
  });

  it("reports repeated boilerplate inside minified HTML", () => {
    const repeated =
      "Confirm the exact document list, agreed service scope, applicable filing period, exclusions, and authority-controlled deadlines before work begins.";
    const issues = evaluateRepeatedBoilerplate(
      Array.from({ length: 8 }, (_, index) => ({
        route: `/service-${index + 1}`,
        content: `<main><section><h2>Scope</h2><p>${repeated}</p><ul><li>Route-specific item ${index + 1}</li></ul></section></main>`,
      })),
    );

    expect(issues).toContainEqual(expect.objectContaining({ code: "repeated_boilerplate", severity: "error" }));
  });

  it("reports a reusable table row repeated across an editorial batch", () => {
    const repeated =
      "| Form 26AS | Verify TDS, TCS, tax payments, refunds, and demands against the return working before submission. |";
    const issues = evaluateRepeatedTableRows(
      Array.from({ length: 8 }, (_, index) => ({
        route: `/guide-${index + 1}`,
        content: `| Record | Why it matters |\n| --- | --- |\n${repeated}`,
      })),
    );

    expect(issues).toContainEqual(expect.objectContaining({
      code: "repeated_table_row",
      severity: "error",
    }));
  });

  it("allows a repeated official-source citation row", () => {
    const citation =
      "| Income Tax Department - Income-tax Act, 2025 PDF | [Open source](https://www.incometax.gov.in/example) |";
    const issues = evaluateRepeatedTableRows(
      Array.from({ length: 10 }, (_, index) => ({
        route: `/guide-${index + 1}`,
        content: `| Official reference | Link |\n| --- | --- |\n${citation}`,
      })),
    );

    expect(issues).toEqual([]);
  });

  it("reports sentence-length template copy repeated across three routes", () => {
    const repeated =
      "That note makes it easier to spot a missing document before submission.";

    const issues = evaluateRepeatedSentences([
      { route: "/one", content: `<p>${repeated}</p>` },
      { route: "/two", content: `<p>${repeated}</p>` },
      { route: "/three", content: `<p>${repeated}</p>` },
    ]);

    expect(issues).toEqual([
      expect.objectContaining({
        code: "repeated_sentence",
        severity: "error",
        routes: ["/one", "/three", "/two"],
      }),
    ]);
  });

  it("reports repeated structured-copy fragments hidden inside varied table rows", () => {
    const issues = evaluateRepeatedStructuredFragments(
      Array.from({ length: 8 }, (_, index) => ({
        route: `/route-${index + 1}`,
        content: `| Record ${index + 1} | Check route-specific fact ${index + 1}. Save the checked copy with the final acknowledgement. |`,
      })),
    );

    expect(issues).toContainEqual(expect.objectContaining({
      code: "repeated_structured_fragment",
      severity: "error",
      routes: Array.from({ length: 8 }, (_, index) => `/route-${index + 1}`),
    }));
  });

  it("does not reduce route-specific structured sentences to a repeated trailing clause", () => {
    const issues = evaluateRepeatedStructuredFragments(
      Array.from({ length: 8 }, (_, index) => ({
        route: `/route-${index + 1}`,
        content: `| Record ${index + 1} | For route ${index + 1}, use each record only for the fact it actually contains. |`,
      })),
    );

    expect(issues).toEqual([]);
  });

  it("does not treat repeated source or navigation anchors as editorial copy", () => {
    const issues = evaluateRepeatedStructuredFragments(
      Array.from({ length: 8 }, (_, index) => ({
        route: `/route-${index + 1}`,
        content: `<ul><li><a href="/source-${index + 1}">Income Tax Department filing source open source</a></li></ul>`,
      })),
    );

    expect(issues).toEqual([]);
  });

  it("does not treat source-table labels paired with open-source links as editorial copy", () => {
    const issues = evaluateRepeatedStructuredFragments(
      Array.from({ length: 8 }, (_, index) => ({
        route: `/route-${index + 1}`,
        content: `<table><tr><td>Income Tax Department - Income-tax Act, 2025 PDF</td><td><a href="/source-${index + 1}">Open source</a></td></tr></table>`,
      })),
    );

    expect(issues).toEqual([]);
  });

  it("reports a variable-substitution heading prefix repeated across routes", () => {
    const issues = evaluateRepeatedHeadingPrefixes(
      Array.from({ length: 12 }, (_, index) => ({
        route: `/route-${index + 1}`,
        content: `## Official instructions for route ${index + 1}\n\nCurrent evidence for route ${index + 1}.`,
      })),
    );

    expect(issues).toContainEqual(expect.objectContaining({
      code: "repeated_heading_prefix",
      severity: "error",
    }));
  });

  it("reports a shared six-word prose opening hidden by topic substitution", () => {
    const issues = evaluateRepeatedProseOpenings(
      Array.from({ length: 8 }, (_, index) => ({
        route: `/route-${index + 1}`,
        content: `Identify the reporting treatment and reconcile route ${index + 1} records before selecting the form and preserving the final working.`,
      })),
      [],
      8,
      6,
    );

    expect(issues).toContainEqual(expect.objectContaining({
      code: "repeated_prose_opening",
      severity: "error",
    }));
  });

  it("reports a repeated list-item opening hidden by route-specific endings", () => {
    const issues = evaluateRepeatedListOpenings(
      Array.from({ length: 8 }, (_, index) => ({
        route: `/route-${index + 1}`,
        content: `- Recheck the current instructions on authority page ${index + 1} before filing the route-specific return.`,
      })),
      [],
      8,
      5,
    );

    expect(issues).toContainEqual(expect.objectContaining({
      code: "repeated_list_opening",
      severity: "error",
    }));
  });

  it("rejects official sources that have not been checked recently", () => {
    const issues = evaluatePublicContent({
      context: {
        ...context,
        officialSources: [
          {
            label: "Income Tax Department",
            url: "https://www.incometax.gov.in/",
            checkedAt: "2024-01-01",
          },
        ],
      },
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content:
        "<h2>Review the dates</h2><p>Estimate tax after credits.</p><h2>Keep records</h2><p>Retain the challan.</p>",
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "stale_official_source", severity: "error" }));
  });

  it("rejects an official source that does not support the route topic", () => {
    const issues = evaluatePublicContent({
      context: {
        ...context,
        route: "/calculators/hra",
        pageType: "calculator",
        primaryKeyword: "HRA exemption calculator",
        officialSources: [
          {
            label: "Reserve Bank of India",
            url: "https://www.rbi.org.in/",
            checkedAt: "2026-06-06",
          },
        ],
      },
      title: "HRA exemption calculator",
      description: "Estimate HRA exemption using salary, rent, and city facts before filing.",
      content:
        "<h2>Enter salary facts</h2><p>Use the relevant salary and rent figures.</p><h2>Verify the result</h2><p>Compare the estimate with Form 16 and rent records.</p>",
      internalLinks: ["/services/itr-for-salaried", "/form16-parser"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "irrelevant_official_source",
      severity: "error",
    }));
  });

  it("accepts a route-relevant official authority", () => {
    const issues = evaluatePublicContent({
      context: {
        ...context,
        route: "/services/msme-udyam-registration",
        pageType: "service",
        primaryKeyword: "Udyam registration",
        officialSources: [
          {
            label: "Udyam Registration Portal",
            url: "https://udyamregistration.gov.in/",
            checkedAt: "2026-06-06",
          },
        ],
      },
      title: "Udyam registration assistance",
      description: "Prepare business identity and activity details before using the official Udyam portal.",
      content:
        "<h2>Check eligibility</h2><p>Confirm the enterprise and activity facts.</p><h2>Prepare the record</h2><p>Keep the submitted details and acknowledgement.</p>",
      internalLinks: ["/startup-services", "/services/gst-registration"],
    });

    expect(issues).not.toContainEqual(expect.objectContaining({ code: "irrelevant_official_source" }));
  });

  it("requires official sources for claim-bearing tax learning routes", () => {
    const issues = evaluatePublicContent({
      context: {
        ...context,
        route: "/learn/guide/hra-exemption-claim",
        pageType: "hub",
        officialSources: [],
      },
      title: "HRA Exemption Claim Guide",
      description: "Check HRA eligibility, calculation inputs, and supporting records before claiming an exemption.",
      content:
        "<h2>Check eligibility</h2><p>Review salary and rent facts.</p><h2>Prepare records</h2><p>Keep rent and employer records.</p>",
      internalLinks: ["/calculators/hra", "/services/itr-for-salaried"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "missing_official_sources", severity: "error" }));
  });

  it("requires a dated primary source for first-party help routes", () => {
    const issues = evaluatePublicContent({
      context: {
        ...context,
        route: "/help",
        pageType: "help",
        officialSources: [],
      },
      title: "MyeCA Help",
      description: "Find the right MyeCA support route and prepare a clear case summary.",
      content:
        "<h2>Choose a support topic</h2><p>Identify the account or service issue.</p><h2>Prepare the case</h2><p>Keep the relevant reference.</p>",
      internalLinks: ["/help/faq", "/contact"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "missing_official_sources", severity: "error" }));
  });

  it("accepts a relevant first-party source for first-party help routes", () => {
    const issues = evaluatePublicContent({
      context: {
        ...context,
        route: "/help",
        pageType: "help",
        officialSources: [
          {
            label: "MyeCA terms of service",
            url: "https://myeca.in/legal/terms-of-service",
            checkedAt: "2026-06-08",
          },
        ],
      },
      title: "MyeCA Help",
      description: "Find the right MyeCA support route and prepare a clear case summary.",
      content:
        "<h2>Choose a support topic</h2><p>Identify the account or service issue.</p><h2>Prepare the case</h2><p>Keep the relevant reference.</p>",
      internalLinks: ["/help/faq", "/contact"],
    });

    expect(issues).not.toContainEqual(expect.objectContaining({ code: "missing_official_sources" }));
    expect(issues).not.toContainEqual(expect.objectContaining({ code: "missing_first_party_source" }));
  });

  it("rejects an unrelated external source for a first-party help route", () => {
    const issues = evaluatePublicContent({
      context: {
        ...context,
        route: "/help",
        pageType: "help",
        officialSources: [
          {
            label: "Income Tax Department",
            url: "https://www.incometax.gov.in/",
            checkedAt: "2026-06-08",
          },
        ],
      },
      title: "MyeCA Help",
      description: "Find the right MyeCA support route and prepare a clear case summary.",
      content:
        "<h2>Choose a support topic</h2><p>Identify the account or service issue.</p><h2>Prepare the case</h2><p>Keep the relevant reference.</p>",
      internalLinks: ["/help/faq", "/contact"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "missing_first_party_source", severity: "error" }));
  });

  it("rejects route-inappropriate schema when schema types are supplied", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content:
        "<h2>Review the dates</h2><p>Estimate tax after credits.</p><h2>Keep records</h2><p>Retain the challan.</p>",
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
      schemaTypes: ["Service"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "inappropriate_schema", severity: "error" }));
  });

  it("rejects known generated filler and malformed punctuation", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Decision framework</h2>",
        "<p>For MyeCA readers, this means three things.</p>",
        "<h2>Records</h2>",
        "<p>Start with the records that support challans.; bank entries.; tax estimates..</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
    expect(issues).toContainEqual(expect.objectContaining({ code: "malformed_generated_copy", severity: "error" }));
  });

  it("rejects noun-swapped scheme and persona editorial templates", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Payment-record alignment: evidence map</h2>",
        "<p>The immediate record question is whether the challan belongs to the taxpayer.</p>",
        "<p>Give each record one job. The payment-record alignment should end by naming the record owner, unresolved difference, and next authority action.</p>",
        "<h2>Close the working</h2>",
        "<p>Taxpayers should have one reporting treatment supported by the source records.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "generic_generated_filler",
      severity: "error",
    }));
  });

  it("rejects malformed noun-swapped audience and evidence grammar", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Review the filing evidence</h2>",
        "<p>An completed application does not prove approval. A investors prefilled figure is not evidence for whether the claim is correct.</p>",
        "<h2>Resolve the difference</h2>",
        "<p>Check the ledger for the investors date, amount, counterparty, charges, and classification before filing.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "malformed_generated_copy", severity: "error" }));
  });

  it("rejects excessive repetition of a blog's primary topic phrase", () => {
    const topicPhrase = "PM KISAN";
    const repeatedTopicCopy = Array.from(
      { length: 22 },
      (_, index) => `${topicPhrase} record check ${index + 1} should answer a distinct applicant question before submission.`,
    ).join(" ");
    const issues = evaluatePublicContent({
      context: {
        ...context,
        route: "/blog/pm-kisan-record-checklist",
        primaryKeyword: "PM KISAN eligibility 2026",
      },
      title: "PM-KISAN record checklist",
      description: "Check applicant and payment records before using the live application route.",
      content: `<h2>Check the applicant record</h2><p>${repeatedTopicCopy}</p><h2>Confirm the live route</h2><p>Retain the acknowledgement and authority response.</p>`,
      internalLinks: ["/trust", "/expert-consultation", "/blog"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "excessive_primary_topic_repetition",
      severity: "error",
    }));
  });

  it("allows a primary topic phrase used at a moderate editorial density", () => {
    const topicMentions = Array.from(
      { length: 10 },
      (_, index) => `PM KISAN check ${index + 1} addresses a different applicant, land, payment, or submission question.`,
    ).join(" ");
    const issues = evaluatePublicContent({
      context: {
        ...context,
        route: "/blog/pm-kisan-record-checklist",
        primaryKeyword: "PM KISAN eligibility 2026",
      },
      title: "PM-KISAN record checklist",
      description: "Check applicant and payment records before using the live application route.",
      content: `<h2>Check the applicant record</h2><p>${topicMentions}</p><h2>Confirm the live route</h2><p>${"Retain the authority instruction and acknowledgement. ".repeat(70)}</p>`,
      internalLinks: ["/trust", "/expert-consultation", "/blog", "/services/itr-filing"],
    });

    expect(issues).not.toContainEqual(expect.objectContaining({ code: "excessive_primary_topic_repetition" }));
  });

  it("rejects generic static-route fallback instructions", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Evidence and limits</h2>",
        "<p>The guidance should be checked against the relevant records, applicable period, and any time-sensitive rule before this guidance is used.</p>",
        "<h2>Next action</h2>",
        "<p>The final check should lead to the relevant calculator, filing, service, or official source.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects the generic route metadata fallback", () => {
    const issues = evaluatePublicContent({
      context: { ...context, pageType: "page" },
      title: "Tax loss harvesting",
      description: "Tax Loss Harvesting on MyeCA.in: Indian tax, GST, startup, and compliance guidance with practical next steps.",
      content: [
        "<h2>Review realised losses</h2>",
        "<p>Match broker records to realised gains and eligible losses before considering a transaction.</p>",
        "<h2>Keep tax and investment decisions separate</h2>",
        "<p>Confirm set-off treatment and investment suitability independently.</p>",
      ].join(""),
      internalLinks: ["/calculators/capital-gains", "/blog/capital-gains-trading-income-itr-guide-ay-2026-27"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects machine-facing copy and generated route-name audiences", () => {
    const issues = evaluatePublicContent({
      context: { ...context, audience: ["People in India using Advance Tax Due Dates"] },
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Decision framework</h2>",
        "<p>MyeCA links this route so users and crawlers can follow the complete topical path.</p>",
        "<h2>Comparison</h2>",
        "<p>Where MyeCA should win is the conversion angle.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_audience", severity: "error" }));
    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects mechanically inferred audience labels", () => {
    const issues = evaluatePublicContent({
      context: { ...context, pageType: "calculator", audience: ["People estimating advance tax calculator"] },
      title: "Advance tax calculator",
      description: "Estimate quarterly advance-tax instalments from annual income and tax credits.",
      content: [
        "<h2>Enter the figures</h2>",
        "<p>Add expected annual income and tax already deducted.</p>",
        "<h2>Review the instalments</h2>",
        "<p>Compare the result with payment records before paying.</p>",
      ].join(""),
      internalLinks: ["/services/tax-planning", "/blog/advance-tax-tax-year-2026-27-new-act-checklist"],
      schemaTypes: ["SoftwareApplication"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_audience", severity: "error" }));
  });

  it.each([
    "People using Income Tax Calculator AY 2026-27 | New vs Old Regime | MyeCA.in to test a documented estimate before acting",
    "GST Registration Online India | Document & Filing Support | MyeCA.in is for Indian taxpayers or businesses preparing the required records and deciding whether to proceed",
    "MyeCA users looking for practical support through Contact MyeCA",
    "Prospective MyeCA customers reviewing About MyeCA, operating practices, and trust signals",
  ])("rejects generated full-title audience copy: %s", (audience) => {
    const issues = evaluatePublicContent({
      context: { ...context, pageType: "page", audience: [audience] },
      title: "Public route",
      description: "A route-specific description for the intended user decision.",
      content: [
        "<h2>Check the relevant records</h2>",
        "<p>Use the documents that establish the facts needed for this decision.</p>",
        "<h2>Choose the next action</h2>",
        "<p>Resolve material differences before submitting records or making a payment.</p>",
      ].join(""),
      internalLinks: ["/trust", "/contact"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_audience", severity: "error" }));
  });

  it.each(["both", "individuals", "businesses"])("rejects broad blog audience token: %s", (audience) => {
    const issues = evaluatePublicContent({
      context: { ...context, audience: [audience] },
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Check the instalment dates</h2>",
        "<p>Estimate the remaining liability after tax credits before scheduling a payment.</p>",
        "<h2>Reconcile the challan</h2>",
        "<p>Match the payment reference and amount with the final return working.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing", "/blog", "/trust"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_audience", severity: "error" }));
  });

  it("rejects mechanically generated working-on audiences", () => {
    const issues = evaluatePublicContent({
      context: {
        ...context,
        audience: [
          "Individual taxpayers working on advance tax due dates who need to prepare a supportable AY 2026-27 return position.",
        ],
      },
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Check the instalment dates</h2>",
        "<p>Estimate the remaining liability after tax credits before scheduling a payment.</p>",
        "<h2>Reconcile the challan</h2>",
        "<p>Match the payment reference and amount with the final return working.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_audience", severity: "error" }));
  });

  it.each([
    "Applicants checking PM-KISAN against the programme's current eligibility, document, and follow-up requirements",
    "Freelancers who need to confirm obligations, records, and the next filing action",
    "Founders deciding how marketplace sales affects receipts, expenses, tax credits, and return selection",
  ])("rejects category-level generated audience copy: %s", (audience) => {
    const issues = evaluatePublicContent({
      context: { ...context, audience: [audience] },
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Check the instalment dates</h2>",
        "<p>Estimate the remaining liability after tax credits before scheduling a payment.</p>",
        "<h2>Reconcile the challan</h2>",
        "<p>Match the payment reference and amount with the final return working.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_audience", severity: "error" }));
  });

  it.each([
    "A useful PM-KISAN file lets applicants show which record supports each important answer.",
    "The review covers eligibility, payment records, and the current application route.",
    "Taxpayers should write a short filing conclusion before opening the final return.",
    "Selecting the correct return is the practical question in this return.",
    "## Eligibility review: questions before acting",
    "## Eligibility review: related routes",
  ])("rejects mechanical editorial template copy: %s", (copy) => {
    const issues = evaluatePublicContent({
      context,
      title: "Application and filing records",
      description: "Use current source records to resolve an application or filing decision.",
      content: [
        "<h2>Check the source records</h2>",
        `<p>${copy}</p>`,
        "<h2>Keep the decision traceable</h2>",
        "<p>Retain the source entry, comparison, conclusion, and acknowledgement.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects mojibake left by broken punctuation encoding", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Check the estimate</h2>",
        "<p>Compare the current estimate â€” then retain the payment record.</p>",
        "<h2>Reconcile the challan</h2>",
        "<p>Match the payment reference and amount with the final return working.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "malformed_generated_copy", severity: "error" }));
  });

  it("rejects duplicate key topics in a public content context", () => {
    const issues = evaluatePublicContent({
      context: {
        ...context,
        keyTopics: ["Enter income and tax credits", "Review instalments", "Enter income and tax credits"],
      },
      title: "Advance tax calculator",
      description: "Estimate instalments from expected income and tax credits.",
      content: [
        "<h2>Enter income and credits</h2>",
        "<p>Add expected income and tax already deducted for the financial year.</p>",
        "<h2>Review the estimate</h2>",
        "<p>Compare each instalment with payment records before paying.</p>",
      ].join(""),
      internalLinks: ["/services/tax-planning", "/blog"],
      schemaTypes: ["SoftwareApplication"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "duplicate_key_topic", severity: "error" }));
  });

  it("rejects one route that repeatedly opens prose with the same substituted subject", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Consultant GST and TDS reconciliation",
      description: "Reconcile professional receipts and tax credits before filing.",
      content: [
        "## Reconcile receipts",
        "For independent consultants, GST returns and Form 16A establish the starting figures.",
        "## Explain differences",
        "For independent consultants, a mismatch needs a transaction-level explanation.",
        "## Choose the return",
        "For independent consultants, the reconciled records determine the filing position.",
        "## Retain evidence",
        "For independent consultants, the final working should remain reconstructable.",
      ].join("\n\n"),
      internalLinks: ["/calculators/income-tax", "/services/itr-filing", "/blog", "/trust"],
      schemaTypes: ["Article"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "repetitive_local_prose_opening",
      severity: "error",
    }));
  });

  it("rejects generic evidence-table explanations that fit unrelated records", () => {
    const issues = evaluatePublicContent({
      context,
      title: "eShram registration checklist",
      description: "Check eShram identity and occupation records before registration.",
      content: [
        "## Required records",
        "| Document | Why it matters |",
        "| --- | --- |",
        "| Mobile number | Compare this record with the current official requirements and resolve any inconsistent detail. |",
        "| Bank account | Trace relevant receipts, payments, refunds, or benefit entries and explain unrelated transactions separately. |",
        "## Registration step",
        "Use the verified records on the official eShram portal.",
      ].join("\n"),
      internalLinks: ["/blog", "/trust", "/contact", "/expert-consultation"],
      schemaTypes: ["Article"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "generic_evidence_explanation",
      severity: "error",
    }));
  });

  it("rejects generic crawler fallback section language", () => {
    const issues = evaluatePublicContent({
      context: { ...context, pageType: "page" },
      title: "Tax document scanner",
      description: "Extract tax-document fields before reviewing a return.",
      content: [
        "<h2>Use Tax Document Scanner for the right task</h2>",
        "<p>Review the page before continuing.</p>",
        "<h2>What to verify before acting</h2>",
        "<p>Check your records.</p>",
        "<h2>Move to a documented next step</h2>",
        "<p>Continue to the next page.</p>",
      ].join(""),
      internalLinks: ["/form16-parser", "/itr/form-selector"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects long task phrases repeated throughout a non-blog route", () => {
    const task = "prepare registration documents and first compliance steps";
    const repeated = Array.from(
      { length: 4 },
      (_, index) => `<section><h2>Step ${index + 1}</h2><p>${task} using the records for this filing period and authority.</p></section>`,
    ).join("");

    const issues = evaluatePublicContent({
      context: { ...context, pageType: "service", route: "/services/example" },
      title: "Example registration service",
      description: "Prepare a registration application using the correct records and filing scope.",
      content: repeated,
      internalLinks: ["/services", "/contact"],
      schemaTypes: ["Service"],
    });

    expect(issues.map((item) => item.code)).toContain("repetitive_local_phrase");
  });

  it("rejects variable-substitution FAQ signatures", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Frequently asked questions</h2>",
        "<h3>What should I verify first for advance tax?</h3>",
        "<p>Those records should expose gaps in the estimate before payment.</p>",
        "<h2>Records</h2>",
        "<p>Keep the challan and computation.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects substituted batch-copy signatures and doubled keyword prefixes", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Decision</h2>",
        "<p>The central decision is checking payment records before filing.</p>",
        "<p>For advance tax due dates, For advance tax due dates, open the portal.</p>",
        "<h2>Example</h2>",
        "<p>A taxpayers with advance-tax obligations finds that the records differ. That note matters because payment is due.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects noun-swapped evidence workflow outlines", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "# Advance tax due dates",
        "1. Taxpayers starting evidence: which fact or amount comes from the estimate?",
        "## Taxpayers evidence: estimate and challan",
        "Use the records before payment.",
        "## Taxpayers mismatch: challan versus estimate",
        "Explain the difference.",
        "## Taxpayers pause points: Form 26AS",
        "Pause when the credit is missing.",
        "## Taxpayers example: reconcile estimate and challan",
        "Use the supported amount.",
        "## Taxpayers submission: from estimate to the return",
        "File the supported answer.",
        "## Taxpayers file: retain Form 26AS",
        "Keep the records.",
      ].join("\n\n"),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "noun_swapped_batch_template",
      severity: "error",
    }));
  });

  it("rejects the former AY noun-swapped transaction renderer", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Rebuild the working</h2>",
        "<p>Rebuild the relevant transactions from the challan and ledger.</p>",
        "<p>Settle disagreements before choosing the form and classification.</p>",
        "<p>Label each remaining record by the separate question it answers.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "noun_swapped_batch_template",
      severity: "error",
    }));
  });

  it.each([
    "Advance tax requires a filing position supported by the challan and computation.",
    "Decide the reporting treatment before entering the payment.",
  ])("rejects former AY generated filler: %s", (copy) => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Check the payment record</h2>",
        `<p>${copy}</p>`,
        "<h2>Retain the computation</h2>",
        "<p>Keep the supported amount and payment reference with the return.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it.each([
    "The portal entry is useful only when the reviewer can identify the smallest evidence set.",
    "From the perspective of taxpayers, start with a falsifiable conclusion.",
    "Within the current filing task, read the file from a reviewer perspective.",
    "During scheme follow-up, record the person, period, amount, and fact it establishes.",
    "The authority still controls the decision and timing.",
  ])("rejects synthetic batch-writer language: %s", (copy) => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: `<h2>Check the payment record</h2><p>${copy}</p><h2>Retain the computation</h2><p>Keep the supported amount and payment reference with the return.</p>`,
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it.each([
    "Expense notes changes the return treatment.",
    "Bank details supports the application.",
    "Payment records is the only evidence.",
  ])("rejects plural-subject noun swaps: %s", (copy) => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: `<h2>Check the payment record</h2><p>${copy}</p><h2>Retain the computation</h2><p>Keep the supported amount and payment reference with the return.</p>`,
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "malformed_generated_copy", severity: "error" }));
  });

  it("rejects the public AY persona template even when only one signature remains", () => {
    const issues = evaluatePublicContent({
      context,
      title: "AY 2026-27 ITR guide for architects",
      description: "Reconcile professional receipts, tax credits, and form selection before filing.",
      content: [
        "<h2>Review the professional receipts</h2>",
        "<p>Architects and designers need a return that can be traced back to the records, not merely a plausible prefilled figure.</p>",
        "<h2>Check the filing position</h2>",
        "<p>Compare invoices, Form 16A, GST turnover, and the expense ledger before selecting the return.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing", "/blog", "/trust"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects noun-swapped document and source-check prose", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content: [
        "<h2>Check the filing route</h2>",
        "<p>Confirm the notified AY 2026-27 form and schedule on the income-tax portal before mapping the estimate.</p>",
        "<p>Connect the receipt, payment, or credit trail to Form 26AS while checking advance-tax payments.</p>",
        "<h2>Keep the records</h2>",
        "<p>Trace the relevant amount, date, parties, and activity from the challan into the working for taxpayers.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "noun_swapped_batch_template",
      severity: "error",
    }));
  });

  it("rejects malformed full-title substitutions in questions and openings", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Employer old regime, filing under new regime",
      description: "Understand the tax-regime choice available while filing an income-tax return.",
      content: [
        "<h2>Regime choice</h2>",
        "<p>For i selected old regime with my employer. can i file itr under new regime and get refund?</p>",
        "<h2>Questions</h2>",
        "<h3>When does i selected old regime with my employer need professional review?</h3>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "malformed_generated_copy", severity: "error" }));
  });

  it("rejects gerund substitutions that produce malformed editorial prose", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: [
        "<h2>Prepare the return</h2>",
        "<p>This guide uses challans and Form 26AS to complete checking whether the estimate is accurate.</p>",
        "<p>The filing working should show why confirm the income estimate and how compute the next instalment.</p>",
        "<h2>Resolve the question</h2>",
        "<p>If the checking whether credits match question remains unresolved, review the source records.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "malformed_generated_copy", severity: "error" }));
  });

  it("rejects plural-document and substituted-audience grammar defects", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Consultant TDS reconciliation",
      description: "Reconcile consultant receipts and tax-credit records before filing.",
      content: [
        "## Reconcile receipts",
        "",
        "Independent consultants should deciding the treatment from source records.",
        "Does bank records explain the difference?",
        "Correct independent consultants source data before filing.",
        "PAN and Aadhaar records establishes the starting position.",
        "AIS and Form 26AS explains the difference.",
        "Prescriptions is not a substitute for the corrected record.",
        "Before bank details is relied on, confirm the applicant name.",
        "Review the filing FAQ when property documents does not fit the portal flow.",
        "Property documents should establish ownership; compare it with the sale deed.",
        "Establish the ownership fact that taxpayers with agricultural income requires from the underlying record.",
        "## Keep evidence",
        "",
        "Retain the working and acknowledgement.",
      ].join("\n"),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "malformed_generated_copy", severity: "error" }));
  });

  it("does not join adjacent table cells into a malformed sentence", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Consultant TDS reconciliation",
      description: "Reconcile consultant receipts and tax-credit records before filing.",
      content: [
        "<h2>Reconcile receipts</h2>",
        "<p>Compare each receipt with the related invoice and tax-credit entry before filing.</p>",
        "<table><tbody><tr><td>Receipts</td><td>Supports the amount reported.</td></tr></tbody></table>",
        "<h2>Keep evidence</h2>",
        "<p>Retain the working and acknowledgement with the return records.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).not.toContainEqual(expect.objectContaining({ code: "malformed_generated_copy" }));
  });

  it("rejects headings joined to prose or followed without a Markdown spacer", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: "## Check the estimate\nUse the latest income records before payment.\n\nThe evidence matters.## Keep the challan\n\nRetain the payment proof.",
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "malformed_generated_copy", severity: "error" }));
  });

  it("rejects duplicate section headings within one route", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: "## Check the estimate\n\nUse the current income records.\n\n## Check the estimate\n\nRetain the payment proof.",
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "duplicate_section_heading", severity: "error" }));
  });

  it("rejects a route-specific scaffolding phrase repeated throughout a blog", () => {
    const repeatedPhrase = "land-beneficiary-bank";
    const content = Array.from(
      { length: 12 },
      (_, index) => `The ${repeatedPhrase} records decision ${index + 1} before the applicant submits evidence.`,
    ).join("\n\n");
    const issues = evaluatePublicContent({
      context,
      title: "PM-KISAN record checklist",
      description: "Compare the records needed for a PM-KISAN application.",
      content: `## Check the application\n\n${content}\n\n## Keep the response\n\nRetain the submitted reference.`,
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "excessive_local_scaffolding_phrase",
      severity: "error",
    }));
  });

  it("rejects internal editorial instructions exposed as public copy", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Foreign Asset Filing Guide",
      description: "A practical filing guide.",
      content: "## CA Technical Notes\n\nFor this specific topic, the reviewer should document the working position. The minimum evidence file should include a calculation sheet.",
      internalLinks: ["/services/itr-filing", "/expert-consultation"],
      schemaTypes: ["Article"],
    });

    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "generic_generated_filler", severity: "error" }),
    ]));
  });

  it("rejects internal editorial-process labels exposed as public headings", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: [
        "<h2>CA technical review note</h2>",
        "<p>Record the assessment year and the reason each amount appears in the return.</p>",
        "<h2>Reviewer handoff note</h2>",
        "<p>Send the final computation to the reviewer.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects variable-substitution workflow prose that reads like batch-generated copy", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: [
        "<h2>Prepare the file</h2>",
        "<p>Before starting the advance tax return, write down the intended outcome, relevant period, and the record supporting each material answer.</p>",
        "<p>Which advance tax answer must be corrected, disclosed, or clarified before the return can be completed?</p>",
        "<h2>Keep records</h2>",
        "<p>Keep the advance tax correction trail with the return because an acknowledgement records submission, while the challan and the working note support the underlying answer.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects repeated ITR-season bridge language disguised with route keywords", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: [
        "<h2>Apply the rule</h2>",
        "<p>Read the answer against the facts behind advance tax, challans, and credits.</p>",
        "<p>Apply that rule by completing the payment estimate and checking the result against Form 26AS.</p>",
        "<h2>Evidence</h2>",
        "<p>Use the evidence table and checklist to support the filing position.</p>",
        "<p>In a real advance tax file, follow the same sequence before deciding whether the example's treatment fits.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects noun-swapped transition workflows in HowTo schema steps", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: [
        "<h2>Estimate each instalment</h2>",
        "<p>Refresh the taxable-income estimate before each due date and preserve the challan.</p>",
      ].join(""),
      schemaSteps: [
        "Identify whether advance tax planning affects AY 2026-27 filing, Tax Year 2026-27 compliance, or both.",
        "Read the official source and map the rule to your income head, taxpayer type, and dates.",
      ],
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects the noun-swapped government-scheme article structure", () => {
    const issues = evaluatePublicContent({
      context,
      title: "PM-KISAN document checklist",
      description: "Check PM-KISAN application records before submission.",
      content: [
        "<h2>PM-KISAN: confirm the live route and applicant fit</h2>",
        "<p>Review the current application.</p>",
        "<h2>Bank account conflict: decide before upload</h2>",
        "<p>Resolve the mismatch.</p>",
        "<h2>Mobile number case check: reconstruct the answer</h2>",
        "<p>Trace the answer.</p>",
      ].join(""),
      internalLinks: ["/trust", "/expert-consultation"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "noun_swapped_batch_template", severity: "error" }));
  });

  it("rejects keyword-injected government-scheme table instructions", () => {
    const issues = evaluatePublicContent({
      context,
      title: "PM-KISAN document checklist",
      description: "Check PM-KISAN application records before submission.",
      content: [
        "<h2>Land records</h2>",
        "<p>Save the checked PM-KISAN eligibility 2026 evidence with the final acknowledgement.</p>",
        "<h2>Official source</h2>",
        "<p>Use the current PM-KISAN portal instructions.</p>",
      ].join(""),
      internalLinks: ["/trust", "/expert-consultation"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects variable-substitution calls to action and promotional bridge copy", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: [
        "<h2>Next action</h2>",
        "<p>For this advance tax position, complete the advance tax checks below before using the links below.</p>",
        "<p>These routes help complete the next practical step. MyeCA helps taxpayers organise the filing records.</p>",
        "<h2>Evidence</h2>",
        "<p>Obtain document-based professional help when the records still conflict.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects generic route-selection paragraphs disguised with a topic name", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: [
        "<h2>Choose a route</h2>",
        "<p>Choose the advance tax route that matches the current document and deadline.</p>",
        "<p>For advance tax, the fastest option visible on a portal is not necessarily the correct filing, correction, payment, or response route.</p>",
        "<h2>Keep records</h2>",
        "<p>Retain the challan and computation used for the payment.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects excessive repetition of a multi-word primary keyword", () => {
    const keywordContext: PublicContentContext = {
      ...context,
      primaryKeyword: "advance tax due dates",
    };
    const issues = evaluatePublicContent({
      context: keywordContext,
      title: "Advance Tax Instalment Guide",
      description: "A practical guide to advance-tax instalments and payment records.",
      content: [
        "<h1>Advance Tax Instalment Guide</h1>",
        "<h2>Plan the year</h2>",
        "<p>Advance tax due dates affect the first estimate. Compare advance tax due dates with projected income before paying.</p>",
        "<h2>Reconcile payments</h2>",
        "<p>Record advance tax due dates beside each challan. Recheck advance tax due dates when income changes.</p>",
        "<h2>Close the file</h2>",
        "<p>Use advance tax due dates to review interest exposure, but do not repeat advance tax due dates as filler.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "excessive_primary_keyword_repetition",
      severity: "error",
    }));
  });

  it("rejects dense repetition of a substituted topic label inside one article", () => {
    const repeatedTopic = "trading loss carry forward review";
    const issues = evaluatePublicContent({
      context: {
        ...context,
        route: "/blog/trading-loss-guide",
        primaryKeyword: "F&O loss carry forward AY 2026-27",
      },
      title: "F&O loss carry-forward guide",
      description: "Recalculate turnover and preserve the records supporting an F&O loss.",
      content: [
        "<h1>F&O loss carry-forward guide</h1>",
        "<h2>Recalculate turnover</h2>",
        `<p>${Array.from({ length: 9 }, (_, index) =>
          `${repeatedTopic} item ${index + 1} should be reconciled with the broker tradebook and turnover working before filing.`).join(" ")}</p>`,
        "<h2>Preserve the loss trail</h2>",
        "<p>Keep the broker exports, computation, and filing acknowledgement.</p>",
      ].join(""),
      internalLinks: ["/calculators/income-tax", "/itr/form-selector", "/trust", "/expert-consultation"],
    });

    expect(issues).toContainEqual(expect.objectContaining({
      code: "excessive_repeated_topic_phrase",
      severity: "error",
    }));
  });

  it("allows repeated short filing-period identifiers", () => {
    const issues = evaluatePublicContent({
      context: { ...context, primaryKeyword: "AY 2026-27" },
      title: "Assessment Year 2026-27 Filing Guide",
      description: "Understand the records and deadlines that apply to the current assessment year.",
      content: [
        "<h1>Assessment Year 2026-27 Filing Guide</h1>",
        "<h2>Choose the period</h2>",
        "<p>AY 2026-27 covers the relevant prior-year income. Select AY 2026-27 before opening the return.</p>",
        "<h2>Check records</h2>",
        "<p>Use Form 16 and AIS for AY 2026-27. Keep the AY 2026-27 computation with the filed return.</p>",
        "<h2>Verify filing</h2>",
        "<p>The AY 2026-27 acknowledgement and AY 2026-27 e-verification record belong together.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).not.toContainEqual(expect.objectContaining({ code: "excessive_primary_keyword_repetition" }));
  });

  it("rejects excessive repetition of the full page title in body copy", () => {
    const title = "Can I change tax regime while filing my return?";
    const issues = evaluatePublicContent({
      context,
      title,
      description: "Understand when a taxpayer can change tax regimes while filing.",
      content: [
        `<h1>${title}</h1>`,
        `<h2>Eligibility</h2><p>For "${title}" start with the taxpayer profile.</p>`,
        `<h2>Records</h2><p>The records for "${title}" should support the choice.</p>`,
        `<h2>Next step</h2><p>Escalate "${title}" when business income changes the answer.</p>`,
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "excessive_title_repetition", severity: "error" }));
  });

  it("rejects editorial-process labels in public metadata", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "A Reddit-style answer covering advance-tax instalments.",
      content:
        "<h2>Review dates</h2><p>Estimate the payment.</p><h2>Keep records</h2><p>Retain the challan and computation.</p>",
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects government-scheme substitution templates", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Scheme application checklist",
      description: "Check the current scheme application records before submitting.",
      content: [
        "<h2>Check eligibility</h2>",
        "<p>Is low-cost insurance users currently listed as an eligible applicant group on the official portal?</p>",
        "<h2>Compare records</h2>",
        "<p>Do bank account and nominee details identify the same applicant, activity, or asset?</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing", "/trust", "/blog"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects noun-swapped batch metadata after the body has been rewritten", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Agricultural income disclosure guide",
      description:
        "Agricultural income disclosure guide: reconcile the supporting records, resolve material mismatches, and confirm the notified AY 2026-27 return route.",
      content: [
        "<h2>Connect receipts to land and activity</h2>",
        "<p>Build a crop-wise working from land rights, cultivation records, buyer receipts, quantities, and the bank trail before deciding the disclosure.</p>",
        "<h2>Explain unsupported cash deposits</h2>",
        "<p>Separate sale proceeds from unrelated receipts and retain the evidence used for the final computation.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing", "/trust", "/blog"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects noun-swapped scheme metadata after the body has been rewritten", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Aadhaar update checklist",
      description: "Check identity records and use the current UIDAI update route.",
      content: [
        "<h2>Resolve the identity mismatch first</h2>",
        "<p>Users with identity mismatches should use Aadhaar for applicant identity; address proof must answer its own application question.</p>",
        "<h2>Keep the update acknowledgement</h2>",
        "<p>Retain the accepted identity record and the acknowledgement issued for the requested update.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing", "/trust", "/blog"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects noun-swapped scheme workflow paragraphs", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Aadhaar update checklist",
      description: "Resolve identity-record differences before requesting an Aadhaar update.",
      content: [
        "<h2>Check the current update route</h2>",
        "<p>Users with identity mismatches considering Aadhaar update should begin with the live authority route and their own records, not a copied checklist.</p>",
        "<h2>Assign each record a purpose</h2>",
        "<p>Build the Aadhaar update evidence set around four questions before submitting the request.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing", "/trust", "/blog"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects the former cross-route commercial shell formula", () => {
    const issues = evaluatePublicContent({
      context: { ...context, pageType: "service" },
      title: "GST registration support",
      description: "Prepare GST registration records and filing scope.",
      content: [
        "<h2>Assess the intended result</h2>",
        "<p>Before you prepare registration documents, record assumptions, unresolved differences, and the next action.</p>",
        "<h2>Evidence and limitations</h2>",
        "<p>A material mismatch, missing fact, or changed rule can alter the estimate, filing route, or service scope.</p>",
      ].join(""),
      internalLinks: ["/gst-filing", "/services/company-registration"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects malformed doubled topic lead-ins", () => {
    const issues = evaluatePublicContent({
      context,
      title: "ITR filing records",
      description: "Keep the filing position traceable from source records.",
      content: [
        "<h2>Keep the file traceable</h2>",
        "<p>For AY 2026-27 ITR filing guide, For filing, record the assessment year and each source document.</p>",
        "<h2>Use the supported route</h2>",
        "<p>For AY 2026-27 ITR filing guide, aY 2026-27 filing should use the correct form.</p>",
      ].join(""),
      internalLinks: ["/income-tax-calculator", "/services/itr-filing", "/trust", "/blog"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "malformed_generated_copy", severity: "error" }));
  });

  it("rejects unsupported CA-review claims without a verified reviewer", () => {
    const issues = evaluatePublicContent({
      context: { ...context, reviewer: null },
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify payment records before filing.",
      content:
        "<h2>Review the dates that apply</h2><p>This CA-reviewed guide explains each instalment and the records you should verify before paying.</p>",
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "unsupported_ca_review_claim",
        severity: "error",
      }),
    );
  });

  it("rejects universal CA-review service promises that conflict with plan scope", () => {
    const issues = evaluatePublicContent({
      context: { ...context, pageType: "service", route: "/features/expert-tax-review" },
      title: "Expert tax review",
      description: "Choose an assisted filing plan with documented review scope.",
      content: [
        "<h2>Review before filing</h2>",
        "<p>ITR-1 starts at Rs 499. CA review is included in every plan, not an add-on.</p>",
        "<h2>Upload documents</h2>",
        "<p>Upload your documents and let the scanner do the work. A CA reviews before filing.</p>",
      ].join(""),
      internalLinks: ["/pricing", "/which-itr-form-to-file", "/trust", "/contact"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "generic_generated_filler", severity: "error" }));
  });

  it("rejects an underlinked or severely thin public blog", () => {
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates",
      description: "Plan advance-tax instalments and verify challans before filing.",
      content:
        "<h2>Check whether advance tax applies</h2><p>Estimate tax after credits.</p><h2>Keep records</h2><p>Retain the challan.</p>",
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "thin_visible_content", severity: "error" }),
      expect.objectContaining({ code: "weak_internal_linking", severity: "error" }),
    ]));
  });

  it("rejects a shallow service shell that cannot explain scope, records, and escalation", () => {
    const serviceContext: PublicContentContext = {
      ...context,
      route: "/services/gst-registration",
      pageType: "service",
      audience: ["Businesses checking GST registration applicability and preparing an application"],
      primaryKeyword: "GST registration",
      secondaryKeywords: ["GST registration documents", "GST application support"],
      keyTopics: ["applicability", "application records", "authority queries"],
    };
    const applicationChecks = Array.from(
      { length: 5 },
      (_, index) =>
        `Application check ${index + 1} records one business fact, its supporting document, the responsible person, and the unresolved GST registration question.`,
    ).join(" ");
    const issues = evaluatePublicContent({
      context: serviceContext,
      title: "GST registration support",
      description: "Check GST applicability and prepare registration records before applying.",
      content: [
        "<h2>Check applicability</h2>",
        `<p>${applicationChecks}</p>`,
        "<h2>Prepare the application</h2>",
        "<p>Match promoter, premises, bank, activity, and authorisation records before submission, then retain the application reference and every authority query.</p>",
      ].join(""),
      internalLinks: ["/gst-filing", "/services/company-registration"],
      schemaTypes: ["Service"],
    });

    expect(issues).toContainEqual(expect.objectContaining({ code: "thin_visible_content", severity: "error" }));
  });

  it("rejects generic CA-backed and CA-led review claims in metadata without a verified reviewer", () => {
    const issues = evaluatePublicContent({
      context: { ...context, reviewer: null },
      title: "Advance tax with CA-backed review",
      description: "Prepare records for a CA-led compliance review before paying advance tax.",
      content:
        "<h2>Review the dates that apply</h2><p>Estimate the tax still payable after credits.</p><h2>Keep payment records</h2><p>Retain the challan and computation.</p>",
      internalLinks: ["/income-tax-calculator", "/services/itr-filing"],
    });

    expect(issues).toContainEqual(
      expect.objectContaining({
        code: "unsupported_ca_review_claim",
        severity: "error",
      }),
    );
  });

  it("accepts a complete, approved, evidence-backed blog fixture", () => {
    const evidenceChecks = [
      "maps an income record to its payment date, challan reference, and later filing treatment",
      "traces the estimated liability through tax credits, the instalment calculation, and the retained payment proof",
      "explains which dated working supports the amount paid and how it will be reconciled in the final return",
      "records the source figure, calculation assumption, payment result, and follow-up action for the taxpayer",
    ];
    const evidenceOutcomes = [
      "and leaves a usable trail for the year-end return",
      "before the next instalment or filing decision",
      "without treating a payment acknowledgement as the underlying computation",
      "while preserving the facts that may need correction later",
    ];
    const detailedEvidence = Array.from(
      { length: 26 },
      (_, index) =>
        `Evidence check ${index + 1} ${evidenceChecks[index % evidenceChecks.length]} ${evidenceOutcomes[(index + Math.floor(index / evidenceChecks.length)) % evidenceOutcomes.length]}.`,
    ).join(" ");
    const issues = evaluatePublicContent({
      context,
      title: "Advance tax due dates and payment checks",
      description: "Use the correct advance-tax instalment dates and verify challans before filing.",
      content: [
        "<h2>Check whether advance tax applies</h2>",
        "<p>Estimate the tax still payable after TDS and credits, then compare that amount with the statutory threshold before scheduling an instalment.</p>",
        "<h2>Keep records that support the payment</h2>",
        "<p>Retain the challan, payment reference, computation, and the income records used for the estimate so the final return can be reconciled.</p>",
        `<p>${detailedEvidence}</p>`,
      ].join(""),
      internalLinks: [
        "/income-tax-calculator",
        "/services/itr-filing",
        "/blog/advance-tax-payment-guide",
        "/tax-planning",
      ],
    });

    expect(issues.filter((issue) => issue.severity === "error")).toEqual([]);
  });

  it("keeps hold content out of indexable publishing surfaces", () => {
    expect(shouldIndexPublicContent("hold")).toBe(false);
    expect(shouldIndexPublicContent("needs_revision")).toBe(true);
    expect(shouldIndexPublicContent("approved")).toBe(true);
  });
});

describe("public content structure originality", () => {
  it("rejects the same long heading sequence reused across several routes", () => {
    const content = [
      "## Questions to answer from the records",
      "## Document-by-document review",
      "## Example: when the records disagree",
      "## Risks, limits, and escalation points",
      "## Official sources to check",
      "## Practical next step",
    ].join("\n\n");

    const issues = evaluateRepeatedHeadingSequences(
      Array.from({ length: 5 }, (_, index) => ({
        route: `/guide-${index + 1}`,
        content,
      })),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "repeated_heading_sequence",
        severity: "error",
      }),
    ]);
  });

  it("rejects a generic section heading reused across a large editorial batch", () => {
    const issues = evaluateRepeatedHeadingLabels(
      Array.from({ length: 12 }, (_, index) => ({
        route: `/guide-${index + 1}`,
        content: `## How MyeCA helps\n\nRoute-specific paragraph ${index + 1}.`,
      })),
      ["Frequently asked questions", "Official sources"],
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "repeated_generic_heading",
        severity: "error",
      }),
    ]);
  });

  it("allows a genuine FAQ heading to repeat across routes", () => {
    const issues = evaluateRepeatedHeadingLabels(
      Array.from({ length: 12 }, (_, index) => ({
        route: `/guide-${index + 1}`,
        content: `## Frequently asked questions\n\nRoute-specific answer ${index + 1}.`,
      })),
      ["Frequently asked questions"],
    );

    expect(issues).toEqual([]);
  });

  it("rejects the same generated prose opening reused across a large batch", () => {
    const issues = evaluateRepeatedProseOpenings(
      Array.from({ length: 12 }, (_, index) => ({
        route: `/guide-${index + 1}`,
        content: `Start with the AY 2026-27 return instructions and reconcile route-specific record ${index + 1} before filing.`,
      })),
    );

    expect(issues).toEqual([
      expect.objectContaining({
        code: "repeated_prose_opening",
        severity: "error",
      }),
    ]);
  });
});
