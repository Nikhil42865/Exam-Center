"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data, statusCode = 200, meta) {
    const payload = {
        success: true,
        data,
        meta,
    };
    return res.status(statusCode).json(payload);
}
function sendError(res, statusCode, code, message, details, requestId) {
    const payload = {
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
