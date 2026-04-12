// @ts-nocheck
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// SQL Injection Detection Patterns
interface SQLInjectionPattern {
  pattern: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  category: 'union' | 'boolean' | 'time' | 'error' | 'stacked' | 'inline' | 'comment' | 'encoding';
  mitigation: string;
}

// Query Analysis Result
interface QueryAnalysisResult {
  isSafe: boolean;
  riskScore: number;
  threats: Array<{
    pattern: string;
    severity: string;
    description: string;
    category: string;
    match: string;
    position: number;
  }>;
  recommendations: string[];
  sanitizedQuery?: string;
}

// Database Query Structure
interface QueryStructure {
  type: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'CREATE' | 'ALTER' | 'DROP' | 'EXECUTE' | 'UNKNOWN';
  tables: string[];
  columns: string[];
  conditions: string[];
  joins: string[];
  functions: string[];
  keywords: string[];
  riskFactors: {
    hasDynamicSQL: boolean;
    hasUserInput: boolean;
    hasUnion: boolean;
    hasComment: boolean;
    hasMultipleStatements: boolean;
    hasSubquery: boolean;
    hasStoredProcedure: boolean;
  };
}

// SQL Injection Prevention Service
class SQLInjectionPreventionService {
  private patterns: SQLInjectionPattern[];
  private allowedKeywords: Set<string>;
  private blockedKeywords: Set<string>;
  private queryCache: Map<string, QueryAnalysisResult>;
  private whitelistTables: Set<string>;
  private whitelistColumns: Set<string>;
  private maxQueryLength: number;
  private maxUnionCount: number;
  private maxNestedDepth: number;

  constructor() {
    this.patterns = this.initializePatterns();
    this.allowedKeywords = this.initializeAllowedKeywords();
    this.blockedKeywords = this.initializeBlockedKeywords();
    this.queryCache = new Map();
    this.whitelistTables = new Set();
    this.whitelistColumns = new Set();
    this.maxQueryLength = 10000;
    this.maxUnionCount = 5;
    this.maxNestedDepth = 3;

    this.initializeWhitelists();
  }

