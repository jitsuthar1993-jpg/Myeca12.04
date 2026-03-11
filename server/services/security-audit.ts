import crypto from 'crypto';
import { EventEmitter } from 'events';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Security Event Types
export type SecurityEventType = 
  | 'authentication_success'
  | 'authentication_failure'
  | 'authorization_failure'
  | 'jwt_token_generated'
  | 'jwt_token_verified'
  | 'jwt_token_revoked'
  | 'rate_limit_exceeded'
  | 'malicious_request_blocked'
  | 'suspicious_activity_detected'
  | 'file_upload_blocked'
  | 'xss_attempt_blocked'
  | 'sql_injection_attempt'
  | 'csrf_attempt_blocked'
  | 'brute_force_detected'
  | 'ip_reputation_violation'
  | 'device_fingerprint_mismatch'
  | 'session_hijacking_attempt'
  | 'privilege_escalation_attempt'
  | 'data_exfiltration_attempt'
  | 'api_abuse_detected'
  | 'geolocation_anomaly'
  | 'time_based_anomaly'
  | 'behavioral_anomaly'
  | 'security_rule_violation'
  | 'encryption_failure'
  | 'certificate_validation_error'
  | 'secure_channel_violation';

// Security Severity Levels
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency';

// Geographic Location Data
export interface GeoLocation {
  country: string;
  countryCode: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  proxy: boolean;
  hosting: boolean;
  threat: {
    isTor: boolean;
    isProxy: boolean;
    isVpn: boolean;
    isHosting: boolean;
    reputation: string;
  };
}

// Device Fingerprint Data
export interface DeviceFingerprint {
  userAgent: string;
  acceptLanguage: string;
  acceptEncoding: string;
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  platform: string;
  cookieEnabled: boolean;
  doNotTrack: string;
  plugins: string[];
  fonts: string[];
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connection?: string;
}

// Security Event Data
export interface SecurityEvent {
  id: string;
  timestamp: Date;
  type: SecurityEventType;
  severity: SecuritySeverity;
  userId?: number;
  sessionId?: string;
  deviceId?: string;
  ipAddress: string;
  userAgent: string;
  requestMethod: string;
  requestUrl: string;
  requestHeaders: Record<string, string>;
  requestBody?: any;
  responseStatus?: number;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  geolocation?: GeoLocation;
  deviceFingerprint?: DeviceFingerprint;
  riskScore: number;
  threatIndicators: string[];
  mitigationActions: string[];
  errorDetails?: string;
  stackTrace?: string;
  correlationId: string;
  parentEventId?: string;
  tags: string[];
  metadata: Record<string, any>;
}

// Threat Intelligence Data
export interface ThreatIntelligence {
  ip: string;
  reputation: 'safe' | 'suspicious' | 'malicious' | 'unknown';
  riskScore: number;
  categories: string[];
  firstSeen: Date;
  lastSeen: Date;
  attackTypes: string[];
  confidence: number;
  sources: string[];
  geographicInfo: {
    country: string;
    countryCode: string;
    region: string;
    city: string;
  };
  asn: {
    number: number;
    organization: string;
    type: string;
  };
  proxy: {
    isProxy: boolean;
    proxyType?: string;
    proxyLevel?: string;
  };
  vpn: {
    isVpn: boolean;
    vpnService?: string;
  };
  tor: {
    isTor: boolean;
    exitNode?: boolean;
  };
  hosting: {
    isHosting: boolean;
    provider?: string;
  };
  malware: {
    isMalware: boolean;
    malwareFamily?: string;
    malwareType?: string;
  };
  spam: {
    isSpam: boolean;
    spamScore?: number;
  };
  attacks: {
    bruteForce: boolean;
    ddos: boolean;
    phishing: boolean;
    malware: boolean;
    spam: boolean;
    botnet: boolean;
  };
}

