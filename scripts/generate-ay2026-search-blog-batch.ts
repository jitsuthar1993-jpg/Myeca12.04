import fs from "node:fs/promises";
import path from "node:path";
import {
  descriptionFromArticleBody,
  highlightsFromArticleBody,
  stepsFromArticleBody,
} from "./lib/public-blog-metadata.js";
import { cleanSchemeEditorialBody } from "./lib/scheme-editorial-cleanup.js";

type SourceKey =
  | "itrDownloads"
  | "itrFaq"
  | "salaried"
  | "ais"
  | "taxCredit"
  | "eVerify"
  | "gst"
  | "myscheme"
  | "pmkisan"
  | "pmfby"
  | "pmayUrban"
  | "pmayG"
  | "pmjay"
  | "abdm"
  | "eshram"
  | "apy"
  | "nps"
  | "postOfficeSavings"
  | "janDhan"
  | "mudra"
  | "standup"
  | "startup"
  | "startupSeed"
  | "udyam"
  | "pmvishwakarma"
  | "cgtmse"
  | "pmegp"
  | "pmfme"
  | "nsp"
  | "aicte"
  | "pmkvy"
  | "apprenticeship"
  | "ncs"
  | "digilocker"
  | "umang"
  | "uidai"
  | "suryaGhar"
  | "pmkusum"
  | "pmmsy"
  | "soilHealth"
  | "nfsa"
  | "ujjwala"
  | "nsap"
  | "svanidhi"
  | "gem"
  | "samadhaan";

type TopicSpec = {
  title: string;
  slug: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  categoryId: string;
  audience: "individuals" | "businesses" | "both";
  userType: string;
  focus: string;
  documents: string[];
  sourceKeys: SourceKey[];
  relatedPostIds: string[];
  ctaLabel: string;
  ctaHref: string;
  contentType: "how-to" | "explainer";
  schemeName?: string;
  variantIndex?: number;
};

const PUBLISHED_AT = "2026-05-27T00:00:00.000Z";
const rootDir = process.cwd();
const draftDir = path.join(rootDir, "content", "blog-drafts");
const coverDir = path.join(rootDir, "client", "public", "assets", "blog", "text-covers");

const sources: Record<SourceKey, { label: string; url: string }> = {
  itrDownloads: {
    label: "Income Tax Department - AY 2026-27 ITR utilities",
    url: "https://www.incometax.gov.in/iec/foportal/downloads/income-tax-returns",
  },
  itrFaq: {
    label: "Income Tax Department - Income Tax Returns FAQs",
    url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/%20income%20tax%20returns-faq",
  },
  salaried: {
    label: "Income Tax Department - Salaried Individuals AY 2026-27",
    url: "https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1",
  },
  ais: {
    label: "Income Tax Department - Annual Information Statement",
    url: "https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/ais-annual-information-statement",
  },
  taxCredit: {
    label: "Income Tax Department - Tax Credit Mismatch FAQs",
    url: "https://www.incometax.gov.in/iec/foportal/node/11487",
  },
  eVerify: {
    label: "Income Tax Department - e-Verify Return FAQs",
    url: "https://www.incometax.gov.in/iec/foportal/help/e-filing-e-verify-your-return-faq",
  },
  gst: { label: "GST Portal", url: "https://www.gst.gov.in/" },
  myscheme: { label: "myScheme - official government scheme discovery portal", url: "https://www.myscheme.gov.in/" },
  pmkisan: { label: "PM-KISAN official portal", url: "https://pmkisan.gov.in/" },
  pmfby: { label: "Pradhan Mantri Fasal Bima Yojana official portal", url: "https://pmfby.gov.in/" },
  pmayUrban: { label: "PMAY Urban official portal", url: "https://pmay-urban.gov.in/" },
  pmayG: { label: "PMAY Gramin official portal", url: "https://pmayg.nic.in/" },
  pmjay: { label: "Ayushman Bharat PM-JAY official portal", url: "https://pmjay.gov.in/" },
  abdm: { label: "Ayushman Bharat Digital Mission official portal", url: "https://abdm.gov.in/" },
  eshram: { label: "eShram official portal", url: "https://eshram.gov.in/" },
  apy: { label: "Atal Pension Yojana information from NPS CRA", url: "https://www.npscra.nsdl.co.in/scheme-details.php" },
  nps: { label: "NPS Trust official portal", url: "https://www.npstrust.org.in/" },
  postOfficeSavings: {
    label: "Department of Posts - Small Savings Schemes",
    url: "https://www.indiapost.gov.in/Financial/Pages/Content/Post-Office-Saving-Schemes.aspx",
  },
  janDhan: { label: "Pradhan Mantri Jan-Dhan Yojana official portal", url: "https://pmjdy.gov.in/" },
  mudra: { label: "Pradhan Mantri MUDRA Yojana official portal", url: "https://www.mudra.org.in/" },
  standup: { label: "Stand-Up India official portal", url: "https://www.standupmitra.in/" },
  startup: { label: "Startup India official portal", url: "https://www.startupindia.gov.in/" },
  startupSeed: { label: "Startup India Seed Fund Scheme official portal", url: "https://seedfund.startupindia.gov.in/" },
  udyam: { label: "Udyam Registration official portal", url: "https://udyamregistration.gov.in/" },
  pmvishwakarma: { label: "PM Vishwakarma official portal", url: "https://pmvishwakarma.gov.in/" },
  cgtmse: { label: "CGTMSE official portal", url: "https://www.cgtmse.in/" },
  pmegp: { label: "PMEGP official portal", url: "https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp" },
  pmfme: { label: "PMFME official portal", url: "https://pmfme.mofpi.gov.in/" },
  nsp: { label: "National Scholarship Portal", url: "https://scholarships.gov.in/" },
  aicte: { label: "AICTE official portal", url: "https://www.aicte-india.org/" },
  pmkvy: { label: "Skill India Digital official portal", url: "https://www.skillindiadigital.gov.in/" },
  apprenticeship: { label: "Apprenticeship India official portal", url: "https://www.apprenticeshipindia.gov.in/" },
  ncs: { label: "National Career Service official portal", url: "https://www.ncs.gov.in/" },
  digilocker: { label: "DigiLocker official portal", url: "https://www.digilocker.gov.in/" },
  umang: { label: "UMANG official portal", url: "https://web.umang.gov.in/" },
  uidai: { label: "UIDAI official portal", url: "https://uidai.gov.in/" },
  suryaGhar: { label: "PM Surya Ghar official portal", url: "https://www.pmsuryaghar.gov.in/" },
  pmkusum: { label: "PM-KUSUM official portal", url: "https://pmkusum.mnre.gov.in/landing.html" },
  pmmsy: { label: "PM Matsya Sampada Yojana official portal", url: "https://pmmsy.dof.gov.in/" },
  soilHealth: { label: "Soil Health Card official portal", url: "https://soilhealth.dac.gov.in/" },
  nfsa: { label: "National Food Security Portal", url: "https://nfsa.gov.in/" },
  ujjwala: { label: "PM Ujjwala Yojana official portal", url: "https://www.pmuy.gov.in/" },
  nsap: { label: "National Social Assistance Programme official portal", url: "https://nsap.nic.in/" },
  svanidhi: { label: "PM SVANidhi official portal", url: "https://pmsvanidhi.mohua.gov.in/" },
  gem: { label: "Government e-Marketplace official portal", url: "https://gem.gov.in/" },
  samadhaan: { label: "MSME Samadhaan official portal", url: "https://samadhaan.msme.gov.in/" },
};

const taxSources: SourceKey[] = ["itrDownloads", "itrFaq", "ais", "taxCredit", "eVerify"];
const salariedSources: SourceKey[] = ["itrDownloads", "itrFaq", "salaried", "ais", "taxCredit"];
const businessSources: SourceKey[] = ["itrDownloads", "itrFaq", "ais", "taxCredit", "gst"];

const taxTopics: Array<[string, string, string, string, string, string, string[], SourceKey[]]> = [
  ["AY 2026-27 ITR Guide for First-Time Salaried Employees", "ay-2026-27-first-time-salaried-employee-itr-guide", "first-time salaried employees", "itr-filing", "first time salaried employee ITR AY 2026-27", "choosing the assessment year, Form 16, bank interest, and e-verification without rushing the return", ["PAN and Aadhaar records", "Form 16", "AIS and Form 26AS", "bank interest certificate"], salariedSources],
  ["AY 2026-27 ITR Checklist for Employees With a Job Change", "ay-2026-27-job-change-two-form-16-itr-checklist", "employees who changed jobs", "itr-filing", "two Form 16 job change ITR AY 2026-27", "combining salary from two employers and checking whether deductions or TDS are duplicated", ["both Form 16s", "salary slips", "AIS and Form 26AS", "investment proofs"], salariedSources],
  ["AY 2026-27 ITR Guide for Pensioners and Family Pension", "ay-2026-27-pensioner-family-pension-itr-guide", "pensioners and family-pension recipients", "income-tax", "pensioner ITR AY 2026-27", "reporting pension, family pension, bank interest, deductions, and refund details conservatively", ["pension certificate", "Form 16 from pension payer", "bank interest certificate", "Form 26AS"], salariedSources],
  ["Senior Citizen Bank Interest and TDS ITR Guide for AY 2026-27", "ay-2026-27-senior-citizen-bank-interest-tds-itr", "senior citizens with bank deposits", "refunds-notices", "senior citizen bank interest TDS ITR AY 2026-27", "matching FD interest, savings interest, TDS credits, and refund-bank validation", ["interest certificates", "Form 16A", "AIS", "Form 26AS"], taxSources],
  ["AY 2026-27 HRA and LTA Checklist for Government Employees", "ay-2026-27-government-employee-hra-lta-itr-checklist", "government employees", "tax-planning", "government employee HRA LTA ITR AY 2026-27", "checking HRA, LTA, salary allowances, and old-regime proof before filing", ["Form 16", "rent receipts", "travel bills", "salary breakup"], salariedSources],
  ["AY 2026-27 Salary Plus RSU and ESOP ITR Guide", "ay-2026-27-salary-rsu-esop-itr-guide", "employees with RSU or ESOP income", "foreign-assets-nri-tax", "RSU ESOP ITR AY 2026-27", "separating perquisite salary reporting, capital gains, foreign asset disclosure, and tax-credit records", ["Form 16", "broker statement", "vesting statement", "foreign asset records"], taxSources],
  ["AY 2026-27 ITR Guide for Teachers With Tuition Income", "ay-2026-27-teacher-tuition-income-itr-guide", "teachers earning tuition income", "business-freelancers", "tuition income ITR AY 2026-27", "deciding whether private tuition is other income or professional receipts and preserving payment proof", ["Form 16", "tuition receipts", "bank statement", "expense notes"], taxSources],
  ["AY 2026-27 ITR Guide for Doctors Using Professional Receipts", "ay-2026-27-doctor-professional-receipts-itr-guide", "doctors and medical consultants", "business-freelancers", "doctor professional income ITR AY 2026-27", "classifying professional receipts, TDS, expenses, presumptive tax eligibility, and books", ["Form 16A", "invoice register", "bank statement", "expense records"], businessSources],
  ["AY 2026-27 ITR Guide for Lawyers and Legal Consultants", "ay-2026-27-lawyer-legal-consultant-itr-guide", "lawyers and legal consultants", "business-freelancers", "lawyer consultant ITR AY 2026-27", "matching professional fees, TDS, expenses, and form selection before claiming refunds", ["Form 16A", "client ledger", "bank statement", "professional expense list"], businessSources],
  ["AY 2026-27 ITR Guide for Architects and Designers Under 44ADA", "ay-2026-27-architect-designer-44ada-itr-guide", "architects and designers", "business-freelancers", "44ADA architect ITR AY 2026-27", "checking whether presumptive professional taxation is available and whether ITR-4 or ITR-3 fits", ["fee invoices", "Form 16A", "expense summary", "GST turnover record"], businessSources],
  ["AY 2026-27 Consultant GST and TDS Reconciliation Guide", "ay-2026-27-consultant-gst-tds-reconciliation-guide", "independent consultants", "business-freelancers", "consultant GST TDS ITR AY 2026-27", "reconciling professional receipts, GST turnover, Form 16A, and AIS before filing", ["GST returns", "Form 16A", "bank credits", "invoice register"], businessSources],
  ["AY 2026-27 YouTube and Creator Income ITR Guide", "ay-2026-27-youtube-creator-income-itr-guide", "YouTubers and online creators", "business-freelancers", "YouTube creator income ITR AY 2026-27", "reporting platform income, sponsorships, expenses, foreign remittances, and TDS credits", ["platform statements", "brand invoices", "bank FIRC records if any", "expense proof"], businessSources],
  ["AY 2026-27 Influencer Brand Deal Income Tax Guide", "ay-2026-27-influencer-brand-deal-income-tax-guide", "influencers with brand deals", "business-freelancers", "influencer income tax AY 2026-27", "separating barter, cash fees, GST, TDS, expenses, and advance-tax checks", ["brand contracts", "Form 16A", "invoice register", "expense proof"], businessSources],
  ["AY 2026-27 Stock Investor ITR Guide for LTCG and STCG", "ay-2026-27-stock-investor-ltcg-stcg-itr-guide", "stock investors", "capital-gains", "stock investor LTCG STCG ITR AY 2026-27", "classifying delivery trades, gains, losses, AIS securities data, and broker reports", ["broker capital gains report", "AIS", "Form 26AS", "bank statement"], taxSources],
  ["AY 2026-27 Mutual Fund SIP Capital Gains ITR Guide", "ay-2026-27-mutual-fund-sip-capital-gains-itr-guide", "mutual fund investors", "capital-gains", "mutual fund capital gains ITR AY 2026-27", "matching redemption statements, holding period, tax statements, and ITR form choice", ["AMC statement", "capital gains report", "AIS", "bank statement"], taxSources],
  ["AY 2026-27 F&O Loss Carry Forward Guide for Traders", "ay-2026-27-fno-loss-carry-forward-trader-guide", "F&O traders", "business-freelancers", "F&O loss carry forward AY 2026-27", "checking business-income classification, due-date discipline, audit triggers, and loss records", ["broker P&L", "turnover working", "expense notes", "bank statement"], taxSources],
  ["AY 2026-27 Intraday Trading Income ITR Guide", "ay-2026-27-intraday-trading-income-itr-guide", "intraday traders", "business-freelancers", "intraday trading income ITR AY 2026-27", "separating speculative business income, expenses, turnover working, and loss disclosure", ["broker P&L", "trade ledger", "expense records", "AIS"], taxSources],
  ["AY 2026-27 Crypto VDA Tax Records Checklist", "ay-2026-27-crypto-vda-tax-records-checklist", "crypto and VDA users", "capital-gains", "crypto VDA tax records AY 2026-27", "preserving exchange reports, VDA transfer records, TDS data, and bank trail before filing", ["exchange statement", "VDA transaction report", "TDS records", "bank statement"], taxSources],
  ["AY 2026-27 Landlord Rental Income and TDS ITR Guide", "ay-2026-27-landlord-rental-income-tds-itr-guide", "landlords earning rent", "income-tax", "rental income TDS ITR AY 2026-27", "matching rent agreements, municipal taxes, loan interest, tenant TDS, and Form 26AS", ["rent agreement", "tenant TDS certificate", "home loan certificate", "municipal tax proof"], taxSources],
  ["AY 2026-27 Home Loan Interest Checklist for Self-Occupied House", "ay-2026-27-self-occupied-home-loan-interest-checklist", "home loan borrowers", "tax-planning", "home loan interest ITR AY 2026-27", "checking interest certificate, ownership share, possession status, and old-regime use", ["loan interest certificate", "property ownership proof", "Form 16", "regime comparison"], salariedSources],
  ["AY 2026-27 Education Loan Interest Deduction Guide", "ay-2026-27-education-loan-interest-deduction-guide", "education-loan borrowers", "tax-planning", "education loan interest deduction AY 2026-27", "documenting education loan interest, eligible borrower relationship, and old-regime deduction claim", ["bank interest certificate", "loan sanction letter", "Form 16", "repayment statement"], taxSources],
  ["AY 2026-27 NPS 80CCD(1B) Deduction Checklist", "ay-2026-27-nps-80ccd1b-deduction-checklist", "NPS contributors", "tax-planning", "NPS 80CCD(1B) deduction AY 2026-27", "checking NPS contribution evidence, tax-regime fit, employer contribution, and deduction limits", ["NPS transaction statement", "Form 16", "PRAN details", "regime comparison"], salariedSources],
  ["AY 2026-27 Donation Deduction Record Guide for 80G and 80GGC", "ay-2026-27-donation-deduction-record-guide", "donors claiming deductions", "tax-planning", "donation deduction 80G 80GGC AY 2026-27", "matching donation receipts, donee details, payment mode, and old-regime eligibility", ["donation receipt", "donee registration details", "payment proof", "Form 16"], taxSources],
  ["AY 2026-27 Medical Disability Deduction Checklist for Families", "ay-2026-27-medical-disability-deduction-family-checklist", "families claiming medical or disability deductions", "tax-planning", "medical disability deduction ITR AY 2026-27", "keeping certificates, medical proof, dependant details, and conservative deduction support", ["medical certificate", "prescription records", "payment proof", "dependent details"], taxSources],
  ["AY 2026-27 Agricultural Income Disclosure Guide", "ay-2026-27-agricultural-income-disclosure-guide", "taxpayers with agricultural income", "income-tax", "agricultural income ITR AY 2026-27", "disclosing exempt agricultural income, land records, sale receipts, and rate-impact checks", ["land records", "crop sale receipts", "bank statement", "expense notes"], taxSources],
  ["AY 2026-27 Minor Child Income Clubbing Checklist", "ay-2026-27-minor-child-income-clubbing-checklist", "parents handling minor child income", "income-tax", "minor child income clubbing AY 2026-27", "checking clubbing, bank interest, investments, exemptions, and disclosure trail", ["child bank statement", "investment statement", "parent Form 16", "AIS"], taxSources],
  ["AY 2026-27 Spouse Income and Clubbing Rules Checklist", "ay-2026-27-spouse-income-clubbing-checklist", "families with transfers between spouses", "income-tax", "spouse income clubbing AY 2026-27", "reviewing asset transfers, interest, rent, investments, and clubbing risk before filing", ["gift or transfer records", "bank statement", "investment statement", "AIS"], taxSources],
  ["AY 2026-27 Cash Deposit AIS Review Guide", "ay-2026-27-cash-deposit-ais-review-guide", "users seeing cash deposits in AIS", "refunds-notices", "cash deposit AIS ITR AY 2026-27", "explaining cash deposits with source records before filing or responding to mismatch questions", ["AIS", "bank statement", "cash book if any", "income proof"], taxSources],
  ["AY 2026-27 High-Value Transaction AIS Checklist", "ay-2026-27-high-value-transaction-ais-checklist", "taxpayers with high-value AIS entries", "refunds-notices", "high value transaction AIS AY 2026-27", "checking whether securities, property, credit card, cash, or remittance entries match the return", ["AIS", "transaction statements", "broker or bank records", "property documents"], taxSources],
  ["AY 2026-27 Foreign Travel TCS Credit ITR Guide", "ay-2026-27-foreign-travel-tcs-credit-itr-guide", "travellers with TCS credits", "refunds-notices", "foreign travel TCS credit ITR AY 2026-27", "matching TCS on foreign travel packages or remittances with Form 26AS and AIS", ["TCS certificate", "travel invoice", "Form 26AS", "AIS"], taxSources],
  ["AY 2026-27 Overseas Remittance TCS ITR Checklist", "ay-2026-27-overseas-remittance-tcs-itr-checklist", "users making overseas remittances", "refunds-notices", "overseas remittance TCS ITR AY 2026-27", "checking TCS credit, remittance purpose, bank records, and refund impact", ["bank remittance advice", "TCS certificate", "Form 26AS", "AIS"], taxSources],
  ["AY 2026-27 ITR Guide When Form 16 Is Missing", "ay-2026-27-form-16-missing-itr-guide", "employees without Form 16", "itr-filing", "file ITR without Form 16 AY 2026-27", "using salary slips, AIS, Form 26AS, and employer follow-up without guessing salary figures", ["salary slips", "bank salary credits", "AIS", "Form 26AS"], salariedSources],
  ["AY 2026-27 ITR Guide for Salary Paid Without TDS", "ay-2026-27-salary-without-tds-itr-guide", "employees whose employer did not deduct TDS", "itr-filing", "salary without TDS ITR AY 2026-27", "computing salary income, checking advance tax or self-assessment tax, and preserving employer proof", ["salary slips", "bank credits", "employment letter", "challan if tax paid"], salariedSources],
  ["AY 2026-27 Bank TDS Without Form 16A Checklist", "ay-2026-27-bank-tds-without-form-16a-checklist", "deposit holders missing Form 16A", "refunds-notices", "bank TDS no Form 16A AY 2026-27", "matching TDS in Form 26AS, AIS, bank certificates, and interest income before refund claims", ["bank interest certificate", "Form 26AS", "AIS", "bank statement"], taxSources],
  ["AY 2026-27 Capital Gains Missing From AIS Checklist", "ay-2026-27-capital-gains-missing-ais-checklist", "investors whose AIS is incomplete", "capital-gains", "capital gains missing AIS AY 2026-27", "filing from broker records even when AIS is incomplete while preserving reconciliation notes", ["broker statement", "contract notes", "AIS", "bank statement"], taxSources],
  ["AY 2026-27 Dividend Income AIS Reconciliation Guide", "ay-2026-27-dividend-income-ais-reconciliation-guide", "investors receiving dividends", "income-tax", "dividend income AIS ITR AY 2026-27", "matching dividends, TDS, Form 26AS, broker reports, and bank credits", ["dividend statement", "broker report", "Form 26AS", "AIS"], taxSources],
  ["AY 2026-27 Co-Owned House Property ITR Guide", "ay-2026-27-co-owned-house-property-itr-guide", "co-owners of house property", "income-tax", "co owned house property ITR AY 2026-27", "splitting rent, loan interest, ownership share, and deduction support among co-owners", ["ownership deed", "loan certificate", "rent agreement", "co-owner working"], taxSources],
  ["AY 2026-27 Leave Encashment Tax Checklist for Retiring Employees", "ay-2026-27-leave-encashment-retirement-tax-checklist", "retiring employees", "income-tax", "leave encashment tax ITR AY 2026-27", "checking exemption support, employer computation, Form 16 reporting, and tax regime impact", ["retirement settlement", "Form 16", "employer computation", "bank credit proof"], salariedSources],
  ["AY 2026-27 Gratuity Tax Checklist for Employees", "ay-2026-27-gratuity-tax-checklist-employees", "employees receiving gratuity", "income-tax", "gratuity tax ITR AY 2026-27", "matching gratuity exemption, employer computation, Form 16, and final settlement documents", ["gratuity statement", "Form 16", "settlement letter", "bank credit proof"], salariedSources],
  ["AY 2026-27 EPF Withdrawal Taxability Checklist", "ay-2026-27-epf-withdrawal-taxability-checklist", "employees withdrawing EPF", "income-tax", "EPF withdrawal tax ITR AY 2026-27", "checking TDS, service period, EPF statement, and whether withdrawal income needs reporting", ["EPF statement", "Form 16A if issued", "bank credit proof", "AIS"], taxSources],
  ["AY 2026-27 ESOP Sale and Perquisite ITR Checklist", "ay-2026-27-esop-sale-perquisite-itr-checklist", "employees selling ESOP shares", "capital-gains", "ESOP sale ITR AY 2026-27", "connecting salary perquisite reporting with later share sale capital gains and disclosures", ["Form 16", "ESOP exercise statement", "broker sale report", "tax payment proof"], taxSources],
  ["AY 2026-27 Foreign Asset Disclosure Checklist for Residents", "ay-2026-27-resident-foreign-asset-disclosure-checklist", "resident taxpayers with foreign assets", "foreign-assets-nri-tax", "foreign asset disclosure AY 2026-27", "checking Schedule FA, foreign income, tax credit, and records for overseas accounts or shares", ["foreign account statement", "broker report", "Form 67 records", "resident status working"], taxSources],
  ["AY 2026-27 NRI India Rent and TDS ITR Guide", "ay-2026-27-nri-india-rent-tds-itr-guide", "NRIs with Indian rent", "foreign-assets-nri-tax", "NRI rental income ITR AY 2026-27", "reporting Indian rent, tenant TDS, bank credits, DTAA notes, and refund claims", ["rent agreement", "TDS certificate", "NRO bank statement", "Form 26AS"], taxSources],
  ["AY 2026-27 RNOR Foreign Income Review Guide", "ay-2026-27-rnor-foreign-income-review-guide", "RNOR taxpayers", "foreign-assets-nri-tax", "RNOR foreign income ITR AY 2026-27", "checking residential status, foreign income scope, India income, and disclosure support", ["travel calendar", "foreign income statement", "Indian bank records", "resident status working"], taxSources],
  ["AY 2026-27 Small Shop 44AD Presumptive ITR Guide", "ay-2026-27-small-shop-44ad-presumptive-itr-guide", "small shop owners", "business-freelancers", "44AD small shop ITR AY 2026-27", "checking presumptive tax eligibility, turnover, bank records, GST linkage, and ITR-4 fit", ["sales summary", "bank statement", "GST records if any", "expense notes"], businessSources],
  ["AY 2026-27 Ecommerce Seller ITR and GST Checklist", "ay-2026-27-ecommerce-seller-itr-gst-checklist", "ecommerce sellers", "business-compliance", "ecommerce seller ITR GST AY 2026-27", "reconciling marketplace statements, GST returns, TDS or TCS data, and income-tax turnover", ["marketplace statement", "GST returns", "bank settlement report", "expense records"], businessSources],
  ["AY 2026-27 GST Turnover vs Income Tax Turnover for Freelancers", "ay-2026-27-freelancer-gst-turnover-income-tax-turnover", "freelancers with GST registration", "business-freelancers", "GST turnover income tax turnover freelancer AY 2026-27", "understanding why GST turnover and income-tax receipts can differ and how to document it", ["GSTR summaries", "invoice register", "bank statement", "Form 16A"], businessSources],
  ["AY 2026-27 Startup Founder Salary and Dividend ITR Guide", "ay-2026-27-startup-founder-salary-dividend-itr-guide", "startup founders", "business-freelancers", "startup founder salary dividend ITR AY 2026-27", "separating salary, dividends, director fees, capital gains, and business reimbursements", ["Form 16", "dividend statement", "board or payroll records", "AIS"], taxSources],
  ["AY 2026-27 Partner Remuneration and Interest ITR Guide", "ay-2026-27-partner-remuneration-interest-itr-guide", "partners in firms", "business-freelancers", "partner remuneration interest ITR AY 2026-27", "matching firm K-1 style records, remuneration, interest, capital account, and form selection", ["firm computation", "capital account", "bank statement", "AIS"], taxSources],
  ["AY 2026-27 Representative Filing Checklist for Deceased Taxpayers", "ay-2026-27-representative-filing-deceased-taxpayer-checklist", "legal heirs and representatives", "refunds-notices", "representative filing deceased taxpayer AY 2026-27", "organising registration, income records, refund bank details, and evidence before filing", ["death certificate", "legal heir proof", "income records", "bank details"], taxSources],
];

