import fs from "node:fs/promises";
import path from "node:path";

type Workflow = {
  heading: string;
  steps: string[];
};

type Frontmatter = {
  slug?: string;
  modifiedAt?: string;
  steps?: string[];
  [key: string]: unknown;
};

const workflows: Record<string, Workflow> = {
  "advance-tax-tax-year-2026-27-new-act-checklist": {
    heading: "Recalculate advance tax before each instalment",
    steps: [
      "Forecast taxable income by income head and subtract the TDS and TCS credits reasonably expected for the year.",
      "Refresh the estimate before each instalment date, recording one-off gains, uneven business receipts, and changed assumptions.",
      "Pay against the correct PAN and period, then verify that the challan details appear correctly in the tax-credit records.",
      "Reconcile every estimate and challan with the final return computation before claiming the payments.",
    ],
  },
  "ay-2026-27-return-under-1961-act-vs-tax-year-2026-27-under-2025-act": {
    heading: "Keep the two filing periods separate",
    steps: [
      "Tag each source record with the period in which the income, deduction, payment, or withholding event occurred.",
      "Prepare the FY 2025-26 return under the notified AY 2026-27 instructions without importing post-April 2026 transactions.",
      "Maintain a separate current-compliance file for transactions arising from April 2026 onward.",
      "Check the law reference, form, challan period, and acknowledgement before closing either workstream.",
    ],
  },
  "capital-gains-exemption-section-54-transition-income-tax-act-2025": {
    heading: "Build the Section 54 timeline from transaction evidence",
    steps: [
      "Fix the transfer date, sale consideration, cost records, and capital-gain computation for the property sold.",
      "Record each purchase, construction, or Capital Gains Account Scheme payment with its date and supporting agreement or statement.",
      "Match ownership, payment, and completion evidence to the exemption condition being relied on.",
      "Claim only the amount supported by the timeline and retain the working with the filed return.",
    ],
  },
  "capital-loss-carry-forward-new-income-tax-act-2025": {
    heading: "Preserve a usable capital-loss record",
    steps: [
      "Classify each disposal by asset, holding period, transaction date, sale value, and cost evidence.",
      "Reconcile broker statements, contract notes, AIS entries, and the capital-gains working before calculating the loss.",
      "Check how the return-filing date affects the intended carry-forward treatment for the relevant year.",
      "Carry the supported loss into the correct return schedule and preserve the year-wise balance.",
    ],
  },
  "deductions-section-123-schedule-xv-80c-transition": {
    heading: "Map each deduction to its current schedule entry",
    steps: [
      "List every intended deduction separately instead of relying on a combined investment total.",
      "Match the claimant, payment date, payee, eligibility condition, and receipt for each item.",
      "Confirm the current schedule and form field that corresponds to the deduction being claimed.",
      "Reconcile the schedule total with the supporting proofs before filing.",
    ],
  },
  "due-date-condition-deductions-section-122-income-tax-act-2025": {
    heading: "Test due-date-linked deductions before claiming them",
    steps: [
      "Identify the return, payment, report, or audit deadline attached to the deduction under review.",
      "Compare the actual completion date with that deadline using acknowledgements, challans, and filed reports.",
      "Document any delay and verify its effect on the claim before entering the amount in the return.",
      "Retain the dated evidence and the conclusion used for the final deduction treatment.",
    ],
  },
  "finance-act-2025-new-regime-slabs-ay-2026-27": {
    heading: "Compare the regime result using the full income mix",
    steps: [
      "Separate income taxed at normal slab rates from income subject to a special rate.",
      "Calculate the available deductions, rebate position, and tax result under each eligible regime.",
      "Include surcharge, cess, credits, and prepaid taxes before comparing the final payable or refund figure.",
      "Save the comparison and the assumptions used for the regime selected in the return.",
    ],
  },
  "form-10e-to-form-39-salary-arrears-relief-transition": {
    heading: "Reconstruct the salary-arrears relief claim",
    steps: [
      "Allocate the arrears or advance salary to the years to which it relates using the employer statement.",
      "Collect the relevant Form 16 records, year-wise income details, and tax computations.",
      "Confirm the notified relief form and filing sequence that applies to the relevant return period.",
      "Reconcile the relief calculation with the return and retain the filed-form acknowledgement.",
    ],
  },
  "form-15ca-15cb-to-form-145-146-remittance-transition": {
    heading: "Choose the remittance form from the transaction facts",
    steps: [
      "Determine the remittance purpose, recipient residency, amount, agreement terms, and tax position.",
      "Use the current official instructions to identify the declaration and certificate route, including whether a certificate is required.",
      "Match the selected route with the invoice, agreement, tax determination, and bank remittance request.",
      "Retain the submitted form, certificate where applicable, bank confirmation, and acknowledgement.",
    ],
  },
  "form-15g-15h-to-form-121-income-tax-act-2025-guide": {
    heading: "Check a no-TDS declaration before submission",
    steps: [
      "Estimate the declarant's relevant income and test the eligibility conditions for the declaration.",
      "Confirm the correct current form, PAN, period, payer details, and income estimate.",
      "Submit the declaration to the payer and retain proof of acceptance or submission.",
      "Reconcile any tax still deducted with AIS, Form 26AS, and the final return.",
    ],
  },
  "income-tax-act-2025-business-freelancer-compliance-roadmap": {
    heading: "Run the business and freelancer transition as separate workstreams",
    steps: [
      "Classify receipts, expenses, withholding, GST, and personal transactions in the books as they occur.",
      "Match invoices and expense proofs to bank entries, contracts, and TDS records each month.",
      "Maintain a dated calendar for return, payment, withholding, and information-reporting obligations.",
      "Close the year only after reconciling the books, tax credits, challans, and intended return schedules.",
    ],
  },
  "income-tax-act-2025-effective-april-2026-overview": {
    heading: "Organise the April 2026 transition by event date",
    steps: [
      "List open returns, notices, payments, and recurring compliance tasks with their underlying transaction dates.",
      "Separate FY 2025-26 return work from obligations arising on or after April 2026.",
      "Map old references to current provisions and forms only from the applicable official instruction.",
      "Verify the portal route and preserve the source used before submitting or paying.",
    ],
  },
  "income-tax-act-2025-new-tax-regime-section-202-guide": {
    heading: "Document the new-regime selection",
    steps: [
      "Classify the taxpayer and each income stream before comparing the available regime treatment.",
      "Calculate the result after considering eligible deductions, rebate conditions, and special-rate income.",
      "Confirm whether an option, form, or deadline applies to the taxpayer's facts for the relevant period.",
      "Keep the selected-regime computation and any filed option acknowledgement with the return.",
    ],
  },
  "income-tax-rules-2026-new-forms-transition-checklist": {
    heading: "Validate each new form before using it",
    steps: [
      "Inventory the forms, declarations, certificates, and reports used in the existing workflow.",
      "Check the current notification and instructions for each form needed in the relevant period.",
      "Map source records to the new fields and resolve missing identifiers or unsupported amounts.",
      "Test the portal submission and retain the final form, validation result, and acknowledgement.",
    ],
  },
  "mat-amt-credit-income-tax-act-2025-transition-guide": {
    heading: "Reconcile MAT and AMT credit year by year",
    steps: [
      "Bring forward the opening credit balance with the originating year and supporting return records.",
      "Compute regular tax and the applicable MAT or AMT result for the current period separately.",
      "Record the credit used, the balance carried forward, and any expiry or utilisation constraint to verify.",
      "Match the final credit schedule with reports, computations, and the filed return.",
    ],
  },
  "old-tax-dues-refunds-recovery-income-tax-act-2025": {
    heading: "Resolve an old demand or refund from the assessment-year record",
    steps: [
      "Identify the assessment year, order, demand or refund amount, and current portal status.",
      "Reconcile orders, challans, adjustments, bank credits, and prior responses before choosing an action.",
      "Select the response, rectification, appeal, or payment route only after reading the applicable order and deadline.",
      "Preserve every submission, payment, acknowledgement, and later status change in the same case file.",
    ],
  },
  "pan-tan-new-forms-income-tax-rules-2026-guide": {
    heading: "Prepare a PAN or TAN application from verified identity records",
    steps: [
      "Identify whether the task is a new application, correction, update, surrender, or linked-registration change.",
      "Match the legal name, constitution, address, authorised person, and supporting documents.",
      "Use the current notified application or correction route for the requested change.",
      "Retain the acknowledgement and update downstream tax, banking, payroll, or vendor records after approval.",
    ],
  },
  "pending-assessment-appeal-under-old-act-after-april-2026": {
    heading: "Keep a pending proceeding tied to its original record",
    steps: [
      "Record the assessment year, notice or order number, issue, jurisdiction, and response deadline.",
      "Preserve the original law references while checking the current portal and procedural instruction.",
      "Submit a dated response index that links each argument to its supporting document.",
      "Track acknowledgements, hearings, orders, and appeal deadlines until the proceeding is closed.",
    ],
  },
  "reassessment-sections-279-286-income-tax-act-2025-guide": {
    heading: "Respond to reassessment from the notice outward",
    steps: [
      "Read the notice for the relevant period, stated issue, information relied on, and response deadline.",
      "Reconstruct the return, source records, and prior correspondence for that assessment year.",
      "Prepare a response that answers the stated issue and indexes the supporting evidence.",
      "Retain the submission acknowledgement and monitor the next order, hearing, or appeal date.",
    ],
  },
  "section-87a-rebate-12-lakh-special-rate-income-ay-2026-27": {
    heading: "Calculate the rebate after separating special-rate income",
    steps: [
      "Classify every income item as normal-rate or special-rate income before applying the slab calculation.",
      "Compute total income and tax under the eligible regime using the current return instructions.",
      "Test the rebate against the actual income mix instead of relying on the headline income threshold.",
      "Retain the calculation showing the tax before rebate, rebate used, cess, credits, and final result.",
    ],
  },
  "tax-year-2026-27-vs-assessment-year-ay-2026-27-explained": {
    heading: "Label records by earning period and filing year",
    steps: [
      "Write the transaction or earning period on each working paper, challan, certificate, and statement.",
      "Place FY 2025-26 return preparation under AY 2026-27 and keep it separate from April 2026 onward activity.",
      "Check the period displayed on each portal form before payment, filing, or response submission.",
      "Archive the final return or compliance record with its matching period evidence and acknowledgement.",
    ],
  },
  "tcs-under-income-tax-act-2025-section-394-guide": {
    heading: "Trace TCS from the transaction to the buyer's credit",
    steps: [
      "Identify the transaction category, seller or collector role, buyer details, amount, and transaction date.",
      "Verify the current threshold, rate, and collection timing for that transaction category.",
      "Collect, deposit, report, and issue the required record using consistent PAN and transaction details.",
      "Reconcile the return and challan with the buyer's tax-credit record and correct any mismatch.",
    ],
  },
  "tds-credit-ais-form-168-transition-ay-2026-27": {
    heading: "Resolve a TDS-credit mismatch before claiming it",
    steps: [
      "Compare the TDS certificate, deductor details, challan, Form 26AS, AIS, and books for the same income.",
      "Identify whether the mismatch comes from the PAN, period, amount, return filing, or deductor reporting.",
      "Request the appropriate correction and retain the communication and revised evidence.",
      "Claim only the credit supported for the relevant year and preserve the reconciliation with the return.",
    ],
  },
  "tds-march-april-2026-transition-payroll-vendors": {
    heading: "Split March and April withholding by transaction date",
    steps: [
      "Separate March payroll and vendor entries from payments or credits arising in April 2026.",
      "Map each item to the applicable period, provision, rate check, challan, and return form.",
      "Reconcile payroll registers and vendor ledgers with deductions, deposits, and certificates.",
      "Maintain separate period workbooks so a correction does not alter the wrong quarter or law reference.",
    ],
  },
  "tds-tcs-threshold-rationalisation-finance-act-2025-checklist": {
    heading: "Apply changed TDS and TCS thresholds by effective date",
    steps: [
      "Inventory the payment and receipt categories in which a threshold or rate may have changed.",
      "Check the effective date and current official instruction for each category before updating the rule.",
      "Update vendor, customer, payroll, and accounting controls with the verified threshold and period.",
      "Test the first deduction or collection cycle and reconcile it with challans and returns.",
    ],
  },
  "tds-under-income-tax-act-2025-sections-392-393": {
    heading: "Complete TDS from payment classification to reconciliation",
    steps: [
      "Classify the payment, recipient residency, credit or payment date, PAN status, and supporting invoice or agreement.",
      "Confirm the applicable provision, threshold, rate, and current return or challan instruction.",
      "Deduct, deposit, report, and issue the certificate using consistent recipient and transaction details.",
      "Reconcile the books, challan, filed return, certificate, and recipient tax credit.",
    ],
  },
  "two-self-occupied-house-property-finance-act-2025-guide": {
    heading: "Support the treatment of each house property separately",
    steps: [
      "Record ownership, occupancy, use, and relevant dates for each property.",
      "Classify each property under the current return instructions before entering income or interest.",
      "Match lender certificates, interest amounts, co-owner shares, and property records.",
      "Reconcile the house-property schedule with the supporting computation and retain the evidence.",
    ],
  },
  "updated-return-48-months-finance-act-2025-guide": {
    heading: "Test an updated-return route before preparing it",
    steps: [
      "Identify the target assessment year, original return status, elapsed time, and correction required.",
      "Check the current eligibility conditions and exclusions for the intended updated-return route.",
      "Recompute income, tax, interest, additional amount, and credits from the source records.",
      "Submit only after reconciling the revised computation, payment proof, return, and acknowledgement.",
    ],
  },
};

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;
const modifiedAt = "2026-06-07T00:00:00.000Z";

