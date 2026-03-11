// AIS (Annual Information Statement) and Form 26AS Parser
// Parses CSV/JSON data from IT portal downloads

export type IncomeSourceType = 
  | 'salary'
  | 'interest'
  | 'dividend'
  | 'sale_of_securities'
  | 'rent'
  | 'professional_receipts'
  | 'other_receipts'
  | 'tds_salary'
  | 'tds_other'
  | 'tcs'
  | 'specified_transactions'
  | 'foreign_remittance';

export interface AISEntry {
  id: string;
  category: IncomeSourceType;
  informationCode: string;
  informationDescription: string;
  reportingEntity: string;
  reportingEntityPAN?: string;
  reportedValue: number;
  modifiedValue?: number;
  derivedValue?: number;
  quarter?: string;
  status: 'reported' | 'modified' | 'confirmed' | 'discrepancy';
  feedback?: string;
}

export interface TDSEntry {
  id: string;
  deductorName: string;
  deductorTAN: string;
  section: string;
  transactionDate?: Date;
  amountPaid: number;
  tdsCredited: number;
  quarter: string;
  status: 'matched' | 'claimed' | 'not_claimed';
}

export interface ParsedAIS {
  pan: string;
  financialYear: string;
  assessmentYear: string;
  
  // Income Summary
  incomeSummary: {
    salary: number;
    interestIncome: number;
    dividendIncome: number;
    capitalGains: number;
    rentIncome: number;
    professionalIncome: number;
    otherIncome: number;
    totalReportedIncome: number;
  };
  
  // TDS Summary
  tdsSummary: {
    tdsOnSalary: number;
    tdsOnOtherIncome: number;
    tcsCollected: number;
    totalTDSCredit: number;
  };
  
  // Detailed entries
  aisEntries: AISEntry[];
  tdsEntries: TDSEntry[];
  
  // Discrepancies
  discrepancies: {
    count: number;
    entries: AISEntry[];
    potentialTaxImpact: number;
  };
  
  // Metadata
  downloadDate?: Date;
  lastUpdated?: Date;
}

