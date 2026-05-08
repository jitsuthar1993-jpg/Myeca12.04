import { itrSeason2026BlogPosts, itrSeason2026Categories } from "./itr-season-2026-content.js";
import { blogTextCoverPath } from "./blog-cover-paths.js";

export type DefaultBlogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type DefaultBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "published";
  categoryId: string;
  coverImage: string | null;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorBio: string;
  seoTitle: string;
  seoDescription: string;
  keyHighlights: string[];
  faqItems: Array<{ question: string; answer: string }>;
  relatedPostIds: string[];
  ctaLabel: string;
  ctaHref: string;
  isFeatured: boolean;
  readingTimeMinutes: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  audience?: "individuals" | "businesses" | "both";
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  sourceLinks?: Array<{ label: string; url: string }>;
  serviceSlug?: string | null;
  calculatorSlug?: string | null;
  canonicalUrl?: string | null;
};

const publishedAt = "2026-04-12T00:00:00.000Z";

export const defaultBlogCategories: DefaultBlogCategory[] = [
  {
    id: "mye-ca-guides",
    name: "MyeCA Guides",
    slug: "mye-ca-guides",
    description: "Practical guides for using MyeCA to file taxes, manage documents, and work with experts.",
  },
  {
    id: "itr-filing",
    name: "ITR Filing",
    slug: "itr-filing",
    description: "Step-by-step income tax return filing guidance for Indian taxpayers.",
  },
  {
    id: "business-compliance",
    name: "Business Compliance",
    slug: "business-compliance",
    description: "GST, registrations, notices, and recurring compliance playbooks for small businesses.",
  },
  {
    id: "tax-planning",
    name: "Tax Planning",
    slug: "tax-planning",
    description: "Year-round tax planning strategies for individuals, founders, and growing businesses.",
  },
  ...itrSeason2026Categories,
];

const incomeTaxSourceLinks = [
  {
    label: "Income Tax Department - Income Tax Returns FAQs",
    url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/%20income%20tax%20returns-faq",
  },
  {
    label: "Income Tax Department - Salaried Individuals AY 2026-27",
    url: "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1",
  },
  {
    label: "Income Tax Department - AIS Guidance",
    url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/annual-information-statement",
  },
];

const gstSourceLinks = [
  {
    label: "GST Portal - Viewing Form GSTR-2B",
    url: "https://tutorial.gst.gov.in/userguide/returns/Manual_gstr2b.htm",
  },
  {
    label: "GST Portal - GSTR-2B FAQs",
    url: "https://tutorial.gst.gov.in/userguide/returns/FAQ_gstr2b.htm",
  },
  {
    label: "GST Portal",
    url: "https://www.gst.gov.in/",
  },
];

function bulletList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function faqQuestionList(items: DefaultBlogPost["faqItems"]) {
  return items.map((item) => `- **${item.question}** ${item.answer}`).join("\n");
}

function markdownTable(headers: string[], rows: string[][]) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function standaloneSourceLinks(categoryId: string) {
  if (categoryId === "business-compliance") return gstSourceLinks;
  return incomeTaxSourceLinks;
}

function keyHighlightsTable(items: string[]) {
  return markdownTable(
    ["Point", "What it means"],
    items.slice(0, 5).map((item, index) => [`${index + 1}`, item]),
  );
}

function guideDocumentRows(categoryId: string) {
  const commonRows = [
    ["Computation or reconciliation note", "Explains how final numbers were derived."],
    ["Portal downloads or acknowledgements", "Proves what was filed, paid, responded to, or verified."],
    ["Working file", "Keeps evidence ready if a CA, auditor, lender, or department notice asks later."],
  ];

  const categoryRows: Record<string, string[][]> = {
    "mye-ca-guides": [
      ["Form 16, AIS, TIS, and Form 26AS", "Core records for salary, reported income, and tax credits."],
      ["Bank, investment, rent, and loan proofs", "Supports deductions, interest income, refund, and review decisions."],
    ],
    "itr-filing": [
      ["ITR form eligibility notes", "Prevents wrong-form filing and defective return risk."],
      ["AIS and Form 26AS reconciliation", "Reduces refund delay and mismatch risk."],
    ],
    "business-compliance": [
      ["GST registration and business proof documents", "Supports registration, amendments, and compliance records."],
      ["Sales, purchase, GSTR-2B, and challan files", "Supports ITC, tax payment, and monthly return review."],
    ],
    "tax-planning": [
      ["Salary, deduction, and investment proofs", "Supports old versus new regime comparison."],
      ["Advance tax and capital gains workings", "Helps avoid interest and year-end surprises."],
    ],
  };

  return [...(categoryRows[categoryId] ?? categoryRows["mye-ca-guides"]), ...commonRows];
}

