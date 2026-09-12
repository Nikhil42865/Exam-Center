"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_js_1 = require("./config/db.js");
const index_js_1 = require("./config/index.js");
const user_model_js_1 = require("./modules/users/user.model.js");
const logger_js_1 = require("./shared/logger.js");
async function seedAdmin() {
    await (0, db_js_1.connectDatabase)();
    const adminEmail = index_js_1.config.ADMIN_INITIAL_EMAIL.toLowerCase();
    const existingAdmin = await user_model_js_1.UserModel.findOne({ email: adminEmail });
    if (existingAdmin) {
        logger_js_1.logger.info(`Admin user already exists: ${adminEmail}`);
    }
    else {
        const passwordHash = await bcrypt_1.default.hash(index_js_1.config.ADMIN_INITIAL_PASSWORD, 10);
        const admin = await user_model_js_1.UserModel.create({
            name: index_js_1.config.ADMIN_INITIAL_NAME,
            email: adminEmail,
            passwordHash,
            role: "admin",
            status: "active",
        });
        logger_js_1.logger.info(`✅ Initial admin user created successfully: ${admin.email} (ID: ${admin._id})`);
    }
    await (0, db_js_1.disconnectDatabase)();
}
seedAdmin().catch((err) => {
    logger_js_1.logger.error({ err }, "Admin seeding failed:");
    process.exit(1);
});
