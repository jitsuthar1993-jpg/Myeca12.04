// @ts-nocheck
import crypto from 'crypto';
import { EventEmitter } from 'events';

// IP Reputation and Threat Intelligence Service
interface IPReputation {
  ip: string;
  reputation: 'safe' | 'suspicious' | 'malicious' | 'unknown';
  riskScore: number; // 0-100
  categories: string[];
  firstSeen: Date;
  lastSeen: Date;
  attackTypes: string[];
  confidence: number; // 0-100
  sources: string[];
  geographicInfo: {
    country: string;
    countryCode: string;
    region: string;
    city: string;
    lat: number;
    lon: number;
    timezone: string;
  };
  asn: {
    number: number;
    organization: string;
    type: string; // ISP, Hosting, Education, Government, etc.
  };
  proxy: {
    isProxy: boolean;
    proxyType?: string; // HTTP, SOCKS, VPN, etc.
    proxyLevel?: string; // Transparent, Anonymous, Elite
  };
  vpn: {
    isVpn: boolean;
    vpnService?: string;
    vpnProvider?: string;
  };
  tor: {
    isTor: boolean;
    exitNode?: boolean;
    entryNode?: boolean;
    middleNode?: boolean;
  };
  hosting: {
    isHosting: boolean;
    provider?: string;
    datacenter?: string;
  };
  malware: {
    isMalware: boolean;
    malwareFamily?: string;
    malwareType?: string;
    firstSeen?: Date;
    lastSeen?: Date;
  };
  spam: {
    isSpam: boolean;
    spamScore?: number;
    spamHausListed?: boolean;
    barracudaListed?: boolean;
  };
  attacks: {
    bruteForce: boolean;
    ddos: boolean;
    phishing: boolean;
    malware: boolean;
    spam: boolean;
    botnet: boolean;
    scanning: boolean;
    sqlInjection: boolean;
    xss: boolean;
    csrf: boolean;
    accountTakeover: boolean;
    credentialStuffing: boolean;
    apiAbuse: boolean;
  };
  behavior: {
    requestFrequency: number; // requests per minute
    errorRate: number; // percentage of 4xx/5xx responses
    uniqueUrls: number;
    uniqueUserAgents: number;
    sessionDuration: number; // average session duration in seconds
    peakActivityHour: number; // hour of day with most activity (0-23)
    geographicAnomaly: boolean;
    timeAnomaly: boolean;
    behavioralAnomaly: boolean;
  };
  whitelist: {
    isWhitelisted: boolean;
    reason?: string;
    whitelistedBy?: string;
    whitelistedAt?: Date;
    expiresAt?: Date;
  };
  blacklist: {
    isBlacklisted: boolean;
    reason?: string;
    blacklistedBy?: string;
    blacklistedAt?: Date;
    expiresAt?: Date;
  };
  metadata: {
    tags: string[];
    notes: string;
    references: string[];
    customFields: Record<string, any>;
  };
}

// Threat Intelligence Configuration
interface ThreatIntelligenceConfig {
  enabled: boolean;
  cacheEnabled: boolean;
  cacheTtl: number; // milliseconds
  maxCacheSize: number;
  updateInterval: number; // milliseconds
  apiKeys: {
    virustotal?: string;
    abuseipdb?: string;
    ipqualityscore?: string;
    shodan?: string;
    censys?: string;
    greynoise?: string;
    ipinfo?: string;
    ipgeolocation?: string;
  };
  thresholds: {
    blockRiskScore: number;
    challengeRiskScore: number;
    suspiciousRiskScore: number;
    rateLimitRiskScore: number;
  };
  rateLimits: {
    malicious: number; // requests per minute
    suspicious: number;
    unknown: number;
    safe: number;
  };
  geographicRestrictions: {
    enabled: boolean;
    allowedCountries: string[];
    blockedCountries: string[];
    challengeCountries: string[];
  };
  asnRestrictions: {
    enabled: boolean;
    blockedAsns: number[];
    suspiciousAsns: number[];
    hostingAsns: number[];
  };
  proxyRestrictions: {
    enabled: boolean;
    blockProxies: boolean;
    blockVpn: boolean;
    blockTor: boolean;
    challengeProxies: boolean;
  };
  behavioralAnalysis: {
    enabled: boolean;
    anomalyThreshold: number;
    learningPeriod: number; // milliseconds
    updateFrequency: number; // milliseconds
  };
}

