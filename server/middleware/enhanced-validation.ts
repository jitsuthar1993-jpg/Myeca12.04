// Comprehensive Input Validation Framework with OWASP Compliance
import { z } from 'zod';
import validator from 'validator';
import crypto from 'crypto';

// OWASP Validation Rules
const OWASP_PATTERNS = {
  // Email validation following RFC 5322
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  
  // Strong password requirements (OWASP)
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,128}$/,
  
  // Phone number (international format)
  PHONE: /^\+?[1-9]\d{1,14}$/,
  
  // URL validation
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  
  // File name validation (prevents directory traversal)
  FILENAME: /^[a-zA-Z0-9._-]+$/,
  
  // Username validation (alphanumeric with limited special chars)
  USERNAME: /^[a-zA-Z0-9._-]{3,30}$/,
  
  // Indian PAN card format
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  
  // Indian Aadhaar format
  AADHAAR: /^[2-9]{1}[0-9]{3}\s?[0-9]{4}\s?[0-9]{4}$/,
  
  // Bank account number (basic validation)
  BANK_ACCOUNT: /^[0-9]{9,18}$/,
  
  // IFSC code
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  
  // GST number
  GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
};

// Maximum lengths for different field types
const MAX_LENGTHS = {
  EMAIL: 254, // RFC 5321
  PASSWORD: 128,
  USERNAME: 30,
  NAME: 100,
  PHONE: 20,
  ADDRESS: 500,
  CITY: 50,
  STATE: 50,
  COUNTRY: 50,
  PINCODE: 10,
  PAN: 10,
  AADHAAR: 14,
  BANK_ACCOUNT: 18,
  IFSC: 11,
  GST: 15,
  URL: 2048,
  FILENAME: 255,
  DESCRIPTION: 1000,
  MESSAGE: 2000
};

