import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";

const REQUEST_ID_HEADER = "X-Request-Id";

export function getRequestId(req?: Request, res?: Response) {
  return (
    res?.locals?.requestId ||
    (req as Request & { requestId?: string } | undefined)?.requestId ||
    undefined
  );
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const incomingId = req.get(REQUEST_ID_HEADER);
  const requestId = incomingId && incomingId.length <= 120 ? incomingId : crypto.randomUUID();

  (req as Request & { requestId: string }).requestId = requestId;
  res.locals.requestId = requestId;
  res.setHeader(REQUEST_ID_HEADER, requestId);
  next();
}

