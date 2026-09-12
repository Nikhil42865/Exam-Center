import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../shared/errors.js";
import { sendError } from "../shared/response.js";
import { logger } from "../shared/logger.js";
import { ErrorCode } from "@examcenter/contracts";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = (req.headers["x-request-id"] as string) || undefined;

  // Handle known AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId, path: req.path }, err.message);
    }
    sendError(res, err.statusCode, err.code, err.message, err.details, requestId);
    return;
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError || err.name === "ZodError" || (err as any).issues) {
    const issues = (err as any).issues || (err as any).errors || [];
    const details = issues.map((e: any) => ({
      field: Array.isArray(e.path) ? e.path.join(".") : "",
      message: e.message,
    }));
    sendError(res, 400, ErrorCode.VALIDATION_ERROR, "Invalid request payload", details, requestId);
    return;
  }

  // Handle Mongo Duplicate Key Error (code 11000)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern || {})[0] || "field";
    sendError(res, 409, ErrorCode.CONFLICT, `A record with this ${field} already exists`, undefined, requestId);
    return;
  }

  // Unexpected / unhandled errors
  logger.error({ err, requestId, path: req.path }, "Unhandled internal error");
  sendError(res, 500, ErrorCode.INTERNAL_ERROR, "An unexpected error occurred. Please try again.", undefined, requestId);
}
