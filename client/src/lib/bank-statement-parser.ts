// Bank Statement Parser Library
// Parses CSV/Excel bank statements and categorizes transactions

export interface Transaction {
  id: string;
  date: Date;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  category: TransactionCategory;
  taxRelevance: 'income' | 'deduction' | 'investment' | 'none';
  confidence: number; // 0-1 confidence score
}

export type TransactionCategory = 
  | 'salary'
  | 'interest'
  | 'rent_received'
  | 'rent_paid'
  | 'insurance'
  | 'investment'
  | 'loan_emi'
  | 'utility'
  | 'food'
  | 'shopping'
  | 'transfer'
  | 'donation'
  | 'medical'
  | 'education'
  | 'professional_fees'
  | 'dividend'
  | 'refund'
  | 'other';

export interface CategorySummary {
  category: TransactionCategory;
  label: string;
  totalDebit: number;
  totalCredit: number;
  count: number;
  taxRelevance: Transaction['taxRelevance'];
  icon: string;
  color: string;
}

export interface ParsedStatement {
  transactions: Transaction[];
  summary: {
    totalCredits: number;
    totalDebits: number;
    openingBalance: number;
    closingBalance: number;
    dateRange: { start: Date; end: Date };
    accountNumber?: string;
    bankName?: string;
  };
  categorySummary: CategorySummary[];
  taxRelevantSummary: {
    totalIncome: number;
    totalDeductions: number;
    investmentAmount: number;
    interestIncome: number;
    salaryIncome: number;
    rentReceived: number;
    rentPaid: number;
    insurancePremiums: number;
    medicalExpenses: number;
    donations: number;
  };
}

// Category patterns for auto-detection
const CATEGORY_PATTERNS: Record<TransactionCategory, { patterns: RegExp[]; taxRelevance: Transaction['taxRelevance'] }> = {
  salary: {
    patterns: [
      /salary/i, /sal\s/i, /payroll/i, /wages/i, /stipend/i,
      /neft.*salary/i, /rtgs.*salary/i, /imps.*salary/i
    ],
    taxRelevance: 'income',
  },
  interest: {
    patterns: [
      /interest\s*(credit|paid|earned)/i, /int\.\s*cr/i, /sb\s*int/i,
      /fd\s*int/i, /rd\s*int/i, /int\s*on\s*dep/i
    ],
    taxRelevance: 'income',
  },
  rent_received: {
    patterns: [
      /rent\s*(received|credit)/i, /rental\s*income/i, /tenant/i
    ],
    taxRelevance: 'income',
  },
  rent_paid: {
    patterns: [
      /rent\s*(paid|payment)/i, /house\s*rent/i, /landlord/i,
      /rent.*neft/i, /rent.*imps/i
    ],
    taxRelevance: 'deduction',
  },
  insurance: {
    patterns: [
      /insurance/i, /lic\s/i, /life\s*ins/i, /health\s*ins/i,
      /icici\s*pru/i, /hdfc\s*life/i, /sbi\s*life/i, /max\s*life/i,
      /bajaj\s*allianz/i, /star\s*health/i, /premium/i
    ],
    taxRelevance: 'deduction',
  },
  investment: {
    patterns: [
      /mutual\s*fund/i, /mf\s*sip/i, /sip\s/i, /elss/i, /ppf/i,
      /nps/i, /equity/i, /stock/i, /zerodha/i, /groww/i, /upstox/i,
      /angel\s*one/i, /icici\s*direct/i, /hdfc\s*sec/i, /kotak\s*sec/i,
      /demat/i, /nsdl/i, /cdsl/i, /kfintech/i, /cams/i
    ],
    taxRelevance: 'investment',
  },
  loan_emi: {
    patterns: [
      /emi/i, /loan\s*(emi|repay)/i, /home\s*loan/i, /car\s*loan/i,
      /personal\s*loan/i, /education\s*loan/i, /auto\s*debit.*loan/i
    ],
    taxRelevance: 'deduction', // Home loan principal is 80C
  },
  utility: {
    patterns: [
      /electricity/i, /electric\s*bill/i, /power\s*bill/i,
      /water\s*bill/i, /gas\s*bill/i, /broadband/i, /internet/i,
      /mobile\s*bill/i, /phone\s*bill/i, /jio/i, /airtel/i, /vi\s/i,
      /bsnl/i, /tata\s*sky/i, /dish\s*tv/i
    ],
    taxRelevance: 'none',
  },
  food: {
    patterns: [
      /swiggy/i, /zomato/i, /food/i, /restaurant/i, /cafe/i,
      /dominos/i, /pizza/i, /mcdonald/i, /kfc/i, /subway/i
    ],
    taxRelevance: 'none',
  },
  shopping: {
    patterns: [
      /amazon/i, /flipkart/i, /myntra/i, /ajio/i, /nykaa/i,
      /meesho/i, /snapdeal/i, /shopping/i, /retail/i, /mall/i,
      /reliance\s*(retail|digital|fresh)/i, /dmart/i, /bigbasket/i
    ],
    taxRelevance: 'none',
  },
  transfer: {
    patterns: [
      /upi/i, /neft/i, /rtgs/i, /imps/i, /transfer/i,
      /self\s*transfer/i, /fund\s*transfer/i, /a\/c\s*transfer/i
    ],
    taxRelevance: 'none',
  },
  donation: {
    patterns: [
      /donation/i, /charity/i, /ngo/i, /trust/i, /foundation/i,
      /pm\s*cares/i, /relief\s*fund/i
    ],
    taxRelevance: 'deduction', // 80G
  },
  medical: {
    patterns: [
      /hospital/i, /clinic/i, /medical/i, /pharmacy/i, /medicine/i,
      /apollo/i, /fortis/i, /max\s*hospital/i, /medplus/i, /netmeds/i,
      /pharmeasy/i, /1mg/i, /doctor/i, /diagnostic/i
    ],
    taxRelevance: 'deduction', // 80D preventive health
  },
  education: {
    patterns: [
      /school\s*fee/i, /college\s*fee/i, /tuition/i, /education/i,
      /university/i, /course\s*fee/i, /coaching/i, /byju/i, /unacademy/i
    ],
    taxRelevance: 'deduction', // 80C tuition fees
  },
  professional_fees: {
    patterns: [
      /professional\s*fee/i, /consultancy/i, /legal\s*fee/i,
      /ca\s*fee/i, /audit\s*fee/i, /service\s*fee/i
    ],
    taxRelevance: 'none',
  },
  dividend: {
    patterns: [
      /dividend/i, /div\s*cr/i, /interim\s*div/i, /final\s*div/i
    ],
    taxRelevance: 'income',
  },
  refund: {
    patterns: [
      /refund/i, /cashback/i, /reversal/i, /credit\s*back/i,
      /income\s*tax\s*refund/i, /itr\s*refund/i, /cit\s*refund/i
    ],
    taxRelevance: 'none',
  },
  other: {
    patterns: [],
    taxRelevance: 'none',
  },
};

