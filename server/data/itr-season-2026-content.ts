import type { DefaultBlogCategory, DefaultBlogPost } from "./default-blog-content.js";
import { blogTextCoverPath } from "./blog-cover-paths.js";

type Audience = "individuals" | "businesses" | "both";

type ItrSeasonPost = DefaultBlogPost & {
  audience: Audience;
  reviewedBy: string;
  reviewedAt: string;
  sourceLinks: Array<{ label: string; url: string }>;
  serviceSlug: string | null;
  calculatorSlug: string | null;
  canonicalUrl: string | null;
};

type TopicSpec = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  categoryId: string;
  tags: string[];
  redditSignal: string;
  shortAnswer: string;
  officialRule: string;
  example: string;
  checklist: string[];
  mistakes: string[];
  faqs: Array<{ question: string; answer: string }>;
  highlights: string[];
  internalLinks: Array<{ label: string; href: string }>;
  seoTitle: string;
  seoDescription: string;
  audience: Audience;
  serviceSlug?: string | null;
  calculatorSlug?: string | null;
};

const publishedAt = "2026-05-05T00:00:00.000Z";
const reviewedAt = "2026-05-05T00:00:00.000Z";

const officialSourceLinks = [
  {
    label: "Income Tax Department - Income Tax Returns FAQs",
    url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/%20income%20tax%20returns-faq",
  },
  {
    label: "Income Tax Department - Salaried Individuals AY 2026-27",
    url: "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1",
  },
  {
    label: "Income Tax Department - Income Tax Act 2025 Transition FAQs",
    url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/objective-and-scope-new-act-faq",
  },
  {
    label: "Income Tax Department - AIS Guidance",
    url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/ais-annual-information-statement",
  },
  {
    label: "Income Tax Department - AIS and Form 26AS FAQs",
    url: "https://www.incometax.gov.in/iec/foportal/sites/default/files/2022-07/Click%20Here_1.pdf",
  },
];

export const itrSeason2026Categories: DefaultBlogCategory[] = [
  {
    id: "income-tax",
    name: "Income Tax",
    slug: "income-tax",
    description: "Income tax slabs, rebates, return rules, and filing-season explainers for Indian taxpayers.",
  },
  {
    id: "tax-regime",
    name: "Tax Regime",
    slug: "tax-regime",
    description: "Old regime, new regime, rebate, deductions, employer declarations, and regime-switching guidance.",
  },
  {
    id: "capital-gains",
    name: "Capital Gains",
    slug: "capital-gains",
    description: "Guides for reporting shares, mutual funds, crypto, F&O, intraday, and trading income in ITR.",
  },
  {
    id: "foreign-assets-nri-tax",
    name: "Foreign Assets & NRI Tax",
    slug: "foreign-assets-nri-tax",
    description: "Schedule FA, Schedule FSI, Schedule TR, foreign tax credit, foreign assets, and NRI filing guidance.",
  },
  {
    id: "refunds-notices",
    name: "Refunds & Notices",
    slug: "refunds-notices",
    description: "Refund tracking, AIS mismatch, e-verification, defective returns, 143(1), and income tax notice guidance.",
  },
  {
    id: "business-freelancers",
    name: "Business & Freelancers",
    slug: "business-freelancers",
    description: "ITR guidance for freelancers, consultants, traders, professionals, and small business owners.",
  },
];

