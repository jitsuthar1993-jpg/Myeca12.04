import { Request, Response, NextFunction } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { securityConfig } from '../config/security';
import { securityAudit } from '../services/security-audit';
import { threatIntelligence } from '../services/threat-intelligence';
import { incidentResponse } from '../services/incident-response';
import { securityTesting } from '../services/security-testing';
import { createEnhancedJWTSecurity } from './enhanced-jwt';
import { createEnhancedXSSCSRFProtection } from './enhanced-xss-csrf';
import { createSQLInjectionPrevention } from './sql-injection-prevention';
import { fileUploadSecurity } from './file-upload-security';

// Comprehensive Security Middleware Configuration
interface ComprehensiveSecurityConfig {
  enabled: boolean;
  mode: 'strict' | 'balanced' | 'permissive';
  features: {
    rateLimiting: boolean;
    threatIntelligence: boolean;
    behavioralAnalysis: boolean;
    anomalyDetection: boolean;
    realTimeMonitoring: boolean;
    incidentResponse: boolean;
    securityTesting: boolean;
  };
  thresholds: {
    riskScore: number;
    anomalyScore: number;
    threatConfidence: number;
    behavioralAnomaly: number;
  };
  bypassConditions: {
    trustedIps: string[];
    trustedUserAgents: string[];
    trustedReferrers: string[];
    internalRequests: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    includeHeaders: boolean;
    includeBody: boolean;
    includeResponse: boolean;
    anonymizeData: boolean;
  };
}

// Security Context for Request
interface SecurityContext {
  requestId: string;
  sessionId: string;
  deviceId: string;
  userId?: number;
  ipAddress: string;
  userAgent: string;
  referrer?: string;
  riskScore: number;
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  anomalies: string[];
  threatIndicators: string[];
  behavioralScore: number;
  geographicInfo?: any;
  deviceFingerprint?: any;
  securityActions: string[];
  startTime: number;
}

// Comprehensive Security Manager
class ComprehensiveSecurityManager {
  private config: ComprehensiveSecurityConfig;
  private jwtSecurity: any;
  private xssCsrfProtection: any;
  private sqlInjectionPrevention: any;
  private rateLimiters: Map<string, any>;
  private securityContexts: Map<string, SecurityContext>;
  private threatCache: Map<string, any>;
  private anomalyCache: Map<string, any>;
  private isInitialized: boolean = false;

  constructor(config: ComprehensiveSecurityConfig) {
    this.config = config;
    this.rateLimiters = new Map();
    this.securityContexts = new Map();
    this.threatCache = new Map();
    this.anomalyCache = new Map();
    this.initializeSecurityComponents();
  }

  // Initialize all security components
  private initializeSecurityComponents(): void {
    try {
      // Initialize JWT security
      this.jwtSecurity = createEnhancedJWTSecurity({
        primarySecret: securityConfig.jwt.secret,
        secondarySecret: securityConfig.jwt.secret + '_backup',
        algorithm: 'HS256',
        issuer: securityConfig.jwt.issuer,
        audience: securityConfig.jwt.audience,
        accessTokenExpiry: securityConfig.jwt.expiresIn,
        refreshTokenExpiry: securityConfig.jwt.refreshExpiresIn,
        rotationInterval: 3600000 // 1 hour
      });

      // Initialize XSS/CSRF protection
      this.xssCsrfProtection = createEnhancedXSSCSRFProtection({
        enabled: true,
        cspEnabled: true,
        nonceEnabled: true,
        trustedDomains: securityConfig.cors.origin,
        reportUri: '/api/security/csp-report'
      });

      // Initialize SQL injection prevention
      this.sqlInjectionPrevention = createSQLInjectionPrevention();

      // Initialize rate limiters
      this.initializeRateLimiters();

      this.isInitialized = true;
      console.log('🛡️ Comprehensive Security Manager initialized');
    } catch (error) {
      console.error('❌ Failed to initialize security components:', error);
      throw error;
    }
  }

