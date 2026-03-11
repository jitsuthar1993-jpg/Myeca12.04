
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function createRateLimit(windowMs: number, max: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    Object.keys(store).forEach(k => {
      if (store[k].resetTime < now) {
        delete store[k];
      }
    });
    
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }
    
    if (store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }
    
    if (store[key].count >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        retryAfter: Math.ceil((store[key].resetTime - now) / 1000)
      });
    }
    
    store[key].count++;
    next();
  };
}

// Common rate limiters
export const generalRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes
export const authRateLimit = createRateLimit(15 * 60 * 1000, 10); // 10 auth attempts per 15 minutes
export const apiRateLimit = createRateLimit(60 * 1000, 60); // 60 requests per minute
