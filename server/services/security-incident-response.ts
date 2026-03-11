// Security Incident Response and Threat Detection System
import { EventEmitter } from 'events';
import crypto from 'crypto';

// Incident Severity Levels
enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}

// Incident Status
enum IncidentStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  CONTAINED = 'contained',
  MITIGATED = 'mitigated',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  FALSE_POSITIVE = 'false_positive'
}

// Incident Types
enum IncidentType {
  DATA_BREACH = 'data_breach',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  MALWARE_DETECTION = 'malware_detection',
  DDOS_ATTACK = 'ddos_attack',
  BRUTE_FORCE_ATTACK = 'brute_force_attack',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  SQL_INJECTION = 'sql_injection',
  XSS_ATTACK = 'xss_attack',
  PHISHING_ATTEMPT = 'phishing_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SYSTEM_COMPROMISE = 'system_compromise',
  INSIDER_THREAT = 'insider_threat',
  THIRD_PARTY_BREACH = 'third_party_breach',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  CONFIGURATION_DRIFT = 'configuration_drift'
}

// Security Incident Interface
interface SecurityIncident {
  id: string;
  incidentId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  detectedAt: Date;
  reportedBy: string;
  assignedTo?: string;
  affectedSystems: string[];
  affectedUsers: number;
  indicators: {
    [key: string]: any;
  };
  evidence: {
    logs: string[];
    files: string[];
    networkData: string[];
    screenshots: string[];
  };
  impact: {
    confidentiality: 'none' | 'low' | 'medium' | 'high' | 'critical';
    integrity: 'none' | 'low' | 'medium' | 'high' | 'critical';
    availability: 'none' | 'low' | 'medium' | 'high' | 'critical';
    financial?: number;
    reputation?: 'none' | 'low' | 'medium' | 'high' | 'critical';
    compliance?: string[];
  };
  timeline: IncidentTimelineEvent[];
  responseActions: ResponseAction[];
  lessonsLearned: string[];
  postMortem?: PostMortemAnalysis;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  tags: string[];
  metadata: {
    source: string;
    confidence: number;
    falsePositiveRate: number;
    relatedIncidents: string[];
    threatIntelligence: any;
  };
}

// Incident Timeline Event
interface IncidentTimelineEvent {
  id: string;
  timestamp: Date;
  type: 'detection' | 'containment' | 'eradication' | 'recovery' | 'notification' | 'escalation';
  description: string;
  actor: string;
  automated: boolean;
  evidence?: string[];
}

// Response Action
interface ResponseAction {
  id: string;
  type: 'isolate' | 'block' | 'quarantine' | 'disable' | 'enable' | 'patch' | 'update' | 'notify' | 'escalate';
  description: string;
  target: string;
  parameters: any;
  executedAt?: Date;
  executedBy?: string;
  success?: boolean;
  result?: any;
  rollbackAction?: ResponseAction;
}

// Post-Mortem Analysis
interface PostMortemAnalysis {
  conductedAt: Date;
  conductedBy: string;
  rootCause: string;
  contributingFactors: string[];
  timelineAnalysis: string;
  responseEffectiveness: 'excellent' | 'good' | 'adequate' | 'poor';
  improvements: string[];
  preventiveMeasures: string[];
  recommendations: string[];
  lessonsLearned: string[];
}

// Threat Detection Rule
interface ThreatDetectionRule {
  id: string;
  name: string;
  description: string;
  type: 'signature' | 'behavioral' | 'anomaly' | 'heuristic';
  severity: IncidentSeverity;
  conditions: {
    [key: string]: any;
  };
  thresholds: {
    count: number;
    timeWindow: number;
    confidence: number;
  };
  actions: ResponseAction[];
  enabled: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  lastTriggered?: Date;
  falsePositiveRate: number;
}

// Threat Intelligence
interface ThreatIntelligence {
  id: string;
  source: string;
  type: 'ip_reputation' | 'domain_reputation' | 'file_hash' | 'url_reputation' | 'vulnerability' | 'malware';
  value: string;
  reputation: 'safe' | 'suspicious' | 'malicious' | 'unknown';
  confidence: number;
  firstSeen: Date;
  lastSeen: Date;
  metadata: {
    [key: string]: any;
  };
  relatedThreats: string[];
  campaigns: string[];
  attribution: {
    actor?: string;
    group?: string;
    country?: string;
    motivation?: string;
  };
}