// Real-time Threat Detection
interface ThreatDetectionEvent {
  timestamp: Date;
  ip: string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  riskScore: number;
  confidence: number;
  indicators: string[];
  rawData: any;
  metadata: {
    requestId?: string;
    sessionId?: string;
    userId?: number;
    userAgent?: string;
    referrer?: string;
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
  };
}

// Behavioral Analysis Profile
interface BehavioralProfile {
  ip: string;
  userAgent: string;
  patterns: {
    requestFrequency: number[]; // requests per hour for last 24 hours
    errorRate: number; // percentage of 4xx/5xx responses
    uniqueUrls: Set<string>;
    uniqueEndpoints: Set<string>;
    peakActivityHours: number[]; // hours with most activity
    sessionDurations: number[]; // session durations in seconds
    geographicLocations: Set<string>;
    deviceFingerprints: Set<string>;
    formSubmissionRate: number; // forms per minute
    fileUploadAttempts: number;
    apiAbuseScore: number; // 0-100
    botScore: number; // 0-100 (0 = human, 100 = bot)
  };
  anomalies: {
    geographicAnomaly: boolean;
    timeAnomaly: boolean;
    behavioralAnomaly: boolean;
    deviceAnomaly: boolean;
    frequencyAnomaly: boolean;
    errorRateAnomaly: boolean;
  };
  riskFactors: {
    rapidRequests: boolean;
    highErrorRate: boolean;
    suspiciousPatterns: boolean;
    automatedBehavior: boolean;
    credentialStuffing: boolean;
    apiAbuse: boolean;
    geographicImpossibleTravel: boolean;
    timeImpossibleTravel: boolean;
  };
  lastUpdated: Date;
  confidence: number;
}

// Threat Intelligence Service
export class ThreatIntelligenceService extends EventEmitter {
  private config: ThreatIntelligenceConfig;
  private ipCache: Map<string, { data: IPReputation; timestamp: number }> = new Map();
  private behavioralProfiles: Map<string, BehavioralProfile> = new Map();
  private threatEvents: ThreatDetectionEvent[] = [];
  private updateTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private isUpdating: boolean = false;

  constructor(config: ThreatIntelligenceConfig) {
    super();
    this.config = config;
    this.initialize();
  }

  private initialize(): void {
    this.startUpdateTimer();
    this.startCleanupTimer();
    this.loadThreatIntelligence();
    console.log('🛡️ Threat Intelligence Service initialized');
  }

  // Get IP reputation with caching
  public async getIPReputation(ip: string, context?: any): Promise<IPReputation> {
    // Validate IP address
    if (!this.isValidIP(ip)) {
      throw new Error('Invalid IP address format');
    }

    // Check cache first
    const cached = this.getCachedReputation(ip);
    if (cached) {
      return cached;
    }

    // Gather intelligence from multiple sources
    const reputation = await this.gatherIntelligence(ip, context);
    
    // Cache the result
    this.cacheReputation(ip, reputation);

    // Analyze behavior
    await this.analyzeBehavior(ip, context);

    // Emit threat detection event if necessary
    if (reputation.riskScore >= this.config.thresholds.suspiciousRiskScore) {
      this.emitThreatEvent(ip, reputation);
    }

    return reputation;
  }

  // Validate IP address format
  private isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  // Get cached reputation
  private getCachedReputation(ip: string): IPReputation | null {
    if (!this.config.cacheEnabled) {
      return null;
    }

    const cached = this.ipCache.get(ip);
    if (cached && Date.now() - cached.timestamp < this.config.cacheTtl) {
      return cached.data;
    }

    // Remove expired cache entry
    if (cached) {
      this.ipCache.delete(ip);
    }

    return null;
  }

