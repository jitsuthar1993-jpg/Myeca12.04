// Form 16 OCR Parser Library
// Uses pattern matching to extract tax-relevant data from Form 16 text

export interface Form16Data {
  // Employer Details
  employer: {
    name: string;
    tan: string;
    address?: string;
  };
  
  // Employee Details
  employee: {
    name: string;
    pan: string;
    address?: string;
    employeeId?: string;
  };
  
  // Assessment Year
  assessmentYear: string;
  financialYear: string;
  
  // Part A - TDS Details
  partA: {
    quarterlyTDS: {
      q1: number;
      q2: number;
      q3: number;
      q4: number;
    };
    totalTDSDeducted: number;
    totalTDSDeposited: number;
  };
  
  // Part B - Salary Details
  partB: {
    grossSalary: number;
    exemptAllowances: {
      hra: number;
      lta: number;
      others: number;
    };
    netSalary: number;
    standardDeduction: number;
    entertainmentAllowance: number;
    professionalTax: number;
    incomeChargeableSalaries: number;
    
    // Other Income
    incomeFromHouseProperty: number;
    otherIncome: number;
    
    // Gross Total Income
    grossTotalIncome: number;
    
    // Deductions
    deductions: {
      section80C: number;
      section80CCC: number;
      section80CCD1: number;
      section80CCD1B: number;
      section80CCD2: number;
      section80D: number;
      section80E: number;
      section80G: number;
      section80TTA: number;
      section80TTB: number;
      otherDeductions: number;
      totalDeductions: number;
    };
    
    // Taxable Income
    totalTaxableIncome: number;
    
    // Tax Calculation
    taxOnTotalIncome: number;
    rebate87A: number;
    surcharge: number;
    healthEducationCess: number;
    totalTaxPayable: number;
    relief89: number;
    netTaxPayable: number;
  };
  
  // Metadata
  extractionConfidence: number;
  rawText?: string;
  warnings: string[];
}

// Patterns for extracting data
const PATTERNS = {
  // TAN Pattern: 4 letters + 5 digits + 1 letter
  tan: /\b([A-Z]{4}[0-9]{5}[A-Z])\b/i,
  
  // PAN Pattern: 5 letters + 4 digits + 1 letter
  pan: /\b([A-Z]{5}[0-9]{4}[A-Z])\b/i,
  
  // Assessment Year
  assessmentYear: /assessment\s*year[:\s]*(\d{4}[-–]\d{2,4})/i,
  financialYear: /financial\s*year[:\s]*(\d{4}[-–]\d{2,4})/i,
  
  // Amount patterns
  amount: /\u20B9?\s*([0-9,]+(?:\.\d{2})?)/,
  
  // Specific fields
  grossSalary: /gross\s*salary[:\s]*\u20B9?\s*([0-9,]+)/i,
  hra: /house\s*rent\s*allowance|hra[:\s]*\u20B9?\s*([0-9,]+)/i,
  lta: /leave\s*travel\s*(?:allowance|concession)|lta[:\s]*\u20B9?\s*([0-9,]+)/i,
  standardDeduction: /standard\s*deduction[:\s]*\u20B9?\s*([0-9,]+)/i,
  professionalTax: /professional\s*tax[:\s]*\u20B9?\s*([0-9,]+)/i,
  
  // Deductions
  section80C: /80c[:\s]*\u20B9?\s*([0-9,]+)/i,
  section80D: /80d[:\s]*\u20B9?\s*([0-9,]+)/i,
  section80E: /80e[:\s]*\u20B9?\s*([0-9,]+)/i,
  section80G: /80g[:\s]*\u20B9?\s*([0-9,]+)/i,
  section80CCD: /80ccd[:\s]*\u20B9?\s*([0-9,]+)/i,
  
  // Tax fields
  totalIncome: /total\s*(?:taxable\s*)?income[:\s]*\u20B9?\s*([0-9,]+)/i,
  taxPayable: /(?:total\s*)?tax\s*(?:payable|liability)[:\s]*\u20B9?\s*([0-9,]+)/i,
  tdsDeducted: /(?:total\s*)?(?:tds|tax)\s*deducted[:\s]*\u20B9?\s*([0-9,]+)/i,
  rebate87A: /rebate\s*(?:u\/s\s*)?87a[:\s]*\u20B9?\s*([0-9,]+)/i,
  surcharge: /surcharge[:\s]*\u20B9?\s*([0-9,]+)/i,
  cess: /(?:health|education)\s*(?:and\s*education\s*)?cess[:\s]*\u20B9?\s*([0-9,]+)/i,
  
  // Quarterly TDS
  q1TDS: /(?:quarter\s*1|q1|apr.*jun)[:\s]*\u20B9?\s*([0-9,]+)/i,
  q2TDS: /(?:quarter\s*2|q2|jul.*sep)[:\s]*\u20B9?\s*([0-9,]+)/i,
  q3TDS: /(?:quarter\s*3|q3|oct.*dec)[:\s]*\u20B9?\s*([0-9,]+)/i,
  q4TDS: /(?:quarter\s*4|q4|jan.*mar)[:\s]*\u20B9?\s*([0-9,]+)/i,
};