// Security Incident Manager
class SecurityIncidentManager extends EventEmitter {
  private incidents: Map<string, SecurityIncident> = new Map();
  private detectionRules: Map<string, ThreatDetectionRule> = new Map();
  private threatIntelligence: Map<string, ThreatIntelligence> = new Map();
  private responsePlaybooks: Map<IncidentType, ResponsePlaybook> = new Map();
  private notificationChannels: NotificationChannel[] = [];
  private escalationMatrix: EscalationLevel[] = [];

  constructor() {
    super();
    this.initializeDefaultPlaybooks();
    this.initializeEscalationMatrix();
  }

  private initializeDefaultPlaybooks(): void {
    // Default response playbooks for different incident types
    this.responsePlaybooks.set(IncidentType.DATA_BREACH, {
      name: 'Data Breach Response',
      description: 'Response playbook for data breach incidents',
      phases: [
        {
          name: 'Immediate Response',
          actions: [
            { type: 'isolate', description: 'Isolate affected systems', target: 'affected_systems' },
            { type: 'notify', description: 'Notify data protection officer', target: 'dpo' },
            { type: 'notify', description: 'Notify legal team', target: 'legal' }
          ]
        },
        {
          name: 'Assessment',
          actions: [
            { type: 'quarantine', description: 'Preserve evidence', target: 'evidence' },
            { type: 'notify', description: 'Assess data sensitivity', target: 'data_classification' }
          ]
        },
        {
          name: 'Containment',
          actions: [
            { type: 'patch', description: 'Apply security patches', target: 'vulnerable_systems' },
            { type: 'update', description: 'Update access controls', target: 'access_controls' }
          ]
        }
      ]
    });

    this.responsePlaybooks.set(IncidentType.BRUTE_FORCE_ATTACK, {
      name: 'Brute Force Response',
      description: 'Response playbook for brute force attacks',
      phases: [
        {
          name: 'Immediate Response',
          actions: [
            { type: 'block', description: 'Block attacking IP addresses', target: 'source_ips' },
            { type: 'disable', description: 'Disable compromised accounts', target: 'affected_accounts' },
            { type: 'notify', description: 'Notify security team', target: 'security_team' }
          ]
        },
        {
          name: 'Investigation',
          actions: [
            { type: 'quarantine', description: 'Collect logs and evidence', target: 'logs' },
            { type: 'analyze', description: 'Analyze attack patterns', target: 'attack_patterns' }
          ]
        }
      ]
    });

    this.responsePlaybooks.set(IncidentType.MALWARE_DETECTION, {
      name: 'Malware Response',
      description: 'Response playbook for malware detection',
      phases: [
        {
          name: 'Immediate Response',
          actions: [
            { type: 'isolate', description: 'Isolate infected systems', target: 'infected_systems' },
            { type: 'quarantine', description: 'Quarantine malicious files', target: 'malicious_files' },
            { type: 'scan', description: 'Run full system scan', target: 'all_systems' }
          ]
        },
        {
          name: 'Remediation',
          actions: [
            { type: 'remove', description: 'Remove malware', target: 'malware_instances' },
            { type: 'patch', description: 'Update antivirus definitions', target: 'antivirus' },
            { type: 'update', description: 'Update system patches', target: 'system_patches' }
          ]
        }
      ]
    });
  }

  private initializeEscalationMatrix(): void {
    this.escalationMatrix = [
      {
        level: 1,
        name: 'Security Team',
        contacts: ['security-team@company.com'],
        responseTime: 30 * 60 * 1000, // 30 minutes
        escalationCriteria: ['severity >= medium', 'no response within 30 minutes']
      },
      {
        level: 2,
        name: 'Security Manager',
        contacts: ['security-manager@company.com'],
        responseTime: 15 * 60 * 1000, // 15 minutes
        escalationCriteria: ['severity >= high', 'no response within 15 minutes']
      },
      {
        level: 3,
        name: 'CISO',
        contacts: ['ciso@company.com'],
        responseTime: 10 * 60 * 1000, // 10 minutes
        escalationCriteria: ['severity >= critical', 'no response within 10 minutes']
      },
      {
        level: 4,
        name: 'Executive Team',
        contacts: ['executives@company.com'],
        responseTime: 5 * 60 * 1000, // 5 minutes
        escalationCriteria: ['severity = emergency', 'no response within 5 minutes']
      }
    ];
  }

