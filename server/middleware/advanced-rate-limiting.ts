// Advanced Rate Limiting with IP Reputation and Threat Detection
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import crypto from 'crypto';

// IP Reputation Service
interface IPReputation {
  score: number; // 0-100, higher is worse
  threats: string[];
  lastSeen: number;
  requestCount: number;
  blockedUntil?: number;
  country?: string;
  isp?: string;
  proxyDetected: boolean;
  vpnDetected: boolean;
  torDetected: boolean;
}

interface RateLimitConfig {
  windowMs: number;
  max: number | ((req: any) => number);
  message: string;
  standardHeaders: boolean;
  legacyHeaders: boolean;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
  handler?: (req: any, res: any) => void;
  onLimitReached?: (req: any, res: any, optionsUsed: any) => void;
  store?: any;
}

interface ThreatDetectionConfig {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  patterns: {
    sqlInjection: boolean;
    xss: boolean;
    directoryTraversal: boolean;
    commandInjection: boolean;
    pathTraversal: boolean;
  };
  thresholds: {
    suspiciousRequests: number;
    maliciousRequests: number;
    blockDuration: number;
  };
}

interface AdvancedRateLimitConfig extends RateLimitConfig {
  threatDetection?: ThreatDetectionConfig;
  ipReputation?: {
    enabled: boolean;
    minScore: number;
    blockDuration: number;
  };
  userBehavior?: {
    enabled: boolean;
    baselineRequests: number;
    anomalyThreshold: number;
  };
  geographic?: {
    enabled: boolean;
    allowedCountries: string[];
    blockedCountries: string[];
  };
  deviceFingerprint?: {
    enabled: boolean;
    required: boolean;
  };
}

class IPReputationService {
  private redis: Redis;
  private threatIntelligence: Map<string, IPReputation> = new Map();
  private readonly THREAT_SCORES = {
    KNOWN_MALICIOUS: 90,
    LIKELY_MALICIOUS: 70,
    SUSPICIOUS: 50,
    NORMAL: 10,
    TRUSTED: 0
  };

  constructor(redis: Redis) {
    this.redis = redis;
    this.initializeThreatIntelligence();
  }

  private initializeThreatIntelligence(): void {
    // Known malicious IP ranges (example data)
    const maliciousIPs = [
      '192.168.1.0/24', // Example private range
      '10.0.0.0/8',     // Example private range
      '172.16.0.0/12'   // Example private range
    ];

    maliciousIPs.forEach(ipRange => {
      this.threatIntelligence.set(ipRange, {
        score: this.THREAT_SCORES.KNOWN_MALICIOUS,
        threats: ['known_malicious', 'private_range'],
        lastSeen: Date.now(),
        requestCount: 0,
        blockedUntil: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
        proxyDetected: false,
        vpnDetected: false,
        torDetected: false
      });
    });
  }

  async getIPReputation(ip: string): Promise<IPReputation> {
    const cacheKey = `ip_reputation:${ip}`;
    
    // Check Redis cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Calculate reputation score
    const reputation = await this.calculateReputation(ip);
    
    // Cache for 1 hour
    await this.redis.setex(cacheKey, 3600, JSON.stringify(reputation));
    
    return reputation;
  }

  private async calculateReputation(ip: string): Promise<IPReputation> {
    let score = 0;
    const threats: string[] = [];
    
    // Check if IP is in known malicious ranges
    const isInMaliciousRange = this.isInMaliciousRange(ip);
    if (isInMaliciousRange) {
      score += this.THREAT_SCORES.KNOWN_MALICIOUS;
      threats.push('known_malicious_range');
    }

    // Check for proxy/VPN/Tor detection
    const proxyDetection = await this.detectProxy(ip);
    if (proxyDetection.proxy) {
      score += 20;
      threats.push('proxy_detected');
    }
    
    if (proxyDetection.vpn) {
      score += 30;
      threats.push('vpn_detected');
    }
    
    if (proxyDetection.tor) {
      score += 40;
      threats.push('tor_detected');
    }

    // Check request patterns
    const requestPatterns = await this.analyzeRequestPatterns(ip);
    if (requestPatterns.suspicious) {
      score += 25;
      threats.push('suspicious_request_pattern');
    }

    // Geographic analysis
    const geoInfo = await this.getGeographicInfo(ip);
    
    return {
      score: Math.min(score, 100),
      threats,
      lastSeen: Date.now(),
      requestCount: requestPatterns.count,
      country: geoInfo.country,
      isp: geoInfo.isp,
      proxyDetected: proxyDetection.proxy,
      vpnDetected: proxyDetection.vpn,
      torDetected: proxyDetection.tor
    };
  }