// Category display info
const CATEGORY_INFO: Record<TransactionCategory, { label: string; icon: string; color: string }> = {
  salary: { label: 'Salary', icon: '💼', color: 'bg-green-500' },
  interest: { label: 'Interest', icon: '🏦', color: 'bg-blue-500' },
  rent_received: { label: 'Rent Received', icon: '🏠', color: 'bg-emerald-500' },
  rent_paid: { label: 'Rent Paid', icon: '🏘️', color: 'bg-orange-500' },
  insurance: { label: 'Insurance', icon: '🛡️', color: 'bg-purple-500' },
  investment: { label: 'Investment', icon: '📈', color: 'bg-indigo-500' },
  loan_emi: { label: 'Loan/EMI', icon: '🏦', color: 'bg-red-500' },
  utility: { label: 'Utilities', icon: '💡', color: 'bg-yellow-500' },
  food: { label: 'Food & Dining', icon: '🍔', color: 'bg-amber-500' },
  shopping: { label: 'Shopping', icon: '🛒', color: 'bg-pink-500' },
  transfer: { label: 'Transfers', icon: '↔️', color: 'bg-gray-500' },
  donation: { label: 'Donations', icon: '❤️', color: 'bg-rose-500' },
  medical: { label: 'Medical', icon: '🏥', color: 'bg-teal-500' },
  education: { label: 'Education', icon: '📚', color: 'bg-cyan-500' },
  professional_fees: { label: 'Professional Fees', icon: '💼', color: 'bg-slate-500' },
  dividend: { label: 'Dividend', icon: '💰', color: 'bg-lime-500' },
  refund: { label: 'Refunds', icon: '↩️', color: 'bg-sky-500' },
  other: { label: 'Other', icon: '📌', color: 'bg-gray-400' },
};

