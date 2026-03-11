import crypto from 'crypto';
import { EventEmitter } from 'events';

// Security Incident Types
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency';
export type IncidentStatus = 'detected' | 'analyzing' | 'contained' | 'eradicated' | 'recovered' | 'closed';
export type IncidentType = 
  | 'brute_force_attack'
  | 'sql_injection_attempt'
  | 'xss_attack'
  | 'csrf_attack'
  | 'authentication_bypass'
  | 'authorization_violation'
  | 'data_exfiltration'
  | 'malware_detection'
  | 'suspicious_activity'
  | 'dos_attack'
  | 'api_abuse'
  | 'credential_stuffing'
  | 'account_takeover'
  | 'privilege_escalation'
  | 'session_hijacking'
  | 'ip_reputation_violation'
  | 'geographic_anomaly'
  | 'behavioral_anomaly'
  | 'device_anomaly'
  | 'rate_limit_exceeded'
  | 'security_rule_violation'
  | 'encryption_failure'
  | 'certificate_validation_error'
  | 'secure_channel_violation';

// Incident Response Team
interface IncidentResponseTeam {
  primary: {
    name: string;
    email: string;
    phone: string;
    role: 'incident_commander' | 'security_analyst' | 'system_admin' | 'developer' | 'manager';
    escalationLevel: number;
  }[];
  backup: {
    name: string;
    email: string;
    phone: string;
    role: string;
    escalationLevel: number;
  }[];
  external: {
    name: string;
    organization: string;
    contact: string;
    service: string;
    escalationLevel: number;
  }[];
}

