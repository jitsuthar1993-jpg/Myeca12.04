import fs from "node:fs/promises";
import path from "node:path";

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
};

const PUBLISHED_AT = "2026-05-27T00:00:00.000Z";
const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
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
  return value.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength + 1).replace(/\s+\S*$/, "").trim()}.`;
}

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
    ctaLabel: "Get Expert Tax Review",
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
    relatedPostIds: ["complete-ay-2026-27-itr-filing-guide", "download-ais-tis-form-26as-before-itr-ay-2026-27"],
    ctaLabel: "Review Scheme and Tax Documents",
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
  if (spec.categoryId === "government-schemes") return { label: "Income tax calculator", href: "/calculators/income-tax" };
  return { label: "Form 16 parser", href: "/form16-parser" };
}

function faqItemsFor(spec: TopicSpec) {
  if (spec.categoryId === "government-schemes") {
    return [
      {
        question: `Is ${spec.schemeName ?? "the scheme"} eligibility guaranteed by this guide?`,
        answer: "No. Eligibility depends on the official portal, current scheme rules, state or ministry verification, and the applicant's documents.",
      },
      {
        question: "Should I use only social media information before applying?",
        answer: "No. Use social posts only to identify the issue, then verify the rule and application status on official government sources.",
      },
      {
        question: "Why keep tax records for a government scheme?",
        answer: "Many applications ask for income, bank, identity, or business records. A clean document trail reduces avoidable mismatch and follow-up questions.",
      },
    ];
  }

  return [
    {
      question: "Is this article a substitute for professional advice?",
      answer: "No. Use it as an educational checklist and get case-specific review where documents, income heads, or eligibility are unclear.",
    },
    {
      question: "Which year does this AY 2026-27 guide cover?",
      answer: "AY 2026-27 generally relates to FY 2025-26 income, subject to the facts of the taxpayer and official filing utility rules.",
    },
    {
      question: "What should I check before filing?",
      answer: "Check the ITR form, tax regime, AIS, Form 26AS, TDS certificates, bank details, and the documents supporting the income or deduction.",
    },
  ];
}

function bodyFor(spec: TopicSpec) {
  const tool = toolLinkFor(spec);
  const sourceRows = sourceLinksFor(spec)
    .map((source) => `| ${source.label} | [Open source](${source.url}) |`)
    .join("\n");
  const relatedRows = spec.relatedPostIds
    .slice(0, 2)
    .map((slug) => `- [Related MyeCA guide](/blog/${slug})`)
    .join("\n");
  const documentRows = spec.documents.map((document) => `| ${document} | Keep the latest copy and match names, dates, and amounts before relying on it. |`).join("\n");
  const isScheme = spec.categoryId === "government-schemes";
  const yearContext = isScheme
    ? `This article is for users searching in 2026 who want official-source scheme readiness and clean income, identity, bank, and tax records. It does not promise approval, subsidy, loan sanction, refund, or processing time.`
    : `This article is for FY 2025-26 income being prepared for AY 2026-27. It is written as a conservative filing checklist, not a refund promise, processing-time promise, or substitute for checking the official utility.`;

  return `# ${spec.title}

${truncate(spec.title, 120)} is a search-focused guide for ${spec.userType}. The practical problem is ${spec.focus}. ${yearContext}

## Who is searching for this

Most searches behind this topic come from ${spec.userType} who already know the broad label but are unsure about documents, official portals, tax records, or the next step. The safest workflow is to avoid copying a random answer into an application or return. Start with official sources, then build a document file that can be reviewed.

For MyeCA readers, this means three things. First, keep the assessment-year or scheme-year context clear. Second, match names, PAN, Aadhaar, bank account, and income records before submitting. Third, preserve the acknowledgement or application reference because later refund, subsidy, loan, or notice work becomes harder without it.

## Quick checklist

- Confirm the official portal or Income Tax Department source before acting.
- Keep identity, bank, income, and scheme-specific documents in one folder.
- Match AIS, Form 26AS, Form 16, Form 16A, GST, or bank records where they apply.
- Do not assume eligibility, refund, subsidy, or loan approval without official verification.
- Use a CA or expert review where the record affects tax, business compliance, or high-value benefits.

## Documents to keep ready

| Document | Why it matters |
| --- | --- |
${documentRows}
| PAN and bank details | Useful for tax filing, refunds, benefit credits, and identity matching where applicable. |
| A short review note | Records what was checked, what is pending, and which official source was used. |

## Practical example

Example: a user searches for "${spec.primaryKeyword}" after seeing a portal message, employer record, bank credit, or application requirement. Instead of filing or applying immediately, the user collects the documents, checks the official source links below, and writes a short note explaining the facts. If a name, bank, Aadhaar, PAN, income, or TDS mismatch appears, the user pauses and fixes the mismatch before relying on the record.

This approach is slower than copying a generic answer, but it is safer. Many tax and scheme problems are not caused by the main rule. They are caused by inconsistent details across documents.