// Categorize a single transaction
function categorizeTransaction(description: string): { category: TransactionCategory; taxRelevance: Transaction['taxRelevance']; confidence: number } {
  const normalizedDesc = description.toLowerCase().trim();
  
  for (const [category, { patterns, taxRelevance }] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(normalizedDesc)) {
        return {
          category: category as TransactionCategory,
          taxRelevance,
          confidence: 0.85, // High confidence for pattern match
        };
      }
    }
  }
  
  return {
    category: 'other',
    taxRelevance: 'none',
    confidence: 0.3, // Low confidence for unmatched
  };
}

// Parse date from various formats
function parseDate(dateStr: string): Date {
  // Common Indian date formats
  const formats = [
    /(\d{2})[-\/](\d{2})[-\/](\d{4})/, // DD-MM-YYYY or DD/MM/YYYY
    /(\d{4})[-\/](\d{2})[-\/](\d{2})/, // YYYY-MM-DD
    /(\d{2})[-\/](\w{3})[-\/](\d{4})/, // DD-MMM-YYYY
  ];
  
  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (format === formats[0]) {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      } else if (format === formats[1]) {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      }
    }
  }
  
  // Fallback to native parsing
  return new Date(dateStr);
}

// Parse amount string to number
function parseAmount(amountStr: string): number {
  if (!amountStr || amountStr.trim() === '' || amountStr === '-') return 0;
  // Remove currency symbols, commas, and whitespace
  const cleaned = amountStr.replace(/[\u20B9$,\s]/g, '').trim();
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.abs(amount);
}

// Main CSV parser
export function parseCSV(csvContent: string): Transaction[] {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  // Detect header row (usually first row)
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Find column indices
  const dateCol = headers.findIndex(h => /date|txn\s*date|transaction\s*date|value\s*date/i.test(h));
  const descCol = headers.findIndex(h => /description|narration|particulars|remarks|details/i.test(h));
  const debitCol = headers.findIndex(h => /debit|withdrawal|dr|debit\s*amount/i.test(h));
  const creditCol = headers.findIndex(h => /credit|deposit|cr|credit\s*amount/i.test(h));
  const balanceCol = headers.findIndex(h => /balance|closing\s*balance|available\s*balance/i.test(h));
  const amountCol = headers.findIndex(h => /^amount$/i.test(h));
  
  const transactions: Transaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length < 3) continue;
    
    const date = dateCol >= 0 ? parseDate(values[dateCol]) : new Date();
    const description = descCol >= 0 ? values[descCol] : '';
    
    let debit = 0;
    let credit = 0;
    
    if (debitCol >= 0 && creditCol >= 0) {
      debit = parseAmount(values[debitCol]);
      credit = parseAmount(values[creditCol]);
    } else if (amountCol >= 0) {
      const amount = parseAmount(values[amountCol]);
      // Negative = debit, positive = credit
      if (amount < 0) {
        debit = Math.abs(amount);
      } else {
        credit = amount;
      }
    }
    
    const balance = balanceCol >= 0 ? parseAmount(values[balanceCol]) : 0;
    
    const { category, taxRelevance, confidence } = categorizeTransaction(description);
    
    transactions.push({
      id: `txn-${i}`,
      date,
      description,
      debit,
      credit,
      balance,
      category,
      taxRelevance,
      confidence,
    });
  }
  
  return transactions;
}

// Handle quoted CSV values
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

