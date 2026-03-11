// ELSS (Equity Linked Savings Scheme) Fund Data
// Note: This is static/mock data for demonstration. In production, use a real API.

export interface ELSSFund {
  id: string;
  name: string;
  amc: string;
  category: 'Large Cap' | 'Large & Mid Cap' | 'Multi Cap' | 'Small & Mid Cap' | 'Flexi Cap';
  nav: number;
  aum: number; // in crores
  expenseRatio: number; // percentage
  returns: {
    oneYear: number;
    threeYear: number;
    fiveYear: number;
    tenYear?: number;
    sinceInception: number;
  };
  riskLevel: 'Low' | 'Moderate' | 'Moderately High' | 'High' | 'Very High';
  rating: number; // 1-5 stars
  minSIP: number;
  minLumpsum: number;
  exitLoad: string;
  benchmark: string;
  fundManager: string;
  launchDate: string;
  lockInPeriod: string;
}

export const ELSS_FUNDS: ELSSFund[] = [
  {
    id: 'axis-elss',
    name: 'Axis Long Term Equity Fund',
    amc: 'Axis Mutual Fund',
    category: 'Large & Mid Cap',
    nav: 78.52,
    aum: 35420,
    expenseRatio: 0.58,
    returns: {
      oneYear: 24.5,
      threeYear: 15.8,
      fiveYear: 18.2,
      tenYear: 16.5,
      sinceInception: 17.8,
    },
    riskLevel: 'Moderately High',
    rating: 5,
    minSIP: 500,
    minLumpsum: 500,
    exitLoad: 'Nil',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Jinesh Gopani',
    launchDate: '2009-12-29',
    lockInPeriod: '3 Years',
  },
  {
    id: 'mirae-elss',
    name: 'Mirae Asset Tax Saver Fund',
    amc: 'Mirae Asset Mutual Fund',
    category: 'Multi Cap',
    nav: 42.18,
    aum: 18650,
    expenseRatio: 0.52,
    returns: {
      oneYear: 28.3,
      threeYear: 18.2,
      fiveYear: 21.5,
      sinceInception: 19.2,
    },
    riskLevel: 'Moderately High',
    rating: 5,
    minSIP: 500,
    minLumpsum: 500,
    exitLoad: 'Nil',
    benchmark: 'NIFTY 200 TRI',
    fundManager: 'Neelesh Surana',
    launchDate: '2015-12-28',
    lockInPeriod: '3 Years',
  },
  {
    id: 'parag-elss',
    name: 'Parag Parikh Tax Saver Fund',
    amc: 'PPFAS Mutual Fund',
    category: 'Flexi Cap',
    nav: 28.75,
    aum: 8420,
    expenseRatio: 0.65,
    returns: {
      oneYear: 32.1,
      threeYear: 22.5,
      fiveYear: 24.8,
      sinceInception: 21.3,
    },
    riskLevel: 'Moderately High',
    rating: 5,
    minSIP: 1000,
    minLumpsum: 1000,
    exitLoad: 'Nil',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Rajeev Thakkar',
    launchDate: '2019-07-24',
    lockInPeriod: '3 Years',
  },
  {
    id: 'canara-elss',
    name: 'Canara Robeco Equity Tax Saver',
    amc: 'Canara Robeco Mutual Fund',
    category: 'Large & Mid Cap',
    nav: 156.32,
    aum: 7250,
    expenseRatio: 0.59,
    returns: {
      oneYear: 26.8,
      threeYear: 17.5,
      fiveYear: 20.1,
      tenYear: 15.8,
      sinceInception: 16.2,
    },
    riskLevel: 'Moderately High',
    rating: 4,
    minSIP: 500,
    minLumpsum: 500,
    exitLoad: 'Nil',
    benchmark: 'S&P BSE 200 TRI',
    fundManager: 'Shridatta Bhandwaldar',
    launchDate: '1993-03-31',
    lockInPeriod: '3 Years',
  },
  {
    id: 'sbi-elss',
    name: 'SBI Long Term Equity Fund',
    amc: 'SBI Mutual Fund',
    category: 'Large Cap',
    nav: 312.45,
    aum: 15680,
    expenseRatio: 0.89,
    returns: {
      oneYear: 22.1,
      threeYear: 14.5,
      fiveYear: 16.8,
      tenYear: 14.2,
      sinceInception: 15.5,
    },
    riskLevel: 'Moderately High',
    rating: 4,
    minSIP: 500,
    minLumpsum: 500,
    exitLoad: 'Nil',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Dinesh Balachandran',
    launchDate: '1993-03-31',
    lockInPeriod: '3 Years',
  },
  {
    id: 'hdfc-elss',
    name: 'HDFC TaxSaver Fund',
    amc: 'HDFC Mutual Fund',
    category: 'Multi Cap',
    nav: 1125.68,
    aum: 14520,
    expenseRatio: 1.02,
    returns: {
      oneYear: 25.6,
      threeYear: 16.2,
      fiveYear: 17.5,
      tenYear: 13.8,
      sinceInception: 18.2,
    },
    riskLevel: 'Moderately High',
    rating: 3,
    minSIP: 500,
    minLumpsum: 500,
    exitLoad: 'Nil',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Roshi Jain',
    launchDate: '1996-03-31',
    lockInPeriod: '3 Years',
  },
  {
    id: 'dsp-elss',
    name: 'DSP Tax Saver Fund',
    amc: 'DSP Mutual Fund',
    category: 'Large & Mid Cap',
    nav: 98.75,
    aum: 12340,
    expenseRatio: 0.72,
    returns: {
      oneYear: 27.2,
      threeYear: 16.8,
      fiveYear: 18.5,
      tenYear: 14.5,
      sinceInception: 16.8,
    },
    riskLevel: 'Moderately High',
    rating: 4,
    minSIP: 500,
    minLumpsum: 500,
    exitLoad: 'Nil',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Rohit Singhania',
    launchDate: '2007-01-18',
    lockInPeriod: '3 Years',
  },
  {
    id: 'kotak-elss',
    name: 'Kotak Tax Saver Fund',
    amc: 'Kotak Mutual Fund',
    category: 'Flexi Cap',
    nav: 86.42,
    aum: 5680,
    expenseRatio: 0.62,
    returns: {
      oneYear: 29.5,
      threeYear: 19.2,
      fiveYear: 20.8,
      tenYear: 15.2,
      sinceInception: 14.8,
    },
    riskLevel: 'Moderately High',
    rating: 4,
    minSIP: 500,
    minLumpsum: 500,
    exitLoad: 'Nil',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Harsha Upadhyaya',
    launchDate: '2007-11-23',
    lockInPeriod: '3 Years',
  },
  {
    id: 'icici-elss',
    name: 'ICICI Prudential Long Term Equity Fund',
    amc: 'ICICI Prudential Mutual Fund',
    category: 'Large Cap',
    nav: 652.18,
    aum: 11250,
    expenseRatio: 1.08,
    returns: {
      oneYear: 23.8,
      threeYear: 15.2,
      fiveYear: 16.5,
      tenYear: 13.5,
      sinceInception: 14.2,
    },
    riskLevel: 'Moderately High',
    rating: 3,
    minSIP: 100,
    minLumpsum: 500,
    exitLoad: 'Nil',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Mittul Kalawadia',
    launchDate: '1999-08-19',
    lockInPeriod: '3 Years',
  },
  {
    id: 'quant-elss',
    name: 'Quant Tax Plan',
    amc: 'Quant Mutual Fund',
    category: 'Multi Cap',
    nav: 312.56,
    aum: 4850,
    expenseRatio: 0.57,
    returns: {
      oneYear: 45.2,
      threeYear: 32.5,
      fiveYear: 35.8,
      sinceInception: 18.5,
    },
    riskLevel: 'Very High',
    rating: 5,
    minSIP: 500,
    minLumpsum: 500,
    exitLoad: 'Nil',
    benchmark: 'NIFTY 500 TRI',
    fundManager: 'Sanjeev Sharma',
    launchDate: '2000-01-07',
    lockInPeriod: '3 Years',
  },
];

