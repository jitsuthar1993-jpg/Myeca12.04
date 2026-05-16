import "dotenv/config";
import { validateEnv } from "./lib/env-validation.js";
validateEnv();

import express from "express";
import cors from "cors";
import compress from "compression";
import path from "path";
import { registerRoutes } from "./routes.js";
import { customSecurityHeaders, securityHeaders } from "./middleware/security.js";
import { globalErrorHandler } from "./middleware/error-handler.js";
import { generalRateLimit } from "./middleware/rateLimiting.js";
import { getRequestId, requestIdMiddleware } from "./middleware/request-id.js";

const app = express();
const productionOrigins: (string | RegExp)[] = [
  "https://myeca.in",
  "https://www.myeca.in",
];
const localOrigins: RegExp[] = [/^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/];

function isLocalHost(host: string | undefined) {
  const normalizedHost = host?.split(":")[0] || "";
  return normalizedHost === "localhost" || normalizedHost === "127.0.0.1" || normalizedHost === "::1";
}

function isAllowedOrigin(origin: string, allowLocalOrigins: boolean) {
  const allowedOrigins = allowLocalOrigins ? [...productionOrigins, ...localOrigins] : productionOrigins;
  return allowedOrigins.some((entry) =>
    typeof entry === "string" ? entry === origin : entry.test(origin),
  );
}

app.use(requestIdMiddleware);
app.use(compress());
app.use(securityHeaders);
app.use(customSecurityHeaders);

app.use((req, res, next) => {
  const allowLocalOrigins = process.env.NODE_ENV !== "production" || isLocalHost(req.hostname || req.headers.host);
  return cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (isAllowedOrigin(origin, allowLocalOrigins)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })(req, res, next);
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/api", generalRateLimit);

// Serve blog images from filesystem in local dev. Vercel production media should live in Blob.
if (!process.env.VERCEL) {
  app.use(
    "/uploads/blog",
    express.static(path.join(process.cwd(), "public/uploads/blog"), {
      maxAge: "7d",
      etag: true,
      fallthrough: false,
    }),
  );
}

app.use("/api", (req, res, next) => {
  if (req.method === "GET" && (req.path.startsWith("/public") || req.path.startsWith("/cms"))) {
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");
  } else if (req.method === "GET") {
    res.set("Cache-Control", "private, no-cache");
  } else {
    res.set("Cache-Control", "no-store");
  }
  next();
});

app.use("/api", (req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const origin = req.get("origin");
  if (process.env.NODE_ENV === "production" && origin) {
    if (!isAllowedOrigin(origin, isLocalHost(req.hostname || req.headers.host))) {
      return res.status(403).json({
        success: false,
        error: "CSRF validation failed",
        requestId: getRequestId(req, res),
      });
    }
  }

  next();
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api") && (res.statusCode >= 400 || duration > 1000)) {
      console.info({
        event: "api_request_observed",
        requestId: getRequestId(req, res),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: duration,
      });
    }
  });

  next();
});

// Register all API routes (synchronous-safe: routes are registered before export)
let _routesRegistered = false;
const _routesReady = (async () => {
  await registerRoutes(app);
  app.use(globalErrorHandler);
  _routesRegistered = true;
})();

app.use(async (_req, _res, next) => {
  if (_routesRegistered) return next();
  await _routesReady;
  next();
});

export { _routesReady };
export default app;