// Input validation schemas with OWASP compliance
export const validationSchemas = {
  // User authentication
  email: z.string()
    .min(5, 'Email must be at least 5 characters')
    .max(MAX_LENGTHS.EMAIL, `Email must not exceed ${MAX_LENGTHS.EMAIL} characters`)
    .regex(OWASP_PATTERNS.EMAIL, 'Invalid email format')
    .transform(val => val.toLowerCase().trim())
    .refine(val => !val.includes('..'), 'Email cannot contain consecutive dots')
    .refine(val => !val.startsWith('.') && !val.endsWith('.'), 'Email cannot start or end with a dot'),

  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(MAX_LENGTHS.PASSWORD, `Password must not exceed ${MAX_LENGTHS.PASSWORD} characters`)
    .regex(OWASP_PATTERNS.PASSWORD, 'Password must contain uppercase, lowercase, number, and special character')
    .refine(val => !val.match(/(.+)\1{2,}/), 'Password cannot contain repeated sequences')
    .refine(val => !val.match(/(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i), 'Password cannot contain sequential characters')
    .refine(val => !val.match(/(password|admin|user|login|qwerty|asdf|zxcv)/i), 'Password cannot contain common words'),

  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(MAX_LENGTHS.USERNAME, `Username must not exceed ${MAX_LENGTHS.USERNAME} characters`)
    .regex(OWASP_PATTERNS.USERNAME, 'Username can only contain letters, numbers, dots, hyphens, and underscores')
    .transform(val => val.toLowerCase().trim())
    .refine(val => !val.match(/^[_.]/), 'Username cannot start with underscore or dot')
    .refine(val => !val.match(/[_.]$/), 'Username cannot end with underscore or dot')
    .refine(val => !val.match(/[_.]{2,}/), 'Username cannot contain consecutive special characters'),

  // Personal information
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(MAX_LENGTHS.NAME, `Name must not exceed ${MAX_LENGTHS.NAME} characters`)
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes')
    .transform(val => val.trim())
    .refine(val => !val.match(/\s{2,}/), 'Name cannot contain consecutive spaces')
    .refine(val => !val.match(/^['-]|['-]$/), 'Name cannot start or end with special characters'),

  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(MAX_LENGTHS.PHONE, `Phone number must not exceed ${MAX_LENGTHS.PHONE} characters`)
    .regex(OWASP_PATTERNS.PHONE, 'Invalid phone number format')
    .transform(val => val.replace(/\s+/g, ''))
    .refine(val => validator.isMobilePhone(val, 'any'), 'Invalid mobile phone number'),

  // Indian-specific validations
  pan: z.string()
    .length(10, 'PAN must be exactly 10 characters')
    .regex(OWASP_PATTERNS.PAN, 'Invalid PAN format')
    .transform(val => val.toUpperCase()),

  aadhaar: z.string()
    .regex(OWASP_PATTERNS.AADHAAR, 'Invalid Aadhaar format')
    .transform(val => val.replace(/\s+/g, ''))
    .refine(val => this.validateAadhaarChecksum(val), 'Invalid Aadhaar checksum'),

  bankAccount: z.string()
    .min(9, 'Bank account number must be at least 9 digits')
    .max(MAX_LENGTHS.BANK_ACCOUNT, `Bank account number must not exceed ${MAX_LENGTHS.BANK_ACCOUNT} digits`)
    .regex(OWASP_PATTERNS.BANK_ACCOUNT, 'Bank account number must contain only digits'),

  ifsc: z.string()
    .length(11, 'IFSC code must be exactly 11 characters')
    .regex(OWASP_PATTERNS.IFSC, 'Invalid IFSC format')
    .transform(val => val.toUpperCase()),

  gst: z.string()
    .length(15, 'GST number must be exactly 15 characters')
    .regex(OWASP_PATTERNS.GST, 'Invalid GST format')
    .transform(val => val.toUpperCase()),

  // Address fields
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(MAX_LENGTHS.ADDRESS, `Address must not exceed ${MAX_LENGTHS.ADDRESS} characters`)
    .transform(val => val.trim())
    .refine(val => !val.match(/\s{3,}/), 'Address cannot contain excessive whitespace'),

  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(MAX_LENGTHS.CITY, `City must not exceed ${MAX_LENGTHS.CITY} characters`)
    .regex(/^[a-zA-Z\s'-]+$/, 'City can only contain letters, spaces, hyphens, and apostrophes')
    .transform(val => val.trim()),

  state: z.string()
    .min(2, 'State must be at least 2 characters')
    .max(MAX_LENGTHS.STATE, `State must not exceed ${MAX_LENGTHS.STATE} characters`)
    .regex(/^[a-zA-Z\s'-]+$/, 'State can only contain letters, spaces, hyphens, and apostrophes')
    .transform(val => val.trim()),

  country: z.string()
    .min(2, 'Country must be at least 2 characters')
    .max(MAX_LENGTHS.COUNTRY, `Country must not exceed ${MAX_LENGTHS.COUNTRY} characters`)
    .regex(/^[a-zA-Z\s'-]+$/, 'Country can only contain letters, spaces, hyphens, and apostrophes')
    .transform(val => val.trim()),

  pincode: z.string()
    .min(6, 'Pincode must be at least 6 characters')
    .max(MAX_LENGTHS.PINCODE, `Pincode must not exceed ${MAX_LENGTHS.PINCODE} characters`)
    .regex(/^[0-9]{6,10}$/, 'Pincode must contain only digits'),

  // Financial data
  amount: z.number()
    .positive('Amount must be positive')
    .max(999999999999.99, 'Amount cannot exceed 999,999,999,999.99')
    .refine(val => Number.isFinite(val) && val === Number(val.toFixed(2)), 'Amount can have maximum 2 decimal places'),

  percentage: z.number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100'),

  // File uploads
  filename: z.string()
    .min(1, 'Filename cannot be empty')
    .max(MAX_LENGTHS.FILENAME, `Filename must not exceed ${MAX_LENGTHS.FILENAME} characters`)
    .regex(OWASP_PATTERNS.FILENAME, 'Filename can only contain letters, numbers, dots, hyphens, and underscores')
    .refine(val => !val.match(/\.{2,}/), 'Filename cannot contain consecutive dots')
    .refine(val => !val.match(/^\./), 'Filename cannot start with a dot')
    .refine(val => !val.match(/\.$/), 'Filename cannot end with a dot')
    .transform(val => val.toLowerCase()),

  fileSize: z.number()
    .positive('File size must be positive')
    .max(10 * 1024 * 1024, 'File size cannot exceed 10MB'), // 10MB limit

  // URLs and paths
  url: z.string()
    .max(MAX_LENGTHS.URL, `URL must not exceed ${MAX_LENGTHS.URL} characters`)
    .regex(OWASP_PATTERNS.URL, 'Invalid URL format')
    .refine(val => validator.isURL(val), 'Invalid URL format')
    .transform(val => val.trim()),

  // Descriptions and messages
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(MAX_LENGTHS.DESCRIPTION, `Description must not exceed ${MAX_LENGTHS.DESCRIPTION} characters`)
    .transform(val => val.trim())
    .refine(val => !val.match(/\s{3,}/), 'Description cannot contain excessive whitespace'),

  message: z.string()
    .min(5, 'Message must be at least 5 characters')
    .max(MAX_LENGTHS.MESSAGE, `Message must not exceed ${MAX_LENGTHS.MESSAGE} characters`)
    .transform(val => val.trim())
    .refine(val => !val.match(/\s{3,}/), 'Message cannot contain excessive whitespace'),

  // Dates
  date: z.string()
    .refine(val => validator.isISO8601(val), 'Invalid date format')
    .transform(val => new Date(val)),

  dateOfBirth: z.string()
    .refine(val => validator.isISO8601(val), 'Invalid date format')
    .transform(val => new Date(val))
    .refine(val => {
      const age = (Date.now() - val.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return age >= 18 && age <= 120;
    }, 'Age must be between 18 and 120 years'),

  // Tax-specific validations
  assessmentYear: z.string()
    .regex(/^\d{4}-\d{2}$/, 'Assessment year must be in format YYYY-YY')
    .refine(val => {
      const [startYear, endYear] = val.split('-').map(Number);
      return endYear === startYear + 1 && startYear >= 2000 && startYear <= new Date().getFullYear() + 1;
    }, 'Invalid assessment year'),

  financialYear: z.string()
    .regex(/^\d{4}-\d{2}$/, 'Financial year must be in format YYYY-YY')
    .refine(val => {
      const [startYear, endYear] = val.split('-').map(Number);
      return endYear === startYear + 1 && startYear >= 2000 && startYear <= new Date().getFullYear();
    }, 'Invalid financial year'),

  // Security fields
  otp: z.string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^[0-9]{6}$/, 'OTP must contain only digits'),

  captcha: z.string()
    .min(4, 'Captcha must be at least 4 characters')
    .max(10, 'Captcha must not exceed 10 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Captcha can only contain letters and numbers'),

  // IP address validation
  ipAddress: z.string()
    .refine(val => validator.isIP(val), 'Invalid IP address format'),

  // MAC address validation
  macAddress: z.string()
    .refine(val => validator.isMACAddress(val), 'Invalid MAC address format')
};

// Helper functions for complex validations
export class ValidationHelpers {
  static validateAadhaarChecksum(aadhaar: string): boolean {
    const cleanAadhaar = aadhaar.replace(/\s+/g, '');
    if (cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
      return false;
    }

    // Verhoeff algorithm for Aadhaar checksum validation
    const verhoeffTable = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
      [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
      [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
      [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];

    let c = 0;
    const reversedAadhaar = cleanAadhaar.split('').reverse().join('');
    
    for (let i = 0; i < reversedAadhaar.length; i++) {
      c = verhoeffTable[c][parseInt(reversedAadhaar[i])];
    }

    return c === 0;
  }

  static sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return input;
    }

    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/data:text\/html/gi, '') // Remove data URLs
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .replace(/file:/gi, '') // Remove file: protocol
      .replace(/\.\./g, '') // Remove directory traversal attempts
      .replace(/\x00/g, '') // Remove null bytes
      .substring(0, 10000); // Limit length to prevent DoS
  }

  static validateFileType(filename: string, allowedTypes: string[]): boolean {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? allowedTypes.includes(ext) : false;
  }

  static validateFileContent(buffer: Buffer, expectedType: string): boolean {
    // Basic magic number validation
    const magicNumbers = {
      'image/jpeg': ['ffd8ff'],
      'image/png': ['89504e47'],
      'image/gif': ['47494638'],
      'image/webp': ['52494646'],
      'application/pdf': ['25504446'],
      'text/plain': null // No magic number for plain text
    };

    const expectedMagic = magicNumbers[expectedType as keyof typeof magicNumbers];
    if (!expectedMagic) return true; // Skip validation for unknown types

    const fileMagic = buffer.slice(0, 4).toString('hex');
    return expectedMagic.some(magic => fileMagic.startsWith(magic));
  }

  static detectSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|cast|convert)\b)/i,
      /(--|\/\*|\*\/)/,
      /(\b(or|and)\b.*=.*)/i,
      /(\bunion\b.*\bselect\b)/i,
      /(;.*drop\s+table)/i,
      /(xp_|sp_)/i,
      /(0x[0-9a-fA-F]+)/,
      /(\|\|.*\|\|)/,
      /(@@version|@@servername|database()|user()|current_user)/i
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  static detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>.*?<\/iframe>/i,
      /<object[^>]*>.*?<\/object>/i,
      /<embed[^>]*>.*?<\/embed>/i,
      /vbscript:/i,
      /data:text\/html/i,
      /&lt;script/i,
      /&#60;script/i,
      /%3Cscript/i
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  static detectDirectoryTraversal(input: string): boolean {
    const traversalPatterns = [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/,
      /%252e%252e%252f/,
      /\.\.\/\/\/\//,
      /\/\.\.\/\/\//,
      /\/\/\/\.\.\//
    ];

    return traversalPatterns.some(pattern => pattern.test(input));
  }

  static validateIndianPincode(pincode: string): boolean {
    const cleanPincode = pincode.replace(/\s+/g, '');
    if (!/^[1-9][0-9]{5}$/.test(cleanPincode)) {
      return false;
    }

    // Additional validation: check against known invalid pincodes
    const invalidRanges = [
      '000000', // Cannot start with 0
      '999999'  // Reserved
    ];

    return !invalidRanges.includes(cleanPincode);
  }

  static sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '') // Remove invalid characters
      .replace(/\.+/g, '.') // Remove consecutive dots
      .replace(/^\.+|\.+$/g, '') // Remove leading/trailing dots
      .toLowerCase()
      .substring(0, MAX_LENGTHS.FILENAME);
  }

  static generateSafeFilename(originalFilename: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const sanitized = this.sanitizeFilename(originalFilename);
    const nameWithoutExt = sanitized.split('.')[0];
    const extension = sanitized.split('.').pop();
    
    return `${nameWithoutExt}_${timestamp}_${randomString}.${extension}`;
  }
}

// Validation middleware factory
export const createValidationMiddleware = (schema: z.ZodSchema, options?: {
  stripUnknown?: boolean;
  abortEarly?: boolean;
  allowExtraKeys?: boolean;
  sanitize?: boolean;
}) => {
  return async (req: any, res: any, next: any) => {
    try {
      let data = req.body;

      // Apply sanitization if requested
      if (options?.sanitize) {
        data = ValidationHelpers.sanitizeInput(JSON.stringify(data));
        data = JSON.parse(data);
      }

      // Validate against schema
      const validated = await schema.parseAsync(data, {
        stripUnknown: options?.stripUnknown ?? true,
        abortEarly: options?.abortEarly ?? false
      });

      // Check for SQL injection patterns
      const stringValues = Object.values(validated).filter(val => typeof val === 'string');
      const hasSQLInjection = stringValues.some(val => ValidationHelpers.detectSQLInjection(val as string));
      
      if (hasSQLInjection) {
        return res.status(400).json({
          error: 'Potential SQL injection detected',
          code: 'SQL_INJECTION_DETECTED'
        });
      }

      // Check for XSS patterns
      const hasXSS = stringValues.some(val => ValidationHelpers.detectXSS(val as string));
      
      if (hasXSS) {
        return res.status(400).json({
          error: 'Potential XSS attack detected',
          code: 'XSS_DETECTED'
        });
      }

      // Check for directory traversal
      const hasTraversal = stringValues.some(val => ValidationHelpers.detectDirectoryTraversal(val as string));
      
      if (hasTraversal) {
        return res.status(400).json({
          error: 'Potential directory traversal detected',
          code: 'DIRECTORY_TRAVERSAL_DETECTED'
        });
      }

      // Replace request body with validated data
      req.body = validated;
      
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }

      return res.status(500).json({
        error: 'Validation error',
        code: 'INTERNAL_ERROR'
      });
    }
  };
};

// Common validation schemas for tax calculator
export const taxValidationSchemas = {
  // Income validation
  income: z.object({
    salary: z.number().min(0).max(9999999999).optional(),
    houseProperty: z.number().min(0).max(9999999999).optional(),
    business: z.number().min(0).max(9999999999).optional(),
    capitalGains: z.number().min(0).max(9999999999).optional(),
    otherSources: z.number().min(0).max(9999999999).optional(),
    totalIncome: z.number().min(0).max(9999999999)
  }),

  // Deduction validation
  deductions: z.object({
    section80C: z.number().min(0).max(150000).optional(),
    section80D: z.number().min(0).max(100000).optional(),
    section80E: z.number().min(0).max(999999999).optional(),
    section24: z.number().min(0).max(200000).optional(),
    section80G: z.number().min(0).max(999999999).optional()
  }),

  // Assessment year validation
  assessmentYear: validationSchemas.assessmentYear,

  // Personal details for tax filing
  personalDetails: z.object({
    pan: validationSchemas.pan,
    name: validationSchemas.name,
    dateOfBirth: validationSchemas.dateOfBirth,
    email: validationSchemas.email,
    phone: validationSchemas.phone,
    address: z.object({
      line1: validationSchemas.address,
      line2: z.string().max(100).optional(),
      city: validationSchemas.city,
      state: validationSchemas.state,
      pincode: validationSchemas.pincode,
      country: validationSchemas.country
    })
  })
};

// Export validation helpers
export { ValidationHelpers };