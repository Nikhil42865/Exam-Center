"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const contracts_1 = require("@examcenter/contracts");
class AppError extends Error {
    statusCode;
    code;
    details;
    constructor(statusCode, code, message, details) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        Object.setPrototypeOf(this, new.target.prototype);
    }
    static badRequest(message, details, code = contracts_1.ErrorCode.VALIDATION_ERROR) {
        return new AppError(400, code, message, details);
    }
    static unauthorized(message = "Authentication required", details) {
        return new AppError(401, contracts_1.ErrorCode.UNAUTHORIZED, message, details);
    }
    static forbidden(message = "Permission denied", details) {
        return new AppError(403, contracts_1.ErrorCode.FORBIDDEN, message, details);
    }
    static notFound(message = "Resource not found", details) {
        return new AppError(404, contracts_1.ErrorCode.NOT_FOUND, message, details);
    }
    static conflict(message, details) {
        return new AppError(409, contracts_1.ErrorCode.CONFLICT, message, details);
    }
    static internal(message = "Internal server error", details) {
        return new AppError(500, contracts_1.ErrorCode.INTERNAL_ERROR, message, details);
    }
}
exports.AppError = AppError;
