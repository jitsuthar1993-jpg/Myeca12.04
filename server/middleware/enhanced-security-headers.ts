// @ts-nocheck
// Enhanced Security Headers and HTTPS Enforcement
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Enhanced security headers configuration
interface SecurityHeadersConfig {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: string[];
      scriptSrc: string[];
      styleSrc: string[];
      imgSrc: string[];
      connectSrc: string[];
      fontSrc: string[];
      objectSrc: string[];
      mediaSrc: string[];
      frameSrc: string[];
      childSrc: string[];
      workerSrc: string[];
      manifestSrc: string[];
      baseUri: string[];
      formAction: string[];
      frameAncestors: string[];
      upgradeInsecureRequests: boolean[];
    };
    reportUri?: string;
    reportTo?: string;
  };
  strictTransportSecurity: {
    maxAge: number;
    includeSubDomains: boolean;
    preload: boolean;
  };
  referrerPolicy: {
    policy: string;
  };
  permissionsPolicy: {
    features: {
      [key: string]: string[];
    };
  };
  crossOriginEmbedderPolicy: boolean;
  crossOriginOpenerPolicy: {
    policy: string;
  };
  crossOriginResourcePolicy: {
    policy: string;
  };
  originAgentCluster: boolean;
  xContentTypeOptions: string;
  xDnsPrefetchControl: string;
  xDownloadOptions: string;
  xFrameOptions: string;
  xPermittedCrossDomainPolicies: string;
  xXssProtection: boolean;
}

// Default security headers configuration
const defaultSecurityConfig: SecurityHeadersConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // Required for some React functionality
        "https://cdnjs.cloudflare.com",
        "https://fonts.googleapis.com",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://js.stripe.com",
        "https://checkout.stripe.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        "https://cdnjs.cloudflare.com",
        "https://unpkg.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://www.google.com",
        "https://www.gstatic.com",
        "https://fonts.gstatic.com",
        "https://via.placeholder.com",
        "https://trae-api-sg.mchost.guru"
      ],
      connectSrc: [
        "'self'",
        "https://api.tax-calculator.com",
        "https://www.google-analytics.com",
        "https://js.stripe.com",
        "https://api.stripe.com",
        "https://checkout.stripe.com",
        "https://api.supabase.io",
        "https://*.supabase.co",
        "wss://*.supabase.co"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "data:"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: [
        "'self'",
        "https://js.stripe.com",
        "https://checkout.stripe.com",
        "https://www.google.com"
      ],
      childSrc: ["'none'"],
      workerSrc: ["'self'", "blob:"],
      manifestSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'", "https://checkout.stripe.com"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: []
    },
    reportUri: '/api/security/csp-report',
    reportTo: 'csp-endpoint'
  },
  strictTransportSecurity: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  permissionsPolicy: {
    features: {
      'geolocation': ["'self'"],
      'camera': ["'none'"],
      'microphone': ["'none'"],
      'payment': ["'self'", "https://js.stripe.com"],
      'usb': ["'none'"],
      'fullscreen': ["'self'"],
      'payment': ["'self'", "https://js.stripe.com"],
      'sync-xhr': ["'self'"],
      'accelerometer': ["'none'"],
      'gyroscope': ["'none'"],
      'magnetometer': ["'none'"],
      'notifications': ["'self'"],
      'push': ["'self'"],
      'speaker': ["'self'"],
      'vibrate': ["'self'"],
      'web-share': ["'self'"]
    }
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: {
    policy: 'same-origin-allow-popups'
  },
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  },
  originAgentCluster: true,
  xContentTypeOptions: 'nosniff',
  xDnsPrefetchControl: 'off',
  xDownloadOptions: 'noopen',
  xFrameOptions: 'DENY',
  xPermittedCrossDomainPolicies: 'none',
  xXssProtection: true
};

