"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_js_1 = require("../users/user.model.js");
const errors_js_1 = require("../../shared/errors.js");
const auth_tokens_js_1 = require("./auth.tokens.js");
const SALT_ROUNDS = 10;
class AuthService {
    async register(data) {
        const existing = await user_model_js_1.UserModel.findOne({ email: data.email });
        if (existing) {
            throw errors_js_1.AppError.conflict("An account with this email address already exists");
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, SALT_ROUNDS);
        // Registration is candidate-only (FR-AUTH-07)
        const user = await user_model_js_1.UserModel.create({
            name: data.name,
            email: data.email,
            passwordHash,
            role: "candidate",
            status: "active",
        });
        const tokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, auth_tokens_js_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, auth_tokens_js_1.generateRefreshToken)(tokenPayload);
        return {
            user: user.toDto(),
            accessToken,
            refreshToken,
        };
    }
    async login(data) {
        const user = await user_model_js_1.UserModel.findOne({ email: data.email });
        if (!user) {
            // Generic auth error to prevent account enumeration
            throw errors_js_1.AppError.unauthorized("Invalid email or password");
        }
        if (user.status !== "active") {
            throw errors_js_1.AppError.forbidden("Your account has been disabled. Please contact an administrator.");
        }
        const isMatch = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!isMatch) {
            throw errors_js_1.AppError.unauthorized("Invalid email or password");
        }
        const tokenPayload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const accessToken = (0, auth_tokens_js_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, auth_tokens_js_1.generateRefreshToken)(tokenPayload);
        return {
            user: user.toDto(),
            accessToken,
            refreshToken,
        };
    }
    async refresh(refreshToken) {
        try {
            const payload = (0, auth_tokens_js_1.verifyRefreshToken)(refreshToken);
            const user = await user_model_js_1.UserModel.findById(payload.userId);
            if (!user || user.status !== "active") {
                throw errors_js_1.AppError.unauthorized("Session expired or user inactive");
            }
            const tokenPayload = {
                userId: user._id.toString(),
                email: user.email,
                role: user.role,
            };
            const newAccessToken = (0, auth_tokens_js_1.generateAccessToken)(tokenPayload);
            const newRefreshToken = (0, auth_tokens_js_1.generateRefreshToken)(tokenPayload);
            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                user: user.toDto(),
            };
        }
        catch {
            throw errors_js_1.AppError.unauthorized("Invalid or expired refresh token");
        }
    }
    async updateProfile(userId, name) {
        const user = await user_model_js_1.UserModel.findById(userId);
        if (!user) {
            throw errors_js_1.AppError.notFound("User not found");
        }
        if (name) {
            user.name = name;
            await user.save();
        }
        return user.toDto();
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