  // Cache reputation
  private cacheReputation(ip: string, reputation: IPReputation): void {
    if (!this.config.cacheEnabled) {
      return;
    }

    // Implement cache size limit
    if (this.ipCache.size >= this.config.maxCacheSize) {
      // Remove oldest entries
      const oldestKey = this.ipCache.keys().next().value;
      this.ipCache.delete(oldestKey);
    }

    this.ipCache.set(ip, {
      data: reputation,
      timestamp: Date.now()
    });
  }

  // Gather intelligence from multiple sources
  private async gatherIntelligence(ip: string, context?: any): Promise<IPReputation> {
    const now = new Date();
    
    // Base reputation object
    const reputation: IPReputation = {
      ip,
      reputation: 'unknown',
      riskScore: 0,
      categories: [],
      firstSeen: now,
      lastSeen: now,
      attackTypes: [],
      confidence: 0,
      sources: [],
      geographicInfo: {
        country: 'Unknown',
        countryCode: 'XX',
        region: 'Unknown',
        city: 'Unknown',
        lat: 0,
        lon: 0,
        timezone: 'UTC'
      },
      asn: {
        number: 0,
        organization: 'Unknown',
        type: 'Unknown'
      },
      proxy: { isProxy: false },
      vpn: { isVpn: false },
      tor: { isTor: false },
      hosting: { isHosting: false },
      malware: { isMalware: false },
      spam: { isSpam: false },
      attacks: {
        bruteForce: false,
        ddos: false,
        phishing: false,
        malware: false,
        spam: false,
        botnet: false,
        scanning: false,
        sqlInjection: false,
        xss: false,
        csrf: false,
        accountTakeover: false,
        credentialStuffing: false,
        apiAbuse: false
      },
      behavior: {
        requestFrequency: 0,
        errorRate: 0,
        uniqueUrls: 0,
        uniqueUserAgents: 0,
        sessionDuration: 0,
        peakActivityHour: 0,
        geographicAnomaly: false,
        timeAnomaly: false
      },
      whitelist: { isWhitelisted: false },
      blacklist: { isBlacklisted: false },
      metadata: {
        tags: [],
        notes: '',
        references: [],
        customFields: {}
      }
    };

    // Simulate gathering intelligence from external sources
    // In production, this would call actual threat intelligence APIs
    await this.simulateThreatIntelligence(ip, reputation, context);

    // Apply geographic analysis
    this.analyzeGeographicInfo(reputation);

    // Apply behavioral analysis
    await this.analyzeBehavioralPatterns(ip, reputation);

    // Calculate final risk score
    reputation.riskScore = this.calculateRiskScore(reputation);
    reputation.reputation = this.determineReputation(reputation);

    return reputation;
  }