const schemeTopics: Array<[string, string, string, string, string, string, string[], SourceKey[]]> = [
  ["PM-KISAN Eligibility and Tax Record Checklist for 2026", "government-scheme-2026-pm-kisan-eligibility-tax-record-checklist", "PM-KISAN", "small and marginal farmers", "PM KISAN eligibility 2026", "checking beneficiary status, land records, Aadhaar, bank account, and income-tax record consistency", ["Aadhaar", "land record", "bank passbook", "mobile number"], ["myscheme", "pmkisan"]],
  ["PM Fasal Bima Yojana Claim Document Checklist for 2026", "government-scheme-2026-pm-fasal-bima-claim-document-checklist", "PM Fasal Bima Yojana", "farmers comparing crop insurance support", "PM Fasal Bima claim documents 2026", "keeping crop, bank, insurance, and loss-intimation records before relying on a claim", ["policy acknowledgement", "crop details", "bank account", "loss record"], ["myscheme", "pmfby"]],
  ["PMAY Urban 2.0 Eligibility and Home Loan Record Guide for 2026", "government-scheme-2026-pmay-urban-home-loan-record-guide", "PMAY Urban", "urban home buyers", "PMAY Urban eligibility 2026", "matching household, property, income, subsidy, and loan records for application readiness", ["Aadhaar", "income proof", "property papers", "loan sanction letter"], ["myscheme", "pmayUrban"]],
  ["PMAY Gramin Beneficiary and Document Checklist for 2026", "government-scheme-2026-pmay-gramin-beneficiary-document-checklist", "PMAY Gramin", "rural households", "PMAY Gramin beneficiary list 2026", "checking beneficiary records, land or house status, bank account, and local verification trail", ["Aadhaar", "bank account", "ration card", "local body records"], ["myscheme", "pmayG"]],
  ["Ayushman Bharat PM-JAY Card Eligibility Checklist for Families", "government-scheme-2026-ayushman-bharat-pmjay-card-eligibility-checklist", "Ayushman Bharat PM-JAY", "families checking health-cover eligibility", "PMJAY eligibility card 2026", "verifying beneficiary status, family details, identity records, and hospital-network readiness", ["Aadhaar or accepted ID", "ration card", "family details", "mobile number"], ["myscheme", "pmjay"]],
  ["ABHA Health ID and Medical Record Guide for Taxpayers", "government-scheme-2026-abha-health-id-medical-record-guide", "ABHA Health ID", "patients managing medical records", "ABHA health ID documents 2026", "using digital health records carefully while preserving medical expense proof for tax and insurance", ["Aadhaar or mobile", "health records", "prescriptions", "insurance papers"], ["abdm"]],
  ["eShram Card Registration Checklist for Unorganised Workers", "government-scheme-2026-eshram-card-registration-checklist", "eShram", "unorganised workers", "eShram card registration 2026", "checking identity, occupation, bank, and nominee details before registration", ["Aadhaar", "bank account", "mobile number", "occupation details"], ["myscheme", "eshram"]],
  ["PM Shram Yogi Maandhan Pension Readiness Guide", "government-scheme-2026-pm-shram-yogi-maandhan-readiness-guide", "PM Shram Yogi Maandhan", "unorganised workers planning pension", "PM Shram Yogi Maandhan eligibility 2026", "checking age, income, contribution, bank, and Aadhaar details before enrollment", ["Aadhaar", "bank account", "mobile number", "occupation proof"], ["myscheme", "eshram"]],
  ["Atal Pension Yojana Eligibility and Bank Mandate Checklist", "government-scheme-2026-atal-pension-yojana-bank-mandate-checklist", "Atal Pension Yojana", "workers planning small pension contributions", "Atal Pension Yojana eligibility 2026", "checking account, age, contribution, nominee, and tax-record implications before enrollment", ["bank account", "Aadhaar", "nominee details", "mobile number"], ["myscheme", "apy"]],
  ["NPS Account Opening Checklist for Salaried and Self-Employed Users", "government-scheme-2026-nps-account-opening-checklist", "National Pension System", "retirement savers", "NPS account opening documents 2026", "organising PRAN, KYC, contribution evidence, and tax deduction records", ["PAN", "Aadhaar or KYC", "bank account", "nominee details"], ["nps"]],
  ["Senior Citizen Savings Scheme Document Checklist for 2026", "government-scheme-2026-scss-senior-citizen-savings-checklist", "Senior Citizen Savings Scheme", "senior citizens comparing savings schemes", "SCSS documents 2026", "checking age, retirement status, deposit records, interest reporting, and TDS trail", ["age proof", "PAN", "bank or post office records", "interest certificate"], ["myscheme", "postOfficeSavings"]],
  ["Sukanya Samriddhi Account Checklist for Parents in 2026", "government-scheme-2026-sukanya-samriddhi-account-checklist", "Sukanya Samriddhi Yojana", "parents saving for a girl child", "Sukanya Samriddhi documents 2026", "matching guardian records, child identity, deposit proof, and deduction-support documents", ["birth certificate", "guardian PAN", "Aadhaar or KYC", "deposit proof"], ["myscheme", "postOfficeSavings"]],
  ["PPF Account Tax Record Checklist for AY 2026-27", "government-scheme-2026-ppf-tax-record-checklist-ay-2026-27", "Public Provident Fund", "savers using PPF", "PPF tax record AY 2026-27", "preserving contribution proof, interest records, withdrawal trail, and old-regime deduction support", ["PPF passbook", "deposit receipt", "PAN", "bank statement"], ["postOfficeSavings"]],
  ["PMJJBY Insurance Renewal and Nominee Checklist for 2026", "government-scheme-2026-pmjjby-insurance-renewal-nominee-checklist", "PMJJBY", "low-cost insurance users", "PMJJBY renewal checklist 2026", "checking auto-debit, nominee, bank account, and claim-document readiness", ["bank account", "nominee details", "premium debit proof", "identity proof"], ["myscheme", "janDhan"]],
  ["PMSBY Accident Insurance Checklist for Workers and Families", "government-scheme-2026-pmsby-accident-insurance-checklist", "PMSBY", "workers seeking accident cover", "PMSBY accident insurance checklist 2026", "checking enrollment, premium debit, nominee, and claim-record readiness", ["bank account", "nominee details", "premium debit proof", "identity proof"], ["myscheme", "janDhan"]],
  ["Jan Dhan Account Benefits and Document Checklist for 2026", "government-scheme-2026-jan-dhan-account-benefits-document-checklist", "Pradhan Mantri Jan-Dhan Yojana", "new banking users", "Jan Dhan account documents 2026", "checking KYC, direct benefit transfer readiness, nominee records, and account activity", ["Aadhaar or KYC", "mobile number", "nominee details", "bank passbook"], ["janDhan"]],
  ["MUDRA Loan Application Record Checklist for Small Businesses", "government-scheme-2026-mudra-loan-application-record-checklist", "MUDRA loan", "micro business owners", "MUDRA loan documents 2026", "organising business profile, bank statement, invoices, GST records, and repayment plan before applying", ["business proof", "bank statement", "quotation or invoice", "KYC records"], ["myscheme", "mudra"]],
  ["Stand-Up India Loan Readiness Checklist for Entrepreneurs", "government-scheme-2026-stand-up-india-loan-readiness-checklist", "Stand-Up India", "SC/ST and women entrepreneurs", "Stand Up India loan eligibility 2026", "checking promoter category, business plan, bank documents, and compliance readiness", ["KYC", "category certificate if applicable", "project report", "bank statement"], ["myscheme", "standup"]],
  ["Startup India Recognition Checklist for Founders in 2026", "government-scheme-2026-startup-india-recognition-checklist", "Startup India recognition", "startup founders", "Startup India recognition documents 2026", "checking entity age, innovation note, incorporation proof, and compliance records before applying", ["incorporation certificate", "PAN", "pitch or innovation note", "authorisation proof"], ["startup"]],
  ["Startup India Seed Fund Application Readiness Guide", "government-scheme-2026-startup-india-seed-fund-readiness-guide", "Startup India Seed Fund", "early-stage founders", "Startup India Seed Fund eligibility 2026", "preparing recognition, pitch, financial records, and milestone documents before application", ["DPIIT recognition", "pitch deck", "bank statement", "financial projections"], ["startup", "startupSeed"]],
  ["Udyam Registration Checklist for MSMEs in 2026", "government-scheme-2026-udyam-registration-msme-checklist", "Udyam Registration", "MSME owners", "Udyam registration documents 2026", "matching Aadhaar, PAN, GST, activity code, and turnover records before registration", ["Aadhaar", "PAN", "GSTIN if applicable", "business activity details"], ["udyam"]],
  ["PM Vishwakarma Registration and Document Checklist", "government-scheme-2026-pm-vishwakarma-registration-document-checklist", "PM Vishwakarma", "traditional artisans and craftspeople", "PM Vishwakarma registration documents 2026", "checking trade category, identity, bank account, and local verification readiness", ["Aadhaar", "bank account", "mobile number", "trade details"], ["myscheme", "pmvishwakarma"]],
  ["CGTMSE Credit Guarantee Checklist for MSME Loans", "government-scheme-2026-cgtmse-credit-guarantee-msme-loan-checklist", "CGTMSE", "MSME borrowers", "CGTMSE loan guarantee checklist 2026", "understanding guarantee-linked loan records, lender process, and business documentation", ["loan application", "business KYC", "Udyam certificate", "financial statements"], ["cgtmse", "udyam"]],
  ["PMEGP Loan and Subsidy Application Checklist for 2026", "government-scheme-2026-pmegp-loan-subsidy-application-checklist", "PMEGP", "new micro-enterprise applicants", "PMEGP application documents 2026", "preparing project reports, identity records, bank details, and training or category documents", ["project report", "KYC", "bank details", "education or category proof if applicable"], ["myscheme", "pmegp"]],
  ["PMFME Food Processing Scheme Checklist for Micro Units", "government-scheme-2026-pmfme-food-processing-micro-unit-checklist", "PMFME", "food processing micro units", "PMFME scheme documents 2026", "organising food-business documents, project records, bank statements, and local approvals", ["business KYC", "project estimate", "bank statement", "food business records"], ["pmfme"]],
  ["National Scholarship Portal Application Checklist for Students", "government-scheme-2026-national-scholarship-portal-student-checklist", "National Scholarship Portal", "students applying for scholarships", "National Scholarship Portal documents 2026", "checking income certificate, caste or category proof, bank account, Aadhaar, and institution records", ["income certificate", "student ID", "bank passbook", "Aadhaar"], ["nsp"]],
  ["Central Sector Scholarship Checklist for College Students", "government-scheme-2026-central-sector-scholarship-college-checklist", "Central Sector Scholarship", "college students", "central sector scholarship documents 2026", "preparing academic, income, bank, and institution verification records", ["marksheet", "income certificate", "bank details", "institution ID"], ["nsp"]],
  ["AICTE Pragati and Saksham Scholarship Readiness Guide", "government-scheme-2026-aicte-pragati-saksham-scholarship-guide", "AICTE Pragati and Saksham", "technical education students", "AICTE Pragati Saksham scholarship 2026", "checking institute recognition, student records, family income proof, and portal deadlines", ["admission proof", "income certificate", "bank details", "student ID"], ["aicte", "nsp"]],
  ["PMKVY Skill Training Registration Checklist for Job Seekers", "government-scheme-2026-pmkvy-skill-training-registration-checklist", "PMKVY", "job seekers and skill learners", "PMKVY registration documents 2026", "checking identity, training centre, course fit, and certificate records", ["Aadhaar", "mobile number", "education proof", "bank details if required"], ["pmkvy"]],
  ["Apprenticeship India Registration Checklist for Freshers", "government-scheme-2026-apprenticeship-india-registration-checklist", "Apprenticeship India", "freshers seeking apprenticeships", "Apprenticeship India registration 2026", "preparing profile, education records, bank account, and employer-matching information", ["education certificate", "Aadhaar", "bank account", "resume details"], ["apprenticeship"]],
  ["National Career Service Profile Checklist for Job Seekers", "government-scheme-2026-national-career-service-profile-checklist", "National Career Service", "job seekers", "National Career Service registration 2026", "building an accurate job profile with education, experience, skills, and verified contact records", ["resume", "education certificates", "mobile number", "email ID"], ["ncs"]],
  ["DigiLocker Document Readiness Guide for ITR and Schemes", "government-scheme-2026-digilocker-document-readiness-guide", "DigiLocker", "users collecting digital documents", "DigiLocker documents for ITR and schemes 2026", "using issued digital documents while preserving originals and application proof", ["Aadhaar-linked mobile", "PAN", "issued certificates", "downloaded PDFs"], ["digilocker"]],
  ["UMANG App Services Checklist for Taxpayers and Families", "government-scheme-2026-umang-app-services-checklist", "UMANG", "families using government services", "UMANG app services 2026", "organising mobile, identity, and service records before using government services", ["mobile number", "Aadhaar if required", "service account details", "document copies"], ["umang"]],
  ["Aadhaar Update Checklist Before Filing ITR or Scheme Applications", "government-scheme-2026-aadhaar-update-itr-scheme-checklist", "Aadhaar update", "users with identity mismatches", "Aadhaar update ITR scheme documents 2026", "checking name, mobile, address, and PAN-linked identity consistency before applications", ["Aadhaar", "address proof", "mobile number", "PAN"], ["uidai"]],
  ["PM Surya Ghar Rooftop Solar Subsidy Readiness Guide", "government-scheme-2026-pm-surya-ghar-rooftop-solar-readiness-guide", "PM Surya Ghar", "households considering rooftop solar", "PM Surya Ghar documents 2026", "checking consumer number, roof ownership, bank details, vendor records, and subsidy process", ["electricity bill", "bank account", "property or consumer details", "vendor quote"], ["suryaGhar"]],
  ["PM-KUSUM Solar Pump Scheme Checklist for Farmers", "government-scheme-2026-pm-kusum-solar-pump-checklist", "PM-KUSUM", "farmers considering solar pumps", "PM KUSUM solar pump documents 2026", "checking land, pump, farmer identity, bank, and state-nodal application records", ["land record", "Aadhaar", "bank details", "existing pump details"], ["pmkusum"]],
  ["PM Matsya Sampada Yojana Checklist for Fisheries Businesses", "government-scheme-2026-pm-matsya-sampada-fisheries-checklist", "PM Matsya Sampada Yojana", "fisheries entrepreneurs", "PMMSY documents 2026", "organising project, identity, bank, and activity records before applying for fisheries support", ["project report", "KYC", "bank statement", "activity proof"], ["pmmsy"]],
  ["Soil Health Card Record Checklist for Farmers", "government-scheme-2026-soil-health-card-record-checklist", "Soil Health Card", "farmers checking soil records", "Soil Health Card 2026", "keeping soil-test, land, crop, and advisory records for better farm planning", ["land record", "soil sample details", "crop details", "mobile number"], ["soilHealth"]],
  ["Kisan Credit Card Application Document Checklist", "government-scheme-2026-kisan-credit-card-application-checklist", "Kisan Credit Card", "farmers seeking credit", "Kisan Credit Card documents 2026", "preparing land, crop, identity, bank, and existing-loan records before approaching a lender", ["land record", "crop details", "bank account", "KYC"], ["myscheme"]],
  ["Ration Card and One Nation One Ration Card Checklist", "government-scheme-2026-ration-card-one-nation-one-ration-card-checklist", "Ration card and ONORC", "families checking food-security benefits", "ration card ONORC documents 2026", "checking family details, portability, Aadhaar seeding, and state records", ["ration card", "Aadhaar", "family details", "mobile number"], ["nfsa"]],
  ["PM Ujjwala LPG Connection Checklist for Households", "government-scheme-2026-pm-ujjwala-lpg-connection-checklist", "PM Ujjwala Yojana", "households applying for LPG connection", "PM Ujjwala documents 2026", "checking household eligibility, identity, bank, and LPG distributor records", ["Aadhaar", "bank account", "ration card", "address proof"], ["ujjwala"]],
  ["National Social Assistance Pension Checklist for Senior Citizens", "government-scheme-2026-nsap-pension-senior-citizen-checklist", "National Social Assistance Programme", "senior citizens and vulnerable households", "NSAP pension documents 2026", "checking age, income, bank, identity, and local verification records", ["age proof", "income proof", "bank account", "Aadhaar or ID"], ["nsap"]],
  ["PM SVANidhi Loan Checklist for Street Vendors", "government-scheme-2026-pm-svanidhi-street-vendor-loan-checklist", "PM SVANidhi", "street vendors", "PM SVANidhi loan documents 2026", "preparing vendor identity, bank, ULB reference, repayment, and digital-payment records", ["vendor certificate or reference", "bank account", "mobile number", "KYC"], ["svanidhi"]],
  ["GeM Seller Registration Checklist for Small Businesses", "government-scheme-2026-gem-seller-registration-checklist", "Government e-Marketplace", "small businesses selling to government buyers", "GeM seller registration documents 2026", "checking business identity, bank, tax registration, product catalogue, and compliance records", ["PAN", "bank account", "Udyam or GST if applicable", "product details"], ["gem", "udyam"]],
  ["MSME Samadhaan Delayed Payment Complaint Checklist", "government-scheme-2026-msme-samadhaan-delayed-payment-checklist", "MSME Samadhaan", "MSMEs facing delayed payments", "MSME Samadhaan complaint documents 2026", "organising invoices, purchase orders, delivery proof, Udyam details, and buyer communication", ["Udyam certificate", "invoice", "purchase order", "delivery proof"], ["samadhaan", "udyam"]],
  ["Income Certificate Checklist for Scholarships and Government Schemes", "government-scheme-2026-income-certificate-scholarship-checklist", "income certificate", "students and families applying for schemes", "income certificate scholarship scheme 2026", "organising income proof, family details, tax records, and local authority documents", ["income proof", "family details", "tax return if available", "identity proof"], ["myscheme", "nsp"]],
  ["Caste Certificate Checklist for Scholarship and Loan Schemes", "government-scheme-2026-caste-certificate-scholarship-loan-checklist", "caste certificate", "applicants using category-based schemes", "caste certificate scholarship loan scheme 2026", "checking certificate validity, name consistency, family records, and portal upload requirements", ["caste certificate", "Aadhaar", "family records", "education or business proof"], ["myscheme", "nsp"]],
  ["Disability Certificate Checklist for Tax and Scheme Benefits", "government-scheme-2026-disability-certificate-tax-scheme-checklist", "disability certificate", "persons with disabilities and caregivers", "disability certificate tax scheme 2026", "checking certificate details, medical records, identity, bank, and deduction support", ["disability certificate", "medical records", "Aadhaar", "bank account"], ["myscheme"]],
  ["Women Entrepreneur Scheme Search Checklist for 2026", "government-scheme-2026-women-entrepreneur-scheme-search-checklist", "women entrepreneur schemes", "women business owners", "women entrepreneur scheme documents 2026", "using official portals to compare scheme eligibility, promoter ownership, business proof, and bank records", ["KYC", "business proof", "bank statement", "project note"], ["myscheme", "standup", "mudra"]],
  ["Farmer Scheme Search Checklist Before Applying in 2026", "government-scheme-2026-farmer-scheme-search-before-applying", "farmer schemes", "farmers comparing multiple benefits", "farmer government schemes 2026", "checking land, crop, bank, Aadhaar, and state-specific records before choosing a scheme", ["land record", "Aadhaar", "bank account", "crop details"], ["myscheme", "pmkisan", "soilHealth"]],
];