// Security Incident
export interface SecurityIncident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  priority: number; // 1-5 (1 = highest)
  detectedAt: Date;
  acknowledgedAt?: Date;
  containedAt?: Date;
  eradicatedAt?: Date;
  recoveredAt?: Date;
  closedAt?: Date;
  reporter: {
    id?: string;
    name: string;
    email: string;
    role: string;
    source: 'system' | 'user' | 'external' | 'automated';
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  affectedAssets: {
    systems: string[];
    applications: string[];
    databases: string[];
    networks: string[];
    users: string[];
    data: string[];
  };
  threatActors: {
    ipAddresses: string[];
    userAgents: string[];
    sessionIds: string[];
    userIds: string[];
    deviceIds: string[];
    geographicLocations: string[];
    organizations?: string[];
  };
  attackVectors: {
    entryPoints: string[];
    vulnerabilities: string[];
    exploits: string[];
    tools: string[];
    techniques: string[];
  };
  impactAssessment: {
    confidentiality: 'none' | 'low' | 'medium' | 'high' | 'critical';
    integrity: 'none' | 'low' | 'medium' | 'high' | 'critical';
    availability: 'none' | 'low' | 'medium' | 'high' | 'critical';
    financial: number; // estimated financial impact
    reputation: 'none' | 'low' | 'medium' | 'high' | 'critical';
    compliance: 'none' | 'low' | 'medium' | 'high' | 'critical';
    operational: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  evidence: {
    logs: string[];
    screenshots: string[];
    networkTraffic: string[];
    files: string[];
    memoryDumps: string[];
    diskImages: string[];
    malwareSamples: string[];
    configurationFiles: string[];
  };
  timeline: Array<{
    timestamp: Date;
    phase: 'detection' | 'analysis' | 'containment' | 'eradication' | 'recovery' | 'lessons_learned';
    description: string;
    actor: string;
    action: string;
    result: string;
  }>;
  responseActions: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
    completed: string[];
    inProgress: string[];
    pending: string[];
  };
  communicationLog: Array<{
    timestamp: Date;
    from: string;
    to: string[];
    subject: string;
    message: string;
    channel: 'email' | 'slack' | 'phone' | 'sms' | 'teams' | 'webhook';
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
  lessonsLearned: string[];
  recommendations: string[];
  postMortem: {
    summary: string;
    rootCause: string;
    contributingFactors: string[];
    correctiveActions: string[];
    preventiveActions: string[];
    improvements: string[];
  };
  tags: string[];
  metadata: Record<string, any>;
}

// Incident Response Plan
interface IncidentResponsePlan {
  id: string;
  name: string;
  description: string;
  triggers: {
    severities: IncidentSeverity[];
    types: IncidentType[];
    riskScore: number;
    thresholds: {
      eventsPerMinute: number;
      uniqueIps: number;
      affectedUsers: number;
      dataVolume: number;
    };
  };
  responseTeam: IncidentResponseTeam;
  procedures: {
    detection: string[];
    analysis: string[];
    containment: string[];
    eradication: string[];
    recovery: string[];
    lessonsLearned: string[];
  };
  automation: {
    autoBlock: boolean;
    autoIsolate: boolean;
    autoNotify: boolean;
    autoCollectEvidence: boolean;
    autoEscalate: boolean;
  };
  escalation: {
    levels: Array<{
      level: number;
      conditions: string[];
      actions: string[];
      timeframe: number; // minutes
      notify: string[];
    }>;
    timeframes: {
      initialResponse: number; // minutes
      escalation1: number;
      escalation2: number;
      escalation3: number;
      resolution: number;
    };
  };
  communication: {
    internal: {
      channels: string[];
      templates: Record<string, string>;
    };
    external: {
      channels: string[];
      templates: Record<string, string>;
      legalRequired: boolean;
      regulatoryRequired: boolean;
    };
  };
}

// Alert Configuration
interface AlertConfiguration {
  enabled: boolean;
  channels: {
    email: {
      enabled: boolean;
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
          user: string;
          pass: string;
        };
      };
      recipients: string[];
      templates: Record<string, string>;
    };
    slack: {
      enabled: boolean;
      webhookUrl: string;
      channel: string;
      username: string;
      iconEmoji: string;
      templates: Record<string, string>;
    };
    sms: {
      enabled: boolean;
      provider: string;
      apiKey: string;
      from: string;
      recipients: string[];
      templates: Record<string, string>;
    };
    webhook: {
      enabled: boolean;
      url: string;
      headers: Record<string, string>;
      timeout: number;
      templates: Record<string, string>;
    };
    teams: {
      enabled: boolean;
      webhookUrl: string;
      templates: Record<string, string>;
    };
  };
  severityThreshold: IncidentSeverity;
  rateLimiting: {
    enabled: boolean;
    maxAlertsPerHour: number;
    maxAlertsPerDay: number;
    burstThreshold: number;
  };
  filtering: {
    deduplication: boolean;
    suppression: boolean;
    escalation: boolean;
    correlation: boolean;
  };
}

// Incident Response Service
export class IncidentResponseService extends EventEmitter {
  private incidents: Map<string, SecurityIncident> = new Map();
  private responsePlans: Map<string, IncidentResponsePlan> = new Map();
  private alertConfig: AlertConfiguration;
  private isProcessing: boolean = false;
  private incidentQueue: any[] = [];
  private processingTimer: NodeJS.Timeout | null = null;
  private escalationTimer: NodeJS.Timeout | null = null;
  private incidentCounter: number = 0;

  constructor(alertConfig: AlertConfiguration) {
    super();
    this.alertConfig = alertConfig;
    this.initializeResponsePlans();
    this.startProcessing();
    this.startEscalationMonitoring();
  }