// Enhanced security headers middleware
export const enhancedSecurityHeaders = (config: Partial<SecurityHeadersConfig> = {}) => {
  const mergedConfig = { ...defaultSecurityConfig, ...config };

  return [
    // Content Security Policy
    helmet.contentSecurityPolicy({
      directives: mergedConfig.contentSecurityPolicy.directives,
      reportUri: mergedConfig.contentSecurityPolicy.reportUri,
      reportTo: mergedConfig.contentSecurityPolicy.reportTo
    }),

    // Strict Transport Security (HSTS)
    helmet.hsts({
      maxAge: mergedConfig.strictTransportSecurity.maxAge,
      includeSubDomains: mergedConfig.strictTransportSecurity.includeSubDomains,
      preload: mergedConfig.strictTransportSecurity.preload
    }),

    // Referrer Policy
    helmet.referrerPolicy({
      policy: mergedConfig.referrerPolicy.policy as any
    }),

    // Permissions Policy
    helmet.permittedCrossDomainPolicies({
      permittedPolicies: mergedConfig.permissionsPolicy.features as any
    }),

    // Cross-Origin Policies
    helmet.crossOriginEmbedderPolicy(),
    helmet.crossOriginOpenerPolicy({
      policy: mergedConfig.crossOriginOpenerPolicy.policy as any
    }),
    helmet.crossOriginResourcePolicy({
      policy: mergedConfig.crossOriginResourcePolicy.policy as any
    }),

    // Origin-Agent-Cluster
    helmet.originAgentCluster(),

    // X-Content-Type-Options
    helmet.noSniff(),

    // X-DNS-Prefetch-Control
    helmet.dnsPrefetchControl({
      allow: false
    }),

    // X-Download-Options
    helmet.ieNoOpen(),

    // X-Frame-Options
    helmet.frameguard({
      action: 'deny'
    }),

    // X-Permitted-Cross-Domain-Policies
    helmet.permittedCrossDomainPolicies({
      permittedPolicies: 'none'
    }),

    // X-XSS-Protection
    helmet.xssFilter(),

    // Remove powered-by header
    helmet.hidePoweredBy(),

    // Custom security headers
    (req: Request, res: Response, next: NextFunction) => {
      // Report-To header for CSP reporting
      res.setHeader('Report-To', JSON.stringify({
        group: 'csp-endpoint',
        max_age: 10886400,
        endpoints: [{ url: mergedConfig.contentSecurityPolicy.reportUri }]
      }));

      // Critical-CH for user agent hints
      res.setHeader('Critical-CH', 'sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform');

      // Accept-CH for user agent hints
      res.setHeader('Accept-CH', 'sec-ch-ua, sec-ch-ua-mobile, sec-ch-ua-platform, sec-ch-ua-full-version-list');

      // Timing-Allow-Origin for performance monitoring
      res.setHeader('Timing-Allow-Origin', '*');

      // X-Content-Security-Policy for older browsers
      res.setHeader('X-Content-Security-Policy', "default-src 'self'");

      // X-WebKit-CSP for older Safari
      res.setHeader('X-WebKit-CSP', "default-src 'self'");

      next();
    }
  ];
};

// HTTPS Enforcement Middleware
export const httpsEnforcement = (options: {
  enabled: boolean;
  trustProxy: boolean;
  redirectCode: number;
  excludePaths?: string[];
} = {
  enabled: true,
  trustProxy: true,
  redirectCode: 301,
  excludePaths: ['/health', '/api/health']
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!options.enabled) {
      return next();
    }

    // Skip excluded paths
    if (options.excludePaths?.includes(req.path)) {
      return next();
    }

    // Check if request is secure
    const isSecure = options.trustProxy 
      ? (req.headers['x-forwarded-proto'] === 'https' || req.secure)
      : req.secure;

    if (!isSecure) {
      // Log HTTPS redirect for security audit
      console.log(`🔒 HTTPS redirect: ${req.method} ${req.url} from ${req.ip}`);
      
      // Redirect to HTTPS
      const httpsUrl = `https://${req.headers.host}${req.url}`;
      return res.redirect(options.redirectCode, httpsUrl);
    }

    // Add HSTS header for HTTPS requests
    if (isSecure) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    next();
  };
};