  // Incident Detection and Creation
  async detectAndCreateIncident(detectionData: {
    type: IncidentType;
    severity: IncidentSeverity;
    title: string;
    description: string;
    source: string;
    indicators: any;
    affectedSystems?: string[];
    affectedUsers?: number;
    confidence?: number;
  }): Promise<SecurityIncident> {
    
    // Check for existing similar incidents
    const similarIncident = this.findSimilarIncident(detectionData);
    if (similarIncident) {
      return this.updateIncident(similarIncident.id, {
        indicators: { ...similarIncident.indicators, ...detectionData.indicators },
        affectedSystems: [...new Set([...similarIncident.affectedSystems, ...(detectionData.affectedSystems || [])])],
        affectedUsers: Math.max(similarIncident.affectedUsers, detectionData.affectedUsers || 0)
      });
    }

    // Create new incident
    const incident: SecurityIncident = {
      id: crypto.randomUUID(),
      incidentId: this.generateIncidentId(detectionData.type),
      type: detectionData.type,
      severity: detectionData.severity,
      status: IncidentStatus.OPEN,
      title: detectionData.title,
      description: detectionData.description,
      detectedAt: new Date(),
      reportedBy: detectionData.source,
      affectedSystems: detectionData.affectedSystems || [],
      affectedUsers: detectionData.affectedUsers || 0,
      indicators: detectionData.indicators,
      evidence: {
        logs: [],
        files: [],
        networkData: [],
        screenshots: []
      },
      impact: {
        confidentiality: 'none',
        integrity: 'none',
        availability: 'none'
      },
      timeline: [{
        id: crypto.randomUUID(),
        timestamp: new Date(),
        type: 'detection',
        description: 'Incident detected by security system',
        actor: detectionData.source,
        automated: true
      }],
      responseActions: [],
      lessonsLearned: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [detectionData.type, 'automated'],
      metadata: {
        source: detectionData.source,
        confidence: detectionData.confidence || 0.8,
        falsePositiveRate: 0,
        relatedIncidents: [],
        threatIntelligence: {}
      }
    };

    this.incidents.set(incident.id, incident);
    
    // Emit incident created event
    this.emit('incident:created', incident);
    
    // Start automated response
    this.startAutomatedResponse(incident);
    
    // Send notifications
    await this.notifyIncident(incident);
    
    return incident;
  }

  private generateIncidentId(type: IncidentType): string {
    const prefix = type.toUpperCase().replace('_', '');
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const sequence = this.incidents.size + 1;
    return `${prefix}-${timestamp}-${sequence.toString().padStart(4, '0')}`;
  }

  private findSimilarIncident(detectionData: any): SecurityIncident | null {
    const recentIncidents = Array.from(this.incidents.values())
      .filter(incident => 
        incident.type === detectionData.type &&
        incident.status !== IncidentStatus.CLOSED &&
        incident.status !== IncidentStatus.FALSE_POSITIVE &&
        (new Date().getTime() - incident.createdAt.getTime()) < 24 * 60 * 60 * 1000 // Within 24 hours
      );

    // Simple similarity check - in production, use more sophisticated algorithms
    for (const incident of recentIncidents) {
      const similarityScore = this.calculateSimilarity(detectionData, incident);
      if (similarityScore > 0.7) {
        return incident;
      }
    }

    return null;
  }

  private calculateSimilarity(detectionData: any, incident: SecurityIncident): number {
    let score = 0;
    
    // Check source IP similarity
    if (detectionData.indicators?.sourceIP && incident.indicators?.sourceIP) {
      if (detectionData.indicators.sourceIP === incident.indicators.sourceIP) {
        score += 0.4;
      }
    }

    // Check affected systems similarity
    if (detectionData.affectedSystems && incident.affectedSystems) {
      const intersection = detectionData.affectedSystems.filter((system: string) => 
        incident.affectedSystems.includes(system)
      );
      if (intersection.length > 0) {
        score += (intersection.length / Math.max(detectionData.affectedSystems.length, incident.affectedSystems.length)) * 0.3;
      }
    }

    // Check severity similarity
    if (detectionData.severity === incident.severity) {
      score += 0.3;
    }

    return Math.min(score, 1.0);
  }

  // Automated Response
  private async startAutomatedResponse(incident: SecurityIncident): Promise<void> {
    const playbook = this.responsePlaybooks.get(incident.type);
    if (!playbook) {
      console.log(`No automated response playbook for incident type: ${incident.type}`);
      return;
    }

    console.log(`🤖 Starting automated response for incident: ${incident.incidentId}`);

    for (const phase of playbook.phases) {
      console.log(`Executing phase: ${phase.name}`);
      
      for (const action of phase.actions) {
        try {
          await this.executeResponseAction(incident, action);
        } catch (error) {
          console.error(`Failed to execute action: ${action.description}`, error);
        }
      }
    }
  }