  // Initialize default response plans
  private initializeResponsePlans(): void {
    const defaultPlans: IncidentResponsePlan[] = [
      {
        id: 'critical-security-incident',
        name: 'Critical Security Incident Response',
        description: 'Response plan for critical security incidents',
        triggers: {
          severities: ['critical', 'emergency'],
          types: ['sql_injection_attempt', 'xss_attack', 'authentication_bypass', 'data_exfiltration'],
          riskScore: 80,
          thresholds: {
            eventsPerMinute: 100,
            uniqueIps: 10,
            affectedUsers: 50,
            dataVolume: 1000
          }
        },
        responseTeam: {
          primary: [
            {
              name: 'Security Team Lead',
              email: 'security-lead@myeca.in',
              phone: '+91-9876543210',
              role: 'incident_commander',
              escalationLevel: 1
            },
            {
              name: 'System Administrator',
              email: 'admin@myeca.in',
              phone: '+91-9876543211',
              role: 'system_admin',
              escalationLevel: 1
            }
          ],
          backup: [
            {
              name: 'Backup Security Analyst',
              email: 'backup-security@myeca.in',
              phone: '+91-9876543212',
              role: 'security_analyst',
              escalationLevel: 2
            }
          ],
          external: [
            {
              name: 'External Security Consultant',
              organization: 'Security Corp',
              contact: 'emergency@securitycorp.com',
              service: '24/7 Security Response',
              escalationLevel: 3
            }
          ]
        },
        procedures: {
          detection: [
            'Identify and classify the incident',
            'Assess immediate impact and risk',
            'Activate incident response team',
            'Document initial findings'
          ],
          analysis: [
            'Gather and preserve evidence',
            'Analyze attack vectors and entry points',
            'Identify affected systems and data',
            'Determine scope of compromise'
          ],
          containment: [
            'Isolate affected systems',
            'Block malicious IP addresses',
            'Disable compromised accounts',
            'Implement emergency access controls'
          ],
          eradication: [
            'Remove malicious code and artifacts',
            'Close security vulnerabilities',
            'Update security controls',
            'Verify system integrity'
          ],
          recovery: [
            'Restore systems from clean backups',
            'Monitor for signs of compromise',
            'Validate system functionality',
            'Implement additional monitoring'
          ],
          lessonsLearned: [
            'Conduct post-incident review',
            'Document lessons learned',
            'Update security procedures',
            'Implement preventive measures'
          ]
        },
        automation: {
          autoBlock: true,
          autoIsolate: true,
          autoNotify: true,
          autoCollectEvidence: true,
          autoEscalate: true
        },
        escalation: {
          levels: [
            {
              level: 1,
              conditions: ['incident.detected', 'severity >= high'],
              actions: ['notify.primary.team', 'begin.analysis', 'collect.evidence'],
              timeframe: 15,
              notify: ['security-lead@myeca.in', 'admin@myeca.in']
            },
            {
              level: 2,
              conditions: ['incident.confirmed', 'affected.users > 100'],
              actions: ['escalate.to.backup', 'notify.management', 'activate.external'],
              timeframe: 30,
              notify: ['management@myeca.in', 'legal@myeca.in']
            },
            {
              level: 3,
              conditions: ['incident.critical', 'data.breach.confirmed'],
              actions: ['notify.regulators', 'engage.external', 'legal.consultation'],
              timeframe: 60,
              notify: ['ceo@myeca.in', 'legal@myeca.in', 'compliance@myeca.in']
            }
          ],
          timeframes: {
            initialResponse: 15,
            escalation1: 30,
            escalation2: 60,
            escalation3: 120,
            resolution: 240
          }
        },
        communication: {
          internal: {
            channels: ['email', 'slack', 'teams'],
            templates: {
              initial: 'Security incident detected: {{incident.title}} - Severity: {{incident.severity}}',
              update: 'Incident Update: {{incident.title}} - Status: {{incident.status}}',
              resolution: 'Incident Resolved: {{incident.title}} - Summary: {{incident.description}}'
            }
          },
          external: {
            channels: ['email', 'webhook'],
            templates: {
              regulatory: 'Data breach notification: {{incident.description}}',
              customer: 'Security incident notification: {{incident.title}}'
            },
            legalRequired: true,
            regulatoryRequired: true
          }
        }
      }
    ];

    defaultPlans.forEach(plan => {
      this.responsePlans.set(plan.id, plan);
    });
  }

