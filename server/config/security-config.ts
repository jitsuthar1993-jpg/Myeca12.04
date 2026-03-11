// Comprehensive Security Configuration for SmartTaxCalculator
import { config } from 'dotenv';
config();

// Security Configuration
export const securityConfig = {
  // JWT Configuration
  jwt: {
    primarySecret: process.env.JWT_PRIMARY_SECRET || 'your-super-secret-jwt-primary-key-minimum-32-characters',
    secondarySecret: process.env.JWT_SECONDARY_SECRET || 'your-super-secret-jwt-secondary-key-minimum-32-characters',
    algorithm: 'HS256' as const,
    issuer: 'SmartTaxCalculator',
    audience: 'tax-calculator-users',
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '7d',
    rotationInterval: 24 * 60 * 60 * 1000, // 24 hours
    maxAge: 15 * 60 * 1000 // 15 minutes
  },

  // Rate Limiting Configuration
  rateLimit: {
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many authentication attempts, please try again later'
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      max: 100, // 100 requests per minute
      message: 'Too many API requests, please slow down'
    },
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 uploads per hour
      message: 'Upload limit exceeded, please try again later'
    },
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200, // 200 requests per 15 minutes
      message: 'Too many requests, please slow down'
    }
  },

  // File Upload Configuration
  fileUpload: {
    enabled: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'],
    allowedMimeTypes: [
      'image/jpeg', 'image/png', 'image/gif', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv', 'text/plain'
    ],
    blockedExtensions: ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.zip', '.rar'],
    blockedMimeTypes: [
      'application/x-msdownload', 'application/x-exe', 'application/exe',
      'application/x-msdos-program', 'application/x-com', 'application/x-bat',
      'application/x-vbs', 'application/javascript', 'application/java-archive'
    ],
    scanForMalware: true,
    validateFileContent: true,
    checkMagicNumbers: true,
    maxFilenameLength: 255,
    sanitizeFilenames: true,
    generateSafeFilenames: true,
    uploadDirectory: './uploads',
    quarantineDirectory: './quarantine',
    virusScanEnabled: false,
    clamavEnabled: false,
    maxFilesPerRequest: 5,
    requireAuthentication: true,
    rateLimitEnabled: true
  },

  // Security Headers Configuration
  securityHeaders: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
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
  },

  // XSS Protection Configuration
  xssProtection: {
    enabled: true,
    sanitizeInput: true,
    sanitizeOutput: true,
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br', 'span', 'div', 'ul', 'ol', 'li'],
    allowedAttributes: ['class', 'id', 'title'],
    blockedProtocols: ['javascript:', 'vbscript:', 'data:'],
    maxInputLength: 10000,
    stripDangerousTags: true,
    escapeHtml: false
  },

  // CSRF Protection Configuration
  csrfProtection: {
    enabled: true,
    secretLength: 32,
    tokenLength: 32,
    cookieName: 'csrf_token',
    cookieOptions: {
      httpOnly: true,
      secure: true,
      sameSite: 'strict' as const,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    headerName: 'x-csrf-token',
    fieldName: 'csrf_token',
    doubleSubmitCookie: true,
    rotateTokens: true,
    tokenExpiration: 24 * 60 * 60 * 1000 // 24 hours
  },

  // SQL Injection Prevention Configuration
  sqlInjectionPrevention: {
    enabled: true,
    strictMode: false,
    maxQueryLength: 1000,
    allowedKeywords: [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'JOIN',
      'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'AS', 'AND', 'OR',
      'NOT', 'IN', 'EXISTS', 'BETWEEN', 'LIKE', 'IS', 'NULL',
      'ORDER', 'BY', 'GROUP', 'HAVING', 'LIMIT', 'OFFSET',
      'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'DISTINCT'
    ],
    whitelist: []
  },

  // Input Validation Configuration
  inputValidation: {
    maxLengths: {
      email: 254,
      password: 128,
      username: 30,
      name: 100,
      phone: 20,
      address: 500,
      city: 50,
      state: 50,
      country: 50,
      pincode: 10,
      pan: 10,
      aadhaar: 14,
      bankAccount: 18,
      ifsc: 11,
      gst: 15,
      url: 2048,
      filename: 255,
      description: 1000,
      message: 2000
    }
  },

  // Security Audit Configuration
  securityAudit: {
    enabled: true,
    maxEvents: 10000,
    retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
    enableExternalLogging: true,
    alertThresholds: {
      authentication_failure: 5,
      brute_force_attempt: 3,
      threat_detected: 1,
      xss_attack: 1,
      sql_injection: 1,
      privilege_escalation: 1,
      session_hijacking: 1
    }
  },

  // Threat Detection Configuration
  threatDetection: {
    enabled: true,
    sensitivity: 'medium' as const,
    patterns: {
      sqlInjection: true,
      xss: true,
      directoryTraversal: true,
      commandInjection: true,
      pathTraversal: true
    },
    thresholds: {
      suspiciousRequests: 10,
      maliciousRequests: 3,
      blockDuration: 30 * 60 * 1000 // 30 minutes
    },
    ipReputation: {
      enabled: true,
      minScore: 70,
      blockDuration: 60 * 60 * 1000 // 1 hour
    },
    userBehavior: {
      enabled: true,
      baselineRequests: 100,
      anomalyThreshold: 2.0
    },
    geographic: {
      enabled: true,
      allowedCountries: ['IN', 'US', 'UK', 'CA', 'AU'],
      blockedCountries: []
    },
    deviceFingerprint: {
      enabled: true,
      required: false
    }
  },

  // Incident Response Configuration
  incidentResponse: {
    enabled: true,
    escalationMatrix: [
      {
        level: 1,
        name: 'Security Team',
        contacts: ['security-team@taxcalculator.com'],
        responseTime: 30 * 60 * 1000, // 30 minutes
        escalationCriteria: ['severity >= medium', 'no response within 30 minutes']
      },
      {
        level: 2,
        name: 'Security Manager',
        contacts: ['security-manager@taxcalculator.com'],
        responseTime: 15 * 60 * 1000, // 15 minutes
        escalationCriteria: ['severity >= high', 'no response within 15 minutes']
      },
      {
        level: 3,
        name: 'CISO',
        contacts: ['ciso@taxcalculator.com'],
        responseTime: 10 * 60 * 1000, // 10 minutes
        escalationCriteria: ['severity >= critical', 'no response within 10 minutes']
      },
      {
        level: 4,
        name: 'Executive Team',
        contacts: ['executives@taxcalculator.com'],
        responseTime: 5 * 60 * 1000, // 5 minutes
        escalationCriteria: ['severity = emergency', 'no response within 5 minutes']
      }
    ],
    notificationChannels: [
      {
        type: 'email' as const,
        config: {
          smtp: {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS
            }
          }
        },
        enabled: true
      },
      {
        type: 'slack' as const,
        config: {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channel: '#security-alerts'
        },
        enabled: !!process.env.SLACK_WEBHOOK_URL
      }
    ]
  },

  // Security Testing Configuration
  securityTesting: {
    enabled: process.env.NODE_ENV !== 'production',
    timeout: 30000,
    maxRedirects: 5,
    userAgent: 'SmartTaxCalculator-SecurityTest/1.0',
    followRedirects: true,
    validateSSL: true,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },

  // Environment-specific configurations
  development: {
    securityHeaders: {
      strictTransportSecurity: {
        maxAge: 0, // Disable HSTS in development
        includeSubDomains: false,
        preload: false
      }
    },
    rateLimit: {
      auth: { max: 100 }, // Higher limits in development
      api: { max: 1000 },
      upload: { max: 50 },
      general: { max: 1000 }
    }
  },

  production: {
    securityHeaders: {
      strictTransportSecurity: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      }
    },
    rateLimit: {
      auth: { max: 5 }, // Strict limits in production
      api: { max: 100 },
      upload: { max: 10 },
      general: { max: 200 }
    }
  }
};

