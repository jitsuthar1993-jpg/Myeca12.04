import fs from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;
const startMarker = "<!-- ay-route-specific-depth:start -->";
const endMarker = "<!-- ay-route-specific-depth:end -->";

const additions: Record<string, string> = {
  "ay-2026-27-agricultural-income-disclosure-guide": `## Test the agricultural explanation against the actual crop cycle

Prepare one crop-cycle sheet for each material receipt. Record the land used, cultivation or activity performed, crop, season, quantity produced, buyer, sale date, gross receipt, expenses, and payment mode. Where the taxpayer farms leased or family land, keep the agreement, consent, or other record that explains the right to cultivate instead of presenting an unrelated ownership record as proof.

Cash deposits need their own chronology. Compare sale dates and quantities with mandi slips, buyer receipts, transport or storage records, household withdrawals, and the bank deposit trail. A deposit made near harvest is not automatically agricultural income, and a genuine crop sale does not have to equal one later deposit. Write down the reason for every material gap. Keep non-agricultural rent, trading, commission, or other receipts outside the crop schedule so the exempt-income disclosure and any rate impact can be reviewed from supported figures.`,
  "ay-2026-27-bank-tds-without-form-16a-checklist": `## Build the interest and TDS schedule account by account

List every savings, fixed-deposit, recurring-deposit, and other interest-bearing account separately. For each one, record the bank, branch or account reference, interest credited or accrued for the year, TDS deducted, TAN shown in Form 26AS, and whether a certificate was received. A missing Form 16A does not remove the interest from the return, while a TDS entry does not establish the full interest amount.

When the bank certificate, Form 26AS, AIS, and account statement differ, identify whether the cause is timing, multiple deposits, a wrong PAN, a corrected bank filing, or tax deducted in another quarter. Ask the bank for a correction where the credit itself is wrong and preserve the request. File the income from the complete interest schedule and claim only tax credit that can be supported in the taxpayer's records and current tax-credit statement.`,
  "ay-2026-27-capital-gains-missing-ais-checklist": `## Reconstruct the disposal without waiting for AIS

Create a transaction row for every sale or redemption omitted from AIS. Capture the asset, broker or registrar, acquisition date and cost, transfer date, consideration, charges, quantity, holding period, and evidence used. Corporate actions, transferred broker accounts, inherited assets, and systematic withdrawals may require an additional cost or ownership trail before the gain can be calculated.

Reconcile the completed calculation with the broker statement, contract notes, demat movement, bank receipt, and any tax statement that does exist. Note that AIS is incomplete and retain the downloaded version used for review; do not suppress a supported gain or loss merely because the information statement has no matching entry. The final working should explain the return schedule and treatment chosen for each disposal and identify any unresolved cost, ownership, or classification question before submission.`,
  "ay-2026-27-consultant-gst-tds-reconciliation-guide": `## Keep GST value, professional income, and cash collection distinct

Prepare a client-level bridge beginning with invoices before GST. Add GST charged, credit notes, advances, reimbursements, and invoices still outstanding; then compare that bridge with GST returns, Form 16A, Form 26AS, AIS, and bank receipts. A client can deduct TDS from a gross amount while paying a net amount, and a GST return can reflect an invoice before the fee is collected.

For every difference, name the cause and the record owner. A wrong TDS amount belongs with the client or deductor; an incorrect GST return may require a separate tax-period review; a bank timing difference belongs in the receipt ledger. Use the reconciled professional activity to decide the income-tax form, books or presumptive question, expenses, and credits. Keep the GST correction trail separate from the return computation so one filing is not silently changed to make another total look consistent.`,
  "ay-2026-27-crypto-vda-tax-records-checklist": `## Trace ownership and taxable transfers across wallets

Build a wallet and exchange inventory before calculating tax. Record each exchange account, self-custody wallet, public address where available, opening balance, deposits, withdrawals, transfers, purchases, sales, swaps, rewards, and closing balance. Mark transfers between the taxpayer's own wallets so they are not mistaken for disposals, but retain the transaction hashes and both sides of the movement.

For each taxable transfer, preserve the asset quantity, date and time, consideration, supported acquisition cost, fees, counterparty or platform record, and applicable TDS entry. Exchange summaries can omit off-platform movements or use a different valuation method, so reconcile them with the taxpayer's full transaction history and bank trail. Do not net unrelated gains and losses merely because a dashboard shows a single result. Keep unresolved wallet ownership, missing cost, foreign-platform, and TDS differences visible before filing.

Retain the export settings and download date for every exchange report used. A later platform report can change labels or valuations, so the filed calculation should remain reproducible from the archived data.`,
  "ay-2026-27-dividend-income-ais-reconciliation-guide": `## Reconcile dividends by issuer and entitlement date

Make one row for each company, mutual fund, or foreign holding that declared a dividend. Record the entitlement or record date where available, gross dividend, tax withheld, broker or registrar entry, bank account used, and whether the holding changed during the year. This catches dividends credited to an old bank account, amounts reinvested or adjusted, and entries that AIS reports under an unexpected issuer name.

Compare gross income rather than only the net bank credit. A TDS deduction, foreign withholding, bank charge, or delayed credit can explain why the cash received differs without changing the dividend that must be reviewed. Investigate duplicates and amounts that do not belong to the taxpayer, but retain the supported income even if AIS is late or incomplete. Keep foreign-dividend, tax-credit, and foreign-asset questions in separate workings linked back to the same issuer record.`,
  "ay-2026-27-doctor-professional-receipts-itr-guide": `## Reconcile each clinic, hospital, and consultation channel

Separate receipts from a personal clinic, hospital engagement, visiting consultation, telemedicine platform, diagnostic referral arrangement, teaching, and any salary employment. For every channel, record the contract or engagement terms, patient or payer invoices where applicable, gross fee, deductions, reimbursements, TDS, and net bank collection. A hospital remittance after consumables or facility charges does not by itself establish either the gross professional receipt or an allowable expense.

Review expense evidence by purpose and ownership. Clinic rent, staff cost, equipment, professional insurance, travel, and other outgoings should be connected to the practice and not mixed with personal or hospital-owned costs. Use the actual activity and complete receipt record to test presumptive eligibility, books, audit questions, and return form. Preserve patient confidentiality by retaining only the billing and professional records needed for the tax working.

Where another doctor, clinic, or platform collected money first, document the settlement statement and contractual split. That record explains why the doctor's invoice, TDS certificate, and bank credit may show different amounts.`,
  "ay-2026-27-education-loan-interest-deduction-guide": `## Connect the deduction to the borrower, student, and payment year

Read the sanction letter and current loan statement together. Identify the borrower, student, eligible relationship, course, lender, repayment start, interest charged during the year, and amount actually paid. An EMI contains principal and interest, so bank debits alone cannot establish the deductible interest; use the lender's interest certificate or a supported loan ledger.

Record who made each payment and who is proposing the claim. A parent paying a child's loan, a jointly signed loan, or a refinancing arrangement can change the evidence needed and should not be resolved from a family assumption. Check the available deduction period and the taxpayer's selected tax regime before carrying the amount into the return. Retain the sanction, lender certificate, payment trail, relationship evidence where relevant, regime comparison, and filed computation.

If the lender certificate combines several borrowers or loan components, ask for a supported breakup. The return working should use the interest that belongs to the eligible education loan and relevant payment year.`,
  "ay-2026-27-epf-withdrawal-taxability-checklist": `## Rebuild service and contribution history before classifying the withdrawal

Prepare a timeline of every employer, joining and exit date, transfer request, recognised fund account, and gap in service. Match the UAN or member records and identify whether earlier balances were transferred or separately settled. The bank credit shows what was paid, but the service timeline and settlement components are needed before deciding the return treatment.

Break the withdrawal into employee contribution, employer contribution, interest, and any other component shown in the settlement records. Compare TDS and Form 16A with Form 26AS, but do not use withholding as the taxability conclusion. Review whether prior deductions claimed on employee contributions affect the analysis and whether the selected return form exposes the required schedules. Preserve the EPF statement, transfer and settlement records, employer history, tax-credit evidence, computation, and acknowledgement.`,
  "ay-2026-27-foreign-travel-tcs-credit-itr-guide": `## Follow the TCS credit from traveller to collector

Identify the traveller, person who paid, collector, invoice or remittance reference, purpose, gross amount, date, and PAN against which TCS was reported. Family bookings and cancellations can create credits under a different person's PAN or in a different quarter, so connect each certificate entry to the underlying travel or remittance record.

Compare the collector certificate with Form 26AS and AIS, then record any cancellation refund, partial reversal, or correction request separately. TCS is a tax credit; it does not decide whether the trip cost is deductible or create an automatic refund. Claim the supported credit in the correct taxpayer's return after the full tax computation is prepared. Keep collector correspondence and correction acknowledgements where the PAN, amount, or period is wrong.`,
  "ay-2026-27-intraday-trading-income-itr-guide": `## Calculate speculative turnover from the trade ledger

Filter the broker tradebook for positions opened and closed without delivery, then calculate turnover using the supported intraday method rather than gross buy and sell value. Reconcile realised profit or loss with contract notes, the broker ledger, charges, and bank movements. Keep delivery investments and F&O transactions in separate workings because their classification and loss treatment differ.

Review expenses only after connecting them to the trading activity and the taxpayer's records. A broker subscription, internet cost, interest charge, or advisory fee should not be claimed merely because trading occurred. Use the completed speculative-business working to assess the return form, books, audit question, set-off, and filing deadline. Preserve the turnover method and broker-level reconciliation so the reported result can be reproduced later.

Reconcile open positions at year end and confirm that only realised intraday results enter the speculative working. Broker exports can place delivery, intraday, and derivative charges together, so allocate shared charges only through a documented method. Keep loss set-off and carry-forward conclusions beside the timely filing check rather than assuming every trading loss survives a late return.`,
  "ay-2026-27-leave-encashment-retirement-tax-checklist": `## Check the settlement against the employer's leave record

Obtain the leave balance history or employer calculation behind the encashment amount. Compare service dates, eligible leave, rate of pay used, retirement or exit date, gross encashment, exemption considered, TDS, and net settlement. If the employer calculation cannot be reproduced, keep the query open rather than treating the bank credit or Form 16 description as complete evidence.

Record whether the payment relates to retirement, resignation, a periodic in-service encashment, or another event, because the supporting analysis can differ. Keep gratuity, pension, provident-fund, arrears, and leave encashment as separate rows in the retirement-income bridge. The filed working should show the gross amount, supported exemption, taxable balance, and connection to Form 16 and the final settlement statement.`,
  "ay-2026-27-partner-remuneration-interest-itr-guide": `## Tie the partner's return back to the deed and firm records

Create a partner schedule showing opening capital, contributions, drawings, remuneration, interest, profit share, reimbursements, taxes, and closing capital. Compare each entry with the partnership deed, firm computation, ledger, bank statement, and any tax certificate. A bank transfer from the firm is not enough to decide whether the amount is remuneration, interest, drawing, reimbursement, or repayment.

Resolve differences with the firm before the partner files. The firm and partner should not report incompatible amounts or periods merely because one side has already completed its return. Review the partner's expenses, other professional activity, loss or set-off position, and return form separately. Preserve the deed clause, firm-side calculation, capital account, correction correspondence, partner computation, and acknowledgement.`,
  "ay-2026-27-salary-rsu-esop-itr-guide": `## Connect payroll taxation to the later share movement

Maintain an award ledger for every grant. Record grant, vest, exercise where applicable, perquisite value reported by payroll, shares withheld or sold for tax, broker receipt, later sale, remaining shares, dividends, and foreign withholding. The Form 16 perquisite and the broker sale are different events; reporting one does not remove the need to calculate and disclose the other correctly.

Reconcile share quantities as carefully as values. Explain why the number granted, vested, deposited, sold, transferred, and held differs. Where a foreign broker or account is involved, review foreign-asset and foreign-income schedules independently from the capital-gain calculation. Keep award statements, payroll records, broker reports, exchange-rate working, bank trail, and filed schedules together so both the salary and investment history can be reproduced.

Check whether dividends, cash in the broker account, or shares from an earlier employer remain outside the current award statement. Those items can create separate income, disclosure, and valuation questions even when no current-year sale occurred.`,
  "ay-2026-27-stock-investor-ltcg-stcg-itr-guide": `## Review classification before accepting the broker tax report

Build a disposal register for delivery-based shares and securities. Capture acquisition and transfer dates, quantity, cost, consideration, charges, corporate actions, and holding period for each item. Compare the broker's capital-gain report with contract notes, demat statements, and the taxpayer's history, especially where holdings moved between brokers or arose through bonus, split, gift, inheritance, or merger.

Keep investment disposals separate from intraday and derivatives activity. Repeated frequency or a broker label alone does not settle the classification, so document the taxpayer's facts and the treatment used. Reconcile AIS gross sale values without mistaking them for taxable gains. The final file should support each LTCG, STCG, and loss entry, the return form selected, and any carry-forward position.`,
  "ay-2026-27-teacher-tuition-income-itr-guide": `## Document how the tuition activity actually operates

Describe whether tuition is occasional, regular, online, home-based, conducted through an institute, or delivered with hired support. Build a student or batch ledger showing fee period, gross fee, refunds, platform or institute deduction, amount received, and outstanding balance while avoiding unnecessary student personal data. Keep salary from a school or college separate from independent tuition receipts.

Review expenses from the real activity rather than a standard list. Teaching material, platform fees, room cost, equipment, travel, and assistant payments need a business connection and supporting record. Use the scale, organisation, and complete income profile to decide classification, books, presumptive questions, and return form. Preserve the fee ledger, contracts or platform statements, bank trail, expense evidence, computation, and filing receipt.`,
  "ay-2026-27-form-16-missing-itr-guide": `## Rebuild salary from payroll evidence, not a guessed annual total

Prepare a month-by-month salary sheet from payslips, employment terms, annual salary statement, bank credits, reimbursements, perquisites, arrears, and exit or joining records. Compare the result with Form 26AS and AIS for TDS and reported salary, but keep the payroll calculation independent. Net bank deposits exclude TDS and can include reimbursements or adjustments, so they cannot be multiplied into a reliable gross salary.

Ask the employer for Form 16 and a correction where payroll or TDS data is wrong. If the certificate remains unavailable, preserve the request and file only after the salary, exemptions, deductions, regime, and tax credits have been supported from the available records. Multiple employers, a mid-year change, stock compensation, foreign salary, or disputed perquisite should remain visible as separate issues rather than being hidden inside one annual figure.`,
  "ay-2026-27-senior-citizen-bank-interest-tds-itr": `## Review every deposit and deduction claim with the account holder

Create an institution-level interest schedule covering savings accounts, deposits, bonds, post-office records, and any pension-linked bank interest. Record gross interest, accrual or credit period, TDS, Form 15H or other declaration where relevant, and the account holder. Joint accounts and deposits renewed during the year need clear ownership and period notes so interest is not omitted or duplicated.

Compare bank certificates with Form 26AS and AIS, then identify missing or excessive TDS separately from the income calculation. Review the taxpayer's total income, regime, eligible deductions, advance-tax position, and refund result from the complete facts. A declaration to the bank does not remove the need to report taxable interest, and a refund should not be claimed from a credit that belongs to another PAN or remains unsupported.`,
  "ay-2026-27-gratuity-tax-checklist-employees": `## Reproduce the gratuity settlement before applying an exemption

Obtain the employer's gratuity calculation and identify the employment period, covered or non-covered status where relevant, last drawn pay components used, service years counted, gross gratuity, exemption considered, TDS, and net payment. Compare those facts with the employment and retirement records instead of inferring the result from the bank credit.

Keep gratuity separate from leave encashment, pension commutation, provident-fund settlement, arrears, and other retirement receipts. Where gratuity was received from more than one employer or an earlier exemption affects the current analysis, record the history and obtain a supported treatment. The return working should connect the gross receipt, exemption basis, taxable balance, Form 16 entry, and final settlement without using a generic retirement-income assumption.

If the employer revised the settlement after payment, retain both calculations and the reason for change. Trace a revised bank credit or Form 16 entry back to the service-period and pay details used in that gratuity calculation.`,
  "ay-2026-27-spouse-income-clubbing-checklist": `## Identify the asset and transfer before testing clubbing

For each amount being reviewed, record who owns the asset or activity, how it was acquired, whether value was transferred between spouses, what consideration was given, when income arose, and where the income was received. A joint bank account or a payment by one spouse does not by itself settle ownership or clubbing. Keep salary or professional income from the spouse's own work separate from income arising from a transferred asset.

Trace later reinvestment and income on income separately where the facts require it. Preserve gift records, purchase documents, investment statements, loan terms, bank trail, and the calculation used in each spouse's return. If the transfer, ownership, or source cannot be established, pause before moving an amount between returns merely to match AIS or reduce tax.

For jointly held assets, record the purchase contribution, legal ownership, beneficial arrangement, and destination of income. A joint label or shared household payment does not by itself decide which spouse reports the income or gain.`,
  "ay-2026-27-lawyer-legal-consultant-itr-guide": `## Separate client money from professional fees

Build a matter-level receipt register showing the client, engagement, professional fee, retainer, reimbursement, court fee or other client money, TDS, invoice, and net amount received. Amounts held or spent on a client's behalf should not be treated as fees without reviewing the arrangement and ledger, while a net bank credit after TDS does not establish the gross professional receipt.

Reconcile chambers, firm, panel, appearance, advisory, arbitration, and other engagements separately. Review expenses from the actual practice and preserve confidentiality by retaining only the billing and tax evidence needed for filing. Use the full activity to test presumptive eligibility, books, audit questions, GST, credits, and return form. Keep unresolved client-ledger or deductor differences visible rather than balancing them through an unsupported income adjustment.

Where counsel fees pass through a chamber, firm, or instructing advocate, retain the engagement and settlement record that explains the split. Do not expose case papers or client facts that are unnecessary for the tax working.`,
  "ay-2026-27-small-shop-44ad-presumptive-itr-guide": `## Test the shop's receipts before choosing presumptive taxation

Prepare a daily or periodic sales summary split between cash, card, UPI, marketplace, credit sales, returns, and refunds. Reconcile those totals with the cash book, bank and payment-gateway settlements, GST records where applicable, and year-end receivables. Net gateway deposits and cash deposits are not the same as turnover, and a shop should not use only bank credits to decide the presumptive figure.

Describe every activity carried on through the shop, including services, commissions, online sales, or a second business line. Check whether the taxpayer and activity satisfy the current presumptive and return-form conditions, and compare the proposed result with the records actually maintained. Preserve the turnover bridge, payment reports, inventory or purchase context, tax-credit records, computation, and acknowledgement.`,
  "ay-2026-27-minor-child-income-clubbing-checklist": `## Record the child's income source before assigning it to a parent

Prepare a child-level schedule showing each bank account, deposit, investment, asset, gift, award, activity, and resulting income. For every item, record who funded or transferred the asset, who controls it, what income arose, and whether an exception may need review. Do not combine the child's own skill- or talent-based earnings with passive income merely because both reached the same account.

Where clubbing applies, document why the selected parent's return carries the amount and how any relevant exemption or separate reporting is handled. Compare the child and parent records with AIS and tax-credit statements without creating duplicate income. Preserve gift, investment, bank, activity, custody, and calculation records so the treatment can be revisited when ownership, income type, or family circumstances change.

Keep the child's own return question separate from the parent's clubbing calculation. Tax credit, account ownership, or income earned through the child's skill may require a different treatment from passive income arising on a transferred asset.`,
  "ay-2026-27-nps-80ccd1b-deduction-checklist": `## Map each NPS contribution to the correct deduction bucket

Create a contribution register showing PRAN, contribution date, amount, payment source, receipt, employer or self-contribution status, and financial year. Reconcile it with the NPS transaction statement, payroll records, bank debit, and Form 16. A consolidated statement can contain employer and individual contributions that need different treatment, while a late payment may belong to another year.

Prepare the regime comparison and deduction calculation before claiming any amount. Identify what is already considered through payroll and prevent the same contribution from being used twice across available deduction provisions. Keep opening, contribution, correction, and withdrawal records separate. The filed working should connect the claimed amount to specific receipts and show why the selected regime and return entry permit it.

Where a contribution is reversed, corrected, or posted to the wrong PRAN, preserve the original debit and the NPS response. The deduction working should use the contribution that remains valid for the relevant taxpayer and period.`,
  "ay-2026-27-self-occupied-home-loan-interest-checklist": `## Connect the loan certificate to the property and use

Build a property-and-loan note identifying the borrower, owner, property, possession or construction status, occupancy, lender, loan purpose, and interest period. Compare the interest certificate with the sanction, repayment statement, ownership record, and any possession or completion evidence. A joint loan does not automatically prove an equal ownership share or equal claim.

Separate principal, interest, pre-construction interest, fees, and any top-up or refinance amount. Review whether the property remained self-occupied, was let for part of the year, or involved more than one property before selecting the return treatment. Run the tax-regime comparison using supported figures and prevent the same interest from being claimed through incompatible routes. Preserve the property, loan, payment, use, and calculation trail with the filed return.`,
  "ay-2026-27-overseas-remittance-tcs-itr-checklist": `## Match the remittance purpose to the TCS entry

Create a remittance register showing the sender, beneficiary, authorised dealer or collector, purpose code or stated purpose, date, currency, rupee amount, charges, TCS, and PAN credited. Family remittances, education or medical payments, travel, investments, and other transfers should remain separate because the supporting records and tax questions are not interchangeable.

Compare the bank or collector certificate with Form 26AS and AIS. Record reversals, failed transfers, corrected PAN entries, and credits appearing in a later quarter. TCS is a credit against final tax; it does not decide whether the remitted amount is income, an expense, an asset purchase, or a gift. Keep the underlying purpose evidence and foreign-account or asset review separate from the tax-credit claim.`,
  "ay-2026-27-medical-disability-deduction-family-checklist": `## Separate the certificate-based claim from general medical spending

Create one claim note for each person and provision being considered. Record the taxpayer, dependant or family member, relationship, nature of the proposed deduction, prescribed certificate or other required evidence, issuing authority, validity period, payment trail, and selected tax regime. General treatment bills, health-insurance premiums, disability certificates, and maintenance expenses answer different questions; do not combine them into one medical total.

Use only the minimum sensitive information needed to support the return. Check that the certificate belongs to the correct person and remains valid for the relevant period, then connect the proposed amount to the applicable records and payment facts. Where more than one family member could claim, document dependency and the person who actually incurred the eligible cost. Keep unsupported treatment expenditure outside the deduction working while preserving it separately if it explains a bank movement or family record.

Before filing, review whether the chosen regime permits the proposed claim and whether the return entry matches the evidence retained. An expired certificate, unclear dependency, or privacy-sensitive record that does not support the tax question should trigger case-specific review rather than an estimated deduction.`,
  "ay-2026-27-pensioner-family-pension-itr-guide": `## Build an income register across every payer and bank

List pension, family pension, commuted amounts, arrears, bank interest, deposit interest, and any other recurring receipt separately. For each item, identify the payer, recipient, period, gross amount, deduction or relief question, TDS, and bank account used. Pension paid for the taxpayer's own service and family pension received after another person's death are not interchangeable, even when the same bank credits both amounts.

Reconcile payer certificates and bank summaries with AIS and Form 26AS institution by institution. Net credits can differ from gross income because of TDS, recovery, arrears, or adjustments, while a tax-credit entry does not establish the complete pension or interest amount. Investigate wrong-PAN or missing credits with the payer and retain the correction request without inventing a credit in the return.

Prepare the final computation only after the income register, eligible deduction or relief evidence, regime, advance or self-assessment tax, and refund bank details agree. Keep inherited accounts, multiple pension payers, and unclear arrears as separate review items so a refund estimate does not hide omitted income or unsupported tax credit.`,
  "ay-2026-27-architect-designer-44ada-itr-guide": `## Separate design fees, project contracts, and reimbursed costs

Create a client register before testing any presumptive route. For each engagement, record the service promised, invoice value before tax, GST charged, TDS, reimbursable cost, credit note, amount collected, and amount outstanding. Architectural design, interior execution, product supply, project management, and pure reimbursement can produce different records and should not be collapsed into one bank-receipt total.

Read the engagement letter and invoice description beside the actual work performed. Where a project combines professional design with procurement or execution, document the split supported by contracts, invoices, vendor records, and client communication. Reconcile Form 16A and Form 26AS with the gross client ledger rather than the net bank credit. Use that complete activity picture to assess the return form, books, presumptive conditions, expenses, and any GST difference. Preserve the client-level bridge and note every mixed or unresolved engagement before filing.`,
  "ay-2026-27-cash-deposit-ais-review-guide": `## Explain deposits through a dated cash chronology

List each material cash deposit with its date, account, amount, stated source, and the record that existed before the deposit. Business collections should connect to sales and the cash book; a redeposit should connect to an earlier withdrawal; a loan or gift should connect to the other party and terms; a capital introduction should connect to the taxpayer's own supported funds. Do not use one annual explanation for deposits that arose from different events.

Compare the chronology with AIS, bank statements, invoices, receipts, withdrawals, household spending, and any books maintained. A difference in date or amount does not automatically make the explanation wrong, but it must be understandable. Flag third-party cash, round-sum deposits, unexplained gaps, and entries that exceed the available cash trail. Keep the supported source and the unresolved portion separate in the return working so an AIS total is not copied as income or dismissed without evidence.`,
  "ay-2026-27-co-owned-house-property-itr-guide": `## Build the property schedule owner by owner

Start with the ownership deed and create one row for each co-owner. Record the legal share, possession and use, rent entitlement, rent actually received, municipal tax paid, loan borrower, interest paid, tenant TDS, and bank account used. A tenant paying the full rent to one co-owner or a lender debiting one account does not by itself change the supported ownership allocation.

Prepare the property computation before dividing the result between returns. Reconcile the lease, rent ledger, Form 16C or other tenant TDS record where applicable, Form 26AS, municipal receipts, and interest certificate. Document vacancies, arrears, deposits, reimbursements, and any period of self-occupation separately. If the co-owners use different shares, property classifications, or interest figures, identify the factual reason before filing. Preserve the common property working and each owner's final allocation so the combined reporting can be reproduced later.`,
  "ay-2026-27-donation-deduction-record-guide": `## Test the donation before entering a deduction

Make one row per donation showing the donor, donee, date, amount, payment mode, receipt number, registration or approval details shown by the donee, and the deduction treatment proposed. The bank debit proves payment, while the receipt and current donee information address different parts of the claim. A campaign message or acknowledgement email is not a substitute for the record needed for the return.

Check that the receipt belongs to the taxpayer and that the name, PAN or other identifier, amount, and date agree with the payment trail. Separate donations that may have different limits or restrictions instead of applying one percentage to the annual total. Where a donee record is missing or inconsistent, request correction and keep the response; do not edit the receipt or estimate an eligible amount. Complete the regime and taxable-income calculation before carrying a supported deduction into the return.`,
  "ay-2026-27-ecommerce-seller-itr-gst-checklist": `## Rebuild marketplace turnover from orders to settlements

Export order, return, cancellation, fee, tax, withholding, and settlement reports for every marketplace account. Build a monthly bridge from customer order value to recognised sales, credit notes, platform charges, GST components, TCS or TDS, reserves, refunds, and net bank settlement. The amount transferred by the platform is a settlement result, not the seller's turnover.

Reconcile the marketplace bridge with the invoice register, GST returns, inventory or purchase records, bank receipts, AIS, and Form 26AS. Keep timing differences visible where an order, return, tax entry, and settlement fall in different periods. Separate sales made under another entity or GST registration, foreign marketplace activity, and personal transactions. Use the supported business figures to decide the income-tax treatment, expenses, books, audit question, and return form. Archive the original exports and the report filters used because marketplace dashboards can change after the filing year.`,
  "ay-2026-27-esop-sale-perquisite-itr-checklist": `## Link the payroll event to the later share sale

Create an award ledger for each grant showing grant date, vesting, exercise where relevant, shares received, perquisite value reported by payroll, tax withheld, shares sold or withheld for tax, broker receipt, later sale, and shares still held. The salary perquisite and the capital-gain event are separate entries even when they concern the same shares.

Reconcile quantities before values. Explain why the grant, vested, exercised, deposited, sold, and closing share counts differ, and retain corporate-action or forfeiture records where relevant. For each sale, connect the supported acquisition value and date to the broker transaction and sale proceeds. Review foreign broker accounts, dividends, foreign withholding, and disclosure schedules separately from the gain calculation. Keep payroll, award, broker, exchange-rate, bank, and return workings together so a later sale is not calculated from an unsupported dashboard cost.`,
  "ay-2026-27-first-time-salaried-employee-itr-guide": `## Build the first return from a complete income list

Start with a one-page register of every income source and tax credit for the year. Record the employer, gross salary, exemptions considered by payroll, deductions considered by payroll, TDS, bank interest, investments sold, freelance or other receipts, and any AIS entry that needs explanation. Form 16 is the salary starting point, not a statement that no other income exists.

Compare salary and TDS with Form 26AS, then review AIS item by item against the taxpayer's own records. Add interest from bank certificates or statements even when it did not appear in payroll. Identify entries belonging to another person, duplicates, and income that changes the available return form. Prepare the regime comparison and final liability before treating a payroll refund estimate as reliable. Preserve the calculation, payment or refund-bank details, filed return, and e-verification acknowledgement as the first year's reference file.`,
  "ay-2026-27-freelancer-gst-turnover-income-tax-turnover": `## Bridge invoices, GST reporting, and cash collection

Prepare an invoice register showing client, service period, fee before GST, GST charged, credit note, TDS, reimbursement, collection date, and amount outstanding. Then build separate totals for GST reporting, professional receipts, and bank collections. Those totals can differ for valid reasons, but each difference should be traceable to a client or invoice rather than explained only at year end.

Compare the register with GST returns, Form 16A, AIS, Form 26AS, and bank receipts. Separate advances, foreign-client receipts, cancelled invoices, and money received for another person or activity. A wrong deductor filing belongs with the client; a GST-period error belongs in the indirect-tax review; an income-tax classification question belongs in the return working. Use the reconciled activity to decide form selection, books, presumptive conditions, expenses, and credits without forcing one filing total to match another for appearance.`,
  "ay-2026-27-government-employee-hra-lta-itr-checklist": `## Review each allowance from the underlying facts

Create separate HRA and LTA notes instead of treating both as payroll exemptions. For HRA, record the rented residence, period, rent obligation, payment trail, landlord details available, salary components used by payroll, and exemption shown in Form 16. For LTA, record the eligible journey, travellers, dates, route, fare evidence, and amount allowed by the employer. General travel spending and every rent payment do not automatically enter the exemption calculation.

Compare the taxpayer's evidence with the payroll claim and Form 16, then document any supported difference before filing. Check the selected tax regime independently because an amount considered by the employer may not remain available under the final return position. Keep related-person rent, incomplete travel evidence, multiple residences, and payroll corrections as visible review items. Preserve the underlying evidence and final calculation separately for each allowance.`,
  "ay-2026-27-high-value-transaction-ais-checklist": `## Classify the transaction before deciding its tax effect

For every high-value AIS entry, record the reporting entity, transaction type, gross amount, date or period, ownership, and the source documents needed to calculate the actual return treatment. Property consideration, securities sales, remittances, credit-card payments, deposits, and mutual-fund activity answer different questions; the AIS value may be gross activity rather than taxable income.

Trace each entry to the taxpayer's contract, broker statement, bank trail, acquisition record, or other contemporaneous evidence. Mark duplicates, wrong-person entries, cancellations, and transactions already represented elsewhere in the working. Where a sale is genuine, calculate the supported gain or business result instead of reporting the AIS gross amount. Where an entry is wrong, retain feedback or correction evidence without deleting the underlying review note. The completed schedule should show which return form and disclosure each transaction affects.`,
  "ay-2026-27-job-change-two-form-16-itr-checklist": `## Combine payroll records without duplicating claims

Build one salary schedule with a separate column for each employer. Record employment dates, gross salary, exemptions, deductions considered, perquisites, regime assumption, TDS, and any arrears or final settlement. Employers calculate withholding from the information available to them, so two individually correct Form 16s can still produce an underpayment or duplicate claim when combined.

Compare both certificates with salary slips, bank credits, AIS, and Form 26AS. Remove only genuine duplication; do not drop salary or TDS merely because the annual totals look high. Review whether the second employer considered earlier salary and whether either payroll used a deduction or exemption that the final regime does not permit. Recalculate the complete liability, record any balance payable, and retain employer correction correspondence for missing or wrong-PAN TDS. Keep the combined schedule with the filed return so next year's opening records remain clear.`,
  "ay-2026-27-landlord-rental-income-tds-itr-guide": `## Reconcile rent property by property and tenant by tenant

Create a rent ledger for each property showing owner, tenant, lease period, monthly rent, arrears, vacancy, deposit, reimbursement, municipal tax, payment date, and bank account used. Keep refundable deposits and expense reimbursements outside rent unless the facts support another treatment. A net bank receipt after tenant TDS does not establish the gross rental income.

Match each tenant's payment and tax certificate with Form 26AS and the lease ledger. Record wrong-PAN, missing, or delayed TDS separately from the property-income calculation and ask the tenant to correct its filing where needed. Connect loan interest to the relevant owner, property, borrowing purpose, and period instead of using one lender total across properties. For co-owned or mixed-use property, preserve the allocation and use history. The final property schedule should explain gross rent, supported deductions, ownership share, and tax credits without relying on a single annual bank total.`,
  "ay-2026-27-representative-filing-deceased-taxpayer-checklist": `## Separate authority to file from the deceased taxpayer's return

Create two connected files. The authority file should contain the death record, representative or legal-heir basis, portal registration status, and communication that permits action. The tax file should contain the deceased taxpayer's PAN, income by period, deductions, tax credits, bank or refund details, prior returns, and any outstanding proceeding. Authority to access the portal does not prove the income figures, and possession of income records does not by itself establish authority to file.

Build a dated chronology around the death and relevant filing period. Identify income and transactions before and after that date, accounts that remain in the deceased person's name, and records controlled by an employer, bank, broker, or another family member. Keep competing claims, inaccessible accounts, foreign assets, and disputed refund-bank ownership visible. Preserve every portal response and submitted acknowledgement so later estate or assessment questions can be answered from the exact return and authority record used.`,
  "ay-2026-27-resident-foreign-asset-disclosure-checklist": `## Inventory foreign accounts and assets before opening the schedules

Create one row per foreign bank account, broker account, share plan, company interest, property, pension, insurance product, or other relevant asset. Record the country, institution, ownership basis, opening and closing dates, statement period, values required for review, income, withholding, disposal, and source of the information. A year-end portfolio screenshot cannot answer ownership dates, peak or other required values, income, or sale calculations.

Connect each asset to the relevant income, gain, foreign-tax, and disclosure working without merging those questions. Review joint, beneficial, inherited, dormant, and employer-linked holdings explicitly. Preserve original statements and the exchange-rate method used for each calculation. Where historical records are missing, keep the gap visible and seek case-specific analysis before filing; do not omit an asset or invent a value merely to complete the schedule.`,
  "ay-2026-27-rnor-foreign-income-review-guide": `## Decide residential status before classifying foreign receipts

Prepare the travel and presence-day working first, using passport, immigration, travel, employment, and residency records. Then create an inventory of foreign income, accounts, assets, businesses, and remittances. For each item, record where it arose, where it was received, who owned or controlled it, the activity behind it, and the disclosure or tax question that remains. The RNOR label alone does not decide every foreign receipt.

Keep salary, business income, investment income, gains, remittances of earlier savings, and transfers between the taxpayer's own accounts separate. Review businesses controlled from India and Indian-source items independently from foreign bank location. Preserve the residential-status calculation and the reasoning used for each material item. Uncertain source, split-year facts, missing statements, or unclear beneficial ownership should remain explicit review points rather than being treated as automatically outside the return.`,
  "ay-2026-27-salary-without-tds-itr-guide": `## Calculate salary and tax even when payroll deducted nothing

Build a month-by-month salary sheet from payslips, employment terms, annual payroll information, bank credits, reimbursements, perquisites, arrears, and final settlement records. Net salary credits do not show gross income, and the absence of a Form 26AS credit does not remove salary from the return. Record why no TDS was deducted and whether the employer's payroll information is complete.

Add other income and prepare the regime comparison before calculating the final liability. Check whether advance tax, self-assessment tax, or interest questions arise from the complete facts rather than from the employer's zero-TDS position. If salary or payroll records are missing, request them and keep the correspondence; do not invent a tax credit or annual gross figure. Preserve the salary reconstruction, challans, final computation, submitted return, and verification acknowledgement so the payment trail remains clear.`,
  "ay-2026-27-startup-founder-salary-dividend-itr-guide": `## Classify every founder-company movement before filing

Create a founder-company ledger showing salary, director remuneration, dividend, reimbursement, loan, capital contribution, share issue, option or share benefit, sale proceeds, and any personal payment made through the company. Link each entry to payroll, board or shareholder approval, cap table, company ledger, invoice, agreement, or sale record. A bank narration such as transfer or expense cannot decide the tax classification.

Reconcile Form 16, Form 16A, AIS, and Form 26AS with the classified ledger while keeping company-side and founder-side records consistent. Separate genuine reimbursements from personal expenses, and distinguish capital movements from income. Review foreign shares, investors, related-party balances, and disputed cap-table entries as their own issues. Preserve the approvals and calculations supporting each material item so neither the company nor founder silently changes classification merely to make one return easier.`,
  "ay-2026-27-youtube-creator-income-itr-guide": `## Build a revenue register across platforms and brands

List every income channel separately: platform advertising, sponsorship, affiliate commission, subscriptions, events, licensing, foreign payouts, and barter or gifted products. Record the gross statement or invoice amount, tax or platform fee, currency conversion, TDS, GST where relevant, net receipt, and outstanding balance. The amount reaching the bank can omit fees and withholding, while a free product can still require a separate factual review.

Reconcile platform exports, brand contracts, invoices, Form 16A, AIS, Form 26AS, and bank or payment-service receipts. Keep personal spending outside the business ledger and connect claimed production, equipment, travel, editing, or platform costs to the actual activity. Separate foreign accounts and unsold gifted products from ordinary cash receipts. Use the complete activity to decide form selection, books, presumptive questions, GST differences, and disclosure needs. Archive platform exports because dashboards and payout labels can change after the year closes.`,
  "ay-2026-27-fno-loss-carry-forward-trader-guide": `## Recalculate turnover and preserve the loss trail

Start from the complete broker tradebook rather than the dashboard headline. Record realised F&O profit and loss, the turnover method used, charges, broker ledger entries, open positions, and transfers between trading and bank accounts. Where more than one broker was used, reconcile each account separately before combining the annual result. Gross contract value and net bank movement do not establish the turnover or taxable business result.

Connect every claimed expense to the trading activity and retain its invoice, payment, and purpose. Review books and audit questions from the supported turnover and facts instead of assuming that a broker-generated tax report settles them. Keep intraday speculative activity, delivery investments, and derivatives in separate workings so classification, set-off, and return schedules remain traceable.

Loss preservation also depends on the filing position and deadline. Before submission, document the form selected, the supported loss, current-year set-off, amount proposed for carry forward, and any late-filing or audit issue that could change that outcome. Archive the turnover calculation and broker exports used so the result can be reproduced after the platform data changes.`,
};

async function run() {
  let changed = 0;

  for (const [slug, addition] of Object.entries(additions)) {
    const filePath = path.join(blogDir, `${slug}.mdx`);
    const source = await fs.readFile(filePath, "utf8");
    const match = source.match(frontmatterPattern);
    if (!match) throw new Error(`Invalid MDX frontmatter: ${slug}`);

    const meta = JSON.parse(match[1]) as Record<string, unknown>;
    meta.modifiedAt = "2026-06-08T00:00:00.000Z";
    const body = match[2]
      .replace(new RegExp(`${startMarker}[\\s\\S]*?${endMarker}\\s*`, "g"), "")
      .trim();
    const block = `${startMarker}\n${addition.trim()}\n${endMarker}`;
    const next = `---\n${JSON.stringify(meta, null, 2)}\n---\n\n${body}\n\n${block}\n`;
    if (next === source.replace(/\r\n/g, "\n")) continue;
    await fs.writeFile(filePath, next, "utf8");
    changed += 1;
  }

  console.log(`Deepened ${changed} AY guides with route-specific editorial sections.`);
}

await run();
