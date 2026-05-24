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

export type GuideCategory = 'salaried' | 'business' | 'capital-gains' | 'nri' | 'deductions' | 'compliance';

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
    author: 'CA Rajesh Kumar',
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
          'TDS in Form 16 should match Form 26AS exactly',
        ],
      },
      {
        id: 'choose-regime',
        title: 'Choose Tax Regime',
        description: 'Decide between Old and New Tax Regime based on your deductions.',
        checklist: [
          'Calculate tax under old regime with all deductions',
          'Calculate tax under new regime (lower rates, no deductions)',
          'Compare both and choose the beneficial one',
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
          'E-verification must be done within 30 days of filing',
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
    author: 'MyeCA Tax Desk',
    relatedCalculators: ['/calculators/income-tax', '/itr/form-selector'],
    relatedResources: [
      { label: 'ITR for Salaried Employees', href: '/services/itr-for-salaried' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Start Filing', href: '/itr/form-selector' },
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
    id: 'section-80c-ay-2026-guide',
    slug: 'section-80c-deductions-ay-2026-27',
    title: 'Section 80C Deduction Guide for AY 2026-27',
    description: 'Plan and verify Section 80C deductions, common eligible investments, proof checks, old-regime fit, and links to related calculators for AY 2026-27.',
    category: 'deductions',
    difficulty: 'beginner',
    estimatedTime: '20 mins',
    tags: ['80C', 'deductions', 'old regime', 'tax saving'],
    lastUpdated: '2026-05-24',
    author: 'MyeCA Tax Desk',
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
    author: 'MyeCA Tax Desk',
    relatedCalculators: ['/calculators/income-tax', '/itr/form-selector'],
    relatedResources: [
      { label: 'Expert Consultation', href: '/expert-consultation' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Start Filing', href: '/itr/form-selector' },
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
    description: 'Complete guide to understanding and claiming House Rent Allowance exemption with proper documentation.',
    category: 'salaried',
    difficulty: 'beginner',
    estimatedTime: '15 mins',
    tags: ['HRA', 'exemption', 'rent', 'deduction'],
    lastUpdated: '2024-05-20',
    author: 'CA Priya Sharma',
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
          'Use our HRA calculator for accurate computation',
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
          'Landlord PAN card (if rent > ₹1 lakh/year)',
          'Bank statements showing rent payments',
        ],
        tips: [
          'Rent receipts must include landlord name, address, and period',
          'Revenue stamps required on receipts above ₹5,000',
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
    description: 'Understanding STCG and LTCG on equity investments including calculation, exemptions, and filing.',
    category: 'capital-gains',
    difficulty: 'intermediate',
    estimatedTime: '25 mins',
    tags: ['capital gains', 'stocks', 'mutual funds', 'STCG', 'LTCG'],
    lastUpdated: '2024-06-01',
    author: 'CA Rajesh Kumar',
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
          'STT should be paid on both buy and sell for preferential rates',
        ],
      },
      {
        id: 'tax-rates',
        title: 'Know the Tax Rates',
        description: 'Current tax-rate estimate for equity capital gains (FY 2025-26).',
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
          'Include brokerage and STT in expenses',
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
          'Book losses strategically to offset future gains',
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
          'Use ITR-2 if you have capital gains',
          'Fill Schedule CG with transaction details',
          'Provide scrip-wise details for equity',
          'Declare exempt LTCG up to ₹1.25L',
        ],
        tips: [
          'ITR-1 cannot be used if you have capital gains',
          'Broker statements can be imported in many tax portals',
        ],
      },
    ],
  },

  // Deductions Guide
  {
    id: 'maximize-deductions',
    slug: 'maximize-tax-deductions',
    title: 'Maximize Your Tax Deductions - Complete Guide',
    description: 'Comprehensive AY 2026-27 guide to deductions under Income-tax Act, 1961 sections, with 2025 Act cross-references for 80C, 80D, 80G, and more.',
    category: 'deductions',
    difficulty: 'beginner',
    estimatedTime: '35 mins',
    tags: ['80C', '80D', 'deductions', 'tax saving'],
    lastUpdated: '2026-05-05',
    author: 'CA Priya Sharma',
    relatedCalculators: ['/calculators/income-tax', '/calculators/nps', '/elss-comparator'],
    steps: [
      {
        id: 'section-80c',
        title: 'Section 80C Deductions (₹1.5 Lakh; 2025 Act: Section 123)',
        description: 'Most popular section with multiple investment options.',
        checklist: [
          'PPF (Public Provident Fund) - 15 year lock-in',
          'ELSS Mutual Funds - 3 year lock-in, best returns',
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
          'ELSS has shortest lock-in with highest return potential',
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
          'Let-out property: No limit on interest deduction',
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
          '80E has no limit - great for expensive education',
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
    description: 'Complete guide for freelancers and consultants on income reporting, expenses, advance tax, and ITR filing.',
    category: 'business',
    difficulty: 'intermediate',
    estimatedTime: '40 mins',
    tags: ['freelancer', 'consultant', 'ITR-4', 'presumptive'],
    lastUpdated: '2024-06-10',
    author: 'CA Rajesh Kumar',
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
          'Income is taxable on accrual basis (when earned, not received)',
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
          'No expense documentation needed for presumptive',
        ],
        tips: [
          'Presumptive is simpler - no books maintenance required',
          'If expenses > 50%, regular scheme may be better',
          "Once opted out of presumptive, can't come back for 5 years",
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
        title: 'File ITR-4',
        description: 'File your tax return before due date.',
        checklist: [
          'Use ITR-4 for presumptive income',
          'Use ITR-3 for regular business income',
          'Due date: July 31 (extended sometimes)',
          'Include all income sources',
          'E-verify within 30 days',
        ],
        tips: [
          'Keep GST separate from ITR (if registered)',
          'TDS credits will reflect automatically from 26AS',
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
    description: 'Never miss a tax deadline with this comprehensive compliance calendar for individuals and businesses.',
    category: 'compliance',
    difficulty: 'beginner',
    estimatedTime: '10 mins',
    tags: ['deadlines', 'due dates', 'compliance', 'calendar'],
    lastUpdated: '2024-06-01',
    author: 'CA Priya Sharma',
    relatedCalculators: ['/compliance-calendar'],
    steps: [
      {
        id: 'itr-deadlines',
        title: 'ITR Filing Deadlines',
        description: 'Annual income tax return due dates.',
        checklist: [
          'July 31: ITR for individuals (non-audit)',
          'October 31: ITR for audit cases',
          'November 30: Transfer pricing cases',
          'December 31: Belated/Revised return deadline',
        ],
        tips: [
          'File early to avoid last-minute rush',
          'Penalty of ₹5,000 for late filing (₹1,000 if income < ₹5L)',
          'Cannot claim losses if filed late',
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
        ],
        tips: [
          'Not required if tax liability < ₹10,000',
          'Senior citizens exempt if no business income',
        ],
      },
      {
        id: 'tds-dates',
        title: 'TDS Compliance Dates',
        description: 'TDS payment and return filing deadlines.',
        checklist: [
          'TDS Payment: 7th of next month (30 April for March)',
          'Q1 TDS Return: July 31',
          'Q2 TDS Return: October 31',
          'Q3 TDS Return: January 31',
          'Q4 TDS Return: May 31',
        ],
        tips: [
          'Delay in TDS payment attracts 1.5% per month interest',
          'Late filing fee of ₹200 per day',
        ],
      },
      {
        id: 'gst-dates',
        title: 'GST Compliance Dates',
        description: 'GST return filing deadlines.',
        checklist: [
          'GSTR-3B: 20th of next month',
          'GSTR-1: 11th of next month (monthly)',
          'GSTR-1: 13th of next quarter (QRMP)',
          'GSTR-9: December 31 (annual)',
          'GSTR-9C: December 31 (audit)',
        ],
        tips: [
          'Late fee: ₹50/day (₹20 for nil return)',
          'Interest: 18% on late tax payment',
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
    author: 'MyeCA Tax Desk',
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

export function searchGuides(query: string): TaxGuide[] {
  const lowerQuery = query.toLowerCase();
  return TAX_GUIDES.filter(g =>
    g.title.toLowerCase().includes(lowerQuery) ||
    g.description.toLowerCase().includes(lowerQuery) ||
    g.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
}