function toTitleCase(value: string) {
  const acronyms: Record<string, string> = {
    ais: "AIS",
    ay: "AY",
    ca: "CA",
    fno: "F&O",
    gst: "GST",
    itr: "ITR",
    msme: "MSME",
    nps: "NPS",
    nri: "NRI",
    pan: "PAN",
    tcs: "TCS",
    tds: "TDS",
    vda: "VDA",
  };
  return value
    .split(/\s+/)
    .map((word) => acronyms[word.toLowerCase()] ?? `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ")
    .replace(/\bMye CA\b/g, "MyeCA")
    .replace(/\bForm 16a\b/g, "Form 16A");
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength + 1).replace(/\s+\S*$/, "").trim()}.`;
}

function actionFromFocus(value: string) {
  const replacements: Array<[RegExp, string]> = [
    [/^checking\b/i, "check"],
    [/^choosing\b/i, "choose"],
    [/^combining\b/i, "combine"],
    [/^reporting\b/i, "report"],
    [/^matching\b/i, "match"],
    [/^separating\b/i, "separate"],
    [/^classifying\b/i, "classify"],
    [/^preserving\b/i, "preserve"],
    [/^documenting\b/i, "document"],
    [/^disclosing\b/i, "disclose"],
    [/^reviewing\b/i, "review"],
    [/^explaining\b/i, "explain"],
    [/^using\b/i, "use"],
    [/^computing\b/i, "compute"],
    [/^connecting\b/i, "connect"],
    [/^deciding\b/i, "decide"],
    [/^reconciling\b/i, "reconcile"],
    [/^filing\b/i, "file"],
    [/^keeping\b/i, "keep"],
    [/^building\b/i, "build"],
    [/^organising\b/i, "organise"],
    [/^organizing\b/i, "organize"],
    [/^understanding\b/i, "understand"],
    [/^preparing\b/i, "prepare"],
    [/^identifying\b/i, "identify"],
    [/^splitting\b/i, "split"],
    [/^verifying\b/i, "verify"],
  ];
  for (const [pattern, replacement] of replacements) {
    if (pattern.test(value)) return value.replace(pattern, replacement);
  }
  return value.replace(/^to\s+/i, "");
}

function sentenceCase(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function indefiniteArticle(value: string) {
  return /^[aeiou]/i.test(value.trim()) ? "An" : "A";
}

const isPluralPhrase = (value: string) =>
  /\band\b|\bboth\b|\brecords\b|\breturns\b|\bcredits\b|\bdetails\b|\bstatements\b|\breceipts\b|\bproofs\b|\bcontracts\b|\binvoices\b|\borders\b|\bdocuments\b|\bfilings\b|\btransactions\b|\bprescriptions\b|\bpapers\b|\bcertificates\b|\bbills\b|\breports\b|\bnotes\b|\bsummaries\b|\bslips\b|\bForm 16s\b/i
    .test(value);

const verbFor = (value: string, singular: string, plural: string) =>
  isPluralPhrase(value) ? plural : singular;

function buildTaxTopic(tuple: (typeof taxTopics)[number]): TopicSpec {
  const [title, slug, userType, categoryId, primaryKeyword, focus, documents, sourceKeys] = tuple;
  const relatedByCategory: Record<string, string[]> = {
    "itr-filing": ["complete-ay-2026-27-itr-filing-guide", "itr-form-selection-master-guide-ay-2026-27"],
    "income-tax": ["salary-tax-guide-fy-2025-26-ay-2026-27", "download-ais-tis-form-26as-before-itr-ay-2026-27"],
    "tax-planning": ["new-tax-regime-default-how-to-opt-old-ay-2026-27", "section-80c-80d-nps-old-regime-checklist-ay-2026-27"],
    "capital-gains": ["capital-gains-trading-income-itr-guide-ay-2026-27", "itr-2-checklist-capital-gains-foreign-assets-ay-2026-27"],
    "business-freelancers": ["freelancer-form-16a-itr-3-vs-itr-4-ay-2026-27", "professional-income-44ada-itr-4-ay-2026-27"],
    "business-compliance": ["gst-turnover-vs-income-tax-turnover-ay-2026-27", "small-business-44ad-presumptive-itr-4-ay-2026-27"],
    "foreign-assets-nri-tax": ["nri-rnor-resident-status-itr-ay-2026-27", "itr-2-checklist-capital-gains-foreign-assets-ay-2026-27"],
    "refunds-notices": ["tax-credit-mismatch-tds-form-26as-ay-2026-27", "e-verify-itr-within-30-days-ay-2026-27"],
  };

  return {
    title,
    slug,
    primaryKeyword,
    secondaryKeywords: unique(["AY 2026-27 ITR", "FY 2025-26 tax return", "AIS Form 26AS", userType]),
    categoryId,
    audience: categoryId === "business-freelancers" || categoryId === "business-compliance" ? "both" : "individuals",
    userType,
    focus,
    documents,
    sourceKeys,
    relatedPostIds: relatedByCategory[categoryId] ?? ["complete-ay-2026-27-itr-filing-guide", "ais-form-26as-tds-reconciliation-playbook-ay-2026-27"],
    ctaLabel: "Review unresolved filing facts",
    ctaHref: "/expert-consultation",
    contentType: "how-to",
  };
}

function buildSchemeTopic(tuple: (typeof schemeTopics)[number]): TopicSpec {
  const [title, slug, schemeName, userType, primaryKeyword, focus, documents, sourceKeys] = tuple;
  return {
    title,
    slug,
    primaryKeyword,
    secondaryKeywords: unique([`${schemeName} documents`, `${schemeName} eligibility`, "government scheme 2026", userType]),
    categoryId: "government-schemes",
    audience: ["MSME", "business", "founder", "seller", "entrepreneur"].some((word) => userType.toLowerCase().includes(word.toLowerCase())) ? "businesses" : "individuals",
    userType,
    focus,
    documents,
    sourceKeys,
    relatedPostIds: ["government-schemes-msme-startup-eligibility-document-checklist", "mye-ca-document-vault-guide"],
    ctaLabel: "Review documents before applying",
    ctaHref: "/expert-consultation",
    contentType: "explainer",
    schemeName,
  };
}

function sourceLinksFor(spec: TopicSpec) {
  const sourceKeys = spec.categoryId === "government-schemes" ? unique(["myscheme" as SourceKey, ...spec.sourceKeys]) : spec.sourceKeys;
  return sourceKeys.map((key) => sources[key]);
}

function toolLinkFor(spec: TopicSpec) {
  if (spec.categoryId === "itr-filing") return { label: "ITR form selector", href: "/itr/form-selector" };
  if (spec.categoryId === "business-freelancers" || spec.categoryId === "business-compliance") {
    return { label: "Income tax calculator", href: "/calculators/income-tax" };
  }
  if (spec.categoryId === "government-schemes") return { label: "Document handling and privacy", href: "/trust" };
  return { label: "Form 16 parser", href: "/form16-parser" };
}

function schemeDocumentReason(document: string, spec: TopicSpec, index: number) {
  const documentLabel = sentenceCase(document);
  const comparisonRecord = spec.documents[(index + 1) % spec.documents.length];
  const purpose = schemeRecordPurposeFor(document);
  const comparisonPurpose = schemeRecordPurposeFor(comparisonRecord);

  return chooseForSpecWithSalt(spec, `scheme-document-${index}`, [
    `${documentLabel} should support ${purpose} exactly as entered. Compare any different name, date, identifier, or status with ${comparisonRecord} before submission.`,
    `Use ${document} for ${purpose}; use ${comparisonRecord} separately for ${comparisonPurpose}. Resolve any ${spec.primaryKeyword} conflict through source-record correction or written clarification.`,
    `${documentLabel} ${verbFor(document, "belongs", "belong")} in the file because ${verbFor(document, "it supports", "they support")} ${purpose}. Confirm the issuer, validity, applicant details, and relevant period before relying on ${document}.`,
    `Read ${document} only for ${purpose}. If ${comparisonRecord} ${verbFor(comparisonRecord, "points", "point")} to a different applicant fact, pause the request and resolve that difference first.`,
    `${documentLabel} should be current, legible, and linked to the same applicant as ${comparisonRecord}. Retain the version used for the submission.`,
    `Record what ${document} ${verbFor(document, "proves", "prove")} about ${purpose}, then compare that answer with ${comparisonRecord}. For ${spec.primaryKeyword}, use each record only for the fact it actually contains.`,
    `${documentLabel} should answer the application question about ${purpose}. Where it disagrees with ${comparisonRecord}, identify the authoritative record before uploading.`,
    `Keep ${document} with its issuer and date visible. It should support ${purpose} without contradicting the ${comparisonPurpose} shown by ${comparisonRecord}.`,
    `${documentLabel} is useful only when the application can trace ${purpose} back to it. Resolve any incomplete or inconsistent ${spec.primaryKeyword} detail before submission.`,
    `Verify ${purpose} from ${document}, then test the same applicant file against ${comparisonRecord}. Save the checked ${spec.primaryKeyword} evidence with the final acknowledgement.`,
    `${documentLabel} should support the live application answer about ${purpose}. For ${spec.primaryKeyword}, use the format and issuing record named in the current authority instruction.`,
  ]);
}

function documentReason(document: string, spec: TopicSpec, index: number) {
  const value = document.toLowerCase();
  const documentLabel = sentenceCase(document);
  const comparisonOffset = 1 + ((spec.variantIndex ?? 0) % Math.max(1, spec.documents.length - 1));
  const comparisonRecord = spec.documents[(index + comparisonOffset) % spec.documents.length];
  const isScheme = spec.categoryId === "government-schemes";
  const workflow = isScheme ? schemeWorkflowFor(spec) : null;
  if (isScheme) return schemeDocumentReason(document, spec, index);
  if (value.includes("form 16a")) return `Match the payer, gross receipt, and deducted tax with AIS, Form 26AS, and ${comparisonRecord} before claiming credit.`;
  if (value.includes("form 16")) return `${documentLabel} should support salary, perquisites, deductions, and employer TDS; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  if (value.includes("ais")) return `For ${spec.primaryKeyword}, read ${document} as a third-party reporting signal, then investigate unsupported items against ${comparisonRecord}.`;
  if (value.includes("26as")) return `${documentLabel} should confirm TDS, TCS, and tax payments claimed; compare a missing or incorrect credit with ${comparisonRecord}.`;
  if (/\b(?:tds|tcs)\b/.test(value)) return `Trace the credit to the payer record, related receipt, AIS, Form 26AS, and ${comparisonRecord} before claiming it.`;
  if (value.includes("gst")) return `${documentLabel} should reconcile turnover and tax with invoices, books, bank receipts, and ${comparisonRecord}.`;
  if (value.includes("bank")) {
    return isScheme
      ? `${documentLabel} should match the payment account and holder details; cross-check them with ${comparisonRecord}.`
      : `${documentLabel} should show receipt or payment dates and amounts; compare them with ${comparisonRecord}.`;
  }
  if (/(mobile|email|contact)/.test(value)) {
    return isScheme
      ? `Verify that the applicant controls the ${document} used for alerts, verification, and recovery; cross-check it with ${comparisonRecord}.`
      : `${documentLabel} preserves the contact trail used for notices, verification, or follow-up; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  }
  if (/(pan|aadhaar|kyc|identity)/.test(value)) {
    return isScheme
      ? `${documentLabel} should match the applicant name and identifier; correct an inaccurate issuing record before relying on ${comparisonRecord}.`
      : `${documentLabel} should match the taxpayer identity and profile details used in the filing working; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  }
  if (/(recognition|registration|certificate|licen[cs]e|category|caste|income proof|age proof|disability|medical)/.test(value)) {
    return isScheme
      ? `${documentLabel} should establish the applicant status or condition claimed; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`
      : `${documentLabel} should establish the amount, period, taxpayer fact, and issuer used in the working; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  }
  if (/(pitch|project report|project note|business plan|financial projection|estimate|quotation|vendor quote)/.test(value)) {
    return `${documentLabel} should explain the activity, cost, funding need, and expected outcome presented in the ${workflow?.noun ?? "application"}; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  }
  if (/(admission|student id|institution id|marksheet|education|academic)/.test(value)) {
    return `${documentLabel} should support the applicant's course, institution, academic status, or qualification; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  }
  if (/(resume|experience|skill|profile)/.test(value)) {
    return `${documentLabel} should support the experience, skills, and profile details presented; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  }
  if (/(nominee|family|guardian|dependent)/.test(value)) {
    return `${documentLabel} should support the family, guardian, dependant, or nominee details recorded; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  }
  if (/(land|crop|soil|farm|property|rent|loan|ownership|consumer|electricity|pump)/.test(value)) {
    if (value.includes("rent")) {
      return `${documentLabel} should show the property, rental period, parties, and payment; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
    }
    if (value.includes("loan")) {
      return `${documentLabel} should show the borrower, lender, interest period, and payment details; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
    }
    if (/(property|ownership)/.test(value)) {
      return `${documentLabel} should establish the ownership share, property details, and relevant period; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
    }
    return `${documentLabel} should establish the relevant ownership, use, location, payment, or eligibility fact; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  }
  if (/(broker|trade|capital gains|exchange|investment|amc)/.test(value)) return `${documentLabel} should establish transaction dates, values, charges, and the resulting gain, loss, or holding-period treatment; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  if (/(invoice|receipt|ledger|contract|statement|register|proof|record)/.test(value)) {
    return isScheme
      ? `${documentLabel} should support a stated application fact; retain its issuer or transaction details and compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`
      : `${documentLabel} should show the amount, date, counterparty, and activity used in the filing working; compare ${verbFor(document, "it", "them")} with ${comparisonRecord}.`;
  }
  return isScheme
    ? `${documentLabel} should support one stated application fact; resolve a difference with ${comparisonRecord} before submission.`
    : `${documentLabel} should support the decision to ${actionFromFocus(spec.focus)}; reconcile ${verbFor(document, "it", "them")} with ${comparisonRecord} before filing.`;
}

const relatedPostLabels: Record<string, string> = {
  "government-schemes-msme-startup-eligibility-document-checklist": "Government scheme eligibility and document checklist",
  "mye-ca-document-vault-guide": "MyeCA document vault guide",
  "mye-ca-complete-tax-filing-playbook": "MyeCA complete tax filing playbook",
};

function chooseForSpec<T>(spec: TopicSpec, values: T[]) {
  const seed = [...spec.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return values[seed % values.length];
}

function chooseForSpecWithSalt<T>(spec: TopicSpec, salt: string, values: T[]) {
  const saltOffset = [...salt].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const seed = (spec.variantIndex ?? [...spec.slug].reduce((sum, char) => sum + char.charCodeAt(0), 0)) + saltOffset;
  return values[seed % values.length];
}

function sourceCheckFor(spec: TopicSpec, sourceLabel: string, index: number) {
  const label = sourceLabel.toLowerCase();
  const indexedRecord = spec.documents[index % spec.documents.length];
  const nextRecord = spec.documents[(index + 1) % spec.documents.length];
  const record = /(annual information statement|\bais\b)/.test(label) && /\bais\b/i.test(indexedRecord)
    ? spec.documents.find((document) => !/\bais\b/i.test(document)) ?? indexedRecord
    : indexedRecord;
  const taxCreditRecord = spec.documents.find((document) => /(form 16a?|ais|26as|tds|tcs)/i.test(document));
  if (spec.categoryId === "government-schemes") {
    if (label.includes("myscheme")) {
      return chooseForSpecWithSalt(spec, `myscheme-source-${index}`, [
        `Use the listing to identify the department responsible for ${spec.schemeName}; confirm its accepted-record summary against ${spec.documents[2] ?? spec.documents[0]} and ${spec.documents[3] ?? spec.documents[1]}.`,
        `Check whether the listing still points ${spec.userType} to the current authority route, then compare its document summary with ${spec.documents[2] ?? spec.documents[0]}.`,
        `Treat this as the discovery route for ${spec.schemeName}: identify the department, current channel, and records that need confirmation on the scheme's own portal.`,
        `Confirm the administering authority for ${spec.schemeName} and its live department link before relying on the eligibility or document summary.`,
        `Use the listing to find the official application owner for ${spec.userType}, then verify the current process and accepted evidence on that authority's page.`,
        `Compare the discovery-page summary with ${spec.documents[2] ?? spec.documents[0]} and ${spec.documents[3] ?? spec.documents[1]}; let the linked department instructions control the submission.`,
        `Record the department link used by ${spec.userType}; reopen it before preparing the final ${spec.documents[0]} upload.`,
      ]);
    }
    return chooseForSpecWithSalt(spec, `scheme-source-${index}`, [
      `Confirm the current category for ${spec.userType}, accepted ${record}, application channel, and any live deadline; compare those instructions with ${nextRecord}.`,
      `Check what ${record} must show for ${spec.schemeName}, where the request is submitted, and whether ${nextRecord} creates a mismatch.`,
      `Use this authority page to verify the live route for ${spec.userType}; record the check date beside ${record} and ${nextRecord}.`,
      `Confirm whether the authority currently accepts ${record} for ${spec.schemeName} and note any portal, location, or timing restriction.`,
      `Read the current instructions before upload, then compare the required ${record} with ${nextRecord} in the ${spec.schemeName} file.`,
      `Verify the conditions, document format, submission route, and follow-up channel that apply to ${record} for ${spec.userType}.`,
      `Check the live instructions for ${record}; save the page title, URL, date checked, and any unresolved ${nextRecord} question.`,
      `Use this page to confirm the deciding authority and required evidence before ${spec.userType} rely on ${record}.`,
      `Compare the current portal instruction with ${record} and ${nextRecord}; resolve a material conflict before the ${spec.schemeName} request.`,
    ]);
  }
  if (/(utilities|return applicable|notified)/.test(label)) {
    return `Verify the notified form and schedules, then confirm how ${spec.documents[0]} and ${spec.documents[1]} map to them.`;
  }
  if (label.includes("income tax returns faqs")) {
    return `Review the filing FAQ when ${spec.documents[2] ?? spec.documents[0]} or ${spec.documents[3] ?? spec.documents[1]} do not fit the supported portal flow.`;
  }
  if (/(annual information statement|\bais\b)/.test(label)) {
    return `For ${spec.primaryKeyword}, compare reported entries with the transaction trail and investigate any omission, duplication, or classification difference.`;
  }
  if (/(tax credit|form 26as|mismatch)/.test(label)) {
    return taxCreditRecord
      ? `When ${spec.primaryKeyword} depends on credit shown in ${taxCreditRecord}, use the correction route for a missing or inaccurate entry; settle the filing treatment only after ${spec.documents[0]} and ${spec.documents[1]} agree.`
      : `For ${spec.primaryKeyword}, check whether TDS or TCS is reported in ${spec.documents[0]} and ${spec.documents[1]}, then review the correction route before claiming that credit.`;
  }
  if (label.includes("gst")) {
    return `Compare turnover, tax, invoices, and filed returns against ${spec.documents[0]} and ${spec.documents[1]} before relying on the reported amount.`;
  }
  if (label.includes("salaried individuals")) {
    return `Check the current salary-income and return instructions against ${spec.documents[0]} and ${spec.documents[1]} before choosing the filing treatment.`;
  }
  if (label.includes("e-verify")) {
    return `Confirm the current verification method and deadline, then retain the acknowledgement with ${spec.documents[0]} and ${spec.documents[3] ?? spec.documents[1]}.`;
  }
  return `Compare the proposed treatment for ${spec.primaryKeyword} with the current instructions before relying on it.`;
}

type SchemeWorkflow = {
  noun: string;
  action: string;
  completedRecord: string;
  decision: string;
};