  private isInMaliciousRange(ip: string): boolean {
    // Simple implementation - in production, use proper IP range matching
    for (const [range, reputation] of this.threatIntelligence) {
      if (range.includes(ip)) {
        return true;
      }
    }
    return false;
  }

  private async detectProxy(ip: string): Promise<{ proxy: boolean; vpn: boolean; tor: boolean }> {
    // In production, integrate with proxy detection services
    // For now, return mock data
    return {
      proxy: Math.random() < 0.1, // 10% chance
      vpn: Math.random() < 0.05,  // 5% chance
      tor: Math.random() < 0.01   // 1% chance
    };
  }

  private async analyzeRequestPatterns(ip: string): Promise<{ suspicious: boolean; count: number }> {
    // Analyze recent request patterns from this IP
    const recentRequests = await this.redis.get(`requests:${ip}:recent`);
    const count = recentRequests ? parseInt(recentRequests) : 0;
    
    return {
      suspicious: count > 100, // More than 100 requests in short time
      count
    };
  }

  private async getGeographicInfo(ip: string): Promise<{ country: string; isp: string }> {
    // In production, integrate with IP geolocation services
    return {
      country: 'IN', // India
      isp: 'Example ISP'
    };
  }

  async updateIPReputation(ip: string, reputation: Partial<IPReputation>): Promise<void> {
    const cacheKey = `ip_reputation:${ip}`;
    const current = await this.getIPReputation(ip);
    const updated = { ...current, ...reputation, lastSeen: Date.now() };
    
    await this.redis.setex(cacheKey, 3600, JSON.stringify(updated));
  }

  async blockIP(ip: string, duration: number, reason: string): Promise<void> {
    const reputation = await this.getIPReputation(ip);
    reputation.blockedUntil = Date.now() + duration;
    reputation.threats.push(`blocked:${reason}`);
    
    await this.updateIPReputation(ip, reputation);
    
    // Log the block
    console.log(`🚫 IP ${ip} blocked for ${duration}ms: ${reason}`);
  }
}

