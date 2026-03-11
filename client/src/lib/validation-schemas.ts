// Comprehensive validation schemas for Indian tax and financial forms
import { z } from 'zod';

// ============================================
// Indian Format Validators
// ============================================

// PAN Card: ABCDE1234F format
export const panSchema = z.string()
  .length(10, 'PAN must be exactly 10 characters')
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN format (e.g., ABCDE1234F)')
  .transform(val => val.toUpperCase());

// Aadhaar: 12 digits, can have spaces
export const aadhaarSchema = z.string()
  .transform(val => val.replace(/\s/g, ''))
  .refine(val => /^\d{12}$/.test(val), 'Aadhaar must be 12 digits')
  .refine(val => {
    // Verhoeff algorithm check (simplified)
    const d = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
    const p = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
    let c = 0;
    const arr = val.split('').reverse().map(Number);
    arr.forEach((n, i) => { c = d[c][p[i % 8][n]]; });
    return c === 0;
  }, 'Invalid Aadhaar number');

// GSTIN: 15 characters - 22AAAAA0000A1Z5
export const gstinSchema = z.string()
  .length(15, 'GSTIN must be exactly 15 characters')
  .regex(
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    'Invalid GSTIN format'
  )
  .transform(val => val.toUpperCase());

// TAN: ABCD12345E format
export const tanSchema = z.string()
  .length(10, 'TAN must be exactly 10 characters')
  .regex(/^[A-Z]{4}[0-9]{5}[A-Z]$/, 'Invalid TAN format (e.g., ABCD12345E)')
  .transform(val => val.toUpperCase());

// CIN: U12345AB1234ABC123456
export const cinSchema = z.string()
  .length(21, 'CIN must be exactly 21 characters')
  .regex(/^[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/, 'Invalid CIN format')
  .transform(val => val.toUpperCase());

// IFSC Code: ABCD0123456
export const ifscSchema = z.string()
  .length(11, 'IFSC must be exactly 11 characters')
  .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC format (e.g., SBIN0001234)')
  .transform(val => val.toUpperCase());

// Indian Phone Number
export const phoneSchema = z.string()
  .transform(val => val.replace(/[\s\-\(\)]/g, ''))
  .refine(val => /^(\+91)?[6-9]\d{9}$/.test(val), 'Invalid Indian phone number')
  .transform(val => val.startsWith('+91') ? val : `+91${val.replace(/^91/, '')}`);

// Indian Pincode
export const pincodeSchema = z.string()
  .length(6, 'Pincode must be 6 digits')
  .regex(/^[1-9][0-9]{5}$/, 'Invalid pincode');

// Email
export const emailSchema = z.string()
  .email('Invalid email address')
  .transform(val => val.toLowerCase());

// ============================================
// Financial Validators
// ============================================

// Positive currency amount
export const currencySchema = z.number()
  .min(0, 'Amount cannot be negative')
  .max(999999999999, 'Amount too large'); // Max 999 Cr

// Percentage (0-100)
export const percentageSchema = z.number()
  .min(0, 'Percentage cannot be negative')
  .max(100, 'Percentage cannot exceed 100');

// Interest rate (0-50%)
export const interestRateSchema = z.number()
  .min(0, 'Interest rate cannot be negative')
  .max(50, 'Interest rate seems too high');

// Financial Year (e.g., 2024-25)
export const financialYearSchema = z.string()
  .regex(/^20[0-9]{2}-[0-9]{2}$/, 'Invalid FY format (e.g., 2024-25)')
  .refine(val => {
    const [start, end] = val.split('-').map(Number);
    return end === (start % 100) + 1 || (start % 100 === 99 && end === 0);
  }, 'Invalid financial year');

// Assessment Year (e.g., 2025-26)
export const assessmentYearSchema = z.string()
  .regex(/^20[0-9]{2}-[0-9]{2}$/, 'Invalid AY format (e.g., 2025-26)');

// Bank Account Number
export const bankAccountSchema = z.string()
  .min(9, 'Account number too short')
  .max(18, 'Account number too long')
  .regex(/^\d+$/, 'Account number must contain only digits');

// ============================================
// Form Schemas
// ============================================

// Personal Details Form
export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  pan: panSchema,
  aadhaar: aadhaarSchema.optional(),
  email: emailSchema,
  phone: phoneSchema,
  dateOfBirth: z.string().refine(val => {
    const dob = new Date(val);
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 18 && age <= 120;
  }, 'Invalid date of birth'),
  address: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: pincodeSchema,
  }),
});

// Income Tax Calculator Input
export const incomeTaxInputSchema = z.object({
  grossSalary: currencySchema,
  otherIncome: currencySchema.optional().default(0),
  rentalIncome: currencySchema.optional().default(0),
  interestIncome: currencySchema.optional().default(0),
  deductions: z.object({
    section80C: currencySchema.max(150000, 'Max 80C limit is \u20B91.5 Lakh'),
    section80D: currencySchema.max(100000, 'Max 80D limit is \u20B91 Lakh'),
    section80CCD: currencySchema.max(50000, 'Max 80CCD(1B) limit is \u20B950,000'),
    section24: currencySchema.max(200000, 'Max Section 24 limit is \u20B92 Lakh'),
    hra: currencySchema.optional().default(0),
    lta: currencySchema.optional().default(0),
    standardDeduction: currencySchema.default(75000),
  }).optional(),
  regime: z.enum(['old', 'new']),
  age: z.enum(['below60', '60to80', 'above80']).default('below60'),
  assessmentYear: assessmentYearSchema,
});