  // Simulate threat intelligence (replace with actual API calls in production)
  private async simulateThreatIntelligence(ip: string, reputation: IPReputation, context?: any): Promise<void> {
    // Simulate different threat scenarios based on IP patterns
    const ipParts = ip.split('.');
    const lastOctet = parseInt(ipParts[3] || '0');

    // Simulate malicious IPs
    if (lastOctet % 50 === 0) {
      reputation.reputation = 'malicious';
      reputation.riskScore = 85;
      reputation.categories = ['malware', 'botnet', 'spam'];
      reputation.attacks.bruteForce = true;
      reputation.attacks.malware = true;
      reputation.attacks.spam = true;
      reputation.malware.isMalware = true;
      reputation.malware.malwareFamily = 'SimulatedBotnet';
      reputation.malware.malwareType = 'botnet';
      reputation.sources.push('simulated_threat_intel');
    }
    // Simulate suspicious IPs
    else if (lastOctet % 25 === 0) {
      reputation.reputation = 'suspicious';
      reputation.riskScore = 60;
      reputation.categories = ['proxy', 'vpn'];
      reputation.proxy.isProxy = true;
      reputation.proxy.proxyType = 'http';
      reputation.vpn.isVpn = true;
      reputation.sources.push('simulated_proxy_detection');
    }
    // Simulate Tor exit nodes
    else if (lastOctet % 15 === 0) {
      reputation.reputation = 'suspicious';
      reputation.riskScore = 70;
      reputation.categories = ['tor', 'anonymization'];
      reputation.tor.isTor = true;
      reputation.tor.exitNode = true;
      reputation.sources.push('simulated_tor_list');
    }
    // Simulate hosting/datacenter IPs
    else if (lastOctet % 20 === 0) {
      reputation.reputation = 'suspicious';
      reputation.riskScore = 45;
      reputation.categories = ['hosting', 'datacenter'];
      reputation.hosting.isHosting = true;
      reputation.hosting.provider = 'SimulatedHosting';
      reputation.sources.push('simulated_hosting_detection');
    }
    // Simulate spam sources
    else if (lastOctet % 30 === 0) {
      reputation.reputation = 'suspicious';
      reputation.riskScore = 55;
      reputation.categories = ['spam'];
      reputation.spam.isSpam = true;
      reputation.spam.spamScore = 75;
      reputation.sources.push('simulated_spam_list');
    }
    // Default safe IPs
    else {
      reputation.reputation = 'safe';
      reputation.riskScore = 10;
      reputation.categories = ['legitimate'];
      reputation.sources.push('default_safe');
    }

    // Simulate geographic information
    reputation.geographicInfo = {
      country: 'United States',
      countryCode: 'US',
      region: 'California',
      city: 'San Francisco',
      lat: 37.7749,
      lon: -122.4194,
      timezone: 'America/Los_Angeles'
    };

    // Simulate ASN information
    reputation.asn = {
      number: 15169,
      organization: 'Google LLC',
      type: 'ISP'
    };

    reputation.confidence = 75;
  }

  // Analyze geographic information
  private analyzeGeographicInfo(reputation: IPReputation): void {
    // Check for geographic anomalies
    const allowedCountries = this.config.geographicRestrictions.allowedCountries;
    const blockedCountries = this.config.geographicRestrictions.blockedCountries;
    const challengeCountries = this.config.geographicRestrictions.challengeCountries;

    if (this.config.geographicRestrictions.enabled) {
      if (blockedCountries.includes(reputation.geographicInfo.countryCode)) {
        reputation.riskScore += 50;
        reputation.categories.push('blocked_country');
      } else if (challengeCountries.includes(reputation.geographicInfo.countryCode)) {
        reputation.riskScore += 30;
        reputation.categories.push('challenged_country');
      } else if (allowedCountries.length > 0 && !allowedCountries.includes(reputation.geographicInfo.countryCode)) {
        reputation.riskScore += 20;
        reputation.categories.push('unusual_country');
      }
    }
  }

  // Analyze behavioral patterns
  private async analyzeBehavioralPatterns(ip: string, reputation: IPReputation): Promise<void> {
    if (!this.config.behavioralAnalysis.enabled) {
      return;
    }

    // Get or create behavioral profile
    const profile = this.getOrCreateBehavioralProfile(ip);
    
    // Update behavioral analysis
    await this.updateBehavioralProfile(ip, profile);

    // Apply behavioral risk factors
    this.applyBehavioralRiskFactors(reputation, profile);
  }

