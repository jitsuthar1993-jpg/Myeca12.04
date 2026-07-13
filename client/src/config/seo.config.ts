import { FINANCIAL_GENERATOR_CATALOGUE } from "@/data/generator-catalog";
import { HOME_SEO_CONFIG } from "./home-seo";

export interface SEOConfigItem {
  title: string;
  description: string;
  keywords: string[];
  type: 'website' | 'calculator' | 'service' | 'article';
  calculatorData?: {
    type: string;
    features: string[];
    accuracy: string;
    updates: string;
  };
  serviceData?: {
    price: string;
    rating: string;
    reviews: string;
    availability: string;
  };
  faqItems?: { q: string; a: string }[];
  breadcrumbs: { name: string; url: string }[];
  noindex?: boolean;
}

export const SEO_CONFIG: Record<string, SEOConfigItem> = {
  // Core Pages
  '/': HOME_SEO_CONFIG,
  '/services': {
    title: 'Professional Tax & Business Services | MyeCA.in',
    description: 'Explore our range of professional services including GST registration, company incorporation, trademark filing, and tax notice compliance.',
    keywords: ['tax services', 'business registration India', 'GST consultant', 'company registration', 'legal compliance'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }]
  },
  '/calculators': {
    title: 'Tax and Finance Calculators for Indian Filing | MyeCA.in',
    description: 'Use MyeCA.in calculators for income tax, GST, capital gains, TDS, loans, SIP, NPS, HRA, and other planning checks before filing or expert review.',
    keywords: ['tax calculators India', 'income tax calculator', 'GST calculator', 'capital gains calculator', 'financial calculators'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }]
  },

  '/all-services': {
    title: 'Professional Services Catalogue | MyeCA.in',
    description: 'Compare tax filing, GST, business-registration, compliance, document, and calculator workflows by scope and next step.',
    keywords: ['CA services', 'tax services', 'business registration', 'service catalogue', 'tax APIs'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'All Services', url: '/all-services' }]
  },
  '/dashboard': {
    title: 'User Dashboard | MyeCA.in',
    description: 'Manage your tax returns, service orders, documents, and notifications in a signed-in workspace.',
    keywords: ['tax dashboard', 'manage ITR', 'service status', 'tax documents'],
    type: 'website',
    noindex: true,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Dashboard', url: '/dashboard' }]
  },

  // Tax Calculators
  '/calculators/income-tax': {
    title: 'Income Tax Calculator AY 2026-27 | New vs Old Regime | MyeCA.in',
    description: 'Estimate income tax for AY 2026-27. Compare New and Old tax regimes with 1961 Act sections and Income-tax Act, 2025 equivalents.',
    keywords: ['income tax calculator 2026', 'AY 2026-27 tax calculator', 'old vs new regime calculator', 'income tax slabs 2026'],
    type: 'calculator',
    calculatorData: {
      type: 'Income Tax Calculator',
      features: ['Real-time comparison', 'Deduction optimization', 'AY 2026-27 support', '2025 Act section references'],
      accuracy: 'Estimate for common cases',
      updates: 'Updated with Union Budget 2025'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Income Tax', url: '/calculators/income-tax' }]
  },
  '/calculators/capital-gains': {
    title: 'Capital Gains Tax Calculator 2026 | STCG & LTCG Estimate | MyeCA.in',
    description: 'Estimate capital gains tax on stocks, mutual funds, property and gold. Review complex asset, exemption, acquisition-date and special-rate cases before filing.',
    keywords: ['capital gains calculator', 'LTCG calculator', 'STCG calculator', 'tax on shares', 'property tax calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Capital Gains Calculator',
      features: ['Equity & Property support', 'LTCG/STCG breakdown', 'Estimate caveats'],
      accuracy: 'Estimate for common cases',
      updates: 'Production caveats added'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Capital Gains', url: '/calculators/capital-gains' }]
  },
  '/capital-gains-import': {
    title: 'Capital Gains Statement Import Tool | Broker Tax P&L Parser | MyeCA.in',
    description: 'Upload broker capital gains statements from Zerodha, Groww, ICICI Direct, HDFC Securities, or CSV files to estimate STCG, LTCG, and ITR-ready tax summaries.',
    keywords: ['capital gains import', 'broker tax P&L parser', 'Zerodha capital gains', 'Groww capital gains statement', 'ITR capital gains report'],
    type: 'calculator',
    calculatorData: {
      type: 'Capital Gains Import Tool',
      features: ['Broker statement upload', 'STCG/LTCG summary', 'ITR export support'],
      accuracy: 'Estimate based on imported statement data',
      updates: 'AY 2026-27 capital gains rates'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Capital Gains Import', url: '/capital-gains-import' }]
  },
  '/calculators/advance-tax': {
    title: 'FY 2025-26 Advance Tax Reconciliation | MyeCA.in',
    description: 'Reconcile the historical FY 2025-26 advance-tax installment schedule for AY 2026-27. Tax Year 2026-27 calculations are not yet available.',
    keywords: ['FY 2025-26 advance tax reconciliation', 'AY 2026-27 advance tax', 'historical advance tax schedule'],
    type: 'calculator',
    calculatorData: {
      type: 'Historical Advance Tax Reconciliation',
      features: ['FY 2025-26 quarterly breakdown', 'Recorded-payment reconciliation'],
      accuracy: 'Historical estimate; excludes interest calculation',
      updates: 'FY 2025-26 / AY 2026-27 only'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Advance Tax', url: '/calculators/advance-tax' }]
  },
  '/calculators/hra': {
    title: 'HRA Calculator 2026 | House Rent Allowance Exemption | MyeCA.in',
    description: 'Estimate your HRA tax exemption for FY 2025-26. Review the exempt and taxable portion of your house rent allowance before filing.',
    keywords: ['HRA calculator', 'house rent allowance exemption', 'calculate HRA tax', 'rent receipt calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'HRA Calculator',
      features: ['Metro/Non-metro calculation', 'Section 10(13A) compliance', 'Browser-based estimate'],
      accuracy: 'Rule-based estimate',
      updates: 'FY 2025-26 compliant'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'HRA Calculator', url: '/calculators/hra' }]
  },
  '/calculators/tax-regime': {
    title: 'New vs Old Tax Regime Calculator 2026 | Which is Better? | MyeCA.in',
    description: 'Compare Old vs New Tax Regime for AY 2026-27. Real-time analysis of tax savings based on your investments, deductions, and Section 87A rebate.',
    keywords: ['tax regime comparison', 'old vs new tax regime', 'best tax regime for me', 'tax savings AY 2026-27'],
    type: 'calculator',
    calculatorData: {
      type: 'Regime Comparison Tool',
      features: ['Investment-linked analysis', 'Section 80C/80D support with 2025 Act references', 'AY 2026-27 rebate comparison'],
      accuracy: 'Estimate for common cases',
      updates: 'Budget 2025 ready'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Tax Regime', url: '/calculators/tax-regime' }]
  },
  '/calculators/regime-comparator': {
    title: 'Old vs New Tax Regime Comparator AY 2026-27 | MyeCA.in',
    description: 'Compare old and new tax regimes side by side for AY 2026-27 with deductions, standard deduction, Section 87A rebate, and evidence-led guidance.',
    keywords: ['old vs new tax regime comparator', 'tax regime comparison calculator', 'regime comparator India', 'AY 2026-27 tax comparison'],
    type: 'calculator',
    calculatorData: {
      type: 'Tax Regime Comparator',
      features: ['Side-by-side regime comparison', 'Deduction impact analysis', 'AY 2026-27 slab support'],
      accuracy: 'Estimate for common cases',
      updates: 'Budget 2025 ready'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Regime Comparator', url: '/calculators/regime-comparator' }]
  },
  '/calculators/hsn-finder': {
    noindex: true,
    title: 'HSN and SAC Reference Search | MyeCA.in',
    description: 'Search a limited HSN and SAC shortlist, then verify the complete classification and applicable GST notification.',
    keywords: ['hsn code reference', 'hsn search', 'sac code reference'],
    type: 'calculator',
    calculatorData: {
      type: 'HSN Finder',
      features: ['Limited reference search', 'Goods and services tabs', 'Verification reminder'],
      accuracy: 'Orientation only; not a classification or rate determination',
      updates: 'Verify against current CBIC schedules and notifications'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'HSN Finder', url: '/calculators/hsn-finder' }]
  },
  '/calculators/gst': {
    title: 'GST Calculator | Add or Remove GST | CGST SGST IGST | MyeCA.in',
    description: 'Calculate GST on invoices. Add or remove GST and split tax into CGST, SGST or IGST with current and legacy rate chips.',
    keywords: ['GST calculator', 'add GST calculator', 'remove GST calculator', 'CGST SGST IGST calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'GST Calculator',
      features: ['Add/remove GST', 'CGST/SGST/IGST split', 'User-selected notified or legacy rate chips'],
      accuracy: 'Rule-based estimate',
      updates: 'User-selected notified rate and supply-type assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'GST Calculator', url: '/calculators/gst' }]
  },
  '/calculators/salary': {
    title: 'CTC to In-Hand Salary Calculator 2026 | Take Home Pay | MyeCA.in',
    description: 'Estimate monthly in-hand salary from annual CTC, basic, HRA, PF, professional tax and estimated TDS.',
    keywords: ['salary calculator', 'CTC to in hand salary calculator', 'take home salary calculator', 'monthly salary calculator India'],
    type: 'calculator',
    calculatorData: {
      type: 'Salary Calculator',
      features: ['CTC breakup', 'PF deduction', 'Estimated TDS'],
      accuracy: 'Estimate',
      updates: 'AY 2026-27 tax estimate'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Salary Calculator', url: '/calculators/salary' }]
  },
  '/calculators/gratuity': {
    title: 'Gratuity Formula Calculator India | 15/26 Estimate | MyeCA.in',
    description: 'Estimate a gratuity formula amount using last-drawn Basic plus DA, service duration and the 15/26 calculation for covered employees.',
    keywords: ['gratuity calculator', 'gratuity formula India', '15/26 gratuity calculation', 'employee gratuity calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Gratuity Calculator',
      features: ['15/26 formula', 'Service year rounding', 'Eligibility message'],
      accuracy: 'Formula estimate',
      updates: 'Payment of Gratuity Act formula'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Gratuity Calculator', url: '/calculators/gratuity' }]
  },
  '/calculators/epf': {
    title: 'EPF Calculator | Provident Fund Projection | MyeCA.in',
    description: 'Project EPF maturity with employee contribution, employer contribution, EPS diversion and interest rate assumptions.',
    keywords: ['EPF calculator', 'PF calculator', 'provident fund calculator', 'EPF maturity calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'EPF Calculator',
      features: ['Employee and employer contribution', 'EPS split', 'Interest projection'],
      accuracy: 'Projection estimate',
      updates: 'User-entered interest and contribution assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'EPF Calculator', url: '/calculators/epf' }]
  },
  '/calculators/rd': {
    title: 'RD Calculator | Recurring Deposit Maturity Estimate | MyeCA.in',
    description: 'Estimate recurring deposit maturity, total contributions and interest using your monthly deposit, rate and tenure assumptions.',
    keywords: ['RD calculator', 'recurring deposit calculator', 'RD maturity calculator', 'monthly deposit calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'RD Calculator',
      features: ['Monthly deposit planning', 'Quarterly-credit approximation', 'Interest earned'],
      accuracy: 'Projection estimate',
      updates: 'Quarterly-credit approximation using user-entered assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'RD Calculator', url: '/calculators/rd' }]
  },
  '/calculators/lumpsum': {
    title: 'Lumpsum Calculator | Investment Growth Estimate | MyeCA.in',
    description: 'Project one-time mutual fund investment growth with expected return, wealth gain, investment horizon, and inflation-adjusted value for planning.',
    keywords: ['lumpsum calculator', 'mutual fund lumpsum calculator', 'investment return calculator', 'future value calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Lumpsum Calculator',
      features: ['Constant annual return projection', 'Nominal gain or loss', 'Inflation-adjusted value'],
      accuracy: 'Projection estimate',
      updates: 'User-entered return and inflation assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Lumpsum Calculator', url: '/calculators/lumpsum' }]
  },
  '/calculators/swp': {
    title: 'SWP Calculator | Systematic Withdrawal Projection | MyeCA.in',
    description: 'Plan systematic withdrawals from mutual fund corpus and check whether your corpus lasts through the selected period.',
    keywords: ['SWP calculator', 'systematic withdrawal plan calculator', 'retirement withdrawal calculator', 'monthly withdrawal calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'SWP Calculator',
      features: ['Constant monthly return projection', 'Corpus depletion check', 'Remaining balance'],
      accuracy: 'Projection estimate',
      updates: 'User-entered return and withdrawal assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'SWP Calculator', url: '/calculators/swp' }]
  },
  '/calculators/inflation': {
    title: 'Inflation Calculator | Future Cost and Purchasing Power | MyeCA.in',
    description: 'Estimate future cost and the future purchasing power of an unchanged amount using your inflation-rate and period assumptions.',
    keywords: ['inflation calculator', 'future cost calculator', 'purchasing power calculator', 'consumer inflation estimate'],
    type: 'calculator',
    calculatorData: {
      type: 'Inflation Calculator',
      features: ['Future cost', 'Future purchasing power in today\'s rupees', 'Purchasing power loss'],
      accuracy: 'Projection estimate',
      updates: 'User-entered constant inflation assumption'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Inflation Calculator', url: '/calculators/inflation' }]
  },
  '/calculators/loan-eligibility': {
    title: 'Loan Eligibility Calculator | FOIR and EMI Capacity Estimate | MyeCA.in',
    description: 'Estimate your eligible loan amount from monthly income, existing EMIs, FOIR, interest rate and tenure.',
    keywords: ['loan eligibility calculator', 'home loan eligibility calculator', 'FOIR calculator', 'eligible loan amount calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Loan Eligibility Calculator',
      features: ['FOIR-based eligibility', 'Eligible EMI', 'Loan amount estimate'],
      accuracy: 'Eligibility estimate',
      updates: 'User-entered FOIR rate and tenure assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Loan Eligibility', url: '/calculators/loan-eligibility' }]
  },
  '/calculators/withdrawal-planner': {
    title: 'Retirement Withdrawal Planner | Corpus Sustainability | MyeCA.in',
    description: 'Estimate how long a retirement corpus may last using your withdrawal, inflation, return and planning assumptions.',
    keywords: ['retirement withdrawal calculator', 'corpus sustainability calculator', 'retirement income planner', 'withdrawal planner India'],
    type: 'calculator',
    calculatorData: {
      type: 'Retirement Withdrawal Planner',
      features: ['Corpus projection', 'Inflation-aware withdrawals', 'Sustainability estimate'],
      accuracy: 'Projection estimate',
      updates: 'Uses user-entered assumptions'
    },
    noindex: true,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Withdrawal Planner', url: '/calculators/withdrawal-planner' }]
  },
  '/calculators/general': {
    title: 'Online General Calculator | Free Arithmetic Tool | MyeCA.in',
    description: 'Use a browser-based general calculator for everyday arithmetic, percentages and quick financial working notes.',
    keywords: ['general calculator', 'online calculator India', 'percentage calculator', 'free arithmetic calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'General Calculator',
      features: ['Basic arithmetic', 'Percentage calculations', 'Recent calculation history'],
      accuracy: 'Browser arithmetic with display rounding',
      updates: 'Current calculator interface'
    },
    noindex: true,
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'General Calculator', url: '/calculators/general' }]
  },

  // Investment Calculators
  '/calculators/sip': {
    title: 'SIP Calculator 2026 | Mutual Fund SIP Return Calculator | MyeCA.in',
    description: 'Calculate your mutual fund returns with our SIP calculator. Project your wealth growth with compound interest and plan your financial goals.',
    keywords: ['sip calculator', 'mutual fund return calculator', 'calculate sip online', 'investment planner'],
    type: 'calculator',
    calculatorData: {
      type: 'SIP Calculator',
      features: ['Compound interest projection', 'Monthly breakdown', 'Goal-based planning'],
      accuracy: 'Projection estimate',
      updates: 'Projection uses user-entered assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'SIP Calculator', url: '/calculators/sip' }]
  },
  '/calculators/sip-enhanced': {
    title: 'Enhanced SIP Calculator 2026 | Year-Wise Mutual Fund Growth | MyeCA.in',
    description: 'Use an enhanced SIP calculator for mutual fund projections, year-wise growth, compound returns, wealth multiple, and long-term goal planning.',
    keywords: ['enhanced SIP calculator', 'SIP growth calculator', 'year wise SIP calculator', 'mutual fund SIP projection'],
    type: 'calculator',
    calculatorData: {
      type: 'Enhanced SIP Calculator',
      features: ['Year-wise growth chart', 'Wealth multiple', 'Compound return projection'],
      accuracy: 'Projection estimate',
      updates: 'Projection uses user-entered assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Enhanced SIP Calculator', url: '/calculators/sip-enhanced' }]
  },
  '/calculators/nps': {
    title: 'NPS Calculator 2026 | National Pension Scheme Returns | MyeCA.in',
    description: 'Estimate a market-linked NPS corpus and illustrate lump-sum and annuity allocation using stated assumptions and current exit-rule caveats.',
    keywords: ['nps calculator', 'pension scheme returns', 'calculate nps online', 'retirement planning India'],
    type: 'calculator',
    calculatorData: {
      type: 'NPS Calculator',
      features: ['Contribution projection', 'Selectable annuity allocation', 'Illustrative annuity-income assumption'],
      accuracy: 'Projection estimate',
      updates: 'Projection uses user-entered assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'NPS Calculator', url: '/calculators/nps' }]
  },
  '/calculators/fd': {
    title: 'Fixed Deposit (FD) Maturity Calculator | MyeCA.in',
    description: 'Calculate your FD maturity amount and interest earned. Compare rate assumptions and review post-tax returns before planning.',
    keywords: ['fd calculator', 'fixed deposit calculator', 'fd maturity estimate', 'maturity amount calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'FD Calculator',
      features: ['Editable interest rate', 'Compounding frequency options', 'Estimated tax adjustment'],
      accuracy: 'Projection estimate',
      updates: 'Projection uses the entered interest rate'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'FD Calculator', url: '/calculators/fd' }]
  },
  '/calculators/fd-enhanced': {
    title: 'Enhanced FD Maturity Planner | Compounding Estimate | MyeCA.in',
    description: 'Estimate fixed deposit maturity using your interest rate, tenure, compounding frequency and marginal tax-rate assumptions.',
    keywords: ['enhanced FD calculator', 'post tax FD estimate', 'FD compounding calculator', 'fixed deposit maturity planner'],
    type: 'calculator',
    calculatorData: {
      type: 'Enhanced FD Calculator',
      features: ['User-entered rate', 'Estimated tax adjustment', 'Compounding frequency options'],
      accuracy: 'Projection estimate',
      updates: 'Comparison uses entered bank-rate assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Enhanced FD Calculator', url: '/calculators/fd-enhanced' }]
  },
  '/calculators/ppf': {
    title: 'PPF Calculator 2026 | Public Provident Fund Returns | MyeCA.in',
    description: 'Estimate PPF maturity from your contribution and selected interest-rate assumption. Review the 15-year projection before planning.',
    keywords: ['ppf calculator', 'public provident fund projection', 'ppf rate assumption'],
    type: 'calculator',
    calculatorData: {
      type: 'PPF Calculator',
      features: ['15-year projection', 'Contribution scenario', 'Stated rate assumption'],
      accuracy: 'Rule-based estimate',
      updates: 'Projection uses the selected interest-rate assumption'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'PPF Calculator', url: '/calculators/ppf' }]
  },

  // Service Pages
  '/itr-filing': {
    title: 'ITR Filing Services AY 2026-27 | Document Review | myeca.in',
    description: 'File ITR for FY 2025-26 and AY 2026-27 with document-based professional review, Form 16, AIS, refund checks, secure handling, and guided support.',
    keywords: ['ITR filing services', 'AY 2026-27 ITR filing', 'FY 2025-26 tax return', 'CA assisted ITR filing'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Filing', url: '/itr-filing' }]
  },
  '/gst-filing': {
    title: 'GST Filing Services India | Returns, ITC Review | myeca.in',
    description: 'Manage GST filing for FY 2025-26 with return preparation, ITC review, invoice checks, due-date tracking, and scoped filing support for Indian businesses.',
    keywords: ['GST filing services', 'GST return filing India', 'FY 2025-26 GST filing', 'ITC review support'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'GST Filing', url: '/gst-filing' }]
  },
  '/services/gst-returns': {
    title: 'GST Returns Filing Service India | GSTR-1 & GSTR-3B | MyeCA.in',
    description: 'Prepare GST returns with GSTR-1, GSTR-3B, ITC reconciliation, invoice checks, due-date tracking, and scoped filing support for Indian businesses.',
    keywords: ['GST returns filing', 'GSTR-1 filing', 'GSTR-3B filing', 'ITC reconciliation', 'GST return service'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'GST Returns', url: '/services/gst-returns' }]
  },
  '/services/gst-registration': {
    title: 'GST Registration Online India | Document & Filing Support | MyeCA.in',
    description: 'Get GST registration support online with document preparation, portal filing guidance, query support, and transparent pricing.',
    keywords: ['GST registration', 'new GST connection', 'GST certificate online', 'apply for GST India'],
    type: 'service',
    serviceData: { price: '₹2999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'GST Registration', url: '/services/gst-registration' }]
  },
  '/services/company-registration': {
    title: 'Private Limited Company Registration Online | MyeCA.in',
    description: 'Prepare private limited company registration with founder records, DSC and DIN steps, MOA and AOA drafting inputs, PAN and TAN, and filing-scope clarity.',
    keywords: ['company registration', 'register pvt ltd', 'company incorporation', 'startup registration India'],
    type: 'service',
    serviceData: { price: '₹6999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Company Registration', url: '/services/company-registration' }]
  },
  '/services/trademark-registration': {
    title: 'Trademark Registration Online | Search & Filing Support | MyeCA.in',
    description: 'Prepare a trademark search and filing with applicant records, mark and class details, use evidence, government-fee clarity, and application tracking.',
    keywords: ['trademark registration', 'register brand name', 'TM filing India', 'trademark consultant'],
    type: 'service',
    serviceData: { price: '₹12999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Trademark Registration', url: '/services/trademark-registration' }]
  },
  '/services/notice-compliance': {
    title: 'Income Tax Notice Reply | Document & Deadline Review | MyeCA.in',
    description: 'Review an income-tax notice, response deadline, return data, AIS, Form 26AS, computation, and supporting records before preparing the appropriate reply.',
    keywords: ['income tax notice reply', 'respond to tax notice', '143(1) notice help', 'tax compliance services'],
    type: 'service',
    serviceData: { price: '₹2999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Notice Compliance', url: '/services/notice-compliance' }]
  },
  '/services/msme-udyam-registration': {
    title: 'MSME Udyam Registration Online | Govt Certificate | MyeCA.in',
    description: 'Get MSME or Udyam registration support with document guidance, business-detail review, certificate workflow notes, and benefit-readiness checks.',
    keywords: ['MSME registration', 'udyam registration', 'msme certificate online', 'udyam portal India'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'MSME Registration', url: '/services/msme-udyam-registration' }]
  },
  '/services/compliance-management': {
    title: 'Annual Business Compliance Management | ROC, MCA, GST | MyeCA.in',
    description: 'Track ROC, MCA, GST, TDS, and labour compliance tasks with deadline reminders, document checks, filing scope, and unresolved-risk escalation.',
    keywords: ['annual compliance', 'company compliance India', 'ROC filing', 'MCA annual filing', 'statutory compliance service'],
    type: 'service',
    serviceData: { price: '₹4999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Compliance Management', url: '/services/compliance-management' }]
  },
  '/services/fssai-registration': {
    title: 'FSSAI Food License Registration Online | Basic, State, Central | MyeCA.in',
    description: 'Prepare for Basic, State, or Central FSSAI food licensing with business-type guidance, document checks, filing scope, and application tracking.',
    keywords: ['FSSAI registration', 'food license online', 'FSSAI basic license', 'FSSAI state license', 'food business license India'],
    type: 'service',
    serviceData: { price: '₹1499', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'FSSAI Registration', url: '/services/fssai-registration' }]
  },
  '/services/trade-license': {
    title: 'Trade License Registration India | Municipal Corporation Filing | MyeCA.in',
    description: 'Get help applying for or renewing your municipal trade license. Document preparation, application support, and follow-through with the local corporation.',
    keywords: ['trade license registration', 'municipal trade license', 'shop and establishment license', 'trade license renewal', 'business license India'],
    type: 'service',
    serviceData: { price: '₹2499', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Trade License', url: '/services/trade-license' }]
  },
  '/services/audit-services': {
    title: 'Statutory & Internal Audit Services for Indian Businesses | MyeCA.in',
    description: 'Prepare statutory, tax, internal, and management audit records with scope mapping, compliance verification, risk-control review, and audit-report support.',
    keywords: ['audit services India', 'statutory audit', 'internal audit service', 'tax audit', 'CA audit firm'],
    type: 'service',
    serviceData: { price: '₹9999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Audit Services', url: '/services/audit-services' }]
  },
  '/services/iso-certification': {
    title: 'ISO Certification Readiness Support for Indian Businesses | MyeCA.in',
    description: 'Prepare for ISO certification with scope mapping, process and evidence checks, gap tracking, and a clear handoff to an independent certification body.',
    keywords: ['ISO certification readiness', 'ISO documentation support', 'ISO audit preparation', 'business process evidence'],
    type: 'service',
    serviceData: { price: 'Custom quote', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'ISO Certification', url: '/services/iso-certification' }]
  },
  '/services/labour-law-compliance': {
    title: 'Labour Law Compliance Support for Indian Employers | MyeCA.in',
    description: 'Map labour-law obligations from workforce facts, reconcile payroll and registration records, and prepare recurring employer compliance files.',
    keywords: ['labour law compliance', 'employer compliance India', 'payroll compliance', 'EPFO ESIC records'],
    type: 'service',
    serviceData: { price: 'Custom quote', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Labour Law Compliance', url: '/services/labour-law-compliance' }]
  },
  '/about': {
    title: 'About myeca.in Tax Filing Platform | Rajasthan India',
    description: 'Learn how myeca.in combines tax filing support, secure document workflows, and practical FY 2025-26 / AY 2026-27 compliance guidance.',
    keywords: ['about myeca', 'tax experts India', 'fintech startup India', 'tax filing company'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'About Us', url: '/about' }]
  },
  '/partners': {
    title: 'MyeCA ITR Fulfillment and Employer Partners',
    description: 'Partner with MyeCA for seasonal CA overflow fulfillment or tracked employer and HR ITR distribution with capacity, consent, SLA, and QA controls.',
    keywords: ['CA overflow partnership', 'ITR filing partner', 'employee ITR filing'],
    type: 'service',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Partners', url: '/partners' }]
  },
  '/trust': {
    title: 'Trust & Security | MyeCA.in Document Handling',
    description: 'Review how MyeCA.in handles tax documents, pricing scope, professional-review boundaries, privacy, and security expectations before you start filing.',
    keywords: ['MyeCA trust', 'tax document security', 'ITR document privacy', 'secure tax filing India'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Trust & Security', url: '/trust' }]
  },
  '/contact': {
    title: 'Contact myeca.in Tax Filing Help | Bikaner Rajasthan',
    description: 'Contact myeca.in for FY 2025-26 and AY 2026-27 ITR filing, GST compliance, secure document support, and scoped tax guidance.',
    keywords: ['contact tax expert', 'myeca support', 'tax helpline India', 'CA consultation online'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Contact Us', url: '/contact' }]
  },
  '/blog': {
    title: 'ITR Filing Guides AY 2026-27 | MyeCA.in',
    description: 'Read evidence-led FY 2025-26 and AY 2026-27 guides on ITR forms, Form 16, AIS, refunds, GST, capital gains, NRI filing, and notices.',
    keywords: ['AY 2026-27 ITR filing', 'ITR filing guide', 'income tax return India', 'Form 16 guide', 'AIS Form 26AS', 'tax regime comparison'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Filing & Tax Guides AY 2026-27', url: '/blog' }]
  },
  '/experts': {
    title: 'Tax Consultation Online | Scope and Document Review | MyeCA.in',
    description: 'Prepare a focused tax or compliance question, share the relevant records securely, and confirm the professional consultation scope before proceeding.',
    keywords: ['online CA consultation', 'hire tax expert', 'CA network India', 'professional tax advice'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Experts', url: '/experts' }]
  },
  '/services/startup-india-registration': {
    title: 'Startup India Registration Online | DPIIT Recognition | MyeCA.in',
    description: 'Prepare a DPIIT recognition application with eligibility, incorporation, business-model, founder, and innovation-record checks.',
    keywords: ['startup india registration', 'dpiit recognition', 'startup tax benefits', 'register startup india'],
    type: 'service',
    serviceData: { price: '₹4999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Startup India', url: '/services/startup-india-registration' }]
  },
  '/calculators/emi': {
    title: 'EMI Calculator 2026 | Home, Car & Personal Loan EMI | MyeCA.in',
    description: 'Calculate your loan EMIs. Plan repayments for home loans, car loans, and personal loans with an estimate tool.',
    keywords: ['emi calculator', 'loan calculator', 'home loan emi', 'car loan emi calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'EMI Calculator',
      features: ['Amortization schedule', 'Total interest calculation', 'Repayment breakdown'],
      accuracy: 'Rule-based estimate',
      updates: 'Calculation uses the entered loan rate'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'EMI Calculator', url: '/calculators/emi' }]
  },
  '/calculators/car-loan': {
    title: 'Car Loan EMI Calculator 2026 | Vehicle Loan Interest | MyeCA.in',
    description: 'Calculate your car loan EMI and total interest payable. Compare vehicle loan offers from top banks and plan your car purchase.',
    keywords: ['car loan emi calculator', 'vehicle loan calculator', 'auto loan emi', 'car loan interest rates'],
    type: 'calculator',
    calculatorData: {
      type: 'Car Loan Calculator',
      features: ['Amortization chart', 'Processing fee inclusion', 'Prepayment analysis'],
      accuracy: 'Rule-based estimate',
      updates: 'Calculation uses the entered vehicle-loan rate'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Car Loan', url: '/calculators/car-loan' }]
  },
  '/calculators/home-loan': {
    title: 'Home Loan EMI Calculator 2026 | Mortgage Interest Calculator | MyeCA.in',
    description: 'Calculate your home loan EMI, total interest, and principal repayment. Plan your home buying with detailed amortization schedules.',
    keywords: ['home loan emi calculator', 'mortgage calculator', 'house loan calculator', 'housing loan interest'],
    type: 'calculator',
    calculatorData: {
      type: 'Home Loan Calculator',
      features: ['Part-payment analysis', 'Tax benefit (Sec 24/80EEA)', 'Detailed amortization'],
      accuracy: 'Rule-based estimate',
      updates: 'Calculation uses the entered home-loan rate'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Home Loan', url: '/calculators/home-loan' }]
  },
  '/calculators/personal-loan': {
    title: 'Personal Loan EMI Calculator 2026 | Interest & Affordability | MyeCA.in',
    description: 'Calculate personal loan EMI, total interest, total repayment and EMI-to-income ratio for unsecured loans in India.',
    keywords: ['personal loan emi calculator', 'personal loan calculator', 'EMI income ratio calculator', 'unsecured loan calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Personal Loan Calculator',
      features: ['EMI calculation', 'EMI-to-income ratio', 'Total interest estimate'],
      accuracy: 'Rule-based estimate',
      updates: 'Calculation uses user-entered loan assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Personal Loan', url: '/calculators/personal-loan' }]
  },
  '/calculators/education-loan': {
    title: 'Education Loan EMI Calculator 2026 | Moratorium & 80E Benefit | MyeCA.in',
    description: 'Calculate education loan EMI after moratorium, interest during study period, total repayment and Section 80E tax benefit context.',
    keywords: ['education loan emi calculator', 'study loan calculator', 'education loan moratorium calculator', 'section 80E calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Education Loan Calculator',
      features: ['Moratorium interest', 'Post-study EMI', 'Section 80E tax context'],
      accuracy: 'Rule-based estimate',
      updates: 'Calculation uses user-entered loan assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Education Loan', url: '/calculators/education-loan' }]
  },
  '/calculators/tds': {
    title: 'TDS Calculator AY 2026-27 | Tax Deducted at Source Rates | MyeCA.in',
    description: 'Estimate TDS on salary, rent, professional fees, commissions, interest, and dividends for common resident cases with FY 2025-26 notes.',
    keywords: ['tds calculator', 'tax deducted at source', 'tds rates 2026', 'calculate tds online'],
    type: 'calculator',
    calculatorData: {
      type: 'TDS Calculator',
      features: ['Section-wise rates', 'Threshold checks', 'PAN impact'],
      accuracy: 'Estimate for common resident cases',
      updates: 'FY 2025-26 updated'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'TDS Calculator', url: '/calculators/tds' }]
  },
  '/calculators/penalty': {
    noindex: true,
    title: 'Late Charge Official Source Directory | MyeCA.in',
    description: 'Official authority links for checking statutory late charges. Calculation is unavailable until effective-dated rules are verified.',
    keywords: ['late charge reference', 'gst late fee reference', 'tax filing delay'],
    type: 'calculator',
    calculatorData: {
      type: 'Late Charge Source Directory',
      features: ['Official authority links', 'Prominent verification warning'],
      accuracy: 'No monetary calculation provided',
      updates: 'Noindexed pending source-verified rule datasets'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Late Charge Reference', url: '/calculators/penalty' }]
  },
  '/compliance-calendar': {
    title: 'Compliance Calendar 2025-26 | GST & Tax Due Dates | MyeCA.in',
    description: 'Track common GST, Income Tax, TDS, and MCA due dates for FY 2025-26, then confirm the obligation and deadline for your entity.',
    keywords: ['compliance calendar 2025', 'tax due dates', 'gst return deadlines', 'income tax dates'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compliance Calendar', url: '/compliance-calendar' }]
  },
  '/elss-comparator': {
    title: 'ELSS Mutual Fund Comparator | Tax Saving Funds 2026 | MyeCA.in',
    description: 'Compare top-performing ELSS mutual funds. Analyze returns, risk ratios, and tax-saving potential under Section 80C.',
    keywords: ['elss comparator', 'tax saving funds', 'compare elss mutual funds', '80C investments'],
    type: 'calculator',
    calculatorData: {
      type: 'ELSS Comparator',
      features: ['Return analysis', 'Risk metrics', 'Direct vs Regular comparison'],
      accuracy: 'Projection estimate',
      updates: 'Current market data'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'ELSS Comparator', url: '/elss-comparator' }]
  },
  '/form16-parser': {
    title: 'Free Form 16 Parser Online | Assisted ITR Pre-fill | MyeCA.in',
    description: 'Upload or paste Form 16 details to extract salary, deductions, and tax fields for review before ITR filing.',
    keywords: ['form 16 parser', 'upload form 16', 'salary tax details', 'itr pre-fill tool'],
    type: 'calculator',
    calculatorData: {
      type: 'Form 16 Parser',
      features: ['PDF parsing', 'Auto-deduction mapping', 'Private & Secure'],
      accuracy: 'Document-assisted workflow',
      updates: 'AY 2026-27 supported'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Form 16 Parser', url: '/form16-parser' }]
  },
  '/which-itr-form-to-file': {
    title: 'Individual ITR Form Selector AY 2026-27 | Find ITR-1, ITR-2, ITR-3 or ITR-4 | MyeCA.in',
    description: 'Answer individual filing facts and get an AY 2026-27 ITR-1, ITR-2, ITR-3, ITR-4, or CA scope review recommendation before continuing to the filing draft.',
    keywords: ['individual ITR form selector', 'which ITR form', 'ITR-1 ITR-2 ITR-3 ITR-4', 'AY 2026-27 ITR', 'income tax return form'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Individual ITR Form Selector', url: '/which-itr-form-to-file' }]
  },
  '/itr/form-selector': {
    title: 'Which ITR Return Should You File for AY 2026-27? | MyeCA.in',
    description: 'Compare ITR-1, ITR-2, ITR-3, ITR-4, ITR-5, ITR-6, ITR-7 and ITR-U for AY 2026-27 with documents, schedules, deadlines, and CA-assisted filing paths.',
    keywords: ['which ITR return to file', 'ITR form selector AY 2026-27', 'ITR-1 ITR-2 ITR-3 ITR-4 ITR-5 ITR-6 ITR-7 ITR-U', 'AY 2026-27 ITR filing', 'income tax return form'],
    type: 'website',
    faqItems: [
      { q: 'Which ITR return should I file for AY 2026-27?', a: 'Choose the return based on taxpayer type, residential status, income heads, capital gains, business income, foreign assets, audit triggers, and whether the return is original, belated, revised, or updated.' },
      { q: 'Does MyeCA support all ITR forms as filing drafts?', a: 'The public guide covers ITR-1 through ITR-7 and ITR-U, while the active individual draft workflow remains focused on ITR-1 to ITR-4 with CA scope review for complex or entity cases.' },
      { q: 'Are AY 2026-27 returns governed by the Income Tax Act, 1961?', a: 'Yes. Returns for FY 2025-26 filed for AY 2026-27 continue under the Income Tax Act, 1961 framework, even during the transition to the Income-tax Act, 2025.' }
    ],
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Which ITR Return to File', url: '/itr/form-selector' }]
  },
  '/itr/form-recommender': {
    title: 'ITR Form Recommender AY 2026-27 | Guided Filing Path | MyeCA.in',
    description: 'Answer guided income, deduction, capital gains, and filing questions to understand the ITR form path that may fit your AY 2026-27 return.',
    keywords: ['ITR form recommender', 'income tax filing path', 'which ITR should I file', 'AY 2026-27 tax return', 'guided ITR filing'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Filing', url: '/itr/form-selector' }, { name: 'Form Recommender', url: '/itr/form-recommender' }]
  },
  '/tax-assistant': {
    title: 'AI Tax Assistant | Guided Tax Answers & Support | MyeCA.in',
    description: 'Ask the AI Tax Assistant common questions about ITR filing, GST, or business compliance and review important cases with an expert.',
    keywords: ['ai tax assistant', 'tax help bot', 'expert tax answers', 'chat with tax expert'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'AI Tax Assistant', url: '/tax-assistant' }]
  },
  '/tax-optimizer': {
    title: 'Tax Optimizer India | Personalized Deduction Planner | MyeCA.in',
    description: 'Get personalized tax-saving recommendations across Section 80C, 80D, NPS, HRA, home loan interest, and regime selection.',
    keywords: ['tax optimizer India', 'tax saving planner', 'deduction optimizer', 'section 80C planner', 'income tax saving'],
    type: 'calculator',
    calculatorData: {
      type: 'Tax Optimizer',
      features: ['Deduction recommendations', 'Regime comparison guidance', 'Tax-saving checklist'],
      accuracy: 'Estimate based on entered profile data',
      updates: 'AY 2026-27 planning inputs'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Tax Optimizer', url: '/tax-optimizer' }]
  },
  '/startup-services': {
    title: 'Complete Startup Solutions India | Launch & Scale | MyeCA.in',
    description: 'Plan DPIIT recognition, funding-readiness documents, and recurring startup compliance with clear scope, records, and next steps.',
    keywords: ['startup solutions', 'entrepreneur support', 'startup ecosystem India', 'launch business India'],
    type: 'service',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Startup Services', url: '/startup-services' }]
  },
  '/pricing': {
    title: 'Transparent Tax Filing Pricing | ITR, GST & CA Review | MyeCA.in',
    description: 'Compare MyeCA.in pricing for CA-assisted ITR filing, GST, startup, and compliance services with scope notes before you request expert help.',
    keywords: ['ITR filing pricing', 'CA assisted filing fees', 'tax filing plans India', 'GST service pricing'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Pricing', url: '/pricing' }]
  },
  '/learn': {
    title: 'Tax Learning Center India | ITR, GST & Compliance Guides | MyeCA.in',
    description: 'Learn Indian tax filing, GST compliance, deductions, refunds, capital gains, and startup compliance through practical guides.',
    keywords: ['tax learning India', 'ITR guides', 'GST guides', 'tax education'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Learn', url: '/learn' }]
  },
  '/learn/guides': {
    title: 'Income Tax Guides for Indian Taxpayers | MyeCA.in',
    description: 'Browse practical guides for ITR forms, AIS/Form 26AS, tax regime choice, deductions, refunds, and notices.',
    keywords: ['income tax guides', 'ITR guide India', 'AIS Form 26AS guide', 'tax regime guide'],
    type: 'article',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Learn', url: '/learn' }, { name: 'Guides', url: '/learn/guides' }]
  },
  '/learn/glossary': {
    title: 'Income Tax Glossary for Indian Filing Terms | MyeCA.in',
    description: 'Understand common ITR, GST, TDS, AIS, refund, deduction, capital gains, and compliance terms before using calculators or filing workflows.',
    keywords: ['income tax glossary', 'ITR terms', 'GST glossary', 'TDS terms', 'tax filing definitions'],
    type: 'article',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Learn', url: '/learn' }, { name: 'Glossary', url: '/learn/glossary' }]
  },
  '/learn/videos': {
    title: 'Tax Lesson Outlines | ITR Filing & Compliance | MyeCA.in',
    description: 'Browse practical tax and compliance lesson outlines for ITR filing, GST, deductions, refunds, and document preparation.',
    keywords: ['tax lesson outlines', 'ITR filing lessons', 'GST tutorial India'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Learn', url: '/learn' }, { name: 'Lessons', url: '/learn/videos' }]
  },
  '/help': {
    title: 'MyeCA Help Center | Filing, Account & Service Support',
    description: 'Find help for MyeCA account access, ITR filing, calculators, document uploads, service orders, and support requests.',
    keywords: ['MyeCA help', 'tax filing support', 'ITR help center', 'MyeCA support'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Help', url: '/help' }]
  },
  '/help/faq': {
    title: 'MyeCA FAQs | Tax Filing and Service Questions',
    description: 'Answers to common questions about MyeCA.in tax filing, professional-review scope, refunds, GST services, documents, and payments.',
    keywords: ['MyeCA FAQ', 'ITR filing questions', 'tax filing FAQ India'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Help', url: '/help' }, { name: 'FAQ', url: '/help/faq' }]
  },
  '/help/user-guide': {
    title: 'MyeCA User Guide | How to Use Tax Filing Workflows',
    description: 'Step-by-step user guide for navigating MyeCA.in, using calculators, uploading documents, and tracking services.',
    keywords: ['MyeCA user guide', 'tax filing workflow guide', 'document upload guide'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Help', url: '/help' }, { name: 'User Guide', url: '/help/user-guide' }]
  },
  '/services/itr-for-salaried': {
    title: 'ITR Filing for Salaried Employees | AY 2026-27 | MyeCA.in',
    description: 'File salaried ITR with Form 16 support, regime comparison, deduction review, refund checks, and optional CA assistance.',
    keywords: ['ITR for salaried employees', 'Form 16 ITR filing', 'salary tax filing India', 'AY 2026-27 ITR'],
    type: 'service',
    serviceData: { price: '₹499', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'ITR for Salaried', url: '/services/itr-for-salaried' }]
  },
  '/legal/disclaimer': {
    title: 'Legal Disclaimer for MyeCA Tax Guidance | MyeCA.in',
    description: 'Read the MyeCA.in disclaimer for educational tax, GST, calculator, and filing guidance before relying on case-specific professional advice.',
    keywords: ['MyeCA disclaimer', 'tax guidance disclaimer', 'legal disclaimer India', 'calculator disclaimer'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Legal', url: '/legal/disclaimer' }]
  },
  '/mobile-app': {
    title: 'MyeCA Mobile App for Tax Filing Workspace | MyeCA.in',
    description: 'Access MyeCA filing workflows, document upload, calculators, service tracking, and account updates from a mobile-friendly tax workspace.',
    keywords: ['MyeCA mobile app', 'tax filing app India', 'ITR mobile workspace', 'document upload tax app'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Mobile App', url: '/mobile-app' }]
  },
  '/services/tax-planning': {
    title: 'Tax Planning Services India | Salary, Business & Investments | MyeCA.in',
    description: 'Plan salary, deductions, capital gains, business income, and regime selection with practical tax planning support.',
    keywords: ['tax planning services India', 'salary tax planning', 'capital gains tax planning', 'CA tax planning'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Tax Planning', url: '/services/tax-planning' }]
  },
  '/services/tds-filing': {
    title: 'TDS Filing Service India | 24Q, 26Q & Challan Review | MyeCA.in',
    description: 'Prepare TDS filing with TAN, challan matching, deductee PAN checks, Form 24Q or 26Q data, Form 16 support, and scoped compliance review.',
    keywords: ['TDS filing service', 'TDS return filing', 'Form 24Q filing', 'Form 26Q filing', 'TAN challan review'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'TDS Filing', url: '/services/tds-filing' }]
  },
  '/services/document-vault': {
    title: 'Secure Tax Document Vault | MyeCA.in',
    description: 'Store and organize tax documents, Form 16, AIS, receipts, certificates, and filing records for easier review.',
    keywords: ['tax document vault', 'secure document storage', 'Form 16 storage', 'ITR document organizer'],
    type: 'service',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Document Vault', url: '/services/document-vault' }]
  },
  '/services/pan-card': {
    title: 'PAN Card Assistance Online | Correction & Business PAN Support | MyeCA.in',
    description: 'Prepare PAN application or correction records, business PAN documentation, status checks, and the next tax-identity support step.',
    keywords: ['PAN card assistance', 'PAN correction support', 'business PAN card', 'PAN application guidance', 'tax identity documentation'],
    type: 'service',
    serviceData: { price: '499', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'PAN Card Assistance', url: '/services/pan-card' }]
  },
  '/calculators/vda-tax': {
    title: 'VDA & Crypto Tax Guide for ITR Filing | MyeCA.in',
    description: 'Organize crypto, VDA, exchange, wallet, TDS, and capital gains records before choosing the right ITR filing path.',
    keywords: ['VDA tax guide', 'crypto tax India', 'crypto ITR filing', 'virtual digital asset tax', 'crypto TDS statement'],
    type: 'calculator',
    calculatorData: {
      type: 'VDA Tax Guide',
      features: ['Exchange statement checklist', 'Wallet record review', 'TDS readiness', 'ITR filing handoff'],
      accuracy: 'Informational filing guide',
      updates: 'AY 2026-27 supported'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'VDA Tax Guide', url: '/calculators/vda-tax' }]
  },
  '/startup/registration': {
    title: 'Startup Registration Guidance India | MyeCA.in',
    description: 'Get guidance for startup registration, entity setup, DPIIT readiness, GST, MSME, and compliance next steps.',
    keywords: ['startup registration India', 'DPIIT startup registration', 'startup compliance India'],
    type: 'service',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Startup Services', url: '/startup-services' }, { name: 'Registration', url: '/startup/registration' }]
  },
  '/startup/planning': {
    title: 'Startup Business Planning Services India | Founder Roadmap | MyeCA.in',
    description: 'Turn an early-stage business idea into a practical founder roadmap with entity planning, registrations, budgets, and compliance milestones.',
    keywords: ['startup business planning India', 'founder roadmap', 'startup compliance planning', 'business plan checklist', 'entity planning'],
    type: 'service',
    serviceData: { price: '4999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Startup Services', url: '/startup-services' }, { name: 'Business Planning', url: '/startup/planning' }]
  },
  '/startup/funding': {
    title: 'Startup Funding Readiness Services India | MyeCA.in',
    description: 'Prepare startup funding records with finance hygiene, compliance documents, investor-ready summaries, and founder action notes before outreach.',
    keywords: ['startup funding readiness', 'startup finance documents', 'investor readiness India', 'funding compliance checklist'],
    type: 'service',
    serviceData: { price: '0', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Startup Services', url: '/startup-services' }, { name: 'Funding', url: '/startup/funding' }]
  },
  '/tds-refund-tracker': {
    title: 'TDS Refund Tracker for ITR Filing Status | MyeCA.in',
    description: 'Track TDS refund readiness with AIS, Form 26AS, return status, bank validation, demand notices, and follow-up checks after ITR filing.',
    keywords: ['TDS refund tracker', 'income tax refund status', 'ITR refund check', 'Form 26AS refund', 'AIS TDS refund'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'TDS Refund Tracker', url: '/tds-refund-tracker' }]
  },
  '/itr-season-2026': {
    title: 'AY 2026-27 ITR Season Hub | Checklists, Tools & Filing Paths',
    description: 'Use MyeCA checklists and tools for AY 2026-27 ITR filing, including Form 16, AIS/Form 26AS, capital gains, refund status, and expert review.',
    keywords: ['AY 2026-27 ITR season', 'ITR filing checklist', 'Form 16 parser', 'AIS Form 26AS mismatch', 'capital gains ITR checklist'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Season 2026', url: '/itr-season-2026' }]
  },
  '/itr-season-2026/ais-form-26as-mismatch-checklist': {
    title: 'AIS and Form 26AS Mismatch Checklist AY 2026-27 | MyeCA.in',
    description: 'Match AIS, TIS, Form 26AS, salary TDS, bank credits, and return values before filing AY 2026-27 ITR or requesting expert review.',
    keywords: ['AIS mismatch checklist', 'Form 26AS mismatch', 'TDS mismatch ITR', 'AY 2026-27 AIS', 'ITR refund mismatch'],
    type: 'article',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Season 2026', url: '/itr-season-2026' }, { name: 'AIS Mismatch Checklist', url: '/itr-season-2026/ais-form-26as-mismatch-checklist' }]
  },
  '/itr-season-2026/form-16-parser-guide': {
    title: 'Form 16 Parser Workflow for AY 2026-27 ITR Filing | MyeCA.in',
    description: 'Use the MyeCA Form 16 parser workflow to extract salary, TDS, deductions, employer details, and review notes before ITR filing.',
    keywords: ['Form 16 parser guide', 'upload Form 16 ITR', 'salary TDS extraction', 'AY 2026-27 Form 16', 'ITR prefill workflow'],
    type: 'article',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Season 2026', url: '/itr-season-2026' }, { name: 'Form 16 Parser Guide', url: '/itr-season-2026/form-16-parser-guide' }]
  },
  '/itr-season-2026/capital-gains-broker-statement-checklist': {
    title: 'Capital Gains Broker Statement Checklist for ITR-2 and ITR-3 | MyeCA.in',
    description: 'Prepare broker P&L, tradebook, capital gains, F&O, VDA, and AIS records before filing ITR-2 or ITR-3 for AY 2026-27.',
    keywords: ['capital gains broker statement', 'ITR-2 capital gains checklist', 'broker tax P&L', 'F&O ITR checklist', 'capital gains import'],
    type: 'article',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Season 2026', url: '/itr-season-2026' }, { name: 'Broker Statement Checklist', url: '/itr-season-2026/capital-gains-broker-statement-checklist' }]
  },
  '/itr-season-2026/itr-deadline-refund-status-tracker': {
    title: 'AY 2026-27 ITR Deadline and Refund Status Tracker | MyeCA.in',
    description: 'Track ITR filing readiness, submission, e-verification, processing, refund status, demand notices, and revised return decisions for AY 2026-27.',
    keywords: ['ITR deadline tracker', 'ITR refund status AY 2026-27', 'ITR e-verification', 'income tax refund tracker', 'revised return checklist'],
    type: 'article',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Season 2026', url: '/itr-season-2026' }, { name: 'Deadline and Refund Tracker', url: '/itr-season-2026/itr-deadline-refund-status-tracker' }]
  },
  '/compare': {
    title: 'Tax Tool Comparison Hub | MyeCA.in',
    description: 'Compare tax filing workflows, calculators, services, and support options before choosing the right path.',
    keywords: ['tax filing comparison', 'ITR platform comparison', 'tax tool comparison'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compare', url: '/compare' }]
  },
  '/compare/cleartax-alternative': {
    title: 'ClearTax Alternative for Expert-Assisted ITR Filing | MyeCA.in',
    description: 'Compare MyeCA with ClearTax for CA-assisted review where applicable, AIS/26AS checks, document history, case tracking, and visible scope before payment.',
    keywords: ['ClearTax alternative', 'CA assisted ITR filing', 'MyeCA vs ClearTax', 'tax filing comparison'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compare', url: '/compare' }, { name: 'ClearTax Alternative', url: '/compare/cleartax-alternative' }]
  },
  '/compare/taxbuddy-alternative': {
    title: 'TaxBuddy Alternative with Case Tracking | MyeCA.in',
    description: 'Compare MyeCA with TaxBuddy for assisted filing, document status, written scope, post-filing support, and expert review paths.',
    keywords: ['TaxBuddy alternative', 'MyeCA vs TaxBuddy', 'assisted ITR filing', 'case tracking tax filing'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compare', url: '/compare' }, { name: 'TaxBuddy Alternative', url: '/compare/taxbuddy-alternative' }]
  },
  '/compare/quicko-capital-gains-alternative': {
    title: 'Quicko Alternative for Capital Gains with CA Review | MyeCA.in',
    description: 'Compare MyeCA with Quicko for capital gains import, broker statement review, AIS mismatch checks, and CA-assisted investor filing.',
    keywords: ['Quicko alternative', 'capital gains tax filing', 'broker statement import', 'capital gains document review'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compare', url: '/compare' }, { name: 'Quicko Alternative', url: '/compare/quicko-capital-gains-alternative' }]
  },
  '/compare/indiafilings-alternative': {
    title: 'IndiaFilings Alternative for Transparent Startup Compliance | MyeCA.in',
    description: 'Compare MyeCA with IndiaFilings for GST, company registration, startup compliance, service milestones, and transparent add-on scope.',
    keywords: ['IndiaFilings alternative', 'startup compliance India', 'GST registration comparison', 'company registration service'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compare', url: '/compare' }, { name: 'IndiaFilings Alternative', url: '/compare/indiafilings-alternative' }]
  },
  '/compare/best-ca-assisted-itr-filing': {
    title: 'CA-Assisted ITR Filing Comparison for Complex Taxpayers | MyeCA.in',
    description: 'Choose a CA-assisted ITR filing workflow for capital gains, business income, foreign assets, notices, and document-heavy returns.',
    keywords: ['CA assisted ITR filing comparison', 'complex ITR filing India', 'expert tax review', 'MyeCA ITR filing'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compare', url: '/compare' }, { name: 'CA-Assisted ITR Filing Comparison', url: '/compare/best-ca-assisted-itr-filing' }]
  }
};

const CALCULATOR_FAQ_ITEMS: Record<string, { q: string; a: string }[]> = {
  '/calculators/income-tax': [
    { q: 'How does the income tax calculator estimate AY 2026-27 tax?', a: 'It applies the selected income, deduction, rebate, surcharge, and cess inputs to compare old and new regime estimates for common resident individual cases.' },
    { q: 'Is the income tax calculator result my final ITR tax?', a: 'No. Use it as a planning estimate and verify Form 16, AIS, Form 26AS, bank interest, capital gains, and eligible deductions before filing.' },
    { q: 'Can I compare old and new tax regimes before filing?', a: 'Yes. Compare both estimates using the same income and deduction facts, then verify special-rate income, eligibility, and source records before filing.' },
  ],
  '/calculators/capital-gains': [
    { q: 'What capital gains can this calculator estimate?', a: 'It helps estimate common short-term and long-term capital gains on equity, mutual funds, property, gold, and similar assets before ITR review.' },
    { q: 'Do I still need broker statements for capital gains filing?', a: 'Yes. Calculator output should be matched with broker statements, AIS, purchase dates, sale values, and exemption details before filing.' },
    { q: 'Which ITR form usually applies for capital gains?', a: 'Capital gains commonly require ITR-2 or ITR-3 depending on business income and other facts. The final form depends on your full income profile.' },
  ],
  '/capital-gains-import': [
    { q: 'What does the capital gains import tool do?', a: 'It organizes broker capital gains files into an ITR-ready review summary, including STCG, LTCG, and statement-level checks where supported.' },
    { q: 'Can imported broker data be filed without review?', a: 'No. Imported values should be checked against AIS, trade reports, corporate actions, and tax rules before final filing.' },
    { q: 'Which brokers are suitable for import?', a: 'The workflow is intended for common broker statements and CSV-style reports from Indian investing platforms where the file structure is supported.' },
  ],
  '/calculators/hra': [
    { q: 'How is HRA exemption calculated?', a: 'HRA exemption is estimated using salary, actual HRA, rent paid, city type, and the rule-based limits applicable for the financial year.' },
    { q: 'Do I need rent receipts for HRA?', a: 'Yes. Keep rent receipts, landlord details, and PAN where required so the claimed exemption can be supported during return review.' },
    { q: 'Can HRA be claimed in the new tax regime?', a: 'HRA exemption is generally relevant to old-regime planning. Confirm the final regime and eligibility before filing.' },
  ],
  '/calculators/tax-regime': [
    { q: 'What does the tax regime calculator compare?', a: 'It compares estimated tax under old and new regimes using salary, deductions, rebate, and common planning inputs for AY 2026-27.' },
    { q: 'Which regime should I choose?', a: 'Choose based on verified deductions, exemptions, income level, and employment facts. The calculator gives an estimate, not a filing instruction.' },
    { q: 'Can salaried taxpayers switch regimes every year?', a: 'Salaried taxpayers usually have more flexibility than business taxpayers, but the final choice should be checked against current filing rules.' },
  ],
  '/calculators/regime-comparator': [
    { q: 'Is this different from the tax regime calculator?', a: 'The comparator focuses on side-by-side regime decision support, while the tax calculator estimates tax details from broader income inputs.' },
    { q: 'What deductions matter most for regime comparison?', a: 'Common old-regime inputs include 80C, 80D, HRA, home-loan interest, NPS, and other eligible deductions or exemptions.' },
    { q: 'Should I use Form 16 values in the comparator?', a: 'Yes. Form 16, AIS, and salary breakup values improve the usefulness of the comparison before filing.' },
  ],
  '/calculators/gst': [
    { q: 'What can the GST calculator estimate?', a: 'It estimates tax-inclusive or tax-exclusive GST values and splits CGST, SGST, or IGST based on the selected rate and transaction type.' },
    { q: 'Does the GST calculator replace GST return filing?', a: 'No. It is a calculation aid. GSTR data, invoices, place of supply, ITC, and return rules still need proper review.' },
    { q: 'Which GST rates can I use?', a: 'Use the rate applicable to the goods or services after checking HSN/SAC classification and current GST notifications.' },
  ],
  '/calculators/sip': [
    { q: 'How does the SIP calculator estimate returns?', a: 'It projects future value using monthly contribution, expected annual return, and investment period with compounding assumptions.' },
    { q: 'Are SIP returns guaranteed?', a: 'No. SIP output is an estimate only. Mutual fund returns depend on market performance, expenses, taxation, and investor behavior.' },
    { q: 'Can SIP estimates help tax planning?', a: 'They can help plan investment goals, but capital gains taxation and ELSS deduction eligibility should be reviewed separately.' },
  ],
  '/calculators/nps': [
    { q: 'What does the NPS calculator estimate?', a: 'It estimates retirement corpus and pension-like outcomes from contribution, tenure, return assumptions, and annuity inputs.' },
    { q: 'Can NPS reduce taxable income?', a: 'NPS may support deductions under applicable old-regime provisions, subject to limits and eligibility. Verify before claiming.' },
    { q: 'Is the annuity value final?', a: 'No. It depends on annuity provider rates, retirement age, market returns, and final withdrawal choices.' },
  ],
  '/calculators/ppf': [
    { q: 'How does the PPF calculator work?', a: 'It estimates maturity value using annual contribution, tenure, and the applicable PPF interest assumption for long-term planning.' },
    { q: 'Is PPF useful for old-regime tax planning?', a: 'PPF can be part of 80C planning under the old regime, subject to overall limits and eligibility.' },
    { q: 'Can I change PPF contribution every year?', a: 'Contributions can vary within permitted limits, but the actual account rules and deposit timing should be checked.' },
  ],
  '/calculators/fd': [
    { q: 'What does the FD calculator estimate?', a: 'It estimates fixed deposit maturity value using principal, interest rate, compounding frequency, and tenure.' },
    { q: 'Is FD interest taxable?', a: 'FD interest is generally taxable according to the taxpayer income slab and should be matched with AIS and Form 26AS TDS data.' },
    { q: 'Should senior citizens check FD tax separately?', a: 'Yes. Senior citizens may have different deduction and TDS considerations, so final tax treatment should be reviewed.' },
  ],
  '/calculators/tds': [
    { q: 'What can the TDS calculator estimate?', a: 'It estimates tax deduction amounts for selected payment types and rates where the user provides the taxable base and relevant assumptions.' },
    { q: 'Can TDS rates change by transaction?', a: 'Yes. TDS depends on payment type, status, threshold, PAN availability, treaty cases, and current law.' },
    { q: 'Should TDS be matched before ITR filing?', a: 'Yes. Always match TDS credits with AIS and Form 26AS before final filing or refund claims.' },
  ],
  '/calculators/gratuity': [
    { q: 'How is gratuity estimated?', a: 'The calculator estimates gratuity using salary, completed service, employer type, and common formula assumptions.' },
    { q: 'Is gratuity fully tax-free?', a: 'Not always. Taxability depends on government or non-government employment, exemption limits, and service facts.' },
    { q: 'What records are needed for gratuity review?', a: 'Keep salary breakup, service period, employer details, and settlement documents before using the result in a tax return.' },
  ],
  '/calculators/emi': [
    { q: 'How does the EMI calculator work?', a: 'It estimates monthly loan EMI using loan amount, interest rate, and tenure with standard amortization math.' },
    { q: 'Does EMI output include all loan charges?', a: 'No. Processing fees, insurance, prepayment, floating-rate changes, and lender charges may change the actual cost.' },
    { q: 'Can EMI planning affect tax filing?', a: 'Home-loan interest and principal repayment may affect old-regime tax planning where eligible, but documents must be verified.' },
  ],
  '/calculators/home-loan': [
    { q: 'What does the home loan calculator estimate?', a: 'It estimates EMI and repayment patterns for home loans using principal, interest rate, and tenure inputs.' },
    { q: 'Can home loan interest be claimed in ITR?', a: 'Eligible interest may be claimable based on property type, regime choice, and limits. Verify the loan certificate before filing.' },
    { q: 'Should I compare EMI and tax benefit together?', a: 'Yes. EMI affordability and eligible tax treatment should be reviewed together for better planning.' },
  ],
};

Object.entries(CALCULATOR_FAQ_ITEMS).forEach(([route, faqItems]) => {
  if (SEO_CONFIG[route]) {
    SEO_CONFIG[route].faqItems = faqItems;
  }
});

SEO_CONFIG["/documents/generator"] = {
  title: "Indian Financial, Legal and Business Document Generators | MyeCA.in",
  description: "Create and preview Indian financial, GST, legal, business, tax, employment, and application documents. Sign in only when saving or exporting.",
  keywords: ["document generator India", "financial document generator", "GST document format", "legal document templates India"],
  type: "website",
  breadcrumbs: [{ name: "Home", url: "/" }, { name: "Document Generator", url: "/documents/generator" }],
};

FINANCIAL_GENERATOR_CATALOGUE.forEach((entry) => {
  const featureSummary = entry.features.slice(0, 2).join(" and ").toLowerCase();
  SEO_CONFIG[`/documents/generator/${entry.id}`] = {
    title: `${entry.title} Generator India | MyeCA.in`,
    description: `${entry.description.replace(/\.$/, "")}; review ${featureSummary} in a public preview before signed-in export.`,
    keywords: entry.seo?.keywords || [
      `${entry.title} generator`,
      `${entry.title} format India`,
      `${entry.title} online`,
      "Indian document generator",
    ],
    type: "calculator",
    calculatorData: {
      type: entry.title,
      features: entry.features,
      accuracy: "Prepared from user-entered information",
      updates: "Indian-market document draft",
    },
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Document Generator", url: "/documents/generator" },
      { name: entry.title, url: `/documents/generator/${entry.id}` },
    ],
  };
});

export const getSEOConfig = (path: string): SEOConfigItem | undefined => {
  return SEO_CONFIG[path];
};
