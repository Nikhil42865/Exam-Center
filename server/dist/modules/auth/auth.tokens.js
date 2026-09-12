"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../../config/index.js");
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, index_js_1.config.JWT_ACCESS_SECRET, {
        expiresIn: index_js_1.config.ACCESS_TOKEN_TTL,
    });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, index_js_1.config.JWT_REFRESH_SECRET, {
        expiresIn: index_js_1.config.REFRESH_TOKEN_TTL,
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, index_js_1.config.JWT_ACCESS_SECRET);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, index_js_1.config.JWT_REFRESH_SECRET);
}