// Helper function to get environment-specific config
export const getSecurityConfig = (environment: string = process.env.NODE_ENV || 'development') => {
  const baseConfig = { ...securityConfig };
  const envConfig = securityConfig[environment as keyof typeof securityConfig];
  
  if (envConfig) {
    return {
      ...baseConfig,
      ...envConfig
    };
  }
  
  return baseConfig;
};

// Security utilities
export const securityUtils = {
  // Generate secure random strings
  generateSecureToken: (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Hash sensitive data
  hashSensitiveData: (data: string, salt?: string): string => {
    const saltValue = salt || crypto.randomBytes(16).toString('hex');
    return crypto.pbkdf2Sync(data, saltValue, 100000, 64, 'sha512').toString('hex');
  },

  // Validate IP address
  isValidIP: (ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  },

  // Sanitize filename
  sanitizeFilename: (filename: string): string => {
    return filename
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .replace(/\.+/g, '.')
      .replace(/^\.+|\.+$/g, '')
      .toLowerCase()
      .substring(0, 255);
  },

  // Generate safe filename
  generateSafeFilename: (originalFilename: string): string => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const sanitized = securityUtils.sanitizeFilename(originalFilename);
    const nameWithoutExt = sanitized.split('.')[0];
    const extension = sanitized.split('.').pop();
    
    return `${nameWithoutExt}_${timestamp}_${randomString}.${extension}`;
  },

  // Check if string contains SQL injection patterns
  containsSQLInjection: (input: string): boolean => {
    const sqlPatterns = [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|cast|convert)\b)/i,
      /(--|\/\*|\*\/)/,
      /(\b(or|and)\b.*=.*)/i,
      /(\bunion\b.*\bselect\b)/i,
      /(;.*drop\s+table)/i,
      /(xp_|sp_)/i,
      /(0x[0-9a-fA-F]+)/,
      /(@@version|@@servername|database()|user()|current_user)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  },

  // Check if string contains XSS patterns
  containsXSS: (input: string): boolean => {
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
  },

  // Validate email format
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Validate password strength
  isStrongPassword: (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,128}$/;
    return passwordRegex.test(password) && password.length >= 12 && password.length <= 128;
  },

  // Mask sensitive data
  maskSensitiveData: (data: string, visibleChars: number = 4): string => {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }
    
    const maskedPart = '*'.repeat(data.length - visibleChars);
    const visiblePart = data.slice(-visibleChars);
    
    return maskedPart + visiblePart;
  }
};

// Import crypto for utility functions
import crypto from 'crypto';

export default securityConfig;