// Parse amount from string
function parseAmount(value: any): number {
  if (typeof value === 'number') return value;
  if (!value || value === '-' || value === 'NA') return 0;
  const cleaned = String(value).replace(/[\u20B9,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

// Map AIS category codes to types
const CATEGORY_MAP: Record<string, IncomeSourceType> = {
  'SALARY': 'salary',
  'SAL': 'salary',
  'INT': 'interest',
  'INTEREST': 'interest',
  'SAVINGS': 'interest',
  'DIV': 'dividend',
  'DIVIDEND': 'dividend',
  'SFT': 'specified_transactions',
  'SALE': 'sale_of_securities',
  'SECURITIES': 'sale_of_securities',
  'RENT': 'rent',
  'RENTAL': 'rent',
  'PROF': 'professional_receipts',
  'PROFESSIONAL': 'professional_receipts',
  'OTHER': 'other_receipts',
  'TDS_SAL': 'tds_salary',
  'TDS': 'tds_other',
  'TCS': 'tcs',
  'FOREIGN': 'foreign_remittance',
};

// Detect category from description
function detectCategory(code: string, description: string): IncomeSourceType {
  const upperCode = code.toUpperCase();
  const upperDesc = description.toUpperCase();
  
  // Direct match
  if (CATEGORY_MAP[upperCode]) {
    return CATEGORY_MAP[upperCode];
  }
  
  // Pattern matching
  if (upperDesc.includes('SALARY') || upperDesc.includes('FORM 16')) {
    return 'salary';
  }
  if (upperDesc.includes('INTEREST') || upperDesc.includes('SAVINGS') || upperDesc.includes('FD')) {
    return 'interest';
  }
  if (upperDesc.includes('DIVIDEND')) {
    return 'dividend';
  }
  if (upperDesc.includes('SALE') || upperDesc.includes('SECURITIES') || upperDesc.includes('CAPITAL GAIN')) {
    return 'sale_of_securities';
  }
  if (upperDesc.includes('RENT')) {
    return 'rent';
  }
  if (upperDesc.includes('PROFESSIONAL') || upperDesc.includes('194J')) {
    return 'professional_receipts';
  }
  
  return 'other_receipts';
}

// Parse CSV content
function parseCSV(content: string): any[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const records: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;
    
    const record: any = {};
    headers.forEach((header, index) => {
      record[header] = values[index]?.trim().replace(/"/g, '') || '';
    });
    records.push(record);
  }
  
  return records;
}

// Handle quoted CSV
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

// Main parse function for AIS
export function parseAIS(content: string): ParsedAIS {
  let records: any[] = [];
  
  // Try JSON first
  try {
    const jsonData = JSON.parse(content);
    if (Array.isArray(jsonData)) {
      records = jsonData;
    } else if (jsonData.data && Array.isArray(jsonData.data)) {
      records = jsonData.data;
    } else if (jsonData.entries && Array.isArray(jsonData.entries)) {
      records = jsonData.entries;
    }
  } catch {
    // Fall back to CSV
    records = parseCSV(content);
  }
  
  // Initialize result
  const result: ParsedAIS = {
    pan: '',
    financialYear: '',
    assessmentYear: '',
    incomeSummary: {
      salary: 0,
      interestIncome: 0,
      dividendIncome: 0,
      capitalGains: 0,
      rentIncome: 0,
      professionalIncome: 0,
      otherIncome: 0,
      totalReportedIncome: 0,
    },
    tdsSummary: {
      tdsOnSalary: 0,
      tdsOnOtherIncome: 0,
      tcsCollected: 0,
      totalTDSCredit: 0,
    },
    aisEntries: [],
    tdsEntries: [],
    discrepancies: {
      count: 0,
      entries: [],
      potentialTaxImpact: 0,
    },
  };
  
  // Extract PAN and year from first record if available
  if (records.length > 0) {
    const firstRecord = records[0];
    result.pan = firstRecord.pan || firstRecord.PAN || firstRecord.pan_number || '';
    result.financialYear = firstRecord.financial_year || firstRecord.fy || firstRecord.FY || '';
    result.assessmentYear = firstRecord.assessment_year || firstRecord.ay || firstRecord.AY || '';
  }
  
  // Process each record
  let entryId = 0;
  records.forEach((record) => {
    // Try to identify the category
    const code = record.code || record.info_code || record.category || record.type || '';
    const description = record.description || record.info_description || record.particulars || '';
    const category = detectCategory(code, description);
    
    // Get values
    const reportedValue = parseAmount(record.reported_value || record.amount || record.value || record.reported || 0);
    const modifiedValue = parseAmount(record.modified_value || record.modified || 0);
    const derivedValue = parseAmount(record.derived_value || record.derived || 0);
    
    // Check for discrepancy
    const hasDiscrepancy = modifiedValue > 0 && modifiedValue !== reportedValue;
    
    const entry: AISEntry = {
      id: `ais-${entryId++}`,
      category,
      informationCode: code,
      informationDescription: description || 'Not specified',
      reportingEntity: record.reporting_entity || record.entity || record.source || 'Unknown',
      reportingEntityPAN: record.entity_pan || record.source_pan || '',
      reportedValue,
      modifiedValue: modifiedValue || undefined,
      derivedValue: derivedValue || undefined,
      quarter: record.quarter || record.q || '',
      status: hasDiscrepancy ? 'discrepancy' : 'reported',
      feedback: record.feedback || '',
    };
    
    result.aisEntries.push(entry);
    
    // Update summaries
    switch (category) {
      case 'salary':
        result.incomeSummary.salary += reportedValue;
        break;
      case 'interest':
        result.incomeSummary.interestIncome += reportedValue;
        break;
      case 'dividend':
        result.incomeSummary.dividendIncome += reportedValue;
        break;
      case 'sale_of_securities':
        result.incomeSummary.capitalGains += reportedValue;
        break;
      case 'rent':
        result.incomeSummary.rentIncome += reportedValue;
        break;
      case 'professional_receipts':
        result.incomeSummary.professionalIncome += reportedValue;
        break;
      case 'tds_salary':
        result.tdsSummary.tdsOnSalary += reportedValue;
        break;
      case 'tds_other':
        result.tdsSummary.tdsOnOtherIncome += reportedValue;
        break;
      case 'tcs':
        result.tdsSummary.tcsCollected += reportedValue;
        break;
      default:
        result.incomeSummary.otherIncome += reportedValue;
    }
    
    // Track discrepancies
    if (hasDiscrepancy) {
      result.discrepancies.count++;
      result.discrepancies.entries.push(entry);
      result.discrepancies.potentialTaxImpact += Math.abs(reportedValue - (modifiedValue || 0)) * 0.3; // Rough tax impact
    }
  });
  
  // Calculate totals
  result.incomeSummary.totalReportedIncome = 
    result.incomeSummary.salary +
    result.incomeSummary.interestIncome +
    result.incomeSummary.dividendIncome +
    result.incomeSummary.capitalGains +
    result.incomeSummary.rentIncome +
    result.incomeSummary.professionalIncome +
    result.incomeSummary.otherIncome;
  
  result.tdsSummary.totalTDSCredit = 
    result.tdsSummary.tdsOnSalary +
    result.tdsSummary.tdsOnOtherIncome +
    result.tdsSummary.tcsCollected;
  
  return result;
}

// Export for ITR filing
export function exportAISForITR(data: ParsedAIS): string {
  let output = `# AIS/26AS Data for ITR Filing\n`;
  output += `# PAN: ${data.pan}\n`;
  output += `# Financial Year: ${data.financialYear}\n`;
  output += `# Generated on: ${new Date().toLocaleDateString()}\n\n`;
  
  output += `## Income Summary (as per AIS)\n`;
  output += `- Salary Income: \u20B9${data.incomeSummary.salary.toLocaleString('en-IN')}\n`;
  output += `- Interest Income: \u20B9${data.incomeSummary.interestIncome.toLocaleString('en-IN')}\n`;
  output += `- Dividend Income: \u20B9${data.incomeSummary.dividendIncome.toLocaleString('en-IN')}\n`;
  output += `- Capital Gains: \u20B9${data.incomeSummary.capitalGains.toLocaleString('en-IN')}\n`;
  output += `- Rental Income: \u20B9${data.incomeSummary.rentIncome.toLocaleString('en-IN')}\n`;
  output += `- Professional Income: \u20B9${data.incomeSummary.professionalIncome.toLocaleString('en-IN')}\n`;
  output += `- Other Income: \u20B9${data.incomeSummary.otherIncome.toLocaleString('en-IN')}\n`;
  output += `- **Total Reported Income: \u20B9${data.incomeSummary.totalReportedIncome.toLocaleString('en-IN')}**\n\n`;
  
  output += `## TDS/TCS Credits\n`;
  output += `- TDS on Salary: \u20B9${data.tdsSummary.tdsOnSalary.toLocaleString('en-IN')}\n`;
  output += `- TDS on Other Income: \u20B9${data.tdsSummary.tdsOnOtherIncome.toLocaleString('en-IN')}\n`;
  output += `- TCS Collected: \u20B9${data.tdsSummary.tcsCollected.toLocaleString('en-IN')}\n`;
  output += `- **Total TDS Credit: \u20B9${data.tdsSummary.totalTDSCredit.toLocaleString('en-IN')}**\n\n`;
  
  if (data.discrepancies.count > 0) {
    output += `## ⚠️ Discrepancies Found (${data.discrepancies.count})\n`;
    data.discrepancies.entries.forEach((entry, i) => {
      output += `${i + 1}. ${entry.informationDescription}\n`;
      output += `   Reported: \u20B9${entry.reportedValue.toLocaleString('en-IN')} | Modified: \u20B9${(entry.modifiedValue || 0).toLocaleString('en-IN')}\n`;
      output += `   Source: ${entry.reportingEntity}\n\n`;
    });
    output += `Potential Tax Impact: \u20B9${data.discrepancies.potentialTaxImpact.toLocaleString('en-IN')}\n\n`;
  }
  
  output += `## Detailed Entries\n\n`;
  data.aisEntries.forEach((entry, i) => {
    output += `${i + 1}. [${entry.category.toUpperCase()}] ${entry.informationDescription}\n`;
    output += `   Amount: \u20B9${entry.reportedValue.toLocaleString('en-IN')}\n`;
    output += `   Source: ${entry.reportingEntity}\n\n`;
  });
  
  return output;
}

// Category display info
export const CATEGORY_INFO: Record<IncomeSourceType, { label: string; icon: string; color: string }> = {
  salary: { label: 'Salary', icon: '💼', color: 'bg-blue-500' },
  interest: { label: 'Interest', icon: '🏦', color: 'bg-green-500' },
  dividend: { label: 'Dividend', icon: '💰', color: 'bg-purple-500' },
  sale_of_securities: { label: 'Securities Sale', icon: '📈', color: 'bg-indigo-500' },
  rent: { label: 'Rent', icon: '🏠', color: 'bg-orange-500' },
  professional_receipts: { label: 'Professional Income', icon: '💼', color: 'bg-teal-500' },
  other_receipts: { label: 'Other Income', icon: '📋', color: 'bg-gray-500' },
  tds_salary: { label: 'TDS on Salary', icon: '🧾', color: 'bg-blue-600' },
  tds_other: { label: 'TDS on Other', icon: '🧾', color: 'bg-green-600' },
  tcs: { label: 'TCS', icon: '🏪', color: 'bg-amber-500' },
  specified_transactions: { label: 'Specified Transactions', icon: '📊', color: 'bg-pink-500' },
  foreign_remittance: { label: 'Foreign Remittance', icon: '🌐', color: 'bg-cyan-500' },
};

