// Portfolio Tax Impact Calculation Utilities

export type AssetType = 'equity' | 'equity_mf' | 'debt_mf' | 'gold' | 'property' | 'fd' | 'bonds';

export interface Holding {
  id: string;
  name: string;
  type: AssetType;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  buyDate: Date;
  dividendYield?: number; // Annual dividend yield percentage
}

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  realizedGain: number;
  stcgAmount: number;
  ltcgAmount: number;
  stcgTax: number;
  ltcgTax: number;
  totalTaxLiability: number;
  dividendIncome: number;
  dividendTDS: number;
}

export interface HoldingTaxAnalysis {
  holding: Holding;
  investedValue: number;
  currentValue: number;
  unrealizedGain: number;
  gainPercent: number;
  holdingPeriodDays: number;
  isLTCG: boolean;
  taxRate: number;
  estimatedTax: number;
  taxableGain: number;
  recommendation: 'hold' | 'sell' | 'book_loss';
  recommendationReason: string;
}

export interface TaxHarvestingSuggestion {
  holding: Holding;
  action: 'sell' | 'hold';
  reason: string;
  potentialSavings: number;
  loss: number;
}

// Tax rates and thresholds
export const TAX_CONFIG = {
  // Equity & Equity MF (Listed)
  equity: {
    ltcgThreshold: 365, // 1 year
    ltcgExemption: 125000, // \u20B91.25 lakh
    ltcgRate: 0.125, // 12.5%
    stcgRate: 0.20, // 20%
    dividendTDS: 0.10, // 10% TDS on dividend > \u20B95000
  },
  // Debt MF (new rules from April 2023)
  debt_mf: {
    ltcgThreshold: 1095, // 3 years (but taxed as per slab now)
    stcgRate: 0.30, // As per slab (assuming highest)
    ltcgRate: 0.30, // No indexation benefit anymore
  },
  // Gold & Property
  gold: {
    ltcgThreshold: 730, // 2 years
    ltcgRate: 0.125, // 12.5% without indexation (new rule)
    stcgRate: 0.30, // As per slab
  },
  property: {
    ltcgThreshold: 730, // 2 years
    ltcgRate: 0.125, // 12.5% without indexation (new rule)
    stcgRate: 0.30, // As per slab
  },
  // FD & Bonds
  fd: {
    interestTaxRate: 0.30, // As per slab
    tdsRate: 0.10, // TDS on interest > \u20B940K
  },
  bonds: {
    ltcgThreshold: 365, // 1 year
    ltcgRate: 0.125, // Listed bonds
    stcgRate: 0.30,
  },
};

