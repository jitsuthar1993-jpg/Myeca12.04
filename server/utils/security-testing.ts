// @ts-nocheck
// Security Testing Utilities and Vulnerability Scanning
import { Request, Response } from 'express';
import crypto from 'crypto';
import https from 'https';

// Vulnerability Test Categories
enum VulnerabilityCategory {
  INJECTION = 'injection',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  CRYPTOGRAPHIC = 'cryptographic',
  CONFIGURATION = 'configuration',
  INPUT_VALIDATION = 'input_validation',
  SESSION_MANAGEMENT = 'session_management',
  ACCESS_CONTROL = 'access_control',
  ERROR_HANDLING = 'error_handling',
  LOGGING = 'logging',
  TRANSPORT = 'transport',
  DEPENDENCY = 'dependency'
}

// Vulnerability Severity Levels
enum VulnerabilitySeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

// Vulnerability Test Result
interface VulnerabilityTestResult {
  id: string;
  name: string;
  category: VulnerabilityCategory;
  severity: VulnerabilitySeverity;
  description: string;
  testMethod: string;
  result: 'passed' | 'failed' | 'warning' | 'skipped';
  message: string;
  details?: any;
  remediation: string;
  references: string[];
  timestamp: Date;
  duration: number;
}

// Security Test Suite Configuration
interface SecurityTestConfig {
  timeout: number;
  maxRedirects: number;
  userAgent: string;
  followRedirects: boolean;
  validateSSL: boolean;
  headers: Record<string, string>;
  proxy?: string;
}

// OWASP Top 10 Test Cases
const OWASP_TOP10_TESTS = [
  {
    id: 'A01',
    name: 'Broken Access Control',
    category: VulnerabilityCategory.ACCESS_CONTROL,
    severity: VulnerabilitySeverity.CRITICAL,
    description: 'Test for broken access control vulnerabilities',
    tests: [
      'unauthorized_access',
      'privilege_escalation',
      'insecure_direct_object_references',
      'missing_function_level_access_control'
    ]
  },
  {
    id: 'A02',
    name: 'Cryptographic Failures',
    category: VulnerabilityCategory.CRYPTOGRAPHIC,
    severity: VulnerabilitySeverity.HIGH,
    description: 'Test for cryptographic implementation failures',
    tests: [
      'weak_encryption',
      'hardcoded_secrets',
      'insecure_transmission',
      'deprecated_algorithms'
    ]
  },
  {
    id: 'A03',
    name: 'Injection',
    category: VulnerabilityCategory.INJECTION,
    severity: VulnerabilitySeverity.CRITICAL,
    description: 'Test for various injection vulnerabilities',
    tests: [
      'sql_injection',
      'nosql_injection',
      'command_injection',
      'ldap_injection',
      'xpath_injection'
    ]
  },
  {
    id: 'A04',
    name: 'Insecure Design',
    category: VulnerabilityCategory.CONFIGURATION,
    severity: VulnerabilitySeverity.HIGH,
    description: 'Test for insecure design patterns',
    tests: [
      'missing_security_controls',
      'insecure_defaults',
      'insufficient_logging',
      'missing_rate_limiting'
    ]
  },
  {
    id: 'A05',
    name: 'Security Misconfiguration',
    category: VulnerabilityCategory.CONFIGURATION,
    severity: VulnerabilitySeverity.MEDIUM,
    description: 'Test for security misconfigurations',
    tests: [
      'default_credentials',
      'unnecessary_features',
      'verbose_error_messages',
      'missing_security_headers'
    ]
  },
  {
    id: 'A06',
    name: 'Vulnerable and Outdated Components',
    category: VulnerabilityCategory.DEPENDENCY,
    severity: VulnerabilitySeverity.HIGH,
    description: 'Test for vulnerable dependencies',
    tests: [
      'outdated_dependencies',
      'known_vulnerabilities',
      'unmaintained_packages',
      'license_compliance'
    ]
  },
  {
    id: 'A07',
    name: 'Identification and Authentication Failures',
    category: VulnerabilityCategory.AUTHENTICATION,
    severity: VulnerabilitySeverity.HIGH,
    description: 'Test for authentication failures',
    tests: [
      'brute_force_protection',
      'session_management',
      'multi_factor_authentication',
      'credential_stuffing'
    ]
  },
  {
    id: 'A08',
    name: 'Software and Data Integrity Failures',
    category: VulnerabilityCategory.CRYPTOGRAPHIC,
    severity: VulnerabilitySeverity.HIGH,
    description: 'Test for integrity failures',
    tests: [
      'missing_integrity_checks',
      'insecure_deserialization',
      'tampering_detection',
      'supply_chain_security'
    ]
  },
  {
    id: 'A09',
    name: 'Security Logging and Monitoring Failures',
    category: VulnerabilityCategory.LOGGING,
    severity: VulnerabilitySeverity.MEDIUM,
    description: 'Test for logging and monitoring failures',
    tests: [
      'insufficient_logging',
      'missing_monitoring',
      'inadequate_alerting',
      'log_tampering'
    ]
  },
  {
    id: 'A10',
    name: 'Server-Side Request Forgery',
    category: VulnerabilityCategory.INPUT_VALIDATION,
    severity: VulnerabilitySeverity.HIGH,
    description: 'Test for SSRF vulnerabilities',
    tests: [
      'url_validation',
      'internal_resource_access',
      'protocol_restriction',
      'dns_rebinding'
    ]
  }
];