function schemeRequestLabel(subject: string, workflow: SchemeWorkflow) {
  const lowerSubject = subject.toLowerCase();
  const lowerNoun = workflow.noun.toLowerCase();
  if (lowerSubject.endsWith(lowerNoun)) return subject;
  if (lowerNoun === "update request" && lowerSubject.includes("update")) return `${subject} request`;
  if (lowerNoun === "service request" && lowerSubject.includes("service")) return `${subject} request`;
  if (lowerNoun === "request" && /\b(?:registration|recognition|update)$/.test(lowerSubject)) return subject;
  return `${subject} ${workflow.noun}`;
}

function schemeWorkflowFor(spec: TopicSpec): SchemeWorkflow {
  const text = `${spec.slug} ${spec.title} ${spec.focus}`.toLowerCase();
  if (/(samadhaan|delayed payment|complaint)/.test(text)) {
    return {
      noun: "complaint",
      action: "file",
      completedRecord: "complaint acknowledgement",
      decision: "whether the delayed-payment transaction and supplier status are supported",
    };
  }
  if (/(scholarship|student checklist)/.test(text)) {
    return {
      noun: "application",
      action: "submit",
      completedRecord: "application acknowledgement",
      decision: "whether the student, institution, income, and academic conditions are supported",
    };
  }
  if (/(abha|health id)/.test(text)) {
    return {
      noun: "request",
      action: "submit",
      completedRecord: "request acknowledgement",
      decision: "whether the identity and health-record details used for the request are supported",
    };
  }
  if (/(claim|fasal bima|insurance)/.test(text)) {
    return {
      noun: "claim or coverage request",
      action: "submit",
      completedRecord: "claim or coverage acknowledgement",
      decision: "whether the event, coverage, applicant, and timing conditions are supported",
    };
  }
  if (/(account opening|jan dhan|ppf|sukanya|scss|nps account)/.test(text)) {
    return {
      noun: "account request",
      action: "submit",
      completedRecord: "account-opening acknowledgement",
      decision: "whether the account holder, eligibility conditions, and payment instructions are supported",
    };
  }
  if (/(loan|credit|funding|seed fund|pmegp|mudra|stand-up|cgtmse)/.test(text)) {
    return {
      noun: "finance application",
      action: "submit",
      completedRecord: "application acknowledgement",
      decision: "whether the applicant, activity, funding need, and supporting records satisfy the live route",
    };
  }
  if (/\bupdate\b/.test(text)) {
    return {
      noun: "update request",
      action: "submit",
      completedRecord: "request acknowledgement",
      decision: "whether the identity and requested change are supported",
    };
  }
  if (/\brecognition\b/.test(text)) {
    return {
      noun: "request",
      action: "submit",
      completedRecord: "request acknowledgement",
      decision: "whether the applicant status and recognition conditions are supported",
    };
  }
  if (/\bregistration\b/.test(text)) {
    return {
      noun: "request",
      action: "submit",
      completedRecord: "request acknowledgement",
      decision: "whether the identity, status, and registration details are supported",
    };
  }
  if (/(profile|card|certificate|digilocker|umang|gem seller)/.test(text)) {
    return {
      noun: "service request",
      action: "submit",
      completedRecord: "request acknowledgement",
      decision: "whether the identity, status, and requested service are supported",
    };
  }
  return {
    noun: "application",
    action: "submit",
    completedRecord: "application acknowledgement",
    decision: "whether the applicant and every material condition are supported",
  };
}

function recordKind(document: string) {
  const value = document.toLowerCase();
  if (/(pan|aadhaar|kyc|identity|passport|voter|name)/.test(value)) return "identity";
  if (/(mobile|email|contact)/.test(value)) return "contact";
  if (/(form 16|26as|tds|tcs|ais)/.test(value)) return "tax-credit";
  if (/(bank|passbook|credit proof|remittance)/.test(value)) return "bank";
  if (/(invoice|receipt|ledger|contract|statement|register|broker|trade|sale|purchase order|delivery proof)/.test(value)) return "transaction";
  if (/(certificate|registration|recognition|licen[cs]e|land|property|ownership|category|caste|income proof|age proof|marksheet)/.test(value)) return "status";
  return "supporting";
}

function retainedRecordLabel(document: string) {
  return recordKind(document) === "contact"
    ? `${document} used for alerts and verification`
    : document;
}

type TaxRecordStrategy = "identity" | "tax-credit" | "transaction" | "status" | "supporting";

function taxRecordStrategy(spec: TopicSpec): TaxRecordStrategy {
  const kinds = spec.documents.slice(0, 2).map(recordKind);
  const subjectText = `${spec.title} ${spec.primaryKeyword}`.toLowerCase();
  if (kinds.includes("identity")) return "identity";
  if (/\b(?:tds|tcs|tax credit)\b/.test(subjectText) && kinds.includes("tax-credit")) return "tax-credit";
  if (spec.categoryId === "tax-planning") return "status";
  if (
    ["capital-gains", "business-freelancers", "business-compliance"].includes(spec.categoryId)
    || kinds.includes("transaction")
    || kinds.includes("bank")
  ) {
    return "transaction";
  }
  if (kinds.includes("status")) return "status";
  return "supporting";
}

function taxDecisionFor(spec: TopicSpec) {
  const [firstDocument, secondDocument] = spec.documents;
  const strategy = taxRecordStrategy(spec);
  if (strategy === "identity") return `whether ${firstDocument} and ${secondDocument} identify the same taxpayer and period`;
  if (strategy === "tax-credit") return `which payer credit ${firstDocument} and ${secondDocument} support`;
  if (strategy === "transaction") {
    return `which amount, date, and income classification ${firstDocument} and ${secondDocument} support`;
  }
  if (strategy === "status") return `whether ${firstDocument} and ${secondDocument} support the claimed treatment`;
  return `which return treatment ${firstDocument} and ${secondDocument} support`;
}

function recordPurposeFor(document: string, spec: TopicSpec) {
  switch (recordKind(document)) {
    case "identity":
      return `confirm the taxpayer identity used by ${spec.userType}`;
    case "tax-credit":
      return `verify the payer, receipt, and credit reported for ${spec.userType}`;
    case "bank":
      return `trace the receipt and payment dates for ${spec.userType}`;
    case "transaction":
      return `reconcile the amount, date, counterparty, and classification for ${spec.userType}`;
    case "status":
      return `verify the status or condition claimed by ${spec.userType}`;
    default:
      return `resolve the open filing question for ${spec.userType}`;
  }
}

function schemeRecordPurposeFor(document: string) {
  const value = document.toLowerCase();
  if (/(resume|experience|skill|profile)/.test(value)) return "profile, skill, or experience details";
  if (/(nominee|family|guardian|dependent)/.test(value)) return "family, guardian, or nominee details";
  if (/(land|crop|soil|farm|pump)/.test(value)) return "land, crop, or activity details";
  if (/(trade|occupation|product|food business|business activity|activity proof)/.test(value)) {
    return "trade, occupation, or business-activity details";
  }
  if (/(policy|insurance|premium|loss record)/.test(value)) return "coverage, premium, event, or claim details";
  if (/(course|training|institution|admission|student|marksheet|education)/.test(value)) {
    return "education, institution, course, or training details";
  }
  if (/(ration|household|address proof)/.test(value)) return "household, residence, or address details";
  if (/(electricity|consumer|vendor|quote)/.test(value)) return "consumer, premises, vendor, or cost details";
  if (/(pitch|project|business plan|projection|estimate|quotation|vendor quote)/.test(value)) {
    return "activity, cost, or funding details";
  }
  switch (recordKind(document)) {
    case "identity":
      return "applicant identity";
    case "contact":
      return "verification and alert details";
    case "bank":
      return "payment-account details";
    case "transaction":
      return "transaction or activity details";
    case "status":
      return "eligibility status";
    default:
      return "the specific fact it contains";
  }
}

function taxMismatchGuidance(spec: TopicSpec) {
  const [firstDocument, secondDocument, thirdDocument = spec.documents[0], fourthDocument = spec.documents[1]] = spec.documents;
  const strategy = taxRecordStrategy(spec);
  if (strategy === "identity") {
    return `A different name or identifier in ${firstDocument} and ${secondDocument} is an identity problem, not a filing adjustment. Correct the inaccurate issuing record; use ${thirdDocument} only to ${recordPurposeFor(thirdDocument, spec)}, and retain the correction acknowledgement with ${retainedRecordLabel(fourthDocument)}.`;
  }
  if (strategy === "tax-credit") {
    return `Compare the payer and period in ${firstDocument} with the receipt and deduction in ${secondDocument}. A difference can change the credit claim; use ${thirdDocument} to identify it and retain ${fourthDocument} with the correction trail.`;
  }
  if (strategy === "transaction") {
    return chooseForSpecWithSalt(spec, "tax-transaction-mismatch", [
      `Trace a difference between ${firstDocument} and ${secondDocument} through ${thirdDocument}. Check dates, amounts, counterparties, charges, and classifications; preserve ${fourthDocument} with the chosen treatment.`,
      `${sentenceCase(firstDocument)} and ${secondDocument} may describe the same activity differently. Use ${thirdDocument} to identify the supported date, amount, counterparty, charges, and classification; retain ${fourthDocument} with that reconciliation.`,
      `When ${firstDocument} and ${secondDocument} conflict, rebuild the disputed item from ${thirdDocument}. ${sentenceCase(thirdDocument)} ${verbFor(thirdDocument, "establishes", "establish")} the amount and classification; keep ${fourthDocument} with the return working.`,
      `Do not choose a transaction treatment from ${firstDocument} alone. Compare it with ${secondDocument}, resolve the difference through ${thirdDocument}, and retain ${fourthDocument} with the recorded conclusion.`,
    ]);
  }
  if (strategy === "status") {
    return `For ${spec.userType}, resolve any conflict between the claim supported by ${firstDocument} and the condition shown by ${secondDocument}. Use ${thirdDocument} to test the disputed condition, then retain ${fourthDocument} with the chosen treatment.`;
  }
  return `Resolve a material difference between ${firstDocument} and ${secondDocument} before filing. Record the effect of ${thirdDocument} on ${taxDecisionFor(spec)}, then retain ${fourthDocument} with that working.`;
}

function schemeMismatchGuidance(spec: TopicSpec, workflow: SchemeWorkflow) {
  const subject = spec.schemeName ?? spec.primaryKeyword;
  const requestLabel = schemeRequestLabel(subject, workflow);
  const [firstDocument, secondDocument, thirdDocument = spec.documents[0], fourthDocument = spec.documents[1]] = spec.documents;
  const text = `${spec.slug} ${spec.focus}`.toLowerCase();
  if (/(samadhaan|delayed payment|complaint)/.test(text)) {
    return `Before filing a complaint through ${subject}, connect the invoice, purchase order, delivery or acceptance evidence, and payment history. Explain the difference between ${firstDocument} and ${secondDocument} with ${thirdDocument}; keep ${fourthDocument} and the complaint acknowledgement in that transaction file.`;
  }
  if (workflow.noun === "claim or coverage request") {
    return `For a ${subject} claim or coverage request, check whether ${firstDocument} and ${secondDocument} describe the same applicant, event, period, and account. Explain a material difference with ${thirdDocument}, and retain ${fourthDocument} with the ${workflow.completedRecord}.`;
  }
  if ([recordKind(firstDocument), recordKind(secondDocument)].every((kind) => kind === "identity")) {
    return `For ${subject}, compare the applicant name and identifier in ${firstDocument} with ${secondDocument}. Correct the inaccurate issuing record through its own channel; use ${thirdDocument} only for ${schemeRecordPurposeFor(thirdDocument)}. Retain ${retainedRecordLabel(fourthDocument)} with the ${workflow.completedRecord}.`;
  }
  return chooseForSpecWithSalt(spec, "scheme-mismatch-guidance", [
    `Before the ${requestLabel}, confirm ${firstDocument} ${verbFor(firstDocument, "supports", "support")} ${schemeRecordPurposeFor(firstDocument)}. ${sentenceCase(secondDocument)} must separately support ${schemeRecordPurposeFor(secondDocument)}; keep ${retainedRecordLabel(fourthDocument)} with the ${workflow.completedRecord}.`,
    `When ${firstDocument} and ${secondDocument} point to different applicant facts, identify which authority owns the inaccurate record. Correct or clarify that record before using ${thirdDocument} in the ${workflow.noun}.`,
    `Do not use ${secondDocument} to fill a gap that only ${firstDocument} can answer. Resolve the difference, record what ${thirdDocument} proves, and retain ${retainedRecordLabel(fourthDocument)}.`,
    `A conflict between ${firstDocument} and ${secondDocument} can change the application route or outcome. Ask the issuing authority for clarification and keep the response beside ${thirdDocument}.`,
    `Check whether ${firstDocument} and ${secondDocument} describe the same applicant, period, and activity. If not, pause the ${workflow.noun}; use ${thirdDocument} only for ${schemeRecordPurposeFor(thirdDocument)}.`,
    `Where ${firstDocument} is incomplete, do not infer the missing answer from ${secondDocument}. Obtain an accepted record or written clarification, then preserve ${retainedRecordLabel(fourthDocument)}.`,
    `Separate the question answered by ${firstDocument} from the one answered by ${secondDocument}. Resolve a material inconsistency before uploading ${thirdDocument}.`,
    `Reconcile the applicant detail in ${firstDocument} with ${secondDocument}. If the records still disagree, retain written authority guidance with ${thirdDocument} and the eventual ${workflow.completedRecord}.`,
    `The ${requestLabel} should not contain a fact that neither ${firstDocument} nor ${secondDocument} supports. Correct the source record or obtain an accepted alternative for ${thirdDocument} before submission.`,
    `If ${thirdDocument} exposes a difference between ${firstDocument} and ${secondDocument}, document the issue and responsible issuing authority. Submit only after the evidence supports one answer.`,
    `Review ${firstDocument}, ${secondDocument}, and ${thirdDocument} as separate evidence. Resolve any contradiction that affects ${workflow.decision} before retaining ${fourthDocument} with the final file.`,
  ]);
}

function taxWorkedCheck(spec: TopicSpec) {
  const [firstDocument, secondDocument, thirdDocument = spec.documents[0], fourthDocument = spec.documents[1]] = spec.documents;
  const strategy = taxRecordStrategy(spec);
  if (strategy === "identity") {
    return `If ${firstDocument} ${verbFor(firstDocument, "identifies", "identify")} the taxpayer differently from ${secondDocument}, decide which issuing record is inaccurate. Correct it before filing; use ${thirdDocument} only to ${recordPurposeFor(thirdDocument, spec)}, and retain the acknowledgement with ${retainedRecordLabel(fourthDocument)}.`;
  }
  if (strategy === "tax-credit") {
    return `${sentenceCase(firstDocument)} and ${secondDocument} may agree on a receipt while showing different credit. Identify the relevant payer and deduction in ${thirdDocument}; claim the credit only after retaining ${fourthDocument} with its correction trail.`;
  }
  if (strategy === "status") {
    return `If ${firstDocument} supports a claim that ${secondDocument} ${verbFor(secondDocument, "does", "do")} not, use ${thirdDocument} to identify the unsupported condition. Retain ${fourthDocument} with the reason for the chosen treatment.`;
  }
  return chooseForSpecWithSalt(spec, "tax-transaction-example", [
    `If ${firstDocument} and ${secondDocument} describe one item differently, use ${thirdDocument} to trace its date, amount, and classification. Retain ${fourthDocument} beside the reconciliation.`,
    `Compare a disputed ${firstDocument} item with ${secondDocument}, then use ${thirdDocument} to settle its amount and classification. Keep ${fourthDocument} with the recorded conclusion.`,
    `Where ${firstDocument} and ${secondDocument} do not reconcile, identify the matching entry in ${thirdDocument}. Record the reason for its treatment and retain ${fourthDocument}.`,
    `Rebuild the item from ${firstDocument}, ${secondDocument}, and ${thirdDocument} before classifying it. Preserve ${fourthDocument} with the final reconciliation.`,
  ]);
}

function taxDecisionNarrative(spec: TopicSpec) {
  const [firstDocument, secondDocument, thirdDocument = spec.documents[0], fourthDocument = spec.documents[1]] = spec.documents;
  const strategy = taxRecordStrategy(spec);

  if (strategy === "identity") {
    return `First confirm that ${firstDocument} and ${secondDocument} identify the same taxpayer and period. After that identity check, use ${thirdDocument} to ${recordPurposeFor(thirdDocument, spec)} and retain ${fourthDocument} with the computation.`;
  }
  if (strategy === "tax-credit") {
    return `Compare the payer and gross receipt in ${firstDocument} with the period and credit shown by ${secondDocument}. Use ${thirdDocument} to resolve the conflict, and claim only the credit supported by those records.`;
  }
  if (strategy === "transaction") {
    return chooseForSpecWithSalt(spec, "tax-transaction-decision", [
      `Rebuild the relevant transactions from ${firstDocument} and ${secondDocument}. Use ${thirdDocument} to settle disagreements before choosing the form and classification.`,
      `${sentenceCase(firstDocument)} and ${secondDocument} should explain the transaction total. Treat ${thirdDocument} as the cross-check for dates, amounts, counterparties, and classifications.`,
      `Start the transaction working with ${firstDocument} and ${secondDocument}. A difference shown by ${thirdDocument} must be resolved before selecting a form or schedule.`,
      `The return should follow transactions supported by ${firstDocument} and ${secondDocument}. Check ${thirdDocument} for ${spec.userType} before deciding the amount and income classification.`,
    ]);
  }
  if (strategy === "status") {
    return `${sentenceCase(firstDocument)} should establish the claimed amount or status, while ${secondDocument} ${verbFor(secondDocument, "tests", "test")} a separate condition. Before deciding the return treatment, check ${thirdDocument} for a conflicting taxpayer fact.`;
  }
  return `Read ${firstDocument} and ${secondDocument} against the decision about ${taxDecisionFor(spec)}. Record how ${thirdDocument} changes the treatment, and keep ${fourthDocument} with the final computation.`;
}

function schemeWorkedCheck(spec: TopicSpec, workflow: SchemeWorkflow) {
  const subject = spec.schemeName ?? spec.primaryKeyword;
  const [firstDocument, secondDocument, thirdDocument = spec.documents[0], fourthDocument = spec.documents[1]] = spec.documents;
  if ([recordKind(firstDocument), recordKind(secondDocument)].every((kind) => kind === "identity")) {
    return `Worked check for ${subject}: when ${firstDocument} and ${secondDocument} identify the applicant differently, correct the inaccurate issuing record first. Use ${thirdDocument} only for ${schemeRecordPurposeFor(thirdDocument)}; retain ${retainedRecordLabel(fourthDocument)} with the ${workflow.completedRecord}.`;
  }
  return chooseForSpecWithSalt(spec, "scheme-worked-check", [
    `Worked check for ${subject}: if the live route asks for a fact absent from ${firstDocument} and ${secondDocument}, identify an accepted record before you ${workflow.action}. Use ${thirdDocument} only for ${schemeRecordPurposeFor(thirdDocument)}; retain ${retainedRecordLabel(fourthDocument)} with the ${workflow.completedRecord}.`,
    `Before submitting the ${schemeRequestLabel(subject, workflow)}, test whether ${firstDocument} and ${secondDocument} cover the required facts. If ${thirdDocument} still ${verbFor(thirdDocument, "leaves", "leave")} an answer unsupported, identify an accepted record and keep ${retainedRecordLabel(fourthDocument)} with the ${workflow.completedRecord}.`,
    `A material fact missing from ${firstDocument} and ${secondDocument} should pause the ${workflow.noun}. Confirm an accepted record, use ${thirdDocument} only for ${schemeRecordPurposeFor(thirdDocument)}, and retain ${retainedRecordLabel(fourthDocument)}.`,
    `When ${firstDocument} and ${secondDocument} do not answer the live ${workflow.noun} question, do not infer the answer. Use an accepted record, preserve ${thirdDocument} for ${schemeRecordPurposeFor(thirdDocument)}, and keep ${retainedRecordLabel(fourthDocument)} with the ${workflow.completedRecord}.`,
    `Suppose ${firstDocument} supports the applicant detail but ${secondDocument} shows a different period or status. Pause, verify the current authority instruction, and keep ${thirdDocument} out of the upload until the conflict is resolved.`,
    `If ${thirdDocument} is current but ${firstDocument} is not, identify whether the older record must be corrected or replaced. Retain ${fourthDocument} and the authority response with the final submission.`,
    `A complete upload set containing ${firstDocument} and ${secondDocument} is not automatically a consistent one. Explain the difference shown by ${thirdDocument}, and save ${fourthDocument} with the result.`,
    `When the portal accepts ${firstDocument} but the applicant's ${secondDocument} contains a conflicting fact, use the authority's correction channel before completing the ${workflow.noun}.`,
    `Test the application answer against ${firstDocument}, ${secondDocument}, and ${thirdDocument}. If ${thirdDocument} ${verbFor(thirdDocument, "supports", "support")} a different applicant fact, preserve the issue and request clarification before submission.`,
    `Before the final upload of ${fourthDocument}, ask which single record establishes the disputed fact. Use that answer to correct the ${workflow.noun}, then retain ${fourthDocument} with the ${workflow.completedRecord}.`,
    `If the live instructions require a fact not shown by ${firstDocument} or ${secondDocument}, obtain the accepted evidence instead of substituting ${thirdDocument}. Keep ${fourthDocument} in the follow-up file.`,
  ]);
}

