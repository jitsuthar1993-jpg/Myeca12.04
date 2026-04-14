import "dotenv/config";
import { validateEnv } from "./lib/env-validation.js";
validateEnv();

import express from "express";
import cors from "cors";
import compress from "compression";
import { clerkMiddleware } from "@clerk/express";
import path from "path";
import { registerRoutes } from "./routes.js";
import { customSecurityHeaders, securityHeaders } from "./middleware/security.js";
import { globalErrorHandler } from "./middleware/error-handler.js";
import { generalRateLimit } from "./middleware/rateLimiting.js";

const app = express();
const allowedOrigins: (string | RegExp)[] = [
  "https://myeca.in",
  "https://www.myeca.in",
  ...(process.env.NODE_ENV !== "production"
    ? [/^http:\/\/localhost(:\d+)?$/, /^http:\/\/127\.0\.0\.1(:\d+)?$/]
    : []),
];

app.use(compress());
app.use(securityHeaders);
app.use(customSecurityHeaders);

const clerkPublishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ||
  process.env.VITE_CLERK_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Only attach Clerk middleware when the keys are available;
// without them, public routes still work — auth-protected routes will 401.
if (process.env.CLERK_SECRET_KEY && clerkPublishableKey) {
  app.use(clerkMiddleware({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: clerkPublishableKey,
  }));
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      const allowed = allowedOrigins.some((entry) =>
        typeof entry === "string" ? entry === origin : entry.test(origin),
      );

      if (allowed) {
        return callback(null, true);
      }

      return callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  }),
);

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
    const allowed = allowedOrigins.some((entry) =>
      typeof entry === "string" ? entry === origin : entry.test(origin),
    );

    if (!allowed) {
      return res.status(403).json({ error: "CSRF validation failed" });
    }
  }

  next();
});

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (req.path.startsWith("/api") && (res.statusCode >= 400 || duration > 1000)) {
      console.log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
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