  private async executeResponseAction(incident: SecurityIncident, action: ResponseAction): Promise<void> {
    const responseAction: ResponseAction = {
      ...action,
      id: crypto.randomUUID(),
      executedAt: new Date(),
      executedBy: 'automated-system'
    };

    try {
      switch (action.type) {
        case 'isolate':
          await this.isolateSystem(incident, action.target, action.parameters);
          break;
        case 'block':
          await this.blockEntity(incident, action.target, action.parameters);
          break;
        case 'quarantine':
          await this.quarantineEntity(incident, action.target, action.parameters);
          break;
        case 'disable':
          await this.disableEntity(incident, action.target, action.parameters);
          break;
        case 'notify':
          await this.sendNotification(incident, action.target, action.parameters);
          break;
        case 'scan':
          await this.runSecurityScan(incident, action.target, action.parameters);
          break;
        case 'patch':
          await this.applySecurityPatch(incident, action.target, action.parameters);
          break;
        case 'update':
          await this.updateSecurityControls(incident, action.target, action.parameters);
          break;
        default:
          console.log(`Unknown action type: ${action.type}`);
      }

      responseAction.success = true;
      responseAction.result = { status: 'completed' };
    } catch (error) {
      responseAction.success = false;
      responseAction.result = { status: 'failed', error: error.message };
    }

    incident.responseActions.push(responseAction);
    
    // Add to timeline
    incident.timeline.push({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'containment',
      description: `Executed: ${action.description}`,
      actor: 'automated-system',
      automated: true
    });

    this.emit('response:action:executed', { incident, action: responseAction });
  }

  // Response Action Implementations
  private async isolateSystem(incident: SecurityIncident, target: string, parameters: any): Promise<void> {
    console.log(`🔒 Isolating system: ${target}`);
    // Implementation would integrate with network security tools
    // For example: firewall rules, network segmentation, etc.
  }

  private async blockEntity(incident: SecurityIncident, target: string, parameters: any): Promise<void> {
    console.log(`🚫 Blocking entity: ${target}`);
    // Implementation would integrate with security tools
    // For example: IP blocking, account suspension, etc.
  }

  private async quarantineEntity(incident: SecurityIncident, target: string, parameters: any): Promise<void> {
    console.log(`📦 Quarantining entity: ${target}`);
    // Implementation would integrate with security tools
    // For example: file quarantine, system isolation, etc.
  }

  private async disableEntity(incident: SecurityIncident, target: string, parameters: any): Promise<void> {
    console.log(`⏸️ Disabling entity: ${target}`);
    // Implementation would integrate with system management tools
    // For example: account disablement, service shutdown, etc.
  }

  private async sendNotification(incident: SecurityIncident, target: string, parameters: any): Promise<void> {
    console.log(`📧 Sending notification to: ${target}`);
    // Implementation would integrate with notification systems
    // For example: email, Slack, SMS, etc.
  }

  private async runSecurityScan(incident: SecurityIncident, target: string, parameters: any): Promise<void> {
    console.log(`🔍 Running security scan on: ${target}`);
    // Implementation would integrate with security scanning tools
    // For example: vulnerability scanners, antivirus, etc.
  }

  private async applySecurityPatch(incident: SecurityIncident, target: string, parameters: any): Promise<void> {
    console.log(`🔧 Applying security patch to: ${target}`);
    // Implementation would integrate with patch management systems
  }

  private async updateSecurityControls(incident: SecurityIncident, target: string, parameters: any): Promise<void> {
    console.log(`🛡️ Updating security controls for: ${target}`);
    // Implementation would integrate with security management systems
  }

  // Notification and Escalation
  private async notifyIncident(incident: SecurityIncident): Promise<void> {
    // Send immediate notifications
    const notification = {
      incidentId: incident.incidentId,
      type: incident.type,
      severity: incident.severity,
      title: incident.title,
      description: incident.description,
      detectedAt: incident.detectedAt,
      affectedSystems: incident.affectedSystems,
      affectedUsers: incident.affectedUsers
    };

    this.emit('notification:incident', notification);
    
    // Schedule escalation if needed
    this.scheduleEscalation(incident);
  }