// Parse amount string
function parseAmount(amountStr: string | undefined): number {
  if (!amountStr) return 0;
  const cleaned = amountStr.replace(/[\u20B9,\s]/g, '');
  return parseFloat(cleaned) || 0;
}

// Extract single value using pattern
function extractValue(text: string, pattern: RegExp): string | undefined {
  const match = text.match(pattern);
  return match ? match[1]?.trim() : undefined;
}

// Extract amount using pattern
function extractAmount(text: string, pattern: RegExp): number {
  const match = text.match(pattern);
  return match ? parseAmount(match[1]) : 0;
}

// Find employer name (usually at the top of the document)
function findEmployerName(text: string): string {
  // Look for common patterns
  const patterns = [
    /employer[:\s]*(?:name[:\s]*)?([A-Z][A-Za-z\s&.,]+(?:Ltd|Limited|Private|Pvt|Inc|Corporation|Corp|LLP)?)/i,
    /issued\s*by[:\s]*([A-Z][A-Za-z\s&.,]+)/i,
    /^([A-Z][A-Z\s&.,]+(?:LTD|LIMITED|PRIVATE|PVT|INC)\.?)/mi,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 5) {
      return match[1].trim();
    }
  }
  
  return 'Not Found';
}

// Find employee name
function findEmployeeName(text: string): string {
  const patterns = [
    /employee[:\s]*(?:name[:\s]*)?([A-Z][A-Za-z\s]+)/i,
    /name\s*of\s*employee[:\s]*([A-Z][A-Za-z\s]+)/i,
    /issued\s*to[:\s]*([A-Z][A-Za-z\s]+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      return match[1].trim();
    }
  }
  
  return 'Not Found';
}