function sourceAwareBodyFor(spec: TopicSpec) {
  const tool = toolLinkFor(spec);
  const sourceLinks = sourceLinksFor(spec);
  const sourceRows = sourceLinks
    .map((source, index) => `| [${source.label}](${source.url}) | ${sourceCheckFor(spec, source.label, index)} |`)
    .join("\n");
  const relatedRows = [
    ...spec.relatedPostIds
      .slice(0, 2)
      .map((slug) => `- [${relatedPostLabels[slug] ?? toTitleCase(slug.replace(/-/g, " "))}](/blog/${slug})`),
    `- [${tool.label}](${tool.href})`,
    `- [Review unresolved ${subject} records](${spec.ctaHref})`,
  ].join("\n");
  const documentRows = spec.documents
    .map((document, index) => `| ${document} | ${documentReason(document, spec, index)} |`)
    .join("\n");
  const isScheme = spec.categoryId === "government-schemes";
  const subject = spec.schemeName ?? spec.userType;
  const submissionLabel = isScheme ? `${subject} application` : `return for ${subject}`;
  const primarySource = isScheme ? sourceLinks[1] ?? sourceLinks[0] : sourceLinks[0];
  const firstSource = primarySource?.label ?? "the relevant official portal";
  const [firstDocument, secondDocument, thirdDocument, fourthDocument] = spec.documents;
  const focusAction = actionFromFocus(spec.focus);
  const focusActionSentence = sentenceCase(focusAction);
  const firstDocumentSentence = sentenceCase(firstDocument);
  const audienceAtSentenceStart = `${spec.userType.charAt(0).toUpperCase()}${spec.userType.slice(1)}`;
  const subjectAtSentenceStart = /^(?:eShram|myScheme)\b/.test(subject) ? subject : sentenceCase(subject);
  const keywordAtSentenceStart = sentenceCase(spec.primaryKeyword);
  const opening = isScheme
    ? chooseForSpec(spec, [
        `${subjectAtSentenceStart} is an eligibility decision before it is an online application. ${audienceAtSentenceStart} should ${focusAction}, then confirm that ${firstDocument} and ${secondDocument} describe the same applicant.`,
        `${audienceAtSentenceStart} considering ${subject} should compare the live eligibility rule with their own records. Start with ${firstDocument} and ${secondDocument}, then ${focusAction}; approval, benefit amount, and processing time remain with the scheme authority.`,
        `A completed ${subject} form does not by itself prove eligibility. ${audienceAtSentenceStart} should ${focusAction} and resolve any material difference between ${firstDocument} and ${secondDocument} before submission.`,
        `A reliable ${subject} application begins before data entry. ${audienceAtSentenceStart} should ${focusAction} and keep the records used for each eligibility answer.`,
      ])
    : chooseForSpec(spec, [
        `${keywordAtSentenceStart} cannot be settled from portal prefill alone. ${audienceAtSentenceStart} should ${focusAction}, using ${firstDocument}, ${secondDocument}, and the AY 2026-27 instructions.`,
        `${audienceAtSentenceStart} should be able to trace each reported amount before choosing the return treatment for ${spec.primaryKeyword}. Begin with ${firstDocument} and ${secondDocument}, then ${focusAction}.`,
        `The filing answer for ${spec.primaryKeyword} follows the underlying records. Compare ${firstDocument} with ${secondDocument}, ${focusAction}, and retain the working used for the final return.`,
        `For ${spec.userType}, the practical risk is reporting a plausible figure that cannot be reconstructed later. This guide uses ${firstDocument}, ${secondDocument}, and current instructions to ${focusAction}.`,
      ]);
  const decisionHeading = sentenceCase(spec.focus);
  const evidenceHeading = `${subjectAtSentenceStart} evidence: ${firstDocument} and ${secondDocument}`;
  const mismatchHeading = `${subjectAtSentenceStart} mismatch: ${secondDocument} versus ${firstDocument}`;
  const riskHeading = `${subjectAtSentenceStart} pause points: ${thirdDocument ?? firstDocument}`;
  const exampleHeading = `${subjectAtSentenceStart} example: reconcile ${firstDocument} and ${secondDocument}`;
  const sourceHeading = `${subjectAtSentenceStart}: official guidance to check`;
  const nextHeading = `${subjectAtSentenceStart} submission: from ${firstDocument} to the ${isScheme ? "application" : "return"}`;
  const archiveHeading = `${subjectAtSentenceStart} file: retain ${fourthDocument ?? secondDocument}`;
  const reviewQuestions = isScheme
    ? [
        `${subjectAtSentenceStart} applicant category: does the live authority page include it?`,
        `${subjectAtSentenceStart} identity: do ${firstDocument} and ${secondDocument} describe the same applicant?`,
        `${subjectAtSentenceStart} eligibility: which fact is established by ${thirdDocument ?? firstDocument}?`,
        `${subjectAtSentenceStart} submission: what remains unverified after checking ${fourthDocument ?? secondDocument}?`,
      ]
    : [
        `${subjectAtSentenceStart} starting evidence: which fact or amount comes from ${firstDocument}?`,
        `${subjectAtSentenceStart} cross-check: which amount or period is confirmed by ${secondDocument}?`,
        `${subjectAtSentenceStart} difference: which discrepancy is explained by ${thirdDocument ?? firstDocument}?`,
        `${subjectAtSentenceStart} filing record: what reported treatment can be reconstructed from ${fourthDocument ?? secondDocument}?`,
      ];
  const decisionBody = isScheme
    ? chooseForSpecWithSalt(spec, "decision-body", [
        `${firstDocumentSentence} and ${secondDocument} should identify the same applicant before any portal entry. Check [${firstSource}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}) for the current applicant category and accepted evidence, then use ${thirdDocument ?? firstDocument} and ${fourthDocument ?? secondDocument} to support the remaining answers.`,
        `Open [${firstSource}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}) and locate the live eligibility and document conditions for ${subject}. Compare those conditions with ${firstDocument}, ${secondDocument}, ${thirdDocument ?? firstDocument}, and ${fourthDocument ?? secondDocument}; correct inconsistent details before applying.`,
        `${subject} should follow the evidence, not the shortest portal path. Match ${firstDocument} with ${secondDocument}, confirm the current route on [${firstSource}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}), and keep support for every material ${subject} eligibility answer.`,
        `Use [${firstSource}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}) to confirm who may apply and what the authority currently accepts for ${subject}. Then test the ${subject} applicant's details against ${firstDocument}, ${secondDocument}, ${thirdDocument ?? firstDocument}, and ${fourthDocument ?? secondDocument}.`,
        `Before applying for ${subject}, write down the eligibility facts that need proof. ${firstDocumentSentence} should establish the applicant identity, while ${secondDocument}, ${thirdDocument ?? firstDocument}, and ${fourthDocument ?? secondDocument} should support the remaining status and outcome details.`,
        `Treat ${subject} as an evidence check before it becomes a portal task. Verify the live ${subject} route on [${firstSource}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}), then resolve any disagreement among ${firstDocument}, ${secondDocument}, ${thirdDocument ?? firstDocument}, and ${fourthDocument ?? secondDocument}.`,
      ])
    : chooseForSpecWithSalt(spec, "decision-body", [
        `${firstDocumentSentence} and ${secondDocument} establish the starting figures for the return. Use those records for ${subject} to choose the income head, credit, deduction, disclosure, and schedule, then explain any difference shown by ${thirdDocument ?? firstDocument} in the working kept with ${fourthDocument ?? secondDocument}.`,
        `Begin with the ${subject} treatment supported by ${firstDocument} and ${secondDocument}, not the portal prefill. ${focusActionSentence}. Record why ${thirdDocument ?? firstDocument} changes or confirms the filing answer and retain ${fourthDocument ?? secondDocument} with the computation.`,
        `The return position for ${subject} should be reconstructable from ${firstDocument}, ${secondDocument}, and ${thirdDocument ?? firstDocument}. Use those records to ${focusAction}, select the relevant form and schedules, and keep ${fourthDocument ?? secondDocument} beside the final computation.`,
        `Map each material figure for ${subject} to ${firstDocument} or ${secondDocument} before choosing a form. Where ${thirdDocument ?? firstDocument} shows a different amount or classification, resolve it and note how ${fourthDocument ?? secondDocument} supports the final treatment.`,
        `${audienceAtSentenceStart} should decide the reporting treatment from source records rather than a plausible prefilled number. Compare ${firstDocument} with ${secondDocument}, ${focusAction}, and retain the explanation for any difference involving ${thirdDocument ?? firstDocument}.`,
        `Use the evidence trail for ${subject} to decide what belongs in the return. ${firstDocumentSentence}, ${secondDocument}, and ${thirdDocument ?? firstDocument} should support the selected form, schedules, credits, and disclosures; ${fourthDocument ?? secondDocument} should help reconstruct the filing answer later.`,
      ]);
  const mismatchBody = isScheme
    ? chooseForSpecWithSalt(spec, "mismatch-body", [
        `${firstDocumentSentence} may support the application while ${secondDocument} shows a different name, date, amount, or status. Use ${thirdDocument ?? firstDocument} to establish the correct fact, update the inconsistent record, and retain the correction acknowledgement before continuing with ${subject}.`,
        `A mismatch in the ${subject} records can make a valid applicant look ineligible or route the application incorrectly. Confirm the material ${subject} fact with ${thirdDocument ?? firstDocument}, correct the affected record, and keep proof of the change.`,
        `${subjectAtSentenceStart} applicants should not choose the closest-looking portal answer when ${firstDocument} and ${secondDocument} conflict. Trace the ${subject} difference through ${thirdDocument ?? firstDocument}, correct it at the responsible source, and keep the revised ${secondDocument} with the acknowledgement.`,
        `When the details in ${secondDocument} do not agree with ${firstDocument}, determine whether the cause is an outdated record, entry error, or genuinely different status. Use ${thirdDocument ?? firstDocument} to support the correction before ${subject} data entry resumes.`,
      ])
    : chooseForSpecWithSalt(spec, "mismatch-body", [
        `Different amounts or classifications in ${firstDocument} and ${secondDocument} need an explanation before filing. Use ${thirdDocument ?? firstDocument} to separate timing differences from omissions or reporting errors, then retain ${fourthDocument ?? secondDocument} with the reconciliation note.`,
        `When ${firstDocument} and ${secondDocument} do not agree, trace the transaction or fact through ${thirdDocument ?? firstDocument}. The working for ${subject} should state whether timing, omission, classification, or tax treatment caused the gap and how ${fourthDocument ?? secondDocument} supports the result.`,
        `${subjectAtSentenceStart} mismatches are not resolved by copying the larger or prefilled amount. Compare ${firstDocument}, ${secondDocument}, and ${thirdDocument ?? firstDocument}, document the cause of the difference, and keep ${fourthDocument ?? secondDocument} with the final position.`,
        `Use ${thirdDocument ?? firstDocument} to investigate why ${firstDocument} and ${secondDocument} differ for ${subject}. Correct the source data for ${subject} where possible; otherwise, document the supported treatment and retain ${fourthDocument ?? secondDocument} for later verification.`,
      ]);
  const riskBody = isScheme
    ? chooseForSpecWithSalt(spec, "risk-body", [
        `Do not proceed with ${subject} until ${firstDocument} and ${secondDocument} agree on the applicant details that affect eligibility. If ${subject} identity, status, or benefit facts remain inconsistent, obtain clarification from the scheme administrator and retain the response with the eventual outcome records.`,
        `Stop the ${subject} application before submission when ${firstDocument}, ${secondDocument}, or ${thirdDocument ?? firstDocument} leaves a material eligibility answer unresolved. The ${subject} authority controls approval and processing time, so keep its clarification and every later sanction, receipt, or payment record.`,
        `An unresolved ${subject} difference involving ${thirdDocument ?? firstDocument} can lead to rejection, delay, or an incorrect benefit record. ${subjectAtSentenceStart} needs the source corrected or authority guidance before continuing; retain ${fourthDocument ?? secondDocument} only for the fact it actually proves.`,
        `Proceed with ${subject} only when the applicant facts can be supported without guessing. Where ${firstDocument} and ${secondDocument} still conflict, preserve the open issue, correction request, and authority response with the completed ${subject} file.`,
      ])
    : chooseForSpecWithSalt(spec, "risk-body", [
        `${firstDocumentSentence} and ${secondDocument} need further work when the selected form cannot report the item, a credit remains uncorrected, or the supporting evidence remains uncertain after checking ${thirdDocument ?? firstDocument}. Preserve the unresolved issue and supporting ${fourthDocument ?? secondDocument} before filing.`,
        `An unresolved item for ${subject} should not be forced into a simpler form while ${firstDocument}, ${secondDocument}, and ${thirdDocument ?? firstDocument} still conflict. Recheck the ${subject} treatment, correction route, or disclosure requirement and retain ${fourthDocument ?? secondDocument} with the conclusion.`,
        `The filing decision for ${subject} remains unsafe when a material credit, classification, or disclosure cannot be reconstructed from ${firstDocument} and ${secondDocument}. Resolve the open point or obtain document-based review before relying on ${fourthDocument ?? secondDocument}.`,
        `Pause the ${subject} filing when source records support more than one plausible treatment or the selected form lacks the required schedule. Document the unresolved ${subject} fact, current rule checked, and role of ${fourthDocument ?? secondDocument} in the eventual answer.`,
      ]);
  const exampleBody = isScheme
    ? chooseForSpecWithSalt(spec, "example-body", [
        `Example: ${firstDocument} may carry the current applicant detail while ${secondDocument} still shows an older value. For ${subject}, correct the outdated record through its issuing authority, use ${thirdDocument ?? firstDocument} only if it establishes the disputed fact, and retain the acknowledgement with ${fourthDocument ?? secondDocument} before continuing.`,
        `A ${subject} applicant may satisfy the live rule but still face a portal mismatch because ${firstDocument} and ${secondDocument} describe the applicant differently. The ${subject} next step is to correct the issuing record and keep ${thirdDocument ?? firstDocument} with the correction receipt, not to select the closest portal option.`,
        `Suppose the ${subject} answer appears in ${firstDocument} but not in ${secondDocument}. Pause the ${subject} application, identify which record is authoritative for that fact, obtain the correction or clarification, and keep ${fourthDocument ?? secondDocument} with the submission file.`,
        `${subjectAtSentenceStart} can fail at verification even when the applicant appears eligible. If ${firstDocument} and ${secondDocument} conflict, use ${thirdDocument ?? firstDocument} to establish the correct fact and preserve the authority response before submission.`,
      ])
    : chooseForSpecWithSalt(spec, "example-body", [
        `Example: ${firstDocument} may show one amount while ${secondDocument} shows another because of timing, classification, or a reporting omission. Use ${thirdDocument ?? firstDocument} to identify the cause, show the supported answer in the computation, and retain ${fourthDocument ?? secondDocument} with the return for ${subject}.`,
        `The working for ${subject} can contain two plausible figures when ${firstDocument} and ${secondDocument} cover different dates or report the transaction differently. Reconcile the difference through ${thirdDocument ?? firstDocument}; do not choose the larger or prefilled figure merely because it appears on the portal.`,
        `Suppose the reported treatment appears in ${firstDocument} but not in ${secondDocument}. Trace the item through ${thirdDocument ?? firstDocument}, document whether the difference is timing, omission, credit, or classification, and keep ${fourthDocument ?? secondDocument} beside the final computation.`,
        `${subjectAtSentenceStart} may require a different form or schedule when ${firstDocument} and ${secondDocument} do not tell the same story. Use ${thirdDocument ?? firstDocument} to settle the treatment before filing, then preserve ${fourthDocument ?? secondDocument} with the explanation.`,
      ]);
  const nextActionBody = isScheme
    ? chooseForSpecWithSalt(spec, "next-body", [
        `${firstDocumentSentence}, ${secondDocument}, and ${thirdDocument ?? firstDocument} should now support one consistent ${subject} applicant record. Confirm the live ${subject} submission channel on ${firstSource}, enter only the verified details, and preserve proof of the application and any later outcome.`,
        `Once the ${subject} mismatch is resolved, return to ${firstSource} and confirm that the application channel and document list are still current. Submit the supported ${subject} facts, then retain the acknowledgement with ${fourthDocument ?? secondDocument}.`,
        `Use the corrected ${subject} records for the live application rather than an older saved form. For ${subject}, record the submitted values and archive the acknowledgement with ${firstDocument} and ${secondDocument}.`,
        `${subjectAtSentenceStart} needs a supported application, not merely a completed form. Recheck ${firstSource}, use the reconciled applicant details for ${subject}, and save the submission evidence and authority response.`,
      ])
    : chooseForSpecWithSalt(spec, "next-body", [
        `${firstDocumentSentence}, ${secondDocument}, and ${thirdDocument ?? firstDocument} should now support the same reporting position for ${subject}. ${subjectAtSentenceStart} should use the return form and schedules that fit the evidence, retain ${fourthDocument ?? secondDocument}, and obtain review if a material treatment or disclosure remains uncertain.`,
        `Use the reconciled figures for ${subject} to choose the return form and schedules. Keep the working that connects ${firstDocument}, ${secondDocument}, ${thirdDocument ?? firstDocument}, and ${fourthDocument ?? secondDocument}; seek review before filing if the evidence trail still leaves a material question open.`,
        `Filing for ${subject} can move forward once the records support one reporting treatment. Carry the reconciled answer for ${subject} into the correct schedule, preserve ${fourthDocument ?? secondDocument}, and document any assumption that still depends on clarification.`,
        `Finish the return for ${subject} from resolved evidence rather than restarting from portal prefill. ${subjectAtSentenceStart} should use the applicable return form, map the answer to the correct schedule, and retain the working and ${fourthDocument ?? secondDocument} for later verification.`,
      ]);
  const finalChecks = [
    `${isScheme ? `Before submitting ${subject}` : `Before filing the return for ${subject}`}, reopen ${firstSource} and note the instruction date used.`,
    `Resolve the ${subject} difference between ${firstDocument} and ${secondDocument}, or preserve the authority's written clarification.`,
    `Store ${thirdDocument ?? firstDocument} with ${fourthDocument ?? secondDocument}, the submitted ${submissionLabel}, and the acknowledgement.`,
  ];
  const completionNote = isScheme
    ? chooseForSpecWithSalt(spec, "completion-note", [
        `Keep the ${subject} acknowledgement with ${firstDocument}, ${secondDocument}, and the authority page used for the application so the submitted facts can be checked later.`,
        `Before closing the ${subject} file, confirm that the final acknowledgement, current authority instructions, and the records behind every material answer are stored together.`,
        `A later ${subject} follow-up should be answerable from the acknowledgement, ${firstDocument}, ${secondDocument}, and the authority response without reconstructing the application from memory.`,
        `The completed ${subject} record should show what was submitted, which source was checked, and how ${firstDocument} and ${secondDocument} support the answers that determine eligibility.`,
      ])
    : chooseForSpecWithSalt(spec, "completion-note", [
        `Keep the computation for ${subject} with ${firstDocument}, ${secondDocument}, the current instructions, and the final acknowledgement so the reported treatment can be reconstructed later.`,
        `Before filing for ${subject}, confirm that the return working, source records, current rule checked, and final form tell one consistent story.`,
        `Reviewing the return for ${subject} later should be possible from ${firstDocument}, ${secondDocument}, ${fourthDocument ?? thirdDocument ?? firstDocument}, and the saved computation without relying on memory.`,
        `Close the working file for ${subject} only after the reported answer, supporting records, current instructions, and final acknowledgement agree.`,
      ]);

  return `# ${spec.title}

${opening}

## ${decisionHeading}

${decisionBody}

${reviewQuestions.map((question, index) => `${index + 1}. ${question}`).join("\n")}

## ${evidenceHeading}

| Document | Why it matters |
| --- | --- |
${documentRows}

## ${mismatchHeading}

${mismatchBody}

## ${riskHeading}

${riskBody}

## ${exampleHeading}

${exampleBody}

## ${sourceHeading}

| Official reference | What to verify |
| --- | --- |
${sourceRows}

## ${nextHeading}

${nextActionBody}

${relatedRows}

${completionNote}

## ${archiveHeading}

${finalChecks.map((check) => `- ${check}`).join("\n")}`;
}