function routeRows(categoryId: string) {
  if (categoryId === "business-compliance") {
    return [
      ["Before registration", "Confirm turnover, place of supply, ecommerce activity, customer needs, and documents."],
      ["Monthly filing", "Close sales, reconcile purchases, review GSTR-2B, pay tax, file, and archive records."],
      ["Mismatch or notice", "Read the issue, reconcile invoices and returns, then respond through the correct GST route."],
    ];
  }

  return [
    ["Before filing ITR", "Collect records, reconcile AIS/Form 26AS, choose the correct form, and review tax payable or refund."],
    ["After filing but before processing", "Complete e-verification and preserve acknowledgement and computation."],
    ["Mistake or notice found", "Check revised return, rectification, grievance, updated return, or notice response based on the document."],
  ];
}

function standaloneTechnicalNotes(post: DefaultBlogPost) {
  const notes: Record<string, string> = {
    "mye-ca-guides":
      "For MyeCA guide articles, the CA review should verify that the workflow maps to a real filing file: source documents, AIS/Form 26AS reconciliation, ITR form selection, deduction support, computation, review notes, e-verification, and final acknowledgement. The technical file should also show where the taxpayer moved from self-service to assisted review.",
    "itr-filing":
      "For ITR filing articles, the CA review should verify assessment year, filing section, ITR form, residential status, income heads, deductions, TDS/TCS credits, self-assessment tax, refund bank validation, e-verification, and whether any return is original, belated, revised, or updated.",
    "business-compliance":
      "For business compliance articles, the CA review should verify GST registration triggers, turnover, place of supply, tax invoices, ITC support, return frequency, payment challans, notices, reconciliations, and whether income-tax reporting aligns with GST and books.",
    "tax-planning":
      "For tax planning articles, the CA review should verify the old versus new regime comparison, eligible deductions, HRA support, 80C/80D/NPS evidence, advance tax exposure, capital gains, interest income, AIS entries, and whether planning decisions are supported before March-end.",
  };

  return notes[post.categoryId] ?? notes["itr-filing"];
}