// Threat Detection Service
class ThreatDetectionService {
  private patterns = {
    sqlInjection: [
      /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|cast|convert)\b)/i,
      /(--|\/\*|\*\/)/,
      /(\b(or|and)\b.*=.*)/i,
      /(\bunion\b.*\bselect\b)/i,
      /(;.*drop\s+table)/i,
      /(xp_|sp_)/i,
      /(0x[0-9a-fA-F]+)/,
      /(\|\|.*\|\|)/,
      /(@@version|@@servername|database()|user()|current_user)/i
    ],
    xss: [
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
    ],
    directoryTraversal: [
      /\.\.\//,
      /\.\.\\/,
      /%2e%2e%2f/,
      /%252e%252e%252f/,
      /\.\.\/\/\/\//,
      /\/\.\.\/\/\//,
      /\/\/\/\.\.\//
    ],
    commandInjection: [
      /[;&|`]/,
      /\$\(/,
      /\|\|/,
      /&&/,
      /;/,
      /`/,
      /\$(\{|\()/,
      /\|\s*cat\s+/,
      /\|\s*ls\s+/,
      /\|\s*id\s+/,
      /nc\s+-/,
      /wget\s+/,
      /curl\s+/
    ],
    pathTraversal: [
      /\/etc\/passwd/,
      /\/etc\/hosts/,
      /\/windows\/system32/,
      /\/boot\.ini/,
      /\/proc\/self/,
      /\/usr\/bin/,
      /\/bin\/sh/,
      /\/var\/log/
    ]
  };

  private config: ThreatDetectionConfig;

  constructor(config: ThreatDetectionConfig) {
    this.config = config;
  }

  analyzeRequest(req: any): { threatLevel: 'low' | 'medium' | 'high' | 'critical'; threats: string[] } {
    if (!this.config.enabled) {
      return { threatLevel: 'low', threats: [] };
    }

    const threats: string[] = [];
    let threatScore = 0;

    // Analyze URL parameters
    const urlParams = { ...req.query, ...req.params };
    Object.values(urlParams).forEach(value => {
      const result = this.analyzeString(String(value));
      threats.push(...result.threats);
      threatScore += result.score;
    });

    // Analyze request body
    if (req.body) {
      const bodyString = JSON.stringify(req.body);
      const result = this.analyzeString(bodyString);
      threats.push(...result.threats);
      threatScore += result.score;
    }

    // Analyze headers
    const headers = req.headers;
    Object.values(headers).forEach(value => {
      if (value) {
        const result = this.analyzeString(String(value));
        threats.push(...result.threats);
        threatScore += result.score;
      }
    });

    // Determine threat level
    const threatLevel = this.calculateThreatLevel(threatScore, threats.length);

    return {
      threatLevel,
      threats: [...new Set(threats)] // Remove duplicates
    };
  }

  private analyzeString(input: string): { score: number; threats: string[] } {
    const threats: string[] = [];
    let score = 0;

    // Check for SQL injection
    if (this.config.patterns.sqlInjection) {
      const sqlThreats = this.patterns.sqlInjection.filter(pattern => pattern.test(input));
      if (sqlThreats.length > 0) {
        threats.push('sql_injection');
        score += sqlThreats.length * 25;
      }
    }

    // Check for XSS
    if (this.config.patterns.xss) {
      const xssThreats = this.patterns.xss.filter(pattern => pattern.test(input));
      if (xssThreats.length > 0) {
        threats.push('xss');
        score += xssThreats.length * 20;
      }
    }

    // Check for directory traversal
    if (this.config.patterns.directoryTraversal) {
      const traversalThreats = this.patterns.directoryTraversal.filter(pattern => pattern.test(input));
      if (traversalThreats.length > 0) {
        threats.push('directory_traversal');
        score += traversalThreats.length * 30;
      }
    }

    // Check for command injection
    if (this.config.patterns.commandInjection) {
      const commandThreats = this.patterns.commandInjection.filter(pattern => pattern.test(input));
      if (commandThreats.length > 0) {
        threats.push('command_injection');
        score += commandThreats.length * 35;
      }
    }

    // Check for path traversal
    if (this.config.patterns.pathTraversal) {
      const pathThreats = this.patterns.pathTraversal.filter(pattern => pattern.test(input));
      if (pathThreats.length > 0) {
        threats.push('path_traversal');
        score += pathThreats.length * 40;
      }
    }

    return { score, threats };
  }

  private calculateThreatLevel(score: number, threatCount: number): 'low' | 'medium' | 'high' | 'critical' {
    const thresholds = this.config.thresholds;
    
    if (score >= thresholds.maliciousRequests) {
      return 'critical';
    } else if (score >= thresholds.suspiciousRequests) {
      return 'high';
    } else if (threatCount >= 2) {
      return 'medium';
    } else if (threatCount >= 1) {
      return 'low';
    }
    
    return 'low';
  }
}

// Advanced Rate Limiter with all security features
export class AdvancedRateLimiter {
  private redis: Redis;
  private ipReputationService: IPReputationService;
  private threatDetectionService: ThreatDetectionService;
  private config: AdvancedRateLimitConfig;

  constructor(redis: Redis, config: AdvancedRateLimitConfig) {
    this.redis = redis;
    this.ipReputationService = new IPReputationService(redis);
    this.threatDetectionService = new ThreatDetectionService(config.threatDetection || {
      enabled: true,
      sensitivity: 'medium',
      patterns: {
        sqlInjection: true,
        xss: true,
        directoryTraversal: true,
        commandInjection: true,
        pathTraversal: true
      },
      thresholds: {
        suspiciousRequests: 50,
        maliciousRequests: 100,
        blockDuration: 3600000 // 1 hour
      }
    });
    this.config = config;
  }

  createMiddleware(): any {
    const baseRateLimit = rateLimit({
      ...this.config,
      store: this.config.store || new RedisStore({
        client: this.redis,
        prefix: 'rl:'
      }),
      keyGenerator: (req) => this.generateRateLimitKey(req),
      handler: async (req, res) => await this.rateLimitHandler(req, res)
    });

    return async (req: any, res: any, next: any) => {
      try {
        // Perform security checks first
        const securityCheck = await this.performSecurityChecks(req);
        
        if (!securityCheck.allowed) {
          return res.status(securityCheck.statusCode).json({
            error: securityCheck.message,
            code: securityCheck.code,
            details: securityCheck.details
          });
        }

        // Apply base rate limiting
        baseRateLimit(req, res, next);
      } catch (error) {
        console.error('Rate limiting error:', error);
        return res.status(500).json({
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  }

  private async performSecurityChecks(req: any): Promise<{
    allowed: boolean;
    statusCode: number;
    message: string;
    code: string;
    details?: any;
  }> {
    const clientIP = this.extractClientIP(req);
    
    // IP Reputation Check
    if (this.config.ipReputation?.enabled) {
      const reputation = await this.ipReputationService.getIPReputation(clientIP);
      
      if (reputation.blockedUntil && reputation.blockedUntil > Date.now()) {
        return {
          allowed: false,
          statusCode: 403,
          message: 'Access denied due to IP reputation',
          code: 'IP_BLOCKED',
          details: { blockedUntil: reputation.blockedUntil, reason: reputation.threats }
        };
      }
      
      if (reputation.score >= (this.config.ipReputation?.minScore || 70)) {
        await this.ipReputationService.blockIP(
          clientIP,
          this.config.ipReputation?.blockDuration || 3600000,
          'High reputation score'
        );
        
        return {
          allowed: false,
          statusCode: 403,
          message: 'Access denied due to IP reputation',
          code: 'IP_REPUTATION_BLOCK',
          details: { score: reputation.score, threats: reputation.threats }
        };
      }
    }

    // Threat Detection
    if (this.config.threatDetection?.enabled) {
      const threatAnalysis = this.threatDetectionService.analyzeRequest(req);
      
      if (threatAnalysis.threatLevel === 'critical') {
        await this.ipReputationService.blockIP(
          clientIP,
          this.config.threatDetection?.thresholds.blockDuration || 3600000,
          'Critical threat detected'
        );
        
        return {
          allowed: false,
          statusCode: 403,
          message: 'Access denied due to security threat',
          code: 'SECURITY_THREAT',
          details: { threats: threatAnalysis.threats, level: threatAnalysis.threatLevel }
        };
      }
      
      if (threatAnalysis.threatLevel === 'high') {
        return {
          allowed: false,
          statusCode: 429,
          message: 'Too many suspicious requests',
          code: 'SUSPICIOUS_REQUESTS',
          details: { threats: threatAnalysis.threats, level: threatAnalysis.threatLevel }
        };
      }
    }

    // Geographic Restrictions
    if (this.config.geographic?.enabled) {
      const country = await this.getCountryFromIP(clientIP);
      const blockedCountries = this.config.geographic?.blockedCountries || [];
      const allowedCountries = this.config.geographic?.allowedCountries || [];
      
      if (blockedCountries.includes(country)) {
        return {
          allowed: false,
          statusCode: 403,
          message: 'Access denied from this location',
          code: 'GEOGRAPHIC_BLOCK',
          details: { country }
        };
      }
      
      if (allowedCountries.length > 0 && !allowedCountries.includes(country)) {
        return {
          allowed: false,
          statusCode: 403,
          message: 'Access not allowed from this location',
          code: 'GEOGRAPHIC_RESTRICTION',
          details: { country }
        };
      }
    }

    return { allowed: true, statusCode: 200, message: 'OK', code: 'ALLOWED' };
  }

  private generateRateLimitKey(req: any): string {
    const clientIP = this.extractClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceFingerprint = this.generateDeviceFingerprint(req);
    
    return crypto.createHash('sha256')
      .update(`${clientIP}:${userAgent}:${deviceFingerprint}`)
      .digest('hex');
  }

  private generateDeviceFingerprint(req: any): string {
    const userAgent = req.headers['user-agent'] || '';
    const acceptLanguage = req.headers['accept-language'] || '';
    const acceptEncoding = req.headers['accept-encoding'] || '';
    const accept = req.headers['accept'] || '';
    
    return crypto.createHash('md5')
      .update(`${userAgent}:${acceptLanguage}:${acceptEncoding}:${accept}`)
      .digest('hex');
  }

  private extractClientIP(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (realIP) {
      return realIP;
    }
    
    return req.connection.remoteAddress || req.socket.remoteAddress || req.ip;
  }

  private async rateLimitHandler(req: any, res: any): Promise<void> {
    const clientIP = this.extractClientIP(req);
    
    // Log rate limit hit
    console.log(`⚠️ Rate limit exceeded for IP: ${clientIP}`);
    
    // Update IP reputation
    const currentRep = await this.ipReputationService.getIPReputation(clientIP);
    currentRep.requestCount += 1;
    
    if (currentRep.requestCount > 1000) {
      await this.ipReputationService.blockIP(
        clientIP,
        3600000, // 1 hour
        'Excessive rate limit violations'
      );
    }
    
    await this.ipReputationService.updateIPReputation(clientIP, currentRep);
    
    res.status(429).json({
      error: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED',
      retryAfter: Math.ceil(this.config.windowMs / 1000)
    });
  }

  private async getCountryFromIP(ip: string): Promise<string> {
    // In production, integrate with IP geolocation service
    return 'IN'; // Default to India
  }
}

// Predefined rate limit configurations for different endpoints
export const rateLimitConfigs = {
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: 'Too many authentication attempts, please try again later',
    threatDetection: {
      enabled: true,
      sensitivity: 'high',
      patterns: {
        sqlInjection: true,
        xss: true,
        directoryTraversal: true,
        commandInjection: true,
        pathTraversal: true
      },
      thresholds: {
        suspiciousRequests: 3,
        maliciousRequests: 1,
        blockDuration: 3600000 // 1 hour
      }
    }
  },

  // API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many API requests, please slow down',
    threatDetection: {
      enabled: true,
      sensitivity: 'medium',
      patterns: {
        sqlInjection: true,
        xss: false,
        directoryTraversal: true,
        commandInjection: true,
        pathTraversal: true
      },
      thresholds: {
        suspiciousRequests: 10,
        maliciousRequests: 3,
        blockDuration: 1800000 // 30 minutes
      }
    }
  },

  // File upload endpoints
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: 'Upload limit exceeded, please try again later',
    threatDetection: {
      enabled: true,
      sensitivity: 'high',
      patterns: {
        sqlInjection: true,
        xss: true,
        directoryTraversal: true,
        commandInjection: true,
        pathTraversal: true
      },
      thresholds: {
        suspiciousRequests: 2,
        maliciousRequests: 1,
        blockDuration: 7200000 // 2 hours
      }
    }
  },

  // General endpoints
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per 15 minutes
    message: 'Too many requests, please slow down',
    threatDetection: {
      enabled: true,
      sensitivity: 'low',
      patterns: {
        sqlInjection: true,
        xss: false,
        directoryTraversal: false,
        commandInjection: false,
        pathTraversal: false
      },
      thresholds: {
        suspiciousRequests: 20,
        maliciousRequests: 5,
        blockDuration: 900000 // 15 minutes
      }
    }
  }
};

// Export factory function
export const createAdvancedRateLimiter = (redis: Redis, configName: keyof typeof rateLimitConfigs): any => {
  const config = rateLimitConfigs[configName];
  const rateLimiter = new AdvancedRateLimiter(redis, {
    ...config,
    store: new RedisStore({
      client: redis,
      prefix: `rl:${configName}:`
    })
  });
  
  return rateLimiter.createMiddleware();
};

export { AdvancedRateLimiter, IPReputationService, ThreatDetectionService };