// Behavioral Analysis Data
export interface BehavioralProfile {
  userId?: number;
  sessionId?: string;
  deviceId?: string;
  ipAddress: string;
  patterns: {
    loginTimes: number[]; // Hour of day (0-23)
    requestFrequency: number; // Requests per minute
    pageViews: string[]; // Common page patterns
    formSubmissions: string[]; // Form interaction patterns
    fileUploads: number;
    apiCalls: Record<string, number>;
    errorRates: Record<string, number>;
    responseTimes: number[];
  };
  riskFactors: {
    unusualLoginTime: boolean;
    highRequestFrequency: boolean;
    suspiciousPageSequence: boolean;
    rapidFormSubmission: boolean;
    unusualFileUploadPattern: boolean;
    highErrorRate: boolean;
    geographicAnomaly: boolean;
    deviceAnomaly: boolean;
    behavioralAnomaly: boolean;
  };
  riskScore: number;
  confidence: number;
  lastUpdated: Date;
}

// Security Rule Engine
export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  type: 'rate_limit' | 'pattern_match' | 'anomaly_detection' | 'geolocation' | 'device_fingerprint' | 'behavioral' | 'threat_intelligence';
  enabled: boolean;
  severity: SecuritySeverity;
  conditions: {
    field: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'regex_match' | 'greater_than' | 'less_than' | 'in_range' | 'not_in_range';
    value: any;
    caseSensitive?: boolean;
  }[];
  actions: {
    type: 'block' | 'challenge' | 'log' | 'alert' | 'rate_limit' | 'redirect' | 'require_mfa';
    parameters?: Record<string, any>;
  }[];
  exceptions?: {
    ipRanges?: string[];
    userAgents?: string[];
    userIds?: number[];
    countries?: string[];
  };
  metadata: {
    category: string;
    tags: string[];
    confidence: number;
    falsePositiveRate: number;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
  };
}

// Security Audit Configuration
export interface SecurityAuditConfig {
  enabled: boolean;
  logLevel: SecuritySeverity;
  retentionDays: number;
  maxLogSize: number;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  realTimeMonitoring: boolean;
  threatIntelligenceEnabled: boolean;
  behavioralAnalysisEnabled: boolean;
  geolocationEnabled: boolean;
  deviceFingerprintingEnabled: boolean;
  rateLimitingEnabled: boolean;
  alertingEnabled: boolean;
  incidentResponseEnabled: boolean;
  rules: SecurityRule[];
  integrations: {
    slack?: { webhookUrl: string; channel: string };
    email?: { smtpConfig: any; recipients: string[] };
    webhook?: { url: string; headers: Record<string, string> };
    siem?: { endpoint: string; apiKey: string };
  };
}

// Security Audit Service
export class SecurityAuditService extends EventEmitter {
  private config: SecurityAuditConfig;
  private logsPath: string;
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map();
  private behavioralProfiles: Map<string, BehavioralProfile> = new Map();
  private securityRules: Map<string, SecurityRule> = new Map();
  private incidentQueue: SecurityEvent[] = [];
  private isProcessing: boolean = false;
  private correlationId: number = 0;

  constructor(config: SecurityAuditConfig) {
    super();
    this.config = config;
    this.logsPath = join(process.cwd(), 'logs', 'security');
    this.initialize();
  }

  private initialize(): void {
    // Create logs directory
    if (!existsSync(this.logsPath)) {
      mkdirSync(this.logsPath, { recursive: true });
    }

    // Load security rules
    this.loadSecurityRules();

    // Start incident processing
    this.startIncidentProcessing();

    // Load threat intelligence (in production, this would be from external APIs)
    this.loadThreatIntelligence();

    console.log('🔒 Security Audit Service initialized');
  }

  // Generate unique correlation ID
  private generateCorrelationId(): string {
    this.correlationId++;
    return `sec-${Date.now()}-${this.correlationId}-${crypto.randomBytes(4).toString('hex')}`;
  }