  // Initialize SQL injection detection patterns
  private initializePatterns(): SQLInjectionPattern[] {
    return [
      // Union-based injection
      {
        pattern: /\bunion\b.*\bselect\b/gi,
        severity: 'critical',
        description: 'UNION SELECT injection attempt',
        category: 'union',
        mitigation: 'Use parameterized queries and validate input'
      },
      {
        pattern: /\bunion\b.*\ball\b.*\bselect\b/gi,
        severity: 'critical',
        description: 'UNION ALL SELECT injection attempt',
        category: 'union',
        mitigation: 'Use parameterized queries and validate input'
      },
      // Boolean-based blind injection
      {
        pattern: /\b(or|and)\s+\d+\s*=\s*\d+/gi,
        severity: 'high',
        description: 'Boolean-based injection attempt',
        category: 'boolean',
        mitigation: 'Validate boolean expressions and use parameterized queries'
      },
      {
        pattern: /\b(or|and)\s+['"][^'"]*['"]\s*=\s*['"][^'"]*['"]/gi,
        severity: 'high',
        description: 'String-based boolean injection',
        category: 'boolean',
        mitigation: 'Validate string comparisons and use parameterized queries'
      },
      // Time-based blind injection
      {
        pattern: /\bwaitfor\s+delay\s+['"][^'"]*['"]/gi,
        severity: 'high',
        description: 'Time-based injection (SQL Server)',
        category: 'time',
        mitigation: 'Block time delay functions in queries'
      },
      {
        pattern: /\bsleep\s*\(\s*\d+\s*\)/gi,
        severity: 'high',
        description: 'Time-based injection (MySQL)',
        category: 'time',
        mitigation: 'Block sleep functions in queries'
      },
      {
        pattern: /\bdbms_lock\.sleep\s*\(/gi,
        severity: 'high',
        description: 'Time-based injection (Oracle)',
        category: 'time',
        mitigation: 'Block Oracle delay functions'
      },
      // Error-based injection
      {
        pattern: /\bconvert\s*\(\s*int\s*,\s*['"][^'"]*['"]\s*\)/gi,
        severity: 'high',
        description: 'Error-based injection attempt',
        category: 'error',
        mitigation: 'Validate data type conversions'
      },
      {
        pattern: /\bcast\s*\(\s*['"][^'"]*['"]\s*as\s+int\s*\)/gi,
        severity: 'high',
        description: 'Error-based injection with CAST',
        category: 'error',
        mitigation: 'Validate CAST operations'
      },
      // Stacked queries
      {
        pattern: /;\s*(select|insert|update|delete|drop|create|alter|exec)/gi,
        severity: 'critical',
        description: 'Stacked query injection',
        category: 'stacked',
        mitigation: 'Block multiple statements and use parameterized queries'
      },
      // Inline comments
      {
        pattern: /\/\*.*\*\//g,
        severity: 'medium',
        description: 'Inline comment injection',
        category: 'comment',
        mitigation: 'Remove inline comments from queries'
      },
      {
        pattern: /--.*$/gm,
        severity: 'medium',
        description: 'Line comment injection',
        category: 'comment',
        mitigation: 'Remove line comments from queries'
      },
      {
        pattern: /#.*$/gm,
        severity: 'medium',
        description: 'Hash comment injection',
        category: 'comment',
        mitigation: 'Remove hash comments from queries'
      },
      // Encoding attacks
      {
        pattern: /0x[0-9a-fA-F]+/g,
        severity: 'medium',
        description: 'Hex encoding injection',
        category: 'encoding',
        mitigation: 'Validate hex-encoded input'
      },
      {
        pattern: /char\s*\(\s*\d+\s*(,\s*\d+\s*)*\)/gi,
        severity: 'medium',
        description: 'CHAR encoding injection',
        category: 'encoding',
        mitigation: 'Validate CHAR function usage'
      },
      // Information schema attacks
      {
        pattern: /\binformation_schema\b/gi,
        severity: 'high',
        description: 'Information schema access attempt',
        category: 'information_schema',
        mitigation: 'Restrict access to information_schema'
      },
      {
        pattern: /\bsys\.\w+/gi,
        severity: 'high',
        description: 'System table access attempt',
        category: 'information_schema',
        mitigation: 'Restrict access to system tables'
      },
      // System commands
      {
        pattern: /\bexec\s*\(/gi,
        severity: 'critical',
        description: 'System command execution attempt',
        category: 'system_command',
        mitigation: 'Block EXEC statements'
      },
      {
        pattern: /\bxp_cmdshell\b/gi,
        severity: 'critical',
        description: 'Extended stored procedure attempt',
        category: 'system_command',
        mitigation: 'Block xp_cmdshell usage'
      },
      // Dangerous functions
      {
        pattern: /\bload_file\s*\(/gi,
        severity: 'critical',
        description: 'File system access attempt',
        category: 'file_access',
        mitigation: 'Block LOAD_FILE function'
      },
      {
        pattern: /\binto\s+(outfile|dumpfile)\s+/gi,
        severity: 'critical',
        description: 'File write attempt',
        category: 'file_access',
        mitigation: 'Block INTO OUTFILE statements'
      },
      // Privilege escalation
      {
        pattern: /\bgrant\s+.*\bon\s+.*\bto\s+/gi,
        severity: 'critical',
        description: 'Privilege escalation attempt',
        category: 'privilege_escalation',
        mitigation: 'Block GRANT statements'
      },
      {
        pattern: /\balter\s+(login|user)\s+/gi,
        severity: 'critical',
        description: 'User modification attempt',
        category: 'privilege_escalation',
        mitigation: 'Block ALTER LOGIN/USER statements'
      }
    ];
  }

  // Initialize allowed SQL keywords
  private initializeAllowedKeywords(): Set<string> {
    return new Set([
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
      'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'ON', 'AS', 'ORDER', 'BY',
      'GROUP', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT', 'COUNT', 'SUM', 'AVG',
      'MIN', 'MAX', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
      'CREATE', 'TABLE', 'ALTER', 'DROP', 'INDEX', 'VIEW', 'TRIGGER',
      'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK',
      'DEFAULT', 'NULL', 'NOT_NULL', 'AUTO_INCREMENT', 'IDENTITY',
      'VARCHAR', 'CHAR', 'TEXT', 'INT', 'INTEGER', 'BIGINT', 'SMALLINT',
      'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'DATE', 'TIME', 'DATETIME',
      'TIMESTAMP', 'BOOLEAN', 'BOOL', 'BINARY', 'BLOB', 'JSON'
    ]);
  }

  // Initialize blocked SQL keywords
  private initializeBlockedKeywords(): Set<string> {
    return new Set([
      'UNION', 'UNION_ALL', 'LOAD_FILE', 'INTO_OUTFILE', 'INTO_DUMPFILE',
      'XP_CMDSHELL', 'SP_OACREATE', 'EXEC', 'EXECUTE', 'DBMS_LOCK.SLEEP',
      'WAITFOR', 'DELAY', 'SLEEP', 'BENCHMARK', 'PG_SLEEP', 'INFORMATION_SCHEMA',
      'SYSOBJECTS', 'SYSCOLUMNS', 'SYSUSERS', 'MASTER..XP_', 'XP_', 'SP_',
      'CMD_SHELL', 'OLE_AUTOMATION', 'WSCRIPT.SHELL', 'SCRIPTING.FILESYSTEMOBJECT',
      'GRANT', 'REVOKE', 'DENY', 'ALTER_LOGIN', 'ALTER_USER', 'CREATE_LOGIN',
      'DROP_LOGIN', 'CREATE_USER', 'DROP_USER', 'BACKUP', 'RESTORE', 'ATTACH',
      'DETACH', 'SHUTDOWN', 'KILL', 'DBCC', 'SETUSER', 'IMPERSONATE', 'CONTEXT_INFO'
    ]);
  }

  // Initialize whitelists
  private initializeWhitelists(): void {
    // Application-specific table whitelist
    this.whitelistTables = new Set([
      'users', 'profiles', 'documents', 'calculations', 'sessions',
      'audit_logs', 'tax_forms', 'itr_submissions', 'payments',
      'notifications', 'settings', 'preferences', 'activity_logs'
    ]);

    // Application-specific column whitelist
    this.whitelistColumns = new Set([
      'id', 'email', 'name', 'created_at', 'updated_at', 'status',
      'role', 'user_id', 'profile_id', 'document_id', 'calculation_id',
      'amount', 'tax_year', 'form_type', 'submission_date', 'payment_status'
    ]);
  }

  // Analyze query for SQL injection patterns
  public analyzeQuery(query: string): QueryAnalysisResult {
    const cacheKey = crypto.createHash('sha256').update(query).digest('hex');
    
    // Check cache
    if (this.queryCache.has(cacheKey)) {
      return this.queryCache.get(cacheKey)!;
    }

    const threats: QueryAnalysisResult['threats'] = [];
    let riskScore = 0;
    const recommendations: string[] = [];

    try {
      // Basic validation
      if (query.length > this.maxQueryLength) {
        threats.push({
          pattern: 'query_length_exceeded',
          severity: 'medium',
          description: `Query length ${query.length} exceeds maximum ${this.maxQueryLength}`,
          category: 'validation',
          match: `Length: ${query.length}`,
          position: 0
        });
        riskScore += 20;
      }

      // Parse query structure
      const structure = this.parseQueryStructure(query);

      // Check for injection patterns
      for (const pattern of this.patterns) {
        const matches = query.match(pattern.pattern);
        if (matches) {
          matches.forEach((match, index) => {
            const position = query.indexOf(match);
            threats.push({
              pattern: pattern.pattern.source,
              severity: pattern.severity,
              description: pattern.description,
              category: pattern.category,
              match: match,
              position: position
            });

            const severityScores = { low: 10, medium: 25, high: 50, critical: 100 };
            riskScore += severityScores[pattern.severity];
          });
        }
      }

      // Check for blocked keywords
      const upperQuery = query.toUpperCase();
      for (const blockedKeyword of this.blockedKeywords) {
        if (upperQuery.includes(blockedKeyword)) {
          threats.push({
            pattern: 'blocked_keyword',
            severity: 'critical',
            description: `Blocked SQL keyword: ${blockedKeyword}`,
            category: 'keyword',
            match: blockedKeyword,
            position: upperQuery.indexOf(blockedKeyword)
          });
          riskScore += 80;
        }
      }

      // Check for excessive UNION statements
      const unionCount = (query.match(/\bunion\b/gi) || []).length;
      if (unionCount > this.maxUnionCount) {
        threats.push({
          pattern: 'excessive_unions',
          severity: 'high',
          description: `Excessive UNION statements: ${unionCount}`,
          category: 'union',
          match: `UNION count: ${unionCount}`,
          position: 0
        });
        riskScore += 40;
      }

      // Check for nested queries
      const nestedDepth = this.calculateNestedDepth(query);
      if (nestedDepth > this.maxNestedDepth) {
        threats.push({
          pattern: 'excessive_nesting',
          severity: 'medium',
          description: `Excessive query nesting: ${nestedDepth}`,
          category: 'structure',
          match: `Nesting depth: ${nestedDepth}`,
          position: 0
        });
        riskScore += 25;
      }

      // Check for comment injection
      const commentCount = (query.match(/(\/\*|\*\/|--|#)/g) || []).length;
      if (commentCount > 2) {
        threats.push({
          pattern: 'excessive_comments',
          severity: 'medium',
          description: `Excessive SQL comments: ${commentCount}`,
          category: 'comment',
          match: `Comment count: ${commentCount}`,
          position: 0
        });
        riskScore += 20;
      }

      // Validate table names
      const invalidTables = structure.tables.filter(table => 
        !this.whitelistTables.has(table.toLowerCase())
      );
      if (invalidTables.length > 0) {
        threats.push({
          pattern: 'invalid_table',
          severity: 'high',
          description: `Invalid table names: ${invalidTables.join(', ')}`,
          category: 'validation',
          match: `Tables: ${invalidTables.join(', ')}`,
          position: 0
        });
        riskScore += 50;
      }

      // Validate column names
      const invalidColumns = structure.columns.filter(column => 
        !this.whitelistColumns.has(column.toLowerCase())
      );
      if (invalidColumns.length > 0) {
        threats.push({
          pattern: 'invalid_column',
          severity: 'medium',
          description: `Invalid column names: ${invalidColumns.join(', ')}`,
          category: 'validation',
          match: `Columns: ${invalidColumns.join(', ')}`,
          position: 0
        });
        riskScore += 30;
      }

      // Generate recommendations
      if (threats.length > 0) {
        recommendations.push('Use parameterized queries instead of string concatenation');
        recommendations.push('Validate and sanitize all user input');
        recommendations.push('Implement least privilege access for database users');
        recommendations.push('Use stored procedures where possible');
        recommendations.push('Enable query logging and monitoring');
      }

      const result: QueryAnalysisResult = {
        isSafe: threats.length === 0 && riskScore < 30,
        riskScore: Math.min(riskScore, 100),
        threats,
        recommendations,
        sanitizedQuery: threats.length > 0 ? this.sanitizeQuery(query) : query
      };

      // Cache result
      this.queryCache.set(cacheKey, result);

      return result;
    } catch (error) {
      return {
        isSafe: false,
        riskScore: 100,
        threats: [{
          pattern: 'analysis_error',
          severity: 'critical',
          description: `Query analysis error: ${error.message}`,
          category: 'system',
          match: error.message,
          position: 0
        }],
        recommendations: ['Review query syntax and structure'],
        sanitizedQuery: query
      };
    }
  }

  // Parse query structure
  private parseQueryStructure(query: string): QueryStructure {
    const upperQuery = query.toUpperCase();
    
    // Extract tables
    const tableMatches = upperQuery.match(/\bFROM\s+(\w+)|\bJOIN\s+(\w+)|\bINTO\s+(\w+)/g) || [];
    const tables = tableMatches.map(match => {
      const parts = match.split(/\s+/);
      return parts[parts.length - 1];
    }).filter(table => table && table.length > 0);

    // Extract columns
    const columnMatches = upperQuery.match(/\bSELECT\s+([^FROM]+)|\bWHERE\s+([^ORDER\s]+)|\bSET\s+([^WHERE\s]+)/g) || [];
    const columns = columnMatches.flatMap(match => {
      const parts = match.split(/[\s,=]+/);
      return parts.filter(part => part.length > 0 && !this.allowedKeywords.has(part));
    });

    // Extract conditions
    const conditionMatches = upperQuery.match(/\bWHERE\s+([^ORDER\s]+)|\bHAVING\s+([^ORDER\s]+)/g) || [];
    const conditions = conditionMatches.map(match => {
      const parts = match.split(/\s+/);
      return parts.slice(1).join(' ');
    });

    // Extract joins
    const joinMatches = upperQuery.match(/\bJOIN\s+(\w+).*\bON\s+([^\s]+)/g) || [];
    const joins = joinMatches;

    // Extract functions
    const functionMatches = query.match(/\b(\w+)\s*\(/g) || [];
    const functions = functionMatches.map(match => match.replace('(', ''));

    // Extract keywords
    const keywords = upperQuery.split(/\s+/).filter(word => 
      word.length > 0 && this.allowedKeywords.has(word)
    );

    // Analyze risk factors
    const riskFactors = {
      hasDynamicSQL: query.includes('+') || query.includes('||') || query.includes('CONCAT'),
      hasUserInput: query.includes('${') || query.includes('?') || query.includes('@'),
      hasUnion: upperQuery.includes('UNION'),
      hasComment: query.includes('--') || query.includes('/*') || query.includes('#'),
      hasMultipleStatements: query.includes(';') && query.indexOf(';') < query.length - 1,
      hasSubquery: upperQuery.includes('SELECT') && upperQuery.indexOf('SELECT') !== upperQuery.lastIndexOf('SELECT'),
      hasStoredProcedure: functions.some(func => func.startsWith('SP_') || func.startsWith('XP_'))
    };

    return {
      type: this.detectQueryType(upperQuery),
      tables: [...new Set(tables)],
      columns: [...new Set(columns)],
      conditions,
      joins,
      functions: [...new Set(functions)],
      keywords: [...new Set(keywords)],
      riskFactors
    };
  }

  // Detect query type
  private detectQueryType(query: string): QueryStructure['type'] {
    if (query.startsWith('SELECT')) return 'SELECT';
    if (query.startsWith('INSERT')) return 'INSERT';
    if (query.startsWith('UPDATE')) return 'UPDATE';
    if (query.startsWith('DELETE')) return 'DELETE';
    if (query.startsWith('CREATE')) return 'CREATE';
    if (query.startsWith('ALTER')) return 'ALTER';
    if (query.startsWith('DROP')) return 'DROP';
    if (query.startsWith('EXEC')) return 'EXECUTE';
    return 'UNKNOWN';
  }

  // Calculate nested query depth
  private calculateNestedDepth(query: string): number {
    let depth = 0;
    let maxDepth = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < query.length; i++) {
      const char = query[i];
      const prevChar = i > 0 ? query[i - 1] : '';

      // Handle string literals
      if ((char === "'" || char === '"') && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
        continue;
      }

      if (inString) continue;

      // Count parentheses for nesting depth
      if (char === '(') {
        depth++;
        maxDepth = Math.max(maxDepth, depth);
      } else if (char === ')') {
        depth--;
        if (depth < 0) depth = 0;
      }
    }

    return maxDepth;
  }

  // Sanitize query
  private sanitizeQuery(query: string): string {
    let sanitized = query;

    // Remove comments
    sanitized = sanitized.replace(/\/\*.*?\*\//gs, '');
    sanitized = sanitized.replace(/--.*$/gm, '');
    sanitized = sanitized.replace(/#.*$/gm, '');

    // Remove dangerous keywords
    for (const blockedKeyword of this.blockedKeywords) {
      const regex = new RegExp(`\\b${blockedKeyword}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    }

    // Limit UNION statements
    const unionCount = (sanitized.match(/\bunion\b/gi) || []).length;
    if (unionCount > this.maxUnionCount) {
      sanitized = sanitized.replace(/\bunion\b/gi, '');
    }

    // Remove multiple statements
    const statements = sanitized.split(';');
    if (statements.length > 1) {
      sanitized = statements[0] + ';';
    }

    return sanitized.trim();
  }

  // Validate table name
  public validateTableName(tableName: string): {
    isValid: boolean;
    reason?: string;
  } {
    if (!tableName || typeof tableName !== 'string') {
      return { isValid: false, reason: 'Invalid table name type' };
    }

    if (tableName.length > 64) {
      return { isValid: false, reason: 'Table name too long' };
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
      return { isValid: false, reason: 'Invalid table name format' };
    }

    if (!this.whitelistTables.has(tableName.toLowerCase())) {
      return { isValid: false, reason: 'Table not in whitelist' };
    }

    return { isValid: true };
  }

  // Validate column name
  public validateColumnName(columnName: string): {
    isValid: boolean;
    reason?: string;
  } {
    if (!columnName || typeof columnName !== 'string') {
      return { isValid: false, reason: 'Invalid column name type' };
    }

    if (columnName.length > 64) {
      return { isValid: false, reason: 'Column name too long' };
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(columnName)) {
      return { isValid: false, reason: 'Invalid column name format' };
    }

    if (!this.whitelistColumns.has(columnName.toLowerCase())) {
      return { isValid: false, reason: 'Column not in whitelist' };
    }

    return { isValid: true };
  }

  // Generate parameterized query
  public generateParameterizedQuery(queryTemplate: string, parameters: Record<string, any>): {
    query: string;
    parameters: any[];
    isSafe: boolean;
  } {
    const paramArray: any[] = [];
    let paramIndex = 1;

    // Replace named parameters with positional parameters
    const query = queryTemplate.replace(/:(\w+)/g, (match, paramName) => {
      const value = parameters[paramName];
      
      // Validate parameter value
      if (!this.validateParameterValue(value)) {
        throw new Error(`Invalid parameter value: ${paramName}`);
      }

      paramArray.push(value);
      return `$${paramIndex++}`;
    });

    return {
      query,
      parameters: paramArray,
      isSafe: true
    };
  }

  // Validate parameter value
  private validateParameterValue(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string') {
      // Check for SQL injection patterns in parameter values
      const analysis = this.analyzeQuery(value);
      return analysis.isSafe;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value);
    }

    if (typeof value === 'boolean') {
      return true;
    }

    if (value instanceof Date) {
      return !isNaN(value.getTime());
    }

    if (Array.isArray(value)) {
      return value.every(item => this.validateParameterValue(item));
    }

    return false;
  }

  // Clear cache
  public clearCache(): void {
    this.queryCache.clear();
  }

  // Get cache statistics
  public getCacheStats(): {
    size: number;
    hitRate: number;
    missRate: number;
  } {
    return {
      size: this.queryCache.size,
      hitRate: 0, // Would need to track hits/misses
      missRate: 0
    };
  }
}

// SQL Injection Prevention Middleware
export const createSQLInjectionPrevention = () => {
  const preventionService = new SQLInjectionPreventionService();

  return {
    // Main middleware
    middleware: (req: Request, res: Response, next: NextFunction) => {
      try {
        // Analyze request body for SQL injection patterns
        if (req.body && typeof req.body === 'object') {
          const bodyString = JSON.stringify(req.body);
          const analysis = preventionService.analyzeQuery(bodyString);
          
          if (!analysis.isSafe) {
            console.warn('🚨 SQL injection attempt detected:', {
              ip: req.ip,
              userAgent: req.headers['user-agent'],
              threats: analysis.threats,
              riskScore: analysis.riskScore
            });

            return res.status(400).json({
              error: 'Malicious SQL content detected',
              code: 'SQL_INJECTION_DETECTED',
              threats: analysis.threats.map(t => ({
                description: t.description,
                severity: t.severity,
                category: t.category
              }))
            });
          }
        }

        // Analyze query parameters
        if (req.query && Object.keys(req.query).length > 0) {
          const queryString = JSON.stringify(req.query);
          const analysis = preventionService.analyzeQuery(queryString);
          
          if (!analysis.isSafe) {
            console.warn('🚨 SQL injection in query parameters:', {
              ip: req.ip,
              userAgent: req.headers['user-agent'],
              threats: analysis.threats
            });

            return res.status(400).json({
              error: 'Malicious content in query parameters',
              code: 'SQL_INJECTION_QUERY_PARAMS'
            });
          }
        }

        next();
      } catch (error) {
        console.error('SQL injection prevention error:', error);
        res.status(500).json({ error: 'Security processing error' });
      }
    },

    // Query validation helper
    validateQuery: (query: string): QueryAnalysisResult => {
      return preventionService.analyzeQuery(query);
    },

    // Parameterized query helper
    createParameterizedQuery: (template: string, parameters: Record<string, any>) => {
      return preventionService.generateParameterizedQuery(template, parameters);
    },

    // Table validation helper
    validateTableName: (tableName: string) => {
      return preventionService.validateTableName(tableName);
    },

    // Column validation helper
    validateColumnName: (columnName: string) => {
      return preventionService.validateColumnName(columnName);
    },

    // Get service instance
    getService: () => preventionService
  };
};

// Export default instance
export const sqlInjectionPrevention = createSQLInjectionPrevention();

export default SQLInjectionPreventionService;