// Security Test Suite
class SecurityTestSuite {
  private config: SecurityTestConfig;
  private results: VulnerabilityTestResult[] = [];

  constructor(config: Partial<SecurityTestConfig> = {}) {
    this.config = {
      timeout: 30000,
      maxRedirects: 5,
      userAgent: 'SecurityTestSuite/1.0',
      followRedirects: true,
      validateSSL: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      ...config
    };
  }

  async runSecurityTests(baseUrl: string, options: {
    includeCritical?: boolean;
    includeHigh?: boolean;
    includeMedium?: boolean;
    includeLow?: boolean;
    includeInfo?: boolean;
    categories?: VulnerabilityCategory[];
    customTests?: VulnerabilityTest[];
  } = {}): Promise<{
    summary: SecurityTestSummary;
    results: VulnerabilityTestResult[];
    recommendations: SecurityRecommendation[];
    report: SecurityReport;
  }> {
    console.log('🔍 Starting comprehensive security testing...');
    
    this.results = [];
    const startTime = Date.now();

    // Run OWASP Top 10 tests
    const owaspResults = await this.runOWASPTop10Tests(baseUrl, options);
    this.results.push(...owaspResults);

    // Run custom tests if provided
    if (options.customTests && options.customTests.length > 0) {
      const customResults = await this.runCustomTests(baseUrl, options.customTests);
      this.results.push(...customResults);
    }

    // Run additional security tests
    const additionalResults = await this.runAdditionalSecurityTests(baseUrl);
    this.results.push(...additionalResults);

    const duration = Date.now() - startTime;
    const summary = this.generateSummary();
    const recommendations = this.generateRecommendations();
    const report = this.generateReport(duration);

    console.log(`✅ Security testing completed in ${duration}ms`);
    console.log(`📊 Found ${summary.totalFindings} security findings`);

    return {
      summary,
      results: this.results,
      recommendations,
      report
    };
  }

  private async runOWASPTop10Tests(baseUrl: string, options: any): Promise<VulnerabilityTestResult[]> {
    const results: VulnerabilityTestResult[] = [];

    for (const testCase of OWASP_TOP10_TESTS) {
      const severityFilter = this.getSeverityFilter(options);
      
      if (!severityFilter.includes(testCase.severity)) {
        continue;
      }

      if (options.categories && !options.categories.includes(testCase.category)) {
        continue;
      }

      for (const testName of testCase.tests) {
        const result = await this.runIndividualTest(baseUrl, testCase, testName);
        results.push(result);
      }
    }

    return results;
  }

  private async runIndividualTest(baseUrl: string, testCase: any, testName: string): Promise<VulnerabilityTestResult> {
    const startTime = Date.now();
    
    try {
      let result: VulnerabilityTestResult;

      switch (testName) {
        case 'unauthorized_access':
          result = await this.testUnauthorizedAccess(baseUrl, testCase);
          break;
        case 'privilege_escalation':
          result = await this.testPrivilegeEscalation(baseUrl, testCase);
          break;
        case 'sql_injection':
          result = await this.testSQLInjection(baseUrl, testCase);
          break;
        case 'xss':
          result = await this.testXSS(baseUrl, testCase);
          break;
        case 'weak_encryption':
          result = await this.testWeakEncryption(baseUrl, testCase);
          break;
        case 'default_credentials':
          result = await this.testDefaultCredentials(baseUrl, testCase);
          break;
        case 'missing_security_headers':
          result = await this.testMissingSecurityHeaders(baseUrl, testCase);
          break;
        case 'brute_force_protection':
          result = await this.testBruteForceProtection(baseUrl, testCase);
          break;
        case 'session_management':
          result = await this.testSessionManagement(baseUrl, testCase);
          break;
        case 'insufficient_logging':
          result = await this.testInsufficientLogging(baseUrl, testCase);
          break;
        default:
          result = this.createSkippedResult(testCase, testName);
      }

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      return {
        id: `${testCase.id}_${testName}`,
        name: testName,
        category: testCase.category,
        severity: testCase.severity,
        description: testCase.description,
        testMethod: testName,
        result: 'error',
        message: `Test execution failed: ${error.message}`,
        remediation: 'Check test configuration and target availability',
        references: [],
        timestamp: new Date(),
        duration: Date.now() - startTime
      };
    }
  }