  // Log security event
  public async logSecurityEvent(eventData: Partial<SecurityEvent>): Promise<string> {
    const event: SecurityEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: eventData.type || 'security_rule_violation',
      severity: eventData.severity || 'medium',
      userId: eventData.userId,
      sessionId: eventData.sessionId,
      deviceId: eventData.deviceId,
      ipAddress: eventData.ipAddress || 'unknown',
      userAgent: eventData.userAgent || 'unknown',
      requestMethod: eventData.requestMethod || 'GET',
      requestUrl: eventData.requestUrl || '/',
      requestHeaders: eventData.requestHeaders || {},
      requestBody: eventData.requestBody,
      responseStatus: eventData.responseStatus,
      responseHeaders: eventData.responseHeaders,
      responseBody: eventData.responseBody,
      geolocation: eventData.geolocation,
      deviceFingerprint: eventData.deviceFingerprint,
      riskScore: eventData.riskScore || 0,
      threatIndicators: eventData.threatIndicators || [],
      mitigationActions: eventData.mitigationActions || [],
      errorDetails: eventData.errorDetails,
      stackTrace: eventData.stackTrace,
      correlationId: eventData.correlationId || this.generateCorrelationId(),
      parentEventId: eventData.parentEventId,
      tags: eventData.tags || [],
      metadata: eventData.metadata || {}
    };

    // Analyze event risk
    event.riskScore = this.calculateRiskScore(event);

    // Apply security rules
    const ruleResults = this.applySecurityRules(event);
    event.mitigationActions = ruleResults.actions;
    event.threatIndicators = ruleResults.threats;

    // Update behavioral profile
    this.updateBehavioralProfile(event);

    // Queue for processing
    this.incidentQueue.push(event);

    // Log to file
    await this.writeSecurityLog(event);

    // Emit event for real-time monitoring
    this.emit('security-event', event);