  private scheduleEscalation(incident: SecurityIncident): void {
    if (incident.severity === IncidentSeverity.LOW) return;

    const escalationLevel = this.getEscalationLevel(incident.severity);
    if (escalationLevel) {
      setTimeout(() => {
        this.escalateIncident(incident, escalationLevel);
      }, escalationLevel.responseTime);
    }
  }

  private getEscalationLevel(severity: IncidentSeverity): EscalationLevel | null {
    return this.escalationMatrix.find(level => 
      level.escalationCriteria.some(criterion => {
        if (criterion.includes('severity')) {
          const severityMatch = criterion.match(/severity\s*>=?\s*(\w+)/);
          if (severityMatch) {
            const requiredSeverity = severityMatch[1];
            return this.compareSeverity(severity, requiredSeverity as IncidentSeverity) >= 0;
          }
        }
        return false;
      })
    ) || null;
  }

  private compareSeverity(severity1: IncidentSeverity, severity2: IncidentSeverity): number {
    const severityOrder = [IncidentSeverity.LOW, IncidentSeverity.MEDIUM, IncidentSeverity.HIGH, IncidentSeverity.CRITICAL, IncidentSeverity.EMERGENCY];
    const index1 = severityOrder.indexOf(severity1);
    const index2 = severityOrder.indexOf(severity2);
    return index1 - index2;
  }

  private escalateIncident(incident: SecurityIncident, escalationLevel: EscalationLevel): void {
    console.log(`📢 Escalating incident ${incident.incidentId} to ${escalationLevel.name}`);
    
    incident.timeline.push({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'escalation',
      description: `Incident escalated to ${escalationLevel.name}`,
      actor: 'escalation-system',
      automated: true
    });

    this.emit('incident:escalated', { incident, escalationLevel });
  }

  // Incident Management
  async updateIncident(incidentId: string, updates: Partial<SecurityIncident>): Promise<SecurityIncident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    Object.assign(incident, updates, { updatedAt: new Date() });
    