function expansionForStandalone(post: DefaultBlogPost) {
  return `

## Key Highlights

${keyHighlightsTable(post.keyHighlights)}

## Why this guide matters

This guide should be read as a practical operating manual, not as a one-time checklist. Tax and compliance work becomes easier when the taxpayer can connect every number in the return, GST filing, notice response, or planning decision to a specific document, statement, calculation, or professional note.

The common thread is evidence. If the evidence is ready, the filing or compliance action becomes predictable. If evidence is scattered, even a technically simple case can create refund delays, notices, ITC gaps, or repeated corrections.

## Documents and records to keep ready

${markdownTable(["Document", "Why it matters"], guideDocumentRows(post.categoryId))}

For individual taxpayers, the core file usually includes Form 16, Form 16A where relevant, AIS, TIS, Form 26AS, bank interest certificates, rent proofs, insurance receipts, home loan certificates, investment proofs, capital gains reports, donation receipts, challans, and the final ITR acknowledgement. For business owners, the file should also include invoices, GST returns, payment challans, purchase records, ITC support, bank statements, payroll records, professional receipts, expense evidence, and any notice communication.

## Step-by-step method

### 1. Identify the exact year or tax period

Confirm the relevant financial year, assessment year, tax year, GST period, return period, or notice period before acting. A correct answer for one period can be wrong for another.

### 2. Build the evidence file

Create a clean folder for the relevant year. Use separate subfolders for income, deductions, taxes paid, investments, business records, notices, and final filing. Prepare a one-page computation note that explains total income, deductions claimed, tax already paid, balance tax or refund, the return or compliance form used, and any special assumptions.

### 3. Reconcile external records

AIS and Form 26AS are not optional background documents for income-tax work; they are department-facing records that often drive processing, refund release, mismatch identification, and notice generation. For GST work, reconcile books, invoices, returns, challans, and GSTR-2B before claiming or defending input tax credit.

### 4. Choose the correct action

${markdownTable(["Situation", "Recommended route"], routeRows(post.categoryId))}

The options are not interchangeable. A missed item may need a revised return if the window is open, rectification if the issue is an apparent processing mistake, an updated return only if law permits it, or a notice response if the department has already raised a communication.

## Practical checklist

${bulletList(post.keyHighlights)}

- Confirm the relevant financial year, assessment year, tax period, or compliance month before acting.
- Keep source documents for every income, deduction, tax credit, invoice, ITC claim, and adjustment.
- Match AIS, TIS, Form 26AS, GST records, bank statements, or business ledgers where relevant.
- Review whether the filing route, form, service, or calculator actually fits the taxpayer's facts.
- Preserve acknowledgements, challans, computation sheets, and professional review notes.
- Recheck the final preview before submission or payment.
- Do not wait for a notice to build the evidence file.

## Common mistakes and risk areas

| Mistake | Why it matters |
| --- | --- |
| Acting from memory | Approximate salary, investment, GST, or bank numbers do not support a defensible filing position. |
| Using only one record | Form 16 may miss bank interest, AIS may contain duplicates, GST returns may not match books, and broker reports may need classification. |
| Choosing the wrong route | Revised return, rectification, updated return, grievance, GST amendment, and notice response solve different problems. |
| Weak documentation | Missing rent proof, investment receipts, broker statements, GST invoices, challans, or portal downloads makes later review harder. |

## Example

Assume a salaried taxpayer is preparing an AY 2026-27 return and also has bank interest and mutual fund redemptions. A rushed filing may use Form 16 only. A stronger filing first checks AIS and Form 26AS, adds interest income, classifies capital gains from the fund statement, compares old and new regime if deductions exist, checks refund bank validation, and then saves the computation and acknowledgement after e-verification.

For a small business, the same discipline means matching sales invoices, purchase invoices, GSTR-2B, cash ledger payments, bank receipts, and return acknowledgements before treating GST filing as complete.

## Common questions this guide answers

${faqQuestionList(post.faqItems)}

These FAQ answers are intentionally short because the detailed filing decision depends on facts. Use the FAQ as a direction marker, then validate the actual return, notice, GST record, or planning decision with the taxpayer's documents.

## When to use MyeCA expert help

Use expert review when the amount is material, the records conflict, a refund is large, a notice has been issued, a return needs correction, GST and income-tax records do not match, or the taxpayer has income from multiple sources. MyeCA support is especially useful where the next action is not obvious: choosing a return form, comparing tax regimes, responding to AIS mismatch, handling a demand, organizing a document vault, reviewing capital gains, or deciding whether business registration or compliance is required.

Expert help should produce a clear action. The output should say what was reviewed, what documents were used, what numbers were accepted, what risks remain, and what the taxpayer should preserve after filing.

## Final operating takeaway

The strongest tax and compliance position is not the one that looks fastest on filing day. It is the one that can be explained later. A taxpayer should be able to answer: why this form, why this income figure, why this deduction, why this tax credit, why this refund or demand, and where is the proof?

## CA Technical Notes

${standaloneTechnicalNotes(post)}

The technical file should end with a concise review note covering the documents checked, the computation method, the filing or compliance route selected, unresolved assumptions, and the next deadline. If the guide is applied to an actual taxpayer, the CA should preserve the calculation sheet, portal downloads, proof index, acknowledgement, and any communication trail. If the case involves a notice, GST mismatch, capital gains, foreign asset, large refund, or return correction, the note should also record the limitation period and the reason the chosen route is better than alternatives.
`;
}

function expandStandaloneBlogPost(post: DefaultBlogPost): DefaultBlogPost {
  const content = `${post.content.trim()}${expansionForStandalone(post)}`;
  const faqItems = post.faqItems.length >= 3
    ? post.faqItems
    : [
        ...post.faqItems,
        {
          question: "Should I keep a separate working file for this topic?",
          answer: "Yes. Keep the computation, source documents, portal downloads, challans, acknowledgements, and review notes together so the position can be explained later.",
        },
      ];

  return {
    ...post,
    content,
    faqItems,
    readingTimeMinutes: Math.max(post.readingTimeMinutes, 8),
    sourceLinks: post.sourceLinks?.length ? post.sourceLinks : standaloneSourceLinks(post.categoryId),
  };
}

