"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_js_1 = require("./auth.service.js");
const response_js_1 = require("../../shared/response.js");
const index_js_1 = require("../../config/index.js");
const errors_js_1 = require("../../shared/errors.js");
const isProduction = index_js_1.config.NODE_ENV === "production";
function setAuthCookies(res, accessToken, refreshToken) {
    // 15 minutes
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 15 * 60 * 1000,
    });
    // 7 days
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}
function clearAuthCookies(res) {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    });
}
class AuthController {
    async register(req, res, next) {
        try {
            const result = await auth_service_js_1.authService.register(req.body);
            setAuthCookies(res, result.accessToken, result.refreshToken);
            (0, response_js_1.sendSuccess)(res, { user: result.user, accessToken: result.accessToken }, 201);
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const result = await auth_service_js_1.authService.login(req.body);
            setAuthCookies(res, result.accessToken, result.refreshToken);
            (0, response_js_1.sendSuccess)(res, { user: result.user, accessToken: result.accessToken }, 200);
        }
        catch (error) {
            next(error);
        }
    }
    async refresh(req, res, next) {
        try {
            const token = req.cookies?.refreshToken || req.body?.refreshToken;
            if (!token) {
                throw errors_js_1.AppError.unauthorized("Refresh token required");
            }
            const result = await auth_service_js_1.authService.refresh(token);
            setAuthCookies(res, result.accessToken, result.refreshToken);
            (0, response_js_1.sendSuccess)(res, { user: result.user, accessToken: result.accessToken });
        }
        catch (error) {
            clearAuthCookies(res);
            next(error);
        }
    }
    async logout(_req, res) {
        clearAuthCookies(res);
        (0, response_js_1.sendSuccess)(res, { message: "Successfully logged out" });
    }
    async getMe(req, res) {
        (0, response_js_1.sendSuccess)(res, { user: req.user });
    }
    async updateMe(req, res, next) {
        try {
            const updated = await auth_service_js_1.authService.updateProfile(req.user.id, req.body.name);
            (0, response_js_1.sendSuccess)(res, { user: updated });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
