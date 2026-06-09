// Interactive Tax Guides Data

const AY_2026_27_TRANSITION_NOTE = "AY 2026-27 filing uses the Income-tax Act, 1961 forms; Income-tax Act, 2025 applies from Tax Year 2026-27 for income beginning 1 April 2026.";

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  checklist?: string[];
  tips?: string[];
  links?: { label: string; href: string }[];
}

export interface TaxGuide {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: GuideCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  steps: GuideStep[];
  relatedCalculators: string[];
  relatedResources?: { label: string; href: string }[];
  tags: string[];
  lastUpdated: string;
  author: string;
}

export interface GuideOfficialSource {
  label: string;
  href: string;
  checkedAt: string;
}

export type GuideCategory = 'salaried' | 'business' | 'capital-gains' | 'nri' | 'deductions' | 'compliance';

const GUIDE_SOURCE_CHECKED_AT = '2026-06-07';
const INCOME_TAX_PORTAL_SOURCE: GuideOfficialSource = {
  label: 'Income Tax e-Filing Portal',
  href: 'https://www.incometax.gov.in/iec/foportal/',
  checkedAt: GUIDE_SOURCE_CHECKED_AT,
};
const INCOME_TAX_INDIVIDUAL_RETURN_SOURCE: GuideOfficialSource = {
  label: 'Income Tax Department - individual return guidance',
  href: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1',
  checkedAt: GUIDE_SOURCE_CHECKED_AT,
};
const INCOME_TAX_AIS_SOURCE: GuideOfficialSource = {
  label: 'Income Tax Department - Annual Information Statement',
  href: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/ais-annual-information-statement',
  checkedAt: GUIDE_SOURCE_CHECKED_AT,
};
const GST_PORTAL_SOURCE: GuideOfficialSource = {
  label: 'GST Portal',
  href: 'https://www.gst.gov.in/',
  checkedAt: GUIDE_SOURCE_CHECKED_AT,
};
const GST_NOTICE_SOURCE: GuideOfficialSource = {
  label: 'GST Portal - demand and recovery guidance',
  href: 'https://tutorial.gst.gov.in/userguide/demandsandrecovery/FAQs_GST_FORM_DRC-03.htm',
  checkedAt: GUIDE_SOURCE_CHECKED_AT,
};

const GUIDE_OFFICIAL_SOURCES: Record<string, GuideOfficialSource[]> = {
  'complete-itr-guide-salaried': [INCOME_TAX_INDIVIDUAL_RETURN_SOURCE, INCOME_TAX_AIS_SOURCE],
  'itr-1-filing-guide-ay-2026-27': [INCOME_TAX_INDIVIDUAL_RETURN_SOURCE, INCOME_TAX_AIS_SOURCE],
  'salary-tax-calculator-guide-ay-2026-27': [INCOME_TAX_INDIVIDUAL_RETURN_SOURCE, INCOME_TAX_AIS_SOURCE],
  'section-80c-deductions-ay-2026-27': [INCOME_TAX_INDIVIDUAL_RETURN_SOURCE],
  'ais-explained-ay-2026-27': [INCOME_TAX_AIS_SOURCE],
  'hra-exemption-claim': [INCOME_TAX_INDIVIDUAL_RETURN_SOURCE],
  'stock-capital-gains-tax': [INCOME_TAX_PORTAL_SOURCE],
  'maximize-tax-deductions': [INCOME_TAX_INDIVIDUAL_RETURN_SOURCE],
  'freelancer-tax-filing': [INCOME_TAX_PORTAL_SOURCE],
  'important-tax-deadlines': [INCOME_TAX_PORTAL_SOURCE, GST_PORTAL_SOURCE],
  'gst-notice-handling-guide': [GST_NOTICE_SOURCE, GST_PORTAL_SOURCE],
};

export const GUIDE_CATEGORIES: { id: GuideCategory; name: string; icon: string; color: string }[] = [
  { id: 'salaried', name: 'Salaried Employees', icon: 'Briefcase', color: 'blue' },
  { id: 'business', name: 'Business & Freelancers', icon: 'Building2', color: 'purple' },
  { id: 'capital-gains', name: 'Capital Gains', icon: 'TrendingUp', color: 'green' },
  { id: 'nri', name: 'NRI Taxation', icon: 'Globe', color: 'orange' },
  { id: 'deductions', name: 'Deductions & Savings', icon: 'PiggyBank', color: 'emerald' },
  { id: 'compliance', name: 'Compliance & Deadlines', icon: 'Shield', color: 'red' },
];