  // Get or create behavioral profile
  private getOrCreateBehavioralProfile(ip: string): BehavioralProfile {
    let profile = this.behavioralProfiles.get(ip);
    
    if (!profile) {
      profile = {
        ip,
        userAgent: '',
        patterns: {
          requestFrequency: new Array(24).fill(0),
          errorRate: 0,
          uniqueUrls: new Set(),
          uniqueEndpoints: new Set(),
          peakActivityHours: [],
          sessionDurations: [],
          geographicLocations: new Set(),
          deviceFingerprints: new Set(),
          formSubmissionRate: 0,
          fileUploadAttempts: 0,
          apiAbuseScore: 0,
          botScore: 0
        },
        anomalies: {
          geographicAnomaly: false,
          timeAnomaly: false,
          behavioralAnomaly: false,
          deviceAnomaly: false,
          frequencyAnomaly: false,
          errorRateAnomaly: false
        },
        riskFactors: {
          rapidRequests: false,
          highErrorRate: false,
          suspiciousPatterns: false,
          automatedBehavior: false,
          credentialStuffing: false,
          apiAbuse: false,
          geographicImpossibleTravel: false,
          timeImpossibleTravel: false
        },
        lastUpdated: new Date(),
        confidence: 0
      };
      
      this.behavioralProfiles.set(ip, profile);
    }

    return profile;
  }

  // Update behavioral profile
  private async updateBehavioralProfile(ip: string, profile: BehavioralProfile): Promise<void> {
    // Simulate behavioral data (in production, this would come from actual request logs)
    const hour = new Date().getHours();
    profile.patterns.requestFrequency[hour] = Math.floor(Math.random() * 100);
    profile.patterns.errorRate = Math.random() * 20;
    profile.patterns.uniqueUrls.add(`/api/user/${Math.floor(Math.random() * 1000)}`);
    profile.patterns.uniqueEndpoints.add('user_profile');
    profile.patterns.peakActivityHours = [9, 14, 18];
    profile.patterns.sessionDurations.push(Math.floor(Math.random() * 300));
    profile.patterns.formSubmissionRate = Math.random() * 5;
    profile.patterns.apiAbuseScore = Math.random() * 30;
    profile.patterns.botScore = Math.random() * 40;

    // Calculate anomalies
    this.calculateBehavioralAnomalies(profile);
    
    profile.lastUpdated = new Date();
    profile.confidence = Math.min(profile.confidence + 5, 100);
  }

  // Calculate behavioral anomalies
  private calculateBehavioralAnomalies(profile: BehavioralProfile): void {
    // Geographic anomaly
    if (profile.patterns.geographicLocations.size > 3) {
      profile.anomalies.geographicAnomaly = true;
    }

    // Time anomaly (impossible travel)
    const currentHour = new Date().getHours();
    if (profile.patterns.peakActivityHours.length > 0) {
      const lastPeakHour = profile.patterns.peakActivityHours[profile.patterns.peakActivityHours.length - 1];
      if (Math.abs(currentHour - lastPeakHour) > 12) {
        profile.anomalies.timeAnomaly = true;
      }
    }

    // Behavioral anomaly
    if (profile.patterns.botScore > 70) {
      profile.anomalies.behavioralAnomaly = true;
    }

    // Device anomaly
    if (profile.patterns.deviceFingerprints.size > 5) {
      profile.anomalies.deviceAnomaly = true;
    }

    // Frequency anomaly
    const avgRequests = profile.patterns.requestFrequency.reduce((sum, freq) => sum + freq, 0) / 24;
    if (avgRequests > 50) {
      profile.anomalies.frequencyAnomaly = true;
    }

    // Error rate anomaly
    if (profile.patterns.errorRate > 15) {
      profile.anomalies.errorRateAnomaly = true;
    }
  }

