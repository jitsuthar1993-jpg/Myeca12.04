import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const checkedAt = "2026-06-07T00:00:00.000Z";

const rewrites: Record<string, string> = {
  "ay-2026-27-foreign-travel-tcs-credit-itr-guide.mdx": `
# AY 2026-27 Foreign Travel TCS Credit ITR Guide

Tax collected at source on an overseas travel package or foreign remittance is a tax credit, not a separate travel deduction. The credit should be matched to the traveller's PAN, the collector's certificate, Form 26AS, AIS, and the income-tax computation before it is claimed in the return.

The practical problem is often timing: the bank or tour operator collected TCS, but the credit is missing, duplicated, or reported under a different amount or period.

## Identify why TCS was collected

Start with the invoice, booking confirmation, bank debit, remittance request, or tour-package record. Record who paid, whose PAN was quoted, the payment date, the gross amount, and the reason shown for collection. A family payment can create confusion when one person pays but another PAN is used for TCS reporting.

Do not treat every foreign card transaction or travel expense as the same kind of TCS event. The collector's record should identify the relevant transaction and PAN.

## Match the collector's certificate to tax-credit statements

Prepare a transaction table before filing:

| Evidence | What to compare |
| --- | --- |
| Tour operator or bank certificate | PAN, collection date, gross transaction, and TCS amount |
| Bank or card statement | Actual payment and any later reversal or refund |
| Form 26AS | Collector, section, period, and credit available |
| AIS | Third-party reporting and any duplicate or inconsistent entry |
| Tax computation | Credit claimed against the taxpayer's final liability |

If Form 26AS does not show the credit, ask the collector to check the PAN and TCS filing. Retain the request and response. Claiming a credit unsupported by the tax-credit record can lead to a demand even when money was originally collected.

## Understand what the credit changes

TCS is generally adjusted against the taxpayer's final income-tax liability. It can reduce the balance payable or contribute to a refund when total tax credits exceed the final liability. It does not by itself establish that travel spending is deductible or that the underlying remittance is taxable income.

A large TCS credit can still result in no refund where other income, gains, or tax liabilities were omitted from the working. Prepare the full return before estimating the outcome.

## Handle cancellation, refund, or split-family payments

Where a trip was cancelled or a transaction reversed, compare the original collection with the refund record and the collector's later reporting. Do not simply remove the credit or assume the reversal has been reported.

For family travel, list the payer, travellers, PAN used by the collector, and who is claiming the credit. Resolve a wrongly quoted PAN with the collector before filing where possible.

## Select the return and run pre-submission checks

The presence of travel TCS does not decide the ITR form. Choose the form from salary, capital gains, business income, foreign assets, and the taxpayer's other facts. Use the [ITR form selector](/itr/form-selector) after the full income profile is known.

Before submission:

1. Match each TCS entry to a certificate and payment.
2. Confirm the same PAN and assessment year in Form 26AS.
3. Investigate AIS differences and collector corrections.
4. Include all taxable income before applying the credit.
5. Validate the refund bank account and e-verify the return.

The Income Tax Department's [AIS guidance](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/ais-annual-information-statement) and [tax-credit mismatch FAQ](https://www.incometax.gov.in/iec/foportal/node/11487) describe the portal records involved. Related routes include the [overseas-remittance TCS checklist](/blog/ay-2026-27-overseas-remittance-tcs-itr-checklist), [income tax calculator](/calculators/income-tax), and [document-handling policy](/trust).
`,
  "ay-2026-27-stock-investor-ltcg-stcg-itr-guide.mdx": `
# AY 2026-27 Stock Investor LTCG and STCG ITR Guide

A stock investor's return should be built from the tradebook, tax profit-and-loss report, contract notes, holding statement, and corporate-action history. AIS can reveal a mismatch, but it usually cannot explain the acquisition cost, holding period, or lot matching needed for the capital-gains schedules.

The first decision is whether the activity is investment or business activity. Frequency alone does not settle that question; intention, treatment in records, volume, holding pattern, and consistency also matter.

## Separate delivery investments from trading activity

Create distinct working groups for delivery-based share sales, intraday transactions, futures and options, dividends, and any other investment income. Intraday and F&O results can require business-income treatment, while delivery investments may create short-term or long-term capital gains.

Do not net every broker result into one figure. The return schedules, expense treatment, loss rules, and return-form choice can differ across these groups.

## Reconcile the broker records

| Record | Purpose in the working |
| --- | --- |
| Tradebook and contract notes | Establish sale, purchase, quantity, date, price, and charges |
| Tax P&L or capital-gains report | Provide the broker's lot matching and gain calculation |
| Demat holding statement | Confirm delivery positions and corporate actions |
| Bank statement | Trace material settlements and transfers |
| AIS | Identify third-party-reported transactions that need investigation |

Check bonus issues, splits, mergers, demergers, rights issues, off-market transfers, and missing historical costs. A broker report can be incomplete when securities moved from another broker or were acquired through a corporate action.

## Review holding period and special-rate treatment

Classify each delivery sale using the asset type and actual acquisition and transfer dates. Listed-equity treatment can depend on conditions such as the transaction and applicable securities tax. Other shares or securities may follow different rules.

Where grandfathering, non-resident treatment, unlisted shares, or a corporate action affects cost, prepare a separate note. Do not force an uncertain item into the broker's default category merely to make the totals agree.

## Handle AIS differences without changing supported gains

AIS may show gross sale values or information received from reporting entities. Compare the entry with the tradebook and sale records. A difference can arise from timing, duplicate reporting, corporate action, or an incomplete broker history.

Give AIS feedback where relevant, but retain the transaction records supporting the amount used in the return. A missing AIS entry does not remove a real sale, and an AIS sale value is not the taxable gain.

## Choose ITR-2 or ITR-3 from the complete activity

An investor with capital gains and no business-income facts may commonly need ITR-2. Intraday, F&O, or activity treated as business can point to ITR-3 and may raise books or audit questions. The [ITR form selector](/itr/form-selector) can organise the initial facts, but the final choice must reflect the complete trading and investment profile.

The [capital gains calculator](/calculators/capital-gains) is useful for estimates. Use the [capital gains import tool](/capital-gains-import) to organise supported broker files, then inspect every exception before filing.

## Preserve the filed investment working

Retain the broker reports, contract notes, demat statement, corporate-action evidence, bank records, AIS download, computation, filed schedules, and e-verification acknowledgement. Where a loss is reported, confirm the return deadline and carry-forward treatment.

Related reading includes the [capital gains and trading-income guide](/blog/capital-gains-trading-income-itr-guide-ay-2026-27), [ITR-2 checklist](/blog/itr-2-checklist-capital-gains-foreign-assets-ay-2026-27), and [trust page](/trust).
`,
  "ay-2026-27-epf-withdrawal-taxability-checklist.mdx": `
# AY 2026-27 EPF Withdrawal Taxability Checklist

An EPF withdrawal is not taxable merely because tax was deducted, and it is not automatically exempt merely because the money came from a provident-fund account. The answer depends on the fund, period of continuous service, reason for leaving, transfer history, amount withdrawn, and any employee or employer components reported.

Start with the EPFO passbook, withdrawal or settlement statement, service history, and Form 26AS rather than the net bank credit.

## Reconstruct continuous service before deciding taxability

List every employer covered by the provident-fund history and note whether the balance was transferred between employments. A transfer can preserve continuity even when the universal account or employer changed. Missing transfer records can make a withdrawal appear to relate to a shorter service period than the actual history.

Also record the reason for termination or withdrawal. Certain circumstances outside the employee's control can affect the treatment and should be supported by the relevant employer or EPFO record.

## Break the settlement into supported components

| Record | Question it answers |
| --- | --- |
| EPFO passbook | Employee contribution, employer contribution, and credited interest |
| Service history | Continuous service and transfer periods |
| Claim or settlement statement | Withdrawal type, gross amount, and deductions |
| Bank statement | Net amount received |
| Form 26AS and AIS | TDS or third-party reporting connected to the PAN |

Do not treat the bank credit as the gross withdrawal. Where the settlement statement is incomplete, obtain the passbook and claim details before preparing the return.

## Treat TDS as a credit, not the taxability decision

TDS can be collected on a withdrawal under the applicable conditions, but the final return still needs the correct tax treatment. Match any deducted amount with Form 26AS and claim only the credit supported under the taxpayer's PAN.

Form 15G or Form 15H is a declaration subject to eligibility conditions; submitting or not submitting it does not by itself decide whether the withdrawal is taxable. Preserve the declaration and settlement record where one was used.

## Review prior deduction claims and return disclosure

Where a withdrawal becomes taxable, the components may not all be reported identically. Prior employee-contribution deductions, employer contribution, and interest can raise different return questions. Prepare a component-wise working and connect it to the selected schedules.

The return form depends on the taxpayer's full income profile. Use the [ITR form selector](/itr/form-selector) after adding salary, pension, gains, and other income. The [income tax calculator](/calculators/income-tax) can estimate the overall effect once the supported withdrawal treatment is known.

## Filing checklist

1. Confirm the fund and withdrawal type.
2. Rebuild continuous service, including transferred balances.
3. Obtain the passbook and gross settlement details.
4. Match TDS with Form 26AS and AIS.
5. Prepare a component-wise tax working.
6. Select the return form from all income and e-verify after filing.

Retain the passbook, service and transfer evidence, claim form, settlement advice, tax-credit statement, computation, filed return, and acknowledgement. Use the [tax-credit mismatch guide](/blog/tax-credit-mismatch-tds-form-26as-ay-2026-27) where a deducted amount is absent from Form 26AS, and review [document-handling boundaries](/trust) before sharing account records.
`,
  "ay-2026-27-teacher-tuition-income-itr-guide.mdx": `
# AY 2026-27 Teacher and Tuition Income ITR Guide

A teacher can have salary from a school or college and separate receipts from private tuition, online classes, course sales, or coaching activity. Those amounts should not be combined without identifying who paid them, what work produced them, and whether the activity is employment, business, or another source of income.

The filing starts with a receipt ledger, not with the amount visible in one bank account.

## Separate employment salary from independent tuition

Use Form 16, salary slips, and the employment contract for salary. Prepare a separate tuition ledger showing student or platform receipts, refunds, discounts, and amounts outstanding. If a coaching platform deducts tax or fees, record the gross receipt, platform charge, tax deducted, and net bank credit separately.

Cash tuition also needs contemporaneous records. A bank statement alone will understate receipts when cash is accepted and can overstate tuition income when personal transfers use the same account.

## Build a tuition-income ledger

| Ledger field | Evidence |
| --- | --- |
| Date and student, batch, or platform | Attendance, invoice, receipt, or platform report |
| Gross fee | Agreed fee and payment record |
| Refund or concession | Written adjustment and payment trail |
| Platform fee or collection charge | Platform statement or invoice |
| Tax deducted | Form 16A, AIS, and Form 26AS |
| Business expense | Invoice and explanation of tuition use |

Keep salary and tuition TDS separate. A platform or payer may report a gross amount that differs from the net amount deposited after fees or withholding.

## Claim only expenses connected to the tuition activity

Examples can include teaching materials, platform fees, advertising, a supported share of premises costs, and equipment used for the activity. Personal household costs and unsupported estimates should not be moved into the tuition working.

Where an asset such as a laptop or camera is used for both personal and teaching purposes, record the business-use basis and review the applicable treatment rather than claiming the entire purchase automatically.

## Do not assume presumptive taxation applies

Private tutoring is not automatically one of the specified professions covered by section 44ADA. Eligibility for any presumptive-business route depends on the actual activity and statutory conditions. Confirm the provision before using ITR-4 or a presumptive percentage.

Where tuition is carried on as business or profession outside an eligible presumptive route, books, expense evidence, and ITR-3 may be relevant. GST registration or invoicing questions also depend on turnover, the nature and place of supply, exemptions, and other facts; income-tax turnover and GST turnover should be reconciled but are not always identical.

## Match TDS and choose the return form

Compare Form 16, Form 16A, AIS, and Form 26AS with the salary and tuition ledgers. Ask the payer to amend an inaccurate TDS filing rather than claiming an unsupported credit. Use the [ITR form selector](/itr/form-selector) after salary, tuition, gains, and other income are listed.

The [income tax calculator](/calculators/income-tax) can estimate the combined liability. Businesses approaching GST questions can review the [GST registration service scope](/services/gst-registration) and [GST calculator](/calculators/gst) without assuming either tool decides registration.

## Retain the teaching-income file

Keep Form 16, tuition invoices or receipts, platform statements, attendance or batch records, bank statements, expense evidence, TDS certificates, AIS, Form 26AS, computation, filed return, and acknowledgement. The [freelancer turnover guide](/blog/ay-2026-27-freelancer-gst-turnover-income-tax-turnover) explains the separate GST and income-tax figures, while the [trust page](/trust) explains document-handling expectations.
`,
  "ay-2026-27-partner-remuneration-interest-itr-guide.mdx": `
# AY 2026-27 Partner Remuneration, Interest, and Profit Share ITR Guide

A partner should not report every amount received from a firm in the same way. Share of profit, remuneration, bonus, commission, and interest on capital can have different tax treatment. The partner's return should agree with the partnership deed, the firm's accounts and return, the partner ledger, and the tax-credit statements.

The first task is to split the firm's allocation into named components rather than using the net bank amount.

## Read the deed before the ledger

Confirm that remuneration and interest are authorised by the partnership deed and identify the applicable terms and period. Then compare those terms with the firm's computation and partner ledger. A payment described casually as drawings may represent a distribution, advance, reimbursement, remuneration, or another item that needs classification.

Changes in the deed, profit-sharing ratio, or partner status during the year should be reflected in the working.

## Reconcile each amount reported by the firm

| Partner item | Evidence to retain | Return question |
| --- | --- | --- |
| Share of profit | Firm computation, return information, and allocation statement | Is the exempt share separately disclosed and supported? |
| Remuneration, bonus, or commission | Partnership deed, ledger, and firm computation | Does the amount agree with the firm's allowed and reported figure? |
| Interest on capital | Deed terms, capital account, and calculation | Is the period, balance, and rate supported? |
| Drawings or reimbursement | Partner ledger and underlying payment record | Is it income, capital movement, or repayment of an expense? |
| Tax deducted under partner-payment rules | Certificate, Form 26AS, and AIS | Is the credit reported under the correct PAN and period? |

Share of profit from the firm and taxable remuneration or interest should not be merged into one receipt line. Match the partner's amounts with the firm's final figures before filing either return where possible.

## Review TDS without using it as the classification

Section 194T applies to specified payments by a firm to a partner from the relevant effective period. Match any tax deducted with the certificate and Form 26AS. The presence or absence of TDS does not replace the need to classify the underlying payment correctly.

If the firm's filing uses an incorrect PAN or amount, ask the firm to amend its source record. Retain the correspondence and claim only the credit supported by the taxpayer's tax-credit statement.

## Consider expenses and the partner's return form

An expense claimed by the partner should be connected to earning the taxable partner income and supported by records. Do not duplicate expenses already claimed by the firm or claim personal costs merely because the partner participates in the business.

Partners commonly need ITR-3 because remuneration and interest from the firm are treated within business or professional income. The complete facts, including other proprietary activity, gains, losses, and foreign items, still control the form and schedules. Use the [ITR form selector](/itr/form-selector) after assembling the full profile.

## Coordinate deadlines and preserve both sides of the record

The partner's return can depend on figures finalised by the firm. Confirm whether the firm's audit or filing position affects the partner's due date and avoid filing from provisional allocations without documenting later changes.

Keep the deed and amendments, firm allocation statement, partner capital and current accounts, remuneration and interest calculations, expense evidence, TDS certificate, AIS, Form 26AS, computation, filed return, and acknowledgement. The [TDS filing service page](/services/tds-filing), [tax-credit mismatch guide](/blog/tax-credit-mismatch-tds-form-26as-ay-2026-27), and [trust page](/trust) provide related preparation paths.
`,
};

for (const [fileName, body] of Object.entries(rewrites)) {
  const filePath = path.join(rootDir, "content", "blog", fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const frontmatterEnd = source.indexOf("\n---", 3);
  if (!source.startsWith("---") || frontmatterEnd < 0) {
    throw new Error(`Unable to locate frontmatter in ${fileName}`);
  }

  const frontmatter = source
    .slice(0, frontmatterEnd + 4)
    .replace(/"modifiedAt":\s*"[^"]+"/, `"modifiedAt": "${checkedAt}"`);
  fs.writeFileSync(filePath, `${frontmatter}\n\n${body.trim()}\n`, "utf8");
}

console.log(`Rewrote ${Object.keys(rewrites).length} high-similarity public blog articles.`);