export const TAX_GUIDES: TaxGuide[] = [
  // Salaried Employee Guides
  {
    id: 'salaried-itr-complete',
    slug: 'complete-itr-guide-salaried',
    title: 'Complete ITR Filing Guide for Salaried Employees',
    description: 'Step-by-step guide to file your Income Tax Return as a salaried individual for AY 2026-27. Covers Form 16, deductions, section cross-references, and submission process.',
    category: 'salaried',
    difficulty: 'beginner',
    estimatedTime: '30 mins',
    tags: ['ITR-1', 'Form 16', 'salary', 'tax filing'],
    lastUpdated: '2026-05-05',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/income-tax', '/calculators/hra'],
    steps: [
      {
        id: 'gather-docs',
        title: 'Gather Required Documents',
        description: 'Collect all necessary documents before starting the filing process.',
        checklist: [
          'Form 16 from employer',
          AY_2026_27_TRANSITION_NOTE,
          'Form 26AS (Tax Credit Statement)',
          'AIS (Annual Information Statement)',
          'Bank statements for interest income',
          'Investment proofs (80C, 80D, etc.)',
          'Rent receipts (if claiming HRA)',
          'Home loan interest certificate (if applicable)',
          'PAN card and Aadhaar',
        ],
        tips: [
          'Download Form 16 from your HR portal or request from employer',
          'Form 26AS can be downloaded from TRACES or income tax portal',
          'Keep digital copies of all documents for easy upload',
        ],
        links: [
          { label: 'Download Form 26AS', href: 'https://www.incometax.gov.in' },
          { label: 'Form 16 Parser Tool', href: '/form16-parser' },
        ],
      },
      {
        id: 'verify-form16',
        title: 'Verify Form 16 Details',
        description: 'Cross-check your Form 16 details with your salary slips and bank statements.',
        checklist: [
          'Verify gross salary matches your records',
          'Check exemptions (HRA, LTA, etc.) are correctly mentioned',
          'Confirm deductions under Chapter VI-A',
          'Match TDS deducted with Form 26AS',
          'Verify PAN and employer details',
        ],
        tips: [
          'If there are discrepancies, contact your employer immediately',
          'Investigate any difference between Form 16 and Form 26AS before using the credit in the return',
        ],
      },
      {
        id: 'choose-regime',
        title: 'Choose Tax Regime',
        description: 'Decide between Old and New Tax Regime based on your deductions.',
        checklist: [
          'Calculate tax under old regime with all deductions',
          'Calculate tax under new regime (lower rates, no deductions)',
          'Compare both and record why the selected regime gives the lower final liability for the complete income profile',
          'Note: New regime under Section 115BAC (2025 Act: Section 202) is default for AY 2026-27',
        ],
        tips: [
          'Use our Tax Regime Calculator to compare both options',
          'For AY 2026-27, compare deductions against the enhanced new-regime slabs and Section 87A rebate up to ₹60,000',
          'You can switch regimes every year (non-business income)',
        ],
        links: [
          { label: 'Tax Regime Calculator', href: '/calculators/regime-comparator' },
        ],
      },
      {
        id: 'fill-itr',
        title: 'Fill ITR Form Online',
        description: 'Log in to the income tax portal and fill your ITR-1 form.',
        checklist: [
          'Login to incometax.gov.in',
          'Go to e-File > Income Tax Returns > File Income Tax Return',
          'Select Assessment Year and ITR Form (ITR-1 for most salaried)',
          'Fill personal information',
          'Enter salary details from Form 16',
          'Add other income (interest, etc.)',
          'Enter deductions claimed',
          'Verify tax calculation',
        ],
        tips: [
          'Use "Pre-fill" option to auto-fetch data from Form 26AS',
          'Double-check all figures before submission',
          'Save draft frequently to avoid data loss',
        ],
      },
      {
        id: 'verify-submit',
        title: 'Verify and Submit',
        description: 'Review your return and submit with e-verification.',
        checklist: [
          'Preview the filled form',
          'Verify all income sources are included',
          'Check tax payable/refund amount',
          'Submit the return',
          'E-verify using Aadhaar OTP / Net Banking / EVC',
        ],
        tips: [
          'Confirm the current e-verification timeline on the filing portal and complete it promptly',
          'Keep acknowledgment number safe for future reference',
          'Download ITR-V for your records',
        ],
      },
    ],
  },
  {
    id: 'itr-1-ay-2026-guide',
    slug: 'itr-1-filing-guide-ay-2026-27',
    title: 'ITR-1 Filing Guide for AY 2026-27',
    description: 'Eligibility, documents, income checks, AIS/Form 26AS matching, deductions, and e-verification steps before filing ITR-1 Sahaj for AY 2026-27.',
    category: 'salaried',
    difficulty: 'beginner',
    estimatedTime: '25 mins',
    tags: ['ITR-1', 'Sahaj', 'AY 2026-27', 'salary return'],
    lastUpdated: '2026-05-24',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/income-tax', '/itr/form-selector'],
    relatedResources: [
      { label: 'ITR for Salaried Employees', href: '/services/itr-for-salaried' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Start Filing', href: '/itr/start?source=tax_guide_itr1' },
    ],
    steps: [
      {
        id: 'confirm-eligibility',
        title: 'Confirm ITR-1 Eligibility',
        description: 'Check whether Sahaj is the right return before you start entering figures.',
        checklist: [
          'Confirm you are a resident individual eligible to use ITR-1',
          'Check total income against the ITR-1 threshold for AY 2026-27',
          'Confirm income heads fit ITR-1, such as salary, pension, eligible house property income, and other sources',
          'Use another form if you have business income, ineligible capital gains, foreign assets, directorship, unlisted equity shares, or carried-forward losses',
        ],
        tips: [
          'When in doubt, run the form selector before filing because using the wrong ITR form can delay processing',
          'The Income Tax Department help page is the source of truth for final eligibility wording',
        ],
        links: [
          { label: 'ITR Form Selector', href: '/itr/form-selector' },
          { label: 'Income Tax ITR-1 Help', href: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/itr-1' },
        ],
      },
      {
        id: 'collect-records',
        title: 'Collect Salary and Tax Records',
        description: 'Keep every supporting record ready before using the online utility.',
        checklist: [
          'Form 16 from each employer for the year',
          'AIS and Taxpayer Information Summary downloaded from the income tax portal',
          'Form 26AS for TDS/TCS and tax payment credits',
          'Bank interest certificates, dividend records, rent details, and home loan interest certificate if applicable',
          'Proofs for deductions you want to claim under the old regime',
        ],
        tips: [
          'If you changed jobs, check that both employers are captured and deductions are not duplicated',
          'Keep the final return calculation aligned with AIS/TIS and Form 26AS before e-verification',
        ],
        links: [
          { label: 'Form 16 Parser Tool', href: '/form16-parser' },
          { label: 'AIS Explained Guide', href: '/learn/guide/ais-explained-ay-2026-27' },
        ],
      },
      {
        id: 'compare-regimes',
        title: 'Compare Old and New Tax Regimes',
        description: 'Choose the regime after checking standard deduction, rebate, and old-regime deduction impact.',
        checklist: [
          'Calculate tax under the default new regime',
          'Calculate tax under the old regime if you have deductions or exemptions',
          'Check Section 80C, 80D, HRA, home loan interest, and NPS proofs before opting for old regime',
          'Save the calculation snapshot used for your filing decision',
        ],
        tips: [
          'A regime comparison is most useful before you start the return, not after figures are already submitted',
          'Do not claim a deduction unless the supporting document is available and matches your records',
        ],
        links: [
          { label: 'Tax Regime Comparator', href: '/calculators/regime-comparator' },
          { label: 'Section 80C Guide', href: '/learn/guide/section-80c-deductions-ay-2026-27' },
        ],
      },
      {
        id: 'review-submit',
        title: 'Review, Submit, and E-Verify',
        description: 'Complete the final review before submission and e-verify within the required timeline.',
        checklist: [
          'Preview the return and match salary, other income, deductions, TDS, and refund/tax payable',
          'Check bank account validation for refund credit',
          'Submit only after correcting mismatches or documenting the reason',
          'E-verify and save the acknowledgement number',
        ],
        tips: [
          'A filed but not e-verified return is not fully completed',
          'If a mismatch remains, add notes for CA review before submission',
        ],
        links: [
          { label: 'Expert Consultation', href: '/expert-consultation' },
        ],
      },
    ],
  },
  {
    id: 'salary-tax-calculator-ay-2026-guide',
    slug: 'salary-tax-calculator-guide-ay-2026-27',
    title: 'Salary Tax Calculator Guide for AY 2026-27',
    description: 'Use salary, Form 16, deductions, TDS, old vs new regime comparison, and take-home salary checks to estimate tax before choosing an ITR filing path.',
    category: 'salaried',
    difficulty: 'beginner',
    estimatedTime: '20 mins',
    tags: ['salary tax calculator', 'Form 16', 'tax regime', 'AY 2026-27'],
    lastUpdated: '2026-05-26',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/salary', '/calculators/income-tax', '/calculators/regime-comparator'],
    relatedResources: [
      { label: 'ITR for Salaried Employees', href: '/services/itr-for-salaried' },
      { label: 'Tax Planning Service', href: '/services/tax-planning' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Start Filing', href: '/itr/start?source=tax_guide_salary_calculator' },
    ],
    steps: [
      {
        id: 'collect-salary-inputs',
        title: 'Collect Salary Inputs Before Calculating',
        description: 'Start with source documents instead of estimating from memory.',
        checklist: [
          'Keep Form 16, latest salary slips, employer tax statement, and annual CTC breakup together',
          'Separate basic pay, HRA, special allowance, bonus, employer PF, employee PF, professional tax, and other taxable benefits',
          'Download AIS/TIS and Form 26AS so salary TDS and other reported income can be compared',
          'List bank interest, dividends, rent, capital gains, and other income that may change the final tax result',
        ],
        tips: [
          'A salary calculator is only as reliable as the salary breakup entered into it',
          'If you changed jobs, combine both employers before comparing regimes',
        ],
        links: [
          { label: 'Form 16 Parser Tool', href: '/form16-parser' },
          { label: 'AIS Explained Guide', href: '/learn/guide/ais-explained-ay-2026-27' },
        ],
      },
      {
        id: 'estimate-take-home',
        title: 'Estimate Take-Home Salary and Taxable Salary',
        description: 'Use CTC and payroll components to understand monthly cash flow and annual taxable salary.',
        checklist: [
          'Use the salary calculator for CTC to monthly in-hand estimates',
          'Check employee PF, professional tax, employer benefits, and variable pay assumptions',
          'Compare monthly payroll TDS with the annual tax estimate so a shortfall is visible early',
          'Keep one saved estimate for personal planning and one final estimate for ITR review',
        ],
        tips: [
          'Payroll in-hand salary and final ITR taxable income can differ because of other income and deductions',
        ],
        links: [
          { label: 'Salary Calculator', href: '/calculators/salary' },
        ],
      },
      {
        id: 'compare-regimes',
        title: 'Compare Old and New Regime Tax',
        description: 'Run both regimes before choosing the filing path or requesting CA review.',
        checklist: [
          'Calculate tax under the default new regime using salary and other income',
          'Calculate tax under the old regime only after entering eligible HRA, 80C, 80D, NPS, home loan, and other deduction proofs',
          'Check rebate, surcharge, cess, and standard deduction impact for the income level',
          'Save the comparison and note why one regime was selected',
        ],
        tips: [
          'Do not choose old regime just because deductions exist; compare the final tax payable',
          'Avoid claiming payroll-declared deductions unless actual proof is available for the financial year',
        ],
        links: [
          { label: 'Income Tax Calculator', href: '/calculators/income-tax' },
          { label: 'Tax Regime Comparator', href: '/calculators/regime-comparator' },
          { label: 'Section 80C Guide', href: '/learn/guide/section-80c-deductions-ay-2026-27' },
        ],
      },
      {
        id: 'choose-filing-path',
        title: 'Choose the Filing Path',
        description: 'Use the calculator output as a pre-filing check, not as a substitute for return review.',
        checklist: [
          'Use ITR-1 only if the salary case fits ITR-1 eligibility',
          'Use the form selector if there are capital gains, foreign assets, business income, multiple properties, or other complexity',
          'Send salary, AIS, Form 26AS, deduction proofs, and calculator output for CA review when figures do not reconcile',
          'Keep the final acknowledgement and e-verification proof after filing',
        ],
        tips: [
          'A calculator can flag the likely tax outcome; the final return must still match official records',
        ],
        links: [
          { label: 'ITR Form Selector', href: '/itr/form-selector' },
          { label: 'ITR for Salaried Employees', href: '/services/itr-for-salaried' },
          { label: 'Pricing', href: '/pricing' },
        ],
      },
    ],
  },
  {
    id: 'section-80c-ay-2026-guide',
    slug: 'section-80c-deductions-ay-2026-27',
    title: 'Section 80C Deduction Guide for AY 2026-27',
    description: 'Plan and verify Section 80C deductions, common eligible investments, proof checks, old-regime fit, and links to related calculators for AY 2026-27.',
    category: 'deductions',
    difficulty: 'beginner',
    estimatedTime: '20 mins',
    tags: ['80C', 'deductions', 'old regime', 'tax saving'],
    lastUpdated: '2026-05-24',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/income-tax', '/calculators/elss', '/calculators/ppf'],
    relatedResources: [
      { label: 'Tax Planning Service', href: '/services/tax-planning' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Choose ITR Form', href: '/itr/form-selector' },
    ],
    steps: [
      {
        id: 'understand-limit',
        title: 'Understand the 80C Limit',
        description: 'Know what 80C can and cannot do before choosing tax-saving investments.',
        checklist: [
          'Use Section 80C only when you are comparing or choosing the old tax regime',
          'Track the aggregate 80C limit across EPF, PPF, ELSS, life insurance, tuition fees, principal repayment, and similar eligible items',
          'Keep proof for each claim and avoid double-counting the same payment',
          'Separate 80C from additional NPS deductions and health insurance deductions',
        ],
        tips: [
          'The 80C decision should be driven by your financial goal first, not only tax saving',
          'EPF contributions from salary often use part of the limit before you invest separately',
        ],
        links: [
          { label: 'Income Tax Department Deduction Reference', href: 'https://www.incometax.gov.in/iec/foportal/help/individual/return-applicable-1' },
        ],
      },
      {
        id: 'map-instruments',
        title: 'Map Eligible Instruments',
        description: 'Group each payment by purpose and lock-in before finalizing claims.',
        checklist: [
          'Retirement-linked: EPF, PPF, approved pension products, and eligible NPS portion',
          'Market-linked: ELSS with lock-in and market risk',
          'Protection-linked: eligible life insurance premium',
          'Family-linked: qualifying tuition fees and eligible home loan principal repayment',
        ],
        tips: [
          'Check premium-to-sum-assured conditions before claiming insurance premium',
          'ELSS return is market-linked; keep it separate from fixed-return products in planning',
        ],
        links: [
          { label: 'ELSS Calculator', href: '/calculators/elss' },
          { label: 'PPF Calculator', href: '/calculators/ppf' },
        ],
      },
      {
        id: 'proof-check',
        title: 'Prepare Proofs for Filing',
        description: 'Make sure every deduction figure can be explained if asked later.',
        checklist: [
          'Download EPF statement, PPF passbook, ELSS statement, insurance receipts, and tuition fee receipts',
          'Match payment dates to the relevant financial year',
          'Use bank statement narration to support unclear receipts',
          'Keep employer-declared proofs and final return proofs in one folder',
        ],
        tips: [
          'Do not rely only on payroll declarations; file based on actual eligible payments',
          'Keep a short note for any proof that has a different payer name or delayed posting date',
        ],
      },
      {
        id: 'compare-benefit',
        title: 'Compare Final Tax Benefit',
        description: 'Use the deduction result inside a regime comparison before filing.',
        checklist: [
          'Calculate tax with old-regime deductions',
          'Calculate tax under the new regime without most old-regime deductions',
          'Choose the lower tax outcome only after checking all other income and rebate effects',
          'Save the calculator output or CA review note',
        ],
        tips: [
          'A high 80C claim does not automatically make the old regime better for every taxpayer',
        ],
        links: [
          { label: 'Income Tax Calculator', href: '/calculators/income-tax' },
          { label: 'Tax Regime Comparator', href: '/calculators/regime-comparator' },
        ],
      },
    ],
  },
  {
    id: 'ais-ay-2026-guide',
    slug: 'ais-explained-ay-2026-27',
    title: 'AIS Explained for AY 2026-27 ITR Filing',
    description: 'Understand Annual Information Statement, TIS, Form 26AS differences, feedback handling, and the checks to complete before filing your return.',
    category: 'compliance',
    difficulty: 'beginner',
    estimatedTime: '18 mins',
    tags: ['AIS', 'TIS', 'Form 26AS', 'ITR mismatch'],
    lastUpdated: '2026-05-24',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/income-tax', '/itr/form-selector'],
    relatedResources: [
      { label: 'Expert Consultation', href: '/expert-consultation' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Start Filing', href: '/itr/start?source=tax_guide_filing_action' },
    ],
    steps: [
      {
        id: 'what-ais-shows',
        title: 'Understand What AIS Shows',
        description: 'AIS gives a wider view of reported taxpayer information than Form 26AS alone.',
        checklist: [
          'Review general information, TDS/TCS, SFT information, tax payments, demand/refund details, and other reported information',
          'Use TIS as the category-wise summary used for return prefilling where applicable',
          'Remember that AIS may not contain every transaction, so your own books and bank records still matter',
        ],
        tips: [
          'AIS is a reconciliation tool, not a substitute for your actual income records',
        ],
        links: [
          { label: 'Income Tax AIS Help', href: 'https://www.incometax.gov.in/iec/foportal/help/all-topics/e-filing-services/ais-annual-information-statement' },
        ],
      },
      {
        id: 'download-compare',
        title: 'Download and Compare',
        description: 'Match AIS/TIS, Form 26AS, and your return working before submitting.',
        checklist: [
          'Download AIS and TIS from the income tax portal',
          'Download Form 26AS and match TDS/TCS credits',
          'Compare salary, interest, dividend, capital gains, tax payments, and refund/demand information',
          'Mark every difference as corrected, explained, or pending review',
        ],
        tips: [
          'Start with high-value items and tax-credit mismatches because they affect refunds and processing',
          'Keep source statements from banks, brokers, and employers for mismatches',
        ],
      },
      {
        id: 'feedback',
        title: 'Use Feedback Carefully',
        description: 'Provide AIS feedback only when you have supporting records.',
        checklist: [
          'Identify duplicate, incorrect, or not-taxable entries',
          'Check whether the source has confirmed or modified the information',
          'Keep evidence for every feedback item',
          'Re-check the accepted value before filing',
        ],
        tips: [
          'If the same mismatch affects refund or notice risk, use CA review before filing',
        ],
        links: [
          { label: 'Expert Consultation', href: '/expert-consultation' },
        ],
      },
      {
        id: 'file-clean',
        title: 'File With a Reconciliation Trail',
        description: 'Leave a clean trail between data sources and the final return.',
        checklist: [
          'Save AIS/TIS and Form 26AS PDFs used for filing',
          'Save the final computation and return acknowledgement',
          'Attach notes for mismatches resolved outside AIS feedback',
          'Track post-filing intimation or demand notices',
        ],
        tips: [
          'Good reconciliation reduces the chance of avoidable notices after processing',
        ],
        links: [
          { label: 'TDS Refund Tracker', href: '/tds-refund-tracker' },
        ],
      },
    ],
  },
  {
    id: 'hra-exemption-guide',
    slug: 'hra-exemption-claim',
    title: 'How to Claim HRA Exemption',
    description: 'Understand the HRA exemption inputs, calculation limits, rent evidence, and filing records.',
    category: 'salaried',
    difficulty: 'beginner',
    estimatedTime: '15 mins',
    tags: ['HRA', 'exemption', 'rent', 'deduction'],
    lastUpdated: '2026-06-07',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/hra'],
    steps: [
      {
        id: 'eligibility',
        title: 'Check Eligibility',
        description: 'Understand if you qualify for HRA exemption.',
        checklist: [
          'You receive HRA as part of salary',
          'You live in a rented accommodation',
          'You pay rent for the accommodation',
          'The rented house is not owned by you',
        ],
        tips: [
          'HRA exemption is not available if you live in your own house',
          'You can claim HRA even if landlord is a family member (with proper documentation)',
        ],
      },
      {
        id: 'calculation',
        title: 'Calculate HRA Exemption',
        description: 'HRA exemption is the minimum of three amounts.',
        checklist: [
          'Actual HRA received from employer',
          '50% of salary for metro cities / 40% for non-metro',
          'Rent paid minus 10% of salary',
        ],
        tips: [
          'Metro cities are Delhi, Mumbai, Chennai, and Kolkata',
          'Salary = Basic + DA (if part of retirement benefits)',
          'Use the HRA calculator as an estimate, then verify the salary definition and inputs before claiming',
        ],
        links: [
          { label: 'HRA Calculator', href: '/calculators/hra' },
        ],
      },
      {
        id: 'documentation',
        title: 'Prepare Documents',
        description: 'Gather all required documents for HRA claim.',
        checklist: [
          'Rent receipts for each month (signed by landlord)',
          'Rental agreement copy',
          'Landlord PAN details where required by employer or return rules for the rent amount',
          'Bank statements showing rent payments',
        ],
        tips: [
          'Rent receipts must include landlord name, address, and period',
          'Check the employer\'s accepted receipt format and keep traceable rent-payment evidence',
          'Keep copies of bank transfer records as proof',
        ],
      },
      {
        id: 'submit-employer',
        title: 'Submit to Employer',
        description: 'Provide documents to employer for tax exemption.',
        checklist: [
          'Submit Form 12BB with rent details',
          'Attach rent receipts',
          'Provide landlord PAN declaration (if required)',
          'Submit rental agreement copy',
        ],
        tips: [
          'Submit before your company\'s investment proof deadline',
          'Keep copies of all submitted documents',
        ],
      },
    ],
  },
  
  // Capital Gains Guides
  {
    id: 'stock-gains-guide',
    slug: 'stock-capital-gains-tax',
    title: 'Capital Gains Tax on Stocks & Mutual Funds',
    description: 'Understand STCG and LTCG on equity investments, broker statements, holding periods, exemptions, AIS checks, and filing handoff steps.',
    category: 'capital-gains',
    difficulty: 'intermediate',
    estimatedTime: '25 mins',
    tags: ['capital gains', 'stocks', 'mutual funds', 'STCG', 'LTCG'],
    lastUpdated: '2026-06-07',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/capital-gains', '/capital-gains-import'],
    steps: [
      {
        id: 'understand-types',
        title: 'Understand STCG vs LTCG',
        description: 'Know the difference between short-term and long-term capital gains.',
        checklist: [
          'STCG: Holding period < 12 months for listed equity',
          'LTCG: Holding period ≥ 12 months for listed equity',
          'Listed equity includes stocks and equity mutual funds',
          'Different rules apply to debt funds and other assets',
        ],
        tips: [
          'Holding period is from purchase date to sale date',
          'Check whether each transaction satisfies the conditions for the applicable listed-equity rate',
        ],
      },
      {
        id: 'tax-rates',
        title: 'Know the Tax Rates',
        description: 'Rate checkpoint for listed-equity gains in FY 2025-26; acquisition date, sale date, and transaction type can change the result.',
        checklist: [
          'STCG: 20% flat rate',
          'LTCG: 12.5% above ₹1.25 lakh exemption',
          'No indexation benefit for listed equity',
          'Add 4% Health & Education Cess',
        ],
        tips: [
          'LTCG up to ₹1.25 lakh per year is tax-free',
          'Consider tax-loss harvesting to offset gains',
        ],
      },
      {
        id: 'calculate-gains',
        title: 'Calculate Your Gains',
        description: 'Step-by-step calculation of capital gains.',
        checklist: [
          'Get purchase price and date from contract notes',
          'Get sale price and date from contract notes',
          'Calculate: Sale Price - Purchase Price - Expenses',
          'Separate STCG and LTCG transactions',
          'Sum up gains/losses by category',
        ],
        tips: [
          'Separate brokerage and other allowable transfer expenses; do not assume STT is deductible',
          'For SIP investments, each installment has different holding period',
          'Use FIFO method for partial sales',
        ],
        links: [
          { label: 'Capital Gains Calculator', href: '/calculators/capital-gains' },
          { label: 'Import Broker Statement', href: '/capital-gains-import' },
        ],
      },
      {
        id: 'set-off-carry',
        title: 'Set-off and Carry Forward',
        description: 'Rules for offsetting gains with losses.',
        checklist: [
          'STCG loss can set off against both STCG and LTCG',
          'LTCG loss can only set off against LTCG',
          'Losses can be carried forward for 8 years',
          'File ITR on time to carry forward losses',
        ],
        tips: [
          'Consider tax-loss harvesting before March 31',
          'Do not trade solely for a tax result; keep investment suitability separate from the tax calculation',
        ],
        links: [
          { label: 'Tax Loss Harvesting Tool', href: '/tax-loss-harvesting' },
        ],
      },
      {
        id: 'file-itr',
        title: 'File in ITR',
        description: 'Reporting capital gains in your tax return.',
        checklist: [
          'Use the form selector and current return instructions because the permitted capital-gains cases differ by form',
          'Fill Schedule CG with transaction details',
          'Provide scrip-wise details for equity',
          'Declare exempt LTCG up to ₹1.25L',
        ],
        tips: [
          'Do not assume ITR-1 eligibility or ineligibility from the words capital gains alone; verify the current form conditions',
          'Broker statements can be imported in many tax portals',
        ],
      },
    ],
  },

  // Deductions Guide
  {
    id: 'maximize-deductions',
    slug: 'maximize-tax-deductions',
    title: 'Tax Deductions: Eligibility and Records Guide',
    description: 'AY 2026-27 guide to deduction eligibility and records under Income-tax Act, 1961 sections, with 2025 Act cross-references for 80C, 80D, 80G, and more.',
    category: 'deductions',
    difficulty: 'beginner',
    estimatedTime: '35 mins',
    tags: ['80C', '80D', 'deductions', 'tax saving'],
    lastUpdated: '2026-05-05',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/income-tax', '/calculators/nps', '/elss-comparator'],
    steps: [
      {
        id: 'section-80c',
        title: 'Section 80C Deductions (₹1.5 Lakh; 2025 Act: Section 123)',
        description: 'Most popular section with multiple investment options.',
        checklist: [
          'PPF (Public Provident Fund) - 15 year lock-in',
          'ELSS Mutual Funds - 3 year lock-in, market-linked returns',
          'NSC (National Savings Certificate)',
          'Tax Saving FD (5 year lock-in)',
          'EPF/VPF contributions',
          'Life Insurance premium',
          'Children tuition fees (up to 2 children)',
          'Home loan principal repayment',
          'Sukanya Samriddhi for girl child',
          'NPS (within 80C portion)',
        ],
        tips: [
          'Total limit is ₹1.5 lakh combining all 80C investments',
          'ELSS has a three-year lock-in and market risk; returns are not guaranteed',
          'EPF automatically covers part of your 80C limit',
        ],
        links: [
          { label: 'ELSS Comparator', href: '/elss-comparator' },
          { label: 'PPF Calculator', href: '/calculators/ppf' },
        ],
      },
      {
        id: 'section-80ccd',
        title: 'Section 80CCD - NPS Benefits (Extra ₹50K; employer contribution maps to 2025 Act: Section 124)',
        description: 'Additional deduction for NPS investment.',
        checklist: [
          '80CCD(1): Employee contribution - part of 80C',
          '80CCD(1B): Additional ₹50,000 over 80C',
          '80CCD(2): Employer contribution (up to 10%/14%)',
        ],
        tips: [
          '80CCD(1B) is OVER AND ABOVE the ₹1.5L limit',
          'Total tax benefit can be ₹2 lakh (80C + 80CCD1B)',
          'Government employees get higher employer limit (14%)',
        ],
        links: [
          { label: 'NPS Calculator', href: '/calculators/nps' },
        ],
      },
      {
        id: 'section-80d',
        title: 'Section 80D - Health Insurance (₹25K-₹1L; 2025 Act: Section 126)',
        description: 'Deduction for health insurance premiums.',
        checklist: [
          'Self & family premium: Up to ₹25,000',
          'Parents premium: Additional ₹25,000',
          'Senior citizen limit: ₹50,000 each',
          'Preventive health check-up: ₹5,000 (within above)',
        ],
        tips: [
          'Maximum deduction can be ₹1 lakh (all senior citizens)',
          'Premium for self can include spouse and dependent children',
          'Keep premium receipts and policy documents',
        ],
      },
      {
        id: 'section-24b',
        title: 'Section 24(b) - Home Loan Interest (₹2L)',
        description: 'Deduction on home loan interest for self-occupied property.',
        checklist: [
          'Self-occupied property: Up to ₹2 lakh interest',
          'Compute let-out-property interest and apply the current set-off and carry-forward limits',
          'Under construction: Interest deductible in 5 installments',
          'Joint loan: Each co-owner claims separately',
        ],
        tips: [
          'Possession must be within 5 years of loan',
          'Get interest certificate from bank',
          'Pre-EMI interest can be claimed post-possession',
        ],
      },
      {
        id: 'other-sections',
        title: 'Other Important Deductions',
        description: 'Additional deductions often overlooked.',
        checklist: [
          '80E (2025 Act: Section 129): Education loan interest (no limit)',
          '80G (2025 Act: Section 133): Donations to approved charities',
          '80TTA (2025 Act: Section 153): Savings account interest (₹10,000)',
          '80TTB: Senior citizen interest (₹50,000)',
          '80U/80DD: Disability deductions',
          '80DDB: Medical treatment for specified diseases',
        ],
        tips: [
          'Verify the eligible lender, borrower, and interest period before claiming education-loan interest',
          '80G donations need proper receipts with PAN of charity',
          '80TTA doesn\'t apply to FD interest',
        ],
      },
    ],
  },

  // Business Guide
  {
    id: 'freelancer-tax-guide',
    slug: 'freelancer-tax-filing',
    title: 'Tax Filing Guide for Freelancers',
    description: 'Guide for freelancers and consultants on income reporting, expense records, advance tax, and ITR filing.',
    category: 'business',
    difficulty: 'intermediate',
    estimatedTime: '40 mins',
    tags: ['freelancer', 'consultant', 'ITR-4', 'presumptive'],
    lastUpdated: '2026-06-07',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/income-tax', '/calculators/advance-tax'],
    steps: [
      {
        id: 'income-tracking',
        title: 'Track Your Income',
        description: 'Maintain records of all freelance income.',
        checklist: [
          'Keep copies of all invoices issued',
          'Track payments received (date, amount, client)',
          'Note TDS deducted by clients',
          'Maintain separate bank account (recommended)',
          'Track international payments and exchange rates',
        ],
        tips: [
          'Use accounting software or spreadsheet for tracking',
          'Match TDS deducted with Form 26AS',
          'Confirm the accounting method used and reconcile invoices, receipts, and outstanding amounts consistently',
        ],
      },
      {
        id: 'expense-management',
        title: 'Document Business Expenses',
        description: 'Keep records of all legitimate business expenses.',
        checklist: [
          'Internet and phone bills',
          'Computer and equipment purchases',
          'Software and tool subscriptions',
          'Co-working space / home office expenses',
          'Professional development and courses',
          'Travel expenses for work',
          'Professional fees (accountant, lawyer)',
        ],
        tips: [
          'Keep bills and receipts for all expenses',
          'Home office can be claimed proportionally',
          'Only business-related expenses are deductible',
        ],
      },
      {
        id: 'choose-scheme',
        title: 'Choose Taxation Scheme',
        description: 'Select between regular and presumptive taxation.',
        checklist: [
          'Regular: Actual profit (Income - Expenses)',
          'Presumptive 44ADA: 50% of gross receipts as profit',
          'Presumptive limit: ₹75 lakh (₹50L if cash > 5%)',
          'Presumptive taxation changes profit computation, but receipts, bank records, and eligibility evidence still matter',
        ],
        tips: [
          'Check the recordkeeping and audit obligations that apply before choosing presumptive taxation',
          'If expenses > 50%, regular scheme may be better',
          'Do not apply the Section 44AD lockout rule to Section 44ADA without checking the provision that covers the profession',
        ],
      },
      {
        id: 'advance-tax',
        title: 'Pay Advance Tax',
        description: 'Quarterly advance tax payments if tax > ₹10,000.',
        checklist: [
          'June 15: 15% of estimated tax',
          'September 15: 45% of estimated tax',
          'December 15: 75% of estimated tax',
          'March 15: 100% of estimated tax',
        ],
        tips: [
          'Under presumptive 44ADA, pay entire tax by March 15',
          'Interest u/s 234B/234C for late/short payment',
          'Estimate conservatively to avoid underpayment',
        ],
        links: [
          { label: 'Advance Tax Calculator', href: '/calculators/advance-tax' },
        ],
      },
      {
        id: 'file-return',
        title: 'Select the Return Form and File',
        description: 'Choose the return form from the complete income profile, then confirm the current due date and verification step.',
        checklist: [
          'Use ITR-4 only when the taxpayer and presumptive-income facts meet its current eligibility conditions',
          'Use ITR-3 for regular business income',
          'Confirm the notified due date for the taxpayer and audit position',
          'Include all income sources',
          'E-verify within 30 days',
        ],
        tips: [
          'Keep GST separate from ITR (if registered)',
          'Reconcile claimed TDS credits with Form 26AS and supporting certificates',
          'Claim refund if TDS > tax liability',
        ],
      },
    ],
  },

  // Compliance Guide
  {
    id: 'tax-deadlines',
    slug: 'important-tax-deadlines',
    title: 'Important Tax Deadlines & Compliance Calendar',
    description: 'Track common tax deadlines for individuals and businesses, then confirm the due date and filing obligation for the relevant case.',
    category: 'compliance',
    difficulty: 'beginner',
    estimatedTime: '10 mins',
    tags: ['deadlines', 'due dates', 'compliance', 'calendar'],
    lastUpdated: '2026-06-07',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/compliance-calendar'],
    steps: [
      {
        id: 'itr-deadlines',
        title: 'ITR Filing Deadlines',
        description: 'Identify the return category and confirm the notified filing and verification dates.',
        checklist: [
          'Identify whether the taxpayer falls under a non-audit, audit, transfer-pricing, belated, or revised-return route',
          'Confirm the notified due date on the Income Tax e-Filing Portal for the relevant assessment year',
          'Record any extension notification instead of relying on an old calendar',
          'Track return filing and e-verification as separate deadlines',
        ],
        tips: [
          'File early enough to resolve record mismatches before the notified date',
          'Check the current late-filing consequences and loss carry-forward rules for the return',
        ],
      },
      {
        id: 'advance-tax-dates',
        title: 'Advance Tax Due Dates',
        description: 'Quarterly advance tax payment schedule.',
        checklist: [
          'June 15: 15% of tax liability',
          'September 15: 45% of tax liability',
          'December 15: 75% of tax liability',
          'March 15: 100% of tax liability',
          'Confirm applicability, exceptions, and the current instalment schedule before paying',
        ],
        tips: [
          'Reforecast the year when income or credits change instead of reusing the first estimate',
          'Check current threshold and senior-citizen exceptions against the official instruction',
        ],
      },
      {
        id: 'tds-dates',
        title: 'TDS Compliance Dates',
        description: 'Build the TDS calendar from the deduction type, challan month, and quarterly statement.',
        checklist: [
          'Identify the applicable TDS section, challan month, and quarterly return form',
          'Confirm the deposit date and statement due date for the relevant period',
          'Assign an owner for deductee PAN checks, challan matching, and return preparation',
          'Retain challans, filed statements, acknowledgements, and correction records',
        ],
        tips: [
          'Interest, late fee, and correction exposure depend on the actual delay and filing facts',
        ],
      },
      {
        id: 'gst-dates',
        title: 'GST Compliance Dates',
        description: 'Build the GST calendar from registration status, return frequency, and state-specific facts.',
        checklist: [
          'Identify each registration, return form, filing frequency, and tax period',
          'Confirm the due date and any extension on the GST Portal',
          'Schedule invoice, input-tax-credit, liability, and ledger reconciliation before filing',
          'Retain ARN, payment, amendment, and annual-return records',
        ],
        tips: [
          'Late fee and interest depend on the return, delay, liability, and current notification',
        ],
      },
    ],
  },
  {
    id: 'gst-notice-handling',
    slug: 'gst-notice-handling-guide',
    title: 'GST Notice Handling Guide',
    description: 'Step-by-step guide to read a GST notice, gather records, reconcile ledgers, prepare a reply, and decide whether payment or professional review is needed.',
    category: 'compliance',
    difficulty: 'intermediate',
    estimatedTime: '30 mins',
    tags: ['GST notice', 'DRC-01', 'DRC-03', 'GST compliance'],
    lastUpdated: '2026-05-24',
    author: 'MyeCA Editorial Team',
    relatedCalculators: ['/calculators/gst'],
    relatedResources: [
      { label: 'GST Notice Compliance Service', href: '/services/notice-compliance' },
      { label: 'GST Returns Service', href: '/services/gst-returns' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Expert Consultation', href: '/expert-consultation' },
    ],
    steps: [
      {
        id: 'identify-notice',
        title: 'Identify the Notice and Timeline',
        description: 'Read the form, period, section, demand amount, and reply deadline first.',
        checklist: [
          'Download the notice and attachments from the GST portal',
          'Note the form type, tax period, section, officer details, and due date',
          'Separate mismatch, demand, registration, refund, e-way bill, and enforcement issues',
          'Create a response file with notice PDF, ledger snapshots, returns, invoices, and payment records',
        ],
        tips: [
          'Do not reply from memory; build the response from portal records and books',
          'Escalate quickly if the notice involves inspection, summons, large demand, or short deadline',
        ],
        links: [
          { label: 'GST Notice Compliance Service', href: '/services/notice-compliance' },
        ],
      },
      {
        id: 'reconcile-records',
        title: 'Reconcile GST Records',
        description: 'Match the notice allegation against returns, ledgers, invoices, and books.',
        checklist: [
          'Match GSTR-1, GSTR-3B, input tax credit, cash ledger, credit ledger, and liability ledger',
          'Check invoice-level differences, amendments, credit notes, debit notes, and reverse charge entries',
          'Compare books with portal data before drafting the reply',
          'Prepare a short explanation table for each mismatch',
        ],
        tips: [
          'Most replies are stronger when numbers are presented in a table with document references',
        ],
        links: [
          { label: 'GST Returns Service', href: '/services/gst-returns' },
        ],
      },
      {
        id: 'decide-response',
        title: 'Decide Reply, Payment, or Adjustment',
        description: 'Choose the response path based on whether the demand is accepted, partly accepted, or disputed.',
        checklist: [
          'If accepted, compute tax, interest, penalty, and payment route before filing',
          'If disputed, prepare legal grounds and evidence annexures',
          'If payment has already been made, map it to the demand or adjustment process where applicable',
          'Keep acknowledgement and ARN after submitting the response',
        ],
        tips: [
          'Use voluntary payment or adjustment forms only after confirming the demand reference and amount',
          'Do not admit a demand in the reply unless the taxpayer has approved the position',
        ],
        links: [
          { label: 'GST Portal DRC-03A FAQ', href: 'https://tutorial.gst.gov.in/userguide/demandsandrecovery/FAQs_GST_FORM_DRC-03.htm' },
        ],
      },
      {
        id: 'post-reply',
        title: 'Track the Case After Reply',
        description: 'A reply is not the end of the matter; track hearings, orders, and payment status.',
        checklist: [
          'Monitor the GST portal inbox and case history',
          'Save reply acknowledgement, annexures, and officer communications',
          'Track order, demand, rectification, appeal, or closure status',
          'Update books and compliance calendar for recurring issues',
        ],
        tips: [
          'If the same mismatch recurs across periods, fix the filing process rather than only replying to one notice',
        ],
      },
    ],
  },
];

// Helper functions
export function getGuidesByCategory(category: GuideCategory): TaxGuide[] {
  return TAX_GUIDES.filter(g => g.category === category);
}

export function getGuideBySlug(slug: string): TaxGuide | undefined {
  return TAX_GUIDES.find(g => g.slug === slug);
}

export function getGuideOfficialSources(slug: string): GuideOfficialSource[] {
  return GUIDE_OFFICIAL_SOURCES[slug] ?? [];
}

export function searchGuides(query: string): TaxGuide[] {
  const lowerQuery = query.toLowerCase();
  return TAX_GUIDES.filter(g =>
    g.title.toLowerCase().includes(lowerQuery) ||
    g.description.toLowerCase().includes(lowerQuery) ||
    g.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
