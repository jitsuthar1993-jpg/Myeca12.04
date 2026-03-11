import type { Request, Response, NextFunction } from "express";

function cleanString(input: any): string {
  if (typeof input !== "string") return String(input ?? "");
  let s = input;
  // Trim whitespace
  s = s.trim();
  // Remove null bytes
  s = s.replace(/\x00/g, "");
  // Strip simple <script> tags to mitigate basic XSS in text fields
  s = s.replace(/<\s*script[^>]*>([\s\S]*?)<\s*\/\s*script\s*>/gi, "");
  // Collapse multiple spaces
  s = s.replace(/\s{2,}/g, " ");
  return s;
}

function deepSanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deepSanitize);
  if (typeof obj === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = deepSanitize(v);
    }
    return out;
  }
  if (typeof obj === "string") return cleanString(obj);
  return obj;
}

export function sanitize(req: Request, _res: Response, next: NextFunction) {
  try {
    // Only sanitize body and query for now; leave headers untouched
    if (req.body && typeof req.body === "object") {
      req.body = deepSanitize(req.body);
    }
    if (req.query && typeof req.query === "object") {
      req.query = deepSanitize(req.query);
    }
  } catch (err) {
    // Do not block request on sanitize failure; log and continue
    console.error("Sanitize middleware error:", err);
  }
  next();
}