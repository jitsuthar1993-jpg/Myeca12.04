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

function sentenceCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function commercialRouteContent(spec: CommercialRouteSpec): PriorityItrRouteContent {
  const isComparison = spec.route.startsWith("/compare/");
  const isService = spec.route.startsWith("/services/") || ["/gst-filing"].includes(spec.route);
  const label = spec.label.replace(/\bservice\b/i, "").trim();
  const comparisonSections: StaticRouteBodySection[] = [
    {
      heading: `${sentenceCase(label)} comparison method`,
      body: `The ${label} comparison method starts with one representative case for ${spec.audience}: define the need to ${spec.task}, document ${spec.proof}, and collect current terms plus a dated scope from every option being assessed.`,
      items: [
        `Use the same ${spec.requiredTerms[0]} facts, period, and requested outcome for every option`,
        `Record the date and source of each provider's current terms`,
      ],
    },
    {
      heading: `${sentenceCase(spec.requiredTerms[1])}: compare scope, cost, and follow-up`,
      body: `For ${spec.audience}, the useful comparison covers included work, exclusions, document support, correction handling, communication, and follow-up after the stated task; compare those written terms against ${spec.proof} before paying.`,
      table: {
        headers: ["Decision area", "What to compare", "What to verify"],
        rows: [
          [`${spec.requiredTerms[0]} scope`, "Included work, exclusions, and extra fees", "Confirm the dated written scope before payment"],
          [`${spec.requiredTerms[0]} records`, "Upload, review, and case-tracking workflow", "Check access, reviewer, and retention terms"],
          [`${spec.requiredTerms[1]} follow-up`, "Support after submission or filing", "Check timelines, notices, and correction routes"],
        ],
      },
      items: [
        "Retain the dated quote and scope used for the decision",
        `Request a fresh ${spec.requiredTerms[0]} comparison when the case facts materially change`,
      ],
    },
    {
      heading: `${sentenceCase(spec.requiredTerms[2])} evidence limits`,
      body: `This comparison does not establish superiority, guarantee an outcome, or replace the provider's current written terms; it helps ${spec.audience} identify which option fits the documented ${spec.requiredTerms[1]} need and which questions remain open.`,
      items: [
        `Verify unsupported ${spec.requiredTerms[0]} claims directly with the provider`,
        `Repeat the method when ${spec.requiredTerms[2]} facts, scope, or pricing change`,
      ],
    },
  ];
  const serviceSections: StaticRouteBodySection[] = [
    {
      heading: `${sentenceCase(label)} included scope and outside work`,
      body: `For ${spec.audience}, the included ${label} outcome is the preparation and review needed to ${spec.task} from the agreed records. Work outside that initial scope includes unrelated record correction, government fees, authority representation, and additional ${spec.requiredTerms[0]} periods unless the written scope states otherwise.`,
      items: [
        `Confirm the included ${spec.requiredTerms[0]} period, deliverable, and follow-up`,
        `${sentenceCase(spec.audience)} should list outside work, government fees, and dependencies for the task to ${spec.task}`,
      ],
    },
    {
      heading: `${sentenceCase(spec.requiredTerms[1])} records, timeline, and delay risk`,
      body: `Build the working file from ${spec.proof}. Delay risk increases when ${spec.requiredTerms[1]} records conflict, authority access is unavailable, a dependency is incomplete, or the deadline leaves no time to correct the submitted values.`,
      items: [
        `Trace each submitted ${spec.requiredTerms[0]} value to a supporting record`,
        `Resolve ${spec.requiredTerms[1]} gaps before confirming the timeline`,
      ],
    },
    {
      heading: `${sentenceCase(spec.requiredTerms[2])} escalation and next step`,
      body: `Escalate before submission when ${spec.requiredTerms[0]} facts remain disputed, an authority query or notice exists, a dependency threatens the deadline, or the requested work extends outside the included outcome; keep the agreed scope, supporting records, submitted values, and acknowledgement together.`,
      items: [
        `Name the owner of each unresolved ${spec.requiredTerms[1]} issue`,
        `Confirm the next ${spec.requiredTerms[2]} action and evidence handoff`,
      ],
    },
  ];
  const calculatorSections: StaticRouteBodySection[] = [
    {
      heading: `${sentenceCase(label)} inputs and output`,
      body: `${sentenceCase(spec.label)} helps ${spec.audience} ${spec.task}. Use inputs from ${spec.proof}; the output is a reproducible ${spec.requiredTerms[0]} estimate tied to the selected period, rates, and assumptions.`,
      items: [
        `Enter dated ${spec.requiredTerms[0]} inputs instead of remembered amounts`,
        `Save the ${label} output period, rates, and assumptions`,
      ],
    },
    {
      heading: `${sentenceCase(spec.requiredTerms[1])} limits and verification`,
      body: `The output is a planning estimate for ${spec.audience}, with limits created by rate changes, classification questions, omitted fees, and incomplete records. Verify the result against ${spec.proof} before filing, borrowing, investing, or making a payment decision.`,
      items: [
        `Verify the ${spec.requiredTerms[0]} output with the underlying records`,
        `Recalculate ${spec.requiredTerms[0]} after a material input or rule change`,
      ],
    },
    {
      heading: `${sentenceCase(spec.requiredTerms[2])} next workflow`,
      body: `After reviewing the saved input and output, ${spec.audience} should carry the estimate into the relevant ${spec.requiredTerms[1]} workflow, retain the source records, and resolve any ${spec.requiredTerms[2]} limitation before acting.`,
      items: [
        `Retain the input file and dated ${spec.requiredTerms[0]} output`,
        `${sentenceCase(spec.audience)} should use the related workflow after reviewing the estimate to ${spec.task}`,
      ],
    },
  ];

  return {
    highlights: [
      spec.label,
      `For ${spec.audience}`,
      sentenceCase(spec.task),
      `Prepare ${spec.proof}`,
    ],
    sections: isComparison ? comparisonSections : isService ? serviceSections : calculatorSections,
    links: spec.links,
    requiredTerms: spec.requiredTerms,
  };
}