// Generate summary from transactions
export function generateSummary(transactions: Transaction[]): ParsedStatement {
  const summary = {
    totalCredits: 0,
    totalDebits: 0,
    openingBalance: transactions.length > 0 ? transactions[0].balance : 0,
    closingBalance: transactions.length > 0 ? transactions[transactions.length - 1].balance : 0,
    dateRange: {
      start: transactions.length > 0 ? transactions[0].date : new Date(),
      end: transactions.length > 0 ? transactions[transactions.length - 1].date : new Date(),
    },
  };
  
  const categoryTotals: Record<TransactionCategory, { debit: number; credit: number; count: number }> = {} as any;
  
  // Initialize category totals
  Object.keys(CATEGORY_PATTERNS).forEach(cat => {
    categoryTotals[cat as TransactionCategory] = { debit: 0, credit: 0, count: 0 };
  });
  
  // Calculate totals
  transactions.forEach(txn => {
    summary.totalCredits += txn.credit;
    summary.totalDebits += txn.debit;
    
    categoryTotals[txn.category].debit += txn.debit;
    categoryTotals[txn.category].credit += txn.credit;
    categoryTotals[txn.category].count++;
  });
  
  // Build category summary
  const categorySummary: CategorySummary[] = Object.entries(categoryTotals)
    .filter(([_, totals]) => totals.count > 0)
    .map(([category, totals]) => ({
      category: category as TransactionCategory,
      label: CATEGORY_INFO[category as TransactionCategory].label,
      totalDebit: totals.debit,
      totalCredit: totals.credit,
      count: totals.count,
      taxRelevance: CATEGORY_PATTERNS[category as TransactionCategory].taxRelevance,
      icon: CATEGORY_INFO[category as TransactionCategory].icon,
      color: CATEGORY_INFO[category as TransactionCategory].color,
    }))
    .sort((a, b) => (b.totalCredit + b.totalDebit) - (a.totalCredit + a.totalDebit));
  
  // Tax-relevant summary
  const taxRelevantSummary = {
    totalIncome: 0,
    totalDeductions: 0,
    investmentAmount: 0,
    interestIncome: categoryTotals.interest?.credit || 0,
    salaryIncome: categoryTotals.salary?.credit || 0,
    rentReceived: categoryTotals.rent_received?.credit || 0,
    rentPaid: categoryTotals.rent_paid?.debit || 0,
    insurancePremiums: categoryTotals.insurance?.debit || 0,
    medicalExpenses: categoryTotals.medical?.debit || 0,
    donations: categoryTotals.donation?.debit || 0,
  };
  
  taxRelevantSummary.totalIncome = taxRelevantSummary.salaryIncome + 
    taxRelevantSummary.interestIncome + 
    taxRelevantSummary.rentReceived + 
    (categoryTotals.dividend?.credit || 0);
  
  taxRelevantSummary.totalDeductions = taxRelevantSummary.rentPaid + 
    taxRelevantSummary.insurancePremiums + 
    taxRelevantSummary.donations;
  
  taxRelevantSummary.investmentAmount = categoryTotals.investment?.debit || 0;
  
  return {
    transactions,
    summary,
    categorySummary,
    taxRelevantSummary,
  };
}

// Export categorized data for ITR filing
export function exportForITR(parsedData: ParsedStatement): string {
  const { taxRelevantSummary, transactions } = parsedData;
  
  let output = `# Bank Statement Analysis for ITR Filing\n`;
  output += `# Generated on ${new Date().toLocaleDateString()}\n\n`;
  
  output += `## Income Summary\n`;
  output += `- Salary Income: \u20B9${taxRelevantSummary.salaryIncome.toLocaleString('en-IN')}\n`;
  output += `- Interest Income: \u20B9${taxRelevantSummary.interestIncome.toLocaleString('en-IN')}\n`;
  output += `- Rental Income: \u20B9${taxRelevantSummary.rentReceived.toLocaleString('en-IN')}\n`;
  output += `- Total Income: \u20B9${taxRelevantSummary.totalIncome.toLocaleString('en-IN')}\n\n`;
  
  output += `## Deduction-Eligible Expenses\n`;
  output += `- Rent Paid: \u20B9${taxRelevantSummary.rentPaid.toLocaleString('en-IN')} (for HRA calculation)\n`;
  output += `- Insurance Premiums: \u20B9${taxRelevantSummary.insurancePremiums.toLocaleString('en-IN')} (80C/80D)\n`;
  output += `- Medical Expenses: \u20B9${taxRelevantSummary.medicalExpenses.toLocaleString('en-IN')} (80D)\n`;
  output += `- Donations: \u20B9${taxRelevantSummary.donations.toLocaleString('en-IN')} (80G)\n`;
  output += `- Investments: \u20B9${taxRelevantSummary.investmentAmount.toLocaleString('en-IN')} (80C/80CCD)\n\n`;
  
  output += `## Detailed Tax-Relevant Transactions\n\n`;
  
  const taxTransactions = transactions.filter(t => t.taxRelevance !== 'none');
  taxTransactions.forEach(t => {
    output += `- ${t.date.toLocaleDateString()}: ${t.description.substring(0, 50)}\n`;
    output += `  ${t.credit > 0 ? `Credit: \u20B9${t.credit.toLocaleString('en-IN')}` : `Debit: \u20B9${t.debit.toLocaleString('en-IN')}`}\n`;
    output += `  Category: ${CATEGORY_INFO[t.category].label} | Tax Relevance: ${t.taxRelevance}\n\n`;
  });
  
  return output;
}