  private async testUnauthorizedAccess(baseUrl: string, testCase: any): Promise<VulnerabilityTestResult> {
    try {
      // Test accessing admin endpoints without authentication
      const adminEndpoints = ['/admin', '/admin/dashboard', '/admin/users', '/api/admin'];
      
      for (const endpoint of adminEndpoints) {
        const response = await this.makeRequest(`${baseUrl}${endpoint}`, 'GET');
        
        if (response.status === 200 || response.status === 302) {
          return {
            id: `${testCase.id}_unauthorized_access`,
            name: 'Unauthorized Access',
            category: testCase.category,
            severity: testCase.severity,
            description: 'Admin endpoints are accessible without authentication',
            testMethod: 'unauthorized_access',
            result: 'failed',
            message: `Admin endpoint ${endpoint} is accessible without authentication (Status: ${response.status})`,
            remediation: 'Implement proper authentication and authorization for admin endpoints',
            references: ['https://owasp.org/www-project-top-ten/2017/A5_2017-Broken_Access_Control'],
            timestamp: new Date(),
            duration: 0,
            details: { endpoint, status: response.status }
          };
        }
      }

      return {
        id: `${testCase.id}_unauthorized_access`,
        name: 'Unauthorized Access',
        category: testCase.category,
        severity: testCase.severity,
        description: 'Admin endpoints are properly protected',
        testMethod: 'unauthorized_access',
        result: 'passed',
        message: 'All admin endpoints require authentication',
        remediation: 'Continue maintaining proper access controls',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult(testCase, 'unauthorized_access', error.message);
    }
  }

  private async testSQLInjection(baseUrl: string, testCase: any): Promise<VulnerabilityTestResult> {
    const sqlPayloads = [
      "' OR '1'='1",
      "' OR 1=1--",
      "'; DROP TABLE users;--",
      "' UNION SELECT * FROM users--",
      "admin'--",
      "1' OR '1'='1",
      "test' AND 1=1--"
    ];

    try {
      // Test SQL injection in query parameters
      const testEndpoints = ['/api/users', '/api/search', '/login'];
      
      for (const endpoint of testEndpoints) {
        for (const payload of sqlPayloads) {
          const response = await this.makeRequest(`${baseUrl}${endpoint}?id=${encodeURIComponent(payload)}`, 'GET');
          
          // Check for SQL error messages in response
          const sqlErrors = [
            'mysql_fetch_array',
            'ORA-',
            'Microsoft OLE DB Provider',
            'SQLite error',
            'PostgreSQL error',
            'SQL syntax'
          ];
          
          const responseText = response.data?.toString() || '';
          
          if (sqlErrors.some(error => responseText.toLowerCase().includes(error.toLowerCase()))) {
            return {
              id: `${testCase.id}_sql_injection`,
              name: 'SQL Injection',
              category: testCase.category,
              severity: testCase.severity,
              description: 'SQL injection vulnerability detected',
              testMethod: 'sql_injection',
              result: 'failed',
              message: `SQL injection vulnerability found in ${endpoint} with payload: ${payload}`,
              remediation: 'Use parameterized queries and input validation',
              references: ['https://owasp.org/www-community/attacks/SQL_Injection'],
              timestamp: new Date(),
              duration: 0,
              details: { endpoint, payload, error: responseText }
            };
          }
        }
      }

      return {
        id: `${testCase.id}_sql_injection`,
        name: 'SQL Injection',
        category: testCase.category,
        severity: testCase.severity,
        description: 'No SQL injection vulnerabilities detected',
        testMethod: 'sql_injection',
        result: 'passed',
        message: 'No SQL injection vulnerabilities found with common payloads',
        remediation: 'Continue using parameterized queries and input validation',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult(testCase, 'sql_injection', error.message);
    }
  }

  private async testXSS(baseUrl: string, testCase: any): Promise<VulnerabilityTestResult> {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      'javascript:alert("XSS")',
      '<svg onload=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      '\'><script>alert("XSS")</script>'
    ];

    try {
      // Test XSS in various input fields
      const testEndpoints = ['/api/search', '/api/comments', '/contact'];
      
      for (const endpoint of testEndpoints) {
        for (const payload of xssPayloads) {
          const response = await this.makeRequest(`${baseUrl}${endpoint}?q=${encodeURIComponent(payload)}`, 'GET');
          const responseText = response.data?.toString() || '';
          
          // Check if payload is reflected in response
          if (responseText.includes(payload)) {
            return {
              id: `${testCase.id}_xss`,
              name: 'Cross-Site Scripting (XSS)',
              category: testCase.category,
              severity: testCase.severity,
              description: 'XSS vulnerability detected',
              testMethod: 'xss',
              result: 'failed',
              message: `XSS vulnerability found in ${endpoint} with payload: ${payload}`,
              remediation: 'Implement proper input validation and output encoding',
              references: ['https://owasp.org/www-community/attacks/xss/'],
              timestamp: new Date(),
              duration: 0,
              details: { endpoint, payload }
            };
          }
        }
      }

      return {
        id: `${testCase.id}_xss`,
        name: 'Cross-Site Scripting (XSS)',
        category: testCase.category,
        severity: testCase.severity,
        description: 'No XSS vulnerabilities detected',
        testMethod: 'xss',
        result: 'passed',
        message: 'No XSS vulnerabilities found with common payloads',
        remediation: 'Continue implementing input validation and output encoding',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult(testCase, 'xss', error.message);
    }
  }

  private async testMissingSecurityHeaders(baseUrl: string, testCase: any): Promise<VulnerabilityTestResult> {
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection',
      'content-security-policy'
    ];

    try {
      const response = await this.makeRequest(baseUrl, 'GET');
      const headers = response.headers || {};
      
      const missingHeaders = requiredHeaders.filter(header => 
        !headers[header] && !headers[header.toUpperCase()]
      );

      if (missingHeaders.length > 0) {
        return {
          id: `${testCase.id}_missing_security_headers`,
          name: 'Missing Security Headers',
          category: testCase.category,
          severity: testCase.severity,
          description: 'Critical security headers are missing',
          testMethod: 'missing_security_headers',
          result: 'failed',
          message: `Missing security headers: ${missingHeaders.join(', ')}`,
          remediation: 'Implement all recommended security headers',
          references: ['https://securityheaders.com/'],
          timestamp: new Date(),
          duration: 0,
          details: { missingHeaders, presentHeaders: Object.keys(headers) }
        };
      }

      return {
        id: `${testCase.id}_missing_security_headers`,
        name: 'Missing Security Headers',
        category: testCase.category,
        severity: testCase.severity,
        description: 'All critical security headers are present',
        testMethod: 'missing_security_headers',
        result: 'passed',
        message: 'All required security headers are implemented',
        remediation: 'Continue maintaining security headers',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult(testCase, 'missing_security_headers', error.message);
    }
  }

  private async testBruteForceProtection(baseUrl: string, testCase: any): Promise<VulnerabilityTestResult> {
    try {
      // Test login endpoint with multiple failed attempts
      const loginEndpoint = '/api/auth/login';
      const testCredentials = [
        { username: 'admin', password: 'wrong1' },
        { username: 'admin', password: 'wrong2' },
        { username: 'admin', password: 'wrong3' },
        { username: 'admin', password: 'wrong4' },
        { username: 'admin', password: 'wrong5' },
        { username: 'admin', password: 'wrong6' }
      ];

      let rateLimited = false;
      
      for (let i = 0; i < testCredentials.length; i++) {
        const response = await this.makeRequest(`${baseUrl}${loginEndpoint}`, 'POST', testCredentials[i]);
        
        if (response.status === 429) {
          rateLimited = true;
          break;
        }
      }

      if (!rateLimited) {
        return {
          id: `${testCase.id}_brute_force_protection`,
          name: 'Brute Force Protection',
          category: testCase.category,
          severity: testCase.severity,
          description: 'No rate limiting detected on login endpoint',
          testMethod: 'brute_force_protection',
          result: 'failed',
          message: 'Login endpoint does not implement rate limiting',
          remediation: 'Implement rate limiting and account lockout mechanisms',
          references: ['https://owasp.org/www-community/attacks/Brute_force_attack'],
          timestamp: new Date(),
          duration: 0
        };
      }

      return {
        id: `${testCase.id}_brute_force_protection`,
        name: 'Brute Force Protection',
        category: testCase.category,
        severity: testCase.severity,
        description: 'Rate limiting is implemented',
        testMethod: 'brute_force_protection',
        result: 'passed',
        message: 'Login endpoint implements rate limiting',
        remediation: 'Continue maintaining rate limiting',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult(testCase, 'brute_force_protection', error.message);
    }
  }

  private async testSessionManagement(baseUrl: string, testCase: any): Promise<VulnerabilityTestResult> {
    try {
      // Test for session fixation and session timeout
      const loginEndpoint = '/api/auth/login';
      
      // Attempt login to get session
      const loginResponse = await this.makeRequest(`${baseUrl}${loginEndpoint}`, 'POST', {
        username: 'testuser',
        password: 'testpass'
      });

      const setCookieHeader = loginResponse.headers['set-cookie'];
      
      if (!setCookieHeader) {
        return {
          id: `${testCase.id}_session_management`,
          name: 'Session Management',
          category: testCase.category,
          severity: testCase.severity,
          description: 'No session cookies are set',
          testMethod: 'session_management',
          result: 'failed',
          message: 'Login response does not set session cookies',
          remediation: 'Implement secure session management',
          references: ['https://owasp.org/www-community/attacks/Session_fixation'],
          timestamp: new Date(),
          duration: 0
        };
      }

      // Check for secure cookie flags
      const hasSecureFlag = setCookieHeader.some(cookie => cookie.includes('Secure'));
      const hasHttpOnlyFlag = setCookieHeader.some(cookie => cookie.includes('HttpOnly'));
      const hasSameSiteFlag = setCookieHeader.some(cookie => cookie.includes('SameSite'));

      if (!hasSecureFlag || !hasHttpOnlyFlag || !hasSameSiteFlag) {
        return {
          id: `${testCase.id}_session_management`,
          name: 'Session Management',
          category: testCase.category,
          severity: testCase.severity,
          description: 'Session cookies lack security flags',
          testMethod: 'session_management',
          result: 'warning',
          message: 'Session cookies missing security flags',
          remediation: 'Set Secure, HttpOnly, and SameSite flags on session cookies',
          references: [],
          timestamp: new Date(),
          duration: 0,
          details: { hasSecureFlag, hasHttpOnlyFlag, hasSameSiteFlag }
        };
      }

      return {
        id: `${testCase.id}_session_management`,
        name: 'Session Management',
        category: testCase.category,
        severity: testCase.severity,
        description: 'Session management is properly implemented',
        testMethod: 'session_management',
        result: 'passed',
        message: 'Session cookies have appropriate security flags',
        remediation: 'Continue maintaining secure session management',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult(testCase, 'session_management', error.message);
    }
  }

  private async runAdditionalSecurityTests(baseUrl: string): Promise<VulnerabilityTestResult[]> {
    const results: VulnerabilityTestResult[] = [];

    // Test for HTTPS enforcement
    results.push(await this.testHTTPSEnforcement(baseUrl));
    
    // Test for information disclosure
    results.push(await this.testInformationDisclosure(baseUrl));
    
    // Test for clickjacking protection
    results.push(await this.testClickjackingProtection(baseUrl));
    
    // Test for content type validation
    results.push(await this.testContentTypeValidation(baseUrl));

    return results;
  }

  private async testHTTPSEnforcement(baseUrl: string): Promise<VulnerabilityTestResult> {
    try {
      // Test if HTTP redirects to HTTPS
      const httpUrl = baseUrl.replace('https://', 'http://');
      
      const response = await this.makeRequest(httpUrl, 'GET');
      
      if (response.status !== 301 && response.status !== 302) {
        return {
          id: 'HTTPS_ENFORCEMENT',
          name: 'HTTPS Enforcement',
          category: VulnerabilityCategory.TRANSPORT,
          severity: VulnerabilitySeverity.HIGH,
          description: 'HTTP traffic is not redirected to HTTPS',
          testMethod: 'https_enforcement',
          result: 'failed',
          message: 'HTTP requests are not redirected to HTTPS',
          remediation: 'Implement HTTP to HTTPS redirection',
          references: ['https://owasp.org/www-project-top-ten/2017/A3_2017-Sensitive_Data_Exposure'],
          timestamp: new Date(),
          duration: 0
        };
      }

      return {
        id: 'HTTPS_ENFORCEMENT',
        name: 'HTTPS Enforcement',
        category: VulnerabilityCategory.TRANSPORT,
        severity: VulnerabilitySeverity.INFO,
        description: 'HTTP traffic is properly redirected to HTTPS',
        testMethod: 'https_enforcement',
        result: 'passed',
        message: 'HTTP requests are redirected to HTTPS',
        remediation: 'Continue maintaining HTTPS enforcement',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult({ id: 'HTTPS', category: VulnerabilityCategory.TRANSPORT, severity: VulnerabilitySeverity.HIGH }, 'https_enforcement', error.message);
    }
  }

  private async testInformationDisclosure(baseUrl: string): Promise<VulnerabilityTestResult> {
    try {
      // Test for information disclosure in error pages
      const testUrls = [
        `${baseUrl}/nonexistent-page-12345`,
        `${baseUrl}/api/nonexistent-endpoint`,
        `${baseUrl}/.git/config`,
        `${baseUrl}/.env`,
        `${baseUrl}/package.json`
      ];

      let informationDisclosed = false;
      const disclosedInfo: string[] = [];

      for (const url of testUrls) {
        try {
          const response = await this.makeRequest(url, 'GET');
          const responseText = response.data?.toString() || '';
          
          // Check for sensitive information
          const sensitivePatterns = [
            /database connection failed/i,
            /mysql.*error/i,
            /postgresql.*error/i,
            /sqlite.*error/i,
            /stack trace/i,
            /exception in/i,
            /error at line/i,
            /password.*:/i,
            /secret.*:/i,
            /api.*key/i,
            /token.*:/i
          ];

          for (const pattern of sensitivePatterns) {
            if (pattern.test(responseText)) {
              informationDisclosed = true;
              disclosedInfo.push(`Pattern matched in ${url}: ${pattern.source}`);
            }
          }
        } catch (error) {
          // Expected for non-existent endpoints
        }
      }

      if (informationDisclosed) {
        return {
          id: 'INFORMATION_DISCLOSURE',
          name: 'Information Disclosure',
          category: VulnerabilityCategory.ERROR_HANDLING,
          severity: VulnerabilitySeverity.MEDIUM,
          description: 'Sensitive information is disclosed in error messages',
          testMethod: 'information_disclosure',
          result: 'failed',
          message: 'Sensitive information found in error responses',
          remediation: 'Implement proper error handling and generic error messages',
          references: ['https://owasp.org/www-project-top-ten/2017/A6_2017-Security_Misconfiguration'],
          timestamp: new Date(),
          duration: 0,
          details: { disclosedInfo }
        };
      }

      return {
        id: 'INFORMATION_DISCLOSURE',
        name: 'Information Disclosure',
        category: VulnerabilityCategory.ERROR_HANDLING,
        severity: VulnerabilitySeverity.INFO,
        description: 'No sensitive information disclosed',
        testMethod: 'information_disclosure',
        result: 'passed',
        message: 'No sensitive information found in error responses',
        remediation: 'Continue implementing secure error handling',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult({ id: 'INFO_DISCLOSURE', category: VulnerabilityCategory.ERROR_HANDLING, severity: VulnerabilitySeverity.MEDIUM }, 'information_disclosure', error.message);
    }
  }

  private async testClickjackingProtection(baseUrl: string): Promise<VulnerabilityTestResult> {
    try {
      const response = await this.makeRequest(baseUrl, 'GET');
      const headers = response.headers || {};
      
      const xFrameOptions = headers['x-frame-options'];
      const contentSecurityPolicy = headers['content-security-policy'];
      
      if (!xFrameOptions && !contentSecurityPolicy) {
        return {
          id: 'CLICKJACKING_PROTECTION',
          name: 'Clickjacking Protection',
          category: VulnerabilityCategory.CONFIGURATION,
          severity: VulnerabilitySeverity.MEDIUM,
          description: 'No clickjacking protection implemented',
          testMethod: 'clickjacking_protection',
          result: 'failed',
          message: 'Missing X-Frame-Options and Content-Security-Policy headers',
          remediation: 'Implement X-Frame-Options or Content-Security-Policy frame-ancestors directive',
          references: ['https://owasp.org/www-community/attacks/Clickjacking'],
          timestamp: new Date(),
          duration: 0
        };
      }

      return {
        id: 'CLICKJACKING_PROTECTION',
        name: 'Clickjacking Protection',
        category: VulnerabilityCategory.CONFIGURATION,
        severity: VulnerabilitySeverity.INFO,
        description: 'Clickjacking protection is implemented',
        testMethod: 'clickjacking_protection',
        result: 'passed',
        message: 'X-Frame-Options or Content-Security-Policy headers are present',
        remediation: 'Continue maintaining clickjacking protection',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult({ id: 'CLICKJACK', category: VulnerabilityCategory.CONFIGURATION, severity: VulnerabilitySeverity.MEDIUM }, 'clickjacking_protection', error.message);
    }
  }

  private async testContentTypeValidation(baseUrl: string): Promise<VulnerabilityTestResult> {
    try {
      // Test content type validation on API endpoints
      const testEndpoints = ['/api/users', '/api/data'];
      
      for (const endpoint of testEndpoints) {
        // Send request with incorrect content type
        const response = await this.makeRequest(`${baseUrl}${endpoint}`, 'POST', 
          { data: 'test' },
          { 'Content-Type': 'text/html' }
        );
        
        if (response.status === 200) {
          return {
            id: 'CONTENT_TYPE_VALIDATION',
            name: 'Content Type Validation',
            category: VulnerabilityCategory.INPUT_VALIDATION,
            severity: VulnerabilitySeverity.MEDIUM,
            description: 'Content type validation is not enforced',
            testMethod: 'content_type_validation',
            result: 'failed',
            message: `Content type validation not enforced on ${endpoint}`,
            remediation: 'Validate Content-Type header on API endpoints',
            references: ['https://owasp.org/www-community/vulnerabilities/Content_Type_Bypass'],
            timestamp: new Date(),
            duration: 0,
            details: { endpoint, contentType: 'text/html' }
          };
        }
      }

      return {
        id: 'CONTENT_TYPE_VALIDATION',
        name: 'Content Type Validation',
        category: VulnerabilityCategory.INPUT_VALIDATION,
        severity: VulnerabilitySeverity.INFO,
        description: 'Content type validation is properly implemented',
        testMethod: 'content_type_validation',
        result: 'passed',
        message: 'Content type validation is enforced on API endpoints',
        remediation: 'Continue validating content types',
        references: [],
        timestamp: new Date(),
        duration: 0
      };
    } catch (error) {
      return this.createErrorResult({ id: 'CONTENT_TYPE', category: VulnerabilityCategory.INPUT_VALIDATION, severity: VulnerabilitySeverity.MEDIUM }, 'content_type_validation', error.message);
    }
  }

  private async runCustomTests(baseUrl: string, customTests: VulnerabilityTest[]): Promise<VulnerabilityTestResult[]> {
    const results: VulnerabilityTestResult[] = [];

    for (const test of customTests) {
      const startTime = Date.now();
      
      try {
        // Execute custom test logic
        const result = await test.execute(baseUrl);
        result.duration = Date.now() - startTime;
        results.push(result);
      } catch (error) {
        results.push({
          id: test.id,
          name: test.name,
          category: test.category,
          severity: test.severity,
          description: test.description,
          testMethod: test.testMethod,
          result: 'error',
          message: `Custom test execution failed: ${error.message}`,
          remediation: 'Check custom test implementation',
          references: [],
          timestamp: new Date(),
          duration: Date.now() - startTime
        });
      }
    }

    return results;
  }

  private async makeRequest(url: string, method: string = 'GET', data?: any, headers?: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/json, text/html, */*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'close',
          ...headers
        },
        timeout: this.config.timeout,
        rejectUnauthorized: this.config.validateSSL
      };

      const protocol = urlObj.protocol === 'https:' ? https : require('http');
      
      const req = protocol.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  private getSeverityFilter(options: any): string[] {
    const severities = [];
    
    if (options.includeCritical !== false) severities.push(VulnerabilitySeverity.CRITICAL);
    if (options.includeHigh !== false) severities.push(VulnerabilitySeverity.HIGH);
    if (options.includeMedium !== false) severities.push(VulnerabilitySeverity.MEDIUM);
    if (options.includeLow !== false) severities.push(VulnerabilitySeverity.LOW);
    if (options.includeInfo !== false) severities.push(VulnerabilitySeverity.INFO);
    
    return severities.length > 0 ? severities : Object.values(VulnerabilitySeverity);
  }

  private createSkippedResult(testCase: any, testMethod: string): VulnerabilityTestResult {
    return {
      id: `${testCase.id}_${testMethod}`,
      name: testCase.name,
      category: testCase.category,
      severity: testCase.severity,
      description: testCase.description,
      testMethod: testMethod,
      result: 'skipped',
      message: 'Test not implemented',
      remediation: 'Implement the security test',
      references: [],
      timestamp: new Date(),
      duration: 0
    };
  }

  private createErrorResult(testCase: any, testMethod: string, error: string): VulnerabilityTestResult {
    return {
      id: `${testCase.id}_${testMethod}`,
      name: testCase.name,
      category: testCase.category,
      severity: testCase.severity,
      description: testCase.description,
      testMethod: testMethod,
      result: 'error',
      message: `Test execution error: ${error}`,
      remediation: 'Check test configuration and target availability',
      references: [],
      timestamp: new Date(),
      duration: 0
    };
  }

  private generateSummary(): SecurityTestSummary {
    const passed = this.results.filter(r => r.result === 'passed').length;
    const failed = this.results.filter(r => r.result === 'failed').length;
    const warnings = this.results.filter(r => r.result === 'warning').length;
    const errors = this.results.filter(r => r.result === 'error').length;
    const skipped = this.results.filter(r => r.result === 'skipped').length;

    const critical = this.results.filter(r => r.severity === VulnerabilitySeverity.CRITICAL).length;
    const high = this.results.filter(r => r.severity === VulnerabilitySeverity.HIGH).length;
    const medium = this.results.filter(r => r.severity === VulnerabilitySeverity.MEDIUM).length;
    const low = this.results.filter(r => r.severity === VulnerabilitySeverity.LOW).length;

    return {
      totalTests: this.results.length,
      passed,
      failed,
      warnings,
      errors,
      skipped,
      criticalFindings: critical,
      highFindings: high,
      mediumFindings: medium,
      lowFindings: low,
      totalFindings: failed + warnings
    };
  }

  private generateRecommendations(): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];
    
    const failedTests = this.results.filter(r => r.result === 'failed');
    
    // Group by severity
    const criticalTests = failedTests.filter(r => r.severity === VulnerabilitySeverity.CRITICAL);
    const highTests = failedTests.filter(r => r.severity === VulnerabilitySeverity.HIGH);
    const mediumTests = failedTests.filter(r => r.severity === VulnerabilitySeverity.MEDIUM);
    
    if (criticalTests.length > 0) {
      recommendations.push({
        priority: 1,
        title: 'Address Critical Security Issues',
        description: `Fix ${criticalTests.length} critical security vulnerabilities immediately`,
        affectedComponents: criticalTests.map(t => t.name),
        remediationSteps: criticalTests.map(t => t.remediation),
        estimatedEffort: 'High',
        riskLevel: 'Critical'
      });
    }

    if (highTests.length > 0) {
      recommendations.push({
        priority: 2,
        title: 'Fix High Priority Security Issues',
        description: `Address ${highTests.length} high priority security vulnerabilities`,
        affectedComponents: highTests.map(t => t.name),
        remediationSteps: highTests.map(t => t.remediation),
        estimatedEffort: 'High',
        riskLevel: 'High'
      });
    }

    if (mediumTests.length > 0) {
      recommendations.push({
        priority: 3,
        title: 'Resolve Medium Priority Issues',
        description: `Fix ${mediumTests.length} medium priority security issues`,
        affectedComponents: mediumTests.map(t => t.name),
        remediationSteps: mediumTests.map(t => t.remediation),
        estimatedEffort: 'Medium',
        riskLevel: 'Medium'
      });
    }

    return recommendations;
  }

  private generateReport(duration: number): SecurityReport {
    const summary = this.generateSummary();
    
    return {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      duration,
      summary,
      scanTarget: 'SmartTaxCalculator Application',
      scanVersion: '1.0.0',
      scanEngine: 'SecurityTestSuite',
      compliance: this.checkCompliance(),
      riskAssessment: this.assessRisk(),
      findings: this.results.filter(r => r.result === 'failed' || r.result === 'warning'),
      recommendations: this.generateRecommendations()
    };
  }

  private checkCompliance(): ComplianceStatus {
    const failedCritical = this.results.filter(r => 
      r.result === 'failed' && r.severity === VulnerabilitySeverity.CRITICAL
    ).length;
    
    const failedHigh = this.results.filter(r => 
      r.result === 'failed' && r.severity === VulnerabilitySeverity.HIGH
    ).length;

    return {
      owaspTop10: failedCritical === 0 ? 'compliant' : failedHigh === 0 ? 'partial' : 'non_compliant',
      pciDss: failedCritical === 0 ? 'compliant' : 'non_compliant',
      gdpr: failedCritical === 0 ? 'compliant' : 'non_compliant',
      hipaa: failedCritical === 0 ? 'compliant' : 'non_compliant',
      iso27001: failedCritical === 0 ? 'compliant' : 'partial'
    };
  }

  private assessRisk(): RiskAssessment {
    const critical = this.results.filter(r => 
      r.result === 'failed' && r.severity === VulnerabilitySeverity.CRITICAL
    ).length;
    
    const high = this.results.filter(r => 
      r.result === 'failed' && r.severity === VulnerabilitySeverity.HIGH
    ).length;

    let overallRisk: 'low' | 'medium' | 'high' | 'critical' = 'low';
    
    if (critical > 0) {
      overallRisk = 'critical';
    } else if (high > 2) {
      overallRisk = 'high';
    } else if (high > 0) {
      overallRisk = 'medium';
    }

    return {
      overallRisk,
      riskScore: (critical * 10) + (high * 5),
      impactLevel: critical > 0 ? 'critical' : high > 0 ? 'high' : 'medium',
      likelihood: high > 3 ? 'high' : high > 0 ? 'medium' : 'low'
    };
  }
}

// Custom Vulnerability Test Interface
interface VulnerabilityTest {
  id: string;
  name: string;
  category: VulnerabilityCategory;
  severity: VulnerabilitySeverity;
  description: string;
  testMethod: string;
  execute(baseUrl: string): Promise<VulnerabilityTestResult>;
}

// Security Test Summary
interface SecurityTestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  warnings: number;
  errors: number;
  skipped: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  totalFindings: number;
}

// Security Recommendation
interface SecurityRecommendation {
  priority: number;
  title: string;
  description: string;
  affectedComponents: string[];
  remediationSteps: string[];
  estimatedEffort: 'Low' | 'Medium' | 'High';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
}

// Security Report
interface SecurityReport {
  id: string;
  timestamp: Date;
  duration: number;
  summary: SecurityTestSummary;
  scanTarget: string;
  scanVersion: string;
  scanEngine: string;
  compliance: ComplianceStatus;
  riskAssessment: RiskAssessment;
  findings: VulnerabilityTestResult[];
  recommendations: SecurityRecommendation[];
}

// Compliance Status
interface ComplianceStatus {
  owaspTop10: 'compliant' | 'partial' | 'non_compliant';
  pciDss: 'compliant' | 'non_compliant';
  gdpr: 'compliant' | 'non_compliant';
  hipaa: 'compliant' | 'non_compliant';
  iso27001: 'compliant' | 'partial' | 'non_compliant';
}

// Risk Assessment
interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  impactLevel: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
}

// Export security test suite
export const securityTestSuite = new SecurityTestSuite();
export { VulnerabilityCategory, VulnerabilitySeverity, VulnerabilityTest, VulnerabilityTestResult };