const genericWorkflowSignatures = [
  /identify whether .+ affects AY 2026-27 filing, Tax Year 2026-27 compliance, or both/i,
  /read the official source and map the rule to your income head, taxpayer type, and dates/i,
  /open the current official source and map the rule to the relevant income head, taxpayer type, and dates/i,
  /collect source records, computation notes, challans, statements, and (?:declarations|employer declarations)/i,
  /build the .+ file from source records, computation notes, challans, statements, and declarations/i,
  /check whether the position changes the ITR form, schedule, tax payment, TDS\/TCS, or disclosure route/i,
  /use the .+ working to determine whether the ITR form, schedule, tax payment, TDS\/TCS, or disclosure route changes/i,
  /preserve the final return, acknowledgement, e-verification proof, and supporting working papers/i,
  /close the .+ file with the final return, acknowledgement, e-verification proof, and supporting working papers/i,
];

function isGenericWorkflowStep(value: string) {
  return genericWorkflowSignatures.some((pattern) => pattern.test(value));
}

function removeGenericCaveats(body: string) {
  return body
    .split(/\r?\n/)
    .map((line) => line
      .split(/(?<=[.!?])\s+/)
      .filter((sentence) =>
        !/requires current official instructions and the actual source records; the final treatment or outcome still depends on the facts/i.test(sentence))
      .join(" "))
    .join("\n");
}

