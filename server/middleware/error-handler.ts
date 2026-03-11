// Error Handling and Logging Middleware
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

const LOGGING_CONFIG = {
  DEVELOPMENT_LOGGING: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  FILE_PATH: './logs',
  FILE_ENABLED: false,
  MAX_FILE_SIZE: 10 * 1024 * 1024,
  CONSOLE_ENABLED: true,
  LOG_REQUESTS: process.env.NODE_ENV === 'development',
  LOG_RESPONSES: process.env.NODE_ENV === 'development',
  ENABLED: true,
  LEVEL: process.env.LOG_LEVEL || 'info'
};

// Error types
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  errors: any[];
  
  constructor(message: string, errors: any[] = []) {
    super(message, 400);
    this.errors = errors;
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
  }
}

// Logging utility
class Logger {
  private logDir: string;
  private logFile: string;
  private errorFile: string;
  
  constructor() {
    this.logDir = LOGGING_CONFIG.FILE_PATH;
    this.logFile = path.join(this.logDir, 'app.log');
    this.errorFile = path.join(this.logDir, 'error.log');
    
    this.ensureLogDirectory();
  }
  
  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  private formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
  }
  
  private writeToFile(filePath: string, message: string): void {
    if (LOGGING_CONFIG.FILE_ENABLED) {
      fs.appendFile(filePath, message, (err) => {
        if (err) {
          console.error('Failed to write to log file:', err);
        }
      });
    }
  }
  
  private rotateLogs(): void {
    // Simple log rotation - in production, use winston or similar
    const maxSize = LOGGING_CONFIG.MAX_FILE_SIZE;
    
    [this.logFile, this.errorFile].forEach(filePath => {
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > maxSize) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const backupPath = `${filePath}.${timestamp}`;
          fs.renameSync(filePath, backupPath);
        }
      }
    });
  }
  
  info(message: string, meta?: any): void {
    const formattedMessage = this.formatMessage('info', message, meta);
    
    if (LOGGING_CONFIG.CONSOLE_ENABLED) {
      console.log(`\x1b[36m[INFO]\x1b[0m ${message}`, meta || '');
    }
    
    this.writeToFile(this.logFile, formattedMessage);
  }
  
  warn(message: string, meta?: any): void {
    const formattedMessage = this.formatMessage('warn', message, meta);
    
    if (LOGGING_CONFIG.CONSOLE_ENABLED) {
      console.warn(`\x1b[33m[WARN]\x1b[0m ${message}`, meta || '');
    }
    
    this.writeToFile(this.logFile, formattedMessage);
  }
  
  error(message: string, meta?: any): void {
    const formattedMessage = this.formatMessage('error', message, meta);
    
    if (LOGGING_CONFIG.CONSOLE_ENABLED) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${message}`, meta || '');
    }
    
    this.writeToFile(this.logFile, formattedMessage);
    this.writeToFile(this.errorFile, formattedMessage);
  }
  
  debug(message: string, meta?: any): void {
    if (LOGGING_CONFIG.LEVEL === 'debug') {
      const formattedMessage = this.formatMessage('debug', message, meta);
      
      if (LOGGING_CONFIG.CONSOLE_ENABLED) {
        console.debug(`\x1b[35m[DEBUG]\x1b[0m ${message}`, meta || '');
      }
      
      this.writeToFile(this.logFile, formattedMessage);
    }
  }
}

export const logger = new Logger();

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  if (LOGGING_CONFIG.LOG_REQUESTS) {
    const startTime = Date.now();
    
    // Log request
    logger.info(`${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
    
    // Log response time
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration,
        timestamp: new Date().toISOString()
      });
    });
  }
  
  next();
};

// Error logging middleware
export const errorLogger = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error(`${error.name}: ${error.message}`, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      body: LOGGING_CONFIG.LOG_RESPONSES ? req.body : undefined,
      params: req.params,
      query: req.query
    },
    timestamp: new Date().toISOString()
  });
  
  next(error);
};

// Global error handler
export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  let error = err;
  
  // Convert non-operational errors to operational errors
  if (!(error instanceof AppError)) {
    error = new AppError(error.message, 500);
  }
  
  const appError = error as AppError;
  
  // Log error to console
  if (LOGGING_CONFIG.ENABLED) {
    logger.error(`Error: ${appError.name} - ${appError.message}`, {
      statusCode: appError.statusCode,
      stack: appError.stack,
      request: {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip
      }
    });
  }
  
  // Send error response
  const response: any = {
    success: false,
    message: appError.message,
    statusCode: appError.statusCode
  };
  
  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      name: appError.name,
      stack: appError.stack
    };
    
    if (appError instanceof ValidationError && appError.errors.length > 0) {
      response.errors = appError.errors;
    }
  }
  
  // Add helpful messages for common errors
  if (appError.statusCode === 404) {
    response.help = 'The requested resource was not found. Please check the URL and try again.';
  } else if (appError.statusCode === 401) {
    response.help = 'Authentication is required. Please log in and try again.';
  } else if (appError.statusCode === 403) {
    response.help = 'You do not have permission to access this resource.';
  } else if (appError.statusCode === 400) {
    response.help = 'The request was invalid. Please check your input and try again.';
  } else if (appError.statusCode >= 500) {
    response.help = 'An internal server error occurred. Please try again later or contact support.';
  }
  
  res.status(appError.statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
    statusCode: 404,
    help: 'The requested resource was not found. Please check the URL and try again.'
  });
};

// Validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Simple validation - in production, use Joi or similar
      const { error } = schema.validate(req.body);
      
      if (error) {
        throw new ValidationError('Validation failed', error.details);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Rate limiting helper
export const createRateLimiter = (windowMs: number, max: number, message: string) => {
  const requests = new Map<string, { count: number; resetTime: number }>();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    
    if (!requests.has(key)) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const requestData = requests.get(key)!;
    
    if (now > requestData.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (requestData.count >= max) {
      res.status(429).json({
        success: false,
        message,
        retryAfter: Math.ceil((requestData.resetTime - now) / 1000)
      });
      return;
    }
    
    requestData.count++;
    next();
  };
};

// Security headers middleware
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // Basic security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Remove server identification
  res.removeHeader('X-Powered-By');
  
  next();
};

// CORS middleware
export const corsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  const origin = req.headers.origin as string;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
};

// Request timeout middleware
export const requestTimeout = (timeoutMs: number = 30000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          message: 'Request timeout',
          help: 'The request took too long to process. Please try again.'
        });
      }
    }, timeoutMs);
    
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));
    
    next();
  };
};

export default {
  logger,
  requestLogger,
  errorLogger,
  globalErrorHandler,
  notFoundHandler,
  validateRequest,
  asyncHandler,
  createRateLimiter,
  securityHeaders,
  corsMiddleware,
  requestTimeout,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError
};