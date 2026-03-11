// Interactive Tax Guides Data

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
    description: 'Step-by-step guide to file your Income Tax Return as a salaried individual. Covers Form 16, deductions, and submission process.',
    category: 'salaried',
    difficulty: 'beginner',
    estimatedTime: '30 mins',
    tags: ['ITR-1', 'Form 16', 'salary', 'tax filing'],
    lastUpdated: '2024-06-15',
    author: 'CA Rajesh Kumar',
    relatedCalculators: ['/calculators/income-tax', '/calculators/hra'],
    steps: [
      {
        id: 'gather-docs',
        title: 'Gather Required Documents',
        description: 'Collect all necessary documents before starting the filing process.',
        checklist: [
          'Form 16 from employer',
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
          'Note: New regime is default from FY 2023-24',
        ],
        tips: [
          'Use our Tax Regime Calculator to compare both options',
          'If your deductions exceed \u20B93-4 lakhs, old regime might be better',
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
          'Landlord PAN card (if rent > \u20B91 lakh/year)',
          'Bank statements showing rent payments',
        ],
        tips: [
          'Rent receipts must include landlord name, address, and period',
          'Revenue stamps required on receipts above \u20B95,000',
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
    relatedCalculators: ['/calculators/capital-gains', '/portfolio-dashboard'],
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
        description: 'Current tax rates for equity capital gains (FY 2024-25).',
        checklist: [
          'STCG: 20% flat rate',
          'LTCG: 12.5% above \u20B91.25 lakh exemption',
          'No indexation benefit for listed equity',
          'Add 4% Health & Education Cess',
        ],
        tips: [
          'LTCG up to \u20B91.25 lakh per year is tax-free',
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
          'Declare exempt LTCG up to \u20B91.25L',
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
    description: 'Comprehensive guide to all available tax deductions under Section 80C, 80D, 80G, and more.',
    category: 'deductions',
    difficulty: 'beginner',
    estimatedTime: '35 mins',
    tags: ['80C', '80D', 'deductions', 'tax saving'],
    lastUpdated: '2024-05-25',
    author: 'CA Priya Sharma',
    relatedCalculators: ['/calculators/income-tax', '/calculators/nps', '/elss-comparator'],
    steps: [
      {
        id: 'section-80c',
        title: 'Section 80C Deductions (\u20B91.5 Lakh)',
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
          'Total limit is \u20B91.5 lakh combining all 80C investments',
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
        title: 'Section 80CCD - NPS Benefits (Extra \u20B950K)',
        description: 'Additional deduction for NPS investment.',
        checklist: [
          '80CCD(1): Employee contribution - part of 80C',
          '80CCD(1B): Additional \u20B950,000 over 80C',
          '80CCD(2): Employer contribution (up to 10%/14%)',
        ],
        tips: [
          '80CCD(1B) is OVER AND ABOVE the \u20B91.5L limit',
          'Total tax benefit can be \u20B92 lakh (80C + 80CCD1B)',
          'Government employees get higher employer limit (14%)',
        ],
        links: [
          { label: 'NPS Calculator', href: '/calculators/nps' },
        ],
      },
      {
        id: 'section-80d',
        title: 'Section 80D - Health Insurance (\u20B925K-\u20B91L)',
        description: 'Deduction for health insurance premiums.',
        checklist: [
          'Self & family premium: Up to \u20B925,000',
          'Parents premium: Additional \u20B925,000',
          'Senior citizen limit: \u20B950,000 each',
          'Preventive health check-up: \u20B95,000 (within above)',
        ],
        tips: [
          'Maximum deduction can be \u20B91 lakh (all senior citizens)',
          'Premium for self can include spouse and dependent children',
          'Keep premium receipts and policy documents',
        ],
      },
      {
        id: 'section-24b',
        title: 'Section 24(b) - Home Loan Interest (\u20B92L)',
        description: 'Deduction on home loan interest for self-occupied property.',
        checklist: [
          'Self-occupied property: Up to \u20B92 lakh interest',
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
          '80E: Education loan interest (no limit)',
          '80G: Donations to approved charities',
          '80TTA: Savings account interest (\u20B910,000)',
          '80TTB: Senior citizen interest (\u20B950,000)',
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
          'Presumptive limit: \u20B975 lakh (\u20B950L if cash > 5%)',
          'No expense documentation needed for presumptive',
        ],
        tips: [
          'Presumptive is simpler - no books maintenance required',
          'If expenses > 50%, regular scheme may be better',
          'Once opted out of presumptive, cant come back for 5 years',
        ],
      },
      {
        id: 'advance-tax',
        title: 'Pay Advance Tax',
        description: 'Quarterly advance tax payments if tax > \u20B910,000.',
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
          'Penalty of \u20B95,000 for late filing (\u20B91,000 if income < \u20B95L)',
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
          'Not required if tax liability < \u20B910,000',
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
          'Late filing fee of \u20B9200 per day',
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
          'Late fee: \u20B950/day (\u20B920 for nil return)',
          'Interest: 18% on late tax payment',
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

