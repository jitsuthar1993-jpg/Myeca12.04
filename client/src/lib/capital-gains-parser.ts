// Capital Gains Statement Parser
// Supports Zerodha, Groww, and generic broker formats

export interface CapitalGainTransaction {
  id: string;
  symbol: string;
  securityName: string;
  isin?: string;
  buyDate: Date;
  sellDate: Date;
  buyQuantity: number;
  sellQuantity: number;
  buyPrice: number;
  sellPrice: number;
  buyValue: number;
  sellValue: number;
  gain: number;
  gainType: 'STCG' | 'LTCG';
  assetType: 'equity' | 'debt' | 'f&o' | 'intraday';
  holdingPeriod: number; // in days
  grandFathered?: boolean;
  grandFatheredValue?: number;
  brokerage?: number;
  stt?: number;
  otherCharges?: number;
  netGain: number;
}

export interface ParsedCapitalGains {
  transactions: CapitalGainTransaction[];
  summary: {
    totalSTCG: number;
    totalLTCG: number;
    totalLTCGAboveExemption: number;
    totalGains: number;
    totalLosses: number;
    netGain: number;
    stcgTax: number;
    ltcgTax: number;
    totalTax: number;
    ltcgExemption: number;
    carryForwardLoss: number;
  };
  byAssetType: {
    equity: { stcg: number; ltcg: number; count: number };
    debt: { stcg: number; ltcg: number; count: number };
    fno: { stcg: number; ltcg: number; count: number };
    intraday: { gain: number; count: number };
  };
  brokerInfo?: {
    name: string;
    clientId?: string;
    statementPeriod?: { start: Date; end: Date };
  };
}

// Tax rates (FY 2024-25)
const TAX_RATES = {
  equitySTCG: 0.20, // 20% from Budget 2024
  equityLTCG: 0.125, // 12.5% from Budget 2024
  debtSTCG: 0.30, // As per slab (using highest)
  debtLTCG: 0.125, // 12.5% without indexation
  fnoSTCG: 0.30, // As per slab
  intradaySTCG: 0.30, // Speculative income
};

const LTCG_EXEMPTION = 125000; // \u20B91.25 lakh for equity

// Grandfathering date for equity LTCG
const GRANDFATHERING_DATE = new Date('2018-01-31');

// Detect broker from file content
export function detectBroker(content: string): 'zerodha' | 'groww' | 'icici' | 'hdfc' | 'generic' {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('zerodha') || lowerContent.includes('kite')) {
    return 'zerodha';
  }
  if (lowerContent.includes('groww')) {
    return 'groww';
  }
  if (lowerContent.includes('icici direct') || lowerContent.includes('icici securities')) {
    return 'icici';
  }
  if (lowerContent.includes('hdfc securities')) {
    return 'hdfc';
  }
  
  return 'generic';
}

// Parse date from various formats
function parseDate(dateStr: string): Date {
  if (!dateStr || dateStr.trim() === '') return new Date();
  
  // Try various formats
  const formats = [
    /(\d{2})[-\/](\d{2})[-\/](\d{4})/, // DD-MM-YYYY
    /(\d{4})[-\/](\d{2})[-\/](\d{2})/, // YYYY-MM-DD
    /(\d{2})[-\/](\w{3})[-\/](\d{4})/, // DD-MMM-YYYY
  ];
  
  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      } else if (format === formats[1]) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      } else if (format === formats[2]) {
        const month = monthMap[match[2].toLowerCase()];
        if (month !== undefined) {
          return new Date(parseInt(match[3]), month, parseInt(match[1]));
        }
      }
    }
  }
  
  return new Date(dateStr);
}

// Parse amount
function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === '' || amountStr === '-') return 0;
  const cleaned = amountStr.replace(/[\u20B9$,\s()]/g, '').trim();
  // Handle negative values in parentheses
  const isNegative = amountStr.includes('(') || cleaned.startsWith('-');
  const amount = parseFloat(cleaned.replace('-', ''));
  return isNaN(amount) ? 0 : (isNegative ? -amount : amount);
}