function legacyTemplateBodyFor(spec: TopicSpec) {
  const isScheme = spec.categoryId === "government-schemes";
  const subject = spec.schemeName ?? spec.userType;
  const subjectLabel = sentenceCase(subject);
  const [firstDocument, secondDocument, thirdDocument, fourthDocument] = spec.documents;
  const thirdRecord = thirdDocument ?? firstDocument;
  const fourthRecord = fourthDocument ?? secondDocument;
  const focusAction = actionFromFocus(spec.focus);
  const sourceLinks = sourceLinksFor(spec);
  const primarySource = isScheme ? sourceLinks[1] ?? sourceLinks[0] : sourceLinks[0];
  const tool = toolLinkFor(spec);
  const documentRows = spec.documents.map((document, index) => {
    const nextRecord = spec.documents[(index + 1) % spec.documents.length];
    const reason = documentReason(document, spec, index);
    return `| ${document} | ${reason} For ${subject}, compare it with ${nextRecord} before relying on the answer. |`;
  }).join("\n");
  const sourceRows = sourceLinks.map((source, index) => {
    const check = isScheme
      ? index === 0
        ? `Use this directory to locate the current ${subject} listing, then confirm the final conditions on ${primarySource?.label ?? source.label}.`
        : `Confirm the applicant group, accepted records, submission channel, and any current deadline for ${subject}.`
      : sourceCheckFor(spec, source.label, index);
    return `| [${source.label}](${source.url}) | ${check} |`;
  }).join("\n");
  const relatedRows = [
    ...spec.relatedPostIds
      .slice(0, 2)
      .map((slug) => `- [${relatedPostLabels[slug] ?? toTitleCase(slug.replace(/-/g, " "))}](/blog/${slug})`),
    `- [${tool.label}](${tool.href})`,
    `- [${isScheme ? "Review documents before applying" : "Review unresolved filing facts"}](${spec.ctaHref})`,
  ].join("\n");

  const opening = isScheme
    ? `${subjectLabel} applicants should begin with the live scheme conditions, not a saved form or an old eligibility summary. ${subjectLabel} applicants need to ${focusAction}. Before ${subject} details are submitted, ${firstDocument} and ${secondDocument} should identify the same applicant.`
    : `${subjectLabel} filings should begin with the records that explain the income, credit, deduction, or disclosure involved. For ${subject}, the immediate task is to ${focusAction}. Before selecting the ${subject} form or schedule, start with ${firstDocument} and ${secondDocument}, then use ${thirdRecord} to explain any difference.`;

  const decisionParagraph = isScheme
    ? `${subjectLabel} applicants should open [${primarySource?.label ?? "the scheme's official portal"}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}) and read the current applicant category, document list, and submission route. For ${subject}, check whether ${firstDocument} establishes identity or status, whether ${secondDocument} supports the same details, and whether ${thirdRecord} and ${fourthRecord} answer the remaining application questions. The ${subject} acknowledgement proves submission; it does not prove approval or continuing eligibility.`
    : `A ${subject} filing requires every material fact to be mapped to a record before the return is opened. For ${subject}, ${firstDocument} should establish the starting figure or taxpayer fact, while ${secondDocument} should confirm or challenge it. The ${subject} working should use ${thirdRecord} to explain a tax-credit, timing, classification, or disclosure difference and keep ${fourthRecord} with the computation. The form selected for ${subject} must contain every schedule needed for that treatment.`;

  const mismatchParagraph = isScheme
    ? `If ${firstDocument} and ${secondDocument} show different names, dates, amounts, ownership details, or status, identify which issuing record needs correction before applying for ${subject}. For ${subject}, use ${thirdRecord} only for the fact it actually proves. Keep the ${subject} correction receipt or authority response with ${fourthRecord}; do not replace a missing answer with the closest portal option.`
    : `${subjectLabel} records need a transaction-level explanation when ${firstDocument} and ${secondDocument} disagree. Trace the ${subject} difference through ${thirdRecord}; identify whether it is caused by timing, omission, duplication, reporting treatment, or an incorrect tax credit. Record the ${subject} conclusion in the computation kept with ${fourthRecord}; a larger or prefilled portal amount is not evidence by itself.`;

  const scenarioParagraph = isScheme
    ? `${subjectLabel} may need to pause when the detail in ${firstDocument} differs from ${secondDocument}. The ${subject} applicant should update the inconsistent record through its issuing channel, then use ${thirdRecord} to confirm the corrected detail. Resume the ${subject} application only after the correction acknowledgement can be retained with ${fourthRecord}.`
    : `${subjectLabel} may show one amount in ${firstDocument} and another in ${secondDocument}. The ${subject} transaction should be reconciled through ${thirdRecord}, with the conclusion shown in the computation kept with ${fourthRecord}. ${subjectLabel} needs document-based review when the records still support more than one plausible treatment.`;

  const limitsParagraph = isScheme
    ? `${subjectLabel} approval, benefit amount, payment timing, and later verification depend on the current scheme terms and the authority's decision. The ${subject} guide does not establish eligibility. ${subjectLabel} applicants should confirm location-specific, applicant-specific, and time-sensitive conditions on ${primarySource?.label ?? "the official portal"} before submitting.`
    : `A ${subject} filing cannot be resolved from this guide without the taxpayer's complete records. For ${subject}, form eligibility, due dates, tax-credit availability, and disclosure requirements can change the filing route. ${subjectLabel} filers should confirm the notified AY 2026-27 form on ${primarySource?.label ?? "the income-tax portal"} before filing.`;

  return `# ${spec.title}

${opening}

## ${subjectLabel}: the decision to make

${decisionParagraph}

${subjectLabel} evidence should answer these four questions:

1. For ${subject}, what fact or amount is established by ${firstDocument}?
2. Is the same ${subject} answer supported by ${secondDocument}?
3. Which ${subject} difference, if any, is explained by ${thirdRecord}?
4. Can the ${subject} answer be reconstructed from ${fourthRecord} and the submitted record?

## ${subjectLabel}: compare ${firstDocument} with the other records

| Record | Use in this decision |
| --- | --- |
${documentRows}

## ${subjectLabel}: when the records disagree

${mismatchParagraph}

## ${subjectLabel}: a record-based scenario

${scenarioParagraph}

## ${subjectLabel}: official pages to read

| Official page | What to confirm |
| --- | --- |
${sourceRows}

## ${subjectLabel}: risks and limits

${limitsParagraph}

## ${subjectLabel}: practical next actions

1. Read the current ${subject} instructions on ${primarySource?.label ?? "the official portal"}.
2. For ${subject}, compare ${firstDocument} with ${secondDocument} and explain every material difference.
3. For ${subject}, use ${thirdRecord} to support the unresolved fact, amount, or status.
4. Keep ${fourthRecord}, the submitted ${subject} form, and the acknowledgement together.

## ${subjectLabel}: related routes

${relatedRows}

## ${subjectLabel}: records to retain

The ${subject} file should retain the versions of ${firstDocument} and ${secondDocument} used for the decision, the relevant extract from ${thirdRecord}, the final ${fourthRecord}, and the submission acknowledgement. For ${subject}, record when ${primarySource?.label ?? "the official portal"} was checked so a later review can distinguish the instruction used from a later change.
`;
}

function experimentalRecordLedBodyFor(spec: TopicSpec) {
  const isScheme = spec.categoryId === "government-schemes";
  const subject = spec.schemeName ?? spec.userType;
  const subjectLabel = sentenceCase(subject);
  const [firstDocument, secondDocument, thirdDocument, fourthDocument] = spec.documents;
  const thirdRecord = thirdDocument ?? firstDocument;
  const fourthRecord = fourthDocument ?? secondDocument;
  const focusAction = actionFromFocus(spec.focus);
  const sourceLinks = sourceLinksFor(spec);
  const primarySource = isScheme ? sourceLinks[1] ?? sourceLinks[0] : sourceLinks[0];
  const tool = toolLinkFor(spec);

  const documentRows = spec.documents.map((document, index) => {
    const nextRecord = spec.documents[(index + 1) % spec.documents.length];
    return `| ${document} | ${documentReason(document, spec, index)} Compare the supported result with ${nextRecord} while you ${focusAction}. |`;
  }).join("\n");

  const sourceRows = sourceLinks.map((source, index) => {
    const record = spec.documents[index % spec.documents.length];
    const check = isScheme
      ? `${subjectLabel} applicants should use this page to confirm the current applicant category, accepted ${record}, submission channel, and any authority-controlled deadline.`
      : `Before relying on ${record}, use this page to confirm the current AY 2026-27 form, reporting route, and correction options relevant to ${subject}.`;
    return `| [${source.label}](${source.url}) | ${check} |`;
  }).join("\n");

  const relatedRows = [
    ...spec.relatedPostIds
      .slice(0, 2)
      .map((slug) => `- [${relatedPostLabels[slug] ?? toTitleCase(slug.replace(/-/g, " "))}](/blog/${slug})`),
    `- [${tool.label}](${tool.href})`,
    `- [${isScheme ? "Review documents before applying" : "Review unresolved filing facts"}](${spec.ctaHref})`,
  ].join("\n");

  const opening = isScheme
    ? `${subjectLabel} applicants should begin with the live authority conditions rather than a saved form or an old eligibility summary. The immediate task is to ${focusAction}. Compare ${firstDocument} with ${secondDocument} before entering applicant details, then use ${thirdRecord} to resolve any material difference.`
    : `${subjectLabel} should begin with records that explain the income, credit, deduction, or disclosure at issue. The immediate task is to ${focusAction}. Compare ${firstDocument} with ${secondDocument}, then use ${thirdRecord} to explain any difference before selecting a return form or schedule.`;

  const decisionParagraph = isScheme
    ? `Open [${primarySource?.label ?? "the scheme's official portal"}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}) and confirm who may apply, which records are accepted, and where the application must be submitted. ${firstDocument} should establish the applicant's identity or status, ${secondDocument} should support the same material details, and ${thirdRecord} plus ${fourthRecord} should answer the remaining eligibility questions. An acknowledgement proves submission, not approval or continuing eligibility.`
    : `${firstDocument} should establish the starting figure or taxpayer fact, while ${secondDocument} should confirm or challenge it. Use ${thirdRecord} to explain a timing, tax-credit, classification, or disclosure difference and retain ${fourthRecord} with the computation. The selected form must contain every schedule needed for the supported treatment.`;

  const mismatchParagraph = isScheme
    ? `When ${firstDocument} and ${secondDocument} show different names, dates, amounts, ownership details, or status, identify which issuing record needs correction. Use ${thirdRecord} only for the fact it actually proves and keep the correction receipt or authority response with ${fourthRecord}. Resume the application only after the material inconsistency is resolved.`
    : `When ${firstDocument} and ${secondDocument} disagree, trace the underlying transaction or fact through ${thirdRecord}. Classify the difference as timing, omission, duplication, reporting treatment, or an incorrect tax credit, then record the conclusion in the computation kept with ${fourthRecord}. A larger or prefilled portal amount is not evidence by itself.`;

  const scenarioParagraph = isScheme
    ? `Suppose ${firstDocument} supports the application but ${secondDocument} contains an older detail. Correct the inconsistent record through its issuing channel, use ${thirdRecord} to confirm the amended detail, and retain the acknowledgement with ${fourthRecord} before continuing.`
    : `Suppose ${firstDocument} shows one amount and ${secondDocument} shows another. Trace the difference through ${thirdRecord}, show the supported conclusion in the computation, and keep ${fourthRecord} beside that working. Pause for document-based review when the records still support more than one plausible treatment.`;

  const limitsParagraph = isScheme
    ? `${subjectLabel} approval, benefit amount, payment timing, and later verification remain controlled by the current scheme terms and the responsible authority. This guide does not establish eligibility. Confirm location-specific, applicant-specific, and time-sensitive conditions on ${primarySource?.label ?? "the official portal"} before submitting.`
    : `${subjectLabel} cannot be resolved from this guide without the taxpayer's complete records. Form eligibility, due dates, tax-credit availability, and disclosure requirements can change the filing route. Confirm the notified AY 2026-27 form on ${primarySource?.label ?? "the income-tax portal"} before filing.`;

  return `# ${spec.title}

${opening}

## ${sentenceCase(firstDocument)} and ${secondDocument}: settle the first question

${decisionParagraph}

Use these four questions to test the answer:

1. ${subjectLabel} question one: what fact or amount does ${firstDocument} establish?
2. ${subjectLabel} question two: does ${secondDocument} support the same answer?
3. ${subjectLabel} question three: what difference does ${thirdRecord} explain?
4. ${subjectLabel} question four: can the result be reconstructed from ${fourthRecord} and the submitted record?

## ${sentenceCase(focusAction)}: map each fact to evidence

| Record | Use in this decision |
| --- | --- |
${documentRows}

## ${sentenceCase(thirdRecord)}: explain differences before submission

${mismatchParagraph}

## ${sentenceCase(secondDocument)} and ${fourthRecord}: a record-based scenario

${scenarioParagraph}

## ${subjectLabel}: official pages to read

| Official page | What to confirm |
| --- | --- |
${sourceRows}

## ${sentenceCase(fourthRecord)}: risks and limits

${limitsParagraph}

## ${sentenceCase(focusAction)}: practical next actions

1. ${firstDocument}: read the current instructions on ${primarySource?.label ?? "the official portal"}.
2. ${secondDocument}: compare it with ${firstDocument} and explain every material difference.
3. ${thirdRecord}: use it only for the unresolved fact, amount, or status it supports.
4. ${fourthRecord}: retain it with the submitted form and acknowledgement.

## ${subjectLabel}: related routes

${relatedRows}

## ${sentenceCase(thirdRecord)}: records to retain

Retain the versions of ${firstDocument} and ${secondDocument} used for the decision, the relevant extract from ${thirdRecord}, the final ${fourthRecord}, and the submission acknowledgement. Note when ${primarySource?.label ?? "the official portal"} was checked so a later review can identify the instruction used without reconstructing the file from memory.
`;
}

function editorialBodyFor(spec: TopicSpec) {
  const isScheme = spec.categoryId === "government-schemes";
  const subject = spec.schemeName ?? spec.userType;
  const subjectLabel = sentenceCase(subject);
  const audienceLabel = sentenceCase(spec.userType);
  const [firstDocument, secondDocument, thirdDocument, fourthDocument] = spec.documents;
  const thirdRecord = thirdDocument ?? firstDocument;
  const fourthRecord = fourthDocument ?? secondDocument;
  const sourceLinks = sourceLinksFor(spec);
  const primarySource = isScheme ? sourceLinks[1] ?? sourceLinks[0] : sourceLinks[0];
  const tool = toolLinkFor(spec);

  const documentRows = spec.documents
    .map((document, index) => `| ${document} | ${documentReason(document, spec, index)} |`)
    .join("\n");
  const sourceRows = sourceLinks
    .map((source, index) => `| [${source.label}](${source.url}) | ${sourceCheckFor(spec, source.label, index)} |`)
    .join("\n");
  const relatedRows = [
    ...spec.relatedPostIds
      .slice(0, 2)
      .map((slug) => `- [${relatedPostLabels[slug] ?? toTitleCase(slug.replace(/-/g, " "))}](/blog/${slug})`),
    `- [${tool.label}](${tool.href})`,
    `- [Review unresolved ${subject} records](${spec.ctaHref})`,
  ].join("\n");

  const opening = isScheme
    ? chooseForSpecWithSalt(spec, "editorial-opening", [
        `A ${subject} application can be complete and still fail verification when ${firstDocument} and ${secondDocument} describe the applicant differently. ${audienceLabel} should settle those differences before uploading records or choosing the nearest-looking portal answer.`,
        `${audienceLabel} do not need another summary of ${subject}; they need to know whether their own records support the live application. Begin with ${firstDocument}, compare it with ${secondDocument}, and check the authority page before entering data.`,
        `For ${subject}, the useful question is not whether the form can be submitted, but whether every material answer can be supported after submission. ${audienceLabel} should start with ${firstDocument}, ${secondDocument}, and the live authority instructions.`,
        `${subjectLabel} eligibility is decided by the current scheme terms and the applicant's facts, not by a saved checklist. This guide focuses on ${spec.focus}, with ${firstDocument} and ${secondDocument} as the first records to test.`,
        `An old ${subject} summary can send an otherwise eligible applicant down the wrong route. Before applying, ${spec.userType} should read the live conditions and resolve any identity, status, or activity difference across ${firstDocument} and ${secondDocument}.`,
      ])
    : chooseForSpecWithSalt(spec, "editorial-opening", [
        `${firstDocument} and ${secondDocument} often describe the same tax event from different sides. For ${spec.userType}, the filing job is ${spec.focus}; the return should follow the supported facts rather than the most convenient prefilled number.`,
        `${audienceLabel} can reach the wrong return even when every visible number looks plausible. The weak point in ${spec.primaryKeyword} is usually the link between ${firstDocument}, ${secondDocument}, and the schedule chosen for reporting.`,
        `Portal data for ${spec.primaryKeyword} can reveal an entry but cannot decide its tax treatment. ${audienceLabel} still need to connect ${firstDocument} with ${secondDocument}, explain material differences, and choose a form that can report the result.`,
        `The first filing question for ${spec.userType} is not which button to press. It is whether ${firstDocument}, ${secondDocument}, and ${thirdRecord} support one consistent answer for ${spec.primaryKeyword}.`,
        `Returns filed by ${spec.userType} become difficult when a believable figure cannot be traced back to the underlying record. Start with ${firstDocument} and ${secondDocument}, then use ${thirdRecord} to test the classification, credit, deduction, or disclosure.`,
      ]);

  const decisionHeading = isScheme
    ? `${subjectLabel}: eligibility and application decision`
    : `${sentenceCase(spec.primaryKeyword)}: decide the reporting treatment`;
  const decisionBody = isScheme
    ? chooseForSpecWithSalt(spec, "editorial-decision", [
        `Open [${primarySource?.label ?? "the official scheme portal"}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}) and identify the applicant category, accepted records, application channel, and any live deadline. Then test the ${subject} conditions against ${firstDocument}, ${secondDocument}, ${thirdRecord}, and ${fourthRecord}. A ${subject} submission acknowledgement proves receipt of the application; it does not prove eligibility or approval.`,
        `Write down the specific ${subject} condition each record must establish. ${firstDocument} should support the applicant's identity or status, while ${secondDocument}, ${thirdRecord}, and ${fourthRecord} should support the remaining eligibility and application facts. Correct material inconsistencies before submitting.`,
        `Read the current ${subject} instructions before preparing the upload set. The ${subject} record set should identify the applicant, the condition being claimed, the issuer of each proof, and any deadline or location rule that applies. Keep unsupported ${subject} assumptions out of the form.`,
      ])
    : chooseForSpecWithSalt(spec, "editorial-decision", [
        `For ${spec.userType}, the immediate job is to ${actionFromFocus(spec.focus)}. For ${spec.primaryKeyword}, choose the return form only after mapping each material amount or taxpayer fact to a source record. ${firstDocument} ${verbFor(firstDocument, "establishes", "establish")} the starting position; ${secondDocument} ${verbFor(secondDocument, "confirms", "confirm")} or ${verbFor(secondDocument, "challenges", "challenge")} it; ${thirdRecord} ${verbFor(thirdRecord, "explains", "explain")} a difference that affects the form, schedule, credit, deduction, or disclosure. Keep ${fourthRecord} with the computation.`,
        `Treat ${firstDocument} as the starting record, not the complete answer. Compare it with ${secondDocument} and use ${thirdRecord} to decide whether the difference is caused by timing, omission, duplication, classification, or tax treatment. The selected form must contain every schedule needed for ${spec.userType}.`,
        `A return filed by ${spec.userType} should show a clear path from ${firstDocument} and ${secondDocument} to the reported treatment. Record why ${thirdRecord} changes the amount or classification. When ${thirdRecord} does not resolve the question for ${spec.userType}, preserve ${fourthRecord} with the open issue before filing.`,
      ]);

  const recordsHeading = `${sentenceCase(firstDocument)} and ${secondDocument}: what each record proves`;
  const recordsBody = `${isScheme
    ? chooseForSpecWithSalt(spec, "records-intro", [
        `${subjectLabel} records do different jobs. Use each ${subject} record only for the fact, amount, date, or status it directly supports.`,
        `A clean ${subject} file separates identity records, transaction records, authority records, and the final submission evidence.`,
        `${subjectLabel} documents may support one fact without settling another. The table shows the role assigned to each record.`,
        `Before relying on a ${subject} portal answer, identify which source record supports it and which record should be used as the cross-check.`,
      ])
    : chooseForSpecWithSalt(spec, "records-intro", [
        `${audienceLabel} should use each record only for the amount, date, party, or tax fact it directly supports.`,
        `A clean working file for ${spec.userType} separates source documents, tax-credit records, the computation, and the final acknowledgement.`,
        `${sentenceCase(firstDocument)} may support one part of the return without settling the treatment shown by ${secondDocument}.`,
        `${audienceLabel} should identify the source record and cross-check for each amount before relying on the prefill.`,
      ])}

| Record | Role in the decision |
| --- | --- |
${documentRows}`;

  const conflictHeading = `${subjectLabel}: resolve the ${thirdRecord} difference before submission`;
  const conflictBody = isScheme
    ? chooseForSpecWithSalt(spec, "editorial-conflict", [
        `A ${subject} application should stop if ${firstDocument} and ${secondDocument} show different names, dates, amounts, ownership details, or status. The ${subject} applicant should identify which issuing record needs correction, use ${thirdRecord} only for the fact it actually establishes, and keep the correction receipt or authority response with ${fourthRecord}.`,
        `A ${subject} mismatch can make an eligible applicant look ineligible or route the application incorrectly. Check the ${subject} difference for an outdated record, a data-entry error, or a genuinely different status. Correct the affected ${subject} source record instead of selecting the closest portal option.`,
        `Where the live ${subject} conditions and the applicant's records do not align, stop before submission. ${subjectLabel} applicants should ask the issuing authority or scheme administrator to clarify the disputed fact, retain the written response, and update the application only when the evidence supports the answer.`,
      ])
    : chooseForSpecWithSalt(spec, "editorial-conflict", [
        `When ${firstDocument} and ${secondDocument} disagree, trace the underlying transaction or fact through ${thirdRecord}. For ${spec.userType}, classify the gap as timing, omission, duplication, reporting treatment, or an incorrect credit. The computation for ${spec.userType} kept with ${fourthRecord} should record the conclusion; a larger or prefilled amount is not evidence by itself.`,
        `${audienceLabel} should not solve the difference by copying whichever figure is easier to report. ${audienceLabel} should check the period, parties, transaction type, and tax treatment shown by ${firstDocument}, ${secondDocument}, and ${thirdRecord}. When ${spec.userType} cannot correct the source data before filing, the working should document the supported treatment and retain the evidence.`,
        `A material difference for ${spec.userType} remains open until the working explains why the records diverge and how the final treatment was chosen. If ${thirdRecord} still ${verbFor(thirdRecord, "supports", "support")} more than one plausible answer, pause for a document-based review before submission.`,
      ]);

  const caseHeading = `${subjectLabel}: worked example from conflicting records`;
  const caseBody = isScheme
    ? chooseForSpecWithSalt(spec, "editorial-case", [
        `Suppose a ${subject} application is supported by ${firstDocument}, but ${secondDocument} contains an older applicant detail. The ${subject} applicant should update the inconsistent record through its issuing channel, use ${thirdRecord} to confirm the amended fact, and keep the acknowledgement with ${fourthRecord}. Submitting the older ${subject} detail may create a later verification problem even if the portal accepts it.`,
        `Consider a ${subject} applicant who appears to satisfy the headline condition but cannot support one material answer with ${thirdRecord}. The ${subject} application should pause while that fact is clarified. A completed ${subject} form does not repair missing eligibility evidence.`,
        `If the ${subject} authority page lists a condition that is not addressed by ${firstDocument} or ${secondDocument}, identify the accepted proof before applying. Do not upload an unrelated ${subject} record merely because it fits the file-size or document-type field.`,
      ])
    : chooseForSpecWithSalt(spec, "editorial-case", [
        `Suppose the return for ${spec.userType} has one amount in ${firstDocument} and another in ${secondDocument}. Trace the difference through ${thirdRecord}, identify whether the cause is timing, omission, credit, or classification, and show the supported conclusion in the computation. Keep ${fourthRecord} beside the working for ${spec.userType} so the return can be reconstructed later.`,
        `Consider a return filed by ${spec.userType} where the portal prefill agrees with ${secondDocument} but the taxpayer's ${firstDocument} ${verbFor(firstDocument, "supports", "support")} a different treatment. The prefill is a prompt to investigate, not a decision. The working for ${spec.userType} should explain the difference through ${thirdRecord} before the amount is carried into the relevant schedule.`,
        `If ${firstDocument} and ${secondDocument} support different forms or schedules, do not force the item into the simpler return. Resolve the underlying treatment for ${spec.userType} first, then choose the form that can report every required fact and retain ${fourthRecord} with the conclusion.`,
      ]);

  const sourcesHeading = `${subjectLabel}: official sources and live instructions`;
  const sourcesBody = `${isScheme
    ? `${subjectLabel} applicants may need more than one official page because each source supports a different part of the decision. Check the live ${subject} page and note the date used.`
    : `${audienceLabel} may need more than one official page because form instructions, AIS guidance, tax-credit guidance, and taxpayer facts answer different questions. Note the page and date used for ${spec.primaryKeyword}.`}

| Official reference | What to verify |
| --- | --- |
${sourceRows}`;

  const limitsHeading = `${subjectLabel}: when the file needs closer review`;
  const limitsBody = isScheme
    ? `${subjectLabel} acceptance, processing time, and outcome remain controlled by the current scheme terms and the deciding authority. ${subjectLabel} applicants should confirm location-specific and time-sensitive conditions on ${primarySource?.label ?? "the official portal"}. When public ${subject} instructions leave a material question unanswered, retain written clarification from ${primarySource?.label ?? "the official portal"}.`
    : `${audienceLabel} need complete facts before this guide can settle the filing position. For ${spec.userType}, form eligibility, due dates, credit availability, residency, regime choice, and disclosure requirements can change the answer. ${audienceLabel} should confirm the notified AY 2026-27 form on ${primarySource?.label ?? "the income-tax portal"} and obtain document-based review when a material issue remains unresolved.`;

  const finishHeading = isScheme ? `${subjectLabel}: before submitting the application` : `${subjectLabel}: before filing the return`;
  const finishItems = isScheme
    ? [
        `Reopen ${primarySource?.label ?? "the official portal"} for ${subject} and confirm the current applicant category, document list, submission channel, and deadline.`,
        `${subjectLabel} applicants should use the corrected details supported by ${firstDocument}, ${secondDocument}, and ${thirdRecord}.`,
        `Save the submitted ${subject} application, acknowledgement, ${fourthRecord}, and any later authority response together.`,
      ]
    : [
        `Proceed only when ${firstDocument}, ${secondDocument}, and ${thirdRecord} support one reporting treatment for ${spec.userType}.`,
        `${audienceLabel} should use the return form and schedules that can report the supported facts without omitting a required disclosure.`,
        `Keep the computation for ${spec.userType}, ${fourthRecord}, submitted return, and acknowledgement together.`,
      ];
  const finishBody = finishItems.map((item, index) => `${index + 1}. ${item}`).join("\n");

  const relatedHeading = `${subjectLabel}: related guides, tools, and support`;

  const sections: Record<string, string> = {
    decision: `## ${decisionHeading}\n\n${decisionBody}`,
    records: `## ${recordsHeading}\n\n${recordsBody}`,
    conflict: `## ${conflictHeading}\n\n${conflictBody}`,
    case: `## ${caseHeading}\n\n${caseBody}`,
    sources: `## ${sourcesHeading}\n\n${sourcesBody}`,
    limits: `## ${limitsHeading}\n\n${limitsBody}`,
    finish: `## ${finishHeading}\n\n${finishBody}`,
    related: `## ${relatedHeading}\n\n${relatedRows}`,
  };
  const layouts = isScheme
    ? [
        ["decision", "records", "conflict", "case", "sources", "limits", "finish", "related"],
        ["case", "decision", "records", "conflict", "sources", "finish", "limits", "related"],
        ["decision", "conflict", "records", "sources", "case", "limits", "finish", "related"],
        ["records", "decision", "case", "conflict", "sources", "finish", "limits", "related"],
        ["decision", "records", "sources", "conflict", "limits", "case", "finish", "related"],
      ]
    : [
        ["decision", "records", "conflict", "case", "sources", "limits", "finish", "related"],
        ["case", "decision", "records", "conflict", "sources", "finish", "limits", "related"],
        ["decision", "conflict", "records", "sources", "case", "limits", "finish", "related"],
        ["records", "decision", "case", "conflict", "sources", "finish", "limits", "related"],
        ["decision", "records", "sources", "conflict", "limits", "case", "finish", "related"],
      ];
  const layout = layouts[(spec.variantIndex ?? 0) % layouts.length];

  return `# ${spec.title}

${opening}

${layout.map((key) => sections[key]).join("\n\n")}`;
}

