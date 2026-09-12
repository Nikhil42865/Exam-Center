"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const auth_tokens_js_1 = require("../modules/auth/auth.tokens.js");
const user_model_js_1 = require("../modules/users/user.model.js");
const errors_js_1 = require("../shared/errors.js");
async function requireAuth(req, _res, next) {
    try {
        let token = req.cookies?.accessToken;
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }
        if (!token) {
            throw errors_js_1.AppError.unauthorized("Authentication required");
        }
        const payload = (0, auth_tokens_js_1.verifyAccessToken)(token);
        const user = await user_model_js_1.UserModel.findById(payload.userId);
        if (!user) {
            throw errors_js_1.AppError.unauthorized("User no longer exists");
        }
        if (user.status !== "active") {
            throw errors_js_1.AppError.forbidden("Account is disabled");
        }
        req.user = user.toDto();
        next();
    }
    catch (error) {
        if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
            next(errors_js_1.AppError.unauthorized("Invalid or expired session"));
            return;
        }
        next(error);
    }
}
