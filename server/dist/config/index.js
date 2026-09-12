"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load from server directory or project root
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), ".env") });
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), "../.env") });
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "test", "production"]).default("development"),
    PORT: zod_1.z.coerce.number().default(5000),
    MONGODB_URI: zod_1.z.string().default("mongodb://127.0.0.1:27017/examcenter"),
    CLIENT_ORIGIN: zod_1.z.string().default("http://localhost:5173"),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16).default("super-secret-examcenter-access-key-minimum-32-chars-length"),
    JWT_REFRESH_SECRET: zod_1.z.string().min(16).default("super-secret-examcenter-refresh-key-minimum-32-chars-length"),
    ACCESS_TOKEN_TTL: zod_1.z.string().default("15m"),
    REFRESH_TOKEN_TTL: zod_1.z.string().default("7d"),
    LOG_LEVEL: zod_1.z.string().default("info"),
    ADMIN_INITIAL_EMAIL: zod_1.z.string().email().default("admin@examcenter.internal"),
    ADMIN_INITIAL_PASSWORD: zod_1.z.string().min(8).default("AdminPassword123!"),
    ADMIN_INITIAL_NAME: zod_1.z.string().default("System Administrator"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", parsedEnv.error.format());
    process.exit(1);
}
exports.config = parsedEnv.data;
