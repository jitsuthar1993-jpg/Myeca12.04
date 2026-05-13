import rateLimit from "express-rate-limit";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  error: string;
  retryAfter?: string;
  skipSuccessfulRequests?: boolean;
};

function createRateLimiter(options: RateLimitOptions) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests,
    message: {
      error: options.error,
      ...(options.retryAfter ? { retryAfter: options.retryAfter } : {}),
    },
    handler: (_req, res) => {
      res.status(429).json({
        error: options.error,
        ...(options.retryAfter ? { retryAfter: options.retryAfter } : {}),
        timestamp: new Date().toISOString(),
      });
    },
  });
}

export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  error: "Too many requests from this IP, please try again later.",
  retryAfter: "15 minutes",
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  error: "Too many requests from this IP, please try again later.",
  retryAfter: "15 minutes",
});

/** Auth endpoints: 20 requests per 15 minutes per IP. */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  error: "Too many authentication attempts, please try again later.",
  retryAfter: "15 minutes",
});

/** Admin API: 60 requests per minute per IP. */
export const adminLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  error: "Too many admin requests, please try again later.",
  retryAfter: "1 minute",
});

/** File uploads: 10 per minute per IP. */
export const uploadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 10,
  error: "Upload limit reached, please wait a moment.",
  retryAfter: "1 minute",
});

// Compatibility aliases for older imports.
export const authRateLimiter = authLimiter;
export const authRateLimit = authLimiter;
export const apiRateLimit = apiRateLimiter;
