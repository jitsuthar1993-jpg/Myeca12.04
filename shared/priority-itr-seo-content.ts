import type { StaticRouteBodyLink, StaticRouteBodySection } from "./static-seo-content";

type PriorityItrSearchRoute = string;

export const PRIORITY_ITR_CONTENT_MIN_WORDS = 120;
export const PRIORITY_ITR_CONTENT_MIN_INTERNAL_LINKS = 2;

export type PriorityItrRouteContent = {
  highlights: string[];
  sections: StaticRouteBodySection[];
  links: StaticRouteBodyLink[];
  requiredTerms: string[];
};

type CommercialRouteSpec = {
  route: string;
  label: string;
  audience: string;
  task: string;
  proof: string;
  links: StaticRouteBodyLink[];
  requiredTerms: string[];
};

const commercialRouteSpecs: CommercialRouteSpec[] = [
  { route: "/calculators/capital-gains", label: "Capital gains calculator", audience: "investors and property sellers", task: "estimate STCG, LTCG, exemptions, and ITR form impact", proof: "broker statements, purchase dates, sale values, and AIS capital gains entries", links: [{ label: "Capital gains import", href: "/capital-gains-import" }, { label: "Capital gains guide", href: "/blog/capital-gains-trading-income-itr-guide-ay-2026-27" }], requiredTerms: ["capital gains", "STCG", "LTCG"] },
  { route: "/capital-gains-import", label: "Capital gains import tool", audience: "active investors", task: "turn broker tax P&L files into review-ready summaries", proof: "broker reports, tradebooks, AIS, and corporate action checks", links: [{ label: "Capital gains calculator", href: "/calculators/capital-gains" }, { label: "Quicko alternative", href: "/compare/quicko-capital-gains-alternative" }], requiredTerms: ["broker", "capital gains", "AIS"] },
  { route: "/calculators/hra", label: "HRA calculator", audience: "salaried tenants", task: "estimate house rent allowance exemption before choosing a tax regime", proof: "rent receipts, landlord details, salary breakup, and Form 16", links: [{ label: "Income tax calculator", href: "/calculators/income-tax" }, { label: "Salaried ITR service", href: "/services/itr-for-salaried" }], requiredTerms: ["HRA", "rent", "Form 16"] },
  { route: "/calculators/tax-regime", label: "Tax regime calculator", audience: "salaried taxpayers", task: "compare old regime and new regime outcomes for AY 2026-27", proof: "deduction proofs, Form 16 values, HRA, NPS, and home-loan certificates", links: [{ label: "Income tax calculator", href: "/calculators/income-tax" }, { label: "Regime comparator", href: "/calculators/regime-comparator" }], requiredTerms: ["old regime", "new regime", "AY 2026-27"] },
  { route: "/calculators/regime-comparator", label: "Regime comparator", audience: "taxpayers with deductions", task: "make a regime decision using a side-by-side estimate", proof: "eligible deductions, exemptions, salary details, and rebate checks", links: [{ label: "Tax regime calculator", href: "/calculators/tax-regime" }, { label: "Choose ITR form", href: "/itr/form-selector" }], requiredTerms: ["regime", "deductions", "rebate"] },
  { route: "/calculators/gst", label: "GST calculator", audience: "business owners", task: "estimate inclusive and exclusive GST values", proof: "invoice value, GST rate, place of supply, and HSN/SAC classification", links: [{ label: "GST filing", href: "/gst-filing" }, { label: "GST registration", href: "/services/gst-registration" }], requiredTerms: ["GST", "invoice", "CGST"] },
  { route: "/calculators/sip", label: "SIP calculator", audience: "long-term investors", task: "project monthly investment growth with compounding assumptions", proof: "investment horizon, expected return, contribution amount, and tax treatment", links: [{ label: "Capital gains calculator", href: "/calculators/capital-gains" }, { label: "Tax planning", href: "/services/tax-planning" }], requiredTerms: ["SIP", "mutual fund", "investment"] },
  { route: "/calculators/nps", label: "NPS calculator", audience: "retirement planners", task: "estimate NPS corpus and annuity outcomes", proof: "contribution amount, retirement age, expected return, and deduction eligibility", links: [{ label: "Tax regime calculator", href: "/calculators/tax-regime" }, { label: "Tax planning", href: "/services/tax-planning" }], requiredTerms: ["NPS", "retirement", "deduction"] },
  { route: "/calculators/ppf", label: "PPF calculator", audience: "old-regime savers", task: "estimate PPF maturity and 80C planning value", proof: "deposit pattern, tenure, interest assumption, and 80C limit", links: [{ label: "Tax regime calculator", href: "/calculators/tax-regime" }, { label: "NPS calculator", href: "/calculators/nps" }], requiredTerms: ["PPF", "80C", "maturity"] },
  { route: "/calculators/fd", label: "FD calculator", audience: "deposit investors", task: "estimate fixed deposit maturity and taxable interest", proof: "deposit amount, tenure, compounding, AIS interest, and TDS credit", links: [{ label: "TDS calculator", href: "/calculators/tds" }, { label: "Income tax calculator", href: "/calculators/income-tax" }], requiredTerms: ["FD", "interest", "TDS"] },
  { route: "/calculators/tds", label: "TDS calculator", audience: "deductors and taxpayers", task: "estimate tax deduction on selected payment types", proof: "payment nature, threshold, PAN, rate, and Form 26AS credit", links: [{ label: "GST filing", href: "/gst-filing" }, { label: "Income tax calculator", href: "/calculators/income-tax" }], requiredTerms: ["TDS", "Form 26AS", "deduction"] },
  { route: "/calculators/gratuity", label: "Gratuity calculator", audience: "employees leaving or retiring", task: "estimate gratuity and possible tax exposure", proof: "basic salary, DA, completed service, employer type, and settlement letter", links: [{ label: "Income tax calculator", href: "/calculators/income-tax" }, { label: "Salaried ITR service", href: "/services/itr-for-salaried" }], requiredTerms: ["gratuity", "salary", "exemption"] },
  { route: "/calculators/emi", label: "EMI calculator", audience: "borrowers", task: "estimate loan EMI and repayment burden", proof: "loan amount, interest rate, tenure, fees, and prepayment assumptions", links: [{ label: "Home loan calculator", href: "/calculators/home-loan" }, { label: "Tax planning", href: "/services/tax-planning" }], requiredTerms: ["EMI", "loan", "interest"] },
  { route: "/calculators/home-loan", label: "Home loan calculator", audience: "home buyers", task: "estimate EMI and possible housing-loan tax planning inputs", proof: "loan certificate, interest component, property use, and regime choice", links: [{ label: "EMI calculator", href: "/calculators/emi" }, { label: "Tax regime calculator", href: "/calculators/tax-regime" }], requiredTerms: ["home loan", "EMI", "interest"] },
  { route: "/calculators/advance-tax", label: "Advance tax calculator", audience: "taxpayers with non-salary income", task: "estimate advance-tax installments and interest risk", proof: "income estimate, TDS credits, due dates, and capital gains timing", links: [{ label: "Income tax calculator", href: "/calculators/income-tax" }, { label: "TDS calculator", href: "/calculators/tds" }], requiredTerms: ["advance tax", "installment", "234C"] },
  { route: "/gst-filing", label: "GST filing service", audience: "GST-registered businesses", task: "prepare recurring return filing with invoice and ITC review", proof: "sales invoices, purchase register, GSTR-2B, e-way bills, and ledger balances", links: [{ label: "GST calculator", href: "/calculators/gst" }, { label: "GST registration", href: "/services/gst-registration" }], requiredTerms: ["GST", "GSTR", "ITC"] },
  { route: "/services/gst-registration", label: "GST registration service", audience: "new and growing businesses", task: "prepare registration documents and first-compliance steps", proof: "PAN, address proof, bank proof, constitution documents, and business activity", links: [{ label: "GST filing", href: "/gst-filing" }, { label: "Company registration", href: "/services/company-registration" }], requiredTerms: ["GST registration", "business", "documents"] },
  { route: "/services/gst-returns", label: "GST returns service", audience: "monthly and quarterly filers", task: "organize GSTR filing, reconciliation, and compliance cadence", proof: "sales data, purchase data, GSTR-2B, credit notes, and payment challans", links: [{ label: "GST calculator", href: "/calculators/gst" }, { label: "GST filing", href: "/gst-filing" }], requiredTerms: ["GST returns", "GSTR", "reconciliation"] },
  { route: "/services/company-registration", label: "Company registration service", audience: "founders and small businesses", task: "plan incorporation documents, name approval, and compliance setup", proof: "director KYC, address proof, object clause, capital details, and DSC/DIN readiness", links: [{ label: "Startup services", href: "/startup-services" }, { label: "Startup registration", href: "/startup/registration" }], requiredTerms: ["company registration", "startup", "documents"] },
  { route: "/services/msme-udyam-registration", label: "MSME Udyam registration", audience: "small businesses", task: "prepare MSME registration and record alignment", proof: "Aadhaar, PAN, GST details where applicable, business activity, and turnover records", links: [{ label: "Startup services", href: "/startup-services" }, { label: "Government schemes", href: "/blog/government-schemes-msme-startup-eligibility-document-checklist" }], requiredTerms: ["MSME", "Udyam", "registration"] },
  { route: "/services/tax-planning", label: "Tax planning service", audience: "individuals and founders", task: "review regime choice, deductions, capital gains, and compliance timing", proof: "income records, deduction proofs, investment data, and expected transactions", links: [{ label: "Tax regime calculator", href: "/calculators/tax-regime" }, { label: "Income tax calculator", href: "/calculators/income-tax" }], requiredTerms: ["tax planning", "deductions", "capital gains"] },
  { route: "/services/tds-filing", label: "TDS filing service", audience: "employers and deductors", task: "prepare TDS returns, challan checks, and deductee records", proof: "TAN, challans, deductee PAN, payment register, and Form 26Q or 24Q data", links: [{ label: "TDS calculator", href: "/calculators/tds" }, { label: "GST filing", href: "/gst-filing" }], requiredTerms: ["TDS filing", "TAN", "challan"] },
  { route: "/services/trademark-registration", label: "Trademark registration service", audience: "brands and founders", task: "prepare class search, application details, and objection readiness", proof: "brand name, logo, class selection, applicant proof, and use evidence", links: [{ label: "Startup services", href: "/startup-services" }, { label: "Company registration", href: "/services/company-registration" }], requiredTerms: ["trademark", "startup", "registration"] },
  { route: "/services/notice-compliance", label: "Notice compliance service", audience: "taxpayers with department communication", task: "organize response facts, documents, and deadline tracking", proof: "notice copy, return data, AIS/Form 26AS, computation, and supporting documents", links: [{ label: "Expert consultation", href: "/expert-consultation" }, { label: "ITR filing", href: "/itr-filing" }], requiredTerms: ["notice", "compliance", "AIS"] },
  { route: "/services/startup-india-registration", label: "Startup India registration", audience: "eligible startups", task: "prepare DPIIT recognition and supporting documents", proof: "incorporation records, business model note, founder details, and innovation evidence", links: [{ label: "Startup services", href: "/startup-services" }, { label: "Startup funding", href: "/startup/funding" }], requiredTerms: ["Startup India", "DPIIT", "registration"] },
  { route: "/compare/cleartax-alternative", label: "ClearTax alternative", audience: "taxpayers comparing assisted filing", task: "compare CA assisted document review, case tracking, and scope visibility", proof: "filing complexity, support needs, document readiness, and post-filing expectations", links: [{ label: "Compare filing options", href: "/compare" }, { label: "CA-assisted comparison", href: "/compare/best-ca-assisted-itr-filing" }], requiredTerms: ["ClearTax alternative", "CA assisted", "ITR"] },
  { route: "/compare/taxbuddy-alternative", label: "TaxBuddy alternative", audience: "taxpayers comparing expert support", task: "compare filing support, communication, tracking, and review workflow", proof: "return complexity, notice history, document gaps, and support preference", links: [{ label: "Compare filing options", href: "/compare" }, { label: "Salaried ITR service", href: "/services/itr-for-salaried" }], requiredTerms: ["TaxBuddy alternative", "case tracking", "ITR"] },
  { route: "/compare/indiafilings-alternative", label: "IndiaFilings alternative", audience: "founders and businesses", task: "compare startup, GST, and compliance service workflows", proof: "business stage, registration need, filing cadence, and document ownership", links: [{ label: "Startup services", href: "/startup-services" }, { label: "Company registration", href: "/services/company-registration" }], requiredTerms: ["IndiaFilings alternative", "startup", "GST"] },
  { route: "/compare/quicko-capital-gains-alternative", label: "Quicko capital gains alternative", audience: "investors with complex statements", task: "compare capital gains import, review, and assisted filing paths", proof: "broker statements, AIS mismatch, F&O/VDA facts, and ITR form needs", links: [{ label: "Capital gains import", href: "/capital-gains-import" }, { label: "Capital gains calculator", href: "/calculators/capital-gains" }], requiredTerms: ["Quicko alternative", "capital gains", "broker"] },
  { route: "/compare/best-ca-assisted-itr-filing", label: "Best CA-assisted ITR filing comparison", audience: "complex taxpayers", task: "compare CA assisted filing workflows for salary, gains, business income, and notices", proof: "income heads, document volume, review needs, and expected turnaround", links: [{ label: "ITR filing", href: "/itr-filing" }, { label: "Expert consultation", href: "/expert-consultation" }], requiredTerms: ["CA assisted", "ITR filing", "complex"] },
];

