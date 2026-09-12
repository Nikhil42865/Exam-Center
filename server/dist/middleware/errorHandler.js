"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const errors_js_1 = require("../shared/errors.js");
const response_js_1 = require("../shared/response.js");
const logger_js_1 = require("../shared/logger.js");
const contracts_1 = require("@examcenter/contracts");
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
_next) {
    const requestId = req.headers["x-request-id"] || undefined;
    // Handle known AppError
    if (err instanceof errors_js_1.AppError) {
        if (err.statusCode >= 500) {
            logger_js_1.logger.error({ err, requestId, path: req.path }, err.message);
        }
        (0, response_js_1.sendError)(res, err.statusCode, err.code, err.message, err.details, requestId);
        return;
    }
    // Handle Zod Validation Errors
    if (err instanceof zod_1.ZodError || err.name === "ZodError" || err.issues) {
        const issues = err.issues || err.errors || [];
        const details = issues.map((e) => ({
            field: Array.isArray(e.path) ? e.path.join(".") : "",
            message: e.message,
        }));
        (0, response_js_1.sendError)(res, 400, contracts_1.ErrorCode.VALIDATION_ERROR, "Invalid request payload", details, requestId);
        return;
    }
    // Handle Mongo Duplicate Key Error (code 11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || "field";
        (0, response_js_1.sendError)(res, 409, contracts_1.ErrorCode.CONFLICT, `A record with this ${field} already exists`, undefined, requestId);
        return;
    }
    // Unexpected / unhandled errors
    logger_js_1.logger.error({ err, requestId, path: req.path }, "Unhandled internal error");
    (0, response_js_1.sendError)(res, 500, contracts_1.ErrorCode.INTERNAL_ERROR, "An unexpected error occurred. Please try again.", undefined, requestId);
}
