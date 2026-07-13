import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const modifiedAt = "2026-06-07T00:00:00.000Z";

const rewrites: Record<string, string> = {
  "ay-2026-27-bank-tds-without-form-16a-checklist.mdx": `
# AY 2026-27 Bank TDS Without Form 16A Checklist

A missing Form 16A does not remove bank interest from the return, and it does not automatically prevent a supported TDS claim. Reconstruct the gross interest and tax deduction from the bank's records, Form 26AS, AIS, and account statements before estimating a refund.

## Ask the bank for the right records

Request an annual interest certificate and a branch- or account-level TDS statement for FY 2025-26. For deposits that matured, renewed, or moved between branches, confirm whether the certificate covers every account and the full financial year.

| Record | Question to answer |
| --- | --- |
| Interest certificate | What gross interest did the bank credit or accrue? |
| Account and deposit statements | Which deposits, dates, and payments produced that interest? |
| Form 26AS | What TDS is available under the PAN for AY 2026-27? |
| AIS | Does third-party reporting show another interest or TDS entry? |

Net bank credit is not the gross interest figure when tax was withheld. Equally, a Form 26AS credit should not be claimed without checking the related interest income.

## Resolve a missing or incorrect credit

Compare the bank's TAN, payer name, gross amount, deduction date, and TDS amount with Form 26AS. If the entry is absent or uses the wrong PAN or amount, ask the bank to correct its TDS statement. Keep the complaint number, email, and revised certificate or statement.

The Income Tax Department's [tax-credit mismatch FAQ](https://www.incometax.gov.in/iec/foportal/node/11487) explains the credit record involved. Do not invent a TDS amount from a bank debit or claim a credit visible only in an unsupported spreadsheet.

## File from the full interest schedule

List savings interest, fixed-deposit interest, recurring-deposit interest, and any other bank income separately where the return requires it. Review deduction eligibility from the taxpayer's actual facts and regime; a TDS deduction does not determine the deduction or final liability.

Use the [income tax calculator](/calculators/income-tax) after gross interest and available credits are known. The [tax-credit mismatch guide](/blog/tax-credit-mismatch-tds-form-26as-ay-2026-27) covers the correction trail, while the [ITR form selector](/itr/form-selector) helps when other income changes the return form.

Keep the interest certificate, deposit statements, Form 26AS, AIS, bank correspondence, computation, filed return, and e-verification acknowledgement together.

## Example: certificate shows more interest than Form 26AS

Suppose the annual certificate shows interest from three deposits, while Form 26AS shows TDS connected to only two. Report interest from the supported deposit records, then investigate whether the third deposit had no deduction, was reported under another TAN, or is waiting for a correction. The refund estimate should use only tax credit currently supported under the PAN.

Check the [AIS viewer](/ais-viewer) against the downloaded statement, but retain the original files used for the return. If a missing bank correction could materially change the filing position, review the [wait-for-AIS and Form 26AS guide](/blog/wait-for-ais-form-26as-before-filing-itr-ay-2026-27) before deciding whether to submit. After filing, verify the return and monitor any later credit change rather than assuming the bank certificate alone will update the processed result.
`,
  "ay-2026-27-capital-gains-missing-ais-checklist.mdx": `
# AY 2026-27 Capital Gains Missing From AIS Checklist

AIS is a reporting signal, not a capital-gains ledger. If a sale is absent from AIS, the transaction can still belong in the AY 2026-27 return. Build the gain or loss from contract notes, broker reports, ownership records, acquisition cost, and corporate-action history.

## Identify exactly what AIS omitted

Start with a sale inventory for FY 2025-26. Separate listed shares, mutual funds, property, unlisted shares, bonds, and other capital assets because their cost, holding period, rate, and return schedules can differ.

| Sale evidence | Why it matters |
| --- | --- |
| Contract note or registered sale document | Establishes transfer date and consideration |
| Broker tradebook or fund statement | Shows quantity, price, charges, and transaction history |
| Demat or ownership record | Confirms holding and corporate actions |
| Purchase and improvement evidence | Supports cost and eligible adjustments |
| Bank statement | Traces material receipts and payments |

Compare this inventory with AIS and record which item is missing. Do not omit a supported sale merely to make the return agree with an incomplete AIS download.

## Calculate the gain independently

Determine the acquisition date, transfer date, supported cost, eligible expenses, and any special rule relevant to the asset. Bonus issues, splits, mergers, inherited assets, older purchases, and transfers between brokers frequently require more than a default broker report.

Use the [capital gains calculator](/calculators/capital-gains) for an estimate and the [capital gains import tool](/capital-gains-import) to organise broker files. Inspect every exception before using the output in a return.

## Leave an evidence trail for the difference

Download the AIS version used for review, give feedback where appropriate, and retain a reconciliation note linking the missing entry to the filed schedule. The Income Tax Department's [AIS guidance](https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/ais-annual-information-statement) explains the information statement but does not replace transaction evidence.

Select the return form from the full taxpayer profile. Capital gains commonly affect ITR eligibility, and business trading, foreign assets, or carried-forward losses can change the route again. Review the [ITR-2 checklist](/blog/itr-2-checklist-capital-gains-foreign-assets-ay-2026-27) before submission.

Retain the sale inventory, acquisition evidence, calculations, AIS download and feedback, filed schedules, and acknowledgement.

## Example: a broker sale appears nowhere in AIS

Assume a demat statement and contract note show a listed-share sale, but the AIS download has no corresponding entry. The supported sale still needs a holding-period and gain calculation. Add it to the sale inventory, preserve the broker and demat trail, and note that the AIS omission was reviewed. Do not create an artificial AIS value or postpone the transaction indefinitely without checking the filing deadline.

Where broker data is incomplete, the [stock-investor LTCG and STCG guide](/blog/ay-2026-27-stock-investor-ltcg-stcg-itr-guide) explains corporate-action and lot-history checks. If the sale changes the return from a simple salary form, review [which ITR form applies to salary plus capital gains](/blog/which-itr-form-salary-plus-capital-gains-ay-2026-27). A material unsupported cost, inherited asset, or disputed ownership fact should be resolved before the return is submitted.

The final working should identify every sale included despite the AIS omission and the exact evidence used for cost, date, and consideration.
`,
  "ay-2026-27-consultant-gst-tds-reconciliation-guide.mdx": `
# AY 2026-27 Consultant GST and TDS Reconciliation Guide

A consultant can have four different-looking totals for the same year: invoices issued, GST turnover, TDS-reported receipts, and bank collections. The return should explain those differences rather than choosing whichever figure is easiest to download.

## Build an invoice-to-receipt bridge

Create one row for every invoice and credit note. Record the client, service period, invoice value before GST, GST charged, withholding, collection date, and amount still outstanding.

| Reconciliation column | Typical source |
| --- | --- |
| Fee before GST | Invoice and engagement record |
| GST and place of supply | Invoice, GST ledger, and filed return |
| TDS deducted | Form 16A, Form 26AS, and AIS |
| Net cash received | Bank statement |
| Unpaid or reversed amount | Receivable ledger and credit note |

This bridge explains why a bank credit may be lower than the fee and why GST turnover or TDS reporting may fall in a different period.

## Investigate the difference by cause

Common causes include TDS, GST, platform or agency deductions, advances, late collections, credit notes, reimbursements, foreign receipts, and payer-reporting errors. Give each material difference a named reason and supporting record. Do not force GST turnover and income-tax receipts to match without considering the accounting and statutory basis used.

If Form 26AS shows the wrong gross amount or PAN, ask the client to correct its TDS filing. Claim only the tax credit supported under the consultant's PAN. The [tax-credit mismatch guide](/blog/tax-credit-mismatch-tds-form-26as-ay-2026-27) explains the correction trail.

## Decide return and GST actions separately

Presumptive treatment, books, return form, GST registration, and GST filing each depend on their own conditions. Confirm the actual consulting activity before using section 44ADA or ITR-4. Review the [professional-income guide](/blog/professional-income-44ada-itr-4-ay-2026-27) and the [GST filing scope](/gst-filing) where the records expose a registration or return issue.

Keep the engagement letters, invoice register, credit notes, GST returns, Form 16A, AIS, Form 26AS, receivable ledger, bank statements, computation, and acknowledgement. A clean bridge should let another reviewer move from the filed income figure back to individual client transactions.

## Example: invoice, GST return, and bank credit differ

Suppose a consultant invoices a client for a fee plus GST in March, the client deducts TDS on the fee, and the net payment reaches the bank in April. The invoice register, GST period, TDS record, receivable ledger, and bank collection can all show different but explainable amounts or dates. Document the bridge instead of deleting the March invoice or treating the April net credit as the fee.

The [GST returns service scope](/services/gst-returns) describes the return-period records needed when GSTR data is also affected. Use the [income tax calculator](/calculators/income-tax) only after the professional receipt and tax-credit figures are settled. Escalate when the client disputes the invoice, the GST treatment is uncertain, or the Form 26AS credit cannot be traced to the engagement.

Before filing, compare the final professional-receipt total with the invoice bridge and list every timing or classification difference still open. That list is useful for the next GST period, client correction, or tax-credit follow-up and prevents the same unexplained variance from recurring.
`,
  "ay-2026-27-crypto-vda-tax-records-checklist.mdx": `
# AY 2026-27 Crypto and VDA Tax Records Checklist

An exchange tax report is useful only for the transactions that exchange can see. Wallet transfers, decentralised trades, purchases on another platform, airdrops, staking receipts, and lost acquisition history can make its gain figure incomplete. Reconstruct the FY 2025-26 activity before filing AY 2026-27.

## Create a wallet-and-exchange inventory

List every exchange account, wallet address, custody platform, and bank route used during the year. Download transaction-level data before an account is closed or an exchange changes its export format.

| Event type | Evidence to preserve |
| --- | --- |
| Buy or sell | Trade confirmation, value, fees, and payment trail |
| Wallet transfer | Sending and receiving addresses plus transaction hash |
| Crypto-to-crypto exchange | Both assets, quantities, timestamp, and supported value |
| Reward, airdrop, or staking receipt | Source, receipt date, quantity, and valuation basis |
| TDS entry | Payer or exchange record, Form 26AS, and AIS |

Mark internal wallet transfers so they are not mistaken for disposals. Investigate deposits for which the acquisition source or cost is missing.

## Calculate each taxable event from supported data

Virtual digital asset rules can restrict how losses and costs are treated. Do not apply ordinary share-investment assumptions to VDA transactions. Use the transaction inventory to identify the consideration, cost evidence, charges, and any event requiring separate review.

Where an exchange reports a rupee value, retain the report and the basis used. Cross-platform and decentralised activity may need a separate calculation because no single statement contains both sides.

## Match VDA TDS without relying on it as the transaction ledger

Compare exchange or payer TDS records with Form 26AS and AIS. A TDS credit can identify a disposal that is missing from an exchange summary, but it does not establish the gain or cost. Ask the reporting party to correct an inaccurate PAN or amount.

Use the [income tax calculator](/calculators/income-tax) only after the VDA working and other income are assembled. Review the [capital gains and trading-income guide](/blog/capital-gains-trading-income-itr-guide-ay-2026-27) and [ITR form selector](/itr/form-selector) before choosing the filing route.

Retain raw exports, wallet evidence, transaction hashes, valuation notes, bank statements, TDS records, AIS, Form 26AS, computation, filed return, and acknowledgement.

## Example: coins move between two personal wallets

A withdrawal from an exchange followed by a matching receipt in a self-custody wallet may be an internal transfer rather than a disposal. Match the asset, quantity, timestamp, transaction hash, sending address, receiving address, and network fee. Keep the evidence that both wallets belong to the taxpayer. If the received quantity or destination cannot be explained, do not label the movement internal merely to avoid investigating it.

Use the [crypto and VDA records checklist](/blog/ay-2026-27-crypto-vda-tax-records-checklist) for transaction-treatment questions and the [high-value AIS checklist](/blog/ay-2026-27-high-value-transaction-ais-checklist) when reported entries do not align with the inventory. Exchange shutdowns, inaccessible wallets, missing cost history, overseas accounts, and large peer-to-peer transactions are escalation points because the ordinary exchange export may not support the filed position.
`,
  "ay-2026-27-salary-rsu-esop-itr-guide.mdx": `
# AY 2026-27 Salary, RSU, and ESOP ITR Guide

Equity compensation can create two separate tax events: employment income when shares or options vest or are exercised, and capital gain or loss when the shares are later sold. The employer payroll file rarely contains everything needed for the eventual sale calculation.

## Split every award into grant, vest, exercise, and sale events

Prepare an award ledger for each employer plan. Record grant terms, vesting dates, exercise details where relevant, shares delivered, payroll perquisite value, taxes withheld, sale dates, sale proceeds, and transaction fees.

| Evidence | Filing purpose |
| --- | --- |
| Award agreement and vest statement | Explains the plan and shares becoming available |
| Payslip and Form 16 | Supports employment perquisite and payroll withholding |
| Broker statement | Establishes later sale and charges |
| Foreign account statement | Supports holdings, dividends, and year-end balances |
| Remittance and bank records | Traces proceeds and foreign transactions |

Do not tax the same value twice. The cost used for a later sale working should be connected to the employment-tax event and the actual award facts.

## Check foreign-asset and foreign-income schedules

Shares held through an overseas broker can raise foreign-asset, foreign-income, and tax-relief questions for a resident taxpayer. Reporting periods and valuation requirements may differ by schedule. Review the actual account, residency status, dividends, withholding, and sale activity rather than treating every award as only salary.

The [Schedule FA guide](/blog/schedule-fa-foreign-bank-rsu-espp-us-stocks) explains the asset inventory. Use the [FSI, TR, and FA comparison](/blog/schedule-fa-vs-fsi-vs-tr) when foreign income or tax credit is also involved.

## Reconcile payroll and broker values

Match Form 16 and payslips with the employer equity statement. Then calculate any sale gain or loss from broker evidence and supported cost. Investigate AIS entries without using them as a substitute for the award ledger.

Equity compensation, foreign assets, and capital gains can affect ITR form eligibility. Use the [ITR form selector](/itr/form-selector) after the full salary, award, investment, and foreign-asset profile is known.

Keep award documents, payroll records, foreign statements, valuations, broker reports, remittance records, tax-credit evidence, computation, filed schedules, and acknowledgement.

## Example: RSUs vest and are partly sold for tax

When an employer delivers shares and immediately sells some to meet payroll withholding, the vest statement, payslip, and broker statement should explain the event together. Record the shares vested, shares sold, perquisite value, withholding, remaining holding, and later sale separately. Do not treat the entire broker sale proceeds as new salary or ignore the remaining overseas holding.

The [resident foreign-asset disclosure checklist](/blog/ay-2026-27-resident-foreign-asset-disclosure-checklist) helps organise ownership and balance facts. Use the [capital gains calculator](/calculators/capital-gains) for a later sale estimate only after the supported cost and sale data are ready. Escalate when payroll value, broker value, foreign withholding, or the number of shares delivered cannot be reconciled across the award records.

Before filing, reconcile the award ledger to Form 16 and the year-end broker holding. Any difference in shares, value, withholding, or ownership should have a written explanation and supporting statement before the salary, capital-gain, or foreign-asset schedules are finalised.
`,
  "ay-2026-27-dividend-income-ais-reconciliation-guide.mdx": `
# AY 2026-27 Dividend Income and AIS Reconciliation Guide

Dividend entries can be scattered across broker ledgers, bank accounts, company statements, mutual-fund reports, AIS, and Form 26AS. A reliable AY 2026-27 return starts with an issuer-level dividend register rather than a single AIS total.

## Build an issuer-level register

List each company, fund, or foreign issuer that paid a dividend during FY 2025-26. Record declaration or distribution details where available, amount received, bank date, tax deducted, and the account or holding that produced it.

| Source | What to verify |
| --- | --- |
| Broker or registrar statement | Issuer, units or shares, dividend, and payment status |
| Bank statement | Net receipt and payment date |
| AIS | Third-party-reported dividend entries |
| Form 26AS | TDS credit available under the PAN |
| Foreign statement | Overseas dividend and withholding evidence |

Reinvested dividends and amounts paid to another bank account can be missed when the working is built only from one statement.

## Explain AIS and bank differences

AIS may contain duplicates, timing differences, or an amount reported by an issuer that does not match the bank credit. Compare the issuer record and tax deduction before deciding the return amount. Give AIS feedback where appropriate and keep the evidence supporting the filed figure.

If tax was deducted, claim only the Form 26AS credit connected to the taxpayer's PAN. Ask the payer to correct an inaccurate entry rather than altering the dividend register to fit it.

## Keep dividend, expense, and foreign-tax questions separate

Dividend tax treatment and any permitted expense restriction should be reviewed from current law and the taxpayer's facts. Foreign dividends can also require foreign-income, asset-disclosure, and tax-relief analysis. Do not net withholding or portfolio charges into the income figure without a supported treatment.

Review the [AIS mismatch guide](/blog/handle-ais-mismatch-before-after-itr) and [Schedule FA versus FSI versus TR guide](/blog/schedule-fa-vs-fsi-vs-tr) where foreign holdings are involved. Use the [ITR form selector](/itr/form-selector) after all income heads are listed.

Retain the dividend register, statements, AIS download and feedback, Form 26AS, foreign withholding evidence, computation, filed return, and acknowledgement.

## Example: AIS shows a dividend that never reached the usual bank

Trace the issuer through registrar, broker, and holding records before assuming the AIS entry is wrong. The amount may have been reinvested, paid to an older account, adjusted, or reported inaccurately. Record the investigation and use the amount supported by the complete evidence, with AIS feedback where appropriate.

The [dividend and capital-gains filing guide](/blog/capital-gains-trading-income-itr-guide-ay-2026-27) helps keep investment income and sale transactions separate. Use the [income tax calculator](/calculators/income-tax) after all dividend, withholding, and other income figures are assembled. Escalate when ownership is disputed, a foreign issuer is involved, a dividend belongs to a joint holding, or the issuer and tax-credit records continue to show incompatible amounts.

Before submission, total the register by issuer and compare it once more with AIS, Form 26AS, and the filed dividend schedule. Preserve an explanation for each unresolved issuer-level difference instead of keeping only one unexplained annual total.
`,
  "ay-2026-27-doctor-professional-receipts-itr-guide.mdx": `
# AY 2026-27 Doctor Professional Receipts ITR Guide

A doctor's bank account can contain hospital payouts, consultation fees, procedure shares, insurer settlements, reimbursements, advances, and personal transfers. Prepare a practice-level receipt working before deciding turnover, expenses, presumptive eligibility, or the return form.

## Separate each practice arrangement

List every hospital, clinic, platform, insurer, and direct-patient collection route. Record whether the arrangement is employment, independent professional work, revenue share, room rent, or another commercial relationship.

| Practice record | What it should explain |
| --- | --- |
| Hospital or platform statement | Gross fees, deductions, revenue share, and settlement |
| Appointment or billing register | Services rendered and patient collections |
| Form 16 or Form 16A | Salary or professional-fee reporting and TDS |
| Bank and payment-gateway report | Net collections, refunds, and settlement dates |
| Expense invoice | Practice purpose, supplier, amount, and payment |

A hospital may deposit a net amount after TDS, facility charges, or adjustments. Reconcile the gross professional receipt separately from the amount reaching the bank.

## Review expenses and reimbursements

Keep invoices and purpose notes for clinic rent, staff, equipment, software, professional indemnity, and other practice costs. Separate capital equipment from recurring expense and personal medical or household spending from the professional file.

Where a hospital reimburses an amount or pays an expense directly, identify the underlying arrangement before including or excluding it from the working.

## Test the filing route from actual activity

Section 44ADA eligibility and presumptive limits depend on current statutory conditions and the professional activity. Do not choose a presumptive percentage solely because the taxpayer is a doctor. Books, audit questions, salary, partnership income, gains, and foreign assets can alter the route.

Match Form 16A and Form 26AS with hospital statements before claiming TDS. Review the [professional-income guide](/blog/professional-income-44ada-itr-4-ay-2026-27), [ITR-3 checklist](/blog/itr-3-checklist-business-fno-profession-ay-2026-27), and [ITR form selector](/itr/form-selector) once the receipt working is ready.

Retain contracts, hospital statements, billing and collection records, expense evidence, TDS certificates, AIS, Form 26AS, computation, filed return, and acknowledgement.

## Example: a hospital pays after several deductions

Suppose a hospital statement shows gross consultation fees, a facility charge, TDS, and a net settlement. Enter the gross professional receipt in the practice working, record the facility charge according to its supported treatment, and match the TDS with Form 26AS. The bank credit should close the settlement, not replace its components.

Use the [bank statement analyser](/bank-analyzer) to organise transaction review without treating automated categories as final. The [GST registration service scope](/services/gst-registration) is relevant when practice turnover or service facts raise GST questions. Escalate when patient collections are shared across practitioners, a hospital reports the wrong PAN, cash billing is incomplete, high-value equipment lacks invoices, or a partnership and individual practice are mixed in one account.

The final practice summary should show each collection route, its gross receipts, deductions, refunds, and outstanding amounts. Compare that summary with the income entered in the return and retain the reconciliation so later hospital corrections or notices can be answered from the same transaction trail.
`,
  "calculate-foreign-asset-values-sbi-tt-buying-rate.mdx": `
# How to Calculate Foreign Asset Values Using the SBI TT Buying Rate

Foreign-asset schedules can ask for rupee values even when the account, share, or property record is denominated in another currency. The calculation is not simply “use today's exchange rate.” Identify the required value date and schedule instruction first, then preserve the exact rate used for that date.

## Start with the schedule field, not the currency

For each asset, record the asset type, country, currency, acquisition date, relevant peak or closing value date, income received, and disposal date if any. Different fields can require different dates or amounts.

| Calculation input | Evidence |
| --- | --- |
| Foreign-currency amount | Broker, bank, employer, or ownership statement |
| Required valuation date | Applicable return schedule and instructions |
| Currency pair | Asset statement and rate source |
| SBI TT buying rate | Dated SBI rate record or supported archive |
| Rupee result | Calculation sheet showing amount multiplied by rate |

Do not reuse one year-end rate for every field unless the applicable instruction permits it.

## Preserve the dated rate evidence

Capture the SBI TT buying rate for the relevant currency and date. Where the required date is a non-business day or the rate is not directly available, document the supported method used after reviewing the applicable instruction. Keep the source image, PDF, or archive reference with the calculation.

For an account with several required values, make one row per value rather than overwriting the calculation. This is especially useful when peak balance, closing balance, income, and sale proceeds refer to different dates.

## Connect valuation with the asset and income schedules

A rupee conversion does not settle whether the asset belongs in Schedule FA, whether foreign income belongs in Schedule FSI, or whether foreign tax relief is available. Residency, ownership, beneficial interest, reporting period, and the nature of income still need separate review.

Use the [Schedule FA calendar-year guide](/blog/schedule-fa-calendar-year-or-financial-year) to confirm the reporting period and the [Schedule FA versus FSI versus TR guide](/blog/schedule-fa-vs-fsi-vs-tr) to separate the schedules. The [foreign-bank, RSU, ESPP, and US-stock guide](/blog/schedule-fa-foreign-bank-rsu-espp-us-stocks) helps build the asset inventory.

Retain the foreign statement, schedule instruction, dated rate evidence, calculation workbook, income and withholding records, filed schedules, and acknowledgement.

## Worked calculation record

For each value, write a short formula such as "USD statement value on required date multiplied by the documented INR per USD SBI TT buying rate for that date." Preserve the unrounded inputs, the rounded return value, and the source file name. This lets a later reviewer reproduce the result without guessing which rate or statement was used.

Use the [foreign-asset email response guide](/blog/received-foreign-asset-email-revise-itr) when a department communication exposes a missing or inaccurate disclosure. The [NRI, RNOR, and resident-status guide](/blog/nri-rnor-resident-status-itr-ay-2026-27) helps frame the residency question before schedules are selected. Escalate unavailable historical rates, disputed ownership, employer-plan values, jointly held accounts, and assets whose required field or valuation date is unclear.

Name each calculation row so it can be tied back to the exact asset and schedule field.
`,
  "defective-return-notice-section-139-9.mdx": `
# Defective Return Notice Under Section 139(9): Response Checklist

A defective-return notice is not a request to file the same return again without investigation. Read the communication, identify the defect code and deadline, compare it with the submitted return, and decide whether the defect can be corrected through the response workflow.

## Authenticate the notice and preserve the starting record

Download the notice from the income-tax account and retain the communication, date, assessment year, acknowledgement number, defect description, and response deadline. Do not rely only on an email excerpt or message.

Then download the return as filed, computation, schedules, tax-payment records, and e-verification acknowledgement. The response should be based on the actual submitted data.

## Translate the defect into a document question

| Defect area | Records to inspect |
| --- | --- |
| Return form or schedule | Income heads, eligibility facts, and filed schedules |
| Tax payment or credit | Challans, Form 26AS, AIS, and computation |
| Books or financial information | Balance sheet, profit and loss, audit facts, and business records |
| Missing or inconsistent disclosure | Filed return, source statements, and supporting calculation |

Record the exact change proposed and why it cures the defect. If the notice appears incorrect, prepare the evidence supporting that conclusion rather than accepting or rejecting it casually.

## Choose the response route before the deadline

Use the portal workflow and current instructions attached to the notice. Some defects may require corrected return data; others may call for a reasoned disagreement. A revised return, rectification request, updated return, grievance, and section 139(9) response are not interchangeable.

The [belated, revised, and updated-return guide](/blog/how-to-file-belated-revised-updated-return-ay-2026-27) explains the distinctions. Use the [notice compliance service scope](/services/notice-compliance) when the defect affects form eligibility, books, audit, business loss, or another material filing position.

## Verify the response outcome

After submission, save the response acknowledgement and monitor the portal for acceptance, further communication, or another action. Keep the original return, notice, response working, uploaded data, acknowledgement, and later status together. Missing the notice deadline can have serious consequences, so escalate early when records or portal access are incomplete.

## Example: business figures are missing from the filed schedules

If the notice identifies missing balance-sheet or profit-and-loss information, compare the return with the books and the form requirements before uploading corrected data. Confirm whether the original form was eligible, whether audit facts are involved, and whether the proposed response changes income or only supplies omitted particulars. Do not type figures solely to clear the portal validation.

Review the [ITR-3 business and profession checklist](/blog/itr-3-checklist-business-fno-profession-ay-2026-27) where business schedules are involved. Use the [contact and escalation page](/contact) to record a support request before the response deadline when portal access fails. Any defect involving an incorrect form, unsupported loss, books, audit, foreign asset, or material tax change warrants case-specific review.

Before sending the response, compare the proposed correction with the original defect wording and confirm that no unrelated return figure changed accidentally. Save a final difference report or screenshot of the corrected data together with the response acknowledgement and the portal status.
`,
  "demand-notice-after-tax-regime-change.mdx": `
# Demand Notice After a Tax Regime Change

A demand appearing after an old-versus-new regime change usually means at least one part of the filed position, processing record, tax credit, or regime election does not match. Start with the intimation and computation difference; do not pay, disagree, or submit a correction before identifying the cause.

## Rebuild both tax computations

Prepare one computation under the regime used in the filed return and another under the regime reflected in the intimation. Compare income, exemptions, deductions, rebate, surcharge, cess, interest, and tax credits line by line.

| Difference to inspect | Evidence |
| --- | --- |
| Regime selected in the return | Filed return and acknowledgement |
| Eligibility or election requirement | Taxpayer facts and applicable filing record |
| Deductions and exemptions | Form 16, proofs, and computation |
| TDS, TCS, and advance tax | Form 26AS, AIS, and challans |
| Processed tax and interest | Section 143(1) intimation |

A demand can come from more than the regime choice. A missing credit, changed income figure, disallowed deduction, or interest calculation may explain part of it.

## Decide whether to agree, correct, or contest

If the processed result is correct, verify the payment route and retain the challan. If the filed return or credit record is wrong, identify the legally available correction route and deadline. If the processing record is inconsistent with the supported filed position, prepare a reasoned response with the relevant evidence.

The [section 143(1) intimation guide](/blog/section-143-1-intimation-after-itr-filing) explains how to read the processing comparison. Use the [regime comparator](/calculators/regime-comparator) to rebuild an estimate, but base the response on the filed records and applicable law.

## Keep the demand trail intact

Do not assume a portal response alone closes the matter. Save the demand reference, intimation, computations, response or payment record, challan, rectification or grievance acknowledgement where relevant, and later status. Review the [notice compliance scope](/services/notice-compliance) when the demand is material, the regime election is disputed, or the correct response route is unclear.

## Example: deductions disappear during processing

If the intimation removes old-regime deductions, first confirm which regime was selected and whether any required election or filing condition was met. Then compare each disallowed amount with the filed schedule and evidence. A fresh regime comparison can quantify the difference, but it cannot by itself prove that the filed election or deduction was valid.

The [old-versus-new regime salary guide](/blog/new-vs-old-regime-salary-fy-2025-26) explains the underlying comparison, and the [refund and demand status tracker](/itr/status-tracker) can organise follow-up after a response. Escalate before the portal deadline when the demand includes unexplained income, missing tax credits, a disputed election, or an amount too large to address from incomplete records.

Before choosing a response, make a one-page difference note showing the filed regime, processed regime, deductions changed, credits changed, interest charged, and resulting demand. That note keeps a payment decision, correction request, and disagreement response tied to the actual source of the amount.

Record the portal deadline and the person responsible for the next action.
`,
  "freelancers-foreign-clients-schedule-fa.mdx": `
# Freelancers With Foreign Clients: Schedule FA and Foreign-Income Checks

Being paid by a foreign client does not automatically mean the freelancer owns a foreign asset. Schedule FA questions arise from the actual account, ownership, beneficial interest, signing authority, shares, or other foreign asset involved, not merely from the client's location.

## Map how each client paid

For every foreign client, record the contract, invoice currency, service period, gross fee, payment processor, receiving account, fees, withholding, and final Indian-bank credit.

| Payment route | Question to investigate |
| --- | --- |
| Direct credit to an Indian bank | Was any foreign account or wallet used before receipt? |
| Foreign payment platform | Did the freelancer hold a reportable balance or account? |
| Overseas bank account | What ownership, authority, balance, and income facts apply? |
| Shares or equity compensation | Is there a foreign holding, dividend, or disposal? |
| Foreign tax withheld | Does the income and relief record support an FSI or TR claim? |

A payment processor statement can show a balance or account relationship that is absent from the Indian bank statement. Download transaction and balance reports before preparing the schedules.

## Separate income reporting from asset disclosure

Foreign-client fees need a supported income and turnover treatment. Foreign assets, foreign-source income, and foreign-tax relief have separate schedule questions. Do not use Schedule FA as a substitute for reporting professional receipts, and do not assume a foreign remittance creates a tax-relief claim.

Residency status is central to foreign-asset disclosure. Confirm it before deciding whether a schedule applies. The reporting period for a schedule may also differ from the financial-year receipt working.

## Reconcile currency, GST, and tax records

Keep invoices, foreign-currency amounts, conversion evidence, platform fees, bank realisation, and any withholding record. Reconcile GST or export-service records separately from the income-tax working where applicable.

Use the [Schedule FA calendar-year guide](/blog/schedule-fa-calendar-year-or-financial-year) and [Schedule FA versus FSI versus TR guide](/blog/schedule-fa-vs-fsi-vs-tr) to separate the questions. The [freelancer turnover guide](/blog/ay-2026-27-freelancer-gst-turnover-income-tax-turnover) covers the GST and income-tax bridge.

Retain contracts, invoices, platform and foreign-account statements, bank records, currency calculations, withholding evidence, filed schedules, and acknowledgement.

## Example: a payment platform holds funds before transfer

Suppose a foreign client pays into a platform wallet in December and the freelancer transfers the money to an Indian bank in January. Record the client receipt, platform balance, fees, currency conversion, and bank transfer as distinct events. Then assess the income timing and any foreign-account disclosure from the applicable facts rather than using only the January bank credit.

The [consultant GST and TDS reconciliation guide](/blog/ay-2026-27-consultant-gst-tds-reconciliation-guide) helps bridge invoices and collections. Use the [ITR-3 checklist](/blog/itr-3-checklist-business-fno-profession-ay-2026-27) where professional or business schedules apply. Escalate foreign tax withholding, overseas incorporation, platform balances, signing authority, equity compensation, or residency uncertainty before finalising the schedules.

Before filing, reconcile the foreign-client ledger to invoices, platform reports, Indian-bank credits, and any foreign balance still held. Preserve the currency conversion and fee calculation for each material receipt so the income figure and any asset disclosure can be reproduced later.
`,
  "ay-2026-27-agricultural-income-disclosure-guide.mdx": `
# AY 2026-27 Agricultural Income Disclosure Guide

Calling a receipt “farm income” does not establish its tax treatment. Build the disclosure from land rights, crop or agricultural activity, sale evidence, expenses, and the taxpayer's other income before preparing AY 2026-27 schedules.

## Connect the receipt to land and activity

Record who owns or lawfully uses the land, its location and area, the crop or agricultural operation, the relevant season, and who carried out the work. Tenancy, family ownership, shared cultivation, and contractor arrangements should be supported rather than assumed.

| Evidence | What it helps establish |
| --- | --- |
| Land record, lease, or cultivation right | Connection between taxpayer and land |
| Crop and input records | Nature and period of agricultural activity |
| Mandi, buyer, or sale receipt | Produce sold, quantity, date, and amount |
| Bank and cash record | Receipt trail and material payments |
| Expense and labour evidence | Supported cost and agricultural operation |

Separate sale of agricultural produce from rent, trading, processing, dairy, interest, compensation, or another receipt that may need different treatment.

## Reconcile quantity and cash flow

Prepare a crop-wise summary showing area, expected or actual yield, quantity sold, buyer, sale value, and unsold stock where relevant. Investigate amounts that cannot be connected to produce or land activity. Large cash deposits should not be labelled agricultural income without a coherent transaction trail.

## Review disclosure and rate impact

Agricultural income can be exempt while still affecting the tax calculation in specified circumstances. The taxpayer's non-agricultural income, amount of agricultural income, and applicable rules need to be considered together. State-specific land or activity facts can also matter.

Use the [income tax calculator](/calculators/income-tax) only after the supported agricultural and non-agricultural figures are separated. The [ITR form selector](/itr/form-selector) helps identify the return route, while the [high-value transaction AIS guide](/blog/ay-2026-27-high-value-transaction-ais-checklist) is useful when deposits or reported transactions need explanation.

Keep land and cultivation records, crop and sale evidence, bank trail, expense working, computation, filed return, and acknowledgement.

## Example: crop sale and cash deposit do not match

Suppose sale receipts support produce worth one amount, while cash deposits are materially higher. Prepare a date-wise bridge covering buyers, quantities, sale proceeds, cash held, expenses paid, and deposits made. Identify any non-agricultural source separately. A broad statement that all cash came from farming is not enough when the records show a gap.

Review the [cash-deposit AIS guide](/blog/ay-2026-27-cash-deposit-ais-review-guide) when reported transactions need explanation. The [document vault guide](/blog/mye-ca-document-vault-guide) can help organise sensitive land and sale records before review. Escalate shared-family operations, leased land without records, processing activity, commission trading, compensation receipts, or inconsistent crop and bank data because those facts can change the disclosure.

Before filing, ask whether an independent reviewer could connect the disclosed amount to identified land, a crop cycle, buyers, quantities, and the receipt trail. If not, the missing evidence or unexplained amount should be recorded and resolved rather than hidden inside a rounded agricultural-income total.

Keep the crop-wise summary with the final tax computation.
`,
  "ay-2026-27-education-loan-interest-deduction-guide.mdx": `
# AY 2026-27 Education Loan Interest Deduction Guide

An education-loan EMI contains principal and interest, but the deduction question concerns supported interest and the statutory conditions. Start with the lender's annual interest certificate and the borrower-student relationship rather than the total EMI paid.

## Confirm the loan and education facts

Record the borrower, student, lender, course, institution, sanction date, repayment start, and purpose shown in the loan agreement. A personal loan used informally for education may not satisfy the same conditions as an eligible education loan from a qualifying lender.

| Record | What to verify |
| --- | --- |
| Sanction letter and loan agreement | Borrower, purpose, lender, and terms |
| Interest certificate | Interest attributable to FY 2025-26 |
| Repayment statement | Payment dates, principal, interest, and overdue amounts |
| Course and admission records | Student and higher-education connection |
| Bank statement | Actual payment trail |

Do not claim the entire EMI or rely only on a bank debit description.

## Check who may claim and for how long

The deduction depends on the person who took and repaid the eligible loan, the relationship to the student, the repayment period, and current statutory conditions. Confirm the first year in which interest repayment began and track the permitted period.

If family members split payments, identify the borrower and actual payer before deciding the claim. Keep evidence for any change in repayment account or loan transfer.

## Compare the deduction with regime choice

Deduction availability can differ by tax regime. Prepare the supported interest figure first, then compare the old and new regime using the taxpayer's complete income and deduction profile. A larger interest certificate does not automatically make one regime preferable.

Use the [tax regime calculator](/calculators/tax-regime) for an estimate and the [old-regime deductions guide](/blog/old-regime-useful-hra-80c-80d-nps-home-loan) for related checks. Select the return through the [ITR form selector](/itr/form-selector) after adding all income sources.

Retain the sanction letter, agreement, course records, interest certificate, repayment statement, bank evidence, regime comparison, filed return, and acknowledgement.

## Example: a parent pays a child's education-loan EMI

Identify who borrowed from the lender, whose education the loan funded, which account made the repayment, and what the annual certificate reports as interest. Do not split or move the claim between family members solely because one person transferred money to another before the EMI was paid. Preserve the account trail and review the statutory relationship and borrower conditions.

The [education-loan interest calculator](/calculators/education-loan) can model repayment but does not decide deduction eligibility. Review the [section 80C, 80D, and NPS checklist](/blog/section-80c-80d-nps-old-regime-checklist-ay-2026-27) when building the wider deduction file. Escalate loan refinancing, overseas study, non-qualifying lenders, mixed personal borrowing, unpaid interest, or unclear borrower and payer facts before claiming the amount.

Before filing, write down the exact interest amount claimed, the certificate line supporting it, the borrower and student relationship, the repayment-start year, and the regime used. That short note prevents principal, overdue charges, or unsupported family payments from being folded into the deduction.

Recheck the certificate if the lender later revises the annual statement.
`,
  "ay-2026-27-intraday-trading-income-itr-guide.mdx": `
# AY 2026-27 Intraday Trading Income ITR Guide

Intraday equity trades are not delivery-based capital gains. Prepare a business-income working from the broker's tradebook, contract notes, turnover calculation, expenses, and year-end records before choosing ITR-3 or deciding how a loss is treated.

## Separate intraday from delivery and derivatives

Export the full broker tradebook and mark delivery equity, intraday equity, futures and options, and other products separately. A consolidated broker profit-and-loss statement can hide the distinctions needed for turnover, loss, and schedule reporting.

| Trading record | Filing use |
| --- | --- |
| Tradebook and contract notes | Buy, sell, quantity, time, price, and charges |
| Intraday P&L | Scrip-level result for same-day positions |
| Turnover working | Method and figures used for business turnover |
| Ledger and bank statement | Funds, charges, settlements, and withdrawals |
| Expense evidence | Supported cost connected to trading activity |

Reconcile open positions and confirm that delivery trades or investments were not included in the intraday result.

## Calculate turnover and preserve the method

Intraday turnover is not simply the total sale value shown by the broker. Prepare the turnover calculation using the applicable method and retain it with the trade data. The result can affect books, audit analysis, and filing decisions.

Do not copy a turnover number from a dashboard without checking how it was calculated. Where multiple brokers are used, combine the activity only after each broker file is reconciled.

## Review losses, expenses, and return timing

Intraday results can raise speculative-business loss questions. Set-off and carry-forward treatment, return deadline, and audit position depend on the taxpayer's complete facts. Claim only expenses connected to the trading activity and supported by evidence; keep personal investing costs separate.

Use the [ITR-3 checklist](/blog/itr-3-checklist-business-fno-profession-ay-2026-27) and [capital gains and trading-income guide](/blog/capital-gains-trading-income-itr-guide-ay-2026-27) before filing. The [capital gains import tool](/capital-gains-import) can organise broker records, but the intraday turnover and business treatment still require review.

Retain tradebooks, contract notes, turnover calculation, ledgers, bank and expense records, computation, filed return, and acknowledgement.

## Example: the broker dashboard labels all profit as capital gains

Use the tradebook to isolate positions opened and closed on the same day. Recalculate the intraday result and turnover separately from delivery investments and derivatives, then compare the result with the broker's consolidated report. Record the reason for every material difference rather than accepting the dashboard label.

The [F&O loss carry-forward guide](/blog/ay-2026-27-fno-loss-carry-forward-trader-guide) covers a related but distinct trading category. Use the [advance tax calculator](/calculators/advance-tax) when the reconciled business result affects instalments. Escalate multiple brokers, missing contract notes, unusual turnover calculations, large losses, audit uncertainty, or mixed investment and business treatment before filing, because these issues can affect more than the final profit figure.

Before submission, compare the intraday turnover method, profit or loss, expenses, and return schedules with the broker-level working. Record any item intentionally excluded from intraday activity and why. That review helps preserve the distinction between speculative business, derivatives, and delivery investment.

Keep the broker exports in their original downloaded format.
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
    .replace(/"modifiedAt":\s*"[^"]+"/, `"modifiedAt": "${modifiedAt}"`);
  fs.writeFileSync(filePath, `${frontmatter}\n${body.trim()}\n`, "utf8");
}

console.log(`Rewrote ${Object.keys(rewrites).length} lower-threshold similarity articles.`);