function commercialRouteContent(spec: CommercialRouteSpec): PriorityItrRouteContent {
  return {
    highlights: [
      spec.label,
      `Built for ${spec.audience}`,
      `Use it to ${spec.task}`,
      `Review ${spec.proof}`,
    ],
    sections: [
      {
        heading: `${spec.label} workflow`,
        body:
          `${spec.label} helps ${spec.audience} ${spec.task}. The page is designed as a practical step in the MyeCA filing and compliance journey, not as a standalone promise. Users should treat the result as a structured estimate or checklist and then compare it with official records before taking a tax or compliance position.`,
        items: [`Collect ${spec.proof}`, "Check the result against the relevant return, registration, or compliance workflow"],
      },
      {
        heading: "Records to verify before acting",
        body:
          `For stronger filing confidence, keep ${spec.proof} ready before relying on this page. MyeCA links this route to related calculators, guides, and services so users and crawlers can follow the complete topical path from estimate to evidence review to assisted action where needed.`,
        table: spec.route.startsWith("/compare/")
          ? {
              headers: ["Decision area", "MyeCA review path", "What to verify"],
              rows: [
                ["Scope clarity", "Visible service, calculator, and expert-review routes", "Confirm what is included before payment"],
                ["Document handling", "Upload and case-tracking workflow where applicable", spec.proof],
                ["Post-filing support", "Use consultation or notice-compliance routes for follow-up", "Check timelines, notices, and revised-return needs"],
              ],
            }
          : undefined,
        items: ["Do not use estimates as final filing advice", "Ask for expert review when records conflict or the case is document-heavy"],
      },
    ],
    links: spec.links,
    requiredTerms: spec.requiredTerms,
  };
}