  // Create new security incident
  public async createIncident(incidentData: Partial<SecurityIncident>): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: crypto.randomUUID(),
      incidentNumber: this.generateIncidentNumber(),
      title: incidentData.title || 'Security Incident',
      description: incidentData.description || 'Security incident detected',
      type: incidentData.type || 'suspicious_activity',
      severity: incidentData.severity || 'medium',
      status: 'detected',
      priority: this.calculatePriority(incidentData.severity || 'medium'),
      detectedAt: new Date(),
      reporter: incidentData.reporter || {
        name: 'System',
        email: 'security@myeca.in',
        role: 'automated',
        source: 'automated'
      },
      affectedAssets: incidentData.affectedAssets || {
        systems: [],
        applications: [],
        databases: [],
        networks: [],
        users: [],
        data: []
      },
      threatActors: incidentData.threatActors || {
        ipAddresses: [],
        userAgents: [],
        sessionIds: [],
        userIds: [],
        deviceIds: [],
        geographicLocations: []
      },
      attackVectors: incidentData.attackVectors || {
        entryPoints: [],
        vulnerabilities: [],
        exploits: [],
        tools: [],
        techniques: []
      },
      impactAssessment: incidentData.impactAssessment || {
        confidentiality: 'none',
        integrity: 'none',
        availability: 'none',
        financial: 0,
        reputation: 'none',
        compliance: 'none',
        operational: 'none'
      },
      evidence: incidentData.evidence || {
        logs: [],
        screenshots: [],
        networkTraffic: [],
        files: [],
        memoryDumps: [],
        diskImages: [],
        malwareSamples: [],
        configurationFiles: []
      },
      timeline: incidentData.timeline || [{
        timestamp: new Date(),
        phase: 'detection',
        description: 'Incident detected',
        actor: incidentData.reporter?.name || 'System',
        action: 'incident_creation',
        result: 'incident_created'
      }],
      responseActions: incidentData.responseActions || {
        immediate: [],
        shortTerm: [],
        longTerm: [],
        completed: [],
        inProgress: [],
        pending: []
      },
      communicationLog: incidentData.communicationLog || [],
      lessonsLearned: incidentData.lessonsLearned || [],
      recommendations: incidentData.recommendations || [],
      postMortem: incidentData.postMortem || {
        summary: '',
        rootCause: '',
        contributingFactors: [],
        correctiveActions: [],
        preventiveActions: [],
        improvements: []
      },
      tags: incidentData.tags || [],
      metadata: incidentData.metadata || {}
    };

    // Store incident
    this.incidents.set(incident.id, incident);

    // Find applicable response plan
    const responsePlan = this.findResponsePlan(incident);
    
    if (responsePlan) {
      await this.executeResponsePlan(incident, responsePlan);
    }

    // Send initial alerts
    await this.sendIncidentAlert(incident, 'initial');

    // Emit incident created event
    this.emit('incident-created', incident);

    console.log(`🚨 Security incident created: ${incident.incidentNumber} - ${incident.title}`);

    return incident;
  }

  // Generate incident number
  private generateIncidentNumber(): string {
    this.incidentCounter++;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const counter = String(this.incidentCounter).padStart(4, '0');
    return `SEC-${year}${month}-${counter}`;
  }

  // Calculate incident priority
  private calculatePriority(severity: IncidentSeverity): number {
    const priorityMap = {
      emergency: 1,
      critical: 1,
      high: 2,
      medium: 3,
      low: 4
    };
    return priorityMap[severity] || 3;
  }

  // Find applicable response plan
  private findResponsePlan(incident: SecurityIncident): IncidentResponsePlan | null {
    for (const plan of this.responsePlans.values()) {
      if (this.matchesIncident(incident, plan)) {
        return plan;
      }
    }
    return null;
  }

  // Check if incident matches response plan
  private matchesIncident(incident: SecurityIncident, plan: IncidentResponsePlan): boolean {
    const triggers = plan.triggers;
    
    // Check severity
    if (!triggers.severities.includes(incident.severity)) {
      return false;
    }

    // Check type
    if (!triggers.types.includes(incident.type)) {
      return false;
    }

    // Additional threshold checks would go here
    return true;
  }

  // Execute response plan
  private async executeResponsePlan(incident: SecurityIncident, plan: IncidentResponsePlan): Promise<void> {
    console.log(`🎯 Executing response plan: ${plan.name} for incident: ${incident.incidentNumber}`);

    // Execute automation rules
    if (plan.automation.autoBlock) {
      await this.executeAutoBlock(incident);
    }

    if (plan.automation.autoIsolate) {
      await this.executeAutoIsolate(incident);
    }

    if (plan.automation.autoCollectEvidence) {
      await this.executeAutoEvidenceCollection(incident);
    }

    // Execute immediate response procedures
    for (const procedure of plan.procedures.detection) {
      incident.responseActions.immediate.push(procedure);
    }

    // Update incident status
    await this.updateIncidentStatus(incident.id, 'analyzing');
  }

  // Execute auto-blocking
  private async executeAutoBlock(incident: SecurityIncident): Promise<void> {
    console.log(`🔒 Executing auto-block for incident: ${incident.incidentNumber}`);

    // Block IP addresses
    for (const ip of incident.threatActors.ipAddresses) {
      console.log(`🚫 Blocking IP: ${ip}`);
      // Implementation would add IP to firewall blocklist
    }

    // Disable compromised accounts
    for (const userId of incident.threatActors.userIds) {
      console.log(`🚫 Disabling user account: ${userId}`);
      // Implementation would disable user account
    }

    // Revoke compromised sessions
    for (const sessionId of incident.threatActors.sessionIds) {
      console.log(`🚫 Revoking session: ${sessionId}`);
      // Implementation would revoke session
    }
  }

  // Execute auto-isolation
  private async executeAutoIsolate(incident: SecurityIncident): Promise<void> {
    console.log(`🔐 Executing auto-isolation for incident: ${incident.incidentNumber}`);

    // Isolate affected systems
    for (const system of incident.affectedAssets.systems) {
      console.log(`🔒 Isolating system: ${system}`);
      // Implementation would isolate system
    }

    // Isolate affected networks
    for (const network of incident.affectedAssets.networks) {
      console.log(`🔒 Isolating network: ${network}`);
      // Implementation would isolate network
    }
  }

  // Execute auto-evidence collection
  private async executeAutoEvidenceCollection(incident: SecurityIncident): Promise<void> {
    console.log(`📋 Executing auto-evidence collection for incident: ${incident.incidentNumber}`);

    // Collect system logs
    const logFiles = await this.collectSystemLogs(incident);
    incident.evidence.logs.push(...logFiles);

    // Collect network traffic
    const networkFiles = await this.collectNetworkTraffic(incident);
    incident.evidence.networkTraffic.push(...networkFiles);

    // Take screenshots
    const screenshots = await this.takeScreenshots(incident);
    incident.evidence.screenshots.push(...screenshots);
  }

  // Collect system logs
  private async collectSystemLogs(incident: SecurityIncident): Promise<string[]> {
    console.log(`📄 Collecting system logs for incident: ${incident.incidentNumber}`);
    
    // Implementation would collect relevant log files
    return [
      `/logs/security-${incident.incidentNumber}.log`,
      `/logs/application-${incident.incidentNumber}.log`,
      `/logs/database-${incident.incidentNumber}.log`
    ];
  }

  // Collect network traffic
  private async collectNetworkTraffic(incident: SecurityIncident): Promise<string[]> {
    console.log(`🌐 Collecting network traffic for incident: ${incident.incidentNumber}`);
    
    // Implementation would collect network traffic captures
    return [
      `/captures/traffic-${incident.incidentNumber}.pcap`,
      `/captures/netflow-${incident.incidentNumber}.csv`
    ];
  }

  // Take screenshots
  private async takeScreenshots(incident: SecurityIncident): Promise<string[]> {
    console.log(`📸 Taking screenshots for incident: ${incident.incidentNumber}`);
    
    // Implementation would take relevant screenshots
    return [
      `/screenshots/dashboard-${incident.incidentNumber}.png`,
      `/screenshots/logs-${incident.incidentNumber}.png`
    ];
  }

  // Update incident status
  public async updateIncidentStatus(incidentId: string, status: IncidentStatus): Promise<SecurityIncident> {
    const incident = this.incidents.get(incidentId);
    if (!incident) {
      throw new Error(`Incident ${incidentId} not found`);
    }

    const previousStatus = incident.status;
    incident.status = status;

    // Update timestamps based on status
    const now = new Date();
    switch (status) {
      case 'acknowledged':
        incident.acknowledgedAt = now;
        break;
      case 'contained':
        incident.containedAt = now;
        break;
      case 'eradicated':
        incident.eradicatedAt = now;
        break;
      case 'recovered':
        incident.recoveredAt = now;
        break;
      case 'closed':
        incident.closedAt = now;
        break;
    }

    // Add timeline entry
    incident.timeline.push({
      timestamp: now,
      phase: this.getPhaseFromStatus(status),
      description: `Status changed from ${previousStatus} to ${status}`,
      actor: 'system',
      action: 'status_update',
      result: `status_changed_to_${status}`
    });

    console.log(`📊 Incident ${incident.incidentNumber} status updated: ${previousStatus} → ${status}`);

    // Send status update alert
    await this.sendIncidentAlert(incident, 'update');

    // Emit status change event
    this.emit('incident-status-changed', { incident, previousStatus, newStatus: status });

    return incident;
  }

  // Get phase from status
  private getPhaseFromStatus(status: IncidentStatus): SecurityIncident['timeline'][0]['phase'] {
    const phaseMap: Record<IncidentStatus, SecurityIncident['timeline'][0]['phase']> = {
      detected: 'detection',
      analyzing: 'analysis',
      contained: 'containment',
      eradicated: 'eradication',
      recovered: 'recovery',
      closed: 'lessons_learned'
    };
    return phaseMap[status];
  }

  // Send incident alert
  private async sendIncidentAlert(incident: SecurityIncident, type: 'initial' | 'update' | 'resolution'): Promise<void> {
    console.log(`📢 Sending ${type} alert for incident: ${incident.incidentNumber}`);

    const alert = {
      incidentNumber: incident.incidentNumber,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      type: incident.type,
      detectedAt: incident.detectedAt,
      description: incident.description,
      affectedAssets: incident.affectedAssets,
      threatActors: incident.threatActors
    };

    // Send email alert
    if (this.alertConfig.channels.email.enabled) {
      await this.sendEmailAlert(alert, type);
    }

    // Send Slack alert
    if (this.alertConfig.channels.slack.enabled) {
      await this.sendSlackAlert(alert, type);
    }

    // Send webhook alert
    if (this.alertConfig.channels.webhook.enabled) {
      await this.sendWebhookAlert(alert, type);
    }
  }

  // Send email alert
  private async sendEmailAlert(alert: any, type: string): Promise<void> {
    console.log(`📧 Sending email alert for incident: ${alert.incidentNumber}`);
    
    const template = this.alertConfig.channels.email.templates[type] || 
                     `Security Incident ${type}: ${alert.title}`;
    
    const subject = template.replace('{{incident.title}}', alert.title)
                           .replace('{{incident.severity}}', alert.severity)
                           .replace('{{incident.status}}', alert.status);

    // Implementation would send actual email
    console.log(`📧 Email alert sent: ${subject}`);
  }

  // Send Slack alert
  private async sendSlackAlert(alert: any, type: string): Promise<void> {
    console.log(`💬 Sending Slack alert for incident: ${alert.incidentNumber}`);
    
    const template = this.alertConfig.channels.slack.templates[type] || 
                     `Security Incident ${type}: ${alert.title}`;
    
    const message = template.replace('{{incident.title}}', alert.title)
                            .replace('{{incident.severity}}', alert.severity)
                            .replace('{{incident.status}}', alert.status);

    // Implementation would send actual Slack message
    console.log(`💬 Slack alert sent: ${message}`);
  }

  // Send webhook alert
  private async sendWebhookAlert(alert: any, type: string): Promise<void> {
    console.log(`🔗 Sending webhook alert for incident: ${alert.incidentNumber}`);
    
    const payload = {
      incident: alert,
      alertType: type,
      timestamp: new Date().toISOString(),
      severity: alert.severity,
      status: alert.status
    };

    // Implementation would send actual webhook
    console.log(`🔗 Webhook alert sent: ${JSON.stringify(payload)}`);
  }

  // Start processing queue
  private startProcessing(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
    }

    this.processingTimer = setInterval(() => {
      this.processIncidentQueue();
    }, 5000); // Process every 5 seconds
  }

  // Start escalation monitoring
  private startEscalationMonitoring(): void {
    if (this.escalationTimer) {
      clearInterval(this.escalationTimer);
    }

    this.escalationTimer = setInterval(() => {
      this.monitorEscalations();
    }, 60000); // Monitor every minute
  }

  // Process incident queue
  private processIncidentQueue(): void {
    if (this.isProcessing || this.incidentQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const batch = this.incidentQueue.splice(0, 10); // Process up to 10 incidents
      
      for (const incidentData of batch) {
        this.createIncident(incidentData);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  // Monitor escalations
  private monitorEscalations(): void {
    const now = new Date();

    for (const incident of this.incidents.values()) {
      if (incident.status === 'closed') continue;

      const timeSinceDetection = now.getTime() - incident.detectedAt.getTime();
      const minutesSinceDetection = timeSinceDetection / (1000 * 60);

      // Check escalation timeframes
      if (minutesSinceDetection > 15 && !incident.acknowledgedAt) {
        this.escalateIncident(incident, 1);
      } else if (minutesSinceDetection > 30 && incident.status === 'analyzing') {
        this.escalateIncident(incident, 2);
      } else if (minutesSinceDetection > 60 && incident.status !== 'contained') {
        this.escalateIncident(incident, 3);
      }
    }
  }

  // Escalate incident
  private async escalateIncident(incident: SecurityIncident, level: number): Promise<void> {
    console.log(`📈 Escalating incident ${incident.incidentNumber} to level ${level}`);

    // Add escalation to timeline
    incident.timeline.push({
      timestamp: new Date(),
      phase: 'analysis',
      description: `Incident escalated to level ${level}`,
      actor: 'system',
      action: 'escalation',
      result: `escalated_to_level_${level}`
    });

    // Send escalation alert
    await this.sendEscalationAlert(incident, level);
  }

  // Send escalation alert
  private async sendEscalationAlert(incident: SecurityIncident, level: number): Promise<void> {
    const escalationAlert = {
      incidentNumber: incident.incidentNumber,
      title: incident.title,
      severity: incident.severity,
      status: incident.status,
      escalationLevel: level,
      timeSinceDetection: new Date().getTime() - incident.detectedAt.getTime()
    };

    console.log(`📈 Escalation alert sent for incident: ${incident.incidentNumber} - Level: ${level}`);
    
    // Implementation would send escalation alerts to appropriate personnel
  }

  // Get incident by ID
  public getIncident(incidentId: string): SecurityIncident | undefined {
    return this.incidents.get(incidentId);
  }

  // Get incidents by filter
  public getIncidents(filter?: {
    severity?: IncidentSeverity[];
    status?: IncidentStatus[];
    type?: IncidentType[];
    dateRange?: { start: Date; end: Date };
    limit?: number;
  }): SecurityIncident[] {
    let incidents = Array.from(this.incidents.values());

    if (filter) {
      if (filter.severity) {
        incidents = incidents.filter(i => filter.severity!.includes(i.severity));
      }
      if (filter.status) {
        incidents = incidents.filter(i => filter.status!.includes(i.status));
      }
      if (filter.type) {
        incidents = incidents.filter(i => filter.type!.includes(i.type));
      }
      if (filter.dateRange) {
        incidents = incidents.filter(i => 
          i.detectedAt >= filter.dateRange!.start && 
          i.detectedAt <= filter.dateRange!.end
        );
      }
      if (filter.limit) {
        incidents = incidents.slice(0, filter.limit);
      }
    }

    return incidents;
  }

  // Get incident statistics
  public getIncidentStats(): {
    total: number;
    bySeverity: Record<IncidentSeverity, number>;
    byStatus: Record<IncidentStatus, number>;
    byType: Record<IncidentType, number>;
    recent: number;
    open: number;
    avgResolutionTime: number;
  } {
    const incidents = Array.from(this.incidents.values());
    const now = new Date();
    const recentThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

    const stats = {
      total: incidents.length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0, emergency: 0 },
      byStatus: { detected: 0, analyzing: 0, contained: 0, eradicated: 0, recovered: 0, closed: 0 },
      byType: {} as Record<IncidentType, number>,
      recent: 0,
      open: 0,
      avgResolutionTime: 0
    };

    let totalResolutionTime = 0;
    let resolvedCount = 0;

    incidents.forEach(incident => {
      stats.bySeverity[incident.severity]++;
      stats.byStatus[incident.status]++;
      stats.byType[incident.type] = (stats.byType[incident.type] || 0) + 1;

      if (incident.detectedAt >= recentThreshold) {
        stats.recent++;
      }

      if (incident.status !== 'closed') {
        stats.open++;
      }

      if (incident.closedAt) {
        const resolutionTime = incident.closedAt.getTime() - incident.detectedAt.getTime();
        totalResolutionTime += resolutionTime;
        resolvedCount++;
      }
    });

    stats.avgResolutionTime = resolvedCount > 0 ? totalResolutionTime / resolvedCount : 0;

    return stats;
  }

  // Queue incident for processing
  public queueIncident(incidentData: Partial<SecurityIncident>): void {
    this.incidentQueue.push(incidentData);
    console.log(`📋 Incident queued for processing: ${incidentData.title || 'Unknown'}`);
  }

  // Cleanup service
  public cleanup(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }

    if (this.escalationTimer) {
      clearInterval(this.escalationTimer);
      this.escalationTimer = null;
    }

    this.incidents.clear();
    this.responsePlans.clear();
    this.incidentQueue = [];
    this.removeAllListeners();
  }
}