const topics: TopicSpec[] = [
  {
    id: "when-will-itr-filing-start-ay-2026-27",
    title: "When Will ITR Filing Start for AY 2026-27?",
    slug: "when-will-itr-filing-start-ay-2026-27",
    excerpt: "Reddit-style answer to when AY 2026-27 ITR filing opens, why many taxpayers wait for Form 16, AIS, TIS, and Form 26AS, and what to prepare first.",
    categoryId: "itr-filing",
    tags: ["ITR filing start", "AY 2026-27", "Form 16", "AIS", "Form 26AS"],
    redditSignal: "Recent Reddit threads ask whether AY 2026-27 filing is already open and whether salary taxpayers should wait for Form 16 and tax-credit data.",
    shortAnswer: "You should select AY 2026-27 for FY 2025-26 income. Even if utilities open earlier, many salaried taxpayers should wait until Form 16 and updated TDS/AIS data are available so refund claims do not mismatch.",
    officialRule: "The income tax portal requires the correct assessment year and applicable notified ITR form. For FY 2025-26 income, the relevant return is AY 2026-27 under the Income Tax Act, 1961 framework.",
    example: "If your employer issues Form 16 in June 2026 and your bank TDS appears in Form 26AS after TDS returns are processed, filing after those records are visible is usually cleaner than rushing on the first day.",
    checklist: ["Confirm AY 2026-27 on the portal.", "Collect Form 16 or Form 16A.", "Download AIS, TIS, and Form 26AS.", "Check bank account validation before expecting a refund.", "Use the correct ITR form."],
    mistakes: ["Selecting the wrong assessment year.", "Filing before TDS credits are visible.", "Assuming portal prefill is always complete.", "Forgetting e-verification."],
    faqs: [
      { question: "Can I file before Form 16 is issued?", answer: "You can file only if you have complete and reliable salary and TDS data, but most salaried taxpayers should wait for Form 16." },
      { question: "Should I wait until June?", answer: "For salaried taxpayers, waiting until Form 16 and tax-credit data are available often reduces mismatch risk." },
    ],
    highlights: ["Use AY 2026-27 for FY 2025-26 income.", "Wait for complete TDS data if you are claiming refund.", "Filing is not complete until e-verification."],
    internalLinks: [{ label: "Start ITR form selection", href: "/itr/form-selector" }, { label: "Check AIS data", href: "/ais-viewer" }],
    seoTitle: "When ITR Filing Starts AY 2026-27",
    seoDescription: "When AY 2026-27 ITR filing starts, why to wait for Form 16, AIS, and Form 26AS, and what to prepare before filing.",
    audience: "individuals",
  },
  {
    id: "form-16a-ay-2026-27-tds-refund",
    title: "My Form 16A Says AY 2026-27. When Can I Claim My TDS Refund?",
    slug: "form-16a-ay-2026-27-tds-refund",
    excerpt: "If your Form 16A shows AY 2026-27, this guide explains when to file, how to match Form 26AS, and how to claim TDS refund without mismatch.",
    categoryId: "refunds-notices",
    tags: ["Form 16A", "TDS refund", "AY 2026-27", "Form 26AS", "ITR refund"],
    redditSignal: "Taxpayers with bank, contractor, or professional TDS are asking when Form 16A for AY 2026-27 can be used to claim refund.",
    shortAnswer: "Claim the TDS refund by filing the AY 2026-27 ITR after the TDS credit appears in Form 26AS/AIS. Form 16A is useful proof, but the return should match the department's tax-credit records.",
    officialRule: "TDS credit is claimed in the return for the assessment year to which the income belongs. Refund is processed after return filing, validation, and e-verification.",
    example: "If a bank deducted TDS on FD interest during FY 2025-26 and issued Form 16A for AY 2026-27, include the interest income and claim the matching TDS in AY 2026-27.",
    checklist: ["Download Form 16A.", "Match deductor TAN and TDS amount with Form 26AS.", "Report the related income, not only TDS.", "Pre-validate refund bank account.", "E-verify immediately after filing."],
    mistakes: ["Claiming TDS without reporting the income.", "Filing before credit appears.", "Using a closed bank account for refund.", "Ignoring AIS interest income."],
    faqs: [
      { question: "Can I claim refund only using Form 16A?", answer: "No. You file ITR, report the income, and claim TDS credit that should match Form 26AS/AIS." },
      { question: "What if Form 16A and Form 26AS do not match?", answer: "Ask the deductor to correct the TDS return or wait for the credit to reflect before filing." },
    ],
    highlights: ["Form 16A supports refund claims but does not replace ITR.", "TDS must match Form 26AS/AIS.", "Refund needs income reporting plus e-verification."],
    internalLinks: [{ label: "Track TDS refund", href: "/tds-refund-tracker" }, { label: "Talk to a CA", href: "/expert-consultation" }],
    seoTitle: "Form 16A TDS Refund AY 2026-27",
    seoDescription: "How to claim TDS refund from Form 16A for AY 2026-27 by matching Form 26AS, AIS, income, and bank validation.",
    audience: "individuals",
  },
  {
    id: "wait-for-ais-form-26as-before-filing-itr",
    title: "Should I Wait for Form 26AS and AIS to Update Before Filing ITR?",
    slug: "wait-for-ais-form-26as-before-filing-itr-ay-2026-27",
    excerpt: "A practical AY 2026-27 answer to whether you should wait for AIS, TIS, and Form 26AS before filing ITR or claiming refund.",
    categoryId: "refunds-notices",
    tags: ["AIS", "Form 26AS", "TIS", "ITR mismatch", "TDS refund"],
    redditSignal: "Reddit discussions repeatedly warn taxpayers to wait until AIS and Form 26AS are updated, especially where refunds are involved.",
    shortAnswer: "Yes, in most refund or multi-income cases, wait until AIS, TIS, and Form 26AS reflect the correct TDS and income data. Filing too early can cause mismatch, refund delay, or notice risk.",
    officialRule: "The return should disclose all taxable income and claim only valid tax credits. AIS/TIS and Form 26AS are key reconciliation records used before filing.",
    example: "If your employer TDS is visible but bank FD TDS is not yet visible, a refund claim may be short-supported until the bank's TDS return is processed.",
    checklist: ["Download AIS, TIS, and Form 26AS.", "Match salary, bank interest, dividend, securities, and TDS.", "Submit AIS feedback for incorrect items.", "File after credits are visible.", "Keep mismatch notes."],
    mistakes: ["Using only Form 16.", "Ignoring AIS because tax was deducted.", "Claiming refund with missing TDS credit.", "Forgetting small savings interest."],
    faqs: [
      { question: "Is AIS always correct?", answer: "No. AIS can contain incorrect or duplicate information, so review and submit feedback where needed." },
      { question: "Is Form 26AS still important?", answer: "Yes. Form 26AS remains important for TDS/TCS and tax payment credit reconciliation." },
    ],
    highlights: ["AIS is broader than Form 26AS.", "Refund claims should match tax-credit records.", "Wrong AIS entries should be reviewed, not ignored."],
    internalLinks: [{ label: "Open AIS viewer", href: "/ais-viewer" }, { label: "Notice compliance help", href: "/services/notice-compliance" }],
    seoTitle: "Wait for AIS and Form 26AS?",
    seoDescription: "Should you wait for AIS, TIS, and Form 26AS before AY 2026-27 ITR filing? Learn refund and mismatch risks.",
    audience: "both",
    serviceSlug: "notice-compliance",
  },
  {
    id: "employer-old-regime-file-new-regime-refund",
    title: "I Selected Old Regime with My Employer. Can I File ITR Under New Regime and Get Refund?",
    slug: "employer-old-regime-file-new-regime-refund-ay-2026-27",
    excerpt: "If employer TDS was deducted under old regime, this AY 2026-27 guide explains whether salaried taxpayers can choose new regime while filing ITR.",
    categoryId: "tax-regime",
    tags: ["old regime employer", "new regime refund", "salary TDS", "ITR regime switch"],
    redditSignal: "A fresh Reddit question asked whether old-regime employer selection can be changed to new regime while filing to recover excess TDS.",
    shortAnswer: "For many salaried taxpayers without business income, the employer declaration is mainly for TDS estimation. Final tax is computed in the ITR, so you may choose the eligible regime at filing and claim refund if excess TDS was deducted.",
    officialRule: "Employer TDS is an estimate. Final tax liability is determined in the income tax return, subject to regime-switching rules and restrictions for business/profession taxpayers.",
    example: "If your employer deducted TDS assuming old regime deductions were not enough, but the new regime gives lower final tax, the excess TDS can become refundable after you file correctly.",
    checklist: ["Confirm you are not restricted by business/profession income rules.", "Compute tax under both regimes.", "Do not claim old-regime deductions if filing under new regime.", "Match TDS in Form 26AS.", "Claim refund through ITR."],
    mistakes: ["Assuming employer declaration is final.", "Claiming old-regime deductions in new regime.", "Ignoring Form 10-IEA where business/profession rules apply.", "Expecting refund before e-verification."],
    faqs: [
      { question: "Does employer regime selection lock my ITR?", answer: "For many salaried taxpayers, no. Final selection happens in the return, subject to eligibility." },
      { question: "Will excess TDS be refunded?", answer: "If the final return shows lower tax and credits match, refund can be processed after filing and verification." },
    ],
    highlights: ["Employer TDS is not always final regime choice.", "Salaried taxpayers often have filing-time flexibility.", "Do not mix old deductions with new-regime filing."],
    internalLinks: [{ label: "Compare regimes", href: "/calculators/regime-comparator" }, { label: "Start ITR filing", href: "/itr/form-selector" }],
    seoTitle: "Employer Old Regime, File New?",
    seoDescription: "Can salaried taxpayers file new regime in ITR after old-regime employer TDS? AY 2026-27 refund and regime-switch guide.",
    audience: "individuals",
    calculatorSlug: "regime-comparator",
  },
  {
    id: "can-salaried-employees-switch-tax-regime-every-year",
    title: "Can Salaried Employees Switch Between Old and New Tax Regime Every Year?",
    slug: "can-salaried-employees-switch-tax-regime-every-year",
    excerpt: "A clear answer to the common Reddit question on whether salary-only taxpayers can switch regimes each year or at ITR filing.",
    categoryId: "tax-regime",
    tags: ["switch tax regime", "salaried taxpayer", "old vs new regime", "ITR filing"],
    redditSignal: "Multiple Reddit replies discuss whether salaried taxpayers can switch regimes every year and whether employer declaration matters.",
    shortAnswer: "Salary-only taxpayers generally have annual flexibility to choose between old and new regime while filing. Taxpayers with business or profession income face stricter regime-switching rules.",
    officialRule: "Regime choice is subject to the applicable law for the taxpayer's income type. Non-business taxpayers have more flexibility than business/profession taxpayers.",
    example: "A salaried person may declare new regime to the employer for TDS but compare again at filing. A freelancer with professional income should not assume the same unrestricted switching.",
    checklist: ["Identify whether you have business/profession income.", "Compare regimes every filing season.", "Keep deduction proof if choosing old regime.", "Check form and regime option before submission."],
    mistakes: ["Applying salaried flexibility to business income.", "Forgetting employer declaration only affects TDS estimate.", "Not comparing after final income changes.", "Using ITR-U to change regime."],
    faqs: [
      { question: "Can I switch at filing if employer used another regime?", answer: "Many salary-only taxpayers can, subject to eligibility and correct return filing." },
      { question: "Can business taxpayers switch freely?", answer: "No. Business/profession taxpayers should review stricter rules before changing regime." },
    ],
    highlights: ["Salary-only cases usually have more flexibility.", "Business/profession cases need caution.", "Recompute after final Form 16 and AIS data."],
    internalLinks: [{ label: "Regime comparator", href: "/calculators/regime-comparator" }, { label: "Talk to a CA", href: "/expert-consultation" }],
    seoTitle: "Can Salaried Switch Tax Regime?",
    seoDescription: "Can salaried employees switch old and new tax regime every year? AY 2026-27 guide with employer TDS and ITR rules.",
    audience: "individuals",
    calculatorSlug: "regime-comparator",
  },
  {
    id: "new-vs-old-regime-salary-fy-2025-26",
    title: "New Tax Regime vs Old Regime: Which Is Better for Salary Earners in FY 2025-26?",
    slug: "new-vs-old-regime-salary-fy-2025-26",
    excerpt: "A Reddit-question-led salary comparison for FY 2025-26 covering HRA, 80C, 80D, NPS, home loan, and the new regime rebate.",
    categoryId: "tax-regime",
    tags: ["new vs old regime", "salary tax", "FY 2025-26", "HRA", "80C"],
    redditSignal: "Reddit salary threads compare old and new regime using CTC, HRA, 80C, 80D, NPS, home loan, and salary hikes.",
    shortAnswer: "The new regime is often better when deductions are low or moderate. The old regime can still win where HRA, home loan interest, NPS, 80C, 80D, and other eligible deductions are large enough.",
    officialRule: "Taxpayers must compute total income under the chosen regime. The old regime allows more deductions and exemptions; the new regime uses lower slab rates with limited deductions.",
    example: "A taxpayer with high HRA and full deductions may still compare favorably under old regime, while a taxpayer with few deductions often benefits from the new regime.",
    checklist: ["Use actual taxable salary, not only CTC.", "Add HRA, 80C, 80D, NPS, home loan, and donations where eligible.", "Compute both regimes.", "Check final TDS and refund impact."],
    mistakes: ["Comparing CTC instead of taxable income.", "Ignoring HRA calculation.", "Counting deductions not available in new regime.", "Assuming one regime is always better."],
    faqs: [
      { question: "Is old regime useless now?", answer: "No. It can still help taxpayers with substantial eligible deductions and exemptions." },
      { question: "Should I invest only for tax saving?", answer: "No. Compare post-tax returns, liquidity, and financial goals before investing only for deductions." },
    ],
    highlights: ["There is no universal winner.", "HRA is often the deciding old-regime benefit.", "Use final numbers before filing."],
    internalLinks: [{ label: "Compare tax regimes", href: "/calculators/regime-comparator" }, { label: "Income tax calculator", href: "/calculators/income-tax" }],
    seoTitle: "New vs Old Regime for Salary",
    seoDescription: "New vs old tax regime for salary earners in FY 2025-26 with HRA, 80C, 80D, NPS, home loan, and rebate checks.",
    audience: "individuals",
    calculatorSlug: "regime-comparator",
  },
  {
    id: "zero-tax-12-lakh-section-87a-rebate",
    title: "How Does Zero Tax up to Rs 12 Lakh Actually Work Under Section 87A?",
    slug: "zero-tax-12-lakh-section-87a-rebate-ay-2026-27",
    excerpt: "Reddit users keep asking how the Rs 12 lakh zero-tax headline works. This guide explains rebate, taxable income, standard deduction, and exceptions.",
    categoryId: "income-tax",
    tags: ["Section 87A", "zero tax", "Rs 12 lakh", "new tax regime", "rebate"],
    redditSignal: "Reddit discussions show confusion between slab rates, rebate, standard deduction, and whether tax applies only above Rs 12 lakh.",
    shortAnswer: "The zero-tax outcome is generally because eligible resident individuals get rebate against tax when taxable income is within the specified limit. It is not the same as every rupee below Rs 12 lakh being exempt for every taxpayer and every income type.",
    officialRule: "Section 87A rebate reduces tax payable for eligible resident individuals subject to prescribed conditions. Special-rate income and eligibility conditions must be reviewed separately.",
    example: "A salaried taxpayer may have gross salary above Rs 12 lakh but taxable income after standard deduction within the rebate threshold. A taxpayer with special-rate capital gains should calculate separately.",
    checklist: ["Confirm resident individual status.", "Calculate taxable income, not just CTC.", "Separate special-rate income.", "Apply standard deduction where eligible.", "Use a calculator before assuming nil tax."],
    mistakes: ["Calling rebate an exemption.", "Ignoring special-rate income.", "Confusing gross salary and taxable income.", "Assuming tax is only on income above Rs 12 lakh."],
    faqs: [
      { question: "Is Rs 12 lakh fully exempt?", answer: "No. The common zero-tax result comes through rebate, subject to eligibility and income composition." },
      { question: "Does capital gains income get the same rebate treatment?", answer: "Special-rate income should be reviewed carefully and may not behave like normal slab income." },
    ],
    highlights: ["Rebate is not the same as exemption.", "Taxable income matters more than CTC.", "Special-rate income can change the result."],
    internalLinks: [{ label: "Income tax calculator", href: "/calculators/income-tax" }, { label: "Compare regimes", href: "/calculators/regime-comparator" }],
    seoTitle: "Zero Tax up to Rs 12 Lakh",
    seoDescription: "How Section 87A rebate creates zero tax up to Rs 12 lakh for AY 2026-27, with taxable income and special-rate caveats.",
    audience: "individuals",
    calculatorSlug: "income-tax",
  },
  {
    id: "salary-16-lakh-tax-only-extra-4-lakh",
    title: "If Salary Becomes Rs 16 Lakh, Is Tax Only on the Extra Rs 4 Lakh?",
    slug: "salary-16-lakh-tax-only-extra-4-lakh",
    excerpt: "A simple AY 2026-27 explanation of slab taxation, marginal relief, rebate cliff confusion, and why tax is computed on total taxable income.",
    categoryId: "income-tax",
    tags: ["salary tax", "Rs 16 lakh", "slab tax", "marginal relief", "Section 87A"],
    redditSignal: "Reddit users ask whether income above Rs 12 lakh is taxed only on the excess or on the whole taxable income.",
    shortAnswer: "Income tax slab calculation applies across slabs on total taxable income. You do not pay one rate on the entire salary, but once rebate is not available, tax is computed across the applicable slabs, not only on the extra Rs 4 lakh.",
    officialRule: "Tax is computed by applying slab rates to taxable income. Rebate and marginal relief rules, where applicable, are separate from basic slab computation.",
    example: "If taxable income is Rs 16 lakh, tax is computed slab by slab up to Rs 16 lakh. It is not simply tax on Rs 4 lakh above Rs 12 lakh.",
    checklist: ["Start with taxable income after deductions.", "Apply slab rates in order.", "Check rebate eligibility.", "Check marginal relief where applicable.", "Add cess."],
    mistakes: ["Taxing only the amount above Rs 12 lakh.", "Applying the highest rate to all income.", "Ignoring standard deduction.", "Mixing gross salary with taxable income."],
    faqs: [
      { question: "Is tax calculated only on extra income?", answer: "No. Slab tax applies to total taxable income across slabs, subject to rebate or relief rules." },
      { question: "Will a salary hike remove all benefit?", answer: "It can affect rebate eligibility, so calculate final taxable income carefully." },
    ],
    highlights: ["Slab tax is applied progressively.", "Rebate eligibility can change sharply.", "Use taxable income, not salary headline."],
    internalLinks: [{ label: "Calculate income tax", href: "/calculators/income-tax" }, { label: "Ask tax assistant", href: "/tax-assistant" }],
    seoTitle: "Tax on Rs 16 Lakh Salary",
    seoDescription: "If salary becomes Rs 16 lakh, is tax only on extra Rs 4 lakh? Understand slab tax, rebate, and taxable income.",
    audience: "individuals",
    calculatorSlug: "income-tax",
  },
  {
    id: "old-regime-useful-hra-80c-80d-nps-home-loan",
    title: "Is Old Regime Still Useful If I Have HRA, 80C, 80D, NPS, or Home Loan?",
    slug: "old-regime-useful-hra-80c-80d-nps-home-loan",
    excerpt: "A practical answer for salary earners wondering whether old regime still makes sense with HRA, 80C, 80D, NPS, LTA, or home loan interest.",
    categoryId: "tax-regime",
    tags: ["old tax regime", "HRA", "80C", "80D", "NPS", "home loan"],
    redditSignal: "Reddit regime threads often conclude that old regime depends heavily on HRA and large deductions.",
    shortAnswer: "Yes, old regime can still be useful where eligible deductions and exemptions are high. HRA, home loan interest, NPS, 80C, and 80D can materially reduce taxable income.",
    officialRule: "Old regime permits specified deductions and exemptions that are mostly unavailable under the new regime. The benefit depends on actual eligibility and proof.",
    example: "A taxpayer paying high rent in a metro city with full 80C, health insurance, NPS, and home loan interest should compare old regime before defaulting to new.",
    checklist: ["Calculate HRA properly.", "Add 80C, 80D, NPS, home loan interest, LTA, and donations.", "Check proof availability.", "Compare against new-regime tax.", "Preserve documents."],
    mistakes: ["Assuming old regime is dead.", "Claiming HRA without rent proof.", "Over-counting 80C beyond the limit.", "Ignoring new-regime rebate."],
    faqs: [
      { question: "What usually makes old regime better?", answer: "High HRA and substantial eligible deductions are the biggest factors." },
      { question: "Can I claim old-regime deductions without proof?", answer: "You should not. Keep receipts, certificates, rent proof, and investment evidence." },
    ],
    highlights: ["Old regime is not automatically worse.", "HRA can be decisive.", "Proof quality matters."],
    internalLinks: [{ label: "HRA calculator", href: "/calculators/hra" }, { label: "Regime comparator", href: "/calculators/regime-comparator" }],
    seoTitle: "Is Old Tax Regime Still Useful?",
    seoDescription: "Is old tax regime useful with HRA, 80C, 80D, NPS, or home loan? Compare FY 2025-26 salary tax options.",
    audience: "individuals",
    calculatorSlug: "regime-comparator",
  },
  {
    id: "change-tax-regime-using-itr-u",
    title: "Can I Change Tax Regime Using ITR-U?",
    slug: "change-tax-regime-using-itr-u",
    excerpt: "Reddit users ask if ITR-U can fix a wrong regime choice. This guide explains why updated return is not a simple regime-switch tool.",
    categoryId: "refunds-notices",
    tags: ["ITR-U", "updated return", "tax regime change", "old regime", "new regime"],
    redditSignal: "A Reddit thread about changing old to new regime through ITR-U led to demand notice confusion and repeated warnings that ITR-U is restricted.",
    shortAnswer: "Do not treat ITR-U as a free regime-change option. Updated return is mainly for specified cases involving additional income/tax and generally cannot be used to reduce tax or increase refund.",
    officialRule: "Updated return provisions restrict cases that reduce tax liability, increase refund, or increase loss. Regime switching through ITR-U is not the normal correction path.",
    example: "If you filed under old regime and later discover new regime would have reduced tax, ITR-U is generally not the tool to claim that lower tax outcome.",
    checklist: ["Identify whether original return was filed.", "Check if revised return window is still open.", "Confirm whether update increases tax.", "Do not file ITR-U for refund increase.", "Get expert review before responding to demand."],
    mistakes: ["Using ITR-U to reduce tax.", "Assuming rectification fixes regime choice.", "Ignoring demand notice deadlines.", "Changing deductions without checking regime."],
    faqs: [
      { question: "Can ITR-U increase my refund?", answer: "No, updated return is generally not meant to increase refund or reduce tax liability." },
      { question: "What if I am still within revised return time?", answer: "A revised return may be the correct route if allowed and within time. Check facts before filing." },
    ],
    highlights: ["ITR-U is not a refund tool.", "Regime errors need time-limit review.", "Demand notices should be handled carefully."],
    internalLinks: [{ label: "Notice compliance help", href: "/services/notice-compliance" }, { label: "Talk to a CA", href: "/expert-consultation" }],
    seoTitle: "Can I Change Regime Using ITR-U?",
    seoDescription: "Can ITR-U change old or new tax regime? Learn updated return limits, refund restrictions, and AY 2026-27 caution.",
    audience: "both",
    serviceSlug: "notice-compliance",
  },
  {
    id: "demand-notice-after-tax-regime-change",
    title: "Why Did I Get a Demand Notice After Trying to Change Tax Regime?",
    slug: "demand-notice-after-tax-regime-change",
    excerpt: "A post-filing guide to demand notices linked to old/new regime choices, processing differences, deductions, and rectification limits.",
    categoryId: "refunds-notices",
    tags: ["demand notice", "tax regime", "rectification", "143(1)", "ITR-U"],
    redditSignal: "Reddit taxpayers report demand notices after attempted regime changes or mismatched deductions.",
    shortAnswer: "A demand notice can arise if the department computes tax under a different eligible regime, disallows deductions, ignores an invalid regime switch, or finds mismatch in tax credits or return data.",
    officialRule: "Processing intimation and demand must be checked against the filed return, Form 26AS, AIS, challans, and applicable regime rules. Rectification is only for apparent mistakes, not every filing choice.",
    example: "If deductions were claimed but the return was processed under new regime, or a regime option was invalid for the return type, a demand may appear.",
    checklist: ["Download the intimation or demand.", "Compare department computation with your ITR.", "Check regime, deductions, TDS, and challans.", "Identify whether rectification, revised return, or payment is needed.", "Respond before deadline."],
    mistakes: ["Paying without understanding the mismatch.", "Filing rectification for a non-rectifiable choice.", "Ignoring interest in demand.", "Missing response timeline."],
    faqs: [
      { question: "Can rectification remove a demand?", answer: "Only if the demand is due to an apparent mistake or data mismatch that qualifies for rectification." },
      { question: "Should I revise or rectify?", answer: "It depends on time limits and the type of error. Review the notice and filed return first." },
    ],
    highlights: ["Demand notices need computation comparison.", "Regime and deduction mismatch is common.", "Rectification is not a universal fix."],
    internalLinks: [{ label: "Notice compliance service", href: "/services/notice-compliance" }, { label: "AIS viewer", href: "/ais-viewer" }],
    seoTitle: "Demand Notice After Regime Change",
    seoDescription: "Why demand notice appears after tax regime change, with rectification, revised return, TDS, and deduction checks.",
    audience: "both",
    serviceSlug: "notice-compliance",
  },
  {
    id: "itr-form-changes-ay-2026-27",
    title: "What Changed in ITR Forms for AY 2026-27?",
    slug: "itr-form-changes-ay-2026-27",
    excerpt: "Reddit users are asking what is new in AY 2026-27 ITR forms. This guide explains practical form-selection and disclosure changes to watch.",
    categoryId: "itr-filing",
    tags: ["ITR form changes", "AY 2026-27", "ITR-1", "ITR-2", "ITR-3", "ITR-4"],
    redditSignal: "A recent Reddit thread summarized AY 2026-27 ITR form changes and confusion around forms, disclosures, and AIS/Form 26AS mismatch.",
    shortAnswer: "The practical change for taxpayers is to re-check form eligibility instead of relying on last year. Capital gains, business income, foreign assets, and regime-related disclosures can change which ITR form is suitable.",
    officialRule: "ITR forms are notified for each assessment year and must be selected based on taxpayer status and income type. AY 2026-27 forms apply to FY 2025-26 income.",
    example: "A salaried taxpayer who used ITR-1 last year may need ITR-2 this year if they sold mutual funds, received foreign income, or hold foreign assets.",
    checklist: ["Check notified AY 2026-27 form eligibility.", "List income heads.", "Check capital gains and foreign assets.", "Confirm business/profession income treatment.", "Review regime-related fields."],
    mistakes: ["Copying last year's form choice.", "Using ITR-1 after capital gains.", "Ignoring foreign asset schedules.", "Not reconciling AIS."],
    faqs: [
      { question: "Are ITR forms the same every year?", answer: "No. Forms and disclosures can change, so review AY-specific guidance." },
      { question: "What is the safest way to choose?", answer: "Start from income type: salary, house property, capital gains, business/profession, foreign assets, and other sources." },
    ],
    highlights: ["Do not copy last year's form blindly.", "Income mix decides form choice.", "Foreign assets and capital gains are common form changers."],
    internalLinks: [{ label: "ITR form recommender", href: "/itr/form-recommender" }, { label: "Start filing", href: "/itr/form-selector" }],
    seoTitle: "ITR Form Changes AY 2026-27",
    seoDescription: "What changed in ITR forms for AY 2026-27 and how to choose ITR-1, ITR-2, ITR-3, or ITR-4 correctly.",
    audience: "both",
  },
  {
    id: "which-itr-form-salary-capital-gains",
    title: "Which ITR Form Should I File If I Have Salary Plus Capital Gains?",
    slug: "which-itr-form-salary-plus-capital-gains-ay-2026-27",
    excerpt: "If you have salary and sold shares, mutual funds, property, or crypto, this guide explains why ITR-1 may not be enough.",
    categoryId: "capital-gains",
    tags: ["salary capital gains ITR", "ITR-2", "ITR-3", "capital gains", "AY 2026-27"],
    redditSignal: "A recurring Reddit question is whether salary plus investments can still be filed using ITR-1.",
    shortAnswer: "If you have salary plus capital gains and no business/profession income, ITR-2 is commonly applicable. If you also have trading or business income, ITR-3 may be needed.",
    officialRule: "ITR-1 is not for taxpayers with capital gains. ITR-2 covers many non-business capital gains cases, while ITR-3 applies where business/profession income is present.",
    example: "A salaried person who redeemed equity mutual funds in FY 2025-26 should generally move from ITR-1 to ITR-2 for AY 2026-27.",
    checklist: ["Download broker or AMC capital gains report.", "Separate STCG and LTCG.", "Check whether activity is investing or trading.", "Match AIS securities data.", "Select ITR-2 or ITR-3 as applicable."],
    mistakes: ["Using ITR-1 after share sales.", "Ignoring capital losses.", "Treating F&O as simple capital gains.", "Not reporting exempt or low-value gains."],
    faqs: [
      { question: "Does a small capital gain still change the form?", answer: "Yes, even small capital gains can disqualify ITR-1." },
      { question: "What if I have F&O?", answer: "F&O is commonly treated as business income, so ITR-3 may be needed." },
    ],
    highlights: ["Salary plus capital gains usually needs ITR-2.", "Trading income can require ITR-3.", "Report losses on time to preserve benefits."],
    internalLinks: [{ label: "Capital gains calculator", href: "/calculators/capital-gains" }, { label: "Import capital gains", href: "/capital-gains-import" }],
    seoTitle: "ITR Form for Salary and Capital Gains",
    seoDescription: "Which ITR form for salary plus capital gains in AY 2026-27? Compare ITR-2 and ITR-3 for shares and funds.",
    audience: "individuals",
    calculatorSlug: "capital-gains",
  },
  {
    id: "can-i-use-itr-1-if-sold-shares-mutual-funds",
    title: "Can I Use ITR-1 If I Sold Shares or Mutual Funds?",
    slug: "can-i-use-itr-1-if-sold-shares-mutual-funds",
    excerpt: "A direct answer for investors: why selling shares or mutual funds usually means ITR-1 is not the right form.",
    categoryId: "capital-gains",
    tags: ["ITR-1", "sold shares", "mutual fund capital gains", "ITR-2", "Sahaj"],
    redditSignal: "Reddit users often ask if a single mutual fund redemption or stock sale still allows ITR-1.",
    shortAnswer: "No, if you have capital gains from shares or mutual funds, ITR-1 is generally not suitable. Use ITR-2 if there is no business/profession income, or ITR-3 if business income applies.",
    officialRule: "ITR-1 is for simpler eligible income profiles and excludes capital gains. Capital gains require relevant schedules available in other forms.",
    example: "Selling one listed share or redeeming one SIP unit can create capital gains reporting, even if the amount is small.",
    checklist: ["Check whether any redemption or sale happened.", "Get capital gains statement.", "Identify STCG/LTCG.", "Check ITR-2 vs ITR-3.", "Report losses and gains accurately."],
    mistakes: ["Thinking small gains do not matter.", "Ignoring automatic AIS securities entries.", "Using ITR-1 because salary is the main income.", "Missing grandfathering details where relevant."],
    faqs: [
      { question: "What if there is a capital loss?", answer: "Capital loss still needs correct reporting if you want set-off or carry-forward benefit." },
      { question: "What if I only received dividends?", answer: "Dividend alone is different from capital gains, but it still needs income reporting." },
    ],
    highlights: ["Capital gains usually rule out ITR-1.", "Small gains can still need ITR-2.", "AIS may show securities data."],
    internalLinks: [{ label: "Capital gains calculator", href: "/calculators/capital-gains" }, { label: "ITR form selector", href: "/itr/form-selector" }],
    seoTitle: "Can I Use ITR-1 After Selling Shares?",
    seoDescription: "Can you use ITR-1 after selling shares or mutual funds? AY 2026-27 guide to capital gains and ITR-2.",
    audience: "individuals",
    calculatorSlug: "capital-gains",
  },
  {
    id: "fno-intraday-income-capital-gains-or-business",
    title: "I Have F&O or Intraday Trading Income. Is It Capital Gains or Business Income?",
    slug: "fno-intraday-income-capital-gains-or-business",
    excerpt: "A trader-focused AY 2026-27 guide to F&O, intraday, turnover, audit checks, losses, and why ITR-3 is often relevant.",
    categoryId: "business-freelancers",
    tags: ["F&O income", "intraday trading", "business income", "ITR-3", "tax audit"],
    redditSignal: "Reddit questions often confuse delivery investing, intraday speculation, and F&O reporting.",
    shortAnswer: "Intraday and F&O activity is commonly reported as business income, not simple capital gains. Delivery-based investments can still produce capital gains depending on facts.",
    officialRule: "Return form and schedules depend on the nature of income. Business/profession income generally requires business schedules and often ITR-3.",
    example: "A salaried taxpayer with F&O losses may need ITR-3 to report business loss and preserve eligible carry-forward, not ITR-1 or simple ITR-2.",
    checklist: ["Download broker P&L.", "Compute turnover as required.", "Separate delivery, intraday, and F&O.", "Review audit applicability.", "Report expenses and losses correctly."],
    mistakes: ["Reporting F&O in capital gains schedule.", "Ignoring turnover.", "Skipping loss reporting.", "Using ITR-1."],
    faqs: [
      { question: "Is intraday speculative?", answer: "Intraday equity trading is generally treated differently from delivery investing and should be reviewed as trading income." },
      { question: "Can F&O losses be carried forward?", answer: "Eligible losses may be carried forward only if reported correctly and on time." },
    ],
    highlights: ["F&O often means business income reporting.", "Turnover and audit need review.", "Losses should not be ignored."],
    internalLinks: [{ label: "Talk to a CA", href: "/expert-consultation" }, { label: "Capital gains import", href: "/capital-gains-import" }],
    seoTitle: "F&O and Intraday Income in ITR",
    seoDescription: "Is F&O or intraday trading income capital gains or business income? AY 2026-27 ITR-3 and turnover guide.",
    audience: "both",
  },
  {
    id: "can-freelancers-use-itr-4-presumptive-taxation",
    title: "Can Freelancers Use ITR-4 Under Presumptive Taxation?",
    slug: "can-freelancers-use-itr-4-presumptive-taxation",
    excerpt: "A Reddit-style freelancer guide to ITR-4, presumptive taxation, 44ADA, expenses, TDS, foreign clients, and when ITR-3 is safer.",
    categoryId: "business-freelancers",
    tags: ["freelancer ITR", "ITR-4", "presumptive taxation", "44ADA", "professional income"],
    redditSignal: "Questions around writing, consulting, and freelancing often ask whether ITR-4 is allowed or whether income is professional income.",
    shortAnswer: "Freelancers can use ITR-4 only if they meet presumptive taxation conditions. If they maintain regular books, claim actual expenses, have ineligible income, or need complex schedules, ITR-3 may be required.",
    officialRule: "ITR-4 is for eligible presumptive income taxpayers. Professional or business income outside that simplified framework generally needs more detailed reporting.",
    example: "A consultant eligible under presumptive taxation may use ITR-4, but a freelancer with foreign assets, detailed expense claims, or trading income may need ITR-3.",
    checklist: ["Classify income as profession, business, salary, or other sources.", "Check presumptive eligibility.", "Match client TDS.", "Track GST if applicable.", "Review foreign asset schedules."],
    mistakes: ["Using ITR-4 only because it is simpler.", "Ignoring Form 16A TDS.", "Claiming actual expenses under presumptive approach.", "Missing foreign asset reporting."],
    faqs: [
      { question: "Can writers or consultants use presumptive taxation?", answer: "Some professionals may be eligible, but the exact nature of work and limits should be checked." },
      { question: "Do freelancers need Form 16?", answer: "Usually no. They rely on invoices, bank receipts, Form 16A, AIS, and Form 26AS." },
    ],
    highlights: ["ITR-4 is eligibility-based.", "Freelancer TDS must be matched.", "Foreign asset cases can change the form."],
    internalLinks: [{ label: "Advance tax calculator", href: "/calculators/advance-tax" }, { label: "Consult a CA", href: "/expert-consultation" }],
    seoTitle: "Can Freelancers Use ITR-4?",
    seoDescription: "Can freelancers use ITR-4 under presumptive taxation for AY 2026-27? Check 44ADA, TDS, expenses, and ITR-3.",
    audience: "businesses",
    calculatorSlug: "advance-tax",
  },
  {
    id: "foreign-client-income-schedule-fsi",
    title: "Does Foreign Client Income Count as Foreign Income in Schedule FSI?",
    slug: "foreign-client-income-schedule-fsi",
    excerpt: "A practical guide for Indian freelancers working with overseas clients: foreign client receipts, Schedule FSI, business income, and foreign tax credit.",
    categoryId: "foreign-assets-nri-tax",
    tags: ["foreign client income", "Schedule FSI", "freelancer foreign income", "DTAA", "Form 67"],
    redditSignal: "Recent Reddit mini-guides clarify that services performed from India for foreign clients are not automatically Schedule FSI foreign-source income.",
    shortAnswer: "Money from a foreign client is not automatically foreign-source income for Schedule FSI. If services are performed from India, it is often Indian business/professional income, though foreign tax withholding or foreign assets may create separate reporting.",
    officialRule: "Income classification depends on source, residence, place of work, treaty rules, and tax paid abroad. Schedule FSI is used for foreign-source income details and relief claims.",
    example: "An Indian resident freelancer coding from Bengaluru for a US client usually reports professional receipts as business/profession income, not simply Schedule FSI foreign income.",
    checklist: ["Identify where services were performed.", "Check whether foreign tax was withheld.", "Review DTAA and Form 67 if claiming credit.", "Check foreign bank or platform accounts.", "Report receipts in business/profession income."],
    mistakes: ["Treating every foreign payment as Schedule FSI.", "Missing Form 67 where foreign tax credit is claimed.", "Ignoring foreign bank account Schedule FA.", "Not tracking exchange rates."],
    faqs: [
      { question: "Does foreign client payment mean foreign income?", answer: "Not always. If work is performed in India, classification may be business/profession income in India." },
      { question: "What if foreign tax was deducted?", answer: "You may need to examine foreign tax credit, Schedule TR, and Form 67." },
    ],
    highlights: ["Foreign client does not automatically mean Schedule FSI.", "Foreign tax credit needs separate compliance.", "Foreign accounts can trigger Schedule FA."],
    internalLinks: [{ label: "Consult a CA", href: "/expert-consultation" }, { label: "Advance tax calculator", href: "/calculators/advance-tax" }],
    seoTitle: "Foreign Client Income and Schedule FSI",
    seoDescription: "Does foreign client income count as foreign income in Schedule FSI? AY 2026-27 guide for freelancers and Form 67.",
    audience: "businesses",
  },
  {
    id: "freelancers-foreign-clients-schedule-fa",
    title: "Do Freelancers with Foreign Clients Need Schedule FA?",
    slug: "freelancers-foreign-clients-schedule-fa",
    excerpt: "Foreign clients alone may not trigger Schedule FA, but foreign bank accounts, Payoneer/Wise balances, RSUs, or broker accounts can.",
    categoryId: "foreign-assets-nri-tax",
    tags: ["Schedule FA", "foreign clients", "freelancer", "foreign bank account", "ITR-3"],
    redditSignal: "Reddit Schedule FA threads warn freelancers to disclose foreign accounts and assets where applicable, not merely foreign client invoices.",
    shortAnswer: "Foreign clients by themselves do not create Schedule FA. But if you are a resident and ordinarily resident with foreign bank accounts, foreign broker accounts, RSUs, ESPP, or other foreign assets, Schedule FA may apply.",
    officialRule: "Schedule FA is about reporting foreign assets and accounts for applicable residents. It is separate from ordinary income reporting.",
    example: "A freelancer paid by a US client into an Indian bank account may not have Schedule FA only for that payment. A freelancer holding funds in a foreign account or foreign broker account should review Schedule FA.",
    checklist: ["Check residential status.", "List foreign accounts and platforms.", "Identify foreign shares, RSUs, ESPP, or brokerage.", "Gather peak and closing values.", "Use ITR-2 or ITR-3 where schedules are available."],
    mistakes: ["Assuming foreign client equals Schedule FA.", "Ignoring foreign payment accounts.", "Using ITR-4 despite foreign asset schedules.", "Mixing FY and calendar-year reporting."],
    faqs: [
      { question: "Does Payoneer or Wise count?", answer: "Foreign payment accounts should be reviewed carefully for Schedule FA disclosure depending on account structure and facts." },
      { question: "Can I use ITR-4 with Schedule FA?", answer: "Schedule availability and form eligibility must be checked; foreign assets often push taxpayers to ITR-2 or ITR-3." },
    ],
    highlights: ["Schedule FA reports assets, not merely clients.", "Foreign accounts need careful review.", "Resident status matters first."],
    internalLinks: [{ label: "ITR form recommender", href: "/itr/form-recommender" }, { label: "Talk to a CA", href: "/expert-consultation" }],
    seoTitle: "Foreign Clients and Schedule FA",
    seoDescription: "Do freelancers with foreign clients need Schedule FA? Learn foreign account, RSU, broker, and ITR-3 reporting rules.",
    audience: "businesses",
  },
  {
    id: "received-foreign-asset-email-revise-itr",
    title: "I Received a Foreign Asset Email. Do I Need to Revise My ITR?",
    slug: "received-foreign-asset-email-revise-itr",
    excerpt: "If the Income Tax Department flags possible foreign assets or income, this guide explains when revision, response, or expert review is needed.",
    categoryId: "foreign-assets-nri-tax",
    tags: ["foreign asset email", "Schedule FA notice", "revise ITR", "foreign income", "Black Money Act"],
    redditSignal: "Reddit users report emails about missed foreign assets and ask whether small balances, inactive accounts, or post-residency income require revision.",
    shortAnswer: "Do not ignore a foreign asset email. First check residential status, whether you held foreign assets during the relevant calendar year, and whether the return can still be revised. Get expert review if Schedule FA was missed.",
    officialRule: "Applicable residents must disclose foreign assets in the relevant ITR schedules. Foreign asset non-disclosure can have serious consequences beyond normal income tax adjustments.",
    example: "If you became resident during FY 2025-26 and held an active foreign bank account or RSUs during the relevant calendar year, Schedule FA analysis may be needed even if income was small.",
    checklist: ["Read the email carefully.", "Confirm year and asset type.", "Check residential status.", "Review whether revised return is still possible.", "Prepare account and valuation details."],
    mistakes: ["Ignoring small foreign accounts.", "Assuming inactive means non-reportable.", "Using ITR-U without checking restrictions.", "Replying without documents."],
    faqs: [
      { question: "Does small foreign income matter?", answer: "Foreign asset disclosure is not only about income size. Asset holding itself can matter." },
      { question: "Can I revise my return?", answer: "If the revised return window is open and facts require correction, revision may be appropriate. Check deadlines." },
    ],
    highlights: ["Foreign asset emails should be taken seriously.", "Residential status is the first filter.", "Schedule FA omissions need expert review."],
    internalLinks: [{ label: "Notice compliance service", href: "/services/notice-compliance" }, { label: "Talk to a CA", href: "/expert-consultation" }],
    seoTitle: "Foreign Asset Email: Revise ITR?",
    seoDescription: "Received a foreign asset email from Income Tax Department? Learn Schedule FA, revision, resident status, and response steps.",
    audience: "individuals",
    serviceSlug: "notice-compliance",
  },
  {
    id: "schedule-fa-foreign-bank-rsu-espp-us-stocks",
    title: "What Goes into Schedule FA for Foreign Bank Accounts, RSUs, ESPP, and US Stocks?",
    slug: "schedule-fa-foreign-bank-rsu-espp-us-stocks",
    excerpt: "An in-depth Schedule FA checklist for foreign bank accounts, foreign broker accounts, vested RSUs, ESPP shares, and overseas investments.",
    categoryId: "foreign-assets-nri-tax",
    tags: ["Schedule FA", "RSU", "ESPP", "US stocks", "foreign bank account"],
    redditSignal: "Popular Reddit foreign-asset threads list practical Schedule FA items like foreign bank accounts, broker accounts, RSUs, ESPP, and US stocks.",
    shortAnswer: "Schedule FA can cover foreign bank/depository accounts, custodial or brokerage accounts, foreign equity, RSUs/ESPP shares, financial interests, immovable property, signing authority, and income from foreign assets.",
    officialRule: "Applicable residents must report specified foreign assets and accounts in Schedule FA using the required tables and valuation fields.",
    example: "Vested US RSUs held in a foreign broker account usually need analysis for foreign equity and depository/custodial account reporting, even if not sold.",
    checklist: ["List every foreign account.", "List vested shares, RSUs, ESPP, and ETFs.", "Capture acquisition, peak, and closing values where required.", "Collect country, institution, account, and income details.", "Use correct ITR form."],
    mistakes: ["Reporting only sold assets.", "Missing dormant accounts.", "Ignoring vested but unsold RSUs.", "Using financial year instead of calendar-year data where Schedule FA asks calendar-year values."],
    faqs: [
      { question: "Do unsold RSUs need disclosure?", answer: "They may, if vested and held as foreign assets by an applicable resident taxpayer." },
      { question: "Do foreign broker accounts count?", answer: "Foreign brokerage/depository/custodial accounts should be reviewed for Schedule FA reporting." },
    ],
    highlights: ["Schedule FA is asset disclosure, not only income reporting.", "Vested foreign shares can matter even without sale.", "Dormant accounts should be reviewed."],
    internalLinks: [{ label: "Consult a CA", href: "/expert-consultation" }, { label: "ITR form selector", href: "/itr/form-selector" }],
    seoTitle: "Schedule FA for RSUs and US Stocks",
    seoDescription: "What to report in Schedule FA for foreign bank accounts, RSUs, ESPP, US stocks, ETFs, and broker accounts.",
    audience: "individuals",
  },
  {
    id: "schedule-fa-calendar-year-or-financial-year",
    title: "Is Schedule FA Based on Calendar Year or Financial Year?",
    slug: "schedule-fa-calendar-year-or-financial-year",
    excerpt: "A common Reddit confusion: Schedule FA uses calendar-year style reporting for many foreign asset tables, not the normal April-March financial year.",
    categoryId: "foreign-assets-nri-tax",
    tags: ["Schedule FA calendar year", "foreign assets", "ITR", "AY 2026-27"],
    redditSignal: "Recent Reddit Schedule FA posts emphasize that taxpayers should not use April-March values for tables requiring calendar-year reporting.",
    shortAnswer: "For many Schedule FA foreign asset disclosures, use the relevant calendar-year period and values required by the schedule, not the normal April-March financial year approach.",
    officialRule: "Schedule FA requires specific reporting fields and periods. Taxpayers must follow the ITR utility instructions for the relevant assessment year.",
    example: "For AY 2026-27, a Schedule FA table may ask for foreign asset details over the relevant calendar year. Do not automatically use FY 2025-26 values for every field.",
    checklist: ["Read the exact Schedule FA table.", "Identify the requested reporting period.", "Collect calendar-year statements.", "Map acquisition, peak, and closing values.", "Keep exchange-rate workings."],
    mistakes: ["Using April-March values everywhere.", "Taking only year-end value.", "Ignoring peak value requirement.", "Not preserving source statements."],
    faqs: [
      { question: "Why is Schedule FA different?", answer: "Foreign asset reporting follows specific disclosure fields that may not align with the Indian financial year." },
      { question: "Should I use calendar-year broker statements?", answer: "Often yes, where the table asks for calendar-year information." },
    ],
    highlights: ["Schedule FA period can differ from FY.", "Read each table before calculating.", "Keep calendar-year statements."],
    internalLinks: [{ label: "Talk to a CA", href: "/expert-consultation" }, { label: "ITR form recommender", href: "/itr/form-recommender" }],
    seoTitle: "Schedule FA Calendar Year Guide",
    seoDescription: "Is Schedule FA based on calendar year or financial year? AY 2026-27 guide for foreign asset reporting periods.",
    audience: "individuals",
  },
  {
    id: "calculate-foreign-asset-values-sbi-tt-buying-rate",
    title: "How to Calculate Foreign Asset Values Using SBI TT Buying Rate",
    slug: "calculate-foreign-asset-values-sbi-tt-buying-rate",
    excerpt: "A Schedule FA valuation guide for foreign shares, RSUs, ESPP, broker accounts, and bank balances using exchange-rate workings.",
    categoryId: "foreign-assets-nri-tax",
    tags: ["SBI TT buying rate", "Schedule FA valuation", "foreign shares", "RSU", "foreign assets"],
    redditSignal: "Reddit users describe Schedule FA as tedious because it needs foreign prices and SBI TT buying rate conversions for multiple dates.",
    shortAnswer: "Foreign asset values should be converted into INR using the prescribed exchange-rate approach required by the ITR schedule or instructions. For many Schedule FA workings, taxpayers track acquisition, peak, and closing values with supporting rate evidence.",
    officialRule: "ITR schedules and instructions prescribe the details and values to report. Use the relevant exchange-rate method consistently and preserve workings.",
    example: "For foreign shares, you may need acquisition value on vest/purchase date, peak value on the highest-value date, and closing value at calendar year end, converted into INR.",
    checklist: ["Download foreign broker statement.", "Identify acquisition, peak, and closing dates.", "Collect market value on each date.", "Collect exchange-rate evidence.", "Maintain a working sheet."],
    mistakes: ["Using one average rate for all dates.", "Ignoring peak balance.", "Using sale-date values for unsold assets.", "Not keeping exchange-rate proof."],
    faqs: [
      { question: "Do I need exact rates?", answer: "Use the rate method required by the schedule/instructions and keep supporting evidence for each reported value." },
      { question: "Can a CA prepare this?", answer: "Yes. Foreign asset valuation is a good candidate for CA review because errors can be costly." },
    ],
    highlights: ["Foreign valuation is date-specific.", "Peak and closing values may differ.", "Preserve every calculation."],
    internalLinks: [{ label: "Consult a CA", href: "/expert-consultation" }, { label: "Document vault", href: "/documents" }],
    seoTitle: "SBI TT Buying Rate for Schedule FA",
    seoDescription: "How to calculate Schedule FA foreign asset values using SBI TT buying rate concepts, peak value, closing value, and cost.",
    audience: "individuals",
  },
  {
    id: "form-67-foreign-tax-credit",
    title: "What Is Form 67 and When Is It Needed for Foreign Tax Credit?",
    slug: "form-67-foreign-tax-credit",
    excerpt: "A guide for taxpayers who paid tax abroad and want credit in Indian ITR using Form 67, Schedule FSI, and Schedule TR.",
    categoryId: "foreign-assets-nri-tax",
    tags: ["Form 67", "foreign tax credit", "Schedule TR", "Schedule FSI", "DTAA"],
    redditSignal: "Recent Reddit posts discuss foreign tax paid abroad, Schedule TR, and Form 67 as the route to claim foreign tax credit in India.",
    shortAnswer: "Form 67 is generally required when claiming foreign tax credit in India for tax paid in another country. It should be prepared with foreign income, foreign tax proof, treaty details, and the relevant ITR schedules.",
    officialRule: "Foreign tax credit claims require prescribed forms, schedules, and supporting evidence. Timing and completeness matter.",
    example: "If foreign dividends had tax withheld abroad and the income is taxable in India, you may need Schedule FSI/TR and Form 67 to claim credit, subject to DTAA rules.",
    checklist: ["Identify foreign-source income.", "Collect foreign tax proof.", "Check DTAA article.", "Prepare Schedule FSI and TR.", "File Form 67 as required."],
    mistakes: ["Claiming credit without Form 67.", "Confusing foreign client receipts with foreign-source income.", "Missing country-wise details.", "Not matching income in ITR."],
    faqs: [
      { question: "Is Form 67 needed for every foreign payment?", answer: "No. It is relevant when claiming foreign tax credit for foreign tax paid, not every foreign receipt." },
      { question: "Can I claim credit if tax was withheld abroad?", answer: "Possibly, if income is taxable in India and documentation and treaty conditions are met." },
    ],
    highlights: ["Form 67 supports foreign tax credit.", "Schedule FSI/TR details should match.", "DTAA review is important."],
    internalLinks: [{ label: "Talk to a CA", href: "/expert-consultation" }, { label: "ITR filing", href: "/itr/form-selector" }],
    seoTitle: "Form 67 Foreign Tax Credit",
    seoDescription: "What is Form 67 and when is it needed for foreign tax credit, Schedule FSI, Schedule TR, and DTAA claims?",
    audience: "individuals",
  },
  {
    id: "schedule-fa-vs-fsi-vs-tr",
    title: "Schedule FA vs Schedule FSI vs Schedule TR: What Is the Difference?",
    slug: "schedule-fa-vs-fsi-vs-tr",
    excerpt: "A plain-English comparison of Schedule FA, Schedule FSI, and Schedule TR for foreign assets, foreign income, and foreign tax relief.",
    categoryId: "foreign-assets-nri-tax",
    tags: ["Schedule FA", "Schedule FSI", "Schedule TR", "foreign tax credit", "foreign income"],
    redditSignal: "Reddit foreign-income threads show confusion between asset disclosure, foreign-source income, and foreign tax credit schedules.",
    shortAnswer: "Schedule FA reports foreign assets/accounts, Schedule FSI reports foreign-source income, and Schedule TR supports foreign tax relief or credit. They answer different questions and can all apply in one case.",
    officialRule: "ITR schedules collect different disclosures: assets, income, and relief/credit details. The correct schedules depend on residence, asset holding, income source, and foreign taxes paid.",
    example: "A resident with US brokerage shares and US dividend withholding may need Schedule FA for shares/account, Schedule FSI for dividend income, Schedule TR for credit, and Form 67.",
    checklist: ["List foreign assets.", "Identify foreign-source income.", "Check foreign tax paid.", "Map each item to FA, FSI, TR, and Form 67.", "Use ITR-2 or ITR-3 as applicable."],
    mistakes: ["Putting income only in Schedule FA.", "Claiming credit without TR/Form 67.", "Missing asset disclosure because income was small.", "Using wrong form."],
    faqs: [
      { question: "Can Schedule FA apply without income?", answer: "Yes. Foreign asset disclosure can apply even without current income or sale." },
      { question: "Can Schedule TR apply without foreign tax?", answer: "TR is relevant to relief or credit, so foreign tax details usually matter." },
    ],
    highlights: ["FA is assets.", "FSI is foreign-source income.", "TR is tax relief or credit."],
    internalLinks: [{ label: "Consult a CA", href: "/expert-consultation" }, { label: "ITR form selector", href: "/itr/form-selector" }],
    seoTitle: "Schedule FA vs FSI vs TR",
    seoDescription: "Difference between Schedule FA, Schedule FSI, and Schedule TR for foreign assets, foreign income, and foreign tax credit.",
    audience: "individuals",
  },
  {
    id: "forgot-schedule-fa-revised-return-or-itr-u",
    title: "I Forgot Schedule FA. Can I File Revised Return or ITR-U?",
    slug: "forgot-schedule-fa-revised-return-or-itr-u",
    excerpt: "If foreign asset disclosure was missed, this guide explains revised return, ITR-U limits, notices, and why expert review is important.",
    categoryId: "foreign-assets-nri-tax",
    tags: ["forgot Schedule FA", "revised return", "ITR-U", "foreign assets", "Black Money Act"],
    redditSignal: "Foreign asset Reddit threads ask whether missed Schedule FA can be corrected through revised return or ITR-U.",
    shortAnswer: "If the revised return window is open, revision may be the cleaner route. ITR-U is restricted and generally not useful where the update does not increase tax liability. Foreign asset omissions should be reviewed carefully.",
    officialRule: "Revised return and updated return have different time limits and conditions. Updated returns generally cannot be used to reduce tax or increase refund and are constrained by additional tax rules.",
    example: "If Schedule FA was missed but there is no additional income tax liability, ITR-U may not be available as an easy correction path. Expert review is strongly recommended.",
    checklist: ["Check if revised return deadline is open.", "Identify omitted foreign assets.", "Compute any omitted income.", "Review notice or email received.", "Document valuation and source."],
    mistakes: ["Assuming ITR-U fixes every omission.", "Ignoring foreign asset notices.", "Waiting past revised return deadline.", "Filing without valuation support."],
    faqs: [
      { question: "Can ITR-U be used only for Schedule FA disclosure?", answer: "It may not be available if there is no additional tax liability. Facts must be reviewed." },
      { question: "Should I revise if the amount is small?", answer: "Foreign asset disclosure is not only about amount. Review the obligation and deadline." },
    ],
    highlights: ["Revised return is time-sensitive.", "ITR-U has restrictions.", "Schedule FA omissions are high-risk."],
    internalLinks: [{ label: "Notice compliance help", href: "/services/notice-compliance" }, { label: "Talk to a CA", href: "/expert-consultation" }],
    seoTitle: "Forgot Schedule FA: Revise or ITR-U?",
    seoDescription: "Forgot Schedule FA in ITR? Learn revised return vs ITR-U options, restrictions, deadlines, and foreign asset risk.",
    audience: "individuals",
    serviceSlug: "notice-compliance",
  },
  {
    id: "section-143-1-intimation-after-itr-filing",
    title: "What Does Section 143(1) Intimation Mean After ITR Filing?",
    slug: "section-143-1-intimation-after-itr-filing",
    excerpt: "A calm guide to Section 143(1) intimation: refund, demand, adjustment, mismatch, and when to respond or rectify.",
    categoryId: "refunds-notices",
    tags: ["143(1)", "income tax intimation", "ITR processing", "tax demand", "refund"],
    redditSignal: "Post-filing Reddit questions often ask whether a 143(1) email is a notice or normal processing.",
    shortAnswer: "Section 143(1) is a processing intimation. It may confirm your return, issue refund, create demand, or show adjustments. Read the comparison between your return and department computation.",
    officialRule: "The department processes returns and communicates computed tax, refund, or demand through intimation. Adjustments must be reviewed within the available response or rectification framework.",
    example: "If you claimed TDS that is not in Form 26AS, 143(1) may compute lower credit and show demand or reduced refund.",
    checklist: ["Download the intimation PDF.", "Compare income, deductions, TDS, and tax paid.", "Check demand or refund amount.", "Verify whether adjustment is correct.", "Rectify or respond if eligible."],
    mistakes: ["Ignoring a demand line.", "Assuming every 143(1) is scrutiny.", "Not comparing numbers.", "Missing response deadline."],
    faqs: [
      { question: "Is 143(1) a scrutiny notice?", answer: "No. It is generally processing intimation, not detailed scrutiny by itself." },
      { question: "What if 143(1) shows demand?", answer: "Compare computations first; then pay, rectify, or respond depending on the issue." },
    ],
    highlights: ["143(1) is normal but must be read.", "Demand can arise from mismatch.", "Compare line-by-line before acting."],
    internalLinks: [{ label: "Notice compliance", href: "/services/notice-compliance" }, { label: "TDS refund tracker", href: "/tds-refund-tracker" }],
    seoTitle: "Section 143(1) Intimation Meaning",
    seoDescription: "What Section 143(1) intimation means after ITR filing, including refund, demand, adjustment, and rectification.",
    audience: "both",
    serviceSlug: "notice-compliance",
  },
  {
    id: "defective-return-notice-section-139-9",
    title: "What Is a Defective Return Notice Under Section 139(9)?",
    slug: "defective-return-notice-section-139-9",
    excerpt: "A practical guide to defective return notices, common causes, response timelines, correction steps, and when to get CA help.",
    categoryId: "refunds-notices",
    tags: ["139(9)", "defective return", "income tax notice", "ITR correction", "AY 2026-27"],
    redditSignal: "Reddit notice discussions commonly involve defective returns caused by wrong form, missing schedules, or inconsistent data.",
    shortAnswer: "A Section 139(9) notice means the return has a defect that must be corrected within the allowed time. If not fixed, the return may be treated as invalid.",
    officialRule: "The department can treat a return as defective where required information, schedules, or consistency checks fail. Taxpayers get an opportunity to correct within the specified time.",
    example: "Using the wrong ITR form, missing business schedules, or mismatch between income and tax audit fields can trigger a defective return notice.",
    checklist: ["Read defect code and explanation.", "Identify missing or inconsistent data.", "Prepare corrected return response.", "Submit within time.", "Keep acknowledgement."],
    mistakes: ["Ignoring the notice.", "Uploading the same defective data again.", "Using wrong form again.", "Waiting until the deadline."],
    faqs: [
      { question: "Is a defective return the same as scrutiny?", answer: "No. It means the filed return has a defect that needs correction." },
      { question: "What happens if I do not respond?", answer: "The return may be treated as invalid, affecting refund and compliance." },
    ],
    highlights: ["139(9) needs timely correction.", "Wrong form is a common cause.", "Do not resubmit without fixing the defect."],
    internalLinks: [{ label: "Notice compliance service", href: "/services/notice-compliance" }, { label: "ITR form recommender", href: "/itr/form-recommender" }],
    seoTitle: "Defective Return Notice 139(9)",
    seoDescription: "What is Section 139(9) defective return notice? Learn causes, response steps, deadlines, and correction options.",
    audience: "both",
    serviceSlug: "notice-compliance",
  },
  {
    id: "handle-ais-mismatch-before-after-itr",
    title: "How to Handle AIS Mismatch Before or After Filing ITR",
    slug: "handle-ais-mismatch-before-after-itr",
    excerpt: "A step-by-step guide to AIS mismatch, incorrect entries, duplicate income, TDS mismatch, feedback, revised return, and notice response.",
    categoryId: "refunds-notices",
    tags: ["AIS mismatch", "TIS", "Form 26AS", "income mismatch", "ITR notice"],
    redditSignal: "Reddit ITR threads repeatedly mention AIS/Form 26AS mismatch as a reason to wait, correct, or respond carefully.",
    shortAnswer: "Before filing, reconcile AIS with your records and submit feedback for wrong entries. After filing, compare any mismatch notice with your return and decide whether feedback, revised return, rectification, or response is needed.",
    officialRule: "Taxpayers are responsible for accurate income reporting. AIS is an information statement and should be reviewed against actual records and tax-credit statements.",
    example: "If AIS shows duplicate mutual fund redemption, keep broker/AMC evidence and submit feedback rather than reporting duplicate income blindly.",
    checklist: ["Download AIS and TIS.", "Mark correct, incorrect, duplicate, or not taxable entries.", "Match TDS with Form 26AS.", "Keep evidence.", "Respond to any notice on time."],
    mistakes: ["Ignoring AIS completely.", "Reporting duplicate entries without checking.", "Claiming TDS not in Form 26AS.", "Not revising when filed data is genuinely wrong."],
    faqs: [
      { question: "Should I always follow AIS?", answer: "No. Report correct taxable income based on evidence. Use AIS feedback for incorrect information." },
      { question: "Can AIS mismatch delay refund?", answer: "Yes, mismatches can delay processing or trigger queries." },
    ],
    highlights: ["AIS is a review tool, not final truth.", "Feedback can reduce mismatch risk.", "Keep evidence for every disputed entry."],
    internalLinks: [{ label: "AIS viewer", href: "/ais-viewer" }, { label: "Notice help", href: "/services/notice-compliance" }],
    seoTitle: "Handle AIS Mismatch in ITR",
    seoDescription: "How to handle AIS mismatch before or after ITR filing with Form 26AS, TIS feedback, revised return, and notices.",
    audience: "both",
    serviceSlug: "notice-compliance",
  },
  {
    id: "belated-revised-updated-return-ay-2026-27",
    title: "How to File Belated, Revised, and Updated Returns for AY 2026-27",
    slug: "how-to-file-belated-revised-updated-return-ay-2026-27",
    excerpt: "A Reddit-style correction guide: missed due date, wrong ITR, missed income, refund issue, revised return, belated return, and ITR-U.",
    categoryId: "refunds-notices",
    tags: ["belated return", "revised return", "updated return", "ITR-U", "AY 2026-27"],
    redditSignal: "Many Reddit questions ask what to do after missing a deadline, choosing the wrong regime, missing income, or receiving a notice.",
    shortAnswer: "Use belated return if no original return was filed by the due date, revised return if a filed return needs correction within time, and updated return only for specified later cases, usually involving additional tax.",
    officialRule: "Belated, revised, and updated returns have separate provisions, time limits, and restrictions. AY 2026-27 transition guidance confirms old Act framework for FY 2025-26 filing.",
    example: "If you filed AY 2026-27 ITR but forgot bank interest and are within the revised return window, revised return is usually the correction route. ITR-U is not for increasing refund.",
    checklist: ["Check whether original return exists.", "Identify the error.", "Check deadline.", "Calculate tax, interest, and fee.", "Choose belated, revised, or updated route."],
    mistakes: ["Using ITR-U for refund increase.", "Missing revised return deadline.", "Not paying self-assessment tax.", "Ignoring e-verification."],
    faqs: [
      { question: "Can a belated return be revised?", answer: "A filed belated return can generally be revised within the permitted time limit." },
      { question: "Can ITR-U reduce tax?", answer: "Updated return is generally restricted where it reduces tax liability or increases refund." },
    ],
    highlights: ["Correction route depends on filing status.", "Revised return is time-sensitive.", "ITR-U has strict restrictions."],
    internalLinks: [{ label: "Notice compliance", href: "/services/notice-compliance" }, { label: "Talk to a CA", href: "/expert-consultation" }],
    seoTitle: "Belated Revised Updated Return AY 2026-27",
    seoDescription: "How to file belated, revised, and updated returns for AY 2026-27 with ITR-U restrictions and deadlines.",
    audience: "both",
    serviceSlug: "notice-compliance",
  },
  {
    id: "ay-2026-27-vs-tax-year-2026-27",
    title: "AY 2026-27 vs Tax Year 2026-27: Which Act and Forms Apply?",
    slug: "ay-2026-27-vs-tax-year-2026-27",
    excerpt: "A simple transition guide explaining why FY 2025-26 income filed in AY 2026-27 uses the old Act framework, while Tax Year 2026-27 is different.",
    categoryId: "income-tax",
    tags: ["AY 2026-27", "Tax Year 2026-27", "Income-tax Act 2025", "Income Tax Act 1961", "ITR forms"],
    redditSignal: "Reddit AY 2026-27 threads show confusion between assessment year, financial year, tax year, old Act, and new Act.",
    shortAnswer: "AY 2026-27 is the assessment year for FY 2025-26 income and is governed by the Income Tax Act, 1961 framework. Tax Year 2026-27 refers to the later period beginning 1 April 2026 under the newer framework.",
    officialRule: "Official transition FAQs state that FY 2025-26 income filed for AY 2026-27 continues under the old Act framework, even if filing happens after 1 April 2026.",
    example: "Salary earned from 1 April 2025 to 31 March 2026 is filed in AY 2026-27. Salary earned from 1 April 2026 onward belongs to the later tax year and is not the same return.",
    checklist: ["Match income period to filing year.", "Select AY 2026-27 for FY 2025-26 income.", "Use AY-specific ITR forms.", "Do not mix Tax Year 2026-27 rules into FY 2025-26 filing.", "Track new Act changes for future income."],
    mistakes: ["Confusing AY and tax year.", "Selecting the wrong year on the portal.", "Applying new Act forms to FY 2025-26 income.", "Ignoring transition FAQs."],
    faqs: [
      { question: "Is AY 2026-27 the same as Tax Year 2026-27?", answer: "No. They refer to different compliance periods and should not be mixed." },
      { question: "Which Act applies to FY 2025-26 filing?", answer: "Official transition guidance says the Income Tax Act, 1961 framework applies for AY 2026-27 filing." },
    ],
    highlights: ["AY 2026-27 is for FY 2025-26 income.", "Tax Year 2026-27 is different.", "Transition FAQs prevent wrong-year filing mistakes."],
    internalLinks: [{ label: "ITR form selector", href: "/itr/form-selector" }, { label: "Income tax calculator", href: "/calculators/income-tax" }],
    seoTitle: "AY 2026-27 vs Tax Year 2026-27",
    seoDescription: "AY 2026-27 vs Tax Year 2026-27 explained: which Act, income period, and ITR forms apply for FY 2025-26.",
    audience: "both",
    calculatorSlug: "income-tax",
  },
];

