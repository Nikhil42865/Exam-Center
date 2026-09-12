import { Response } from "express";
import { ApiSuccessResponse, ApiErrorResponse } from "@examcenter/contracts";

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): Response {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta,
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: unknown,
  requestId?: string
): Response {
  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      details,
      requestId,
    },
  };
  return res.status(statusCode).json(payload);
}