    this.emit('incident:updated', incident);
    return incident;
  }

  async assignIncident(incidentId: string, assignee: string): Promise<SecurityIncident> {
    return this.updateIncident(incidentId, {
      assignedTo: assignee,
      status: IncidentStatus.INVESTIGATING
    });
  }

  async resolveIncident(incidentId: string, resolution: {
    summary: string;
    rootCause: string;
    lessonsLearned: string[];
    preventiveMeasures: string[];
  }): Promise<SecurityIncident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    incident.status = IncidentStatus.RESOLVED;
    incident.resolvedAt = new Date();
    incident.lessonsLearned = resolution.lessonsLearned;
    
    incident.timeline.push({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'recovery',
      description: `Incident resolved: ${resolution.summary}`,
      actor: incident.assignedTo || 'system',
      automated: false
    });

    this.emit('incident:resolved', incident);
    return incident;
  }

  async closeIncident(incidentId: string, postMortem?: PostMortemAnalysis): Promise<SecurityIncident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident not found: ${incidentId}`);
    }

    if (incident.status !== IncidentStatus.RESOLVED) {
      throw new Error('Cannot close incident that is not resolved');
    }

    incident.status = IncidentStatus.CLOSED;
    incident.closedAt = new Date();
    incident.postMortem = postMortem;
    
    incident.timeline.push({
      id: crypto.randomUUID(),
      timestamp: new Date(),
      type: 'notification',
      description: 'Incident closed',
      actor: incident.assignedTo || 'system',
      automated: false
    });

    this.emit('incident:closed', incident);
    return incident;
  }

  // Threat Detection Rules
  async createDetectionRule(rule: Omit<ThreatDetectionRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ThreatDetectionRule> {
    const detectionRule: ThreatDetectionRule = {
      ...rule,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      falsePositiveRate: 0
    };

    this.detectionRules.set(detectionRule.id, detectionRule);
    this.emit('detection:rule:created', detectionRule);
    return detectionRule;
  }

  async updateDetectionRule(ruleId: string, updates: Partial<ThreatDetectionRule>): Promise<ThreatDetectionRule> {
    const rule = this.detectionRules.get(ruleId);
    if (!rule) {
      throw new Error(`Detection rule not found: ${ruleId}`);
    }

    Object.assign(rule, updates, { updatedAt: new Date() });
    this.emit('detection:rule:updated', rule);
    return rule;
  }

  async deleteDetectionRule(ruleId: string): Promise<void> {
    const deleted = this.detectionRules.delete(ruleId);
    if (deleted) {
      this.emit('detection:rule:deleted', ruleId);
    }
  }

  // Threat Intelligence
  async addThreatIntelligence(intelligence: Omit<ThreatIntelligence, 'id'>): Promise<ThreatIntelligence> {
    const threatIntel: ThreatIntelligence = {
      ...intelligence,
      id: crypto.randomUUID()
    };

    this.threatIntelligence.set(threatIntel.id, threatIntel);
    this.emit('threat:intelligence:added', threatIntel);
    return threatIntel;
  }

  // Reporting and Analytics
  getIncidentStats(timeRange: '1h' | '24h' | '7d' | '30d' | '90d' = '30d'): {
    totalIncidents: number;
    incidentsByType: Record<IncidentType, number>;
    incidentsBySeverity: Record<IncidentSeverity, number>;
    incidentsByStatus: Record<IncidentStatus, number>;
    averageResponseTime: number;
    averageResolutionTime: number;
    falsePositiveRate: number;
  } {
    const timeWindows = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };

    const cutoffTime = new Date(Date.now() - timeWindows[timeRange]);
    const recentIncidents = Array.from(this.incidents.values())
      .filter(incident => incident.createdAt >= cutoffTime);

    const stats = {
      totalIncidents: recentIncidents.length,
      incidentsByType: {} as Record<IncidentType, number>,
      incidentsBySeverity: {} as Record<IncidentSeverity, number>,
      incidentsByStatus: {} as Record<IncidentStatus, number>,
      averageResponseTime: 0,
      averageResolutionTime: 0,
      falsePositiveRate: 0
    };

    // Initialize counts
    Object.values(IncidentType).forEach(type => stats.incidentsByType[type] = 0);
    Object.values(IncidentSeverity).forEach(severity => stats.incidentsBySeverity[severity] = 0);
    Object.values(IncidentStatus).forEach(status => stats.incidentsByStatus[status] = 0);

    // Count incidents
    let totalResponseTime = 0;
    let totalResolutionTime = 0;
    let resolvedIncidents = 0;
    let falsePositives = 0;

    recentIncidents.forEach(incident => {
      stats.incidentsByType[incident.type]++;
      stats.incidentsBySeverity[incident.severity]++;
      stats.incidentsByStatus[incident.status]++;

      if (incident.assignedTo && incident.timeline.length > 0) {
        const assignmentEvent = incident.timeline.find(event => event.type === 'notification');
        if (assignmentEvent) {
          totalResponseTime += assignmentEvent.timestamp.getTime() - incident.createdAt.getTime();
        }
      }

      if (incident.resolvedAt) {
        totalResolutionTime += incident.resolvedAt.getTime() - incident.createdAt.getTime();
        resolvedIncidents++;
      }

      if (incident.status === IncidentStatus.FALSE_POSITIVE) {
        falsePositives++;
      }
    });

    stats.averageResponseTime = resolvedIncidents > 0 ? totalResponseTime / resolvedIncidents : 0;
    stats.averageResolutionTime = resolvedIncidents > 0 ? totalResolutionTime / resolvedIncidents : 0;
    stats.falsePositiveRate = recentIncidents.length > 0 ? (falsePositives / recentIncidents.length) * 100 : 0;

    return stats;
  }

  // Getters
  getIncidents(): SecurityIncident[] {
    return Array.from(this.incidents.values());
  }

  getIncidentById(id: string): SecurityIncident | undefined {
    return this.incidents.get(id);
  }

  getDetectionRules(): ThreatDetectionRule[] {
    return Array.from(this.detectionRules.values());
  }

  getThreatIntelligence(): ThreatIntelligence[] {
    return Array.from(this.threatIntelligence.values());
  }
}

// Supporting Interfaces
interface ResponsePlaybook {
  name: string;
  description: string;
  phases: ResponsePhase[];
}

interface ResponsePhase {
  name: string;
  actions: ResponseAction[];
}

interface EscalationLevel {
  level: number;
  name: string;
  contacts: string[];
  responseTime: number;
  escalationCriteria: string[];
}

interface NotificationChannel {
  type: 'email' | 'slack' | 'sms' | 'webhook';
  config: any;
  enabled: boolean;
}

// Export singleton instance
export const securityIncidentManager = new SecurityIncidentManager();
export { 
  SecurityIncident, 
  IncidentType, 
  IncidentSeverity, 
  IncidentStatus,
  ThreatDetectionRule,
  ThreatIntelligence,
  SecurityIncidentManager 
};