import type { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";

// Enhanced security headers with CSP
export const securityHeaders = helmet({
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
});

// Additional custom security headers
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove powered-by header
  res.removeHeader('X-Powered-By');
  
  // Add additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Enforce HTTPS in production
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  
  next();
};

// Enhanced rate limiting with different tiers
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes',
      timestamp: new Date().toISOString()
    });
  },
});

// Stricter rate limiting for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Input sanitization schema
const inputSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  name: z.string().max(100).regex(/^[a-zA-Z\s'-]+$/),
  message: z.string().max(1000),
  phone: z.string().regex(/^[\d\s\-\+\(\)]+$/).max(20),
});

// Enhanced input sanitization
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }
    
    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('Input sanitization error:', error);
    res.status(400).json({ 
      error: 'Invalid input data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Helper function to sanitize objects
function sanitizeObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip prototype pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      
      if (typeof value === 'string') {
        // Remove potential XSS vectors
        sanitized[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof value === 'object') {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return obj;
}

// CSRF token generation and validation
const csrfTokens = new Map<string, string>();

export const generateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return next();
  }
  
  const sessionId = req.session.id;
  if (!csrfTokens.has(sessionId)) {
    const token = generateSecureToken();
    csrfTokens.set(sessionId, token);
  }
  
  res.locals.csrfToken = csrfTokens.get(sessionId);
  next();
};

export const validateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF validation for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  if (!req.session) {
    return res.status(403).json({ error: 'Session required' });
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionId = req.session.id;
  const expectedToken = csrfTokens.get(sessionId);
  
  if (!token || !expectedToken || token !== expectedToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
};

// Secure token generation
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Request validation middleware
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }
      next(error);
    }
  };
};

// Security audit logging
export const securityAudit = (action: string, details?: any) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      userId: (req as any).user?.id || 'anonymous',
      details: details || {},
      suspicious: detectSuspiciousActivity(req)
    };
    
    if (logEntry.suspicious) {
      console.warn('Security alert:', logEntry);
    }
    
    next();
  };
};

// Detect suspicious patterns
function detectSuspiciousActivity(req: Request): boolean {
  const userAgent = req.headers['user-agent'] || '';
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /burp/i,
    /acunetix/i,
    /nmap/i,
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onclick=/i
  ];
  
  return suspiciousPatterns.some(pattern => 
    userAgent.match(pattern) || 
    JSON.stringify(req.body).match(pattern) ||
    JSON.stringify(req.query).match(pattern)
  );
}