  // Apply behavioral risk factors
  private applyBehavioralRiskFactors(reputation: IPReputation, profile: BehavioralProfile): void {
    let riskAdjustment = 0;

    // Anomaly-based adjustments
    if (profile.anomalies.geographicAnomaly) riskAdjustment += 20;
    if (profile.anomalies.timeAnomaly) riskAdjustment += 15;
    if (profile.anomalies.behavioralAnomaly) riskAdjustment += 25;
    if (profile.anomalies.deviceAnomaly) riskAdjustment += 10;
    if (profile.anomalies.frequencyAnomaly) riskAdjustment += 15;
    if (profile.anomalies.errorRateAnomaly) riskAdjustment += 10;

    // Risk factor adjustments
    if (profile.riskFactors.rapidRequests) riskAdjustment += 20;
    if (profile.riskFactors.highErrorRate) riskAdjustment += 15;
    if (profile.riskFactors.automatedBehavior) riskAdjustment += 30;
    if (profile.riskFactors.credentialStuffing) riskAdjustment += 40;
    if (profile.riskFactors.apiAbuse) riskAdjustment += 25;

    reputation.riskScore = Math.min(reputation.riskScore + riskAdjustment, 100);
    reputation.behavior = {
      requestFrequency: profile.patterns.requestFrequency.reduce((sum, freq) => sum + freq, 0) / 24,
      errorRate: profile.patterns.errorRate,
      uniqueUrls: profile.patterns.uniqueUrls.size,
      uniqueUserAgents: profile.patterns.deviceFingerprints.size,
      sessionDuration: profile.patterns.sessionDurations.reduce((sum, dur) => sum + dur, 0) / Math.max(profile.patterns.sessionDurations.length, 1),
      peakActivityHour: profile.patterns.peakActivityHours[0] || 0,
      geographicAnomaly: profile.anomalies.geographicAnomaly,
      timeAnomaly: profile.anomalies.timeAnomaly
    };
  }

  // Calculate final risk score
  private calculateRiskScore(reputation: IPReputation): number {
    let score = reputation.riskScore;

    // Apply confidence weighting
    score = score * (reputation.confidence / 100);

    // Apply whitelist/blacklist overrides
    if (reputation.whitelist.isWhitelisted) {
      return 0;
    }

    if (reputation.blacklist.isBlacklisted) {
      return 100;
    }

    return Math.round(score);
  }

  // Determine final reputation
  private determineReputation(reputation: IPReputation): IPReputation['reputation'] {
    const thresholds = this.config.thresholds;

    if (reputation.whitelist.isWhitelisted) {
      return 'safe';
    }

    if (reputation.blacklist.isBlacklisted) {
      return 'malicious';
    }

    if (reputation.riskScore >= thresholds.blockRiskScore) {
      return 'malicious';
    }

    if (reputation.riskScore >= thresholds.challengeRiskScore) {
      return 'suspicious';
    }

    if (reputation.riskScore >= thresholds.suspiciousRiskScore) {
      return 'suspicious';
    }

    return 'safe';
  }

  // Analyze behavior for specific IP
  public async analyzeBehavior(ip: string, context?: any): Promise<BehavioralProfile> {
    const profile = this.getOrCreateBehavioralProfile(ip);
    await this.updateBehavioralProfile(ip, profile);
    return profile;
  }

  // Emit threat detection event
  private emitThreatEvent(ip: string, reputation: IPReputation): void {
    const event: ThreatDetectionEvent = {
      timestamp: new Date(),
      ip,
      eventType: 'threat_detected',
      severity: reputation.riskScore >= 80 ? 'critical' : reputation.riskScore >= 60 ? 'high' : 'medium',
      description: `Threat detected from ${ip}: ${reputation.categories.join(', ')}`,
      riskScore: reputation.riskScore,
      confidence: reputation.confidence,
      indicators: reputation.categories,
      rawData: reputation,
      metadata: {
        requestId: context?.requestId,
        sessionId: context?.sessionId,
        userId: context?.userId,
        userAgent: context?.userAgent,
        method: context?.method,
        url: context?.url
      }
    };

    this.threatEvents.push(event);
    this.emit('threat-detected', event);
  }

  // Get threat detection events
  public getThreatEvents(limit: number = 100): ThreatDetectionEvent[] {
    return this.threatEvents.slice(-limit);
  }

