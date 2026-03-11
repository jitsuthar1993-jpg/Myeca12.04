// File Upload Security Validation and Scanning
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

declare global {
  namespace Express {
    interface Request {
      fileValidationResults?: FileAnalysisResult[];
    }
  }
}

// File Upload Configuration
interface FileUploadConfig {
  enabled: boolean;
  maxFileSize: number;
  allowedExtensions: string[];
  allowedMimeTypes: string[];
  blockedExtensions: string[];
  blockedMimeTypes: string[];
  scanForMalware: boolean;
  validateFileContent: boolean;
  checkMagicNumbers: boolean;
  maxFilenameLength: number;
  sanitizeFilenames: boolean;
  generateSafeFilenames: boolean;
  uploadDirectory: string;
  quarantineDirectory: string;
  virusScanEnabled: boolean;
  clamavEnabled: boolean;
  maxFilesPerRequest: number;
  requireAuthentication: boolean;
  rateLimitEnabled: boolean;
}

// File Analysis Result
interface FileAnalysisResult {
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  hash: string;
  magicNumber: string;
  isValid: boolean;
  threats: string[];
  warnings: string[];
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    pages?: number;
    created?: Date;
    modified?: Date;
  };
}

// Malware Detection Service
class MalwareDetectionService {
  private virusDefinitions: Map<string, string> = new Map();
  private suspiciousPatterns: RegExp[] = [
    // PHP shells
    /<\?php.*eval\s*\(/gi,
    /<\?php.*system\s*\(/gi,
    /<\?php.*exec\s*\(/gi,
    /<\?php.*shell_exec\s*\(/gi,
    /<\?php.*passthru\s*\(/gi,
    
    // JavaScript malware
    /eval\s*\(\s*['"`]\s*[a-zA-Z0-9+/=]+['"`]\s*\)/gi,
    /document\.write\s*\(\s*unescape\s*\(/gi,
    /String\.fromCharCode\s*\(/gi,
    
    // Command injection
    /[;&|`]/g,
    /\$\(/g,
    /\|\|/g,
    /&&/g,
    
    // SQL injection
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|cast|convert)\b)/i,
    /(--|\/\*|\*\/)/,
    
    // File inclusion
    /include\s*\(/gi,
    /require\s*\(/gi,
    /include_once\s*\(/gi,
    /require_once\s*\(/gi,
    
    // Dangerous functions
    /file_get_contents\s*\(/gi,
    /file_put_contents\s*\(/gi,
    /unlink\s*\(/gi,
    /rmdir\s*\(/gi,
    /mkdir\s*\(/gi,
    /chmod\s*\(/gi,
    /chown\s*\(/gi,
    
    // Base64 encoded content
    /[A-Za-z0-9+/]{100,}={0,2}/g,
    
    // Hex encoded content
    /[0-9a-fA-F]{100,}/g,
    
    // Suspicious variable names
    /\$_(GET|POST|COOKIE|SERVER|SESSION|FILES|ENV|HTTP_RAW_POST_DATA)/gi,
    
    // Web shells
    /c99shell/gi,
    /r57shell/gi,
    /wso\s*\(/gi,
    /b374k/gi,
    /zehir/gi,
    /symlink/gi,
    
    // Backdoors
    /backdoor/gi,
    /webshell/gi,
    /shell_exec/gi,
    /passthru/gi,
    /proc_open/gi,
    /popen/gi,
    /pcntl_exec/gi,
    
    // Obfuscation patterns
    /\\x[0-9a-fA-F]{2}/g,
    /\\[0-9]{3}/g,
    /%[0-9a-fA-F]{2}/gi,
    
    // Credit card numbers
    /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
    
    // Social security numbers
    /\b\d{3}-?\d{2}-?\d{4}\b/g,
    
    // Email addresses (for privacy)
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
  ];

  async scanFile(filePath: string, content: Buffer): Promise<{
    isMalicious: boolean;
    threats: string[];
    confidence: number;
    details: string[];
  }> {
    const threats: string[] = [];
    const details: string[] = [];
    let confidence = 0;

    try {
      // Convert content to string for pattern matching
      const contentString = content.toString('utf-8', 0, Math.min(content.length, 1024 * 1024)); // First 1MB

      // Check for suspicious patterns
      this.suspiciousPatterns.forEach((pattern, index) => {
        if (pattern.test(contentString)) {
          const threatName = this.getThreatName(index);
          threats.push(threatName);
          confidence += this.getThreatConfidence(index);
          details.push(`Found ${threatName} pattern`);
        }
      });

      // Check for encoded content
      const encodedContent = this.checkEncodedContent(content);
      if (encodedContent.isEncoded) {
        threats.push('encoded_content');
        confidence += 30;
        details.push(`Found encoded content: ${encodedContent.type}`);
      }

      // Check for hidden content
      const hiddenContent = this.checkHiddenContent(content);
      if (hiddenContent.hasHiddenContent) {
        threats.push('hidden_content');
        confidence += 25;
        details.push(`Found hidden content: ${hiddenContent.description}`);
      }

      // Check for polymorphic code
      const polymorphic = this.checkPolymorphicCode(contentString);
      if (polymorphic.isPolymorphic) {
        threats.push('polymorphic_code');
        confidence += 40;
        details.push('Found polymorphic code patterns');
      }

      return {
        isMalicious: confidence > 50,
        threats: Array.from(new Set(threats)),
        confidence: Math.min(confidence, 100),
        details
      };
    } catch (error) {
      console.error('Malware scan error:', error);
      return {
        isMalicious: false,
        threats: ['scan_error'],
        confidence: 0,
        details: ['Error during malware scan']
      };
    }
  }

  private getThreatName(index: number): string {
    const threatNames = [
      'php_shell', 'php_system', 'php_exec', 'php_shell_exec', 'php_passthru',
      'js_eval', 'js_document_write', 'js_charcode',
      'command_injection', 'command_substitution', 'command_chaining',
      'sql_injection', 'sql_comments',
      'file_inclusion', 'file_require', 'file_include_once', 'file_require_once',
      'dangerous_functions', 'file_operations', 'directory_operations',
      'base64_encoded', 'hex_encoded',
      'suspicious_variables', 'web_shells', 'backdoors',
      'obfuscated_code', 'encoded_characters',
      'credit_card_numbers', 'social_security_numbers', 'email_addresses'
    ];
    
    return threatNames[index] || `threat_${index}`;
  }

  private getThreatConfidence(index: number): number {
    const confidences = [
      30, 25, 20, 25, 20,
      15, 10, 15,
      20, 15, 15,
      25, 10,
      15, 15, 15, 15,
      20, 20, 15, 15, 15, 15, 15,
      10, 10,
      10, 30, 25, 15,
      15, 10, 10, 10, 10,
      20, 15, 10
    ];
    
    return confidences[index] || 10;
  }

  private checkEncodedContent(content: Buffer): {
    isEncoded: boolean;
    type: string;
  } {
    const contentString = content.toString('utf-8', 0, Math.min(content.length, 10000));
    
    // Check for base64
    const base64Pattern = /[A-Za-z0-9+/]{100,}={0,2}/g;
    if (base64Pattern.test(contentString)) {
      return { isEncoded: true, type: 'base64' };
    }
    
    // Check for hex
    const hexPattern = /[0-9a-fA-F]{100,}/g;
    if (hexPattern.test(contentString)) {
      return { isEncoded: true, type: 'hex' };
    }
    
    // Check for URL encoding
    const urlPattern = /%[0-9a-fA-F]{2}/g;
    if (urlPattern.test(contentString)) {
      return { isEncoded: true, type: 'url_encoded' };
    }
    
    return { isEncoded: false, type: '' };
  }

  private checkHiddenContent(content: Buffer): {
    hasHiddenContent: boolean;
    description: string;
  } {
    // Check for null bytes
    if (content.includes(Buffer.from([0x00]))) {
      return { hasHiddenContent: true, description: 'null_bytes' };
    }
    
    // Check for whitespace stuffing
    const contentString = content.toString('utf-8', 0, Math.min(content.length, 1000));
    if (contentString.includes('\x00') || contentString.includes('\xFF')) {
      return { hasHiddenContent: true, description: 'whitespace_stuffing' };
    }
    
    return { hasHiddenContent: false, description: '' };
  }

  private checkPolymorphicCode(content: string): {
    isPolymorphic: boolean;
  } {
    // Simple heuristic: check for excessive randomness or variation
    const lines = content.split('\n').slice(0, 100); // First 100 lines
    const uniqueLines = new Set(lines);
    
    if (uniqueLines.size < lines.length * 0.5) {
      return { isPolymorphic: true };
    }
    
    return { isPolymorphic: false };
  }
}

// File Type Validation Service
class FileTypeValidator {
  private magicNumbers: Map<string, string[]> = new Map([
    ['image/jpeg', ['FFD8FF']],
    ['image/png', ['89504E47']],
    ['image/gif', ['47494638']],
    ['image/webp', ['52494646']],
    ['image/bmp', ['424D']],
    ['image/svg+xml', ['3C737667']],
    ['application/pdf', ['25504446']],
    ['application/msword', ['D0CF11E0']],
    ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', ['504B0304']],
    ['application/vnd.ms-excel', ['D0CF11E0']],
    ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ['504B0304']],
    ['text/plain', []],
    ['text/csv', []],
    ['application/json', []]
  ]);

  async validateFile(filePath: string, expectedMimeType: string): Promise<{
    isValid: boolean;
    actualMimeType: string;
    magicNumber: string;
    warnings: string[];
  }> {
    const warnings: string[] = [];
    
    try {
      // Read first 8 bytes for magic number
      const fullBuffer = await fs.readFile(filePath);
      const buffer = fullBuffer.subarray(0, 8);
      const magicNumber = buffer.toString('hex').toUpperCase();
      
      // Check magic number
      const expectedMagicNumbers = this.magicNumbers.get(expectedMimeType);
      let isValid = false;
      
      if (expectedMagicNumbers && expectedMagicNumbers.length > 0) {
        isValid = expectedMagicNumbers.some(expected => 
          magicNumber.startsWith(expected)
        );
        
        if (!isValid) {
          warnings.push(`Magic number mismatch. Expected: ${expectedMagicNumbers.join(' or ')}, Got: ${magicNumber}`);
        }
      } else {
        // For text-based files, check content
        isValid = await this.validateTextContent(buffer, expectedMimeType);
        if (!isValid) {
          warnings.push(`Content validation failed for ${expectedMimeType}`);
        }
      }
      
      return {
        isValid,
        actualMimeType: expectedMimeType,
        magicNumber,
        warnings
      };
    } catch (error) {
      return {
        isValid: false,
        actualMimeType: expectedMimeType,
        magicNumber: '',
        warnings: [`Error reading file: ${(error as Error).message}`]
      };
    }
  }

  private async validateTextContent(buffer: Buffer, mimeType: string): Promise<boolean> {
    try {
      const content = buffer.toString('utf-8', 0, Math.min(buffer.length, 1000));
      
      switch (mimeType) {
        case 'application/json':
          JSON.parse(content);
          return true;
        
        case 'text/csv':
          return content.includes(',') || content.includes('\t');
        
        case 'text/plain':
        case 'text/html':
        case 'text/xml':
          return true; // Text files are generally valid
        
        default:
          return true;
      }
    } catch (error) {
      return false;
    }
  }
}

// File Upload Security Service
class FileUploadSecurityService {
  private config: FileUploadConfig;
  private malwareDetector: MalwareDetectionService;
  private fileTypeValidator: FileTypeValidator;

  constructor(config: FileUploadConfig) {
    this.config = config;
    this.malwareDetector = new MalwareDetectionService();
    this.fileTypeValidator = new FileTypeValidator();
  }

  async validateFileUpload(file: Express.Multer.File, userId?: string | number): Promise<FileAnalysisResult> {
    const threats: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic file validation
      const basicValidation = this.performBasicValidation(file);
      if (!basicValidation.isValid) {
        threats.push(...basicValidation.threats);
        warnings.push(...basicValidation.warnings);
      }

      // Filename validation
      const filenameValidation = this.validateFilename(file.originalname);
      if (!filenameValidation.isValid) {
        threats.push(...filenameValidation.threats);
        warnings.push(...filenameValidation.warnings);
      }

      // File type validation
      const fileTypeValidation = await this.validateFileType(file);
      if (!fileTypeValidation.isValid) {
        threats.push(...fileTypeValidation.threats);
        warnings.push(...fileTypeValidation.warnings);
      }

      // Malware detection
      if (this.config.scanForMalware) {
        const malwareScan = await this.malwareDetector.scanFile(file.path, file.buffer);
        if (malwareScan.isMalicious) {
          threats.push(...malwareScan.threats);
          warnings.push(...malwareScan.details);
        }
      }

      // Generate file hash
      const hash = crypto.createHash('sha256').update(file.buffer).digest('hex');

      // Extract metadata
      const metadata = await this.extractMetadata(file);

      return {
        filename: file.filename || file.originalname,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        extension: path.extname(file.originalname).toLowerCase(),
        hash,
        magicNumber: '', // Will be filled by file type validator
        isValid: threats.length === 0,
        threats: Array.from(new Set(threats)),
        warnings: Array.from(new Set(warnings)),
        metadata
      };
    } catch (error) {
      return {
        filename: file.originalname,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        extension: path.extname(file.originalname).toLowerCase(),
        hash: '',
        magicNumber: '',
        isValid: false,
        threats: ['validation_error'],
        warnings: [`Validation error: ${(error as Error).message}`],
        metadata: {}
      };
    }
  }

  private performBasicValidation(file: Express.Multer.File): {
    isValid: boolean;
    threats: string[];
    warnings: string[];
  } {
    const threats: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > this.config.maxFileSize) {
      threats.push('file_too_large');
      warnings.push(`File size ${file.size} exceeds maximum ${this.config.maxFileSize}`);
    }

    // Check for zero-byte files
    if (file.size === 0) {
      threats.push('empty_file');
      warnings.push('File is empty');
    }

    // Check extension
    const extension = path.extname(file.originalname).toLowerCase();
    if (this.config.blockedExtensions.includes(extension)) {
      threats.push('blocked_extension');
      warnings.push(`Extension ${extension} is blocked`);
    }

    if (!this.config.allowedExtensions.includes(extension) && this.config.allowedExtensions.length > 0) {
      threats.push('invalid_extension');
      warnings.push(`Extension ${extension} is not allowed`);
    }

    // Check MIME type
    if (this.config.blockedMimeTypes.includes(file.mimetype)) {
      threats.push('blocked_mime_type');
      warnings.push(`MIME type ${file.mimetype} is blocked`);
    }

    if (!this.config.allowedMimeTypes.includes(file.mimetype) && this.config.allowedMimeTypes.length > 0) {
      threats.push('invalid_mime_type');
      warnings.push(`MIME type ${file.mimetype} is not allowed`);
    }

    return {
      isValid: threats.length === 0,
      threats,
      warnings
    };
  }

  private validateFilename(filename: string): {
    isValid: boolean;
    threats: string[];
    warnings: string[];
  } {
    const threats: string[] = [];
    const warnings: string[] = [];

    // Check filename length
    if (filename.length > this.config.maxFilenameLength) {
      threats.push('filename_too_long');
      warnings.push(`Filename length ${filename.length} exceeds maximum ${this.config.maxFilenameLength}`);
    }

    // Check for directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      threats.push('directory_traversal');
      warnings.push('Filename contains directory traversal patterns');
    }

    // Check for null bytes
    if (filename.includes('\x00')) {
      threats.push('null_byte_injection');
      warnings.push('Filename contains null bytes');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /\.php\d*$/i,
      /\.phtml$/i,
      /\.php3$/i,
      /\.php4$/i,
      /\.php5$/i,
      /\.inc$/i,
      /\.hphp$/i,
      /\.ctp$/i
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(filename))) {
      threats.push('suspicious_filename');
      warnings.push('Filename contains suspicious patterns');
    }

    return {
      isValid: threats.length === 0,
      threats,
      warnings
    };
  }

  private async validateFileType(file: Express.Multer.File): Promise<{
    isValid: boolean;
    threats: string[];
    warnings: string[];
  }> {
    const threats: string[] = [];
    const warnings: string[] = [];

    if (this.config.validateFileContent) {
      const validation = await this.fileTypeValidator.validateFile(file.path, file.mimetype);
      
      if (!validation.isValid) {
        threats.push('file_type_mismatch');
        warnings.push(...validation.warnings);
      }
    }

    return {
      isValid: threats.length === 0,
      threats,
      warnings
    };
  }

  private async extractMetadata(file: Express.Multer.File): Promise<FileAnalysisResult['metadata']> {
    const metadata: FileAnalysisResult['metadata'] = {};

    try {
      // Basic file metadata
      const stats = await fs.stat(file.path);
      metadata.created = stats.birthtime;
      metadata.modified = stats.mtime;

      // For images, you could use libraries like sharp to extract image metadata
      // For PDFs, you could use libraries like pdf-parse
      // For videos, you could use libraries like ffprobe

      return metadata;
    } catch (error) {
      return metadata;
    }
  }

  generateSafeFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const sanitized = originalName.replace(/[^a-zA-Z0-9._-]/g, '');
    const nameWithoutExt = path.parse(sanitized).name;
    const extension = path.extname(sanitized);
    
    return `${nameWithoutExt}_${timestamp}_${randomString}${extension}`;
  }
}

// File Upload Security Middleware
export const fileUploadSecurity = (config: Partial<FileUploadConfig> = {}) => {
  const defaultConfig: FileUploadConfig = {
    enabled: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.csv', '.txt'],
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain'],
    blockedExtensions: ['.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar', '.zip', '.rar'],
    blockedMimeTypes: ['application/x-msdownload', 'application/x-exe', 'application/exe', 'application/x-msdos-program', 'application/x-com', 'application/x-bat', 'application/x-vbs', 'application/javascript', 'application/java-archive'],
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
  };

  const mergedConfig = { ...defaultConfig, ...config };
  const fileUploadSecurity = new FileUploadSecurityService(mergedConfig);

  return async (req: Request, res: Response, next: NextFunction) => {
    if (!mergedConfig.enabled) {
      return next();
    }

    try {
      // Check if files are present
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return next();
      }

      // Check file count limit
      if (req.files.length > mergedConfig.maxFilesPerRequest) {
        return res.status(400).json({
          error: 'Too many files',
          code: 'TOO_MANY_FILES',
          details: { maxFiles: mergedConfig.maxFilesPerRequest }
        });
      }

      const validationResults: FileAnalysisResult[] = [];
      const threats: string[] = [];

      // Validate each file
      for (const file of req.files as Express.Multer.File[]) {
        const result = await fileUploadSecurity.validateFileUpload(file, req.user?.id);
        validationResults.push(result);
        
        if (result.threats.length > 0) {
          threats.push(...result.threats);
        }

        // Quarantine malicious files
        if (!result.isValid && mergedConfig.quarantineDirectory) {
          await quarantineFile(file, mergedConfig.quarantineDirectory);
        }
      }

      // If threats are detected, block the upload
      if (threats.length > 0) {
        return res.status(400).json({
          error: 'Security threats detected in uploaded files',
          code: 'SECURITY_THREATS_DETECTED',
          details: {
            threats: Array.from(new Set(threats)),
            results: validationResults
          }
        });
      }

      // Attach validation results to request
      req.fileValidationResults = validationResults;

      next();
    } catch (error) {
      console.error('File upload security error:', error);
      res.status(500).json({
        error: 'File validation failed',
        code: 'FILE_VALIDATION_ERROR'
      });
    }
  };

  async function quarantineFile(file: Express.Multer.File, quarantineDir: string): Promise<void> {
    try {
      await fs.mkdir(quarantineDir, { recursive: true });
      const quarantinePath = path.join(quarantineDir, `${Date.now()}_${file.originalname}`);
      await fs.copyFile(file.path, quarantinePath);
      
      // Log quarantine event
      console.log(`🚨 File quarantined: ${file.originalname} -> ${quarantinePath}`);
    } catch (error) {
      console.error('Error quarantining file:', error);
    }
  }
};

// Export services for testing and advanced usage
export { FileUploadSecurityService, MalwareDetectionService, FileTypeValidator };