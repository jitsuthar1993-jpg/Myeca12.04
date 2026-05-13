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
    title: 'Expert Income Tax Filing & ITR e-Filing Services India AY 2026-27',
    description: 'File your Income Tax Return (ITR) for AY 2026-27 with guided workflows, secure document handling, and optional CA-assisted review.',
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
    description: 'Manage your tax returns, service orders, documents, and notifications in one secure place.',
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
      features: ['Metro/Non-metro calculation', 'Section 10(13A) compliance', 'Instant results'],
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
    description: 'Calculate GST on invoices instantly. Add or remove GST and split tax into CGST, SGST or IGST with current and legacy rate chips.',
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
      accuracy: '99%',
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
      accuracy: '100%',
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
    description: 'Calculate your FD maturity amount and interest earned. Compare latest FD rates from top Indian banks and optimize your savings.',
    keywords: ['fd calculator', 'fixed deposit calculator', 'fd interest rates 2025', 'maturity amount calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'FD Calculator',
      features: ['Quarterly compounding', 'Senior citizen rates', 'TDS analysis'],
      accuracy: '100%',
      updates: 'Latest 2025 bank rates'
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
      accuracy: '100%',
      updates: 'Latest 2025 bank rate assumptions'
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
      accuracy: '100%',
      updates: 'Q1 2025 interest rates'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'PPF Calculator', url: '/calculators/ppf' }]
  },

  // Service Pages
  '/services/gst-registration': {
    title: 'GST Registration Online India | Fast & Easy Process | MyeCA.in',
    description: 'Get GST registration support online with document preparation, portal filing guidance, query support, and transparent pricing.',
    keywords: ['GST registration', 'new GST connection', 'GST certificate online', 'apply for GST India'],
    type: 'service',
    serviceData: { price: '₹2999', rating: 'Not publicly verified', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'GST Registration', url: '/services/gst-registration' }]
  },
  '/services/company-registration': {
    title: 'Private Limited Company Registration Online | MyeCA.in',
    description: 'Register your company online with ease. Includes DSC, DIN, MOA, AOA, and PAN/TAN. Startup friendly pricing and expert support.',
    keywords: ['company registration', 'register pvt ltd', 'company incorporation', 'startup registration India'],
    type: 'service',
    serviceData: { price: '₹6999', rating: 'Not publicly verified', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Company Registration', url: '/services/company-registration' }]
  },
  '/services/trademark-registration': {
    title: 'Trademark Registration Online | Protect Your Brand | MyeCA.in',
    description: 'Apply for trademark registration and protect your brand identity. Search, filing, and tracking by expert IP attorneys.',
    keywords: ['trademark registration', 'register brand name', 'TM filing India', 'trademark consultant'],
    type: 'service',
    serviceData: { price: '₹12999', rating: 'Not publicly verified', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Trademark Registration', url: '/services/trademark-registration' }]
  },
  '/services/notice-compliance': {
    title: 'Income Tax Notice Reply | Expert CA Compliance | MyeCA.in',
    description: 'Received an income tax notice? Get expert CA assistance to draft and file accurate replies for Section 143(1), 139(9), etc.',
    keywords: ['income tax notice reply', 'respond to tax notice', '143(1) notice help', 'tax compliance services'],
    type: 'service',
    serviceData: { price: '₹2999', rating: 'Not publicly verified', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Notice Compliance', url: '/services/notice-compliance' }]
  },
  '/services/msme-udyam-registration': {
    title: 'MSME Udyam Registration Online | Govt Certificate | MyeCA.in',
    description: 'Get your MSME / Udyam registration certificate instantly. Avail government benefits, loans, and subsidies for your business.',
    keywords: ['MSME registration', 'udyam registration', 'msme certificate online', 'udyam portal India'],
    type: 'service',
    serviceData: { price: '₹999', rating: 'Not publicly verified', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'MSME Registration', url: '/services/msme-udyam-registration' }]
  },
  '/about': {
    title: 'About Us | MyeCA.in Tax Filing Platform',
    description: 'Learn about MyeCA.in, our mission to simplify tax filing, and the team building practical tax and compliance workflows.',
    keywords: ['about myeca', 'tax experts India', 'fintech startup India', 'tax filing company'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'About Us', url: '/about' }]
  },
  '/contact': {
    title: 'Contact Us | MyeCA.in Support & Consultation',
    description: 'Get in touch with MyeCA.in for expert tax consultation, support, and business inquiries. We are here to help you 24/7.',
    keywords: ['contact tax expert', 'myeca support', 'tax helpline India', 'CA consultation online'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Contact Us', url: '/contact' }]
  },
  '/blog': {
    title: 'AY 2026-27 ITR Filing Guides | MyeCA.in Blog',
    description: 'CA-reviewed AY 2026-27 ITR filing guides on due dates, ITR forms, Form 16, AIS, refunds, tax regime, capital gains, NRI filing, and notices.',
    keywords: ['AY 2026-27 ITR filing', 'ITR filing guide', 'income tax return India', 'Form 16 guide', 'AIS Form 26AS', 'tax regime comparison'],
    type: 'article',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }]
  },
  '/experts': {
    title: 'Expert CA Consultation Online | MyeCA.in Professional Network',
    description: 'Connect with experienced Chartered Accountants and tax experts for personalized consultations and professional advice.',
    keywords: ['online CA consultation', 'hire tax expert', 'CA network India', 'professional tax advice'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Experts', url: '/experts' }]
  },
  '/services/startup-india-registration': {
    title: 'Startup India Registration Online | DPIIT Recognition | MyeCA.in',
    description: 'Get recognized by DPIIT under the Startup India initiative. Avail tax exemptions, patent benefits, and easy self-certification.',
    keywords: ['startup india registration', 'dpiit recognition', 'startup tax benefits', 'register startup india'],
    type: 'service',
    serviceData: { price: '₹4999', rating: 'Not publicly verified', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Startup India', url: '/services/startup-india-registration' }]
  },
  '/calculators/emi': {
    title: 'EMI Calculator 2025 | Home, Car & Personal Loan EMI | MyeCA.in',
    description: 'Calculate your loan EMIs instantly. Plan your repayments for home loans, car loans, and personal loans with our easy-to-use tool.',
    keywords: ['emi calculator', 'loan calculator', 'home loan emi', 'car loan emi calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'EMI Calculator',
      features: ['Amortization schedule', 'Total interest calculation', 'Repayment breakdown'],
      accuracy: '100%',
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
      accuracy: '100%',
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
      accuracy: '100%',
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
      accuracy: '100%',
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
      accuracy: '100%',
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
    title: 'ELSS Mutual Fund Comparator | Best Tax Saving Funds 2025 | MyeCA.in',
    description: 'Compare top-performing ELSS mutual funds. Analyze returns, risk ratios, and tax-saving potential under Section 80C.',
    keywords: ['elss comparator', 'best tax saving funds', 'compare elss mutual funds', '80C investments'],
    type: 'calculator',
    calculatorData: {
      type: 'ELSS Comparator',
      features: ['Return analysis', 'Risk metrics', 'Direct vs Regular comparison'],
      accuracy: '100%',
      updates: 'Current market data'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'ELSS Comparator', url: '/elss-comparator' }]
  },
  '/form16-parser': {
    title: 'Free Form 16 Parser Online | Instant ITR Pre-fill | MyeCA.in',
    description: 'Upload your Form 16 PDF and instantly parse your salary, deductions, and tax details for easy ITR filing. Secure and private.',
    keywords: ['form 16 parser', 'upload form 16', 'salary tax details', 'itr pre-fill tool'],
    type: 'calculator',
    calculatorData: {
      type: 'Form 16 Parser',
      features: ['PDF parsing', 'Auto-deduction mapping', 'Private & Secure'],
      accuracy: '99%',
      updates: 'AY 2026-27 supported'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Form 16 Parser', url: '/form16-parser' }]
  },
  '/tax-assistant': {
    title: 'AI Tax Assistant | Instant Tax Answers & Support | MyeCA.in',
    description: 'Ask our AI Tax Assistant any question about ITR filing, GST, or business compliance. Get instant, expert-backed financial advice.',
    keywords: ['ai tax assistant', 'tax help bot', 'expert tax answers', 'chat with tax expert'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'AI Tax Assistant', url: '/tax-assistant' }]
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
    description: 'Compare MyeCA.in pricing for self-service ITR filing, CA-assisted review, GST, startup, and compliance services.',
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
    serviceData: { price: 'Rs 499', rating: 'Not publicly verified', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'ITR for Salaried', url: '/services/itr-for-salaried' }]
  },
  '/services/tax-planning': {
    title: 'Tax Planning Services India | Salary, Business & Investments | MyeCA.in',
    description: 'Plan salary, deductions, capital gains, business income, and regime selection with practical tax planning support.',
    keywords: ['tax planning services India', 'salary tax planning', 'capital gains tax planning', 'CA tax planning'],
    type: 'service',
    serviceData: { price: 'Rs 999', rating: 'Not publicly verified', reviews: '0', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Tax Planning', url: '/services/tax-planning' }]
  },
  '/services/document-vault': {
    title: 'Secure Tax Document Vault | MyeCA.in',
    description: 'Store and organize tax documents, Form 16, AIS, receipts, certificates, and filing records for easier review.',
    keywords: ['tax document vault', 'secure document storage', 'Form 16 storage', 'ITR document organizer'],
    type: 'service',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Document Vault', url: '/services/document-vault' }]
  },
  '/startup/registration': {
    title: 'Startup Registration Guidance India | MyeCA.in',
    description: 'Get guidance for startup registration, entity setup, DPIIT readiness, GST, MSME, and compliance next steps.',
    keywords: ['startup registration India', 'DPIIT startup registration', 'startup compliance India'],
    type: 'service',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Startup Services', url: '/startup-services' }, { name: 'Registration', url: '/startup/registration' }]
  },
  '/compare': {
    title: 'Tax Tool Comparison Hub | MyeCA.in',
    description: 'Compare tax filing workflows, calculators, services, and support options before choosing the right path.',
    keywords: ['tax filing comparison', 'ITR platform comparison', 'tax tool comparison'],
    type: 'website',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Compare', url: '/compare' }]
  }
};

export const getSEOConfig = (path: string): SEOConfigItem | undefined => {
  return SEO_CONFIG[path];
};
