"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
var ErrorCode;
(function (ErrorCode) {
    ErrorCode["VALIDATION_ERROR"] = "VALIDATION_ERROR";
    ErrorCode["UNAUTHORIZED"] = "UNAUTHORIZED";
    ErrorCode["FORBIDDEN"] = "FORBIDDEN";
    ErrorCode["NOT_FOUND"] = "NOT_FOUND";
    ErrorCode["CONFLICT"] = "CONFLICT";
    ErrorCode["EXAM_NOT_AVAILABLE"] = "EXAM_NOT_AVAILABLE";
    ErrorCode["EXAM_ATTEMPT_LIMIT_REACHED"] = "EXAM_ATTEMPT_LIMIT_REACHED";
    ErrorCode["ACTIVE_ATTEMPT_EXISTS"] = "ACTIVE_ATTEMPT_EXISTS";
    ErrorCode["ATTEMPT_EXPIRED"] = "ATTEMPT_EXPIRED";
    ErrorCode["ATTEMPT_ALREADY_SUBMITTED"] = "ATTEMPT_ALREADY_SUBMITTED";
    ErrorCode["INVALID_STATE_TRANSITION"] = "INVALID_STATE_TRANSITION";
    ErrorCode["INTERNAL_ERROR"] = "INTERNAL_ERROR";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
//# sourceMappingURL=api.js.map