// Export singleton instance
export const incidentResponse = new IncidentResponseService({
  enabled: true,
  channels: {
    email: {
      enabled: true,
      smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: true,
        auth: {
          user: 'security@myeca.in',
          pass: 'app-specific-password'
        }
      },
      recipients: ['security-team@myeca.in', 'admin@myeca.in'],
      templates: {
        initial: '🚨 Security Incident: {{incident.title}} - Severity: {{incident.severity}}',
        update: '📊 Incident Update: {{incident.title}} - Status: {{incident.status}}',
        resolution: '✅ Incident Resolved: {{incident.title}}'
      }
    },
    slack: {
      enabled: true,
      webhookUrl: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
      channel: '#security-incidents',
      username: 'Security Bot',
      iconEmoji: '🚨',
      templates: {
        initial: '🚨 *Security Incident Detected*\n*Title:* {{incident.title}}\n*Severity:* {{incident.severity}}\n*Status:* {{incident.status}}',
        update: '📊 *Incident Update*\n*Title:* {{incident.title}}\n*Status:* {{incident.status}}\n*Severity:* {{incident.severity}}',
        resolution: '✅ *Incident Resolved*\n*Title:* {{incident.title}}\n*Resolution:* {{incident.description}}'
      }
    },
    webhook: {
      enabled: true,
      url: 'https://api.myeca.in/security/webhook',
      headers: {
        'Authorization': 'Bearer security-webhook-token',
        'Content-Type': 'application/json'
      },
      timeout: 30000,
      templates: {
        initial: '{{incident}}',
        update: '{{incident}}',
        resolution: '{{incident}}'
      }
    },
    sms: { enabled: false, provider: '', apiKey: '', from: '', recipients: [], templates: {} },
    teams: { enabled: false, webhookUrl: '', templates: {} }
  },
  severityThreshold: 'medium',
  rateLimiting: {
    enabled: true,
    maxAlertsPerHour: 50,
    maxAlertsPerDay: 200,
    burstThreshold: 10
  },
  filtering: {
    deduplication: true,
    suppression: true,
    escalation: true,
    correlation: true
  }
});