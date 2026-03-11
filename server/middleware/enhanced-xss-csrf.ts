import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { URL } from 'url';

// Enhanced XSS/CSRF Protection Configuration
interface XSSCSRFConfig {
  enabled: boolean;
  cspEnabled: boolean;
  nonceEnabled: boolean;
  hashEnabled: boolean;
  strictTransportSecurity: boolean;
  xssProtectionEnabled: boolean;
  contentTypeOptions: boolean;
  frameOptions: string;
  referrerPolicy: string;
  permissionsPolicy: string;
  crossOriginPolicies: {
    embedderPolicy: string;
    openerPolicy: string;
    resourcePolicy: string;
  };
  trustedDomains: string[];
  allowedInlineScripts: string[];
  allowedInlineStyles: string[];
  allowedExternalResources: string[];
  reportUri: string;
  reportOnly: boolean;
}

// CSP Nonce and Hash Management
interface CSPData {
  nonce: string;
  hashes: {
    sha256: string[];
    sha384: string[];
    sha512: string[];
  };
  generatedAt: number;
}

// CSRF Token Management
interface CSRFTokens {
  tokens: Map<string, CSRFTokenData>;
  cleanupInterval: NodeJS.Timeout | null;
}

interface CSRFTokenData {
  token: string;
  sessionId: string;
  userId?: number;
  createdAt: number;
  expiresAt: number;
  used: boolean;
  ipAddress: string;
  userAgent: string;
}

// XSS Detection Patterns
interface XSSPattern {
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
}

// Enhanced XSS/CSRF Protection Service
class EnhancedXSSCSRFProtection {
  private config: XSSCSRFConfig;
  private cspCache: Map<string, CSPData> = new Map();
  private csrfTokens: CSRFTokens;
  private xssPatterns: XSSPattern[];
  private trustedOrigins: Set<string> = new Set();
  private contentSecurityPolicy: string = '';

  constructor(config: Partial<XSSCSRFConfig> = {}) {
    this.config = {
      enabled: true,
      cspEnabled: true,
      nonceEnabled: true,
      hashEnabled: true,
      strictTransportSecurity: true,
      xssProtectionEnabled: true,
      contentTypeOptions: true,
      frameOptions: 'DENY',
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=()',
      crossOriginPolicies: {
        embedderPolicy: 'require-corp',
        openerPolicy: 'same-origin',
        resourcePolicy: 'cross-origin'
      },
      trustedDomains: [
        'https://myeca.in',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
        'https://www.google-analytics.com',
        'https://cdn.jsdelivr.net',
        'https://unpkg.com'
      ],
      allowedInlineScripts: [],
      allowedInlineStyles: [],
      allowedExternalResources: [],
      reportUri: '/api/security/csp-report',
      reportOnly: false,
      ...config
    };

    this.csrfTokens = {
      tokens: new Map(),
      cleanupInterval: null
    };

    this.initializeXSSPatterns();
    this.initializeTrustedOrigins();
    this.startCSRFTokenCleanup();
    this.generateCSP();
  }