// Get top funds by various criteria
export function getTopFundsByReturns(period: '1Y' | '3Y' | '5Y', limit: number = 5): ELSSFund[] {
  return [...ELSS_FUNDS].sort((a, b) => {
    const aReturn = period === '1Y' ? a.returns.oneYear : period === '3Y' ? a.returns.threeYear : a.returns.fiveYear;
    const bReturn = period === '1Y' ? b.returns.oneYear : period === '3Y' ? b.returns.threeYear : b.returns.fiveYear;
    return bReturn - aReturn;
  }).slice(0, limit);
}

export function getTopFundsByRating(limit: number = 5): ELSSFund[] {
  return [...ELSS_FUNDS].sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function getLowExpenseRatioFunds(limit: number = 5): ELSSFund[] {
  return [...ELSS_FUNDS].sort((a, b) => a.expenseRatio - b.expenseRatio).slice(0, limit);
}

export function getFundsByCategory(category: ELSSFund['category']): ELSSFund[] {
  return ELSS_FUNDS.filter(fund => fund.category === category);
}

// Fund categories for filtering
export const FUND_CATEGORIES: ELSSFund['category'][] = [
  'Large Cap',
  'Large & Mid Cap', 
  'Multi Cap',
  'Small & Mid Cap',
  'Flexi Cap'
];

// Risk levels
export const RISK_LEVELS: ELSSFund['riskLevel'][] = [
  'Low',
  'Moderate',
  'Moderately High',
  'High',
  'Very High'
];

