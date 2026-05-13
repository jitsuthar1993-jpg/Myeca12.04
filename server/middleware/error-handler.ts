// Error Handling and Logging Middleware
import { Request, Response, NextFunction } from 'express';

const LOGGING_CONFIG = {
  DEVELOPMENT_LOGGING: process.env.NODE_ENV === 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
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
  private formatMessage(level: string, message: string, meta?: any) {
    const timestamp = new Date().toISOString();
    return {
      level,
      message,
      timestamp,
      ...(meta ? { meta } : {}),
    };
  }
  
  info(message: string, meta?: any): void {
    if (LOGGING_CONFIG.CONSOLE_ENABLED) {
      console.info(this.formatMessage('info', message, meta));
    }
  }
  
  warn(message: string, meta?: any): void {
    if (LOGGING_CONFIG.CONSOLE_ENABLED) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }
  
  error(message: string, meta?: any): void {
    if (LOGGING_CONFIG.CONSOLE_ENABLED) {
      console.error(this.formatMessage('error', message, meta));
    }
  }
  
  debug(message: string, meta?: any): void {
    if (LOGGING_CONFIG.LEVEL === 'debug') {
      if (LOGGING_CONFIG.CONSOLE_ENABLED) {
        console.debug(this.formatMessage('debug', message, meta));
      }
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
  securityHeaders,
  corsMiddleware,
  requestTimeout,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError
};
