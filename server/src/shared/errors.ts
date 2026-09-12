import { ErrorCode } from "@examcenter/contracts";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode | string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: ErrorCode | string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static badRequest(message: string, details?: unknown, code = ErrorCode.VALIDATION_ERROR) {
    return new AppError(400, code, message, details);
  }

  static unauthorized(message = "Authentication required", details?: unknown) {
    return new AppError(401, ErrorCode.UNAUTHORIZED, message, details);
  }

  static forbidden(message = "Permission denied", details?: unknown) {
    return new AppError(403, ErrorCode.FORBIDDEN, message, details);
  }

  static notFound(message = "Resource not found", details?: unknown) {
    return new AppError(404, ErrorCode.NOT_FOUND, message, details);
  }

  static conflict(message: string, details?: unknown) {
    return new AppError(409, ErrorCode.CONFLICT, message, details);
  }

  static internal(message = "Internal server error", details?: unknown) {
    return new AppError(500, ErrorCode.INTERNAL_ERROR, message, details);
  }
}