// Main parsing function
export function parseForm16Text(text: string): Form16Data {
  const warnings: string[] = [];
  let confidence = 0;
  let matchCount = 0;
  const totalFields = 15; // Key fields to track
  
  // Extract TAN and PAN
  const tan = extractValue(text, PATTERNS.tan) || '';
  const pan = extractValue(text, PATTERNS.pan) || '';
  
  if (tan) matchCount++;
  if (pan) matchCount++;
  
  // Extract years
  const assessmentYear = extractValue(text, PATTERNS.assessmentYear) || '';
  const financialYear = extractValue(text, PATTERNS.financialYear) || '';
  
  if (assessmentYear || financialYear) matchCount++;
  
  // Extract employer and employee names
  const employerName = findEmployerName(text);
  const employeeName = findEmployeeName(text);
  
  if (employerName !== 'Not Found') matchCount++;
  if (employeeName !== 'Not Found') matchCount++;
  
  // Extract salary details
  const grossSalary = extractAmount(text, PATTERNS.grossSalary);
  const hra = extractAmount(text, PATTERNS.hra);
  const lta = extractAmount(text, PATTERNS.lta);
  const standardDeduction = extractAmount(text, PATTERNS.standardDeduction);
  const professionalTax = extractAmount(text, PATTERNS.professionalTax);
  
  if (grossSalary > 0) matchCount++;
  if (standardDeduction > 0) matchCount++;
  
  // Extract deductions
  const section80C = extractAmount(text, PATTERNS.section80C);
  const section80D = extractAmount(text, PATTERNS.section80D);
  const section80E = extractAmount(text, PATTERNS.section80E);
  const section80G = extractAmount(text, PATTERNS.section80G);
  const section80CCD = extractAmount(text, PATTERNS.section80CCD);
  
  if (section80C > 0) matchCount++;
  if (section80D > 0) matchCount++;
  
  // Extract tax details
  const totalIncome = extractAmount(text, PATTERNS.totalIncome);
  const taxPayable = extractAmount(text, PATTERNS.taxPayable);
  const tdsDeducted = extractAmount(text, PATTERNS.tdsDeducted);
  const rebate87A = extractAmount(text, PATTERNS.rebate87A);
  const surcharge = extractAmount(text, PATTERNS.surcharge);
  const cess = extractAmount(text, PATTERNS.cess);
  
  if (totalIncome > 0) matchCount++;
  if (tdsDeducted > 0) matchCount++;
  
  // Extract quarterly TDS
  const q1TDS = extractAmount(text, PATTERNS.q1TDS);
  const q2TDS = extractAmount(text, PATTERNS.q2TDS);
  const q3TDS = extractAmount(text, PATTERNS.q3TDS);
  const q4TDS = extractAmount(text, PATTERNS.q4TDS);
  
  // Calculate confidence
  confidence = (matchCount / totalFields) * 100;
  
  // Add warnings
  if (!tan) warnings.push('TAN not found - verify employer TAN');
  if (!pan) warnings.push('PAN not found - verify employee PAN');
  if (grossSalary === 0) warnings.push('Gross salary not extracted - verify manually');
  if (tdsDeducted === 0) warnings.push('TDS amount not found - check Form 16 Part A');
  if (confidence < 50) warnings.push('Low extraction confidence - manual verification recommended');
  
  // Calculate derived values
  const exemptAllowances = hra + lta;
  const netSalary = grossSalary - exemptAllowances;
  const totalDeductions = section80C + section80D + section80E + section80G + section80CCD;
  const incomeChargeableSalaries = netSalary - standardDeduction - professionalTax;
  
  return {
    employer: {
      name: employerName,
      tan: tan.toUpperCase(),
    },
    employee: {
      name: employeeName,
      pan: pan.toUpperCase(),
    },
    assessmentYear: assessmentYear || 'Not Found',
    financialYear: financialYear || 'Not Found',
    partA: {
      quarterlyTDS: {
        q1: q1TDS,
        q2: q2TDS,
        q3: q3TDS,
        q4: q4TDS,
      },
      totalTDSDeducted: tdsDeducted || (q1TDS + q2TDS + q3TDS + q4TDS),
      totalTDSDeposited: tdsDeducted || (q1TDS + q2TDS + q3TDS + q4TDS),
    },
    partB: {
      grossSalary,
      exemptAllowances: {
        hra,
        lta,
        others: 0,
      },
      netSalary,
      standardDeduction,
      entertainmentAllowance: 0,
      professionalTax,
      incomeChargeableSalaries,
      incomeFromHouseProperty: 0,
      otherIncome: 0,
      grossTotalIncome: incomeChargeableSalaries,
      deductions: {
        section80C,
        section80CCC: 0,
        section80CCD1: 0,
        section80CCD1B: section80CCD,
        section80CCD2: 0,
        section80D,
        section80E,
        section80G,
        section80TTA: 0,
        section80TTB: 0,
        otherDeductions: 0,
        totalDeductions,
      },
      totalTaxableIncome: totalIncome || Math.max(0, incomeChargeableSalaries - totalDeductions),
      taxOnTotalIncome: taxPayable,
      rebate87A,
      surcharge,
      healthEducationCess: cess,
      totalTaxPayable: taxPayable + surcharge + cess,
      relief89: 0,
      netTaxPayable: taxPayable + surcharge + cess - rebate87A,
    },
    extractionConfidence: Math.round(confidence),
    rawText: text,
    warnings,
  };
}

