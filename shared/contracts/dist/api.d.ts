export interface ApiErrorPayload {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
}
export interface ApiSuccessResponse<T> {
    success: true;
    data: T;
    meta?: Record<string, unknown>;
}
export interface ApiErrorResponse {
    success: false;
    error: ApiErrorPayload;
}
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
export declare enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    EXAM_NOT_AVAILABLE = "EXAM_NOT_AVAILABLE",
    EXAM_ATTEMPT_LIMIT_REACHED = "EXAM_ATTEMPT_LIMIT_REACHED",
    ACTIVE_ATTEMPT_EXISTS = "ACTIVE_ATTEMPT_EXISTS",
    ATTEMPT_EXPIRED = "ATTEMPT_EXPIRED",
    ATTEMPT_ALREADY_SUBMITTED = "ATTEMPT_ALREADY_SUBMITTED",
    INVALID_STATE_TRANSITION = "INVALID_STATE_TRANSITION",
    INTERNAL_ERROR = "INTERNAL_ERROR"
}
//# sourceMappingURL=api.d.ts.map