// HRA Calculator Input
export const hraInputSchema = z.object({
  basicSalary: currencySchema.min(1, 'Basic salary is required'),
  hraReceived: currencySchema.min(1, 'HRA received is required'),
  rentPaid: currencySchema.min(1, 'Rent paid is required'),
  isMetroCity: z.boolean(),
});

// Capital Gains Input
export const capitalGainsInputSchema = z.object({
  assetType: z.enum(['equity', 'debt', 'property', 'gold']),
  purchasePrice: currencySchema.min(1, 'Purchase price is required'),
  salePrice: currencySchema.min(1, 'Sale price is required'),
  purchaseDate: z.string(),
  saleDate: z.string(),
  expenses: currencySchema.optional().default(0),
  indexationApplicable: z.boolean().optional().default(false),
}).refine(data => new Date(data.saleDate) > new Date(data.purchaseDate), {
  message: 'Sale date must be after purchase date',
  path: ['saleDate'],
});

// EMI Calculator Input
export const emiInputSchema = z.object({
  principal: currencySchema.min(10000, 'Minimum loan amount is \u20B910,000'),
  interestRate: interestRateSchema.min(1, 'Interest rate is required'),
  tenure: z.number().min(1, 'Tenure must be at least 1 month').max(360, 'Max tenure is 30 years'),
  tenureType: z.enum(['months', 'years']),
});

// SIP Calculator Input
export const sipInputSchema = z.object({
  monthlyInvestment: currencySchema.min(500, 'Minimum SIP is \u20B9500'),
  expectedReturn: percentageSchema.min(1, 'Expected return is required'),
  duration: z.number().min(1, 'Duration must be at least 1 year').max(40, 'Max duration is 40 years'),
});

// GST Registration Form
export const gstRegistrationSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  pan: panSchema,
  businessType: z.enum(['proprietorship', 'partnership', 'llp', 'pvtLtd', 'pubLtd']),
  turnover: currencySchema,
  businessAddress: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: pincodeSchema,
  }),
  bankDetails: z.object({
    accountNumber: bankAccountSchema,
    ifsc: ifscSchema,
    bankName: z.string().min(1, 'Bank name is required'),
  }),
  authorizedSignatory: z.object({
    name: z.string().min(1, 'Name is required'),
    pan: panSchema,
    aadhaar: aadhaarSchema,
    designation: z.string().min(1, 'Designation is required'),
  }),
});

// Business Registration Form
export const businessRegistrationSchema = z.object({
  companyName: z.string()
    .min(1, 'Company name is required')
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-\.]+$/, 'Company name contains invalid characters'),
  companyType: z.enum(['pvtLtd', 'llp', 'opc', 'partnership', 'proprietorship']),
  authorizedCapital: currencySchema.min(100000, 'Minimum authorized capital is \u20B91 Lakh'),
  paidUpCapital: currencySchema.min(100000, 'Minimum paid-up capital is \u20B91 Lakh'),
  directors: z.array(z.object({
    name: z.string().min(1, 'Director name is required'),
    pan: panSchema,
    aadhaar: aadhaarSchema,
    email: emailSchema,
    phone: phoneSchema,
    address: z.string().min(1, 'Address is required'),
    din: z.string().optional(), // DIN may not exist yet
  })).min(1, 'At least one director is required').max(15, 'Maximum 15 directors allowed'),
  registeredAddress: z.object({
    line1: z.string().min(1, 'Address is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    pincode: pincodeSchema,
  }),
  businessActivity: z.string().min(10, 'Describe your business activity'),
});

// Invoice Form
export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  invoiceDate: z.string(),
  dueDate: z.string().optional(),
  seller: z.object({
    name: z.string().min(1, 'Seller name is required'),
    gstin: gstinSchema.optional(),
    address: z.string().min(1, 'Address is required'),
  }),
  buyer: z.object({
    name: z.string().min(1, 'Buyer name is required'),
    gstin: gstinSchema.optional(),
    address: z.string().min(1, 'Address is required'),
  }),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    hsn: z.string().optional(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    rate: currencySchema.min(0),
    gstRate: z.enum(['0', '5', '12', '18', '28']),
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

// ============================================
// Utility Functions
// ============================================

export type ValidationError = {
  field: string;
  message: string;
};

export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: ValidationError[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: ValidationError[] = result.error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  
  return { success: false, errors };
}

// Format PAN for display (ABCDE1234F → ABCDE****F)
export function maskPAN(pan: string): string {
  if (pan.length !== 10) return pan;
  return `${pan.slice(0, 5)}****${pan.slice(9)}`;
}

// Format Aadhaar for display (1234 5678 9012)
export function formatAadhaar(aadhaar: string): string {
  const clean = aadhaar.replace(/\s/g, '');
  if (clean.length !== 12) return aadhaar;
  return `${clean.slice(0, 4)} ${clean.slice(4, 8)} ${clean.slice(8)}`;
}

// Mask Aadhaar (XXXX XXXX 9012)
export function maskAadhaar(aadhaar: string): string {
  const clean = aadhaar.replace(/\s/g, '');
  if (clean.length !== 12) return aadhaar;
  return `XXXX XXXX ${clean.slice(8)}`;
}

// Format currency for Indian locale
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Parse Indian currency string to number
export function parseINR(value: string): number {
  return Number(value.replace(/[\u20B9,\s]/g, '')) || 0;
}