## Official source baseline

| Source | Link |
| --- | --- |
${sourceRows}

## MyeCA workflow

Use [${tool.label}](${tool.href}) as a preparation tool, then use [${spec.ctaLabel}](${spec.ctaHref}) if the file needs a document-based review. For adjacent reading:

${relatedRows}

## Review notes for ${spec.userType}

The reviewer should confirm the user profile, official source checked, documents seen, unresolved mismatch, and next action. If the file affects AY 2026-27 ITR filing, the note should separately mention income head, ITR form, tax regime, TDS or TCS credit, and e-verification status. If the file affects a government scheme, the note should separately mention scheme portal, application reference, eligibility documents, and bank-credit readiness.

## Frequently asked questions

${faqItemsFor(spec)
  .map((faq) => `### ${faq.question}\n\n${faq.answer}`)
  .join("\n\n")}

## Final takeaway

Treat this as a document-readiness workflow. Search intent tells you the question, but the answer should come from official sources, the user's own records, and a clear review trail.`;
}

function frontmatterFor(spec: TopicSpec) {
  const description = truncate(
    `${spec.primaryKeyword}: documents, official source checks, examples, and MyeCA workflow links for ${spec.userType}.`,
    158,
  );
  const body = bodyFor(spec);
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
    faqs: faqItemsFor(spec),
    steps: [
      "Open the official source and confirm the latest rule or portal status.",
      "Collect identity, income, bank, and topic-specific documents.",
      "Match tax, scheme, bank, and application records before relying on the result.",
      "Write a short note for mismatches, pending corrections, or expert review.",
    ],
    totalTime: "P1D",
    id: spec.slug,
    excerpt: description,
    categoryId: spec.categoryId,
    coverImage: `/assets/blog/text-covers/${spec.slug}.svg`,
    authorId: "mye-ca-editorial",
    authorName: "MyeCA Editorial Team",
    authorRole: "Tax and Scheme Research Desk",
    authorBio: "The MyeCA Editorial Team writes CA-reviewed guides for Indian taxpayers, business owners, families, and scheme applicants.",
    seoTitle: truncate(`${spec.title} | MyeCA`, 78),
    seoDescription: description,
    keyHighlights: [
      "Check the official source before acting.",
      "Keep document and bank records aligned.",
      "Use expert review where tax or scheme facts are unclear.",
    ],
    relatedPostIds: spec.relatedPostIds,
    ctaLabel: spec.ctaLabel,
    ctaHref: spec.ctaHref,
    isFeatured: false,
    readingTimeMinutes: Math.max(5, Math.ceil(body.split(/\s+/).length / 190)),
    createdAt: PUBLISHED_AT,
    tags: unique([spec.primaryKeyword, ...spec.secondaryKeywords, spec.schemeName ?? "AY 2026-27"]),
    audience: spec.audience,
    reviewedBy: "CA MyeCA Review Desk",
    reviewedAt: PUBLISHED_AT,
    sourceLinks: sourceLinksFor(spec),
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
    <text x="22" y="31" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="900" fill="${palette.ink}">CA-reviewed</text>
  </g>
  <g transform="translate(306 492)">
    <rect x="0" y="0" width="244" height="48" rx="14" fill="#ffffff" stroke="${palette.pale}" stroke-width="3"/>
    <text x="22" y="31" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="900" fill="${palette.ink}">Source-first guide</text>
  </g>
  <text x="96" y="565" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" fill="${palette.ink}">MyeCA.in</text>
</svg>
`;
}

async function existingSlugs() {
  const files = await fs.readdir(blogDir).catch(() => []);
  return new Set(files.filter((file) => file.endsWith(".mdx")).map((file) => file.replace(/\.mdx$/, "")));
}

async function run() {
  const specs = [...taxTopics.map(buildTaxTopic), ...schemeTopics.map(buildSchemeTopic)];
  if (specs.length !== 100) throw new Error(`Expected 100 topics, received ${specs.length}`);
  const slugs = specs.map((spec) => spec.slug);
  if (new Set(slugs).size !== slugs.length) throw new Error("Duplicate slugs in generated batch");

  const existing = await existingSlugs();
  const conflicts = slugs.filter((slug) => existing.has(slug));
  if (conflicts.length) throw new Error(`Refusing to overwrite existing blog posts: ${conflicts.join(", ")}`);

  await fs.mkdir(blogDir, { recursive: true });
  await fs.mkdir(coverDir, { recursive: true });

  for (const spec of specs) {
    const frontmatter = frontmatterFor(spec);
    const body = bodyFor(spec);
    await fs.writeFile(path.join(blogDir, `${spec.slug}.mdx`), `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${body}\n`, "utf8");
    await fs.writeFile(path.join(coverDir, `${spec.slug}.svg`), coverFor(spec), "utf8");
  }

  console.log(`Generated ${specs.length} AY 2026-27 and government-scheme blog posts.`);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