// Calculate holding period in days
function calculateHoldingPeriod(buyDate: Date, sellDate: Date): number {
  const diffTime = sellDate.getTime() - buyDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Determine gain type based on holding period and asset type
function determineGainType(holdingPeriod: number, assetType: CapitalGainTransaction['assetType']): 'STCG' | 'LTCG' {
  if (assetType === 'equity') {
    return holdingPeriod >= 365 ? 'LTCG' : 'STCG';
  } else if (assetType === 'debt') {
    return holdingPeriod >= 365 ? 'LTCG' : 'STCG'; // Changed from 3 years as per new rules
  } else {
    return 'STCG'; // F&O and intraday are always STCG
  }
}

// Detect asset type from symbol/name
function detectAssetType(symbol: string, description: string): CapitalGainTransaction['assetType'] {
  const combined = `${symbol} ${description}`.toLowerCase();
  
  if (combined.includes('fut') || combined.includes('opt') || combined.includes('ce') || combined.includes('pe')) {
    return 'f&o';
  }
  if (combined.includes('intraday')) {
    return 'intraday';
  }
  if (combined.includes('debt') || combined.includes('bond') || combined.includes('gsec') || combined.includes('liquid')) {
    return 'debt';
  }
  
  return 'equity';
}

// Parse CSV line handling quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Main parser for Zerodha format
function parseZerodha(content: string): CapitalGainTransaction[] {
  const lines = content.split('\n').filter(line => line.trim());
  const transactions: CapitalGainTransaction[] = [];
  
  // Find header row
  let headerIndex = -1;
  let headers: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('symbol') && (line.includes('buy') || line.includes('sell'))) {
      headerIndex = i;
      headers = parseCSVLine(lines[i]).map(h => h.toLowerCase());
      break;
    }
  }
  
  if (headerIndex === -1) return [];
  
  // Find column indices
  const symbolCol = headers.findIndex(h => h.includes('symbol') || h.includes('scrip'));
  const buyDateCol = headers.findIndex(h => h.includes('buy') && h.includes('date'));
  const sellDateCol = headers.findIndex(h => h.includes('sell') && h.includes('date'));
  const buyQtyCol = headers.findIndex(h => h.includes('buy') && h.includes('qty'));
  const sellQtyCol = headers.findIndex(h => h.includes('sell') && h.includes('qty'));
  const buyPriceCol = headers.findIndex(h => h.includes('buy') && (h.includes('price') || h.includes('rate')));
  const sellPriceCol = headers.findIndex(h => h.includes('sell') && (h.includes('price') || h.includes('rate')));
  const buyValueCol = headers.findIndex(h => h.includes('buy') && h.includes('value'));
  const sellValueCol = headers.findIndex(h => h.includes('sell') && h.includes('value'));
  const gainCol = headers.findIndex(h => h.includes('gain') || h.includes('p&l') || h.includes('profit'));
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 5) continue;
    
    const symbol = symbolCol >= 0 ? values[symbolCol] : '';
    if (!symbol) continue;
    
    const buyDate = buyDateCol >= 0 ? parseDate(values[buyDateCol]) : new Date();
    const sellDate = sellDateCol >= 0 ? parseDate(values[sellDateCol]) : new Date();
    const buyQty = buyQtyCol >= 0 ? parseInt(values[buyQtyCol]) || 0 : 0;
    const sellQty = sellQtyCol >= 0 ? parseInt(values[sellQtyCol]) || buyQty : buyQty;
    const buyPrice = buyPriceCol >= 0 ? parseAmount(values[buyPriceCol]) : 0;
    const sellPrice = sellPriceCol >= 0 ? parseAmount(values[sellPriceCol]) : 0;
    const buyValue = buyValueCol >= 0 ? parseAmount(values[buyValueCol]) : buyQty * buyPrice;
    const sellValue = sellValueCol >= 0 ? parseAmount(values[sellValueCol]) : sellQty * sellPrice;
    const gain = gainCol >= 0 ? parseAmount(values[gainCol]) : sellValue - buyValue;
    
    const holdingPeriod = calculateHoldingPeriod(buyDate, sellDate);
    const assetType = detectAssetType(symbol, '');
    const gainType = determineGainType(holdingPeriod, assetType);
    
    // Check for grandfathering
    const isGrandFathered = assetType === 'equity' && buyDate < GRANDFATHERING_DATE && gainType === 'LTCG';
    
    transactions.push({
      id: `txn-${i}`,
      symbol,
      securityName: symbol,
      buyDate,
      sellDate,
      buyQuantity: buyQty,
      sellQuantity: sellQty,
      buyPrice,
      sellPrice,
      buyValue,
      sellValue,
      gain,
      gainType,
      assetType,
      holdingPeriod,
      grandFathered: isGrandFathered,
      netGain: gain,
    });
  }
  
  return transactions;
}