function clusterEditorialBodyFor(spec: TopicSpec) {
  const isScheme = spec.categoryId === "government-schemes";
  const subject = isScheme ? spec.schemeName ?? spec.primaryKeyword : spec.userType;
  const subjectLabel = sentenceCase(subject);
  const audienceLabel = sentenceCase(spec.userType);
  const [firstDocument, secondDocument, thirdDocument = spec.documents[0], fourthDocument = spec.documents[1]] = spec.documents;
  const sourceLinks = sourceLinksFor(spec);
  const primarySource = isScheme ? sourceLinks[1] ?? sourceLinks[0] : sourceLinks[0];
  const tool = toolLinkFor(spec);
  const workflow = schemeWorkflowFor(spec);
  const requestLabel = schemeRequestLabel(subject, workflow);

  const documentRows = spec.documents
    .map((document, index) => `| ${document} | ${documentReason(document, spec, index)} |`)
    .join("\n");
  const sourceRows = sourceLinks
    .map((source, index) => `| [${source.label}](${source.url}) | ${sourceCheckFor(spec, source.label, index)} |`)
    .join("\n");
  const relatedRows = [
    ...spec.relatedPostIds
      .slice(0, 2)
      .map((slug) => `- [${relatedPostLabels[slug] ?? toTitleCase(slug.replace(/-/g, " "))}](/blog/${slug})`),
    `- [${tool.label}](${tool.href})`,
    `- [${spec.ctaLabel}](${spec.ctaHref})`,
  ].join("\n");

  const opening = isScheme
    ? chooseForSpecWithSalt(spec, "cluster-opening", [
        `${audienceLabel} preparing a ${requestLabel} should begin with the live authority route, not an old eligibility summary. Check ${firstDocument} against ${secondDocument} before entering applicant details.`,
        `A ${requestLabel} can be submitted and still fail verification when its records describe the applicant differently. Begin with ${firstDocument}, cross-check ${secondDocument}, and resolve a material difference before upload.`,
        `${subjectLabel} requirements can vary by applicant, location, and submission date. This checklist tests ${spec.focus} using ${firstDocument}, ${secondDocument}, ${thirdDocument}, and ${fourthDocument}.`,
        `The useful question for ${spec.userType} is whether the live conditions and the applicant's records support the same request. Start with ${firstDocument} and ${secondDocument}, then check the current authority instructions.`,
      ])
    : chooseForSpecWithSalt(spec, "cluster-opening", [
        `${audienceLabel} need a return that can be traced back to the records, not merely a plausible prefilled figure. Start with ${firstDocument} and ${secondDocument}, then use ${thirdDocument} to settle the classification, credit, deduction, or disclosure at issue.`,
        `${sentenceCase(firstDocument)} and ${secondDocument} can point to different filing answers for ${spec.userType}; compare them before choosing a form or schedule, and use ${thirdDocument} to explain any material difference.`,
        `${sentenceCase(firstDocument)} and ${secondDocument} describe different parts of ${spec.primaryKeyword}; connect them before deciding the reporting treatment, and retain ${fourthDocument} beside the computation.`,
        `A reliable return for ${subject} should be rebuildable from ${firstDocument}, ${secondDocument}, and ${thirdDocument}; if those records support different answers, pause before selecting the form or schedule.`,
      ]);

  const decisionItems = isScheme
    ? [
      `For ${spec.userType}, check ${firstDocument} and ${secondDocument} against the live applicant conditions and submission route on ${primarySource?.label ?? "the official portal"}.`,
      `For ${spec.userType}, use ${firstDocument} for ${schemeRecordPurposeFor(firstDocument)} and ${secondDocument} for ${schemeRecordPurposeFor(secondDocument)}; do not treat them as interchangeable.`,
      `Use ${thirdDocument} only for the specific fact it proves.`,
      `Retain ${fourthDocument} with the ${workflow.completedRecord}.`,
    ]
    : [
      `Use ${firstDocument} and ${secondDocument} to settle the reporting treatment.`,
      `For ${spec.userType}, record that comparison in the computation before selecting a form or schedule.`,
      chooseForSpecWithSalt(spec, "decision-item-third-record", [
        `Use ${thirdDocument} to resolve the material difference before choosing a form.`,
        `${sentenceCase(thirdDocument)} must resolve the open difference before form selection.`,
        `Let ${thirdDocument} settle the open issue in the working before form selection.`,
        `Document how ${thirdDocument} resolves the issue before choosing a form.`,
      ]),
      `After reconciling ${firstDocument}, place ${retainedRecordLabel(fourthDocument)} with the computation and acknowledgement.`,
    ];
  const decisionBody = `${isScheme
    ? chooseForSpecWithSalt(spec, "cluster-decision-copy", [
        `Before you ${workflow.action} the ${requestLabel}, determine ${workflow.decision}; its ${workflow.completedRecord} proves receipt but does not decide eligibility, approval, or payment.`,
        `Read the current ${subject} conditions before preparing the upload set; keep the ${workflow.completedRecord} as a submission record, not as proof that the request was accepted.`,
        `Submit the ${requestLabel} only after every material answer points to an accepted record; save the ${workflow.completedRecord} because the authority still decides the outcome.`,
      ])
    : taxDecisionNarrative(spec)}

${decisionItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}`;

  const recordsBody = `${isScheme
    ? chooseForSpecWithSalt(spec, "cluster-scheme-records-copy", [
        `${sentenceCase(firstDocument)} and ${secondDocument} answer different questions; keep them separate from ${thirdDocument} and the ${workflow.completedRecord}.`,
        `${sentenceCase(firstDocument)} should support only facts it actually contains. Use ${secondDocument} as a separate check and preserve the ${workflow.completedRecord}.`,
        `${sentenceCase(firstDocument)} and ${secondDocument} are not interchangeable. Assign each record a clear purpose before submission.`,
        `A reviewable file separates ${firstDocument}, ${secondDocument}, transaction support, and the ${workflow.completedRecord}. The table below assigns those roles.`,
      ])
    : chooseForSpecWithSalt(spec, "cluster-tax-records-copy", [
        `Assign a specific purpose to ${firstDocument}, ${secondDocument}, and every other return record. Do not let ${secondDocument} replace the fact established by ${firstDocument}.`,
        `${sentenceCase(firstDocument)} may establish one fact while ${secondDocument} ${verbFor(secondDocument, "tests", "test")} another. Keep ${firstDocument}, ${secondDocument}, the computation, and the acknowledgement distinct.`,
        `${sentenceCase(firstDocument)} and ${secondDocument} are not interchangeable evidence. Use the map below to identify what ${firstDocument} and ${secondDocument} each answer.`,
        `Map amounts and dates to ${firstDocument}, then test credits and classifications against ${secondDocument}. Preserve the named-record trail through filing.`,
      ])}

| Record | What to verify |
| --- | --- |
${documentRows}`;

  const mismatchBody = isScheme
    ? schemeMismatchGuidance(spec, workflow)
    : taxMismatchGuidance(spec);

  const workedCheck = isScheme
    ? schemeWorkedCheck(spec, workflow)
    : taxWorkedCheck(spec);

  const sourcesBody = `${isScheme
    ? chooseForSpecWithSalt(spec, "cluster-scheme-sources-copy", [
        `Check the live process on ${primarySource?.label ?? "the official portal"} and record the page title, URL, and check date in the ${workflow.noun} file.`,
        `${subjectLabel} conditions may change after this checklist was prepared. Reopen ${primarySource?.label ?? "the official portal"} and note which current instructions support the submission.`,
        `Use ${primarySource?.label ?? "the official portal"} to verify the current route; preserve the checked page with ${firstDocument} and ${secondDocument}.`,
      ])
    : chooseForSpecWithSalt(spec, "cluster-tax-sources-copy", [
        `${sentenceCase(thirdDocument)} and ${firstDocument} need the current form instruction from ${primarySource?.label ?? "the income-tax portal"}; save the checked page and date.`,
        `${sentenceCase(fourthDocument)} should stay with the instruction used to map ${secondDocument} to the return; verify that instruction on ${primarySource?.label ?? "the income-tax portal"}.`,
        `${sentenceCase(thirdDocument)} ${verbFor(thirdDocument, "determines", "determine")} which form and schedule need checking; record the relevant instruction from ${primarySource?.label ?? "the income-tax portal"} beside ${firstDocument}.`,
        `Verify the treatment suggested by ${thirdDocument} against ${primarySource?.label ?? "the income-tax portal"}; retain the instruction with ${firstDocument}.`,
      ])}

| Official reference | What to confirm |
| --- | --- |
${sourceRows}`;

  const limitsBody = isScheme
    ? chooseForSpecWithSalt(spec, "cluster-scheme-limits-copy", [
        `${subjectLabel} approval and processing time remain with the authority; pause the ${workflow.noun} when a material answer lacks support or the live instructions conflict with the applicant's records.`,
        `This checklist cannot decide whether ${firstDocument} and ${secondDocument} satisfy the live conditions. Confirm variable requirements through ${primarySource?.label ?? "the official portal"}, and ask the authority before submitting an unsupported answer.`,
        `A completed ${requestLabel} does not establish approval; retain the open issue and ask the authority when live instructions and applicant records disagree.`,
      ])
    : chooseForSpecWithSalt(spec, "cluster-tax-limits-copy", [
        `The records available for ${spec.userType} cannot settle the return without complete facts; stop when they support different answers or the proposed form lacks a required schedule.`,
        `${sentenceCase(thirdDocument)} ${verbFor(thirdDocument, "leaves", "leave")} the return incomplete when a credit, deduction, classification, or disclosure remains unresolved for ${spec.userType}.`,
        `${audienceLabel} should preserve the open ${thirdDocument} issue when the source records support different answers instead of forcing it into a simpler form.`,
        `The proposed treatment for ${spec.userType} must fit the complete taxpayer position before it can be used.`,
      ]);

  const finishItems = isScheme
    ? [
        `${audienceLabel} should confirm the current conditions, route, and deadline on ${primarySource?.label ?? "the official portal"}.`,
        `For ${spec.userType}, resolve the difference shown by ${thirdDocument} after comparing ${firstDocument} with ${secondDocument}.`,
        `Keep ${retainedRecordLabel(fourthDocument)}, the submitted ${requestLabel}, and the ${workflow.completedRecord} together.`,
      ]
    : [
      `${audienceLabel} should have one reporting treatment supported by the source records.`,
      `For ${spec.userType}, choose the form and schedules only after the material mismatch in ${thirdDocument} is resolved in the computation.`,
      `For ${spec.userType}, retain ${retainedRecordLabel(fourthDocument)} with the computation, submitted return, and acknowledgement.`,
    ];

  const decisionHeading = isScheme
    ? `${audienceLabel}: decide whether the request is ready`
    : `${sentenceCase(firstDocument)} and ${secondDocument}: decide the reporting treatment`;
  const recordsHeading = `${sentenceCase(firstDocument)} and ${secondDocument}: what each proves`;
  const mismatchHeading = `${audienceLabel}: reconcile ${thirdDocument}`;
  const exampleHeading = `${audienceLabel}: worked check using ${fourthDocument}`;
  const schemeMismatchHeading = `${sentenceCase(thirdDocument)}: resolve a material mismatch`;
  const schemeExampleHeading = `${sentenceCase(fourthDocument)}: worked record check`;
  const sourcesHeading = isScheme
    ? `${primarySource?.label ?? subjectLabel}: current route and records`
    : `${subjectLabel}: official pages to verify`;
  const limitsHeading = `${sentenceCase(spec.focus)}: limits and pause points`;
  const finalHeading = isScheme
    ? `${audienceLabel}: final record check`
    : `${sentenceCase(firstDocument)}: final filing check`;
  const sections: Record<string, string> = {
    decision: `## ${decisionHeading}\n\n${decisionBody}`,
    records: `## ${recordsHeading}\n\n${recordsBody}`,
    mismatch: `## ${isScheme ? schemeMismatchHeading : mismatchHeading}\n\n${mismatchBody}`,
    example: `## ${isScheme ? schemeExampleHeading : exampleHeading}\n\n${workedCheck}`,
    sources: `## ${sourcesHeading}\n\n${sourcesBody}`,
    limits: `## ${limitsHeading}\n\n${limitsBody}`,
    final: `## ${finalHeading}\n\n${finishItems.map((item, index) => `${index + 1}. ${item}`).join("\n")}`,
    related: `## ${isScheme ? audienceLabel : subjectLabel}: related guides and tools\n\n${relatedRows}`,
  };
  const layouts = isScheme
    ? [
        ["decision", "records", "mismatch", "example", "sources", "limits", "final", "related"],
        ["records", "decision", "mismatch", "sources", "example", "limits", "final", "related"],
        ["decision", "example", "records", "mismatch", "sources", "final", "limits", "related"],
        ["mismatch", "decision", "records", "example", "sources", "limits", "final", "related"],
        ["decision", "records", "sources", "mismatch", "example", "limits", "final", "related"],
      ]
    : [
        ["decision", "records", "mismatch", "example", "sources", "limits", "final", "related"],
        ["example", "decision", "records", "mismatch", "sources", "limits", "final", "related"],
        ["decision", "mismatch", "records", "sources", "example", "limits", "final", "related"],
        ["records", "decision", "example", "mismatch", "sources", "final", "limits", "related"],
        ["decision", "records", "sources", "mismatch", "example", "limits", "final", "related"],
      ];
  const layout = layouts[(spec.variantIndex ?? 0) % layouts.length];

  return `# ${spec.title}

${opening}

${layout.map((key) => sections[key]).join("\n\n")}`;
}

