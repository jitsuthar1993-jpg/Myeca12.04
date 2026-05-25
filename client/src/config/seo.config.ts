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
  breadcrumbs: { name: string; url: string }[];
  noindex?: boolean;
}

export const SEO_CONFIG: Record<string, SEOConfigItem> = {
  // Core Pages
  '/': {
    title: 'ITR Filing Services India AY 2026-27 | CA Help | myeca.in',
    description: 'File ITR for FY 2025-26 and AY 2026-27 with CA-led review, secure uploads, AIS and Form 26AS checks, refund guidance, salary, MSME, GST support online.',
    keywords: ['ITR filing India', 'income tax return online', 'CA assisted tax filing', 'e-filing 2026', 'tax consultant near me'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }]
  },
  '/services': {
    title: 'Professional Tax & Business Services | MyeCA.in',
    description: 'Explore our range of professional services including GST registration, company incorporation, trademark filing, and tax notice compliance.',
    keywords: ['tax services', 'business registration India', 'GST consultant', 'company registration', 'legal compliance'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }]
  },

  '/all-services': {
    title: 'Professional Services Catalogue | MyeCA.in',
    description: 'Explore our comprehensive directory of CA services, IT returns, business setup components, and intelligent financial calculators.',
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
    title: 'Advance Tax Calculator 2026 | Installment Due Dates | MyeCA.in',
    description: 'Estimate advance tax liability and view installment due dates by selected financial year. Avoid Section 234B & 234C interest with timely planning.',
    keywords: ['advance tax calculator', 'tax installments 2025', 'income tax due dates', 'section 234C calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Advance Tax Calculator',
      features: ['Quarterly breakdown', 'Due date alerts', 'Penalty estimation'],
      accuracy: 'Estimate for common cases',
      updates: 'FY selector and current due dates'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Advance Tax', url: '/calculators/advance-tax' }]
  },
  '/calculators/hra': {
    title: 'HRA Calculator 2025 | House Rent Allowance Exemption | MyeCA.in',
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
    title: 'New vs Old Tax Regime Calculator 2025 | Which is Better? | MyeCA.in',
    description: 'Compare Old vs New Tax Regime for AY 2026-27. Real-time analysis of tax savings based on your investments, deductions, and Section 87A rebate.',
    keywords: ['tax regime comparison', 'old vs new tax regime', 'best tax regime for me', 'tax savings 2025'],
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
    description: 'Compare old and new tax regimes side by side for AY 2026-27 with deductions, standard deduction, Section 87A rebate, and CA-reviewed guidance.',
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
    title: 'HSN Code Finder 2025 | GST Rate Finder Online | MyeCA.in',
    description: 'Search for GST HSN/SAC codes and check applicable GST rates. Easy search by product description or chapter.',
    keywords: ['hsn code finder', 'gst rate finder', 'hsn search online', 'sac codes list'],
    type: 'calculator',
    calculatorData: {
      type: 'HSN Finder',
      features: ['Real-time search', 'Updated GST rates', 'Category breakdown'],
      accuracy: 'Lookup estimate',
      updates: 'Current GST council updates'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'HSN Finder', url: '/calculators/hsn-finder' }]
  },
  '/calculators/gst': {
    title: 'GST Calculator 2026 | Add or Remove GST | CGST SGST IGST | MyeCA.in',
    description: 'Calculate GST on invoices. Add or remove GST and split tax into CGST, SGST or IGST with current and legacy rate chips.',
    keywords: ['GST calculator', 'add GST calculator', 'remove GST calculator', 'CGST SGST IGST calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'GST Calculator',
      features: ['Add/remove GST', 'CGST/SGST/IGST split', '2026 rate chips'],
      accuracy: 'Rule-based estimate',
      updates: 'GST 2025-26 rate rationalisation ready'
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
    title: 'Gratuity Calculator India 2026 | 15/26 Formula | MyeCA.in',
    description: 'Calculate gratuity payable using Basic plus DA, service years and the statutory 15/26 formula.',
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
    title: 'EPF Calculator 2026 | Provident Fund Maturity Calculator | MyeCA.in',
    description: 'Project EPF maturity with employee contribution, employer contribution, EPS diversion and interest rate assumptions.',
    keywords: ['EPF calculator', 'PF calculator', 'provident fund calculator', 'EPF maturity calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'EPF Calculator',
      features: ['Employee and employer contribution', 'EPS split', 'Interest projection'],
      accuracy: 'Projection estimate',
      updates: '8.25% default interest editable'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'EPF Calculator', url: '/calculators/epf' }]
  },
  '/calculators/rd': {
    title: 'RD Calculator 2026 | Recurring Deposit Maturity | MyeCA.in',
    description: 'Calculate recurring deposit maturity amount, total investment and interest earned with quarterly compounding.',
    keywords: ['RD calculator', 'recurring deposit calculator', 'RD maturity calculator', 'monthly deposit calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'RD Calculator',
      features: ['Monthly deposit planning', 'Quarterly compounding', 'Interest earned'],
      accuracy: 'Projection estimate',
      updates: 'Bank-style compounding model'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'RD Calculator', url: '/calculators/rd' }]
  },
  '/calculators/lumpsum': {
    title: 'Lumpsum Calculator 2026 | Mutual Fund Return Calculator | MyeCA.in',
    description: 'Project one-time mutual fund investment growth with expected return and inflation-adjusted value.',
    keywords: ['lumpsum calculator', 'mutual fund lumpsum calculator', 'investment return calculator', 'future value calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Lumpsum Calculator',
      features: ['Future value', 'Wealth gain', 'Inflation-adjusted value'],
      accuracy: 'Projection estimate',
      updates: '2026 planning model'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Lumpsum Calculator', url: '/calculators/lumpsum' }]
  },
  '/calculators/swp': {
    title: 'SWP Calculator 2026 | Systematic Withdrawal Planner | MyeCA.in',
    description: 'Plan systematic withdrawals from mutual fund corpus and check whether your corpus lasts through the selected period.',
    keywords: ['SWP calculator', 'systematic withdrawal plan calculator', 'retirement withdrawal calculator', 'monthly withdrawal calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'SWP Calculator',
      features: ['Monthly withdrawal plan', 'Corpus depletion check', 'Remaining balance'],
      accuracy: 'Projection estimate',
      updates: '2026 retirement planning model'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'SWP Calculator', url: '/calculators/swp' }]
  },
  '/calculators/inflation': {
    title: 'Inflation Calculator 2026 | Future Cost Calculator India | MyeCA.in',
    description: 'Calculate future cost, present value and purchasing power loss using an inflation rate and planning period.',
    keywords: ['inflation calculator', 'future cost calculator', 'purchasing power calculator', 'cost inflation calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Inflation Calculator',
      features: ['Future cost', 'Present value', 'Purchasing power loss'],
      accuracy: 'Projection estimate',
      updates: '2026 planning model'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Inflation Calculator', url: '/calculators/inflation' }]
  },
  '/calculators/loan-eligibility': {
    title: 'Loan Eligibility Calculator 2026 | EMI Capacity Calculator | MyeCA.in',
    description: 'Estimate your eligible loan amount from monthly income, existing EMIs, FOIR, interest rate and tenure.',
    keywords: ['loan eligibility calculator', 'home loan eligibility calculator', 'FOIR calculator', 'eligible loan amount calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Loan Eligibility Calculator',
      features: ['FOIR-based eligibility', 'Eligible EMI', 'Loan amount estimate'],
      accuracy: 'Eligibility estimate',
      updates: '2026 lending assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Loan Eligibility', url: '/calculators/loan-eligibility' }]
  },

  // Investment Calculators
  '/calculators/sip': {
    title: 'SIP Calculator 2025 | Mutual Fund SIP Return Calculator | MyeCA.in',
    description: 'Calculate your mutual fund returns with our SIP calculator. Project your wealth growth with compound interest and plan your financial goals.',
    keywords: ['sip calculator', 'mutual fund return calculator', 'calculate sip online', 'investment planner'],
    type: 'calculator',
    calculatorData: {
      type: 'SIP Calculator',
      features: ['Compound interest projection', 'Monthly breakdown', 'Goal-based planning'],
      accuracy: 'Projection estimate',
      updates: 'FY 2025 projection model'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'SIP Calculator', url: '/calculators/sip' }]
  },
  '/calculators/sip-enhanced': {
    title: 'Enhanced SIP Calculator 2025 | Year-Wise Mutual Fund Growth | MyeCA.in',
    description: 'Use an enhanced SIP calculator for mutual fund projections, year-wise growth, compound returns, wealth multiple, and long-term goal planning.',
    keywords: ['enhanced SIP calculator', 'SIP growth calculator', 'year wise SIP calculator', 'mutual fund SIP projection'],
    type: 'calculator',
    calculatorData: {
      type: 'Enhanced SIP Calculator',
      features: ['Year-wise growth chart', 'Wealth multiple', 'Compound return projection'],
      accuracy: 'Projection estimate',
      updates: 'FY 2025 projection model'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Enhanced SIP Calculator', url: '/calculators/sip-enhanced' }]
  },
  '/calculators/nps': {
    title: 'NPS Calculator 2025 | National Pension Scheme Returns | MyeCA.in',
    description: 'Calculate your pension and lump sum maturity amount under National Pension Scheme (NPS). Plan your retirement with Section 80CCD tax benefits.',
    keywords: ['nps calculator', 'pension scheme returns', 'calculate nps online', 'retirement planning India'],
    type: 'calculator',
    calculatorData: {
      type: 'NPS Calculator',
      features: ['Tier I & II projection', 'Annuity calculation', 'Tax benefit tracking'],
      accuracy: 'Projection estimate',
      updates: 'FY 2025-26 planning assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'NPS Calculator', url: '/calculators/nps' }]
  },
  '/calculators/fd': {
    title: 'Fixed Deposit (FD) Calculator 2025 | FD Interest Rates | MyeCA.in',
    description: 'Calculate your FD maturity amount and interest earned. Compare rate assumptions and review post-tax returns before planning.',
    keywords: ['fd calculator', 'fixed deposit calculator', 'fd interest rates 2025', 'maturity amount calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'FD Calculator',
      features: ['Quarterly compounding', 'Senior citizen rates', 'TDS analysis'],
      accuracy: 'Projection estimate',
      updates: '2025 bank rate assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'FD Calculator', url: '/calculators/fd' }]
  },
  '/calculators/fd-enhanced': {
    title: 'Enhanced FD Calculator 2025 | Post-Tax Bank FD Returns | MyeCA.in',
    description: 'Compare bank FD rates and calculate post-tax fixed deposit maturity value, effective yield, TDS impact, and compounding returns.',
    keywords: ['enhanced FD calculator', 'post tax FD calculator', 'bank FD rates comparison', 'fixed deposit tax calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Enhanced FD Calculator',
      features: ['Bank rate comparison', 'Post-tax returns', 'Compounding frequency options'],
      accuracy: 'Projection estimate',
      updates: '2025 bank rate assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Enhanced FD Calculator', url: '/calculators/fd-enhanced' }]
  },
  '/calculators/ppf': {
    title: 'PPF Calculator 2025 | Public Provident Fund Returns | MyeCA.in',
    description: 'Calculate your PPF maturity amount with current 7.1% interest rate. Plan your 15-year tax-free investment and wealth creation.',
    keywords: ['ppf calculator', 'public provident fund', 'ppf interest rate 2025', 'tax free investment calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'PPF Calculator',
      features: ['15-year projection', 'Extension options', 'Section 80C tracking'],
      accuracy: 'Rule-based estimate',
      updates: 'Q1 2025 interest rates'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'PPF Calculator', url: '/calculators/ppf' }]
  },

  // Service Pages
  '/itr-filing': {
    title: 'ITR Filing Services AY 2026-27 | CA-Led Review | myeca.in',
    description: 'File ITR for FY 2025-26 and AY 2026-27 with CA-led review, Form 16, AIS, refund checks, secure document handling, and guided filing support online now.',
    keywords: ['ITR filing services', 'AY 2026-27 ITR filing', 'FY 2025-26 tax return', 'CA assisted ITR filing'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Filing', url: '/itr-filing' }]
  },
  '/gst-filing': {
    title: 'GST Filing Services India | Returns, ITC Review | myeca.in',
    description: 'Manage GST filing for FY 2025-26 with return prep, ITC review, invoice checks, due-date tracking, and CA-led support for MSMEs and manufacturers in India.',
    keywords: ['GST filing services', 'GST return filing India', 'FY 2025-26 GST filing', 'ITC review support'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'GST Filing', url: '/gst-filing' }]
  },
  '/services/gst-registration': {
    title: 'GST Registration Online India | Fast & Easy Process | MyeCA.in',
    description: 'Get GST registration support online with document preparation, portal filing guidance, query support, and transparent pricing.',
    keywords: ['GST registration', 'new GST connection', 'GST certificate online', 'apply for GST India'],
    type: 'service',
    serviceData: { price: '₹2999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'GST Registration', url: '/services/gst-registration' }]
  },
  '/services/company-registration': {
    title: 'Private Limited Company Registration Online | MyeCA.in',
    description: 'Register your company online with ease. Includes DSC, DIN, MOA, AOA, and PAN/TAN. Startup friendly pricing and expert support.',
    keywords: ['company registration', 'register pvt ltd', 'company incorporation', 'startup registration India'],
    type: 'service',
    serviceData: { price: '₹6999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Company Registration', url: '/services/company-registration' }]
  },
  '/services/trademark-registration': {
    title: 'Trademark Registration Online | Protect Your Brand | MyeCA.in',
    description: 'Apply for trademark registration and protect your brand identity. Search, filing, and tracking by expert IP attorneys.',
    keywords: ['trademark registration', 'register brand name', 'TM filing India', 'trademark consultant'],
    type: 'service',
    serviceData: { price: '₹12999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Trademark Registration', url: '/services/trademark-registration' }]
  },
  '/services/notice-compliance': {
    title: 'Income Tax Notice Reply | Expert CA Compliance | MyeCA.in',
    description: 'Received an income tax notice? Get expert CA assistance to draft and file accurate replies for Section 143(1), 139(9), etc.',
    keywords: ['income tax notice reply', 'respond to tax notice', '143(1) notice help', 'tax compliance services'],
    type: 'service',
    serviceData: { price: '₹2999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Notice Compliance', url: '/services/notice-compliance' }]
  },
  '/services/msme-udyam-registration': {
    title: 'MSME Udyam Registration Online | Govt Certificate | MyeCA.in',
    description: 'Get MSME / Udyam registration support with document guidance and official portal process notes.',
    keywords: ['MSME registration', 'udyam registration', 'msme certificate online', 'udyam portal India'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'MSME Registration', url: '/services/msme-udyam-registration' }]
  },
  '/about': {
    title: 'About myeca.in CA Tax Filing Platform | Rajasthan India',
    description: 'Learn how myeca.in blends CA-led tax filing, secure document workflows, and practical FY 2025-26 / AY 2026-27 compliance support from Bikaner, Rajasthan.',
    keywords: ['about myeca', 'tax experts India', 'fintech startup India', 'tax filing company'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'About Us', url: '/about' }]
  },
  '/trust': {
    title: 'Trust & Security | MyeCA.in Document Handling',
    description: 'Review how MyeCA.in handles tax documents, pricing scope, CA review, privacy, and security expectations before you start filing.',
    keywords: ['MyeCA trust', 'tax document security', 'ITR document privacy', 'secure tax filing India'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Trust & Security', url: '/trust' }]
  },
  '/contact': {
    title: 'Contact myeca.in CA Tax Filing Help | Bikaner Rajasthan',
    description: 'Contact myeca.in for FY 2025-26 and AY 2026-27 ITR filing, GST compliance, secure document support, and CA-led tax advisory from Bikaner, Rajasthan CA.',
    keywords: ['contact tax expert', 'myeca support', 'tax helpline India', 'CA consultation online'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Contact Us', url: '/contact' }]
  },
  '/blog': {
    title: 'ITR Filing Blog AY 2026-27 | CA Tax Guides India | myeca.in',
    description: 'Read CA-reviewed FY 2025-26 and AY 2026-27 tax guides on ITR forms, Form 16, AIS, refunds, GST, capital gains, NRI filing, and notices from myeca.in now.',
    keywords: ['AY 2026-27 ITR filing', 'ITR filing guide', 'income tax return India', 'Form 16 guide', 'AIS Form 26AS', 'tax regime comparison'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }]
  },
  '/experts': {
    title: 'Expert CA Consultation Online | MyeCA.in Professional Network',
    description: 'Connect with credential-checked tax professionals and MyeCA reviewers for personalized consultations and scoped professional advice.',
    keywords: ['online CA consultation', 'hire tax expert', 'CA network India', 'professional tax advice'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Experts', url: '/experts' }]
  },
  '/services/startup-india-registration': {
    title: 'Startup India Registration Online | DPIIT Recognition | MyeCA.in',
    description: 'Get recognized by DPIIT under the Startup India initiative. Avail tax exemptions, patent benefits, and easy self-certification.',
    keywords: ['startup india registration', 'dpiit recognition', 'startup tax benefits', 'register startup india'],
    type: 'service',
    serviceData: { price: '₹4999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Startup India', url: '/services/startup-india-registration' }]
  },
  '/calculators/emi': {
    title: 'EMI Calculator 2025 | Home, Car & Personal Loan EMI | MyeCA.in',
    description: 'Calculate your loan EMIs. Plan repayments for home loans, car loans, and personal loans with an estimate tool.',
    keywords: ['emi calculator', 'loan calculator', 'home loan emi', 'car loan emi calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'EMI Calculator',
      features: ['Amortization schedule', 'Total interest calculation', 'Repayment breakdown'],
      accuracy: 'Rule-based estimate',
      updates: '2025 loan rates supported'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'EMI Calculator', url: '/calculators/emi' }]
  },
  '/calculators/car-loan': {
    title: 'Car Loan EMI Calculator 2025 | Vehicle Loan Interest | MyeCA.in',
    description: 'Calculate your car loan EMI and total interest payable. Compare vehicle loan offers from top banks and plan your car purchase.',
    keywords: ['car loan emi calculator', 'vehicle loan calculator', 'auto loan emi', 'car loan interest rates'],
    type: 'calculator',
    calculatorData: {
      type: 'Car Loan Calculator',
      features: ['Amortization chart', 'Processing fee inclusion', 'Prepayment analysis'],
      accuracy: 'Rule-based estimate',
      updates: '2025 vehicle loan rates'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Car Loan', url: '/calculators/car-loan' }]
  },
  '/calculators/home-loan': {
    title: 'Home Loan EMI Calculator 2025 | Mortgage Interest Calculator | MyeCA.in',
    description: 'Calculate your home loan EMI, total interest, and principal repayment. Plan your home buying with detailed amortization schedules.',
    keywords: ['home loan emi calculator', 'mortgage calculator', 'house loan calculator', 'housing loan interest'],
    type: 'calculator',
    calculatorData: {
      type: 'Home Loan Calculator',
      features: ['Part-payment analysis', 'Tax benefit (Sec 24/80EEA)', 'Detailed amortization'],
      accuracy: 'Rule-based estimate',
      updates: '2025 mortgage rates'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Home Loan', url: '/calculators/home-loan' }]
  },
  '/calculators/personal-loan': {
    title: 'Personal Loan EMI Calculator 2025 | Interest & Affordability | MyeCA.in',
    description: 'Calculate personal loan EMI, total interest, total repayment and EMI-to-income ratio for unsecured loans in India.',
    keywords: ['personal loan emi calculator', 'personal loan calculator', 'EMI income ratio calculator', 'unsecured loan calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Personal Loan Calculator',
      features: ['EMI calculation', 'EMI-to-income ratio', 'Total interest estimate'],
      accuracy: 'Rule-based estimate',
      updates: '2025 personal loan assumptions'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Personal Loan', url: '/calculators/personal-loan' }]
  },
  '/calculators/education-loan': {
    title: 'Education Loan EMI Calculator 2025 | Moratorium & 80E Benefit | MyeCA.in',
    description: 'Calculate education loan EMI after moratorium, interest during study period, total repayment and Section 80E tax benefit context.',
    keywords: ['education loan emi calculator', 'study loan calculator', 'education loan moratorium calculator', 'section 80E calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Education Loan Calculator',
      features: ['Moratorium interest', 'Post-study EMI', 'Section 80E tax context'],
      accuracy: 'Rule-based estimate',
      updates: '2025 education loan assumptions'
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
    title: 'GST & Income Tax Penalty Calculator 2025 | MyeCA.in',
    description: 'Calculate late filing fees and interest penalties for GST returns, Income Tax, and TDS. Stay compliant and avoid heavy costs.',
    keywords: ['gst penalty calculator', 'income tax late fee', 'tds penalty', 'tax compliance cost'],
    type: 'calculator',
    calculatorData: {
      type: 'Penalty Calculator',
      features: ['GST late fee', 'Section 234A/B/C interest', 'TDS delay fees'],
      accuracy: 'Estimate for common cases',
      updates: 'FY 2025-26 compliant'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Penalty Calculator', url: '/calculators/penalty' }]
  },
  '/compliance-calendar': {
    title: 'Compliance Calendar 2025-26 | GST & Tax Due Dates | MyeCA.in',
    description: 'Stay ahead of tax deadlines with our comprehensive compliance calendar. Tracks GST, Income Tax, TDS, and MCA due dates for FY 2025-26.',
    keywords: ['compliance calendar 2025', 'tax due dates', 'gst return deadlines', 'income tax dates'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compliance Calendar', url: '/compliance-calendar' }]
  },
  '/elss-comparator': {
    title: 'ELSS Mutual Fund Comparator | Tax Saving Funds 2025 | MyeCA.in',
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
  '/itr/form-selector': {
    title: 'ITR Form Selector AY 2026-27 | Find ITR-1, ITR-2 or ITR-3 | MyeCA.in',
    description: 'Choose the right income tax return form for salary, capital gains, business income, foreign assets, and other AY 2026-27 filing scenarios.',
    keywords: ['ITR form selector', 'which ITR form', 'ITR-1 ITR-2 ITR-3', 'AY 2026-27 ITR filing', 'income tax return form'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'ITR Filing', url: '/itr/form-selector' }]
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
    description: 'All-in-one startup services including DPIIT recognition, funding support, and compliance management. Launch your dream venture with MyeCA.',
    keywords: ['startup solutions', 'entrepreneur support', 'startup ecosystem India', 'launch business India'],
    type: 'service',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Startup Services', url: '/startup-services' }]
  },
  '/pricing': {
    title: 'Transparent Tax Filing Pricing | ITR, GST & CA Review | MyeCA.in',
    description: 'Compare MyeCA.in pricing for CA-assisted ITR filing, GST, startup, and compliance services.',
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
    description: 'Answers to common questions about MyeCA.in tax filing, CA review, refunds, GST services, documents, and payments.',
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
  '/services/tax-planning': {
    title: 'Tax Planning Services India | Salary, Business & Investments | MyeCA.in',
    description: 'Plan salary, deductions, capital gains, business income, and regime selection with practical tax planning support.',
    keywords: ['tax planning services India', 'salary tax planning', 'capital gains tax planning', 'CA tax planning'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Unrated', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Tax Planning', url: '/services/tax-planning' }]
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
    description: 'Get PAN application, correction readiness, business PAN documentation, status guidance, and tax identity support from MyeCA reviewers.',
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
    title: 'ClearTax Alternative for CA-Reviewed ITR Filing | MyeCA.in',
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
    keywords: ['Quicko alternative', 'capital gains tax filing', 'broker statement import', 'CA reviewed capital gains'],
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

export const getSEOConfig = (path: string): SEOConfigItem | undefined => {
  return SEO_CONFIG[path];
};
