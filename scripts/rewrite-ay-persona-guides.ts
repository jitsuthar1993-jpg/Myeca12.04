import fs from "node:fs/promises";
import path from "node:path";
import { ayPersonaReviewNotes } from "./ay-persona-review-notes";

type Frontmatter = {
  title?: string;
  slug?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  targetAudience?: string | null;
  keyTopics?: string[];
  keyHighlights?: string[];
  steps?: string[];
  description?: string;
  excerpt?: string;
  seoDescription?: string;
  modifiedAt?: string;
  readingTimeMinutes?: number;
  sourceLinks?: Array<{ label: string; url: string; checkedAt?: string | null }>;
  relatedPostIds?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

type EditorialBrief = {
  risk: string;
  example: string;
  pause: string;
};

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;
const topicAliases: Record<string, string> = {
  "ay-2026-27-fno-loss-carry-forward-trader-guide": "trading loss carry-forward review",
  "ay-2026-27-overseas-remittance-tcs-itr-checklist": "remittance tax-credit review",
  "ay-2026-27-self-occupied-home-loan-interest-checklist": "self-occupied property interest claim",
};

function sentenceCase(value: string) {
  const text = value.trim();
  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : text;
}

function normalizeClause(value: string) {
  return value.replace(/[.?!]+$/g, "").replace(/\s+/g, " ").trim();
}

function choose<T>(slug: string, salt: string, values: T[]) {
  let seed = 2166136261;
  for (const char of `${slug}:${salt}`) {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return values[(seed >>> 0) % values.length];
}

function shortTopic(meta: Frontmatter) {
  const alias = topicAliases[meta.slug || ""];
  if (alias) return alias;
  const keyword = normalizeClause(meta.primaryKeyword || meta.title || "the filing question");
  return keyword
    .replace(/\bAY 2026-27\b/gi, "")
    .replace(/\b(?:guide|checklist)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function documents(meta: Frontmatter) {
  return (meta.keyTopics ?? []).slice(1, 5).map(normalizeClause).filter(Boolean);
}

function sourceMarkdown(source: { label: string; url: string }) {
  return `[${source.label}](${source.url})`;
}

function decision(meta: Frontmatter) {
  return normalizeClause(meta.keyTopics?.[0] || "resolve the filing treatment from the available records");
}

const editorialBriefs: Record<string, EditorialBrief> = {
  "ay-2026-27-architect-designer-44ada-itr-guide": {
    risk: "Architectural and design practices often receive net amounts after client TDS while invoices and GST records show gross fees. Presumptive taxation also depends on the actual professional activity and current statutory conditions, not merely the occupation label.",
    example: "A client ledger shows a design fee, Form 16A shows the gross payment and TDS, and the bank shows only the net credit. The receipt working should bridge those three figures before turnover, expenses, presumptive treatment, or the return form is selected.",
    pause: "Pause where consulting, contracting, product sales, foreign receipts, or another activity is mixed with professional fees, or where the GST and income-tax totals remain unexplained.",
  },
  "ay-2026-27-cash-deposit-ais-review-guide": {
    risk: "A cash-deposit entry identifies money placed into an account; it does not identify the source or prove that the whole amount is fresh taxable income. The filing position must distinguish business collections, redeposits, loans, gifts, capital movements, and unexplained amounts.",
    example: "When cash collected from recorded sales is deposited over several days, compare the deposit dates with the cash book and sales trail. Record any amount that cannot be connected to the stated source instead of forcing the annual totals to balance.",
    pause: "Escalate large unexplained deposits, third-party cash, inconsistent cash books, or a source explanation that lacks a contemporaneous record.",
  },
  "ay-2026-27-co-owned-house-property-itr-guide": {
    risk: "Co-owners can have different ownership shares, loan obligations, rent receipts, and tax-credit records. Using one combined property total can move rent, interest, or TDS to the wrong return.",
    example: "If one tenant pays rent into a single co-owner's account, the bank credit does not by itself decide each owner's taxable share. Reconcile the deed, agreement, rent ledger, loan certificate, and tenant TDS before splitting the figures.",
    pause: "Pause for disputed ownership, unequal beneficial interests, changing shares, mixed self-occupied and let-out use, or loan interest that cannot be tied to the relevant owner and property.",
  },
  "ay-2026-27-donation-deduction-record-guide": {
    risk: "A payment described as a donation is not automatically deductible. The donee, registration status, payment mode, taxpayer identity, regime, and applicable limit or restriction all affect the supported claim.",
    example: "A bank debit and receipt may show the same amount but different donor details. Resolve the identity mismatch with the donee before entering a deduction, and retain the corrected receipt or written response.",
    pause: "Do not claim where the donee details cannot be verified, the payment mode is ineligible, the receipt belongs to another person, or the selected regime does not permit the proposed claim.",
  },
  "ay-2026-27-ecommerce-seller-itr-gst-checklist": {
    risk: "Marketplace gross sales, GST turnover, TCS or TDS reporting, refunds, platform charges, and net bank settlements are different figures. Treating the settlement amount as turnover hides fees, tax, returns, and timing differences.",
    example: "For one settlement cycle, bridge customer orders to cancellations and returns, marketplace charges, tax collected or withheld, and the net bank credit. Then apply the same method to the annual marketplace statement.",
    pause: "Escalate missing marketplace exports, unexplained reserve adjustments, sales under another GST registration, foreign marketplace receipts, or a turnover bridge that cannot be reproduced.",
  },
  "ay-2026-27-esop-sale-perquisite-itr-checklist": {
    risk: "An employee share plan can create a salary perquisite at exercise or vesting and a separate capital-gain question on sale. Combining payroll value, broker proceeds, and withholding into one number can duplicate income or lose acquisition-cost evidence.",
    example: "Connect the shares and value reported in Form 16 with the exercise statement, then match the later sale quantity and proceeds in the broker report. Preserve the calculation that carries the supported acquisition value into the gain working.",
    pause: "Pause for foreign employer plans, missing exercise values, transferred broker accounts, partial sales, currency conversion questions, or share quantities that do not reconcile.",
  },
  "ay-2026-27-first-time-salaried-employee-itr-guide": {
    risk: "A first return can look simple while still omitting bank interest, another income source, or an AIS entry the employer never saw. Payroll tax and a refund estimate also do not replace the taxpayer's complete return computation.",
    example: "Start with Form 16, compare salary and TDS with Form 26AS, add bank interest from certificates, and investigate AIS entries that do not match the taxpayer's records before choosing the form.",
    pause: "Escalate multiple employers, capital gains, freelance receipts, foreign assets, missing TDS, or any income head the intended salary-only form cannot report.",
  },
  "ay-2026-27-fno-loss-carry-forward-trader-guide": {
    risk: "F&O turnover is not the gross contract value, and a broker dashboard loss is not the filing working. Classification, turnover method, books, audit analysis, expenses, form selection, and the filing deadline can affect whether a loss is preserved.",
    example: "Recalculate turnover from the tradebook, reconcile the result with the broker P&L and ledger, and document how each expense connects to the trading activity before entering the business schedules.",
    pause: "Pause for multiple-broker differences, missing trade history, uncertain turnover, late filing, large losses, or an unresolved books or audit question.",
  },
  "ay-2026-27-form-16-missing-itr-guide": {
    risk: "Missing Form 16 does not remove the salary income or justify estimating it from net bank credits. Salary slips, employment terms, annual payroll information, AIS, and Form 26AS must be assembled into a supportable gross-salary and TDS working.",
    example: "Use monthly salary slips to rebuild gross pay and payroll deductions, compare net pay with bank credits, and claim only TDS that appears under the taxpayer's PAN while the employer correction is pursued.",
    pause: "Escalate absent payroll records, disputed salary components, missing or wrong-PAN TDS, multiple employers, or a final computation that cannot be reconciled to the available evidence.",
  },
  "ay-2026-27-freelancer-gst-turnover-income-tax-turnover": {
    risk: "GST turnover, invoice value, TDS-reported gross receipts, and bank collections can differ for legitimate reasons such as tax components, credit notes, timing, advances, and withholding. They still need a documented bridge.",
    example: "Build an invoice register with fee, GST, credit note, TDS, collection date, and amount outstanding. Compare that register with GSTR summaries, Form 16A, AIS, Form 26AS, and bank receipts.",
    pause: "Pause for mixed activities, foreign accounts, unsupported expenses, unexplained turnover differences, or invoices and GST returns that cannot be connected to the same service trail.",
  },
  "ay-2026-27-government-employee-hra-lta-itr-checklist": {
    risk: "Payroll allowance labels do not automatically establish an exemption. HRA and LTA need their own facts, evidence, regime analysis, and comparison with what the employer actually allowed in Form 16.",
    example: "Compare the HRA exemption in payroll with rent, residence, and payment evidence. Review LTA separately using the journey and eligible-travel facts rather than treating every travel bill as exempt.",
    pause: "Pause where rent is paid to a related person without a clear trail, travel evidence is incomplete, payroll used a different claim, or the selected regime changes availability.",
  },
  "ay-2026-27-gratuity-tax-checklist-employees": {
    risk: "The amount received in final settlement may include gratuity, leave encashment, salary arrears, bonus, and other items. Each component needs to be identified before any exemption or salary treatment is applied.",
    example: "Reconcile the gratuity statement with the settlement letter, Form 16, and bank receipt. Record the employer's calculation and the facts supporting any different amount used in the return.",
    pause: "Escalate multiple employers, unclear service periods, missing employer calculations, disputed exemption treatment, or a settlement that does not separate its components.",
  },
  "ay-2026-27-high-value-transaction-ais-checklist": {
    risk: "AIS may report gross property, securities, remittance, card, or cash activity without explaining the taxable amount. A high-value entry is an investigation signal, not a direction to report the displayed figure as income.",
    example: "For a securities entry, connect the AIS amount to the broker statement and calculate the gain from acquisition and sale records. For a property entry, identify ownership, consideration, and the relevant transaction documents.",
    pause: "Pause for entries that do not belong to the taxpayer, duplicate reporting, missing acquisition records, unexplained cash, or a transaction that changes the return form or disclosure schedules.",
  },
  "ay-2026-27-job-change-two-form-16-itr-checklist": {
    risk: "Each employer may calculate tax as if its salary were the taxpayer's only salary. Combining two Form 16s can expose duplicated deductions, allowances, regime assumptions, or under-deduction.",
    example: "Build one salary schedule by employer, then combine gross salary, exemptions, deductions considered, and TDS. Compare the combined result with AIS and Form 26AS before calculating the final liability.",
    pause: "Escalate a missing Form 16, overlapping employment, wrong-PAN TDS, duplicated payroll claims, or a final tax balance that was not anticipated by either employer.",
  },
  "ay-2026-27-landlord-rental-income-tds-itr-guide": {
    risk: "Gross rent, net bank receipts, tenant TDS, municipal taxes, vacancy, deposits, and loan interest answer different questions. One bank total cannot establish the complete property-income computation.",
    example: "Prepare a property-by-property rent ledger and match each tenant's payment and TDS certificate with Form 26AS. Keep security deposits and reimbursements outside rent unless the facts support another treatment.",
    pause: "Pause for disputed ownership, joint owners, rent under the wrong PAN, substantial arrears, mixed use, or loan interest unrelated to the property and ownership period.",
  },
  "ay-2026-27-lawyer-legal-consultant-itr-guide": {
    risk: "Client payments may arrive after TDS, retainers, reimbursements, court-fee advances, or other deductions. Net bank credits do not show gross professional receipts or decide which costs belong in the practice working.",
    example: "Compare the client ledger and invoice with Form 16A and the bank receipt. Record the gross fee, TDS, reimbursable amount, and net collection separately before reviewing expenses and form selection.",
    pause: "Escalate client money held on behalf of others, mixed chambers or firm income, foreign clients, unsupported expenses, missing TDS, or uncertain presumptive eligibility.",
  },
  "ay-2026-27-medical-disability-deduction-family-checklist": {
    risk: "Medical bills, insurance premiums, prescribed certificates, and disability deductions are not interchangeable. The taxpayer, dependant, relationship, certificate, payment, regime, and provision must fit the specific claim.",
    example: "Connect the prescribed certificate to the correct person and retain its issuing and validity details. Keep general treatment expenses separate unless the proposed deduction specifically depends on them.",
    pause: "Pause for expired or unclear certificates, disputed dependency, multiple possible claimants, privacy-sensitive records beyond what is necessary, or a claim unsupported by the selected regime.",
  },
  "ay-2026-27-minor-child-income-clubbing-checklist": {
    risk: "A minor's bank or investment account can contain gifts, interest, dividends, gains, or earned income with different clubbing consequences. Reporting only the closing balance or bank interest can miss the underlying source and parent-level treatment.",
    example: "List each income-producing asset, identify who transferred or funded it, and compare the child statement with the relevant parent's return records before applying clubbing or any exemption.",
    pause: "Escalate disputed source of funds, income from the child's own skill or work, changing custody or parent facts, foreign assets, or records that do not identify the beneficial owner.",
  },
  "ay-2026-27-nps-80ccd1b-deduction-checklist": {
    risk: "Employee contribution, employer contribution, and additional NPS deduction claims can occupy different parts of the computation. A PRAN statement total should not be copied into one deduction line without separating the contribution source and regime treatment.",
    example: "Match personal contributions with the NPS transaction statement and bank trail, then compare employer contributions with Form 16. Record which amount is being considered under each provision.",
    pause: "Pause for duplicate claims, contributions outside the relevant period, wrong PRAN details, employer amounts not reflected in payroll, or a regime choice that changes the proposed deduction.",
  },
  "ay-2026-27-overseas-remittance-tcs-itr-checklist": {
    risk: "TCS collected on an overseas remittance is a tax credit, not proof that the remitted amount is deductible or taxable income. The remittance purpose, payer, bank record, credit statement, and final liability must be reconciled separately.",
    example: "Match the remittance advice and TCS certificate with Form 26AS. If the credit is missing or belongs to the wrong PAN, pursue the bank correction and retain the correspondence before claiming it.",
    pause: "Escalate wrong-PAN credits, multiple remitters, education or medical remittances with incomplete support, foreign assets created by the remittance, or a refund claim driven by an unreconciled credit.",
  },
  "ay-2026-27-pensioner-family-pension-itr-guide": {
    risk: "Pension and family pension are not the same item, and bank interest or TDS may be spread across several institutions. A bank's annual summary should not replace the taxpayer's complete income and credit register.",
    example: "Separate pension from family pension, list bank interest institution by institution, and compare certificates and Form 16A with AIS and Form 26AS before calculating tax or refund.",
    pause: "Pause for arrears, commutation, multiple pension payers, missing TDS, inherited accounts, or uncertainty about whether an amount is pension, family pension, interest, or another receipt.",
  },
  "ay-2026-27-representative-filing-deceased-taxpayer-checklist": {
    risk: "A representative filing requires authority to act as well as a complete income-tax record for the deceased person. Registration, income, bank, refund, and filing-period facts should remain traceable to the correct taxpayer.",
    example: "Connect the death certificate and legal-heir or representative record with the deceased taxpayer's PAN, income records, tax credits, and refund bank details before beginning the return.",
    pause: "Escalate competing representatives, inaccessible accounts, incomplete income records, disputed refund-bank ownership, foreign assets, or a portal status that does not recognise the representative.",
  },
  "ay-2026-27-resident-foreign-asset-disclosure-checklist": {
    risk: "Foreign accounts, shares, employer awards, property, income, and foreign tax can require different schedules and reporting periods. A year-end portfolio value does not answer every Schedule FA, FSI, TR, or capital-gain question.",
    example: "Create one inventory row per foreign account or asset, then connect ownership dates, statement values, income, withholding, and any sale to the relevant return schedule and calculation.",
    pause: "Pause for uncertain residential status, missing historical statements, joint or beneficial ownership, employer plans, unavailable exchange-rate evidence, or assets that cannot be mapped to a schedule field.",
  },
  "ay-2026-27-rnor-foreign-income-review-guide": {
    risk: "RNOR status does not make every foreign receipt irrelevant. Residential status, source, receipt, control, business connection, account ownership, and the nature of each income item need separate analysis.",
    example: "Complete the travel and residential-status working first, then inventory each foreign income source and account. Record why each item is included, excluded, or disclosed rather than relying on the RNOR label alone.",
    pause: "Escalate split-year facts, uncertain source, businesses controlled from India, foreign employment, large remittances, or accounts and assets whose ownership cannot be established.",
  },
  "ay-2026-27-salary-without-tds-itr-guide": {
    risk: "No payroll TDS does not make salary tax-free. Gross salary, allowances, perquisites, other income, final liability, and any advance or self-assessment tax must be calculated from the complete facts.",
    example: "Rebuild gross salary from salary slips and the employment letter, reconcile net bank credits, and calculate the tax balance without inventing a TDS credit that does not appear in Form 26AS.",
    pause: "Escalate disputed payroll, multiple employers, missing salary records, foreign salary, unreported perquisites, or a liability that may involve interest and needs timely payment.",
  },
  "ay-2026-27-self-occupied-home-loan-interest-checklist": {
    risk: "An EMI statement contains principal, interest, and sometimes charges, while the deduction question depends on ownership, borrowing purpose, possession or completion facts, regime, and supported interest.",
    example: "Match the annual interest certificate with the loan account and ownership record. Keep principal and charges out of the interest figure and record the ownership share used in the computation.",
    pause: "Pause for joint loans with different ownership, pre-construction periods, refinancing, unclear possession, rented use, or an interest certificate unrelated to the relevant property.",
  },
  "ay-2026-27-senior-citizen-bank-interest-tds-itr": {
    risk: "Interest may be reported by several banks and can differ from net credits after TDS or sweep-account movements. A refund claim depends on the complete interest register, supported deductions, and tax credits under the correct PAN.",
    example: "List each bank and deposit, match annual interest certificates with Form 16A, AIS, and Form 26AS, and investigate any credit or interest amount that appears in only one source.",
    pause: "Escalate missing TDS, wrong-PAN reporting, joint deposits, inherited accounts, large unexplained credits, or bank records that cannot separate principal movements from interest.",
  },
  "ay-2026-27-small-shop-44ad-presumptive-itr-guide": {
    risk: "Presumptive taxation does not remove the need to establish eligibility, turnover, payment modes, and the return profile. Bank deposits, GST turnover, and sales summaries can differ and still require reconciliation.",
    example: "Build a sales and receipt summary, separate cash and qualifying non-cash collections where relevant, and compare it with bank statements and GST records before testing the presumptive route.",
    pause: "Pause for mixed activities, commission or agency income, unexplained deposits, turnover near a statutory condition, losses, foreign assets, or records that do not support the selected form.",
  },
  "ay-2026-27-spouse-income-clubbing-checklist": {
    risk: "Transfers between spouses can produce interest, rent, dividends, gains, or other income whose treatment depends on the asset, source, consideration, and later use. A joint bank account does not decide beneficial ownership or clubbing by itself.",
    example: "Trace the original transfer or gift to the asset acquired and the income it produced. Keep later reinvestment and independent funds separate so the proposed treatment can be reproduced.",
    pause: "Escalate mixed independent and transferred funds, disputed ownership, inadequate consideration questions, business interests, foreign assets, or a trail that cannot connect the transfer to the income.",
  },
  "ay-2026-27-startup-founder-salary-dividend-itr-guide": {
    risk: "A founder may receive salary, director remuneration, dividends, reimbursements, loans, share issues, option benefits, or sale proceeds from the same company. Bank narration alone cannot classify those amounts.",
    example: "Match each founder-company payment with payroll, board approval, cap table, ledger, invoice, or sale record. Reconcile Form 16, Form 16A, AIS, and Form 26AS with that classification.",
    pause: "Escalate related-party loans, unrecorded reimbursements, foreign shares or investors, disputed cap-table entries, or amounts the company and founder classify differently.",
  },
  "ay-2026-27-youtube-creator-income-itr-guide": {
    risk: "Creator income can arrive from platform revenue, sponsorships, affiliate links, subscriptions, events, foreign payouts, and barter arrangements. Net bank receipts can omit platform charges, withholding, GST, and non-cash consideration.",
    example: "Build a revenue register by platform and brand, record gross invoice or statement value, tax withheld, fees, currency conversion, and net receipt, then reconcile it with bank and tax-credit records.",
    pause: "Escalate foreign accounts, missing platform statements, barter or gifted products, personal and business expenses mixed together, wrong-PAN TDS, or sponsorship income without invoices or contracts.",
  },
};

function removeGeneratedDecisionNote(body: string) {
  return body
    .replace(
      /<!-- ay-persona-decision-note:start -->[\s\S]*?<!-- ay-persona-decision-note:end -->\s*/gi,
      "",
    )
    .replace(
      /^##\s+(?:Decision note:.*|.+?: write the filing conclusion|Build the .+ conclusion from the source records|What must be true before filing .+|Resolve the material .+ mismatch)\s*$[\s\S]*?(?=^## .+related guides and tools\s*$|(?![\s\S]))/gim,
      "",
    );
}

function humanizeSlug(value: string) {
  return value
    .replace(/\bay\b/gi, "AY")
    .replace(/\bitr\b/gi, "ITR")
    .replace(/\btds\b/gi, "TDS")
    .replace(/\btcs\b/gi, "TCS")
    .replace(/\bais\b/gi, "AIS")
    .replace(/\bgst\b/gi, "GST")
    .replace(/\bnps\b/gi, "NPS")
    .replace(/\b[a-z]/g, (character) => character.toUpperCase());
}

function relatedLabel(slug: string) {
  return humanizeSlug(slug.replace(/-/g, " "));
}

function compactDescription(value: string, maximum = 210) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maximum) return normalized;
  return `${normalized.slice(0, maximum - 1).replace(/\s+\S*$/, "")}.`;
}

function recordVerb(record: string, singular: string, plural: string) {
  return /\band\b|(?:s|records|details|returns|receipts|statements|invoices|proofs)$/i.test(record.trim())
    ? plural
    : singular;
}

function describeRecord(record: string, topic: string, comparison: string, decisionText: string, index: number) {
  const normalized = record.toLowerCase();
  const subject = index === 0
    ? topic
    : choose(`${topic}:${record}:${comparison}`, "record-subject", [
        "the filing question",
        "the proposed return treatment",
        "the open tax issue",
        "the evidence review",
        "the return working",
        "the supported conclusion",
      ]);
  const fact = normalized.includes("ais")
    ? `Use ${record} as a reporting-party lead for ${subject}, not as a conclusion. Trace each relevant entry to ${comparison}, identify duplicates or wrong-person entries, and retain feedback or correction evidence.`
    : normalized.includes("form 26as")
      ? `For ${subject}, ${record} establishes tax credits and reported payments under the PAN. Match the deductor, amount, and period with ${comparison}; a missing or wrong credit needs correction evidence before it is claimed.`
      : normalized.includes("form 16a")
        ? `${sentenceCase(record)} shows the deductor's gross-payment and TDS reporting for ${subject}. Compare its period and amount with ${comparison}, then keep the gross receipt and tax credit as separate figures in the working.`
        : normalized.includes("form 16")
          ? `Read ${record} for the salary, perquisite, deduction, and TDS facts it actually contains for ${subject}. Test those figures against ${comparison} and add income or corrections the employer record does not cover.`
          : normalized.includes("gst")
            ? `${sentenceCase(record)} records the indirect-tax view of ${subject}. Bridge invoice value, tax, credit notes, timing, and registration scope to ${comparison} before using any turnover figure in the income-tax return.`
            : normalized.includes("bank")
              ? `${sentenceCase(record)} ${recordVerb(record, "proves", "prove")} the date and net movement of money relevant to ${subject}; ${recordVerb(record, "it rarely proves", "they rarely prove")} the whole tax treatment. Connect each material credit or debit to ${comparison} and explain transfers, withholding, or non-income amounts.`
              : normalized.includes("invoice") || normalized.includes("fee")
                ? `${sentenceCase(record)} should identify the customer, service or supply, gross amount, tax component, and date relevant to ${subject}. Reconcile cancellations, credit notes, withholding, and collections with ${comparison}.`
                : normalized.includes("certificate")
                  ? `For ${subject}, check that ${record} belongs to the correct taxpayer, period, issuer, and claim. Compare its amount and validity details with ${comparison}, and preserve any corrected certificate used for filing.`
                  : normalized.includes("statement") || normalized.includes("report")
                    ? `${sentenceCase(record)} ${recordVerb(record, "is", "are")} a source ledger for ${subject}, but ${recordVerb(record, "its", "their")} labels and totals still need interpretation. Tie the relevant rows to ${comparison}, preserve the original export, and document exclusions or adjustments separately.`
                    : normalized.includes("cash book") || normalized.includes("ledger") || normalized.includes("register")
                      ? `${sentenceCase(record)} should provide the transaction-level trail for ${subject}. Test dates, counterparties, narration, and running totals against ${comparison}, and leave unexplained items visible instead of inserting a balancing adjustment.`
                      : normalized.includes("agreement") || normalized.includes("deed") || normalized.includes("contract")
                        ? `${sentenceCase(record)} establishes the legal or commercial terms relevant to ${subject}. Compare the parties, dates, ownership, consideration, and obligations with ${comparison} before deciding the return treatment.`
                        : normalized.includes("expense")
                          ? `${sentenceCase(record)} ${recordVerb(record, "supports", "support")} only costs that can be connected to ${subject} and its period. Check the underlying evidence, business purpose, payment trail, and any personal or capital element against ${comparison}.`
                          : normalized.includes("working") || normalized.includes("computation")
                            ? `${sentenceCase(record)} should show how ${subject} was calculated from the source trail. Keep each adjustment visible, cite ${comparison}, and make the final figure reproducible without relying on a balancing entry.`
                            : normalized.includes("p&l") || normalized.includes("profit and loss")
                              ? `${sentenceCase(record)} is a starting summary for the transactions, income, charges, and result relevant to ${subject}. Reconcile it with ${comparison}, retain the underlying entries, and document any adjustment made before filing.`
                              : normalized.includes("correction") || normalized.includes("acknowledgement")
                                ? `Keep ${record} as the dated trail for changes made before filing. Link each request or response to the affected fact, and preserve the submitted return separately.`
                            : `Use ${record} for the person, period, amount, or filing fact it directly establishes for ${subject}. Compare that fact with ${comparison}, and keep any unresolved difference visible in the working before deciding how to ${decisionText}.`;
  return fact;
}

function renderEditorialBody(meta: Frontmatter, brief: EditorialBrief, routeSpecificDepth = "") {
  const slug = meta.slug || "ay-persona-guide";
  const title = meta.title || sentenceCase(shortTopic(meta));
  const topic = shortTopic(meta);
  const decisionText = decision(meta)
    .replace(/\band checking\b/gi, "and check")
    .replace(/\bchecking\b/gi, "check");
  const [first = "the primary record", second = "the comparison record", third = "the supporting record", fourth = "correction trail and filing acknowledgement"] =
    documents(meta);
  const recordList = [...new Set([first, second, third, fourth])].slice(0, 4);
  const related = (meta.relatedPostIds ?? []).slice(0, 3);
  const recordRows = recordList.map((record, index) => {
    const comparison = recordList[(index + 1) % recordList.length];
    return `- **${sentenceCase(record)}:** ${describeRecord(record, topic, comparison, decisionText, index)}`;
  }).join("\n");
  const evidenceRows = recordRows.split("\n").slice(0, 3).join("\n");
  const relatedRows = [
    ...related.map((postSlug) => `- [${relatedLabel(postSlug)}](/blog/${postSlug})`),
    `- [Choose an ITR form after assembling all income](/itr/form-selector)`,
    `- [Review MyeCA document-handling expectations](/trust)`,
    ...(meta.ctaHref && meta.ctaLabel ? [`- [${meta.ctaLabel}](${meta.ctaHref})`] : []),
  ].join("\n");
  const sourceRows = (meta.sourceLinks ?? [])
    .slice(0, 4)
    .map((source) => `- ${sourceMarkdown(source)}`)
    .join("\n");
  if (routeSpecificDepth) {
    return `# ${title}

${brief.risk}

${brief.example}

${routeSpecificDepth}

${ayPersonaReviewNotes[slug] || ""}

## Read ${first}, ${second}, and ${third} for different facts

${evidenceRows}

## Resolve ${first} and ${second} differences before filing

${brief.pause}

Before submitting, ${decisionText}. Record what ${third} ${recordVerb(third, "establishes", "establish")}, explain any remaining difference, and retain the ${fourth} with the final computation.

## Official references

${sourceRows || "- [Income Tax Department](https://www.incometax.gov.in/)"}

## Related filing and record guides

${relatedRows || "- [ITR form selector](/itr/form-selector)\n- [Income tax calculator](/calculators/income-tax)"}
`;
  }
  const decisionHeading = sentenceCase(decisionText);
  const evidenceHeading = `Reconcile ${first} with ${second}`;
  const supportingHeading = `Decide what ${third} can establish`;
  const reviewHeading = `When ${first} and ${second} need closer review`;
  const retentionHeading = `Preserve the calculation and ${fourth}`;
  return `# ${title}

${brief.risk}

${brief.example}

## ${decisionHeading}

The return should follow the facts established by the records, not a dashboard label or a plausible prefilled amount. Keep the calculation and every unresolved difference visible while deciding the form, schedules, credits, deductions, or disclosures that apply.

## ${evidenceHeading}

Start with ${first}, test the relevant figure or fact against ${second}, and use ${third} only for the part of the conclusion it can establish. Do not insert a balancing amount merely to make the records agree.

## ${supportingHeading}

${recordRows}

## ${reviewHeading}

${brief.pause}

## ${retentionHeading}

1. Reconcile ${first} with ${second} and explain each material difference.
2. Record the limited role of ${third} and any open difference.
3. Select the form and schedules that can report the supported result.
4. Retain ${fourth}, the computation, and the submitted return.

## Official references

${sourceRows || "- [Income Tax Department](https://www.incometax.gov.in/)"}

## Related filing and record guides

${relatedRows || "- [ITR form selector](/itr/form-selector)\n- [Income tax calculator](/calculators/income-tax)"}
`;
}

function replaceTemplateMetadata(value: string, meta: Frontmatter) {
  const topic = shortTopic(meta);
  const records = documents(meta);
  const comparison = records.slice(0, 3).join(", ");
  return value
    .replace(
      /[^.]+ need a return that can be traced back to the records, not merely a plausible prefilled figure\.?/i,
      `${sentenceCase(topic)} requires a filing position supported by ${comparison || "the relevant source records"}.`,
    )
    .replace(
      /^Review (.+?): worked check using (.+)\.?$/i,
      (_match, audience: string, record: string) =>
        `Use ${record} to resolve the open ${topic} question for ${audience}.`,
    )
    .replace(
      /^(.+?): worked check using (.+)\.?$/i,
      (_match, audience: string, record: string) =>
        `${sentenceCase(audience)}: resolve the open question with ${record}.`,
    )
    .replace(/^(.+?): final filing check\.?$/i, `Close the ${topic} working file.`)
    .replace(/\.{2,}/g, ".");
}

function rewriteBody(body: string, meta: Frontmatter) {
  const slug = meta.slug || "ay-persona-guide";
  const topic = shortTopic(meta);
  const filingDecision = decision(meta);
  const [first = "the first source record", second = "the comparison record", third = "the supporting working"] = documents(meta);

  let next = removeGeneratedDecisionNote(body)
    .replace(
      /^[^\n]+ is the practical question in this return\. Begin with ([^,]+), then use ([^.]+) to explain the treatment before selecting the form and schedules\.$/m,
      `Before choosing a form, settle this question: ${filingDecision}. Reconcile $1 first, then document the filing fact supported by $2.`,
    )
    .replace(
      /^[^\n]+ should settle [^\n]+ before filing\. The working starts with ([^,]+) and uses ([^.]+) to document the answer rather than relying on a prefilled amount\.$/m,
      `Settle this question before filing: ${filingDecision}. Start with $1 and use $2 to document the answer rather than relying on a prefilled amount.`,
    )
    .replace(
      /^(.+?) need a return that can be traced back to the records, not merely a plausible prefilled figure\. Start with (.+?), then use (.+?) to settle the classification, credit, deduction, or disclosure at issue\.$/m,
      choose(slug, "lead", [
        `Before choosing a form, settle this question: ${filingDecision}. Reconcile $2 first and document the filing fact supported by $3.`,
        `Settle this question before filing: ${filingDecision}. Start with $2 and use $3 to document the answer rather than relying on a prefilled amount.`,
        `A supportable ${topic} position begins by answering ${filingDecision}. Compare $2, use $3 to explain any difference, and carry that explanation into the return working.`,
      ]),
    )
    .replace(
      /^## (.+?): worked check using (.+)$/gim,
      (_match, _label: string, record: string) => choose(slug, `worked:${record}`, [
        `## ${sentenceCase(topic)}: use ${record} to resolve the open question`,
        `## ${sentenceCase(topic)}: test the filing treatment against ${record}`,
        `## ${sentenceCase(topic)}: impact of ${record} on the working`,
        `## ${sentenceCase(topic)}: reconcile the disputed entry with ${record}`,
        `## ${sentenceCase(topic)}: record the conclusion supported by ${record}`,
      ]),
    )
    .replace(
      /^## What (.+) changes in the .+ working$/gim,
      `## ${sentenceCase(topic)}: impact of $1 on the working`,
    )
    .replace(
      /^## (.+?): final filing check$/gim,
      choose(slug, "final-heading", [
        `## Close the ${topic} working file`,
        `## ${sentenceCase(topic)}: checks before submission`,
        `## Preserve the evidence behind the ${topic} position`,
      ]),
    )
    .replace(/^## Finalise the return from the reconciled .+ records$/gim, `## Close the ${topic} working file`)
    .replace(/^## Test the filing treatment against (.+)$/gim, `## ${sentenceCase(topic)}: test the filing treatment against $1`)
    .replace(/^## Before submitting the .+ return$/gim, `## ${sentenceCase(topic)}: checks before submission`)
    .replace(
      /Assign a specific purpose to ([^,.\n]+), ([^,.\n]+), and every other return record\./gi,
      `In the ${topic} working, use $1 to establish the starting fact and $2 to test it; label each remaining record by the separate question it answers.`,
    )
    .replace(
      /The records available for [^.;\n]+ cannot settle the return without complete facts; stop when they support different answers or the proposed form lacks a required schedule\./gi,
      `Pause before filing if ${first} and ${second} point to different treatments or if ${third} requires a schedule the selected form cannot provide.`,
    )
    .replace(
      /^1\.\s+.+ should have one reporting treatment supported by the source records\.$/gim,
      `1. Confirm the treatment supported by ${first}, ${second}, and ${third}; note any unresolved difference before filing.`,
    )
    .replace(
      /^2\.\s+For .+?, choose the form and schedules only after the material mismatch in (.+?) is resolved in the computation\.$/gim,
      `2. Select the ${topic} form and schedules only after resolving the material difference in $1 through the computation.`,
    )
    .replace(
      /^2\.\s+Choose the form and schedules only after the material mismatch in (.+?) is resolved in the computation\.$/gim,
      `2. Select the ${topic} form and schedules only after resolving the material difference in $1 through the computation.`,
    )
    .replace(
      /^3\.\s+For .+?, retain (.+?) with the computation, submitted return, and acknowledgement\.$/gim,
      `3. Preserve the ${topic} evidence: keep $1 with the computation, submitted return, and acknowledgement.`,
    )
    .replace(
      /^3\.\s+Retain (.+?) with the computation, submitted return, and acknowledgement\.$/gim,
      `3. Preserve the ${topic} evidence: keep $1 with the computation, submitted return, and acknowledgement.`,
    )
    .replace(/\bwith the submitted return and acknowledgement\b/gi, `with the ${topic} computation and filing receipt`)
    .replace(/\bAIS and Form 26AS supports\b/gi, "AIS and Form 26AS support")
    .replace(/\brecords establishes\b/gi, "records establish")
    .replace(/\brecords supports\b/gi, "records support")
    .replace(/\bdoes not fit the supported portal flow\b/gi, "do not fit the supported portal flow")
    .replace(
      /\b((?:[a-z0-9/-]+\s+){0,6}(?:records|returns|credits|details|statements|receipts|proofs|contracts|invoices|orders|documents|filings|transactions|prescriptions|reports|papers)) should([^.\n;]*);\s*(compare|reconcile) it with\b/gi,
      "$1 should$2; $3 them with",
    );

  return next.replace(/\n{3,}/g, "\n\n").trim();
}

async function run() {
  const entries = await fs.readdir(blogDir, { withFileTypes: true });
  let changed = 0;

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.startsWith("ay-2026-27-") || !entry.name.endsWith(".mdx")) continue;
    const filePath = path.join(blogDir, entry.name);
    const source = await fs.readFile(filePath, "utf8");
    const match = source.match(frontmatterPattern);
    if (!match) throw new Error(`Invalid MDX frontmatter: ${entry.name}`);

    const meta = JSON.parse(match[1]) as Frontmatter;
    const brief = editorialBriefs[meta.slug || ""];
    const routeSpecificDepth = match[2].match(/<!-- ay-route-specific-depth:start -->[\s\S]*?<!-- ay-route-specific-depth:end -->/i)?.[0] ?? "";
    const bodyWithoutRouteSpecificDepth = match[2]
      .replace(/<!-- ay-route-specific-depth:start -->[\s\S]*?<!-- ay-route-specific-depth:end -->/gi, "")
      .trim();
    const containsLegacyTemplate =
      /"Decide the reporting treatment\."/i.test(match[1])
      || /\bRebuild the relevant transactions from\b/i.test(match[2])
      || /\bClose the .+ working file\b/i.test(match[2])
      || /^## Official references for the .+ decision$/im.test(match[2])
      || /^## .+: when the records require case-specific review$/im.test(match[2])
      || /^## Related guides for the .+ decision$/im.test(match[2]);
    const renderedBody = brief
      ? renderEditorialBody(meta, brief, routeSpecificDepth)
      : rewriteBody(bodyWithoutRouteSpecificDepth, meta);
    const body = routeSpecificDepth && !renderedBody.includes(routeSpecificDepth)
      ? `${renderedBody.trim()}\n\n${routeSpecificDepth}`
      : renderedBody;

    if (brief) {
      const filingDecision = decision(meta)
        .replace(/\band checking\b/gi, "and check")
        .replace(/\bchecking\b/gi, "check");
      const [first = "the primary record", second = "the comparison record", third = "the supporting record", fourth = "correction trail and filing acknowledgement"] =
        documents(meta);
      const audience = normalizeClause(meta.secondaryKeywords?.at(-1) || "taxpayers");
      const summary = compactDescription(
        `${sentenceCase(audience)} can use ${first}, ${second}, and ${third} to ${filingDecision}.`,
      );
      meta.description = summary;
      meta.excerpt = summary;
      meta.seoDescription = summary;
      meta.targetAudience = `${sentenceCase(audience)} preparing an AY 2026-27 return and reconciling ${first}, ${second}, and ${third}.`;
      meta.steps = [
        `${sentenceCase(filingDecision)}.`,
        `Reconcile ${first} with ${second}.`,
        `Document what ${third} ${recordVerb(third, "establishes", "establish")} and any unresolved difference.`,
        `Select the final form and retain the ${fourth}.`,
      ];
      meta.keyHighlights = [
        `${sentenceCase(first)} and ${second} need a documented reconciliation.`,
        `${sentenceCase(third)} should explain material differences before filing.`,
        `Keep the ${shortTopic(meta)} working papers, corrections, and filing acknowledgement together.`,
      ];
      meta.readingTimeMinutes = Math.max(6, Math.ceil(body.split(/\s+/).filter(Boolean).length / 220));
    } else {
      for (const field of ["description", "excerpt", "seoDescription"] as const) {
        if (meta[field]) meta[field] = replaceTemplateMetadata(meta[field] as string, meta);
      }
      for (const field of ["keyHighlights", "steps"] as const) {
        if (meta[field]) meta[field] = (meta[field] as string[]).map((value) => replaceTemplateMetadata(value, meta));
      }
    }
    meta.modifiedAt = "2026-06-08T00:00:00.000Z";

    const next = `---\n${JSON.stringify(meta, null, 2)}\n---\n\n${body.trimEnd()}\n`;
    if (next === source.replace(/\r\n/g, "\n")) continue;
    await fs.writeFile(filePath, next, "utf8");
    changed += 1;
  }

  console.log(`Rewrote ${changed} AY 2026-27 persona guides with route-specific decision notes.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
