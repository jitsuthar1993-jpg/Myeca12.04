import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;
const startMarker = "<!-- route-specific-depth:start -->";
const endMarker = "<!-- route-specific-depth:end -->";

const additions: Record<string, string> = {
  "annual-roc-compliance-calendar-companies-llps": `## Turn the ROC calendar into an owner-by-owner control

A filing calendar is useful only when each obligation has an owner, a source record, and an internal completion date. Map the bookkeeping close to the finance owner, board or partner approvals to the person maintaining minutes, and portal filing to the authorised signatory and professional involved. Record dependencies as well: an annual form may be ready in draft but still wait for signed financial statements, audit completion, or an updated register.

Use a separate exception list for changes that occurred during the year, such as a director or partner change, registered-office movement, capital event, charge, or delayed earlier filing. Compare that list with the entity master data and prior acknowledgements before the annual package is finalised. The close-out file should show what was filed, who approved it, the challan or acknowledgement, and any open correction rather than merely marking the calendar item complete.`,
  "business-audit-assurance-readiness-checklist": `## Build an audit issue trail before fieldwork starts

An audit-ready ledger should let the reviewer move from a balance to the underlying transaction and back again. Select material or unusual balances, identify the supporting invoice, contract, bank entry, tax record, and approval, then note any difference that remains unresolved. Keep management explanations beside the evidence they address instead of collecting them in an unlinked email chain.

Separate three outcomes in the query tracker: evidence supplied, accounting entry corrected, and judgement still open. A response is not closed merely because a document was uploaded. Record who accepted the response and whether it changes the trial balance, financial statements, tax return, or control process. After completion, retain the final signed report and representation records together with the last query tracker and the exact financial-data version reviewed. That trail makes later lender, tax, or governance questions easier to answer without recreating the audit.`,
  "business-document-vault-registrations-certificates-renewals": `## Design the vault around decisions, not folders

A useful document vault shows which record is current, who controls it, and what action depends on it. For every registration or certificate, store the application, issued record, amendments, payment proof, renewal date, portal account owner, and latest correspondence as one traceable set. Label superseded versions clearly; deleting them can remove the evidence needed to explain a past filing or earlier business name.

Create a short access register for sensitive credentials and identity records. The person responsible for renewal does not always need unrestricted access to director KYC, banking, payroll, or customer files. Review access when employees, consultants, or authorised signatories change. Before sharing a data-room extract, check that it contains the records requested for that transaction and excludes unrelated personal data. A quarterly vault review should end with named actions for expired records, mismatched entity details, inaccessible logins, and acknowledgements that have not yet produced the expected certificate.`,
  "calculate-foreign-asset-values-sbi-tt-buying-rate": `## Keep a valuation worksheet that another reviewer can reproduce

Prepare one row for each asset and each return field that needs a rupee amount. Record the foreign-currency value, currency, event or valuation date, rate source, rate date actually used, rupee result, and a link to the supporting statement. Peak value, closing value, acquisition cost, and income can require separate rows because the underlying amount or relevant date may differ.

Do not overwrite the worksheet when a later statement changes an amount. Keep the earlier version, note the correction, and recalculate only the affected field. Where no rate is available for the exact date or the return instruction is unclear, record the question and obtain a supported treatment before filing. Retain the applicable return instruction, SBI rate evidence used, broker or bank statement, calculation formula, and filed schedule together. That package should allow the reported rupee value to be rebuilt without relying on a remembered spreadsheet assumption.`,
  "defective-return-notice-section-139-9": `## Read the defect code before changing the return

Start a response note with the notice date, assessment year, defect code or description, portal response deadline, and the exact return version referred to. Then connect the defect to the filed schedule, computation, source document, or validation message that caused it. A generic re-upload can leave the same defect unresolved or introduce a new inconsistency elsewhere in the return.

Compare the proposed correction with the original acknowledgement and computation before submitting the response. Record whether the change affects income, tax, loss carry-forward, refund, bank details, or only a validation field. If the notice appears inconsistent with the filed records, preserve screenshots and downloads and use the response route available on the portal rather than silently changing a supported position. After submission, keep the response acknowledgement and monitor the status. Escalate promptly when the deadline is close, the return form may be wrong, or the correction changes a material tax position.`,
  "demand-notice-after-tax-regime-change": `## Reconcile the demand line by line

Build a comparison between the filed return, the processed computation or intimation, and the demand balance. Show the tax regime used, deductions accepted or removed, income and special-rate items, tax credits, interest, fee, and payments in separate rows. The difference should be explained by a named line rather than by the demand total alone.

Check whether the return actually recorded the intended regime choice and whether the taxpayer was eligible to make or change that choice for the relevant year and income profile. A demand can also arise from an unrelated tax-credit or income mismatch, so do not assume the regime is the only cause. Choose a response, rectification, payment, or other route only after identifying what the processing record got right or wrong. Preserve the filed return, computation, intimation, credit statements, response acknowledgement, and any payment challan so the later status can be traced to the action taken.`,
  "foreign-remittance-form-15ca-15cb-document-readiness": `## Write the remittance position before completing a form

For each proposed remittance, record the payer, recipient, country, purpose, agreement or invoice, gross amount, tax clause considered, withholding position, and bank instruction. The file should explain why a particular Form 15CA part is used and why Form 15CB is or is not needed for those facts. Do not copy the treatment from an earlier payment merely because the recipient is the same.

Reconcile the form values with the invoice, agreement, withholding calculation, challan where applicable, and the amount finally sent by the bank. Foreign-exchange charges or a partial remittance can make the bank debit differ from the invoice without changing the underlying analysis. Keep the submitted form acknowledgement and bank confirmation with the position note. Pause when the purpose is unclear, the recipient or treaty facts are incomplete, the invoice mixes services and reimbursements, or the bank requests a different classification from the one supported by the documents.`,
  "freelancers-foreign-clients-schedule-fa": `## Separate a foreign customer from a foreign asset

Receiving a payment from an overseas client does not by itself establish that Schedule FA applies. Review what the freelancer actually owns or controls: a foreign bank or payment account, shares, an interest in an overseas entity, signing authority, or another reportable asset. Record the residency status first, then map each account or asset to the relevant reporting question and period.

Payment platforms deserve a separate check. Identify the legal account provider, country, balances, transaction history, and whether funds remained in the account or moved directly to an Indian bank. Keep client invoices and foreign-income records separate from the asset inventory even when the same platform appears in both. Where the account classification, ownership, or reporting period is uncertain, preserve the statements and obtain a supported position before filing. The final file should connect the foreign-income schedules, asset disclosures, tax-credit records, and remittance trail without assuming that one schedule replaces the others.`,
  "fssai-registration-state-central-license-food-businesses": `## Classify the actual food activity before choosing the route

Describe every food activity carried on from each premises: manufacturing, processing, storage, transport, distribution, retail, restaurant service, ecommerce, or another role. Record the products, scale, locations, and operating model before selecting registration, State licence, or Central licence on FoSCoS. A turnover figure alone may not explain every activity or premises question.

Compare the proposed application with the business name, premises proof, responsible-person details, product or activity information, and any other local permission relied on. If the business adds a unit, product category, storage point, or sales channel, review whether the existing record still describes the operation. Keep the submitted application, payment, authority query, reply, inspection communication, and issued certificate together. Escalate when activities span multiple premises or states, the portal category does not match the operation, or an authority query asks for evidence the business cannot support.`,
  "fssai-renewal-modification-annual-return-checklist": `## Decide whether the next action is renewal, modification, or return filing

Start with the current certificate and list every change since it was issued: premises, responsible person, constitution, product, activity, capacity, or contact details. Mark which facts still match and which need an official update. Renewing an inaccurate certificate can preserve a mismatch, while filing a modification does not automatically complete a renewal or annual-return obligation.

Maintain a dated action file containing the current certificate, proposed changes, supporting records, FoSCoS submission, fee proof, authority questions, replies, and final outcome. Where annual-return applicability is being reviewed, record the activity and period used for that conclusion rather than relying on a prior-year assumption. Begin before expiry so a query or rejected document does not force a rushed response. Escalate where the certificate has already expired, the premises or activity changed materially, or the portal record and actual food operation cannot be reconciled.`,
  "funding-documentation-data-room-investor-readiness-guide": `## Create a disclosure log beside the data room

A data room should not make inconsistent records look complete. Build a disclosure log for gaps such as unsigned contracts, provisional accounts, disputed receivables, pending registrations, related-party transactions, cap-table differences, or unresolved tax matters. For each item, state the current fact, evidence available, owner, correction plan, and date for the next update.

Keep the version shared with each investor, lender, incubator, or scheme reviewer. Later corrections should be added with a clear date instead of silently replacing the assessed file. Reconcile the pitch, cap table, incorporation records, financial model, tax filings, bank statements, and material contracts around the same entity and period. Restrict sensitive payroll, customer, identity, and banking records to the people who need them for the review. Before granting access, confirm the purpose, document scope, and expiry of that access, then retain the question log and final materials used in the decision.`,
  "government-scheme-2026-apprenticeship-india-registration-checklist": `## Check the apprenticeship opportunity before accepting it

Registration creates a profile; it does not establish the terms of a specific apprenticeship. Before accepting an opportunity, compare the employer identity, role, location, duration, stipend information, training expectations, and communication channel with the listing and any formal offer or contract. Ask for clarification where the work described in a message differs from the registered opportunity.

Keep the accepted offer, joining record, attendance or training evidence, payment entries, assessment result, and completion certificate with the original profile. Do not pay an unofficial intermediary merely for a promised placement, and do not share banking or identity credentials through an unverified contact. If profile facts, employer details, or payment records differ, preserve the screenshots and use the official support or employer channel. That trail helps distinguish a profile correction, an employer dispute, and a later certificate or stipend question.`,
  "iso-certification-readiness-guide-small-businesses": `## Test whether the management system works in practice

Readiness is not the number of policies in a folder. Select a real customer order, service delivery, purchase, complaint, equipment check, or staff-training event and trace it through the process the business says it follows. The record should show who acted, what criteria were used, what evidence was retained, and how an exception was corrected.

Define the proposed certification scope and sites before preparing documents. A narrow scope that matches the actual operation is more useful than broad language the business cannot evidence. Keep a gap register with process owner, required action, target date, and proof of closure. When evaluating a certification body, verify the relevant accreditation and scope independently and retain the proposal and audit plan. MyeCA can support documentation readiness, but the certification decision and audit findings belong to the certification body; no readiness checklist can guarantee issuance.`,
  "labour-law-epfo-esic-compliance-starter-checklist": `## Reconcile the employee master before monthly filings

Create one controlled employee master containing joining date, role, work location, wage components, identifiers, benefit enrolment status, nominee or family details where relevant, and exit date. Compare it each month with attendance, payroll, bank payment, EPFO or ESIC records, and contractor information. A filing can be submitted successfully while an employee name, wage, joining date, or exit remains wrong.

Use an exception tracker for new joiners, exits, wage changes, failed identifiers, unpaid contributions, rejected transactions, and contractor records awaiting confirmation. Assign each exception to payroll, HR, finance, the employee, or the contractor and retain the correction evidence. After payment and filing, archive the payroll version, challan, return or contribution file, acknowledgement, and unresolved exception list for that month. Recheck applicability and registration questions when headcount, location, contractor use, or wage structure changes instead of treating the original setup as permanent.`,
  "pan-card-application-correction-business-pan-readiness": `## Map the PAN correction across connected records

Before submitting a correction, list the exact PAN field that is wrong and every connected record that may still carry the earlier value: income-tax account, bank KYC, GST, MCA, Udyam, payroll, invoices, payment gateways, or contracts. The PAN correction acknowledgement proves that a request was made; it does not prove that each connected system has accepted the updated detail.

For a business, confirm whether the PAN belongs to the proprietor or to a separate legal entity. Do not reuse an individual's PAN where the entity requires its own record, and do not create a second PAN merely to solve a name or data mismatch. Keep the application, identity and entity evidence used, acknowledgement, issued or updated PAN record, and follow-up confirmations from connected systems. Escalate when duplicate PAN records may exist, entity constitution is unclear, or a source registration cannot be updated to match the supported PAN data.`,
  "tds-return-filing-checklist-employers-vendors": `## Close the quarter through a deductee-level reconciliation

Prepare a deductee register showing payment or credit date, nature of payment, section used, threshold or rate basis, gross amount, tax deducted, deduction date, challan allocation, PAN status, and certificate outcome. Reconcile that register with payroll or vendor ledgers and the bank payment trail before uploading the return. A challan total can match while individual deductees, sections, or periods remain wrong.

After filing, compare the acknowledgement and processing status with the register. Track defaults, short deduction, interest, late fee, unmatched challans, and PAN errors as separate correction items. When a correction is filed, preserve the original statement, reason for change, revised data, and new acknowledgement so the tax-credit effect can be explained to the deductee. Close the quarter only after certificates and Form 26AS expectations are reviewed, and escalate disputed classification, missing PAN, cross-quarter adjustments, or payments with unclear withholding treatment before repeating the error.`,
  "trade-license-registration-shops-restaurants-local-businesses": `## Build a premises-specific local permission file

Identify the local authority, premises, activity, occupancy arrangement, and responsible person before applying. A trade licence for one shop or activity should not be assumed to cover another premises, expanded operation, or changed business use. Record the local rule or portal instruction relied on because document lists and renewal steps can differ between authorities.

Keep premises proof, owner consent where relevant, entity records, activity details, application, payment, inspection communication, authority query, reply, and issued licence together. For a restaurant or food business, track the local permission separately from FSSAI and any fire, signage, waste, or other approval that may apply; one certificate does not replace the others. Review the file when the business moves, changes activity, adds seating or equipment, changes constitution, or approaches renewal. Escalate when the actual use and premises records differ or the authority cannot identify the correct application route.`,
  "trademark-registration-india-search-class-filing-objection": `## Preserve the reasoning behind the mark and class selection

Before filing, record the exact word, logo, owner, goods or services, intended use, and search results reviewed. Similarity is not limited to an identical spelling, and a broad search result should be assessed in the context of the relevant goods, services, and mark elements. Keep screenshots or reports with the date and the conclusion reached; a later objection is difficult to answer from memory alone.

Review whether the applicant name and claimed use are supported by entity records, invoices, packaging, website material, or other evidence. After filing, track the application number, examination status, response deadline, publication, opposition period, and any hearing or correspondence. Do not present an application as a registered trademark while it is still pending. Escalate a material search conflict, ownership uncertainty, objection, opposition, or proposed brand launch before investing further in packaging, domains, or advertising tied to the disputed mark.`,
  "virtual-cfo-mis-cash-flow-compliance-reporting-guide": `## Make the monthly pack end with decisions

A useful MIS pack connects profit, cash, receivables, payables, tax dues, payroll, debt, and upcoming commitments to actions the owner can take. Reconcile the opening and closing bank position, explain material movements, and separate accounting profit from cash available. A dashboard without a source ledger or owner for each exception can create confidence without control.

Close each month with a short action register: decision required, evidence considered, owner, due date, cash effect, compliance effect, and status. Keep forecast assumptions visible and compare them with actual collections, payments, and margins in the next pack. Record related-party movements, overdue receivables, unprovided liabilities, and upcoming filing or payment dates rather than smoothing them into a headline number. The final pack should let management identify which issue needs a commercial decision, which needs a bookkeeping correction, and which requires tax, legal, or other specialist advice.`,
};

async function run() {
  let changed = 0;

  for (const [slug, addition] of Object.entries(additions)) {
    const filePath = path.join(blogDir, `${slug}.mdx`);
    const source = await fs.readFile(filePath, "utf8");
    const match = source.match(frontmatterPattern);
    if (!match) throw new Error(`Invalid MDX frontmatter: ${slug}`);

    const meta = JSON.parse(match[1]) as Record<string, unknown>;
    meta.modifiedAt = "2026-06-07T00:00:00.000Z";
    const body = match[2]
      .replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}\\s*`, "g"), "")
      .trim();
    const depthBlock = `${startMarker}\n${addition.trim()}\n${endMarker}`;
    const next = `---\n${JSON.stringify(meta, null, 2)}\n---\n\n${body}\n\n${depthBlock}\n`;
    if (next === source.replace(/\r\n/g, "\n")) continue;
    await fs.writeFile(filePath, next, "utf8");
    changed += 1;
  }

  console.log(`Deepened ${changed} thin published guides with route-specific decision content.`);
}

await run();