function bulletList(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n");
}

function linkList(links: TopicSpec["internalLinks"]) {
  return links.map((link) => `- [${link.label}](${link.href})`).join("\n");
}

function markdownTable(headers: string[], rows: string[][]) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

function keyHighlightsTable(spec: TopicSpec) {
  return markdownTable(
    ["Point", "What it means for you"],
    spec.highlights.slice(0, 4).map((highlight, index) => [`${index + 1}`, highlight]),
  );
}

function documentTableFor(spec: TopicSpec) {
  const baseRows = [
    ["AIS and TIS", "Reported income and transaction information to compare with your own records."],
    ["Form 26AS", "TDS, TCS, advance tax, self-assessment tax, refund, and demand details mapped to PAN."],
    ["Computation working", "The bridge between source documents, taxable income, tax paid, and refund or demand."],
    ["Final ITR acknowledgement", "Proof that the return was submitted and later e-verified."],
  ];

  const categoryRows: Record<string, string[][]> = {
    "itr-filing": [
      ["Form 16 or Form 16A", "Salary or TDS certificate used to reconcile income and tax credit."],
      ["Bank validation proof", "Helps prevent refund failure after processing."],
    ],
    "income-tax": [
      ["Salary, interest, and investment records", "Supports gross income, deductions, rebate, and final tax calculation."],
      ["Tax challans", "Shows tax already paid outside TDS."],
    ],
    "tax-regime": [
      ["Deduction proofs", "Needed to compare old regime benefit against new regime rates."],
      ["Employer declaration and Form 16", "Helps reconcile payroll TDS with return-time regime selection."],
    ],
    "capital-gains": [
      ["Broker or mutual fund capital gains report", "Supports sale value, cost, holding period, and STT where relevant."],
      ["Transaction statement", "Useful when the return needs item-wise capital gains reporting."],
    ],
    "business-freelancers": [
      ["Invoices and bank statements", "Supports gross receipts, TDS, GST linkage, and cash-flow reconciliation."],
      ["Expense proofs and books", "Supports business deductions and audit or presumptive-tax decisions."],
    ],
    "foreign-assets-nri-tax": [
      ["Foreign account or broker statements", "Supports Schedule FA values, dates, and ownership details."],
      ["Foreign tax certificate and exchange-rate working", "Supports Form 67 and foreign tax credit where applicable."],
    ],
    "refunds-notices": [
      ["Notice or intimation PDF", "Defines the response route, deadline, and issue raised by the department."],
      ["Response acknowledgement", "Proof that rectification, grievance, notice reply, or other action was submitted."],
    ],
  };

  return markdownTable(["Document", "Why it matters"], [...(categoryRows[spec.categoryId] ?? []), ...baseRows]);
}