  // Initialize XSS detection patterns
  private initializeXSSPatterns(): void {
    this.xssPatterns = [
      // Basic XSS patterns
      {
        pattern: /<script[^>]*>.*?<\/script>/gi,
        severity: 'critical',
        description: 'Script tag injection',
        mitigation: 'Block and sanitize input'
      },
      {
        pattern: /javascript:/gi,
        severity: 'critical',
        description: 'JavaScript protocol injection',
        mitigation: 'Remove javascript: protocol'
      },
      {
        pattern: /on\w+\s*=/gi,
        severity: 'high',
        description: 'Event handler injection',
        mitigation: 'Remove event handlers'
      },
      // Advanced XSS patterns
      {
        pattern: /<iframe[^>]*src=["']javascript:/gi,
        severity: 'critical',
        description: 'Iframe with javascript: protocol',
        mitigation: 'Block iframe with javascript protocol'
      },
      {
        pattern: /<object[^>]*data=["']javascript:/gi,
        severity: 'critical',
        description: 'Object tag with javascript: protocol',
        mitigation: 'Block object with javascript protocol'
      },
      {
        pattern: /<embed[^>]*src=["']javascript:/gi,
        severity: 'critical',
        description: 'Embed tag with javascript: protocol',
        mitigation: 'Block embed with javascript protocol'
      },
      // Encoded XSS patterns
      {
        pattern: /&lt;script/gi,
        severity: 'critical',
        description: 'HTML encoded script tag',
        mitigation: 'Decode and block script tags'
      },
      {
        pattern: /&#x3C;script/gi,
        severity: 'critical',
        description: 'Hex encoded script tag',
        mitigation: 'Decode and block script tags'
      },
      {
        pattern: /&#60;script/gi,
        severity: 'critical',
        description: 'Decimal encoded script tag',
        mitigation: 'Decode and block script tags'
      },
      // CSS injection patterns
      {
        pattern: /expression\s*\(/gi,
        severity: 'high',
        description: 'CSS expression injection',
        mitigation: 'Remove CSS expressions'
      },
      {
        pattern: /behavior\s*:/gi,
        severity: 'high',
        description: 'CSS behavior injection',
        mitigation: 'Remove CSS behavior'
      },
      {
        pattern: /-moz-binding/gi,
        severity: 'high',
        description: 'Firefox XBL injection',
        mitigation: 'Remove XBL bindings'
      },
      // DOM manipulation patterns
      {
        pattern: /document\.write/gi,
        severity: 'high',
        description: 'Document.write injection',
        mitigation: 'Block document.write'
      },
      {
        pattern: /document\.cookie/gi,
        severity: 'medium',
        description: 'Cookie manipulation',
        mitigation: 'Sanitize cookie access'
      },
      {
        pattern: /window\.location/gi,
        severity: 'medium',
        description: 'Location manipulation',
        mitigation: 'Validate location changes'
      },
      // Advanced obfuscation patterns
      {
        pattern: /eval\s*\(\s*['"`]/gi,
        severity: 'critical',
        description: 'Eval function usage',
        mitigation: 'Block eval usage'
      },
      {
        pattern: /setTimeout\s*\(\s*['"`][^'"`]*['"`]/gi,
        severity: 'high',
        description: 'setTimeout with string',
        mitigation: 'Block string-based setTimeout'
      },
      {
        pattern: /setInterval\s*\(\s*['"`][^'"`]*['"`]/gi,
        severity: 'high',
        description: 'setInterval with string',
        mitigation: 'Block string-based setInterval'
      },
      // Unicode and special character patterns
      {
        pattern: /[\u0000-\u001f\u007f-\u009f]/g,
        severity: 'medium',
        description: 'Control characters',
        mitigation: 'Remove control characters'
      },
      {
        pattern: /[\u202e\u202d\u202c\u202b\u202a]/g,
        severity: 'high',
        description: 'Unicode bidi override',
        mitigation: 'Remove bidi override characters'
      }
    ];
  }

  // Initialize trusted origins
  private initializeTrustedOrigins(): void {
    this.config.trustedDomains.forEach(domain => {
      try {
        const url = new URL(domain);
        this.trustedOrigins.add(url.origin);
      } catch (error) {
        console.warn(`Invalid trusted domain: ${domain}`);
      }
    });
  }

  // Generate Content Security Policy
  private generateCSP(): void {
    const directives = [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${this.config.nonceEnabled ? `'nonce-{NONCE}'` : ''} ${this.config.hashEnabled ? `'sha256-{HASH}'` : ''} https://fonts.googleapis.com https://www.google-analytics.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src 'self' https://fonts.gstatic.com`,
      `img-src 'self' data: https:`,
      `connect-src 'self' https://api.myeca.in https://www.google-analytics.com`,
      `media-src 'self'`,
      `object-src 'none'`,
      `child-src 'self'`,
      `form-action 'self'`,
      `frame-ancestors 'none'`,
      `base-uri 'self'`,
      `upgrade-insecure-requests`,
      `block-all-mixed-content`
    ];

    if (this.config.reportUri) {
      directives.push(`report-uri ${this.config.reportUri}`);
      directives.push(`report-to csp-endpoint`);
    }

    this.contentSecurityPolicy = directives.join('; ');
  }

  // Generate CSP nonce
  private generateNonce(): string {
    return crypto.randomBytes(16).toString('base64');
  }

  // Generate CSP hash
  private generateHash(content: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'): string {
    const hash = crypto.createHash(algorithm).update(content).digest('base64');
    return `'${algorithm}-${hash}'`;
  }

  // Start CSRF token cleanup
  private startCSRFTokenCleanup(): void {
    if (this.csrfTokens.cleanupInterval) {
      clearInterval(this.csrfTokens.cleanupInterval);
    }

    this.csrfTokens.cleanupInterval = setInterval(() => {
      this.cleanupExpiredTokens();
    }, 300000); // Clean up every 5 minutes
  }

  // Clean up expired CSRF tokens
  private cleanupExpiredTokens(): void {
    const now = Date.now();
    let removedCount = 0;

    for (const [tokenId, tokenData] of this.csrfTokens.tokens.entries()) {
      if (now > tokenData.expiresAt) {
        this.csrfTokens.tokens.delete(tokenId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired CSRF tokens`);
    }
  }

  // Generate CSRF token
  public generateCSRFToken(sessionId: string, userId?: number, ipAddress?: string, userAgent?: string): string {
    const tokenId = crypto.randomUUID();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    const tokenData: CSRFTokenData = {
      token,
      sessionId,
      userId,
      createdAt: Date.now(),
      expiresAt,
      used: false,
      ipAddress: ipAddress || 'unknown',
      userAgent: userAgent || 'unknown'
    };

    this.csrfTokens.tokens.set(tokenId, tokenData);

    // Return token with metadata
    return `${tokenId}.${token}`;
  }

  // Validate CSRF token
  public validateCSRFToken(token: string, sessionId: string, ipAddress?: string, userAgent?: string): {
    valid: boolean;
    reason?: string;
    tokenData?: CSRFTokenData;
  } {
    const parts = token.split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'Invalid token format' };
    }

    const [tokenId, tokenValue] = parts;
    const tokenData = this.csrfTokens.tokens.get(tokenId);

    if (!tokenData) {
      return { valid: false, reason: 'Token not found' };
    }

    if (tokenData.used) {
      return { valid: false, reason: 'Token already used' };
    }

    if (Date.now() > tokenData.expiresAt) {
      return { valid: false, reason: 'Token expired' };
    }

    if (tokenData.sessionId !== sessionId) {
      return { valid: false, reason: 'Session mismatch' };
    }

    if (tokenData.token !== tokenValue) {
      return { valid: false, reason: 'Token value mismatch' };
    }

    // Validate IP address if provided
    if (ipAddress && tokenData.ipAddress !== 'unknown' && tokenData.ipAddress !== ipAddress) {
      return { valid: false, reason: 'IP address mismatch' };
    }

    // Validate user agent if provided
    if (userAgent && tokenData.userAgent !== 'unknown' && tokenData.userAgent !== userAgent) {
      return { valid: false, reason: 'User agent mismatch' };
    }

    // Mark token as used
    tokenData.used = true;

    return { valid: true, tokenData };
  }

  // Detect XSS attempts
  public detectXSS(content: string): {
    detected: boolean;
    threats: Array<{
      pattern: string;
      severity: string;
      description: string;
      mitigation: string;
      match: string;
    }>;
    riskScore: number;
  } {
    const threats = [];
    let riskScore = 0;

    for (const xssPattern of this.xssPatterns) {
      const matches = content.match(xssPattern.pattern);
      if (matches) {
        const severityScore = {
          low: 10,
          medium: 25,
          high: 50,
          critical: 100
        }[xssPattern.severity] || 25;

        riskScore += severityScore;

        threats.push({
          pattern: xssPattern.pattern.source,
          severity: xssPattern.severity,
          description: xssPattern.description,
          mitigation: xssPattern.mitigation,
          match: matches[0]
        });
      }
    }

    return {
      detected: threats.length > 0,
      threats,
      riskScore: Math.min(riskScore, 100)
    };
  }

  // Sanitize content
  public sanitizeContent(content: string): {
    sanitized: string;
    removed: Array<{
      original: string;
      reason: string;
    }>;
  } {
    const removed: Array<{ original: string; reason: string }> = [];
    let sanitized = content;

    // Remove script tags
    const scriptMatches = sanitized.match(/<script[^>]*>.*?<\/script>/gi);
    if (scriptMatches) {
      sanitized = sanitized.replace(/<script[^>]*>.*?<\/script>/gi, '');
      scriptMatches.forEach(match => {
        removed.push({ original: match, reason: 'Script tag removal' });
      });
    }

    // Remove javascript: protocol
    const jsProtocolMatches = sanitized.match(/javascript:/gi);
    if (jsProtocolMatches) {
      sanitized = sanitized.replace(/javascript:/gi, '');
      jsProtocolMatches.forEach(match => {
        removed.push({ original: match, reason: 'JavaScript protocol removal' });
      });
    }

    // Remove event handlers
    const eventHandlerMatches = sanitized.match(/on\w+\s*=/gi);
    if (eventHandlerMatches) {
      sanitized = sanitized.replace(/on\w+\s*=/gi, '');
      eventHandlerMatches.forEach(match => {
        removed.push({ original: match, reason: 'Event handler removal' });
      });
    }

    // Remove dangerous CSS
    const cssExpressionMatches = sanitized.match(/expression\s*\(/gi);
    if (cssExpressionMatches) {
      sanitized = sanitized.replace(/expression\s*\(/gi, '');
      cssExpressionMatches.forEach(match => {
        removed.push({ original: match, reason: 'CSS expression removal' });
      });
    }

    // Remove eval and similar functions
    const evalMatches = sanitized.match(/eval\s*\(/gi);
    if (evalMatches) {
      sanitized = sanitized.replace(/eval\s*\(/gi, '');
      evalMatches.forEach(match => {
        removed.push({ original: match, reason: 'Eval function removal' });
      });
    }

    return { sanitized, removed };
  }

  // Generate security headers
  public generateSecurityHeaders(req: Request): Record<string, string> {
    const headers: Record<string, string> = {};

    if (!this.config.enabled) {
      return headers;
    }

    // Content Security Policy
    if (this.config.cspEnabled) {
      const cspData = this.getOrCreateCSPData(req);
      const cspWithNonce = this.contentSecurityPolicy.replace('{NONCE}', cspData.nonce);
      headers['Content-Security-Policy'] = this.config.reportOnly 
        ? `Content-Security-Policy-Report-Only: ${cspWithNonce}`
        : cspWithNonce;
      
      headers['Content-Security-Policy'] = cspWithNonce;
      
      if (this.config.reportUri) {
        headers['Report-To'] = JSON.stringify({
          group: 'csp-endpoint',
          max_age: 10886400,
          endpoints: [{ url: this.config.reportUri }]
        });
      }
    }

    // Strict Transport Security
    if (this.config.strictTransportSecurity) {
      headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
    }

    // X-XSS-Protection
    if (this.config.xssProtectionEnabled) {
      headers['X-XSS-Protection'] = '1; mode=block';
    }

    // X-Content-Type-Options
    if (this.config.contentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // X-Frame-Options
    if (this.config.frameOptions) {
      headers['X-Frame-Options'] = this.config.frameOptions;
    }

    // Referrer Policy
    if (this.config.referrerPolicy) {
      headers['Referrer-Policy'] = this.config.referrerPolicy;
    }

    // Permissions Policy
    if (this.config.permissionsPolicy) {
      headers['Permissions-Policy'] = this.config.permissionsPolicy;
    }

    // Cross-Origin Policies
    if (this.config.crossOriginPolicies.embedderPolicy) {
      headers['Cross-Origin-Embedder-Policy'] = this.config.crossOriginPolicies.embedderPolicy;
    }
    if (this.config.crossOriginPolicies.openerPolicy) {
      headers['Cross-Origin-Opener-Policy'] = this.config.crossOriginPolicies.openerPolicy;
    }
    if (this.config.crossOriginPolicies.resourcePolicy) {
      headers['Cross-Origin-Resource-Policy'] = this.config.crossOriginPolicies.resourcePolicy;
    }

    return headers;
  }

  // Get or create CSP data for request
  private getOrCreateCSPData(req: Request): CSPData {
    const sessionId = (req as any).session?.id || 'default';
    const userId = (req as any).user?.id;
    const key = `${sessionId}-${userId || 'anonymous'}`;

    let cspData = this.cspCache.get(key);
    if (!cspData || Date.now() - cspData.generatedAt > 3600000) { // 1 hour
      cspData = {
        nonce: this.generateNonce(),
        hashes: {
          sha256: [],
          sha384: [],
          sha512: []
        },
        generatedAt: Date.now()
      };
      this.cspCache.set(key, cspData);
    }

    return cspData;
  }

  // Validate origin
  public validateOrigin(origin: string): boolean {
    try {
      const url = new URL(origin);
      return this.trustedOrigins.has(url.origin);
    } catch (error) {
      return false;
    }
  }

  // Get CSP nonce
  public getNonce(req: Request): string {
    const cspData = this.getOrCreateCSPData(req);
    return cspData.nonce;
  }

  // Cleanup resources
  public cleanup(): void {
    if (this.csrfTokens.cleanupInterval) {
      clearInterval(this.csrfTokens.cleanupInterval);
      this.csrfTokens.cleanupInterval = null;
    }
    this.cspCache.clear();
    this.csrfTokens.tokens.clear();
  }
}

// Middleware factory
export const createEnhancedXSSCSRFProtection = (config: Partial<XSSCSRFConfig> = {}) => {
  const protection = new EnhancedXSSCSRFProtection(config);

  return {
    // Main middleware
    middleware: (req: Request, res: Response, next: NextFunction) => {
      if (!protection.config.enabled) {
        return next();
      }

      try {
        // Generate security headers
        const securityHeaders = protection.generateSecurityHeaders(req);
        Object.entries(securityHeaders).forEach(([key, value]) => {
          res.setHeader(key, value);
        });

        // Store protection instance in request
        (req as any).xssCsrfProtection = protection;

        next();
      } catch (error) {
        console.error('XSS/CSRF protection error:', error);
        res.status(500).json({ error: 'Security processing error' });
      }
    },

    // CSRF token generation middleware
    generateCSRFToken: (req: Request, res: Response, next: NextFunction) => {
      const sessionId = (req as any).session?.id || crypto.randomUUID();
      const userId = (req as any).user?.id;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const token = protection.generateCSRFToken(sessionId, userId, ipAddress, userAgent);
      
      // Store token in session
      if ((req as any).session) {
        (req as any).session.csrfToken = token;
      }

      // Make token available to views
      res.locals.csrfToken = token;
      res.locals.csrfTokenName = 'csrf_token';

      next();
    },

    // CSRF validation middleware
    validateCSRFToken: (req: Request, res: Response, next: NextFunction) => {
      // Skip CSRF validation for safe methods
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      const token = req.headers['x-csrf-token'] || 
                   req.body.csrf_token || 
                   req.query.csrf_token;

      if (!token) {
        return res.status(403).json({ 
          error: 'CSRF token missing',
          code: 'CSRF_MISSING'
        });
      }

      const sessionId = (req as any).session?.id;
      const ipAddress = req.ip;
      const userAgent = req.headers['user-agent'];

      const validation = protection.validateCSRFToken(token, sessionId, ipAddress, userAgent);

      if (!validation.valid) {
        return res.status(403).json({ 
          error: 'CSRF token validation failed',
          code: 'CSRF_INVALID',
          reason: validation.reason
        });
      }

      next();
    },

    // XSS detection middleware
    detectXSS: (req: Request, res: Response, next: NextFunction) => {
      const content = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
      const detection = protection.detectXSS(content);

      if (detection.detected) {
        console.warn('🚨 XSS attempt detected:', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          threats: detection.threats,
          riskScore: detection.riskScore
        });

        return res.status(400).json({
          error: 'Malicious content detected',
          code: 'XSS_DETECTED',
          threats: detection.threats.map(t => ({
            description: t.description,
            severity: t.severity
          }))
        });
      }

      next();
    },

    // CSP report handler
    handleCSPReport: (req: Request, res: Response) => {
      try {
        const report = req.body;
        console.warn('📄 CSP Violation Report:', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          report: report
        });

        res.status(204).send();
      } catch (error) {
        console.error('Error processing CSP report:', error);
        res.status(400).json({ error: 'Invalid report format' });
      }
    },

    // Get protection instance
    getProtection: () => protection
  };
};

// Export default configuration
export const enhancedXSSCSRFProtection = createEnhancedXSSCSRFProtection();

export default EnhancedXSSCSRFProtection;