import crypto from 'crypto';
import { z } from 'zod';

// Security configuration schema
const securityConfigSchema = z.object({
  jwt: z.object({
    secret: z.string().min(32),
    expiresIn: z.string(),
    refreshExpiresIn: z.string(),
    issuer: z.string(),
    audience: z.string(),
  }),
  bcrypt: z.object({
    saltRounds: z.number().min(10).max(20),
  }),
  session: z.object({
    maxAge: z.number(),
    secure: z.boolean(),
    httpOnly: z.boolean(),
    sameSite: z.enum(['strict', 'lax', 'none']),
  }),
  rateLimit: z.object({
    windowMs: z.number(),
    maxRequests: z.number(),
    skipSuccessfulRequests: z.boolean(),
  }),
  cors: z.object({
    origin: z.array(z.string()),
    methods: z.array(z.string()),
    allowedHeaders: z.array(z.string()),
  }),
  security: z.object({
    hstsMaxAge: z.number(),
    contentSecurityPolicy: z.string(),
    xssProtection: z.boolean(),
    noSniff: z.boolean(),
    frameOptions: z.enum(['deny', 'sameorigin']),
  }),
});

export type SecurityConfig = z.infer<typeof securityConfigSchema>;

// Generate secure JWT secret
export function generateSecureJWTSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

// Environment-based configuration
function getEnvironmentConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    jwt: {
      secret: process.env.JWT_SECRET || (isProduction ? '' : generateSecureJWTSecret()),
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: process.env.JWT_ISSUER || 'myeca.in',
      audience: process.env.JWT_AUDIENCE || 'myeca-users',
    },
    bcrypt: {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    },
    session: {
      maxAge: parseInt(process.env.SESSION_MAX_AGE || '86400000'), // 24 hours
      secure: isProduction,
      httpOnly: true,
      sameSite: 'strict' as const,
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      skipSuccessfulRequests: false,
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    },
    security: {
      hstsMaxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000'), // 1 year
      contentSecurityPolicy: process.env.CSP_POLICY || "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';",
      xssProtection: true,
      noSniff: true,
      frameOptions: 'deny' as const,
    },
  };
}

// Validate configuration
export function validateSecurityConfig(): SecurityConfig {
  const config = getEnvironmentConfig();
  
  // Critical validation for production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is required in production');
    }
    
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL is recommended in production for rate limiting');
    }
  }
  
  try {
    return securityConfigSchema.parse(config);
  } catch (error) {
    console.error('Security configuration validation failed:', error);
    throw new Error('Invalid security configuration');
  }
}

// Security headers configuration
export const securityHeaders = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "https://api.myeca.in"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
};

// Rate limiting configurations
export const rateLimitConfig = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs for auth
    message: {
      error: 'Too many authentication attempts, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
  },
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
    message: 'Too many file uploads, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
};

// Input validation schemas
export const validationSchemas = {
  email: z.string().email().max(255),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  name: z.string().max(100).regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  message: z.string().max(1000),
  fileName: z.string().regex(/^[a-zA-Z0-9._-]+$/, 'Filename can only contain letters, numbers, dots, hyphens, and underscores'),
};

// Security utilities
export const securityUtils = {
  // Generate secure random token
  generateToken: (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  },
  
  // Hash password with bcrypt
  hashPassword: async (password: string, saltRounds: number = 12): Promise<string> => {
    const bcrypt = require('bcryptjs');
    return bcrypt.hash(password, saltRounds);
  },
  
  // Verify password
  verifyPassword: async (password: string, hash: string): Promise<boolean> => {
    const bcrypt = require('bcryptjs');
    return bcrypt.compare(password, hash);
  },
  
  // Sanitize input
  sanitizeInput: (input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  },
  
  // Validate file type
  validateFileType: (filename: string, allowedTypes: string[]): boolean => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? allowedTypes.includes(ext) : false;
  },
  
  // Generate secure session ID
  generateSessionId: (): string => {
    return crypto.randomBytes(32).toString('hex');
  },
};

// Export configuration
export const securityConfig = validateSecurityConfig();