"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
const mongoose_1 = __importDefault(require("mongoose"));
const index_js_1 = require("./index.js");
const logger_js_1 = require("../shared/logger.js");
async function connectDatabase() {
    try {
        const conn = await mongoose_1.default.connect(index_js_1.config.MONGODB_URI, {
            autoIndex: true,
        });
        logger_js_1.logger.info(`✅ MongoDB Connected to database: ${conn.connection.name} on ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        logger_js_1.logger.error({ err: error }, "❌ MongoDB connection error:");
        throw error;
    }
}
async function disconnectDatabase() {
    await mongoose_1.default.disconnect();
    logger_js_1.logger.info("MongoDB disconnected");
}
