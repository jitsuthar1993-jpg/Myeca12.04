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
}

export const SEO_CONFIG: Record<string, SEOConfigItem> = {
  // Core Pages
  '/': {
    title: 'Expert Income Tax Filing & ITR e-Filing Services India 2025-26',
    description: 'File your Income Tax Return (ITR) with expert CA assistance. Maximum tax refund guaranteed, 100% accuracy, and secure processing. Trusted by 2.5M+ users.',
    keywords: ['ITR filing India', 'income tax return online', 'CA assisted tax filing', 'e-filing 2025', 'tax consultant near me'],
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
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Dashboard', url: '/dashboard' }]
  },

  // Tax Calculators
  '/calculators/income-tax': {
    title: 'Income Tax Calculator 2025-26 | New vs Old Regime | MyeCA.in',
    description: 'Accurately calculate your income tax for AY 2025-26 and 2026-27. Compare New and Old tax regimes in real-time to maximize your tax savings.',
    keywords: ['income tax calculator 2025', 'AY 2025-26 tax calculator', 'old vs new regime calculator', 'income tax slabs 2025'],
    type: 'calculator',
    calculatorData: {
      type: 'Income Tax Calculator',
      features: ['Real-time comparison', 'Deduction optimization', 'AY 2025-26 support', 'Tax saving tips'],
      accuracy: '99.9%',
      updates: 'Updated with Union Budget 2025'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Income Tax', url: '/calculators/income-tax' }]
  },
  '/calculators/capital-gains': {
    title: 'Capital Gains Tax Calculator 2025 | STCG & LTCG Calculator | MyeCA.in',
    description: 'Calculate capital gains tax on stocks, mutual funds, property & gold. Updated with Budget 2024 rates. Know STCG & LTCG tax rates and holding periods.',
    keywords: ['capital gains calculator', 'LTCG calculator', 'STCG calculator', 'tax on shares', 'property tax calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Capital Gains Calculator',
      features: ['Equity & Property support', 'Budget 2024 rates', 'LTCG/STCG breakdown'],
      accuracy: '100%',
      updates: 'Post-Budget 2024 updated'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Capital Gains', url: '/calculators/capital-gains' }]
  },
  '/calculators/advance-tax': {
    title: 'Advance Tax Calculator 2025 | Installment Due Dates | MyeCA.in',
    description: 'Calculate your advance tax liability and view installment due dates for FY 2024-25. Avoid Section 234B & 234C interest penalties.',
    keywords: ['advance tax calculator', 'tax installments 2025', 'income tax due dates', 'section 234C calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'Advance Tax Calculator',
      features: ['Quarterly breakdown', 'Due date alerts', 'Penalty estimation'],
      accuracy: '99.9%',
      updates: 'FY 2024-25 compliant'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Advance Tax', url: '/calculators/advance-tax' }]
  },
  '/calculators/hra': {
    title: 'HRA Calculator 2025 | House Rent Allowance Exemption | MyeCA.in',
    description: 'Calculate your HRA tax exemption for FY 2024-25 and 2025-26. Find the exempt and taxable portion of your house rent allowance easily.',
    keywords: ['HRA calculator', 'house rent allowance exemption', 'calculate HRA tax', 'rent receipt calculator'],
    type: 'calculator',
    calculatorData: {
      type: 'HRA Calculator',
      features: ['Metro/Non-metro calculation', 'Section 10(13A) compliance', 'Instant results'],
      accuracy: '100%',
      updates: 'FY 2024-25 & 2025-26 compliant'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'HRA Calculator', url: '/calculators/hra' }]
  },
  '/calculators/tax-regime': {
    title: 'New vs Old Tax Regime Calculator 2025 | Which is Better? | MyeCA.in',
    description: 'Compare Old vs New Tax Regime for AY 2025-26. Real-time analysis of tax savings based on your investments and deductions.',
    keywords: ['tax regime comparison', 'old vs new tax regime', 'best tax regime for me', 'tax savings 2025'],
    type: 'calculator',
    calculatorData: {
      type: 'Regime Comparison Tool',
      features: ['Investment-linked analysis', 'Section 80C/80D support', 'Break-even point calculation'],
      accuracy: '100%',
      updates: 'Budget 2025 ready'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'Tax Regime', url: '/calculators/tax-regime' }]
  },
  '/calculators/hsn-finder': {
    title: 'HSN Code Finder 2025 | GST Rate Finder Online | MyeCA.in',
    description: 'Search for GST HSN/SAC codes and check applicable GST rates. Easy search by product description or chapter.',
    keywords: ['hsn code finder', 'gst rate finder', 'hsn search online', 'sac codes list'],
    type: 'calculator',
    calculatorData: {
      type: 'HSN Finder',
      features: ['Real-time search', 'Updated GST rates', 'Category breakdown'],
      accuracy: '100%',
      updates: 'Current GST council updates'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'HSN Finder', url: '/calculators/hsn-finder' }]
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
      accuracy: '100%',
      updates: 'FY 2025 projection model'
    },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Calculators', url: '/calculators' }, { name: 'SIP Calculator', url: '/calculators/sip' }]
  },
  '/calculators/nps': {
    title: 'NPS Calculator 2025 | National Pension Scheme Returns | MyeCA.in',
    description: 'Calculate your pension and lump sum maturity amount under National Pension Scheme (NPS). Plan your retirement with Section 80CCD tax benefits.',
    keywords: ['nps calculator', 'pension scheme returns', 'calculate nps online', 'retirement planning India'],
    type: 'calculator',
    calculatorData: {
      type: 'NPS Calculator',
      features: ['Tier I & II projection', 'Annuity calculation', 'Tax benefit tracking'],
      accuracy: '99.9%',
      updates: 'FY 2024-25 compliant'
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
    description: 'Get your GST registration online within 3-5 days. Expert CA assistance, transparent pricing, and 100% compliance guaranteed.',
    keywords: ['GST registration', 'new GST connection', 'GST certificate online', 'apply for GST India'],
    type: 'service',
    serviceData: { price: '₹999', rating: '4.9', reviews: '1250', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'GST Registration', url: '/services/gst-registration' }]
  },
  '/services/company-registration': {
    title: 'Private Limited Company Registration Online | MyeCA.in',
    description: 'Register your company online with ease. Includes DSC, DIN, MOA, AOA, and PAN/TAN. Startup friendly pricing and expert support.',
    keywords: ['company registration', 'register pvt ltd', 'company incorporation', 'startup registration India'],
    type: 'service',
    serviceData: { price: '₹5999', rating: '4.8', reviews: '850', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Company Registration', url: '/services/company-registration' }]
  },
  '/services/trademark-registration': {
    title: 'Trademark Registration Online | Protect Your Brand | MyeCA.in',
    description: 'Apply for trademark registration and protect your brand identity. Search, filing, and tracking by expert IP attorneys.',
    keywords: ['trademark registration', 'register brand name', 'TM filing India', 'trademark consultant'],
    type: 'service',
    serviceData: { price: '₹1499', rating: '4.9', reviews: '620', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Trademark Registration', url: '/services/trademark-registration' }]
  },
  '/services/notice-compliance': {
    title: 'Income Tax Notice Reply | Expert CA Compliance | MyeCA.in',
    description: 'Received an income tax notice? Get expert CA assistance to draft and file accurate replies for Section 143(1), 139(9), etc.',
    keywords: ['income tax notice reply', 'respond to tax notice', '143(1) notice help', 'tax compliance services'],
    type: 'service',
    serviceData: { price: '₹1999', rating: '4.7', reviews: '450', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'Notice Compliance', url: '/services/notice-compliance' }]
  },
  '/services/msme-udyam-registration': {
    title: 'MSME Udyam Registration Online | Govt Certificate | MyeCA.in',
    description: 'Get your MSME / Udyam registration certificate instantly. Avail government benefits, loans, and subsidies for your business.',
    keywords: ['MSME registration', 'udyam registration', 'msme certificate online', 'udyam portal India'],
    type: 'service',
    serviceData: { price: '₹499', rating: '5.0', reviews: '2100', availability: 'InStock' },
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Services', url: '/services' }, { name: 'MSME Registration', url: '/services/msme-udyam-registration' }]
  },
  '/about': {
    title: 'About Us | MyeCA.in - India\'s Leading Tax Platform',
    description: 'Learn about MyeCA.in, our mission to simplify tax filing, and the experts behind India\'s most trusted financial services platform.',
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
  }
};

export const getSEOConfig = (path: string): SEOConfigItem | undefined => {
  return SEO_CONFIG[path];
};
