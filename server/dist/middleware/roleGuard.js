"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const errors_js_1 = require("../shared/errors.js");
function requireRole(...roles) {
    return (req, _res, next) => {
        if (!req.user) {
            next(errors_js_1.AppError.unauthorized("Authentication required"));
            return;
        }
        if (!roles.includes(req.user.role)) {
            next(errors_js_1.AppError.forbidden(`Access restricted to: ${roles.join(", ")}`));
            return;
        }
        next();
    };
}