// Validate extracted data
export function validateForm16Data(data: Form16Data): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check required fields
  if (!data.employer.tan || data.employer.tan.length !== 10) {
    errors.push('Invalid or missing employer TAN');
  }
  
  if (!data.employee.pan || data.employee.pan.length !== 10) {
    errors.push('Invalid or missing employee PAN');
  }
  
  if (data.partB.grossSalary === 0) {
    errors.push('Gross salary is zero or not extracted');
  }
  
  // Logical validations
  if (data.partB.netSalary > data.partB.grossSalary) {
    errors.push('Net salary cannot exceed gross salary');
  }
  
  if (data.partB.totalTaxableIncome > data.partB.grossTotalIncome) {
    errors.push('Taxable income cannot exceed gross total income');
  }
  
  if (data.partB.deductions.section80C > 150000) {
    errors.push('Section 80C deduction exceeds limit of \u20B91.5 lakh');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Export data for ITR filing
export function exportForm16ForITR(data: Form16Data): string {
  let output = `# Form 16 Data for ITR Filing\n`;
  output += `# Extracted on: ${new Date().toLocaleDateString()}\n`;
  output += `# Confidence: ${data.extractionConfidence}%\n\n`;
  
  output += `## Employer Details\n`;
  output += `- Name: ${data.employer.name}\n`;
  output += `- TAN: ${data.employer.tan}\n\n`;
  
  output += `## Employee Details\n`;
  output += `- Name: ${data.employee.name}\n`;
  output += `- PAN: ${data.employee.pan}\n`;
  output += `- Assessment Year: ${data.assessmentYear}\n\n`;
  
  output += `## Salary Details (Part B)\n`;
  output += `- Gross Salary: \u20B9${data.partB.grossSalary.toLocaleString('en-IN')}\n`;
  output += `- HRA Exemption: \u20B9${data.partB.exemptAllowances.hra.toLocaleString('en-IN')}\n`;
  output += `- LTA: \u20B9${data.partB.exemptAllowances.lta.toLocaleString('en-IN')}\n`;
  output += `- Standard Deduction: \u20B9${data.partB.standardDeduction.toLocaleString('en-IN')}\n`;
  output += `- Professional Tax: \u20B9${data.partB.professionalTax.toLocaleString('en-IN')}\n`;
  output += `- Income Chargeable: \u20B9${data.partB.incomeChargeableSalaries.toLocaleString('en-IN')}\n\n`;
  
  output += `## Deductions\n`;
  output += `- Section 80C: \u20B9${data.partB.deductions.section80C.toLocaleString('en-IN')}\n`;
  output += `- Section 80D: \u20B9${data.partB.deductions.section80D.toLocaleString('en-IN')}\n`;
  output += `- Section 80CCD(1B): \u20B9${data.partB.deductions.section80CCD1B.toLocaleString('en-IN')}\n`;
  output += `- Total Deductions: \u20B9${data.partB.deductions.totalDeductions.toLocaleString('en-IN')}\n\n`;
  
  output += `## Tax Details\n`;
  output += `- Total Taxable Income: \u20B9${data.partB.totalTaxableIncome.toLocaleString('en-IN')}\n`;
  output += `- Tax on Income: \u20B9${data.partB.taxOnTotalIncome.toLocaleString('en-IN')}\n`;
  output += `- Rebate 87A: \u20B9${data.partB.rebate87A.toLocaleString('en-IN')}\n`;
  output += `- Surcharge: \u20B9${data.partB.surcharge.toLocaleString('en-IN')}\n`;
  output += `- H&E Cess: \u20B9${data.partB.healthEducationCess.toLocaleString('en-IN')}\n`;
  output += `- Net Tax Payable: \u20B9${data.partB.netTaxPayable.toLocaleString('en-IN')}\n\n`;
  
  output += `## TDS Details (Part A)\n`;
  output += `- Total TDS Deducted: \u20B9${data.partA.totalTDSDeducted.toLocaleString('en-IN')}\n`;
  output += `- Q1: \u20B9${data.partA.quarterlyTDS.q1.toLocaleString('en-IN')}\n`;
  output += `- Q2: \u20B9${data.partA.quarterlyTDS.q2.toLocaleString('en-IN')}\n`;
  output += `- Q3: \u20B9${data.partA.quarterlyTDS.q3.toLocaleString('en-IN')}\n`;
  output += `- Q4: \u20B9${data.partA.quarterlyTDS.q4.toLocaleString('en-IN')}\n`;
  
  if (data.warnings.length > 0) {
    output += `\n## Warnings\n`;
    data.warnings.forEach(w => {
      output += `- ⚠️ ${w}\n`;
    });
  }
  
  return output;
}