// Certificate Transparency Log Monitoring
export const certificateTransparency = (options: {
  enabled: boolean;
  logEndpoints: string[];
  domain: string;
} = {
  enabled: true,
  logEndpoints: [
    'https://ct.googleapis.com/logs/argon2023/',
    'https://oak.ct.letsencrypt.org/2023/'
  ],
  domain: process.env.DOMAIN || 'tax-calculator.com'
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!options.enabled) {
      return next();
    }

    try {
      // Monitor certificate transparency logs
      // This would typically be done via a background job, but we can add headers
      // to indicate CT monitoring is active
      
      res.setHeader('Expect-CT', 'enforce, max-age=86400, report-uri="/api/security/ct-report"');
      
      next();
    } catch (error) {
      console.error('Certificate transparency monitoring error:', error);
      next(); // Don't block requests on CT monitoring errors
    }
  };
};

// Security Headers Report Handler
export const securityHeadersReport = (req: Request, res: Response) => {
  try {
    const report = req.body;
    
    // Log CSP violations
    if (req.path === '/api/security/csp-report') {
      console.log('🚨 CSP Violation Report:', JSON.stringify(report, null, 2));
      
      // In production, send to security monitoring service
      // securityMonitoringService.logCSPViolation(report);
    }
    
    // Log CT reports
    if (req.path === '/api/security/ct-report') {
      console.log('📜 Certificate Transparency Report:', JSON.stringify(report, null, 2));
      
      // In production, send to certificate monitoring service
      // certificateMonitoringService.logCTReport(report);
    }
    
    res.status(204).send();
  } catch (error) {
    console.error('Security headers report error:', error);
    res.status(400).json({ error: 'Invalid report format' });
  }
};

// Security Policy Builder
export class SecurityPolicyBuilder {
  private config: Partial<SecurityHeadersConfig> = {};

  constructor() {
    this.config = { ...defaultSecurityConfig };
  }

  setContentSecurityPolicy(directives: any): SecurityPolicyBuilder {
    this.config.contentSecurityPolicy = {
      ...this.config.contentSecurityPolicy,
      directives: { ...this.config.contentSecurityPolicy?.directives, ...directives }
    };
    return this;
  }

  addScriptSrc(source: string): SecurityPolicyBuilder {
    if (!this.config.contentSecurityPolicy?.directives.scriptSrc) {
      this.config.contentSecurityPolicy!.directives.scriptSrc = [];
    }
    this.config.contentSecurityPolicy.directives.scriptSrc.push(source);
    return this;
  }

  addStyleSrc(source: string): SecurityPolicyBuilder {
    if (!this.config.contentSecurityPolicy?.directives.styleSrc) {
      this.config.contentSecurityPolicy!.directives.styleSrc = [];
    }
    this.config.contentSecurityPolicy.directives.styleSrc.push(source);
    return this;
  }

  addConnectSrc(source: string): SecurityPolicyBuilder {
    if (!this.config.contentSecurityPolicy?.directives.connectSrc) {
      this.config.contentSecurityPolicy!.directives.connectSrc = [];
    }
    this.config.contentSecurityPolicy.directives.connectSrc.push(source);
    return this;
  }

  setStrictTransportSecurity(maxAge: number, includeSubDomains: boolean = true, preload: boolean = true): SecurityPolicyBuilder {
    this.config.strictTransportSecurity = {
      maxAge,
      includeSubDomains,
      preload
    };
    return this;
  }

  setFrameOptions(option: 'DENY' | 'SAMEORIGIN' | string): SecurityPolicyBuilder {
    this.config.xFrameOptions = option;
    return this;
  }

  build(): Partial<SecurityHeadersConfig> {
    return this.config;
  }
}

// Security Headers Validator
export const validateSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  const requiredHeaders = [
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'content-security-policy'
  ];

  const missingHeaders = requiredHeaders.filter(header => 
    !res.getHeader(header) && !res.getHeader(header.toUpperCase())
  );

  if (missingHeaders.length > 0) {
    console.warn(`⚠️ Missing security headers: ${missingHeaders.join(', ')}`);
    
    // In production, this would alert security team
    // securityAlertService.sendAlert('missing_security_headers', {
    //   path: req.path,
    //   missingHeaders,
    //   timestamp: new Date().toISOString()
    // });
  }

  next();
};

// Export security policy builder instance
export const securityPolicyBuilder = new SecurityPolicyBuilder();