  // Get security recommendation for IP
  public getSecurityRecommendation(ip: string): {
    action: 'allow' | 'challenge' | 'block' | 'rate_limit';
    reason: string;
    riskScore: number;
    confidence: number;
  } {
    const cached = this.getCachedReputation(ip);
    if (!cached) {
      return {
        action: 'challenge',
        reason: 'Unknown IP reputation',
        riskScore: 50,
        confidence: 0
      };
    }

    const reputation = cached;

    // Apply security rules
    if (reputation.whitelist.isWhitelisted) {
      return {
        action: 'allow',
        reason: 'IP is whitelisted',
        riskScore: 0,
        confidence: 100
      };
    }

    if (reputation.blacklist.isBlacklisted) {
      return {
        action: 'block',
        reason: 'IP is blacklisted',
        riskScore: 100,
        confidence: 100
      };
    }

    // Apply geographic restrictions
    if (this.config.geographicRestrictions.enabled) {
      if (this.config.geographicRestrictions.blockedCountries.includes(reputation.geographicInfo.countryCode)) {
        return {
          action: 'block',
          reason: 'IP from blocked country',
          riskScore: reputation.riskScore,
          confidence: reputation.confidence
        };
      }

      if (this.config.geographicRestrictions.challengeCountries.includes(reputation.geographicInfo.countryCode)) {
        return {
          action: 'challenge',
          reason: 'IP from challenged country',
          riskScore: reputation.riskScore,
          confidence: reputation.confidence
        };
      }
    }

    // Apply proxy restrictions
    if (this.config.proxyRestrictions.enabled) {
      if (this.config.proxyRestrictions.blockTor && reputation.tor.isTor) {
        return {
          action: 'block',
          reason: 'Tor exit node detected',
          riskScore: reputation.riskScore,
          confidence: reputation.confidence
        };
      }

      if (this.config.proxyRestrictions.blockVpn && reputation.vpn.isVpn) {
        return {
          action: 'block',
          reason: 'VPN detected',
          riskScore: reputation.riskScore,
          confidence: reputation.confidence
        };
      }

      if (this.config.proxyRestrictions.blockProxies && reputation.proxy.isProxy) {
        return {
          action: 'block',
          reason: 'Proxy detected',
          riskScore: reputation.riskScore,
          confidence: reputation.confidence
        };
      }

      if (this.config.proxyRestrictions.challengeProxies && (reputation.proxy.isProxy || reputation.vpn.isVpn)) {
        return {
          action: 'challenge',
          reason: 'Proxy/VPN detected',
          riskScore: reputation.riskScore,
          confidence: reputation.confidence
        };
      }
    }

    // Apply risk score thresholds
    const thresholds = this.config.thresholds;

    if (reputation.riskScore >= thresholds.blockRiskScore) {
      return {
        action: 'block',
        reason: 'High risk score',
        riskScore: reputation.riskScore,
        confidence: reputation.confidence
      };
    }

    if (reputation.riskScore >= thresholds.challengeRiskScore) {
      return {
        action: 'challenge',
        reason: 'Medium risk score',
        riskScore: reputation.riskScore,
        confidence: reputation.confidence
      };
    }

    if (reputation.riskScore >= thresholds.rateLimitRiskScore) {
      return {
        action: 'rate_limit',
        reason: 'Low-medium risk score',
        riskScore: reputation.riskScore,
        confidence: reputation.confidence
      };
    }

    return {
      action: 'allow',
      reason: 'Low risk score',
      riskScore: reputation.riskScore,
      confidence: reputation.confidence
    };
  }

  // Start update timer
  private startUpdateTimer(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    this.updateTimer = setInterval(() => {
      this.updateThreatIntelligence();
    }, this.config.updateInterval);
  }