function decisionTableFor(spec: TopicSpec) {
  return markdownTable(
    ["Situation", "Practical next action"],
    [
      ["Return not filed yet", "Reconcile records first, then choose the correct AY 2026-27 ITR form and schedules."],
      ["Portal data and personal records differ", "Check the source document, give AIS feedback where relevant, and keep a note before filing."],
      ["Return already filed with a mistake", "Check whether revised return, rectification, ITR-U, grievance, or notice response is the correct route."],
      ["Refund, notice, capital gains, business income, or foreign assets involved", "Use CA review before submitting a final position."],
    ],
  );
}

function categoryTechnicalNotes(categoryId: string) {
  const notes: Record<string, string> = {
    "itr-filing":
      "For ITR filing topics, the technical review starts with the assessment year, residential status, income heads, form eligibility, prefilled data, e-verification status, and whether the return is original, belated, revised, or updated. A CA should verify that the selected ITR form supports every income type and schedule required for the taxpayer.",
    "income-tax":
      "For income tax computation topics, the technical review should separate gross income, exempt income, deductions, taxable income, slab computation, rebate, surcharge where relevant, cess, TDS/TCS credit, advance tax, self-assessment tax, and interest. Rebate and exemption should never be treated as the same concept.",
    "tax-regime":
      "For tax regime topics, the technical review should compare old and new regime using final taxable income, eligible exemptions, deduction evidence, employer TDS, Form 16, business or profession income status, and return-time eligibility. The regime chosen in payroll is not always the final return position, but the return position must be legally available.",
    "capital-gains":
      "For capital gains topics, the technical review should classify each transaction by asset type, holding period, sale value, cost, indexation or grandfathering where applicable, exemption claim, loss set-off, and correct ITR schedule. Delivery equity, mutual funds, intraday, F&O, crypto, and business trading cannot be merged into one generic line item.",
    "business-freelancers":
      "For business and freelancer topics, the technical review should examine the income head, books requirement, presumptive taxation eligibility, GST/TDS records, expense support, turnover, audit triggers, loss treatment, and whether ITR-3 or ITR-4 is appropriate. Simpler forms are useful only when the facts qualify.",
    "foreign-assets-nri-tax":
      "For foreign asset and NRI topics, the technical review starts with residential status. Then review Schedule FA, Schedule FSI, Schedule TR, Form 67, foreign tax paid, exchange-rate support, calendar-year reporting fields, peak values, acquisition dates, and whether the taxpayer holds foreign bank accounts, RSUs, ESPP, brokerage accounts, or other offshore assets.",
    "refunds-notices":
      "For refund and notice topics, the technical review should reconcile the filed return with Form 26AS, AIS, TIS, challans, intimation, defect code, demand computation, bank validation, e-verification, and response deadline. Rectification, revision, updated return, grievance, and payment are different routes and should not be used interchangeably.",
  };

  return notes[categoryId] ?? notes["itr-filing"];
}

