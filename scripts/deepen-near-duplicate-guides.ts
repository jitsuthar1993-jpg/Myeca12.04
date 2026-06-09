import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;
const startMarker = "<!-- overlap-rewrite:start -->";
const endMarker = "<!-- overlap-rewrite:end -->";

const additions: Record<string, string> = {
  "ay-2026-27-first-time-salaried-employee-itr-guide": `## Build the first salary return from the payroll trail

Start with the employment letter, monthly payslips, Form 16, annual salary statement, bank credits, and Form 26AS. Reconcile gross salary, exemptions considered by payroll, perquisites, deductions, and TDS before selecting ITR-1 or another form. The amount deposited in the bank is not the taxable salary, and a payroll refund estimate is not the filed return result.

Add interest, dividends, gains, freelance receipts, rent, or other income that the employer may not know about. Compare AIS with the taxpayer's own records and investigate unexpected entries without copying them automatically. If the old regime is being considered, retain evidence for each claim; if the new regime is selected, remove claims that do not apply.

Before filing, check the PAN, bank account, assessment year, form, regime, tax credits, payment if any, and e-verification route. Keep the final computation and acknowledgement with the source records. Escalate multiple employers, foreign assets, capital gains, missing TDS, or a form question the salary-only return cannot handle.`,
  "ay-2026-27-fno-loss-carry-forward-trader-guide": `## Preserve the F&O loss from broker data to the filed schedule

Export tradebooks, contract notes, broker ledgers, tax profit-and-loss reports, bank movements, and expense records for every broker. Recalculate turnover using the applicable method and reconcile it with the derivatives result. Do not use gross contract value, a dashboard headline, or the bank withdrawal as the turnover or loss figure.

Separate F&O from intraday equity, delivery investments, and other business activity. Review expenses, books, audit questions, set-off treatment, and the filing deadline from the complete facts. A supported loss may still fail to carry forward if the return is filed late or the wrong schedules and form are used.

Keep the broker-level calculation, combined turnover and loss working, expense evidence, audit analysis where relevant, tax computation, filed return, and acknowledgement. Explain every material difference between broker reports and the final schedule. Escalate missing trade history, multiple-broker inconsistencies, large losses, uncertain turnover, or a late-filing risk before submission.`,
  "ay-2026-27-freelancer-gst-turnover-income-tax-turnover": `## Reconcile four different freelancer totals

Prepare an invoice register showing the fee before GST, GST amount, credit notes, TDS, platform charges, collection date, and amount outstanding. Compare that register with GST returns, Form 16A, Form 26AS, AIS, and bank receipts. GST turnover, income-tax receipts, TDS-reported gross amounts, and cash collections can differ for explainable reasons; forcing them into one number hides the issue.

Name each difference as timing, tax component, advance, refund, credit note, unpaid invoice, foreign receipt, or reporting error. Keep net bank credits separate from gross fees and withholding. If a payer reports the wrong amount or PAN, request a correction and retain the response.

Use the reconciled activity to review return form, presumptive eligibility, books, expenses, GST filing, and tax credits. Preserve invoices, contracts, GST records, TDS certificates, bank statements, the bridge between totals, computation, and acknowledgement. Escalate mixed activities, foreign accounts, unsupported expenses, or turnover differences that remain unexplained.`,
  "ay-2026-27-medical-disability-deduction-family-checklist": `## Connect the deduction claim to the correct person and certificate

Identify the taxpayer, the person with the disability, their relationship, dependency facts where relevant, and the exact deduction being considered. Keep the prescribed certificate or official record, issuing authority, validity details, and renewal or reassessment information separate from general medical bills. A medical expense does not automatically establish a disability deduction, and a certificate does not support every healthcare claim.

Match names, identifiers, dates, and claimed conditions across the certificate and return records. Record whether the claim relates to the taxpayer or a dependant and retain the documents required for that route. Protect clinical information by sharing only what is necessary for filing or review.

Before submission, confirm the applicable provision, regime, amount, certificate status, and schedule entry. Keep the certificate, dependency and identity evidence where required, calculation, filed return, and acknowledgement together. Escalate an expired or unclear certificate, conflicting family records, multiple possible claimants, or a claim that depends on facts not established by the available evidence.`,
  "government-scheme-2026-farmer-scheme-search-before-applying": `## Search by the farming need before comparing schemes

Define the problem first: income support, seasonal credit, crop insurance, irrigation, solar equipment, soil advice, fisheries support, or another activity. Record the farmer, land or activity, crop or asset, location, season, bank account, and requested outcome. A programme suited to one need should not be presented as an alternative for a different need merely because both involve farmers.

For each shortlisted scheme, note the administering authority, current application route, applicant category, records requested, deadline or cycle, and whether local verification is involved. Compare those requirements with the farmer's actual land, crop, identity, and bank records. Remove schemes whose basic fit cannot be supported.

Keep the comparison and official pages checked with the final application trail. Do not pay an unofficial intermediary for a promised benefit. Escalate inconsistent land or household records, unclear eligibility, state-specific routes, or an application that asks for a fact the available documents cannot establish.`,
  "government-scheme-2026-kisan-credit-card-application-checklist": `## Explain the agricultural credit need to the lender

Build a credit note that connects the applicant, land or eligible activity, crop or production cycle, amount requested, intended use, existing borrowing, expected receipts, and repayment account. A land record can support the holding, but it does not explain the full credit requirement; a bank statement can show transactions, but it does not prove the agricultural activity by itself.

Reconcile identity, land or activity records, crop plan, quotations where relevant, bank account, and current loans before presentation. Keep the figures in the request consistent with the supporting documents and disclose unresolved differences instead of adjusting them silently.

Preserve the submitted application, lender questions, replies, sanction or rejection, account operation, and repayment history. Credit approval, limit, security, and pricing remain lender decisions. Escalate disputed land, unclear activity ownership, existing overdue borrowing, inconsistent applicant records, or a requested amount that cannot be explained from the production and repayment plan.`,
  "government-scheme-2026-pm-svanidhi-street-vendor-loan-checklist": `## Build the vendor and repayment trail

Connect the applicant to the vending activity through the vendor certificate, local-body reference, survey or recommendation route where applicable, identity, mobile, and bank account. The application should describe the same person and activity across each record. Preserve the local-body interaction where the vendor record needs correction or confirmation.

After a loan is sanctioned, keep disbursement, repayment, digital-payment, and later support records separate from the original eligibility file. A bank credit proves that money moved; it does not by itself explain vendor status, repayment performance, or a later programme benefit. Review failed debits, account changes, or inconsistent mobile details through the official channel.

Retain the submitted request, acknowledgement, lender communication, sanction or rejection, and repayment evidence. Avoid unofficial promises of approval or fee-based shortcuts. Escalate a missing vendor record, disputed local verification, wrong bank account, duplicate application, or repayment entry that the lender cannot reconcile.`,
  "government-scheme-2026-pm-ujjwala-lpg-connection-checklist": `## Keep household eligibility separate from distributor fulfilment

Build the application file around the applicant, household or family record, accepted identity route, bank account, address, and distributor interaction. Check that the person and household details agree across the records used. A bank account supports payment information but does not establish household status, and a distributor message does not replace the programme's eligibility record.

After submission, retain the application reference, authority or portal status, distributor communication, connection or delivery record, and any correction request. Record who received the connection and whether a household, address, identity, or bank mismatch remains open. Do not share OTPs or make payments through an unverified contact.

Use official programme and distributor channels for follow-up. Keep later refill or service issues separate from the original connection application unless they expose a data mismatch. Escalate duplicate household records, inconsistent applicant details, an inaccessible reference, or a distributor request that does not match the official application route.`,
  "government-scheme-2026-pmsby-accident-insurance-checklist": `## Verify the accident-cover period and nominee trail

For PMSBY, connect the account holder, enrolment or consent record, premium debit, coverage period, nominee details, and participating bank communication. Treat the accident-cover record separately from life-cover or pension enrolments that may use the same account. A premium debit can support payment but does not by itself prove every coverage, nominee, or claim fact.

Review account changes, failed or duplicate debits, nominee updates, and the coverage-period record through the bank or official channel. Keep the earlier enrolment and acknowledged correction so the history remains traceable. Family members should know where the policy and nominee information is retained without receiving unnecessary account credentials.

If a claim event occurs, build a dated file from the enrolment record, coverage evidence, nominee details, required event documents, submission, and follow-up. Claim assessment and payment remain with the participating bank and insurer. Escalate an unclear coverage period, inconsistent nominee, missing debit explanation, or unofficial request for credentials or payment.`,
  "employer-old-regime-file-new-regime-refund-ay-2026-27": `## Rebuild the return after payroll used the old regime

Start with Form 16 and the employer's tax computation. Identify the exemptions and deductions payroll considered, the taxable salary it calculated, and the TDS deposited under the taxpayer's PAN. Then prepare a separate new-regime computation using the complete return-year facts. Remove claims that are unavailable under the selected regime, add other income and special-rate items, and keep the payroll calculation as a reconciliation source rather than copying it into the return.

Compare the employer result and filing result in a short bridge. Show which payroll claims were removed, whether standard deduction or other permitted items differ, how total taxable income changed, and whether Form 26AS supports the full TDS credit. A refund arises only when supported tax credits exceed final liability after the complete return is calculated; the regime switch does not guarantee one.

Before submission, confirm that the taxpayer's income profile permits the intended return-time choice and that the chosen form records it correctly. Keep the employer declaration, Form 16, claim proofs, both regime computations, AIS, Form 26AS, filed return, and e-verification together. Escalate business or professional income, an unresolved payroll credit, special-rate income, or a proposed claim that belongs only to the old-regime working.`,
  "schedule-fa-calendar-year-or-financial-year": `## Build the Schedule FA period map before valuing anything

Create a worksheet with one row for every foreign account, equity interest, custodial account, property interest, or other asset being reviewed. For each row, identify the Schedule FA table that may apply, the ownership or beneficial-interest period, the statement period available, and every value or date requested by that table. Do this before converting amounts to rupees. A calendar-year statement, financial-year income record, and year-end holding report can all be relevant to different parts of the return without being interchangeable.

Where an account opened or closed during the reporting period, retain the opening or closure evidence and the statements that bridge the change. For employer shares, separate grant, vest, holding, dividend, and sale events. For bank and broker accounts, keep the account identifier, institution address, holder status, peak or closing information requested, and the source statement behind each reported value.

The completed period map should explain why a particular date range was used for every disclosure. Pause before filing if only April-March statements are available for a table that asks for another period, if the taxpayer's residential status changes the analysis, or if the asset cannot be connected to a reliable ownership and valuation trail.`,
  "how-to-file-belated-revised-updated-return-ay-2026-27": `## Choose the correction route from the return's current status

Write down whether an original return was filed, when it was filed, whether it was verified, whether processing or a notice has occurred, and what exactly needs to change. A missed original filing, an error in a filed return, and an additional-income correction are different problems. Compare the live portal options and statutory conditions before selecting a belated return, revised return, updated return, rectification, grievance, or notice response.

Prepare a before-and-after computation. It should show the income, deduction, loss, tax credit, refund, interest, fee, or disclosure that changes and the evidence supporting the new figure. An updated return has restrictions and additional consequences; it should not be treated as a universal way to reduce tax, create a refund, or repair every omission. A rectification request is also unsuitable where the requested change is not an apparent processing mistake.

Keep the original return and acknowledgement, new working, supporting records, payment challans where relevant, submitted correction, and later status together. Escalate when the correction affects a loss, foreign asset, refund, regime choice, notice response, or material tax position, or when the applicable deadline and available portal route do not clearly align.`,
  "handle-ais-mismatch-before-after-itr": `## Classify the AIS difference before giving feedback

For every material AIS entry, record the information source, amount, date or period, taxpayer's corresponding record, and the reason the two differ. Use clear categories such as timing, duplicate reporting, wrong PAN, gross-versus-net presentation, omitted transaction, incorrect classification, or an entry that does not belong to the taxpayer. A general "information is incorrect" response is less useful than a reconciliation tied to invoices, bank records, broker reports, certificates, or another source document.

Before filing, decide the return figure from the complete evidence rather than copying AIS or deleting a supported transaction that AIS omits. Submit feedback where appropriate and preserve the downloaded AIS version and feedback acknowledgement. After filing, distinguish an AIS change from a processed-return issue. A corrected information statement does not automatically revise the return, remove a demand, or update a tax credit.

Maintain a mismatch register showing the filed treatment, feedback status, reporting-entity correction request, and next action. Escalate entries involving disputed ownership, unexplained high-value transactions, foreign assets, tax credits absent from Form 26AS, or differences large enough to change the form, schedules, tax, refund, or response strategy.`,
  "old-regime-useful-hra-80c-80d-nps-home-loan": `## Compare regimes from supported claims, not deduction headlines

Start with taxable income under each regime using the same complete income profile. Then add only old-regime exemptions and deductions for which the taxpayer is eligible and can retain evidence. HRA needs salary, rent, residence, and payment facts; home-loan interest needs the property and loan position; insurance, NPS, and investment claims need the correct holder, period, amount, and statutory fit. A product label or payroll declaration is not enough by itself.

Keep a regime comparison that shows gross income, exempt components, each deduction, special-rate income, final taxable income, tax, cess, credits, and balance payable or refund. Separate tax-saving decisions from investment suitability. Buying an unsuitable product only to improve one line of the old-regime calculation can create a larger financial cost than the tax difference.

Recompute after final Form 16, other income, gains, and tax-credit information are available. The employer's payroll choice may affect withholding but does not replace the return-time analysis where the law permits a choice. Pause when business or professional income changes switching rules, when a major claim lacks evidence, or when special-rate income means the headline comparison does not explain the final tax.`,
  "schedule-fa-foreign-bank-rsu-espp-us-stocks": `## Create separate inventories for accounts, awards, holdings, and income

A foreign broker login can contain several reportable facts: a cash account, vested shares, unvested awards, dividends, sales, withholding, and year-end balances. Build separate inventories instead of entering the broker's total value into one field. For each account or holding, record the institution, country, account identifier, ownership status, opening and closing dates where relevant, statements available, and the values required by the applicable Schedule FA table.

For RSUs and ESPP shares, connect employer award records and payroll perquisite information to the broker holding. A vest or purchase can create a holding before any sale occurs; a later sale creates a separate capital-gain calculation. Match dividends and foreign withholding with the foreign-income and tax-relief working rather than assuming Schedule FA alone reports the income.

Review dormant accounts, transferred holdings, old employer plans, joint interests, and accounts with no current balance. Retain the foreign statements, award documents, valuation and exchange-rate working, income records, sale calculations, and filed schedules. Escalate when the taxpayer cannot identify the legal account holder, historical cost, reporting period, or connection between payroll and broker records.`,
  "form-16a-ay-2026-27-tds-refund": `## Reconcile the refund claim deductor by deductor

Build a register from every Form 16A showing the deductor name and TAN, nature of payment, gross amount, deduction date, tax deducted, and assessment year. Match each row with Form 26AS and the related income record. A refund claim is not simply the sum of certificates: the return must report the underlying taxable income, calculate final liability, and claim only credits available under the taxpayer's PAN.

Investigate missing or incorrect credits with the deductor. Preserve the correction request, revised certificate, and later Form 26AS position. Do not alter the income figure merely to make it equal a payer's inaccurate TDS statement. Where a certificate spans a transaction, deposit, or professional receipt reported differently in the books, leave a reconciliation that explains the period and gross-versus-net difference.

After the full return is prepared, compare total tax credits with final liability and pre-validate the intended refund bank account. Retain the certificates, income evidence, Form 26AS, AIS, computation, filed return, e-verification, and refund status. Escalate a material credit that remains absent, a wrong PAN or assessment year, or a refund estimate that depends on unresolved income or deduction treatment.`,
  "form-67-foreign-tax-credit": `## Connect Form 67 to the foreign-income and tax-payment trail

Prepare a country-and-source schedule showing the foreign income, payer, currency, period, tax withheld or paid, supporting certificate, treaty or domestic-law question, and the related entry in the Indian return. Form 67 should agree with the foreign-income schedules and tax-relief working; it is not a standalone claim created from the foreign tax amount alone.

Separate foreign tax from platform fees, social contributions, refunds, or other deductions that may appear on the same statement. Record the exchange-rate method and dates used for income and tax values, and retain the calculation. Where the foreign period differs from the Indian financial year, reconcile which income and tax payment belong to the return being filed.

Check the current filing instructions and timing requirements before submission. Keep the foreign tax certificate or proof, income statement, residency and treaty analysis where relevant, exchange-rate working, Form 67 acknowledgement, filed return, and later credit outcome. Escalate when income was taxed in more than one country, the certificate is unavailable, the payer's period differs materially, or the credit sought exceeds the Indian tax connected to that income.`,
  "can-freelancers-use-itr-4-presumptive-taxation": `## Test ITR-4 eligibility against the freelancer's actual activity

Describe what the freelancer does, how clients engage them, where services are delivered, and how receipts and expenses are recorded. Do not decide section 44ADA eligibility from the word "freelancer" or "consultant." The specified profession, applicable limits, residence and return conditions, foreign-asset position, partnership status, losses, and other income can all change the form or presumptive route.

Prepare a client receipt register showing invoice value, GST where relevant, TDS, platform charges, foreign receipts, refunds, and net bank collections. Match Form 16A, Form 26AS, AIS, invoices, and bank records without treating the net deposit as turnover. If GST turnover and income-tax receipts differ, explain timing, tax components, advances, and credit notes instead of forcing one total into both filings.

Compare the presumptive result with books-based figures and the records the taxpayer can support. Presumptive taxation changes the computation approach; it does not remove the need to report other income, reconcile credits, or preserve evidence. Pause where the profession is not clearly eligible, foreign assets or business losses exist, multiple activities are mixed, or the proposed ITR-4 lacks a schedule needed by the complete facts.`,
  "section-143-1-intimation-after-itr-filing": `## Compare the processed computation with the filed computation

Download the intimation, filed return, acknowledgement, and original computation. Build a line-by-line comparison covering income heads, deductions, losses, tax regime, special-rate income, tax credits, interest, fees, refund, and demand. Mark each variance as accepted processing, an apparent adjustment, a tax-credit mismatch, a data-entry issue, or a point needing further review. The headline demand or refund does not explain the cause.

Read the communication date and available response or correction route before acting. A section 143(1) intimation is not automatically a scrutiny notice, but it should not be ignored when it changes the result. Rectification may fit an apparent processing error; another route may be needed where the filed return itself was wrong or the issue involves evidence or a legal position beyond a simple correction.

Preserve the comparison, supporting source records, portal submission, acknowledgement, and later status. If payment is made, connect the challan to the demand. Escalate a large or unexplained adjustment, missing tax credit, changed loss, foreign-asset issue, or situation where the proposed response deadline is close and the correct remedy remains uncertain.`,
  "ay-2026-27-esop-sale-perquisite-itr-checklist": `## Split the ESOP history into employment and sale events

Create an award ledger for each grant showing grant date, exercise or vest event as applicable, shares acquired, employer perquisite value, payroll tax, sale date, sale proceeds, fees, and shares still held. Connect the employment-tax value to Form 16 and payslips, then use supported acquisition cost and sale records for the later capital-gain working. A broker sale amount should not be reported again as salary, and a payroll perquisite does not remove the need to calculate the sale result.

Where shares are held through a foreign broker, review foreign-account, asset-disclosure, dividend, withholding, and remittance facts separately. A sell-to-cover transaction can combine a vest and immediate sale; retain the award statement, payroll record, and broker confirmation that explain the sequence.

Before filing, reconcile shares granted, vested or exercised, sold, transferred, and remaining. Investigate any difference in quantity or value across employer and broker records. Keep the plan documents, award and vest statements, Form 16, payslips, broker reports, bank trail, valuation notes, computation, and filed schedules. Escalate missing historical cost, overseas holdings, disputed employer values, or transfers between brokers.`,
  "ay-2026-27-cash-deposit-ais-review-guide": `## Explain cash deposits from the transaction trail

Prepare a deposit register with date, amount, account, depositor where known, and the event that produced the cash. Connect each material deposit to sales records, earlier withdrawals, household transfers, asset sales, loans, gifts, agricultural receipts, or another supported source. Similar amounts or dates do not prove that a withdrawal funded a later deposit; preserve the intervening facts and cash position.

Compare the register with bank statements, books or income records, and AIS. Separate deposits already reflected in reported turnover or income from capital movements and unexplained items. Do not report every deposit as fresh income merely because AIS shows it, and do not label an amount as redeposit, loan, or family transfer without evidence.

Document what remains unresolved before filing. A cash-heavy business should reconcile deposits with daily sales, expenses, and cash book rather than using only annual totals. Keep deposit slips, bank statements, sale or loan records, donor or counterparty evidence where relevant, and the filed treatment. Escalate large unexplained deposits, deposits inconsistent with reported activity, third-party cash, or transactions requiring a legal or source-of-funds review.`,
  "can-salaried-employees-switch-tax-regime-every-year": `## Separate the employer declaration from the return-time choice

Record the regime used by payroll, the deductions or exemptions considered by the employer, and the tax deducted in Form 16. Then prepare the return from the taxpayer's complete income and supported claims. For a salary-only case, the available filing-time choice can differ from the employer declaration; a taxpayer with business or professional income may face different switching conditions and should not assume the same flexibility.

Run both computations after final salary, interest, rent, gains, deductions, and tax credits are known. The comparison should show which claims disappear or remain, how special-rate income affects the result, and whether additional tax or a refund arises from the final choice. Do not choose the old regime from the value of deductions alone or the new regime from a headline slab without completing both workings.

Keep the employer declaration, Form 16, claim evidence, regime comparison, and filed return together. Pause where business income exists, a prior regime option may affect the current year, claims lack evidence, or the taxpayer is attempting to use an updated return solely to change the regime outcome.`,
  "which-itr-form-salary-plus-capital-gains-ay-2026-27": `## Let the transaction type decide the capital-gain schedules

List every sale or transfer separately: listed shares, mutual funds, property, unlisted shares, bonds, crypto or another asset. For each, record acquisition and transfer dates, consideration, cost, expenses, holding information, and the evidence available. Salary plus a genuine capital gain commonly moves the return beyond ITR-1, even where the gain is small or tax is fully covered.

Do not classify intraday equity or F&O activity as ordinary delivery capital gains without reviewing the transaction facts. Business or speculative treatment can point to ITR-3 and can change loss, turnover, books, or audit questions. Foreign assets, foreign income, multiple properties, carried-forward losses, or other disclosures can also affect form eligibility.

Reconcile broker or sale records with AIS while calculating gains independently from supported data. Preserve the form-selection note showing why each relevant schedule is available in the chosen return. Escalate mixed investing and trading activity, incomplete acquisition cost, inherited or gifted assets, foreign holdings, or a loss whose carry-forward depends on timely and correct filing.`,
  "ay-2026-27-landlord-rental-income-tds-itr-guide": `## Build a property-by-property rental schedule

For each property, record ownership share, occupancy period, tenant, agreement terms, rent due, rent received, arrears, vacancy, deposits, municipal taxes, loan interest, and tax deducted by the tenant where relevant. Joint ownership and multiple properties should remain separate until the supported figures are ready for the return. A net bank credit after TDS or deductions does not establish the gross rent.

Match tenant certificates, Form 26AS, AIS, bank receipts, and the rent ledger. Investigate payments under the wrong PAN, missing months, security-deposit movements, reimbursements, and amounts collected by a co-owner or agent. Keep property and loan records connected to the same ownership period rather than claiming a deduction from an unrelated account or property.

Prepare a note for every material difference between agreement, receipt, and tax-credit records. Retain agreements, ownership evidence, municipal records, interest certificate, tenant TDS record, ledger, bank statements, computation, and acknowledgement. Escalate disputed ownership, mixed personal and business use, overseas ownership, substantial arrears, or a tenant credit that remains absent or inaccurate.`,
  "foreign-client-income-schedule-fsi": `## Decide whether the income is foreign-source before opening Schedule FSI

Start with the contract and actual work: who performed the service, where it was performed, who paid, where the payer is located, and whether foreign tax was withheld. An overseas client or foreign-currency receipt does not automatically settle the source-of-income analysis. Record the residential status and the reason the amount is or is not included in Schedule FSI.

Prepare an invoice and receipt ledger showing gross fee, currency, invoice date, service period, foreign withholding, platform or bank charges, rupee conversion, and net amount received. Keep foreign tax separate from commercial deductions. If credit is claimed, connect the income to the tax certificate, Form 67, Schedule TR, and the applicable credit analysis.

Review foreign payment accounts or platforms separately for Schedule FA. A platform can create both a receipt trail and an account or asset question, but one schedule does not replace the other. Preserve contracts, invoices, bank and platform statements, withholding proof, exchange-rate working, and filed schedules. Escalate uncertain source, treaty questions, mismatched periods, or foreign accounts that cannot be fully identified.`,
  "change-tax-regime-using-itr-u": `## Test the proposed regime change against the updated-return restrictions

Write down the regime used in the filed return, the regime now proposed, why the earlier return was wrong, and how the new computation changes income, deductions, tax, interest, refund, or demand. Then review whether an updated return is legally and operationally available for that result. ITR-U is not a general amendment form and should not be assumed to permit a refund increase, tax reduction, loss creation, or every regime change.

Check whether another route remains available, such as a revised return within time, response to a communication, rectification of an apparent processing issue, or a separate grievance. The correct route depends on whether the filed data, processing result, or legal position is wrong. Keep both regime computations and the evidence behind every deduction or exemption removed or added.

Do not submit merely to test the portal. Preserve the original return, acknowledgement, revised working, route analysis, tax payment calculation where relevant, and final submission. Escalate where business or professional income affects switching, the correction would reduce tax or increase refund, a demand already exists, or the statutory and portal positions appear inconsistent.`,
  "can-i-use-itr-1-if-sold-shares-mutual-funds": `## Check the sale before choosing ITR-1

Obtain the broker or fund transaction statement and identify whether units or shares were actually sold, redeemed, switched, transferred, or merely held. A sale or redemption can create a capital gain or loss even when the amount is small, the investment was held briefly, or tax is nil. Dividends without a sale raise a different return-form question and should not be confused with disposal proceeds.

For each transaction, retain acquisition date and cost, transfer date, consideration, charges, and holding information. Reconcile AIS with the broker or registrar records, but calculate the gain or loss from the complete evidence. A gross sale value in AIS is not the taxable gain. Review corporate actions, systematic withdrawals, switches between schemes, inherited holdings, and transferred broker accounts where cost may be incomplete.

Choose the return from the full profile, including salary, property, foreign assets, other gains, and business or trading activity. ITR-2 may fit many salary-plus-capital-gain cases, while business trading can point elsewhere. Escalate missing cost, mixed investing and trading, foreign securities, or a loss that needs timely reporting.`,
  "ay-2026-27-rnor-foreign-income-review-guide": `## Separate RNOR residence analysis from each foreign item

Prepare the residential-status working first, using the relevant day-count and factual history. Then inventory every foreign income source, account, asset, employment arrangement, business connection, and remittance. RNOR status does not make every foreign amount irrelevant; each item should be reviewed for source, receipt, control, and any connection to a business or profession controlled from India.

For each item, record the country, payer or institution, period, currency, tax withheld, account used, and the reason for the proposed Indian return treatment. Keep foreign income, Schedule FA, and foreign-tax-credit questions separate even when the same bank or broker statement supports more than one schedule. A remittance into India does not by itself determine whether the underlying income is taxable.

Retain passports and travel history, residence working, foreign statements, contracts, tax certificates, exchange-rate calculations, and filed schedules. Escalate split-year facts, uncertain source, controlled businesses, foreign employment, large remittances, or assets and accounts whose ownership or reporting period cannot be clearly established.`,
  "ay-2026-27-startup-founder-salary-dividend-itr-guide": `## Reconcile the founder with the company before filing

List each amount connected to the startup: salary, director remuneration, dividend, reimbursement, loan, capital contribution, share issue, share sale, option or other equity event. Match the founder's records with company payroll, board approvals, cap table, ledgers, bank statements, TDS filings, and tax documents. A payment description in the bank is not enough to decide whether the amount is salary, capital, repayment, or another item.

Keep company and founder expenses separate. Where the founder paid a company cost personally or received a reimbursement, retain the underlying invoice, business purpose, approval, and ledger treatment. Review equity events independently from salary and dividends because valuation, acquisition cost, withholding, and capital-gain questions may arise at different dates.

Before filing, compare Form 16, Form 16A, Form 26AS, AIS, company allocation records, and the founder computation. Record every mismatch and who must correct it. Escalate related-party loans, unrecorded reimbursements, foreign shares or investors, disputed cap-table entries, or amounts that the company and founder classify differently.`,
  "government-scheme-2026-pmjjby-insurance-renewal-nominee-checklist": `## Verify the life-cover record, not only the premium debit

For PMJJBY, connect the account holder, enrolment or consent record, coverage period, premium debit, nominee details, and bank communication. A debit entry can support payment but may not prove that the enrolment, nominee, or current coverage record is correct. Ask the bank or participating channel to clarify a missing debit, duplicate debit, rejected enrolment, or inconsistent nominee detail and retain the response.

Keep identity and bank information current without sharing credentials or one-time passwords. Where the account changes, the holder becomes ineligible, or a nominee update is requested, preserve the earlier record and the acknowledged change. Family members should know where the enrolment and nominee information is stored, but unrelated personal and banking documents should not be circulated broadly.

If a claim event occurs, use the official bank or insurer route and build a dated claim file containing the enrolment evidence, coverage-period record, nominee information, required event documents, submission, and follow-up. Coverage and claim decisions remain with the participating bank and insurer; a checklist cannot promise acceptance or payment.`,
  "ay-2026-27-salary-without-tds-itr-guide": `## Calculate the salary liability even when payroll deducted nothing

Collect salary slips, employment contract, annual salary statement, bank credits, Form 16 if issued, and details of allowances, perquisites, arrears, or multiple employers. Reconcile gross salary and taxable components independently of TDS. No deduction by the employer does not make salary tax-free, and the net bank amount may exclude or include items that need separate treatment.

Add interest, rent, gains, freelance receipts, and other income before estimating the final liability. Review advance-tax or self-assessment-tax needs from the complete computation and preserve every challan. If the employer should have reported or deducted tax but did not, keep the payroll correspondence; do not invent a TDS credit or reduce income to fit the bank deposits.

Choose the return form from the full income profile and compare AIS and Form 26AS for unexpected entries. Retain salary records, bank statements, computation, payment proof, filed return, and acknowledgement. Escalate multiple employers, foreign salary, unreported perquisites, payroll disputes, or a liability that may attract interest or requires a correction from the employer.`,
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
    const block = `${startMarker}\n${addition.trim()}\n${endMarker}`;
    const next = `---\n${JSON.stringify(meta, null, 2)}\n---\n\n${body}\n\n${block}\n`;
    if (next === source.replace(/\r\n/g, "\n")) continue;
    await fs.writeFile(filePath, next, "utf8");
    changed += 1;
  }

  console.log(`Deepened ${changed} high-overlap guides with route-specific editorial notes.`);
}

await run();