// Generic parser (works for most formats)
function parseGeneric(content: string): CapitalGainTransaction[] {
  const lines = content.split('\n').filter(line => line.trim());
  const transactions: CapitalGainTransaction[] = [];
  
  // Try to find header
  let headerIndex = -1;
  let headers: string[] = [];
  
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (
      (line.includes('symbol') || line.includes('scrip') || line.includes('security')) &&
      (line.includes('date') || line.includes('buy') || line.includes('sell'))
    ) {
      headerIndex = i;
      headers = parseCSVLine(lines[i]).map(h => h.toLowerCase());
      break;
    }
  }
  
  if (headerIndex === -1) {
    // Try first row as header
    headerIndex = 0;
    headers = parseCSVLine(lines[0]).map(h => h.toLowerCase());
  }
  
  // Map columns flexibly
  const findCol = (keywords: string[]) => {
    return headers.findIndex(h => keywords.some(k => h.includes(k)));
  };
  
  const symbolCol = findCol(['symbol', 'scrip', 'security', 'stock']);
  const dateCol = findCol(['date', 'trade']);
  const typeCol = findCol(['type', 'buy/sell', 'transaction']);
  const qtyCol = findCol(['qty', 'quantity', 'units']);
  const priceCol = findCol(['price', 'rate', 'nav']);
  const valueCol = findCol(['value', 'amount', 'total']);
  
  // Simple parsing for buy/sell pairs
  const holdings: Map<string, any[]> = new Map();
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3) continue;
    
    const symbol = symbolCol >= 0 ? values[symbolCol] : values[0];
    if (!symbol || symbol.toLowerCase().includes('total')) continue;
    
    const date = dateCol >= 0 ? parseDate(values[dateCol]) : new Date();
    const type = typeCol >= 0 ? values[typeCol].toLowerCase() : '';
    const qty = qtyCol >= 0 ? parseInt(values[qtyCol]) || 0 : 1;
    const price = priceCol >= 0 ? parseAmount(values[priceCol]) : 0;
    const value = valueCol >= 0 ? parseAmount(values[valueCol]) : qty * price;
    
    const isBuy = type.includes('buy') || type.includes('b') || type === '';
    
    if (!holdings.has(symbol)) {
      holdings.set(symbol, []);
    }
    
    holdings.get(symbol)!.push({
      date,
      isBuy,
      qty,
      price,
      value,
    });
  }
  
  // Match buy/sell for each symbol
  let txnId = 0;
  holdings.forEach((trades, symbol) => {
    const buys = trades.filter(t => t.isBuy);
    const sells = trades.filter(t => !t.isBuy);
    
    sells.forEach(sell => {
      // Find matching buy (FIFO)
      const matchingBuy = buys.find(b => b.qty > 0);
      if (matchingBuy) {
        const matchQty = Math.min(matchingBuy.qty, sell.qty);
        const buyValue = matchingBuy.price * matchQty;
        const sellValue = sell.price * matchQty;
        const gain = sellValue - buyValue;
        
        const holdingPeriod = calculateHoldingPeriod(matchingBuy.date, sell.date);
        const assetType = detectAssetType(symbol, '');
        const gainType = determineGainType(holdingPeriod, assetType);
        
        transactions.push({
          id: `txn-${txnId++}`,
          symbol,
          securityName: symbol,
          buyDate: matchingBuy.date,
          sellDate: sell.date,
          buyQuantity: matchQty,
          sellQuantity: matchQty,
          buyPrice: matchingBuy.price,
          sellPrice: sell.price,
          buyValue,
          sellValue,
          gain,
          gainType,
          assetType,
          holdingPeriod,
          netGain: gain,
        });
        
        matchingBuy.qty -= matchQty;
        sell.qty -= matchQty;
      }
    });
  });
  
  return transactions;
}