    // Send alerts for high-severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      await this.sendSecurityAlert(event);
    }

    return event.correlationId;
  }

  // Calculate risk score for event
  private calculateRiskScore(event: SecurityEvent): number {
    let score = 0;

    // Base score by severity
    const severityScores = { low: 10, medium: 30, high: 60, critical: 90, emergency: 100 };
    score += severityScores[event.severity] || 0;

    // IP reputation score
    if (event.geolocation?.threat) {
      if (event.geolocation.threat.isTor) score += 40;
      if (event.geolocation.threat.isProxy) score += 30;
      if (event.geolocation.threat.isVpn) score += 20;
      if (event.geolocation.threat.isHosting) score += 25;
    }

    // Event type specific scores
    const eventTypeScores: Record<SecurityEventType, number> = {
      'authentication_failure': 20,
      'authorization_failure': 30,
      'jwt_token_revoked': 40,
      'rate_limit_exceeded': 15,
      'malicious_request_blocked': 70,
      'xss_attempt_blocked': 80,
      'sql_injection_attempt': 85,
      'csrf_attempt_blocked': 60,
      'brute_force_detected': 75,
      'ip_reputation_violation': 50,
      'device_fingerprint_mismatch': 45,
      'session_hijacking_attempt': 85,
      'privilege_escalation_attempt': 90,
      'data_exfiltration_attempt': 95,
      'api_abuse_detected': 40,
      'geolocation_anomaly': 35,
      'time_based_anomaly': 25,
      'behavioral_anomaly': 30,
      'security_rule_violation': 50,
      'encryption_failure': 60,
      'certificate_validation_error': 70,
      'secure_channel_violation': 80,
      'authentication_success': 0,
      'jwt_token_generated': 0,
      'jwt_token_verified': 0,
      'file_upload_blocked': 40
    };

    score += eventTypeScores[event.type] || 25;

    // Behavioral anomaly score
    const behavioralScore = this.getBehavioralAnomalyScore(event);
    score += behavioralScore;

    // Rate limiting score
    const rateLimitScore = this.getRateLimitScore(event);
    score += rateLimitScore;

    return Math.min(score, 100);
  }

  // Apply security rules to event
  private applySecurityRules(event: SecurityEvent): {
    actions: string[];
    threats: string[];
  } {
    const actions: string[] = [];
    const threats: string[] = [];

    for (const rule of this.securityRules.values()) {
      if (!rule.enabled) continue;

      const matches = this.evaluateRule(rule, event);
      if (matches) {
        actions.push(...rule.actions.map(action => action.type));
        threats.push(rule.name);

        // Update event severity if rule is more severe
        if (this.isMoreSevere(rule.severity, event.severity)) {
          event.severity = rule.severity;
        }
      }
    }

    return { actions: [...new Set(actions)], threats: [...new Set(threats)] };
  }

  // Evaluate security rule
  private evaluateRule(rule: SecurityRule, event: SecurityEvent): boolean {
    // Check exceptions first
    if (rule.exceptions) {
      if (rule.exceptions.ipRanges?.some(range => this.isIpInRange(event.ipAddress, range))) {
        return false;
      }
      if (rule.exceptions.userIds?.includes(event.userId!)) {
        return false;
      }
    }

    // Evaluate conditions
    return rule.conditions.every(condition => {
      const fieldValue = this.getFieldValue(event, condition.field);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value, condition.caseSensitive);
    });
  }

  // Get field value from event
  private getFieldValue(event: SecurityEvent, field: string): any {
    const fields = field.split('.');
    let value: any = event;
    
    for (const f of fields) {
      value = value?.[f];
    }
    
    return value;
  }

  // Evaluate condition
  private evaluateCondition(fieldValue: any, operator: string, conditionValue: any, caseSensitive?: boolean): boolean {
    if (fieldValue === undefined || fieldValue === null) return false;

    let value = fieldValue;
    let target = conditionValue;

    if (!caseSensitive && typeof value === 'string' && typeof target === 'string') {
      value = value.toLowerCase();
      target = target.toLowerCase();
    }

    switch (operator) {
      case 'equals':
        return value === target;
      case 'not_equals':
        return value !== target;
      case 'contains':
        return String(value).includes(String(target));
      case 'not_contains':
        return !String(value).includes(String(target));
      case 'regex_match':
        return new RegExp(target).test(String(value));
      case 'greater_than':
        return Number(value) > Number(target);
      case 'less_than':
        return Number(value) < Number(target);
      case 'in_range':
        const [min, max] = target;
        return Number(value) >= min && Number(value) <= max;
      case 'not_in_range':
        const [min2, max2] = target;
        return Number(value) < min2 || Number(value) > max2;
      default:
        return false;
    }
  }

  // Check if severity is more severe
  private isMoreSevere(ruleSeverity: SecuritySeverity, eventSeverity: SecuritySeverity): boolean {
    const severityOrder = ['low', 'medium', 'high', 'critical', 'emergency'];
    return severityOrder.indexOf(ruleSeverity) > severityOrder.indexOf(eventSeverity);
  }

  // Update behavioral profile
  private updateBehavioralProfile(event: SecurityEvent): void {
    const key = event.userId ? `user-${event.userId}` : `ip-${event.ipAddress}`;
    let profile = this.behavioralProfiles.get(key);

    if (!profile) {
      profile = {
        userId: event.userId,
        sessionId: event.sessionId,
        deviceId: event.deviceId,
        ipAddress: event.ipAddress,
        patterns: {
          loginTimes: [],
          requestFrequency: 0,
          pageViews: [],
          formSubmissions: [],
          fileUploads: 0,
          apiCalls: {},
          errorRates: {},
          responseTimes: []
        },
        riskFactors: {
          unusualLoginTime: false,
          highRequestFrequency: false,
          suspiciousPageSequence: false,
          rapidFormSubmission: false,
          unusualFileUploadPattern: false,
          highErrorRate: false,
          geographicAnomaly: false,
          deviceAnomaly: false,
          behavioralAnomaly: false
        },
        riskScore: 0,
        confidence: 0,
        lastUpdated: new Date()
      };
    }

    // Update patterns based on event
    this.updateBehavioralPatterns(profile, event);

    // Calculate risk factors
    this.calculateBehavioralRiskFactors(profile);

    // Update risk score
    profile.riskScore = this.calculateBehavioralRiskScore(profile);
    profile.confidence = this.calculateBehavioralConfidence(profile);
    profile.lastUpdated = new Date();

    this.behavioralProfiles.set(key, profile);
  }

  // Update behavioral patterns
  private updateBehavioralPatterns(profile: BehavioralProfile, event: SecurityEvent): void {
    const hour = event.timestamp.getHours();
    if (!profile.patterns.loginTimes.includes(hour)) {
      profile.patterns.loginTimes.push(hour);
    }

    // Update request frequency
    profile.patterns.requestFrequency = this.calculateRequestFrequency(profile, event);

    // Update page views
    if (event.requestUrl && !profile.patterns.pageViews.includes(event.requestUrl)) {
      profile.patterns.pageViews.push(event.requestUrl);
    }

    // Update API calls
    const endpoint = this.extractApiEndpoint(event.requestUrl);
    if (endpoint) {
      profile.patterns.apiCalls[endpoint] = (profile.patterns.apiCalls[endpoint] || 0) + 1;
    }

    // Update error rates
    if (event.responseStatus && event.responseStatus >= 400) {
      const errorType = this.categorizeError(event.responseStatus);
      profile.patterns.errorRates[errorType] = (profile.patterns.errorRates[errorType] || 0) + 1;
    }

    // Update file uploads
    if (event.type === 'file_upload_blocked') {
      profile.patterns.fileUploads++;
    }
  }

  // Calculate behavioral risk factors
  private calculateBehavioralRiskFactors(profile: BehavioralProfile): void {
    const now = new Date();
    const hour = now.getHours();

    // Unusual login time
    profile.riskFactors.unusualLoginTime = !profile.patterns.loginTimes.includes(hour) && 
                                           profile.patterns.loginTimes.length > 5;

    // High request frequency
    profile.riskFactors.highRequestFrequency = profile.patterns.requestFrequency > 100;

    // Suspicious page sequence
    profile.riskFactors.suspiciousPageSequence = this.isSuspiciousPageSequence(profile);

    // Rapid form submission
    profile.riskFactors.rapidFormSubmission = this.isRapidFormSubmission(profile);

    // Unusual file upload pattern
    profile.riskFactors.unusualFileUploadPattern = profile.patterns.fileUploads > 5;

    // High error rate
    const totalRequests = Object.values(profile.patterns.apiCalls).reduce((sum, count) => sum + count, 0);
    const totalErrors = Object.values(profile.patterns.errorRates).reduce((sum, count) => sum + count, 0);
    profile.riskFactors.highErrorRate = totalRequests > 10 && (totalErrors / totalRequests) > 0.3;

    // Geographic anomaly
    profile.riskFactors.geographicAnomaly = false; // Would need geolocation data

    // Device anomaly
    profile.riskFactors.deviceAnomaly = false; // Would need device fingerprint comparison

    // Behavioral anomaly
    profile.riskFactors.behavioralAnomaly = this.isBehavioralAnomaly(profile);
  }

  // Calculate behavioral risk score
  private calculateBehavioralRiskScore(profile: BehavioralProfile): number {
    let score = 0;
    const factors = profile.riskFactors;

    if (factors.unusualLoginTime) score += 15;
    if (factors.highRequestFrequency) score += 25;
    if (factors.suspiciousPageSequence) score += 20;
    if (factors.rapidFormSubmission) score += 15;
    if (factors.unusualFileUploadPattern) score += 20;
    if (factors.highErrorRate) score += 25;
    if (factors.geographicAnomaly) score += 30;
    if (factors.deviceAnomaly) score += 25;
    if (factors.behavioralAnomaly) score += 35;

    return Math.min(score, 100);
  }

  // Calculate behavioral confidence
  private calculateBehavioralConfidence(profile: BehavioralProfile): number {
    const totalRequests = Object.values(profile.patterns.apiCalls).reduce((sum, count) => sum + count, 0);
    
    if (totalRequests < 10) return 20;
    if (totalRequests < 50) return 50;
    if (totalRequests < 100) return 75;
    return 90;
  }

  // Helper methods for behavioral analysis
  private getBehavioralAnomalyScore(event: SecurityEvent): number {
    // Implementation would compare against established behavioral patterns
    return 0;
  }

  private getRateLimitScore(event: SecurityEvent): number {
    if (event.type === 'rate_limit_exceeded') return 15;
    return 0;
  }

  private calculateRequestFrequency(profile: BehavioralProfile, event: SecurityEvent): number {
    // Simplified implementation
    const totalRequests = Object.values(profile.patterns.apiCalls).reduce((sum, count) => sum + count, 0);
    const timeSpan = Date.now() - new Date(profile.lastUpdated).getTime();
    return timeSpan > 0 ? (totalRequests / timeSpan) * 60000 : 0; // requests per minute
  }

  private extractApiEndpoint(url: string): string | null {
    const match = url.match(/^\/api\/([^\/]+)/);
    return match ? match[1] : null;
  }

  private categorizeError(status: number): string {
    if (status >= 500) return 'server_error';
    if (status >= 400) return 'client_error';
    return 'other_error';
  }

  private isSuspiciousPageSequence(profile: BehavioralProfile): boolean {
    // Implementation would analyze page view patterns
    return false;
  }

  private isRapidFormSubmission(profile: BehavioralProfile): boolean {
    // Implementation would analyze form submission timing
    return false;
  }

  private isBehavioralAnomaly(profile: BehavioralProfile): boolean {
    // Implementation would compare against normal behavioral patterns
    return profile.riskScore > 50;
  }

  private isIpInRange(ip: string, range: string): boolean {
    // Implementation would check if IP is in specified range
    return false;
  }

  // Write security log to file
  private async writeSecurityLog(event: SecurityEvent): Promise<void> {
    const logFile = join(this.logsPath, `security-${event.timestamp.toISOString().split('T')[0]}.jsonl`);
    const logEntry = JSON.stringify(event) + '\n';
    
    try {
      appendFileSync(logFile, logEntry);
    } catch (error) {
      console.error('Error writing security log:', error);
    }
  }

  // Send security alert
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implementation would send alerts via configured channels (email, Slack, webhook, etc.)
    console.log(`🚨 SECURITY ALERT [${event.severity.toUpperCase()}]: ${event.type} - Risk Score: ${event.riskScore}`);
  }

  // Load security rules
  private loadSecurityRules(): void {
    // Implementation would load rules from database or configuration
    const defaultRules: SecurityRule[] = [
      {
        id: 'brute-force-login',
        name: 'Brute Force Login Detection',
        description: 'Detect multiple failed login attempts from same IP',
        type: 'rate_limit',
        enabled: true,
        severity: 'high',
        conditions: [
          {
            field: 'type',
            operator: 'equals',
            value: 'authentication_failure'
          },
          {
            field: 'riskScore',
            operator: 'greater_than',
            value: 60
          }
        ],
        actions: [
          { type: 'block' },
          { type: 'log' },
          { type: 'alert' }
        ],
        metadata: {
          category: 'authentication',
          tags: ['brute-force', 'login'],
          confidence: 90,
          falsePositiveRate: 5,
          createdBy: 'system',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: 1
        }
      }
    ];

    defaultRules.forEach(rule => {
      this.securityRules.set(rule.id, rule);
    });
  }

  // Load threat intelligence
  private loadThreatIntelligence(): void {
    // Implementation would load threat intelligence from external APIs
    console.log('📡 Loading threat intelligence...');
  }

  // Start incident processing
  private startIncidentProcessing(): void {
    setInterval(() => {
      this.processIncidentQueue();
    }, 1000); // Process every second
  }

  // Process incident queue
  private processIncidentQueue(): void {
    if (this.isProcessing || this.incidentQueue.length === 0) return;

    this.isProcessing = true;
    
    try {
      const batch = this.incidentQueue.splice(0, 100); // Process up to 100 events at once
      
      // Process incidents
      for (const event of batch) {
        this.processSecurityIncident(event);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Process individual security incident
  private processSecurityIncident(event: SecurityEvent): void {
    // Implementation would process incidents based on severity and type
    if (event.severity === 'critical' || event.severity === 'emergency') {
      this.createIncidentResponse(event);
    }
  }

  // Create incident response
  private createIncidentResponse(event: SecurityEvent): void {
    // Implementation would create incident response procedures
    console.log(`🚨 CRITICAL SECURITY INCIDENT: ${event.correlationId}`);
  }

  // Public API methods
  public async recordEvent(eventData: Partial<SecurityEvent>): Promise<string> {
    return this.logSecurityEvent(eventData);
  }

  public async recordAuthentication(userId: number, success: boolean, metadata?: any): Promise<string> {
    return this.logSecurityEvent({
      type: success ? 'authentication_success' : 'authentication_failure',
      severity: success ? 'low' : 'medium',
      userId,
      riskScore: success ? 0 : 20,
      metadata
    });
  }

  public async recordAuthorization(userId: number, resource: string, action: string, success: boolean): Promise<string> {
    return this.logSecurityEvent({
      type: 'authorization_failure',
      severity: success ? 'low' : 'high',
      userId,
      requestUrl: `${resource}/${action}`,
      riskScore: success ? 0 : 40,
      metadata: { resource, action }
    });
  }

  public getSecurityStats(): {
    totalEvents: number;
    eventsBySeverity: Record<SecuritySeverity, number>;
    eventsByType: Record<SecurityEventType, number>;
    activeIncidents: number;
    threatIntelligenceCount: number;
    behavioralProfilesCount: number;
    rulesCount: number;
  } {
    return {
      totalEvents: this.incidentQueue.length,
      eventsBySeverity: { low: 0, medium: 0, high: 0, critical: 0, emergency: 0 },
      eventsByType: {} as Record<SecurityEventType, number>,
      activeIncidents: this.incidentQueue.filter(e => e.severity === 'critical' || e.severity === 'emergency').length,
      threatIntelligenceCount: this.threatIntelligence.size,
      behavioralProfilesCount: this.behavioralProfiles.size,
      rulesCount: this.securityRules.size
    };
  }

  // Cleanup
  public cleanup(): void {
    this.removeAllListeners();
    this.threatIntelligence.clear();
    this.behavioralProfiles.clear();
    this.securityRules.clear();
    this.incidentQueue = [];
  }
}

// Export singleton instance
export const securityAudit = new SecurityAuditService({
  enabled: true,
  logLevel: 'medium',
  retentionDays: 90,
  maxLogSize: 100 * 1024 * 1024, // 100MB
  encryptionEnabled: true,
  compressionEnabled: true,
  realTimeMonitoring: true,
  threatIntelligenceEnabled: true,
  behavioralAnalysisEnabled: true,
  geolocationEnabled: true,
  deviceFingerprintingEnabled: true,
  rateLimitingEnabled: true,
  alertingEnabled: true,
  incidentResponseEnabled: true,
  rules: [],
  integrations: {}
});

export default SecurityAuditService;