function technicalNotesFor(spec: TopicSpec) {
  return `${categoryTechnicalNotes(spec.categoryId)}

For this specific topic, the reviewer should document the working position for "${spec.title}" using the taxpayer's facts, the selected AY 2026-27 form, the records used for computation, and the reason each major number appears in the return. The note should explicitly mention whether the issue affects form selection, income classification, deduction eligibility, tax credit matching, refund timing, notice response, or disclosure schedule completion.

The minimum evidence file should include the source statement behind the answer, the calculation sheet, screenshots or downloads from the income tax portal where relevant, and proof for every adjustment. If the position depends on timing, such as AIS updates, Form 16 issue date, revised return deadline, ITR-U restrictions, e-verification, or a notice response window, the date should be written next to the decision. If the position depends on classification, such as capital gains versus business income, resident versus non-resident, old regime versus new regime, or foreign income versus Indian business receipts, the reason for that classification should be recorded before filing.`;
}

function faqItemsFor(spec: TopicSpec) {
  return [
    ...spec.faqs,
    {
      question: "Should I get CA review for this before filing?",
      answer: "Yes, if the facts are not routine, if a refund or notice is involved, or if the return includes capital gains, foreign assets, business income, regime changes, or AIS/TDS mismatches.",
    },
  ];
}