// Main parse function
export function parseCapitalGainsStatement(content: string): ParsedCapitalGains {
  const broker = detectBroker(content);
  let transactions: CapitalGainTransaction[];
  
  switch (broker) {
    case 'zerodha':
      transactions = parseZerodha(content);
      break;
    default:
      transactions = parseGeneric(content);
  }
  
  // Calculate summary
  const summary = {
    totalSTCG: 0,
    totalLTCG: 0,
    totalLTCGAboveExemption: 0,
    totalGains: 0,
    totalLosses: 0,
    netGain: 0,
    stcgTax: 0,
    ltcgTax: 0,
    totalTax: 0,
    ltcgExemption: LTCG_EXEMPTION,
    carryForwardLoss: 0,
  };
  
  const byAssetType = {
    equity: { stcg: 0, ltcg: 0, count: 0 },
    debt: { stcg: 0, ltcg: 0, count: 0 },
    fno: { stcg: 0, ltcg: 0, count: 0 },
    intraday: { gain: 0, count: 0 },
  };
  
  // Process transactions
  transactions.forEach(txn => {
    if (txn.gainType === 'STCG') {
      summary.totalSTCG += txn.netGain;
    } else {
      summary.totalLTCG += txn.netGain;
    }
    
    if (txn.netGain >= 0) {
      summary.totalGains += txn.netGain;
    } else {
      summary.totalLosses += Math.abs(txn.netGain);
    }
    
    // By asset type
    if (txn.assetType === 'equity') {
      byAssetType.equity.count++;
      if (txn.gainType === 'STCG') {
        byAssetType.equity.stcg += txn.netGain;
      } else {
        byAssetType.equity.ltcg += txn.netGain;
      }
    } else if (txn.assetType === 'debt') {
      byAssetType.debt.count++;
      if (txn.gainType === 'STCG') {
        byAssetType.debt.stcg += txn.netGain;
      } else {
        byAssetType.debt.ltcg += txn.netGain;
      }
    } else if (txn.assetType === 'f&o') {
      byAssetType.fno.count++;
      byAssetType.fno.stcg += txn.netGain;
    } else {
      byAssetType.intraday.count++;
      byAssetType.intraday.gain += txn.netGain;
    }
  });
  
  summary.netGain = summary.totalGains - summary.totalLosses;
  
  // Calculate LTCG above exemption (for equity only)
  const equityLTCG = byAssetType.equity.ltcg;
  summary.totalLTCGAboveExemption = Math.max(0, equityLTCG - LTCG_EXEMPTION);
  
  // Calculate taxes
  // STCG
  const equitySTCGTax = Math.max(0, byAssetType.equity.stcg) * TAX_RATES.equitySTCG;
  const debtSTCGTax = Math.max(0, byAssetType.debt.stcg) * TAX_RATES.debtSTCG;
  const fnoSTCGTax = Math.max(0, byAssetType.fno.stcg) * TAX_RATES.fnoSTCG;
  const intradayTax = Math.max(0, byAssetType.intraday.gain) * TAX_RATES.intradaySTCG;
  
  summary.stcgTax = equitySTCGTax + debtSTCGTax + fnoSTCGTax + intradayTax;
  
  // LTCG
  const equityLTCGTax = summary.totalLTCGAboveExemption * TAX_RATES.equityLTCG;
  const debtLTCGTax = Math.max(0, byAssetType.debt.ltcg) * TAX_RATES.debtLTCG;
  
  summary.ltcgTax = equityLTCGTax + debtLTCGTax;
  summary.totalTax = summary.stcgTax + summary.ltcgTax;
  
  // Carry forward loss
  if (summary.netGain < 0) {
    summary.carryForwardLoss = Math.abs(summary.netGain);
  }
  
  return {
    transactions,
    summary,
    byAssetType,
    brokerInfo: {
      name: broker.charAt(0).toUpperCase() + broker.slice(1),
    },
  };
}

// Export function for ITR
export function exportForITR(data: ParsedCapitalGains): string {
  let output = `# Capital Gains Statement for ITR Filing\n`;
  output += `# Broker: ${data.brokerInfo?.name || 'Unknown'}\n`;
  output += `# Generated on: ${new Date().toLocaleDateString()}\n\n`;
  
  output += `## Summary\n`;
  output += `- Total STCG: \u20B9${data.summary.totalSTCG.toLocaleString('en-IN')}\n`;
  output += `- Total LTCG: \u20B9${data.summary.totalLTCG.toLocaleString('en-IN')}\n`;
  output += `- LTCG Exemption (Equity): \u20B9${data.summary.ltcgExemption.toLocaleString('en-IN')}\n`;
  output += `- LTCG Above Exemption: \u20B9${data.summary.totalLTCGAboveExemption.toLocaleString('en-IN')}\n`;
  output += `- Net Gain/Loss: \u20B9${data.summary.netGain.toLocaleString('en-IN')}\n\n`;
  
  output += `## Tax Liability\n`;
  output += `- STCG Tax (20%): \u20B9${data.summary.stcgTax.toLocaleString('en-IN')}\n`;
  output += `- LTCG Tax (12.5%): \u20B9${data.summary.ltcgTax.toLocaleString('en-IN')}\n`;
  output += `- Total Tax: \u20B9${data.summary.totalTax.toLocaleString('en-IN')}\n\n`;
  
  if (data.summary.carryForwardLoss > 0) {
    output += `## Carry Forward Loss\n`;
    output += `- Amount: \u20B9${data.summary.carryForwardLoss.toLocaleString('en-IN')}\n`;
    output += `- Can be set off against future capital gains for up to 8 years\n\n`;
  }
  
  output += `## Transaction Details\n\n`;
  
  data.transactions.forEach((t, i) => {
    output += `${i + 1}. ${t.symbol}\n`;
    output += `   Buy: ${t.buyDate.toLocaleDateString()} | Sell: ${t.sellDate.toLocaleDateString()}\n`;
    output += `   Qty: ${t.sellQuantity} | Gain: \u20B9${t.netGain.toLocaleString('en-IN')} (${t.gainType})\n\n`;
  });
  
  return output;
}