function rewriteVisibleWorkflow(body: string, workflow: Workflow) {
  const lines = removeGenericCaveats(body).replace(/\r\n/g, "\n").split("\n");

  for (let headingIndex = 0; headingIndex < lines.length; headingIndex += 1) {
    if (!/^##\s+/.test(lines[headingIndex])) continue;
    let listStart = headingIndex + 1;
    while (listStart < lines.length && !lines[listStart].trim()) listStart += 1;
    if (!/^[-*+]\s+/.test(lines[listStart] ?? "")) continue;

    let listEnd = listStart;
    while (listEnd < lines.length && (/^[-*+]\s+/.test(lines[listEnd]) || !lines[listEnd].trim())) listEnd += 1;
    const listItems = lines.slice(listStart, listEnd).filter((line) => /^[-*+]\s+/.test(line));
    if (listItems.filter(isGenericWorkflowStep).length < 2) continue;

    lines.splice(
      headingIndex,
      listEnd - headingIndex,
      `## ${workflow.heading}`,
      "",
      ...workflow.steps.map((step) => `- ${step}`),
      "",
    );
    headingIndex += workflow.steps.length + 2;
  }

  return lines
    .filter((line) => !(/^[-*+]\s+/.test(line) && isGenericWorkflowStep(line)))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function main() {
  const fileNames = await fs.readdir(blogDir);
  const updated = new Set<string>();

  for (const fileName of fileNames.filter((name) => name.endsWith(".mdx"))) {
    const filePath = path.join(blogDir, fileName);
    const source = await fs.readFile(filePath, "utf8");
    const match = source.match(frontmatterPattern);
    if (!match) continue;

    const meta = JSON.parse(match[1]) as Frontmatter;
    const workflow = meta.slug ? workflows[meta.slug] : undefined;
    if (!workflow) continue;

    meta.steps = workflow.steps;
    meta.modifiedAt = modifiedAt;
    const body = rewriteVisibleWorkflow(match[2], workflow);
    await fs.writeFile(filePath, `---\n${JSON.stringify(meta, null, 2)}\n---\n\n${body}\n`, "utf8");
    updated.add(meta.slug!);
  }

  const missing = Object.keys(workflows).filter((slug) => !updated.has(slug));
  if (missing.length) throw new Error(`Missing transition workflow files: ${missing.join(", ")}`);
  console.log(`Rewrote visible and schema workflows for ${updated.size} transition guides.`);
}

await main();