function contentFor(spec: TopicSpec) {
  return `# ${spec.title}

${spec.shortAnswer}

${spec.excerpt}

## Key Highlights

${keyHighlightsTable(spec)}

## What this guide covers

This guide is for taxpayers dealing with ${spec.title.toLowerCase()} while filing FY 2025-26 income in AY 2026-27. It explains the practical rule, the documents to check, the decision points, and the mistakes that can create refund delays, defective returns, incorrect tax demands, or weak disclosure support.

This answer is written for taxpayers filing FY 2025-26 income in AY 2026-27. It is intentionally practical: first decide the correct assessment year, then match the income and tax-credit records, then decide the form, regime, schedule, and correction route. Most mistakes happen when taxpayers start from a shortcut such as "portal prefill says this", "my employer selected that", or "a comment online said this form is enough" instead of matching the return to their actual facts.

The safest approach is to treat the return as a reconciliation exercise. Your salary, interest, capital gains, freelance income, foreign assets, trading income, deductions, and tax paid should all have a source document. If the return creates a refund, demand, loss claim, foreign disclosure, or change in regime, the working papers should explain why the number is correct before the return is submitted.

## Why taxpayers ask this question

${spec.redditSignal} The pattern is understandable: the income tax portal, Form 16, AIS, Form 26AS, old vs new regime, foreign asset schedules, and ITR correction routes all use similar words for different compliance steps.

The confusion usually falls into three buckets. First, taxpayers mix up timing: filing utility availability, Form 16 issue, AIS updates, TDS return processing, due dates, revised return windows, and updated return windows do not all happen on the same day. Second, taxpayers mix up eligibility: ITR-1, ITR-2, ITR-3, ITR-4, old regime, new regime, presumptive taxation, foreign asset schedules, and notice response options all depend on facts. Third, taxpayers mix up evidence: a screenshot, bank credit, broker statement, Form 16, Form 16A, AIS entry, Form 26AS credit, and final return computation each prove different things.

That is why the best answer is rarely a one-line yes or no. The correct answer is usually: check the assessment year, identify the income head, match the tax credit, apply the right form and schedule, and then file or respond using the route that the law actually permits.

## Official-rule view

${spec.officialRule}

For AY 2026-27, income earned during FY 2025-26 should be filed by selecting AY 2026-27. The transition guidance also clarifies that this return continues under the Income Tax Act, 1961 framework for that year.

From a filing perspective, this means the return should be built around the law, form instructions, and portal utilities applicable to AY 2026-27, not around a generic current-year assumption. The Income Tax Department's records are useful, but they do not remove the taxpayer's responsibility to report the correct income. AIS and TIS help identify reported information. Form 26AS helps confirm tax credits and tax payments. Form 16 and Form 16A help reconcile TDS. Broker, bank, payroll, and foreign account statements support the figures that go into the schedules.

If the official records are incomplete or wrong, do not blindly copy them. Review the underlying evidence, submit AIS feedback where appropriate, ask the deductor to correct TDS returns where needed, and keep notes explaining your final treatment. If the official records are correct but your private records are incomplete, update your working file before filing.

## Documents to keep ready

${documentTableFor(spec)}

Use this table as a working file checklist. The Income Tax Department's prefilled data can help you start, but the taxpayer must still check the figures against source documents before filing or responding.

## Example

${spec.example}

Apply the example in three passes. In the first pass, identify the income period and assessment year. In the second pass, identify the form and schedule that can legally report the income. In the third pass, compare tax deducted, tax paid, and tax payable. If all three passes agree, the return is usually ready for final review. If one pass fails, pause before filing because that is where notices, refund delays, or defective returns usually begin.

For a salary taxpayer, the equivalent records may be Form 16, monthly payslips, AIS, Form 26AS, bank interest certificate, rent proof, housing loan certificate, and investment proof. For an investor, the records may include broker capital gains reports, mutual fund statements, dividend entries, STT details, and AIS securities information. For a freelancer or business owner, the records may include invoices, bank statements, Form 16A, GST returns, expense evidence, and books. For foreign asset cases, the records may include foreign bank statements, RSU or ESPP statements, broker reports, foreign tax certificates, exchange-rate support, and Form 67 evidence.

## Filing checklist

${bulletList(spec.checklist)}

Use this checklist as a pre-filing gate, not as a post-filing cleanup list. Before submission, confirm that each checklist item has either a document, a computation note, or a conscious "not applicable" decision. This is especially important when the article topic affects refunds, notices, foreign disclosures, capital gains, tax regime choice, or return correction routes.

Also check the return preview before final submission. Verify name, PAN, assessment year, bank account, filing section, regime selection, ITR form, schedule count, taxable income, TDS, self-assessment tax, refund or demand, and e-verification mode. Many avoidable errors are visible in the preview if the taxpayer slows down for five minutes.

## Which route should you use?

${decisionTableFor(spec)}

The route matters as much as the answer. Paying a demand, filing a revised return, using ITR-U, submitting AIS feedback, raising a grievance, or replying to a notice are separate actions. Choose the action that matches the document and statutory window in front of you.

## Common mistakes to avoid

${bulletList(spec.mistakes)}

The most expensive mistake is not always a wrong number. Often it is a wrong route. For example, filing ITR-1 when ITR-2 or ITR-3 is required can create a defective return problem. Trying to use ITR-U to reduce tax or increase refund can fail because updated return has restrictions. Claiming TDS without reporting the related income can delay refund. Ignoring Schedule FA because the income is small can create a serious disclosure issue. Selecting a tax regime without checking deductions, business income rules, or Form 10-IEA implications can create demand or lost benefit.

Another common mistake is treating portal data as complete too early in the season. AIS, Form 26AS, and TIS can update after deductors, banks, brokers, employers, or other reporting entities file or correct their statements. If your return depends on a large refund or a disputed entry, waiting for cleaner records or documenting your evidence is usually better than rushing.

Finally, avoid filing without preserving the working file. The return acknowledgement alone is not enough. Keep the computation, statements, proofs, screenshots, challans, and correspondence. If a notice arrives months later, the taxpayer who can reconstruct the return quickly is in a much stronger position.

## Documents and evidence to keep

Keep a simple folder for this topic with the final computation and supporting files. At minimum, include Form 16 or Form 16A where applicable, AIS, TIS, Form 26AS, bank statements, investment statements, deduction proofs, challans, and the final ITR acknowledgement. If the topic involves capital gains, add broker statements and transaction reports. If it involves foreign assets or foreign tax credit, add foreign account statements, tax certificates, exchange-rate workings, and Form 67 support. If it involves notices, add the intimation, notice PDF, response acknowledgement, and any rectification or revised return computation.

Name the files clearly, for example "AY-2026-27-AIS.pdf", "Form-16-employer-name.pdf", "Capital-gains-broker-report.xlsx", or "143-1-intimation-response.pdf". Clear file names save time when a CA reviews the case or when the department asks for details later.

## How to decide the next action

Use a simple decision flow. If the return has not been filed, complete reconciliation first and then file the correct form. If the return has been filed but the deadline for revision is open, check whether a revised return is the right correction route. If the issue is only an apparent processing mismatch, rectification may be relevant. If the filing window is closed and additional income or tax must be disclosed, updated return may be considered, but only within its restrictions. If there is a notice, read the notice before choosing any route.

Do not assume that paying a demand, filing a revised return, filing ITR-U, submitting AIS feedback, or raising a grievance are interchangeable. Each route solves a different problem. Pick the route based on the document in front of you and the statutory time limit.

## Useful MyeCA tools

${linkList(spec.internalLinks)}

Use these tools after the facts are organized. Calculators are most useful when the source numbers are reliable. The ITR form selector is most useful when all income heads are known. The AIS viewer is most useful when you compare each information item with your own statement. Expert consultation is most useful when there is a choice to make, such as regime selection, form selection, correction route, foreign disclosure, notice response, or treatment of trading income.

## When to get expert help

Use CA review when your case includes capital gains, trading income, foreign assets, foreign tax credit, freelance or business income, a large refund, AIS mismatch, a demand notice, a defective return notice, or any uncertainty about the correct ITR form.

Expert review is also useful when the tax impact seems small but the compliance risk is high. Foreign asset disclosure, incorrect ITR form selection, missed business income, defective return notices, and invalid correction routes can create problems that are larger than the immediate tax amount. A CA review should not merely enter data; it should explain the filing position, check the evidence, and leave you with a clear computation.

## Final takeaway

${spec.highlights.join(" ")}

Treat this topic as one part of the larger AY 2026-27 filing file. A clean return is not created by one answer; it is created by consistent treatment across the return, supporting statements, tax credits, schedules, and declarations. If the facts are routine, the checklist may be enough. If the facts are mixed, disputed, or high-value, get the treatment reviewed before filing.

## CA Technical Notes

${technicalNotesFor(spec)}
`;
}