  // Start cleanup timer
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredData();
    }, 3600000); // Clean up every hour
  }

  // Update threat intelligence
  private async updateThreatIntelligence(): Promise<void> {
    if (this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    
    try {
      console.log('🔄 Updating threat intelligence...');
      
      // Update cached reputations
      for (const [ip, cached] of this.ipCache.entries()) {
        if (Date.now() - cached.timestamp > this.config.cacheTtl) {
          // Refresh expired entries
          const newReputation = await this.gatherIntelligence(ip);
          this.cacheReputation(ip, newReputation);
        }
      }

      // Update behavioral profiles
      for (const [ip, profile] of this.behavioralProfiles.entries()) {
        await this.updateBehavioralProfile(ip, profile);
      }

      console.log('✅ Threat intelligence updated');
    } catch (error) {
      console.error('Error updating threat intelligence:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  // Load threat intelligence
  private loadThreatIntelligence(): void {
    // In production, this would load from external threat intelligence feeds
    console.log('📡 Loading threat intelligence feeds...');
  }

  // Cleanup expired data
  private cleanupExpiredData(): void {
    const now = Date.now();
    let removedCount = 0;

    // Clean up old cache entries
    for (const [ip, cached] of this.ipCache.entries()) {
      if (now - cached.timestamp > this.config.cacheTtl * 2) {
        this.ipCache.delete(ip);
        removedCount++;
      }
    }

    // Clean up old behavioral profiles
    for (const [ip, profile] of this.behavioralProfiles.entries()) {
      if (now - profile.lastUpdated.getTime() > 24 * 60 * 60 * 1000) { // 24 hours
        this.behavioralProfiles.delete(ip);
        removedCount++;
      }
    }

    // Clean up old threat events
    const cutoffTime = now - (7 * 24 * 60 * 60 * 1000); // 7 days
    this.threatEvents = this.threatEvents.filter(event => 
      event.timestamp.getTime() > cutoffTime
    );

    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} expired data entries`);
    }
  }

  // Get service statistics
  public getStatistics(): {
    totalIPs: number;
    cachedIPs: number;
    behavioralProfiles: number;
    threatEvents: number;
    reputationBreakdown: {
      safe: number;
      suspicious: number;
      malicious: number;
      unknown: number;
    };
    topThreats: Array<{ type: string; count: number }>;
  } {
    const reputationBreakdown = {
      safe: 0,
      suspicious: number,
      malicious: number,
      unknown: number
    };

    for (const cached of this.ipCache.values()) {
      reputationBreakdown[cached.data.reputation]++;
    }

    const threatTypes: Map<string, number> = new Map();
    for (const event of this.threatEvents) {
      threatTypes.set(event.eventType, (threatTypes.get(event.eventType) || 0) + 1);
    }

    const topThreats = Array.from(threatTypes.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([type, count]) => ({ type, count }));

    return {
      totalIPs: this.ipCache.size,
      cachedIPs: this.ipCache.size,
      behavioralProfiles: this.behavioralProfiles.size,
      threatEvents: this.threatEvents.length,
      reputationBreakdown,
      topThreats
    };
  }

  // Cleanup service
  public cleanup(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = null;
    }

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    this.ipCache.clear();
    this.behavioralProfiles.clear();
    this.threatEvents = [];
    this.removeAllListeners();
  }
}

// Export singleton instance
export const threatIntelligence = new ThreatIntelligenceService({
  enabled: true,
  cacheEnabled: true,
  cacheTtl: 3600000, // 1 hour
  maxCacheSize: 10000,
  updateInterval: 300000, // 5 minutes
  apiKeys: {},
  thresholds: {
    blockRiskScore: 80,
    challengeRiskScore: 60,
    suspiciousRiskScore: 40,
    rateLimitRiskScore: 30
  },
  rateLimits: {
    malicious: 10,
    suspicious: 30,
    unknown: 60,
    safe: 120
  },
  geographicRestrictions: {
    enabled: false,
    allowedCountries: [],
    blockedCountries: [],
    challengeCountries: []
  },
  asnRestrictions: {
    enabled: false,
    blockedAsns: [],
    suspiciousAsns: [],
    hostingAsns: []
  },
  proxyRestrictions: {
    enabled: false,
    blockProxies: false,
    blockVpn: false,
    blockTor: false,
    challengeProxies: false
  },
  behavioralAnalysis: {
    enabled: true,
    anomalyThreshold: 70,
    learningPeriod: 86400000, // 24 hours
    updateFrequency: 3600000 // 1 hour
  }
});

export default ThreatIntelligenceService;