const COMMERCIAL_ROUTE_CONTENT = Object.fromEntries(
  commercialRouteSpecs.map((spec) => [spec.route, commercialRouteContent(spec)]),
) as Record<string, PriorityItrRouteContent>;

export const PRIORITY_ITR_ROUTE_CONTENT = {
  "/itr-filing": {
    highlights: [
      "Commercial ITR filing pillar for AY 2026-27",
      "CA-assisted review for Form 16, AIS, Form 26AS, refunds, and notices",
      "Routes taxpayers from evidence gathering to the correct filing path",
    ],
    sections: [
      {
        heading: "Who this is for",
        body:
          "Use this ITR filing service page when FY 2025-26 income needs an AY 2026-27 return and the taxpayer wants a guided path from documents to form selection, computation, review, filing, and e-verification. It is especially relevant for salary, capital gains, freelance income, refund claims, AIS mismatch, and notice-risk cases.",
        items: ["Salaried taxpayers with Form 16 or multiple employers", "Investors, freelancers, and taxpayers with refund or notice questions"],
      },
      {
        heading: "Documents needed",
        body:
          "Before starting assisted filing, keep source records ready so every figure can be traced. The core evidence file should include Form 16 or Form 16A, AIS, TIS, Form 26AS, bank statements, deduction proofs, capital gains reports where applicable, challans, and bank validation proof for refunds.",
        items: ["Form 16, AIS, TIS, and Form 26AS", "Broker statements, deduction proofs, challans, and refund-bank validation where relevant"],
      },
      {
        heading: "Common mistakes",
        body:
          "The most common ITR filing mistakes are route mistakes: choosing ITR-1 when ITR-2 or ITR-3 is required, claiming TDS without matching income, filing before AIS or Form 26AS settles, using the wrong correction route, or selecting a tax regime without proof-backed comparison.",
        items: ["Do not rely only on portal prefill", "Do not treat revised return, rectification, ITR-U, grievance, and notice reply as interchangeable"],
      },
      {
        heading: "Related calculator",
        body:
          "Use the income tax calculator and regime comparator to estimate tax before filing. Calculator output is useful for planning, but the final return still needs official-record matching, correct form selection, and document review.",
        items: ["Compare old and new regimes", "Save the estimate used for review"],
      },
      {
        heading: "Related guide",
        body:
          "The AY 2026-27 ITR season hub and salary tax guide explain the surrounding filing decisions: when to wait for Form 16, how to reconcile AIS and Form 26AS, when capital gains change the ITR form, and when refund or notice risk justifies expert review.",
        items: ["Use the hub for current-season filing sequence", "Use specific guides for salary, AIS mismatch, and capital gains decisions"],
      },
      {
        heading: "Get CA review",
        body:
          "CA review is recommended when the return involves capital gains, business or freelance income, foreign assets, a large refund, an AIS/TDS mismatch, a defective-return notice, or uncertainty about the correct ITR form. MyeCA should present this as process-based review, not as a guaranteed refund or outcome.",
        items: ["Review the evidence file before submission", "Keep the final computation and acknowledgement after e-verification"],
      },
    ],
    links: [
      { label: "compare old vs new tax regime", href: "/calculators/regime-comparator" },
      { label: "check ITR form eligibility", href: "/itr/form-selector" },
      { label: "upload Form 16", href: "/form16-parser" },
      { label: "review AIS mismatch", href: "/blog/wait-for-ais-form-26as-before-filing-itr-ay-2026-27" },
      { label: "file salaried ITR", href: "/services/itr-for-salaried" },
      { label: "read the AY 2026-27 ITR season hub", href: "/itr-season-2026" },
    ],
    requiredTerms: ["ITR filing", "AY 2026-27", "Form 16", "AIS", "CA review"],
  },
  "/": {
    highlights: [
      "AY 2026-27 ITR filing path",
      "Form 16, AIS, and Form 26AS checks",
      "Income tax calculator and CA review options",
    ],
    sections: [
      {
        heading: "AY 2026-27 filing path",
        body:
          "MyeCA helps Indian taxpayers move from income records to the right ITR form for AY 2026-27. The public workflow starts with salary, Form 16, AIS, Form 26AS, deductions, capital gains, and refund-readiness checks before a filing path is selected.",
        items: ["Choose ITR-1, ITR-2, ITR-3, or ITR-4 based on facts", "Compare old and new regimes before submission"],
      },
      {
        heading: "Documents and review signals",
        body:
          "The priority season pages connect calculators, Form 16 extraction, filing checklists, and assisted review. This gives search crawlers and taxpayers a consistent topical path around salary income, TDS, deductions, AIS mismatch, and e-verification.",
        items: ["Review Form 16 against AIS and Form 26AS", "Use calculators as estimates, then verify the return"],
      },
    ],
    links: [
      { label: "Choose your ITR form", href: "/itr/form-selector" },
      { label: "ITR filing for salaried employees", href: "/services/itr-for-salaried" },
      { label: "Income tax calculator AY 2026-27", href: "/calculators/income-tax" },
      { label: "Form 16 parser", href: "/form16-parser" },
      { label: "ITR season hub", href: "/itr-season-2026" },
    ],
    requiredTerms: ["AY 2026-27", "ITR", "Form 16", "AIS"],
  },
  "/blog": {
    highlights: [
      "ITR season explainers",
      "Salary, TDS, AIS, and refund topics",
      "Links from guides to filing tools",
    ],
    sections: [
      {
        heading: "ITR season knowledge hub",
        body:
          "The MyeCA blog groups AY 2026-27 income tax articles around taxpayer questions that usually appear during filing season: when to file, whether to wait for Form 16, how to match TDS, and which form to choose.",
        items: ["Use practical filing examples", "Link back to calculators and form-selection tools"],
      },
      {
        heading: "Evidence-first filing guidance",
        body:
          "Crawler-visible blog summaries should make the topical relationship clear before JavaScript loads. The priority path connects salary records, AIS and Form 26AS checks, tax regime comparison, refund status, and CA review decisions.",
        items: ["Keep official-record checks visible", "Avoid unsupported ranking or guarantee claims"],
      },
    ],
    links: [
      { label: "When will ITR filing start AY 2026-27", href: "/blog/when-will-itr-filing-start-ay-2026-27" },
      { label: "ITR season hub", href: "/itr-season-2026" },
      { label: "Choose your ITR form", href: "/itr/form-selector" },
      { label: "Income tax calculator", href: "/calculators/income-tax" },
    ],
    requiredTerms: ["AY 2026-27", "ITR", "Form 16", "AIS"],
  },
  "/services/itr-for-salaried": {
    highlights: [
      "Salaried ITR filing support",
      "Form 16 and TDS review",
      "Regime comparison before filing",
    ],
    sections: [
      {
        heading: "Salaried ITR review",
        body:
          "This service page supports taxpayers with salary income who need to prepare an AY 2026-27 return using Form 16, AIS, Form 26AS, deductions, bank interest, and refund-bank validation. It explains the filing workflow without promising a guaranteed refund or outcome.",
        items: ["Check Form 16 against salary slips", "Match TDS with AIS and Form 26AS"],
      },
      {
        heading: "When expert review helps",
        body:
          "A CA-assisted path is useful when the taxpayer changed jobs, has multiple Form 16s, receives notice or demand communication, sees AIS mismatch, or needs old-versus-new regime comparison before choosing the final return position.",
        items: ["Multiple employers or arrears", "Mismatch, refund, or deduction questions"],
      },
    ],
    links: [
      { label: "Start with ITR form selection", href: "/itr/form-selector" },
      { label: "Parse Form 16", href: "/form16-parser" },
      { label: "Estimate income tax", href: "/calculators/income-tax" },
      { label: "Salary tax calculator guide", href: "/learn/guide/salary-tax-calculator-guide-ay-2026-27" },
    ],
    requiredTerms: ["salaried", "Form 16", "AY 2026-27", "TDS"],
  },
  "/calculators/income-tax": {
    highlights: [
      "AY 2026-27 income tax estimate",
      "Old versus new regime comparison",
      "Use before selecting the ITR path",
    ],
    sections: [
      {
        heading: "Estimate before filing",
        body:
          "The income tax calculator gives taxpayers a planning estimate for AY 2026-27 before they choose an ITR path. It should be used with Form 16, AIS, Form 26AS, salary components, deductions, other income, and tax paid records.",
        items: ["Compare old and new regimes", "Check rebate, cess, and deduction impact"],
      },
      {
        heading: "Calculator result is not the return",
        body:
          "The final return still needs official-record matching and correct form selection. The calculator page links to the filing selector, salaried ITR service, and salary guide so users can move from estimate to evidence-backed filing.",
        items: ["Keep a copy of the calculation", "Review mismatches before e-verification"],
      },
    ],
    links: [
      { label: "Choose ITR form", href: "/itr/form-selector" },
      { label: "ITR for salaried employees", href: "/services/itr-for-salaried" },
      { label: "Salary tax guide", href: "/learn/guide/salary-tax-calculator-guide-ay-2026-27" },
      { label: "ITR season hub", href: "/itr-season-2026" },
    ],
    requiredTerms: ["income tax", "AY 2026-27", "old", "new regime"],
  },
  "/itr/form-selector": {
    highlights: [
      "ITR-1, ITR-2, ITR-3, and ITR-4 guidance",
      "Salary, capital gains, business, and foreign asset checks",
      "Pre-filing route before assisted review",
    ],
    sections: [
      {
        heading: "Choose the correct ITR form",
        body:
          "The form selector helps taxpayers decide whether a simple salary return is enough or whether facts such as capital gains, business income, foreign assets, multiple properties, or carried-forward losses require another ITR form.",
        items: ["Use ITR-1 only when eligibility fits", "Move to ITR-2 or ITR-3 when facts require it"],
      },
      {
        heading: "Connect form choice to evidence",
        body:
          "Form selection should happen after checking Form 16, AIS, Form 26AS, broker statements, bank interest, and deduction proofs. The page links to calculators and document tools so search crawlers see the full filing topic cluster.",
        items: ["Review income heads before filing", "Ask for CA review when records conflict"],
      },
    ],
    links: [
      { label: "ITR filing for salaried employees", href: "/services/itr-for-salaried" },
      { label: "Income tax calculator", href: "/calculators/income-tax" },
      { label: "Form 16 parser", href: "/form16-parser" },
      { label: "ITR season hub", href: "/itr-season-2026" },
    ],
    requiredTerms: ["ITR-1", "ITR-2", "ITR-3", "Form 16"],
  },
  "/form16-parser": {
    highlights: [
      "Form 16 extraction workflow",
      "Salary, TDS, deductions, and employer details",
      "Pre-fill support before ITR review",
    ],
    sections: [
      {
        heading: "Form 16 to filing inputs",
        body:
          "The Form 16 parser page explains how salary, employer TAN, exemptions, deductions, and TDS fields can be extracted or organized before the taxpayer chooses the AY 2026-27 return path.",
        items: ["Compare extracted salary with payslips", "Match TDS with AIS and Form 26AS"],
      },
      {
        heading: "Use extracted data carefully",
        body:
          "Parsed data should be reviewed before filing because AIS, Form 26AS, bank interest, capital gains, and other income can change the final tax computation. The page links back to calculators and the ITR form selector for the next step.",
        items: ["Do not file from Form 16 alone", "Keep proof for deductions and refund claims"],
      },
    ],
    links: [
      { label: "Choose ITR form", href: "/itr/form-selector" },
      { label: "ITR for salaried employees", href: "/services/itr-for-salaried" },
      { label: "Income tax calculator", href: "/calculators/income-tax" },
      { label: "Salary tax guide", href: "/learn/guide/salary-tax-calculator-guide-ay-2026-27" },
    ],
    requiredTerms: ["Form 16", "TDS", "AY 2026-27", "AIS"],
  },
  "/itr-season-2026": {
    highlights: [
      "AY 2026-27 filing checklist",
      "Form 16, AIS, and refund readiness",
      "Tools and guides for priority ITR queries",
    ],
    sections: [
      {
        heading: "ITR season readiness",
        body:
          "The AY 2026-27 ITR season hub connects the most important pre-filing tasks: collect Form 16, download AIS and Form 26AS, compare tax regimes, identify the correct ITR form, and keep refund-bank validation ready.",
        items: ["Prepare records before utility submission", "Check mismatch risk before filing"],
      },
      {
        heading: "Priority taxpayer journeys",
        body:
          "The hub links salary, capital gains, refund, and mismatch topics to tools that help users act. This strengthens the ITR topic cluster for crawlers while keeping the page useful for taxpayers who need a direct next step.",
        items: ["Move from checklist to calculator", "Move from calculator to filing path"],
      },
    ],
    links: [
      { label: "Choose ITR form", href: "/itr/form-selector" },
      { label: "Parse Form 16", href: "/form16-parser" },
      { label: "Income tax calculator", href: "/calculators/income-tax" },
      { label: "ITR for salaried employees", href: "/services/itr-for-salaried" },
      { label: "When will filing start", href: "/blog/when-will-itr-filing-start-ay-2026-27" },
    ],
    requiredTerms: ["AY 2026-27", "ITR", "Form 16", "AIS"],
  },
  "/trust": {
    highlights: [
      "CA-led review workflow where shown",
      "Editorial policy and correction policy for tax content",
      "Secure document and data handling expectations",
    ],
    sections: [
      {
        heading: "CA review workflow",
        body:
          "MyeCA should describe CA review as a documented process: collect source records, reconcile official data, identify form and schedule requirements, prepare the computation, review mismatches, and preserve acknowledgement evidence after filing. The trust page must not imply guaranteed refunds, guaranteed acceptance, or automatic professional advice without a visible review step.",
        items: ["Source document collection", "Computation and mismatch review", "Final acknowledgement preservation"],
      },
      {
        heading: "Editorial policy and correction policy",
        body:
          "The editorial policy should explain that public tax guides are educational, source-backed, and updated when filing-season facts change. The correction policy should invite users to report outdated dates, form references, or broken official-source links so content can be reviewed and corrected.",
        items: ["Use official source links where legal interpretation matters", "Record visible reviewed or updated dates for important ITR content"],
      },
      {
        heading: "Data handling and document privacy",
        body:
          "Data handling should be framed around tax-document sensitivity: Form 16, AIS, Form 26AS, bank statements, broker reports, notices, and identity documents should be uploaded only through secure product workflows or approved support channels. Public pages should never request secrets in open text.",
        items: ["Avoid sharing PAN, Aadhaar, passwords, or OTPs in public messages", "Use secure upload and account workflows for filing documents"],
      },
      {
        heading: "Refund/payment scope",
        body:
          "The refund/payment scope should clearly separate platform fees, government tax payments, payment receipts, refund timing, and department processing. MyeCA can help prepare or review a filing position, but refund release and assessment processing remain with the Income Tax Department.",
        items: ["Keep challans and payment receipts", "Track refund status through official or product-supported routes"],
      },
      {
        heading: "Contact and escalation",
        body:
          "Trust signals improve when users can find contact details, support expectations, legal policies, privacy terms, and escalation paths. These process signals are safer than adding fake ratings, fake review counts, or unsupported credential schema.",
        items: ["Link to contact, privacy, refund, and disclaimer pages", "Use verifiable reviewer details only where they are visible on-page"],
      },
    ],
    links: [
      { label: "contact MyeCA support", href: "/contact" },
      { label: "read privacy policy", href: "/legal/privacy-policy" },
      { label: "review refund policy", href: "/legal/refund-policy" },
      { label: "read legal disclaimer", href: "/legal/disclaimer" },
      { label: "request expert consultation", href: "/expert-consultation" },
    ],
    requiredTerms: ["trust", "CA review", "data handling", "privacy", "refund"],
  },
  ...COMMERCIAL_ROUTE_CONTENT,
} satisfies Partial<Record<PriorityItrSearchRoute, PriorityItrRouteContent>>;