export const itrSeason2026BlogPosts: ItrSeasonPost[] = topics.map((spec, index) => ({
  id: spec.id,
  title: spec.title,
  slug: spec.slug,
  excerpt: spec.excerpt,
  content: contentFor(spec),
  status: "published",
  categoryId: spec.categoryId,
  coverImage: blogTextCoverPath(spec.slug),
  authorId: "mye-ca-editorial",
  authorName: "MyeCA Editorial Team",
  authorRole: "ITR Filing Desk",
  authorBio: "The MyeCA Editorial Team writes CA-reviewed guides for Indian taxpayers, freelancers, investors, and globally mobile individuals.",
  seoTitle: spec.seoTitle,
  seoDescription: spec.seoDescription,
  keyHighlights: spec.highlights,
  faqItems: faqItemsFor(spec),
  relatedPostIds: topics
    .filter((candidate) => candidate.id !== spec.id && candidate.categoryId === spec.categoryId)
    .slice(0, 3)
    .map((candidate) => candidate.id),
  ctaLabel: "Start CA-Assisted ITR Filing",
  ctaHref: index % 4 === 0 ? "/itr/form-selector" : "/expert-consultation",
  isFeatured: index === 0,
  readingTimeMinutes: 8,
  publishedAt,
  createdAt: publishedAt,
  updatedAt: reviewedAt,
  tags: spec.tags,
  audience: spec.audience,
  reviewedBy: "CA MyeCA Review Desk",
  reviewedAt,
  sourceLinks: officialSourceLinks,
  serviceSlug: spec.serviceSlug ?? null,
  calculatorSlug: spec.calculatorSlug ?? null,
  canonicalUrl: null,
}));