function schemeEditorialBodyFor(spec: TopicSpec) {
  spec = {
    ...spec,
    documents: spec.documents.map((document) => {
      if (spec.schemeName?.toLowerCase() === "disability certificate" && document.toLowerCase() === "disability certificate") {
        return "issued certificate";
      }
      if (spec.schemeName?.toLowerCase() === "caste certificate" && document.toLowerCase() === "caste certificate") {
        return "issued category certificate";
      }
      if (spec.schemeName?.toLowerCase().includes("ration card") && document.toLowerCase() === "ration card") {
        return "existing household card";
      }
      return document;
    }),
  };
  const subject = spec.schemeName ?? spec.primaryKeyword;
  const subjectLabel = sentenceCase(subject);
  const audienceLabel = sentenceCase(spec.userType);
  const workflow = schemeWorkflowFor(spec);
  const requestLabel = schemeRequestLabel(subject, workflow);
  const [firstDocument, secondDocument, thirdDocument = spec.documents[0], fourthDocument = spec.documents[1]] = spec.documents;
  const sourceLinks = sourceLinksFor(spec);
  const primarySource = sourceLinks[1] ?? sourceLinks[0];
  const focusAction = actionFromFocus(spec.focus);
  const documentRows = spec.documents
    .map((document, index) => `| ${document} | ${documentReason(document, spec, index)} |`)
    .join("\n");
  const sourceRows = sourceLinks
    .map((source, index) => `| [${source.label}](${source.url}) | ${sourceCheckFor(spec, source.label, index)} |`)
    .join("\n");
  const relatedRows = [
    `- [Check the broader document-readiness guide before using ${firstDocument}](/blog/${spec.relatedPostIds[0]})`,
    `- [Organise ${secondDocument} and the rest of the evidence file](/blog/${spec.relatedPostIds[1]})`,
    `- [Review document handling before sharing ${thirdDocument}](/trust)`,
    `- [Review an unresolved ${fourthDocument} issue](${spec.ctaHref})`,
  ].join("\n");

  const opening = chooseForSpecWithSalt(spec, "scheme-editorial-opening", [
    `${audienceLabel} considering ${subject} should begin with the live authority route and their own records, not a copied checklist; to ${focusAction}, they need to use ${firstDocument}, ${secondDocument}, ${thirdDocument}, and ${fourthDocument} as separate evidence.`,
    `${subjectLabel} preparation is a fit-and-evidence decision for ${spec.userType}; the work is to ${focusAction}, compare ${firstDocument} with ${secondDocument}, and retain ${thirdDocument} and ${fourthDocument} for follow-up.`,
    `${indefiniteArticle(requestLabel)} ${requestLabel} can contain every requested upload and still be unreliable when ${firstDocument}, ${secondDocument}, ${thirdDocument}, and ${fourthDocument} describe different facts. ${AudienceAtSentenceStart(spec.userType)} should resolve those differences against ${primarySource?.label ?? "the official authority page"} before they ${workflow.action}.`,
  ]);

  const decisionIntro = chooseForSpecWithSalt(spec, "scheme-clean-decision", [
    `On [${primarySource?.label ?? "the official authority page"}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}), ${spec.userType} should confirm the current ${subject} route before collecting uploads; the decision to record is ${workflow.decision}, using ${firstDocument} and ${secondDocument} as the first checks.`,
    `${subjectLabel} fits ${spec.userType} only if the live authority route and the applicant records describe the same request; start with ${firstDocument}, test ${secondDocument}, and note what ${thirdDocument} still ${verbFor(thirdDocument, "leaves", "leave")} unresolved.`,
    `Before a ${requestLabel}, ${spec.userType} should write down the intended outcome, open [${primarySource?.label ?? "the authority page"}](${primarySource?.url ?? "https://www.myscheme.gov.in/"}), and decide ${workflow.decision} from ${firstDocument}, ${secondDocument}, and ${thirdDocument}.`,
    `${audienceLabel} should use ${firstDocument} to establish the starting facts for ${subject}, then compare ${secondDocument} and ${thirdDocument} with the current route shown by ${primarySource?.label ?? "the scheme administrator"}.`,
    `The first ${subject} decision is not whether every upload slot can be filled; it is ${workflow.decision}, based on the current authority route and the facts shown by ${firstDocument}, ${secondDocument}, and ${fourthDocument}.`,
    `A useful ${requestLabel} note for ${spec.userType} names the intended outcome, the live route, the fact supported by ${firstDocument}, and the issue that ${secondDocument} or ${thirdDocument} must settle.`,
    `${subjectLabel} preparation should pause until ${spec.userType} can connect the live instruction to ${firstDocument}, explain the role of ${secondDocument}, and record ${workflow.decision} without guessing.`,
  ]);
  const recordsIntro = chooseForSpecWithSalt(spec, "scheme-clean-records", [
    `${sentenceCase(firstDocument)} supports ${schemeRecordPurposeFor(firstDocument)}, while ${secondDocument}, ${thirdDocument}, and ${fourthDocument} answer different questions in the ${requestLabel}; review each item only for the fact it actually contains.`,
    `For ${spec.userType}, a reliable ${subject} file separates the job of ${firstDocument} from the jobs of ${secondDocument}, ${thirdDocument}, and ${fourthDocument}, then records any missing or contradictory fact before upload.`,
    `${sentenceCase(secondDocument)} should not be used as a substitute for ${firstDocument}; assign ${thirdDocument} and ${fourthDocument} their own application questions so the ${requestLabel} can be reconstructed later.`,
    `Build the ${subject} evidence set around four questions: what ${firstDocument} ${verbFor(firstDocument, "proves", "prove")}, what ${secondDocument} ${verbFor(secondDocument, "confirms", "confirm")}, what ${thirdDocument} ${verbFor(thirdDocument, "changes", "change")}, and why ${fourthDocument} must be retained.`,
    `${audienceLabel} should read ${firstDocument}, ${secondDocument}, ${thirdDocument}, and ${fourthDocument} as a connected record set, but preserve the separate purpose and issuing source of each item.`,
    `Before converting files for ${subject}, note the issuer, relevant date, applicant details, and supported answer for ${firstDocument}, ${secondDocument}, ${thirdDocument}, and ${fourthDocument}.`,
    `The ${requestLabel} record map begins with ${firstDocument} and ends with ${fourthDocument}; ${secondDocument} and ${thirdDocument} should resolve separate questions rather than repeat the same unsupported answer.`,
    `${sentenceCase(thirdDocument)} may expose a gap that ${firstDocument} and ${secondDocument} do not settle, so ${spec.userType} should preserve ${fourthDocument} and obtain an accepted record or written clarification.`,
  ]);
  const mismatchIntro = chooseForSpecWithSalt(spec, "scheme-clean-mismatch", [
    `If ${firstDocument} and ${secondDocument} disagree, the ${subject} file no longer demonstrates ${workflow.decision.replace(/^whether\s+/i, "that ")}; resolve the source record before relying on ${thirdDocument}.`,
    `${sentenceCase(thirdDocument)} should not be used to hide a conflict between ${firstDocument} and ${secondDocument}; ${spec.userType} should identify the issuing authority that can correct or clarify the disputed fact.`,
    `A material difference between ${firstDocument} and ${secondDocument} can change the ${requestLabel}; record the affected answer, the owner of the correction, and the limited role of ${thirdDocument}.`,
    `Compare ${firstDocument} with ${secondDocument} before ${spec.userType} ${workflow.action}; if the records support different applicant facts, pause the ${workflow.noun} and keep ${thirdDocument} out of the final upload set.`,
    `${subjectLabel} should proceed only after ${firstDocument} and ${secondDocument} support one answer for the disputed fact; ${thirdDocument} can add evidence but cannot repair an inaccurate issuing record.`,
    `When ${secondDocument} ${verbFor(secondDocument, "contradicts", "contradict")} ${firstDocument}, ${spec.userType} should preserve both versions, ask the relevant authority for correction guidance, and use ${thirdDocument} only for ${schemeRecordPurposeFor(thirdDocument)}.`,
    `Treat a missing ${firstDocument} differently from a contradictory ${secondDocument}: the first may need an accepted alternative, while the second needs correction or authority guidance before uploading ${thirdDocument}.`,
    `${sentenceCase(fourthDocument)} belongs in the follow-up trail when ${firstDocument}, ${secondDocument}, or ${thirdDocument} changes the route or applicant answer used for ${subject}.`,
    `The ${requestLabel} should state one supported answer where ${firstDocument} and ${secondDocument} overlap; unresolved differences belong in a correction request, not an inferred value from ${thirdDocument}.`,
  ]);
  const scenarioIntro = chooseForSpecWithSalt(spec, "scheme-clean-scenario", [
    `Test the ${requestLabel} before portal entry: ask which live instruction is answered by ${firstDocument}, which fact is confirmed by ${secondDocument}, and why ${fourthDocument} belongs with the result.`,
    `${audienceLabel} can run a simple pre-submission check by tracing one material ${subject} answer from ${primarySource?.label ?? "the authority page"} to ${firstDocument}, ${secondDocument}, and ${thirdDocument}.`,
    `A later verification request should be answerable from the file itself, so use ${firstDocument} to establish the starting fact, ${thirdDocument} to explain any change, and ${fourthDocument} to preserve the outcome.`,
    `Before ${spec.userType} ${workflow.action}, recreate the path from the current ${subject} instruction to the value entered, the role of ${secondDocument}, and the retained ${fourthDocument}.`,
    `${sentenceCase(fourthDocument)} should make the completed ${workflow.noun} easier to reconstruct; if ${firstDocument} and ${secondDocument} still conflict, the file is not ready for that step.`,
    `Use one disputed applicant fact as the test case for ${subject}: identify the answer in ${firstDocument}, compare ${secondDocument}, and explain why ${thirdDocument} ${verbFor(thirdDocument, "supports", "support")} or ${verbFor(thirdDocument, "changes", "change")} it.`,
    `The strongest pre-submission question for ${spec.userType} is practical: if the authority asks about ${thirdDocument}, can the answer be traced back to ${firstDocument} or ${secondDocument}?`,
    `Treat ${fourthDocument} as part of the final trail, not proof of every earlier answer; the live instruction and the facts in ${firstDocument}, ${secondDocument}, and ${thirdDocument} still control the ${requestLabel}.`,
    `${subjectLabel} is ready for a case check when ${spec.userType} can explain the applicant fact, the accepted source record, the open issue, and the purpose of ${fourthDocument}.`,
    `Before the ${workflow.noun}, compare the proposed answer with ${firstDocument} and ${secondDocument}; use ${thirdDocument} only for its stated purpose and retain ${fourthDocument} with the conclusion.`,
  ]);
  const sourceIntro = chooseForSpecWithSalt(spec, "scheme-clean-sources", [
    `${subjectLabel} rules can change after a checklist is saved, so ${spec.userType} should reopen the references below and retain the page used to confirm ${firstDocument} and ${secondDocument}.`,
    `Use ${primarySource?.label ?? "the authority page"} to confirm the current route for ${spec.userType}, then record which official page answers the remaining ${thirdDocument} and ${fourthDocument} questions.`,
    `${audienceLabel} should separate scheme discovery from the final authority instruction: locate ${subject}, verify the owner of the route, and retain the source used for ${firstDocument}.`,
    `Before the ${requestLabel}, check the current applicant category, accepted format for ${firstDocument}, treatment of ${secondDocument}, and follow-up channel shown by the official references.`,
    `${subjectLabel} source checks should answer four practical points for ${spec.userType}: who decides, where to ${workflow.action}, what ${thirdDocument} must show, and how the result is tracked.`,
    `Reopen the official ${subject} route immediately before upload and preserve the instruction that supports ${firstDocument}; an old form or discovery-page summary should not override the live page.`,
    `${sentenceCase(secondDocument)} may be accepted differently across routes or dates, so ${spec.userType} should retain the authority page, URL, and check date used for the ${workflow.noun}.`,
    `Where the official ${subject} pages do not settle a material ${thirdDocument} question, ask the scheme administrator and retain the written answer beside ${fourthDocument}.`,
    `The reference table gives ${spec.userType} a source for each decision: discovery, current route, accepted ${firstDocument}, and follow-up after the ${workflow.noun}.`,
    `${subjectLabel} should be prepared from current official instructions, with ${firstDocument} and ${secondDocument} checked against the source that actually controls the submission.`,
    `Record the official page used for ${subject}, the date it was checked, and the unresolved question involving ${thirdDocument}; keep that note with ${fourthDocument}.`,
  ]);
  const limits = chooseForSpecWithSalt(spec, "scheme-clean-limits", [
    `${subjectLabel} approval and processing remain decisions of ${primarySource?.label ?? "the scheme administrator"}; a consistent file for ${spec.userType} reduces avoidable questions but does not guarantee the outcome.`,
    `A complete ${requestLabel} is not proof of acceptance, payment, or later verification; ${spec.userType} should retain ${fourthDocument} and follow the status channel shown by ${primarySource?.label ?? "the authority page"}.`,
    `${sentenceCase(firstDocument)}, ${secondDocument}, ${thirdDocument}, and ${fourthDocument} can establish a reviewable file for ${subject}, but the current authority conditions still decide eligibility and outcome.`,
    `${audienceLabel} remain responsible for accurate answers and authentic records in ${subject}; an acknowledgement shows the step completed, not a guaranteed benefit or approval.`,
    `Location, applicant facts, and submission date may change the ${subject} route for ${spec.userType}; unresolved ownership, legal, tax, or eligibility questions need authority guidance or suitable professional advice.`,
    `The ${requestLabel} should stop when ${firstDocument} or ${secondDocument} supports a contradictory material answer; a later submission is preferable to an inaccurate or unreconstructable file.`,
    `${subjectLabel} may require correction or grievance steps after submission, so ${spec.userType} should preserve ${thirdDocument}, ${fourthDocument}, and every message received from the authority.`,
    `Neither ${fourthDocument} nor the ${workflow.completedRecord} proves that ${subject} has been finally accepted; keep both as evidence of the stage completed by ${spec.userType}.`,
    `A document-readiness review for ${subject} does not replace the live instruction or decide a disputed legal, ownership, payment, or eligibility issue for ${spec.userType}.`,
    `${audienceLabel} should not create a second inconsistent ${requestLabel} to bypass a record problem; use the correction or grievance route linked by ${primarySource?.label ?? "the authority page"}.`,
    `${subjectLabel} remains subject to current authority checks even after the ${workflow.noun}; preserve ${firstDocument}, ${fourthDocument}, and later clarification requests until the matter is closed.`,
    `The useful limit of this guide is document readiness for ${spec.userType}: it explains how to review ${firstDocument} and ${secondDocument}, not how the authority must decide ${subject}.`,
  ]);
  const finalAction = chooseForSpecWithSalt(spec, "scheme-clean-final", [
    `${audienceLabel} can move to the next step when the live ${subject} route is confirmed, ${firstDocument} and ${secondDocument} support the material answers, and ${fourthDocument} is ready for the follow-up trail.`,
    `Before the ${workflow.noun}, review the applicant details, accepted ${firstDocument}, role of ${thirdDocument}, and contact information; save ${fourthDocument} with the ${workflow.completedRecord}.`,
    `The ${subject} file should end with a clear choice for ${spec.userType}: ${workflow.action} through the confirmed route, correct a source record, obtain accepted evidence, or ask the authority for clarification.`,
    `Keep one ${requestLabel} folder containing the checked authority page, ${firstDocument}, ${secondDocument}, ${fourthDocument}, the ${workflow.completedRecord}, and later communication.`,
    `${audienceLabel} should not ${workflow.action} merely because every upload slot is filled; the facts in ${firstDocument}, ${secondDocument}, and ${thirdDocument} must support the same request.`,
    `After the ${workflow.noun}, ${spec.userType} should monitor the channel shown on the ${workflow.completedRecord} and preserve every clarification request with ${fourthDocument}.`,
    `${sentenceCase(fourthDocument)} closes the preparation trail only after ${spec.userType} resolve material differences between ${firstDocument}, ${secondDocument}, and ${thirdDocument}.`,
    `The final ${subject} review should identify the intended outcome, authority route, uploaded ${firstDocument}, retained ${fourthDocument}, and owner of every remaining question.`,
    `If ${thirdDocument} still ${verbFor(thirdDocument, "leaves", "leave")} a material answer unsupported, ${spec.userType} should pause the ${workflow.noun}; otherwise retain ${fourthDocument} and the ${workflow.completedRecord} together.`,
    `${subjectLabel} preparation is complete when ${firstDocument}, ${secondDocument}, and ${thirdDocument} explain the application facts and ${fourthDocument} preserves the next step.`,
    `Use the checked ${primarySource?.label ?? "authority page"} route for the ${workflow.noun}, then keep ${firstDocument}, ${fourthDocument}, and the ${workflow.completedRecord} in the same follow-up file.`,
    `${audienceLabel} should leave the review with one supported route and one traceable record set, beginning with ${firstDocument} and ending with ${fourthDocument}.`,
    `The next action for ${spec.userType} should follow the evidence: correct ${firstDocument}, clarify ${secondDocument}, use ${thirdDocument}, or proceed and retain ${fourthDocument}.`,
  ]);

  const sections: Record<string, string> = {
    decision: `## ${subjectLabel}: confirm the live route and applicant fit\n\n${decisionIntro}`,
    records: `## ${audienceLabel}: map ${firstDocument} to ${fourthDocument}\n\n${recordsIntro}\n\n| Record | What it must support |\n| --- | --- |\n${documentRows}`,
    mismatch: `## ${thirdDocument} conflict: decide before upload\n\n${mismatchIntro}\n\n${schemeMismatchGuidance(spec, workflow)}`,
    scenario: `## ${fourthDocument} case check: reconstruct the answer\n\n${scenarioIntro}\n\n${schemeWorkedCheck(spec, workflow)}`,
    sources: `## ${audienceLabel}: verify the authority route\n\n${sourceIntro}\n\n| Official reference | What to confirm |\n| --- | --- |\n${sourceRows}`,
    limits: `## ${requestLabel}: evidence limits and retention\n\n${limits}\n\n${finalAction}`,
    related: `## ${focusAction}: related routes for the next step\n\n${relatedRows}`,
  };
  const layouts = [
    ["decision", "records", "mismatch", "scenario", "sources", "limits", "related"],
    ["decision", "scenario", "records", "mismatch", "sources", "limits", "related"],
    ["records", "decision", "mismatch", "sources", "scenario", "limits", "related"],
    ["decision", "records", "sources", "mismatch", "scenario", "limits", "related"],
    ["scenario", "decision", "records", "mismatch", "sources", "limits", "related"],
    ["decision", "mismatch", "records", "scenario", "sources", "limits", "related"],
    ["records", "scenario", "decision", "mismatch", "sources", "limits", "related"],
  ];
  const layout = layouts[(spec.variantIndex ?? 0) % layouts.length];

  return `# ${spec.title}

${opening}

${layout.map((key) => sections[key]).join("\n\n")}`;
}

function AudienceAtSentenceStart(value: string) {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function bodyFor(spec: TopicSpec) {
  if (spec.categoryId !== "government-schemes") return clusterEditorialBodyFor(spec);
  const source = sourceLinksFor(spec).find((item) => !/myscheme/i.test(item.label)) ?? sourceLinksFor(spec)[0];
  return cleanSchemeEditorialBody(schemeEditorialBodyFor(spec), {
    title: spec.title,
    primaryKeyword: spec.primaryKeyword,
    focus: spec.focus,
    documents: spec.documents,
    sourceLabel: source?.label ?? "the official authority page",
  });
}

function frontmatterFor(spec: TopicSpec) {
  const body = bodyFor(spec);
  const description = descriptionFromArticleBody(body);
  const tool = toolLinkFor(spec);

  return {
    title: spec.title,
    description,
    slug: spec.slug,
    publishedAt: PUBLISHED_AT,
    modifiedAt: PUBLISHED_AT,
    primaryKeyword: spec.primaryKeyword,
    secondaryKeywords: spec.secondaryKeywords,
    contentType: spec.contentType,
    faqs: [],
    steps: stepsFromArticleBody(body),
    totalTime: "P1D",
    id: spec.slug,
    excerpt: description,
    categoryId: spec.categoryId,
    coverImage: `/assets/blog/text-covers/${spec.slug}.svg`,
    authorId: "mye-ca-editorial",
    authorName: "MyeCA Editorial Team",
    authorRole: "Tax and Scheme Research Desk",
    authorBio: "The MyeCA Editorial Team prepares evidence-led guides for Indian taxpayers, business owners, families, and scheme applicants.",
    seoTitle: truncate(`${spec.title} | MyeCA`, 78),
    seoDescription: description,
    keyHighlights: highlightsFromArticleBody(body),
    relatedPostIds: spec.relatedPostIds,
    ctaLabel: spec.ctaLabel,
    ctaHref: spec.ctaHref,
    isFeatured: false,
    readingTimeMinutes: Math.max(5, Math.ceil(body.split(/\s+/).length / 190)),
    createdAt: PUBLISHED_AT,
    tags: unique([spec.primaryKeyword, ...spec.secondaryKeywords, spec.schemeName ?? "AY 2026-27"]),
    audience: spec.audience,
    targetAudience: `${sentenceCase(spec.userType)} who need to ${spec.focus}`,
    userIntent: "informational",
    keyTopics: [actionFromFocus(spec.focus), ...spec.documents.slice(0, 3)],
    qualityStatus: "needs_revision",
    sourceLinks: sourceLinksFor(spec).map((source) => ({ ...source, checkedAt: PUBLISHED_AT.slice(0, 10) })),
    serviceSlug: null,
    calculatorSlug: tool.href.includes("/calculators/") ? "income-tax" : null,
    canonicalUrl: null,
  };
}

function escapeXml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function estimateWidth(text: string, fontSize: number) {
  return text.split("").reduce((sum, char) => {
    if (char === " ") return sum + fontSize * 0.32;
    if ("ilI1.,'".includes(char)) return sum + fontSize * 0.24;
    if ("mwMW@#%&".includes(char)) return sum + fontSize * 0.82;
    if (/[A-Z]/.test(char)) return sum + fontSize * 0.64;
    return sum + fontSize * 0.53;
  }, 0);
}

function wrapText(text: string, fontSize: number, maxWidth: number, maxLines: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (!current || estimateWidth(next, fontSize) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const clipped = lines.slice(0, maxLines);
  clipped[maxLines - 1] = `${clipped[maxLines - 1].replace(/\s+\S*$/, "").trim()}...`;
  return clipped;
}

function coverFor(spec: TopicSpec) {
  const isScheme = spec.categoryId === "government-schemes";
  const palette = isScheme
    ? { bg: "#f3faf7", panel: "#ffffff", ink: "#12352f", accent: "#0f8a70", pale: "#dff7ef" }
    : { bg: "#f3f7ff", panel: "#ffffff", ink: "#10233f", accent: "#2563eb", pale: "#dbeafe" };
  const label = isScheme ? "Government scheme" : "AY 2026-27";
  const subLabel = isScheme ? "Official-source guide" : "ITR research guide";
  const category = isScheme ? "Scheme readiness" : toTitleCase(spec.categoryId.replace(/-/g, " "));
  const titleLines = wrapText(spec.title.replace(/\s+for\s+AY\s+2026-27$/i, ""), 48, 830, 4);
  const titleSvg = titleLines
    .map((line, index) => `<text x="96" y="${200 + index * 56}" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="900" fill="${palette.ink}">${escapeXml(line)}</text>`)
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(spec.title)}</title>
  <desc id="desc">Standard MyeCA blog cover with safe title wrapping.</desc>
  <rect width="1200" height="630" fill="${palette.bg}"/>
  <rect x="30" y="30" width="1140" height="570" rx="24" fill="${palette.panel}" stroke="${palette.ink}" stroke-width="3"/>
  <rect x="60" y="60" width="1080" height="510" rx="18" fill="none" stroke="${palette.pale}" stroke-width="3"/>
  <rect x="74" y="140" width="10" height="250" rx="5" fill="${palette.accent}"/>
  <text x="84" y="92" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="900" letter-spacing="5" fill="${palette.ink}">MYECA INSIGHTS</text>
  <g transform="translate(802 66)">
    <rect x="0" y="0" width="294" height="76" rx="16" fill="${palette.pale}" stroke="${palette.ink}" stroke-width="3"/>
    <text x="24" y="32" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="900" fill="${palette.accent}">${escapeXml(label)}</text>
    <text x="24" y="58" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="800" fill="${palette.ink}">${escapeXml(subLabel)}</text>
  </g>
  <rect x="96" y="116" width="270" height="42" rx="21" fill="${palette.accent}"/>
  <text x="118" y="143" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="900" fill="#ffffff">${escapeXml(category.slice(0, 24))}</text>
  ${titleSvg}
  <line x1="96" y1="438" x2="740" y2="438" stroke="${palette.pale}" stroke-width="4" stroke-linecap="round"/>
  <g transform="translate(96 492)">
    <rect x="0" y="0" width="190" height="48" rx="14" fill="${palette.pale}"/>
    <text x="22" y="31" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="900" fill="${palette.ink}">Evidence-led</text>
  </g>
  <g transform="translate(306 492)">
    <rect x="0" y="0" width="244" height="48" rx="14" fill="#ffffff" stroke="${palette.pale}" stroke-width="3"/>
    <text x="22" y="31" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="900" fill="${palette.ink}">Source-first guide</text>
  </g>
  <text x="96" y="565" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" fill="${palette.ink}">MyeCA.in</text>
</svg>
`;
}

async function run() {
  const specs = [...taxTopics.map(buildTaxTopic), ...schemeTopics.map(buildSchemeTopic)]
    .map((spec, variantIndex) => ({ ...spec, variantIndex }));
  if (specs.length !== 100) throw new Error(`Expected 100 topics, received ${specs.length}`);
  const slugs = specs.map((spec) => spec.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("Duplicate slugs in generated batch");

  if (process.argv.includes("--refresh-migration")) {
    throw new Error("Public overwrite is disabled. Generated content must remain draft-only until human approval.");
  }

  await fs.mkdir(draftDir, { recursive: true });
  await fs.mkdir(coverDir, { recursive: true });

  for (const spec of specs) {
    const frontmatter: Record<string, unknown> = { ...frontmatterFor(spec), status: "draft" };
    const body = bodyFor(spec);
    await fs.writeFile(path.join(draftDir, `${spec.slug}.mdx`), `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${body}\n`, "utf8");
    await fs.writeFile(path.join(coverDir, `${spec.slug}.svg`), coverFor(spec), "utf8");
  }

  console.log(`Generated ${specs.length} draft-only posts in ${path.relative(rootDir, draftDir)}; existing public posts were not overwritten.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