const standaloneBlogPosts: DefaultBlogPost[] = [
  {
    id: "mye-ca-complete-tax-filing-playbook",
    title: "The Complete MyeCA Tax Filing Playbook: From Form 16 to Expert Review",
    slug: "mye-ca-complete-tax-filing-playbook",
    excerpt:
      "A full walkthrough of how taxpayers can use MyeCA to collect documents, choose the right ITR form, review deductions, work with a CA, and file with confidence.",
    content: `
# The Complete MyeCA Tax Filing Playbook

Filing an income tax return is not just about entering numbers into a form. A good filing flow should help you understand your income, validate the tax already deducted, claim eligible deductions, avoid mismatches, and keep a clean record for future notices or refunds.

MyeCA is designed around that end-to-end flow. Instead of treating tax filing as a single upload screen, the platform helps you move from document collection to assisted review and final filing in a structured way.

## Who this guide is for

This playbook is useful if you are a salaried taxpayer with Form 16, a freelancer with client TDS, an investor with capital gains, or a taxpayer who wants CA assistance without losing visibility into the filing process.

## Step 1: Collect the right documents

Most filing mistakes happen because the taxpayer starts before the information is complete.

| Document | Why it matters |
| --- | --- |
| Form 16 | Salary breakup, TDS, exemptions, and employer-reported deductions |
| Form 26AS | TDS and TCS credit available against your PAN |
| AIS/TIS | Broader income reporting, including interest, securities, and high-value transactions |
| Bank statements | Interest income, refunds, rent, and business receipts |
| Investment proofs | Section 80C, 80D, NPS, donations, and other deductions |
| Capital gains statements | Equity, mutual fund, property, or crypto gains |

## Step 2: Match the ITR form to your income profile

The form matters because choosing the wrong form can create processing delays or defective return notices. A salary-only taxpayer may use ITR-1, but the same taxpayer may need ITR-2 if there are capital gains, foreign assets, or multiple income categories.

## Step 3: Reconcile TDS before claiming a refund

A refund claim should be backed by clean TDS data. Match employer TDS, bank TDS, freelancer TDS, and Form 26AS before filing. If AIS shows unfamiliar entries, review and document them instead of ignoring them.

## Step 4: Claim deductions with evidence

The best tax-saving return is not the one with the highest deductions. It is the one where each deduction is eligible, documented, and defensible.

Common areas include Section 80C, health insurance under 80D, NPS, HRA, home loan interest, donations, and education loan interest.

## Step 5: Use CA review for higher-risk cases

You should strongly consider assisted review when your return includes capital gains, business income, ESOPs, foreign assets, notice history, large refund claims, or mismatch between AIS and your own records.

## Step 6: Keep a post-filing record

After filing, save the acknowledgement, computation, final ITR copy, tax payment challans, and working notes. These records matter if you receive a notice or need to revise the return.

## Final takeaway

The strongest filing process is calm, documented, and reviewable. MyeCA helps you avoid the last-minute scramble by turning ITR filing into a guided workflow: collect, reconcile, calculate, review, file, and preserve records.
    `,
    status: "published",
    categoryId: "mye-ca-guides",
    coverImage: blogTextCoverPath("mye-ca-complete-tax-filing-playbook"),
    authorId: "mye-ca-editorial",
    authorName: "MyeCA Editorial Team",
    authorRole: "Tax Filing Desk",
    authorBio: "The MyeCA Editorial Team writes practical guides for Indian taxpayers, startups, and small businesses.",
    seoTitle: "Complete MyeCA Tax Filing Playbook",
    seoDescription:
      "Learn how to use MyeCA to file ITR with document collection, TDS reconciliation, deduction review, CA assistance, and post-filing records.",
    keyHighlights: [
      "Start with Form 16, AIS, Form 26AS, bank statements, and investment proofs.",
      "Choose the ITR form based on income profile, not guesswork.",
      "Reconcile TDS before claiming refunds.",
      "Use CA review for capital gains, business income, foreign assets, or large refunds.",
    ],
    faqItems: [
      {
        question: "Can I use MyeCA if I already have Form 16?",
        answer: "Yes. Form 16 is the starting point, but MyeCA also helps review AIS, Form 26AS, deductions, interest income, and other items before filing.",
      },
      {
        question: "When should I choose CA-assisted filing?",
        answer: "Choose assisted filing if you have capital gains, business income, multiple employers, foreign assets, large refunds, or AIS mismatches.",
      },
    ],
    relatedPostIds: ["mye-ca-document-vault-guide", "gst-registration-compliance-roadmap"],
    ctaLabel: "Start Your ITR Filing",
    ctaHref: "/itr/form-selector",
    isFeatured: true,
    readingTimeMinutes: 9,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    tags: ["MyeCA", "ITR filing", "Form 16", "AIS", "CA assisted filing"],
  },
  {
    id: "mye-ca-document-vault-guide",
    title: "How to Build a Tax-Ready Document Vault with MyeCA",
    slug: "mye-ca-document-vault-guide",
    excerpt:
      "A practical system for organizing Form 16, AIS, invoices, bank statements, capital gains reports, GST records, and notice documents before tax season.",
    content: `
# How to Build a Tax-Ready Document Vault with MyeCA

Most tax stress is really document stress. The calculation becomes easier when your documents are complete, named clearly, and grouped by purpose.

MyeCA's document workflow is built to help taxpayers and businesses create a single source of truth for tax filing, CA review, compliance, and notice response.

## Why document organization matters

Income tax and GST filings rely on evidence. If a deduction, credit, or expense is claimed, you should be able to locate the supporting record quickly.

Good document management helps with faster return preparation, better CA review, lower mismatch risk, stronger notice response, and cleaner year-on-year planning.

## The ideal folder structure

Use one folder per financial year and split it into practical groups.

| Folder | What to store |
| --- | --- |
| Salary | Form 16, salary slips, bonus letters, employer declarations |
| Tax credits | Form 26AS, AIS, TIS, TDS certificates |
| Investments | 80C proofs, ELSS statements, PPF, insurance, NPS |
| Bank and interest | Bank statements, FD interest certificates, savings interest |
| Capital gains | Broker P&L, mutual fund statements, property documents |
| Business or freelance | Invoices, expense bills, TDS certificates, contracts |
| GST | GSTR filings, invoices, e-way bills, reconciliation reports |
| Notices | Department notices, responses, challans, acknowledgements |

## Naming convention that saves time

Use this format:

\`FY2025-26_DocumentType_Source_MonthOrYear.pdf\`

Examples include FY2025-26_Form16_ABC-Ltd.pdf, FY2025-26_AIS_Annual.pdf, and FY2025-26_CapitalGains_Zerodha.pdf.

## What to upload before ITR filing

For a salaried taxpayer, upload Form 16 from all employers, AIS, Form 26AS, rent receipts, investment proofs, bank interest certificates, and capital gains reports if investments were sold.

For a freelancer or professional, upload client invoices, bank statements, expense proofs, TDS certificates, GST returns if registered, and tax challans.

## How MyeCA fits into CA-assisted workflows

When documents are uploaded in one place, your CA can review faster and ask sharper questions. Instead of sending scattered files over chat, you can maintain a structured record that stays useful after filing.

## Security habits to follow

Upload only to trusted platforms, avoid unsecured document sharing, remove duplicates after confirming the final file, and keep acknowledgement and computation copies after filing.

## Final takeaway

A tax-ready document vault is not a luxury. It is the foundation for accurate filing and confident compliance. Build it once, update it monthly, and tax season becomes much quieter.
    `,
    status: "published",
    categoryId: "mye-ca-guides",
    coverImage: blogTextCoverPath("mye-ca-document-vault-guide"),
    authorId: "mye-ca-editorial",
    authorName: "MyeCA Editorial Team",
    authorRole: "Document & Compliance Desk",
    authorBio: "The MyeCA Editorial Team writes practical guides for Indian taxpayers, startups, and small businesses.",
    seoTitle: "Build a Tax-Ready Document Vault with MyeCA",
    seoDescription:
      "Organize Form 16, AIS, invoices, bank statements, GST records, and tax notices using a practical MyeCA document vault workflow.",
    keyHighlights: [
      "Use one financial-year folder with clear document categories.",
      "Name files consistently so they are searchable during CA review.",
      "Keep post-filing records such as ITR acknowledgement, computation, and challans.",
    ],
    faqItems: [
      {
        question: "Should I upload AIS and Form 26AS both?",
        answer: "Yes. AIS gives broad reported information, while Form 26AS is important for tax credits. Reviewing both reduces mismatch risk.",
      },
      {
        question: "How long should I keep tax documents?",
        answer: "Keep filing records and supporting documents for multiple years, especially when you claim deductions, capital gains, refunds, or business expenses.",
      },
    ],
    relatedPostIds: ["mye-ca-complete-tax-filing-playbook", "itr-filing-mistakes-to-avoid"],
    ctaLabel: "Open Document Vault",
    ctaHref: "/documents",
    isFeatured: false,
    readingTimeMinutes: 8,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    tags: ["documents", "tax records", "Form 16", "AIS", "MyeCA"],
  },
  {
    id: "itr-filing-mistakes-to-avoid",
    title: "15 ITR Filing Mistakes MyeCA Helps You Avoid",
    slug: "itr-filing-mistakes-to-avoid",
    excerpt:
      "A detailed checklist of common ITR mistakes, from AIS mismatches and wrong forms to missed interest income, incorrect deductions, and refund delays.",
    content: `
# 15 ITR Filing Mistakes MyeCA Helps You Avoid

Income tax filing errors are usually avoidable. They happen because taxpayers rush, rely only on Form 16, ignore AIS, or choose a form without checking their full income profile.

This guide explains the mistakes MyeCA is designed to catch early.

## 1. Choosing the wrong ITR form

ITR-1 is not valid for every salaried person. If you have capital gains, foreign assets, certain high-value income, or multiple house properties, you may need another form.

## 2. Ignoring AIS and TIS

AIS may show interest, securities transactions, dividends, foreign remittances, and other reported data. Ignoring it can create mismatches later.

## 3. Claiming TDS that is not visible in Form 26AS

Your employer or client may have deducted tax, but if it is not correctly deposited or mapped, the credit may not appear. Always reconcile before filing.

## 4. Missing interest income

Savings and FD interest are taxable even when TDS is not deducted. Many taxpayers miss small amounts across multiple accounts.

## 5. Incorrect HRA claim

HRA needs rent, salary structure, city classification, and landlord details. If annual rent crosses the reporting threshold, landlord PAN may be required.

## 6. Duplicate deduction claims

Some investments appear in employer declarations and personal proofs. Claiming twice can distort the return.

## 7. Forgetting previous employer income

If you changed jobs, both employers may have calculated tax independently. You must consolidate salary and TDS.

## 8. Incorrect refund bank account

A refund can fail if the bank account is not pre-validated, inactive, or mapped incorrectly.

## 9. Not reporting capital gains correctly

Equity, mutual funds, property, and crypto need careful classification and date-wise reporting.

## 10. Ignoring advance tax liability

Freelancers, business owners, and investors may need advance tax. Missing it can create interest under Sections 234B and 234C.

## 11. Missing foreign asset reporting

Foreign shares, bank accounts, RSUs, and ESOPs may require specific disclosures. This is a high-risk area.

## 12. Filing without reviewing notices

Past adjustments can affect the current return. If you received a notice, refund adjustment, or demand, review it before filing.

## 13. Waiting until the deadline

Late filing increases mistakes and reduces time for CA review. It can also affect carry-forward of some losses.

## 14. Not saving the final computation

The acknowledgement alone is not enough. Save the final computation, ITR copy, challans, working papers, and supporting documents.

## 15. Not asking for help when facts are complex

Capital gains, business income, foreign assets, and notices are not ideal DIY cases. CA review can prevent expensive corrections.

## Final takeaway

The best ITR filing experience is not only fast. It is complete, reconciled, and easy to defend later.
    `,
    status: "published",
    categoryId: "itr-filing",
    coverImage: blogTextCoverPath("itr-filing-mistakes-to-avoid"),
    authorId: "mye-ca-editorial",
    authorName: "MyeCA Editorial Team",
    authorRole: "ITR Review Desk",
    authorBio: "The MyeCA Editorial Team writes practical guides for Indian taxpayers, startups, and small businesses.",
    seoTitle: "15 ITR Filing Mistakes to Avoid",
    seoDescription:
      "Avoid common ITR filing mistakes with MyeCA's checklist for AIS, TDS, deductions, form selection, capital gains, and refund validation.",
    keyHighlights: [
      "Do not file using Form 16 alone; review AIS and Form 26AS.",
      "Choose the right ITR form based on all income sources.",
      "Check bank account validation before expecting a refund.",
      "Save computation and supporting documents after filing.",
    ],
    faqItems: [
      {
        question: "Can I revise an ITR if I make a mistake?",
        answer: "In many cases, yes, a revised return can be filed within the permitted timeline. However, it is better to review carefully before original filing.",
      },
      {
        question: "Does AIS mismatch always mean my return is wrong?",
        answer: "Not always. AIS can contain duplicates or incorrect entries, but every mismatch should be reviewed and documented before filing.",
      },
    ],
    relatedPostIds: ["mye-ca-complete-tax-filing-playbook", "tax-planning-calendar-for-individuals"],
    ctaLabel: "Check Your ITR Form",
    ctaHref: "/itr/form-selector",
    isFeatured: false,
    readingTimeMinutes: 7,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    tags: ["ITR mistakes", "AIS mismatch", "TDS", "refund", "income tax"],
  },
  {
    id: "gst-registration-compliance-roadmap",
    title: "GST Registration and Monthly Compliance Roadmap for Small Businesses",
    slug: "gst-registration-compliance-roadmap",
    excerpt:
      "A practical GST roadmap for founders, traders, consultants, and service businesses: registration triggers, invoicing, returns, ITC, and ongoing compliance.",
    content: `
# GST Registration and Monthly Compliance Roadmap for Small Businesses

GST compliance is easiest when it is treated as a monthly operating rhythm, not a quarterly panic. Whether you are a trader, consultant, ecommerce seller, agency, or startup, the right process can prevent late fees, input tax credit issues, and customer payment delays.

## When GST registration may be needed

Common triggers include crossing the applicable turnover threshold, interstate supply in certain cases, ecommerce marketplace sales, reverse charge, specific notified business types, or customer and vendor requirements for GST invoices.

Thresholds and rules depend on business type, state, and activity, so registration should be reviewed with context.

## Documents usually needed

| Requirement | Examples |
| --- | --- |
| Identity | PAN, Aadhaar, photo |
| Business proof | Incorporation certificate, partnership deed, shop act, trade license |
| Address proof | Rent agreement, electricity bill, NOC, ownership proof |
| Bank proof | Cancelled cheque or bank statement |
| Authorization | Board resolution, authorization letter, DSC where applicable |

## Monthly compliance rhythm

### Week 1: Close sales data

Finalize all invoices, credit notes, debit notes, and advances. Ensure invoice numbers are continuous and tax rates are correct.

### Week 2: Reconcile purchases

Match vendor invoices with GSTR-2B and purchase records. Follow up with vendors whose invoices are missing.

### Week 3: Review ITC and liability

Check eligible input tax credit, blocked credits, reverse charge, and cash ledger requirements.

### Week 4: File and archive

File returns, save acknowledgements, payment challans, and reconciliation workings.

## Common GST mistakes

Small businesses often claim ITC before vendor reporting, use incorrect HSN or SAC codes, miss credit notes, skip ecommerce reconciliation, mix exempt and taxable supplies, or file returns without preserving working papers.

## How MyeCA can help

MyeCA supports businesses by combining document organization, expert assistance, and compliance tracking. The goal is not only to file GST returns, but to create a monthly system where invoices, ITC, payments, and records stay aligned.

## Final takeaway

GST compliance is a process problem before it is a tax problem. Build the monthly rhythm early and your filings become faster, cleaner, and less risky.
    `,
    status: "published",
    categoryId: "business-compliance",
    coverImage: blogTextCoverPath("gst-registration-compliance-roadmap"),
    authorId: "mye-ca-editorial",
    authorName: "MyeCA Editorial Team",
    authorRole: "GST Compliance Desk",
    authorBio: "The MyeCA Editorial Team writes practical guides for Indian taxpayers, startups, and small businesses.",
    seoTitle: "GST Registration and Compliance Roadmap",
    seoDescription:
      "Learn GST registration triggers, required documents, monthly return workflow, ITC reconciliation, and compliance mistakes small businesses should avoid.",
    keyHighlights: [
      "GST registration depends on turnover, activity, state, and supply model.",
      "Monthly reconciliation of purchases and GSTR-2B helps protect ITC.",
      "Archive returns, challans, and working papers after every filing.",
    ],
    faqItems: [
      {
        question: "Is GST registration mandatory for every small business?",
        answer: "No. It depends on turnover, supply type, state, ecommerce activity, and other GST rules. Some businesses register voluntarily for vendor or customer reasons.",
      },
      {
        question: "Why is GSTR-2B reconciliation important?",
        answer: "It helps confirm whether vendor invoices are reported and whether input tax credit can be claimed safely.",
      },
    ],
    relatedPostIds: ["mye-ca-document-vault-guide", "startup-compliance-first-90-days"],
    ctaLabel: "Explore GST Services",
    ctaHref: "/services/gst-registration",
    isFeatured: false,
    readingTimeMinutes: 8,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    tags: ["GST", "business compliance", "GSTR", "ITC", "small business"],
  },
  {
    id: "tax-planning-calendar-for-individuals",
    title: "A Month-by-Month Tax Planning Calendar for Indian Individuals",
    slug: "tax-planning-calendar-for-individuals",
    excerpt:
      "Plan taxes throughout the year with a practical monthly calendar for salary, deductions, advance tax, capital gains, documents, and ITR filing.",
    content: `
# A Month-by-Month Tax Planning Calendar for Indian Individuals

Tax planning works best when it happens throughout the year. Waiting until March often leads to rushed investments, missed deductions, poor documentation, and avoidable stress.

## April to June: Start clean

Create a folder for the new financial year, review salary structure, estimate annual income, list planned deductions, and check whether advance tax may apply.

## July to September: File and learn

File the previous year's return before the due date, save acknowledgement and computation, and review what caused tax payable or refund. Use those lessons for current-year planning.

## October to December: Reconcile mid-year

Download AIS and Form 26AS, review TDS from salary, bank interest, clients, or investments, and check capital gains from sold assets.

## January to March: Finalize evidence

Complete eligible investments, collect rent receipts, insurance proofs, donation receipts, home loan certificates, and pay advance tax if required.

## Tax planning checklist

| Area | What to review |
| --- | --- |
| Regime choice | Old vs new based on deductions and salary structure |
| 80C | EPF, PPF, ELSS, life insurance, tuition fees, principal repayment |
| 80D | Health insurance and preventive health checkup |
| NPS | Additional deduction and employer contribution |
| HRA | Rent, landlord details, city, salary structure |
| Capital gains | Holding period, loss set-off, statements |
| Interest income | Savings, FD, bonds, and TDS |

## When to ask for expert review

Ask for help if you have a large refund or tax payable, capital gains, foreign assets, freelance income, rental income, or AIS mismatch.

## How MyeCA supports year-round planning

MyeCA is not only for deadline week. You can use it to organize documents, check calculators, evaluate tax regime choice, and prepare for assisted filing before the rush.

## Final takeaway

Tax planning should feel like a monthly habit, not a March emergency. A little structure across the year can reduce tax leakage and make filing much easier.
    `,
    status: "published",
    categoryId: "tax-planning",
    coverImage: blogTextCoverPath("tax-planning-calendar-for-individuals"),
    authorId: "mye-ca-editorial",
    authorName: "MyeCA Editorial Team",
    authorRole: "Tax Planning Desk",
    authorBio: "The MyeCA Editorial Team writes practical guides for Indian taxpayers, startups, and small businesses.",
    seoTitle: "Month-by-Month Tax Planning Calendar India",
    seoDescription:
      "A practical Indian tax planning calendar for individuals covering deductions, advance tax, AIS, capital gains, documents, and ITR filing.",
    keyHighlights: [
      "Start tax planning in April instead of waiting for March.",
      "Use July filing results to improve current-year planning.",
      "Reconcile AIS, Form 26AS, TDS, and capital gains mid-year.",
    ],
    faqItems: [
      {
        question: "When should I choose between old and new tax regime?",
        answer: "Review it early in the year and again before employer declaration or filing. The best choice depends on salary structure and actual deductions.",
      },
      {
        question: "Do salaried people need advance tax?",
        answer: "Sometimes. If income outside salary creates tax liability not covered by TDS, advance tax may apply.",
      },
    ],
    relatedPostIds: ["itr-filing-mistakes-to-avoid", "mye-ca-complete-tax-filing-playbook"],
    ctaLabel: "Try Tax Calculators",
    ctaHref: "/calculators",
    isFeatured: false,
    readingTimeMinutes: 7,
    publishedAt,
    createdAt: publishedAt,
    updatedAt: publishedAt,
    tags: ["tax planning", "old vs new regime", "advance tax", "80C", "AIS"],
  },
];

export const defaultBlogPosts: DefaultBlogPost[] = [
  ...itrSeason2026BlogPosts,
  ...standaloneBlogPosts.map(expandStandaloneBlogPost),
];