// Get holding period in days
export function getHoldingPeriodDays(buyDate: Date): number {
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - buyDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Check if holding qualifies for LTCG
export function isLTCG(type: AssetType, buyDate: Date): boolean {
  const holdingDays = getHoldingPeriodDays(buyDate);
  const threshold = type === 'equity' || type === 'equity_mf' 
    ? TAX_CONFIG.equity.ltcgThreshold 
    : type === 'debt_mf' 
    ? TAX_CONFIG.debt_mf.ltcgThreshold
    : type === 'gold'
    ? TAX_CONFIG.gold.ltcgThreshold
    : type === 'property'
    ? TAX_CONFIG.property.ltcgThreshold
    : TAX_CONFIG.bonds.ltcgThreshold;
  
  return holdingDays >= threshold;
}

// Get tax rate for a holding
export function getTaxRate(type: AssetType, isLTCG: boolean): number {
  if (type === 'equity' || type === 'equity_mf') {
    return isLTCG ? TAX_CONFIG.equity.ltcgRate : TAX_CONFIG.equity.stcgRate;
  } else if (type === 'debt_mf') {
    return TAX_CONFIG.debt_mf.stcgRate; // Same rate for both now
  } else if (type === 'gold') {
    return isLTCG ? TAX_CONFIG.gold.ltcgRate : TAX_CONFIG.gold.stcgRate;
  } else if (type === 'property') {
    return isLTCG ? TAX_CONFIG.property.ltcgRate : TAX_CONFIG.property.stcgRate;
  } else if (type === 'bonds') {
    return isLTCG ? TAX_CONFIG.bonds.ltcgRate : TAX_CONFIG.bonds.stcgRate;
  }
  return 0.30; // Default highest slab
}

// Analyze individual holding
export function analyzeHolding(holding: Holding): HoldingTaxAnalysis {
  const investedValue = holding.quantity * holding.buyPrice;
  const currentValue = holding.quantity * holding.currentPrice;
  const unrealizedGain = currentValue - investedValue;
  const gainPercent = (unrealizedGain / investedValue) * 100;
  const holdingPeriodDays = getHoldingPeriodDays(holding.buyDate);
  const holdingIsLTCG = isLTCG(holding.type, holding.buyDate);
  const taxRate = getTaxRate(holding.type, holdingIsLTCG);
  
  // Calculate taxable gain (apply exemption for equity LTCG)
  let taxableGain = Math.max(0, unrealizedGain);
  if ((holding.type === 'equity' || holding.type === 'equity_mf') && holdingIsLTCG && unrealizedGain > 0) {
    // LTCG exemption is applied at portfolio level, not individual holding
    // For individual analysis, show full taxable amount
  }
  
  const estimatedTax = taxableGain > 0 ? taxableGain * taxRate : 0;
  
  // Generate recommendation
  let recommendation: 'hold' | 'sell' | 'book_loss' = 'hold';
  let recommendationReason = '';
  
  if (unrealizedGain < 0) {
    // Loss position
    const daysToLTCG = getThresholdForType(holding.type) - holdingPeriodDays;
    if (daysToLTCG > 0 && daysToLTCG <= 30) {
      recommendation = 'hold';
      recommendationReason = `Wait ${daysToLTCG} days to qualify for LTCG treatment`;
    } else if (!holdingIsLTCG && (holding.type === 'equity' || holding.type === 'equity_mf')) {
      recommendation = 'book_loss';
      recommendationReason = 'Consider booking STCG loss to offset gains';
    }
  } else {
    // Profit position
    const daysToLTCG = getThresholdForType(holding.type) - holdingPeriodDays;
    if (daysToLTCG > 0 && daysToLTCG <= 30) {
      recommendation = 'hold';
      recommendationReason = `Hold ${daysToLTCG} more days for lower LTCG tax rate`;
    } else if (gainPercent > 50 && holdingIsLTCG) {
      recommendation = 'sell';
      recommendationReason = 'Consider partial profit booking at lower LTCG rate';
    }
  }
  
  return {
    holding,
    investedValue,
    currentValue,
    unrealizedGain,
    gainPercent: Math.round(gainPercent * 100) / 100,
    holdingPeriodDays,
    isLTCG: holdingIsLTCG,
    taxRate: taxRate * 100,
    estimatedTax: Math.round(estimatedTax),
    taxableGain: Math.round(taxableGain),
    recommendation,
    recommendationReason,
  };
}

function getThresholdForType(type: AssetType): number {
  if (type === 'equity' || type === 'equity_mf') return TAX_CONFIG.equity.ltcgThreshold;
  if (type === 'debt_mf') return TAX_CONFIG.debt_mf.ltcgThreshold;
  if (type === 'gold') return TAX_CONFIG.gold.ltcgThreshold;
  if (type === 'property') return TAX_CONFIG.property.ltcgThreshold;
  return TAX_CONFIG.bonds.ltcgThreshold;
}

// Calculate portfolio-level tax summary
export function calculatePortfolioTax(holdings: Holding[]): PortfolioSummary {
  let totalInvested = 0;
  let currentValue = 0;
  let stcgAmount = 0;
  let ltcgAmount = 0;
  let dividendIncome = 0;
  
  holdings.forEach(holding => {
    const invested = holding.quantity * holding.buyPrice;
    const current = holding.quantity * holding.currentPrice;
    const gain = current - invested;
    
    totalInvested += invested;
    currentValue += current;
    
    if (gain > 0) {
      if (isLTCG(holding.type, holding.buyDate)) {
        ltcgAmount += gain;
      } else {
        stcgAmount += gain;
      }
    }
    
    // Calculate dividend income
    if (holding.dividendYield && holding.dividendYield > 0) {
      dividendIncome += current * (holding.dividendYield / 100);
    }
  });
  
  const unrealizedGain = currentValue - totalInvested;
  const unrealizedGainPercent = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;
  
  // Calculate LTCG tax with exemption for equity
  const equityLTCG = holdings
    .filter(h => (h.type === 'equity' || h.type === 'equity_mf') && isLTCG(h.type, h.buyDate))
    .reduce((sum, h) => sum + Math.max(0, (h.quantity * h.currentPrice) - (h.quantity * h.buyPrice)), 0);
  
  const otherLTCG = ltcgAmount - equityLTCG;
  
  // Apply exemption only to equity LTCG
  const taxableEquityLTCG = Math.max(0, equityLTCG - TAX_CONFIG.equity.ltcgExemption);
  const equityLTCGTax = taxableEquityLTCG * TAX_CONFIG.equity.ltcgRate;
  const otherLTCGTax = otherLTCG * 0.20; // Generic LTCG rate for others
  
  const ltcgTax = equityLTCGTax + otherLTCGTax;
  const stcgTax = stcgAmount * TAX_CONFIG.equity.stcgRate; // Using equity STCG rate
  
  // Dividend TDS
  const dividendTDS = dividendIncome > 5000 ? dividendIncome * TAX_CONFIG.equity.dividendTDS : 0;
  
  return {
    totalInvested: Math.round(totalInvested),
    currentValue: Math.round(currentValue),
    unrealizedGain: Math.round(unrealizedGain),
    unrealizedGainPercent: Math.round(unrealizedGainPercent * 100) / 100,
    realizedGain: 0, // Would need transaction history for this
    stcgAmount: Math.round(stcgAmount),
    ltcgAmount: Math.round(ltcgAmount),
    stcgTax: Math.round(stcgTax),
    ltcgTax: Math.round(ltcgTax),
    totalTaxLiability: Math.round(stcgTax + ltcgTax),
    dividendIncome: Math.round(dividendIncome),
    dividendTDS: Math.round(dividendTDS),
  };
}

// Generate tax-loss harvesting suggestions
export function getTaxHarvestingSuggestions(holdings: Holding[]): TaxHarvestingSuggestion[] {
  const suggestions: TaxHarvestingSuggestion[] = [];
  
  // Calculate total gains
  const totalGains = holdings
    .filter(h => (h.quantity * h.currentPrice) > (h.quantity * h.buyPrice))
    .reduce((sum, h) => sum + ((h.quantity * h.currentPrice) - (h.quantity * h.buyPrice)), 0);
  
  holdings.forEach(holding => {
    const invested = holding.quantity * holding.buyPrice;
    const current = holding.quantity * holding.currentPrice;
    const gain = current - invested;
    
    if (gain < 0) {
      // Loss position
      const loss = Math.abs(gain);
      const isSTCG = !isLTCG(holding.type, holding.buyDate);
      const taxRate = getTaxRate(holding.type, !isSTCG);
      
      // Can offset STCG loss against STCG gains, LTCG loss against LTCG gains
      const potentialSavings = Math.min(loss, totalGains) * taxRate;
      
      if (potentialSavings > 0) {
        suggestions.push({
          holding,
          action: 'sell',
          reason: isSTCG 
            ? `Book STCG loss to offset gains. Can save up to \u20B9${Math.round(potentialSavings).toLocaleString()} in taxes.`
            : `Book LTCG loss to offset LTCG gains.`,
          potentialSavings: Math.round(potentialSavings),
          loss,
        });
      }
    }
  });
  
  // Sort by potential savings
  return suggestions.sort((a, b) => b.potentialSavings - a.potentialSavings);
}

// Asset type display names
export const ASSET_TYPE_NAMES: Record<AssetType, string> = {
  equity: 'Direct Equity',
  equity_mf: 'Equity Mutual Funds',
  debt_mf: 'Debt Mutual Funds',
  gold: 'Gold / Gold ETF',
  property: 'Real Estate',
  fd: 'Fixed Deposits',
  bonds: 'Bonds & Debentures',
};

// Sample portfolio for demo
export const SAMPLE_HOLDINGS: Holding[] = [
  {
    id: '1',
    name: 'Reliance Industries',
    type: 'equity',
    quantity: 50,
    buyPrice: 2200,
    currentPrice: 2850,
    buyDate: new Date('2023-06-15'),
    dividendYield: 0.3,
  },
  {
    id: '2',
    name: 'HDFC Bank',
    type: 'equity',
    quantity: 100,
    buyPrice: 1600,
    currentPrice: 1720,
    buyDate: new Date('2024-03-10'),
  },
  {
    id: '3',
    name: 'Infosys',
    type: 'equity',
    quantity: 75,
    buyPrice: 1450,
    currentPrice: 1380,
    buyDate: new Date('2024-08-20'),
  },
  {
    id: '4',
    name: 'Mirae Asset Large Cap',
    type: 'equity_mf',
    quantity: 500,
    buyPrice: 85,
    currentPrice: 98,
    buyDate: new Date('2023-01-05'),
    dividendYield: 1.2,
  },
  {
    id: '5',
    name: 'HDFC Corporate Bond Fund',
    type: 'debt_mf',
    quantity: 200,
    buyPrice: 28,
    currentPrice: 30.5,
    buyDate: new Date('2024-01-15'),
  },
  {
    id: '6',
    name: 'Sovereign Gold Bond 2028',
    type: 'gold',
    quantity: 10,
    buyPrice: 5800,
    currentPrice: 7200,
    buyDate: new Date('2023-11-01'),
    dividendYield: 2.5,
  },
];