const COMMERCIAL_ROUTE_CONTENT = Object.fromEntries(
  commercialRouteSpecs.map((spec) => [spec.route, commercialRouteContent(spec)]),
) as Record<string, PriorityItrRouteContent>;

export const PRIORITY_ITR_ROUTE_CONTENT = {
  "/services/iso-certification": {
    highlights: [
      "Certification-readiness scope before an application",
      "Process, evidence, and operating records to prepare",
      "Certification-body decisions remain outside MyeCA control",
    ],
    sections: [
      {
        heading: "Define the certification scope and operating process",
        body:
          "The included ISO-certification readiness scope identifies the standard, locations, products or services, and operating processes that need to be assessed. Work outside the readiness scope includes the certification body's audit, certification decision, and surveillance activity.",
        items: ["Map the relevant process and responsible people", "List existing policies, records, and unresolved gaps"],
      },
      {
        heading: "Prepare evidence before engaging a certification body",
        body:
          "Organise policies, process records, corrective actions, training evidence, and any prior audit findings before requesting an external assessment. Confirm the written scope, fees, timeline, and excluded work with the selected certification body.",
      },
      {
        heading: "Manage certification delay and escalation triggers",
        body:
          "Delay risk rises when operating records are missing, corrective actions remain open, or the selected certification body changes its evidence request. Escalate before assessment when the proposed scope excludes a material location, product, process, or unresolved prior-audit finding. Record who owns each corrective action and its evidence deadline.",
      },
    ],
    links: [
      { label: "Business compliance services", href: "/all-services" },
      { label: "Audit readiness service", href: "/services/audit-services" },
    ],
    requiredTerms: ["ISO", "certification", "evidence"],
  },
  "/services/labour-law-compliance": {
    highlights: [
      "Employer-registration and recurring filing readiness",
      "Payroll, employee, and establishment records to reconcile",
      "State and central obligations depend on the actual workforce",
    ],
    sections: [
      {
        heading: "Map obligations from the establishment and workforce facts",
        body:
          "The included labour-law readiness scope maps the establishment location, activity, employee count, wage records, contractor arrangements, and existing registrations to the likely compliance route. Work outside that initial scope includes payroll processing, dispute representation, and correction of unrelated historical records.",
        items: ["Reconcile payroll and employee records", "Identify registrations, returns, and payment deadlines"],
      },
      {
        heading: "Keep a traceable employer compliance file",
        body:
          "Retain registration records, payroll workings, challans, returns, notices, and proof of corrective action. Escalate gaps involving missed deadlines, worker classification, contractor records, or authority communication before the next filing.",
      },
      {
        heading: "Identify labour-compliance delay risk",
        body:
          "Delay risk increases when payroll and employee records disagree, registrations cover the wrong establishment, or contractor data arrives after the filing cut-off. Escalate before the deadline when applicability is disputed, an authority notice exists, or a missed prior obligation affects the current filing.",
      },
    ],
    links: [
      { label: "EPFO and ESIC readiness guide", href: "/blog/esi-epfo-registration-employer-payroll-readiness-guide" },
      { label: "Compliance management service", href: "/services/compliance-management" },
    ],
    requiredTerms: ["labour", "payroll", "compliance"],
  },
  "/tax-loss-harvesting": {
    highlights: [
      "Capital loss review before year end",
      "Realised gains, eligible losses, and transaction-cost records",
      "Filing and investment decisions kept separate",
    ],
    sections: [
      {
        heading: "Identify gains and eligible losses from transaction records",
        body:
          "Review realised gains and losses using broker statements, contract notes, holding periods, and cost records. Do not assume an unrealised fall in value creates a tax loss.",
        items: ["Separate short-term and long-term positions", "Check transaction dates, costs, and corporate actions"],
      },
      {
        heading: "Test the tax result before placing a trade",
        body:
          "Estimate how an eligible loss may offset gains under the applicable rules, then consider transaction costs, investment suitability, and portfolio consequences separately. A tax estimate alone does not justify selling an investment.",
        items: ["Keep the tax working with broker evidence", "Recheck the final return and carry-forward treatment"],
      },
    ],
    links: [
      { label: "Capital gains calculator", href: "/calculators/capital-gains" },
      { label: "Capital gains import", href: "/capital-gains-import" },
      { label: "Capital gains filing guide", href: "/blog/capital-gains-trading-income-itr-guide-ay-2026-27" },
    ],
    requiredTerms: ["capital loss", "capital gains", "broker"],
  },
  "/itr-filing": {
    highlights: [
      "AY 2026-27 assisted ITR filing",
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
          "CA-assisted review can be useful when the return involves capital gains, business or freelance income, foreign assets, a large refund, an AIS/TDS mismatch, a defective-return notice, or uncertainty about the correct ITR form. The review is a documented process and does not guarantee a refund or outcome.",
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
          "Indian taxpayers should move from income records to the right ITR form for AY 2026-27. The public workflow starts with salary, Form 16, AIS, Form 26AS, deductions, capital gains, and refund-readiness checks before a filing path is selected.",
        items: ["Choose ITR-1, ITR-2, ITR-3, or ITR-4 based on facts", "Compare old and new regimes before submission"],
      },
      {
        heading: "Documents and review signals",
        body:
          "The filing workflow connects calculators, Form 16 extraction, filing checklists, and assisted review around salary income, TDS, deductions, AIS mismatch, and e-verification.",
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
          "The guides connect salary records, AIS and Form 26AS checks, tax-regime comparison, refund status, and assisted-review decisions. Each article should help the reader move from a question to the records and action that resolve it.",
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
          "The included salaried ITR scope prepares and reviews the agreed AY 2026-27 return using Form 16, AIS, Form 26AS, deductions, bank interest, and refund-bank validation. Work outside the initial scope includes unrelated prior-year correction, notice representation, valuation, and business-income bookkeeping unless separately confirmed.",
        items: ["Check Form 16 against salary slips", "Match TDS with AIS and Form 26AS"],
      },
      {
        heading: "When expert review helps",
        body:
          "A CA-assisted path is useful when the taxpayer changed jobs, has multiple Form 16s, receives notice or demand communication, sees AIS mismatch, or needs old-versus-new regime comparison before choosing the final return position.",
        items: ["Multiple employers or arrears", "Mismatch, refund, or deduction questions"],
      },
      {
        heading: "Salaried filing delay and escalation",
        body:
          "Delay risk rises when an employer Form 16 is missing, AIS or Form 26AS conflicts with salary records, or refund-bank validation remains incomplete. Escalate before filing when the correct ITR form is uncertain, a notice or demand exists, or foreign assets, capital gains, or business income change the agreed scope.",
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
        heading: "Income tax calculator inputs and output",
        body:
          "The income tax calculator gives taxpayers a planning output for AY 2026-27 before they choose an ITR path. Enter inputs from Form 16, AIS, Form 26AS, salary components, deductions, other income, and tax-paid records.",
        items: ["Compare old and new regimes", "Check rebate, cess, and deduction impact"],
      },
      {
        heading: "Income tax output limits and verification",
        body:
          "The calculator output has limits: it is not the final return, does not settle an AIS mismatch, and cannot choose the correct ITR form without the taxpayer facts. Verify the estimate against official records before moving to the filing selector, salaried ITR service, or salary guide.",
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
        heading: "Match the ITR form to the taxpayer facts",
        body:
          "The form selector helps taxpayers decide whether a simple salary return is enough or whether facts such as capital gains, business income, foreign assets, multiple properties, or carried-forward losses require another ITR form.",
        items: ["Use ITR-1 only when eligibility fits", "Move to ITR-2 or ITR-3 when facts require it"],
      },
      {
        heading: "Connect form choice to evidence",
        body:
          "Choose the form after checking Form 16, AIS, Form 26AS, broker statements, bank interest, and deduction proofs. Capital gains, business income, foreign assets, multiple properties, or carried-forward losses can change the required form.",
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
          "The hub links salary, capital gains, refund, and mismatch topics to tools that help taxpayers act. Start with the income type or mismatch involved, then continue to the relevant records, calculator, or filing path.",
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
      "Document-based professional review where shown",
      "Editorial policy and correction policy for tax content",
      "Secure document and data handling expectations",
    ],
    sections: [
      {
        heading: "Professional review workflow",
        body:
          "A CA-assisted review is a documented process: collect source records, reconcile official data, identify form and schedule requirements, prepare the computation, review mismatches, and preserve acknowledgement evidence after filing. It does not guarantee a refund, acceptance, or outcome.",
        items: ["Source document collection", "Computation and mismatch review", "Final acknowledgement preservation"],
      },
      {
        heading: "Editorial policy and correction policy",
        body:
          "Public tax guides are educational, source-backed, and updated when filing-season facts change. Readers can report outdated dates, form references, or broken official-source links for review and correction.",
        items: ["Use official source links where legal interpretation matters", "Record visible reviewed or updated dates for important ITR content"],
      },
      {
        heading: "Data handling and document privacy",
        body:
          "Form 16, AIS, Form 26AS, bank statements, broker reports, notices, and identity documents contain sensitive information. Upload them only through secure product workflows or approved support channels, and never share passwords or OTPs in open text.",
        items: ["Avoid sharing PAN, Aadhaar, passwords, or OTPs in public messages", "Use secure upload and account workflows for filing documents"],
      },
      {
        heading: "Refund/payment scope",
        body:
          "Platform fees, government tax payments, payment receipts, refund timing, and department processing are separate. MyeCA can help prepare or review a filing position, but refund release and assessment processing remain with the Income Tax Department.",
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
    requiredTerms: ["trust", "professional review", "data handling", "privacy", "refund"],
  },
  ...COMMERCIAL_ROUTE_CONTENT,
  "/gst-filing": {
    highlights: [
      "Period-specific GSTR-1 and GSTR-3B working",
      "Sales, credit notes, GSTR-2B, ledgers, and payment reconciled",
      "Approval and unresolved differences recorded before submission",
    ],
    sections: [
      {
        heading: "Define the GSTIN, return period, and included filings",
        body:
          "The included GST filing scope must identify the GSTIN, tax period, filing frequency, and returns to be prepared. Work outside the recurring-period scope includes historical amendments, annual returns, registration changes, notice replies, and government tax payment unless the written engagement adds them.",
        items: ["Confirm open returns and filing frequency", "Name the person who approves outward supply and tax liability"],
      },
      {
        heading: "Close the period from books to portal ledgers",
        body:
          "Reconcile sales invoices, debit and credit notes, advances, exports, purchase register, GSTR-2B, e-way bills, and electronic ledgers. Identify unavailable or disputed ITC and explain differences between GSTR-1, GSTR-3B, the books, and the payment working before submission.",
        items: ["Record amounts carried into a later period", "Retain the approved return working and challan"],
      },
      {
        heading: "Assign delay risk and escalation before the cut-off",
        body:
          "GST filing delay risk rises when books arrive late, portal data disagrees, prior-period amendments affect current values, or the business cannot approve liability. Escalate suspension, notice, disputed ITC, classification, export, or registration issues before the filing deadline.",
      },
    ],
    links: [
      { label: "GST calculator", href: "/calculators/gst" },
      { label: "GST registration preparation", href: "/services/gst-registration" },
      { label: "GST return filing scope", href: "/services/gst-returns" },
    ],
    requiredTerms: ["GST", "GSTR", "ITC"],
  },
  "/services/gst-registration": {
    highlights: [
      "Applicability and registration type checked before application",
      "Promoter, premises, bank, and activity evidence aligned",
      "Clarifications and first-return work treated as separate events",
    ],
    sections: [
      {
        heading: "Settle why and where registration is required",
        body:
          "The included GST registration scope begins with the entity, activities, turnover facts, states, places of business, supply model, and requested registration type. Work outside the application includes GST returns, invoicing setup, historical liability review, cancellation, amendment, and notice representation unless separately agreed.",
        items: ["Record the applicability basis and registration type", "Confirm every principal and additional place of business"],
      },
      {
        heading: "Prepare an application that survives document checks",
        body:
          "Match PAN, constitution documents, promoter identity, authorisation, premises evidence, bank proof, contact details, and business activity before filing. A consent letter, rent record, utility bill, or ownership document should support the address used in the application.",
        items: ["Check names and addresses across all records", "Retain the filed form and application reference number"],
      },
      {
        heading: "Respond to registration delay and escalation triggers",
        body:
          "Registration delay can follow an address mismatch, incomplete authorisation, unclear activity, duplicate registration fact, or unanswered clarification. Escalate disputed applicability, prior non-registration exposure, rejection, suspension, or authority communication; those issues sit outside a routine new application.",
      },
    ],
    links: [
      { label: "GST filing preparation", href: "/gst-filing" },
      { label: "Company registration preparation", href: "/services/company-registration" },
      { label: "GST registration roadmap", href: "/blog/gst-registration-compliance-roadmap" },
    ],
    requiredTerms: ["GST registration", "business", "documents"],
  },
  "/services/msme-udyam-registration": {
    highlights: [
      "Enterprise identity and activity checked before Udyam submission",
      "PAN, Aadhaar, GST, turnover, and investment records aligned",
      "Benefits and scheme eligibility kept outside registration claims",
    ],
    sections: [
      {
        heading: "Identify the enterprise and included Udyam task",
        body:
          "The included Udyam registration task identifies the enterprise, proprietor or authorised person, activities, locations, and records needed for the current submission. Work outside registration includes loan approval, subsidy eligibility, tender qualification, tax advice, and correction of unrelated PAN, Aadhaar, GST, or company records.",
        items: ["Confirm the enterprise that should hold the registration", "List manufacturing and service activities accurately"],
      },
      {
        heading: "Reconcile classification inputs before submission",
        body:
          "Compare Aadhaar, PAN, GST details where applicable, organisation records, activity codes, turnover, and investment information. Do not choose a classification from a desired benefit; use the enterprise's supported facts and retain the certificate and submitted information.",
        items: ["Resolve conflicting identity or organisation data", "Keep the Udyam number and registered contact details"],
      },
      {
        heading: "Handle Udyam delay and escalation separately",
        body:
          "Delay risk increases when linked records disagree, an earlier registration exists, activity classification is unclear, or portal verification fails. Escalate ownership disputes, material correction requests, eligibility questions, and any promise of finance or subsidy because those outcomes remain outside Udyam registration.",
      },
    ],
    links: [
      { label: "Startup services", href: "/startup-services" },
      { label: "MSME subsidy readiness guide", href: "/blog/msme-udyam-registration-subsidy-readiness-guide" },
      { label: "Government scheme document checklist", href: "/blog/government-schemes-msme-startup-eligibility-document-checklist" },
    ],
    requiredTerms: ["MSME", "Udyam", "registration"],
  },
  "/services/notice-compliance": {
    highlights: [
      "Notice, deadline, and response authority authenticated first",
      "Filed return and source evidence compared with each issue",
      "Payment, correction, disagreement, and appeal routes not conflated",
    ],
    sections: [
      {
        heading: "Authenticate the notice and define the included response",
        body:
          "The included notice-compliance scope starts with the official communication, assessment year, section, issue list, response channel, and deadline. Work outside the agreed response includes unrelated return correction, payment funding, appeal, hearing representation, and later notices unless the scope expressly covers them.",
        items: ["Download the notice and preserve the portal reference", "List every question and requested attachment"],
      },
      {
        heading: "Build the response from the filed position",
        body:
          "Compare the notice with the filed return, computation, AIS, Form 26AS, challans, schedules, and transaction evidence. Prepare an issue-by-issue response showing the fact, supporting document, and requested action. Do not upload a generic explanation where the notice asks for a specific reconciliation.",
        items: ["Tie each response statement to evidence", "Retain the submitted response and acknowledgement"],
      },
      {
        heading: "Control deadline risk and escalation",
        body:
          "Notice-response delay risk rises when portal access fails, third-party corrections are pending, records are missing, or the response owner is unclear. Escalate disputed law, material demand, penalty, prosecution, hearing, appeal, or an impossible deadline before submission; those events can require a different engagement.",
      },
    ],
    links: [
      { label: "Defective return response checklist", href: "/blog/defective-return-notice-section-139-9" },
      { label: "Section 143(1) intimation guide", href: "/blog/section-143-1-intimation-after-itr-filing" },
      { label: "Expert consultation intake", href: "/expert-consultation" },
    ],
    requiredTerms: ["notice", "compliance", "AIS"],
  },
  "/services/tax-planning": {
    highlights: [
      "Planning decisions tied to dated income and transaction facts",
      "Regime, deduction, gain, and cash-flow effects compared separately",
      "Returns, investments, and guaranteed savings kept outside planning claims",
    ],
    sections: [
      {
        heading: "Define the planning decision and included period",
        body:
          "The included tax-planning scope identifies the taxpayer, relevant financial year, expected income, proposed transaction, available choices, and deadline for acting. Work outside the review includes investment advice, product selection, return filing, legal documentation, and implementation unless separately agreed.",
        items: ["State the decision and latest action date", "Record assumptions that could change the comparison"],
      },
      {
        heading: "Model each option from supported figures",
        body:
          "Compare salary, business income, gains, deductions, losses, tax credits, cash flow, and transaction costs using dated records. Keep tax effect separate from commercial, investment, legal, and liquidity consequences. A lower tax estimate does not by itself make a transaction suitable.",
        items: ["Preserve the input sheet and option comparison", "Recalculate after a material fact or rule changes"],
      },
      {
        heading: "Identify planning delay and escalation events",
        body:
          "Tax-planning delay can remove an election, payment, investment, or transaction-timing option. Escalate uncertain residency, foreign assets, restructuring, valuation, disputed deductions, open notices, or unsupported figures before relying on the plan. Outcomes and savings remain outside any guarantee.",
      },
    ],
    links: [
      { label: "Tax regime comparator", href: "/calculators/regime-comparator" },
      { label: "Income tax calculator", href: "/calculators/income-tax" },
      { label: "Tax planning calendar", href: "/blog/tax-planning-calendar-for-individuals" },
    ],
    requiredTerms: ["tax planning", "deductions", "capital gains"],
  },
  "/services/tds-filing": {
    highlights: [
      "Quarter, form, TAN, challans, and deductee population established",
      "Payment register and tax deposit reconciled before return upload",
      "Defaults, corrections, and notices scoped outside routine filing",
    ],
    sections: [
      {
        heading: "Confirm the included TDS return and quarter",
        body:
          "The included TDS filing scope identifies the TAN, quarter, return form, payment categories, deductees, and filing deadline. Work outside the routine return includes old-quarter correction, lower-deduction applications, default resolution, notice response, and preparation of missing payroll or vendor books unless agreed separately.",
        items: ["Confirm Form 24Q, 26Q, or another applicable return", "Identify who approves deductee and challan data"],
      },
      {
        heading: "Reconcile deduction, deposit, and deductee records",
        body:
          "Match the payroll or payment register with deductee PAN, section, threshold, rate, deduction date, challan, and deposited amount. Resolve invalid PAN, unmatched challan, short deduction, late deposit, and gross-payment differences before generating the return and certificates.",
        items: ["Tie every filed deduction to a payment and challan", "Retain validation output, filed return, and acknowledgement"],
      },
      {
        heading: "Manage filing delay and escalation",
        body:
          "TDS filing delay risk rises when challans are unmatched, deductee data arrives late, payroll changes after approval, or a prior default affects the quarter. Escalate short deduction, interest, fee, correction, notice, or disputed payment classification before filing; those issues sit outside ordinary data upload.",
      },
    ],
    links: [
      { label: "TDS calculator", href: "/calculators/tds" },
      { label: "TDS return checklist", href: "/blog/tds-return-filing-checklist-employers-vendors" },
      { label: "Tax-credit mismatch guide", href: "/blog/tax-credit-mismatch-tds-form-26as-ay-2026-27" },
    ],
    requiredTerms: ["TDS filing", "TAN", "challan"],
  },
  "/compare/taxbuddy-alternative": {
    highlights: [
      "Compare support ownership, response channels, and post-filing follow-up",
      "Use one anonymised return scenario and dated written terms",
      "No provider ranking or guaranteed outcome",
    ],
    sections: [
      {
        heading: "Define the support problem before comparing providers",
        body:
          "A TaxBuddy alternative search is useful only after the taxpayer defines the support problem. Record the income heads, prior notices, missing documents, expected refund or demand question, and the help needed after filing. A simple salary return and a return involving gains, foreign assets, or an open notice should not be compared as if they require the same workflow.",
        items: [
          "Use an anonymised case summary when requesting scope and pricing",
          "State whether the need is preparation, review, filing, correction, or notice response",
        ],
      },
      {
        heading: "Test communication and case ownership",
        body:
          "Ask each provider who owns the case, which channels are used for document questions, how unresolved issues are recorded, and what happens after submission. Compare the written response with the taxpayer's preferred communication method and the deadline attached to the return or notice.",
        table: {
          headers: ["Support question", "Evidence to request", "Why it matters"],
          rows: [
            ["Who reviews the return?", "Named role and review stage", "Separates data collection from final review"],
            ["How are document gaps handled?", "Written issue list and response channel", "Shows whether missing facts can be tracked"],
            ["What follows filing?", "Correction, notice, and acknowledgement scope", "Prevents assumptions about post-filing help"],
          ],
        },
      },
      {
        heading: "Compare the dated scope, not a headline label",
        body:
          "Retain the quote, inclusions, exclusions, turnaround assumptions, refund or correction boundaries, and extra-fee conditions supplied for the same case. Confirm each provider's current terms directly. This method does not establish superiority for TaxBuddy, MyeCA, or another provider; it helps taxpayers identify which written support arrangement fits their facts.",
        items: [
          "Repeat the comparison if the return gains a new income head or notice",
          "Confirm current provider terms directly before payment",
        ],
      },
    ],
    links: [
      { label: "Compare filing options", href: "/compare" },
      { label: "Salaried ITR service scope", href: "/services/itr-for-salaried" },
      { label: "Notice response preparation", href: "/services/notice-compliance" },
    ],
    requiredTerms: ["TaxBuddy alternative", "case tracking", "ITR"],
  },
  "/services/gst-returns": {
    highlights: [
      "GSTR-1 and GSTR-3B preparation from period-specific records",
      "GSTR-2B and input-tax-credit differences identified before filing",
      "Amendments, notices, and historical clean-up scoped separately",
    ],
    sections: [
      {
        heading: "Confirm the return period and filing responsibility",
        body:
          "GST-return support begins with the GSTIN, filing frequency, tax period, registration status, and returns already filed. The agreed scope should state whether it covers GSTR-1, GSTR-3B, both returns, a nil return, or a separate annual or correction task. Government tax payments, old-period amendments, and authority representation are outside the recurring-period filing unless expressly included.",
        items: [
          "Confirm GSTIN, period, filing frequency, and open returns",
          "Identify who approves the final outward-supply and tax-payment values",
        ],
      },
      {
        heading: "Close the sales, credit-note, and input-credit working",
        body:
          "Prepare outward-supply data from invoices, debit notes, credit notes, advances, exports, and amendments relevant to the period. Compare the purchase register with GSTR-2B and record unavailable, disputed, reversed, or deferred input tax credit separately. The GSTR-1 values, GSTR-3B liability, electronic ledgers, and payment challan should be checked as one period file before submission.",
        table: {
          headers: ["Working area", "Records", "Issue to resolve"],
          rows: [
            ["Outward supplies", "Sales register, invoices, notes, and export records", "Missing, duplicated, or wrongly classified turnover"],
            ["Input tax credit", "Purchase register and GSTR-2B", "Eligibility, reversal, or vendor-reporting difference"],
            ["Tax payment", "Electronic ledgers and challan", "Cash requirement and payment allocation"],
          ],
        },
      },
      {
        heading: "Escalate period differences and delay risk before submission",
        body:
          "Escalation is needed when books and portal data do not agree, a prior-period amendment affects the current return, a notice or suspension exists, or the business cannot approve a material value before the deadline. These issues create filing delay risk and should be assigned before the cut-off. Retain the approved working, filed returns, challan, acknowledgement, and an issue list for amounts carried into a later period.",
        items: [
          "Record the owner and due date for each unresolved difference",
          "Scope historical correction or notice work separately from the current return",
        ],
      },
    ],
    links: [
      { label: "GST calculator", href: "/calculators/gst" },
      { label: "GST registration preparation", href: "/services/gst-registration" },
      { label: "GST filing overview", href: "/gst-filing" },
    ],
    requiredTerms: ["GST returns", "GSTR", "reconciliation"],
  },
  "/services/startup-india-registration": {
    highlights: [
      "DPIIT recognition readiness begins with entity eligibility",
      "Innovation and business-model evidence prepared for the application",
      "Recognition, tax benefits, and funding outcomes are separate decisions",
    ],
    sections: [
      {
        heading: "Test DPIIT eligibility before preparing the application",
        body:
          "The included Startup India registration scope begins by checking the incorporated entity type, incorporation date, turnover history, restructuring facts, and the activity described by the startup. Work outside this first scope includes incorporation, tax-exemption applications, funding applications, and legal opinions unless separately agreed.",
        items: ["Confirm entity and incorporation records", "Identify any eligibility fact that needs clarification"],
      },
      {
        heading: "Prepare the innovation and business-model narrative",
        body:
          "Build the DPIIT application from the incorporation certificate, entity PAN, founder authorisation, website or product evidence, and a concise explanation of innovation, improvement, scalability, or employment and wealth-creation potential. The narrative should be consistent with the company objects and the activity actually carried on.",
        items: ["Connect each business claim to a supporting record", "Keep founder authority and submission credentials current"],
      },
      {
        heading: "Manage recognition delay and escalation",
        body:
          "Delay risk increases when entity details conflict, the innovation explanation is generic, founder authority is missing, or a clarification request is unanswered. Escalate when eligibility is disputed or the application asks for a benefit outside recognition. Retain the submitted form, attachments, queries, responses, and recognition certificate if issued.",
        items: ["Assign every clarification request before its response deadline", "Scope tax-benefit and funding work outside recognition separately"],
      },
    ],
    links: [
      { label: "Startup services", href: "/startup-services" },
      { label: "Company registration preparation", href: "/services/company-registration" },
      { label: "Startup funding readiness", href: "/startup/funding" },
    ],
    requiredTerms: ["Startup India", "DPIIT", "registration"],
  },
  "/services/trademark-registration": {
    highlights: [
      "Applicant, mark, and class defined before filing",
      "Search findings and use evidence retained with the application",
      "Objection, opposition, and renewal work scoped separately",
    ],
    sections: [
      {
        heading: "Define the mark, owner, and filing class",
        body:
          "The included trademark registration work starts with the exact word, logo, or combined mark; the correct applicant; and the goods or services for which protection is sought. Work outside the initial filing includes brand strategy, assignments, objection replies, opposition proceedings, enforcement, and renewal unless the written scope adds them.",
        items: ["Confirm whether the applicant is an individual, proprietor, company, LLP, or other owner", "Describe actual and planned goods or services before selecting classes"],
      },
      {
        heading: "Use the search to identify filing risk",
        body:
          "A trademark search should examine similar words, spellings, logos, and relevant classes. Record the search date and the marks that create concern. A search cannot guarantee registration, but it can reveal conflicts that affect the mark, class description, or decision to file.",
        items: ["Retain search results and the reason for proceeding", "Prepare use claims and supporting evidence accurately"],
      },
      {
        heading: "Track examination delay and escalation events",
        body:
          "Delay risk arises when applicant details are inconsistent, the class description is unclear, the mark conflicts with an earlier application, or the registry issues an examination report. Escalate objection, opposition, hearing, assignment, or enforcement work outside the included filing scope. Keep the filed form, fee receipt, acknowledgement, status history, and later registry communication.",
        items: ["Confirm the application number and filed representation", "Assign ownership for every registry deadline"],
      },
    ],
    links: [
      { label: "Startup services", href: "/startup-services" },
      { label: "Company registration preparation", href: "/services/company-registration" },
      { label: "Trademark filing guide", href: "/blog/trademark-registration-india-search-class-filing-objection" },
    ],
    requiredTerms: ["trademark", "startup", "registration"],
  },
  "/services/company-registration": {
    highlights: [
      "Entity choice, ownership, capital, and objects settled before incorporation",
      "Director and premises evidence prepared for MCA filing",
      "Post-incorporation registrations and compliance scoped separately",
    ],
    sections: [
      {
        heading: "Settle the incorporation decisions first",
        body:
          "The included company registration scope begins with the proposed owners and directors, shareholding, capital, registered office, business objects, and name choices. Work outside incorporation can include shareholder agreements, sector licences, GST registration, payroll registrations, and recurring company filings unless expressly included.",
        items: ["Record promoter, director, and beneficial-ownership facts", "Choose names and objects that reflect the proposed activity"],
      },
      {
        heading: "Prepare director, subscriber, and office records",
        body:
          "Match PAN, identity, address, contact, and digital-signature records for each director and subscriber. Prepare registered-office evidence and owner consent where required. Inconsistent names, expired proofs, or an unsupported office address can stop the filing before the incorporation documents are considered.",
        items: ["Check identity details across every filing record", "Retain premises proof and authorisation with the incorporation file"],
      },
      {
        heading: "Handle name or filing delay before resubmission",
        body:
          "Delay risk increases when the proposed name conflicts, objects are unclear, subscriber data changes, or MCA requests resubmission. Escalate regulatory, ownership, or document conflicts before replying. After incorporation, retain the certificate, constitutional documents, PAN and TAN records, credentials, and a separate calendar for the first compliance actions.",
        items: ["Assign each resubmission point to its evidence owner", "Confirm which post-incorporation tasks remain outside the filing"],
      },
    ],
    links: [
      { label: "Startup registration overview", href: "/startup/registration" },
      { label: "Startup India recognition", href: "/services/startup-india-registration" },
      { label: "Compliance management", href: "/services/compliance-management" },
    ],
    requiredTerms: ["company registration", "startup", "documents"],
  },
  "/compare/indiafilings-alternative": {
    highlights: [
      "Compare responsibility across registration and recurring compliance",
      "Use a dated business-stage inventory and written handover terms",
      "No platform ranking or promised regulatory outcome",
    ],
    sections: [
      {
        heading: "Map the business stage before comparing support",
        body:
          "The IndiaFilings alternative method begins with the business stage: proposed entity, existing registrations, locations, employees, tax status, and upcoming deadlines. A founder seeking incorporation has a different support problem from an operating business that needs GST returns, payroll compliance, and annual company filings.",
        items: ["List every active registration and credential owner", "Separate one-time registrations from recurring obligations"],
      },
      {
        heading: "Compare document ownership and recurring cadence",
        body:
          "Ask who prepares each filing, who approves values, where source documents are stored, and how credentials and acknowledgements are returned. Compare correction, notice, renewal, and handover terms as well as the initial fee. The useful evidence is a dated responsibility matrix, not a broad list of services.",
        table: {
          headers: ["Business need", "Scope evidence", "Handover question"],
          rows: [
            ["Registration", "Authority, deliverable, fee, and dependencies", "Who retains credentials and certificate?"],
            ["Recurring filing", "Period, data cut-off, approval, and due date", "Who owns unresolved differences?"],
            ["Notice or correction", "Separate response scope and deadline", "What work attracts an additional fee?"],
          ],
        },
      },
      {
        heading: "Use current terms without assuming superiority",
        body:
          "Confirm IndiaFilings, MyeCA, and any other provider's current terms directly for the same business inventory. This comparison method does not establish superiority or guarantee registration, filing acceptance, or response time; it identifies which written allocation of work fits the business.",
        items: ["Retain the selected scope and responsibility matrix", "Repeat the comparison after a new registration, location, or employee group"],
      },
    ],
    links: [
      { label: "Startup services", href: "/startup-services" },
      { label: "Company registration preparation", href: "/services/company-registration" },
      { label: "GST return preparation", href: "/services/gst-returns" },
    ],
    requiredTerms: ["IndiaFilings alternative", "startup", "GST"],
  },
  "/compare/quicko-capital-gains-alternative": {
    highlights: [
      "Compare transaction import coverage and exception handling",
      "Test one anonymised broker dataset before relying on automation",
      "Tax classification and return-form decisions remain fact-specific",
    ],
    sections: [
      {
        heading: "Define the investment-data problem",
        body:
          "The Quicko capital gains alternative method starts with the assets and transaction sources involved: listed shares, mutual funds, F&O, intraday trades, VDA, foreign securities, or property. Record broker formats, corporate actions, missing cost data, AIS differences, and the return form likely to be required.",
        items: ["Use an anonymised sample containing the difficult transactions", "Identify which assets need manual classification or supporting evidence"],
      },
      {
        heading: "Test import output and exception handling",
        body:
          "Compare whether each option preserves transaction dates, quantities, costs, charges, holding periods, and gain classifications. Review how it handles transfers, mergers, bonuses, splits, missing purchase history, and unsupported files. A total gain figure is not enough when the underlying lots cannot be explained.",
        table: {
          headers: ["Test area", "Evidence to inspect", "Failure signal"],
          rows: [
            ["Import coverage", "Accepted broker files and sample output", "Transactions omitted or merged without explanation"],
            ["Tax working", "Lot-level gain and classification", "Cost or holding period cannot be traced"],
            ["Filing handoff", "Schedules, exceptions, and reviewer notes", "Unresolved items disappear from the final workflow"],
          ],
        },
      },
      {
        heading: "Compare current terms and review boundaries",
        body:
          "Confirm Quicko, MyeCA, and another option's current terms for import limits, manual review, correction support, and data retention. The method does not establish superiority and does not guarantee the tax result; it shows which workflow can explain the investor's actual broker and asset records.",
        items: ["Retain the test dataset and reviewed output", "Reassess the workflow when a new asset type or broker is added"],
      },
    ],
    links: [
      { label: "Capital gains import tool", href: "/capital-gains-import" },
      { label: "Capital gains calculator", href: "/calculators/capital-gains" },
      { label: "Capital gains filing guide", href: "/blog/capital-gains-trading-income-itr-guide-ay-2026-27" },
    ],
    requiredTerms: ["Quicko alternative", "capital gains", "broker"],
  },
  "/compare/best-ca-assisted-itr-filing": {
    highlights: [
      "Compare the review required by the return, not a generic package name",
      "Check reviewer role, evidence handoff, and correction boundaries",
      "No ranking can replace the taxpayer's actual case facts",
    ],
    sections: [
      {
        heading: "Classify the return before comparing assisted filing",
        body:
          "The CA assisted ITR filing comparison method begins by listing income heads, residence and foreign-asset facts, losses, notices, prior-return issues, and the volume of source documents. A salary-only return should not be priced or reviewed as if it contains F&O, foreign tax credit, or an open notice.",
        items: ["Prepare an anonymised case summary with material facts", "State the filing deadline and any existing department communication"],
      },
      {
        heading: "Inspect the actual review and evidence handoff",
        body:
          "Ask which role prepares the computation, which role reviews it, how questions are recorded, and what the taxpayer receives after filing. Compare whether the written scope includes AIS and Form 26AS matching, form selection, schedule review, e-verification support, correction, and notice response.",
        table: {
          headers: ["Review stage", "Question to ask", "Evidence after completion"],
          rows: [
            ["Preparation", "Which records and schedules are covered?", "Issue list and draft computation"],
            ["Review", "Who resolves material tax positions?", "Reviewed computation and open assumptions"],
            ["After filing", "What correction or notice work is included?", "Return, acknowledgement, and handover note"],
          ],
        },
      },
      {
        heading: "Apply current terms to the same case",
        body:
          "Compare current terms, exclusions, turnaround assumptions, data handling, and additional fees using the same case summary. This method does not establish superiority among providers or guarantee a refund, acceptance, or notice outcome; it identifies the written review arrangement that fits the return.",
        items: ["Retain the scope used for the decision", "Reconfirm scope when facts or deadlines change"],
      },
    ],
    links: [
      { label: "ITR filing service scope", href: "/itr-filing" },
      { label: "ITR form selector", href: "/itr/form-selector" },
      { label: "Expert consultation intake", href: "/expert-consultation" },
    ],
    requiredTerms: ["CA assisted", "ITR filing", "complex"],
  },
} satisfies Partial<Record<PriorityItrSearchRoute, PriorityItrRouteContent>>;