  // Initialize rate limiters for different endpoints
  private initializeRateLimiters(): void {
    // API rate limiter
    const apiLimiter = rateLimit({
      windowMs: securityConfig.rateLimit.windowMs,
      max: securityConfig.rateLimit.maxRequests,
      message: {
        error: 'Too many requests from this IP',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req, res) => {
        this.logSecurityEvent('rate_limit_exceeded', req, {
          limit: securityConfig.rateLimit.maxRequests,
          windowMs: securityConfig.rateLimit.windowMs
        });
        res.status(429).json({
          error: 'Too many requests from this IP',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: '15 minutes'
        });
      }
    });

    // Authentication rate limiter
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5,
      message: {
        error: 'Too many authentication attempts',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      skipSuccessfulRequests: false,
      handler: (req, res) => {
        this.logSecurityEvent('auth_rate_limit_exceeded', req, {
          limit: 5,
          windowMs: 15 * 60 * 1000
        });
        res.status(429).json({
          error: 'Too many authentication attempts',
          code: 'AUTH_RATE_LIMIT_EXCEEDED',
          retryAfter: '15 minutes'
        });
      }
    });

    this.rateLimiters.set('api', apiLimiter);
    this.rateLimiters.set('auth', authLimiter);
  }

  // Main security middleware
  public securityMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      if (!this.config.enabled) {
        return next();
      }

      const startTime = Date.now();
      const requestId = this.generateRequestId();
      
      try {
        // Create security context
        const securityContext = await this.createSecurityContext(req, requestId, startTime);
        
        // Store context in request
        (req as any).securityContext = securityContext;
        (req as any).requestId = requestId;

        // Check bypass conditions
        if (await this.shouldBypassSecurity(req, securityContext)) {
          return next();
        }

        // Execute security checks in sequence
        await this.executeSecurityChecks(req, res, securityContext);

        // Set security headers
        this.setSecurityHeaders(res, securityContext);

        // Log successful security check
        this.logSecurityEvent('security_check_passed', req, {
          riskScore: securityContext.riskScore,
          threatLevel: securityContext.threatLevel,
          executionTime: Date.now() - startTime
        });

        next();
      } catch (error) {
        await this.handleSecurityError(error, req, res, requestId);
      }
    };
  }

  // Create security context
  private async createSecurityContext(req: Request, requestId: string, startTime: number): Promise<SecurityContext> {
    const ipAddress = this.getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const sessionId = (req as any).session?.id || this.generateSessionId();
    const deviceId = this.generateDeviceId(req);

    const context: SecurityContext = {
      requestId,
      sessionId,
      deviceId,
      ipAddress,
      userAgent,
      referrer: req.headers.referer as string,
      riskScore: 0,
      threatLevel: 'safe',
      anomalies: [],
      threatIndicators: [],
      behavioralScore: 0,
      securityActions: [],
      startTime
    };

    // Gather threat intelligence
    if (this.config.features.threatIntelligence) {
      try {
        const threatIntel = await threatIntelligence.getIPReputation(ipAddress);
        context.riskScore += threatIntel.riskScore;
        context.threatLevel = this.calculateThreatLevel(context.riskScore);
        context.threatIndicators = threatIntel.categories;
        context.geographicInfo = threatIntel.geographicInfo;
      } catch (error) {
        console.warn('Failed to gather threat intelligence:', error);
      }
    }

    // Analyze behavior
    if (this.config.features.behavioralAnalysis) {
      try {
        const behavioralProfile = await threatIntelligence.analyzeBehavior(ipAddress);
        context.behavioralScore = behavioralProfile.patterns.botScore;
        context.anomalies = this.getBehavioralAnomalies(behavioralProfile);
        context.riskScore += behavioralProfile.riskScore;
      } catch (error) {
        console.warn('Failed to analyze behavior:', error);
      }
    }

    return context;
  }

  // Check if security should be bypassed
  private async shouldBypassSecurity(req: Request, context: SecurityContext): Promise<boolean> {
    const { bypassConditions } = this.config;

    // Check trusted IPs
    if (bypassConditions.trustedIps.includes(context.ipAddress)) {
      return true;
    }

    // Check trusted user agents
    if (bypassConditions.trustedUserAgents.some(ua => context.userAgent.includes(ua))) {
      return true;
    }

    // Check trusted referrers
    if (context.referrer && bypassConditions.trustedReferrers.some(ref => context.referrer!.includes(ref))) {
      return true;
    }

    // Check internal requests
    if (bypassConditions.internalRequests && this.isInternalRequest(req)) {
      return true;
    }

    return false;
  }

  // Execute comprehensive security checks
  private async executeSecurityChecks(req: Request, res: Response, context: SecurityContext): Promise<void> {
    const checks = [
      { name: 'rate_limiting', check: () => this.checkRateLimit(req, res, context) },
      { name: 'threat_intelligence', check: () => this.checkThreatIntelligence(req, context) },
      { name: 'anomaly_detection', check: () => this.checkAnomalies(req, context) },
      { name: 'input_validation', check: () => this.validateInput(req, context) },
      { name: 'authentication', check: () => this.checkAuthentication(req, context) },
      { name: 'authorization', check: () => this.checkAuthorization(req, context) }
    ];

    for (const check of checks) {
      try {
        await check.check();
      } catch (error) {
        console.error(`Security check failed: ${check.name}`, error);
        
        // Create incident for critical failures
        if (this.config.features.incidentResponse && context.riskScore > 70) {
          incidentResponse.queueIncident({
            title: `Security Check Failed: ${check.name}`,
            description: `Security check ${check.name} failed for request ${context.requestId}`,
            type: 'security_rule_violation',
            severity: context.riskScore > 80 ? 'critical' : 'high',
            threatActors: {
              ipAddresses: [context.ipAddress],
              userAgents: [context.userAgent],
              sessionIds: [context.sessionId],
              deviceIds: [context.deviceId]
            },
            metadata: {
              failedCheck: check.name,
              riskScore: context.riskScore,
              requestUrl: req.url,
              requestMethod: req.method
            }
          });
        }

        throw error;
      }
    }
  }

  // Individual security checks
  private async checkRateLimit(req: Request, res: Response, context: SecurityContext): Promise<void> {
    const limiterType = req.path.startsWith('/auth') ? 'auth' : 'api';
    const limiter = this.rateLimiters.get(limiterType);
    
    if (limiter) {
      // The rate limiter middleware will handle the response
      return new Promise((resolve, reject) => {
        limiter(req, res, (error?: any) => {
          if (error) {
            context.securityActions.push('rate_limited');
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
  }

  private async checkThreatIntelligence(req: Request, context: SecurityContext): Promise<void> {
    if (context.riskScore >= this.config.thresholds.riskScore) {
      context.securityActions.push('threat_detected');
      
      if (context.riskScore >= 80) {
        throw new Error('High-risk IP address detected');
      }
    }
  }

  private async checkAnomalies(req: Request, context: SecurityContext): Promise<void> {
    if (context.anomalies.length > 0 && context.behavioralScore > this.config.thresholds.behavioralAnomaly) {
      context.securityActions.push('behavioral_anomaly');
      
      if (context.behavioralScore >= 80) {
        throw new Error('Behavioral anomaly detected');
      }
    }
  }

  private async validateInput(req: Request, context: SecurityContext): Promise<void> {
    // XSS detection
    const xssResult = this.xssCsrfProtection.getProtection().detectXSS(
      JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params)
    );

    if (xssResult.detected) {
      context.securityActions.push('xss_blocked');
      context.threatIndicators.push(...xssResult.threats.map(t => t.description));
      
      throw new Error('XSS attempt detected');
    }

    // SQL injection detection
    const sqlResult = this.sqlInjectionPrevention.getService().analyzeQuery(
      JSON.stringify(req.body) + JSON.stringify(req.query)
    );

    if (!sqlResult.isSafe) {
      context.securityActions.push('sql_injection_blocked');
      context.threatIndicators.push(...sqlResult.threats.map(t => t.description));
      
      throw new Error('SQL injection attempt detected');
    }
  }

  private async checkAuthentication(req: Request, context: SecurityContext): Promise<void> {
    // Authentication checks would be implemented here
    // This is a placeholder for JWT validation, session checks, etc.
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const payload = await this.jwtSecurity.verifyToken(token);
        context.userId = payload.userId;
      } catch (error) {
        context.securityActions.push('auth_failed');
        throw new Error('Authentication failed');
      }
    }
  }

  private async checkAuthorization(req: Request, context: SecurityContext): Promise<void> {
    // Authorization checks would be implemented here
    // This would check user permissions for the requested resource
    if (context.userId && req.path.startsWith('/admin')) {
      // Check if user has admin permissions
      const hasAdminAccess = await this.checkAdminAccess(context.userId);
      if (!hasAdminAccess) {
        context.securityActions.push('authorization_denied');
        throw new Error('Insufficient permissions');
      }
    }
  }

  // Helper methods
  private generateRequestId(): string {
    return `req-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
  }

  private generateSessionId(): string {
    return crypto.randomUUID();
  }

  private generateDeviceId(req: Request): string {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    const deviceString = `${userAgent}|${acceptLanguage}|${acceptEncoding}`;
    return crypto.createHash('sha256').update(deviceString).digest('hex').substring(0, 16);
  }

  private getClientIP(req: Request): string {
    return req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection as any).socket?.remoteAddress ||
           'unknown';
  }

  private isInternalRequest(req: Request): boolean {
    const ip = this.getClientIP(req);
    return ip.startsWith('10.') || ip.startsWith('172.') || ip.startsWith('192.168.');
  }

  private calculateThreatLevel(riskScore: number): SecurityContext['threatLevel'] {
    if (riskScore >= 80) return 'critical';
    if (riskScore >= 60) return 'high';
    if (riskScore >= 40) return 'medium';
    if (riskScore >= 20) return 'low';
    return 'safe';
  }

  private getBehavioralAnomalies(profile: any): string[] {
    const anomalies: string[] = [];
    
    if (profile.anomalies?.geographicAnomaly) anomalies.push('geographic_anomaly');
    if (profile.anomalies?.timeAnomaly) anomalies.push('time_anomaly');
    if (profile.anomalies?.behavioralAnomaly) anomalies.push('behavioral_anomaly');
    if (profile.anomalies?.deviceAnomaly) anomalies.push('device_anomaly');
    if (profile.anomalies?.frequencyAnomaly) anomalies.push('frequency_anomaly');
    
    return anomalies;
  }

  private async checkAdminAccess(userId: number): Promise<boolean> {
    // Implementation would check user roles/permissions
    return true; // Placeholder
  }

  private setSecurityHeaders(res: Response, context: SecurityContext): void {
    // Set security headers based on threat level
    const headers = this.xssCsrfProtection.getProtection().generateSecurityHeaders({} as Request);
    
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Add custom security headers
    res.setHeader('X-Request-ID', context.requestId);
    res.setHeader('X-Security-Level', context.threatLevel);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }

  private logSecurityEvent(eventType: string, req: Request, metadata: any): void {
    if (this.config.logging.level === 'debug' || 
        (this.config.logging.level === 'info' && !eventType.includes('passed'))) {
      
      const context = (req as any).securityContext;
      
      securityAudit.recordEvent({
        type: eventType as any,
        severity: eventType.includes('failed') || eventType.includes('blocked') ? 'high' : 'medium',
        userId: context?.userId,
        sessionId: context?.sessionId,
        deviceId: context?.deviceId,
        ipAddress: context?.ipAddress || this.getClientIP(req),
        userAgent: context?.userAgent || req.headers['user-agent'] || 'unknown',
        requestMethod: req.method,
        requestUrl: req.url,
        requestHeaders: this.config.logging.includeHeaders ? req.headers : {},
        requestBody: this.config.logging.includeBody ? req.body : undefined,
        riskScore: context?.riskScore || 0,
        threatIndicators: context?.threatIndicators || [],
        mitigationActions: context?.securityActions || [],
        metadata
      });
    }
  }

  private async handleSecurityError(error: any, req: Request, res: Response, requestId: string): Promise<void> {
    console.error('Security error:', error);

    const context = (req as any).securityContext;
    
    // Log security error
    this.logSecurityEvent('security_error', req, {
      error: error.message,
      stack: error.stack,
      requestId
    });

    // Create incident for critical errors
    if (this.config.features.incidentResponse && context?.riskScore > 60) {
      incidentResponse.queueIncident({
        title: 'Security System Error',
        description: `Security system error: ${error.message}`,
        type: 'security_rule_violation',
        severity: 'high',
        threatActors: {
          ipAddresses: [context?.ipAddress || 'unknown'],
          userAgents: [context?.userAgent || 'unknown']
        },
        metadata: {
          error: error.message,
          requestId,
          riskScore: context?.riskScore || 0
        }
      });
    }

    // Send appropriate response
    if (error.message.includes('XSS') || error.message.includes('SQL injection')) {
      res.status(400).json({
        error: 'Malicious content detected',
        code: 'MALICIOUS_CONTENT',
        requestId
      });
    } else if (error.message.includes('threat') || error.message.includes('anomaly')) {
      res.status(403).json({
        error: 'Security threat detected',
        code: 'SECURITY_THREAT',
        requestId
      });
    } else if (error.message.includes('authentication')) {
      res.status(401).json({
        error: 'Authentication failed',
        code: 'AUTH_FAILED',
        requestId
      });
    } else {
      res.status(500).json({
        error: 'Security processing error',
        code: 'SECURITY_ERROR',
        requestId
      });
    }
  }

  // Get security statistics
  public getSecurityStats(): any {
    return {
      activeContexts: this.securityContexts.size,
      threatCacheSize: this.threatCache.size,
      anomalyCacheSize: this.anomalyCache.size,
      initialized: this.isInitialized,
      config: this.config
    };
  }

  // Cleanup resources
  public cleanup(): void {
    this.securityContexts.clear();
    this.threatCache.clear();
    this.anomalyCache.clear();
    
    if (this.jwtSecurity?.cleanup) {
      this.jwtSecurity.cleanup();
    }
    
    if (this.xssCsrfProtection?.getProtection()?.cleanup) {
      this.xssCsrfProtection.getProtection().cleanup();
    }
    
    if (this.sqlInjectionPrevention?.getService()?.clearCache) {
      this.sqlInjectionPrevention.getService().clearCache();
    }
  }
}

// Create comprehensive security middleware
export const createComprehensiveSecurity = (config: Partial<ComprehensiveSecurityConfig> = {}) => {
  const defaultConfig: ComprehensiveSecurityConfig = {
    enabled: true,
    mode: 'balanced',
    features: {
      rateLimiting: true,
      threatIntelligence: true,
      behavioralAnalysis: true,
      anomalyDetection: true,
      realTimeMonitoring: true,
      incidentResponse: true,
      securityTesting: true
    },
    thresholds: {
      riskScore: 60,
      anomalyScore: 70,
      threatConfidence: 75,
      behavioralAnomaly: 80
    },
    bypassConditions: {
      trustedIps: ['127.0.0.1', '::1'],
      trustedUserAgents: ['HealthChecker', 'Monitoring'],
      trustedReferrers: ['https://myeca.in'],
      internalRequests: true
    },
    logging: {
      level: 'info',
      includeHeaders: false,
      includeBody: false,
      includeResponse: false,
      anonymizeData: true
    }
  };

  const mergedConfig = { ...defaultConfig, ...config };
  const securityManager = new ComprehensiveSecurityManager(mergedConfig);

  return {
    // Main security middleware
    middleware: securityManager.securityMiddleware(),

    // Individual component middleware
    jwtMiddleware: securityManager.jwtSecurity,
    xssCsrfMiddleware: securityManager.xssCsrfProtection.middleware,
    sqlInjectionMiddleware: securityManager.sqlInjectionPrevention.middleware,
    
    // Rate limiter middleware
    rateLimitMiddleware: (type: 'api' | 'auth' = 'api') => {
      return securityManager.rateLimiters.get(type);
    },

    // Security utilities
    generateCSRFToken: (req: Request) => {
      return securityManager.xssCsrfProtection.getProtection().generateCSRFToken(
        (req as any).session?.id || crypto.randomUUID(),
        (req as any).user?.id
      );
    },

    validateCSRFToken: (token: string, sessionId: string) => {
      return securityManager.xssCsrfProtection.getProtection().validateCSRFToken(token, sessionId);
    },

    getSecurityContext: (req: Request) => {
      return (req as any).securityContext;
    },

    // Security testing
    runSecurityTest: (testType: string) => {
      return securityTesting.runTestSuite(testType);
    },

    // Statistics
    getStats: () => {
      return securityManager.getSecurityStats();
    },

    // Cleanup
    cleanup: () => {
      securityManager.cleanup();
    }
  };
};

// Export default comprehensive security instance
export const comprehensiveSecurity = createComprehensiveSecurity();

export default ComprehensiveSecurityManager;