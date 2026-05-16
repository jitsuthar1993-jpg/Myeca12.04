import type { Response } from "express";

function requestIdFrom(res: Response) {
  return typeof res.locals?.requestId === "string" ? res.locals.requestId : undefined;
}

export function errorResponse(res: Response, statusCode: number, error: string) {
  return res.status(statusCode).json({
    success: false,
    error,
    requestId: requestIdFrom(res),
  });
}

export function safeError(
  res: Response,
  error: unknown,
  message = "Internal server error",
  statusCode = 500,
) {
  console.error({
    event: "api_error",
    message,
    requestId: requestIdFrom(res),
    error,
  });
  return errorResponse(res, statusCode, message);
}
