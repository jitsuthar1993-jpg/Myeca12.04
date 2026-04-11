import { z } from 'zod';

// Common validation patterns
export const validationPatterns = {
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  AADHAAR: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
  GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  MOBILE: /^[6-9]\d{9}$/,
  PINCODE: /^[1-9][0-9]{5}$/,
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  ACCOUNT_NUMBER: /^[0-9]{9,18}$/,
};

// Input sanitization functions
export const sanitizeInput = {
  // Remove HTML tags and scripts
  text: (input: string): string => {
    if (!input) return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/[<>]/g, '')
      .trim();
  },

  // Sanitize numbers
  number: (input: string): string => {
    if (!input) return '';
    return input.replace(/[^0-9.-]/g, '');
  },

  // Sanitize alphanumeric with spaces
  alphanumeric: (input: string): string => {
    if (!input) return '';
    return input.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  },

  // Sanitize PAN
  pan: (input: string): string => {
    if (!input) return '';
    return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  },

  // Sanitize Aadhaar (mask middle digits)
  aadhaar: (input: string): string => {
    if (!input) return '';
    const cleaned = input.replace(/[^0-9]/g, '').slice(0, 12);
    if (cleaned.length === 12) {
      return `${cleaned.slice(0, 4)}****${cleaned.slice(-4)}`;
    }
    return cleaned;
  },

  // Sanitize phone number
  phone: (input: string): string => {
    if (!input) return '';
    return input.replace(/[^0-9+]/g, '').slice(0, 13);
  },

  // Sanitize email
  email: (input: string): string => {
    if (!input) return '';
    return input.toLowerCase().trim();
  },

  // Sanitize file names
  fileName: (input: string): string => {
    if (!input) return '';
    return input.replace(/[^a-zA-Z0-9._-]/g, '_');
  },
};

// Validation schemas
export const securitySchemas = {
  // Login validation
  login: z.object({
    email: z.string().email('Invalid email format').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),

  // Registration validation
  register: z.object({
    email: z.string().email('Invalid email format').max(255),
    password: z.string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[!@#$%^&*]/, 'Password must contain at least one special character'),
    name: z.string().min(2).max(100).regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters'),
  }),

  // PAN validation
  pan: z.string().regex(validationPatterns.PAN, 'Invalid PAN format'),

  // Aadhaar validation
  aadhaar: z.string().regex(validationPatterns.AADHAAR, 'Invalid Aadhaar format'),

  // GSTIN validation
  gstin: z.string().regex(validationPatterns.GSTIN, 'Invalid GSTIN format'),

  // Mobile validation
  mobile: z.string().regex(validationPatterns.MOBILE, 'Invalid mobile number'),

  // Bank details validation
  bankDetails: z.object({
    accountNumber: z.string().regex(validationPatterns.ACCOUNT_NUMBER, 'Invalid account number'),
    ifscCode: z.string().regex(validationPatterns.IFSC, 'Invalid IFSC code'),
    accountHolderName: z.string().min(2).max(100),
  }),

  // Address validation
  address: z.object({
    line1: z.string().min(5).max(100),
    line2: z.string().max(100).optional(),
    city: z.string().min(2).max(50),
    state: z.string().min(2).max(50),
    pincode: z.string().regex(validationPatterns.PINCODE, 'Invalid pincode'),
  }),

  // File upload validation
  fileUpload: z.object({
    filename: z.string().max(255),
    mimetype: z.enum([
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB'),
  }),
};

// XSS prevention functions
export const xssProtection = {
  // Escape HTML entities
  escapeHtml: (str: string): string => {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    return String(str).replace(/[&<>"'/]/g, (match) => htmlEntities[match]);
  },

  // Sanitize URL
  sanitizeUrl: (url: string): string => {
    try {
      const parsed = new URL(url);
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return '';
      }
      return parsed.toString();
    } catch {
      return '';
    }
  },

  // Sanitize JSON
  sanitizeJson: (obj: any): any => {
    if (typeof obj === 'string') {
      return xssProtection.escapeHtml(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(xssProtection.sanitizeJson);
    }
    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        sanitized[key] = xssProtection.sanitizeJson(obj[key]);
      }
      return sanitized;
    }
    return obj;
  },
};

// SQL injection prevention
export const sqlProtection = {
  // Escape SQL special characters
  escapeSql: (str: string): string => {
    if (!str) return '';
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0': return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '"':
        case "'":
        case '\\':
        case '%':
          return '\\' + char;
        default:
          return char;
      }
    });
  },

  // Validate table/column names
  validateIdentifier: (name: string): boolean => {
    return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
  },
};

// Path traversal prevention
export const pathProtection = {
  // Sanitize file paths
  sanitizePath: (path: string): string => {
    if (!path) return '';
    // Remove path traversal patterns
    return path
      .replace(/\.\./g, '')
      .replace(/[<>:"|?*]/g, '')
      .replace(/^[/\\]+/, '');
  },

  // Validate file extension
  validateFileExtension: (filename: string, allowedExtensions: string[]): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? allowedExtensions.includes(ext) : false;
  },
};

// Rate limiting helpers
export const rateLimitHelpers = {
  // Generate rate limit key
  getRateLimitKey: (identifier: string, action: string): string => {
    return `rate_limit:${action}:${identifier}`;
  },

  // Check if rate limited with any key-value store adapter.
  isRateLimited: async (
    store: any,
    key: string,
    limit: number,
    windowMs: number
  ): Promise<boolean> => {
    const current = await store.get(key) || 0;
    if (current >= limit) {
      return true;
    }
    await store.set(key, current + 1, windowMs);
    return false;
  },
};

// Session security
export const sessionSecurity = {
  // Generate secure session ID
  generateSessionId: (): string => {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
  },

  // Validate session
  validateSession: (session: any): boolean => {
    if (!session || !session.userId || !session.createdAt) {
      return false;
    }
    
    // Check session age (24 hours)
    const sessionAge = Date.now() - new Date(session.createdAt).getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    return sessionAge < maxAge;
  },
};

// Password security
export const passwordSecurity = {
  // Check password strength
  checkStrength: (password: string): {
    score: number;
    feedback: string[];
  } => {
    let score = 0;
    const feedback: string[] = [];

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[!@#$%^&*]/.test(password)) score++;

    if (password.length < 8) {
      feedback.push('Password should be at least 8 characters long');
    }
    if (!/[a-z]/.test(password)) {
      feedback.push('Include at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      feedback.push('Include at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      feedback.push('Include at least one number');
    }
    if (!/[!@#$%^&*]/.test(password)) {
      feedback.push('Include at least one special character');
    }

    return { score: Math.min(score, 5), feedback };
  },

  // Check for common passwords
  isCommonPassword: (password: string): boolean => {
    const commonPasswords = [
      'password', '123456', 'password123', 'admin', 'letmein',
      'welcome', 'monkey', '1234567890', 'qwerty', 'abc123',
      'Password1', 'password1', '123456789', 'welcome123',
    ];
    return commonPasswords.includes(password.toLowerCase());
  },
};

// Export all security utilities
export const security = {
  patterns: validationPatterns,
  sanitize: sanitizeInput,
  schemas: securitySchemas,
  xss: xssProtection,
  sql: sqlProtection,
  path: pathProtection,
  rateLimit: rateLimitHelpers,
  session: sessionSecurity,
  password: passwordSecurity,
};
